/** Intervalle de polling client (ms) — 30s par défaut pour limiter le quota API */
export const POLL_INTERVAL_MS = Number(
  process.env.NEXT_PUBLIC_POLL_INTERVAL_MS ?? 30_000
);
