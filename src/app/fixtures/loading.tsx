import { GridSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 h-10 w-64 animate-pulse rounded bg-foreground/10" />
      <GridSkeleton />
    </div>
  );
}
