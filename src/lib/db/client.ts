import { Pool, type PoolClient } from "pg";

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

type QueryFn = <T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
) => Promise<T[]>;

async function queryClient<T = Record<string, unknown>>(
  client: PoolClient,
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await client.query(sql, params);
  return result.rows as T[];
}

/** Transaction SQL avec un seul client partagé */
export async function withTransaction<T>(
  fn: (run: QueryFn) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  const run: QueryFn = (sql, params) => queryClient(client, sql, params);
  try {
    await client.query("BEGIN");
    const result = await fn(run);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function tryAdvisoryLock(lockKey: number): Promise<boolean> {
  const rows = await query<{ locked: boolean }>(
    "SELECT pg_try_advisory_lock($1) AS locked",
    [lockKey]
  );
  return rows[0]?.locked === true;
}

export async function releaseAdvisoryLock(lockKey: number): Promise<void> {
  await query("SELECT pg_advisory_unlock($1)", [lockKey]);
}
