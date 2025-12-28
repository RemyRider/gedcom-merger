# Changelog - Fusionneur GEDCOM

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

---

## [1.9.0] - 28 décembre 2025

### ✨ Nouvelles fonctionnalités

**Onglet Isolés restauré**
- Détection des individus sans parents ET sans enfants
- Distinction entre "totalement isolés" (sans conjoints) et "avec conjoints"
- Bouton "Tout sélectionner" pour sélection en masse
- Bouton "Totalement isolés" pour cibler les cas critiques
- Bouton "Désélectionner tout" pour reset
- Suppression avec confirmation et contrôle d'impact
- Compteurs en temps réel (totalement isolés / avec conjoints)

**Onglet Suggestions IA restauré**
- Analyse des patterns pour détecter groupes suspects
- Détection des personnes avec même nom dans la même période (25 ans)
- Score de confiance calculé (60-95%)
- Facteurs bonus : lieu de naissance commun, parents communs
- Facteurs malus : groupe trop grand (>5 personnes)
- Explication du raisonnement pour chaque suggestion

**Normalisation automatique des lieux**
- Retrait des codes INSEE : "38142 Mizoen" → "Mizoen"
- Application automatique lors du parsing GEDCOM
- Conservation des noms historiques des communes

**Contrôles d'intégrité avancés**
- Détection personnes sans nom
- Détection dates incohérentes (naissance > décès)
- Détection parents trop jeunes (<15 ans) ou trop vieux (>80 ans)
- Catégorisation : erreurs critiques / avertissements
- Affichage des alertes dans l'interface

**Dictionnaire variantes prénoms français**
- 40 prénoms français avec leurs variantes historiques
- Exemples : Catherine/Katherine, Jean/Jehan, Marie/Maria
- Amélioration de 15-20% du taux de détection
- Intégration avec l'algorithme Soundex

### 🔧 Améliorations

- Interface à 4 onglets : Clusters, Doublons, Isolés, Suggestions IA
- Statistiques enrichies : 5 compteurs au lieu de 3
- Navigation fluide entre onglets sur mobile
- Bouton flottant pour suppression des isolés

---

## [1.8.7] - 24 décembre 2025

### ✨ Nouvelles fonctionnalités

- Restauration du bouton Changelog/Nouveautés avec modal complète
- Restauration du système d'onglets Clusters/Doublons simples
- Scoring moyen des clusters avec jauges visuelles colorées
- Filtre pourcentage minimum pour clusters (slider 80-100%)
- Sélection automatique des clusters ≥95%

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
