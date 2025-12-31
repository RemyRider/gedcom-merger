# 🚀 Fusionneur GEDCOM v1.9.5 - Guide de démarrage rapide

Bienvenue dans votre package complet pour le déploiement sur Netlify du Fusionneur de Doublons GEDCOM version 1.9.5.

## ✨ Nouveautés v1.9.5 : Fusion Intelligente

Cette version apporte une amélioration majeure de l'algorithme de fusion. Le système ne se contente plus de remplacer les références, il **combine intelligemment les données** des deux personnes fusionnées. Si une personne a une date de naissance et l'autre une date de décès, le résultat fusionné conserve les deux informations. Les noms alternatifs sont préservés avec le marqueur TYPE aka, et une note de traçabilité est automatiquement ajoutée pour documenter l'origine des données fusionnées.

### Corrections critiques
- **Parser DATE/PLAC niveau 2** : Correction d'un bug critique où les dates SOURCE écrasaient les dates de naissance/décès
- **Déduplication CHIL** : Les enfants dupliqués dans les familles sont automatiquement nettoyés après fusion

## 📦 Contenu du package

Ce fichier ZIP contient l'intégralité de votre application professionnelle prête pour le déploiement :

### Fichiers sources
| Fichier | Description |
|---------|-------------|
| `src/App.jsx` | Composant React principal (~88 KB) avec fusion intelligente |
| `src/main.jsx` | Point d'entrée React |
| `src/index.css` | Styles Tailwind CSS |
| `index.html` | Page HTML avec version 1.9.5 |

### Configuration
| Fichier | Description |
|---------|-------------|
| `package.json` | Dépendances et scripts (version 1.9.5) |
| `vite.config.js` | Configuration Vite avec esbuild (pas Terser !) |
| `netlify.toml` | Configuration Netlify avec tests automatiques |
| `tailwind.config.js` | Configuration Tailwind CSS |
| `postcss.config.js` | Configuration PostCSS |

### Tests et documentation
| Fichier | Description |
|---------|-------------|
| `tests/test-complete.cjs` | Suite complète de 266 tests |
| `README.md` | Documentation complète |
| `CHANGELOG.md` | Historique des versions |
| `DEPLOIEMENT.md` | Guide de déploiement |
| `ETAT_DES_LIEUX.md` | État complet du projet |
| `LIVRAISON_V1_9_5.md` | Notes de cette version |
| `RAPPORT_TESTS_V1_9_5.md` | Résultats des tests |

## 🎯 Démarrage rapide en 4 étapes

### Étape 1 : Extraction et installation

```bash
# Extraire le ZIP
unzip gedcom-v1.9.5-fusion.zip
cd gedcom-v1.9.5-fusion

# Installer les dépendances (~150 MB)
npm install
```

### Étape 2 : Exécuter les tests

```bash
npm test
```

**Résultat attendu** : `🎉 SUCCÈS TOTAL: 266/266 tests passés (100%)`

⚠️ **Important** : Ne passez à l'étape suivante que si tous les tests passent !

### Étape 3 : Construction de la version de production

```bash
npm run build
```

Cette commande génère un dossier `dist` contenant l'application optimisée (~220 KB total).

### Étape 4 : Déploiement sur Netlify

**Option A - Glisser-déposer (rapide)**
1. Rendez-vous sur https://app.netlify.com/drop
2. Glissez-déposez le dossier `dist` complet
3. Votre application est en ligne en 30 secondes !

**Option B - GitHub + Auto-deploy (recommandé)**
Consultez le fichier `GUIDE_DEPLOIEMENT_AUTO.md` pour configurer un déploiement automatique à chaque commit.

## 📊 Structure des 266 tests

| Catégorie | Tests | Description |
|-----------|-------|-------------|
| Niveaux 1-10 | 107 | Core (syntaxe, React, GEDCOM) |
| Niveaux 11-15 | 37 | Interface (onglets, actions) |
| Niveaux 16-20 | 33 | Intégrité et boutons |
| Niveau 21 | 10 | Anti-régression UI |
| **Niveau 22** | **10** | **Fonctionnalités v1.9.5** |
| Bonus A | 17 | Documentation |
| Bonus B | 12 | Responsive et UX |
| Bonus C | 8 | Statistiques |
| Bonus D | 8 | Parsing étendu |
| **Bonus E** | **12** | **Algorithme de fusion** |

## 🔧 Fonctionnalités principales

### Fusion intelligente (NOUVEAU v1.9.5)
- `mergePersonData()` : Combine les données des 2 personnes
- `generateMergedIndiLines()` : Génère un bloc INDI complet
- Déduplication automatique des CHIL
- Traçabilité avec NOTE de fusion
- Support des clusters (fusion en chaîne)

### Détection de doublons
- Algorithme Soundex français
- Triple indexation (phonétique, année, parents)
- Scoring hybride 11 critères
- Anti-faux-positifs (critères suffisants obligatoires)
- Détection de clusters (3+ personnes)

### Interface utilisateur
- 4 onglets : Clusters, Doublons, À supprimer, IA
- Prévisualisation des fusions
- Bouton flottant pour actions rapides
- Filtrage par score et recherche

### Parsing GEDCOM
- DATE/PLAC niveau 2 strict (correction bug critique)
- Parsing étendu : baptême, inhumation, résidence, titre
- Gestion CONT/CONC
- Conformité GEDCOM 5.5.1

## 📖 Pour aller plus loin

### Développement local
```bash
npm run dev
# Application accessible sur http://localhost:5173
```

### Workflow Git recommandé
```bash
# Développement sur branche dev
git checkout dev
git add . && git commit -m "feat: description"
git push origin dev

# Production après validation
git checkout main
git merge dev
git push origin main
```

## 🔒 Sécurité et confidentialité

L'application fonctionne **entièrement dans votre navigateur** :
- Aucune donnée envoyée vers un serveur externe
- Tous les traitements sont locaux
- Le fichier GEDCOM original reste inchangé
- Les données sont effacées à la fermeture de l'onglet

## 📞 Support

| Document | Contenu |
|----------|---------|
| `README.md` | Documentation complète |
| `CHANGELOG.md` | Historique v1.0.0 → v1.9.5 |
| `DEPLOIEMENT.md` | Guide de déploiement |
| `ETAT_DES_LIEUX.md` | État complet du projet |

**Liens utiles** :
- Production : https://gedcom-merger.netlify.app
- Développement : https://dev--gedcom-merger.netlify.app
- GitHub : https://github.com/RemyRider/gedcom-merger

---

Bon nettoyage de votre arbre généalogique ! 🌳

*Version 1.9.5 - 31 décembre 2025*
