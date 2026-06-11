# Conception système — Diagrammes UML

---

## 1. Diagramme de cas d'utilisation

**Acteur :** Utilisateur (supporter, grand public)

```mermaid
flowchart TB
    subgraph Acteur
        U((Utilisateur))
    end

    subgraph "Application CDM 2026"
        UC1[Consulter les matchs par phase]
        UC2[Consulter le détail d'un match]
        UC3[Suivre un match en temps réel]
        UC4[Consulter le classement des groupes]
        UC5[Consulter le tableau éliminatoire]
        UC6[Naviguer entre phases et matchs]
    end

    U --> UC1
    U --> UC2
    U --> UC4
    U --> UC5
    U --> UC6

    UC2 -.->|« include »| UC6
    UC1 -.->|« include »| UC6
    UC3 -.->|« extend »| UC2
    UC3 -.->|« extend »| UC1
```

| Cas d'utilisation | Description |
| ----------------- | ----------- |
| Consulter les matchs par phase | Filtrer et afficher les matchs d'une phase (groupes → finale) |
| Consulter le détail d'un match | Afficher équipes, date, stade, score, statut |
| Suivre un match en temps réel | Mise à jour automatique du score et du statut (polling) |
| Consulter le classement des groupes | Tableau des groupes (points, matchs joués, etc.) |
| Consulter le tableau éliminatoire | Visualiser les phases finales |
| Naviguer entre phases et matchs | Parcours menu → liste → détail → retour |

---

## 2. Diagrammes de séquence

### 2.1. Consultation d'une liste de matchs

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant UI as Interface (Page Matchs)
    participant API as API Route /api/matches
    participant SVC as MatchService
    participant EXT as API Football externe

    U->>UI: Sélectionne une phase
    UI->>API: GET /api/matches?phase=groupes
    API->>SVC: getMatchesByPhase(phase)
    SVC->>EXT: Requête HTTP (clé API serveur)
    EXT-->>SVC: JSON brut
    SVC->>SVC: Validation des données
    SVC-->>API: Liste de matchs typée
    API-->>UI: JSON validé
    UI-->>U: Affiche les cartes match
```

### 2.2. Mise à jour en temps réel d'un score

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant UI as Client Component
    participant API as API Route /api/matches/[id]
    participant SVC as MatchService
    participant EXT as API Football externe

    Note over UI: Polling actif (toutes les 10-30 s)

    loop Tant que match en cours
        UI->>API: GET /api/matches/123
        API->>SVC: getMatchById(123)
        SVC->>EXT: Requête HTTP
        EXT-->>SVC: JSON (score, statut)
        SVC->>SVC: Validation
        SVC-->>API: Match mis à jour
        API-->>UI: JSON
        UI->>UI: Compare avec état précédent
        alt Score ou statut modifié
            UI-->>U: Met à jour l'affichage
        else Aucun changement
            UI-->>UI: Pas de re-render
        end
    end
```

---

## 3. Diagrammes d'activité

### 3.1. Navigation entre les phases

```mermaid
flowchart TD
    A([Ouverture de l'application]) --> B[Afficher le menu des phases]
    B --> C{Utilisateur sélectionne une phase}
    C --> D[Charger les matchs de la phase]
    D --> E{Données disponibles ?}
    E -->|Oui| F[Afficher la liste des matchs]
    E -->|Non| G[Afficher message : aucun match]
    F --> H{Action utilisateur}
    H -->|Clic sur un match| I[Ouvrir page détail]
    H -->|Changement de phase| C
    H -->|Menu Classements| J[Afficher classements]
    H -->|Menu Tableau| K[Afficher tableau éliminatoire]
    I --> L{Retour ?}
    L -->|Oui| F
```

### 3.2. Affichage d'un match en cours

```mermaid
flowchart TD
    A([Page détail match]) --> B{Récupérer les données}
    B --> C{Statut du match ?}
    C -->|À venir| D[Afficher équipes, date, stade<br/>Masquer le score]
    C -->|En cours| E[Afficher score + badge En cours]
    C -->|Terminé| F[Afficher score final + badge Terminé]
    E --> G[Démarrer le polling]
    G --> H[Attendre intervalle 10-30 s]
    H --> I[Requête API /api/matches/id]
    I --> J{Score ou statut changé ?}
    J -->|Oui| K[Mettre à jour l'affichage]
    J -->|Non| H
    K --> L{Match terminé ?}
    L -->|Non| H
    L -->|Oui| M[Arrêter le polling]
    M --> F
```

---

## 4. Diagramme de classes

Modèle applicatif (domaine + services). Les composants UI React ne sont pas détaillés ici.

```mermaid
classDiagram
    class Match {
        +string id
        +Date dateHeure
        +string statut
        +int scoreDomicile
        +int scoreExterieur
        +getScoreAffiche() string
    }

    class Equipe {
        +string id
        +string nom
        +string codePays
        +string logoUrl
    }

    class Phase {
        +string id
        +string nom
        +string type
    }

    class Stade {
        +string nom
        +string ville
    }

    class Classement {
        +int points
        +int matchsJoues
        +int victoires
        +int nuls
        +int defaites
        +int differenceButs
    }

    class Groupe {
        +string lettre
    }

    class MatchService {
        +getMatchesByPhase(phaseId) Match[]
        +getMatchById(id) Match
    }

    class StandingService {
        +getStandings() Classement[]
        +getStandingsByGroup(groupeId) Classement[]
    }

    class ApiFootballClient {
        -string apiKey
        +fetchMatches(params) object
        +fetchStandings() object
        +fetchMatchById(id) object
    }

    Match "2" --> "2" Equipe : oppose
    Match --> Phase : appartient à
    Match --> Stade : se joue à
    Classement --> Equipe : concerne
    Classement --> Groupe : dans
    MatchService --> ApiFootballClient : utilise
    MatchService --> Match : retourne
    StandingService --> ApiFootballClient : utilise
    StandingService --> Classement : retourne
```

---

## 5. Diagramme des entités

Entités métier alignées avec la future conception MERISE (MCD).

```mermaid
erDiagram
    EQUIPE ||--o{ MATCH : "joue"
    PHASE ||--|{ MATCH : "contient"
    STADE ||--o{ MATCH : "accueille"
    MATCH ||--|| SCORE : "a"
    GROUPE ||--|{ CLASSEMENT : "regroupe"
    EQUIPE ||--o{ CLASSEMENT : "figure dans"

    EQUIPE {
        string id PK
        string nom
        string code_pays
    }

    MATCH {
        string id PK
        datetime date_heure
        string statut
        string phase_id FK
        string stade_id FK
    }

    SCORE {
        int buts_domicile
        int buts_exterieur
    }

    PHASE {
        string id PK
        string nom
        string type
    }

    STADE {
        string id PK
        string nom
        string ville
    }

    GROUPE {
        string id PK
        string lettre
    }

    CLASSEMENT {
        int points
        int matchs_joues
        int difference_buts
    }
```

| Entité | Description |
| ------ | ----------- |
| EQUIPE | Sélection nationale participante |
| MATCH | Rencontre entre deux équipes |
| SCORE | Résultat d'un match (buts domicile / extérieur) |
| PHASE | Étape de la compétition (groupes, 1/8, finale…) |
| STADE | Lieu du match |
| GROUPE | Poule de la phase de groupes |
| CLASSEMENT | Position d'une équipe dans un groupe |

---

## 6. Cohérence entre les diagrammes

| Élément | Cas d'utilisation | Séquence | Classes | Entités |
| ------- | ----------------- | -------- | ------- | ------- |
| Consultation matchs | UC1 | § 2.1 | MatchService | MATCH, PHASE |
| Temps réel | UC3 | § 2.2 | Match, polling UI | SCORE, statut MATCH |
| Classements | UC4 | — | StandingService | CLASSEMENT, GROUPE |
| Navigation | UC6 | Activité § 3.1 | — | — |
