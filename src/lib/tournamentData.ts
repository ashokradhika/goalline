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

  // deriveStanding's "top 2 in group = Qualified" is incomplete for this
  // format: the 2026 World Cup's Round of 32 also includes the 8 best
  // third-place teams across all 12 groups, so a 3rd-place finisher can
  // still advance. Re-implementing FIFA's best-third tiebreak rules here
  // would just add another place to get it wrong — instead, treat actual
  // appearance in a knockout-stage fixture as direct proof a team advanced,
  // and any knockout-stage loss as proof they're out. Real match data beats
  // a recomputed rule every time.
  const knockoutParticipants = new Set<string>();
  const eliminatedInKnockouts = new Set<string>();
  for (const raw of matchesResult.data.matches) {
    if (raw.stage === "GROUP_STAGE") continue;
    if (raw.homeTeam?.id != null) knockoutParticipants.add(String(raw.homeTeam.id));
    if (raw.awayTeam?.id != null) knockoutParticipants.add(String(raw.awayTeam.id));

    if (raw.status !== "FINISHED") continue;
    if (raw.homeTeam?.id == null || raw.awayTeam?.id == null) continue;
    if (raw.score.winner === "HOME_TEAM") eliminatedInKnockouts.add(String(raw.awayTeam.id));
    else if (raw.score.winner === "AWAY_TEAM") eliminatedInKnockouts.add(String(raw.homeTeam.id));
  }
  for (const rows of standingsByGroup.values()) {
    for (const row of rows) {
      // Order matters: a team can win an early round and lose a later one —
      // the loss (elimination) always takes priority over the earlier proof
      // of survival.
      if (knockoutParticipants.has(row.teamId)) row.status = "Qualified";
      if (eliminatedInKnockouts.has(row.teamId)) row.status = "Eliminated";
    }
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

/** Teams still alive in the tournament right now — used by the Predictions
 * tab so a team drops out of the votable list the moment it's eliminated,
 * without needing any separate sync step. */
export async function getActiveTeams(): Promise<LeaderboardEntry[]> {
  const snapshot = await loadSnapshot();
  const entries: LeaderboardEntry[] = [];
  for (const rows of snapshot.standingsByGroup.values()) {
    for (const standing of rows) {
      if (standing.status === "Eliminated") continue;
      const team = snapshot.teams.get(standing.teamId);
      if (team) entries.push({ team, standing });
    }
  }
  entries.sort((a, b) => a.team.name.localeCompare(b.team.name));
  return entries;
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
