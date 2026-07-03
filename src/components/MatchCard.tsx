import Link from "next/link";
import { Match, Team } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { FlagChip } from "@/components/FlagChip";
import { KickoffTime } from "@/components/KickoffTime";

const TBD_TEAM: Team = { id: "tbd", name: "TBD", shortName: "TBD", tla: "TBD", crest: null, group: null };

export function MatchCard({
  match,
  homeTeam,
  awayTeam,
}: {
  match: Match;
  homeTeam?: Team;
  awayTeam?: Team;
}) {
  const home = homeTeam ?? TBD_TEAM;
  const away = awayTeam ?? TBD_TEAM;
  const isLive = match.status === "live";

  return (
    <Link
      href={`/match/${match.id}`}
      className={`group relative block overflow-hidden rounded-2xl border bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:p-5 ${
        isLive ? "border-red-500/20 card-glow" : "border-border"
      }`}
    >
      {isLive && <span className="gradient-accent absolute inset-x-0 top-0 h-1" aria-hidden />}

      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          {match.stage}
        </span>
        <StatusBadge status={match.status} minute={match.minute} />
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <FlagChip crest={home.crest} tla={home.tla} name={home.name} />
          <span className="text-2xl font-extrabold tabular-nums">
            {match.status === "upcoming" || match.homeScore === null ? (
              <span className="text-muted">–</span>
            ) : (
              match.homeScore
            )}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <FlagChip crest={away.crest} tla={away.tla} name={away.name} />
          <span className="text-2xl font-extrabold tabular-nums">
            {match.status === "upcoming" || match.awayScore === null ? (
              <span className="text-muted">–</span>
            ) : (
              match.awayScore
            )}
          </span>
        </div>
      </div>

      {match.status === "upcoming" && (
        <div className="mt-3 text-right text-xs font-medium text-muted">
          <KickoffTime iso={match.kickoff} variant="short" />
        </div>
      )}
    </Link>
  );
}
