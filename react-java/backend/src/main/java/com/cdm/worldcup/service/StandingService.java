package com.cdm.worldcup.service;

import com.cdm.worldcup.api.WorldCup2026Client;
import com.cdm.worldcup.config.AppProperties;
import com.cdm.worldcup.db.DatabaseHealth;
import com.cdm.worldcup.db.DbStandingRepository;
import com.cdm.worldcup.model.GroupeClassement;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class StandingService {

    private static final Logger log = LoggerFactory.getLogger(StandingService.class);

    private final AppProperties properties;
    private final WorldCup2026Client worldCupClient;
    private final ObjectMapper objectMapper;
    private final DatabaseHealth databaseHealth;
    private final DbStandingRepository dbStandingRepository;
    private final SyncScheduler syncScheduler;
    private List<GroupeClassement> mockStandings;
    private volatile String lastSource = "db";

    public StandingService(
            AppProperties properties,
            WorldCup2026Client worldCupClient,
            ObjectMapper objectMapper,
            DatabaseHealth databaseHealth,
            DbStandingRepository dbStandingRepository,
            SyncScheduler syncScheduler
    ) {
        this.properties = properties;
        this.worldCupClient = worldCupClient;
        this.objectMapper = objectMapper;
        this.databaseHealth = databaseHealth;
        this.dbStandingRepository = dbStandingRepository;
        this.syncScheduler = syncScheduler;
    }

    @PostConstruct
    void loadMockData() throws IOException {
        var resource = new ClassPathResource("data/standings.json");
        mockStandings = objectMapper.readValue(resource.getInputStream(), new TypeReference<>() {});
    }

    public String getLastSource() {
        return lastSource;
    }

    public List<GroupeClassement> getStandings() {
        if (properties.isUseMockData()) {
            lastSource = "mock";
            return mockStandings;
        }

        syncScheduler.maybeTriggerSync(false);

        if (databaseHealth.isAvailable()) {
            try {
                List<GroupeClassement> fromDb = dbStandingRepository.findAll();
                if (!fromDb.isEmpty()) {
                    lastSource = "db";
                    return fromDb;
                }
            } catch (Exception e) {
                log.warn("[standing-service] DB indisponible: {}", e.getMessage());
            }
        }

        try {
            lastSource = "api";
            return worldCupClient.getStandings();
        } catch (Exception e) {
            log.warn("[standing-service] API indisponible, fallback mock: {}", e.getMessage());
            lastSource = "mock";
            return mockStandings;
        }
    }

    public Optional<GroupeClassement> getStandingsByGroup(String lettre) {
        return getStandings().stream()
                .filter(g -> lettre.equalsIgnoreCase(g.groupe().lettre()))
                .findFirst();
    }
}
