# Cahier des charges technique

---

## 1. Choix technologiques

### 1.1. Type d'application

**Application web** responsive, accessible depuis un navigateur (mobile et desktop). Pas d'application mobile native.

### 1.2. Technologies utilisées

| Couche | Technologie | Rôle |
| ------ | ----------- | ---- |
| **Front-end** | Next.js (App Router), React, TypeScript | Pages, composants, logique d'affichage |
| **Styles** | Tailwind CSS | Mise en forme responsive mobile-first |
| **Back-end** | Next.js API Routes | Proxy vers l'API externe, validation des données |
| **Base de données** | Aucune en V1 | Les données sont consommées via l'API externe ; une BDD pourra être ajoutée |
| **Déploiement** | Vercel | Hébergement Next.js, HTTPS natif |
| **Outils** | Git / GitHub, ESLint | Versionnement et qualité de code |

**Justification :** Next.js regroupe front et back dans un seul projet, ce qui réduit la complexité pour un développeur solo. TypeScript améliore la maintenabilité. Tailwind accélère le développement UI.

### 1.3. Récupération des données

| Mode | Description | Usage |
| ---- | ----------- | ----- |
| **API publique** (principal) | API-Football ou Football-Data.org | Données réelles : matchs, scores, classements, phases |
| **Données mockées** (secours) | Fichiers JSON locaux | Développement hors connexion ou si l'API ne couvre pas encore la CDM 2026 |

Le front-end **ne contacte jamais l'API externe directement**. Toutes les requêtes passent par les API Routes Next.js (`/api/...`).

**Justification :** une API publique fournit des données structurées et à jour ; le mock permet de continuer le développement en cas de limite ou d'indisponibilité de l'API.

---

## 2. Architecture générale

### 2.1. Vue d'ensemble

Architecture **client / serveur** avec une couche intermédiaire (BFF — Backend For Frontend) via les API Routes.

```
[Navigateur]  ←→  [Next.js Front (React)]  ←→  [API Routes /api/*]  ←→  [API Football externe]
                         ↑
                    SSR / ISR (pages)
```

- **Rendu** : Server Components pour le chargement initial (SSR), Client Components pour le polling temps réel
- **API interne** : REST JSON (`GET /api/matches`, `GET /api/matches/[id]`, `GET /api/standings`, etc.)
- **Pas de SPA pure** : navigation via le routeur Next.js avec rechargement partiel des pages

### 2.2. Structuration du code

```
src/
├── app/                    # Pages et routes (App Router)
│   ├── page.tsx            # Accueil
│   ├── matches/            # Liste et détail matchs
│   ├── standings/          # Classements
│   ├── bracket/            # Tableau éliminatoire
│   └── api/                # API Routes (proxy)
│       ├── matches/
│       └── standings/
├── components/             # Composants UI réutilisables
├── lib/                    # Services, types, utilitaires
│   ├── api/                # Appels vers l'API externe
│   └── types/              # Types TypeScript
└── data/                   # Données mockées (secours)
```

**Principes :**
- Séparation **affichage** (composants) / **logique métier** (services dans `lib/`)
- Types TypeScript partagés entre front et API Routes
- Un service par domaine (matchs, classements, phases)

### 2.3. Temps réel (quasi temps réel)

| Aspect | Choix |
| ------ | ----- |
| Mécanisme | **Polling** côté client (intervalle 10–30 s) |
| Alternative écartée | WebSocket — trop complexe pour le délai et l'usage solo |
| Portée | Liste des matchs et page détail pendant un match en cours |
| Implémentation | `setInterval` ou hook React (`useEffect`) sur les Client Components ; arrêt du polling si la page n'est plus visible |

**Justification :** le polling est suffisant pour des scores football (mise à jour toutes les quelques secondes), plus simple à mettre en place qu'un WebSocket.

---

## 3. Sécurité

### 3.1. Données manipulées

| Donnée | Sensibilité | Stockage |
| ------ | ----------- | -------- |
| Matchs, scores, classements | Publique | Transité via API, pas de stockage persistant en V1 |
| Clé API football | **Secrète** | Variable d'environnement serveur (`.env.local`) |
| Préférences utilisateur (mode sombre) | Faible | `localStorage` côté client uniquement |
| Données utilisateur (compte, auth) | — | Hors périmètre, non collectées |

### 3.2. Risques identifiés

| Risque | Impact | Mesure prévue |
| ------ | ------ | ------------- |
| Exposition de la clé API dans le code client | Accès non autorisé à l'API, quota consommé | Proxy via API Routes ; clé uniquement côté serveur |
| Données API non fiables ou malformées | Affichage incorrect, erreurs, failles XSS | Validation et filtrage côté serveur avant envoi au front |
| Communication non chiffrée | Interception des échanges | HTTPS en production (Vercel) |
| Injection XSS côté client | Exécution de script malveillant | React échappe par défaut ; pas de `dangerouslySetInnerHTML` |
| Fuite d'informations dans les erreurs | Exposition de détails techniques | Messages d'erreur génériques côté client |

### 3.3. Mesures mises en place

| Exigence du sujet | Mise en œuvre |
| ----------------- | ------------- |
| HTTPS | Déploiement Vercel (HTTPS automatique) |
| Protection des clés API | `process.env.API_KEY` côté serveur uniquement ; `.env.local` dans `.gitignore` |
| Validation des données | Schéma de validation des réponses API (Zod ou contrôle manuel) dans les API Routes |
| Bonnes pratiques front-end | Pas de secrets dans le code client ; gestion d'erreurs sans détail technique ; échappement React |

---

## 4. Environnement et déploiement

| Élément | Détail |
| ------- | ------ |
| **Environnement local** | `npm run dev` — Next.js sur `localhost:3000` |
| **Variables d'environnement** | `API_KEY`, `API_BASE_URL` dans `.env.local` |
| **Production** | Vercel, branch `main` ou `master` |
| **CI** | Optionnel : lint au commit |
