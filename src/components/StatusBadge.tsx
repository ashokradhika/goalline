import { MatchStatus } from "@/lib/types";

export function StatusBadge({ status, minute }: { status: MatchStatus; minute?: number | null }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-red-600 ring-1 ring-inset ring-red-500/20 dark:text-red-400">
        <span className="live-dot h-1.5 w-1.5 rounded-full bg-red-500" />
        Live{minute != null ? ` · ${minute}'` : ""}
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span className="inline-flex items-center rounded-full bg-foreground/5 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted ring-1 ring-inset ring-border">
        Final
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-accent ring-1 ring-inset ring-accent/20">
      Upcoming
    </span>
  );
}
