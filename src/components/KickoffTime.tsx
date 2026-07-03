"use client";

import { useEffect, useState } from "react";

// Kickoff time must reflect the *visitor's* local timezone, but MatchCard
// gets bundled client-side wherever a "use client" parent (e.g. FixturesTabs)
// renders it directly — so computing this in the initial render body means
// the server (UTC) and the client (visitor's real timezone) compute
// different strings and React throws a hydration mismatch. Rendering a
// placeholder on first paint and filling in the real value in an effect
// guarantees the server-rendered and first-client-rendered text match
// exactly; the correct localized time then appears a tick later.
const SHORT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "short",
  hour: "numeric",
  minute: "2-digit",
};

const FULL_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "long",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
};

export function KickoffTime({
  iso,
  variant = "short",
}: {
  iso: string;
  variant?: "short" | "full";
}) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const options = variant === "full" ? FULL_OPTIONS : SHORT_OPTIONS;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deferring to a client-only render is exactly how this avoids a hydration mismatch
    setLabel(new Date(iso).toLocaleString(undefined, options));
  }, [iso, variant]);

  return <span suppressHydrationWarning>{label ?? "—"}</span>;
}
