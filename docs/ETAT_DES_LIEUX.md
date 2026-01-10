# État des Lieux - GEDCOM Merger

> **Version actuelle** : v2.2.6 (10 janvier 2026)  
> **Repository** : https://github.com/RemyRider/gedcom-merger  
> **Production** : https://gedcom-merger.netlify.app  
> **Développement** : https://dev--gedcom-merger.netlify.app

---

## 🎯 Résumé v2.2.6

| Métrique | Valeur |
|----------|--------|
| **Tests totaux** | 644 (464 statiques + 180 Vitest) |
| **Critères de comparaison** | 18 |
| **Champs affichés** | 16 |
| **Catégories de tests** | 9 |
| **Performance** | Web Worker (traitement arrière-plan) |

---

## Fonctionnalités Implémentées

### Core - Détection de doublons

| Fonctionnalité | Version | Description |
|----------------|---------|-------------|
| Algorithme Soundex français | v1.0.0 | Détection phonétique adaptée aux noms français |
| Triple indexation | v1.0.0 | Optimisation O(n) via index phonétique, année, parents |
| **Scoring hybride 18 critères** | v2.0.0 | Nom, naissance, sexe, parents, fratrie, lieu naissance, conjoints, décès, lieu décès, profession, enfants, baptême, lieu baptême, inhumation, lieu inhumation, résidence, titre, religion |
| Détection clusters | v1.6.0 | Groupes de 3+ personnes interconnectées |
| Anti-faux-positifs | v1.9.2 | Critères suffisants obligatoires au-delà du nom |
| **Comparaison par NOM** | v2.0.0 | Parents/conjoints/enfants comparés par nom si IDs différents |
| Suggestions IA | v1.9.0 | Analyse de patterns nom/période avec score de confiance |
| **Web Worker** | v2.1.4 | Traitement en arrière-plan, interface fluide |

### Gestion des conflits (v2.2.x)

| Fonctionnalité | Version | Description |
|----------------|---------|-------------|
| **Détection conflits** | v2.2.0 | 10 champs vérifiés avant fusion |
| **Modal résolution** | v2.2.0 | Interface de choix pour chaque conflit |
| **Nettoyage FAM orphelines** | v2.2.1 | Suppression familles sans membres |
| **Détection dates précises** | v2.2.2 | "29 NOV 2025" ≠ "12 NOV 2025" = CONFLIT |
| **Isolation doublons/clusters** | v2.2.3 | Sélections complètement indépendantes |
| **Fusion en cascade** | v2.2.4 | A→B→C résolu en A→C (clusters N individus) |
| **Redirection références** | v2.2.4 | HUSB/WIFE/CHIL redirigés via mergeMap |

### Scoring amélioré (v2.2.5)

| Fonctionnalité | Version | Description |
|----------------|---------|-------------|
| **Couleurs inversées** | v2.2.5 | 🟢 FORT (feu vert), 🟡 MOYEN, 🔴 FAIBLE (prudence) |
| **Pondération noms rares** | v2.2.5 | Noms rares = +35 pts, très communs = 20 pts |
| **Bonus combinaison** | v2.2.5 | +15 pts si nom+naissance+lieu, +8 pts si nom+naissance |
| **Malus incohérence** | v2.2.5 | -10 pts si lieux naissance contradictoires |

### Normalisation des lieux (v2.2.6)

| Fonctionnalité | Version | Description |
|----------------|---------|-------------|
| **Modal normalisation** | v2.2.6 | Interface complète pour corriger les variantes de lieux |
| **API Géo intégrée** | v2.2.6 | Suggestions officielles depuis geo.api.gouv.fr |
| **Choix forme correcte** | v2.2.6 | Sélection de la variante ou suggestion officielle |
| **Tout suggérer** | v2.2.6 | Application automatique des suggestions API ou auto |
| **Mise à jour GEDCOM** | v2.2.6 | Correction des rawLines pour export cohérent |

### Interface utilisateur

| Fonctionnalité | Version | Description |
|----------------|---------|-------------|
| 4 onglets | v1.9.0 | Clusters, Doublons, À supprimer, IA |
| Prévisualisation fusions | v1.3.0 | Modal détaillé avant/après fusion |
| **Affichage 16 champs** | v2.0.0 | Tous les champs affichés systématiquement |
| Bouton flottant | v1.9.3 | Actions rapides sans scroll |
| Tableau clusters détaillé | v1.9.3 | Informations complètes par cluster |
| Filtrage par score | v1.0.0 | Slider pour ajuster le seuil |
| Recherche par nom/ID | v1.1.0 | Localisation rapide d'individus |
| **Rapport qualité** | v2.1.0 | Diagnostic complet à l'upload |
| **Statistiques généalogiques** | v2.1.0 | Démographie, familles, chronologie |
| **Progression temps réel** | v2.1.4 | Messages détaillés pendant analyse |
| **Modal prévisualisation scrollable** | v2.2.2 | Ascenseur fonctionnel |

### Parsing GEDCOM

| Fonctionnalité | Version | Description |
|----------------|---------|-------------|
| Gestion CONT/CONC | v1.8.6 | Préservation des champs multi-lignes |
| Génération HEAD/TRLR | v1.8.6 | Conformité GEDCOM 5.5.1 |
| Normalisation lieux | v2.1.0 | Groupement variantes orthographiques |
| Tags custom (_TAG) | v1.8.0 | Préservation données propriétaires |
| **rawLines[]** | v2.0.0 | Stockage de TOUTES les lignes GEDCOM originales |
| **rawLinesByTag{}** | v2.0.0 | Indexation par tag (SOUR, NOTE, OBJE, EVEN...) |
| **Fusion SOUR/NOTE** | v2.0.0 | Combinaison des sources des 2 personnes fusionnées |

### Qualité et analyse (v2.1.x)

| Fonctionnalité | Version | Description |
|----------------|---------|-------------|
| **Rapport qualité upload** | v2.1.0 | Version GEDCOM, encodage, complétude |
| **Incohérences chronologiques** | v2.1.0 | 7 règles (naissance>décès, parent trop jeune, etc.) |
| **Normalisation lieux** | v2.1.0 | Groupement variantes avec suggestion |
| **Statistiques généalogiques** | v2.1.0 | H/F, âges, décennies, top noms/lieux |
| **Références orphelines** | v2.1.0 | FAMC/FAMS/HUSB/WIFE/CHIL cassés |
| **Score suspicion** | v2.1.0 | Niveaux FORT/MOYEN/FAIBLE |
| **Contrôle d'intégrité** | v2.1.0 | Boucles généalogiques, IDs dupliqués |

### Tests

| Fonctionnalité | Version | Description |
|----------------|---------|-------------|
| **Suite 644 tests** | v2.2.6 | 464 statiques + 180 Vitest |
| Tests automatiques Netlify | v1.9.3 | Exécution avant chaque build |
| **Tests Vitest** | v2.1.3 | helpers, parser, stats, conflicts |
| **10 catégories** | v2.2.6 | Couverture complète |

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

## Architecture v2.2.4

### Flux de fusion corrigé

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROCESSUS DE FUSION v2.2.4                               │
└─────────────────────────────────────────────────────────────────────────────┘

  DÉTECTION         SÉLECTION         RÉSOLUTION        FUSION           EXPORT
  DOUBLONS          PAIRES            CONFLITS          CASCADE          GEDCOM
     │                 │                  │                │                │
     ▼                 ▼                  ▼                ▼                ▼
┌─────────┐      ┌─────────┐       ┌─────────┐      ┌─────────┐      ┌─────────┐
│duplicates│────▶│selected │──────▶│conflicts│─────▶│mergeMap │─────▶│ .ged    │
│clusters │      │Pairs    │       │resolved │      │resolved │      │ final   │
└─────────┘      └─────────┘       └─────────┘      └─────────┘      └─────────┘
                                                          │
                                                          ▼
                                                   ┌─────────────┐
                                                   │ RÉSOLUTION  │
                                                   │ CHAÎNES     │
                                                   │ A→B→C = A→C │
                                                   └─────────────┘
```

### Résolution des chaînes de fusion

```javascript
// Exemple: Cluster de 4 personnes
// Paires: I1+I2→I2, I2+I3→I3, I3+I4→I4

// mergeMap initial:
{ I1→I2, I2→I3, I3→I4 }

// Après résolution itérative:
// Iter 1: { I1→I3, I2→I4, I3→I4 }
// Iter 2: { I1→I4, I2→I4, I3→I4 }  ✅ Tous pointent vers I4
```

### Web Worker

```
┌─────────────────────────┐     ┌─────────────────────────┐
│   Thread Principal      │     │      Web Worker         │
│   (React UI)            │     │  (gedcom-worker.js)     │
├─────────────────────────┤     ├─────────────────────────┤
│ • Interface réactive    │────▶│ • parseGedcom           │
│ • Barre progression     │     │ • findDuplicates        │
│ • Gestion événements    │◀────│ • calculateSimilarity   │
│ • setState              │     │ • detectClusters        │
└─────────────────────────┘     │ • generateQualityReport │
       postMessage             │ • detectChronoIssues    │
      onmessage                │ • calculateStats        │
                               └─────────────────────────┘
```

### Structure des fichiers

```
gedcom-merger/
├── src/
│   ├── App.jsx           # ~3500 lignes, composant principal
│   ├── utils/
│   │   ├── helpers.mjs   # Fonctions utilitaires + cleanOrphanedFamilies
│   │   ├── parser.mjs    # Parsing GEDCOM extrait
│   │   └── stats.mjs     # Statistiques extraites
│   ├── index.css
│   └── main.jsx
├── public/
│   └── gedcom-worker.js  # ~54KB, Worker autonome
├── tests/
│   ├── test-complete.cjs # 464 tests statiques
│   ├── helpers.test.mjs  # 47 tests Vitest
│   ├── parser.test.mjs   # 30 tests Vitest
│   ├── stats.test.mjs    # 31 tests Vitest
│   └── conflicts.test.mjs # 56 tests Vitest (nouveau)
├── docs/
│   ├── ARCHITECTURE.md
│   ├── ROADMAP_V2_2_0.md
│   ├── ETAT_DES_LIEUX.md
│   └── ANALYSE_PROCESSUS_FUSION.md
├── dist/                 # Build production
├── CHANGELOG.md
├── DEPLOIEMENT.md
└── package.json
```

---

## Catégories de Tests (644 total)

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
| 9 | Conflits v2.2.x | 30 | Détection, résolution, nettoyage |
| 10 | Scoring/Normalisation | 35 | v2.2.5 couleurs, v2.2.6 API Géo |
| | **Vitest** | +180 | helpers, parser, stats, conflicts |
| | **TOTAL** | **644** | |

---

## Fonctionnalités Restantes

### ✅ Implémenté dans v2.2.x

| Fonctionnalité | Version | Statut |
|----------------|---------|--------|
| Détection conflits fusion | v2.2.0 | ✅ |
| Modal résolution conflits | v2.2.0 | ✅ |
| Nettoyage FAM orphelines | v2.2.1 | ✅ |
| Corrections UI clusters | v2.2.2 | ✅ |
| Détection dates précises | v2.2.2 | ✅ |
| Isolation doublons/clusters | v2.2.3 | ✅ |
| Fusion en cascade | v2.2.4 | ✅ |
| Redirection références | v2.2.4 | ✅ |

### 📋 À venir (v2.3.0+)

| Fonctionnalité | Priorité | Description |
|----------------|----------|-------------|
| Export CSV | P2 | Export individus, familles, doublons |
| Export JSON | P2 | Format structuré pour analyse externe |
| Filtre patronyme | P3 | Analyse par branche familiale |
| Matching géo Isère | Basse | Dictionnaire 512 communes |
| Système Undo | Basse | Annulation des fusions |

---

## Historique des versions

| Version | Date | Type | Changements clés |
|---------|------|------|------------------|
| **v1.0.0** | 29/11/2025 | 🚀 Initial | Soundex français, triple indexation |
| **v1.6.0** | 10/12/2025 | ✨ Feature | Premiers Web Workers, variants orthographiques |
| **v1.8.6** | 16/12/2025 | ✨ Feature | HEAD/TRLR automatiques, conformité GEDCOM 5.5.1 |
| **v1.9.0** | 28/12/2025 | ✨ Feature | 4 onglets, suggestions IA |
| **v1.9.2** | 28/12/2025 | ✨ Feature | Anti-faux-positifs |
| **v1.9.5** | 30/12/2025 | ✨ Feature | Fusion intelligente, 266 tests |
| **v2.0.0** | 31/12/2025 | 🚀 Major | 18 critères, rawLines, 295 tests |
| **v2.1.0** | 02/01/2026 | ✨ Feature | Rapport qualité, chrono, stats, 377 tests |
| **v2.1.3** | 02/01/2026 | ✨ Feature | Vrais tests Vitest, 493 tests |
| **v2.1.4** | 03/01/2026 | 🚀 Perf | Web Worker, 501 tests, 3-5x plus rapide |
| **v2.2.0** | 04/01/2026 | ✨ Feature | Détection conflits, modal résolution |
| **v2.2.1** | 04/01/2026 | 🐛 Fix | Nettoyage FAM orphelines |
| **v2.2.2** | 04/01/2026 | 🐛 Fix | Corrections UI clusters, dates précises |
| **v2.2.3** | 04/01/2026 | 🐛 Fix | Isolation doublons/clusters |
| **v2.2.4** | 05/01/2026 | 🐛 Fix | **Fusion cascade, redirection références** |
| **v2.2.5** | 10/01/2026 | ✨ Feature | **Scoring amélioré, couleurs inversées, pondération noms** |
| **v2.2.6** | 10/01/2026 | ✨ Feature | **Outil de normalisation des lieux** |

---

## Stack technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Framework | React | 18.2.0 |
| Build | Vite | 5.4.21 |
| CSS | Tailwind CSS | 3.3.6 |
| Icônes | Lucide React | 0.294.0 |
| Tests unitaires | Vitest | 1.6.1 |
| Minification | esbuild | (via Vite) |
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

## Workflow de développement

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   dev       │────▶│   tests     │────▶│   main      │
│  (travail)  │     │  (644/644)  │     │  (prod)     │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      ▼                   ▼                   ▼
  dev--gedcom-        Bloque si          gedcom-merger
  merger.netlify.app  échec              .netlify.app
```

**Commandes** :
```bash
# Tests
npm run test:static  # 464 tests statiques
npm run test         # 180 tests Vitest
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

## Performance v2.1.4+

| Fichier | v2.1.3 (sans Worker) | v2.2.4 (avec Worker) |
|---------|---------------------|----------------------|
| 1000 individus | ~5s bloqué | ~2s fluide |
| 3000 individus | ~15s bloqué | ~5s fluide |
| 7000 individus | ~30s bloqué | ~8s fluide |

**Améliorations** :
- ✅ Interface toujours réactive
- ✅ Progression temps réel avec messages
- ✅ Pas de freeze navigateur
- ✅ Traitement 3-5x plus rapide perçu
- ✅ Fusion clusters N individus sans perte de références

---

*Document mis à jour le 10 janvier 2026 - v2.2.6*
