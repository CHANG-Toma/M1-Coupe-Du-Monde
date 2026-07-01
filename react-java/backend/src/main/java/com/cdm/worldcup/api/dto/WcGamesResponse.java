package com.cdm.worldcup.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record WcGamesResponse(List<WcGame> games) {}
