# Architecture GEDCOM Merger v1.9.3

## Structure du projet

```
gedcom-merger-v1.9.3/
├── src/
│   ├── App.jsx          # Composant principal (~1500 lignes)
│   ├── main.jsx         # Point d'entrée React
│   └── index.css        # Styles Tailwind
├── tests/
│   └── test-complete.cjs # Tests automatisés
├── docs/
│   ├── ARCHITECTURE.md  # Ce fichier
│   └── TESTS.md         # Documentation des tests
├── index.html           # Template HTML
├── package.json         # Dépendances npm
├── vite.config.js       # Configuration Vite (esbuild)
├── tailwind.config.js   # Configuration Tailwind
├── postcss.config.js    # Configuration PostCSS
├── README.md            # Documentation principale
├── CHANGELOG.md         # Historique des versions
└── DEPLOIEMENT.md       # Guide de déploiement
```

## États React (22 states)

```javascript
// Fichier et données
file, originalGedcom, individuals, familiesData

// Doublons et clusters
duplicates, clusters, selectedPairs, selectedClusters, expandedClusters

// Onglet À supprimer (v1.9.3)
toDeletePersons, selectedToDelete

// Suggestions IA
smartSuggestions, integrityReport

// Interface
step, progress, activeTab, showChangelog, previewPair
searchTerm, filterScore, clusterScoreFilter

// Résultats
mergedIds, validationResults
```

## Algorithme de similarité

### Pondérations (total possible: 143 points)
- Noms : 30 points
- Date naissance : 25 points
- Sexe : 15 points (ÉLIMINATOIRE si différent)
- Parents : 20 points
- Fratrie : 15 points
- Lieu naissance : 10 points
- Conjoints : 8 points
- Date décès : 15 points
- Profession : 5 points

### Critères suffisants (v1.9.2)
Le nom seul ne suffit plus. Au moins 1 critère requis :
- naissance_exacte, annee_naissance, annee_proche
- lieu_naissance, lieu_partiel
- parents_2, parent_1, fratrie
- conjoints
- deces_exact, annee_deces
- profession

## Performance

- Triple indexation : phonétique + année + parents
- Réduction comparaisons : ~95%
- Seuil minimum : 80%
