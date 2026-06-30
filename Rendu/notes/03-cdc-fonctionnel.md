# Cahier des charges fonctionnel

**Projet :** Application de suivi de la Coupe du monde FIFA 2026  

## 1. Fonctionnalités principales

### F01 — Consultation des matchs par phase

**Objectif**  
Permettre à l'utilisateur d'afficher uniquement les matchs de la phase de compétition sélectionnée.

**Comportement attendu**  
L'application propose les phases suivantes :

- Phase de groupes
- Seizièmes de finale
- Huitièmes de finale
- Quarts de finale
- Demi-finales
- Petite finale
- Finale

La sélection d'une phase filtre la liste des matchs affichés. Si aucun match n'est programmé pour une phase, un message informatif s'affiche.

**Interactions utilisateur**  
- L'utilisateur clique sur un onglet ou un élément de menu représentant une phase
- La liste des matchs se met à jour selon la phase choisie
- La phase active est visuellement distinguée (surlignage, couleur)

---

### F02 — Affichage de la liste des matchs

**Objectif**  
Présenter les matchs d'une phase sous forme de liste claire et lisible.

**Comportement attendu**  
Chaque carte match affiche au minimum :

- Les deux équipes
- La date et l'heure du match
- Le score (si le match a commencé ou est terminé)
- Le statut : à venir, en cours, terminé

Les matchs sont triés par date/heure croissante. Le score est mis en avant visuellement. Un code couleur distingue les statuts (ex. bleu = à venir, vert = en cours, gris = terminé).

**Interactions utilisateur**  
- L'utilisateur consulte la liste défilante des matchs
- Il clique sur une carte pour accéder au détail du match (F03)

---

### F03 — Détail d'un match

**Objectif**  
Afficher toutes les informations essentielles d'un match sur une page dédiée.

**Comportement attendu**  
La page détail affiche :

| Information | Règle d'affichage |
| ----------- | ----------------- |
| Équipes | Nom des deux équipes (drapeau ou code pays si disponible) |
| Date et heure | Format lisible, heure française |
| Stade | Affiché si la donnée est disponible, sinon masqué ou « Non renseigné » |
| Score | Visible uniquement si le match est en cours ou terminé |
| Statut | Badge : à venir, en cours, terminé (+ prolongations / tirs au but si applicable) |

**Interactions utilisateur**  
- L'utilisateur ouvre le détail depuis la liste (F02)
- Il consulte les informations sans action supplémentaire
- Il revient à la liste via un bouton retour ou le fil d'Ariane (F07)

---

### F04 — Mise à jour en temps réel des scores et statuts

**Objectif**  
Mettre à jour automatiquement les scores et statuts sans rechargement manuel de la page.

**Comportement attendu**  
- Pendant un match en cours, le score se rafraîchit automatiquement (polling toutes les 5 à 30 secondes)
- Le statut évolue automatiquement : à venir → en cours → terminé
- La mise à jour s'applique sur la liste des matchs (F02) et la page détail (F03)
- Aucune action utilisateur n'est requise pour obtenir les nouvelles données

**Interactions utilisateur**  
- L'utilisateur reste sur la page ; les données se mettent à jour en arrière-plan
- Un indicateur discret peut signaler une mise à jour en cours (optionnel)

---

### F05 — Classement des groupes

**Objectif**  
Permettre la consultation des classements de la phase de groupes.

**Comportement attendu**  
Pour chaque groupe, un tableau affiche :

- Équipe
- Matchs joués
- Victoires / nuls / défaites (ou points)
- Différence de buts
- Points

Les données sont issues de l'API et mises à jour après chaque match de groupe.

**Interactions utilisateur**  
- L'utilisateur accède à la section « Classements » depuis le menu
- Il peut consulter les différents groupes (onglets ou liste déroulante)

---

### F06 — Tableau éliminatoire

**Objectif**  
Visualiser la progression des équipes dans les phases à élimination directe.

**Comportement attendu**  
Un tableau simplifié représente les phases finales (1/16 → finale) avec :

- Les matchs par phase
- Les équipes qualifiées (si connues)
- Les scores pour les matchs joués

Les matchs à venir affichent les équipes ou « À déterminer » selon les données disponibles.

**Interactions utilisateur**  
- L'utilisateur accède à la section « Tableau » depuis le menu
- Il clique sur un match du tableau pour ouvrir le détail (F03)

---

### F07 — Navigation entre phases et matchs

**Objectif**  
Guider l'utilisateur dans l'application sans perte de repères.

**Comportement attendu**  

| Parcours | Étapes |
| -------- | ------ |
| Phases → matchs | Menu phases (F01) → liste (F02) |
| Matchs → détail | Clic sur une carte (F02) → détail (F03) |
| Retour | Bouton retour ou fil d'Ariane |
| Sections transverses | Accès aux classements (F05) et au tableau (F06) depuis le menu principal |

**Interactions utilisateur**  
- Navigation par clic sur les éléments de menu, cartes match et boutons retour
- Accès à une phase ou un match en **2 clics maximum** depuis l'accueil

---

### F08 — Ergonomie, lisibilité et gestion des états

**Objectif**  
Garantir une expérience claire, accessible et fiable sur tous les appareils.

**Comportement attendu**  

| Critère | Règle |
| ------- | ----- |
| Langue | Interface entièrement en français |
| Lisibilité | Scores et statuts mis en avant, hiérarchie visuelle claire |
| Responsive | Affichage adapté mobile (priorité) et desktop |
| Chargement | Indicateur pendant la récupération des données |
| Erreur API | Message explicite (« Impossible de charger les données ») sans détail technique |
| Données vides | Message informatif si aucun match n'est disponible |

**Interactions utilisateur**  
- L'utilisateur consulte l'application sur mobile ou desktop sans zoom manuel
- En cas d'erreur, il peut réessayer via un bouton « Réessayer » (optionnel)

---

## 3. Fonctionnalités optionnelles

À développer si le temps le permet :

### F09 — Chronologie des buts

**Objectif** — Afficher la liste des buts marqués sur la page détail.  
**Comportement** — Timeline ordonnée (minute, joueur, équipe) si l'API le permet.  
**Interactions** — Consultation passive sur la page détail (F03).

### F10 — Filtre par équipe

**Objectif** — Retrouver rapidement tous les matchs d'une équipe.  
**Comportement** — Champ de recherche ou liste déroulante filtrant par nom d'équipe.  
**Interactions** — Saisie ou sélection d'une équipe, liste filtrée en conséquence.

### F11 — Mode sombre

**Objectif** — Réduire la fatigue visuelle en faible luminosité.  
**Comportement** — Basculement clair/sombre, préférence mémorisée en local.  
**Interactions** — Bouton dans l'en-tête.

---

## 4. Hors périmètre

- Fantasy, pronostics, paris
- Compte utilisateur et authentification
- Notifications push
- Statistiques avancées (xG, heatmaps, notes joueurs)
- Contenus éditoriaux (articles, vidéos)
- Application mobile native
- Gestion des billets

