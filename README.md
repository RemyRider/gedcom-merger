# GEDCOM Merger v2.0.0

Application web de fusion intelligente de fichiers GEDCOM pour nettoyer les arbres généalogiques.

## Fonctionnalités

### Détection de doublons
- Algorithme de scoring avec **18 critères de comparaison**
- Comparaison phonétique (Soundex) pour les noms
- Variantes de prénoms reconnues (Jean/Johannes, Marie/Maria...)
- Anti-faux-positifs : nom + sexe seuls ne suffisent pas

### 18 Critères de comparaison

| Critère | Points max | Description |
|---------|------------|-------------|
| Noms | 30 | Identiques, phonétiques ou partiels |
| Naissance | 25 | Date exacte ou année |
| Sexe | 15 | Éliminatoire si différent |
| Parents | 20 | 1 ou 2 parents communs (par ID ou nom) |
| Fratrie | 15 | Même famille comme enfant |
| Lieu naissance | 10 | Identique ou similaire |
| Conjoints | 8 | Communs (par ID ou nom) |
| Décès | 15 | Date exacte ou année |
| Lieu décès | 8 | Identique ou similaire |
| Profession | 5 | Identique |
| Enfants | 15 | 1 ou 2+ communs (par ID ou nom) |
| Baptême | 5 | Date exacte ou année |
| Lieu baptême | 4 | Identique ou similaire |
| Inhumation | 5 | Date exacte ou année |
| Lieu inhumation | 4 | Identique ou similaire |
| Résidence | 4 | Identique ou similaire |
| Titre | 3 | Identique |
| Religion | 3 | Identique |

**Score maximum possible : 190 points** (si tous les champs renseignés)

### Interface 4 onglets
- **Clusters** : Groupes de doublons interconnectés
- **Doublons** : Paires simples de doublons
- **À supprimer** : Individus isolés ou sans identité
- **IA** : Suggestions basées sur l'analyse de patterns

### Préservation des données (v2.0.0)
- **rawLines[]** : Toutes les lignes GEDCOM originales conservées
- **rawLinesByTag{}** : Indexation par tag (SOUR, NOTE, OBJE, EVEN...)
- **Fusion intelligente** : Sources et notes combinées des 2 personnes
- **Zéro perte** : Les tags inconnus (_TAG) sont préservés

### Affichage complet
16 champs affichés systématiquement dans la prévisualisation :
- ID, Sexe, Naissance, Lieu naissance
- Baptême, Décès, Lieu décès, Inhumation
- Profession, Titre, Résidence, Religion
- Parents, Conjoints, Enfants, Note

## Installation

```bash
npm install
npm run dev
```

## Tests

```bash
npm test
```

**309 tests** répartis en :
- 22 niveaux de tests (207 tests)
- 7 bonus thématiques (88 tests)

| Catégorie | Tests |
|-----------|-------|
| Syntaxe et structure | 10 |
| Versions et cohérence | 10 |
| Imports Lucide-React | 17 |
| États React | 24 |
| Fonctions principales | 12 |
| Interface 4 onglets | 8 |
| Anti-faux-positifs | 8 |
| Contrôle intégrité | 15 |
| ... | ... |
| **Total** | **295** |

## Déploiement

### Option A : Netlify Drag & Drop
```bash
npm run build
# Glisser le dossier dist/ sur Netlify
```

### Option B : GitHub Auto-deploy
```bash
git add .
git commit -m "v2.0.0"
git push origin dev
```

## Liens

- **Production** : https://gedcom-merger.netlify.app
- **Dev** : https://dev--gedcom-merger.netlify.app
- **GitHub** : https://github.com/RemyRider/gedcom-merger

## Licence

MIT
