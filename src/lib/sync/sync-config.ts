export const SYNC_INTERVAL_IDLE_MS = Number(
  process.env.SYNC_INTERVAL_IDLE_MS ?? 5 * 60_000
);

/** Verrou PostgreSQL pour éviter les syncs concurrentes */
export const SYNC_ADVISORY_LOCK_KEY = 20_260_611;

export function useWorldCup2026Sync(): boolean {
  return process.env.USE_MOCK_DATA !== "true";
}

export function hasExternalDataSource(): boolean {
  return useWorldCup2026Sync() && Boolean(process.env.DATABASE_URL);
}

export function canRunCatalogSync(): boolean {
  return useWorldCup2026Sync() && Boolean(process.env.DATABASE_URL);
}

export function canUseWorldCup2026Live(): boolean {
  return useWorldCup2026Sync();
}
