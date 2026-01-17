# Guide de Déploiement

## Prérequis

- Node.js 18+
- npm 9+
- Git configuré avec accès GitHub

## Workflow Git

### Branches
- **main** : Production stable, déploiement automatique Netlify
- **dev** : Tests et validation avant production

### Commandes courantes

```bash
# Alias recommandé (ajouter à ~/.zshrc ou ~/.bashrc)
alias cdgedcom='cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/Claude\ Gedcom/GITHUB/GEDCOM-Merger-GitHub-Ready'

# Naviguer vers le projet
cdgedcom

# Vérifier l'état
git status
git branch

# Passer sur dev
git checkout dev

# Mettre à jour depuis main
git fetch origin
git merge origin/main
```

## Déploiement v2.4.0

### 1. Extraire le package

```bash
cd ~/Downloads
unzip -o gedcom-v2.4.0.zip
```

### 2. Copier les fichiers

```bash
cdgedcom
cp -r ~/Downloads/gedcom-v2.4.0-final/* .
```

### 3. Vérifier les tests locaux

```bash
npm install
npm run test:static    # 557 tests attendus
npm run test           # 225 tests Vitest attendus
npm run build          # Doit réussir sans erreur
```

### 4. Déployer sur dev

```bash
git add .
git commit -m "v2.4.0: Fusion guidée contextuelle Bottom-Up"
git push origin dev
```

### 5. Vérifier le déploiement Netlify

- URL dev : https://dev--gedcom-merger.netlify.app
- Vérifier les logs de build dans Netlify Dashboard
- Tester l'application manuellement

### 6. Merger en production

```bash
git checkout main
git merge dev
git push origin main
```

## Configuration Netlify

### netlify.toml

```toml
[build]
  command = "npm ci && npm run test:all && npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Variables d'environnement
Aucune variable requise pour la v2.4.0.

## Troubleshooting

### Erreur CommonJS/ESM

```
Error: module is not defined in ES module scope
```

**Solution** : Vérifier que `postcss.config.cjs` et `tailwind.config.cjs` utilisent :
```javascript
module.exports = { /* ... */ }
```
Et NON :
```javascript
export default { /* ... */ }
```

### Erreur Tests Vitest

```
Test Files  1 failed
```

**Solution** : Vérifier que `fusionOrder.mjs` est compatible avec l'API attendue :
- `FUSION_LEVELS.CHILDREN = 0`
- `getDatePrecisionScore("15 MAR 1726") = 15`
- `calculateEnrichedQuality({names: []}).score = 0`

### Erreur Build Vite

```
✗ build failed
```

**Solution** : 
1. Supprimer `node_modules` et `package-lock.json`
2. Relancer `npm install`
3. Vérifier les imports dans `App.jsx`

## Rollback

En cas de problème en production :

```bash
cdgedcom
git checkout main
git revert HEAD
git push origin main
```

Ou restaurer une version précédente :

```bash
git log --oneline -10
git checkout <commit-hash> -- .
git commit -m "Rollback to <version>"
git push origin main
```
