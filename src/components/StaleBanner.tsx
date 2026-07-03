export function StaleBanner({ stale }: { stale: boolean }) {
  if (!stale) return null;
  return (
    <div className="mb-6 rounded-xl border border-risk/30 bg-risk/10 px-4 py-2 text-sm text-risk">
      Live data may be delayed — showing the last successful update while we reconnect.
    </div>
  );
}
