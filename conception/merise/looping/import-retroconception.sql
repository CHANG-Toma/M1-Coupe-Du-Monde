-- Script DDL pour la rétroconception Looping (v4.1+)
-- Projet : Application CDM 2026
--
-- Usage : Looping → Rétroconception → coller ou importer ce fichier
--
-- Associations MERISE (cardinalités min,max) :
--   APPARTIENT    : PHASE (1,1) — MATCH (0,n)
--   SE_DEROULE_A  : STADE (0,1) — MATCH (0,n)
--   JOUE          : EQUIPE (1,1) — MATCH (0,n)  [rôles : domicile, exterieur]
--   CLASSE_DANS   : EQUIPE (1,1) — GROUPE (1,4) [attributs : points, matchs_joues, …]

-- =============================================================================
-- ENTITÉS
-- =============================================================================

CREATE TABLE equipe (
    id_equipe   INTEGER PRIMARY KEY,
    nom         VARCHAR(100) NOT NULL,
    code_pays   CHAR(3) NOT NULL,
    logo_url    VARCHAR(255)
);

CREATE TABLE phase (
    id_phase    INTEGER PRIMARY KEY,
    nom         VARCHAR(50) NOT NULL,
    type        VARCHAR(30) NOT NULL
);

CREATE TABLE stade (
    id_stade    INTEGER PRIMARY KEY,
    nom         VARCHAR(100) NOT NULL,
    ville       VARCHAR(100)
);

CREATE TABLE groupe (
    id_groupe   INTEGER PRIMARY KEY,
    lettre      CHAR(1) NOT NULL
);

CREATE TABLE match_cdm (
    id_match             INTEGER PRIMARY KEY,
    date_heure           TIMESTAMP NOT NULL,
    statut               VARCHAR(20) NOT NULL,
    buts_domicile        INTEGER NOT NULL,
    buts_exterieur       INTEGER NOT NULL,
    id_phase             INTEGER NOT NULL,
    id_stade             INTEGER,
    id_equipe_domicile   INTEGER NOT NULL,
    id_equipe_exterieur  INTEGER NOT NULL
);

-- Table MLD de l'association CLASSE_DANS (porteuse d'attributs)
CREATE TABLE classement (
    id_equipe        INTEGER NOT NULL,
    id_groupe        INTEGER NOT NULL,
    points           INTEGER NOT NULL,
    matchs_joues     INTEGER NOT NULL,
    victoires        INTEGER NOT NULL,
    
    nuls             INTEGER NOT NULL,
    defaites         INTEGER NOT NULL,
    difference_buts  INTEGER NOT NULL,
    PRIMARY KEY (id_equipe, id_groupe)
);

-- =============================================================================
-- ASSOCIATIONS
-- =============================================================================

-- APPARTIENT : une phase contient 0..n matchs, un match appartient à 1..1 phase
ALTER TABLE match_cdm
    ADD CONSTRAINT appartient
    FOREIGN KEY (id_phase) REFERENCES phase(id_phase);

-- SE_DEROULE_A : un stade accueille 0..n matchs, un match se déroule dans 0..1 stade
ALTER TABLE match_cdm
    ADD CONSTRAINT se_deroule_a
    FOREIGN KEY (id_stade) REFERENCES stade(id_stade);

-- JOUE (rôle domicile) : une équipe joue 0..n matchs à domicile, un match a 1..1 équipe domicile
ALTER TABLE match_cdm
    ADD CONSTRAINT joue_domicile
    FOREIGN KEY (id_equipe_domicile) REFERENCES equipe(id_equipe);

-- JOUE (rôle exterieur) : une équipe joue 0..n matchs à l'extérieur, un match a 1..1 équipe extérieure
ALTER TABLE match_cdm
    ADD CONSTRAINT joue_exterieur
    FOREIGN KEY (id_equipe_exterieur) REFERENCES equipe(id_equipe);

-- CLASSE_DANS : une équipe est dans 1..1 groupe, un groupe contient 1..4 équipes
ALTER TABLE classement
    ADD CONSTRAINT classe_dans_equipe
    FOREIGN KEY (id_equipe) REFERENCES equipe(id_equipe);

ALTER TABLE classement
    ADD CONSTRAINT classe_dans_groupe
    FOREIGN KEY (id_groupe) REFERENCES groupe(id_groupe);
