import { NextRequest, NextResponse } from "next/server";
import { generateTeamForm } from "@/lib/ai/teamForm";
import { getGroupStandings, getTeam, getTeamMatches } from "@/lib/tournamentData";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const team = await getTeam(id);
  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const [standingRows, recentMatches] = await Promise.all([
    team.group ? getGroupStandings(team.group) : Promise.resolve([]),
    getTeamMatches(team.id),
  ]);
  const standing = standingRows.find((s) => s.teamId === team.id);

  try {
    const outlook = await generateTeamForm(team, standing, recentMatches);
    return NextResponse.json({ outlook });
  } catch (err) {
    console.error("team-form generation failed", err);
    return NextResponse.json(
      { error: "AI outlook unavailable right now" },
      { status: 502 }
    );
  }
}
