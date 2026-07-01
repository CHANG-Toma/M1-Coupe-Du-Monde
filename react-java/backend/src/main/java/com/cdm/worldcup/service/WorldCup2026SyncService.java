package com.cdm.worldcup.service;

import com.cdm.worldcup.api.WorldCup2026Client;
import com.cdm.worldcup.api.WorldCup2026Mapper;
import com.cdm.worldcup.api.dto.*;
import com.cdm.worldcup.db.SyncMetaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WorldCup2026SyncService {

    private static final Logger log = LoggerFactory.getLogger(WorldCup2026SyncService.class);

    private final WorldCup2026Client worldCupClient;
    private final WorldCup2026Mapper mapper;
    private final JdbcTemplate jdbcTemplate;
    private final TransactionTemplate transactionTemplate;
    private final SyncMetaRepository syncMetaRepository;

    public WorldCup2026SyncService(
            WorldCup2026Client worldCupClient,
            WorldCup2026Mapper mapper,
            JdbcTemplate jdbcTemplate,
            TransactionTemplate transactionTemplate,
            SyncMetaRepository syncMetaRepository
    ) {
        this.worldCupClient = worldCupClient;
        this.mapper = mapper;
        this.jdbcTemplate = jdbcTemplate;
        this.transactionTemplate = transactionTemplate;
        this.syncMetaRepository = syncMetaRepository;
    }

    public int syncCatalog() {
        WorldCup2026Client.RawCatalog raw = worldCupClient.fetchRawCatalog();
        log.info("[sync] Téléchargement worldcup26.ir : {} équipes, {} matchs, {} groupes",
                raw.teams().size(), raw.games().size(), raw.groups().size());

        Map<String, WcTeam> teamsById = raw.teams().stream()
                .collect(Collectors.toMap(WcTeam::id, t -> t, (a, b) -> a));
        Map<String, WcStadium> stadiumsById = raw.stadiums().stream()
                .collect(Collectors.toMap(WcStadium::id, s -> s, (a, b) -> a));

        Integer matchCount = transactionTemplate.execute(status -> {
            jdbcTemplate.execute("""
                SELECT setval(pg_get_serial_sequence('stade', 'id_stade'),
                  COALESCE((SELECT MAX(id_stade) FROM stade), 1))
                """);
            jdbcTemplate.execute("""
                SELECT setval(pg_get_serial_sequence('groupe', 'id_groupe'),
                  COALESCE((SELECT MAX(id_groupe) FROM groupe), 1))
                """);

            Map<String, Integer> phaseCache = new HashMap<>();

            for (WcTeam team : raw.teams()) {
                upsertEquipe(
                        Integer.parseInt(team.id()),
                        team.name_en(),
                        mapper.teamCodeForSync(team),
                        team.flag()
                );
            }

            List<Integer> matchIds = new ArrayList<>();

            for (WcGame game : raw.games()) {
                WorldCup2026Mapper.SyncTeam dom = mapper.resolveSyncTeam(game, true, teamsById);
                WorldCup2026Mapper.SyncTeam ext = mapper.resolveSyncTeam(game, false, teamsById);
                if (dom == null || ext == null) continue;

                int idMatch = Integer.parseInt(String.valueOf(game.id()));
                matchIds.add(idMatch);

                Instant kickoff = Instant.parse(mapper.parseLocalDate(game.local_date()));
                String statut = mapper.catalogStatut(game);
                int phaseId = getPhaseId(phaseCache, mapper.mapPhaseTypeForDb(game.type()));
                Integer groupeId = extractGroupeLettre(game) != null
                        ? ensureGroupe(extractGroupeLettre(game))
                        : null;
                Integer stadeId = game.stadium_id() != null
                        ? ensureStade(game.stadium_id(), stadiumsById)
                        : null;

                if (!teamsById.containsKey(String.valueOf(dom.id()))) {
                    upsertEquipe(dom.id(), dom.nom(), dom.code(), dom.flag());
                }
                if (!teamsById.containsKey(String.valueOf(ext.id()))) {
                    upsertEquipe(ext.id(), ext.nom(), ext.code(), ext.flag());
                }

                jdbcTemplate.update(
                        """
                        INSERT INTO match_cdm (
                          id_match, date_heure, statut, buts_domicile, buts_exterieur,
                          id_phase, id_stade, id_groupe, id_equipe_domicile, id_equipe_exterieur
                        ) VALUES (?,?,?,?,?,?,?,?,?,?)
                        ON CONFLICT (id_match) DO UPDATE SET
                          date_heure=EXCLUDED.date_heure, statut=EXCLUDED.statut,
                          buts_domicile=EXCLUDED.buts_domicile, buts_exterieur=EXCLUDED.buts_exterieur,
                          id_phase=EXCLUDED.id_phase, id_stade=EXCLUDED.id_stade,
                          id_groupe=EXCLUDED.id_groupe,
                          id_equipe_domicile=EXCLUDED.id_equipe_domicile,
                          id_equipe_exterieur=EXCLUDED.id_equipe_exterieur
                        """,
                        idMatch,
                        Timestamp.from(kickoff),
                        statut,
                        parseInt(game.home_score()),
                        parseInt(game.away_score()),
                        phaseId,
                        stadeId,
                        groupeId,
                        dom.id(),
                        ext.id()
                );
            }

            if (!matchIds.isEmpty()) {
                Integer[] ids = matchIds.toArray(Integer[]::new);
                jdbcTemplate.update((java.sql.Connection con) -> {
                    var ps = con.prepareStatement("DELETE FROM match_cdm WHERE NOT (id_match = ANY(?))");
                    ps.setArray(1, con.createArrayOf("integer", ids));
                    return ps;
                });
            }

            jdbcTemplate.update("DELETE FROM classement");

            for (WcGroup group : raw.groups()) {
                String letter = group.name() != null ? group.name().toUpperCase() : null;
                if (letter == null || letter.isBlank()) continue;

                int groupeId = ensureGroupe(letter);
                List<WcGroupTeamRow> rows = group.teams() == null ? List.of() : new ArrayList<>(group.teams());
                rows.sort((a, b) -> {
                    int ptsDiff = parseInt(b.pts()) - parseInt(a.pts());
                    if (ptsDiff != 0) return ptsDiff;
                    int gdDiff = parseInt(b.gd()) - parseInt(a.gd());
                    if (gdDiff != 0) return gdDiff;
                    return parseInt(b.gf()) - parseInt(a.gf());
                });

                for (WcGroupTeamRow row : rows) {
                    WcTeam team = teamsById.get(row.team_id());
                    if (team != null) {
                        upsertEquipe(
                                Integer.parseInt(team.id()),
                                team.name_en(),
                                mapper.teamCodeForSync(team),
                                team.flag()
                        );
                    }

                    jdbcTemplate.update(
                            """
                            INSERT INTO classement (
                              id_equipe, id_groupe, points, matchs_joues, victoires, nuls, defaites,
                              buts_pour, buts_contre, difference_buts
                            ) VALUES (?,?,?,?,?,?,?,?,?,?)
                            """,
                            Integer.parseInt(row.team_id()),
                            groupeId,
                            parseInt(row.pts()),
                            parseInt(row.mp()),
                            parseInt(row.w()),
                            parseInt(row.d()),
                            parseInt(row.l()),
                            parseInt(row.gf()),
                            parseInt(row.ga()),
                            parseInt(row.gd())
                    );
                }
            }

            syncMetaRepository.updateMeta(matchIds.size());
            return matchIds.size();
        });

        int count = matchCount != null ? matchCount : 0;
        log.info("[sync] Catalogue importé en base : {} matchs", count);
        return count;
    }

    private int getPhaseId(Map<String, Integer> cache, String type) {
        if (cache.containsKey(type)) {
            return cache.get(type);
        }
        Integer id = jdbcTemplate.queryForObject(
                "SELECT id_phase FROM phase WHERE type = ?",
                Integer.class,
                type
        );
        if (id == null) {
            throw new IllegalStateException("Phase introuvable : " + type);
        }
        cache.put(type, id);
        return id;
    }

    private int ensureGroupe(String lettre) {
        List<Integer> existing = jdbcTemplate.query(
                "SELECT id_groupe FROM groupe WHERE lettre = ?",
                (rs, rowNum) -> rs.getInt("id_groupe"),
                lettre
        );
        if (!existing.isEmpty()) {
            return existing.getFirst();
        }
        return jdbcTemplate.queryForObject(
                "INSERT INTO groupe (lettre) VALUES (?) RETURNING id_groupe",
                Integer.class,
                lettre
        );
    }

    private Integer ensureStade(String stadiumId, Map<String, WcStadium> stadiumsById) {
        WcStadium stadium = stadiumsById.get(stadiumId);
        if (stadium == null) return null;

        String ville = stadium.city_en() != null ? stadium.city_en() : stadium.name_en();
        return jdbcTemplate.queryForObject(
                """
                INSERT INTO stade (nom, ville) VALUES (?, ?)
                ON CONFLICT (nom) DO UPDATE SET ville = COALESCE(EXCLUDED.ville, stade.ville)
                RETURNING id_stade
                """,
                Integer.class,
                stadium.name_en(),
                ville
        );
    }

    private void upsertEquipe(int id, String nom, String code, String flag) {
        String logo = flag != null ? flag : "https://flagcdn.com/" + code + ".svg";
        jdbcTemplate.update(
                """
                INSERT INTO equipe (id_equipe, nom, code_pays, logo_url)
                VALUES (?, ?, ?, ?)
                ON CONFLICT (id_equipe) DO UPDATE SET
                  nom = EXCLUDED.nom, code_pays = EXCLUDED.code_pays, logo_url = EXCLUDED.logo_url
                """,
                id, nom, code, logo
        );
    }

    private String extractGroupeLettre(WcGame game) {
        if (!"group".equals(game.type()) || game.group() == null) return null;
        String g = game.group().toUpperCase();
        return g.matches("[A-L]") ? g : null;
    }

    private int parseInt(String value) {
        if (value == null || value.isBlank()) return 0;
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
