import Link from "next/link";
import {
  getLiveMatches,
  getMatches,
  getTeamMap,
  getTopScorers,
  getTournamentLeaderboard,
  isDataStale,
} from "@/lib/tournamentData";
import { MatchCard } from "@/components/MatchCard";
import { FlagChip } from "@/components/FlagChip";
import { RefreshBar } from "@/components/RefreshBar";
import { StaleBanner } from "@/components/StaleBanner";
import { TopScorers } from "@/components/TopScorers";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [liveMatches, allMatches, teamMap, leaderboard, scorers, stale] = await Promise.all([
    getLiveMatches(),
    getMatches(),
    getTeamMap(),
    getTournamentLeaderboard(),
    getTopScorers(5),
    isDataStale(),
  ]);

  const upcoming = allMatches.filter((m) => m.status === "upcoming").slice(0, 3);
  const topTeams = leaderboard.slice(0, 10);

  return (
    <div>
      <section className="hero-mesh relative overflow-hidden border-b border-border">
        <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="fade-up">
              <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                FIFA World Cup 2026
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
                <span className="text-gradient">GoalLine</span>
              </h1>
              <p className="mt-3 max-w-md text-base text-muted sm:text-lg">
                See how your team is doing, right now — live scores, standings, and AI-powered
                storylines from the tournament.
              </p>
            </div>
            <RefreshBar />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <StaleBanner stale={stale} />

        {liveMatches.length > 0 && (
          <section className="mb-12">
            <div className="mb-4 flex items-center gap-2">
              <span className="live-dot h-2.5 w-2.5 rounded-full bg-red-500" />
              <h2 className="text-xl font-extrabold tracking-tight">Live Now</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {liveMatches.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  homeTeam={m.homeTeamId ? teamMap.get(m.homeTeamId) : undefined}
                  awayTeam={m.awayTeamId ? teamMap.get(m.awayTeamId) : undefined}
                />
              ))}
            </div>
          </section>
        )}

        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-extrabold tracking-tight">Up Next</h2>
            <Link href="/fixtures" className="text-sm font-semibold text-accent hover:underline">
              View all fixtures →
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
              No upcoming matches scheduled right now.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  homeTeam={m.homeTeamId ? teamMap.get(m.homeTeamId) : undefined}
                  awayTeam={m.awayTeamId ? teamMap.get(m.awayTeamId) : undefined}
                />
              ))}
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          <section className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-extrabold tracking-tight">Tournament Standings</h2>
              <Link href="/rankings" className="text-sm font-semibold text-accent hover:underline">
                Full standings →
              </Link>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-foreground/[0.03] text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-4 py-3 font-semibold">#</th>
                    <th className="px-4 py-3 font-semibold">Team</th>
                    <th className="px-4 py-3 font-semibold">Group</th>
                    <th className="px-4 py-3 text-right font-semibold">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {topTeams.map((entry, i) => (
                    <tr
                      key={entry.team.id}
                      className="border-b border-border last:border-0 hover:bg-foreground/[0.02]"
                    >
                      <td className="px-4 py-3 font-semibold tabular-nums">
                        {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                      </td>
                      <td className="px-4 py-3">
                        <FlagChip
                          crest={entry.team.crest}
                          tla={entry.team.tla}
                          name={entry.team.name}
                          size="sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {entry.team.group ? `Group ${entry.team.group}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums">
                        {entry.standing.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-extrabold tracking-tight">Top Scorers</h2>
            </div>
            <TopScorers entries={scorers} />
          </section>
        </div>
      </div>
    </div>
  );
}
