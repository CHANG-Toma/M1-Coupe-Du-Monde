import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const API_BASE = process.env.WORLDCUP2026_API_URL ?? "https://worldcup26.ir";

function loadEnv() {
  try {
    const raw = readFileSync(resolve(root, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      const key = t.slice(0, i).trim();
      const val = t.slice(i + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
  }
}

loadEnv();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL manquante dans .env.local");
  process.exit(1);
}

const PHASE_BY_TYPE = {
  group: "groupes",
  r32: "seizieme",
  r16: "huitieme",
  qf: "quart",
  sf: "demi",
  third: "petite_finale",
  final: "finale",
};

function parseLocalDate(localDate) {
  if (!localDate) return new Date().toISOString();
  const m = localDate.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})/);
  if (!m) return new Date().toISOString();
  const [, mm, dd, yyyy, hh, min] = m;
  return new Date(
    `${yyyy}-${mm}-${dd}T${hh.padStart(2, "0")}:${min}:00.000Z`
  ).toISOString();
}

function catalogStatut(game) {
  return game.finished === "TRUE" ? "termine" : "a_venir";
}

function mapPhase(type) {
  return PHASE_BY_TYPE[type] ?? "groupes";
}

function extractGroupeLettre(game) {
  if (game.type !== "group" || !game.group) return null;
  return /^[A-L]$/i.test(game.group) ? game.group.toUpperCase() : null;
}

function labelTeamId(label) {
  let h = 5381;
  for (let i = 0; i < label.length; i++) h = (h * 33) ^ label.charCodeAt(i);
  return Math.abs(h) % 800_000 + 900_000;
}

function teamCode(team) {
  if (!team) return "un";
  if (team.iso2) return team.iso2.toLowerCase();
  if (team.fifa_code) return team.fifa_code.slice(0, 2).toLowerCase();
  return "un";
}

function resolveTeam(game, side, teamsById) {
  const teamId = side === "home" ? game.home_team_id : game.away_team_id;
  const name = side === "home" ? game.home_team_name_en : game.away_team_name_en;
  const label = side === "home" ? game.home_team_label : game.away_team_label;

  if (teamId && teamId !== "0") {
    const team = teamsById.get(teamId);
    return {
      id: parseInt(teamId, 10),
      nom: team?.name_en ?? name,
      code: teamCode(team),
      flag: team?.flag ?? null,
    };
  }
  if (name) {
    return { id: labelTeamId(name), nom: name, code: "un", flag: null };
  }
  if (label) {
    return { id: labelTeamId(label), nom: label, code: "un", flag: null };
  }
  return null;
}

async function fetchApi(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API HTTP ${res.status} ${path}`);
  return res.json();
}

async function main() {
  console.log(`Téléchargement worldcup26.ir (${API_BASE})...`);

  const [teamsRaw, gamesRaw, groupsRaw, stadiumsRaw] = await Promise.all([
    fetchApi("/get/teams"),
    fetchApi("/get/games"),
    fetchApi("/get/groups"),
    fetchApi("/get/stadiums"),
  ]);

  const teams = Array.isArray(teamsRaw) ? teamsRaw : (teamsRaw.teams ?? []);
  const games = gamesRaw.games ?? [];
  const groups = groupsRaw.groups ?? [];
  const stadiums = Array.isArray(stadiumsRaw)
    ? stadiumsRaw
    : (stadiumsRaw.stadiums ?? []);

  console.log(
    `${teams.length} équipes, ${games.length} matchs, ${groups.length} groupes`
  );

  const teamsById = new Map(teams.map((t) => [String(t.id), t]));
  const stadiumsById = new Map(stadiums.map((s) => [String(s.id), s]));

  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_stade_nom ON stade (nom);
      CREATE TABLE IF NOT EXISTS sync_meta (
        id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        last_synced_at TIMESTAMPTZ NOT NULL DEFAULT '1970-01-01',
        live_match_count SMALLINT NOT NULL DEFAULT 0,
        match_count INTEGER NOT NULL DEFAULT 0
      );
      INSERT INTO sync_meta (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
    `);

    await client.query("BEGIN");
    await client.query(`
      SELECT setval(pg_get_serial_sequence('stade', 'id_stade'),
        COALESCE((SELECT MAX(id_stade) FROM stade), 1));
      SELECT setval(pg_get_serial_sequence('groupe', 'id_groupe'),
        COALESCE((SELECT MAX(id_groupe) FROM groupe), 1));
    `);

    const phaseCache = new Map();
    async function getPhaseId(type) {
      if (phaseCache.has(type)) return phaseCache.get(type);
      const r = await client.query("SELECT id_phase FROM phase WHERE type = $1", [type]);
      if (!r.rows[0]) throw new Error(`Phase ${type} introuvable`);
      phaseCache.set(type, r.rows[0].id_phase);
      return r.rows[0].id_phase;
    }

    async function ensureGroupe(lettre) {
      const ex = await client.query("SELECT id_groupe FROM groupe WHERE lettre = $1", [lettre]);
      if (ex.rows[0]) return ex.rows[0].id_groupe;
      const ins = await client.query(
        "INSERT INTO groupe (lettre) VALUES ($1) RETURNING id_groupe",
        [lettre]
      );
      return ins.rows[0].id_groupe;
    }

    async function ensureStade(stadiumId) {
      const stadium = stadiumsById.get(String(stadiumId));
      if (!stadium) return null;
      const ins = await client.query(
        `INSERT INTO stade (nom, ville) VALUES ($1, $2)
         ON CONFLICT (nom) DO UPDATE SET ville = COALESCE(EXCLUDED.ville, stade.ville)
         RETURNING id_stade`,
        [stadium.name_en, stadium.city_en ?? stadium.name_en]
      );
      return ins.rows[0].id_stade;
    }

    async function upsertEquipe({ id, nom, code, flag }) {
      await client.query(
        `INSERT INTO equipe (id_equipe, nom, code_pays, logo_url)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id_equipe) DO UPDATE SET
           nom = EXCLUDED.nom, code_pays = EXCLUDED.code_pays, logo_url = EXCLUDED.logo_url`,
        [id, nom, code, flag ?? `https://flagcdn.com/${code}.svg`]
      );
      return id;
    }

    for (const team of teams) {
      await upsertEquipe({
        id: parseInt(team.id, 10),
        nom: team.name_en,
        code: teamCode(team),
        flag: team.flag,
      });
    }

    const matchIds = [];

    for (const game of games) {
      const dom = resolveTeam(game, "home", teamsById);
      const ext = resolveTeam(game, "away", teamsById);
      if (!dom || !ext) continue;

      const idMatch = parseInt(game.id, 10);
      matchIds.push(idMatch);

      const kickoff = parseLocalDate(game.local_date);
      const statut = catalogStatut(game);
      const phaseType = mapPhase(game.type);
      const phaseId = await getPhaseId(phaseType);
      const groupeLettre = extractGroupeLettre(game);
      const groupeId = groupeLettre ? await ensureGroupe(groupeLettre) : null;
      const stadeId = game.stadium_id ? await ensureStade(game.stadium_id) : null;

      if (!teamsById.has(String(dom.id))) await upsertEquipe(dom);
      if (!teamsById.has(String(ext.id))) await upsertEquipe(ext);

      const eq1 = dom.id;
      const eq2 = ext.id;
      const score1 = parseInt(game.home_score ?? "0", 10) || 0;
      const score2 = parseInt(game.away_score ?? "0", 10) || 0;

      await client.query(
        `INSERT INTO match_cdm (
           id_match, date_heure, statut, buts_domicile, buts_exterieur,
           id_phase, id_stade, id_groupe, id_equipe_domicile, id_equipe_exterieur
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (id_match) DO UPDATE SET
           date_heure=EXCLUDED.date_heure, statut=EXCLUDED.statut,
           buts_domicile=EXCLUDED.buts_domicile, buts_exterieur=EXCLUDED.buts_exterieur,
           id_phase=EXCLUDED.id_phase, id_stade=EXCLUDED.id_stade,
           id_groupe=EXCLUDED.id_groupe,
           id_equipe_domicile=EXCLUDED.id_equipe_domicile,
           id_equipe_exterieur=EXCLUDED.id_equipe_exterieur`,
        [idMatch, kickoff, statut, score1, score2, phaseId, stadeId, groupeId, eq1, eq2]
      );
    }

    if (matchIds.length > 0) {
      await client.query("DELETE FROM match_cdm WHERE NOT (id_match = ANY($1::int[]))", [
        matchIds,
      ]);
    }

    await client.query("DELETE FROM classement");

    for (const group of groups) {
      const letter = group.name?.toUpperCase();
      if (!letter) continue;
      const groupeId = await ensureGroupe(letter);

      const rows = [...(group.teams ?? [])].sort((a, b) => {
        const ptsDiff = parseInt(b.pts ?? "0", 10) - parseInt(a.pts ?? "0", 10);
        if (ptsDiff !== 0) return ptsDiff;
        const gdA = parseInt(a.gd ?? "0", 10);
        const gdB = parseInt(b.gd ?? "0", 10);
        if (gdB !== gdA) return gdB - gdA;
        return parseInt(b.gf ?? "0", 10) - parseInt(a.gf ?? "0", 10);
      });

      for (const row of rows) {
        const team = teamsById.get(String(row.team_id));
        if (team) {
          await upsertEquipe({
            id: parseInt(team.id, 10),
            nom: team.name_en,
            code: teamCode(team),
            flag: team.flag,
          });
        }

        await client.query(
          `INSERT INTO classement (
             id_equipe, id_groupe, points, matchs_joues, victoires, nuls, defaites,
             buts_pour, buts_contre, difference_buts
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [
            parseInt(row.team_id, 10),
            groupeId,
            parseInt(row.pts ?? "0", 10),
            parseInt(row.mp ?? "0", 10),
            parseInt(row.w ?? "0", 10),
            parseInt(row.d ?? "0", 10),
            parseInt(row.l ?? "0", 10),
            parseInt(row.gf ?? "0", 10),
            parseInt(row.ga ?? "0", 10),
            parseInt(row.gd ?? "0", 10),
          ]
        );
      }
    }

    await client.query(
      `INSERT INTO sync_meta (id, last_synced_at, live_match_count, match_count)
       VALUES (1, NOW(), 0, $1)
       ON CONFLICT (id) DO UPDATE SET
         last_synced_at=NOW(), live_match_count=0,
         match_count=EXCLUDED.match_count`,
      [matchIds.length]
    );

    await client.query("COMMIT");

    const stats = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM match_cdm WHERE statut = 'termine') AS termines,
        (SELECT COUNT(*) FROM match_cdm WHERE statut = 'en_cours') AS en_cours,
        (SELECT COUNT(*) FROM match_cdm WHERE statut = 'a_venir') AS a_venir,
        (SELECT COUNT(*) FROM classement) AS classement_lignes
    `);

    console.log("CDM 2026 synchronisée (worldcup26.ir) :", stats.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Erreur:", err.message ?? err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
