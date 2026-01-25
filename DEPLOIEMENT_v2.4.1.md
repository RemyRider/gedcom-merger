# Guide de Déploiement - GEDCOM Merger v2.4.1

## Prérequis

- Node.js 18+
- npm 9+
- Git

## Workflow Git

### Branches
- `main` : Production (stable)
- `dev` : Développement/Tests

### Alias recommandé
```bash
alias cdgedcom='cd ~/path/to/GEDCOM-Merger-GitHub-Ready'
```

## Déploiement v2.4.1

### 1. Extraction
```bash
cd ~/Downloads
unzip -o gedcom-v2.4.1.zip
```

### 2. Copie vers le dépôt
```bash
cdgedcom
cp -r ~/Downloads/gedcom-v2.4.1-final/* .
```

### 3. Tests locaux
```bash
# Tests statiques (602)
node tests/test-complete.cjs

# Build
npm run build
```

### 4. Déploiement dev
```bash
git add .
git commit -m "v2.4.1: Cherry-picking + Score propreté"
git push origin dev
```

### 5. Vérification Netlify
- URL : https://dev--gedcom-merger.netlify.app
- Vérifier le build
- Tester les fonctionnalités

### 6. Merge production
```bash
git checkout main
git merge dev
git push origin main
```

## Configuration Netlify

### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Variables d'environnement
Aucune requise pour v2.4.1.

## Troubleshooting

### Erreur CommonJS/ESM
Les fichiers de config DOIVENT être en CommonJS :
- `postcss.config.cjs` (pas .js)
- `tailwind.config.cjs` (pas .js)

### Tests échouent
1. Vérifier package.json version = "2.4.1"
2. Vérifier fusionOrder.mjs contient toutes les fonctions
3. Relancer `npm install`

### Build échoue
```bash
rm -rf node_modules
npm install
npm run build
```

## Rollback

### Vers version précédente
```bash
git checkout main
git log --oneline -5
git revert HEAD
git push origin main
```

### Restauration v2.4.0
```bash
git checkout v2.4.0 -- src/utils/fusionOrder.mjs
git checkout v2.4.0 -- tests/test-complete.cjs
```
