import { ScorerEntry } from "@/lib/tournamentData";
import { PlayerAvatar } from "@/components/PlayerAvatar";

const MEDAL = ["🥇", "🥈", "🥉"];

export function TopScorers({ entries }: { entries: ScorerEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
        No scorer data available yet.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <ul className="divide-y divide-border">
        {entries.map(({ scorer, team }, i) => (
          <li
            key={scorer.playerId}
            className="flex items-center gap-4 px-4 py-3.5 transition hover:bg-foreground/[0.02] sm:px-5"
          >
            <span className="w-6 shrink-0 text-center text-sm font-bold text-muted">
              {i < 3 ? MEDAL[i] : i + 1}
            </span>
            <PlayerAvatar playerId={scorer.playerId} name={scorer.playerName} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{scorer.playerName}</p>
              <p className="flex items-center gap-1.5 truncate text-xs text-muted">
                {team?.crest && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={team.crest} alt="" className="h-3.5 w-3.5 object-contain" />
                )}
                {team?.name ?? scorer.nationality ?? "Unknown"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4 text-right">
              {scorer.assists != null && (
                <div className="hidden sm:block">
                  <p className="text-lg font-bold tabular-nums leading-none">{scorer.assists}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted">Assists</p>
                </div>
              )}
              <div>
                <p className="text-xl font-extrabold tabular-nums leading-none text-gradient">
                  {scorer.goals}
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted">Goals</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
