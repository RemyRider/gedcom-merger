# Architecture - GEDCOM Merger v2.4.2

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                      GEDCOM Merger v2.4.2                       │
├─────────────────────────────────────────────────────────────────┤
│  Interface React                                                │
│  ├── Chargement GEDCOM                                          │
│  ├── Détection doublons (Web Worker)                            │
│  ├── Tri global par facilité (🧹 cleanlinessScore)              │
│  ├── Onglet Clusters (trié par facilité moyenne)                │
│  ├── Onglet Doublons (trié par facilité)                        │
│  ├── Modal cherry-picking (fusion multiple)                     │
│  └── Export GEDCOM nettoyé                                      │
├─────────────────────────────────────────────────────────────────┤
│  Module fusionOrder.mjs                                         │
│  ├── Score de propreté (cleanlinessScore)                       │
│  ├── Dépendances complètes (parents + conjoints + enfants)      │
│  ├── Détection potentiels doublons                              │
│  ├── Analyse différences (cherry-picking)                       │
│  └── Suggestions automatiques                                   │
├─────────────────────────────────────────────────────────────────┤
│  Services externes                                              │
│  └── API Géo (normalisation lieux)                              │
└─────────────────────────────────────────────────────────────────┘
```

## Structure des fichiers

```
src/
├── App.jsx                    # Application principale (~185 KB, ~5200 lignes)
├── main.jsx                   # Point d'entrée React
├── index.css                  # Styles Tailwind
└── utils/
    └── fusionOrder.mjs        # Module fusion (v2.4.2)

tests/
├── test-complete.cjs          # 612 tests statiques
└── fusionOrder.test.mjs       # 253 tests Vitest

public/
└── gedcom-worker.js           # Web Worker détection
```

## Module fusionOrder.mjs

### Constantes

```javascript
FIELD_TYPES = { SIMPLE, MULTIVALUE, RELATION }

MERGE_FIELDS_CONFIG = {
  birth: { type: SIMPLE, label: 'Date de naissance', category: 'dates' },
  names: { type: MULTIVALUE, label: 'Noms', category: 'identity' },
  parents: { type: RELATION, label: 'Parents', category: 'relations' },
  // ...
}
```

### Fonctions principales

| Fonction | Description |
|----------|-------------|
| `buildDependencyGraph` | Construit le graphe avec cleanlinessScore |
| `calculateCleanlinessScore` | Score de propreté (0-100) |
| `detectPotentialDuplicatesAfterMerge` | Potentiels doublons après fusion |
| `sortByCleanlinessScore` | Tri par propreté décroissante |
| `analyzeFieldDifferences` | Différences pour cherry-picking |
| `prepareCherryPickingData` | Données pour le modal |
| `applyMergeChoices` | Application des choix utilisateur |
| `createPairId` | ID unique pour une paire |
| `detectRelatedDuplicates` | Relations liées (parents/conjoints/enfants) |

### Score de propreté (🧹)

```
Score initial : 100 pts

Pénalités (v2.4.2 : TOUTES les relations comptent) :
- -20 pts par PARENT en doublon
- -20 pts par CONJOINT en doublon
- -20 pts par ENFANT en doublon
- -10 pts par potentiel doublon après fusion

Exemples :
┌──────────────────────────────────┬───────┐
│ Situation                        │ Score │
├──────────────────────────────────┼───────┤
│ Aucune relation en doublon       │ 100%  │
│ 1 parent en doublon              │  80%  │
│ 1 parent + 1 conjoint en doublon │  60%  │
│ 2 enfants + 1 conjoint           │  40%  │
└──────────────────────────────────┴───────┘
```

### Dépendances (v2.4.2)

```javascript
// AVANT (v2.4.1) - Incomplet
const blockingDependencies = [...childDuplicates, ...spouseDuplicates];

// APRÈS (v2.4.2) - Complet
const blockingDependencies = [
  ...parentDuplicates,   // ✅ Parents inclus
  ...spouseDuplicates,
  ...childDuplicates
];
```

### Cherry-picking

```javascript
// Résultat de analyzeFieldDifferences
{
  identical: [
    { field: 'sex', label: 'Sexe', value: 'M' }
  ],
  different: [
    { 
      field: 'birth',
      label: 'Date de naissance',
      valueA: '15 MAR 1850',
      valueB: '1850',
      suggestion: { source: 'A', reason: 'Date plus précise' }
    },
    {
      field: 'names',
      type: 'multivalue',
      valuesA: ['Jean /DUPONT/'],
      valuesB: ['J. /DUPONT/'],
      allValues: ['Jean /DUPONT/', 'J. /DUPONT/']
    }
  ],
  suggestions: { birth: {...}, names: {...} }
}
```

### Suggestions automatiques

| Type | Règle |
|------|-------|
| Date | Plus précise (jour > mois > année > ABT) |
| Lieu | Plus complet (4 niveaux > 3 > 2 > 1) |
| Texte | Plus long / non vide |
| Noms | Union (tous) |
| Relations | Union (tous) |

## Flux de données

```
1. Chargement GEDCOM
   └── processGedcom() → individuals[]

2. Détection doublons (Web Worker)
   └── findDuplicates() → duplicates[]

3. Construction graphe + enrichissement (v2.4.2)
   └── buildDependencyGraph() → graph + cleanlinessScores
   └── Enrichissement doublons avec cleanlinessScore

4. Tri par propreté (v2.4.2 - partout)
   ├── getFilteredDuplicates() → paires triées
   ├── getFilteredClusters() → clusters triés
   └── getSimplePairs() → paires simples triées

5. Sélection paire(s)
   └── prepareCherryPickingData() → données modal

6. Fusion multiple (v2.4.2)
   ├── applyCherryPickMerge() → fusion paire 1
   ├── executeMergeWithData() → mise à jour
   └── Chaînage automatique → paire suivante

7. Export
   └── downloadCleanedFile() → fichier .ged
```

## Interface utilisateur

### États visuels (v2.4.2)

| État | Bordure | Fond | Badge |
|------|---------|------|-------|
| Normal | Gris | Blanc | - |
| ⭐ Recommandé | Ambre | Ambre clair | `⭐ Recommandé` |
| ✓ Sélectionné | Vert/Indigo | Vert/Indigo clair | `✓ Sélectionné` |

### Boutons toggle

- Non sélectionné : `Sélectionner` (vert)
- Sélectionné : `✕ Désélect.` (rouge)

## Tests

| Catégorie | Tests |
|-----------|-------|
| Cherry-picking v2.4.1 | 55 |
| Module fusion v2.3.0+ | 45 |
| Fusion guidée v2.4.0 | 30 |
| Tri propreté v2.4.2 | 28 |
| Autres | 454 |
| **Total statiques** | **612** |
| Tests Vitest | 253 |
| **Grand total** | **865** |
