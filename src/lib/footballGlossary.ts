export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface GlossaryCategory {
  category: string;
  icon: string;
  terms: GlossaryTerm[];
}

export const glossary: GlossaryCategory[] = [
  {
    category: "Match Structure",
    icon: "⏱️",
    terms: [
      {
        term: "90 minutes",
        definition:
          "A match is two 45-minute halves. The clock doesn't stop for throw-ins or fouls — instead the referee adds \"stoppage time\" at the end of each half to make up for it.",
      },
      {
        term: "Stoppage time",
        definition:
          "Extra minutes added to the end of each half (shown as \"90+3'\" etc.) to cover time lost to injuries, substitutions, and delays. Also called injury time or added time.",
      },
      {
        term: "Extra time",
        definition:
          "In knockout matches that are tied after 90 minutes, two more 15-minute periods are played to try to find a winner before it goes to penalties.",
      },
      {
        term: "Penalty shootout",
        definition:
          "If a knockout match is still tied after extra time, each team takes turns shooting from the penalty spot until a winner is decided. Doesn't count as a \"goal\" in a player's season tally.",
      },
      {
        term: "Clean sheet",
        definition: "When a team doesn't concede a single goal in a match — the goalkeeper's stat of pride.",
      },
      {
        term: "Kickoff",
        definition: "The moment a match starts (or restarts after a goal), with a pass from the center circle.",
      },
    ],
  },
  {
    category: "Scoring & Attacking",
    icon: "⚽",
    terms: [
      {
        term: "Goal difference (GD)",
        definition:
          "Goals scored minus goals conceded. Used as the first tiebreaker when teams are level on points in the standings.",
      },
      {
        term: "Hat-trick",
        definition: "Three goals scored by the same player in a single match.",
      },
      {
        term: "Assist",
        definition: "The pass (or other action) that directly sets up a goal for a teammate.",
      },
      {
        term: "Golden Boot",
        definition: "The award given to the tournament's top goalscorer.",
      },
      {
        term: "Own goal",
        definition: "When a player accidentally scores into their own net — credited to the opposing team.",
      },
      {
        term: "Nutmeg",
        definition: "Slipping the ball through an opponent's legs — more about embarrassing them than tactics.",
      },
    ],
  },
  {
    category: "Fouls & Officiating",
    icon: "🟨",
    terms: [
      {
        term: "Offside",
        definition:
          "An attacker is offside if they're nearer the opponent's goal line than both the ball and the second-last defender when the ball is played to them. The most argued-about rule in football.",
      },
      {
        term: "Free kick",
        definition:
          "Awarded after a foul. A \"direct\" free kick can be shot straight into the goal; an \"indirect\" one must touch another player first.",
      },
      {
        term: "Penalty kick",
        definition:
          "A free shot from 12 yards (the penalty spot) against just the goalkeeper, awarded for a foul committed inside the defending team's penalty area.",
      },
      {
        term: "Yellow card",
        definition:
          "A caution for a reckless foul or unsporting behavior. Two yellows in the same match equal a red card and an ejection.",
      },
      {
        term: "Red card",
        definition:
          "Immediate ejection from the match for a serious foul or violent conduct. The player's team continues with one fewer player for the rest of the game.",
      },
      {
        term: "VAR",
        definition:
          "Video Assistant Referee — off-field officials who review replays for clear errors on goals, penalties, red cards, and mistaken identity.",
      },
    ],
  },
  {
    category: "Tournament Slang",
    icon: "🏆",
    terms: [
      {
        term: "Derby",
        definition: "A match between two rival teams, often from the same city or region — extra intensity guaranteed.",
      },
      {
        term: "Upset",
        definition: "A result where the underdog beats a much higher-ranked or favored team.",
      },
      {
        term: "Dark horse",
        definition: "A team nobody's talking about that has a real chance of going deep in the tournament.",
      },
      {
        term: "Group of Death",
        definition: "A group stacked with strong teams, where even a good team could fail to advance.",
      },
      {
        term: "Squad rotation",
        definition: "Resting key players by swapping in substitutes, usually once a team has already qualified.",
      },
    ],
  },
];
