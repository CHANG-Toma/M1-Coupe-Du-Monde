package com.cdm.worldcup.model;

public record Match(
        String id,
        String dateHeure,
        String statut,
        int scoreDomicile,
        int scoreExterieur,
        Equipe equipeDomicile,
        Equipe equipeExterieur,
        Phase phase,
        Stade stade,
        Groupe groupe,
        Integer minuteJeu
) {
    public Match withLiveState(String dateHeure, int minuteJeu, int scoreDomicile, int scoreExterieur) {
        return new Match(
                id, dateHeure, statut, scoreDomicile, scoreExterieur,
                equipeDomicile, equipeExterieur, phase, stade, groupe, minuteJeu
        );
    }
}
