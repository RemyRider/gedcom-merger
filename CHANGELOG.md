# Changelog - Fusionneur GEDCOM

## Version 1.9.4 (30 décembre 2025) - ACTUELLE

### Régressions corrigées

Cette version corrige plusieurs régressions identifiées depuis la v1.7.2 et restaure des fonctionnalités clés.

**Affichage détail complet restauré (régression v1.7.2)**

L'onglet Suggestions IA affiche désormais les cartes complètes avec toutes les informations disponibles pour chaque personne. Chaque carte inclut le nom en gras avec l'identifiant GEDCOM, les dates et lieux de naissance et de décès, le sexe, et la liste des parents avec leurs noms résolus. Cette présentation enrichie permet une évaluation rapide de la pertinence des suggestions.

Le tableau des clusters affiche maintenant neuf colonnes complètes incluant le lieu de naissance, le sexe et les parents. Les colonnes Parents et Conjoints affichent les prénoms abrégés pour une lecture rapide tout en conservant l'accès à l'information complète.

**Contrôle d'intégrité 8 types restauré (v1.6.1)**

Le système de validation GEDCOM analyse désormais huit types de problèmes distincts. La vérification des liens familiaux bidirectionnels s'assure que chaque relation parent-enfant et conjoint est correctement référencée dans les deux sens. La détection des dates incohérentes identifie les cas de naissance après décès, de parent né après son enfant, et les écarts d'âge suspects entre parents et enfants.

L'analyse des boucles généalogiques détecte les situations impossibles où une personne serait son propre ancêtre. La vérification de la structure GEDCOM valide les niveaux hiérarchiques et l'imbrication des balises. La détection des références orphelines identifie les pointeurs vers des identifiants inexistants. La détection des identifiants dupliqués signale les violations d'unicité.

L'identification des personnes isolées compte les individus sans connexion familiale. Le calcul du score de complétude évalue la richesse des données pour chaque individu avec un score global exprimé en pourcentage.

Une nouvelle modal d'intégrité accessible depuis le header affiche le rapport complet avec statistiques, liste des erreurs critiques et avertissements, et indicateurs visuels colorés selon la gravité.

### Nouvelles fonctionnalités

**Boutons de sélection dynamiques**

Les boutons "Sélectionner ≥X%" dans les onglets Clusters et Doublons affichent désormais dynamiquement la valeur du filtre actuel. Lorsque l'utilisateur ajuste le slider de score minimum, le texte du bouton se met à jour pour refléter le nouveau seuil. La logique de sélection utilise également cette valeur dynamique, permettant une sélection précise selon le niveau de confiance souhaité.

**Bouton Recommencer dans le header**

Le bouton permettant de recommencer le traitement avec un nouveau fichier a été déplacé du bas de la page vers le header principal. Cette position persistante permet un accès immédiat à tout moment du workflow sans nécessiter de défilement. Le bouton utilise l'icône RefreshCw et reste visible dès qu'un fichier a été chargé.

### Améliorations techniques

L'icône Shield a été ajoutée aux imports Lucide pour le bouton d'intégrité dans le header. La modal d'intégrité utilise un code couleur adaptatif selon le nombre d'erreurs et d'avertissements détectés.

---

## Version 1.9.3 (28 décembre 2025)

### Onglet À supprimer

L'onglet précédemment nommé "Isolés" a été renommé "À supprimer" avec un filtrage plus strict. Les personnes affichées sont soit totalement isolées (sans parents, sans enfants, sans conjoints), soit sans identité (pas de nom ou nom vide). Cette distinction permet de cibler précisément les entrées à nettoyer.

### Bouton flottant

Un bouton d'action flottant positionné en bas à droite de l'écran permet d'exécuter rapidement les fusions et suppressions sélectionnées sans avoir à remonter en haut de la page. Le bouton affiche dynamiquement le nombre d'éléments sélectionnés et adapte son libellé selon le type d'action.

### Tableau clusters détaillé

Le tableau affiché lors de l'expansion d'un cluster contient neuf colonnes avec les informations complètes de chaque personne du groupe. Les statistiques incluent le nombre de personnes avec date de naissance connue, avec date de décès connue, et le nombre de paires liées.

### Actions distinctes

Les actions de fusion et de suppression sont clairement séparées avec des boutons et compteurs distincts. L'écran de résultats affiche séparément le nombre de fusions effectuées et le nombre de suppressions.

---

## Version 1.9.2 (28 décembre 2025)

### Algorithme anti-faux-positifs

Correction majeure de l'algorithme de détection des doublons pour éliminer les faux positifs. La nouvelle règle métier exige qu'au-delà de la correspondance du nom et du sexe compatible, au moins un critère suffisant soit présent parmi les suivants : date ou année de naissance, lieu de naissance, parents communs, conjoints communs, fratrie commune, date de décès, ou profession.

Les paires ne présentant que des noms identiques et sexes compatibles sans aucun autre critère confirmant sont désormais rejetées avec le message explicatif "Aucun critère suffisant". Le champ sufficientCriteria est ajouté à chaque paire pour tracer les critères validants.

---

## Version 1.8.7 (24 décembre 2025)

### Restauration fonctionnalités

Restauration du bouton Changelog avec modal complète affichant l'historique des versions. Restauration du système d'onglets Clusters et Doublons simples. Ajout du scoring moyen des clusters avec jauges visuelles colorées. Ajout du filtre pourcentage minimum pour les clusters. Ajout de la sélection automatique des clusters à haute confiance.

---

## Version 1.8.6 (16 décembre 2025)

### Corrections GEDCOM

Correction de la gestion des balises CONT et CONC pour les champs multi-lignes. Génération automatique de l'en-tête HEAD complet si manquant. Génération automatique de la balise TRLR de fin si manquante. Amélioration de la compatibilité avec les logiciels de généalogie tiers.

---

## Version 1.6.1 (11 décembre 2025)

### Contrôle d'intégrité avancé

Première implémentation du système de validation GEDCOM à huit types de vérifications. Interface utilisateur enrichie avec tableau de bord statistique et jauges colorées. Architecture technique validée avec React, Vite et esbuild.

---

## Version 1.0.0 (1 décembre 2025)

### Version initiale

Parseur GEDCOM complet supportant le format 5.5.1. Détection intelligente des doublons avec Soundex français adapté. Système de scoring hybride évaluant neuf critères pondérés. Triple indexation réduisant de plus de 99% le nombre de comparaisons. Fusion sécurisée préservant les données les plus complètes. Interface React moderne et responsive.
