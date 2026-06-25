import type { Match, FiltresMatchs, TypePhase } from "@/lib/types";
import { MOCK_MATCHES } from "@/data/mock-matches";
import { isDbAvailable } from "@/lib/db/client";
import { getMatchesFromDb, getMatchByIdFromDb } from "@/lib/db/db-match-service";

const USE_MOCK = process.env.USE_MOCK_DATA === "true" || !process.env.API_FOOTBALL_KEY;

// ─── Service matchs — stratégie : API → DB → Mock ────────────────────────────

export async function getMatches(filtres?: FiltresMatchs): Promise<Match[]> {
  // 1. Données mockées forcées (développement sans clé API)
  if (USE_MOCK) {
    return getMockMatches(filtres);
  }

  // 2. API externe
  try {
    return await getApiMatches(filtres);
  } catch (apiErr) {
    console.warn("[match-service] API indisponible, tentative DB:", (apiErr as Error).message);
  }

  // 3. Fallback base de données PostgreSQL
  if (await isDbAvailable()) {
    try {
      console.info("[match-service] Utilisation de la base de données.");
      return await getMatchesFromDb(filtres);
    } catch (dbErr) {
      console.warn("[match-service] DB indisponible, fallback mock:", (dbErr as Error).message);
    }
  }

  // 4. Dernier recours : données mockées
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

  if (await isDbAvailable()) {
    try {
      return await getMatchByIdFromDb(id);
    } catch {
      // fallback mock
    }
  }

  const match = MOCK_MATCHES.find((m) => m.id === id) ?? null;
  return match ? hydrateLiveMatch(match) : null;
}

// ─── Données mockées ─────────────────────────────────────────────────────────

/**
 * Pour les matchs en cours, on calcule dynamiquement :
 * - minuteJeu  : basé sur l'heure actuelle - dateHeure du match
 * - statut     : passe automatiquement à "termine" après 105 min (90 + arrêts de jeu)
 * - scores     : évolue de façon déterministe selon la minute (simulation réaliste)
 */
function hydrateLiveMatch(match: Match): Match {
  if (match.statut !== "en_cours") return match;

  const now = Date.now();
  const start = new Date(match.dateHeure).getTime();
  const elapsedMs = now - start;
  const elapsedMin = Math.floor(elapsedMs / 60_000);

  // Match terminé automatiquement après 105 min
  if (elapsedMin >= 105) {
    return { ...match, statut: "termine", minuteJeu: undefined };
  }

  // Minute réelle (1ère mi-temps: 1-45, pause, 2ème mi-temps: 46-90+)
  const minuteJeu = Math.max(1, Math.min(elapsedMin, 90));

  // Simulation déterministe des buts : un but toutes les ~25 min par équipe
  // basé sur les seeds des ids (stable entre les appels)
  const seed = match.id.charCodeAt(match.id.length - 1);
  const butsDom = Math.floor(elapsedMin / (28 + (seed % 10)));
  const butsExt = Math.floor(elapsedMin / (35 + (seed % 8)));

  return {
    ...match,
    minuteJeu,
    scoreDomicile: Math.min(butsDom, 5),
    scoreExterieur: Math.min(butsExt, 4),
  };
}

function getMockMatches(filtres?: FiltresMatchs): Match[] {
  let matchs = MOCK_MATCHES.map(hydrateLiveMatch);

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
  const apiKey = process.env.API_FOOTBALL_KEY;

  const params = new URLSearchParams({
    league: "1", // ID Coupe du Monde FIFA sur API-Football
    season: "2026",
  });

  if (filtres?.phase) {
    params.set("round", phaseToApiRound(filtres.phase));
  }

  const res = await fetch(`${baseUrl}/fixtures?${params}`, {
    headers: { "x-apisports-key": apiKey! },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Erreur API Football: ${res.status}`);
  }

  const json = await res.json();
  return (json.response ?? []).map(mapApiFixtureToMatch);
}

async function getApiMatchById(id: string): Promise<Match | null> {
  const baseUrl = process.env.API_FOOTBALL_BASE_URL;
  const apiKey = process.env.API_FOOTBALL_KEY;

  const res = await fetch(`${baseUrl}/fixtures?id=${id}`, {
    headers: { "x-apisports-key": apiKey! },
    next: { revalidate: 30 },
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
  return {
    id: String(f.fixture.id),
    dateHeure: f.fixture.date,
    statut,
    scoreDomicile: f.goals?.home ?? 0,
    scoreExterieur: f.goals?.away ?? 0,
    equipeDomicile: {
      id: String(f.teams.home.id),
      nom: f.teams.home.name,
      codePays: f.teams.home.code?.toLowerCase() ?? "",
      logoUrl: f.teams.home.logo,
    },
    equipeExterieur: {
      id: String(f.teams.away.id),
      nom: f.teams.away.name,
      codePays: f.teams.away.code?.toLowerCase() ?? "",
      logoUrl: f.teams.away.logo,
    },
    phase: {
      id: f.league.round,
      nom: f.league.round,
      type: mapApiRoundToPhase(f.league.round),
      ordre: 1,
    },
    stade: f.fixture.venue?.id
      ? {
          id: String(f.fixture.venue.id),
          nom: f.fixture.venue.name,
          ville: f.fixture.venue.city,
        }
      : undefined,
    minuteJeu: f.fixture.status.elapsed ?? undefined,
  };
}

function mapApiStatus(short: string): Match["statut"] {
  if (["1H", "HT", "2H", "ET", "BT", "P"].includes(short)) return "en_cours";
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
