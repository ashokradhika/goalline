"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LeaderboardEntry } from "@/lib/tournamentData";
import { FlagChip } from "@/components/FlagChip";

type SortKey = "points" | "name" | "goalDifference" | "goalsFor" | "played";

export function RankingsTable({ entries }: { entries: LeaderboardEntry[] }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("points");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = q ? entries.filter((e) => e.team.name.toLowerCase().includes(q)) : entries;
    const sorted = [...rows].sort((a, b) => {
      let diff = 0;
      if (sortKey === "name") diff = a.team.name.localeCompare(b.team.name);
      else if (sortKey === "goalDifference") {
        diff =
          a.standing.goalsFor -
          a.standing.goalsAgainst -
          (b.standing.goalsFor - b.standing.goalsAgainst);
      } else if (sortKey === "goalsFor") diff = a.standing.goalsFor - b.standing.goalsFor;
      else if (sortKey === "played") diff = a.standing.played - b.standing.played;
      else diff = a.standing.points - b.standing.points;
      return sortAsc ? diff : -diff;
    });
    return sorted;
  }, [entries, query, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  const headers: { key: SortKey; label: string; align?: "right" }[] = [
    { key: "name", label: "Team" },
    { key: "played", label: "P", align: "right" },
    { key: "goalsFor", label: "GF", align: "right" },
    { key: "goalDifference", label: "GD", align: "right" },
    { key: "points", label: "Pts", align: "right" },
  ];

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search teams..."
          className="w-full rounded-full border border-border bg-surface py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-accent/40"
        />
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-surface">
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">#</th>
                {headers.map((h) => (
                  <th
                    key={h.key}
                    onClick={() => toggleSort(h.key)}
                    className={`cursor-pointer select-none px-4 py-3 font-semibold hover:text-foreground ${
                      h.align === "right" ? "text-right" : ""
                    }`}
                  >
                    {h.label} {sortKey === h.key && (sortAsc ? "↑" : "↓")}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-semibold">Group</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, i) => (
                <tr
                  key={entry.team.id}
                  className="border-b border-border last:border-0 hover:bg-foreground/[0.02]"
                >
                  <td className="px-4 py-3 font-semibold tabular-nums text-muted">
                    {i < 3 && !query ? ["🥇", "🥈", "🥉"][i] : i + 1}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/team/${entry.team.id}`} className="hover:underline">
                      <FlagChip
                        crest={entry.team.crest}
                        tla={entry.team.tla}
                        name={entry.team.name}
                        size="sm"
                      />
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{entry.standing.played}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{entry.standing.goalsFor}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {entry.standing.goalsFor - entry.standing.goalsAgainst > 0 ? "+" : ""}
                    {entry.standing.goalsFor - entry.standing.goalsAgainst}
                  </td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums">
                    {entry.standing.points}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted">
                    {entry.team.group ? `Group ${entry.team.group}` : "—"}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted">
                    No teams match &ldquo;{query}&rdquo;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
