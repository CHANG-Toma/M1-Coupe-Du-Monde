package com.cdm.worldcup.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private boolean useMockData = false;
    private final WorldCup2026 worldcup2026 = new WorldCup2026();
    private final Sync sync = new Sync();

    public boolean isUseMockData() {
        return useMockData;
    }

    public void setUseMockData(boolean useMockData) {
        this.useMockData = useMockData;
    }

    public WorldCup2026 getWorldcup2026() {
        return worldcup2026;
    }

    public Sync getSync() {
        return sync;
    }

    public static class Sync {
        private boolean enabled = true;
        private long intervalMs = 300_000;
        private long advisoryLockKey = 20_260_611;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public long getIntervalMs() {
            return intervalMs;
        }

        public void setIntervalMs(long intervalMs) {
            this.intervalMs = intervalMs;
        }

        public long getAdvisoryLockKey() {
            return advisoryLockKey;
        }

        public void setAdvisoryLockKey(long advisoryLockKey) {
            this.advisoryLockKey = advisoryLockKey;
        }
    }

    public static class WorldCup2026 {
        private String apiUrl = "https://worldcup26.ir";
        private long cacheTtlMs = 300_000;

        public String getApiUrl() {
            return apiUrl;
        }

        public void setApiUrl(String apiUrl) {
            this.apiUrl = apiUrl;
        }

        public long getCacheTtlMs() {
            return cacheTtlMs;
        }

        public void setCacheTtlMs(long cacheTtlMs) {
            this.cacheTtlMs = cacheTtlMs;
        }
    }
}
