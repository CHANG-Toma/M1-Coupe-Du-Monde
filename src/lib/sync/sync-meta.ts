interface SyncMetaRow {
  last_synced_at: Date;
  live_match_count: number;
  match_count: number;
}

export async function getSyncMeta(): Promise<SyncMetaRow> {
  const { query } = await import("@/lib/db/client");
  try {
    const rows = await query<SyncMetaRow>(
      "SELECT last_synced_at, live_match_count, match_count FROM sync_meta WHERE id = 1"
    );
    if (rows[0]) return rows[0];
  } catch {
    // Table sync_meta absente (migration 03 non appliquée)
  }
  return {
    last_synced_at: new Date(0),
    live_match_count: 0,
    match_count: 0,
  };
}
