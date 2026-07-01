package com.cdm.worldcup.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record WcTeam(
        String id,
        String name_en,
        String flag,
        String fifa_code,
        String iso2,
        String groups
) {}
