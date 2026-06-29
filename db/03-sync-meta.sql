-- =============================================================================
-- CDM 2026 — Métadonnées de synchronisation API → BDD
-- =============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_stade_nom ON stade (nom);

CREATE TABLE IF NOT EXISTS sync_meta (
    id                 SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    last_synced_at     TIMESTAMPTZ NOT NULL DEFAULT '1970-01-01',
    live_match_count   SMALLINT    NOT NULL DEFAULT 0,
    match_count        INTEGER     NOT NULL DEFAULT 0
);

INSERT INTO sync_meta (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
