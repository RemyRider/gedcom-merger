# Guide de Déploiement - GEDCOM Merger v2.4.2

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

## Déploiement v2.4.2

### 1. Extraction
```bash
cd ~/Downloads
unzip -o gedcom-v2.4.2.zip
```

### 2. Copie vers le dépôt
```bash
cdgedcom
git checkout dev
cp -r ~/Downloads/gedcom-v2.4.2-final/* .
```

### 3. Tests locaux
```bash
# Tests statiques (612)
npm run test:static

# Tests Vitest (253)
npm run test

# Tous les tests (865)
npm run test:all

# Build
npm run build
```

### 4. Déploiement dev
```bash
git add .
git commit -m "v2.4.2: Tri facilité + Fix fusion multiple + UX toggle"
git push origin dev
```

### 5. Vérification Netlify
- URL : https://dev--gedcom-merger.netlify.app
- Vérifier le build automatique
- Tester :
  - [ ] Tri par facilité (🧹) dans Doublons
  - [ ] Tri par facilité dans Clusters
  - [ ] Sélection multiple puis fusion (toutes les paires)
  - [ ] Toggle sélectionner/désélectionner
  - [ ] Badge "Recommandé" vs "Sélectionné"

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
  command = "npm ci && npm run test:all && npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Netlify exécutera :
1. `npm ci` - Installation des dépendances
2. `npm run test:static` - 612 tests statiques
3. `npm run test` - 253 tests Vitest
4. `npm run build` - Build production

### Variables d'environnement
Aucune requise pour v2.4.2.

## Vérifications post-déploiement

### Fonctionnalités v2.4.2
- [ ] Paires triées par 🧹 (100% en premier)
- [ ] Clusters triés par facilité moyenne
- [ ] Badge ⭐ Recommandé (jaune) sur la première paire
- [ ] Badge ✓ Sélectionné (vert) quand sélectionné
- [ ] Bouton "✕ Désélect." (rouge) quand sélectionné
- [ ] Fusion de 3+ paires fonctionne (chaînage)
- [ ] Paires disparaissent après fusion

## Troubleshooting

### Erreur CommonJS/ESM
Les fichiers de config DOIVENT être en CommonJS :
- `postcss.config.cjs` (pas .js)
- `tailwind.config.cjs` (pas .js)

### Tests échouent
1. Vérifier package.json version = "2.4.2"
2. Vérifier App.jsx VERSION = '2.4.2'
3. Vérifier fusionOrder.mjs contient `createPairId` exporté
4. Relancer `npm install`

### Build échoue
```bash
rm -rf node_modules
npm install
npm run build
```

### Paires non triées
Vérifier que `buildDependencyGraph` est appelé après réception des données du Worker.

## Rollback

### Vers version précédente
```bash
git checkout main
git log --oneline -5
git revert HEAD
git push origin main
```

### Restauration v2.4.1
```bash
git checkout v2.4.1 -- src/App.jsx
git checkout v2.4.1 -- src/utils/fusionOrder.mjs
```

## Changelog résumé v2.4.2

- **Tri global** : Doublons + Clusters triés par cleanlinessScore
- **Dépendances** : Parents inclus (avant : seulement enfants/conjoints)
- **Fusion multiple** : Chaînage correct des paires sélectionnées
- **UX** : Toggle sélection avec couleurs distinctes
