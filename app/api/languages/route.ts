import { NextResponse } from "next/server";

// Force dynamic execution with zero server-side caching for real-time updates
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const FALLBACK_LANGUAGES = [
  "Kotlin",
  "TypeScript",
  "C#",
  "Python",
  "JavaScript",
  "HTML",
  "CSS",
  "PowerShell",
];

// In-memory hot cache for high performance while maintaining real-time freshness
interface CachedLanguagesState {
  timestamp: number;
  languages: string[];
  syncedAt: string;
}

let memoryLanguageCache: CachedLanguagesState | null = null;
const CACHE_TTL_MS = 20000; // 20-second freshness window

export async function GET() {
  const now = Date.now();

  // Return fresh in-memory snapshot if fetched within the last 20 seconds
  if (memoryLanguageCache && now - memoryLanguageCache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(
      { languages: memoryLanguageCache.languages, syncedAt: memoryLanguageCache.syncedAt },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
          "X-Data-Source": "live-memory-buffer",
        },
      }
    );
  }

  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const authHeaders: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "portfolio-app",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const reposRes = await fetch(
      "https://api.github.com/users/Spandan-0230/repos?per_page=100&sort=updated",
      {
        cache: "no-store",
        headers: authHeaders,
      }
    );

    if (!reposRes.ok) {
      const fallback = memoryLanguageCache?.languages ?? FALLBACK_LANGUAGES;
      return NextResponse.json(
        { languages: fallback, syncedAt: new Date().toISOString() },
        {
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }

    const repos = await reposRes.json();
    if (!Array.isArray(repos)) {
      const fallback = memoryLanguageCache?.languages ?? FALLBACK_LANGUAGES;
      return NextResponse.json(
        { languages: fallback, syncedAt: new Date().toISOString() },
        {
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }

    const languageTotals: Record<string, number> = {};
    const primaryLanguages: string[] = [];

    // Filter out forks to track original codebase repositories
    const ownRepos = repos.filter(
      (r: { fork?: boolean; languages_url?: string; language?: string }) => !r.fork
    );

    // Collect primary repository languages
    for (const repo of ownRepos) {
      if (repo.language && !primaryLanguages.includes(repo.language)) {
        primaryLanguages.push(repo.language);
      }
    }

    // Query languages_url for detailed byte volume breakdown across repos in parallel
    const languagePromises = ownRepos
      .filter((r: { languages_url?: string }) => r.languages_url)
      .map(async (repo: { languages_url: string }) => {
        try {
          const lRes = await fetch(repo.languages_url, {
            cache: "no-store",
            headers: authHeaders,
          });
          if (lRes.ok) {
            const data = await lRes.json();
            for (const [lang, bytes] of Object.entries(data)) {
              languageTotals[lang] = (languageTotals[lang] || 0) + (bytes as number);
            }
          }
        } catch {
          // ignore single repo network flicker
        }
      });

    await Promise.allSettled(languagePromises);

    // Sort languages by cumulative byte volume
    const sortedByUsage = Object.keys(languageTotals).sort(
      (a, b) => languageTotals[b] - languageTotals[a]
    );

    // Merge: include any primary language not already captured
    const combined = [...sortedByUsage];
    for (const pl of primaryLanguages) {
      if (!combined.includes(pl)) {
        combined.push(pl);
      }
    }

    const finalLanguages = combined.length > 0 ? combined : FALLBACK_LANGUAGES;
    const syncedAt = new Date().toISOString();

    memoryLanguageCache = {
      timestamp: now,
      languages: finalLanguages,
      syncedAt,
    };

    return NextResponse.json(
      { languages: finalLanguages, syncedAt },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
          "X-Synced-At": syncedAt,
        },
      }
    );
  } catch (error) {
    console.error("Live languages fetch error:", error);
    const fallback = memoryLanguageCache?.languages ?? FALLBACK_LANGUAGES;
    return NextResponse.json(
      { languages: fallback, syncedAt: new Date().toISOString() },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }
}
