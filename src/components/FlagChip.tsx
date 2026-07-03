export function FlagChip({
  crest,
  tla,
  name,
  size = "md",
}: {
  crest?: string | null;
  tla: string;
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims = { sm: "h-6 w-6", md: "h-8 w-8", lg: "h-12 w-12" }[size];
  const textSize = { sm: "text-[9px]", md: "text-[10px]", lg: "text-sm" }[size];

  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-foreground/5 ring-1 ring-border ${dims}`}
        aria-hidden
      >
        {crest ? (
          // eslint-disable-next-line @next/next/no-img-element -- small external crest icons, not worth Next/Image's optimization pipeline
          <img src={crest} alt="" className="h-full w-full object-contain p-0.5" />
        ) : (
          <span className={`font-bold text-muted ${textSize}`}>{tla}</span>
        )}
      </span>
      <span className="font-medium">{name}</span>
    </span>
  );
}
