# Architecture GEDCOM Merger v1.9.4

## Structure du projet

```
gedcom-merger/
├── src/
│   ├── App.jsx          # Composant principal
│   ├── main.jsx         # Point d'entrée React
│   └── index.css        # Styles Tailwind
├── tests/
│   └── test-complete.cjs # Suite de tests (226 tests)
├── docs/
│   └── ARCHITECTURE.md
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── netlify.toml
```

## Composants principaux

### GedcomDuplicateMerger
Composant React principal gérant l'ensemble de l'application.

### États clés
- `individuals` : Personnes parsées du GEDCOM
- `duplicates` : Paires de doublons détectés  
- `clusters` : Groupes de doublons interconnectés
- `integrityReport` : Rapport de contrôle d'intégrité

### Fonctions principales
- `parseGedcom()` : Parse le fichier GEDCOM
- `calculateSimilarity()` : Calcule le score de similarité
- `detectClusters()` : Détecte les clusters de doublons
- `performIntegrityChecks()` : Contrôle d'intégrité 8 types
