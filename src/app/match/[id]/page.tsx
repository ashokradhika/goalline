import { notFound } from "next/navigation";
import Link from "next/link";
import { getMatchById, getTeam, isDataStale } from "@/lib/tournamentData";
import { StatusBadge } from "@/components/StatusBadge";
import { MatchAiSummary } from "@/components/MatchAiSummary";
import { StaleBanner } from "@/components/StaleBanner";
import { KickoffTime } from "@/components/KickoffTime";

export const dynamic = "force-dynamic";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [match, stale] = await Promise.all([getMatchById(id), isDataStale()]);
  if (!match) notFound();

  const [home, away] = await Promise.all([
    match.homeTeamId ? getTeam(match.homeTeamId) : undefined,
    match.awayTeamId ? getTeam(match.awayTeamId) : undefined,
  ]);

  const hasHalftime = match.halftimeHomeScore !== null && match.halftimeAwayScore !== null;

  const isLive = match.status === "live";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        href="/fixtures"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
      >
        ← Back to fixtures
      </Link>

      <StaleBanner stale={stale} />

      <div
        className={`relative overflow-hidden rounded-2xl border bg-surface p-6 shadow-sm sm:p-8 ${
          isLive ? "border-red-500/20 card-glow" : "border-border"
        }`}
      >
        {isLive && <span className="gradient-accent absolute inset-x-0 top-0 h-1.5" aria-hidden />}
        <div className="mb-8 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            {match.stage}
          </span>
          <StatusBadge status={match.status} minute={match.minute} />
        </div>

        <div className="grid grid-cols-3 items-center gap-4 text-center">
          <TeamColumn teamId={match.homeTeamId} name={home?.name} crest={home?.crest} tla={home?.tla} />
          <div className="text-5xl font-extrabold tabular-nums sm:text-6xl">
            {match.status === "upcoming" || match.homeScore === null ? (
              <span className="text-muted">vs</span>
            ) : (
              <span className={isLive ? "text-gradient" : ""}>
                {match.homeScore} – {match.awayScore}
              </span>
            )}
          </div>
          <TeamColumn teamId={match.awayTeamId} name={away?.name} crest={away?.crest} tla={away?.tla} />
        </div>

        <div className="mt-8 flex flex-col items-center gap-1 text-sm text-muted">
          <KickoffTime iso={match.kickoff} variant="full" />
        </div>
      </div>

      <div className="mt-6">
        <MatchAiSummary key={match.id} matchId={match.id} />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h3 className="mb-4 font-bold">Match Facts</h3>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <Fact label="Stage" value={match.stage} />
          {hasHalftime && (
            <Fact
              label="Halftime score"
              value={`${match.halftimeHomeScore} – ${match.halftimeAwayScore}`}
            />
          )}
          {match.referee && <Fact label="Referee" value={match.referee} />}
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Kickoff</dt>
            <dd className="font-medium">
              <KickoffTime iso={match.kickoff} variant="full" />
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-muted">
          Goal-by-goal event detail isn&apos;t available on our current data plan — scores update
          live as the match progresses.
        </p>
      </div>
    </div>
  );
}

function TeamColumn({
  teamId,
  name,
  crest,
  tla,
}: {
  teamId: string | null;
  name?: string;
  crest?: string | null;
  tla?: string;
}) {
  const content = (
    <div className="group flex flex-col items-center gap-2.5">
      <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-foreground/5 ring-1 ring-border transition group-hover:ring-accent/40 sm:h-20 sm:w-20">
        {crest ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={crest} alt="" className="h-full w-full object-contain p-2" />
        ) : (
          <span className="text-sm font-bold text-muted">{tla ?? "TBD"}</span>
        )}
      </span>
      <span className="font-bold transition group-hover:text-accent">{name ?? "TBD"}</span>
    </div>
  );
  return teamId ? <Link href={`/team/${teamId}`}>{content}</Link> : content;
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
