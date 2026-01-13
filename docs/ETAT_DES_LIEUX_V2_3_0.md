# État des Lieux - GEDCOM Merger

> **Version actuelle : v2.3.0** (13 janvier 2026)
> **Repository** : https://github.com/RemyRider/gedcom-merger  
> **Production** : https://gedcom-merger.netlify.app  
> **Développement** : https://dev--gedcom-merger.netlify.app

---

## 🎯 Résumé v2.3.0

| Métrique | Valeur |
|----------|--------|
| **Tests totaux** | 720 (527 statiques + 193 Vitest) |
| **Critères de comparaison** | 18 |
| **Champs affichés** | 16 |
| **Catégories de tests** | 11 |
| **Performance** | Web Worker (traitement arrière-plan) |
| **Nouveauté** | Module fusionOrder.mjs |

---

## Nouveautés v2.3.0

### Module fusionOrder.mjs (préparation v2.4.0)

| Fonctionnalité | Description |
|----------------|-------------|
| **Graphe de dépendances** | Analyse des relations entre doublons (parents, conjoints, enfants) |
| **Tri topologique** | Calcul de l'ordre optimal de fusion |
| **Score de qualité enrichi** | Précision des dates, lieux, nombre de sources, validité des relations |
| **Constantes FUSION_LEVELS** | CHILDREN=0, SPOUSES=1, PARENTS=2, INDEPENDENT=3 |
| **Détection de cycles** | Gestion des boucles généalogiques |

### Fonctions exportées

```javascript
// Constantes
export const FUSION_LEVELS = { CHILDREN: 0, SPOUSES: 1, PARENTS: 2, INDEPENDENT: 3 };
export const FUSION_LEVEL_LABELS = { ... };

// Fonctions principales
export const createPairId = (id1, id2) => ...;
export const buildDependencyGraph = (duplicates, individuals) => ...;
export const calculateFusionOrder = (graph) => ...;
export const calculateEnrichedQuality = (person, peopleById) => ...;

// Utilitaires
export const getDatePrecisionScore = (dateStr) => ...;
export const getPlacePrecisionScore = (place) => ...;
export const prepareLevelForDisplay = (levelData, graph, duplicatePairsMap, peopleById) => ...;
export const canFuseLevel = (level, completedLevels) => ...;
export const calculateFusionStats = (fusionOrder, graph) => ...;
```

---

## Fonctionnalités Implémentées (héritées)

### Core - Détection de doublons

| Fonctionnalité | Version | Description |
|----------------|---------|-------------|
| Algorithme Soundex français | v1.0.0 | Détection phonétique adaptée aux noms français |
| Triple indexation | v1.0.0 | Optimisation O(n) via index phonétique, année, parents |
| **Scoring hybride 18 critères** | v2.0.0 | Nom, naissance, sexe, parents, fratrie, lieu naissance, conjoints, décès, lieu décès, profession, enfants, baptême, lieu baptême, inhumation, lieu inhumation, résidence, titre, religion |
| Détection clusters | v1.6.0 | Groupes de 3+ personnes interconnectées |
| Anti-faux-positifs | v1.9.2 | Critères suffisants obligatoires au-delà du nom |
| **Comparaison par NOM** | v2.0.0 | Parents/conjoints/enfants comparés par nom si IDs différents |
| Suggestions IA | v1.9.0 | Analyse de patterns nom/période avec score de confiance |
| **Web Worker** | v2.1.4 | Traitement en arrière-plan, interface fluide |

### Gestion des conflits (v2.2.x)

| Fonctionnalité | Version | Description |
|----------------|---------|-------------|
| **Détection conflits** | v2.2.0 | 10 champs vérifiés avant fusion |
| **Modal résolution** | v2.2.0 | Interface de choix pour chaque conflit |
| **Nettoyage FAM orphelines** | v2.2.1 | Suppression familles sans membres |
| **Détection dates précises** | v2.2.2 | "29 NOV 2025" ≠ "12 NOV 2025" = CONFLIT |
| **Isolation doublons/clusters** | v2.2.3 | Sélections complètement indépendantes |
| **Fusion en cascade** | v2.2.4 | A→B→C résolu en A→C (clusters N individus) |
| **Redirection références** | v2.2.4 | HUSB/WIFE/CHIL redirigés via mergeMap |

### Scoring amélioré (v2.2.5)

| Fonctionnalité | Version | Description |
|----------------|---------|-------------|
| **Couleurs inversées** | v2.2.5 | 🟢 FORT (feu vert), 🟡 MOYEN, 🔴 FAIBLE (prudence) |
| **Pondération noms rares** | v2.2.5 | Noms rares = +35 pts, très communs = 20 pts |
| **Bonus combinaison** | v2.2.5 | +15 pts si nom+naissance+lieu, +8 pts si nom+naissance |
| **Malus incohérence** | v2.2.5 | -10 pts si lieux naissance contradictoires |

### Normalisation des lieux (v2.2.6)

| Fonctionnalité | Version | Description |
|----------------|---------|-------------|
| **Modal normalisation** | v2.2.6 | Interface complète pour corriger les variantes de lieux |
| **API Géo intégrée** | v2.2.6 | Suggestions officielles depuis geo.api.gouv.fr |
| **Saisie manuelle** | v2.2.6 | Autocomplétion temps réel pendant la frappe |
| **Format normalisé** | v2.2.6 | Commune, Département, Région, France |
| **Préservation rawLines** | v2.2.6 | Conservation de toutes les données GEDCOM |
| **Écran récapitulatif** | v2.2.6 | Stats groupes normalisés + lieux corrigés |

---

## Critères de Comparaison

| # | Critère | Points max | Suffisant |
|---|---------|------------|-----------|
| 1 | Noms | 30 | - |
| 2 | Date naissance | 25 | ✅ |
| 3 | Sexe | 15 | - |
| 4 | Parents | 20 | ✅ |
| 5 | Fratrie | 15 | ✅ |
| 6 | Lieu naissance | 10 | ✅ |
| 7 | Conjoints | 8 | ✅ |
| 8 | Date décès | 15 | ✅ |
| 9 | Lieu décès | 8 | ✅ |
| 10 | Profession | 5 | ✅ |
| 11 | Enfants | 15 | ✅ |
| 12 | Baptême | 5 | - |
| 13 | Lieu baptême | 4 | - |
| 14 | Lieu inhumation | 4 | - |
| 15 | Résidence | 4 | - |
| 16 | Titre | 3 | - |
| 17 | Religion | 3 | - |
| 18 | Inhumation | 5 | - |
| | **Total possible** | **190** | |

---

## Architecture v2.3.0

### Structure des fichiers

```
gedcom-merger/
├── src/
│   ├── App.jsx              # ~4400 lignes, composant principal
│   ├── utils/
│   │   └── fusionOrder.mjs  # NOUVEAU - Module ordre de fusion (17KB)
│   ├── index.css
│   └── main.jsx
├── public/
│   └── gedcom-worker.js     # ~54KB, Worker autonome
├── tests/
│   ├── test-complete.cjs    # 527 tests statiques
│   ├── helpers.test.mjs     # 47 tests Vitest
│   ├── parser.test.mjs      # 30 tests Vitest
│   ├── stats.test.mjs       # 31 tests Vitest
│   └── conflicts.test.mjs   # 56 tests Vitest
├── CHANGELOG.md
├── DEPLOIEMENT.md
├── TEST_RESULTS.md
└── package.json
```

### Module fusionOrder.mjs - Détails

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        MODULE fusionOrder.mjs                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

  ENTRÉE                  TRAITEMENT                          SORTIE
  ───────────────────────────────────────────────────────────────────────────────
  duplicates[]     ──►    buildDependencyGraph()    ──►    graph (Map)
  individuals[]           - Indexe les paires                - pairId → node
                          - Détecte relations                - dependsOn[]
                          - Calcule dépendances              - blocks[]
                                   │
                                   ▼
                          calculateFusionOrder()    ──►    fusionOrder[]
                          - DFS récursif                     - level
                          - Détection cycles                 - pairIds[]
                          - Tri topologique                  - label
                                   │
                                   ▼
                          calculateEnrichedQuality() ──►   score (0-100)
                          - Précision dates                  - datePrecision
                          - Précision lieux                  - placePrecision
                          - Validité relations               - validRelations
                          - Nombre sources                   - sourceCount
```

---

## Catégories de Tests (720 total)

| # | Catégorie | Tests | Description |
|---|-----------|-------|-------------|
| 1 | Fondamentaux | 61 | Structure, imports, exports |
| 2 | Parsing GEDCOM | 52 | parseGedcom, CONT/CONC, rawLines |
| 3 | Détection doublons | 42 | findDuplicates, calculateSimilarity |
| 4 | Fusion & suppression | 34 | mergePersonData, handleMerge |
| 5 | Interface utilisateur | 79 | Onglets, boutons, états |
| 6 | Suggestions IA | 18 | generateAiSuggestions |
| 7 | Config & déploiement | 39 | Netlify, package.json |
| 8 | Qualité & analyses v2.1.x | 68 | Rapport, chrono, stats, Worker |
| 9 | Conflits v2.2.x | 36 | Détection, résolution, nettoyage |
| 10 | Scoring/Normalisation | 47 | v2.2.5 couleurs, v2.2.6 API Géo |
| 11 | **Module fusion v2.3.0** | **45** | Structure, graphe, tri, qualité |
| | **Vitest** | +193 | helpers, parser, stats, conflicts |
| | **TOTAL** | **720** | |

---

## À venir (v2.4.0)

| Fonctionnalité | Priorité | Description |
|----------------|----------|-------------|
| **Fusion guidée contextuelle** | P1 | Assistant déclenché lors de fusions avec dépendances |
| **Ordre Top-Down** | P1 | Parents stables → Conjoints → Enfants |
| **Recalcul dynamique** | P1 | Mise à jour après chaque fusion |
| Export CSV | P2 | Export individus, familles, doublons |
| Export JSON | P2 | Format structuré pour analyse externe |

---

## Historique des versions

| Version | Date | Type | Changements clés |
|---------|------|------|------------------|
| **v1.0.0** | 29/11/2025 | 🚀 Initial | Soundex français, triple indexation |
| **v1.6.0** | 10/12/2025 | ✨ Feature | Premiers Web Workers, variants orthographiques |
| **v1.8.6** | 16/12/2025 | ✨ Feature | HEAD/TRLR automatiques, conformité GEDCOM 5.5.1 |
| **v1.9.0** | 28/12/2025 | ✨ Feature | 4 onglets, suggestions IA |
| **v2.0.0** | 31/12/2025 | 🚀 Major | 18 critères, rawLines, 295 tests |
| **v2.1.0** | 02/01/2026 | ✨ Feature | Rapport qualité, chrono, stats, 377 tests |
| **v2.1.4** | 03/01/2026 | 🚀 Perf | Web Worker, 501 tests, 3-5x plus rapide |
| **v2.2.0** | 04/01/2026 | ✨ Feature | Détection conflits, modal résolution |
| **v2.2.4** | 05/01/2026 | 🐛 Fix | Fusion cascade, redirection références |
| **v2.2.5** | 10/01/2026 | ✨ Feature | Scoring amélioré, couleurs inversées |
| **v2.2.6** | 10/01/2026 | ✨ Feature | Outil de normalisation des lieux |
| **v2.3.0** | 13/01/2026 | 🔧 Tech | Module fusionOrder.mjs (préparation v2.4.0) |

---

## Stack technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Framework | React | 18.2.0 |
| Build | Vite | 5.4.21 |
| CSS | Tailwind CSS | 3.4.0 |
| Icônes | Lucide React | 0.263.1 |
| Tests unitaires | Vitest | 1.0.0 |
| Minification | esbuild | (via Vite) |
| Hébergement | Netlify | - |

### ⚠️ Configuration critique

```javascript
// postcss.config.cjs - DOIT être CommonJS
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

// tailwind.config.cjs - DOIT être CommonJS  
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

**NE PAS utiliser `export default`** (ESM) sinon erreur Netlify build.

---

## Performance v2.3.0

| Fichier | Sans Worker | Avec Worker |
|---------|-------------|-------------|
| 1000 individus | ~5s bloqué | ~2s fluide |
| 3000 individus | ~15s bloqué | ~5s fluide |
| 7000 individus | ~30s bloqué | ~8s fluide |

---

*Document mis à jour le 13 janvier 2026 - v2.3.0*
