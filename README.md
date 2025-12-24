# Fusionneur de Doublons GEDCOM v1.8.7

Application web React pour détecter et fusionner intelligemment les doublons dans vos fichiers GEDCOM.

## 🎯 Nouveautés de la v1.8.7

**Cette version restaure toutes les fonctionnalités manquantes identifiées comme régressions :**

- ✅ **Bouton Changelog/Nouveautés** : Accessible depuis le header avec modal complète
- ✅ **Système d'onglets** : Navigation claire entre Clusters et Doublons simples
- ✅ **Scoring des clusters** : Affichage du score moyen avec jauges visuelles colorées
- ✅ **Filtre pourcentage clusters** : Slider pour filtrer par score minimum
- ✅ **Sélection auto ≥95%** : Bouton pour sélectionner automatiquement les clusters haute confiance

## 🚀 Fonctionnalités principales

### Détection intelligente
- Parser GEDCOM complet (INDI, FAM, relations)
- Algorithme Soundex adapté au français
- 9 critères de similarité pondérés
- Triple indexation pour performances optimales (99% réduction comparaisons)
- Détection automatique des clusters (groupes de 3+ personnes)

### Organisation par onglets
- **Onglet Clusters** : Groupes de personnes interconnectées avec score moyen
- **Onglet Doublons simples** : Paires de doublons classiques

### Interface intuitive
- Prévisualisation complète avant fusion
- Filtres par score et recherche nom/ID
- Sélection rapide haute confiance (≥95%)
- Compteurs et statistiques en temps réel

### Fusion sécurisée
- Enrichissement automatique sans perte de données
- Export GEDCOM nettoyé
- Statistiques avant/après

## 📦 Installation

```bash
npm install
npm run dev
```

## 🌐 Déploiement Netlify

1. Glissez-déposez le dossier sur https://app.netlify.com/drop
2. Ou connectez votre repo GitHub pour déploiement continu

## 🔒 Sécurité

- Traitement 100% côté client (aucun serveur)
- Aucune donnée envoyée
- Protection XSS automatique (React)
- Headers sécurité configurés (Netlify)

## 📝 Technologies

- React 18.3.1
- Vite 5.4.2
- Tailwind CSS 3.4
- Lucide React (icônes)
- esbuild (minification)

## 📄 Licence

Projet personnel - Tous droits réservés
