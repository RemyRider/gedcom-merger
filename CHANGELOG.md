# Changelog - Fusionneur GEDCOM

## [1.9.3] - 28 décembre 2025

### ✨ Nouveautés
- **Onglet "À supprimer"** renommé et filtré :
  - Uniquement les individus **totalement isolés** (sans ascendants, descendants, ni conjoints)
  - Ajout des individus **sans identité** (ni nom ni prénom)
- **Bouton flottant** pour fusionner/supprimer sans scroller en bas de page
- **Tableau clusters détaillé** avec colonnes : #, Nom, Naissance, Lieu, Décès, Sexe, Parents, Conjoints, ID
- **Actions distinctes** :
  - "Fusionner X doublons" pour les clusters/doublons
  - "Supprimer X individus" pour les isolés
- **Sélections globales** préservées entre les onglets

### 🔧 Améliorations
- Confirmation de sécurité avant suppression définitive
- Statistiques de cluster enrichies (avec/sans naissance, décès, parents)

---

## [1.9.2] - 28 décembre 2025

### 🔴 CORRECTION CRITIQUE
- **Algorithme anti-faux-positifs** : Nom + Sexe ne suffisent plus
- Nouvelle règle : AU MOINS 1 critère suffisant requis
- Critères suffisants : naissance, lieu, parents, conjoints, fratrie, décès, profession
- Élimination des faux positifs sur homonymes sans données

---

## [1.9.1] - 28 décembre 2025

### 🔧 Corrections
- Correction du traitement des fichiers GEDCOM
- Restauration onglet Isolés
- Restauration onglet Suggestions IA
- Normalisation automatique des lieux

---

## [1.8.7] - 24 décembre 2025

### ✨ Fonctionnalités restaurées
- Bouton Changelog/Nouveautés
- Système d'onglets Clusters/Doublons
- Scoring moyen des clusters avec jauges visuelles
- Filtre pourcentage minimum
- Sélection automatique clusters ≥95%

---

## [1.8.6] - 16 décembre 2025

### 🔧 Corrections GEDCOM
- Gestion balises CONT/CONC multi-lignes
- Génération automatique en-tête HEAD
- Génération automatique balise TRLR

---

## [1.0.0] - 1 décembre 2025

### 🎉 Version initiale
- Parseur GEDCOM complet
- Détection intelligente avec Soundex français
- Système de scoring hybride 9 critères
- Interface responsive moderne
- Fusion sécurisée sans perte de données
