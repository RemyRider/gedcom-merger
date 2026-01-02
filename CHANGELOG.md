# Changelog - GEDCOM Merger

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

---

## [2.0.0] - 31 décembre 2025 - ACTUELLE

### Phase 1 - Préservation complète des données GEDCOM

#### Nouveautés
- **rawLines[]** : Stockage de TOUTES les lignes GEDCOM originales par personne
- **rawLinesByTag{}** : Indexation des lignes par tag (SOUR, NOTE, OBJE, EVEN, _TAG...)
- **Fusion intelligente** : SOUR/NOTE/OBJE combinés des 2 personnes lors de la fusion
- **18 critères de comparaison** (vs 11 avant) :
  - Ajout : Baptême, Lieu baptême, Inhumation, Lieu inhumation, Résidence, Titre, Religion
- **Affichage complet** : 16 champs affichés systématiquement dans la prévisualisation
- **Contrôles intégrité pré-fusion** :
  - ❌ Bloquant : sexes incompatibles
  - ⚠️ Warning : écart dates naissance/décès >5 ans, lieux naissance différents
- **Contrôles intégrité pré-suppression** :
  - ⚠️ Warning : personne avec enfants, conjoints, ou référencée comme parent

#### Corrections
- **Comparaison par nom** : Parents/conjoints/enfants comparés par nom si IDs différents
- **Score 100%** : Atteint quand toutes les données comparables sont identiques
- **Sélection clusters** : Le bouton "Sélectionner ≥X%" ajoute les paires pour fusion effective
- **Encart supprimé** : "Nouveauté v1.9.3" retiré de la page d'accueil

#### Technique
- 325 tests (7 catégories)
- Fichiers config en CommonJS (postcss.config.js, tailwind.config.js)

---

## [1.9.5] - 28 décembre 2025 - PRÉCÉDENTE

### Fusion intelligente
- Fonction `mergePersonData()` pour combiner les données de 2 personnes
- Fonction `generateMergedIndiLines()` pour générer le GEDCOM fusionné
- Déduplication automatique des CHIL dans les familles
- Traçabilité : NOTE indiquant les IDs fusionnés
- Parsing corrigé pour DATE/PLAC niveau 2 (baptême, inhumation, résidence)
- Bouton désélection globale

### Tests
- 266 tests (22 niveaux + 5 bonus)

---

## [1.9.3] - 27 décembre 2025

### Corrections anti-faux-positifs
- Onglet "À supprimer" avec filtrage strict (isolés totaux + sans identité)
- Bouton flottant pour actions rapides (Fusionner/Supprimer)
- Table détaillée des clusters avec toutes les informations
- Actions distinctes Merge vs Delete

---

## [1.9.2] - 26 décembre 2025

### Anti-faux-positifs
- Algorithme renforcé : nom + sexe seuls ne suffisent plus
- Critères suffisants obligatoires (naissance, parents, conjoints, décès, profession)
- Affichage des critères validants dans l'interface

---

## [1.9.0] - 25 décembre 2025

### Suggestions IA
- Onglet IA avec analyse de patterns
- Score de confiance pour chaque suggestion
- Détection basée sur noms, périodes et lieux

---

## [1.8.7] - 24 décembre 2025

### Interface 4 onglets
- Clusters, Doublons, À supprimer, IA
- Filtres par score
- Sélection haute confiance automatique

---

## [1.8.6] - 23 décembre 2025

### Parsing amélioré
- Gestion CONT/CONC pour textes multi-lignes
- Génération HEAD/TRLR conforme
- Support encodage UTF-8

---

## [1.0.0] - 15 décembre 2025

### Version initiale
- Upload fichier GEDCOM
- Détection doublons par scoring
- Interface responsive
- Export fichier nettoyé
