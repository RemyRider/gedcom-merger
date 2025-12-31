# 🔄 Guide de Déploiement Automatique - GEDCOM Merger v1.9.5

Ce guide explique comment configurer un déploiement automatique via GitHub et Netlify. À chaque push sur GitHub, Netlify exécute automatiquement les tests et déploie l'application si tout passe.

## 📋 Prérequis

- Compte GitHub (gratuit)
- Compte Netlify (gratuit)
- Git installé sur votre machine
- Node.js 18+ installé

## 🏗️ Architecture du déploiement

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Code      │     │   GitHub    │     │   Netlify   │
│   Local     │────▶│   Remote    │────▶│   Deploy    │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
   git push          Webhook              Auto-build
                     trigger              + Tests
                         │                   │
                         ▼                   ▼
                    Notification       Site en ligne
```

## 📁 Étape 1 : Préparer le repository GitHub

### 1.1 Créer le repository

1. Connectez-vous à https://github.com
2. Cliquez sur **New repository**
3. Nom : `gedcom-merger`
4. Visibilité : Public (recommandé pour workflow optimal)
5. Ne pas initialiser avec README (nous avons déjà les fichiers)
6. Cliquez **Create repository**

### 1.2 Configurer Git localement

```bash
# Naviguer vers le dossier du projet
cd /chemin/vers/gedcom-merger

# Initialiser Git (si pas déjà fait)
git init

# Configurer l'identité (remplacer par vos infos)
git config user.name "VotreNom"
git config user.email "votre-email@example.com"

# Ajouter le remote GitHub
git remote add origin https://github.com/VOTRE_USERNAME/gedcom-merger.git

# Créer la branche main et pousser
git add .
git commit -m "Initial commit - GEDCOM Merger v1.9.5"
git branch -M main
git push -u origin main
```

### 1.3 Créer la branche de développement

```bash
# Créer et basculer sur la branche dev
git checkout -b dev

# Pousser la branche dev
git push -u origin dev
```

## 🌐 Étape 2 : Configurer Netlify

### 2.1 Connecter GitHub à Netlify

1. Connectez-vous à https://app.netlify.com
2. Cliquez **Add new site** → **Import an existing project**
3. Choisissez **GitHub**
4. Autorisez Netlify à accéder à vos repositories
5. Sélectionnez `gedcom-merger`

### 2.2 Configurer le build

Netlify détecte automatiquement le fichier `netlify.toml`. Vérifiez les paramètres :

| Paramètre | Valeur |
|-----------|--------|
| Build command | `npm test && npm run build` |
| Publish directory | `dist` |
| Production branch | `main` |

### 2.3 Configurer les branches de déploiement

Dans **Site settings** → **Build & deploy** → **Branches** :

1. **Production branch** : `main`
2. **Branch deploys** : Activer pour `dev`

Cela crée deux environnements :
- `https://gedcom-merger.netlify.app` (production - branche main)
- `https://dev--gedcom-merger.netlify.app` (développement - branche dev)

## 📝 Étape 3 : Le fichier netlify.toml

Le fichier `netlify.toml` à la racine du projet configure tout :

```toml
[build]
  command = "npm test && npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Points clés :
- **Tests obligatoires** : `npm test &&` avant `npm run build`
- Si les tests échouent, le déploiement est bloqué
- Cache optimisé pour les assets (1 an)
- Headers de sécurité configurés

## 🔄 Étape 4 : Workflow de développement quotidien

### 4.1 Développer une nouvelle fonctionnalité

```bash
# S'assurer d'être sur dev
git checkout dev

# Faire vos modifications...

# Tester localement
npm test

# Si tests OK, commiter et pousser
git add .
git commit -m "feat: description de la fonctionnalité"
git push origin dev
```

### 4.2 Vérifier le déploiement dev

1. Allez sur https://app.netlify.com
2. Sélectionnez votre site
3. Onglet **Deploys** : vérifiez que le build est vert
4. Testez sur https://dev--gedcom-merger.netlify.app

### 4.3 Passer en production

```bash
# Basculer sur main
git checkout main

# Merger les changements de dev
git merge dev

# Pousser en production
git push origin main
```

Le déploiement production démarre automatiquement !

## 🚨 Étape 5 : Gestion des erreurs

### Build échoué - Tests

Si le déploiement échoue à cause des tests :

1. Consultez les logs dans Netlify (onglet Deploys → cliquer sur le build)
2. Identifiez le test échoué
3. Corrigez localement
4. Testez avec `npm test`
5. Commitez et poussez à nouveau

### Build échoué - Compilation

Erreurs courantes :

| Erreur | Cause | Solution |
|--------|-------|----------|
| `terser failed` | Terser incompatible | Utiliser `minify: 'esbuild'` dans vite.config.js |
| `Module not found` | Dépendance manquante | `npm install` |
| `Syntax error` | Erreur de code | Vérifier le fichier indiqué |

### Rollback

Pour revenir à une version précédente :

1. Netlify → Deploys
2. Trouvez le dernier build fonctionnel
3. Cliquez sur les 3 points → **Publish deploy**

## 📊 Étape 6 : Monitoring

### Notifications

Dans **Site settings** → **Build & deploy** → **Deploy notifications** :

- Email on deploy failed
- Email on deploy succeeded (optionnel)

### Logs de build

Chaque déploiement génère des logs détaillés :
- Durée du build
- Résultat des tests (266/266)
- Taille du bundle
- Erreurs éventuelles

## 🛡️ Bonnes pratiques

### 1. Toujours tester localement avant de pousser

```bash
npm test && npm run build
```

### 2. Utiliser des messages de commit clairs

```bash
git commit -m "feat: ajout fusion intelligente"
git commit -m "fix: correction parsing DATE niveau 2"
git commit -m "docs: mise à jour CHANGELOG"
```

### 3. Ne jamais pousser directement sur main

Toujours :
1. Développer sur `dev`
2. Tester sur l'environnement dev
3. Merger vers `main` une fois validé

### 4. Garder les dépendances à jour

```bash
npm outdated  # Voir les mises à jour disponibles
npm update    # Mettre à jour (minor/patch)
```

## 📱 Alias pratiques

Ajoutez ces alias à votre `~/.bashrc` ou `~/.zshrc` :

```bash
# Alias pour GEDCOM Merger
alias cdgedcom='cd "/chemin/vers/gedcom-merger"'
alias gdev='git checkout dev'
alias gmain='git checkout main'
alias gpush='git add . && git commit -m'
alias gtest='npm test'
alias gdeploy='git checkout main && git merge dev && git push origin main'
```

Usage :
```bash
cdgedcom           # Aller dans le projet
gdev               # Basculer sur dev
gpush "fix: bug"   # Commit rapide
gtest              # Lancer les tests
gdeploy            # Déployer en prod
```

## 🔗 Liens utiles

| Ressource | URL |
|-----------|-----|
| Production | https://gedcom-merger.netlify.app |
| Développement | https://dev--gedcom-merger.netlify.app |
| GitHub | https://github.com/RemyRider/gedcom-merger |
| Netlify Dashboard | https://app.netlify.com |
| Documentation Netlify | https://docs.netlify.com |

---

## Résumé des commandes

```bash
# Setup initial (une seule fois)
git init
git remote add origin https://github.com/USERNAME/gedcom-merger.git
git push -u origin main
git checkout -b dev && git push -u origin dev

# Workflow quotidien
git checkout dev           # Travailler sur dev
# ... modifications ...
npm test                   # Tester
git add . && git commit -m "message"
git push origin dev        # Déploie sur dev--gedcom-merger.netlify.app

# Mise en production
git checkout main
git merge dev
git push origin main       # Déploie sur gedcom-merger.netlify.app
```

---

*Guide mis à jour le 31 décembre 2025 - v1.9.5*
