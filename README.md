# 🧬 GEDCOM Merger v2.2.6

Application React professionnelle pour détecter et fusionner les doublons dans les fichiers GEDCOM.

## 🎯 Fonctionnalités principales

### Détection de doublons
- **18 critères de comparaison** : nom, naissance, sexe, parents, fratrie, lieu, conjoints, décès, profession, enfants, baptême, inhumation, résidence, titre, religion
- **Algorithme Soundex français** adapté aux noms francophones
- **Anti-faux-positifs** : critères suffisants obligatoires au-delà du nom
- **Détection de clusters** : groupes de 3+ personnes interconnectées

### 🆕 Scoring amélioré (v2.2.5)
- **Couleurs inversées** : 🟢 FORT (feu vert) / 🟡 MOYEN / 🔴 FAIBLE (prudence)
- **Pondération dynamique** : noms rares = +pts, noms communs = -pts
- **Bonus combinaison** : +15 pts si nom+naissance+lieu concordent
- **Malus incohérence** : -10 pts si lieux de naissance contradictoires

### 🆕 Normalisation des lieux (v2.2.6)
- **Modal dédié** pour corriger les variantes de lieux
- **Intégration API Géo** : suggestions officielles depuis geo.api.gouv.fr
- **Format normalisé** : Commune, Département, Région, France
- **Application sur fichier GEDCOM** : correction des rawLines pour export

### Gestion des conflits (v2.2.0)
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
# Tests statiques (464 tests)
npm run test:static

# Tests Vitest (181 tests)
npm run test

# Tous les tests (645 total)
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
| 10 | Scoring/Normalisation v2.2.5-6 | 35 |
| **Total statiques** | | **464** |
| Vitest | helpers, parser, stats, conflicts | 181 |
| **TOTAL** | | **644** |

## 📦 Structure du projet

```
gedcom-merger/
├── src/
│   ├── App.jsx           # Composant principal (~3900 lignes)
│   ├── utils/
│   │   ├── helpers.mjs   # Fonctions utilitaires
│   │   ├── parser.mjs    # Parsing GEDCOM
│   │   └── stats.mjs     # Statistiques
│   ├── index.css
│   └── main.jsx
├── public/
│   └── gedcom-worker.js  # Web Worker (~1400 lignes)
├── tests/
│   ├── test-complete.cjs # Tests statiques (464)
│   ├── helpers.test.mjs  # Tests Vitest
│   ├── parser.test.mjs
│   ├── stats.test.mjs
│   └── conflicts.test.mjs
├── docs/
│   ├── ETAT_DES_LIEUX.md
│   ├── ARCHITECTURE.md
│   ├── ANALYSE_PROCESSUS_FUSION.md
│   └── ROADMAP_V2_*.md
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

*Version 2.2.6 - 10 janvier 2026*
