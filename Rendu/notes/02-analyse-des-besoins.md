# Analyse des besoins

**Projet :** Application de suivi de la Coupe du monde FIFA 2026  
**Référence :** `01-benchmark.md`

---

## 1. Contexte

Pendant la CDM 2026, les supporters ont besoin d'un outil simple pour consulter les matchs, suivre les scores et l'évolution du tournoi. Le benchmark montre qu'un noyau fonctionnel suffit : consultation par phase, scores en direct, détail des matchs et navigation fluide.

**Problématique :** proposer une application web légère, en français, avec mise à jour en temps réel, dans un délai court et sans surcharge fonctionnelle.

---

## 2. Public cible

Grand public francophone (18–45 ans), débutant à intermédiaire, principalement sur smartphone. Accès **sans inscription**.

| Persona | Profil | Besoin principal |
| ------- | ------ | ---------------- |
| Lucas — fan régulier | Suit plusieurs matchs par jour | Scores live, classements, tableau éliminatoire |
| Sophie — occasionnelle | Consulte les matchs de la France | Score rapide, interface claire |
| Thomas — étudiant | Consulte sur mobile | App responsive, chargement rapide |

---

## 3. Objectifs de l'application

- Permettre la **consultation des matchs** et des **résultats** de la CDM 2026
- Suivre l'**évolution de la compétition en temps réel** (scores et statuts)
- Offrir une **navigation simple** par phase et par match
- Garantir une interface **lisible et responsive** (mobile-first)
- Respecter les **bonnes pratiques de sécurité** (clés API protégées, HTTPS)

---

## 4. Attentes fonctionnelles

| Besoin | Description |
| ------ | ----------- |
| Consultation par phase | Groupes, 1/16, 1/8, quarts, demis, petite finale, finale |
| Détail d'un match | Équipes, date/heure, stade (si dispo), score, statut (à venir / en cours / terminé) |
| Temps réel | Mise à jour automatique des scores et statuts (polling 5–30 s) |
| Navigation | Menu par phase, liste de matchs, page détail, retour intuitif |
| Classements | Tableau des groupes (points, matchs joués, différence de buts) |
| Tableau éliminatoire | Visualisation simplifiée des phases finales |
| Ergonomie | Interface en français, scores mis en avant, états chargement/erreur |
| Chronologie des buts *(optionnel)* | Timeline sur la page détail |
| Filtre par équipe *(optionnel)* | Recherche ou filtre sur une équipe |
| Mode sombre *(optionnel)* | Thème sombre |

**Hors périmètre :** fantasy, pronostics, auth, notifications push, stats avancées (xG, heatmaps), app mobile native.
