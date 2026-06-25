import type { Match, FiltresMatchs, TypePhase } from "@/lib/types";
import { MOCK_MATCHES } from "@/data/mock-matches";

const USE_MOCK = process.env.USE_MOCK_DATA === "true" || !process.env.API_FOOTBALL_KEY;

// ─── Service matchs ───────────────────────────────────────────────────────────

export async function getMatches(filtres?: FiltresMatchs): Promise<Match[]> {
  if (USE_MOCK) {
    return getMockMatches(filtres);
  }
  return getApiMatches(filtres);
}

export async function getMatchById(id: string): Promise<Match | null> {
  if (USE_MOCK) {
    return MOCK_MATCHES.find((m) => m.id === id) ?? null;
  }
  return getApiMatchById(id);
}

// ─── Données mockées ─────────────────────────────────────────────────────────

function getMockMatches(filtres?: FiltresMatchs): Match[] {
  let matchs = [...MOCK_MATCHES];

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
