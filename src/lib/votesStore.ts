import { Redis } from "@upstash/redis";

// Tolerant of either naming Vercel has used for its Redis/KV integration.
const URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

const client = URL && TOKEN ? new Redis({ url: URL, token: TOKEN }) : null;

export class VotingUnavailableError extends Error {
  constructor() {
    super("Voting storage is not configured (missing KV/Redis environment variables)");
    this.name = "VotingUnavailableError";
  }
}

function requireClient(): Redis {
  if (!client) throw new VotingUnavailableError();
  return client;
}

const VOTES_KEY = "predictions:votes"; // hash: teamId -> count
const voterKey = (voterId: string) => `predictions:voter:${voterId}`;

export async function getTallies(): Promise<Record<string, number>> {
  const redis = requireClient();
  const raw = (await redis.hgetall(VOTES_KEY)) as Record<string, string | number> | null;
  if (!raw) return {};
  const result: Record<string, number> = {};
  for (const [teamId, count] of Object.entries(raw)) {
    const n = Number(count);
    if (Number.isFinite(n) && n > 0) result[teamId] = n;
  }
  return result;
}

// Upstash's client auto-deserializes stored values, so a team ID that looks
// numeric (e.g. "762") comes back as the JS number 762, not the string
// "762" — silently breaking every `=== teamId` comparison downstream, since
// team IDs are strings everywhere else in the app. Force back to string at
// the one place we read it from Redis.
async function readVoterPick(voterId: string): Promise<string | null> {
  const redis = requireClient();
  const pick = await redis.get<string | number>(voterKey(voterId));
  return pick == null ? null : String(pick);
}

export async function getVoterPick(voterId: string): Promise<string | null> {
  return readVoterPick(voterId);
}

/** Casts or changes a vote. Moving your pick decrements your old team and
 * increments the new one, so a single browser only ever counts once. */
export async function castVote(voterId: string, teamId: string): Promise<void> {
  const redis = requireClient();
  const previous = await readVoterPick(voterId);
  if (previous === teamId) return;

  const pipeline = redis.pipeline();
  if (previous) pipeline.hincrby(VOTES_KEY, previous, -1);
  pipeline.hincrby(VOTES_KEY, teamId, 1);
  pipeline.set(voterKey(voterId), teamId);
  await pipeline.exec();
}
