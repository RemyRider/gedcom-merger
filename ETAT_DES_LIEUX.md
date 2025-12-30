# État des Lieux - GEDCOM Merger

> **Version actuelle** : v1.9.3 (30 décembre 2025)  
> **Repository** : https://github.com/RemyRider/gedcom-merger  
> **Production** : https://gedcom-merger.netlify.app  
> **Développement** : https://dev--gedcom-merger.netlify.app

---

## Historique complet des versions

| Version | Date | Type | Changements clés |
|---------|------|------|------------------|
| **v1.0.0** | 01/12/2025 | 🚀 Initial | Parseur GEDCOM, Soundex français, scoring 9 critères, triple indexation |
| **v1.1.0** | 02/12/2025 | ✨ Feature | Détection clusters, critères profession/religion, interface améliorée |
| **v1.2.0** | 03/12/2025 | ✨ Feature | Filtres recherche, ergonomie mobile, badges confiance, virtualisation listes |
| **v1.3.0** | 04/12/2025 | ✨ Feature | Prévisualisation fusions, enrichissement auto, badges qualité - **VERSION SANCTUARISÉE** |
| v1.3.1 | 05/12/2025 | 🐛 Fix | Corrections responsive iPhone, zones tactiles 48px |
| v1.4.0 | ~06/12/2025 | ⚠️ Régression | **Perte affichage parents** dans cartes doublons |
| v1.5.0 | ~08/12/2025 | ? | Version intermédiaire (détails non documentés) |
| **v1.6.0** | 10/12/2025 | ✨ Feature | Web Workers, 40 variantes prénoms français, suggestions IA, onglets |
| **v1.6.1** | 11/12/2025 | ✨ Feature | Contrôle intégrité 8 types, score complétude - **VERSION SANCTUARISÉE** |
| **v1.7.0** | 11/12/2025 | ✨ Feature | **Matching géographique Isère** (512 communes, 17 fusions, 7 niveaux cascade) |
| v1.7.1 | 11/12/2025 | 🐛 Fix | Correction clusters (régression v1.6.0), restauration parents (régression v1.4.0) |
| **v1.7.2** | 11/12/2025 | ✨ Feature | Affichage détails complet tous onglets (Suggestions IA, Clusters) |
| v1.7.3 | ~12/12/2025 | 🐛 Fix | Correction contraste textes (text-gray-900) |
| **v1.8.0** | ~15/12/2025 | ✨ Feature | Détection individus isolés, normalisation codes INSEE |
| v1.8.1 | ~15/12/2025 | ⚠️ Bug | Problème performance O(n³), timeout |
| v1.8.2 | ~15/12/2025 | 🐛 Fix | Hotfix performance avec cache intelligent |
| v1.8.3 | ~15/12/2025 | ⚠️ Régression | **Web Worker supprimé** (erreur MIME type) |
| v1.8.4 | ~15/12/2025 | 🔧 WIP | Tests 5 niveaux prévus (jamais finalisés) |
| v1.8.5 | 15/12/2025 | 🐛 Fix | Gestion CONT/CONC (continuation multi-lignes) |
| **v1.8.6** | 16/12/2025 | ✨ Feature | HEAD/TRLR automatiques, conformité GEDCOM 5.5.1 |
| v1.8.7 | ~20/12/2025 | ? | Version intermédiaire (125 tests) |
| **v1.9.0** | 28/12/2025 | ✨ Feature | 4 onglets (Clusters, Doublons, À supprimer, IA), restauration suggestions IA |
| v1.9.1 | 28/12/2025 | 🐛 Fix | Corrections mineures |
| **v1.9.2** | 28/12/2025 | ✨ Feature | Algorithme anti-faux-positifs (critères suffisants obligatoires) |
| **v1.9.3** | 28/12/2025 | ✨ Feature | Bouton flottant, tableau clusters détaillé, onglet "À supprimer" |

### Légende
- 🚀 **Initial** : Première version
- ✨ **Feature** : Nouvelle fonctionnalité
- 🐛 **Fix** : Correction de bug
- ⚠️ **Régression** : Bug introduit ou fonctionnalité perdue
- 🔧 **WIP** : Travail non finalisé
- ? : Détails à confirmer

---

## 🔴 Fonctionnalités PERDUES entre v1.7.2 et v1.9.3

Ces fonctionnalités ont été développées et documentées mais sont **ABSENTES** du code actuel v1.9.3 :

### 1. Web Workers (v1.6.0 → perdu v1.8.3)

| Aspect | Détail |
|--------|--------|
| **Version d'origine** | v1.6.0 |
| **Perdu en** | v1.8.3 (erreur MIME type, supprimé au lieu de corrigé) |
| **Impact** | Interface gelée sur fichiers 5000+ personnes |
| **Fichier attendu** | `public/worker.js` |
| **Architecture** | Thread séparé via postMessage |
| **Priorité** | 🔴 HAUTE |

### 2. Matching géographique Isère (v1.7.0)

| Aspect | Détail |
|--------|--------|
| **Version d'origine** | v1.7.0 |
| **Contenu** | 512 communes, codes INSEE, 17 fusions depuis 2015 |
| **Algorithme** | 7 niveaux cascade (exact → phonétique → Levenshtein → Jaro-Winkler) |
| **Fichier attendu** | `public/isere-geo-data.json` + fonctions dans worker.js |
| **Fonctionnalités** | Variantes Saint/St/Sᵗ, communes fusionnées (Mont-de-Lans→Les Deux Alpes), lieux-dits |
| **Priorité** | 🟠 MOYENNE-HAUTE |

### 3. Contrôle d'intégrité 8 types (v1.6.1)

| Aspect | Détail |
|--------|--------|
| **Version d'origine** | v1.6.1 |
| **Types** | Liens bidirectionnels, dates incohérentes, boucles, structure GEDCOM, orphelins, IDs dupliqués, isolés, complétude |
| **Status v1.9.3** | ⚠️ À vérifier si complet |
| **Priorité** | 🟠 MOYENNE |

---

## ✅ Fonctionnalités présentes en v1.9.3

### Core - Détection de doublons

| Fonctionnalité | Version | Présent |
|----------------|---------|---------|
| Algorithme Soundex français | v1.0.0 | ✅ |
| Triple indexation | v1.0.0 | ✅ |
| Scoring hybride 9 critères | v1.0.0 | ✅ |
| Détection clusters | v1.1.0 | ✅ |
| Prévisualisation fusions | v1.3.0 | ✅ |
| 40 variantes prénoms français | v1.6.0 | ⚠️ À vérifier |
| Suggestions IA | v1.6.0 | ✅ |
| Anti-faux-positifs | v1.9.2 | ✅ |

### Interface utilisateur

| Fonctionnalité | Version | Présent |
|----------------|---------|---------|
| 4 onglets (Clusters, Doublons, À supprimer, IA) | v1.9.0 | ✅ |
| Bouton flottant | v1.9.3 | ✅ |
| Tableau clusters détaillé | v1.9.3 | ✅ |
| Affichage détails complet | v1.7.2 | ⚠️ À vérifier |

### Parsing GEDCOM

| Fonctionnalité | Version | Présent |
|----------------|---------|---------|
| Gestion CONT/CONC | v1.8.5 | ✅ |
| Génération HEAD/TRLR | v1.8.6 | ✅ |
| Normalisation lieux basique | v1.8.0 | ✅ |

### Qualité

| Fonctionnalité | Version | Présent |
|----------------|---------|---------|
| Suite 187 tests | v1.9.3 | ✅ |
| Tests automatiques Netlify | v1.9.3 | ✅ |

---

## 🆕 Fonctionnalités prévues mais jamais implémentées

### Mode Contrôle v2.0 (PROPOSITION_V2_0.md)

Architecture dual mode proposée le 11/12/2025 :
- **Mode Fusionneur** : Fonctionnalités actuelles
- **Mode Contrôle** : Audit qualité sans modification, 20 types de vérifications, exports PDF/HTML/CSV/JSON

### Vérifications avancées prévues (v2.0)

1. Analyse démographique (âges mariage, naissance enfants, longévité)
2. Cohérence géographique (distances, migrations)
3. Cohérence temporelle multi-générations
4. Qualité données par champ
5. Cohérence des noms
6. Intégrité des familles
7. Sources et citations
8. Médias et documents
9. Notes et annotations
10. Conformité GEDCOM standard

### Exports enrichis (non implémentés)

- PDF avec jsPDF
- HTML standalone
- CSV/Excel avec SheetJS
- JSON structuré

---

## 🔧 Actions correctives recommandées

### Priorité 1 : Restaurer les Web Workers

```
Impact : Performance critique pour fichiers > 2000 personnes
Effort : 2-3 heures
Source : Version 1.6.1 sanctuarisée (public/worker.js)
```

### Priorité 2 : Restaurer le matching géographique Isère

```
Impact : Qualité détection doublons pour généalogies isèroises
Effort : 4-6 heures
Source : Version 1.7.0 (public/isere-geo-data.json + worker.js modifié)
```

### Priorité 3 : Vérifier les régressions d'affichage

```
À tester :
- Affichage parents dans cartes doublons (perdu v1.4.0, restauré v1.7.1)
- Affichage détails complets Suggestions IA (v1.7.2)
- Affichage détails complets tableau Clusters (v1.7.2)
- Contraste textes (v1.7.3)
- 40 variantes prénoms français (v1.6.0)
```

---

## Versions de référence sanctuarisées

### v1.3.0 (04/12/2025)
- Package : `gedcom-merger-v1.3.0-netlify-fixed.zip`
- Correction esbuild (Terser échouait sur Netlify)
- Base stable avant Web Workers

### v1.6.1 (11/12/2025)
- Package : `gedcom-merger-v1.6.1-netlify.zip`
- Web Workers fonctionnels
- Contrôle intégrité 8 types
- 40 variantes prénoms
- Suggestions IA
- **Dernière version complète avant régressions**

### v1.7.2 (11/12/2025)
- Package : `gedcom-merger-v1.7.2-netlify.zip`
- Matching géographique Isère
- Affichage détails complet tous onglets
- **Version la plus complète documentée**

---

## Stack technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Framework | React | 18.3 |
| Build | Vite | 5.4 |
| Minification | esbuild | (via Vite) |
| CSS | Tailwind CSS | 3.4 |
| Icônes | Lucide React | 0.294.0 |
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
cdgedcom
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

### v2.0.0 - Restauration fonctionnalités perdues
- [ ] Web Workers (depuis v1.6.1)
- [ ] Matching géographique Isère (depuis v1.7.0)
- [ ] Vérifier/restaurer affichage détails complet (depuis v1.7.2)

### v2.1.0 - Mode Contrôle (PROPOSITION_V2_0.md)
- [ ] Architecture dual mode
- [ ] 10-12 vérifications prioritaires
- [ ] Exports PDF/HTML

### v2.2.0 - Extensions
- [ ] Autres départements (Savoie, Drôme, Rhône)
- [ ] Système Undo
- [ ] Sauvegarde préférences

---

*Document généré le 30 décembre 2025*
*Basé sur : CHANGELOG.md, VERSION_1_3_0_REFERENCE.md, VERSION_1_3_1_REFERENCE.md, VERSION_1_6_1_REFERENCE.md, LIVRAISON_V1_7_2.md, PROPOSITION_V2_0.md*
