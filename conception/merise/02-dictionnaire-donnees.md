# Dictionnaire de données — MPD

**Projet :** Application de suivi de la Coupe du monde FIFA 2026  
**SGBD cible :** PostgreSQL  
**Source :** `conception/merise/MPD.png` (export Looping)

---

## 1. Vue d'ensemble

| Table | Description | Clé primaire |
| ----- | ----------- | ------------ |
| `equipe` | Sélection nationale participant à la compétition | `id_equipe` |
| `phase` | Étape du tournoi (poules, huitièmes, finale…) | `id_phase` |
| `stade` | Lieu d'accueil d'un match | `id_stade` |
| `groupe` | Poule de la phase de groupes | `id_groupe` |
| `match_cdm` | Rencontre opposant deux équipes | `id_match` |
| `classement` | Statistiques d'une équipe dans un groupe (association CLASSE_DANS au MCD) | (`id_equipe`, `id_groupe`) |

---

## 2. Table `equipe`

**Description :** Représente une équipe nationale.

| Attribut | Type | Taille | Oblig. | Clé | Description |
| -------- | ---- | ------ | ------ | --- | ----------- |
| `id_equipe` | ENTIER | — | Oui | PK | Identifiant unique de l'équipe |
| `nom` | CHAÎNE | 100 | Oui | — | Nom officiel de la sélection (ex. « France ») |
| `code_pays` | CHAÎNE | 3 | Oui | — | Code pays FIFA sur 3 caractères (ex. « FRA ») |
| `logo_url` | CHAÎNE | 255 | Non | — | URL du drapeau ou du logo de l'équipe |

---

## 3. Table `phase`

**Description :** Découpe le tournoi en étapes successives.

| Attribut | Type | Taille | Oblig. | Clé | Description |
| -------- | ---- | ------ | ------ | --- | ----------- |
| `id_phase` | ENTIER | — | Oui | PK | Identifiant unique de la phase |
| `nom` | CHAÎNE | 50 | Oui | — | Libellé affiché (ex. « Phase de groupes », « Finale ») |
| `type` | CHAÎNE | 30 | Oui | — | Code de la phase : `groupes`, `seizieme`, `huitieme`, `quart`, `demi`, `petite_finale`, `finale` |

---

## 4. Table `stade`

**Description :** Stade où peut se dérouler un match.

| Attribut | Type | Taille | Oblig. | Clé | Description |
| -------- | ---- | ------ | ------ | --- | ----------- |
| `id_stade` | ENTIER | — | Oui | PK | Identifiant unique du stade |
| `nom` | CHAÎNE | 100 | Oui | — | Nom du stade (ex. « MetLife Stadium ») |
| `ville` | CHAÎNE | 100 | Non | — | Ville d'implantation du stade |

---

## 5. Table `groupe`

**Description :** Poule de la phase de groupes (lettre A à L en CDM 2026).

| Attribut | Type | Taille | Oblig. | Clé | Description |
| -------- | ---- | ------ | ------ | --- | ----------- |
| `id_groupe` | ENTIER | — | Oui | PK | Identifiant unique du groupe |
| `lettre` | CHAÎNE | 1 | Oui | — | Lettre du groupe (ex. « A », « B ») |

---

## 6. Table `match_cdm`

**Description :** Rencontre entre deux équipes. Le score est porté directement par les attributs `buts_domicile` et `buts_exterieur`.

| Attribut | Type | Taille | Oblig. | Clé | Description |
| -------- | ---- | ------ | ------ | --- | ----------- |
| `id_match` | ENTIER | — | Oui | PK | Identifiant unique du match |
| `date_heure` | DATE/HEURE | — | Oui | — | Date et heure de coup d'envoi (fuseau horaire inclus) |
| `statut` | CHAÎNE | 20 | Oui | — | État du match : `a_venir`, `en_cours`, `termine` |
| `buts_domicile` | ENTIER | — | Oui | — | Nombre de buts marqués par l'équipe à domicile (≥ 0) |
| `buts_exterieur` | ENTIER | — | Oui | — | Nombre de buts marqués par l'équipe à l'extérieur (≥ 0) |
| `id_phase` | ENTIER | — | Oui | FK → `phase` | Phase à laquelle appartient le match (association **APPARTIENT**) |
| `id_stade` | ENTIER | — | Non | FK → `stade` | Stade d'accueil du match, optionnel (association **SE_DEROULE_A**) |
| `id_equipe_domicile` | ENTIER | — | Oui | FK → `equipe` | Équipe recevante (association **JOUE**, rôle domicile) |
| `id_equipe_exterieur` | ENTIER | — | Oui | FK → `equipe` | Équipe visiteuse (association **JOUE**, rôle extérieur) |

**Règles métier :**

- `id_equipe_domicile` ≠ `id_equipe_exterieur`
- Un match oppose exactement deux équipes distinctes
- Un match appartient à une et une seule phase

---

## 7. Table `classement`

**Description :** Ligne de classement d'une équipe dans un groupe. Correspond à l'association **CLASSE_DANS** du MCD (1 équipe, 1 groupe par ligne ; 1 à 4 équipes par groupe).

| Attribut | Type | Taille | Oblig. | Clé | Description |
| -------- | ---- | ------ | ------ | --- | ----------- |
| `id_equipe` | ENTIER | — | Oui | PK, FK → `equipe` | Équipe classée |
| `id_groupe` | ENTIER | — | Oui | PK, FK → `groupe` | Groupe concerné |
| `points` | ENTIER | — | Oui | — | Total de points (3 victoire, 1 nul, 0 défaite) |
| `matchs_joues` | ENTIER | — | Oui | — | Nombre de matchs disputés dans le groupe |
| `victoires` | ENTIER | — | Oui | — | Nombre de victoires |
| `nuls` | ENTIER | — | Oui | — | Nombre de matchs nuls |
| `defaites` | ENTIER | — | Oui | — | Nombre de défaites |
| `difference_buts` | ENTIER | — | Oui | — | Différence de buts (buts marqués − buts encaissés) |

**Règles métier :**

- Couple (`id_equipe`, `id_groupe`) unique
- Une équipe ne figure qu'une fois par groupe

---

## 8. Relations (clés étrangères)

| Table source | Attribut | Table cible | Attribut cible | Association MERISE |
| ------------ | -------- | ----------- | -------------- | ------------------ |
| `match_cdm` | `id_phase` | `phase` | `id_phase` | APPARTIENT |
| `match_cdm` | `id_stade` | `stade` | `id_stade` | SE_DEROULE_A |
| `match_cdm` | `id_equipe_domicile` | `equipe` | `id_equipe` | JOUE (domicile) |
| `match_cdm` | `id_equipe_exterieur` | `equipe` | `id_equipe` | JOUE (extérieur) |
| `classement` | `id_equipe` | `equipe` | `id_equipe` | CLASSE_DANS |
| `classement` | `id_groupe` | `groupe` | `id_groupe` | CLASSE_DANS |

---

## 9. Légende

| Abréviation | Signification |
| ----------- | ------------- |
| PK | Clé primaire |
| FK | Clé étrangère |
| Oblig. | Champ obligatoire (NOT NULL) |
