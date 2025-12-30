# État des Lieux - GEDCOM Merger

> **Version actuelle** : v1.9.3 (30 décembre 2025)  
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
| Scoring hybride 9 critères | v1.0.0 | Nom, prénom, date naissance, lieu, parents, conjoints, fratrie, décès, profession |
| Détection clusters | v1.6.0 | Groupes de 3+ personnes interconnectées |
| Anti-faux-positifs | v1.9.2 | Critères suffisants obligatoires au-delà du nom |
| Suggestions IA | v1.9.0 | Analyse de patterns nom/période avec score de confiance |

### Interface utilisateur

| Fonctionnalité | Version | Description |
|----------------|---------|-------------|
| 4 onglets | v1.9.0 | Clusters, Doublons, À supprimer, IA |
| Prévisualisation fusions | v1.3.0 | Modal détaillé avant/après fusion |
| Bouton flottant | v1.9.3 | Actions rapides sans scroll |
| Tableau clusters détaillé | v1.9.3 | Informations complètes par cluster |
| Filtrage par score | v1.0.0 | Slider pour ajuster le seuil |
| Recherche par nom/ID | v1.1.0 | Localisation rapide d'individus |

### Parsing GEDCOM

| Fonctionnalité | Version | Description |
|----------------|---------|-------------|
| Gestion CONT/CONC | v1.8.6 | Préservation des champs multi-lignes |
| Génération HEAD/TRLR | v1.8.6 | Conformité GEDCOM 5.5.1 |
| Normalisation lieux basique | v1.8.0 | Retrait codes INSEE résiduels |
| Tags custom (_TAG) | v1.8.0 | Préservation données propriétaires |

### Qualité et tests

| Fonctionnalité | Version | Description |
|----------------|---------|-------------|
| Suite 187 tests | v1.9.3 | 16 niveaux + 3 bonus |
| Tests automatiques Netlify | v1.9.3 | Exécution avant chaque build |
| Contrôle d'intégrité basique | v1.8.0 | Détection anomalies simples |

---

## Fonctionnalités Manquantes

### ⚠️ Régressions et fonctionnalités perdues à vérifier

Ces fonctionnalités ont été développées mais pourraient avoir été perdues lors de refactorisations :

| Fonctionnalité | Version d'origine | Statut actuel | Action |
|----------------|-------------------|---------------|--------|
| **Web Workers** | v1.6.0 | ❌ Absent v1.9.3 | À réimplémenter |
| **Matching géo Isère** | v1.7.0 | ❌ Absent v1.9.3 | À réimplémenter |
| Affichage parents | v1.2.0 → perdu v1.4.0 → restauré v1.7.1 | ✅ À vérifier | Tester |
| Détection clusters | v1.3.0 → perdu v1.6.0 → restauré v1.7.1 | ✅ À vérifier | Tester |
| Contraste textes | Problème v1.7.2 → corrigé v1.7.3 | ✅ À vérifier | Tester |

### Priorité Haute

#### 1. Web Workers pour calculs lourds
- **Impact** : Interface gelée sur fichiers 5000+ personnes
- **Solution** : Déporter les comparaisons dans un thread séparé
- **Bénéfices** :
  - Interface fluide pendant l'analyse
  - Barre de progression temps réel
  - Possibilité d'annuler l'analyse
- **Effort estimé** : 2-3 heures

#### 2. Matching géographique Isère complet
- **Impact** : Faux négatifs sur variantes de lieux
- **Solution** : Dictionnaire 512 communes avec algorithme cascade
- **Contenu prévu** :
  - 512 communes avec codes INSEE
  - 17 communes fusionnées depuis 2015 (Les Deux Alpes, Autrans-Méaudre...)
  - Variantes historiques (Saint/St/Sᵗ/Sainct)
  - Lieux-dits et hameaux principaux
  - Algorithme 7 niveaux (exact → phonétique → Levenshtein → Jaro-Winkler)
- **Effort estimé** : 4-6 heures

### Priorité Moyenne

#### 3. Contrôles d'intégrité avancés
- **Types de vérifications** :
  - Personnes nées après leur décès
  - Références circulaires (personne parent d'elle-même)
  - Parents trop jeunes (<15 ans) ou trop âgés (>80 ans)
  - Conjoints orphelins
  - Dates incohérentes (mariage avant naissance)
- **Effort estimé** : 2-3 heures

#### 4. Exports enrichis
- **Formats souhaités** :
  - PDF : Rapport détaillé des doublons détectés
  - CSV : Export pour analyse externe (Excel, tableur)
  - Statistiques : Synthèse de l'arbre (nb personnes, périodes, lieux)
- **Effort estimé** : 3-4 heures

### Priorité Basse

#### 5. Système Undo (annulation)
- **Fonctionnalités** :
  - Historique des fusions effectuées
  - Annulation individuelle ou groupée
  - Sauvegarde état avant modifications
- **Effort estimé** : 4-5 heures

#### 6. Architecture multi-départements
- **Objectif** : Étendre le matching géographique
- **Départements prioritaires** : Savoie (73), Haute-Savoie (74), Drôme (26), Rhône (69)
- **Prérequis** : Matching Isère fonctionnel
- **Effort estimé** : 2 heures par département

---

## Historique complet des versions

| Version | Date | Type | Changements clés |
|---------|------|------|------------------|
| **v1.0.0** | 29/11/2025 | 🚀 Initial | Soundex français, triple indexation, scoring 9 critères |
| **v1.1.0** | 30/11/2025 | ✨ Feature | Recherche par ID, normalisation lieux français (40+ villes) |
| **v1.2.0** | 01/12/2025 | ✨ Feature | Affichage détaillé parents/conjoints, export rapport statistique |
| **v1.3.0** | 03/12/2025 | ✨ Feature | Prévisualisation fusions, détection clusters, badges qualité |
| v1.3.1 | 05/12/2025 | 🐛 Fix | Corrections responsive iPhone, zones tactiles 48px |
| v1.4.0 | ~06/12/2025 | ⚠️ Régression | Perte affichage parents dans cartes doublons |
| v1.5.0 | ~08/12/2025 | ? | *Version intermédiaire - détails à vérifier* |
| **v1.6.0** | 10/12/2025 | ✨ Feature | Web Workers (⚠️ jamais finalisés), variants orthographiques (40 prénoms), suggestions IA |
| v1.6.1 | ~11/12/2025 | 🐛 Fix | *Version de référence pour v1.7.0* |
| **v1.7.0** | 14/12/2025 | ✨ Feature | Matching géographique Isère (512 communes) - ⚠️ Non présent en v1.9.3 |
| v1.7.1 | 14/12/2025 | 🐛 Fix | Correction bugs clusters (régression v1.6.0) et parents (régression v1.4.0) |
| v1.7.2 | ~14/12/2025 | 🐛 Fix | *Problèmes de lisibilité signalés* |
| v1.7.3 | ~14/12/2025 | 🐛 Fix | Correction contraste textes (text-gray-900) |
| **v1.8.0** | ~15/12/2025 | ✨ Feature | Détection individus isolés, normalisation codes INSEE, contrôle intégrité |
| v1.8.1 | ~15/12/2025 | ⚠️ Bug | Problème performance critique O(n³), timeout |
| v1.8.2 | ~15/12/2025 | 🐛 Fix | Hotfix performance avec cache intelligent |
| v1.8.3 | ~15/12/2025 | ⚠️ Régression | Web Worker supprimé (erreur MIME type) → interface gelée gros fichiers |
| v1.8.4 | ~15/12/2025 | 🔧 WIP | Tests 5 niveaux prévus (jamais finalisés) |
| v1.8.5 | 15/12/2025 | 🐛 Fix | Gestion CONT/CONC (continuation multi-lignes) |
| **v1.8.6** | 16/12/2025 | ✨ Feature | HEAD/TRLR automatiques, conformité GEDCOM 5.5.1 |
| v1.8.7 | ~20/12/2025 | ? | *Version intermédiaire - 125 tests* |
| **v1.9.0** | 28/12/2025 | ✨ Feature | 4 onglets (Clusters, Doublons, À supprimer, IA), restauration suggestions IA |
| v1.9.1 | 28/12/2025 | 🐛 Fix | *Corrections mineures* |
| **v1.9.2** | 28/12/2025 | ✨ Feature | Algorithme anti-faux-positifs (critères suffisants obligatoires) |
| **v1.9.3** | 28/12/2025 | ✨ Feature | Bouton flottant, tableau clusters détaillé, onglet "À supprimer" renommé |

### Légende
- 🚀 **Initial** : Première version
- ✨ **Feature** : Nouvelle fonctionnalité
- 🐛 **Fix** : Correction de bug
- ⚠️ **Régression** : Bug introduit ou fonctionnalité perdue
- 🔧 **WIP** : Travail non finalisé
- ? : Détails à vérifier

### Versions à investiguer

Les versions suivantes nécessitent une vérification pour confirmer leur contenu exact :
- v1.4.0 à v1.5.0 : Transition peu documentée
- v1.8.7 : Passage de 125 à 128 tests
- v1.9.1 : Contenu exact des corrections

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

## Workflow de développement

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   dev       │────▶│   tests     │────▶│   main      │
│  (travail)  │     │  (187/187)  │     │  (prod)     │
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

## Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le repository
2. Créer une branche feature (`git checkout -b feature/ma-fonctionnalite`)
3. Exécuter les tests (`node tests/test-complete.cjs`)
4. Commit avec message clair (`git commit -m "feat: description"`)
5. Push et créer une Pull Request

---

## Roadmap suggérée

### v2.0.0 - Performance
- [ ] Web Workers pour calculs lourds
- [ ] Optimisation mémoire pour fichiers > 10 000 personnes

### v2.1.0 - Géographie
- [ ] Matching géographique Isère complet
- [ ] Dictionnaire 512 communes

### v2.2.0 - Qualité
- [ ] Contrôles d'intégrité avancés
- [ ] Exports PDF/CSV

### v2.3.0 - UX
- [ ] Système Undo
- [ ] Sauvegarde préférences utilisateur

---

*Document généré le 30 décembre 2025*
