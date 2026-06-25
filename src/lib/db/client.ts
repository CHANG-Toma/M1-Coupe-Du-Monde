import { Pool } from "pg";

// Pool singleton — réutilisé entre les requêtes Next.js
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 3_000,
    });

    pool.on("error", (err) => {
      console.error("[DB] Erreur inattendue sur un client idle:", err.message);
    });
  }
  return pool;
}

/**
 * Teste si la base de données est accessible.
 * Retourne `true` si la connexion réussit, `false` sinon.
 */
export async function isDbAvailable(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  try {
    const client = await getPool().connect();
    await client.query("SELECT 1");
    client.release();
    return true;
  } catch {
    return false;
  }
}

/**
 * Exécute une requête SQL via le pool.
 * Lance une erreur si la DB n'est pas disponible.
 */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const client = await getPool().connect();
  try {
    const result = await client.query(sql, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}
