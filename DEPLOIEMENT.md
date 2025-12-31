# Déploiement GEDCOM Merger

## Prérequis

- Node.js 18+
- npm

## Installation locale

```bash
npm install
npm run dev
```

## Tests

```bash
npm test
```

**IMPORTANT**: Les tests sont exécutés AVANT chaque build Netlify.
Si un test échoue, le déploiement est bloqué.

## Build

```bash
npm run build
```

## Déploiement Netlify

### Automatique (GitHub)

1. Push sur `dev` → déploiement sur dev--gedcom-merger.netlify.app
2. Push sur `main` → déploiement sur gedcom-merger.netlify.app

### Configuration netlify.toml

```toml
[build]
  command = "npm test && npm run build"
  publish = "dist"
```

## Workflow recommandé

1. Développer sur branche `dev`
2. Tester localement (`npm test`)
3. Push sur `dev`
4. Vérifier sur environnement dev
5. Merger sur `main` pour production
