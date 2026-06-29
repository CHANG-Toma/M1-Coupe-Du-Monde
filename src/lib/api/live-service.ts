import type { Match } from "@/lib/types";
import { canUseWorldCup2026Live } from "@/lib/sync/sync-config";

export function canUseLiveApi(): boolean {
  return canUseWorldCup2026Live();
}

export async function getLiveMatchesFromApi(): Promise<Match[]> {
  const { getLiveMatchesFromWorldCup2026 } = await import(
    "@/lib/api/worldcup2026-client"
  );
  return getLiveMatchesFromWorldCup2026();
}

export async function getMatchByIdFromApi(id: string): Promise<Match | null> {
  const { getMatchByIdFromWorldCup2026 } = await import(
    "@/lib/api/worldcup2026-client"
  );
  return getMatchByIdFromWorldCup2026(id);
}
