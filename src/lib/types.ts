export type MatchStatus = "live" | "upcoming" | "completed";

export interface Team {
  id: string;
  name: string;
  shortName: string;
  tla: string;
  crest: string | null;
  /** Single-letter group ("A".."L"), or null once a team is fully resolved into knockouts. */
  group: string | null;
}

export interface GroupStanding {
  teamId: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  status: "Qualified" | "Eliminated" | "In contention";
}

export interface Scorer {
  playerId: string;
  playerName: string;
  nationality: string | null;
  teamId: string;
  goals: number;
  assists: number | null;
  playedMatches: number;
}

export interface Match {
  id: string;
  /** Display label, e.g. "Group A", "Round of 32", "Final". */
  stage: string;
  group: string | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  halftimeHomeScore: number | null;
  halftimeAwayScore: number | null;
  status: MatchStatus;
  kickoff: string; // ISO timestamp
  minute: number | null;
  referee: string | null;
}
