import type { Match, TypePhase } from "@/types";

export const BRACKET_SLOT_PX_MOBILE = 82;
export const BRACKET_SLOT_PX_DESKTOP = 98;

/** Paires de seizièmes groupées comme sur le tableau FIFA (feeder adjacents). */
export const BRACKET_R32_PAIRS: { parent: number; feeders: [number, number] }[] = [
  { parent: 90, feeders: [73, 75] },
  { parent: 89, feeders: [74, 77] },
  { parent: 91, feeders: [76, 78] },
  { parent: 92, feeders: [79, 80] },
  { parent: 94, feeders: [81, 82] },
  { parent: 93, feeders: [83, 84] },
  { parent: 96, feeders: [85, 87] },
  { parent: 95, feeders: [86, 88] },
];

/**
 * Tableau officiel CDM 2026 — lien entre chaque match et ses 2 matchs sources.
 * Ex. M91 (Brésil) ← M76 (Brésil–Japon) + M78 (CIV–Norvège), pas les matchs adjacents.
 */
export const KNOCKOUT_FEEDS: Record<number, [number, number]> = {
  89: [74, 77],
  90: [73, 75],
  91: [76, 78],
  92: [79, 80],
  93: [83, 84],
  94: [81, 82],
  95: [86, 88],
  96: [85, 87],
  97: [89, 90],
  98: [93, 94],
  99: [91, 92],
  100: [95, 96],
  101: [97, 98],
  102: [99, 100],
  103: [101, 102],
  104: [101, 102],
};

export const KNOCKOUT_ROUNDS: {
  type: TypePhase;
  ids: [number, number];
  label: string;
  short: string;
}[] = [
  { type: "seizieme", ids: [73, 88], label: "Seizièmes", short: "1/16" },
  { type: "huitieme", ids: [89, 96], label: "Huitièmes", short: "1/8" },
  { type: "quart", ids: [97, 100], label: "Quarts", short: "1/4" },
  { type: "demi", ids: [101, 102], label: "Demis", short: "1/2" },
  { type: "finale", ids: [104, 104], label: "Finale", short: "🏆" },
];

const R32_FIRST = 73;
const R32_LAST = 88;

export function sortKnockoutMatches(matches: Match[]): Match[] {
  return [...matches].sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));
}

/** Tri visuel haut → bas selon la position dans l'arbre (évite la confusion avec l'ordre des IDs). */
export function sortMatchesByBracketY(
  matches: Match[],
  positions: Map<number, number>
): Match[] {
  return [...matches].sort((a, b) => {
    const ya = positions.get(parseInt(a.id, 10)) ?? 0;
    const yb = positions.get(parseInt(b.id, 10)) ?? 0;
    return ya - yb || parseInt(a.id, 10) - parseInt(b.id, 10);
  });
}

/** Matchs liés (sources + descendants directs) pour la surbrillance au survol. */
export function getRelatedMatchIds(matchId: number): Set<number> {
  const related = new Set<number>([matchId]);
  const feeders = KNOCKOUT_FEEDS[matchId];
  if (feeders) {
    related.add(feeders[0]);
    related.add(feeders[1]);
  }
  for (const [childId, [a, b]] of Object.entries(KNOCKOUT_FEEDS)) {
    if (a === matchId || b === matchId) {
      related.add(parseInt(childId, 10));
    }
  }
  return related;
}

export function isKnockoutMatchFinished(match: Match): boolean {
  return match.statut === "termine";
}

export function computeBracketPositions(
  matches: Match[],
  slotPx = BRACKET_SLOT_PX_MOBILE
): Map<number, number> {
  const byId = new Map(matches.map((m) => [parseInt(m.id, 10), m]));
  const pos = new Map<number, number>();

  BRACKET_R32_PAIRS.forEach((pair, pairIndex) => {
    pair.feeders.forEach((id, slot) => {
      if (byId.has(id)) {
        pos.set(id, (pairIndex * 2 + slot + 0.5) * slotPx);
      }
    });
  });

  const derivedIds = Object.keys(KNOCKOUT_FEEDS)
    .map(Number)
    .filter((id) => id >= 89 && id !== 103)
    .sort((a, b) => a - b);

  for (const id of derivedIds) {
    const feeders = KNOCKOUT_FEEDS[id];
    const y1 = pos.get(feeders[0]);
    const y2 = pos.get(feeders[1]);
    if (y1 !== undefined && y2 !== undefined) {
      pos.set(id, (y1 + y2) / 2);
    }
  }

  return pos;
}

export function getPairBandBounds(
  feeders: [number, number],
  positions: Map<number, number>,
  slotPx: number
): { top: number; height: number } | null {
  const y1 = positions.get(feeders[0]);
  const y2 = positions.get(feeders[1]);
  if (y1 === undefined || y2 === undefined) return null;
  const pad = slotPx * 0.42;
  const top = Math.min(y1, y2) - pad;
  const height = Math.abs(y2 - y1) + pad * 2;
  return { top, height };
}

export function getBracketTreeHeight(slotPx = BRACKET_SLOT_PX_MOBILE): number {
  return (R32_LAST - R32_FIRST + 1) * slotPx;
}

export function matchesForRound(matches: Match[], type: TypePhase): Match[] {
  const round = KNOCKOUT_ROUNDS.find((r) => r.type === type);
  if (!round) return [];
  return sortKnockoutMatches(
    matches.filter((m) => {
      const id = parseInt(m.id, 10);
      return m.phase.type === type && id >= round.ids[0] && id <= round.ids[1];
    })
  );
}
