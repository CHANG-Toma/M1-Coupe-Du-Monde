package com.cdm.worldcup.db;

import java.time.Instant;

public record SyncMeta(Instant lastSyncedAt, int liveMatchCount, int matchCount) {}
