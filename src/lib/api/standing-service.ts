import type { GroupeClassement } from "@/lib/types";
import { MOCK_STANDINGS } from "@/data/mock-standings";
import { maybeTriggerSync } from "@/lib/sync/sync-scheduler";
import { hasExternalDataSource } from "@/lib/sync/sync-config";

async function tryDbStandings() {
  try {
    const { isDbAvailable } = await import("@/lib/db/client");
    if (!(await isDbAvailable())) return null;
    return await import("@/lib/db/db-standing-service");
  } catch {
    return null;
  }
}

const USE_MOCK =
  process.env.USE_MOCK_DATA === "true" ||
  (!process.env.DATABASE_URL && !hasExternalDataSource());

export async function getStandings(): Promise<GroupeClassement[]> {
  if (USE_MOCK) return MOCK_STANDINGS;

  await maybeTriggerSync();

  const db = await tryDbStandings();
  if (db) {
    try {
      const standings = await db.getStandingsFromDb();
      if (standings.length > 0) return standings;
    } catch {
      console.warn("[standing-service] DB indisponible.");
    }
  }

  return MOCK_STANDINGS;
}

export async function getStandingsByGroup(
  groupeLetttre: string
): Promise<GroupeClassement | null> {
  const standings = await getStandings();
  return standings.find((g) => g.groupe.lettre === groupeLetttre) ?? null;
}

export function getStandingsDataSource(): "mock" | "db" {
  return USE_MOCK ? "mock" : "db";
}
