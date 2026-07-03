import { getActiveTeams } from "@/lib/tournamentData";
import { PredictionVote } from "@/components/PredictionVote";

export const dynamic = "force-dynamic";

export default async function PredictionsPage() {
  const teams = await getActiveTeams();

  return (
    <div>
      <section className="hero-mesh relative overflow-hidden border-b border-border">
        <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
            Fan Predictions
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Who Wins It <span className="text-gradient">All?</span>
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted sm:text-lg">
            Vote for the team you think will lift the trophy. Live tally, updated as teams get
            eliminated.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {teams.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
            No teams currently available to vote for.
          </p>
        ) : (
          <PredictionVote teams={teams} />
        )}
      </div>
    </div>
  );
}
