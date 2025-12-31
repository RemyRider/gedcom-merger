# Changelog GEDCOM Merger

## v1.9.5 (31 décembre 2025) - ACTUELLE
### Détails complets + Boutons désélection + Parsing étendu
- Affichage de TOUS les champs parsés (ID, sexe, profession, religion, lieux décès...)
- Boutons "Désélectionner tout" sur onglets Clusters et Doublons
- Parsing étendu: baptême, inhumation, résidence, titre, notes, enfants
- Algo amélioré: lieu de décès (+8 pts), enfants communs (+15 pts) comme critères
- Sous-titre dynamique basé sur CHANGELOG[0].title
- 246 tests (22 niveaux + 3 bonus)

## v1.9.4 (30 décembre 2025)
### Contrôle intégrité + Boutons dynamiques + Recommencer header
- Contrôle d'intégrité 8 types restauré
- Bouton Recommencer déplacé dans le header
- Boutons sélection affichent la valeur dynamique du filtre
- Modal intégrité avec rapport détaillé
- 236 tests anti-régression

## v1.9.3 (30 décembre 2025)
### Onglet À supprimer + Bouton flottant + Tableau clusters
- Onglet "À supprimer" remplace "Isolés" avec filtrage strict
- Bouton flottant pour actions rapides
- Tableau clusters détaillé avec 9 colonnes

## v1.9.2 (28 décembre 2025)
### CORRECTION CRITIQUE : Algorithme anti-faux-positifs
- Nom + Sexe ne suffisent plus pour être doublon
- AU MOINS 1 critère suffisant requis

## Versions antérieures
Voir ETAT_DES_LIEUX.md pour l'historique complet.

## v1.8.7 (24 décembre 2025)
- Version complète avec toutes les corrections
- Système onglets Clusters/Doublons simples

## v1.8.6 (16 décembre 2025)
- HEAD/TRLR automatiques
- Conformité GEDCOM 5.5.1
- Gestion CONT/CONC
