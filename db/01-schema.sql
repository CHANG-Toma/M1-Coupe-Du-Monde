-- =============================================================================
-- CDM 2026 — Schéma PostgreSQL
-- Basé sur le MPD MERISE (conception/merise/looping/import-retroconception.sql)
-- Améliorations : colonne ordre sur phase, id_groupe sur match_cdm,
--                 buts_pour/buts_contre sur classement, indexes de performance
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS equipe (
    id_equipe   SERIAL PRIMARY KEY,
    nom         VARCHAR(100) NOT NULL,
    code_pays   VARCHAR(6)   NOT NULL,  -- ex: 'fr', 'gb-eng'
    logo_url    VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS phase (
    id_phase    SERIAL PRIMARY KEY,
    nom         VARCHAR(50)  NOT NULL,
    type        VARCHAR(30)  NOT NULL  CHECK (type IN (
                    'groupes','seizieme','huitieme','quart','demi','petite_finale','finale'
                )),
    ordre       SMALLINT     NOT NULL  -- pour le tri d'affichage
);

CREATE TABLE IF NOT EXISTS stade (
    id_stade    SERIAL PRIMARY KEY,
    nom         VARCHAR(100) NOT NULL,
    ville       VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS groupe (
    id_groupe   SERIAL PRIMARY KEY,
    lettre      CHAR(1)      NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS match_cdm (
    id_match             SERIAL PRIMARY KEY,
    date_heure           TIMESTAMPTZ  NOT NULL,
    statut               VARCHAR(20)  NOT NULL DEFAULT 'a_venir'
                             CHECK (statut IN ('a_venir','en_cours','termine')),
    buts_domicile        SMALLINT     NOT NULL DEFAULT 0 CHECK (buts_domicile >= 0),
    buts_exterieur       SMALLINT     NOT NULL DEFAULT 0 CHECK (buts_exterieur >= 0),
    minute_jeu           SMALLINT,
    id_phase             INTEGER      NOT NULL REFERENCES phase(id_phase),
    id_stade             INTEGER               REFERENCES stade(id_stade),
    id_groupe            INTEGER               REFERENCES groupe(id_groupe),
    id_equipe_domicile   INTEGER      NOT NULL REFERENCES equipe(id_equipe),
    id_equipe_exterieur  INTEGER      NOT NULL REFERENCES equipe(id_equipe),
    CONSTRAINT equipes_differentes CHECK (id_equipe_domicile <> id_equipe_exterieur)
);

CREATE TABLE IF NOT EXISTS classement (
    id_equipe        INTEGER  NOT NULL REFERENCES equipe(id_equipe),
    id_groupe        INTEGER  NOT NULL REFERENCES groupe(id_groupe),
    points           SMALLINT NOT NULL DEFAULT 0,
    matchs_joues     SMALLINT NOT NULL DEFAULT 0,
    victoires        SMALLINT NOT NULL DEFAULT 0,
    nuls             SMALLINT NOT NULL DEFAULT 0,
    defaites         SMALLINT NOT NULL DEFAULT 0,
    buts_pour        SMALLINT NOT NULL DEFAULT 0,
    buts_contre      SMALLINT NOT NULL DEFAULT 0,
    difference_buts  SMALLINT NOT NULL DEFAULT 0,
    PRIMARY KEY (id_equipe, id_groupe)
);

-- =============================================================================
-- INDEX DE PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_match_phase    ON match_cdm(id_phase);
CREATE INDEX IF NOT EXISTS idx_match_statut   ON match_cdm(statut);
CREATE INDEX IF NOT EXISTS idx_match_date     ON match_cdm(date_heure);
CREATE INDEX IF NOT EXISTS idx_match_groupe   ON match_cdm(id_groupe);
CREATE INDEX IF NOT EXISTS idx_classement_grp ON classement(id_groupe);
