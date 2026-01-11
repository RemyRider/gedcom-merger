# 🔍 Analyse Complète du Processus de Fusion - GEDCOM Merger v2.2.6

## Vue d'ensemble du flux

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                      PROCESSUS DE FUSION GEDCOM v2.2.4                         │
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
    │   GEDCOM     │     │  DOUBLONS    │     │  UTILISATEUR │     │   FINALE     │
    └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
           │                    │                    │                    │
           ▼                    ▼                    ▼                    ▼
    ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
    │ individuals[]│     │ duplicates[] │     │selectedPairs │     │ RÉSOLUTION   │
    │ families[]   │     │ clusters[]   │     │  Set<id>     │     │ CHAÎNES +    │
    │ familiesData │     │              │     │ conflicts[]  │     │ REDIRECTION  │
    └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
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

### Améliorations scoring v2.2.6

#### Pondération dynamique des noms

| Fréquence du nom | Points |
|------------------|--------|
| ≤3 occurrences (très rare) | 35 |
| ≤10 occurrences (rare) | 32 |
| ≤30 occurrences (normal) | 30 |
| ≤100 occurrences (commun) | 25 |
| >100 occurrences (très commun) | 20 |

#### Bonus combinaison forte

| Combinaison | Bonus |
|-------------|-------|
| Nom + Naissance + Lieu naissance | +15 pts |
| Nom + Naissance | +8 pts |

#### Malus incohérence

| Situation | Malus |
|-----------|-------|
| Lieux naissance contradictoires | -10 pts |

**Anti-faux-positifs** : Si seuls le nom et le sexe correspondent → REJET

---

## Étape 2bis : NORMALISATION DES LIEUX (v2.2.6)

### Fonctionnalité

Avant la fusion, l'utilisateur peut normaliser les variantes de lieux détectées pour améliorer la qualité des données.

### Détection des variantes

```javascript
// Groupement par forme normalisée
"Grenoble" | "GRENOBLE" | "grenoble, isère" → Groupe 1
"Lyon" | "LYON" | "lyon, rhône" → Groupe 2
```

### Intégration API Géo

**Source** : `https://geo.api.gouv.fr/communes`

```javascript
// Appel API
const response = await fetch(
  `https://geo.api.gouv.fr/communes?nom=${communeName}&fields=nom,departement,region&limit=5`
);

// Résultat structuré
{
  short: "Grenoble",
  medium: "Grenoble, Isère",
  full: "Grenoble, Isère, Auvergne-Rhône-Alpes, France"
}
```

### Workflow utilisateur

1. Clic sur "🔧 Normaliser" dans la section "Lieux à normaliser"
2. Modal affiche tous les groupes de variantes
3. Option "🌍 Rechercher officiels" pour suggestions API Géo
4. Sélection de la forme correcte pour chaque groupe
5. "✨ Tout suggérer" applique les suggestions API ou auto
6. "Appliquer" corrige toutes les personnes concernées

### Champs mis à jour

- `birthPlace` (lieu de naissance)
- `deathPlace` (lieu de décès)
- `baptismPlace` (lieu de baptême)
- `burialPlace` (lieu d'inhumation)
- `residence` (résidence)
- `rawLines` (pour export GEDCOM cohérent)

### Téléchargement du fichier normalisé

La fonction `downloadNormalizedFile()` utilise les rawLines pour préserver toutes les données :

```javascript
// 1. Créer une map ID -> rawLines mises à jour
const updatedRawLinesMap = new Map();
individuals.forEach(person => {
  if (person.rawLines && person.rawLines.length > 0) {
    updatedRawLinesMap.set(person.id, person.rawLines);
  }
});

// 2. Pour chaque bloc INDI avec rawLines mises à jour
if (trimmed.includes('INDI') && updatedRawLinesMap.has(match[1])) {
  // Remplacer le bloc entier par les rawLines (qui contiennent TOUT)
  updatedRawLinesMap.get(match[1]).forEach(rawLine => outputLines.push(rawLine));
  skipCurrentIndi = true;
}
```

**Avantages** :
- ✅ Aucune perte de données (notes, sources, événements)
- ✅ Seuls les lieux sont modifiés via replace ciblé
- ✅ Préservation de la structure GEDCOM originale

### Écran récapitulatif

Après normalisation, l'utilisateur est redirigé vers l'écran récapitulatif avec :
- Nombre de groupes normalisés
- Nombre de lieux corrigés
- Bouton de téléchargement (appelle `downloadNormalizedFile()`)

---

## Étape 3 : SÉLECTION UTILISATEUR

### Interface
- **Onglet Clusters** : Groupes de 3+ personnes interconnectées
- **Onglet Doublons** : Paires simples non liées à un cluster
- **Onglet À supprimer** : Personnes isolées sans données
- **Onglet IA** : Suggestions basées sur patterns

### Actions possibles
- Sélection individuelle (clic sur carte)
- Auto-sélection ≥X% (configurable)
- Sélection par cluster entier
- Prévisualisation avant fusion

### Isolation doublons/clusters (v2.2.3)
- Les boutons "Sélectionner ≥X%" n'affectent que leurs onglets respectifs
- "Désélectionner tout" doublons garde les sélections clusters
- "Désélectionner tout" clusters garde les sélections doublons

---

## Étape 4 : DÉTECTION DES CONFLITS (v2.2.0)

### Fonction : `detectMergeConflicts(person1, person2)`

**10 champs vérifiés** :
- birth, birthPlace
- death, deathPlace
- baptism, baptismPlace
- burial, burialPlace
- occupation, religion

**Logique de compatibilité** :
```javascript
const areValuesCompatible = (v1, v2, type) => {
  if (!v1 || !v2) return true; // Une valeur vide = pas de conflit
  
  if (type === 'date') {
    // Dates identiques → Compatible
    if (v1.trim().toLowerCase() === v2.trim().toLowerCase()) return true;
    
    // v2.2.2: Si une date est approximative, comparer les années
    if (isApproximateDate(v1) || isApproximateDate(v2)) {
      const year1 = extractYear(v1);
      const year2 = extractYear(v2);
      return year1 === year2;
    }
    
    // Deux dates précises différentes → CONFLIT
    return false;
  }
  
  if (type === 'place') {
    // Compatible si l'un contient l'autre
    return v1.includes(v2) || v2.includes(v1);
  }
  
  // Texte: identique (insensible casse)
  return v1.toLowerCase().trim() === v2.toLowerCase().trim();
};
```

**Exemples v2.2.2** :
| Valeur 1 | Valeur 2 | Conflit ? |
|----------|----------|-----------|
| "1726" | "19 SEP 1726" | ❌ Non (approximatif + même année) |
| "29 NOV 2025" | "12 NOV 2025" | ✅ OUI (dates précises différentes) |
| "Paris" | "Paris, France" | ❌ Non (inclusion) |

---

## Étape 5 : RÉSOLUTION DES CONFLITS (v2.2.0)

### Interface modale

Si des conflits sont détectés, un modal s'affiche :
- Affiche chaque conflit avec les 2 valeurs
- Radio buttons pour choisir la valeur à conserver
- Bouton "Appliquer" activé quand tous résolus

### Fonction : `applyConflictResolutions(merged, conflicts)`

```javascript
const applyConflictResolutions = (merged, conflicts) => {
  const resolvedMerged = { ...merged };
  
  conflicts.forEach(conflict => {
    if (conflict.resolved && conflict.chosenValue !== null) {
      resolvedMerged[conflict.field] = conflict.chosenValue;
    }
  });
  
  return resolvedMerged;
};
```

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
  familiesAsSpouse: [...new Set([...p1.familiesAsSpouse, ...p2.familiesAsSpouse])],
  
  // v2.0.0: Données brutes fusionnées
  rawLinesByTag: mergedRawLinesByTag,
  
  // Traçabilité
  mergedFrom: [primary.id, secondary.id]
}
```

---

## Étape 7 : RÉSOLUTION DES CHAÎNES DE FUSION (v2.2.4) 🎉

### Problème résolu

Dans un cluster de N personnes, les paires de fusion créent des chaînes :
```
Cluster: I1, I2, I3, I4

Paires sélectionnées:
  I1+I2 → garde I2  → mergeMap: I1→I2
  I2+I3 → garde I3  → mergeMap: I2→I3
  I3+I4 → garde I4  → mergeMap: I3→I4

Problème AVANT v2.2.4:
  I1→I2 mais I2 est supprimé !
  → Les références vers I1 pointent vers I2 (inexistant)
  → "Parent I502549 inexistant" ❌
```

### Solution : Résolution itérative

```javascript
// v2.2.4: RÉSOLUTION DES CHAÎNES DE FUSION EN CASCADE
let chainsResolved = true;
let iterations = 0;
const maxIterations = 100;

while (chainsResolved && iterations < maxIterations) {
  chainsResolved = false;
  iterations++;
  
  mergeMap.forEach((targetId, sourceId) => {
    // Si la cible est elle-même fusionnée vers une autre personne
    if (mergeMap.has(targetId)) {
      const finalTarget = mergeMap.get(targetId);
      mergeMap.set(sourceId, finalTarget);
      chainsResolved = true;
    }
  });
}
```

### Exemple de résolution

```
mergeMap initial:
  { I1→I2, I2→I3, I3→I4 }

Itération 1:
  I1→I2, I2 dans mergeMap → I1→I3
  I2→I3, I3 dans mergeMap → I2→I4
  { I1→I3, I2→I4, I3→I4 }

Itération 2:
  I1→I3, I3 dans mergeMap → I1→I4
  { I1→I4, I2→I4, I3→I4 }  ✅

Résultat: TOUS pointent vers I4 (la cible finale)
```

---

## Étape 8 : NETTOYAGE DES FAMILLES (v2.2.4)

### Fonction : `cleanOrphanedFamilies(families, removedIds, people, mergeMap)`

**Nouveau paramètre v2.2.4** : `mergeMap` pour rediriger les références.

```javascript
// Helper: obtenir l'ID valide
const getValidId = (id) => {
  if (!id) return null;
  
  // Si l'ID a été fusionné, retourner la cible
  if (mergeMap.has(id)) return mergeMap.get(id);
  
  // Si l'ID existe toujours, le garder
  if (peopleIds.has(id)) return id;
  
  // Sinon, l'ID n'existe plus (suppression manuelle)
  return null;
};
```

### Traitement des familles

```javascript
families.forEach((family, famId) => {
  // Rediriger HUSB vers cible de fusion ou null si supprimé
  cleanedFamily.husband = getValidId(family.husband);
  
  // Rediriger WIFE vers cible de fusion ou null si supprimé
  cleanedFamily.wife = getValidId(family.wife);
  
  // Rediriger enfants vers cibles de fusion, filtrer supprimés
  const updatedChildren = family.children
    .map(childId => getValidId(childId))
    .filter(id => id !== null);
  
  // Dédupliquer si deux enfants fusionnent vers le même
  cleanedFamily.children = [...new Set(updatedChildren)];
  
  // Famille orpheline = ni mari, ni femme, ni enfants
  if (!cleanedFamily.husband && !cleanedFamily.wife && 
      cleanedFamily.children.length === 0) {
    // Supprimer la famille
    orphanReport.removed.push({ famId, reason: 'Famille vide' });
  }
});
```

---

## Étape 9 : GÉNÉRATION GEDCOM

### Fonction : `downloadCleanedFile()`

**Traitement ligne par ligne** :
```
Pour chaque ligne du GEDCOM original:
  
  Si "0 @Ixxx@ INDI":
    Si ID dans idsToRemove → SKIP tout le bloc
    Si ID dans mergedPersons → REMPLACER par bloc généré
    Sinon → GARDER
  
  Si "0 @Fxxx@ FAM":
    Si dans familiesToRemove → SKIP tout le bloc
    Sinon → Initialiser tracking CHIL
  
  Pour toute ligne:
    Remplacer @sourceId@ par @targetId@ (via mergeMap)
    
  Si "1 FAMS/FAMC @Fxxx@":
    Si famille supprimée → SKIP
    
  Si "1 HUSB/WIFE/CHIL @Ixxx@":
    Si suppression manuelle (pas dans mergeMap) → SKIP
    Sinon → GARDER (référence déjà redirigée)
    
  Si "1 CHIL @Ixxx@":
    Si déjà vu dans cette FAM → SKIP (déduplication)
    Sinon → GARDER et marquer comme vu
```

**Résultat** : Fichier `gedcom_fusionne_2026-01-05.ged` sans références invalides

---

## 🟢 PROBLÈMES RÉSOLUS (v2.2.x)

### ✅ Fusion en cascade
**Avant** : A→B mais B supprimé → référence cassée
**Après** : A→B→C résolu en A→C directement

### ✅ Références orphelines
**Avant** : HUSB/WIFE/CHIL vers personnes supprimées
**Après** : Redirigées via mergeMap ou supprimées si pas de cible

### ✅ Conflits de données
**Avant** : `primary.birth || secondary.birth` prenait toujours le premier
**Après** : Modal de résolution pour choisir la bonne valeur

### ✅ Familles orphelines
**Avant** : FAM sans HUSB/WIFE/CHIL restaient
**Après** : Supprimées automatiquement

### ✅ Dates précises
**Avant** : "29 NOV 2025" vs "12 NOV 2025" = compatible (même année)
**Après** : CONFLIT détecté (dates précises différentes)

---

## 📊 COMPARAISON AVANT/APRÈS

| Aspect | v1.9.5 | v2.0.0 | v2.2.4 |
|--------|--------|--------|--------|
| Données combinées | ✅ Union | ✅ Union | ✅ Union |
| Noms multiples | ✅ TYPE aka | ✅ TYPE aka | ✅ TYPE aka |
| CHIL dupliqués | ✅ Dédupliqués | ✅ Dédupliqués | ✅ Dédupliqués |
| Traçabilité | ✅ NOTE fusion | ✅ NOTE fusion | ✅ NOTE fusion |
| Clusters | ✅ Fusion chaîne | ✅ Fusion chaîne | ✅ **Cascade N ind.** |
| SOUR/NOTE | ❌ Perdus | ✅ Combinés | ✅ Combinés |
| Conflits dates | ❌ Non géré | ❌ Non géré | ✅ **Modal résolution** |
| FAM orphelines | ❌ Restaient | ❌ Restaient | ✅ **Nettoyées** |
| Refs vers supprimés | ❌ Cassées | ❌ Cassées | ✅ **Redirigées** |
| Dates précises | ❌ Ignorées | ❌ Ignorées | ✅ **Conflits détectés** |

---

## 🧪 Tests couvrant le processus de fusion

| Catégorie | Tests | Description |
|-----------|-------|-------------|
| mergePersonData | 12 | Fusion des champs, union, qualité |
| detectMergeConflicts | 15 | Détection 10 champs, compatibilité |
| areValuesCompatible | 12 | Dates, lieux, textes |
| isApproximateDate | 9 | ABT, BEF, AFT, année seule |
| cleanOrphanedFamilies | 11 | Nettoyage, mergeMap, déduplication |
| Fusion cascade | 6 | Chaînes A→B→C, clusters N |
| **Total fusion** | **65** | |

---

## 📈 Performance

| Fichier | Temps | Interface |
|---------|-------|-----------|
| 1000 individus | ~2s | ✅ Fluide |
| 3000 individus | ~5s | ✅ Fluide |
| 7000 individus | ~8s | ✅ Fluide |

Le Web Worker assure une interface réactive pendant tout le traitement.

---

*Analyse mise à jour le 10 janvier 2026 - v2.2.6*
