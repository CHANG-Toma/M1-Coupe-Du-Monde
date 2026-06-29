import {
  SYNC_ADVISORY_LOCK_KEY,
  SYNC_INTERVAL_IDLE_MS,
  canRunCatalogSync,
} from "./sync-config";
import { getSyncMeta } from "./sync-meta";
import {
  isDbAvailable,
  tryAdvisoryLock,
  releaseAdvisoryLock,
} from "@/lib/db/client";
import { execFile } from "child_process";
import { promisify } from "util";
import { resolve } from "path";

const execFileAsync = promisify(execFile);

async function runCatalogSync(): Promise<{ matchCount?: number; liveCount?: number }> {
  const script = resolve(process.cwd(), "scripts/sync-worldcup2026.mjs");
  await execFileAsync("node", [script], { cwd: process.cwd() });
  const meta = await getSyncMeta();
  return { matchCount: meta.match_count, liveCount: meta.live_match_count };
}

export { runCatalogSync };

function isStale(lastSyncedAt: Date): boolean {
  return Date.now() - lastSyncedAt.getTime() >= SYNC_INTERVAL_IDLE_MS;
}

export async function maybeTriggerSync(force = false): Promise<void> {
  if (!canRunCatalogSync() || !(await isDbAvailable())) return;

  const meta = await getSyncMeta();
  if (!force && !isStale(meta.last_synced_at)) return;

  const locked = await tryAdvisoryLock(SYNC_ADVISORY_LOCK_KEY);
  if (!locked) return;

  try {
    const metaAfterLock = await getSyncMeta();
    if (!force && !isStale(metaAfterLock.last_synced_at)) return;
    await runCatalogSync();
    console.info("[sync] Catalogue importé en base.");
  } catch (err) {
    console.error("[sync] Échec synchronisation:", (err as Error).message);
  } finally {
    await releaseAdvisoryLock(SYNC_ADVISORY_LOCK_KEY);
  }
}

export async function getSyncStatus() {
  const meta = await getSyncMeta();

  return {
    lastSyncedAt: meta.last_synced_at.toISOString(),
    liveMatchCount: meta.live_match_count,
    matchCount: meta.match_count,
    intervalMs: SYNC_INTERVAL_IDLE_MS,
    nextSyncAt: new Date(
      meta.last_synced_at.getTime() + SYNC_INTERVAL_IDLE_MS
    ).toISOString(),
    canSync: canRunCatalogSync(),
    syncSource: "worldcup2026",
    liveReadsApi: true,
  };
}
