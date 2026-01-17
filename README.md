# GEDCOM Merger v2.4.0

Application React de détection et fusion de doublons dans les fichiers GEDCOM, optimisée pour le nettoyage des arbres généalogiques MyHeritage.

## Fonctionnalités

### Détection des doublons
- **18 critères de comparaison** : noms, dates, lieux, relations familiales
- **Matching phonétique français** : Soundex adapté (Catherine/Katherine, Jean/Jehan)
- **40+ variantes orthographiques** : prénoms français historiques
- **Score de similarité** : 0-100 avec seuils configurables

### Analyse et qualité
- **Rapport qualité** : validation syntaxique et sémantique
- **Analyse chronologique** : détection des incohérences temporelles
- **Statistiques détaillées** : répartition par siècle, complétude des données
- **Références orphelines** : identification des liens cassés
- **Score de suspicion** : évaluation des paires douteuses

### Fusion intelligente (v2.4.0)
- **Fusion guidée contextuelle** : assistant automatique pour les doublons liés
- **Approche Bottom-Up** : enfants → conjoints → parents
- **Détection des conflits** : parents, conjoints, enfants avec alertes visuelles
- **Préservation des données** : système rawLines pour zéro perte d'information

### Normalisation géographique (v2.2.0+)
- **API Géo française** : autocomplétion temps réel
- **Saisie manuelle** : pour les lieux étrangers ou historiques
- **Format standardisé** : Ville, Département, Région, Pays

### Performance
- **Web Workers** : traitement asynchrone pour fichiers volumineux
- **Triple indexation** : réduction de 99% des comparaisons
- **Interface fluide** : pas de blocage UI pendant l'analyse

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/RemyRider/gedcom-merger.git
cd gedcom-merger

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build production
npm run build
```

## Tests

```bash
# Tests statiques (557 tests)
npm run test:static

# Tests Vitest (225 tests)
npm run test

# Tous les tests
npm run test:all
```

## Structure du projet

```
src/
├── App.jsx                 # Composant principal (~4750 lignes)
├── utils/
│   └── fusionOrder.mjs     # Module de fusion intelligente
├── index.css               # Styles Tailwind
└── main.jsx                # Point d'entrée

public/
└── gedcom-worker.js        # Web Worker pour parsing

tests/
└── test-complete.cjs       # 557 tests statiques
```

## Configuration

### Netlify
Le projet utilise Netlify avec déploiement automatique :
- **dev** : https://dev--gedcom-merger.netlify.app
- **main** : https://gedcom-merger.netlify.app

### Configuration critique
```javascript
// postcss.config.cjs et tailwind.config.cjs
// DOIVENT utiliser CommonJS (module.exports), pas ESM
module.exports = { /* ... */ }
```

## Versions

| Version | Date | Nouveautés |
|---------|------|------------|
| 2.4.0 | Jan 2026 | Fusion guidée contextuelle, approche Bottom-Up |
| 2.3.0 | Jan 2026 | Module fusionOrder, graphe de dépendances |
| 2.2.0 | Jan 2026 | Normalisation lieux, conflits relationnels |
| 2.1.0 | Jan 2026 | Web Workers, rapport qualité, statistiques |
| 2.0.0 | Jan 2026 | Interface complète, 16 champs systématiques |
| 1.0.0 | Déc 2025 | Version initiale |

## Licence

MIT

## Auteur

Rémiol - Business Analyst / Développeur
