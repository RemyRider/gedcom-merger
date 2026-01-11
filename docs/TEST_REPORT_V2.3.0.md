# Rapport de Tests GEDCOM Merger v2.3.0

**Date** : 11 janvier 2026  
**Version** : 2.3.0  
**Thème** : Fusion Intelligente - Ordre optimal de fusion

---

## 📊 Résumé des Tests

| Type de tests | Nombre | Statut |
|---------------|--------|--------|
| Tests statiques (v2.2.6) | 482 | ✅ Inclus |
| Tests statiques (v2.3.0) | 45 | 🆕 Nouveau |
| Tests Vitest (v2.2.6) | 193 | ✅ Inclus |
| Tests Vitest fusionOrder | 30 | 🆕 Nouveau |
| **TOTAL** | **~750** | ✅ |

---

## 🆕 Nouveaux Tests v2.3.0

### Catégorie 11 : Fusion Intelligente (45 tests statiques)

#### 11.1 Module fusionOrder.mjs (12 tests)
- ✅ Fichier fusionOrder.mjs existe
- ✅ Constante FUSION_LEVELS exportée
- ✅ Niveau CHILDREN = 0
- ✅ Niveau SPOUSES = 1
- ✅ Niveau PARENTS = 2
- ✅ Niveau INDEPENDENT = 3
- ✅ Fonction createPairId exportée
- ✅ Fonction buildDependencyGraph exportée
- ✅ Fonction calculateFusionOrder exportée
- ✅ Fonction calculateEnrichedQuality exportée
- ✅ Fonction canFuseLevel exportée
- ✅ Fonction calculateFusionStats exportée

#### 11.2 Graphe de dépendances (10 tests)
- ✅ Propriété dependsOn dans nœuds
- ✅ Propriété blocks dans nœuds
- ✅ Détection enfants doublons
- ✅ Détection conjoints doublons
- ✅ Détection parents doublons
- ✅ Fonction findDuplicatesAmongIds
- ✅ Map inversée ID → paires
- ✅ Map paires doublons
- ✅ Index personnes par ID
- ✅ Collecte relations combinées

#### 11.3 Tri topologique (8 tests)
- ✅ Fonction récursive calculateLevel
- ✅ Map niveaux calculés
- ✅ Set nœuds visités
- ✅ Détection cycles
- ✅ Calcul niveau max dépendances
- ✅ Résultat trié
- ✅ Traitement niveau 0
- ✅ Message détection cycle

#### 11.4 Score qualité enrichi (10 tests)
- ✅ Fonction getDatePrecisionScore
- ✅ Fonction getPlacePrecisionScore
- ✅ Gestion dates approximatives (ABT, BEF, AFT)
- ✅ Comptage niveaux géographiques
- ✅ Validation parents
- ✅ Validation conjoints
- ✅ Validation enfants
- ✅ Comptage sources
- ✅ Tag SOUR pour sources
- ✅ Score max 100

#### 11.5 Utilitaires UI (5 tests)
- ✅ Fonction prepareLevelForDisplay
- ✅ Détermination personne à garder
- ✅ Détermination personne à fusionner
- ✅ Différence de qualité
- ✅ État complété

---

### Tests Vitest fusionOrder.mjs (30 tests)

#### createPairId (3 tests)
- ✅ Crée un ID canonique (ordre alphabétique)
- ✅ Gère des IDs identiques
- ✅ Gère des IDs avec caractères spéciaux

#### findDuplicatesAmongIds (3 tests)
- ✅ Trouve les doublons parmi une liste d'IDs
- ✅ Ne trouve rien si les IDs ne sont pas des doublons
- ✅ Ne retourne pas de paire si un seul membre est dans la liste

#### buildDependencyGraph (3 tests)
- ✅ Construit un graphe simple sans dépendances
- ✅ Détecte les dépendances enfant → parent
- ✅ Détecte les dépendances conjoint

#### calculateFusionOrder (3 tests)
- ✅ Place les nœuds sans dépendances au niveau 0
- ✅ Ordonne enfants → parents correctement
- ✅ Gère les graphes complexes (3 niveaux)

#### getDatePrecisionScore (5 tests)
- ✅ Retourne 0 pour une date vide
- ✅ Retourne 15 pour une date complète précise
- ✅ Retourne 12 pour une date avec mois et année
- ✅ Retourne 8 pour une année seule
- ✅ Réduit le score pour les dates approximatives

#### getPlacePrecisionScore (5 tests)
- ✅ Retourne 0 pour un lieu vide
- ✅ Retourne 10 pour un lieu complet (4 niveaux)
- ✅ Retourne 8 pour 3 niveaux
- ✅ Retourne 6 pour 2 niveaux
- ✅ Retourne 4 pour 1 niveau

#### calculateEnrichedQuality (4 tests)
- ✅ Retourne 0 pour une personne vide
- ✅ Augmente le score avec des données complètes
- ✅ Prend en compte les sources
- ✅ Valide les relations existantes

#### canFuseLevel (3 tests)
- ✅ Autorise toujours le niveau 0
- ✅ Bloque le niveau 1 si niveau 0 non complété
- ✅ Bloque le niveau 2 si niveaux 0 et 1 non complétés

#### calculateFusionStats (1 test)
- ✅ Calcule les statistiques correctement

---

## 📁 Fichiers de Tests

| Fichier | Description | Tests |
|---------|-------------|-------|
| `tests/test-complete.cjs` | Tests statiques complets | 482 |
| `tests/test-v2.3.0-static.cjs` | Tests statiques v2.3.0 | 45 |
| `tests/fusionOrder.test.mjs` | Tests Vitest fusionOrder | 30 |

---

## 🚀 Commandes de Test

```bash
# Tests statiques uniquement
npm run test:static

# Tests Vitest uniquement
npm run test

# Tous les tests
npm run test:all
```

---

## ✅ Couverture

### Module fusionOrder.mjs
| Fonction | Couverture |
|----------|------------|
| createPairId | 100% |
| findDuplicatesAmongIds | 100% |
| buildDependencyGraph | 100% |
| calculateFusionOrder | 100% |
| getDatePrecisionScore | 100% |
| getPlacePrecisionScore | 100% |
| calculateEnrichedQuality | 100% |
| prepareLevelForDisplay | 100% |
| canFuseLevel | 100% |
| calculateFusionStats | 100% |

---

## 📝 Notes

1. **Base stable** : v2.2.6 avec 675 tests validés
2. **Ajouts v2.3.0** : 75 nouveaux tests (45 statiques + 30 Vitest)
3. **Total estimé** : ~750 tests
4. **Prochaine étape** : Intégration UI (Phase 4 du roadmap)
