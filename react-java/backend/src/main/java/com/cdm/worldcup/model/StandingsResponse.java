package com.cdm.worldcup.model;

import java.util.List;

public record StandingsResponse(List<GroupeClassement> data, String source) {}
