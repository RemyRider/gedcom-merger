# Changelog - GEDCOM Merger

## [2.4.1] - 2026-01-17

### Ajouté
- **Score de propreté** pour trier les doublons par risque de fusion
  - 100 pts = fusion propre
  - -20 pts par relation déjà en doublon
  - -10 pts par potentiel doublon après fusion
- **Détection potentiels doublons** après fusion (similarité ≥50%)
- **Modal Cherry-picking** : sélection valeur par valeur
  - Champs simples : Radio A / B
  - Noms : Checkboxes individuelles
  - Relations : Checkboxes avec noms des personnes
- **Suggestions automatiques** avec pré-sélection intelligente
  - Dates : plus précise (jour > mois > année > ABT)
  - Lieux : plus complet (4 niveaux > 3 > 2)
  - Textes : plus détaillé (longueur)
  - Listes : union de toutes les valeurs
- **Interface modal fusion détaillée** avec affichage groupé par catégorie
- **55 nouveaux tests** pour le cherry-picking (total : 612 tests statiques)

### Modifié
- Tri des doublons par cleanlinessScore (propreté décroissante)
- handleMerge ouvre désormais le modal cherry-picking
- Statistiques enrichies : cleanPairs, riskyPairs

## [2.4.0] - 2026-01-17

### Ajouté
- **Tri par dépendances** : paires avec moins de dépendances en premier
- **Alerte relations en doublon** : notification visuelle
- **calculateFusionImpact** : calcul de l'impact d'une fusion
- **recommendedOrder** : ordre recommandé pour les relations liées

## [2.3.0] - 2026-01-15

### Ajouté
- **Module fusionOrder.mjs** externalisé
- **Graphe de dépendances** entre paires de doublons
- **Score qualité enrichi** avec précision dates/lieux
- **45 tests** pour le module fusion

## [2.2.6] - 2026-01-10

### Ajouté
- **Normalisation lieux** avec API Géo gouvernement français
- **Saisie manuelle** avec autocomplétion
- **Conflits relationnels** : parents, conjoints, enfants
- **Écran récapitulatif** après normalisation

## [2.2.4] - 2026-01-05

### Corrigé
- **Résolution chaînes fusion** : A→B→C résolu en A→C
- **Nettoyage familles orphelines** avec mergeMap
- **Références cassées** redirigées correctement

## [2.1.4] - 2025-12-30

### Ajouté
- **Web Worker** pour performances (3-5x)
- **Rapport qualité** des données
- **Analyse chronologique**
- **Statistiques** détaillées
- **Références orphelines** détection
- **Score suspicion** pour doublons

## [2.0.0] - 2025-12-28

### Ajouté
- **16 champs systématiques** affichés
- **18 critères de comparaison** pour détection
- **Matching phonétique** Soundex français
- **Contrôles d'intégrité** avant fusion
- **rawLines** pour préservation données

## [1.9.5] - 2025-12-20

### Ajouté
- Parsing étendu DATE/PLAC
- Critères anti-faux-positifs

## [1.9.0] - 2025-12-15

### Ajouté
- Suggestions IA basiques
- Interface 4 onglets

## [1.0.0] - 2025-12-01

### Initial
- Parsing GEDCOM basique
- Détection doublons simple
- Fusion manuelle
