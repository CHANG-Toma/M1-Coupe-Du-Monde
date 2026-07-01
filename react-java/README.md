# World Cup Tracker 2026 — React + Java

Application de suivi de la Coupe du monde FIFA 2026 avec **React** (front) et **Spring Boot** (back).

## Source des données

Comme l'application Next.js à la racine du dépôt :

| Donnée | Source |
|--------|--------|
| **Catalogue** (liste matchs, classements) | PostgreSQL, synchronisé depuis [worldcup26.ir](https://worldcup26.ir) toutes les 5 min |
| **Live** (matchs en cours, détail live) | API worldcup26.ir en direct |
| **Fallback** | Mock local si BDD/API indisponibles |

Le front **ne contacte jamais** l'API externe directement. Tout passe par `/api/*` côté Java.

Pour forcer les données mock : `app.use-mock-data=true` dans `application.properties`.

## Démarrage

### Prérequis

- Docker Desktop (PostgreSQL)
- Java 21+
- Maven 3.9+
- Node.js 20+

### 1. Base de données (Docker)

Depuis `react-java/` (réutilise les scripts SQL du projet Next.js dans `../db`) :

```bash
cd react-java
docker compose up -d
```

PostgreSQL écoute sur **localhost:5432** (`cdm` / `cdm2026`, base `cdm2026`).

> Si le conteneur `cdm2026-db` tourne déjà depuis la racine du dépôt, cette étape est optionnelle — c'est la même base.

### 2. Backend (port 9090)

```bash
cd react-java/backend
mvn spring-boot:run
```

Au premier appel API, le backend synchronise automatiquement le catalogue worldcup26.ir → PostgreSQL (verrou advisory, intervalle 5 min).

### 3. Frontend (port 5173)

```bash
cd react-java/frontend
npm install
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173). Le proxy Vite redirige `/api/*` vers le backend Java.

## API REST

| Endpoint | Description |
|----------|-------------|
| `GET /api/matches` | Liste des matchs (`?phase=`, `?live=true`, `?equipeId=`) — source `db` / `api` / `mock` |
| `GET /api/matches/{id}` | Détail d'un match (live via API si `en_cours`) |
| `GET /api/standings` | Classements (`?group=A` pour un groupe) |
| `GET /api/sync/status` | État de la dernière synchronisation catalogue |

## Architecture données

```
worldcup26.ir ──sync (5 min)──► PostgreSQL ◄── catalogue (matchs, classements)
       │
       └──── live (en_cours) ──────────────────► API directe
```

## Structure

```
react-java/
├── docker-compose.yml    # PostgreSQL (scripts ../db)
├── backend/              # Spring Boot + JDBC
│   └── src/main/java/com/cdm/worldcup/
│       ├── controller/
│       ├── service/      # MatchService, StandingService, SyncScheduler
│       ├── db/           # Repositories JDBC
│       └── api/          # Client worldcup26.ir
└── frontend/             # React + Vite
```

## Branche

Ce projet vit sur la branche `reactjava`, à côté du projet Next.js original à la racine du dépôt.
