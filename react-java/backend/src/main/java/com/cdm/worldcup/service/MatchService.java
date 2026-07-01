package com.cdm.worldcup.service;

import com.cdm.worldcup.api.WorldCup2026Client;
import com.cdm.worldcup.config.AppProperties;
import com.cdm.worldcup.db.DatabaseHealth;
import com.cdm.worldcup.db.DbMatchRepository;
import com.cdm.worldcup.model.Match;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MatchService {

    private static final Logger log = LoggerFactory.getLogger(MatchService.class);

    private static final Map<String, Integer> KICKOFF_UTC_MIN = Map.of(
            "m011", 13 * 60 + 43,
            "m012", 13 * 60 + 53
    );

    private final AppProperties properties;
    private final WorldCup2026Client worldCupClient;
    private final ObjectMapper objectMapper;
    private final DatabaseHealth databaseHealth;
    private final DbMatchRepository dbMatchRepository;
    private final SyncScheduler syncScheduler;
    private List<Match> mockMatches;
    private volatile String lastSource = "db";

    public MatchService(
            AppProperties properties,
            WorldCup2026Client worldCupClient,
            ObjectMapper objectMapper,
            DatabaseHealth databaseHealth,
            DbMatchRepository dbMatchRepository,
            SyncScheduler syncScheduler
    ) {
        this.properties = properties;
        this.worldCupClient = worldCupClient;
        this.objectMapper = objectMapper;
        this.databaseHealth = databaseHealth;
        this.dbMatchRepository = dbMatchRepository;
        this.syncScheduler = syncScheduler;
    }

    @PostConstruct
    void loadMockData() throws IOException {
        var resource = new ClassPathResource("data/matches.json");
        mockMatches = objectMapper.readValue(resource.getInputStream(), new TypeReference<>() {});
    }

    public String getLastSource() {
        return lastSource;
    }

    public List<Match> getMatches(String phase, String equipeId, boolean live) {
        if (properties.isUseMockData()) {
            lastSource = "mock";
            return filterMock(phase, equipeId, live);
        }

        if (live) {
            return getLiveMatches(phase, equipeId);
        }

        return getCatalogMatches(phase, equipeId);
    }

    public Optional<Match> getMatchById(String id) {
        if (properties.isUseMockData()) {
            lastSource = "mock";
            return mockMatches.stream()
                    .filter(m -> id.equals(m.id()))
                    .findFirst()
                    .map(this::hydrateLiveMock);
        }

        Match dbMatch = tryGetFromDb(id);
        if (canUseLiveApi()) {
            try {
                Optional<Match> live = worldCupClient.getMatchById(id);
                if (live.isPresent() && "en_cours".equals(live.get().statut())) {
                    lastSource = "api";
                    return live;
                }
            } catch (Exception e) {
                log.warn("[match-service] API live (détail) indisponible: {}", e.getMessage());
            }
        }

        if (dbMatch != null) {
            lastSource = "db";
            return Optional.of(dbMatch);
        }

        syncScheduler.maybeTriggerSync(false);
        dbMatch = tryGetFromDb(id);
        if (dbMatch != null) {
            if (canUseLiveApi()) {
                try {
                    Optional<Match> live = worldCupClient.getMatchById(id);
                    if (live.isPresent() && "en_cours".equals(live.get().statut())) {
                        lastSource = "api";
                        return live;
                    }
                } catch (Exception ignored) {
                }
            }
            lastSource = "db";
            return Optional.of(dbMatch);
        }

        lastSource = "mock";
        return mockMatches.stream()
                .filter(m -> id.equals(m.id()))
                .findFirst()
                .map(this::hydrateLiveMock);
    }

    private List<Match> getCatalogMatches(String phase, String equipeId) {
        syncScheduler.maybeTriggerSync(false);

        if (databaseHealth.isAvailable()) {
            try {
                List<Match> fromDb = dbMatchRepository.findMatches(phase, equipeId, false);
                if (!fromDb.isEmpty()) {
                    lastSource = "db";
                    return fromDb;
                }
            } catch (Exception e) {
                log.warn("[match-service] DB indisponible: {}", e.getMessage());
            }
        }

        try {
            List<Match> fromApi = worldCupClient.getCatalogMatches(phase, equipeId);
            lastSource = "api";
            return fromApi;
        } catch (Exception e) {
            log.warn("[match-service] API indisponible, fallback mock: {}", e.getMessage());
        }

        lastSource = "mock";
        return filterMock(phase, equipeId, false);
    }

    private List<Match> getLiveMatches(String phase, String equipeId) {
        syncScheduler.maybeTriggerSync(false);

        if (canUseLiveApi()) {
            try {
                List<Match> live = worldCupClient.getLiveMatches();
                lastSource = "api";
                return filterInMemory(live, phase, equipeId);
            } catch (Exception e) {
                log.warn("[match-service] API live indisponible, fallback DB: {}", e.getMessage());
            }
        }

        if (databaseHealth.isAvailable()) {
            try {
                List<Match> fromDb = dbMatchRepository.findMatches(phase, equipeId, true);
                lastSource = "db";
                return fromDb;
            } catch (Exception e) {
                log.warn("[match-service] DB live indisponible: {}", e.getMessage());
            }
        }

        lastSource = "mock";
        return filterMock(phase, equipeId, true);
    }

    private Match tryGetFromDb(String id) {
        if (!databaseHealth.isAvailable()) {
            return null;
        }
        try {
            return dbMatchRepository.findById(id);
        } catch (Exception e) {
            log.warn("[match-service] Lecture DB match {} échouée: {}", id, e.getMessage());
            return null;
        }
    }

    private boolean canUseLiveApi() {
        return !properties.isUseMockData();
    }

    private List<Match> filterInMemory(List<Match> matches, String phase, String equipeId) {
        List<Match> filtered = matches;

        if (phase != null && !phase.isBlank()) {
            filtered = filtered.stream()
                    .filter(m -> phase.equals(m.phase().type()))
                    .toList();
        }

        if (equipeId != null && !equipeId.isBlank()) {
            filtered = filtered.stream()
                    .filter(m ->
                            equipeId.equals(m.equipeDomicile().id()) ||
                                    equipeId.equals(m.equipeExterieur().id()))
                    .toList();
        }

        return filtered;
    }

    private List<Match> filterMock(String phase, String equipeId, boolean live) {
        List<Match> matches = mockMatches.stream()
                .map(this::hydrateLiveMock)
                .toList();

        if (live) {
            matches = matches.stream()
                    .filter(m -> "en_cours".equals(m.statut()))
                    .toList();
        }

        if (phase != null && !phase.isBlank()) {
            matches = matches.stream()
                    .filter(m -> phase.equals(m.phase().type()))
                    .toList();
        }

        if (equipeId != null && !equipeId.isBlank()) {
            matches = matches.stream()
                    .filter(m ->
                            equipeId.equals(m.equipeDomicile().id()) ||
                                    equipeId.equals(m.equipeExterieur().id()))
                    .toList();
        }

        return matches.stream()
                .sorted(Comparator.comparing(m -> Instant.parse(m.dateHeure())))
                .toList();
    }

    private Match hydrateLiveMock(Match match) {
        if (!"en_cours".equals(match.statut())) {
            return match;
        }

        long nowMs = System.currentTimeMillis();
        var todayUtc = java.time.ZonedDateTime.now(java.time.ZoneOffset.UTC)
                .withHour(0).withMinute(0).withSecond(0).withNano(0);

        int kickoffMin = KICKOFF_UTC_MIN.getOrDefault(match.id(), 13 * 60 + 30);
        long kickoffMs = todayUtc.toInstant().toEpochMilli() + kickoffMin * 60_000L;

        int elapsedMin = (int) ((nowMs - kickoffMs) / 60_000L);
        int minuteJeu = ((elapsedMin % 90) + 90) % 90 + 1;

        int seed = match.id().charAt(match.id().length() - 1);
        int butsDom = minuteJeu / (28 + (seed % 10));
        int butsExt = minuteJeu / (35 + (seed % 8));

        String liveDate = Instant.ofEpochMilli(nowMs - minuteJeu * 60_000L).toString();

        return match.withLiveState(
                liveDate,
                minuteJeu,
                Math.min(butsDom, 5),
                Math.min(butsExt, 4)
        );
    }
}
