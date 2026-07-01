package com.cdm.worldcup.db;

import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseHealth {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseHealth(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean isAvailable() {
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return true;
        } catch (DataAccessException e) {
            return false;
        }
    }

    public boolean tryAdvisoryLock(long lockKey) {
        Boolean locked = jdbcTemplate.queryForObject(
                "SELECT pg_try_advisory_lock(?)",
                Boolean.class,
                lockKey
        );
        return Boolean.TRUE.equals(locked);
    }

    public void releaseAdvisoryLock(long lockKey) {
        jdbcTemplate.queryForObject("SELECT pg_advisory_unlock(?)", Boolean.class, lockKey);
    }
}
