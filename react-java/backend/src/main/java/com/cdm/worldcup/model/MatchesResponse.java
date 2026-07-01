package com.cdm.worldcup.model;

import java.util.List;

public record MatchesResponse(List<Match> data, int total, String source) {}
