# 🔍 Analyse Complète du Processus de Fusion - GEDCOM Merger v2.4.0

## Vue d'ensemble du flux

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                      PROCESSUS DE FUSION GEDCOM v2.4.0                         │
└────────────────────────────────────────────────────────────────────────────────┘

     FICHIER GEDCOM                    APPLICATION                    FICHIER FUSIONNÉ
    ┌─────────────┐                                                  ┌─────────────┐
    │ sample.ged  │                                                  │ fusionne.ged│
    │ (original)  │                                                  │  (nettoyé)  │
    └──────┬──────┘                                                  └──────▲──────┘
           │                                                                │
           ▼                                                                │
    ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌───────┴──────┐
    │   PARSING    │────▶│  DÉTECTION   │────▶│  SÉLECTION   │────▶│   FUSION     │
    │   GEDCOM     │     │  DOUBLONS    │     │  UTILISATEUR │     │   GUIDÉE     │
    └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
           │                    │                    │                    │
           ▼                    ▼                    ▼                    ▼
    ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
    │ individuals[]│     │ duplicates[] │     │selectedPairs │     │ BOTTOM-UP    │
    │ families[]   │     │ clusters[]   │     │  Set<id>     │     │ Enfants →    │
    │ familiesData │     │ depGraph{}   │     │ conflicts[]  │     │ Conjoints →  │
    └──────────────┘     └──────────────┘     └──────────────┘     │ Parents      │
                                                                   └──────────────┘
```

---

## Étape 1 : PARSING GEDCOM

### Fonction : `processGedcom(content)`

**Entrée** : Texte brut du fichier GEDCOM

**Traitement** :
```
Pour chaque ligne:
  Si "0 @Ixxx@ INDI" → Nouvelle personne
  Si "1 NAME" → Ajouter aux noms[]
  Si "1 SEX" → Définir sexe
  Si "1 BIRT" → Activer contexte naissance
    Si "2 DATE" → Date de naissance
    Si "2 PLAC" → Lieu de naissance
  Si "1 DEAT" → Activer contexte décès
  Si "1 FAMC @Fxxx@" → Ajouter famille comme enfant
  Si "1 FAMS @Fxxx@" → Ajouter famille comme conjoint
  ...
```

**Sortie** : `individuals[]` avec structure :
```javascript
{
  id: "I504017",
  names: ["Hugues /Berger/"],
  sex: "M",
  birth: "19 SEP 1726",
  birthPlace: "Grenoble, Isère",
  death: "5 MAR 1789",
  deathPlace: "Lyon",
  baptism: null,
  burial: null,
  occupation: "Notaire",
  parents: ["I503001", "I503002"],
  spouses: ["I504018"],
  children: ["I504050", "I504051"],
  familyAsChild: "F501",
  familiesAsSpouse: ["F502"],
  rawLines: [...],          // v2.0.0: Toutes les lignes GEDCOM
  rawLinesByTag: {...}      // v2.0.0: Lignes indexées par tag
}
```

---

## Étape 2 : DÉTECTION DES DOUBLONS

### Fonction : `findDuplicates(people)`

**Stratégie : Triple indexation O(n)**
```
Index 1: Phonétique (Soundex français)
  Clé: soundex(prénom) + "-" + soundex(nom)
  Ex: "J500-D000" → tous les Jean Dupont, Johan Dupon...

Index 2: Année de naissance (±5 ans)
  Clé: année
  Ex: "1726" → personnes nées 1721-1731

Index 3: Parents communs
  Clé: ID parent
  Ex: "I503001" → tous les enfants de cette personne
```

**Comparaison** : Seulement entre personnes du même "bucket"

### Fonction : `calculateSimilarity(person1, person2)`

**18 critères de scoring** (v2.0.0+) :

| Critère | Points max | Suffisant? |
|---------|------------|------------|
| Noms identiques | 20-35* | Non |
| Date naissance | 25 | Oui |
| Sexe identique | 15 | Non (éliminatoire si différent) |
| Parents communs | 20 | Oui |
| Fratrie | 15 | Oui |
| Lieu naissance | 10 | Oui |
| Conjoints communs | 8 | Oui |
| Date décès | 15 | Oui |
| Lieu décès | 8 | Oui |
| Profession | 5 | Oui |
| Enfants communs | 15 | Oui |
| Baptême | 5 | Non |
| Lieu baptême | 4 | Non |
| Inhumation | 5 | Non |
| Lieu inhumation | 4 | Non |
| Résidence | 4 | Non |
| Titre | 3 | Non |
| Religion | 3 | Non |
| **Total possible** | **~190** | |

*v2.2.6: Pondération dynamique selon la rareté du nom

---

## Étape 3 : GRAPHE DE DÉPENDANCES (v2.3.0+)

### Module : `fusionOrder.mjs`

**Constantes de niveaux** :
```javascript
FUSION_LEVELS = {
  CHILDREN: 0,      // Fusionner EN PREMIER
  SPOUSES: 1,       // Fusionner ENSUITE
  PARENTS: 2,       // Fusionner EN DERNIER
  INDEPENDENT: 3    // Sans dépendances
}
```

### Fonction : `buildDependencyGraph(duplicates, individuals)`

Pour chaque paire de doublons, détecte :
- `childDuplicates[]` : Paires d'enfants qui sont aussi des doublons
- `spouseDuplicates[]` : Paires de conjoints qui sont aussi des doublons
- `parentDuplicates[]` : Paires de parents qui sont aussi des doublons

**Structure d'un nœud** :
```javascript
{
  pairId: 'I001-I002',
  pair: { person1, person2, score },
  persons: ['I001', 'I002'],
  dependsOn: [...childDuplicates, ...spouseDuplicates],  // À fusionner AVANT
  blocks: [...parentDuplicates],                          // À fusionner APRÈS
  hasChildDuplicates: true,
  hasSpouseDuplicates: false,
  hasParentDuplicates: true
}
```

### Approche Bottom-Up (v2.4.0)

```
┌─────────────────────────────────────────────────────┐
│                   PARENTS (niveau 2)                │
│               Fusionner EN DERNIER                  │
│                   Grand-père A ↔ Grand-père B       │
└─────────────────────────┬───────────────────────────┘
                          │ dépend de
                          ▼
┌─────────────────────────────────────────────────────┐
│                  CONJOINTS (niveau 1)               │
│                  Fusionner ENSUITE                  │
│                    Père A ↔ Père B                  │
└─────────────────────────┬───────────────────────────┘
                          │ dépend de
                          ▼
┌─────────────────────────────────────────────────────┐
│                   ENFANTS (niveau 0)                │
│               Fusionner EN PREMIER                  │
│                   Enfant A ↔ Enfant B               │
└─────────────────────────────────────────────────────┘
```

**Raison** : En fusionnant les enfants d'abord, on évite les références cassées quand on fusionne ensuite les parents.

---

## Étape 4 : FUSION GUIDÉE CONTEXTUELLE (v2.4.0) 🆕

### Déclenchement

Quand l'utilisateur clique sur "Fusionner" pour une paire :

```javascript
const handleMerge = (pair) => {
  // Détecter les doublons liés
  const related = detectRelatedDuplicates(pair, duplicates, individuals);
  
  if (related.hasRelatedDuplicates) {
    // Afficher l'assistant de fusion guidée
    setGuidedFusionContext({
      mainPair: pair,
      parents: related.parents,
      spouses: related.spouses,
      children: related.children,
      recommendedOrder: related.recommendedOrder
    });
    setShowGuidedFusionModal(true);
  } else {
    // Fusion directe (pas de doublons liés)
    executeMerge(pair);
  }
};
```

### Fonction : `detectRelatedDuplicates(pair, duplicates, individuals)`

**Entrée** : 
- `pair` : La paire de doublons sélectionnée
- `duplicates` : Toutes les paires de doublons détectées
- `individuals` : Liste des personnes

**Traitement** :
```javascript
// 1. Récupérer les deux personnes
const person1 = individuals.find(p => p.id === pair.person1.id);
const person2 = individuals.find(p => p.id === pair.person2.id);

// 2. Collecter toutes les relations
const allParentIds = [...person1.parents, ...person2.parents];
const allSpouseIds = [...person1.spouses, ...person2.spouses];
const allChildIds = [...person1.children, ...person2.children];

// 3. Chercher des doublons parmi ces relations
const parentDuplicates = findDuplicatesAmongIds(allParentIds, duplicates);
const spouseDuplicates = findDuplicatesAmongIds(allSpouseIds, duplicates);
const childDuplicates = findDuplicatesAmongIds(allChildIds, duplicates);
```

**Sortie** :
```javascript
{
  hasRelatedDuplicates: true,
  parents: [{ pairId, person1, person2, score, level }],
  spouses: [{ pairId, person1, person2, score, level }],
  children: [{ pairId, person1, person2, score, level }],
  total: 3,
  recommendedOrder: [...children, ...spouses, ...parents]  // Bottom-Up
}
```

### Interface du Modal

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ Relations en doublon détectées                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  La paire Jean DUPONT ↔ J. DUPONT a des relations               │
│  qui sont également des doublons potentiels.                    │
│                                                                 │
│  📌 Recommandation : Fusionner dans cet ordre (Bottom-Up)       │
│                                                                 │
│  👶 ENFANTS EN DOUBLON (fusionner en premier)                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Pierre DUPONT ↔ P. DUPONT (score: 85%)    [Fusionner]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  💑 CONJOINTS EN DOUBLON                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Marie MARTIN ↔ M. MARTIN (score: 78%)     [Fusionner]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  👴 PARENTS EN DOUBLON (fusionner en dernier)                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Jacques DUPONT ↔ J. DUPONT (score: 92%)   [Fusionner]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  [Ignorer et fusionner]        [Fusionner la paire principale]  │
└─────────────────────────────────────────────────────────────────┘
```

### Actions disponibles

| Action | Description |
|--------|-------------|
| **Fusionner** (paire liée) | Fusionne immédiatement cette paire liée |
| **Ignorer et fusionner** | Ignore les recommandations, fusionne directement la paire principale |
| **Fusionner la paire principale** | Fusionne la paire après avoir traité les paires liées |

### Workflow complet

```
1. Utilisateur sélectionne paire A↔B
2. Système détecte enfants C↔D en doublon
3. Modal s'affiche avec recommandation
4. Utilisateur clique "Fusionner" sur C↔D
   → Fusion C↔D effectuée
   → Paire C↔D retirée de la liste
5. Modal se met à jour (C↔D disparaît)
6. Utilisateur clique "Fusionner la paire principale"
   → Fusion A↔B effectuée avec références correctes
```

---

## Étape 5 : DÉTECTION DES CONFLITS (v2.2.0)

### Fonction : `detectMergeConflicts(person1, person2)`

**10 champs vérifiés** :
- birth, birthPlace
- death, deathPlace
- baptism, baptismPlace
- burial, burialPlace
- occupation, religion

**Conflits relationnels (v2.2.6)** :
- parents différents
- conjoints différents
- enfants différents

Si des conflits sont détectés, un modal s'affiche pour résolution manuelle.

---

## Étape 6 : FUSION DES DONNÉES

### Fonction : `mergePersonData(person1, person2)`

```javascript
primary = personne avec meilleur score qualité
secondary = l'autre personne

merged = {
  id: primary.id,
  removedId: secondary.id,
  
  // Noms: UNION de tous les noms uniques
  names: [...new Set([...primary.names, ...secondary.names])],
  
  // Dates/lieux: PREMIER NON-NULL (priorité au primary)
  birth: primary.birth || secondary.birth,
  birthPlace: primary.birthPlace || secondary.birthPlace,
  
  // Relations: UNION
  parents: [...new Set([...primary.parents, ...secondary.parents])],
  spouses: [...new Set([...primary.spouses, ...secondary.spouses])],
  children: [...new Set([...primary.children, ...secondary.children])],
  
  // v2.0.0: Données brutes fusionnées
  rawLinesByTag: mergedRawLinesByTag,
  
  // Traçabilité
  mergedFrom: [primary.id, secondary.id]
}
```

### Score de qualité enrichi (v2.3.0+)

```javascript
calculateEnrichedQuality(person, peopleById) {
  let score = 0;
  
  // 1. Précision des dates (max 45 pts)
  score += getDatePrecisionScore(person.birth);      // 0-15
  score += getDatePrecisionScore(person.death);      // 0-15
  score += getDatePrecisionScore(person.baptism);    // 0-15
  
  // 2. Précision des lieux (max 20 pts)
  score += getPlacePrecisionScore(person.birthPlace); // 0-10
  score += getPlacePrecisionScore(person.deathPlace); // 0-10
  
  // 3. Relations valides (max 30 pts)
  score += validParents * 5;
  score += validSpouses * 5;
  score += validChildren * 3;
  
  // 4. Sources et notes (max 15 pts)
  score += sourceCount * 3;
  
  // 5. Complétude (max 10 pts) - seulement si nom valide
  if (hasValidName) {
    score += (filledFields / 8) * 10;
  }
  
  return { score: Math.min(100, score), details };
}
```

---

## Étape 7 : RÉSOLUTION DES CHAÎNES (v2.2.4)

### Problème résolu

```
Cluster: I1, I2, I3, I4

Paires sélectionnées:
  I1+I2 → garde I2  → mergeMap: I1→I2
  I2+I3 → garde I3  → mergeMap: I2→I3
  I3+I4 → garde I4  → mergeMap: I3→I4

Solution: Résolution itérative
  mergeMap final: { I1→I4, I2→I4, I3→I4 }
```

---

## Étape 8 : GÉNÉRATION GEDCOM

### Fonction : `downloadCleanedFile()`

**Traitement ligne par ligne** avec :
- Remplacement des IDs fusionnées via mergeMap
- Suppression des blocs INDI supprimés
- Nettoyage des familles orphelines
- Préservation des rawLines pour données complètes

---

## 🟢 NOUVEAUTÉS v2.4.0

| Fonctionnalité | Description |
|----------------|-------------|
| **Fusion guidée** | Assistant automatique pour doublons liés |
| **Approche Bottom-Up** | Ordre optimal : enfants → conjoints → parents |
| **Détection intelligente** | `detectRelatedDuplicates()` analyse les relations |
| **Modal contextuel** | Affiche les paires liées avec recommandations |
| **Recalcul dynamique** | Liste mise à jour après chaque fusion |

---

## 📊 COMPARAISON VERSIONS

| Aspect | v2.2.6 | v2.3.0 | v2.4.0 |
|--------|--------|--------|--------|
| Graphe dépendances | ❌ | ✅ | ✅ |
| Ordre optimal | ❌ | ✅ | ✅ |
| Fusion guidée | ❌ | ❌ | ✅ |
| Détection liés | ❌ | ❌ | ✅ |
| Modal assistant | ❌ | ❌ | ✅ |
| Score qualité enrichi | ❌ | ✅ | ✅ |

---

## 🧪 Tests couvrant le processus

| Catégorie | Tests | Description |
|-----------|-------|-------------|
| Module fusionOrder | 45 | Graphe, tri, scores |
| Fusion guidée v2.4.0 | 30 | Modal, détection, workflow |
| mergePersonData | 12 | Fusion des champs |
| detectMergeConflicts | 15 | Détection conflits |
| cleanOrphanedFamilies | 11 | Nettoyage familles |
| **Total fusion** | **113** | |

---

## 📈 Performance

| Fichier | Temps | Interface |
|---------|-------|-----------|
| 1000 individus | ~2s | ✅ Fluide |
| 3000 individus | ~5s | ✅ Fluide |
| 7000 individus | ~8s | ✅ Fluide |

Le Web Worker assure une interface réactive pendant tout le traitement.

---

*Analyse mise à jour le 17 janvier 2026 - v2.4.0*
