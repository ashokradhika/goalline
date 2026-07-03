"use client";

import { useEffect, useState } from "react";
import { AiTag } from "@/components/AiTag";

export function MatchAiSummary({ matchId }: { matchId: string }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/match-summary/${matchId}`)
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setSummary(data.summary);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [matchId]);

  return (
    <div className="rounded-2xl border border-accent-2/20 bg-surface p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold">Match Summary</h3>
        <AiTag />
      </div>
      {error && <p className="text-sm text-muted">AI summary is unavailable right now.</p>}
      {!error && !summary && (
        <div className="space-y-2">
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-5/6 rounded" />
          <div className="skeleton h-3 w-3/4 rounded" />
        </div>
      )}
      {summary && <p className="text-sm leading-relaxed text-foreground">{summary}</p>}
    </div>
  );
}
