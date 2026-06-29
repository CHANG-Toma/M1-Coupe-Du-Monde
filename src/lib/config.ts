/** Intervalle de polling client (ms) */
export const POLL_INTERVAL_MS = Number(
  process.env.NEXT_PUBLIC_POLL_INTERVAL_MS ?? 30_000
);
