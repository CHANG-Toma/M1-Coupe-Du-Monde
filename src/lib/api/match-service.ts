import type { Match, FiltresMatchs } from "@/lib/types";
import { MOCK_MATCHES } from "@/data/mock-matches";
import { maybeTriggerSync } from "@/lib/sync/sync-scheduler";
import {
  canUseLiveApi,
  getLiveMatchesFromApi,
  getMatchByIdFromApi,
} from "@/lib/api/live-service";
import { hasExternalDataSource } from "@/lib/sync/sync-config";

export type MatchDataSource = "mock" | "db" | "api";

async function tryDb() {
  try {
    const { isDbAvailable } = await import("@/lib/db/client");
    if (!(await isDbAvailable())) return null;
    return await import("@/lib/db/db-match-service");
  } catch {
    return null;
  }
}

const USE_MOCK =
  process.env.USE_MOCK_DATA === "true" ||
  (!process.env.DATABASE_URL && !hasExternalDataSource());

export async function getMatches(filtres?: FiltresMatchs): Promise<Match[]> {
  if (USE_MOCK) {
    return getMockMatches(filtres);
  }

  if (filtres?.live) {
    return getLiveMatches(filtres);
  }

  return getMatchesFromDbOrMock(filtres);
}

export async function getMatchById(id: string): Promise<Match | null> {
  const { match } = await getMatchByIdWithSource(id);
  return match;
}

export async function getMatchByIdWithSource(
  id: string
): Promise<{ match: Match | null; source: MatchDataSource }> {
  if (USE_MOCK) {
    const match = MOCK_MATCHES.find((m) => m.id === id) ?? null;
    return {
      match: match ? hydrateLiveMatch(match) : null,
      source: "mock",
    };
  }

  const db = await tryDb();
  let dbMatch: Match | null = null;
  if (db) {
    try {
      dbMatch = await db.getMatchByIdFromDb(id);
    } catch {
    }
  }

  if (canUseLiveApi()) {
    try {
      const live = await getMatchByIdFromApi(id);
      if (live?.statut === "en_cours") return { match: live, source: "api" };
    } catch (err) {
      console.warn("[match-service] API live (détail) indisponible:", (err as Error).message);
    }
  }

  if (dbMatch) {
    return { match: dbMatch, source: "db" };
  }

  await maybeTriggerSync();

  if (db) {
    try {
      const refreshed = await db.getMatchByIdFromDb(id);
      if (refreshed) {
        if (canUseLiveApi()) {
          try {
            const live = await getMatchByIdFromApi(id);
            if (live?.statut === "en_cours") return { match: live, source: "api" };
          } catch {
          }
        }
        return { match: refreshed, source: "db" };
      }
    } catch {
    }
  }

  const mock = MOCK_MATCHES.find((m) => m.id === id) ?? null;
  return {
    match: mock ? hydrateLiveMatch(mock) : null,
    source: mock ? "mock" : "db",
  };
}

export function resolveMatchesSource(filtres?: FiltresMatchs): MatchDataSource {
  if (USE_MOCK) return "mock";
  if (filtres?.live && canUseLiveApi()) return "api";
  return "db";
}

export function isUsingMockData(): boolean {
  return USE_MOCK;
}

export function getDataSource(filtres?: FiltresMatchs): MatchDataSource {
  return resolveMatchesSource(filtres);
}

async function getLiveMatches(filtres?: FiltresMatchs): Promise<Match[]> {
  await maybeTriggerSync();

  if (canUseLiveApi()) {
    try {
      return await getLiveMatchesFromApi();
    } catch (err) {
      console.warn("[match-service] API live indisponible, fallback DB:", (err as Error).message);
    }
  }

  const db = await tryDb();
  if (db) {
    try {
      return await db.getMatchesFromDb({ live: true, ...filtres });
    } catch (dbErr) {
      console.warn("[match-service] DB live indisponible:", (dbErr as Error).message);
    }
  }

  if (USE_MOCK) return getMockMatches({ live: true });
  return [];
}

async function getMatchesFromDbOrMock(filtres?: FiltresMatchs): Promise<Match[]> {
  await maybeTriggerSync();

  const db = await tryDb();
  if (db) {
    try {
      const matches = await db.getMatchesFromDb(filtres);
      if (matches.length > 0) return matches;
    } catch (dbErr) {
      console.warn("[match-service] DB indisponible:", (dbErr as Error).message);
    }
  }

  console.warn("[match-service] Fallback données mockées.");
  return getMockMatches(filtres);
}

function hydrateLiveMatch(match: Match): Match {
  if (match.statut !== "en_cours") return match;

  const nowMs = Date.now();
  const todayUTC = new Date();
  todayUTC.setUTCHours(0, 0, 0, 0);

  const KICKOFF_UTC_MIN: Record<string, number> = {
    m011: 13 * 60 + 43,
    m012: 13 * 60 + 53,
  };
  const kickoffMin = KICKOFF_UTC_MIN[match.id] ?? 13 * 60 + 30;
  const kickoffMs = todayUTC.getTime() + kickoffMin * 60_000;

  const elapsedMin = Math.floor((nowMs - kickoffMs) / 60_000);
  const minuteJeu = (((elapsedMin % 90) + 90) % 90) + 1;

  const seed = match.id.charCodeAt(match.id.length - 1);
  const butsDom = Math.floor(minuteJeu / (28 + (seed % 10)));
  const butsExt = Math.floor(minuteJeu / (35 + (seed % 8)));

  return {
    ...match,
    dateHeure: new Date(nowMs - minuteJeu * 60_000).toISOString(),
    minuteJeu,
    scoreDomicile: Math.min(butsDom, 5),
    scoreExterieur: Math.min(butsExt, 4),
  };
}

function getMockMatches(filtres?: FiltresMatchs): Match[] {
  let matchs = MOCK_MATCHES.map(hydrateLiveMatch);

  if (filtres?.live) {
    matchs = matchs.filter((m) => m.statut === "en_cours");
  }

  if (filtres?.phase) {
    matchs = matchs.filter((m) => m.phase.type === filtres.phase);
  }

  if (filtres?.equipeId) {
    matchs = matchs.filter(
      (m) =>
        m.equipeDomicile.id === filtres.equipeId ||
        m.equipeExterieur.id === filtres.equipeId
    );
  }

  return matchs.sort(
    (a, b) => new Date(a.dateHeure).getTime() - new Date(b.dateHeure).getTime()
  );
}
