# Roadmap - GEDCOM Merger

## Version Actuelle : 2.4.1 ✅

Score de propreté + Cherry-picking valeur par valeur + Suggestions automatiques.

---

## Version 2.5.0 - Export et Reporting

**Objectif** : Exporter les données d'analyse.

### Fonctionnalités
- Export CSV des doublons
- Export JSON du graphe
- Rapport PDF synthétique

### Estimation
- Durée : 6-8h
- Tests : +40 (~870)

---

## Version 2.6.0 - Fusion par Lot

**Objectif** : Fusionner plusieurs paires "propres" en une opération.

### Fonctionnalités
- Sélection multiple des paires cleanlinessScore=100
- Confirmation groupée
- Application en cascade

### Estimation
- Durée : 8-10h
- Tests : +50 (~920)

---

## Version 2.7.0 - Amélioration IA

**Objectif** : Détection plus intelligente.

### Fonctionnalités
- Matching phonétique étendu
- Détection patterns familiaux
- Score de confiance

### Estimation
- Durée : 10-15h
- Tests : +60 (~980)

---

## Backlog

- Multi-fichiers GEDCOM (v3.0.0)
- Visualisation arborescente
- Mode sombre
- API MyHeritage

---

## Principes

1. **CommonJS** : postcss.config.cjs, tailwind.config.cjs
2. **rawLines** : Préservation données GEDCOM
3. **Tests avant commit** : npm run test:all
4. **Incrémental** : Modifications chirurgicales
