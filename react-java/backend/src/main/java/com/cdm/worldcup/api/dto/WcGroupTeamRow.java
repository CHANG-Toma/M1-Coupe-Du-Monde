package com.cdm.worldcup.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record WcGroupTeamRow(
        String team_id,
        String mp,
        String w,
        String l,
        String d,
        String pts,
        String gf,
        String ga,
        String gd
) {}
