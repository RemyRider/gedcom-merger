# Changelog GEDCOM Merger

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

## [v2.3.0] - 11 janvier 2026 (Phase 1)

### 🎯 Thème : Fusion intelligente - Ordre optimal de fusion

### ✨ Nouvelles fonctionnalités

#### Module fusionOrder.mjs
- **Graphe de dépendances** : Analyse des relations entre doublons (parent/enfant, conjoint)
- **Tri topologique** : Calcul de l'ordre optimal de fusion (enfants → conjoints → parents)
- **Score qualité enrichi** : Évaluation plus fine avec précision des dates/lieux et sources
- **Détection de cycles** : Gestion des cas complexes de dépendances circulaires

#### Algorithme "Bottom-Up"
```
PRINCIPE :
1. Fusionner les enfants d'abord (niveau 0)
2. Fusionner les conjoints ensuite (niveau 1)
3. Fusionner les parents en dernier (niveau 2)
→ Les relations familiales pointent toujours vers les personnes les plus complètes
```

### 🧪 Tests
- **45 nouveaux tests statiques** (Catégorie 11)
- **32 tests Vitest** pour fusionOrder.mjs
- Total : **720 tests** (527 statiques + 193 Vitest)

### 📁 Nouveaux fichiers
- `src/utils/fusionOrder.mjs` : Module principal (494 lignes)
- `tests/fusionOrder.test.mjs` : Tests unitaires Vitest

### 🔧 Technique
- Export des constantes : `FUSION_LEVELS`, `FUSION_LEVEL_LABELS`
- Fonctions principales :
  - `buildDependencyGraph()` : Construction du graphe
  - `calculateFusionOrder()` : Tri topologique
  - `calculateEnrichedQuality()` : Score qualité amélioré
  - `canFuseLevel()` : Vérification si un niveau peut être fusionné
  - `prepareLevelForDisplay()` : Préparation données UI

---

## [v2.2.6] - 11 janvier 2026 ✅ SANCTUARISÉE

### 🎯 Thème : Outil de normalisation des lieux + Conflits relationnels

### ✨ Nouvelles fonctionnalités
- **Modal de normalisation des lieux** : Interface complète pour corriger les variantes
- **🌍 Intégration API Géo** : Suggestions officielles depuis l'API du gouvernement français
  - Bouton "Rechercher officiels" pour obtenir les noms normalisés
  - Format proposé : **Commune, Département, Région, France**
  - Recherche individuelle ou globale pour tous les groupes
- **✏️ Saisie manuelle avec autocomplétion** : 
  - Champ de saisie libre pour chaque groupe
  - Suggestions API Géo en temps réel pendant la frappe
  - Validation manuelle possible (sans API) avec bouton ✓
- **Fermeture automatique** du modal qualité lors de l'ouverture du modal normalisation
- **📊 Écran récapitulatif** : Redirection vers l'écran de téléchargement avec statistiques

### 🆕 Gestion des conflits relationnels
- **Détection des conflits sur les parents** : si les deux personnes ont des parents différents
- **Détection des conflits sur les conjoints** : si les deux personnes ont des conjoints exclusifs
- **Détection des conflits sur les enfants** : si les deux personnes ont des enfants différents
- **Option "Fusionner les deux"** : conserve tous les éléments des deux personnes

---

## [v2.2.5] - 10 janvier 2026

### 🎯 Thème : Scoring amélioré avec indicateurs visuels

### ✨ Améliorations
- **Couleurs inversées** pour plus de logique :
  - 🟢 FORT = haute probabilité = feu vert pour fusionner
  - 🟡 MOYEN = à vérifier
  - 🔴 FAIBLE = prudence requise
- **Pondération des noms** selon leur fréquence
- **Bonus combinaison** : +15 pts si nom+naissance+lieu
- **Malus incohérence** : -10 pts si lieux naissance contradictoires

---

## [v2.2.4] - 5 janvier 2026

### 🐛 Corrections
- **Fusion en cascade** : Résolution des chaînes A→B→C en A→C
- **Redirection des références** : HUSB/WIFE/CHIL redirigés via mergeMap

---

## [v2.2.0] - 4 janvier 2026

### ✨ Nouvelles fonctionnalités
- **Détection des conflits** avant fusion (10 champs vérifiés)
- **Modal de résolution** des conflits
- **Nettoyage des FAM orphelines** après fusion

---

## [v2.1.4] - 3 janvier 2026 ✅ SANCTUARISÉE

### 🚀 Performance
- **Web Worker** pour traitement en arrière-plan
- Interface toujours fluide pendant l'analyse
- Amélioration 3-5x sur gros fichiers

---

## [v2.1.0] - 2 janvier 2026

### ✨ Nouvelles fonctionnalités
- **Rapport qualité** à l'upload
- **Détection des incohérences chronologiques** (7 règles)
- **Statistiques généalogiques** (âges, prénoms, lieux)
- **Références orphelines** détectées

---

## [v2.0.0] - 31 décembre 2025 ✅ SANCTUARISÉE

### 🚀 Version majeure
- **18 critères de comparaison** (vs 12 avant)
- **rawLines[]** : Préservation de toutes les lignes GEDCOM originales
- **rawLinesByTag{}** : Indexation par tag pour fusion intelligente
- **Comparaison par NOM** des parents/conjoints/enfants

---

## [v1.9.5] - 30 décembre 2025

### ✨ Nouvelles fonctionnalités
- Fusion intelligente avec préservation des données
- 266 tests

---

## [v1.9.3] - 26 décembre 2025

### ✨ Nouvelles fonctionnalités
- Bouton flottant
- Tableau clusters détaillé
- Onglet "À supprimer"

---

## [v1.9.2] - 25 décembre 2025

### 🐛 Corrections
- Anti-faux-positifs (critères suffisants obligatoires)

---

## [v1.9.0] - 28 décembre 2025

### ✨ Nouvelles fonctionnalités
- Interface 4 onglets
- Suggestions IA

---

## [v1.0.0] - 29 novembre 2025

### 🚀 Version initiale
- Algorithme Soundex français
- Triple indexation (phonétique, année, parents)
- Détection de doublons généalogiques
