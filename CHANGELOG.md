# Changelog GEDCOM Merger

## v1.9.5 (31 décembre 2025) - ACTUELLE

### CORRECTIONS CRITIQUES
- **Parser DATE/PLAC niveau 2 uniquement** : Évite capture des dates dans SOURCE
- Reset de `currentEvent` sur tout tag niveau 1 non-événement

### FUSION INTELLIGENTE (NOUVEAU)
- **mergePersonData()** : Combine les données des 2 personnes au lieu de juste remplacer les références
  - Si P1 a une naissance et P2 un décès → le résultat a les deux
  - Noms multiples conservés avec TYPE aka
  - Note de traçabilité ajoutée automatiquement
- **Déduplication CHIL** : Évite les doublons d'enfants dans les FAM après fusion
- **Support clusters** : Fusion en chaîne pour 3+ doublons

### Tests
- 266 tests (22 niveaux + 5 bonus)
- Nouveau BONUS E : 12 tests algorithme de fusion

## v1.9.4 (30 décembre 2025)
- Contrôle d'intégrité 8 types
- Bouton Recommencer dans le header
- Boutons sélection dynamiques

## v1.9.3 (30 décembre 2025)
- Onglet "À supprimer" avec filtrage strict
- Bouton flottant pour actions rapides

## v1.9.2 (28 décembre 2025)
- Algorithme anti-faux-positifs

## v1.8.7 (décembre 2025)
- HEAD/TRLR automatiques
- Conformité GEDCOM 5.5.1
