import { getAnthropicClient, AI_MODEL } from "@/lib/ai/client";
import { getCached, hashData, setCached } from "@/lib/ai/cache";
import { Match, Team } from "@/lib/types";

const SYSTEM_PROMPT = `You are a sports-broadcast copywriter for GoalLine, a FIFA World Cup 2026 live-data app.
Write a confident, concise 2-3 sentence recap of a match using only the structured data you're given.
Rules:
- Broadcast tone: direct, no hedging, no "as an AI" language, no invented stats, scorers, or events —
  the data given is all you have (no goal-by-goal detail is available, only scores).
- If the match is still live, frame it as a live recap ("X lead Y..." not "X led Y...").
- Mention the scoreline, the stage, and the halftime score if it's given and different from the final.
- Plain text only, no markdown, no quotes around the output.`;

export async function generateMatchSummary(
  match: Match,
  homeTeam: Team,
  awayTeam: Team
): Promise<string> {
  const cacheKey = `match-summary:${match.id}`;
  const dataHash = hashData({
    status: match.status,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    minute: match.minute,
  });

  const cached = getCached(cacheKey, dataHash);
  if (cached) return cached;

  const client = getAnthropicClient();
  const payload = {
    stage: match.stage,
    status: match.status,
    minute: match.minute,
    homeTeam: homeTeam.name,
    awayTeam: awayTeam.name,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    halftimeHomeScore: match.halftimeHomeScore,
    halftimeAwayScore: match.halftimeAwayScore,
    referee: match.referee,
  };

  const response = await client.messages.create({
    model: AI_MODEL,
    max_tokens: 220,
    output_config: { effort: "low" },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Match data (JSON):\n${JSON.stringify(payload, null, 2)}\n\nWrite the recap.`,
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
