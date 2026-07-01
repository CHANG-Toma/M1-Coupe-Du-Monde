package com.cdm.worldcup.controller;

import com.cdm.worldcup.model.ErrorResponse;
import com.cdm.worldcup.model.StandingsResponse;
import com.cdm.worldcup.service.StandingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/standings")
public class StandingController {

    private final StandingService standingService;

    public StandingController(StandingService standingService) {
        this.standingService = standingService;
    }

    @GetMapping
    public ResponseEntity<?> getStandings(@RequestParam(required = false) String group) {
        if (group != null && !group.isBlank()) {
            return standingService.getStandingsByGroup(group.toUpperCase())
                    .<ResponseEntity<?>>map(g -> ResponseEntity.ok(new StandingsResponse(List.of(g), standingService.getLastSource())))
                    .orElseGet(() -> ResponseEntity.status(404).body(new ErrorResponse("Groupe introuvable.")));
        }

        var standings = standingService.getStandings();
        return ResponseEntity.ok(new StandingsResponse(standings, standingService.getLastSource()));
    }
}
