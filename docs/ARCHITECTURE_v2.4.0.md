# Architecture Technique - GEDCOM Merger v2.4.0

## Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERFACE REACT                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐│
│  │  Upload  │  │ Analyse  │  │ Doublons │  │ Fusion Guidée    ││
│  │  GEDCOM  │  │ Qualité  │  │  Liste   │  │ (Modal v2.4.0)   ││
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘│
│       │             │             │                  │          │
│  ┌────▼─────────────▼─────────────▼──────────────────▼────────┐│
│  │                      App.jsx (~4750 lignes)                 ││
│  │  - États React (useState)                                   ││
│  │  - Logique métier                                           ││
│  │  - Handlers d'événements                                    ││
│  └────┬────────────────────────────────────────────────────────┘│
└───────┼─────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────────┐
│                         MODULES UTILITAIRES                        │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐  │
│  │  fusionOrder.mjs    │    │      gedcom-worker.js           │  │
│  │  - Graphe dépend.   │    │      (Web Worker)               │  │
│  │  - Ordre fusion     │    │      - Parsing GEDCOM           │  │
│  │  - Score qualité    │    │      - Détection doublons       │  │
│  │  - Doublons liés    │    │      - Analyse asynchrone       │  │
│  └─────────────────────┘    └─────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────────┐
│                         SERVICES EXTERNES                          │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  API Géo Gouvernementale (geo.api.gouv.fr)                  │  │
│  │  - Autocomplétion communes françaises                       │  │
│  │  - Normalisation des lieux                                  │  │
│  └─────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

## Structure des Fichiers

```
gedcom-merger/
├── src/
│   ├── App.jsx                 # Composant principal
│   ├── utils/
│   │   └── fusionOrder.mjs     # Module fusion intelligente
│   ├── index.css               # Styles Tailwind
│   └── main.jsx                # Point d'entrée React
│
├── public/
│   └── gedcom-worker.js        # Web Worker (54 KB)
│
├── tests/
│   ├── test-complete.cjs       # 557 tests statiques
│   ├── fusionOrder.test.mjs    # 32 tests Vitest
│   ├── parser.test.mjs         # 30 tests Vitest
│   ├── helpers.test.mjs        # Tests utilitaires
│   ├── stats.test.mjs          # Tests statistiques
│   └── conflicts.test.mjs      # Tests conflits
│
├── docs/
│   ├── ETAT_DES_LIEUX.md       # État actuel
│   ├── ARCHITECTURE.md         # Ce fichier
│   └── ROADMAP.md              # Évolutions futures
│
├── index.html                  # Template HTML
├── package.json                # Dépendances
├── vite.config.js              # Configuration Vite
├── tailwind.config.cjs         # Configuration Tailwind (CommonJS!)
├── postcss.config.cjs          # Configuration PostCSS (CommonJS!)
├── netlify.toml                # Configuration Netlify
├── README.md                   # Documentation
├── CHANGELOG.md                # Historique versions
└── DEPLOIEMENT.md              # Guide déploiement
```

## Composant Principal : App.jsx

### États React Principaux

```javascript
// Données GEDCOM
const [individuals, setIndividuals] = useState([]);
const [families, setFamilies] = useState([]);
const [gedcomHeader, setGedcomHeader] = useState([]);

// Doublons
const [duplicates, setDuplicates] = useState([]);
const [selectedPairs, setSelectedPairs] = useState(new Set());
const [mergedIds, setMergedIds] = useState(new Map());

// Interface
const [activeTab, setActiveTab] = useState('upload');
const [isAnalyzing, setIsAnalyzing] = useState(false);

// v2.2.0 - Conflits
const [showConflictModal, setShowConflictModal] = useState(false);
const [mergeConflicts, setMergeConflicts] = useState([]);

// v2.4.0 - Fusion guidée
const [showGuidedFusionModal, setShowGuidedFusionModal] = useState(false);
const [guidedFusionContext, setGuidedFusionContext] = useState(null);
```

### Fonctions Clés

| Fonction | Description |
|----------|-------------|
| `handleFileUpload()` | Charge et parse le fichier GEDCOM |
| `analyzeWithWorker()` | Lance l'analyse via Web Worker |
| `handleMerge()` | Déclenche la fusion (avec détection doublons liés) |
| `handleDirectMerge()` | Fusion directe sans assistant |
| `handleFuseRelatedPair()` | Fusionne une paire liée depuis l'assistant |
| `handleGuidedFusionNext()` | Passe à l'étape suivante |
| `handleCancelGuidedFusion()` | Annule l'assistant |
| `detectMergeConflicts()` | Détecte les conflits relationnels |
| `generateMergedGedcom()` | Génère le fichier GEDCOM fusionné |

## Module fusionOrder.mjs

### Constantes

```javascript
// Niveaux de fusion (ordre croissant = fusionner en premier)
export const FUSION_LEVELS = {
  CHILDREN: 0,      // Enfants - fusionner en premier
  SPOUSES: 1,       // Conjoints - fusionner ensuite
  PARENTS: 2,       // Parents - fusionner en dernier
  INDEPENDENT: 3    // Sans dépendances relationnelles
};

// Labels pour l'affichage
export const FUSION_LEVEL_LABELS = {
  [FUSION_LEVELS.CHILDREN]: { 
    label: 'Enfants', 
    emoji: '👶', 
    color: 'emerald' 
  },
  // ...
};
```

### Graphe de Dépendances

```javascript
// Structure d'un nœud du graphe
{
  pairId: 'I001-I002',
  pair: { person1, person2, score },
  persons: ['I001', 'I002'],
  dependsOn: ['I003-I004'],      // Paires à fusionner AVANT
  blocks: ['I005-I006'],         // Paires à fusionner APRÈS
  parentDuplicates: [],
  spouseDuplicates: [],
  childDuplicates: ['I003-I004'],
  hasParentDuplicates: false,
  hasSpouseDuplicates: false,
  hasChildDuplicates: true
}
```

### Approche Bottom-Up

```
┌─────────────────────────────────────────────────────┐
│                   PARENTS (niveau 2)                │
│               Fusionner EN DERNIER                  │
│                   Grand-père A ↔ Grand-père B       │
└─────────────────────────┬───────────────────────────┘
                          │ dépend de
                          ▼
┌─────────────────────────────────────────────────────┐
│                  CONJOINTS (niveau 1)               │
│                  Fusionner ENSUITE                  │
│                    Père A ↔ Père B                  │
└─────────────────────────┬───────────────────────────┘
                          │ dépend de
                          ▼
┌─────────────────────────────────────────────────────┐
│                   ENFANTS (niveau 0)                │
│               Fusionner EN PREMIER                  │
│                   Enfant A ↔ Enfant B               │
└─────────────────────────────────────────────────────┘
```

### Algorithme de Fusion

1. **Construction du graphe** : `buildDependencyGraph(duplicates, individuals)`
   - Indexation des paires par ID
   - Détection des relations en doublon pour chaque paire
   - Calcul des dépendances (enfants/conjoints) et bloqués (parents)

2. **Calcul de l'ordre** : `calculateFusionOrder(graph)`
   - DFS pour calculer le niveau de chaque nœud
   - Détection des cycles
   - Tri topologique par niveau

3. **Détection doublons liés** : `detectRelatedDuplicates(pair, duplicates, individuals)`
   - Retourne `{ parents[], spouses[], children[], recommendedOrder[] }`

## Web Worker : gedcom-worker.js

### Messages Entrants

```javascript
// Demande de parsing
{ type: 'parse', content: '0 HEAD\n1 SOUR...' }

// Demande d'analyse des doublons
{ type: 'analyze', individuals: [...], threshold: 50 }
```

### Messages Sortants

```javascript
// Résultat du parsing
{ type: 'parsed', individuals: [...], families: [...], header: [...] }

// Progression de l'analyse
{ type: 'progress', percent: 45, message: 'Analyse en cours...' }

// Résultat de l'analyse
{ type: 'analyzed', duplicates: [...] }

// Erreur
{ type: 'error', message: 'Erreur de parsing' }
```

### Optimisations

- **Triple indexation** : par nom, par soundex, par année de naissance
- **Réduction de 99%** des comparaisons nécessaires
- **Traitement par lots** pour éviter le blocage

## Flux de Données

### 1. Chargement GEDCOM

```
Fichier → FileReader → Web Worker → Parse → 
  → individuals[] 
  → families[] 
  → header[]
```

### 2. Détection des Doublons

```
individuals[] → Web Worker → 
  → Indexation (nom, soundex, année)
  → Comparaison par paires
  → Score de similarité
  → duplicates[]
```

### 3. Fusion Guidée (v2.4.0)

```
Sélection paire → handleMerge() →
  → detectRelatedDuplicates() →
  → hasRelatedDuplicates? 
    → OUI: Afficher modal guidé
    → NON: Fusion directe
```

### 4. Export GEDCOM

```
mergedIds → generateMergedGedcom() →
  → Remplacement des ID fusionnés
  → Préservation rawLines
  → Téléchargement fichier
```

## Structure de Données : Person

```javascript
{
  id: 'I001',
  names: ['Jean /DUPONT/'],
  birth: '15 MAR 1850',
  birthPlace: 'Lyon, Rhône, Auvergne-Rhône-Alpes, France',
  death: '20 DEC 1920',
  deathPlace: 'Paris, Paris, Île-de-France, France',
  baptism: null,
  burial: null,
  occupation: 'Agriculteur',
  sex: 'M',
  parents: ['I002', 'I003'],
  spouses: ['I004'],
  children: ['I005', 'I006'],
  familyChild: 'F001',
  familySpouse: ['F002'],
  rawLines: [
    '0 @I001@ INDI',
    '1 NAME Jean /DUPONT/',
    '1 BIRT',
    '2 DATE 15 MAR 1850',
    // ...
  ],
  rawLinesByTag: {
    NAME: ['1 NAME Jean /DUPONT/'],
    BIRT: ['1 BIRT', '2 DATE 15 MAR 1850'],
    // ...
  }
}
```

## Configuration Critique

### postcss.config.cjs

```javascript
// DOIT être CommonJS, pas ESM !
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### tailwind.config.cjs

```javascript
// DOIT être CommonJS, pas ESM !
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### netlify.toml

```toml
[build]
  command = "npm ci && npm run test:all && npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Performance

| Métrique | Valeur |
|----------|--------|
| Temps parsing 1000 individus | < 1s |
| Temps analyse doublons 1000 individus | < 2s |
| Temps parsing 7000 individus | < 5s |
| Temps analyse doublons 7000 individus | < 15s |
| Réduction comparaisons (indexation) | 99% |
| Taille bundle production | 248 KB |
| Taille bundle gzippé | 71 KB |
