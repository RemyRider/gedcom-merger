# État des Lieux - GEDCOM Merger v2.4.0

**Date** : 17 janvier 2026  
**Statut** : Production  
**Build** : 248 KB (gzip: 71 KB)

## Métriques Clés

| Métrique | Valeur |
|----------|--------|
| Tests statiques | 557 |
| Tests Vitest | 225 |
| **Total tests** | **782** |
| Critères de comparaison | 18 |
| Catégories de tests | 12 |
| Lignes App.jsx | ~4750 |
| Taille fusionOrder.mjs | ~630 lignes |

## Fonctionnalités par Version

### v2.4.0 (Actuelle)
- ✅ Fusion guidée contextuelle
- ✅ Approche Bottom-Up (enfants → conjoints → parents)
- ✅ Modal d'assistance avec recommandations
- ✅ Détection automatique des doublons liés
- ✅ Option "Ignorer et fusionner"

### v2.3.0
- ✅ Module fusionOrder.mjs
- ✅ Graphe de dépendances
- ✅ Tri topologique
- ✅ Score de qualité enrichi

### v2.2.0
- ✅ Normalisation des lieux (API Géo)
- ✅ Conflits relationnels (parents/conjoints/enfants)
- ✅ Écran récapitulatif pré-fusion

### v2.1.0
- ✅ Web Workers (performance 3-5x)
- ✅ Rapport qualité
- ✅ Analyse chronologique
- ✅ Statistiques avancées
- ✅ Références orphelines
- ✅ Score de suspicion

### v2.0.0
- ✅ 16 champs systématiques
- ✅ Matching phonétique français
- ✅ 40+ variantes orthographiques
- ✅ Export GEDCOM préservé

## Architecture Technique

### Stack
- **Frontend** : React 18, Vite 5
- **Styles** : Tailwind CSS 3.4
- **Tests** : Vitest 1.x, tests statiques custom
- **Déploiement** : Netlify (auto-deploy)

### Fichiers Principaux

```
src/
├── App.jsx              # 4750 lignes - Composant principal
├── utils/
│   └── fusionOrder.mjs  # 630 lignes - Module fusion
└── main.jsx             # Point d'entrée

public/
└── gedcom-worker.js     # 54 KB - Web Worker

tests/
└── test-complete.cjs    # 557 tests statiques
```

### Module fusionOrder.mjs

#### Constantes
```javascript
FUSION_LEVELS = {
  CHILDREN: 0,      // Fusionner en premier
  SPOUSES: 1,       // Fusionner ensuite
  PARENTS: 2,       // Fusionner en dernier
  INDEPENDENT: 3    // Sans dépendances
}
```

#### Fonctions Exportées
| Fonction | Description |
|----------|-------------|
| `createPairId(id1, id2)` | Identifiant canonique de paire |
| `buildDependencyGraph(duplicates, individuals)` | Construit le graphe |
| `calculateFusionOrder(graph)` | Ordre optimal de fusion |
| `detectRelatedDuplicates(pair, duplicates, individuals)` | Doublons liés |
| `needsGuidedFusion(pair, duplicates, individuals)` | Nécessite assistant? |
| `calculateEnrichedQuality(person, peopleById)` | Score qualité |
| `getDatePrecisionScore(dateStr)` | Précision date (0-15) |
| `getPlacePrecisionScore(place)` | Précision lieu (0-10) |
| `calculateFusionStats(order, graph)` | Statistiques |
| `calculateFusionImpact(pair, graph)` | Impact d'une fusion |

## Tests par Catégorie

| # | Catégorie | Tests |
|---|-----------|-------|
| 1 | Fondamentaux | 61 |
| 2 | Parsing GEDCOM | 52 |
| 3 | Détection doublons | 42 |
| 4 | Fusion & suppression | 34 |
| 5 | Interface utilisateur | 79 |
| 6 | Suggestions IA | 18 |
| 7 | Config & déploiement | 39 |
| 8 | Qualité & analyses | 68 |
| 9 | Conflits v2.2.0 | 36 |
| 10 | Scoring/Normalisation | 47 |
| 11 | Module fusion v2.3.0+ | 45 |
| 12 | **Fusion guidée v2.4.0** | **30** |
| | **TOTAL** | **557** |

### Tests Vitest
| Fichier | Tests |
|---------|-------|
| fusionOrder.test.mjs | 32 |
| parser.test.mjs | 30 |
| helpers.test.mjs | ~50 |
| stats.test.mjs | ~50 |
| conflicts.test.mjs | ~60 |
| **TOTAL** | **~225** |

## Points d'Attention

### Configuration Critique
- `postcss.config.cjs` : **DOIT** être CommonJS
- `tailwind.config.cjs` : **DOIT** être CommonJS
- Netlify requiert `npm ci && npm run test:all && npm run build`

### Contraintes Techniques
- Fichiers GEDCOM jusqu'à 7000+ individus testés
- rawLines obligatoire pour préservation données
- Web Worker pour parsing asynchrone

### Dépendances
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "lucide-react": "^0.263.1",
  "vite": "^5.0.0",
  "vitest": "^1.0.0",
  "tailwindcss": "^3.4.0"
}
```

## Prochaines Étapes

Voir `docs/ROADMAP.md` pour les évolutions planifiées :
- v2.5.0 : Export CSV/JSON des doublons
- v2.6.0 : Fusion par lot avec confirmation groupée
- v3.0.0 : Multi-fichiers GEDCOM
