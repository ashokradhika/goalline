"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/rankings", label: "Rankings" },
  { href: "/tournament", label: "Tournament" },
  { href: "/fixtures", label: "Fixtures" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/75 backdrop-blur-md supports-[backdrop-filter]:bg-surface/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="gradient-accent flex h-9 w-9 items-center justify-center rounded-xl text-sm font-extrabold text-white shadow-[0_4px_14px_-4px_rgba(37,99,235,0.55)] transition group-hover:scale-105">
            GL
          </span>
          <span className="text-lg font-extrabold tracking-tight">GoalLine</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {active && (
                  <span className="absolute inset-0 rounded-full bg-foreground/[0.06] ring-1 ring-inset ring-border" />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-2 sm:hidden">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                active ? "bg-foreground/[0.06] text-foreground ring-1 ring-inset ring-border" : "text-muted"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
