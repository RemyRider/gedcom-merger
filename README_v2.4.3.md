# GEDCOM Merger v2.4.2

Application React pour détecter et fusionner les doublons dans les fichiers GEDCOM.

## Nouveautés v2.4.2

### Tri par Facilité de Fusion
Partout dans l'application, les paires sont triées par facilité :
- **Doublons** : Score de propreté décroissant (🧹)
- **Clusters** : Moyenne des scores de propreté
- **Modal fusion guidée** : Relations triées par facilité

### Logique de Dépendances Complète
Toutes les relations sont maintenant prises en compte :
- ✅ Parents en doublon
- ✅ Conjoints en doublon  
- ✅ Enfants en doublon

Les individus **sans aucune relation en doublon** (🧹 100%) apparaissent en premier.

### Fusion Multiple Corrigée
Sélectionner plusieurs paires fonctionne correctement :
1. Modal cherry-picking pour chaque paire
2. Chaînage automatique des fusions
3. Paires retirées de la liste après fusion

### UX Améliorée
- Badge **⭐ Recommandé** (jaune) vs **✓ Sélectionné** (vert)
- Bouton toggle : "Sélectionner" ↔ "✕ Désélect."
- Clusters désélectionnables

## Installation

```bash
npm install
npm run dev
```

## Tests

```bash
# Tests statiques (613 tests)
npm run test:static

# Tests Vitest (253 tests)
npm run test

# Tous les tests (866 tests)
npm run test:all
```

## Build

```bash
npm run build
```

## Déploiement Netlify

1. Extraire le ZIP
2. `npm install && npm run build`
3. Déployer le dossier `dist/`

Ou via Git :
```bash
cdgedcom && git checkout dev
cp -r ~/Downloads/gedcom-v2.4.2-final/* .
git add . && git commit -m "v2.4.2" && git push origin dev
```

## Structure

```
src/
├── App.jsx              # Application principale (~185 KB)
├── utils/
│   └── fusionOrder.mjs  # Module tri + cherry-picking + dépendances
public/
└── gedcom-worker.js     # Web Worker analyse GEDCOM
tests/
├── test-complete.cjs    # 613 tests statiques
└── fusionOrder.test.mjs # 253 tests Vitest
```

## Score de Propreté (🧹)

| Score | Signification |
|-------|---------------|
| 🧹 100% | Aucune relation en doublon → Fusion facile |
| 🧹 80% | 1 relation en doublon |
| 🧹 60% | 2 relations en doublon |
| 🧹 <50% | 3+ relations → Fusion complexe |

## Historique

- **v2.4.2** : Tri global par facilité + Fix fusion multiple + UX toggle
- **v2.4.1** : Score de propreté + Cherry-picking + Suggestions auto
- **v2.4.0** : Tri par dépendances + Alerte relations doublons
- **v2.3.0** : Module fusionOrder.mjs + Graphe dépendances
- **v2.2.6** : Normalisation lieux API Géo
- **v2.1.4** : Web Workers + Rapport qualité
