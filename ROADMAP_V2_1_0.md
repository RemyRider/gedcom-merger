# 🚀 ROADMAP GEDCOM Merger v2.1.x → v2.2.0

## Contexte

Ce document trace l'évolution de la v2.1.0 à la v2.1.4 et définit les prochaines étapes.

**Version actuelle** : v2.1.4 (3 janvier 2026)  
**Base de départ** : v2.0.0 (325 tests, 18 critères, rawLines/rawLinesByTag)  
**Date de création** : 2 janvier 2026  
**Dernière mise à jour** : 3 janvier 2026

---

## ✅ Historique v2.1.x (FAIT)

### v2.1.0 - Contrôle qualité avancé (2 janvier 2026)

| Fonctionnalité | Statut | Tests ajoutés |
|----------------|--------|---------------|
| Rapport qualité à l'upload | ✅ | +15 |
| Incohérences chronologiques (7 règles) | ✅ | +12 |
| Normalisation intelligente des lieux | ✅ | +10 |
| **Total** | ✅ | **377 tests** |

### v2.1.1 - Corrections (2 janvier 2026)

| Correction | Statut |
|------------|--------|
| Barres de progression colorées | ✅ |
| Normalisation lieux renforcée | ✅ |

### v2.1.2 - Statistiques enrichies (2 janvier 2026)

| Fonctionnalité | Statut | Tests ajoutés |
|----------------|--------|---------------|
| Statistiques généalogiques complètes | ✅ | +8 |
| Références orphelines | ✅ | +10 |
| Score de suspicion FORT/MOYEN/FAIBLE | ✅ | +6 |
| Contrôle d'intégrité avancé | ✅ | +10 |
| **Total** | ✅ | **377 tests** |

### v2.1.3 - Vrais tests Vitest (2 janvier 2026)

| Fonctionnalité | Statut | Tests |
|----------------|--------|-------|
| Extraction fonctions pures (src/utils/) | ✅ | - |
| Tests Vitest helpers.test.mjs | ✅ | +47 |
| Tests Vitest parser.test.mjs | ✅ | +30 |
| Tests Vitest stats.test.mjs | ✅ | +31 |
| Configuration Vitest | ✅ | - |
| **Total** | ✅ | **493 tests** (385+108) |

### v2.1.4 - Web Worker Performance (3 janvier 2026) 🆕

| Fonctionnalité | Statut | Description |
|----------------|--------|-------------|
| Web Worker (gedcom-worker.js) | ✅ | Traitement arrière-plan |
| Interface fluide | ✅ | Pas de freeze pendant analyse |
| Progression temps réel | ✅ | Messages détaillés |
| Algorithme identique App.jsx | ✅ | Même résultats que v2.1.3 |
| Cache-busting Worker | ✅ | Forcer rechargement |
| Tests Worker | ✅ | +8 tests |
| **Total** | ✅ | **501 tests** (393+108) |

**Performance v2.1.4** :
- 7000 individus : 30s bloqué → 8s fluide
- Amélioration perçue : 3-5x plus rapide
- Interface toujours réactive

---

## 📊 Récapitulatif v2.1.x complet

### Fonctionnalités P1 (Haute priorité) - ✅ TERMINÉ

| # | Fonctionnalité | Version | Statut |
|---|----------------|---------|--------|
| 1 | Rapport qualité à l'upload | v2.1.0 | ✅ |
| 2 | Incohérences chronologiques | v2.1.0 | ✅ |
| 3 | Normalisation lieux | v2.1.0 | ✅ |

### Fonctionnalités P2 (Moyenne priorité) - ✅ TERMINÉ

| # | Fonctionnalité | Version | Statut |
|---|----------------|---------|--------|
| 4 | Statistiques généalogiques | v2.1.2 | ✅ |
| 5 | Références orphelines | v2.1.2 | ✅ |
| 6 | Score suspicion FORT/MOYEN/FAIBLE | v2.1.2 | ✅ |

### Fonctionnalités P3 (Basse priorité) - ❌ REPORTÉ v2.2.0

| # | Fonctionnalité | Statut |
|---|----------------|--------|
| 7 | Export CSV | ❌ Reporté |
| 8 | Export JSON | ❌ Reporté |
| 9 | Filtre par patronyme | ❌ Reporté |

### Bonus non planifiés - ✅ FAIT

| Fonctionnalité | Version | Statut |
|----------------|---------|--------|
| Vrais tests Vitest | v2.1.3 | ✅ |
| Web Worker performance | v2.1.4 | ✅ |
| Fonctions extraites (src/utils/) | v2.1.3 | ✅ |

---

## 🎯 ROADMAP v2.2.0

### Objectif
> **Exports et filtrage** - Permettre l'exploitation externe des données

### Fonctionnalités planifiées

#### 🟢 P3.1 - Export CSV

**Fichiers à générer** :

| Fichier | Colonnes |
|---------|----------|
| `individus.csv` | id, nom, prénom, sexe, naissance, lieu_naissance, décès, lieu_décès, père, mère |
| `familles.csv` | id, mari, femme, date_mariage, lieu_mariage, nb_enfants |
| `doublons.csv` | id1, id2, score, niveau, critères |
| `erreurs.csv` | type, id, message, suggestion |

**Estimation** : 2-3h

---

#### 🟢 P3.2 - Export JSON

**Structure** :
```json
{
  "metadata": {
    "version": "5.5.1",
    "generated": "2026-01-03T10:30:00Z",
    "source": "sample.ged",
    "toolVersion": "2.2.0"
  },
  "statistics": {
    "individuals": 7234,
    "families": 2891,
    "duplicates": 156
  },
  "qualityReport": { ... },
  "individuals": [ ... ],
  "families": [ ... ],
  "duplicates": [ ... ],
  "issues": [ ... ]
}
```

**Estimation** : 1-2h

---

#### 🟢 P3.3 - Filtre par patronyme

**Interface** :
```
┌─────────────────────────────────────────┐
│ 🔍 Filtrer par patronyme                │
│ ┌─────────────────────────────────────┐ │
│ │ MARTIN                              │ │
│ └─────────────────────────────────────┘ │
│ [Analyser cette branche]                │
└─────────────────────────────────────────┘

Résultat : 234 individus /MARTIN/
• 12 doublons probables
• 3 incohérences chronologiques
```

**Estimation** : 2-3h

---

### Tests prévus v2.2.0

| Catégorie | Tests estimés |
|-----------|---------------|
| Export CSV | +10 |
| Export JSON | +8 |
| Filtre patronyme | +6 |
| **Total** | **~525 tests** |

---

## 🔮 ROADMAP v2.3.0+ (Future)

### Idées à explorer

| Fonctionnalité | Priorité | Complexité |
|----------------|----------|------------|
| Matching géographique Isère | Basse | Haute |
| Système Undo (annulation fusions) | Basse | Haute |
| Import depuis autres formats | Très basse | Haute |
| Mode collaboratif | Très basse | Très haute |

---

## ✅ Checklist de validation v2.1.4 (FAIT)

### P1 - Obligatoire ✅
- [x] Rapport qualité affiché après upload
- [x] Incohérences chronologiques détectées (7 règles)
- [x] Lieux similaires groupés avec suggestion

### P2 - Important ✅
- [x] Statistiques généalogiques calculées
- [x] Références orphelines identifiées
- [x] Score suspicion FORT/MOYEN/FAIBLE

### Performance ✅
- [x] Web Worker fonctionnel
- [x] Interface fluide pendant analyse
- [x] Même résultats que version sans Worker

### Technique ✅
- [x] 501 tests passent (393 statiques + 108 Vitest)
- [x] Build Netlify OK
- [x] Aucune régression v2.0.0
- [x] Documentation à jour

---

## 📈 Évolution des tests

| Version | Tests statiques | Tests Vitest | Total |
|---------|-----------------|--------------|-------|
| v2.0.0 | 325 | 0 | 325 |
| v2.1.0 | 377 | 0 | 377 |
| v2.1.2 | 377 | 0 | 377 |
| v2.1.3 | 385 | 108 | 493 |
| **v2.1.4** | **393** | **108** | **501** |

---

## 🔗 Liens

- **Production** : https://gedcom-merger.netlify.app
- **Dev** : https://dev--gedcom-merger.netlify.app
- **GitHub** : https://github.com/RemyRider/gedcom-merger
- **Branche de travail** : dev

---

## 📅 Calendrier

| Version | Date | Statut |
|---------|------|--------|
| v2.1.0 | 02/01/2026 | ✅ Terminé |
| v2.1.1 | 02/01/2026 | ✅ Terminé |
| v2.1.2 | 02/01/2026 | ✅ Terminé |
| v2.1.3 | 02/01/2026 | ✅ Terminé |
| **v2.1.4** | **03/01/2026** | **✅ Terminé** |
| v2.2.0 | À planifier | 🔜 Export CSV/JSON |

---

*Document mis à jour le 3 janvier 2026*  
*Version 2.1.4 - Web Worker Performance - SANCTUARISÉE*
