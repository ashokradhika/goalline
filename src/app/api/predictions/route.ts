import { NextRequest, NextResponse } from "next/server";
import { getActiveTeams } from "@/lib/tournamentData";
import { castVote, getTallies, getVoterPick, VotingUnavailableError } from "@/lib/votesStore";

export const dynamic = "force-dynamic";

interface PredictionsResponse {
  votes: Record<string, number>;
  yourPick: string | null;
}

export async function GET(req: NextRequest) {
  const voterId = req.nextUrl.searchParams.get("voterId");

  try {
    const [tallies, yourPick] = await Promise.all([
      getTallies(),
      voterId ? getVoterPick(voterId) : Promise.resolve(null),
    ]);
    const body: PredictionsResponse = { votes: tallies, yourPick };
    return NextResponse.json(body);
  } catch (err) {
    if (err instanceof VotingUnavailableError) {
      return NextResponse.json({ error: "Voting is not available right now" }, { status: 503 });
    }
    console.error("predictions GET failed", err);
    return NextResponse.json({ error: "Failed to load predictions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { voterId?: string; teamId?: string } | null;
  const voterId = body?.voterId?.trim();
  const teamId = body?.teamId?.trim();

  if (!voterId || !teamId) {
    return NextResponse.json({ error: "voterId and teamId are required" }, { status: 400 });
  }

  try {
    // Only allow voting for a team that's actually still alive right now —
    // this is the same real-time check that removes eliminated teams from
    // the UI, enforced server-side too.
    const activeTeams = await getActiveTeams();
    if (!activeTeams.some((e) => e.team.id === teamId)) {
      return NextResponse.json(
        { error: "That team is no longer eligible (eliminated or unknown)" },
        { status: 400 }
      );
    }

    await castVote(voterId, teamId);
    const [tallies, yourPick] = await Promise.all([getTallies(), getVoterPick(voterId)]);
    const responseBody: PredictionsResponse = { votes: tallies, yourPick };
    return NextResponse.json(responseBody);
  } catch (err) {
    if (err instanceof VotingUnavailableError) {
      return NextResponse.json({ error: "Voting is not available right now" }, { status: 503 });
    }
    console.error("predictions POST failed", err);
    return NextResponse.json({ error: "Failed to cast vote" }, { status: 500 });
  }
}
