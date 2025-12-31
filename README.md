# GEDCOM Merger v2.0.0

Application de fusion de doublons dans les fichiers GEDCOM pour la généalogie.

## 🎯 Nouveautés v2.0.0 : Préservation complète des données

### Le principe fondamental
> **Aucune donnée GEDCOM ne doit être perdue lors de la fusion**

### Ce qui change

| Avant v2.0.0 | Après v2.0.0 |
|--------------|--------------|
| ~15 tags parsés | TOUS les tags préservés |
| SOUR/NOTE perdues à la fusion | SOUR/NOTE combinées |
| Tags custom ignorés | Tags _TAG préservés |
| Événements EVEN perdus | EVEN conservés |

### Nouvelles structures de données

```javascript
// Chaque personne stocke maintenant :
{
  // Champs parsés pour détection (inchangés)
  id, names, birth, birthPlace, death, ...
  
  // NOUVEAU: Lignes brutes pour préservation totale
  rawLines: [],           // Toutes les lignes GEDCOM
  rawLinesByTag: {        // Indexées par tag
    'SOUR': [...],        // Sources
    'NOTE': [...],        // Notes
    'OBJE': [...],        // Médias
    '_MYPROP': [...]      // Tags custom
  }
}
```

## 📦 Installation

```bash
# 1. Extraire le ZIP
unzip gedcom-v2.0.0.zip
cd gedcom-v2.0.0

# 2. Installer les dépendances
npm install

# 3. Lancer les tests
npm test
# Attendu: 295/295 tests passés (100%)

# 4. Build production
npm run build
```

## 🚀 Déploiement Netlify

Le fichier `netlify.toml` est configuré pour :
1. Exécuter les 295 tests
2. Builder seulement si tous les tests passent
3. Publier le dossier `dist`

## 🧪 Tests

- **295 tests** répartis en 22 niveaux + 6 bonus
- Nouveau **BONUS F** : 18 tests pour la préservation des données v2.0.0

| Catégorie | Tests |
|-----------|-------|
| Niveaux 1-22 | 207 |
| Bonus A-E (v1.9.5) | 60 |
| **Bonus F (v2.0.0)** | **18** |
| **Total** | **295** |

## 📋 Workflow Git

```bash
# Développement sur branche dev
git checkout dev
git add . && git commit -m "feat: description"
git push origin dev

# Production (après validation)
git checkout main
git merge dev
git push origin main
```

## 🔗 Liens

- **Production** : https://gedcom-merger.netlify.app
- **Dev** : https://dev--gedcom-merger.netlify.app
- **GitHub** : https://github.com/RemyRider/gedcom-merger

## 📖 Documentation

- `CHANGELOG.md` : Historique des versions
- `DEPLOIEMENT.md` : Guide de déploiement
- `LIVRAISON_V2_0_0.md` : Notes de cette version
- `RAPPORT_TESTS_V2_0_0.md` : Résultats des tests

## 🛠️ Stack technique

| Composant | Technologie |
|-----------|-------------|
| Framework | React 18 |
| Build | Vite 5 + esbuild |
| CSS | Tailwind CSS 3.4 |
| Icônes | Lucide React |
| Tests | Node.js natif |
| Hébergement | Netlify |
