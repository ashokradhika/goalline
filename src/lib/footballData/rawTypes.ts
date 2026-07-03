// Minimal shapes for the subset of the football-data.org v4 response we use.
// Not exhaustive — only fields GoalLine reads.

export interface RawTeam {
  // Future knockout matches whose participants aren't decided yet ("Winner
  // of Match X") come back as a team object with every field null.
  id: number | null;
  name: string | null;
  shortName: string | null;
  tla: string | null;
  crest: string | null;
}

export interface RawStandingRow {
  position: number;
  team: RawTeam;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface RawStandingsGroup {
  stage: string;
  type: string;
  group: string | null; // "Group A".."Group L"
  table: RawStandingRow[];
}

export interface RawStandingsResponse {
  standings: RawStandingsGroup[];
}

export type RawMatchStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "POSTPONED"
  | "SUSPENDED"
  | "CANCELLED";

export interface RawMatch {
  id: number;
  utcDate: string;
  status: RawMatchStatus;
  stage: string; // "GROUP_STAGE" | "LAST_32" | "LAST_16" | "QUARTER_FINALS" | "SEMI_FINALS" | "THIRD_PLACE" | "FINAL"
  group: string | null; // "GROUP_A".."GROUP_L"
  venue?: string | null;
  homeTeam: RawTeam | null;
  awayTeam: RawTeam | null;
  score: {
    winner: string | null;
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
  referees?: { id: number; name: string; type: string }[];
}

export interface RawMatchesResponse {
  matches: RawMatch[];
}

export interface RawScorer {
  player: {
    id: number;
    name: string;
    nationality: string | null;
  };
  team: RawTeam;
  playedMatches: number;
  goals: number;
  assists: number | null;
  penalties: number | null;
}

export interface RawScorersResponse {
  scorers: RawScorer[];
}
