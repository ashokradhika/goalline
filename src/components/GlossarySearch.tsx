"use client";

import { useMemo, useState } from "react";
import { GlossaryCategory } from "@/lib/footballGlossary";

export function GlossarySearch({ categories }: { categories: GlossaryCategory[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((cat) => ({
        ...cat,
        terms: cat.terms.filter(
          (t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.terms.length > 0);
  }, [categories, query]);

  return (
    <div>
      <div className="relative mb-6 max-w-sm">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms — try 'offside'..."
          className="w-full rounded-full border border-border bg-surface py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-accent/40"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
          No terms match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="space-y-8">
          {filtered.map((cat) => (
            <section key={cat.category}>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold">
                <span aria-hidden>{cat.icon}</span>
                {cat.category}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {cat.terms.map((t) => (
                  <div
                    key={t.term}
                    className="rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:shadow-md"
                  >
                    <p className="mb-1 font-bold text-accent">{t.term}</p>
                    <p className="text-sm leading-relaxed text-muted">{t.definition}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
