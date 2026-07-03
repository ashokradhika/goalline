import { glossary } from "@/lib/footballGlossary";
import { GlossarySearch } from "@/components/GlossarySearch";

export default function LearnPage() {
  return (
    <div>
      <section className="hero-mesh relative overflow-hidden border-b border-border">
        <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
            New to football?
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Football, <span className="text-gradient">Explained</span>
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted sm:text-lg">
            Everything you need to actually follow the World Cup — how the tournament works, how
            to read a standings table, and what people mean when they yell &ldquo;offside!&rdquo;
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-extrabold tracking-tight">How This World Cup Works</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <span className="gradient-accent mb-3 flex h-9 w-9 items-center justify-center rounded-xl text-sm font-extrabold text-white">
                1
              </span>
              <h3 className="mb-2 font-bold">Group Stage</h3>
              <p className="text-sm leading-relaxed text-muted">
                48 teams are split into 12 groups of 4. Every team plays the other 3 teams in its
                group once — a win is 3 points, a draw is 1 point, a loss is 0.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <span className="gradient-accent mb-3 flex h-9 w-9 items-center justify-center rounded-xl text-sm font-extrabold text-white">
                2
              </span>
              <h3 className="mb-2 font-bold">Who Advances</h3>
              <p className="text-sm leading-relaxed text-muted">
                The top 2 teams from each group qualify (24 teams) — plus the{" "}
                <strong>8 best third-place teams</strong>
                {" "}across all 12 groups, ranked by points, then goal difference. That&apos;s 32
                teams total for the knockouts.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <span className="gradient-accent mb-3 flex h-9 w-9 items-center justify-center rounded-xl text-sm font-extrabold text-white">
                3
              </span>
              <h3 className="mb-2 font-bold">Knockouts</h3>
              <p className="text-sm leading-relaxed text-muted">
                Single elimination from here: Round of 32 → Round of 16 → Quarterfinal →
                Semifinal → Final (plus a Third Place Playoff). Lose once and you&apos;re out —
                draws go to extra time, then penalties.
              </p>
            </div>
          </div>
          <p className="mt-4 rounded-xl border border-accent-2/20 bg-accent-2/5 px-4 py-3 text-sm text-muted">
            💡 That third-place wildcard path is easy to miss — a team can finish 3rd in its group
            and still be very much alive in the tournament. Check a team&apos;s{" "}
            <span className="font-semibold text-foreground">Status</span> badge on the{" "}
            <span className="font-semibold text-foreground">Tournament</span> page rather than
            assuming group position tells the whole story.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-xl font-extrabold tracking-tight">Reading the Standings Table</h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["P", "Played — how many group matches this team has completed."],
                  ["W / D / L", "Wins, draws, and losses so far."],
                  ["GF", "Goals For — total goals this team has scored."],
                  ["GD", "Goal Difference — goals scored minus goals conceded. Breaks ties on points."],
                  ["Pts", "Points — 3 for a win, 1 for a draw, 0 for a loss. Determines group position."],
                ].map(([abbr, meaning]) => (
                  <tr key={abbr} className="border-b border-border last:border-0">
                    <td className="w-28 px-4 py-3 font-mono text-sm font-bold text-accent">{abbr}</td>
                    <td className="px-4 py-3 text-muted">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-extrabold tracking-tight">Glossary</h2>
          <GlossarySearch categories={glossary} />
        </section>
      </div>
    </div>
  );
}
