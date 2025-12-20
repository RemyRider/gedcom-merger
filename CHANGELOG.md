# Historique des versions

## [1.8.6] - 2025-12-16

### 🎉 Nouvelle version de production

Cette version consolide toutes les fonctionnalités avancées développées depuis la v1.3.0 et prépare le terrain pour les évolutions futures.

#### ✨ Fonctionnalités majeures

- **Système de prévisualisation complet** : Visualisation détaillée avant/après fusion
- **Détection automatique des clusters** : Identification des groupes de 3+ personnes interconnectées
- **Calcul de qualité des données** : Sélection automatique du meilleur enregistrement
- **Enrichissement automatique** : Ajout des données manquantes lors de la fusion
- **Interface enrichie** : Badges visuels pour les données ajoutées

#### 🚀 Optimisations

- **Triple indexation** : Phonétique + Année + Parents pour 99%+ de réduction
- **Build optimisé** : esbuild pour minification rapide
- **Code splitting** : Découpage intelligent react-vendor + lucide
- **Cache optimisé** : Headers immutable pour assets
- **Source maps désactivées** : Réduction taille du bundle

#### 🔧 Configuration

- **Netlify ready** : netlify.toml avec tous les headers de sécurité
- **Vite 5.4** : Configuration de build optimale
- **Tailwind 3.4** : Styles responsives complets
- **React 18.3** : Hooks modernes et performances

#### 📊 Critères de scoring

- Système hybride relatif (score / max possible)
- 9 critères pondérés (noms, dates, lieux, relations)
- Soundex phonétique adapté au français
- Sexe comme critère éliminatoire

#### 🎨 Interface utilisateur

- Design professionnel gradient indigo/bleu
- Responsive mobile/tablette/desktop
- Recherche et filtrage avancés
- Sélection groupée par cluster
- Modal de prévisualisation détaillée
- Progression animée de l'analyse

## [1.3.0] - 2025-12-04

### Version de référence sanctuarisée

- Première version stable complète
- Documentation exhaustive
- Package Netlify ready
- Correction erreur Terser (passage à esbuild)

## [1.0.0] - 2025-12-01

### Version initiale

- Parseur GEDCOM complet
- Détection de doublons basique
- Interface responsive
- Export fichier nettoyé

---

**Format** : Ce CHANGELOG suit les conventions [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)

**Versioning** : Ce projet suit le [Semantic Versioning](https://semver.org/lang/fr/)
