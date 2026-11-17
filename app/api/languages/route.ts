import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache for 1 hour

const FALLBACK_LANGUAGES = [
  "Kotlin",
  "TypeScript",
  "Python",
  "C#",
  "JavaScript",
  "HTML",
  "CSS",
  "PowerShell",
];

export async function GET() {
  try {
    const reposRes = await fetch(
      "https://api.github.com/users/Spandan-0230/repos?per_page=100&sort=updated",
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "portfolio-app",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!reposRes.ok) {
      return NextResponse.json({ languages: FALLBACK_LANGUAGES });
    }

    const repos = await reposRes.json();
    if (!Array.isArray(repos)) {
      return NextResponse.json({ languages: FALLBACK_LANGUAGES });
    }

    const languageTotals: Record<string, number> = {};
    const primaryLanguages: string[] = [];

    // Filter out forks and scan repos
    const ownRepos = repos.filter((r) => !r.fork);

    // Collect primary languages first
    for (const repo of ownRepos) {
      if (repo.language && !primaryLanguages.includes(repo.language)) {
        primaryLanguages.push(repo.language);
      }
    }

    // Query languages_url for detailed language breakdown in parallel
    const languagePromises = ownRepos
      .filter((r) => r.languages_url)
      .map(async (repo) => {
        try {
          const lRes = await fetch(repo.languages_url, {
            headers: {
              Accept: "application/vnd.github.v3+json",
              "User-Agent": "portfolio-app",
            },
            next: { revalidate: 3600 },
          });
          if (lRes.ok) {
            const data = await lRes.json();
            for (const [lang, bytes] of Object.entries(data)) {
              languageTotals[lang] = (languageTotals[lang] || 0) + (bytes as number);
            }
          }
        } catch {
          // ignore single repo failure
        }
      });

    await Promise.allSettled(languagePromises);

    // Sort by byte volume
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

    // Fallback if empty
    const finalLanguages = combined.length > 0 ? combined : FALLBACK_LANGUAGES;

    return NextResponse.json(
      { languages: finalLanguages },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ languages: FALLBACK_LANGUAGES });
  }
}
