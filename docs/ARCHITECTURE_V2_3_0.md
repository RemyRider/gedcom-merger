# Architecture GEDCOM Merger v2.3.0

## Vue d'ensemble

GEDCOM Merger est une application React monopage pour la détection et fusion de doublons dans les fichiers généalogiques GEDCOM.

---

## Structure des fichiers

```
gedcom-merger/
├── src/
│   ├── App.jsx                 # Composant principal (~4400 lignes)
│   ├── utils/
│   │   └── fusionOrder.mjs     # Module ordre de fusion (v2.3.0)
│   ├── index.css               # Styles Tailwind
│   └── main.jsx                # Point d'entrée React
├── public/
│   └── gedcom-worker.js        # Web Worker (~54KB)
├── tests/
│   ├── test-complete.cjs       # 527 tests statiques
│   ├── helpers.test.mjs        # Tests Vitest
│   ├── parser.test.mjs
│   ├── stats.test.mjs
│   └── conflicts.test.mjs
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.cjs         # ⚠️ CommonJS obligatoire
├── postcss.config.cjs          # ⚠️ CommonJS obligatoire
├── CHANGELOG.md
├── README.md
└── DEPLOIEMENT.md
```

---

## Composants principaux

### App.jsx - Composant principal

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              App.jsx (~4400 lignes)                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ÉTATS PRINCIPAUX                                                               │
│  ────────────────────────────────────────────────────────────────────────────── │
│  • individuals[]        - Liste des personnes parsées                          │
│  • families[]           - Liste des familles parsées                           │
│  • duplicates[]         - Paires de doublons détectés                          │
│  • clusters[]           - Groupes de 3+ doublons interconnectés                │
│  • selectedPairs[]      - Paires sélectionnées pour fusion                     │
│  • conflicts[]          - Conflits détectés avant fusion                       │
│  • qualityReport{}      - Rapport qualité du fichier                           │
│                                                                                 │
│  FONCTIONS PRINCIPALES                                                          │
│  ────────────────────────────────────────────────────────────────────────────── │
│  • parseGedcom()        - Parse fichier GEDCOM                                 │
│  • findDuplicates()     - Détecte les doublons                                 │
│  • calculateSimilarity() - Score de similarité (18 critères)                   │
│  • mergePersonData()    - Fusionne deux personnes                              │
│  • detectConflicts()    - Détecte les conflits avant fusion                    │
│  • resolveChains()      - Résout les chaînes A→B→C                             │
│  • cleanOrphanedFamilies() - Nettoie les FAM orphelines                        │
│                                                                                 │
│  INTERFACE                                                                      │
│  ────────────────────────────────────────────────────────────────────────────── │
│  • 5 onglets : Clusters | Doublons | À supprimer | IA | Changelog              │
│  • Modals : Prévisualisation | Conflits | Normalisation lieux | Qualité        │
│  • Boutons flottants : Actions rapides                                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### fusionOrder.mjs - Module ordre de fusion (v2.3.0)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          fusionOrder.mjs (~17KB)                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  CONSTANTES                                                                     │
│  ────────────────────────────────────────────────────────────────────────────── │
│  • FUSION_LEVELS        - Niveaux de fusion (0-3)                              │
│  • FUSION_LEVEL_LABELS  - Labels et emojis par niveau                          │
│                                                                                 │
│  FONCTIONS GRAPHE                                                               │
│  ────────────────────────────────────────────────────────────────────────────── │
│  • createPairId()       - Génère ID unique pour paire                          │
│  • buildDependencyGraph() - Construit le graphe de dépendances                 │
│  • findDuplicatesAmongIds() - Trouve doublons parmi liste d'IDs                │
│                                                                                 │
│  FONCTIONS TRI                                                                  │
│  ────────────────────────────────────────────────────────────────────────────── │
│  • calculateFusionOrder() - Tri topologique des paires                         │
│  • calculateLevel()     - DFS récursif pour niveau                             │
│                                                                                 │
│  FONCTIONS QUALITÉ                                                              │
│  ────────────────────────────────────────────────────────────────────────────── │
│  • calculateEnrichedQuality() - Score qualité enrichi (0-100)                  │
│  • getDatePrecisionScore() - Précision date (exact/approx/année)               │
│  • getPlacePrecisionScore() - Précision lieu (niveaux géo)                     │
│                                                                                 │
│  FONCTIONS UTILITAIRES                                                          │
│  ────────────────────────────────────────────────────────────────────────────── │
│  • prepareLevelForDisplay() - Prépare données pour affichage                   │
│  • canFuseLevel()       - Vérifie si niveau peut être fusionné                 │
│  • calculateFusionStats() - Statistiques de fusion                             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### gedcom-worker.js - Web Worker

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         gedcom-worker.js (~54KB)                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  TRAITEMENT EN ARRIÈRE-PLAN                                                     │
│  ────────────────────────────────────────────────────────────────────────────── │
│  • Parsing GEDCOM (parseGedcom)                                                │
│  • Détection doublons (findDuplicates)                                         │
│  • Calcul similarité (calculateSimilarity)                                     │
│  • Normalisation lieux (normalizePlaces)                                       │
│  • Statistiques (generateStats)                                                │
│                                                                                 │
│  COMMUNICATION                                                                  │
│  ────────────────────────────────────────────────────────────────────────────── │
│  • postMessage({ type, progress, data })                                       │
│  • Types: 'progress' | 'result' | 'error'                                      │
│                                                                                 │
│  AVANTAGES                                                                      │
│  ────────────────────────────────────────────────────────────────────────────── │
│  • Interface toujours réactive                                                 │
│  • Progression temps réel                                                      │
│  • Performance 3-5x améliorée (perçue)                                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Flux de données

### Parsing et analyse

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         FLUX PARSING ET ANALYSE                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

  FICHIER           WEB WORKER              APP.JSX              INTERFACE
  .ged                                                          
    │                                                           
    ▼                                                           
┌─────────┐                                                     
│ Upload  │──────►  parseGedcom()  ──────►  individuals[]  ──────►  Affichage
│         │         families[]               families[]            statistiques
└─────────┘              │                       │                     │
                         │                       │                     │
                         ▼                       ▼                     ▼
                  findDuplicates()  ──────►  duplicates[]  ──────►  Onglet
                         │                   clusters[]           Doublons
                         │                       │                     │
                         ▼                       ▼                     ▼
                  normalizePlaces()  ─────►  placeGroups[]  ─────►  Modal
                                                                  Normalisation
```

### Fusion

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            FLUX DE FUSION v2.2.4+                               │
└─────────────────────────────────────────────────────────────────────────────────┘

  SÉLECTION         CONFLITS           RÉSOLUTION          FUSION           EXPORT
      │                 │                   │                 │                │
      ▼                 ▼                   ▼                 ▼                ▼
┌─────────────┐  ┌─────────────┐    ┌─────────────┐   ┌─────────────┐  ┌─────────────┐
│selectedPairs│──│detectConflict│───│resolveConflict│──│mergePersonData│──│generateGedcom│
│             │  │10 champs    │    │Modal choix  │   │rawLines[]   │  │HEAD/TRLR    │
└─────────────┘  └─────────────┘    └─────────────┘   └─────────────┘  └─────────────┘
                                                             │
                                                             ▼
                                                     ┌─────────────┐
                                                     │resolveChains│
                                                     │A→B→C = A→C  │
                                                     └─────────────┘
                                                             │
                                                             ▼
                                                     ┌─────────────┐
                                                     │cleanOrphaned│
                                                     │Families     │
                                                     └─────────────┘
```

---

## Structures de données

### Individu (person)

```javascript
{
  id: 'I100',                    // ID GEDCOM
  name: 'Jean /DUPONT/',         // Nom complet
  firstName: 'Jean',             // Prénom extrait
  lastName: 'DUPONT',            // Nom extrait
  sex: 'M',                      // M/F
  birth: '15 MAR 1850',          // Date naissance
  birthPlace: 'Paris, France',   // Lieu naissance
  death: '20 DEC 1920',          // Date décès
  deathPlace: 'Lyon, France',    // Lieu décès
  baptism: '',                   // Date baptême
  baptismPlace: '',              // Lieu baptême
  burial: '',                    // Date inhumation
  burialPlace: '',               // Lieu inhumation
  occupation: 'Forgeron',        // Profession
  residence: '',                 // Résidence
  title: '',                     // Titre
  religion: '',                  // Religion
  parents: ['I50', 'I51'],       // IDs parents
  spouses: ['I200'],             // IDs conjoints
  children: ['I300', 'I301'],    // IDs enfants
  famc: 'F50',                   // Famille comme enfant
  fams: ['F100'],                // Familles comme conjoint
  rawLines: [...],               // v2.0.0: Toutes lignes GEDCOM
  rawLinesByTag: {               // v2.0.0: Indexées par tag
    SOUR: [...],
    NOTE: [...],
    OBJE: [...]
  }
}
```

### Paire de doublons

```javascript
{
  person1: { /* person */ },
  person2: { /* person */ },
  score: 85,                     // Score similarité (0-100)
  details: {
    name: 30,
    birth: 25,
    sex: 15,
    // ... 18 critères
  },
  level: 'FORT',                 // FORT/MOYEN/FAIBLE
  hasSufficientCriteria: true    // Anti-faux-positif
}
```

### Graphe de dépendances (v2.3.0)

```javascript
// Map<pairId, node>
{
  'I100-I200': {
    pairId: 'I100-I200',
    persons: ['I100', 'I200'],
    dependsOn: ['I50-I150', 'I51-I151'],  // Parents doublons
    blocks: ['I300-I400'],                 // Enfants doublons
    childDuplicates: [...],
    spouseDuplicates: [...],
    parentDuplicates: [...]
  }
}
```

---

## Algorithmes clés

### Soundex français

```javascript
// Adaptation pour noms français
const soundexFr = (name) => {
  // Normalisation
  let s = name.toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // Accents
    .replace(/[^A-Z]/g, '');                           // Non-alpha
  
  // Première lettre préservée
  const first = s[0];
  
  // Codage phonétique français
  s = s.slice(1)
    .replace(/[AEIOUY]/g, '0')
    .replace(/[BFPV]/g, '1')
    .replace(/[CGJKQSXZ]/g, '2')
    .replace(/[DT]/g, '3')
    .replace(/[L]/g, '4')
    .replace(/[MN]/g, '5')
    .replace(/[R]/g, '6');
  
  // Suppression doublons + padding
  return (first + s.replace(/(.)\1+/g, '$1')).slice(0, 4).padEnd(4, '0');
};
```

### Tri topologique (v2.3.0)

```javascript
const calculateFusionOrder = (graph) => {
  const levels = new Map();
  const nodeLevel = new Map();
  const visiting = new Set();
  
  const calculateLevel = (pairId) => {
    if (nodeLevel.has(pairId)) return nodeLevel.get(pairId);
    if (visiting.has(pairId)) {
      console.warn(`Cycle détecté: ${pairId}`);
      return 0;  // Forcer niveau 0 pour briser cycle
    }
    
    visiting.add(pairId);
    const node = graph.get(pairId);
    
    if (!node?.dependsOn?.length) {
      visiting.delete(pairId);
      nodeLevel.set(pairId, 0);
      return 0;
    }
    
    const maxDep = Math.max(...node.dependsOn.map(calculateLevel));
    const level = maxDep + 1;
    
    visiting.delete(pairId);
    nodeLevel.set(pairId, level);
    return level;
  };
  
  // Calculer tous les niveaux
  for (const pairId of graph.keys()) {
    calculateLevel(pairId);
  }
  
  // Grouper par niveau
  // ...
};
```

---

## Configuration critique

### ⚠️ Fichiers CommonJS obligatoires

```javascript
// postcss.config.cjs
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

// tailwind.config.cjs
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

**JAMAIS utiliser `export default`** → Erreur build Netlify

### package.json

```json
{
  "name": "gedcom-merger",
  "version": "2.3.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run",
    "test:static": "node tests/test-complete.cjs",
    "test:all": "npm run test:static && npm run test"
  }
}
```

---

## Performance

| Opération | Sans Worker | Avec Worker |
|-----------|-------------|-------------|
| Parse 7000 individus | ~8s bloqué | ~8s fluide |
| Détection doublons | ~20s bloqué | ~20s fluide |
| Interface | Freeze | Réactive |
| Progression | Non | Oui |

**Gain perçu** : 3-5x plus rapide grâce à l'interface réactive

---

## Tests

### Catégories (720 tests)

| # | Catégorie | Tests |
|---|-----------|-------|
| 1-6 | Core (v1.x) | 286 |
| 7 | Config | 39 |
| 8 | Qualité v2.1.x | 68 |
| 9 | Conflits v2.2.x | 36 |
| 10 | Scoring v2.2.5 | 47 |
| 11 | **Fusion v2.3.0** | **45** |
| | Vitest | +193 |

### Commandes

```bash
npm run test:static  # 527 tests statiques
npm run test         # 193 tests Vitest
npm run test:all     # Tous
```

---

*Architecture mise à jour le 13 janvier 2026 - v2.3.0*
