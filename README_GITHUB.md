# 🌳 Fusionneur de Doublons GEDCOM v1.8.6

Application web React pour détecter et fusionner automatiquement les doublons dans les fichiers GEDCOM (généalogie).

## 🚀 Démo

**Application déployée :** https://gedcom-merger.netlify.app

[![Netlify Status](https://api.netlify.com/api/v1/badges/1aa171e6-af46-4f54-8e9c-6af0f1dfa1da/deploy-status)](https://app.netlify.com/sites/gedcom-merger/deploys)

## ✨ Fonctionnalités

- 🔍 **Détection intelligente** : 9 critères pondérés (noms, dates, lieux, relations)
- 📊 **Scoring hybride** : Pourcentage basé sur les données disponibles
- 🔗 **Détection de clusters** : Identifie les groupes de 3+ personnes interconnectées
- 👁️ **Prévisualisation** : Voir le résultat avant de fusionner
- 🚀 **Performance** : Triple indexation pour traiter des milliers d'individus
- 📱 **Responsive** : Fonctionne sur desktop, tablette et mobile
- 🔒 **Confidentialité** : Traitement 100% local dans le navigateur

## 🛠️ Technologies

- React 18.3
- Vite 5.4
- Tailwind CSS 3.4
- Lucide React (icônes)

## 🔧 Installation locale

```bash
# Cloner le repo
git clone https://github.com/VOTRE_USERNAME/gedcom-merger.git
cd gedcom-merger

# Installer les dépendances
npm install

# Lancer en dev
npm run dev

# Build pour production
npm run build
```

## 📦 Version actuelle

**v1.8.6** - 16 décembre 2025

### Nouveautés v1.8.6
- ✅ Correction du parsing CONT/CONC (lignes de continuation)
- ✅ Génération automatique des balises HEAD et TRLR manquantes
- ✅ Système multi-onglets avec sélection globale
- ✅ Optimisation des performances (triple indexation)

Voir [CHANGELOG.md](CHANGELOG.md) pour l'historique complet.

## 📄 Licence

MIT - Libre d'utilisation et de modification

## 👤 Auteur

Développé par Rémiol - Business Analyst & Développeur

## 🐛 Bugs / Suggestions

Ouvrez une issue sur GitHub ou contactez-moi directement.

---

**⭐ Si ce projet vous aide, n'hésitez pas à lui donner une étoile !**
