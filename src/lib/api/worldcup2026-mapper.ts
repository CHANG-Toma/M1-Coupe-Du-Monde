import type { Match, StatutMatch, TypePhase } from "@/lib/types";
import { PHASES } from "@/lib/types";

export interface WcTeam {
  id: string;
  name_en: string;
  flag?: string;
  fifa_code?: string;
  iso2?: string;
  groups?: string;
}

export interface WcGame {
  id: string;
  home_team_id?: string;
  away_team_id?: string;
  home_team_name_en?: string;
  away_team_name_en?: string;
  home_team_label?: string;
  away_team_label?: string;
  home_score?: string;
  away_score?: string;
  group?: string;
  local_date?: string;
  stadium_id?: string;
  finished?: string;
  time_elapsed?: string;
  type?: string;
}

export interface WcStadium {
  id: string;
  name_en: string;
  city_en?: string;
}

const PHASE_BY_TYPE: Record<string, TypePhase> = {
  group: "groupes",
  r32: "seizieme",
  r16: "huitieme",
  qf: "quart",
  sf: "demi",
  third: "petite_finale",
  final: "finale",
};

export function isWorldCupGameLive(game: WcGame): boolean {
  if (game.finished === "TRUE") return false;
  const te = (game.time_elapsed ?? "").toLowerCase();
  return te !== "" && te !== "notstarted" && te !== "finished";
}

export function mapGameStatut(game: WcGame, catalogOnly = false): StatutMatch {
  if (game.finished === "TRUE") return "termine";
  if (!catalogOnly && isWorldCupGameLive(game)) return "en_cours";
  return "a_venir";
}

export function parseLocalDate(localDate?: string): string {
  if (!localDate) return new Date().toISOString();
  const m = localDate.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})/);
  if (!m) return new Date().toISOString();
  const [, mm, dd, yyyy, hh, min] = m;
  return new Date(
    `${yyyy}-${mm}-${dd}T${hh.padStart(2, "0")}:${min}:00.000Z`
  ).toISOString();
}

function parseMinute(timeElapsed?: string): number | undefined {
  if (!timeElapsed) return undefined;
  const te = timeElapsed.toLowerCase();
  if (te === "notstarted" || te === "finished") return undefined;
  const m = timeElapsed.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : undefined;
}

function mapPhaseType(type?: string): TypePhase {
  return PHASE_BY_TYPE[type ?? "group"] ?? "groupes";
}

function extractGroupeLettre(game: WcGame): string | undefined {
  if (game.type !== "group" || !game.group) return undefined;
  return /^[A-L]$/i.test(game.group) ? game.group.toUpperCase() : undefined;
}

function labelTeamId(label: string): number {
  let h = 5381;
  for (let i = 0; i < label.length; i++) h = (h * 33) ^ label.charCodeAt(i);
  return Math.abs(h) % 800_000 + 900_000;
}

function resolveTeam(
  game: WcGame,
  side: "home" | "away",
  teamsById: Map<string, WcTeam>
): { id: string; nom: string; codePays: string; logoUrl?: string } | null {
  const teamId = side === "home" ? game.home_team_id : game.away_team_id;
  const name = side === "home" ? game.home_team_name_en : game.away_team_name_en;
  const label = side === "home" ? game.home_team_label : game.away_team_label;

  if (teamId && teamId !== "0") {
    const team = teamsById.get(teamId);
    const nom = team?.name_en ?? name;
    if (!nom) return null;
    return {
      id: teamId,
      nom,
      codePays: teamCode(team),
      logoUrl: team?.flag,
    };
  }

  if (name) {
    return {
      id: String(labelTeamId(name)),
      nom: name,
      codePays: "un",
    };
  }

  if (label) {
    return {
      id: String(labelTeamId(label)),
      nom: label,
      codePays: "un",
    };
  }

  return null;
}

function teamCode(team?: WcTeam): string {
  if (!team) return "un";
  if (team.iso2) return team.iso2.toLowerCase();
  if (team.fifa_code) return team.fifa_code.slice(0, 2).toLowerCase();
  return "un";
}

export function buildTeamMap(teams: WcTeam[]): Map<string, WcTeam> {
  return new Map(teams.map((t) => [String(t.id), t]));
}

export function mapGameToMatch(
  game: WcGame,
  teamsById: Map<string, WcTeam>,
  stadiumsById?: Map<string, WcStadium>,
  catalogOnly = false
): Match | null {
  const domicile = resolveTeam(game, "home", teamsById);
  const exterieur = resolveTeam(game, "away", teamsById);
  if (!domicile || !exterieur) return null;

  const phaseType = mapPhaseType(game.type);
  const phase = PHASES.find((p) => p.type === phaseType) ?? PHASES[0];
  const groupeLettre = extractGroupeLettre(game);
  const stadium = game.stadium_id ? stadiumsById?.get(game.stadium_id) : undefined;

  return {
    id: String(game.id),
    dateHeure: parseLocalDate(game.local_date),
    statut: mapGameStatut(game, catalogOnly),
    scoreDomicile: parseInt(game.home_score ?? "0", 10) || 0,
    scoreExterieur: parseInt(game.away_score ?? "0", 10) || 0,
    minuteJeu: catalogOnly ? undefined : parseMinute(game.time_elapsed),
    equipeDomicile: {
      id: domicile.id,
      nom: domicile.nom,
      codePays: domicile.codePays,
      logoUrl: domicile.logoUrl,
    },
    equipeExterieur: {
      id: exterieur.id,
      nom: exterieur.nom,
      codePays: exterieur.codePays,
      logoUrl: exterieur.logoUrl,
    },
    phase: { ...phase },
    stade: stadium
      ? { id: stadium.id, nom: stadium.name_en, ville: stadium.city_en }
      : game.stadium_id
        ? { id: game.stadium_id, nom: `Stade ${game.stadium_id}` }
        : undefined,
    groupe: groupeLettre ? { id: groupeLettre, lettre: groupeLettre } : undefined,
  };
}
