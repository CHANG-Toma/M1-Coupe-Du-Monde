package com.cdm.worldcup.db;

import com.cdm.worldcup.model.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Repository
public class DbMatchRepository {

    private static final String SELECT_MATCH = """
        SELECT
          m.id_match            AS id,
          m.date_heure          AS date_heure,
          m.statut,
          m.buts_domicile       AS score_domicile,
          m.buts_exterieur      AS score_exterieur,
          m.minute_jeu,
          ed.id_equipe          AS dom_id,
          ed.nom                AS dom_nom,
          ed.code_pays          AS dom_code,
          ed.logo_url           AS dom_logo,
          ee.id_equipe          AS ext_id,
          ee.nom                AS ext_nom,
          ee.code_pays          AS ext_code,
          ee.logo_url           AS ext_logo,
          p.id_phase            AS phase_id,
          p.nom                 AS phase_nom,
          p.type                AS phase_type,
          p.ordre               AS phase_ordre,
          s.id_stade            AS stade_id,
          s.nom                 AS stade_nom,
          s.ville               AS stade_ville,
          g.id_groupe           AS groupe_id,
          g.lettre              AS groupe_lettre
        FROM match_cdm m
        JOIN equipe ed ON ed.id_equipe = m.id_equipe_domicile
        JOIN equipe ee ON ee.id_equipe = m.id_equipe_exterieur
        JOIN phase  p  ON p.id_phase   = m.id_phase
        LEFT JOIN stade  s ON s.id_stade  = m.id_stade
        LEFT JOIN groupe g ON g.id_groupe = m.id_groupe
        """;

    private final JdbcTemplate jdbcTemplate;

    public DbMatchRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Match> findMatches(String phase, String equipeId, boolean liveOnly) {
        List<String> conditions = new ArrayList<>();
        List<Object> params = new ArrayList<>();

        if (phase != null && !phase.isBlank()) {
            params.add(phase);
            conditions.add("p.type = ?");
        }
        if (equipeId != null && !equipeId.isBlank()) {
            params.add(Integer.parseInt(equipeId));
            conditions.add("(m.id_equipe_domicile = ? OR m.id_equipe_exterieur = ?)");
            params.add(Integer.parseInt(equipeId));
        }
        if (liveOnly) {
            conditions.add("m.statut = 'en_cours'");
        }

        String where = conditions.isEmpty() ? "" : "WHERE " + String.join(" AND ", conditions);
        String sql = SELECT_MATCH + " " + where + " ORDER BY m.date_heure ASC";

        return jdbcTemplate.query(sql, this::mapRow, params.toArray());
    }

    public Match findById(String id) {
        List<Match> rows = jdbcTemplate.query(
                SELECT_MATCH + " WHERE m.id_match = ?",
                this::mapRow,
                Integer.parseInt(id)
        );
        return rows.isEmpty() ? null : rows.getFirst();
    }

    private Match mapRow(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        Instant dateHeure = rs.getTimestamp("date_heure").toInstant();

        Integer minute = null;
        Object minuteObj = rs.getObject("minute_jeu");
        if (minuteObj != null) {
            minute = rs.getInt("minute_jeu");
        }

        Stade stade = null;
        if (rs.getObject("stade_id") != null) {
            stade = new Stade(
                    String.valueOf(rs.getInt("stade_id")),
                    rs.getString("stade_nom"),
                    rs.getString("stade_ville")
            );
        }

        Groupe groupe = null;
        if (rs.getString("groupe_lettre") != null) {
            String lettre = rs.getString("groupe_lettre");
            groupe = new Groupe(lettre, lettre);
        }

        return new Match(
                String.valueOf(rs.getInt("id")),
                dateHeure.toString(),
                rs.getString("statut"),
                rs.getInt("score_domicile"),
                rs.getInt("score_exterieur"),
                new Equipe(
                        String.valueOf(rs.getInt("dom_id")),
                        rs.getString("dom_nom"),
                        rs.getString("dom_code"),
                        rs.getString("dom_logo")
                ),
                new Equipe(
                        String.valueOf(rs.getInt("ext_id")),
                        rs.getString("ext_nom"),
                        rs.getString("ext_code"),
                        rs.getString("ext_logo")
                ),
                new Phase(
                        String.valueOf(rs.getInt("phase_id")),
                        rs.getString("phase_nom"),
                        rs.getString("phase_type"),
                        rs.getInt("phase_ordre")
                ),
                stade,
                groupe,
                minute
        );
    }
}
