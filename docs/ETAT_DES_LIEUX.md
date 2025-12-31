# État des Lieux - GEDCOM Merger

> **Version actuelle** : v1.9.5 (31 décembre 2025)  
> **Repository** : https://github.com/RemyRider/gedcom-merger  
> **Production** : https://gedcom-merger.netlify.app  
> **Développement** : https://dev--gedcom-merger.netlify.app

---

## Fonctionnalités Implémentées

### Core - Détection de doublons

| Fonctionnalité | Version | Description |
|----------------|---------|-------------|
| Algorithme Soundex français | v1.0.0 | Détection phonétique adaptée aux noms français |
| Triple indexation | v1.0.0 | Optimisation O(n) via index phonétique, année, parents |
| Scoring hybride 11 critères | v1.9.5 | Nom, prénom, date naissance, lieu naissance, parents, conjoints, fratrie, décès, lieu décès, profession, enfants communs |
| Détection clusters | v1.6.0 | Groupes de 3+ personnes interconnectées |
| Anti-faux-positifs | v1.9.2 | Critères suffisants obligatoires au-delà du nom |
| Suggestions IA | v1.9.0 | Analyse de patterns nom/période avec score de confiance |
| **Fusion intelligente** | v1.9.5 | Combinaison des données des 2 personnes (mergePersonData) |

### Interface utilisateur

| Fonctionnalité | Version | Description |
|----------------|---------|-------------|
| 4 onglets | v1.9.0 | Clusters, Doublons, À supprimer, IA |
| Prévisualisation fusions | v1.3.0 | Modal détaillé avant/après fusion |
| Bouton flottant | v1.9.3 | Actions rapides sans scroll |
| Tableau clusters détaillé | v1.9.3 | Informations complètes par cluster |
| Boutons Désélectionner | v1.9.5 | Désélection rapide sur Clusters et Doublons |
| Filtrage par score | v1.0.0 | Slider pour ajuster le seuil |
| Recherche par nom/ID | v1.1.0 | Localisation rapide d'individus |
| Sous-titre dynamique | v1.9.5 | Basé sur CHANGELOG[0].title |

### Parsing GEDCOM

| Fonctionnalité | Version | Description |
|----------------|---------|-------------|
| Gestion CONT/CONC | v1.8.6 | Préservation des champs multi-lignes |
| Génération HEAD/TRLR | v1.8.6 | Conformité GEDCOM 5.5.1 |
| Normalisation lieux basique | v1.8.0 | Retrait codes INSEE résiduels |
| Tags custom (_TAG) | v1.8.0 | Préservation données propriétaires |
| **Parsing niveau 2 strict** | v1.9.5 | DATE/PLAC niveau 2 uniquement (correction bug critique) |
| **Parsing étendu** | v1.9.5 | Baptême (BAPM/CHR), Inhumation (BURI/CREM), Résidence (RESI), Titre (TITL) |

### Algorithme de fusion (NOUVEAU v1.9.5)

| Fonctionnalité | Version | Description |
|----------------|---------|-------------|
| mergePersonData() | v1.9.5 | Combine les données des 2 personnes au lieu de juste remplacer les références |
| generateMergedIndiLines() | v1.9.5 | Génère un bloc INDI complet avec données fusionnées |
| Déduplication CHIL | v1.9.5 | Évite les doublons d'enfants dans les FAM après fusion |
| Traçabilité fusions | v1.9.5 | NOTE automatique avec IDs sources fusionnés |
| Noms secondaires | v1.9.5 | Conservation tous les noms avec TYPE aka |
| Support clusters | v1.9.5 | Fusion en chaîne pour 3+ doublons |

### Qualité et tests

| Fonctionnalité | Version | Description |
|----------------|---------|-------------|
| Suite 266 tests | v1.9.5 | 22 niveaux + 5 bonus |
| Tests automatiques Netlify | v1.9.3 | Exécution avant chaque build |
| Contrôle d'intégrité 8 types | v1.9.4 | Détection anomalies avancées |
| Tests anti-régression UI | v1.9.4 | Niveau 21 - préservation drag&drop |
| Tests fusion (BONUS E) | v1.9.5 | 12 tests algorithme de fusion |

---

## Corrections Critiques v1.9.5

### Bug Parser DATE/PLAC

**Problème** : Le parser capturait les dates de niveau 3 (dans SOURCE) et écrasait les vraies dates de naissance/décès.

```
1 BIRT
2 DATE 19 SEP 1726        ← Date correcte
1 SOUR @S500055@
3 DATE 5 JAN 2025         ← ÉCRASAIT la date de naissance !
```

**Solution** :
- `trimmed.includes('DATE')` → `trimmed.startsWith('2 DATE')`
- `trimmed.includes('PLAC')` → `trimmed.startsWith('2 PLAC')`
- Reset de `currentEvent` sur tout tag niveau 1

### Bug Fusion Non-Combinante

**Problème** : La fusion gardait une personne et supprimait l'autre, perdant ainsi des données.

**Solution** : Nouvelle fonction `mergePersonData()` qui combine :
- Dates : `primary.birth || secondary.birth`
- Noms : Tous conservés avec TYPE aka
- Relations : Union des parents, conjoints, enfants

---

## Fonctionnalités Manquantes

### ⚠️ Régressions et fonctionnalités perdues à vérifier

| Fonctionnalité | Version d'origine | Statut actuel | Action |
|----------------|-------------------|---------------|--------|
| **Web Workers** | v1.6.0 | ❌ Absent v1.9.5 | À réimplémenter |
| **Matching géo Isère** | v1.7.0 | ❌ Absent v1.9.5 | À réimplémenter |
| Affichage parents | v1.2.0 → perdu v1.4.0 → restauré v1.7.1 | ✅ OK | - |
| Détection clusters | v1.3.0 → perdu v1.6.0 → restauré v1.7.1 | ✅ OK | - |

### Priorité Haute

#### 1. Web Workers pour calculs lourds
- **Impact** : Interface gelée sur fichiers 5000+ personnes
- **Solution** : Déporter les comparaisons dans un thread séparé
- **Effort estimé** : 2-3 heures

#### 2. Matching géographique Isère complet
- **Impact** : Faux négatifs sur variantes de lieux
- **Solution** : Dictionnaire 512 communes avec algorithme cascade
- **Effort estimé** : 4-6 heures

### Priorité Moyenne

#### 3. Exports enrichis
- **Formats souhaités** : PDF, CSV, Statistiques
- **Effort estimé** : 3-4 heures

### Priorité Basse

#### 4. Système Undo (annulation)
- **Effort estimé** : 4-5 heures

---

## Historique complet des versions

| Version | Date | Type | Changements clés |
|---------|------|------|------------------|
| **v1.0.0** | 29/11/2025 | 🚀 Initial | Soundex français, triple indexation, scoring 9 critères |
| **v1.1.0** | 30/11/2025 | ✨ Feature | Recherche par ID, normalisation lieux français |
| **v1.2.0** | 01/12/2025 | ✨ Feature | Affichage détaillé parents/conjoints |
| **v1.3.0** | 03/12/2025 | ✨ Feature | Prévisualisation fusions, détection clusters |
| v1.3.1 | 05/12/2025 | 🐛 Fix | Corrections responsive iPhone |
| v1.4.0 | ~06/12/2025 | ⚠️ Régression | Perte affichage parents |
| **v1.6.0** | 10/12/2025 | ✨ Feature | Web Workers (jamais finalisés), variants orthographiques |
| **v1.7.0** | 14/12/2025 | ✨ Feature | Matching géographique Isère - ⚠️ Non présent en v1.9.5 |
| v1.7.1 | 14/12/2025 | 🐛 Fix | Correction bugs clusters et parents |
| **v1.8.0** | ~15/12/2025 | ✨ Feature | Détection individus isolés, normalisation codes INSEE |
| **v1.8.6** | 16/12/2025 | ✨ Feature | HEAD/TRLR automatiques, conformité GEDCOM 5.5.1 |
| **v1.9.0** | 28/12/2025 | ✨ Feature | 4 onglets (Clusters, Doublons, À supprimer, IA) |
| **v1.9.2** | 28/12/2025 | ✨ Feature | Algorithme anti-faux-positifs |
| **v1.9.3** | 28/12/2025 | ✨ Feature | Bouton flottant, tableau clusters détaillé |
| **v1.9.4** | 30/12/2025 | ✨ Feature | Contrôle intégrité 8 types, 236 tests (21 niveaux) |
| **v1.9.5** | 31/12/2025 | ✨ Feature | **FUSION INTELLIGENTE**, correction parsing DATE/PLAC, déduplication CHIL, 266 tests (22 niveaux + 5 bonus) |

### Légende
- 🚀 **Initial** : Première version
- ✨ **Feature** : Nouvelle fonctionnalité
- 🐛 **Fix** : Correction de bug
- ⚠️ **Régression** : Bug introduit ou fonctionnalité perdue

---

## Stack technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Framework | React | 18.2.0 |
| Build | Vite | 5.0.8 |
| CSS | Tailwind CSS | 3.3.6 |
| Icônes | Lucide React | 0.294.0 |
| Minification | esbuild | (via Vite) |
| Hébergement | Netlify | - |
| Tests | Node.js natif | 18+ |

---

## Structure des tests v1.9.5

| Niveau | Description | Tests |
|--------|-------------|-------|
| 1-10 | Core (syntaxe, React, GEDCOM) | 107 |
| 11-15 | Interface (onglets, actions, export) | 37 |
| 16-20 | Intégrité et boutons | 33 |
| 21 | Anti-régression UI (drag&drop) | 10 |
| **22** | **Fonctionnalités v1.9.5** | **10** |
| Bonus A | Documentation | 17 |
| Bonus B | Responsive et UX | 12 |
| Bonus C | Statistiques | 8 |
| Bonus D | Parsing étendu | 8 |
| **Bonus E** | **Algorithme de fusion** | **12** |
| **Total** | | **266** |

---

## Workflow de développement

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   dev       │────▶│   tests     │────▶│   main      │
│  (travail)  │     │  (266/266)  │     │  (prod)     │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      ▼                   ▼                   ▼
  dev--gedcom-        Bloque si          gedcom-merger
  merger.netlify.app  échec              .netlify.app
```

**Commandes Git** :
```bash
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

## Roadmap suggérée

### v2.0.0 - Performance
- [ ] Web Workers pour calculs lourds
- [ ] Optimisation mémoire pour fichiers > 10 000 personnes

### v2.1.0 - Géographie
- [ ] Matching géographique Isère complet
- [ ] Dictionnaire 512 communes

### v2.2.0 - Qualité
- [ ] Exports PDF/CSV
- [ ] Statistiques détaillées

---

*Document mis à jour le 31 décembre 2025 - v1.9.5*
