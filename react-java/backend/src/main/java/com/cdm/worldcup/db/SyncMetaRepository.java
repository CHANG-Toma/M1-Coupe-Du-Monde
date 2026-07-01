package com.cdm.worldcup.db;

import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;

@Repository
public class SyncMetaRepository {

    private final JdbcTemplate jdbcTemplate;

    public SyncMetaRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public SyncMeta getMeta() {
        try {
            return jdbcTemplate.queryForObject(
                    "SELECT last_synced_at, live_match_count, match_count FROM sync_meta WHERE id = 1",
                    (rs, rowNum) -> new SyncMeta(
                            rs.getTimestamp("last_synced_at").toInstant(),
                            rs.getInt("live_match_count"),
                            rs.getInt("match_count")
                    )
            );
        } catch (DataAccessException e) {
            return new SyncMeta(Instant.EPOCH, 0, 0);
        }
    }

    public void updateMeta(int matchCount) {
        jdbcTemplate.update(
                """
                INSERT INTO sync_meta (id, last_synced_at, live_match_count, match_count)
                VALUES (1, NOW(), 0, ?)
                ON CONFLICT (id) DO UPDATE SET
                  last_synced_at = NOW(),
                  live_match_count = 0,
                  match_count = EXCLUDED.match_count
                """,
                matchCount
        );
    }
}
