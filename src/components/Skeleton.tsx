export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="skeleton mb-3 h-3 w-1/3 rounded" />
      <div className="skeleton mb-2 h-5 w-2/3 rounded" />
      <div className="skeleton h-5 w-1/2 rounded" />
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
