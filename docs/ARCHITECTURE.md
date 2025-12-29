# Architecture GEDCOM Merger v1.9.3

## Vue d'ensemble

Application React monopage (SPA) pour la détection et fusion de doublons dans les fichiers GEDCOM.

## Stack technique

- **Frontend** : React 18 + Vite 5
- **Styling** : Tailwind CSS 3
- **Icônes** : Lucide React
- **Build** : esbuild (minification)
- **Déploiement** : Netlify

## Composants principaux

### App.jsx (~2000 lignes)

Composant unique contenant :
- Parseur GEDCOM
- Algorithme de détection (Soundex + scoring)
- Interface utilisateur (4 onglets)
- Gestion d'état React (22 états)

## Algorithmes clés

### 1. Soundex français
Encodage phonétique adapté aux noms français.

### 2. Triple indexation
- Index phonétique (Soundex)
- Index temporel (année naissance)
- Index familial (parents)

Réduit la complexité de O(n²) à ~O(n).

### 3. Scoring hybride (9 critères)
| Critère | Poids |
|---------|-------|
| Nom | 30 |
| Naissance | 25 |
| Parents | 20 |
| Sexe | 15 |
| Fratrie | 15 |
| Décès | 15 |
| Lieu | 10 |
| Conjoints | 8 |
| Profession | 5 |

### 4. Anti-faux-positifs (v1.9.2)
Exige au moins 1 critère suffisant au-delà du nom.

## Flux de données

```
Upload .ged → parseGedcom() → individuals[]
     ↓
findDuplicates() → duplicates[]
     ↓
detectClusters() → clusters[]
     ↓
detectToDeletePersons() → toDeletePersons[]
     ↓
generateAiSuggestions() → smartSuggestions[]
     ↓
Sélection utilisateur
     ↓
downloadCleanedFile() → fichier .ged nettoyé
```

## États React (22)

| État | Type | Usage |
|------|------|-------|
| individuals | Array | Personnes parsées |
| duplicates | Array | Paires détectées |
| clusters | Array | Groupes 3+ |
| toDeletePersons | Array | À supprimer |
| smartSuggestions | Array | Suggestions IA |
| selectedPairs | Set | Sélection doublons |
| selectedToDelete | Set | Sélection isolés |
| activeTab | String | Onglet actif |
| ... | | |
