# 🚀 ROADMAP GEDCOM Merger v2.3.0

## Contexte

Version axée sur l'**ordre de fusion intelligent** et la **préservation maximale des données** lors de la fusion de doublons interconnectés.

**Base de départ** : v2.2.6 (593 tests, fusion cascade, clusters N individus)

**Date de création** : 5 janvier 2026

---

## 🎯 Objectif principal v2.3.0

### Principe directeur
> **Fusionner dans le bon ordre pour ne jamais perdre d'information pertinente**

### Problème actuel

Quand on fusionne des personnes qui ont des enfants/conjoints en commun qui sont aussi des doublons :

```
SITUATION : Daniel GIRARDET (4 doublons)

I500420 (Daniel) ─── F500120 ─┬─ WIFE: I500421 (Suzanne, peu d'infos)
                              └─ CHIL: I500422 (Anne, peu d'infos)

I502549 (Daniel) ─── F500767 ─┬─ WIFE: I502550 (Suzanne, COMPLÈTE ✓)
                              └─ CHIL: I503235 (Anne, COMPLÈTE ✓)

PROBLÈME :
- Si on fusionne Daniel d'abord → Anne et Suzanne restent en doublons séparés
- Les relations pointent vers des personnes différentes
- Il faut recharger le fichier et refaire l'analyse
- Risque de perdre la cohérence familiale
```

### Solution proposée

**Fusion "Bottom-Up"** : Feuilles d'abord, racines ensuite

```
ORDRE OPTIMAL :
1. Fusionner les enfants (Anne, Marie, Gilbert) → génération la plus basse
2. Fusionner les conjoints (Suzanne)
3. Fusionner les parents (Daniel) → les familles sont déjà consolidées
```

---

## 📋 Fonctionnalités planifiées

### 🔴 PRIORITÉ HAUTE (P1)

#### 1. Graphe de dépendances des doublons

**Objectif** : Identifier les relations entre doublons (parent/enfant, conjoint)

**Structure de données** :
```javascript
// Pour chaque paire de doublons, identifier les doublons liés
const dependencyGraph = {
  'pair_daniel': {
    id: 'pair_daniel',
    persons: ['I500420', 'I502549'],
    dependsOn: ['pair_anne', 'pair_suzanne'],  // Doit être fusionné APRÈS
    blockedBy: [],                              // Attend ces fusions
    level: 0                                    // Niveau générationnel
  },
  'pair_anne': {
    id: 'pair_anne', 
    persons: ['I500422', 'I503235'],
    dependsOn: [],
    blockedBy: ['pair_daniel'],
    level: 2
  },
  'pair_suzanne': {
    id: 'pair_suzanne',
    persons: ['I500421', 'I502550'],
    dependsOn: [],
    blockedBy: ['pair_daniel'],
    level: 1
  }
}
```

**Implémentation** :
```javascript
const buildDependencyGraph = (duplicates, individuals) => {
  const graph = new Map();
  
  duplicates.forEach(pair => {
    const p1 = pair.person1;
    const p2 = pair.person2;
    
    // Collecter toutes les relations des deux personnes
    const allChildren = [...new Set([...p1.children, ...p2.children])];
    const allSpouses = [...new Set([...p1.spouses, ...p2.spouses])];
    const allParents = [...new Set([...p1.parents, ...p2.parents])];
    
    // Trouver les doublons parmi les relations
    const childDuplicates = findDuplicatesAmong(allChildren, duplicates);
    const spouseDuplicates = findDuplicatesAmong(allSpouses, duplicates);
    const parentDuplicates = findDuplicatesAmong(allParents, duplicates);
    
    graph.set(pair.id, {
      id: pair.id,
      persons: [p1.id, p2.id],
      childDuplicates,    // Doublons parmi les enfants
      spouseDuplicates,   // Doublons parmi les conjoints
      parentDuplicates,   // Doublons parmi les parents
      dependsOn: [...childDuplicates, ...spouseDuplicates], // Fusionner ceux-ci AVANT
    });
  });
  
  return graph;
};
```

---

#### 2. Tri topologique (ordre optimal)

**Objectif** : Déterminer l'ordre de fusion qui préserve le maximum d'informations

**Algorithme** :
```javascript
const calculateFusionOrder = (dependencyGraph) => {
  const levels = new Map(); // level -> [pairs]
  const visited = new Set();
  
  // DFS pour calculer le niveau de chaque paire
  const calculateLevel = (pairId) => {
    if (visited.has(pairId)) return levels.get(pairId);
    visited.add(pairId);
    
    const node = dependencyGraph.get(pairId);
    if (node.dependsOn.length === 0) {
      // Feuille : niveau 0 (fusionner en premier)
      return 0;
    }
    
    // Niveau = max(niveaux des dépendances) + 1
    const maxDepLevel = Math.max(
      ...node.dependsOn.map(depId => calculateLevel(depId))
    );
    return maxDepLevel + 1;
  };
  
  // Calculer le niveau de chaque paire
  dependencyGraph.forEach((node, pairId) => {
    const level = calculateLevel(pairId);
    if (!levels.has(level)) levels.set(level, []);
    levels.get(level).push(pairId);
  });
  
  // Retourner les niveaux triés (0 = fusionner en premier)
  return Array.from(levels.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([level, pairs]) => ({ level, pairs }));
};
```

**Résultat** :
```javascript
[
  { level: 0, pairs: ['pair_anne', 'pair_marie', 'pair_gilbert'] },  // Enfants
  { level: 1, pairs: ['pair_suzanne'] },                             // Conjoints
  { level: 2, pairs: ['pair_daniel'] }                               // Parents
]
```

---

#### 3. Score de qualité enrichi

**Objectif** : Déterminer quelle personne garder avec plus de critères

**Critères actuels** (v2.2.6) :
```javascript
const calculateDataQuality = (person) => {
  let score = 0;
  if (person.names?.length > 0) score += 10;
  if (person.birth) score += 15;
  if (person.birthPlace) score += 10;
  if (person.death) score += 15;
  if (person.deathPlace) score += 10;
  // ... champs de base
  return score;
};
```

**Critères enrichis** (v2.3.0) :
```javascript
const calculateEnrichedQuality = (person) => {
  let score = 0;
  
  // === QUALITÉ DES DONNÉES (50%) ===
  
  // Noms (0-15 points)
  score += Math.min(person.names?.length || 0, 3) * 5;
  
  // Dates avec précision (0-30 points)
  score += getDatePrecisionScore(person.birth);      // 0-15
  score += getDatePrecisionScore(person.death);      // 0-15
  
  // Lieux avec précision (0-20 points)
  score += getPlacePrecisionScore(person.birthPlace); // 0-10
  score += getPlacePrecisionScore(person.deathPlace); // 0-10
  
  // Autres champs (0-15 points)
  if (person.occupation) score += 5;
  if (person.religion) score += 3;
  if (person.baptism) score += 4;
  if (person.burial) score += 3;
  
  // === COHÉRENCE RELATIONNELLE (30%) ===
  
  // Relations valides (0-30 points)
  score += (person.parents?.length || 0) * 5;        // 0-10
  score += (person.spouses?.length || 0) * 5;        // 0-10
  score += Math.min(person.children?.length || 0, 2) * 5; // 0-10
  
  // === RICHESSE MÉTADONNÉES (20%) ===
  
  // Sources (0-20 points)
  const sourCount = (person.rawLinesByTag?.SOUR || []).length;
  score += Math.min(sourCount, 4) * 5;               // 0-20
  
  // Notes et médias (0-10 points bonus)
  const noteCount = (person.rawLinesByTag?.NOTE || []).length;
  const objeCount = (person.rawLinesByTag?.OBJE || []).length;
  score += Math.min(noteCount + objeCount, 2) * 5;   // 0-10
  
  return score;
};

const getDatePrecisionScore = (dateStr) => {
  if (!dateStr) return 0;
  // "19 SEP 1726" = 15 points (jour + mois + année)
  // "SEP 1726" = 10 points (mois + année)
  // "1726" = 5 points (année seule)
  // "ABT 1726" = 3 points (approximatif)
  const hasDay = /^\d{1,2}\s/.test(dateStr);
  const hasMonth = /[A-Z]{3}/.test(dateStr);
  const hasYear = /\d{4}/.test(dateStr);
  const isApprox = /^(ABT|BEF|AFT|EST|CAL)/i.test(dateStr);
  
  if (isApprox) return 3;
  let score = 0;
  if (hasYear) score += 5;
  if (hasMonth) score += 5;
  if (hasDay) score += 5;
  return score;
};

const getPlacePrecisionScore = (placeStr) => {
  if (!placeStr) return 0;
  // Plus il y a de niveaux, plus c'est précis
  const levels = placeStr.split(',').length;
  return Math.min(levels * 3, 10);
};
```

---

#### 4. Interface de fusion par étapes

**Objectif** : Guider l'utilisateur dans l'ordre optimal de fusion

**Maquette UI** :
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📊 ORDRE DE FUSION RECOMMANDÉ                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ L'application a analysé les relations entre vos doublons.                   │
│ Pour préserver un maximum d'informations, suivez cet ordre :                │
│                                                                             │
│ ═══════════════════════════════════════════════════════════════════════════ │
│                                                                             │
│ ÉTAPE 1/3 - ENFANTS (3 fusions)                              [En attente]   │
│ ─────────────────────────────────────────────────────────────────────────── │
│                                                                             │
│   🔴 94% Anne GIRARDET                                                      │
│      I503235 (✓ complète) ← I500422 (○ partielle)                          │
│      📊 Qualité: 85 vs 32 │ Sources: 3 vs 0                                │
│      [Voir détails] [Sélectionner]                                         │
│                                                                             │
│   🔴 92% Marie GIRARDET                                                     │
│      I503236 (✓ complète) ← I500423 (○ partielle)                          │
│      📊 Qualité: 78 vs 28 │ Sources: 2 vs 0                                │
│      [Voir détails] [Sélectionner]                                         │
│                                                                             │
│   🟡 89% Gilbert GIRARDET                                                   │
│      I503237 (○ partielle) ← I500424 (○ partielle)                         │
│      📊 Qualité: 45 vs 42 │ ⚠️ Qualités similaires                         │
│      [Voir détails] [Sélectionner]                                         │
│                                                                             │
│   [Tout sélectionner étape 1]           [▶ Fusionner étape 1]              │
│                                                                             │
│ ═══════════════════════════════════════════════════════════════════════════ │
│                                                                             │
│ ÉTAPE 2/3 - CONJOINTS (1 fusion)                             [🔒 Bloquée]   │
│ ─────────────────────────────────────────────────────────────────────────── │
│   Disponible après l'étape 1                                               │
│                                                                             │
│ ═══════════════════════════════════════════════════════════════════════════ │
│                                                                             │
│ ÉTAPE 3/3 - PARENTS (4 fusions)                              [🔒 Bloquée]   │
│ ─────────────────────────────────────────────────────────────────────────── │
│   Disponible après l'étape 2                                               │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ ℹ️ Fusionner dans cet ordre garantit que les relations familiales          │
│    pointent vers les personnes les plus complètes.                          │
│                                                                             │
│ [Mode manuel (ignorer l'ordre)]                    [Télécharger à la fin]  │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Comportement** :
1. Étape 1 activée par défaut
2. Après fusion étape 1 → Étape 2 se débloque
3. L'utilisateur peut ignorer l'ordre recommandé ("Mode manuel")
4. Téléchargement final après toutes les étapes ou à tout moment

---

### 🟡 PRIORITÉ MOYENNE (P2)

#### 5. Détection doublons relationnels automatique

**Objectif** : Identifier automatiquement les doublons parmi les enfants/conjoints lors de la fusion

```javascript
const detectRelationalDuplicates = (person1, person2, allIndividuals) => {
  const warnings = [];
  
  // Comparer les enfants de p1 avec ceux de p2
  const children1 = person1.children.map(id => allIndividuals.find(p => p.id === id));
  const children2 = person2.children.map(id => allIndividuals.find(p => p.id === id));
  
  children1.forEach(c1 => {
    children2.forEach(c2 => {
      if (c1 && c2 && c1.id !== c2.id) {
        const similarity = calculateSimilarity(c1, c2);
        if (similarity.score >= 70) {
          warnings.push({
            type: 'CHILD_DUPLICATE',
            person1: c1,
            person2: c2,
            score: similarity.score,
            recommendation: similarity.score >= 90 ? 'FORT' : 'MOYEN'
          });
        }
      }
    });
  });
  
  // Idem pour conjoints
  // ...
  
  return warnings;
};
```

---

#### 6. Export CSV/JSON (reporté de v2.2.0)

**Fichiers CSV** :
- `individus.csv` : ID, Nom, Prénom, Naissance, Décès, Lieu, Score qualité
- `familles.csv` : ID, Mari, Femme, Mariage, Enfants
- `doublons.csv` : ID1, ID2, Score, Niveau, Ordre recommandé
- `fusion_order.csv` : Étape, Paires, Dépendances

**Export JSON** :
```json
{
  "metadata": { "version": "2.3.0", "date": "2026-01-05" },
  "individuals": [...],
  "families": [...],
  "duplicates": [...],
  "fusionOrder": [
    { "level": 0, "pairs": [...], "description": "Enfants" },
    { "level": 1, "pairs": [...], "description": "Conjoints" },
    { "level": 2, "pairs": [...], "description": "Parents" }
  ]
}
```

---

### 🟢 PRIORITÉ BASSE (P3)

#### 7. Filtre par branche patronymique (reporté de v2.2.0)

#### 8. Mode "Fusion automatique sécurisée"

Fusionner automatiquement les doublons qui respectent :
- Score ≥ 95%
- Pas de conflit de données
- Une personne clairement plus complète (qualité × 2)
- Aucune ambiguïté relationnelle

---

## 📊 Résumé des priorités

| # | Fonctionnalité | Priorité | Complexité | Impact |
|---|----------------|----------|------------|--------|
| 1 | Graphe de dépendances doublons | 🔴 P1 | Moyenne | Fort |
| 2 | Tri topologique (ordre optimal) | 🔴 P1 | Moyenne | Fort |
| 3 | Score qualité enrichi | 🔴 P1 | Faible | Fort |
| 4 | Interface fusion par étapes | 🔴 P1 | Haute | Fort |
| 5 | Détection doublons relationnels | 🟡 P2 | Moyenne | Moyen |
| 6 | Export CSV/JSON | 🟡 P2 | Faible | Moyen |
| 7 | Filtre patronyme | 🟢 P3 | Moyenne | Faible |
| 8 | Fusion auto sécurisée | 🟢 P3 | Haute | Moyen |

---

## 🧪 Tests prévus

| Catégorie | Tests | Description |
|-----------|-------|-------------|
| Graphe dépendances | 15 | Construction, relations, cycles |
| Tri topologique | 10 | Ordre, niveaux, cas limites |
| Score qualité enrichi | 12 | Précision dates/lieux, sources |
| Interface étapes | 8 | Déblocage, sélection, fusion |
| Doublons relationnels | 10 | Enfants, conjoints, détection |
| Export CSV/JSON | 8 | Formats, encodage, structure |
| **Total estimé** | **~63** | → **~656 tests** |

---

## 📅 Planning prévisionnel

| Phase | Contenu | Estimation |
|-------|---------|------------|
| Phase 1 | Graphe de dépendances | 3h |
| Phase 2 | Tri topologique | 2h |
| Phase 3 | Score qualité enrichi | 2h |
| Phase 4 | Interface fusion par étapes | 4h |
| Phase 5 | Détection doublons relationnels | 2h |
| Phase 6 | Export CSV/JSON | 2h |
| Phase 7 | Tests + documentation | 3h |
| **Total** | | **~18h** |

---

## ✅ Checklist de validation v2.3.0

### P1 - Obligatoire
- [ ] Graphe de dépendances construit correctement
- [ ] Ordre de fusion calculé (enfants → conjoints → parents)
- [ ] Score qualité prend en compte sources et précision
- [ ] Interface affiche les étapes dans l'ordre
- [ ] Étapes se débloquent progressivement
- [ ] Fusion fonctionne étape par étape

### P2 - Important
- [ ] Doublons relationnels détectés automatiquement
- [ ] Export CSV génère 4 fichiers
- [ ] Export JSON structure complète

### P3 - Nice-to-have
- [ ] Filtre par patronyme
- [ ] Mode fusion automatique sécurisée

### Technique
- [ ] ~656 tests passent
- [ ] Build Netlify OK
- [ ] Aucune régression v2.2.6
- [ ] Documentation à jour

---

## 🔗 Liens

- **Production** : https://gedcom-merger.netlify.app
- **Dev** : https://dev--gedcom-merger.netlify.app
- **GitHub** : https://github.com/RemyRider/gedcom-merger

---

## 📚 Historique des roadmaps

| Version | Focus | Statut |
|---------|-------|--------|
| v2.0.0 | Préservation données (rawLines) | ✅ Fait |
| v2.1.0 | Contrôle qualité avancé | ✅ Fait |
| v2.2.0 | Conflits + Intégrité fusion | ✅ Fait |
| **v2.3.0** | **Ordre de fusion intelligent** | 📋 Planifié |

---

*Document créé le 5 janvier 2026*  
*Version 2.3.0 - Ordre de fusion intelligent*
