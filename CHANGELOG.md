# Journal des modifications

## Version 1.8.7 (24 décembre 2025)

### 🔧 Correctifs critiques - Restauration fonctionnalités v1.4.0

Cette version corrige toutes les régressions identifiées suite au déploiement de la v1.8.6.

**Fonctionnalités restaurées :**

- **Bouton Changelog/Nouveautés** : Bouton avec icône Sparkles dans le header permettant d'afficher la modal complète de l'historique des versions
- **Système d'onglets** : Navigation par onglets séparant clairement les Clusters (groupes interconnectés) des Doublons simples (paires)
- **Scoring moyen des clusters** : Calcul et affichage du score moyen de similarité pour chaque cluster avec jauges visuelles colorées (vert ≥95%, jaune 90-94%, orange 80-89%)
- **Filtre pourcentage pour clusters** : Slider permettant de définir le score moyen minimum pour afficher les clusters (défaut 80%)
- **Sélection automatique clusters ≥95%** : Bouton permettant de sélectionner automatiquement tous les clusters ayant un score moyen supérieur ou égal à 95%

**Améliorations techniques :**

- Ajout de l'état `showChangelog` pour gérer l'affichage de la modal
- Ajout de l'état `activeTab` pour la navigation entre onglets
- Ajout de l'état `clusterScoreFilter` pour le filtrage par score
- Ajout de l'état `selectedClusters` pour la sélection groupée
- Fonction `getClusterAverageScore()` pour calculer le score moyen
- Fonction `getFilteredClusters()` pour filtrer selon le score
- Fonction `autoSelectHighConfidenceClusters()` pour la sélection auto ≥95%
- Mise à jour de `detectClusters()` pour calculer et stocker le score moyen
- Constante `CHANGELOG` avec historique complet des versions
- Modal changelog complète avec design professionnel

**Tests effectués :**

- ✅ Affichage du bouton Nouveautés dans le header
- ✅ Ouverture de la modal changelog avec historique complet
- ✅ Navigation entre onglets Clusters/Doublons fonctionnelle
- ✅ Calcul correct du score moyen pour chaque cluster
- ✅ Filtrage des clusters par score moyen minimum
- ✅ Sélection automatique des clusters ≥95%
- ✅ Compatibilité avec toutes les fonctionnalités existantes

---

## Version 1.8.6 (16 décembre 2025)

### Corrections GEDCOM et génération automatique

**Améliorations :**

- Correction gestion balises CONT/CONC multi-lignes
- Génération automatique en-tête HEAD complet
- Génération automatique balise TRLR de fin
- Amélioration compatibilité avec logiciels de généalogie
- Corrections bugs mineurs d'interface

---

## Version 1.4.0 (5 décembre 2025)

### Organisation interface et contrôle intégrité

**Fonctionnalités majeures :**

- Système d'onglets séparant Clusters et Doublons simples
- Scoring moyen des clusters avec jauges visuelles
- Auto-sélection clusters haute confiance (≥95%)
- Filtre pourcentage pour masquer clusters sous seuil
- Contrôle d'intégrité GEDCOM après fusion

---

## Version 1.3.0 (3 décembre 2025)

### Prévisualisation et changelog intégré

**Fonctionnalités :**

- Prévisualisation complète des fusions avec modal
- Calcul automatique qualité des données
- Fusion intelligente avec enrichissement automatique
- Changelog intégré dans l'interface
- Détection automatique des clusters

---

## Version 1.0.0 (1 décembre 2025)

### Version initiale

**Fonctionnalités de base :**

- Parseur GEDCOM complet
- Détection intelligente avec Soundex français
- Système de scoring hybride 9 critères
- Fusion sécurisée sans perte de données
- Interface React moderne et responsive
