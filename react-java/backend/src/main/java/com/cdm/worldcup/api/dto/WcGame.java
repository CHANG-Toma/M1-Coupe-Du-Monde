package com.cdm.worldcup.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record WcGame(
        String id,
        String home_team_id,
        String away_team_id,
        String home_team_name_en,
        String away_team_name_en,
        String home_team_label,
        String away_team_label,
        String home_score,
        String away_score,
        String group,
        String local_date,
        String stadium_id,
        String finished,
        String time_elapsed,
        String type
) {}
