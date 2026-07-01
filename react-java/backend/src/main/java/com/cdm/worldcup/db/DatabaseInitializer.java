package com.cdm.worldcup.db;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;
    private final DatabaseHealth databaseHealth;

    public DatabaseInitializer(JdbcTemplate jdbcTemplate, DatabaseHealth databaseHealth) {
        this.jdbcTemplate = jdbcTemplate;
        this.databaseHealth = databaseHealth;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!databaseHealth.isAvailable()) {
            return;
        }

        jdbcTemplate.execute("""
            CREATE UNIQUE INDEX IF NOT EXISTS idx_stade_nom ON stade (nom)
            """);

        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS sync_meta (
              id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
              last_synced_at TIMESTAMPTZ NOT NULL DEFAULT '1970-01-01',
              live_match_count SMALLINT NOT NULL DEFAULT 0,
              match_count INTEGER NOT NULL DEFAULT 0
            )
            """);

        jdbcTemplate.update("INSERT INTO sync_meta (id) VALUES (1) ON CONFLICT (id) DO NOTHING");
    }
}
