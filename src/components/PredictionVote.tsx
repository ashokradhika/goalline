"use client";

import { useEffect, useMemo, useState } from "react";
import { LeaderboardEntry } from "@/lib/tournamentData";
import { FlagChip } from "@/components/FlagChip";

const VOTER_ID_KEY = "goalline_voter_id";

function getOrCreateVoterId(): string {
  let id = window.localStorage.getItem(VOTER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(VOTER_ID_KEY, id);
  }
  return id;
}

interface PredictionsResponse {
  votes: Record<string, number>;
  yourPick: string | null;
}

export function PredictionVote({ teams }: { teams: LeaderboardEntry[] }) {
  const [voterId, setVoterId] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, number> | null>(null);
  const [yourPick, setYourPick] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = getOrCreateVoterId();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage/crypto.randomUUID require the browser, so this can only run client-side post-mount
    setVoterId(id);

    fetch(`/api/predictions?voterId=${encodeURIComponent(id)}`)
      .then((res) => {
        if (!res.ok) throw new Error("unavailable");
        return res.json();
      })
      .then((data: PredictionsResponse) => {
        setVotes(data.votes);
        setYourPick(data.yourPick);
      })
      .catch(() => setError("Predictions are unavailable right now — check back soon."));
  }, []);

  async function vote(teamId: string) {
    if (!voterId || pending) return;
    setPending(teamId);
    setError(null);
    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ voterId, teamId }),
      });
      if (!res.ok) throw new Error("vote failed");
      const data: PredictionsResponse = await res.json();
      setVotes(data.votes);
      setYourPick(data.yourPick);
    } catch {
      setError("Couldn't record your vote — try again in a moment.");
    } finally {
      setPending(null);
    }
  }

  const ranked = useMemo(() => {
    if (!votes) return [];
    return teams
      .map((entry) => ({ ...entry, count: votes[entry.team.id] ?? 0 }))
      .sort((a, b) => b.count - a.count);
  }, [teams, votes]);

  const totalVotes = ranked.reduce((sum, r) => sum + r.count, 0);
  const leader = ranked.length > 0 && ranked[0].count > 0 ? ranked[0] : null;

  if (error) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
        {error}
      </p>
    );
  }

  if (!votes) {
    return (
      <div className="space-y-3">
        <div className="skeleton h-24 rounded-2xl" />
        <div className="skeleton h-40 rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      {leader && (
        <div className="hero-mesh relative mb-8 overflow-hidden rounded-2xl border border-accent-2/20 bg-surface p-6 shadow-sm sm:p-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-accent-2">
            🏆 Most Predicted Champion
          </p>
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-foreground/5 ring-1 ring-border sm:h-20 sm:w-20">
              {leader.team.crest ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={leader.team.crest} alt="" className="h-full w-full object-contain p-2" />
              ) : (
                <span className="text-sm font-bold text-muted">{leader.team.tla}</span>
              )}
            </span>
            <div>
              <p className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                {leader.team.name}
              </p>
              <p className="text-sm text-muted">
                {leader.count} vote{leader.count === 1 ? "" : "s"} ·{" "}
                {totalVotes > 0 ? Math.round((leader.count / totalVotes) * 100) : 0}% of predictions
              </p>
            </div>
          </div>
        </div>
      )}

      <h3 className="mb-3 text-lg font-bold">Cast Your Prediction</h3>
      <p className="mb-4 text-sm text-muted">
        Pick who you think will win it all. Only teams still alive in the tournament are shown —
        eliminated teams drop off automatically. One prediction per browser; change your mind
        anytime.
      </p>
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {teams.map((entry) => {
          const isPicked = yourPick === entry.team.id;
          const isPending = pending === entry.team.id;
          return (
            <button
              key={entry.team.id}
              onClick={() => vote(entry.team.id)}
              disabled={pending !== null}
              className={`relative rounded-2xl border p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-wait disabled:opacity-70 ${
                isPicked ? "border-accent bg-accent/5 ring-2 ring-accent/30" : "border-border bg-surface"
              }`}
            >
              {isPicked && (
                <span className="gradient-accent absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white shadow">
                  ✓
                </span>
              )}
              <FlagChip crest={entry.team.crest} tla={entry.team.tla} name={entry.team.name} size="sm" />
              <p className="mt-1 text-[11px] text-muted">
                {entry.team.group ? `Group ${entry.team.group}` : ""} {isPending && "· voting…"}
              </p>
            </button>
          );
        })}
      </div>

      <h3 className="mb-3 text-lg font-bold">
        Full Results{" "}
        <span className="font-normal text-muted">
          ({totalVotes} vote{totalVotes === 1 ? "" : "s"})
        </span>
      </h3>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <ul className="divide-y divide-border">
          {ranked.map((entry, i) => {
            const pct = totalVotes > 0 ? Math.round((entry.count / totalVotes) * 100) : 0;
            return (
              <li key={entry.team.id} className="relative px-4 py-3">
                <div
                  className="gradient-accent absolute inset-y-0 left-0 opacity-[0.08]"
                  style={{ width: `${pct}%` }}
                  aria-hidden
                />
                <div className="relative flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-sm font-semibold tabular-nums text-muted">
                      {i + 1}
                    </span>
                    <FlagChip crest={entry.team.crest} tla={entry.team.tla} name={entry.team.name} size="sm" />
                  </div>
                  <span className="shrink-0 text-sm font-bold tabular-nums">
                    {entry.count} <span className="font-normal text-muted">({pct}%)</span>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
