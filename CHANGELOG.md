# Changelog - Fusionneur GEDCOM

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

## Conventions

- 🎉 Nouvelle version majeure
- ✨ Nouvelle fonctionnalité
- 🔧 Amélioration
- 🐛 Correction de bug
- ⚠️ Changement important
- 💔 Breaking change

---

## [1.9.2] - 28 décembre 2025

### 🎉 CORRECTION MAJEURE : Algorithme anti-faux-positifs

Cette version corrige une régression critique introduite depuis la v1.8.7 qui causait de nombreux faux positifs.

**Problème identifié** :
Le système de scoring hybride relatif donnait des scores élevés (parfois 100%) même quand seuls le nom et le sexe correspondaient, sans autre critère confirmant la correspondance.

**Solution implémentée** :

#### Nouvelle règle métier stricte

```
POUR ÊTRE CONSIDÉRÉ DOUBLON, IL FAUT :
├─ Nom/prénom identiques (NÉCESSAIRE mais PAS SUFFISANT)
├─ Sexe compatible (NÉCESSAIRE si renseigné, ÉLIMINATOIRE si différent)
└─ AU MOINS 1 critère SUFFISANT parmi :
   ├─ Date/année de naissance
   ├─ Lieu de naissance
   ├─ Parents communs (1 ou 2)
   ├─ Conjoints communs
   ├─ Même fratrie
   ├─ Date de décès
   └─ Profession identique
```

#### Exemples concrets

| Cas | Nom | Sexe | Autre critère | Verdict v1.9.2 |
|-----|-----|------|---------------|----------------|
| A | Jean MARTIN | M | *(rien)* | ❌ **REJETÉ** |
| B | Jean MARTIN | M | Né 1950 | ✅ **DOUBLON** |
| C | Jean MARTIN | M | Même parents | ✅ **DOUBLON** |
| D | Jean MARTIN | M vs F | Né 1950 | ❌ **ÉLIMINÉ** (sexe différent) |

### ✨ Améliorations techniques

- Tracking des critères suffisants dans `calculateSimilarity()`
- Nouveau champ `sufficientCriteria` dans les résultats de comparaison
- Affichage des critères validants dans l'interface
- Rejet précoce des paires sans critère suffisant
- Comptage des rejets dans les logs de performance

### 🔧 Fonctionnalités préservées

- 4 onglets : Clusters, Doublons, Isolés, Suggestions IA
- Détection des individus isolés (sans parents ET sans enfants)
- Suggestions IA basées sur patterns nom/période
- Normalisation automatique des lieux (codes INSEE)
- Contrôles d'intégrité avancés
- Gestion CONT/CONC multi-lignes
- Génération automatique HEAD/TRLR

---

## [1.9.1] - 28 décembre 2025

### 🐛 Correction du traitement fichier

- Correction du bug de la v1.9.0 où le traitement du fichier ne fonctionnait pas
- Restauration complète de l'onglet "Isolés"
- Restauration complète de l'onglet "Suggestions IA"

---

## [1.9.0] - 28 décembre 2025

### ⚠️ VERSION PROBLÉMATIQUE

- Tentative d'ajout des onglets Isolés et Suggestions IA
- **BUG CRITIQUE** : Le traitement du fichier ne fonctionnait pas
- Cette version ne doit pas être utilisée

---

## [1.8.7] - 24 décembre 2025

### ✨ Nouvelles fonctionnalités

- Restauration bouton Changelog/Nouveautés avec modal complète
- Restauration système d'onglets Clusters/Doublons simples
- Scoring moyen des clusters avec jauges visuelles colorées
- Filtre pourcentage minimum pour clusters (slider 80-100%)
- Sélection automatique clusters ≥95%

### 🔧 Améliorations

- Modal changelog avec 5 versions historiques
- Code couleur par version (vert=actuelle, bleu, indigo, gris)
- Sticky header/footer dans la modal

---

## [1.8.6] - 16 décembre 2025

### 🐛 Corrections critiques

- Correction gestion balises CONT/CONC multi-lignes
- Génération automatique en-tête HEAD complet si manquant
- Génération automatique balise TRLR de fin si manquante

### 🔧 Améliorations

- Amélioration compatibilité avec logiciels de généalogie
- Correction bugs mineurs interface
- Optimisation du parsing

---

## [1.4.0] - 5 décembre 2025

### ✨ Nouvelles fonctionnalités

- Système d'onglets séparant Clusters et Doublons simples
- Scoring moyen des clusters avec jauges colorées
- Auto-sélection clusters haute confiance (≥95%)
- Filtre pourcentage pour masquer clusters sous seuil
- Contrôle d'intégrité GEDCOM après fusion

---

## [1.3.0] - 3 décembre 2025

### ✨ Nouvelles fonctionnalités

- Prévisualisation complète des fusions avec modal
- Calcul automatique qualité des données
- Fusion intelligente avec enrichissement automatique
- Changelog intégré dans l'interface
- Détection automatique des clusters

---

## [1.0.0] - 1 décembre 2025

### 🎉 Version initiale

- Parseur GEDCOM complet (INDI, FAM, relations)
- Détection intelligente avec Soundex français
- Système de scoring hybride 9 critères pondérés
- Triple indexation pour performances optimales
- Fusion sécurisée sans perte de données
- Interface React moderne et responsive
- Traitement 100% côté client (confidentialité)
