import { NextRequest } from "next/server";
import { getAnthropicClient, AI_MODEL } from "@/lib/ai/client";
import {
  getAllGroupStandings,
  getMatches,
  getTeamMap,
  getTournamentLeaderboard,
} from "@/lib/tournamentData";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are "Ask GoalLine", a chat assistant embedded in a FIFA World Cup 2026 live-data app.
Answer questions about standings, live scores, fixtures, and qualification scenarios using ONLY the
JSON data block provided below — it is the live, authoritative state of the tournament right now.
Rules:
- Confident, concise sports-broadcast tone. No hedging, no "as an AI" language.
- Never invent a stat, score, or event that isn't in the data (no goal-by-goal detail is available,
  only scores, halftime scores, and standings).
- If the data doesn't answer the question, say so plainly instead of guessing.
- Keep answers to 1-4 sentences unless the user asks for a detailed breakdown.`;

async function buildGroundingContext(): Promise<string> {
  const [standings, matches, teamMap, leaderboard] = await Promise.all([
    getAllGroupStandings(),
    getMatches(),
    getTeamMap(),
    getTournamentLeaderboard(),
  ]);

  const named = (record: Record<string, Awaited<ReturnType<typeof getAllGroupStandings>>[string]>) =>
    Object.fromEntries(
      Object.entries(record).map(([group, rows]) => [
        group,
        rows.map((r) => ({ team: teamMap.get(r.teamId)?.name ?? r.teamId, ...r })),
      ])
    );

  const data = {
    generatedAt: new Date().toISOString(),
    groupStandings: named(standings),
    matches: matches.map((m) => ({
      id: m.id,
      stage: m.stage,
      status: m.status,
      minute: m.minute,
      homeTeam: m.homeTeamId ? (teamMap.get(m.homeTeamId)?.name ?? m.homeTeamId) : "TBD",
      awayTeam: m.awayTeamId ? (teamMap.get(m.awayTeamId)?.name ?? m.awayTeamId) : "TBD",
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      kickoff: m.kickoff,
    })),
    combinedLeaderboardTop20: leaderboard.slice(0, 20).map((entry, i) => ({
      rank: i + 1,
      team: entry.team.name,
      group: entry.team.group,
      points: entry.standing.points,
      played: entry.standing.played,
      goalDifference: entry.standing.goalsFor - entry.standing.goalsAgainst,
    })),
  };

  return JSON.stringify(data, null, 2);
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { messages?: ChatMessage[] };
  const messages = body.messages ?? [];

  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages is required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const client = getAnthropicClient();
  const groundingContext = await buildGroundingContext();

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const events = client.messages.stream({
          model: AI_MODEL,
          max_tokens: 600,
          output_config: { effort: "low" },
          system: [
            { type: "text", text: SYSTEM_PROMPT },
            {
              type: "text",
              text: `Live tournament data (JSON):\n${groundingContext}`,
            },
          ],
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });

        events.on("text", (delta: string) => {
          controller.enqueue(encoder.encode(delta));
        });

        await events.finalMessage();
        controller.close();
      } catch (err) {
        console.error("chat stream failed", err);
        controller.enqueue(
          encoder.encode("\n\n[GoalLine AI is unavailable right now — please try again.]")
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-cache",
    },
  });
}
