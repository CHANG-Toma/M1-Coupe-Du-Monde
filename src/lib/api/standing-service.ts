import type { GroupeClassement } from "@/lib/types";
import { MOCK_STANDINGS } from "@/data/mock-standings";
import { isDbAvailable } from "@/lib/db/client";
import { getStandingsFromDb } from "@/lib/db/db-standing-service";

const USE_MOCK = process.env.USE_MOCK_DATA === "true" || !process.env.API_FOOTBALL_KEY;

export async function getStandings(): Promise<GroupeClassement[]> {
  if (USE_MOCK) return MOCK_STANDINGS;

  // API → DB → Mock
  try {
    return await getApiStandings();
  } catch {
    console.warn("[standing-service] API indisponible, tentative DB.");
  }

  if (await isDbAvailable()) {
    try {
      return await getStandingsFromDb();
    } catch {
      console.warn("[standing-service] DB indisponible, fallback mock.");
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

async function getApiStandings(): Promise<GroupeClassement[]> {
  const baseUrl = process.env.API_FOOTBALL_BASE_URL;
  const apiKey = process.env.API_FOOTBALL_KEY;

  const res = await fetch(`${baseUrl}/standings?league=1&season=2026`, {
    headers: { "x-apisports-key": apiKey! },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Erreur API Football standings: ${res.status}`);
  }

  const json = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groups: any[] = json.response?.[0]?.league?.standings ?? [];

  return groups.map(mapApiGroupToClassement);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiGroupToClassement(group: any[]): GroupeClassement {
  const lettre = group[0]?.group?.replace("Group ", "") ?? "?";
  const groupe = { id: lettre, lettre };

  return {
    groupe,
    classement: group.map((entry) => ({
      equipe: {
        id: String(entry.team.id),
        nom: entry.team.name,
        codePays: entry.team.code?.toLowerCase() ?? "",
        logoUrl: entry.team.logo,
      },
      groupe,
      points: entry.points,
      matchsJoues: entry.all.played,
      victoires: entry.all.win,
      nuls: entry.all.draw,
      defaites: entry.all.lose,
      butsPour: entry.all.goals.for,
      butsContre: entry.all.goals.against,
      differenceButs: entry.goalsDiff,
    })),
  };
}
