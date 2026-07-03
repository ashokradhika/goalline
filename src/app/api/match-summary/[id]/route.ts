import { NextRequest, NextResponse } from "next/server";
import { generateMatchSummary } from "@/lib/ai/matchSummary";
import { getMatchById, getTeam } from "@/lib/tournamentData";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const match = await getMatchById(id);
  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const [homeTeam, awayTeam] = await Promise.all([
    match.homeTeamId ? getTeam(match.homeTeamId) : undefined,
    match.awayTeamId ? getTeam(match.awayTeamId) : undefined,
  ]);
  if (!homeTeam || !awayTeam) {
    return NextResponse.json({ error: "Team data missing" }, { status: 500 });
  }

  try {
    const summary = await generateMatchSummary(match, homeTeam, awayTeam);
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("match-summary generation failed", err);
    return NextResponse.json(
      { error: "AI summary unavailable right now" },
      { status: 502 }
    );
  }
}
