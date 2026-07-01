package com.cdm.worldcup.model;

import java.util.List;

public record GroupeClassement(Groupe groupe, List<LigneClassement> classement) {}
