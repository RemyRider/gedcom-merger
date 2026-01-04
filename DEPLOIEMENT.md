# Guide de Déploiement - GEDCOM Merger

## 🚀 Déploiement automatique via GitHub

### Branches
- `dev` → https://dev--gedcom-merger.netlify.app (preview)
- `main` → https://gedcom-merger.netlify.app (production)

### Workflow
```bash
# 1. Travail sur dev
git checkout dev
# ... modifications ...
npm run test:all

# 2. Commit et push
git add .
git commit -m "feat: description"
git push origin dev

# 3. Vérifier sur dev--gedcom-merger.netlify.app

# 4. Merge vers main pour production
git checkout main
git merge dev
git push origin main
```

## 📦 Build local

```bash
npm run build
```

Le build génère le dossier `dist/` avec :
- `index.html`
- `assets/` (JS, CSS optimisés)

## ⚠️ Configuration critique

### postcss.config.cjs et tailwind.config.cjs
**DOIVENT utiliser CommonJS** (`module.exports`) sinon erreur Netlify build.

```javascript
// postcss.config.cjs - CORRECT
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

// tailwind.config.cjs - CORRECT
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

## 🔗 Liens
- **Production** : https://gedcom-merger.netlify.app
- **Dev** : https://dev--gedcom-merger.netlify.app
- **GitHub** : https://github.com/RemyRider/gedcom-merger

---

*Version 2.2.2 - 4 janvier 2026*
