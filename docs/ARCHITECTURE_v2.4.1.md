# Architecture - GEDCOM Merger v2.4.1

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                      GEDCOM Merger v2.4.1                       │
├─────────────────────────────────────────────────────────────────┤
│  Interface React                                                │
│  ├── Chargement GEDCOM                                          │
│  ├── Détection doublons (Web Worker)                            │
│  ├── Affichage trié par propreté                                │
│  ├── Modal cherry-picking                                       │
│  └── Export GEDCOM nettoyé                                      │
├─────────────────────────────────────────────────────────────────┤
│  Module fusionOrder.mjs                                         │
│  ├── Score de propreté (cleanlinessScore)                       │
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
├── App.jsx                    # Application principale (~4800 lignes)
├── main.jsx                   # Point d'entrée React
├── index.css                  # Styles Tailwind
└── utils/
    └── fusionOrder.mjs        # Module fusion (v2.4.1)

tests/
└── test-complete.cjs          # 602 tests statiques

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
| `calculateCleanlinessScore` | Score de propreté (0-100) |
| `detectPotentialDuplicatesAfterMerge` | Potentiels doublons après fusion |
| `sortByCleanlinessScore` | Tri par propreté décroissante |
| `analyzeFieldDifferences` | Différences pour cherry-picking |
| `prepareCherryPickingData` | Données pour le modal |
| `applyMergeChoices` | Application des choix utilisateur |

### Score de propreté

```
Score initial : 100 pts

Pénalités :
- -20 pts par relation déjà en doublon
- -10 pts par potentiel doublon après fusion

Exemple :
- 2 enfants en doublon = -40 pts
- 1 potentiel parent doublon = -10 pts
- Score final : 50 pts
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

3. Construction graphe
   └── buildDependencyGraph() → graph + cleanlinessScores

4. Tri par propreté
   └── sortByCleanlinessScore() → paires triées

5. Sélection paire
   └── prepareCherryPickingData() → données modal

6. Choix utilisateur
   └── applyMergeChoices() → personne fusionnée

7. Export
   └── downloadCleanedFile() → fichier .ged
```

## Tests

| Catégorie | Tests |
|-----------|-------|
| Cherry-picking v2.4.1 | 55 |
| Module fusion v2.3.0+ | 45 |
| Fusion guidée v2.4.0 | 30 |
| Autres | 482 |
| **Total statiques** | **612** |
| Tests Vitest | 225 |
| **Grand total** | **836** |
