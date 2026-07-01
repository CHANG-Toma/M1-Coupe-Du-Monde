package com.cdm.worldcup.api;

import com.cdm.worldcup.api.dto.*;
import com.cdm.worldcup.config.AppProperties;
import com.cdm.worldcup.model.GroupeClassement;
import com.cdm.worldcup.model.Match;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WorldCup2026Client {

    private static final Logger log = LoggerFactory.getLogger(WorldCup2026Client.class);

    private final RestClient restClient;
    private final WorldCup2026Mapper mapper;
    private final ObjectMapper objectMapper;
    private final long cacheTtlMs;

    private volatile CatalogCache catalogCache;

    public WorldCup2026Client(
            RestClient worldCupRestClient,
            WorldCup2026Mapper mapper,
            ObjectMapper objectMapper,
            AppProperties properties
    ) {
        this.restClient = worldCupRestClient;
        this.mapper = mapper;
        this.objectMapper = objectMapper;
        this.cacheTtlMs = properties.getWorldcup2026().getCacheTtlMs();
    }

    public List<Match> getCatalogMatches(String phase, String equipeId) {
        CatalogData data = getCatalogData();
        return data.matches().stream()
                .filter(m -> phase == null || phase.isBlank() || phase.equals(m.phase().type()))
                .filter(m -> equipeId == null || equipeId.isBlank()
                        || equipeId.equals(m.equipeDomicile().id())
                        || equipeId.equals(m.equipeExterieur().id()))
                .sorted(Comparator.comparing(m -> Instant.parse(m.dateHeure())))
                .toList();
    }

    public List<Match> getLiveMatches() {
        CatalogData data = loadCatalogData();
        return data.games().stream()
                .filter(mapper::isWorldCupGameLive)
                .map(game -> mapper.mapGameToMatch(game, data.teamsById(), data.stadiumsById(), false))
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(m -> Instant.parse(m.dateHeure())))
                .toList();
    }

    public Optional<Match> getMatchById(String id) {
        try {
            WcGame game = fetchGameById(id);
            if (game != null) {
                return Optional.ofNullable(mapSingleGame(game));
            }
        } catch (RestClientException e) {
            log.debug("[worldcup2026] /get/game/{} indisponible, recherche dans le catalogue", id);
        }

        return getCatalogData().matches().stream()
                .filter(m -> id.equals(m.id()))
                .findFirst()
                .map(catalogMatch -> {
                    if ("en_cours".equals(catalogMatch.statut())) {
                        return mapSingleGameFromCatalog(id).orElse(catalogMatch);
                    }
                    return catalogMatch;
                });
    }

    private Optional<Match> mapSingleGameFromCatalog(String id) {
        CatalogData data = loadCatalogData();
        WcGame game = data.games().stream()
                .filter(g -> id.equals(String.valueOf(g.id())))
                .findFirst()
                .orElse(null);
        if (game == null) return Optional.empty();
        return Optional.ofNullable(mapper.mapGameToMatch(game, data.teamsById(), data.stadiumsById(), false));
    }

    private Match mapSingleGame(WcGame game) {
        Map<String, WcTeam> teams = fetchTeams().stream()
                .collect(Collectors.toMap(WcTeam::id, t -> t, (a, b) -> a));
        Map<String, WcStadium> stadiums = fetchStadiums().stream()
                .collect(Collectors.toMap(WcStadium::id, s -> s, (a, b) -> a));
        boolean catalogOnly = !mapper.isWorldCupGameLive(game);
        return mapper.mapGameToMatch(game, teams, stadiums, catalogOnly);
    }

    public List<GroupeClassement> getStandings() {
        CatalogData data = getCatalogData();
        return data.standings();
    }

    public RawCatalog fetchRawCatalog() {
        return new RawCatalog(fetchTeams(), fetchGames(), fetchGroups(), fetchStadiums());
    }

    public record RawCatalog(
            List<WcTeam> teams,
            List<WcGame> games,
            List<WcGroup> groups,
            List<WcStadium> stadiums
    ) {}

    public Optional<GroupeClassement> getStandingsByGroup(String lettre) {
        return getStandings().stream()
                .filter(g -> lettre.equalsIgnoreCase(g.groupe().lettre()))
                .findFirst();
    }

    private CatalogData getCatalogData() {
        CatalogCache cache = catalogCache;
        if (cache != null && !cache.isExpired(cacheTtlMs)) {
            return cache.data();
        }
        synchronized (this) {
            cache = catalogCache;
            if (cache != null && !cache.isExpired(cacheTtlMs)) {
                return cache.data();
            }
            CatalogData data = loadCatalogData();
            catalogCache = new CatalogCache(data, Instant.now());
            return data;
        }
    }

    private CatalogData loadCatalogData() {
        List<WcTeam> teams = fetchTeams();
        List<WcStadium> stadiums = fetchStadiums();
        List<WcGame> games = fetchGames();
        List<WcGroup> groups = fetchGroups();

        Map<String, WcTeam> teamsById = teams.stream()
                .collect(Collectors.toMap(WcTeam::id, t -> t, (a, b) -> a));
        Map<String, WcStadium> stadiumsById = stadiums.stream()
                .collect(Collectors.toMap(WcStadium::id, s -> s, (a, b) -> a));

        List<Match> matches = games.stream()
                .map(game -> mapper.mapGameToMatch(game, teamsById, stadiumsById, true))
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(m -> Instant.parse(m.dateHeure())))
                .toList();

        List<GroupeClassement> standings = mapper.mapGroupsToStandings(groups, teamsById);

        log.info("[worldcup2026] Catalogue chargé : {} matchs, {} groupes", matches.size(), standings.size());
        return new CatalogData(games, teamsById, stadiumsById, matches, standings);
    }

    private List<WcTeam> fetchTeams() {
        JsonNode node = restClient.get()
                .uri("/get/teams")
                .retrieve()
                .body(JsonNode.class);

        if (node == null) return List.of();
        if (node.isArray()) {
            return objectMapper.convertValue(node, new TypeReference<List<WcTeam>>() {});
        }
        if (node.has("teams")) {
            return objectMapper.convertValue(node.get("teams"), new TypeReference<List<WcTeam>>() {});
        }
        return List.of();
    }

    private List<WcStadium> fetchStadiums() {
        WcStadiumsResponse response = restClient.get()
                .uri("/get/stadiums")
                .retrieve()
                .body(WcStadiumsResponse.class);
        return response != null && response.stadiums() != null ? response.stadiums() : List.of();
    }

    private List<WcGame> fetchGames() {
        WcGamesResponse response = restClient.get()
                .uri("/get/games")
                .retrieve()
                .body(WcGamesResponse.class);
        return response != null && response.games() != null ? response.games() : List.of();
    }

    private List<WcGroup> fetchGroups() {
        WcGroupsResponse response = restClient.get()
                .uri("/get/groups")
                .retrieve()
                .body(WcGroupsResponse.class);
        return response != null && response.groups() != null ? response.groups() : List.of();
    }

    private WcGame fetchGameById(String id) {
        try {
            WcGameResponse wrapped = restClient.get()
                    .uri("/get/game/{id}", id)
                    .retrieve()
                    .body(WcGameResponse.class);
            if (wrapped != null && wrapped.game() != null && wrapped.game().id() != null) {
                return wrapped.game();
            }
        } catch (RestClientException ignored) {
            // fallback direct body
        }

        WcGame direct = restClient.get()
                .uri("/get/game/{id}", id)
                .retrieve()
                .body(WcGame.class);
        return direct != null && direct.id() != null ? direct : null;
    }

    private record CatalogData(
            List<WcGame> games,
            Map<String, WcTeam> teamsById,
            Map<String, WcStadium> stadiumsById,
            List<Match> matches,
            List<GroupeClassement> standings
    ) {}

    private record CatalogCache(CatalogData data, Instant loadedAt) {
        boolean isExpired(long ttlMs) {
            return Instant.now().toEpochMilli() - loadedAt.toEpochMilli() >= ttlMs;
        }
    }
}
