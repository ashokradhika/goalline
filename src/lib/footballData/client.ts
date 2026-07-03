// Thin client for api.football-data.org (v4). Free tier is rate-limited to
// 10 requests/minute, so every call goes through an in-memory TTL cache with
// request de-duplication — on top of Next.js's own fetch cache — rather than
// hitting the upstream API on every page render.

const BASE_URL = "https://api.football-data.org/v4";

export class FootballDataError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "FootballDataError";
  }
}

export interface FetchResult<T> {
  data: T;
  /** True when upstream failed and we served a cached copy instead. */
  stale: boolean;
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

export async function fetchFootballData<T>(
  path: string,
  ttlMs: number
): Promise<FetchResult<T>> {
  const cached = memoryCache.get(path) as CacheEntry<T> | undefined;
  if (cached && cached.expiresAt > Date.now()) {
    return { data: cached.data, stale: false };
  }

  const existing = inFlight.get(path) as Promise<FetchResult<T>> | undefined;
  if (existing) return existing;

  const promise = (async (): Promise<FetchResult<T>> => {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY;
    if (!apiKey) {
      throw new FootballDataError("FOOTBALL_DATA_API_KEY is not set");
    }

    let res: Response;
    try {
      res = await fetch(`${BASE_URL}${path}`, {
        headers: { "X-Auth-Token": apiKey },
        next: { revalidate: Math.max(1, Math.ceil(ttlMs / 1000)) },
      });
    } catch (err) {
      if (cached) return { data: cached.data, stale: true };
      throw new FootballDataError(
        `Network error calling football-data.org ${path}: ${(err as Error).message}`
      );
    }

    if (!res.ok) {
      // Serve stale data rather than break the page if upstream is down or
      // we've hit the rate limit — the UI surfaces a "may be delayed" note.
      if (cached) return { data: cached.data, stale: true };
      throw new FootballDataError(`football-data.org ${path} returned ${res.status}`, res.status);
    }

    const data = (await res.json()) as T;
    memoryCache.set(path, { data, expiresAt: Date.now() + ttlMs });
    return { data, stale: false };
  })();

  inFlight.set(path, promise);
  try {
    return await promise;
  } finally {
    inFlight.delete(path);
  }
}
