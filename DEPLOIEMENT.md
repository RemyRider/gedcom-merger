# 🚀 Guide de Déploiement - GEDCOM Merger v1.9.3

## Prérequis

- Node.js 18+
- npm ou yarn
- Compte GitHub
- Compte Netlify (connecté à GitHub)

---

## 📁 Structure du projet

```
gedcom-merger-v1.9.3/
├── src/
│   ├── App.jsx          # Composant principal React
│   ├── main.jsx         # Point d'entrée
│   └── index.css        # Styles Tailwind
├── tests/
│   └── test-complete.cjs # 187 tests automatisés
├── dist/                 # Build production (généré)
├── docs/                 # Documentation
├── index.html           # Page HTML
├── package.json         # Dépendances
├── vite.config.js       # Config Vite (esbuild)
├── tailwind.config.js   # Config Tailwind
├── postcss.config.js    # Config PostCSS
├── netlify.toml         # Config Netlify
├── README.md            # Documentation utilisateur
├── CHANGELOG.md         # Historique versions
├── LIVRAISON_V1_9_3.md  # Notes de livraison
├── RAPPORT_TESTS_V1_9_3.md # Rapport de tests
└── DEPLOIEMENT.md       # Ce fichier
```

---

## 🔧 Installation locale

```bash
# Cloner le repo
git clone https://github.com/RemyRider/gedcom-merger.git
cd gedcom-merger

# Installer les dépendances
npm install

# Lancer en dev
npm run dev

# Exécuter les tests
npm test

# Build production
npm run build
```

---

## 🌐 Déploiement GitHub + Netlify

### 1. Préparer la branche dev

```bash
cd "/Users/HotRoads/Library/Mobile Documents/com~apple~CloudDocs/Claude Gedcom/GITHUB/GEDCOM-Merger-GitHub-Ready"

git checkout dev

# Extraire et copier les fichiers du ZIP
unzip -o ~/Downloads/gedcom-merger-v1.9.3.zip -d /tmp/
cp -R /tmp/gedcom-v1.9.3/* .

# Commit
git add .
git commit -m "v1.9.3: Onglet À supprimer, bouton flottant, tableau clusters, 187 tests"
git push origin dev
```

### 2. Tester sur environnement dev

URL : https://dev--gedcom-merger.netlify.app

**Checklist de validation :**
- [ ] Upload fichier .ged fonctionne
- [ ] Onglet "À supprimer" affiche isolés + sans identité
- [ ] Bouton flottant apparaît lors des sélections
- [ ] Clic "Détails" affiche tableau 9 colonnes
- [ ] Fusion depuis bouton flottant
- [ ] Suppression avec confirmation
- [ ] Export fichier nettoyé

### 3. Déployer en production

```bash
git checkout main
git merge dev
git push origin main
```

URL production : https://gedcom-merger.netlify.app

---

## ⚙️ Configuration Netlify

Le fichier `netlify.toml` configure automatiquement :

```toml
[build]
  command = "npm install && npm run build"
  publish = "dist"
```

### Variables d'environnement

Aucune variable requise pour cette application.

### Headers de sécurité

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

---

## 🧪 Tests

```bash
# Exécuter les 187 tests
npm test

# Résultat attendu
✅ 187/187 tests réussis (100%)
```

---

## 📊 Métriques de build

| Métrique | Valeur |
|----------|--------|
| Temps de build | ~6s |
| Bundle JS | 189 KB (59 KB gzip) |
| Bundle CSS | 20 KB (4 KB gzip) |
| Total gzippé | ~63 KB |

---

## 🔄 Workflow Git

```
main (production)
  ↑
  merge
  ↑
dev (développement) ← commits
```

1. Développer sur `dev`
2. Tester sur dev--gedcom-merger.netlify.app
3. Merger sur `main` si OK
4. Déploiement auto sur gedcom-merger.netlify.app

---

**Version** : 1.9.3  
**Date** : 29 décembre 2025
