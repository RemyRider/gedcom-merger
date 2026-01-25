# GEDCOM Merger v2.4.1

Application React pour détecter et fusionner les doublons dans les fichiers GEDCOM.

## Nouveautés v2.4.1

### Score de Propreté
Les paires de doublons sont triées par "score de propreté" :
- **100 pts** : Fusion propre, aucun risque
- **-20 pts** par relation déjà en doublon
- **-10 pts** par potentiel doublon après fusion

### Cherry-Picking
Sélection valeur par valeur lors de la fusion :
- Champs simples : choisir A, B ou saisie manuelle
- Noms : sélectionner individuellement chaque variante
- Relations : cocher les personnes à conserver

### Suggestions Automatiques
Pré-sélection intelligente de la meilleure valeur :
- Dates : la plus précise (jour > mois > année)
- Lieux : le plus complet (4 niveaux > 3 > 2 > 1)
- Textes : le plus détaillé
- Listes : fusion (union)

## Installation

```bash
npm install
npm run dev
```

## Tests

```bash
# Tests statiques (612 tests)
npm run test:static

# Tests Vitest (225 tests)
npm run test

# Tous les tests (837 tests)
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

## Structure

```
src/
├── App.jsx              # Application principale
├── utils/
│   └── fusionOrder.mjs  # Module score de propreté + cherry-picking
tests/
└── test-complete.cjs    # 612 tests statiques
```

## Historique

- **v2.4.1** : Score de propreté + Cherry-picking + Suggestions auto
- **v2.4.0** : Tri par dépendances + Alerte relations doublons
- **v2.3.0** : Module fusionOrder.mjs + Graphe dépendances
- **v2.2.6** : Normalisation lieux API Géo
- **v2.1.4** : Web Workers + Rapport qualité
