import { NextResponse } from "next/server";

// Force dynamic execution with zero server-side caching for real-time updates
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

export interface UserProfile {
  username: string;
  name: string;
  avatarUrl: string;
  bio: string;
  publicRepos: number;
  followers: number;
  following: number;
  joinedDate?: string;
  createdAt?: string;
  email?: string;
}

export interface YearContributionData {
  year: number;
  total: number;
  contributions: ContributionDay[];
}

export interface ContributionsApiResponse {
  profile: UserProfile;
  years: number[];
  selectedYear: number;
  yearData: Record<number, YearContributionData>;
  total: number;
  contributions: ContributionDay[];
  syncedAt: string;
}

// In-memory hot cache to prevent GitHub IP rate-limiting while providing near-instant freshness
interface CachedState {
  timestamp: number;
  data: ContributionsApiResponse;
}

let memoryCache: CachedState | null = null;
const CACHE_TTL_MS = 15000; // 15-second freshness window for real-time responsiveness

function formatJoinedDate(createdAtStr?: string): string {
  if (!createdAtStr) return "Joined last month";
  const created = new Date(createdAtStr);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths =
    (now.getFullYear() - created.getFullYear()) * 12 +
    (now.getMonth() - created.getMonth());

  if (diffDays < 30) {
    return diffDays <= 1 ? "Joined recently" : `Joined ${diffDays} days ago`;
  }
  if (diffMonths <= 1) return "Joined last month";
  if (diffMonths < 12) return `Joined ${diffMonths} months ago`;
  const years = Math.floor(diffMonths / 12);
  return `Joined ${years} year${years > 1 ? "s" : ""} ago`;
}

export async function GET() {
  const username = "Spandan-0230";
  const now = Date.now();
  const currentYear = new Date().getFullYear();

  // Return fresh in-memory snapshot if fetched within the last 15 seconds
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(memoryCache.data, {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
        "X-Data-Source": "live-memory-buffer",
      },
    });
  }

  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const authHeaders: Record<string, string> = {
    "User-Agent": "Portfolio-App",
    Accept: "application/vnd.github.v3+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let profile: UserProfile = memoryCache?.data.profile ?? {
    username: "Spandan-0230",
    name: "Spandan Bole",
    avatarUrl: "https://avatars.githubusercontent.com/u/347005203?v=4",
    bio: "Student · Software Developer\nAI Engineer",
    publicRepos: 7,
    followers: 3,
    following: 2,
    joinedDate: "Joined last month",
    email: "spandanbole777@gmail.com",
  };

  // 1. Fetch Real-Time GitHub User Profile
  try {
    const userRes = await fetch(`https://api.github.com/users/${username}`, {
      cache: "no-store",
      headers: authHeaders,
    });

    if (userRes.ok) {
      const u = await userRes.json();
      profile = {
        username: u.login || username,
        name: u.name || profile.name,
        avatarUrl: u.avatar_url || profile.avatarUrl,
        bio: u.bio || profile.bio,
        publicRepos: u.public_repos ?? profile.publicRepos,
        followers: u.followers ?? profile.followers,
        following: u.following ?? profile.following,
        createdAt: u.created_at,
        joinedDate: formatJoinedDate(u.created_at),
        email: u.email || "spandanbole777@gmail.com",
      };
    }
  } catch (err) {
    console.error("Live GitHub user profile fetch error:", err);
  }

  let years: number[] = memoryCache?.data.years ?? [currentYear];
  let yearData: Record<number, YearContributionData> =
    memoryCache?.data.yearData ?? {};
  let contributions: ContributionDay[] =
    memoryCache?.data.contributions ?? [];
  let total = memoryCache?.data.total ?? 84;
  let fetchedContributions = false;

  // 2. Primary: Live structured contributions API for ALL years with no-store
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${username}?y=all`,
      {
        cache: "no-store",
        headers: { "User-Agent": "Portfolio-App" },
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (data?.total && typeof data.total === "object") {
        // Extract all distinct 4-digit years from GitHub response
        let foundYears = Object.keys(data.total)
          .filter((k) => /^\d{4}$/.test(k))
          .map(Number)
          .sort((a, b) => a - b); // Ascending / increasing order from left to right

        // If total didn't contain years, check contributions dates
        if (foundYears.length === 0 && Array.isArray(data.contributions)) {
          const ySet = new Set<number>();
          data.contributions.forEach((d: { date?: string }) => {
            if (d.date) {
              const y = parseInt(d.date.substring(0, 4), 10);
              if (!isNaN(y)) ySet.add(y);
            }
          });
          foundYears = Array.from(ySet).sort((a, b) => a - b);
        }

        if (foundYears.length > 0) {
          // "always provide just last 5 years of data (if exist) in increasing order from left to right"
          const last5Years = foundYears.slice(-5);

          const groupedYearData: Record<number, YearContributionData> = {};
          const allContribs: ContributionDay[] = Array.isArray(data.contributions)
            ? data.contributions
            : [];

          last5Years.forEach((yr) => {
            const yrContribs = allContribs.filter(
              (d) => d.date && d.date.startsWith(`${yr}-`)
            );
            let yrTotal = data.total[String(yr)];
            if (typeof yrTotal !== "number") {
              yrTotal = yrContribs.reduce(
                (sum: number, d: ContributionDay) => sum + (d.count || 0),
                0
              );
            }
            groupedYearData[yr] = {
              year: yr,
              total: yrTotal,
              contributions: yrContribs,
            };
          });

          const latestYear = last5Years[last5Years.length - 1];
          years = last5Years;
          yearData = groupedYearData;
          total = groupedYearData[latestYear]?.total ?? 84;
          contributions = groupedYearData[latestYear]?.contributions ?? [];
          fetchedContributions = true;
        }
      }
    }
  } catch (err) {
    console.error("Live contributions primary API error:", err);
  }

  // 3. Secondary: Direct real-time GitHub HTML endpoint (updates instantly on commit)
  if (!fetchedContributions) {
    try {
      const htmlRes = await fetch(
        `https://github.com/users/${username}/contributions`,
        {
          cache: "no-store",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        }
      );

      if (htmlRes.ok) {
        const html = await htmlRes.text();
        const regex = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d+)"/g;
        const parsed: ContributionDay[] = [];
        let match;
        let sum = 0;

        while ((match = regex.exec(html)) !== null) {
          const date = match[1];
          const level = parseInt(match[2], 10);
          const count =
            level === 0 ? 0 : level === 1 ? 1 : level === 2 ? 3 : level === 3 ? 6 : 12;
          sum += count;
          parsed.push({ date, count, level });
        }

        if (parsed.length > 0) {
          years = [currentYear];
          total = sum > 0 ? sum : total;
          contributions = parsed;
          yearData = {
            [currentYear]: {
              year: currentYear,
              total,
              contributions: parsed,
            },
          };
          fetchedContributions = true;
        }
      }
    } catch (err) {
      console.error("Live contributions HTML scrape error:", err);
    }
  }

  // 4. Fallback generator if empty (guarantees UI never breaks)
  if (contributions.length === 0) {
    const fallbackDays: ContributionDay[] = [];
    const dateNow = new Date();
    for (let i = 364; i >= 0; i--) {
      const d = new Date(dateNow);
      d.setDate(d.getDate() - i);
      fallbackDays.push({
        date: d.toISOString().split("T")[0],
        count: 0,
        level: 0,
      });
    }
    contributions = fallbackDays;
    years = [currentYear];
    total = 84;
    yearData = {
      [currentYear]: {
        year: currentYear,
        total: 84,
        contributions: fallbackDays,
      },
    };
  }

  const payload: ContributionsApiResponse = {
    profile,
    years,
    selectedYear: years[years.length - 1],
    yearData,
    total,
    contributions,
    syncedAt: new Date().toISOString(),
  };

  // Cache valid live result in memory
  memoryCache = {
    timestamp: now,
    data: payload,
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control":
        "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
      "X-Synced-At": payload.syncedAt,
    },
  });
}
