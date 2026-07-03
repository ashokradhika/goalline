"use client";

import { useEffect, useState } from "react";
import { AiTag } from "@/components/AiTag";

export function TeamAiForm({ teamId }: { teamId: string }) {
  const [outlook, setOutlook] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/team-form/${teamId}`)
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setOutlook(data.outlook);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [teamId]);

  return (
    <div className="rounded-2xl border border-accent-2/20 bg-surface p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold">Form &amp; Outlook</h3>
        <AiTag />
      </div>
      {error && <p className="text-sm text-muted">AI outlook is unavailable right now.</p>}
      {!error && !outlook && (
        <div className="space-y-2">
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-5/6 rounded" />
          <div className="skeleton h-3 w-2/3 rounded" />
        </div>
      )}
      {outlook && <p className="text-sm leading-relaxed text-foreground">{outlook}</p>}
    </div>
  );
}
