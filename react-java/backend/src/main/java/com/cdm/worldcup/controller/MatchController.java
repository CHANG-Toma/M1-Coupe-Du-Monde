package com.cdm.worldcup.controller;

import com.cdm.worldcup.model.ErrorResponse;
import com.cdm.worldcup.model.MatchResponse;
import com.cdm.worldcup.model.MatchesResponse;
import com.cdm.worldcup.service.MatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @GetMapping
    public MatchesResponse getMatches(
            @RequestParam(required = false) String phase,
            @RequestParam(required = false) String equipeId,
            @RequestParam(required = false, defaultValue = "false") boolean live
    ) {
        var matches = matchService.getMatches(phase, equipeId, live);
        return new MatchesResponse(matches, matches.size(), matchService.getLastSource());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMatchById(@PathVariable String id) {
        return matchService.getMatchById(id)
                .<ResponseEntity<?>>map(m -> ResponseEntity.ok(new MatchResponse(m, matchService.getLastSource())))
                .orElseGet(() -> ResponseEntity.status(404).body(new ErrorResponse("Match introuvable.")));
    }
}
