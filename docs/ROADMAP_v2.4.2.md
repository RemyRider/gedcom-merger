# Roadmap - GEDCOM Merger

## Version Actuelle : 2.4.2 ✅

Tri global par facilité de fusion + Fix fusion multiple + UX sélection/désélection améliorée.

### Ce qui a été livré

| Version | Fonctionnalités |
|---------|-----------------|
| v2.4.2 | Tri partout (🧹), dépendances complètes, fusion multiple, toggle UX |
| v2.4.1 | Score de propreté, cherry-picking, suggestions auto |
| v2.4.0 | Tri par dépendances, alerte relations doublons |
| v2.3.0 | Module fusionOrder.mjs, graphe dépendances |
| v2.2.6 | Normalisation lieux API Géo |

---

## Version 2.5.0 - Export et Reporting

**Objectif** : Exporter les données d'analyse.

### Fonctionnalités
- Export CSV des doublons (colonnes : ID1, ID2, score, propreté, critères)
- Export JSON du graphe de dépendances
- Rapport PDF synthétique avec statistiques

### Estimation
- Durée : 6-8h
- Tests : +40 (~905)

---

## Version 2.6.0 - Fusion par Lot Automatique

**Objectif** : Fusionner automatiquement les paires "propres" (🧹 100%).

### Fonctionnalités
- Bouton "Fusionner tous les 100%" 
- Validation automatique avec suggestions
- Barre de progression
- Rollback en cas d'erreur

### Estimation
- Durée : 8-10h
- Tests : +50 (~955)

---

## Version 2.7.0 - Amélioration Détection

**Objectif** : Détection plus intelligente des doublons.

### Fonctionnalités
- Matching phonétique étendu (variantes régionales)
- Détection patterns familiaux (fratries, couples)
- Score de confiance multi-critères
- Suggestions de paires manquées

### Estimation
- Durée : 10-15h
- Tests : +60 (~1015)

---

## Backlog

| Priorité | Fonctionnalité | Version cible |
|----------|----------------|---------------|
| Haute | Export CSV/JSON | v2.5.0 |
| Haute | Fusion lot 100% | v2.6.0 |
| Moyenne | Multi-fichiers GEDCOM | v3.0.0 |
| Moyenne | Visualisation arborescente | v3.1.0 |
| Basse | Mode sombre | v3.x |
| Basse | API MyHeritage | v4.0.0 |

---

## Principes de développement

1. **CommonJS obligatoire** : postcss.config.cjs, tailwind.config.cjs
2. **rawLines** : Préservation intégrale des données GEDCOM
3. **Tests avant commit** : npm run test:all (865 tests minimum)
4. **Incrémental** : Modifications chirurgicales via str_replace
5. **Git workflow** : dev → tests → main

---

## Métriques actuelles

| Métrique | Valeur |
|----------|--------|
| Tests statiques | 612 |
| Tests Vitest | 253 |
| **Total tests** | **865** |
| Taille App.jsx | ~185 KB |
| Lignes de code | ~5200 |
