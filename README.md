# GEDCOM Merger v1.9.5

Application de fusion de doublons dans les fichiers GEDCOM pour la généalogie.

## Nouvelles fonctionnalités v1.9.5

### Fusion Intelligente
- **mergePersonData()** : Combine les données des 2 personnes
- Les informations complémentaires ne sont plus perdues
- Traçabilité des fusions avec NOTE automatique

### Corrections Critiques
- Parser DATE/PLAC niveau 2 uniquement (évite bug SOURCE)
- Déduplication des CHIL dans les FAM

## Installation

```bash
# 1. Extraire le ZIP
unzip gedcom-v1.9.5-fusion.zip

# 2. Installer les dépendances
npm install

# 3. Lancer les tests
npm test
# Attendu: 266/266 tests passés (100%)

# 4. Build production
npm run build
```

## Déploiement Netlify

Le fichier `netlify.toml` est configuré pour :
1. Exécuter les tests
2. Builder seulement si tous les tests passent
3. Publier le dossier `dist`

## Tests

- 266 tests répartis en 22 niveaux + 5 bonus
- Nouveau BONUS E : 12 tests algorithme de fusion

## Workflow Git

```bash
# Développement
git checkout dev
# ... modifications ...
git add . && git commit -m "..." && git push

# Production
git checkout main
git merge dev
git push
```

## Liens

- Production: https://gedcom-merger.netlify.app
- Dev: https://dev--gedcom-merger.netlify.app
- GitHub: https://github.com/RemyRider/gedcom-merger
