import { fetchFootballData } from "@/lib/footballData/client";
import {
  deriveStanding,
  groupLetterFromLabel,
  mapMatch,
  mapScorer,
  mapStandingRow,
  mapTeam,
} from "@/lib/footballData/mappers";
import {
  RawMatchesResponse,
  RawScorersResponse,
  RawStandingsResponse,
} from "@/lib/footballData/rawTypes";
import { GroupStanding, Match, Scorer, Team } from "@/lib/types";

const COMPETITION = "WC";
const STANDINGS_TTL_MS = 60_000;
const MATCHES_TTL_MS = 30_000;
const SCORERS_TTL_MS = 120_000;

interface TournamentSnapshot {
  teams: Map<string, Team>;
  standingsByGroup: Map<string, GroupStanding[]>;
  matches: Match[];
  stale: boolean;
}

let cachedSnapshot: { data: TournamentSnapshot; expiresAt: number } | null = null;

async function loadSnapshot(): Promise<TournamentSnapshot> {
  // Reuse a just-built snapshot within the shortest TTL window so a single
  // page render (which calls several of the functions below) only assembles
  // the data once.
  if (cachedSnapshot && cachedSnapshot.expiresAt > Date.now()) {
    return cachedSnapshot.data;
  }

  const [standingsResult, matchesResult] = await Promise.all([
    fetchFootballData<RawStandingsResponse>(
      `/competitions/${COMPETITION}/standings`,
      STANDINGS_TTL_MS
    ),
    fetchFootballData<RawMatchesResponse>(`/competitions/${COMPETITION}/matches`, MATCHES_TTL_MS),
  ]);

  const teams = new Map<string, Team>();
  const standingsByGroup = new Map<string, GroupStanding[]>();

  for (const group of standingsResult.data.standings) {
    const letter = groupLetterFromLabel(group.group);
    if (!letter) continue;
    const rows = group.table.map((row) => {
      teams.set(String(row.team.id), mapTeam(row.team, letter));
      return deriveStanding(mapStandingRow(row), group.table.length);
    });
    standingsByGroup.set(letter, rows);
  }

  const matches = matchesResult.data.matches.map(mapMatch);

  // Knockout-stage matches reference teams that may not appear in any group
  // table row directly (already mapped above though, since it's the same
  // team object) — but guard for any team we haven't seen yet.
  for (const raw of matchesResult.data.matches) {
    if (raw.homeTeam?.id != null && !teams.has(String(raw.homeTeam.id))) {
      teams.set(String(raw.homeTeam.id), mapTeam(raw.homeTeam, groupLetterFromLabel(raw.group)));
    }
    if (raw.awayTeam?.id != null && !teams.has(String(raw.awayTeam.id))) {
      teams.set(String(raw.awayTeam.id), mapTeam(raw.awayTeam, groupLetterFromLabel(raw.group)));
    }
  }

  const snapshot: TournamentSnapshot = {
    teams,
    standingsByGroup,
    matches,
    stale: standingsResult.stale || matchesResult.stale,
  };

  cachedSnapshot = { data: snapshot, expiresAt: Date.now() + 15_000 };
  return snapshot;
}

export async function isDataStale(): Promise<boolean> {
  const snapshot = await loadSnapshot();
  return snapshot.stale;
}

export async function getGroups(): Promise<string[]> {
  const snapshot = await loadSnapshot();
  return Array.from(snapshot.standingsByGroup.keys()).sort();
}

export async function getAllTeams(): Promise<Team[]> {
  const snapshot = await loadSnapshot();
  return Array.from(snapshot.teams.values());
}

export async function getTeamMap(): Promise<Map<string, Team>> {
  const snapshot = await loadSnapshot();
  return snapshot.teams;
}

export async function getTeam(id: string): Promise<Team | undefined> {
  const snapshot = await loadSnapshot();
  return snapshot.teams.get(id);
}

export async function getAllGroupStandings(): Promise<Record<string, GroupStanding[]>> {
  const snapshot = await loadSnapshot();
  const result: Record<string, GroupStanding[]> = {};
  for (const [letter, rows] of snapshot.standingsByGroup) {
    result[letter] = rows;
  }
  return result;
}

export async function getGroupStandings(letter: string): Promise<GroupStanding[]> {
  const snapshot = await loadSnapshot();
  return snapshot.standingsByGroup.get(letter) ?? [];
}

export async function getMatches(): Promise<Match[]> {
  const snapshot = await loadSnapshot();
  return snapshot.matches;
}

export async function getMatchById(id: string): Promise<Match | undefined> {
  const snapshot = await loadSnapshot();
  return snapshot.matches.find((m) => m.id === id);
}

export async function getLiveMatches(): Promise<Match[]> {
  const snapshot = await loadSnapshot();
  return snapshot.matches.filter((m) => m.status === "live");
}

export async function getTeamMatches(teamId: string): Promise<Match[]> {
  const snapshot = await loadSnapshot();
  return snapshot.matches.filter((m) => m.homeTeamId === teamId || m.awayTeamId === teamId);
}

export interface LeaderboardEntry {
  team: Team;
  standing: GroupStanding;
}

/** Combined table across all groups — GoalLine's stand-in for a "rankings"
 * view, sourced entirely from real group-stage results (not the official
 * FIFA World Ranking, which this API doesn't expose). */
export async function getTournamentLeaderboard(): Promise<LeaderboardEntry[]> {
  const snapshot = await loadSnapshot();
  const entries: LeaderboardEntry[] = [];
  for (const rows of snapshot.standingsByGroup.values()) {
    for (const standing of rows) {
      const team = snapshot.teams.get(standing.teamId);
      if (team) entries.push({ team, standing });
    }
  }
  entries.sort((a, b) => {
    if (b.standing.points !== a.standing.points) return b.standing.points - a.standing.points;
    const gdA = a.standing.goalsFor - a.standing.goalsAgainst;
    const gdB = b.standing.goalsFor - b.standing.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.standing.goalsFor - a.standing.goalsFor;
  });
  return entries;
}

export interface ScorerEntry {
  scorer: Scorer;
  team?: Team;
}

/** Top scorers — the provider doesn't expose player photos, only stats, so
 * the UI renders these with initials avatars rather than fabricating images. */
export async function getTopScorers(limit = 10): Promise<ScorerEntry[]> {
  const [scorersResult, snapshot] = await Promise.all([
    fetchFootballData<RawScorersResponse>(
      `/competitions/${COMPETITION}/scorers?limit=${limit}`,
      SCORERS_TTL_MS
    ),
    loadSnapshot(),
  ]);

  return scorersResult.data.scorers.map((raw) => {
    const scorer = mapScorer(raw);
    return { scorer, team: snapshot.teams.get(scorer.teamId) };
  });
}
