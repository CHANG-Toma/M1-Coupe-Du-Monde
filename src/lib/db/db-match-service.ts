import { query } from "./client";
import type { Match, FiltresMatchs } from "@/lib/types";

// ─── Requêtes SQL ─────────────────────────────────────────────────────────────

const SELECT_MATCH = `
  SELECT
    m.id_match            AS id,
    m.date_heure          AS "dateHeure",
    m.statut,
    m.buts_domicile       AS "scoreDomicile",
    m.buts_exterieur      AS "scoreExterieur",
    m.minute_jeu          AS "minuteJeu",
    -- Équipe domicile
    ed.id_equipe          AS "domId",
    ed.nom                AS "domNom",
    ed.code_pays          AS "domCode",
    ed.logo_url           AS "domLogo",
    -- Équipe extérieur
    ee.id_equipe          AS "extId",
    ee.nom                AS "extNom",
    ee.code_pays          AS "extCode",
    ee.logo_url           AS "extLogo",
    -- Phase
    p.id_phase            AS "phaseId",
    p.nom                 AS "phaseNom",
    p.type                AS "phaseType",
    p.ordre               AS "phaseOrdre",
    -- Stade
    s.id_stade            AS "stadeId",
    s.nom                 AS "stadeNom",
    s.ville               AS "stadeVille",
    -- Groupe
    g.id_groupe           AS "groupeId",
    g.lettre              AS "groupeLettre"
  FROM match_cdm m
  JOIN equipe ed ON ed.id_equipe = m.id_equipe_domicile
  JOIN equipe ee ON ee.id_equipe = m.id_equipe_exterieur
  JOIN phase  p  ON p.id_phase   = m.id_phase
  LEFT JOIN stade  s ON s.id_stade  = m.id_stade
  LEFT JOIN groupe g ON g.id_groupe = m.id_groupe
`;

// ─── Mapping row → Match ──────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToMatch(r: any): Match {
  return {
    id: String(r.id),
    dateHeure: new Date(r.dateHeure).toISOString(),
    statut: r.statut,
    scoreDomicile: r.scoreDomicile ?? 0,
    scoreExterieur: r.scoreExterieur ?? 0,
    minuteJeu: r.minuteJeu ?? undefined,
    equipeDomicile: {
      id: String(r.domId),
      nom: r.domNom,
      codePays: r.domCode,
      logoUrl: r.domLogo ?? undefined,
    },
    equipeExterieur: {
      id: String(r.extId),
      nom: r.extNom,
      codePays: r.extCode,
      logoUrl: r.extLogo ?? undefined,
    },
    phase: {
      id: String(r.phaseId),
      nom: r.phaseNom,
      type: r.phaseType,
      ordre: r.phaseOrdre,
    },
    stade: r.stadeId
      ? { id: String(r.stadeId), nom: r.stadeNom, ville: r.stadeVille ?? undefined }
      : undefined,
    groupe: r.groupeId
      ? { id: r.groupeLettre, lettre: r.groupeLettre }
      : undefined,
  };
}

// ─── Service ─────────────────────────────────────────────────────────────────

export async function getMatchesFromDb(filtres?: FiltresMatchs): Promise<Match[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filtres?.phase) {
    params.push(filtres.phase);
    conditions.push(`p.type = $${params.length}`);
  }

  if (filtres?.equipeId) {
    params.push(filtres.equipeId);
    conditions.push(`(m.id_equipe_domicile = $${params.length} OR m.id_equipe_exterieur = $${params.length})`);
  }

  if (filtres?.live) {
    conditions.push(`m.statut = 'en_cours'`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `${SELECT_MATCH} ${where} ORDER BY m.date_heure ASC`;

  const rows = await query(sql, params);
  return rows.map(rowToMatch);
}

export async function getMatchByIdFromDb(id: string): Promise<Match | null> {
  const rows = await query(`${SELECT_MATCH} WHERE m.id_match = $1`, [id]);
  return rows.length ? rowToMatch(rows[0]) : null;
}
