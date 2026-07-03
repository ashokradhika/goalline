import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { NavBar } from "@/components/NavBar";
import { AskGoalLineWidget } from "@/components/AskGoalLineWidget";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GoalLine — Live FIFA World Cup Standings",
  description:
    "Live World Cup standings, group tables, and match status with AI-powered summaries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <NavBar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border py-8 text-center text-xs text-muted">
            GoalLine — data via football-data.org, refreshed continuously. AI content is labeled
            with ✨.
          </footer>
          <AskGoalLineWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
