# Benchmark — Applications de suivi de compétitions sportives

**Projet :** Application de suivi de la Coupe du monde FIFA 2026  
**Stack retenue :** Next.js (application web)  
**Contexte :** Projet réalisé en solo, délai court (3 jours)

---

## 1. Objectif du benchmark

Cette analyse comparative vise à étudier les solutions existantes de suivi de compétitions footballistiques, en particulier la Coupe du monde, afin d'identifier :

- les fonctionnalités attendues par les utilisateurs ;
- les bonnes pratiques UX/UI pour l'affichage des matchs, scores et phases ;
- les mécanismes de mise à jour en temps réel employés ;
- le périmètre réaliste pour notre application, compte tenu du délai et des contraintes du projet.

Cette note alimentera l'analyse des besoins et le cahier des charges fonctionnel.

---

## 2. Solutions analysées

| Solution | Type | Public principal |
| -------- | ---- | ---------------- |
| Google Search (scorecards intégrés) | Web / moteur de recherche | Utilisateur occasionnel |
| FIFA World Cup 2026 (application officielle) | Mobile (iOS / Android) | Supporter, fan de la compétition |
| FotMob | Web + mobile | Fan régulier, amateur de statistiques |
| FlashScore | Web + mobile | Utilisateur recherchant la rapidité |
| ESPN | Web + mobile | Public américain, consommateur de contenus média |
| SofaScore | Web + mobile | Fan analytique |
| L'Équipe | Web + mobile | Public francophone |

---

## 3. Synthèse — Fonctionnalités récurrentes du marché

### 3.1. Fonctionnalités incontournables

Ces éléments sont présents sur la majorité des solutions analysées et devront figurer dans le cahier des charges :

1. Consultation des matchs par phase de compétition
2. Affichage du score et du statut (à venir, en cours, terminé)
3. Informations de base : équipes, date, heure, stade
4. Mise à jour automatique des scores (temps réel ou quasi temps réel)
5. Navigation fluide entre les phases et les matchs
6. Tableau éliminatoire pour les phases à élimination directe
7. Classement des groupes (phase de poules)

### 3.2. Fonctionnalités différenciantes (hors périmètre V1)

| Fonctionnalité | Présente chez | Décision projet |
| ------------ | ------------- | --------------- |
| Fantasy / pronostics | FIFA, FotMob | Hors périmètre |
| Notifications push natives | FIFA, FotMob, FlashScore | Hors périmètre V1 (application web) |
| Statistiques avancées (xG, heatmaps) | FotMob, SofaScore | Hors périmètre V1 |
| Contenus éditoriaux / articles | ESPN, L'Équipe | Hors périmètre |
| Billets / cartes des stades | FIFA | Hors périmètre |
| Favoris / suivi d'équipes | FotMob, FIFA | Optionnel (V2) |
| Chronologie des événements (buts, cartons) | ESPN, FotMob | Optionnel si l'API le permet |

### 3.3. Bonnes pratiques UX identifiées

| Pratique | Source d'inspiration | Application prévue |
| -------- | -------------------- | ------------------ |
| Score visible immédiatement | Google, FlashScore | Score mis en avant sur la carte match |
| Code couleur par statut | FotMob, ESPN | Vert = en cours, gris = terminé, bleu = à venir |
| Navigation par onglets / phases | FIFA, L'Équipe | Menu : Groupes → 1/16 → 1/8 → Quarts → Demis → Finale |
| Cartes match compactes | FotMob, FlashScore | Liste défilante avec les informations essentielles |
| Interface responsive mobile-first | FotMob (version web) | Next.js + Tailwind CSS |
| États de chargement et d'erreur | Toutes les solutions | Indicateurs de chargement, messages d'erreur explicites |

---

## 4. Analyse de la stratégie — Positionnement de l'application

### 4.1. Proposition de valeur

> Une application web légère, en français, permettant de suivre la Coupe du monde 2026 avec des scores mis à jour en temps réel, une navigation claire par phase et une interface lisible — sans inscription ni installation.

### 4.2. Cibles utilisateurs

| Persona | Description | Besoin principal |
| ------- | ----------- | ---------------- |
| Lucas, 28 ans — fan régulier | Suit plusieurs matchs par jour | Scores en direct, tableau éliminatoire, classements |
| Sophie, 35 ans — utilisatrice occasionnelle | Consulte les résultats de l'équipe de France | Score rapide, prochain match, lisibilité |
| Thomas, 22 ans — étudiant | Consulte entre deux cours sur mobile | Application web responsive, chargement rapide |

### 4.3. Choix techniques en lien avec le benchmark

| Choix | Justification |
| ----- | ------------- |
| Next.js | Rendu côté serveur (SSR/ISR) pour les performances, App Router, API Routes pour un proxy sécurisé |
| Application web | Alignée sur FotMob web, L'Équipe et Google ; pas de publication sur un store |
| API externe + proxy back-end | Protection des clés API (exigence du sujet), données structurées |
| Polling (5 à 30 secondes) | Plus simple qu'un WebSocket pour un projet solo en 3 jours ; suffisant pour un quasi temps réel |
| Tailwind CSS | Mise en forme rapide, interface responsive mobile-first |

### 4.4. Périmètre fonctionnel recommandé (MVP)

**Must have (V1)**

- Liste des matchs filtrable par phase de compétition
- Détail d'un match : équipes, score, statut, date/heure, stade
- Mise à jour automatique des scores (polling)
- Classement des groupes (phase de poules)
- Tableau éliminatoire simplifié (phases finales)
- Interface responsive en français
- Gestion des états : chargement, erreur, données indisponibles

**Should have (si le temps le permet)**

- Chronologie des buts sur la page détail
- Filtre par équipe
- Mode sombre

**Won't have (hors scope)**

- Fantasy, pronostics, billets
- Statistiques avancées (xG, heatmaps)
- Compte utilisateur / authentification
- Application mobile native
