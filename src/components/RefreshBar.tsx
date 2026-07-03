"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 45_000;

export function RefreshBar() {
  const router = useRouter();
  const [lastUpdated, setLastUpdated] = useState<number>(() => Date.now());
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(() => {
    setRefreshing(true);
    router.refresh();
    setLastUpdated(Date.now());
    window.setTimeout(() => setRefreshing(false), 500);
  }, [router]);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setSecondsAgo(Math.round((Date.now() - lastUpdated) / 1000));
    }, 1000);
    return () => window.clearInterval(tick);
  }, [lastUpdated]);

  useEffect(() => {
    const poll = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(poll);
  }, [refresh]);

  return (
    <div className="flex items-center gap-3 text-xs text-muted">
      <span>
        Last updated:{" "}
        {secondsAgo < 5 ? "just now" : `${secondsAgo}s ago`}
      </span>
      <button
        onClick={refresh}
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 font-medium text-foreground transition hover:bg-foreground/5"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={refreshing ? "animate-spin" : ""}
        >
          <path d="M21 12a9 9 0 1 1-2.64-6.36" />
          <path d="M21 3v6h-6" />
        </svg>
        Refresh
      </button>
    </div>
  );
}
