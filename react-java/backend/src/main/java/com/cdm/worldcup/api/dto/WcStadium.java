package com.cdm.worldcup.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record WcStadium(
        String id,
        String name_en,
        String city_en
) {}
