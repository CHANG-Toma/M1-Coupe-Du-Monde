-- =============================================================================
-- CDM 2026 — Données initiales (seed)
-- =============================================================================

-- =============================================================================
-- PHASES
-- =============================================================================
INSERT INTO phase (id_phase, nom, type, ordre) VALUES
  (1, 'Phase de groupes',    'groupes',       1),
  (2, 'Seizièmes de finale', 'seizieme',      2),
  (3, 'Huitièmes de finale', 'huitieme',      3),
  (4, 'Quarts de finale',    'quart',         4),
  (5, 'Demi-finales',        'demi',          5),
  (6, 'Petite finale',       'petite_finale', 6),
  (7, 'Finale',              'finale',        7)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- GROUPES (A à L — CDM 2026 : 48 équipes, 12 groupes)
-- =============================================================================
INSERT INTO groupe (id_groupe, lettre) VALUES
  (1,'A'),(2,'B'),(3,'C'),(4,'D'),(5,'E'),(6,'F'),
  (7,'G'),(8,'H'),(9,'I'),(10,'J'),(11,'K'),(12,'L')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- STADES
-- =============================================================================
INSERT INTO stade (id_stade, nom, ville) VALUES
  (1,  'MetLife Stadium',        'New York / New Jersey'),
  (2,  'SoFi Stadium',           'Los Angeles'),
  (3,  'AT&T Stadium',           'Dallas'),
  (4,  'Arrowhead Stadium',      'Kansas City'),
  (5,  'Alamodome',              'San Antonio'),
  (6,  'Levi''s Stadium',        'San Francisco'),
  (7,  'Lumen Field',            'Seattle'),
  (8,  'Empower Field',          'Denver'),
  (9,  'NRG Stadium',            'Houston'),
  (10, 'Hard Rock Stadium',      'Miami'),
  (11, 'Lincoln Financial Field','Philadelphie'),
  (12, 'Gillette Stadium',       'Boston'),
  (13, 'BMO Field',              'Toronto'),
  (14, 'BC Place',               'Vancouver'),
  (15, 'Estadio Azteca',         'Mexico'),
  (16, 'Estadio Akron',          'Guadalajara')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- ÉQUIPES (sélection des groupes A–F)
-- =============================================================================
INSERT INTO equipe (id_equipe, nom, code_pays, logo_url) VALUES
  -- Groupe A
  (1,  'Mexique',         'mx', 'https://flagcdn.com/mx.svg'),
  (2,  'Équateur',        'ec', 'https://flagcdn.com/ec.svg'),
  (3,  'Suisse',          'ch', 'https://flagcdn.com/ch.svg'),
  (4,  'Maroc',           'ma', 'https://flagcdn.com/ma.svg'),
  -- Groupe B
  (5,  'Argentine',       'ar', 'https://flagcdn.com/ar.svg'),
  (6,  'Islande',         'is', 'https://flagcdn.com/is.svg'),
  (7,  'Canada',          'ca', 'https://flagcdn.com/ca.svg'),
  (8,  'Pérou',           'pe', 'https://flagcdn.com/pe.svg'),
  -- Groupe C
  (9,  'États-Unis',      'us', 'https://flagcdn.com/us.svg'),
  (10, 'Jamaïque',        'jm', 'https://flagcdn.com/jm.svg'),
  (11, 'Uruguay',         'uy', 'https://flagcdn.com/uy.svg'),
  (12, 'Bolivie',         'bo', 'https://flagcdn.com/bo.svg'),
  -- Groupe D
  (13, 'France',          'fr', 'https://flagcdn.com/fr.svg'),
  (14, 'Belgique',        'be', 'https://flagcdn.com/be.svg'),
  (15, 'Paraguay',        'py', 'https://flagcdn.com/py.svg'),
  (16, 'Arabie Saoudite', 'sa', 'https://flagcdn.com/sa.svg'),
  -- Groupe E
  (17, 'Espagne',         'es', 'https://flagcdn.com/es.svg'),
  (18, 'Portugal',        'pt', 'https://flagcdn.com/pt.svg'),
  (19, 'Côte d''Ivoire',  'ci', 'https://flagcdn.com/ci.svg'),
  (20, 'Nigeria',         'ng', 'https://flagcdn.com/ng.svg'),
  -- Groupe F
  (21, 'Allemagne',       'de', 'https://flagcdn.com/de.svg'),
  (22, 'Angleterre',      'gb-eng', 'https://flagcdn.com/gb-eng.svg'),
  (23, 'Serbie',          'rs', 'https://flagcdn.com/rs.svg'),
  (24, 'Cameroun',        'cm', 'https://flagcdn.com/cm.svg'),
  -- Équipes supplémentaires (tableau éliminatoire)
  (29, 'Pays-Bas',        'nl', 'https://flagcdn.com/nl.svg')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- MATCHS — Groupe A (terminés)
-- =============================================================================
INSERT INTO match_cdm (id_match, date_heure, statut, buts_domicile, buts_exterieur, id_phase, id_stade, id_groupe, id_equipe_domicile, id_equipe_exterieur) VALUES
  (1,  '2026-06-11 22:00:00+00', 'termine', 2, 1,  1, 15, 1,  1,  3),
  (2,  '2026-06-12 19:00:00+00', 'termine', 1, 1,  1,  9, 1,  2,  4),
  (3,  '2026-06-17 19:00:00+00', 'termine', 0, 2,  1, 10, 1,  3,  4),
  (4,  '2026-06-17 22:00:00+00', 'termine', 3, 0,  1, 15, 1,  1,  2),
  (5,  '2026-06-22 19:00:00+00', 'termine', 2, 2,  1,  3, 1,  1,  4),
  (6,  '2026-06-22 19:00:00+00', 'termine', 1, 3,  1,  7, 1,  2,  3)
ON CONFLICT DO NOTHING;

-- Groupe B (terminés)
INSERT INTO match_cdm (id_match, date_heure, statut, buts_domicile, buts_exterieur, id_phase, id_stade, id_groupe, id_equipe_domicile, id_equipe_exterieur) VALUES
  (7,  '2026-06-12 22:00:00+00', 'termine', 3, 0,  1,  1, 2,  5,  8),
  (8,  '2026-06-13 19:00:00+00', 'termine', 1, 1,  1, 13, 2,  7,  6),
  (9,  '2026-06-18 22:00:00+00', 'termine', 2, 0,  1,  1, 2,  5,  6),
  (10, '2026-06-18 19:00:00+00', 'termine', 2, 1,  1, 14, 2,  7,  8),
  (11, '2026-06-23 19:00:00+00', 'termine', 1, 0, 1,  1, 2,  5,  7),
  (12, '2026-06-23 19:00:00+00', 'termine', 0, 0, 1, 12, 2,  6,  8)
ON CONFLICT DO NOTHING;

-- Groupe C (à venir)
INSERT INTO match_cdm (id_match, date_heure, statut, buts_domicile, buts_exterieur, id_phase, id_stade, id_groupe, id_equipe_domicile, id_equipe_exterieur) VALUES
  (13, '2026-06-13 22:00:00+00', 'termine', 3, 1, 1,  2, 3,  9, 10),
  (14, '2026-06-14 19:00:00+00', 'termine', 2, 0, 1,  4, 3, 11, 12),
  (15, '2026-06-19 19:00:00+00', 'termine', 1, 2, 1,  6, 3,  9, 11),
  (16, '2026-06-19 22:00:00+00', 'termine', 2, 0, 1, 10, 3, 10, 12),
  (17, NOW() + INTERVAL '8 hours',  'a_venir', 0, 0, 1,  2, 3,  9, 12),
  (18, NOW() + INTERVAL '8 hours',  'a_venir', 0, 0, 1,  3, 3, 10, 11)
ON CONFLICT DO NOTHING;

-- Groupe D (à venir)
INSERT INTO match_cdm (id_match, date_heure, statut, buts_domicile, buts_exterieur, id_phase, id_stade, id_groupe, id_equipe_domicile, id_equipe_exterieur) VALUES
  (19, '2026-06-14 22:00:00+00', 'termine', 2, 0, 1,  1, 4, 13, 16),
  (20, '2026-06-14 19:00:00+00', 'termine', 1, 1, 1, 11, 4, 14, 15),
  (21, '2026-06-19 19:00:00+00', 'termine', 3, 1, 1,  9, 4, 13, 15),
  (22, '2026-06-19 22:00:00+00', 'termine', 3, 0, 1, 10, 4, 14, 16),
  (23, NOW() + INTERVAL '32 hours', 'a_venir', 0, 0, 1,  1, 4, 13, 14),
  (24, NOW() + INTERVAL '32 hours', 'a_venir', 0, 0, 1,  8, 4, 15, 16)
ON CONFLICT DO NOTHING;

-- Seizièmes de finale (à venir)
INSERT INTO match_cdm (id_match, date_heure, statut, buts_domicile, buts_exterieur, id_phase, id_stade, id_equipe_domicile, id_equipe_exterieur) VALUES
  (101, NOW() + INTERVAL '6 days',  'a_venir', 0, 0, 2, 15,  1, 14),
  (102, NOW() + INTERVAL '7 days',  'a_venir', 0, 0, 2,  1, 13,  4),
  (103, NOW() + INTERVAL '8 days',  'a_venir', 0, 0, 2,  2,  5, 11),
  (104, NOW() + INTERVAL '8 days',  'a_venir', 0, 0, 2,  3, 18, 29)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- CLASSEMENTS (groupes A–F)
-- =============================================================================
INSERT INTO classement (id_equipe, id_groupe, points, matchs_joues, victoires, nuls, defaites, buts_pour, buts_contre, difference_buts) VALUES
  -- Groupe A
  (1, 1, 7, 3, 2, 1, 0, 7, 3,  4),
  (4, 1, 5, 3, 1, 2, 0, 4, 3,  1),
  (3, 1, 4, 3, 1, 1, 1, 4, 4,  0),
  (2, 1, 1, 3, 0, 1, 2, 2, 7, -5),
  -- Groupe B
  (5, 2, 7, 3, 2, 1, 0, 6, 1,  5),
  (7, 2, 5, 3, 1, 2, 0, 4, 3,  1),
  (6, 2, 2, 3, 0, 2, 1, 1, 3, -2),
  (8, 2, 0, 3, 0, 0, 3, 1, 5, -4),
  -- Groupe C
  (11, 3, 6, 2, 2, 0, 0, 4, 1,  3),
  (10, 3, 4, 2, 1, 1, 0, 3, 3,  0),
  (9,  3, 3, 2, 1, 0, 1, 4, 3,  1),
  (12, 3, 0, 2, 0, 0, 2, 0, 4, -4),
  -- Groupe D
  (13, 4, 6, 2, 2, 0, 0, 5, 1,  4),
  (14, 4, 4, 2, 1, 1, 0, 4, 1,  3),
  (15, 4, 1, 2, 0, 1, 1, 2, 4, -2),
  (16, 4, 0, 2, 0, 0, 2, 0, 5, -5),
  -- Groupe E
  (17, 5, 5, 2, 1, 2, 0, 4, 3,  1),
  (18, 5, 4, 2, 1, 1, 0, 3, 2,  1),
  (19, 5, 1, 2, 0, 1, 1, 2, 3, -1),
  (20, 5, 1, 2, 0, 1, 1, 1, 2, -1),
  -- Groupe F
  (22, 6, 6, 2, 2, 0, 0, 3, 1,  2),
  (23, 6, 3, 2, 1, 0, 1, 3, 2,  1),
  (21, 6, 3, 2, 1, 0, 1, 5, 3,  2),
  (24, 6, 0, 2, 0, 0, 2, 2, 7, -5)
ON CONFLICT DO NOTHING;
