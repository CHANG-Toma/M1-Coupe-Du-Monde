import type { Match, FiltresMatchs, TypePhase } from "@/lib/types";
import { MOCK_MATCHES } from "@/data/mock-matches";
import { normalizeCountryCode } from "@/lib/utils/country-code";

// Imports DB en dynamique — évite que pg crashe l'initialisation du module
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
  process.env.USE_MOCK_DATA === "true" || !process.env.API_FOOTBALL_KEY?.trim();

const API_HEADERS = () => ({
  "x-apisports-key": process.env.API_FOOTBALL_KEY!.trim(),
});

/** Pas de cache Next.js — données fraîches à chaque requête (live) */
const NO_CACHE = { cache: "no-store" as const };

// ─── Service matchs — stratégie : API → DB → Mock ────────────────────────────

export async function getMatches(filtres?: FiltresMatchs): Promise<Match[]> {
  if (USE_MOCK) {
    return getMockMatches(filtres);
  }

  try {
    return await getApiMatches(filtres);
  } catch (apiErr) {
    console.warn("[match-service] API indisponible, tentative DB:", (apiErr as Error).message);
  }

  const db = await tryDb();
  if (db) {
    try {
      console.info("[match-service] Utilisation de la base de données.");
      return await db.getMatchesFromDb(filtres);
    } catch (dbErr) {
      console.warn("[match-service] DB indisponible, fallback mock:", (dbErr as Error).message);
    }
  }

  console.warn("[match-service] Fallback données mockées.");
  return getMockMatches(filtres);
}

export async function getMatchById(id: string): Promise<Match | null> {
  if (USE_MOCK) {
    const match = MOCK_MATCHES.find((m) => m.id === id) ?? null;
    return match ? hydrateLiveMatch(match) : null;
  }

  try {
    return await getApiMatchById(id);
  } catch {
    // fallback DB
  }

  const db = await tryDb();
  if (db) {
    try {
      const match = await db.getMatchByIdFromDb(id);
      if (match) return match;
    } catch {
      // fallback mock
    }
  }

  const match = MOCK_MATCHES.find((m) => m.id === id) ?? null;
  return match ? hydrateLiveMatch(match) : null;
}

export function isUsingMockData(): boolean {
  return USE_MOCK;
}

// ─── Données mockées ─────────────────────────────────────────────────────────

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

// ─── Appel API réel ───────────────────────────────────────────────────────────

async function getApiMatches(filtres?: FiltresMatchs): Promise<Match[]> {
  const baseUrl = process.env.API_FOOTBALL_BASE_URL;

  // Endpoint optimisé pour les matchs en cours
  if (filtres?.live) {
    const params = new URLSearchParams({
      league: "1",
      season: "2026",
      status: "1H-HT-2H-ET-BT-P",
    });
    const res = await fetch(`${baseUrl}/fixtures?${params}`, {
      headers: API_HEADERS(),
      ...NO_CACHE,
    });
    if (!res.ok) throw new Error(`Erreur API Football (live): ${res.status}`);
    const json = await res.json();
    if (json.errors && Object.keys(json.errors).length > 0) {
      throw new Error(JSON.stringify(json.errors));
    }
    return (json.response ?? []).map(mapApiFixtureToMatch);
  }

  const params = new URLSearchParams({
    league: "1",
    season: "2026",
  });

  const res = await fetch(`${baseUrl}/fixtures?${params}`, {
    headers: API_HEADERS(),
    ...NO_CACHE,
  });

  if (!res.ok) {
    throw new Error(`Erreur API Football: ${res.status}`);
  }

  const json = await res.json();
  if (json.errors && Object.keys(json.errors).length > 0) {
    throw new Error(JSON.stringify(json.errors));
  }

  let matchs: Match[] = (json.response ?? []).map(mapApiFixtureToMatch);

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

async function getApiMatchById(id: string): Promise<Match | null> {
  const baseUrl = process.env.API_FOOTBALL_BASE_URL;

  const res = await fetch(`${baseUrl}/fixtures?id=${id}`, {
    headers: API_HEADERS(),
    ...NO_CACHE,
  });

  if (!res.ok) return null;

  const json = await res.json();
  const fixture = json.response?.[0];
  return fixture ? mapApiFixtureToMatch(fixture) : null;
}

// ─── Mapping API → type interne ───────────────────────────────────────────────

function phaseToApiRound(phase: TypePhase): string {
  const map: Record<TypePhase, string> = {
    groupes: "Group Stage",
    seizieme: "Round of 32",
    huitieme: "Round of 16",
    quart: "Quarter-finals",
    demi: "Semi-finals",
    petite_finale: "3rd Place Final",
    finale: "Final",
  };
  return map[phase];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiFixtureToMatch(f: any): Match {
  const statut = mapApiStatus(f.fixture.status.short);
  const round: string = f.league?.round ?? "";
  const groupeLettre = extractGroupeLettre(round);

  return {
    id: String(f.fixture.id),
    dateHeure: f.fixture.date,
    statut,
    scoreDomicile: f.goals?.home ?? 0,
    scoreExterieur: f.goals?.away ?? 0,
    equipeDomicile: {
      id: String(f.teams.home.id),
      nom: f.teams.home.name,
      codePays: normalizeCountryCode(f.teams.home.code ?? ""),
      logoUrl: f.teams.home.logo,
    },
    equipeExterieur: {
      id: String(f.teams.away.id),
      nom: f.teams.away.name,
      codePays: normalizeCountryCode(f.teams.away.code ?? ""),
      logoUrl: f.teams.away.logo,
    },
    phase: {
      id: round,
      nom: round,
      type: mapApiRoundToPhase(round),
      ordre: 1,
    },
    stade: f.fixture.venue?.name
      ? {
          id: String(f.fixture.venue.id ?? f.fixture.venue.name),
          nom: f.fixture.venue.name,
          ville: f.fixture.venue.city,
        }
      : undefined,
    groupe: groupeLettre ? { id: groupeLettre, lettre: groupeLettre } : undefined,
    minuteJeu: f.fixture.status.elapsed ?? undefined,
  };
}

function extractGroupeLettre(round: string): string | undefined {
  const match = round.match(/Group\s+([A-L])/i);
  return match ? match[1].toUpperCase() : undefined;
}

function mapApiStatus(short: string): Match["statut"] {
  if (["1H", "HT", "2H", "ET", "BT", "P", "LIVE"].includes(short)) return "en_cours";
  if (["FT", "AET", "PEN"].includes(short)) return "termine";
  return "a_venir";
}

function mapApiRoundToPhase(round: string): TypePhase {
  if (round.includes("Group")) return "groupes";
  if (round.includes("32")) return "seizieme";
  if (round.includes("16")) return "huitieme";
  if (round.includes("Quarter")) return "quart";
  if (round.includes("Semi")) return "demi";
  if (round.includes("3rd")) return "petite_finale";
  if (round.includes("Final")) return "finale";
  return "groupes";
}

// Export conservé pour compatibilité interne
export { phaseToApiRound };
