# Changelog GEDCOM Merger

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

## [v2.2.5] - 10 janvier 2026

### 🎯 Thème : Scoring doublons amélioré

### ✨ Améliorations majeures
- **Couleurs inversées** : 🟢 FORT (feu vert pour fusionner), 🟡 MOYEN (vérifier), 🔴 FAIBLE (prudence)
- **Pondération dynamique des noms** : Les noms rares valent plus de points que les noms communs
  - Nom très rare (≤3 occurrences) : 35 points
  - Nom rare (≤10) : 32 points
  - Nom normal (≤30) : 30 points
  - Nom commun (≤100) : 25 points
  - Nom très commun (>100) : 20 points
- **Bonus combinaison forte** : 
  - +15 pts si nom + année naissance + lieu naissance concordent
  - +8 pts si nom + année naissance concordent
- **Malus incohérence** : -10 pts si les deux personnes ont des lieux de naissance contradictoires

### 🔧 Technique
- Nouvelle fonction `calculateSurnameStats()` pour calculer la fréquence des noms
- `calculateSimilarity()` accepte maintenant `surnameStats` en paramètre
- Web Worker synchronisé avec les mêmes améliorations de scoring
- Tests mis à jour pour les nouvelles couleurs

---

## [v2.2.4] - 5 janvier 2026

### 🎯 Thème : Correction fusion en cascade - CORRECTION MAJEURE

### 🐛 Corrections critiques
- **MAJEUR**: Fusion en cascade résolue (si A→B et B→C, alors A→C directement)
- **MAJEUR**: Les références HUSB/WIFE/CHIL sont **redirigées** vers la cible finale (pas supprimées)
- `cleanOrphanedFamilies` utilise maintenant `mergeMap` pour rediriger les références
- Support complet des clusters de N individus (pas seulement 3)

### ✨ Améliorations
- Fichier GEDCOM généré sans aucune référence invalide
- Déduplication automatique si deux enfants fusionnent vers la même personne
- Résolution itérative des chaînes de fusion (jusqu'à 100 itérations max)

### 🔧 Technique
- `cleanOrphanedFamilies(families, removedIds, people, mergeMap)` - nouveau paramètre
- Helper `getValidId(id)` pour résoudre les redirections
- Boucle `while` pour résoudre les chaînes A→B→C→...→Z

---

## [v2.2.3] - 4 janvier 2026

### 🎯 Thème : Isolation complète doublons/clusters

### 🐛 Corrections
- Bouton "Sélectionner ≥X%" des doublons n'affecte plus les clusters
- Les sélections de doublons et clusters sont complètement indépendantes

---

## [v2.2.2] - 4 janvier 2026

### 🎯 Thème : Corrections bugs sélection clusters

### 🐛 Corrections
- Bouton "Sélectionner" cluster encadre maintenant visuellement le cluster
- Bouton "Désélectionner tout" cluster retire aussi les paires associées
- Bouton "Désélectionner tout" doublons ne touche plus aux sélections de clusters
- Modal "Prévisualisation de la fusion" a maintenant un ascenseur fonctionnel

### ✨ Améliorations
- Détection de conflit plus stricte sur les dates précises
- "29 NOV 2025" vs "12 NOV 2025" = CONFLIT (dates précises différentes)
- "1726" vs "15 MAR 1726" = Compatible (une date approximative)

### 🔧 Technique
- Nouvelle fonction `isApproximateDate()` pour distinguer dates précises/approximatives

---

## [v2.2.1] - 4 janvier 2026

### 🎯 Thème : Amélioration UX - Modal qualité

### ✨ Améliorations
- Modal "Rapport Qualité" ne s'affiche plus automatiquement au démarrage
- Rapport qualité accessible via le bouton "Qualité" uniquement
- Démarrage plus fluide sans interruption modale

---

## [v2.2.0] - 4 janvier 2026

### 🎯 Thème : Gestion intelligente des conflits de fusion

### ✨ Nouveautés
- **Détection automatique des conflits** avant fusion
  - Analyse des valeurs contradictoires entre deux personnes
  - Champs vérifiés : naissance, décès, baptême, inhumation, profession, religion
- **Modal de résolution des conflits**
  - Interface intuitive pour choisir quelle valeur conserver
  - Possibilité de saisir une valeur manuellement
  - Fusion bloquée tant que tous les conflits ne sont pas résolus
- **Comparaison intelligente des valeurs**
  - Dates : compatibles si même année (ex: "1726" et "19 SEP 1726")
  - Lieux : compatibles si l'un contient l'autre (ex: "Paris" et "Paris, France")
  - Texte : comparaison insensible à la casse
- **Nettoyage automatique des FAM orphelines**
  - Suppression des familles vides après fusion/suppression
  - Rapport détaillé des FAM nettoyées

### 🔧 Technique
- Nouvelles fonctions : `detectMergeConflicts()`, `areValuesCompatible()`, `cleanOrphanedFamilies()`
- Nouveaux états React : `mergeConflicts`, `showConflictModal`, `pendingMergePair`
- Fonction `handleMerge` refactorisée avec `executeMerge` séparé
- 30 nouveaux tests (423 tests statiques + 108 Vitest = 531 total)

---

## [v2.1.4] - 3 janvier 2026

### 🎯 Thème : Web Worker - Performance optimisée

### ✨ Nouveautés
- **Web Worker** pour traitement en arrière-plan
- Interface toujours réactive pendant l'analyse
- Progression fluide temps réel avec messages détaillés

### 🚀 Performance
- Traitement 3-5x plus rapide sur gros fichiers
- Index composite optimisé (phonétique+sexe+décennie)
- Accès O(1) via peopleById Map

### 🔧 Technique
- Fichier `public/gedcom-worker.js` (thread séparé)
- Communication par postMessage/onmessage
- 501 tests (393 statiques + 108 Vitest)

---

## [v2.1.3] - 2 janvier 2026

### 🎯 Thème : Vrais tests unitaires Vitest

### ✨ Nouveautés
- 108 tests Vitest avec exécution réelle de code
- Tests unitaires pour helpers, parser GEDCOM, statistiques
- Fonctions pures extraites dans `src/utils/`

---

## [v2.1.0] - 2 janvier 2026

### 🎯 Thème : Contrôle qualité avancé et analyse généalogique

### ✨ Nouveautés
- Rapport qualité affiché automatiquement après upload
- Détection incohérences chronologiques (7 règles)
- Normalisation intelligente des lieux
- Statistiques généalogiques complètes
- Détection des références orphelines
- Score de suspicion (🔴🟡🟢)

---

## [v2.0.0] - 31 décembre 2025

### 🎯 Thème : Préservation complète des données GEDCOM

### ✨ Nouveautés
- `rawLines[]` stocke TOUTES les lignes GEDCOM originales
- `rawLinesByTag{}` indexe par tag (SOUR, NOTE, OBJE...)
- Fusion SOUR/NOTE/OBJE combine les sources des 2 personnes
- 18 critères de comparaison (vs 11 avant)
- Contrôles intégrité AVANT fusion et suppression

---

## [v1.9.5] - 31 décembre 2025

### 🎯 Thème : Fusion intelligente

### ✨ Nouveautés
- Fonction `mergePersonData()` - plus de perte de données
- Déduplication automatique des CHIL dans les FAM
- Note de traçabilité dans les INDI fusionnés

---

## [v1.9.2] - 28 décembre 2025

### 🎯 Thème : Anti-faux-positifs

### ✨ Corrections
- Nom + Sexe ne suffisent plus pour être doublon
- AU MOINS 1 critère suffisant requis

---

## Liens

- **Production** : https://gedcom-merger.netlify.app
- **Développement** : https://dev--gedcom-merger.netlify.app
- **GitHub** : https://github.com/RemyRider/gedcom-merger

---

*Document mis à jour le 4 janvier 2026*
