package com.cdm.worldcup.db;

import com.cdm.worldcup.model.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Repository
public class DbStandingRepository {

    private final JdbcTemplate jdbcTemplate;

    public DbStandingRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<GroupeClassement> findAll() {
        List<StandingRow> rows = jdbcTemplate.query(
                """
                SELECT
                  g.lettre           AS groupe_lettre,
                  e.id_equipe        AS equipe_id,
                  e.nom              AS equipe_nom,
                  e.code_pays        AS equipe_code,
                  e.logo_url         AS equipe_logo,
                  c.points,
                  c.matchs_joues,
                  c.victoires,
                  c.nuls,
                  c.defaites,
                  c.buts_pour,
                  c.buts_contre,
                  c.difference_buts
                FROM classement c
                JOIN equipe e ON e.id_equipe = c.id_equipe
                JOIN groupe g ON g.id_groupe = c.id_groupe
                ORDER BY g.lettre ASC, c.points DESC, c.difference_buts DESC
                """,
                (rs, rowNum) -> new StandingRow(
                        rs.getString("groupe_lettre"),
                        new LigneClassement(
                                new Equipe(
                                        String.valueOf(rs.getInt("equipe_id")),
                                        rs.getString("equipe_nom"),
                                        rs.getString("equipe_code"),
                                        rs.getString("equipe_logo")
                                ),
                                new Groupe(rs.getString("groupe_lettre"), rs.getString("groupe_lettre")),
                                rs.getInt("points"),
                                rs.getInt("matchs_joues"),
                                rs.getInt("victoires"),
                                rs.getInt("nuls"),
                                rs.getInt("defaites"),
                                rs.getInt("buts_pour"),
                                rs.getInt("buts_contre"),
                                rs.getInt("difference_buts")
                        )
                )
        );

        Map<String, List<LigneClassement>> grouped = new LinkedHashMap<>();
        for (StandingRow row : rows) {
            grouped.computeIfAbsent(row.lettre(), k -> new ArrayList<>()).add(row.ligne());
        }

        return grouped.entrySet().stream()
                .map(e -> new GroupeClassement(new Groupe(e.getKey(), e.getKey()), e.getValue()))
                .toList();
    }

    private record StandingRow(String lettre, LigneClassement ligne) {}
}
