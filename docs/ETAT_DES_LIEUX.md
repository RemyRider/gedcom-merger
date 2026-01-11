# État des Lieux - GEDCOM Merger

> **Version actuelle : v2.3.0 Phase 1** (11 janvier 2026)
> **Repository** : https://github.com/RemyRider/gedcom-merger  
> **Production** : https://gedcom-merger.netlify.app  
> **Développement** : https://dev--gedcom-merger.netlify.app

---

## 🎯 Résumé v2.3.0 Phase 1

| Métrique | Valeur |
|----------|--------|
| **Tests totaux** | 720 (527 statiques + 193 Vitest) |
| **Critères de comparaison** | 18 |
| **Champs affichés** | 16 |
| **Catégories de tests** | 11 |
| **Performance** | Web Worker (traitement arrière-plan) |

---

## Nouveautés v2.3.0

### Module fusionOrder.mjs

| Fonction | Description |
|----------|-------------|
| `buildDependencyGraph()` | Construit le graphe de dépendances entre doublons |
| `calculateFusionOrder()` | Calcule l'ordre optimal via tri topologique |
| `calculateEnrichedQuality()` | Score qualité enrichi (précision dates/lieux, sources) |
| `canFuseLevel()` | Vérifie si un niveau peut être fusionné |
| `prepareLevelForDisplay()` | Prépare les données pour l'UI |
| `calculateFusionStats()` | Statistiques de fusion |

### Principe "Bottom-Up"

```
ORDRE OPTIMAL DE FUSION :
1. ENFANTS (niveau 0)    → Fusionner en premier
2. CONJOINTS (niveau 1)  → Fusionner ensuite
3. PARENTS (niveau 2)    → Fusionner en dernier
4. INDÉPENDANTS (niveau 3) → Sans dépendances

→ Les relations familiales pointent toujours vers les personnes les plus complètes
```

---

## Fonctionnalités Implémentées

### Core - Détection de doublons

| Fonctionnalité | Version | Description |
|----------------|---------|-------------|
| Algorithme Soundex français | v1.0.0 | Détection phonétique adaptée aux noms français |
| Triple indexation | v1.0.0 | Optimisation O(n) via index phonétique, année, parents |
| **Scoring hybride 18 critères** | v2.0.0 | Nom, naissance, sexe, parents, etc. |
| Détection clusters | v1.6.0 | Groupes de 3+ personnes interconnectées |
| Anti-faux-positifs | v1.9.2 | Critères suffisants obligatoires au-delà du nom |
| **Comparaison par NOM** | v2.0.0 | Parents/conjoints/enfants comparés par nom |
| Suggestions IA | v1.9.0 | Analyse de patterns nom/période |
| **Web Worker** | v2.1.4 | Traitement en arrière-plan, interface fluide |
| **Graphe dépendances** | v2.3.0 | Analyse relations entre doublons |
| **Tri topologique** | v2.3.0 | Ordre optimal de fusion |

### Gestion des conflits (v2.2.x)

| Fonctionnalité | Version | Description |
|----------------|---------|-------------|
| **Détection conflits** | v2.2.0 | 10 champs vérifiés avant fusion |
| **Modal résolution** | v2.2.0 | Interface de choix pour chaque conflit |
| **Nettoyage FAM orphelines** | v2.2.1 | Suppression familles sans membres |
| **Fusion en cascade** | v2.2.4 | A→B→C résolu en A→C |
| **Conflits relationnels** | v2.2.6 | Parents, conjoints, enfants |

### Scoring amélioré (v2.2.5)

| Fonctionnalité | Version | Description |
|----------------|---------|-------------|
| **Couleurs inversées** | v2.2.5 | 🟢 FORT, 🟡 MOYEN, 🔴 FAIBLE |
| **Pondération noms rares** | v2.2.5 | Noms rares = +35 pts |
| **Bonus combinaison** | v2.2.5 | +15 pts si nom+naissance+lieu |
| **Malus incohérence** | v2.2.5 | -10 pts si lieux contradictoires |

### Normalisation des lieux (v2.2.6)

| Fonctionnalité | Version | Description |
|----------------|---------|-------------|
| **Modal normalisation** | v2.2.6 | Interface complète pour corriger les variantes |
| **API Géo intégrée** | v2.2.6 | Suggestions officielles depuis geo.api.gouv.fr |
| **Saisie manuelle** | v2.2.6 | Autocomplétion temps réel |
| **Préservation rawLines** | v2.2.6 | Conservation de toutes les données GEDCOM |

---

## Architecture v2.3.0

```
gedcom-merger/
├── src/
│   ├── App.jsx           # ~3500 lignes, composant principal
│   ├── utils/
│   │   ├── helpers.mjs   # Fonctions utilitaires
│   │   ├── parser.mjs    # Parsing GEDCOM
│   │   ├── stats.mjs     # Statistiques
│   │   └── fusionOrder.mjs # 🆕 v2.3.0 - Ordre de fusion intelligent
│   ├── index.css
│   └── main.jsx
├── public/
│   └── gedcom-worker.js  # ~54KB, Worker autonome
├── tests/
│   ├── test-complete.cjs # 527 tests statiques (11 catégories)
│   ├── helpers.test.mjs  # 47 tests Vitest
│   ├── parser.test.mjs   # 30 tests Vitest
│   ├── stats.test.mjs    # 31 tests Vitest
│   ├── conflicts.test.mjs # 56 tests Vitest
│   └── fusionOrder.test.mjs # 🆕 32 tests Vitest
├── docs/
│   ├── ARCHITECTURE.md
│   ├── ROADMAP_V2_3_0.md
│   └── ETAT_DES_LIEUX.md
├── CHANGELOG.md
├── DEPLOIEMENT.md
└── package.json
```

---

## Catégories de Tests (720 total)

| # | Catégorie | Tests | Description |
|---|-----------|-------|-------------|
| 1 | Fondamentaux | 61 | Structure, imports, exports |
| 2 | Parsing GEDCOM | 52 | parseGedcom, CONT/CONC, rawLines |
| 3 | Détection doublons | 42 | findDuplicates, calculateSimilarity |
| 4 | Fusion & suppression | 34 | mergePersonData, handleMerge |
| 5 | Interface utilisateur | 79 | Onglets, boutons, états |
| 6 | Suggestions IA | 18 | generateAiSuggestions |
| 7 | Config & déploiement | 39 | Netlify, package.json |
| 8 | Qualité & analyses v2.1.x | 68 | Rapport, chrono, stats, Worker |
| 9 | Conflits v2.2.x | 36 | Détection, résolution, nettoyage |
| 10 | Scoring/Normalisation | 47 | v2.2.5 couleurs, v2.2.6 API Géo |
| 11 | **Fusion intelligente v2.3.0** | **45** | 🆕 Graphe, tri topo, qualité enrichie |
| | **Vitest** | +193 | helpers, parser, stats, conflicts, fusionOrder |
| | **TOTAL** | **720** | |

---

## Critères de Comparaison v2.0.0+

| # | Critère | Points max | Suffisant |
|---|---------|------------|-----------|
| 1 | Noms | 30 | - |
| 2 | Date naissance | 25 | ✅ |
| 3 | Sexe | 15 | - |
| 4 | Parents | 20 | ✅ |
| 5 | Fratrie | 15 | ✅ |
| 6 | Lieu naissance | 10 | ✅ |
| 7 | Conjoints | 8 | ✅ |
| 8 | Date décès | 15 | ✅ |
| 9 | Lieu décès | 8 | ✅ |
| 10 | Profession | 5 | ✅ |
| 11 | Enfants | 15 | ✅ |
| 12 | Baptême | 5 | - |
| 13 | Lieu baptême | 4 | - |
| 14 | Inhumation | 5 | - |
| 15 | Lieu inhumation | 4 | - |
| 16 | Résidence | 4 | - |
| 17 | Titre | 3 | - |
| 18 | Religion | 3 | - |
| | **Total possible** | **190** | |

---

## Workflow de développement

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   dev       │────▶│   tests     │────▶│   main      │
│  (travail)  │     │  (720/720)  │     │  (prod)     │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      ▼                   ▼                   ▼
  dev--gedcom-        Bloque si          gedcom-merger
  merger.netlify.app  échec              .netlify.app
```

**Commandes** :
```bash
# Tests
npm run test:static  # 527 tests statiques
npm run test         # 193 tests Vitest
npm run test:all     # Les deux

# Développement
git checkout dev
git add . && git commit -m "feat: description"
git push origin dev

# Production (après validation sur dev)
git checkout main
git merge dev
git push origin main
```

---

## Historique des versions

| Version | Date | Type | Changements clés |
|---------|------|------|------------------|
| **v1.0.0** | 29/11/2025 | 🚀 Initial | Soundex français, triple indexation |
| **v2.0.0** | 31/12/2025 | 🚀 Major | 18 critères, rawLines |
| **v2.1.4** | 03/01/2026 | 🚀 Perf | Web Worker |
| **v2.2.6** | 10/01/2026 | ✨ Feature | Normalisation lieux, API Géo |
| **v2.3.0** | 11/01/2026 | ✨ Feature | **Fusion intelligente Phase 1** |

---

## Stack technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Framework | React | 18.2.0 |
| Build | Vite | 5.4.21 |
| CSS | Tailwind CSS | 3.3.6 |
| Icônes | Lucide React | 0.294.0 |
| Tests unitaires | Vitest | 1.6.1 |
| Hébergement | Netlify | - |

### ⚠️ Configuration critique

```javascript
// postcss.config.cjs - DOIT être CommonJS
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

// tailwind.config.cjs - DOIT être CommonJS  
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

**NE PAS utiliser `export default`** (ESM) sinon erreur Netlify build.

---

*Document mis à jour le 11 janvier 2026 - v2.3.0 Phase 1*
