package com.cdm.worldcup.service;

import com.cdm.worldcup.config.AppProperties;
import com.cdm.worldcup.db.DatabaseHealth;
import com.cdm.worldcup.db.SyncMeta;
import com.cdm.worldcup.db.SyncMetaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class SyncScheduler {

    private static final Logger log = LoggerFactory.getLogger(SyncScheduler.class);

    private final AppProperties properties;
    private final DatabaseHealth databaseHealth;
    private final SyncMetaRepository syncMetaRepository;
    private final WorldCup2026SyncService syncService;

    public SyncScheduler(
            AppProperties properties,
            DatabaseHealth databaseHealth,
            SyncMetaRepository syncMetaRepository,
            WorldCup2026SyncService syncService
    ) {
        this.properties = properties;
        this.databaseHealth = databaseHealth;
        this.syncMetaRepository = syncMetaRepository;
        this.syncService = syncService;
    }

    public void maybeTriggerSync(boolean force) {
        if (!canRunCatalogSync() || !databaseHealth.isAvailable()) {
            return;
        }

        SyncMeta meta = syncMetaRepository.getMeta();
        if (!force && !isStale(meta.lastSyncedAt())) {
            return;
        }

        long lockKey = properties.getSync().getAdvisoryLockKey();
        if (!databaseHealth.tryAdvisoryLock(lockKey)) {
            return;
        }

        try {
            SyncMeta metaAfterLock = syncMetaRepository.getMeta();
            if (!force && !isStale(metaAfterLock.lastSyncedAt())) {
                return;
            }
            syncService.syncCatalog();
            log.info("[sync] Catalogue importé en base.");
        } catch (Exception e) {
            log.error("[sync] Échec synchronisation: {}", e.getMessage());
        } finally {
            databaseHealth.releaseAdvisoryLock(lockKey);
        }
    }

    @Scheduled(fixedDelayString = "${app.sync.interval-ms}", initialDelay = 60_000)
    public void scheduledSync() {
        maybeTriggerSync(false);
    }

    public SyncStatus getStatus() {
        SyncMeta meta = syncMetaRepository.getMeta();
        long intervalMs = properties.getSync().getIntervalMs();
        Instant nextSync = meta.lastSyncedAt().plusMillis(intervalMs);

        return new SyncStatus(
                meta.lastSyncedAt().toString(),
                meta.liveMatchCount(),
                meta.matchCount(),
                intervalMs,
                nextSync.toString(),
                canRunCatalogSync(),
                "worldcup2026",
                true
        );
    }

    private boolean canRunCatalogSync() {
        return properties.getSync().isEnabled() && !properties.isUseMockData();
    }

    private boolean isStale(Instant lastSyncedAt) {
        long elapsed = Instant.now().toEpochMilli() - lastSyncedAt.toEpochMilli();
        return elapsed >= properties.getSync().getIntervalMs();
    }

    public record SyncStatus(
            String lastSyncedAt,
            int liveMatchCount,
            int matchCount,
            long intervalMs,
            String nextSyncAt,
            boolean canSync,
            String syncSource,
            boolean liveReadsApi
    ) {}
}
