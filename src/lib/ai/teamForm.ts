import { getAnthropicClient, AI_MODEL } from "@/lib/ai/client";
import { getCached, hashData, setCached } from "@/lib/ai/cache";
import { GroupStanding, Match, Team } from "@/lib/types";

const SYSTEM_PROMPT = `You are a sports analyst for GoalLine, a FIFA World Cup 2026 live-data app.
Write a confident, concise 2-3 sentence outlook for a team using only the structured data given.
Rules:
- Broadcast tone: direct, no hedging, no "as an AI" language, no invented stats or events —
  the data given is all you have (only final/halftime scores, no goal-by-goal detail).
- Cover: their group position, qualification/elimination status, and their match results so far.
- Plain text only, no markdown, no quotes around the output.`;

export async function generateTeamForm(
  team: Team,
  standing: GroupStanding | undefined,
  recentMatches: Match[]
): Promise<string> {
  const cacheKey = `team-form:${team.id}`;
  const dataHash = hashData({
    standing,
    matches: recentMatches.map((m) => ({
      id: m.id,
      status: m.status,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
    })),
  });

  const cached = getCached(cacheKey, dataHash);
  if (cached) return cached;

  const client = getAnthropicClient();
  const payload = {
    team: team.name,
    group: team.group,
    standing,
    recentMatches: recentMatches.map((m) => ({
      stage: m.stage,
      status: m.status,
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
    })),
  };

  const response = await client.messages.create({
    model: AI_MODEL,
    max_tokens: 220,
    output_config: { effort: "low" },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Team data (JSON):\n${JSON.stringify(payload, null, 2)}\n\nWrite the outlook.`,
      },
    ],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join(" ")
    .trim();

  setCached(cacheKey, dataHash, text);
  return text;
}
