# GEDCOM Merger v2.3.0 - Package Phase 1

## 📦 Contenu de ce package

Ce package contient les **nouveaux fichiers** de la v2.3.0 Phase 1 (Fusion Intelligente).

### Fichiers inclus

```
gedcom-merger-v2.3.0/
├── src/
│   └── utils/
│       └── fusionOrder.mjs      # 🆕 Module graphe + tri topologique
├── tests/
│   ├── fusionOrder.test.mjs     # 🆕 30 tests Vitest
│   └── test-v2.3.0-static.cjs   # 🆕 45 tests statiques
├── docs/
│   └── TEST_REPORT_V2.3.0.md    # Rapport de tests
├── package.json                  # Mis à jour v2.3.0
├── CHANGELOG.md                  # Mis à jour
├── vitest.config.mjs             # Configuration Vitest
└── README.md                     # Ce fichier
```

---

## 🔧 Installation

### Option 1 : Ajout à un projet v2.2.6 existant

1. Copiez `src/utils/fusionOrder.mjs` dans votre dossier `src/utils/`
2. Copiez les fichiers de tests dans `tests/`
3. Mettez à jour `package.json` avec la version 2.3.0

### Option 2 : Déploiement Netlify complet

Ce package doit être fusionné avec les fichiers de base v2.2.6 depuis GitHub :
- `src/App.jsx`
- `src/utils/helpers.mjs`
- `public/gedcom-worker.js`
- `tests/test-complete.cjs`
- Fichiers de configuration (tailwind, postcss, vite)

---

## 🧪 Tests

```bash
# Installer les dépendances
npm install

# Lancer les tests Vitest
npm run test

# Lancer les tests statiques (nécessite les fichiers v2.2.6)
npm run test:static

# Tous les tests
npm run test:all
```

---

## 📋 Prochaines étapes (Phase 2-4)

1. **Phase 2** : Intégration Worker (ajouter fusionOrder au gedcom-worker.js)
2. **Phase 3** : Interface utilisateur (affichage par niveaux)
3. **Phase 4** : Tests d'intégration complets

---

## 📄 Documentation

- `CHANGELOG.md` : Historique des versions
- `docs/TEST_REPORT_V2.3.0.md` : Rapport de tests détaillé

---

**Version** : 2.3.0  
**Date** : 11 janvier 2026  
**Thème** : Fusion Intelligente - Ordre optimal de fusion
