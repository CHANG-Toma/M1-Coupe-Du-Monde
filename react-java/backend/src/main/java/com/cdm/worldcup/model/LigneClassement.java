package com.cdm.worldcup.model;

public record LigneClassement(
        Equipe equipe,
        Groupe groupe,
        int points,
        int matchsJoues,
        int victoires,
        int nuls,
        int defaites,
        int butsPour,
        int butsContre,
        int differenceButs
) {}
