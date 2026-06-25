// ─── Statut d'un match ───────────────────────────────────────────────────────

export type StatutMatch = "a_venir" | "en_cours" | "termine";

// ─── Entités métier ───────────────────────────────────────────────────────────

export interface Equipe {
  id: string;
  nom: string;
  codePays: string;
  logoUrl?: string;
}

export interface Stade {
  id: string;
  nom: string;
  ville?: string;
}

export interface Phase {
  id: string;
  nom: string;
  type: TypePhase;
  ordre: number;
}

export type TypePhase =
  | "groupes"
  | "seizieme"
  | "huitieme"
  | "quart"
  | "demi"
  | "petite_finale"
  | "finale";

export interface Groupe {
  id: string;
  lettre: string;
}

export interface Match {
  id: string;
  dateHeure: string; // ISO 8601
  statut: StatutMatch;
  scoreDomicile: number;
  scoreExterieur: number;
  equipeDomicile: Equipe;
  equipeExterieur: Equipe;
  phase: Phase;
  stade?: Stade;
  groupe?: Groupe;
  minuteJeu?: number;
}

export interface LigneClassement {
  equipe: Equipe;
  groupe: Groupe;
  points: number;
  matchsJoues: number;
  victoires: number;
  nuls: number;
  defaites: number;
  butsPour: number;
  butsContre: number;
  differenceButs: number;
}

// ─── Réponses API ─────────────────────────────────────────────────────────────

export interface ApiMatchesResponse {
  data: Match[];
  total: number;
}

export interface ApiStandingsResponse {
  data: GroupeClassement[];
}

export interface GroupeClassement {
  groupe: Groupe;
  classement: LigneClassement[];
}

// ─── Paramètres de filtrage ───────────────────────────────────────────────────

export interface FiltresMatchs {
  phase?: TypePhase;
  equipeId?: string;
}

// ─── Constantes phases ────────────────────────────────────────────────────────

export const PHASES: Phase[] = [
  { id: "1", nom: "Phase de groupes", type: "groupes", ordre: 1 },
  { id: "2", nom: "Seizièmes de finale", type: "seizieme", ordre: 2 },
  { id: "3", nom: "Huitièmes de finale", type: "huitieme", ordre: 3 },
  { id: "4", nom: "Quarts de finale", type: "quart", ordre: 4 },
  { id: "5", nom: "Demi-finales", type: "demi", ordre: 5 },
  { id: "6", nom: "Petite finale", type: "petite_finale", ordre: 6 },
  { id: "7", nom: "Finale", type: "finale", ordre: 7 },
];
