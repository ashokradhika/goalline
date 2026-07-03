"use client";

import { useState } from "react";
import { Match, MatchStatus, Team } from "@/lib/types";
import { MatchCard } from "@/components/MatchCard";

const tabs: { key: MatchStatus; label: string }[] = [
  { key: "live", label: "Live" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
];

export function FixturesTabs({
  matches,
  teams,
}: {
  matches: Match[];
  teams: Record<string, Team>;
}) {
  const [active, setActive] = useState<MatchStatus>(
    matches.some((m) => m.status === "live") ? "live" : "upcoming"
  );

  const filtered = matches.filter((m) => m.status === active);

  return (
    <div>
      <div className="mb-6 inline-flex rounded-full border border-border bg-surface p-1 shadow-sm">
        {tabs.map((t) => {
          const count = matches.filter((m) => m.status === t.key).length;
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                isActive
                  ? "gradient-accent text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
          No {active} matches right now.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              homeTeam={m.homeTeamId ? teams[m.homeTeamId] : undefined}
              awayTeam={m.awayTeamId ? teams[m.awayTeamId] : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
