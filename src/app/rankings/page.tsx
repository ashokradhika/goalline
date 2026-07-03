import { RankingsTable } from "@/components/RankingsTable";
import { getTournamentLeaderboard, isDataStale } from "@/lib/tournamentData";
import { RefreshBar } from "@/components/RefreshBar";
import { StaleBanner } from "@/components/StaleBanner";

export const dynamic = "force-dynamic";

export default async function RankingsPage() {
  const [entries, stale] = await Promise.all([getTournamentLeaderboard(), isDataStale()]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Tournament <span className="text-gradient">Standings</span>
          </h1>
          <p className="mt-1 text-muted">
            All 48 teams, combined across every group — sorted by points, then goal difference.
          </p>
        </div>
        <RefreshBar />
      </div>
      <StaleBanner stale={stale} />
      <RankingsTable entries={entries} />
    </div>
  );
}
