import { GroupStanding, Match, MatchStatus, Scorer, Team } from "@/lib/types";
import { RawMatch, RawMatchStatus, RawScorer, RawStandingRow, RawTeam } from "@/lib/footballData/rawTypes";

export function groupLetterFromLabel(label: string | null): string | null {
  // "Group A" -> "A", "GROUP_A" -> "A"
  if (!label) return null;
  const match = label.match(/([A-Z])\s*$/);
  return match ? match[1] : null;
}

const STAGE_LABELS: Record<string, string> = {
  LAST_32: "Round of 32",
  LAST_16: "Round of 16",
  QUARTER_FINALS: "Quarterfinal",
  SEMI_FINALS: "Semifinal",
  THIRD_PLACE: "Third Place Playoff",
  FINAL: "Final",
};

export function stageLabel(stage: string, group: string | null): string {
  if (stage === "GROUP_STAGE") {
    const letter = groupLetterFromLabel(group);
    return letter ? `Group ${letter}` : "Group Stage";
  }
  return STAGE_LABELS[stage] ?? stage;
}

const STATUS_MAP: Record<RawMatchStatus, MatchStatus> = {
  SCHEDULED: "upcoming",
  TIMED: "upcoming",
  IN_PLAY: "live",
  PAUSED: "live",
  FINISHED: "completed",
  POSTPONED: "upcoming",
  SUSPENDED: "live",
  CANCELLED: "completed",
};

export function mapTeam(raw: RawTeam, group: string | null): Team {
  // Future knockout-stage matches whose participants aren't decided yet come
  // back as a team object with every field null ("Winner of Match X").
  const name = raw.name ?? "TBD";
  return {
    id: String(raw.id),
    name,
    shortName: raw.shortName ?? name,
    tla: raw.tla ?? name.slice(0, 3).toUpperCase(),
    crest: raw.crest ?? null,
    group,
  };
}

export function mapStandingRow(row: RawStandingRow): Omit<GroupStanding, "status"> {
  return {
    teamId: String(row.team.id),
    position: row.position,
    played: row.playedGames,
    won: row.won,
    drawn: row.draw,
    lost: row.lost,
    goalsFor: row.goalsFor,
    goalsAgainst: row.goalsAgainst,
    points: row.points,
  };
}

/** Qualification is only meaningful once the group has played out. */
export function deriveStanding(
  row: Omit<GroupStanding, "status">,
  groupSize: number
): GroupStanding {
  const groupComplete = row.played >= groupSize - 1;
  const status: GroupStanding["status"] = !groupComplete
    ? "In contention"
    : row.position <= 2
      ? "Qualified"
      : "Eliminated";
  return { ...row, status };
}

export function mapScorer(raw: RawScorer): Scorer {
  return {
    playerId: String(raw.player.id),
    playerName: raw.player.name,
    nationality: raw.player.nationality,
    teamId: String(raw.team.id),
    goals: raw.goals,
    assists: raw.assists,
    playedMatches: raw.playedMatches,
  };
}

export function mapMatch(raw: RawMatch): Match {
  const groupLetter = groupLetterFromLabel(raw.group);
  return {
    id: String(raw.id),
    stage: stageLabel(raw.stage, raw.group),
    group: groupLetter,
    homeTeamId: raw.homeTeam?.id != null ? String(raw.homeTeam.id) : null,
    awayTeamId: raw.awayTeam?.id != null ? String(raw.awayTeam.id) : null,
    homeScore: raw.score.fullTime.home,
    awayScore: raw.score.fullTime.away,
    halftimeHomeScore: raw.score.halfTime.home,
    halftimeAwayScore: raw.score.halfTime.away,
    status: STATUS_MAP[raw.status] ?? "upcoming",
    kickoff: raw.utcDate,
    minute: null, // not exposed on the free tier
    referee: raw.referees?.find((r) => r.type === "REFEREE")?.name ?? null,
  };
}
