import type { Match } from "@/lib/types";
import {
  buildTeamMap,
  isWorldCupGameLive,
  mapGameToMatch,
  type WcGame,
  type WcStadium,
  type WcTeam,
} from "@/lib/api/worldcup2026-mapper";

const BASE_URL = process.env.WORLDCUP2026_API_URL ?? "https://worldcup26.ir";

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    throw new Error(`WorldCup2026 API HTTP ${res.status} (${path})`);
  }
  return res.json() as Promise<T>;
}

export async function fetchTeams(): Promise<WcTeam[]> {
  const data = await fetchJson<WcTeam[] | { teams?: WcTeam[] }>("/get/teams");
  return Array.isArray(data) ? data : (data.teams ?? []);
}

export async function fetchStadiums(): Promise<WcStadium[]> {
  const data = await fetchJson<WcStadium[] | { stadiums?: WcStadium[] }>(
    "/get/stadiums"
  );
  return Array.isArray(data) ? data : (data.stadiums ?? []);
}

export async function fetchGames(): Promise<WcGame[]> {
  const data = await fetchJson<{ games?: WcGame[] }>("/get/games");
  return data.games ?? [];
}

export async function fetchGameById(id: string): Promise<WcGame | null> {
  const data = await fetchJson<{ game?: WcGame } | WcGame>(`/get/game/${id}`);
  const game = "game" in data && data.game ? data.game : (data as WcGame);
  return game?.id ? game : null;
}

function buildStadiumMap(stadiums: WcStadium[]): Map<string, WcStadium> {
  return new Map(stadiums.map((s) => [String(s.id), s]));
}

export async function getLiveMatchesFromWorldCup2026(): Promise<Match[]> {
  const [games, teams, stadiums] = await Promise.all([
    fetchGames(),
    fetchTeams(),
    fetchStadiums(),
  ]);

  const teamsById = buildTeamMap(teams);
  const stadiumsById = buildStadiumMap(stadiums);

  return games
    .filter(isWorldCupGameLive)
    .map((game) => mapGameToMatch(game, teamsById, stadiumsById))
    .filter((m): m is Match => m !== null)
    .sort(
      (a, b) => new Date(a.dateHeure).getTime() - new Date(b.dateHeure).getTime()
    );
}

export async function getMatchByIdFromWorldCup2026(
  id: string
): Promise<Match | null> {
  const [game, teams, stadiums] = await Promise.all([
    fetchGameById(id),
    fetchTeams(),
    fetchStadiums(),
  ]);

  if (!game) return null;

  return mapGameToMatch(game, buildTeamMap(teams), buildStadiumMap(stadiums));
}
