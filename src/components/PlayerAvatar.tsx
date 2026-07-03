// football-data.org's free tier doesn't provide player photos — only name,
// nationality, and stats — so scorers get a deterministic gradient initials
// avatar instead of a fabricated headshot.
const PALETTES = [
  ["#2563eb", "#0d9488"],
  ["#7c3aed", "#db2777"],
  ["#ea580c", "#d97706"],
  ["#0891b2", "#2563eb"],
  ["#16a34a", "#0d9488"],
  ["#db2777", "#7c3aed"],
];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function paletteFor(seed: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTES[hash % PALETTES.length] as [string, string];
}

export function PlayerAvatar({
  playerId,
  name,
  size = "md",
}: {
  playerId: string;
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims = { sm: "h-8 w-8 text-xs", md: "h-11 w-11 text-sm", lg: "h-16 w-16 text-lg" }[size];
  const [from, to] = paletteFor(playerId || name);

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm ${dims}`}
      style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
      aria-hidden
    >
      {initialsOf(name)}
    </span>
  );
}
