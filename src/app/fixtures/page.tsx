import { getMatches, getTeamMap, isDataStale } from "@/lib/tournamentData";
import { FixturesTabs } from "@/components/FixturesTabs";
import { RefreshBar } from "@/components/RefreshBar";
import { StaleBanner } from "@/components/StaleBanner";

export const dynamic = "force-dynamic";

export default async function FixturesPage() {
  const [matches, teamMap, stale] = await Promise.all([
    getMatches(),
    getTeamMap(),
    isDataStale(),
  ]);
  const teams = Object.fromEntries(teamMap);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Fixtures &amp; <span className="text-gradient">Results</span>
          </h1>
          <p className="mt-1 text-muted">Live, upcoming, and completed matches.</p>
        </div>
        <RefreshBar />
      </div>
      <StaleBanner stale={stale} />
      <FixturesTabs matches={matches} teams={teams} />
    </div>
  );
}
