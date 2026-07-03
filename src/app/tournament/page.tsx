import {
  getAllGroupStandings,
  getGroups,
  getTeamMap,
  isDataStale,
} from "@/lib/tournamentData";
import Link from "next/link";
import { FlagChip } from "@/components/FlagChip";
import { RefreshBar } from "@/components/RefreshBar";
import { StaleBanner } from "@/components/StaleBanner";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  Qualified: "bg-win/10 text-win ring-win/20",
  Eliminated: "bg-out/10 text-out ring-out/20",
  "In contention": "bg-risk/10 text-risk ring-risk/20",
};

export default async function TournamentPage() {
  const [groups, standings, teamMap, stale] = await Promise.all([
    getGroups(),
    getAllGroupStandings(),
    getTeamMap(),
    isDataStale(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Tournament <span className="text-gradient">Groups</span>
          </h1>
          <p className="mt-1 text-muted">Top 2 in each group advance to the Round of 32.</p>
        </div>
        <RefreshBar />
      </div>

      <StaleBanner stale={stale} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {groups.map((g) => (
          <div
            key={g}
            className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <span className="gradient-accent flex h-7 w-7 items-center justify-center rounded-lg text-xs font-extrabold text-white">
                {g}
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wide">Group {g}</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-2 font-semibold">Team</th>
                  <th className="px-2 py-2 text-right font-semibold">P</th>
                  <th className="px-2 py-2 text-right font-semibold">W</th>
                  <th className="px-2 py-2 text-right font-semibold">D</th>
                  <th className="px-2 py-2 text-right font-semibold">L</th>
                  <th className="px-2 py-2 text-right font-semibold">GD</th>
                  <th className="px-2 py-2 text-right font-semibold">Pts</th>
                  <th className="px-4 py-2 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {(standings[g] ?? []).map((s) => {
                  const team = teamMap.get(s.teamId);
                  if (!team) return null;
                  return (
                    <tr key={s.teamId} className="border-b border-border last:border-0">
                      <td className="px-4 py-2.5">
                        <Link href={`/team/${team.id}`} className="hover:underline">
                          <FlagChip crest={team.crest} tla={team.tla} name={team.name} size="sm" />
                        </Link>
                      </td>
                      <td className="px-2 py-2.5 text-right tabular-nums">{s.played}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums">{s.won}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums">{s.drawn}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums">{s.lost}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums">
                        {s.goalsFor - s.goalsAgainst > 0 ? "+" : ""}
                        {s.goalsFor - s.goalsAgainst}
                      </td>
                      <td className="px-2 py-2.5 text-right font-bold tabular-nums">{s.points}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${statusStyles[s.status]}`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
