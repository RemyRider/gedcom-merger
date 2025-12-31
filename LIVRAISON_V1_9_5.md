# Livraison GEDCOM Merger v1.9.5

**Date** : 31 décembre 2025
**Version** : 1.9.5

## Améliorations majeures

### 1. Correction Bug Critique Parsing
Le parser capturait les dates de niveau 3 (dans SOURCE) et écrasait les vraies dates.
- Avant : `trimmed.includes('DATE')` → capturait toutes les dates
- Après : `trimmed.startsWith('2 DATE')` → capture uniquement niveau 2

### 2. Fusion Intelligente des Données
Nouvelle fonction `mergePersonData()` qui COMBINE les données au lieu de simplement choisir une personne :

| Avant | Après |
|-------|-------|
| P1 gardé, P2 supprimé | Données combinées |
| Perte profession P2 | Conservation profession |
| Perte décès P2 | Conservation décès |

### 3. Déduplication CHIL
Évite les références dupliquées dans les FAM après fusion de frères/sœurs.

### 4. Support Clusters
Fusion en chaîne pour les groupes de 3+ doublons.

## Tests
- **266 tests** (22 niveaux + 5 bonus)
- 100% de réussite

## Fichiers inclus
- src/App.jsx (principal)
- tests/test-complete.cjs
- Configuration (package.json, vite.config.js, etc.)
- Documentation (README, CHANGELOG, DEPLOIEMENT)
