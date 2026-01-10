# Architecture - GEDCOM Merger v2.2.6

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           GEDCOM Merger                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐           ┌─────────────────────────────────┐  │
│  │   Thread Principal  │           │         Web Worker              │  │
│  │   (React UI)        │◄─────────►│    (gedcom-worker.js)           │  │
│  │                     │postMessage│                                 │  │
│  │  • App.jsx          │ onmessage │  • parseGedcom                  │  │
│  │  • États React      │           │  • findDuplicates               │  │
│  │  • Handlers         │           │  • calculateSimilarity          │  │
│  │  • UI/Modaux        │           │  • detectClusters               │  │
│  └─────────────────────┘           │  • generateQualityReport        │  │
│                                    │  • detectChronoIssues           │  │
│                                    │  • calculateGenealogyStats      │  │
│                                    └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Fichiers principaux

| Fichier | Lignes | Description |
|---------|--------|-------------|
| `src/App.jsx` | ~3200 | Composant principal React |
| `public/gedcom-worker.js` | ~1300 | Web Worker pour traitements lourds |
| `src/utils/helpers.mjs` | ~100 | Fonctions utilitaires |
| `src/utils/parser.mjs` | ~150 | Parsing GEDCOM |
| `src/utils/stats.mjs` | ~200 | Statistiques généalogiques |

## Fonctions clés

### App.jsx

| Fonction | Description |
|----------|-------------|
| `parseGedcom()` | Parse le fichier GEDCOM en structure JS |
| `calculateSimilarity()` | Compare 2 personnes (18 critères) |
| `findDuplicates()` | Détecte les doublons potentiels |
| `detectClusters()` | Groupe les doublons interconnectés |
| `mergePersonData()` | Fusionne les données de 2 personnes |
| `detectMergeConflicts()` | Détecte les conflits avant fusion |
| `areValuesCompatible()` | Compare intelligemment 2 valeurs |
| `cleanOrphanedFamilies()` | Nettoie les FAM orphelines |
| `handleMerge()` | Gère le processus de fusion |
| `downloadCleanedFile()` | Génère le fichier GEDCOM nettoyé |
| `calculateSurnameStats()` | Calcule fréquence des noms (v2.2.5) |
| `searchPlaceApi()` | Recherche lieu via API Géo (v2.2.6) |
| `applyPlaceNormalizations()` | Applique corrections lieux (v2.2.6) |

### Critères de comparaison (18)

1. Noms (20-35 pts, pondération dynamique v2.2.5)
2. Date naissance (25 pts) ✓
3. Sexe (15 pts)
4. Parents (20 pts) ✓
5. Fratrie (15 pts) ✓
6. Lieu naissance (10 pts) ✓
7. Conjoints (8 pts) ✓
8. Date décès (15 pts) ✓
9. Lieu décès (8 pts) ✓
10. Profession (5 pts) ✓
11. Enfants (15 pts) ✓
12. Baptême (5 pts)
13. Lieu baptême (4 pts)
14. Inhumation (5 pts)
15. Lieu inhumation (4 pts)
16. Résidence (4 pts)
17. Titre (3 pts)
18. Religion (3 pts)

✓ = Critère suffisant

## États React principaux

```javascript
// Données
individuals          // Personnes parsées
duplicates           // Doublons détectés
clusters             // Groupes interconnectés
familiesData         // Familles (Map)

// UI
step                 // 'upload' | 'review' | 'merged'
activeTab            // Onglet actif
showConflictModal    // Modal conflits v2.2.0
mergeConflicts       // Conflits détectés v2.2.0
showPlaceNormModal   // Modal normalisation lieux v2.2.6
placeNormSelections  // Sélections de normalisation v2.2.6
placeApiSuggestions  // Suggestions API Géo v2.2.6

// Sélections
selectedPairs        // Paires sélectionnées
selectedClusters     // Clusters sélectionnés
selectedToDelete     // Personnes à supprimer
```

## Flux de données

```
1. Upload fichier
   ↓
2. Lecture FileReader
   ↓
3. Envoi au Worker (postMessage)
   ↓
4. Worker: parseGedcom → findDuplicates → stats
   ↓
5. Worker retourne résultats (onmessage)
   ↓
6. Mise à jour états React
   ↓
7. Affichage interface
   ↓
8. Sélection doublons par utilisateur
   ↓
9. handleMerge → detectMergeConflicts
   ↓
10. Si conflits: showConflictModal
   ↓
11. Résolution conflits → executeMerge
   ↓
12. downloadCleanedFile (+ cleanOrphanedFamilies)
```

---

*Version 2.2.4 - 4 janvier 2026*
