# 🌳 Fusionneur GEDCOM v1.8.6

## Application professionnelle de fusion intelligente des doublons GEDCOM

Application React responsive et performante pour nettoyer votre arbre généalogique en détectant et fusionnant intelligemment les doublons dans vos fichiers GEDCOM.

## ✨ Fonctionnalités principales

### Détection intelligente des doublons
- **Scoring hybride relatif** avec 9 critères pondérés
- **Soundex phonétique** adapté aux noms français
- **Triple indexation** pour des performances optimales (99%+ de réduction)
- Détection automatique des **clusters** (3+ personnes interconnectées)

### Prévisualisation complète
- Visualisation avant/après fusion
- Calcul automatique de la qualité des données
- Enrichissement automatique des informations manquantes
- Badges visuels pour les données ajoutées

### Interface professionnelle
- Design responsive (mobile, tablette, desktop)
- Recherche et filtrage avancés
- Sélection groupée par cluster
- Progression détaillée de l'analyse

## 🚀 Démarrage rapide

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Production

```bash
npm run build
```

Les fichiers optimisés seront dans le dossier `dist/`

## 📊 Critères de détection

| Critère | Pondération | Description |
|---------|-------------|-------------|
| Noms | 30 pts | Comparaison exacte et phonétique (Soundex) |
| Date de naissance | 25 pts | Exacte ou année proche (±2 ans) |
| Sexe | 15 pts | **Éliminatoire** si différent |
| Parents | 20 pts | 1 ou 2 parents communs |
| Fratrie | 15 pts | Même famille d'origine |
| Lieu de naissance | 10 pts | Comparaison exacte |
| Conjoints | 8 pts | Conjoints en commun |
| Date de décès | 15 pts | Comparaison exacte |
| Profession | 5 pts | Comparaison exacte |

**Total**: 143 points max - Score calculé en % selon les données disponibles

## 🔒 Sécurité et confidentialité

- ✅ Traitement **100% local** dans votre navigateur
- ✅ Aucune donnée envoyée vers un serveur externe
- ✅ Fichier original **jamais modifié**
- ✅ Nouveau fichier généré pour chaque export
- ✅ Headers de sécurité Netlify configurés

## 📦 Technologies

- **React 18.3** - Framework UI moderne
- **Vite 5.4** - Build tool ultra-rapide
- **Tailwind CSS 3.4** - Styles responsives
- **Lucide React** - Icônes professionnelles
- **esbuild** - Minification optimale

## 🎯 Performance

- **Triple indexation** : Phonétique + Année + Parents
- **Réduction > 99%** des comparaisons nécessaires
- **Analyse rapide** de fichiers avec milliers d'individus
- **Build optimisé** : Code splitting, cache immutable

## 📝 Version 1.8.6

Cette version apporte toutes les fonctionnalités avancées :

- ✨ Système de prévisualisation des fusions
- 🔗 Détection automatique des clusters
- 📊 Calcul de qualité des données
- 🎨 Interface enrichie avec badges visuels
- ⚡ Optimisations de performance
- 🔧 Configuration Netlify complète

## 📄 Licence

Application développée pour un usage personnel en généalogie.

## 🙋 Support

Pour toute question ou problème :
1. Consultez la documentation complète
2. Vérifiez le CHANGELOG.md
3. Consultez les logs de build Netlify

---

**Fusionneur GEDCOM v1.8.6** - Nettoyez votre arbre généalogique avec intelligence ! 🌳
