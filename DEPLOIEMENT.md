# Guide de Déploiement GEDCOM Merger v1.9.5

## Prérequis
- Node.js 18+
- npm ou yarn

## Installation
```bash
npm install
```

## Tests
```bash
npm test
# Attendu: 266/266 tests passés
```

## Build
```bash
npm run build
```

## Déploiement Netlify
Le fichier `netlify.toml` configure le déploiement automatique :
- Tests exécutés AVANT le build
- Build bloqué si tests échouent

## Workflow Git
1. Travailler sur branche `dev`
2. Tester localement
3. Push vers `dev`
4. Vérifier déploiement dev--gedcom-merger.netlify.app
5. Merger vers `main` pour production
