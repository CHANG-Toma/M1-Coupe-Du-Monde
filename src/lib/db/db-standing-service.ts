import { query } from "./client";
import type { GroupeClassement } from "@/lib/types";

interface StandingRow {
  groupeId: number;
  groupeLettre: string;
  equipeId: number;
  equipeNom: string;
  equipeCode: string;
  equipeLogo: string | null;
  points: number;
  matchsJoues: number;
  victoires: number;
  nuls: number;
  defaites: number;
  butsPour: number;
  butsContre: number;
  differenceButs: number;
}

export async function getStandingsFromDb(): Promise<GroupeClassement[]> {
  const rows = await query<StandingRow>(`
    SELECT
      g.id_groupe        AS "groupeId",
      g.lettre           AS "groupeLettre",
      e.id_equipe        AS "equipeId",
      e.nom              AS "equipeNom",
      e.code_pays        AS "equipeCode",
      e.logo_url         AS "equipeLogo",
      c.points,
      c.matchs_joues     AS "matchsJoues",
      c.victoires,
      c.nuls,
      c.defaites,
      c.buts_pour        AS "butsPour",
      c.buts_contre      AS "butsContre",
      c.difference_buts  AS "differenceButs"
    FROM classement c
    JOIN equipe e ON e.id_equipe = c.id_equipe
    JOIN groupe g ON g.id_groupe = c.id_groupe
    ORDER BY g.lettre ASC, c.points DESC, c.difference_buts DESC
  `);

  // Grouper par lettre
  const grouped = new Map<string, GroupeClassement>();

  for (const r of rows) {
    if (!grouped.has(r.groupeLettre)) {
      grouped.set(r.groupeLettre, {
        groupe: { id: r.groupeLettre, lettre: r.groupeLettre },
        classement: [],
      });
    }
    grouped.get(r.groupeLettre)!.classement.push({
      equipe: {
        id: String(r.equipeId),
        nom: r.equipeNom,
        codePays: r.equipeCode,
        logoUrl: r.equipeLogo ?? undefined,
      },
      groupe: { id: r.groupeLettre, lettre: r.groupeLettre },
      points: r.points,
      matchsJoues: r.matchsJoues,
      victoires: r.victoires,
      nuls: r.nuls,
      defaites: r.defaites,
      butsPour: r.butsPour,
      butsContre: r.butsContre,
      differenceButs: r.differenceButs,
    });
  }

  return Array.from(grouped.values());
}
