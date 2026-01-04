# 🧬 GEDCOM Merger v2.2.4

Application React professionnelle pour détecter et fusionner les doublons dans les fichiers GEDCOM.

## 🎯 Fonctionnalités principales

### Détection de doublons
- **18 critères de comparaison** : nom, naissance, sexe, parents, fratrie, lieu, conjoints, décès, profession, enfants, baptême, inhumation, résidence, titre, religion
- **Algorithme Soundex français** adapté aux noms francophones
- **Anti-faux-positifs** : critères suffisants obligatoires au-delà du nom
- **Détection de clusters** : groupes de 3+ personnes interconnectées
- **Score de suspicion** : 🔴 FORT / 🟡 MOYEN / 🟢 FAIBLE

### 🆕 Gestion des conflits (v2.2.0)
- **Détection automatique** des valeurs contradictoires avant fusion
- **Modal de résolution** pour choisir la valeur à conserver
- **Comparaison intelligente** :
  - Dates : compatibles si même année
  - Lieux : compatibles si l'un contient l'autre
- **Nettoyage automatique** des familles orphelines

### Contrôle qualité (v2.1.x)
- Rapport qualité à l'upload
- Détection incohérences chronologiques (7 règles)
- Normalisation intelligente des lieux
- Statistiques généalogiques complètes
- Détection des références orphelines

### Performance (v2.1.4)
- **Web Worker** pour traitement en arrière-plan
- Interface toujours réactive
- Traitement 3-5x plus rapide sur gros fichiers

## 🚀 Installation

```bash
# Cloner le repository
git clone https://github.com/RemyRider/gedcom-merger.git
cd gedcom-merger

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Lancer les tests
npm run test:all
```

## 🧪 Tests

```bash
# Tests statiques (423 tests)
npm run test:static

# Tests Vitest (108 tests)
npm run test

# Tous les tests (531 total)
npm run test:all
```

### Catégories de tests
| # | Catégorie | Tests |
|---|-----------|-------|
| 1 | Fondamentaux | 61 |
| 2 | Parsing GEDCOM | 52 |
| 3 | Détection doublons | 42 |
| 4 | Fusion & suppression | 34 |
| 5 | Interface utilisateur | 79 |
| 6 | Suggestions IA | 18 |
| 7 | Config & déploiement | 39 |
| 8 | Qualité & analyses v2.1.x | 68 |
| 9 | Conflits v2.2.0 | 30 |
| **Total statiques** | | **423** |
| Vitest | helpers, parser, stats, conflicts | 159 |
| **TOTAL** | | **588** |

## 📦 Structure du projet

```
gedcom-merger/
├── src/
│   ├── App.jsx           # Composant principal (~3200 lignes)
│   ├── utils/
│   │   ├── helpers.mjs   # Fonctions utilitaires
│   │   ├── parser.mjs    # Parsing GEDCOM
│   │   └── stats.mjs     # Statistiques
│   ├── index.css
│   └── main.jsx
├── public/
│   └── gedcom-worker.js  # Web Worker (~1300 lignes)
├── tests/
│   ├── test-complete.cjs # Tests statiques
│   ├── helpers.test.mjs  # Tests Vitest
│   ├── parser.test.mjs
│   └── stats.test.mjs
├── CHANGELOG.md
├── README.md
└── package.json
```

## 🔗 Liens

- **Production** : https://gedcom-merger.netlify.app
- **Développement** : https://dev--gedcom-merger.netlify.app
- **GitHub** : https://github.com/RemyRider/gedcom-merger

## 📜 Licence

MIT © 2025-2026 RemyRider

---

*Version 2.2.4 - 4 janvier 2026*
