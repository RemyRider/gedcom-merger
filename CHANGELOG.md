# Changelog GEDCOM Merger

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

## [2.3.0] - 2026-01-11

### 🎯 FUSION INTELLIGENTE - Ordre optimal de fusion

Cette version introduit un système intelligent pour déterminer l'ordre optimal de fusion des doublons, garantissant la cohérence des relations familiales.

### Nouvelles fonctionnalités

#### P1.1 - Graphe de dépendances entre doublons
- **Nouveau module** `src/utils/fusionOrder.mjs` avec algorithmes de graphe
- Détection automatique des relations parent/enfant/conjoint entre paires de doublons
- Identification des dépendances : quels doublons doivent être fusionnés avant d'autres
- Gestion des chaînes de dépendances (petit-enfant → enfant → parent)

#### P1.2 - Tri topologique pour l'ordre de fusion
- Calcul automatique du niveau optimal de chaque paire de doublons
- Principe : **Enfants → Conjoints → Parents**
- Protection contre les fusions circulaires (détection de cycles)
- Niveaux de fusion numérotés (0 = fusionner en premier)

#### P1.3 - Score de qualité enrichi
- `getDatePrecisionScore()` : Score selon la précision des dates (complète = 15, année seule = 8, approximative = 5)
- `getPlacePrecisionScore()` : Score selon le nombre de niveaux géographiques (4 niveaux = 10 pts)
- Validation des relations : points bonus pour parents/conjoints/enfants existants dans l'arbre
- Prise en compte des sources référencées (tag SOUR)

#### P1.4 - Utilitaires pour l'UI
- `prepareLevelForDisplay()` : Prépare les données d'affichage par niveau
- `canFuseLevel()` : Vérifie si un niveau peut être fusionné
- `calculateFusionStats()` : Statistiques globales de complexité
- Détermination automatique de la personne à conserver (meilleur score qualité)

### Technique

#### Nouveau module : `src/utils/fusionOrder.mjs`
```javascript
// Constantes
export const FUSION_LEVELS = {
  CHILDREN: 0,    // Fusionner en premier
  SPOUSES: 1,     // Fusionner ensuite
  PARENTS: 2,     // Fusionner en dernier
  INDEPENDENT: 3  // Doublons sans dépendances
};

// Fonctions principales
export const buildDependencyGraph = (duplicates, individuals) => {...}
export const calculateFusionOrder = (graph) => {...}
export const calculateEnrichedQuality = (person, peopleById) => {...}
```

### Tests
- **45 nouveaux tests statiques** pour la catégorie 11 (Fusion Intelligente)
- **30 tests Vitest** pour `fusionOrder.mjs`
- Total : **~720 tests** (675 + 45 statiques)

### Fichiers modifiés/ajoutés
- `src/utils/fusionOrder.mjs` (nouveau)
- `tests/fusionOrder.test.mjs` (nouveau)
- `tests/test-v2.3.0-static.cjs` (nouveau)
- `package.json` (version 2.3.0)

---

## [2.2.6] - 2026-01-10

### Outil de normalisation des lieux + API Géo

- **NOUVEAU** : Modal de normalisation des lieux avec détection des variantes
- **NOUVEAU** : Intégration API Géo du gouvernement français (geo.api.gouv.fr)
- Suggestions officielles : Commune, Département, Région
- Saisie manuelle avec autocomplétion en temps réel
- Conflits relationnels : gestion des parents/conjoints/enfants en conflit
- Écran récapitulatif après normalisation
- 675 tests (482 statiques + 193 Vitest)

---

## [2.2.5] - 2026-01-10

### Scoring amélioré

- Couleurs inversées : 🟢 FORT = feu vert pour fusionner
- Pondération dynamique des noms (rares = +pts, communs = -pts)
- Bonus combinaison forte nom+naissance+lieu (+15 pts)
- Malus incohérence lieu naissance contradictoire (-10 pts)

---

## [2.2.4] - 2026-01-05

### Correction fusion en cascade

- **CORRECTION** : Fusion en cascade résolue (A→B→C devient A→C)
- **CORRECTION** : Références fusionnées REDIRIGÉES via mergeMap
- **CORRECTION** : cleanOrphanedFamilies utilise mergeMap pour redirections
- **AMÉLIORATION** : Support clusters de N individus

---

## [2.2.0] - 2026-01-04

### Gestion intelligente des conflits de fusion

- **NOUVEAU** : Détection automatique des conflits avant fusion
- **NOUVEAU** : Modal de résolution des conflits avec choix utilisateur
- **NOUVEAU** : Comparaison intelligente dates (même année = compatible)
- **NOUVEAU** : Comparaison intelligente lieux (inclusion = compatible)
- **NOUVEAU** : Option saisie manuelle pour valeurs personnalisées
- **NOUVEAU** : Nettoyage automatique des FAM orphelines après fusion

---

## [2.1.4] - 2026-01-03

### Web Worker - Performance optimisée

- **NOUVEAU** : Web Worker pour traitement en arrière-plan
- Interface toujours réactive pendant l'analyse
- Progression fluide temps réel avec messages
- Performance 3-5x plus rapide sur gros fichiers

---

## [2.1.0] - 2026-01-02

### Contrôle qualité avancé et analyse généalogique

- Rapport qualité affiché automatiquement après upload
- Détection incohérences chronologiques (7 règles)
- Normalisation intelligente des lieux + détection variantes
- Statistiques généalogiques (répartition sexe, patronymes, périodes)
- Score de suspicion doublons (FORT/MOYEN/FAIBLE)

---

## [2.0.0] - 2025-12-31

### Phase 1 - Préservation complète des données GEDCOM

- rawLines[] stocke TOUTES les lignes GEDCOM originales
- 18 critères de comparaison (vs 11 avant)
- Contrôles intégrité AVANT fusion
- 325 tests (7 catégories)
