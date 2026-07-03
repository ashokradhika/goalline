import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getGroupStandings,
  getTeam,
  getTeamMap,
  getTeamMatches,
  isDataStale,
} from "@/lib/tournamentData";
import { MatchCard } from "@/components/MatchCard";
import { TeamAiForm } from "@/components/TeamAiForm";
import { StaleBanner } from "@/components/StaleBanner";

export const dynamic = "force-dynamic";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [team, stale] = await Promise.all([getTeam(id), isDataStale()]);
  if (!team) notFound();

  const [standingRows, matches, teamMap] = await Promise.all([
    team.group ? getGroupStandings(team.group) : Promise.resolve([]),
    getTeamMatches(team.id),
    getTeamMap(),
  ]);
  const standing = standingRows.find((s) => s.teamId === team.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/rankings" className="mb-6 inline-block text-sm font-medium text-accent hover:underline">
        ← Back to standings
      </Link>

      <StaleBanner stale={stale} />

      <div className="hero-mesh relative mb-6 flex items-center gap-5 overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-foreground/5 ring-1 ring-border sm:h-24 sm:w-24">
          {team.crest ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={team.crest} alt="" className="h-full w-full object-contain p-2.5" />
          ) : (
            <span className="text-lg font-bold text-muted">{team.tla}</span>
          )}
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{team.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {team.group && `Group ${team.group}`}
            {standing && ` · ${standing.points} pts · ${standing.played} played`}
          </p>
          {standing && (
            <span
              className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                standing.status === "Qualified"
                  ? "bg-win/10 text-win ring-win/20"
                  : standing.status === "Eliminated"
                    ? "bg-out/10 text-out ring-out/20"
                    : "bg-risk/10 text-risk ring-risk/20"
              }`}
            >
              {standing.status}
            </span>
          )}
        </div>
      </div>

      <div className="mb-6">
        <TeamAiForm key={team.id} teamId={team.id} />
      </div>

      <h3 className="mb-3 text-lg font-extrabold tracking-tight">Fixtures</h3>
      {matches.length === 0 ? (
        <p className="text-sm text-muted">No fixtures found for this team.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {matches.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              homeTeam={m.homeTeamId ? teamMap.get(m.homeTeamId) : undefined}
              awayTeam={m.awayTeamId ? teamMap.get(m.awayTeamId) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
