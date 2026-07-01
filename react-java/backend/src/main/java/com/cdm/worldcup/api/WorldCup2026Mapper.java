package com.cdm.worldcup.api;

import com.cdm.worldcup.api.dto.*;
import com.cdm.worldcup.model.*;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class WorldCup2026Mapper {

    private static final Map<String, String> PHASE_BY_TYPE = Map.of(
            "group", "groupes",
            "r32", "seizieme",
            "r16", "huitieme",
            "qf", "quart",
            "sf", "demi",
            "third", "petite_finale",
            "final", "finale"
    );

    private static final List<Phase> PHASES = List.of(
            new Phase("1", "Phase de groupes", "groupes", 1),
            new Phase("2", "Seizièmes de finale", "seizieme", 2),
            new Phase("3", "Huitièmes de finale", "huitieme", 3),
            new Phase("4", "Quarts de finale", "quart", 4),
            new Phase("5", "Demi-finales", "demi", 5),
            new Phase("6", "Petite finale", "petite_finale", 6),
            new Phase("7", "Finale", "finale", 7)
    );

    private static final Pattern LOCAL_DATE = Pattern.compile(
            "(\\d{2})/(\\d{2})/(\\d{4})\\s+(\\d{1,2}):(\\d{2})"
    );

    public boolean isWorldCupGameLive(WcGame game) {
        if ("TRUE".equals(game.finished())) return false;
        String te = (game.time_elapsed() == null ? "" : game.time_elapsed()).toLowerCase();
        return !te.isEmpty() && !"notstarted".equals(te) && !"finished".equals(te);
    }

    public String mapGameStatut(WcGame game, boolean catalogOnly) {
        if ("TRUE".equals(game.finished())) return "termine";
        if (!catalogOnly && isWorldCupGameLive(game)) return "en_cours";
        return "a_venir";
    }

    public String parseLocalDate(String localDate) {
        if (localDate == null || localDate.isBlank()) {
            return Instant.now().toString();
        }
        Matcher m = LOCAL_DATE.matcher(localDate);
        if (!m.find()) return Instant.now().toString();
        String iso = String.format(
                "%s-%s-%sT%02d:%s:00.000Z",
                m.group(3), m.group(1), m.group(2),
                Integer.parseInt(m.group(4)), m.group(5)
        );
        return Instant.parse(iso).toString();
    }

    public Match mapGameToMatch(
            WcGame game,
            Map<String, WcTeam> teamsById,
            Map<String, WcStadium> stadiumsById,
            boolean catalogOnly
    ) {
        ResolvedTeam domicile = resolveTeam(game, true, teamsById);
        ResolvedTeam exterieur = resolveTeam(game, false, teamsById);
        if (domicile == null || exterieur == null) return null;

        String phaseType = mapPhaseType(game.type());
        Phase phase = PHASES.stream()
                .filter(p -> p.type().equals(phaseType))
                .findFirst()
                .orElse(PHASES.getFirst());

        String groupeLettre = extractGroupeLettre(game);
        WcStadium stadium = game.stadium_id() != null ? stadiumsById.get(game.stadium_id()) : null;

        Integer minuteJeu = catalogOnly ? null : parseMinute(game.time_elapsed());

        return new Match(
                String.valueOf(game.id()),
                parseLocalDate(game.local_date()),
                mapGameStatut(game, catalogOnly),
                parseInt(game.home_score()),
                parseInt(game.away_score()),
                new Equipe(domicile.id(), domicile.nom(), domicile.codePays(), domicile.logoUrl()),
                new Equipe(exterieur.id(), exterieur.nom(), exterieur.codePays(), exterieur.logoUrl()),
                phase,
                stadium != null
                        ? new Stade(stadium.id(), stadium.name_en(), stadium.city_en())
                        : game.stadium_id() != null
                            ? new Stade(game.stadium_id(), "Stade " + game.stadium_id(), null)
                            : null,
                groupeLettre != null ? new Groupe(groupeLettre, groupeLettre) : null,
                minuteJeu
        );
    }

    public List<GroupeClassement> mapGroupsToStandings(
            List<WcGroup> groups,
            Map<String, WcTeam> teamsById
    ) {
        return groups.stream()
                .map(group -> mapGroupStanding(group, teamsById))
                .sorted(Comparator.comparing(g -> g.groupe().lettre()))
                .toList();
    }

    private GroupeClassement mapGroupStanding(WcGroup group, Map<String, WcTeam> teamsById) {
        String lettre = group.name() != null ? group.name().toUpperCase() : "?";
        List<WcGroupTeamRow> rows = group.teams() == null ? List.of() : group.teams();

        List<LigneClassement> classement = rows.stream()
                .sorted((a, b) -> {
                    int ptsDiff = parseInt(b.pts()) - parseInt(a.pts());
                    if (ptsDiff != 0) return ptsDiff;
                    int gdDiff = parseInt(b.gd()) - parseInt(a.gd());
                    if (gdDiff != 0) return gdDiff;
                    return parseInt(b.gf()) - parseInt(a.gf());
                })
                .map(row -> {
                    WcTeam team = teamsById.get(row.team_id());
                    String nom = team != null ? team.name_en() : "Équipe " + row.team_id();
                    String code = teamCode(team);
                    return new LigneClassement(
                            new Equipe(row.team_id(), nom, code, team != null ? team.flag() : null),
                            new Groupe(lettre, lettre),
                            parseInt(row.pts()),
                            parseInt(row.mp()),
                            parseInt(row.w()),
                            parseInt(row.d()),
                            parseInt(row.l()),
                            parseInt(row.gf()),
                            parseInt(row.ga()),
                            parseInt(row.gd())
                    );
                })
                .toList();

        return new GroupeClassement(new Groupe(lettre, lettre), classement);
    }

    private ResolvedTeam resolveTeam(WcGame game, boolean home, Map<String, WcTeam> teamsById) {
        String teamId = home ? game.home_team_id() : game.away_team_id();
        String name = home ? game.home_team_name_en() : game.away_team_name_en();
        String label = home ? game.home_team_label() : game.away_team_label();

        if (teamId != null && !"0".equals(teamId)) {
            WcTeam team = teamsById.get(teamId);
            String nom = team != null ? team.name_en() : name;
            if (nom == null || nom.isBlank()) return null;
            return new ResolvedTeam(teamId, nom, teamCode(team), team != null ? team.flag() : null);
        }
        if (name != null && !name.isBlank()) {
            return new ResolvedTeam(String.valueOf(labelTeamId(name)), name, "un", null);
        }
        if (label != null && !label.isBlank()) {
            return new ResolvedTeam(String.valueOf(labelTeamId(label)), label, "un", null);
        }
        return null;
    }

    private String teamCode(WcTeam team) {
        if (team == null) return "un";
        if (team.iso2() != null && !team.iso2().isBlank()) return team.iso2().toLowerCase();
        if (team.fifa_code() != null && team.fifa_code().length() >= 2) {
            return team.fifa_code().substring(0, 2).toLowerCase();
        }
        return "un";
    }

    private int labelTeamId(String label) {
        int h = 5381;
        for (int i = 0; i < label.length(); i++) {
            h = (h * 33) ^ label.charAt(i);
        }
        return Math.abs(h) % 800_000 + 900_000;
    }

    public String mapPhaseTypeForDb(String type) {
        return mapPhaseType(type);
    }

    public String catalogStatut(WcGame game) {
        return mapGameStatut(game, true);
    }

    public SyncTeam resolveSyncTeam(WcGame game, boolean home, Map<String, WcTeam> teamsById) {
        ResolvedTeam team = resolveTeam(game, home, teamsById);
        if (team == null) return null;
        return new SyncTeam(Integer.parseInt(team.id()), team.nom(), team.codePays(), team.logoUrl());
    }

    public String teamCodeForSync(WcTeam team) {
        return teamCode(team);
    }

    public record SyncTeam(int id, String nom, String code, String flag) {}

    private String mapPhaseType(String type) {
        return PHASE_BY_TYPE.getOrDefault(type == null ? "group" : type, "groupes");
    }

    private String extractGroupeLettre(WcGame game) {
        if (!"group".equals(game.type()) || game.group() == null) return null;
        String g = game.group().toUpperCase();
        return g.matches("[A-L]") ? g : null;
    }

    private Integer parseMinute(String timeElapsed) {
        if (timeElapsed == null) return null;
        String te = timeElapsed.toLowerCase();
        if ("notstarted".equals(te) || "finished".equals(te)) return null;
        Matcher m = Pattern.compile("(\\d+)").matcher(timeElapsed);
        return m.find() ? Integer.parseInt(m.group(1)) : null;
    }

    private int parseInt(String value) {
        if (value == null || value.isBlank()) return 0;
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private record ResolvedTeam(String id, String nom, String codePays, String logoUrl) {}
}
