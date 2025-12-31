# Architecture - GEDCOM Merger v2.0.0

## Structure du projet

```
gedcom-v2.0.0/
├── src/
│   ├── App.jsx           # Composant principal (~1600 lignes)
│   ├── main.jsx          # Point d'entrée React
│   └── index.css         # Styles Tailwind
├── tests/
│   └── test-complete.cjs # Suite de 295 tests
├── docs/
│   └── ARCHITECTURE.md   # Ce fichier
├── index.html            # Page HTML
├── package.json          # Dépendances
├── vite.config.js        # Build config (esbuild)
├── tailwind.config.js    # Tailwind config
├── postcss.config.js     # PostCSS config
├── netlify.toml          # Déploiement Netlify
├── README.md             # Documentation
├── CHANGELOG.md          # Historique versions
├── DEPLOIEMENT.md        # Guide déploiement
├── LIVRAISON_V2_0_0.md   # Notes de version
└── RAPPORT_TESTS_V2_0_0.md
```

## Flux de données

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLUX GEDCOM MERGER v2.0.0                           │
└─────────────────────────────────────────────────────────────────────────────┘

     FICHIER.ged              parseGedcom()                  DÉTECTION
    ┌───────────┐           ┌─────────────────┐           ┌─────────────┐
    │ Texte     │──────────▶│ individuals[]   │──────────▶│ duplicates[]│
    │ brut      │           │ + rawLines      │           │ clusters[]  │
    └───────────┘           │ + rawLinesByTag │           └─────────────┘
                            └─────────────────┘                  │
                                                                 │
                                                                 ▼
    ┌───────────┐           ┌─────────────────┐           ┌─────────────┐
    │ FICHIER   │◀──────────│ downloadClean   │◀──────────│ SÉLECTION   │
    │ fusionné  │           │ edFile()        │           │ utilisateur │
    └───────────┘           └─────────────────┘           └─────────────┘
                                    │
                                    │ utilise
                                    ▼
                            ┌─────────────────┐
                            │ mergePersonData │
                            │ generate...Lines│
                            └─────────────────┘
```

## Structures de données clés

### Personne (Individual)

```javascript
{
  // Identification
  id: "I504017",
  names: ["Hugues /Berger/", "Hugues Pierre /Berger/"],
  sex: "M",
  
  // Dates et lieux (parsés pour détection)
  birth: "19 SEP 1726",
  birthPlace: "Grenoble, Isère",
  death: "5 MAR 1789",
  deathPlace: "Lyon",
  baptism: "", baptismPlace: "",
  burial: "", burialPlace: "",
  
  // Autres
  occupation: "Notaire",
  religion: "", title: "", residence: "", note: "",
  
  // Relations
  parents: ["I503001", "I503002"],
  spouses: ["I504018"],
  children: ["I504050", "I504051"],
  familyAsChild: "F501",
  familiesAsSpouse: ["F502"],
  
  // v2.0.0: Données brutes pour préservation
  rawLines: [
    "0 @I504017@ INDI",
    "1 NAME Hugues /Berger/",
    "1 SEX M",
    "1 BIRT", "2 DATE 19 SEP 1726", "2 PLAC Grenoble",
    "1 SOUR @S500001@", "2 PAGE Acte 123",
    // ...toutes les lignes originales
  ],
  rawLinesByTag: {
    "SOUR": [{ startIdx: 6, lines: ["1 SOUR @S500001@", "2 PAGE Acte 123"] }],
    "NOTE": [...],
    "OBJE": [...],
    "_MYPROP": [...]
  }
}
```

### Doublon détecté (Duplicate)

```javascript
{
  id: "I504017-I504018",
  person1: { /* Individual */ },
  person2: { /* Individual */ },
  similarity: 92,  // Score 0-100
  details: [
    "✓ Noms phonétiquement identiques (+25/30)",
    "✓ Années naissance identiques (+20/25)",
    "✓ Même sexe (+15/15)"
  ],
  sufficientCriteria: ["annee_naissance"]
}
```

### Personne fusionnée (Merged)

```javascript
{
  id: "I504017",           // ID conservé (meilleure qualité)
  removedId: "I504018",    // ID supprimé
  
  // Données combinées
  names: ["Hugues /Berger/", "Hugues Pierre /Berger/"],
  birth: "19 SEP 1726",    // primary || secondary
  death: "5 MAR 1789",
  // ...
  
  // v2.0.0: rawLinesByTag fusionnés
  rawLinesByTag: {
    "SOUR": [/* blocs des 2 personnes, dédupliqués */],
    "NOTE": [/* combinés */],
    // ...
  },
  
  // Traçabilité
  mergedFrom: ["I504017", "I504018"],
  qualityScore: 85
}
```

## Fonctions principales

| Fonction | Rôle |
|----------|------|
| `parseGedcom()` | Parse le fichier, crée individuals[] avec rawLines |
| `findDuplicates()` | Détecte les doublons via triple indexation |
| `calculateSimilarity()` | Score 0-100 entre 2 personnes |
| `detectClusters()` | Trouve les groupes de 3+ interconnectés |
| `mergePersonData()` | Combine les données de 2 personnes |
| `generateMergedIndiLines()` | Génère le bloc INDI fusionné |
| `downloadCleanedFile()` | Produit le fichier GEDCOM final |

## Tests

- **295 tests** automatisés
- Exécutés avant chaque build Netlify
- Bloquent le déploiement si échec
- Couvrent syntaxe, fonctionnel, UI, algorithmes
