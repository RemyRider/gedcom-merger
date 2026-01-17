# Changelog

Historique des versions de GEDCOM Merger.

## [2.4.0] - 2026-01-17

### Ajouté
- **Fusion guidée contextuelle** : assistant automatique pour les doublons liés
  - Détection des relations en doublon (parents, conjoints, enfants)
  - Modal d'assistance avec recommandations d'ordre de fusion
  - Boutons "Fusionner" pour chaque paire liée
  - Option "Ignorer et fusionner" pour comportement classique
- **Approche Bottom-Up** : ordre de fusion enfants → conjoints → parents
- Fonctions `detectRelatedDuplicates`, `needsGuidedFusion`, `calculateFusionImpact`
- États React `showGuidedFusionModal`, `guidedFusionContext`
- 30 nouveaux tests (catégorie 12)

### Modifié
- Module `fusionOrder.mjs` : logique de dépendances Bottom-Up
- `calculateEnrichedQuality` : retourne 0 pour une personne sans nom valide
- Protection null/undefined dans le rendu JSX du modal

### Tests
- **557 tests statiques** (12 catégories)
- **225 tests Vitest** (5 fichiers)
- **Total : 782 tests**

---

## [2.3.0] - 2026-01-13

### Ajouté
- **Module fusionOrder.mjs** : calcul de l'ordre optimal de fusion
  - Graphe de dépendances entre paires de doublons
  - Tri topologique pour éviter les conflits
  - Score de qualité enrichi avec précision dates/lieux
- Constantes `FUSION_LEVELS` : CHILDREN, SPOUSES, PARENTS, INDEPENDENT
- Fonctions `buildDependencyGraph`, `calculateFusionOrder`, `calculateEnrichedQuality`
- 45 tests pour le module fusion (catégorie 11)

### Tests
- **527 tests statiques**
- **193 tests Vitest**

---

## [2.2.0] - 2026-01-10

### Ajouté
- **Normalisation des lieux**
  - Intégration API Géo gouvernementale française
  - Autocomplétion temps réel des communes
  - Saisie manuelle pour lieux étrangers/historiques
  - Format standardisé : Ville, Département, Région, Pays
- **Détection des conflits relationnels**
  - Parents différents entre les deux personnes
  - Conjoints différents
  - Enfants différents
  - Alertes visuelles dans l'interface
- **Écran récapitulatif** avant fusion avec conflits détectés

### Tests
- **482 tests statiques**
- **193 tests Vitest**
- **Total : 675 tests**

---

## [2.1.0] - 2026-01-05

### Ajouté
- **Web Workers** : parsing et analyse en arrière-plan
  - Performance 3-5x pour fichiers volumineux
  - Interface fluide sans blocage
- **Rapport qualité** : validation syntaxique et sémantique
- **Analyse chronologique** : détection des incohérences
- **Statistiques avancées** : répartition par siècle, complétude
- **Références orphelines** : identification des liens cassés
- **Score de suspicion** : évaluation des paires douteuses

### Performance
- Triple indexation pour réduction de 99% des comparaisons
- Traitement optimisé pour 7000+ individus

### Tests
- **393 tests statiques**
- **108 tests Vitest**
- **Total : 501 tests**

---

## [2.0.0] - 2025-12-28

### Ajouté
- **Interface complète** avec onglets thématiques
- **16 champs systématiques** affichés pour chaque personne
- **18 critères de comparaison** pour la détection des doublons
- **Matching phonétique français** : Soundex adapté
- **40+ variantes orthographiques** de prénoms français
- **Export GEDCOM** avec préservation des données (rawLines)
- **Contrôles d'intégrité** avant fusion

### Modifié
- Refonte complète de l'interface utilisateur
- Amélioration de la détection des doublons

---

## [1.9.5] - 2025-12-20

### Ajouté
- Parsing étendu DATE/PLAC
- Critères anti-faux-positifs
- Amélioration algorithme de fusion

---

## [1.9.0] - 2025-12-15

### Ajouté
- Suggestions IA pour la détection
- Interface 4 onglets
- Bouton flottant d'actions

---

## [1.0.0] - 2025-12-10

### Initial
- Parsing de fichiers GEDCOM
- Détection basique des doublons par nom
- Interface minimaliste
- Export des résultats
