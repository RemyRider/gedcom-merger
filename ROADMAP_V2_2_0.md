# 🚀 ROADMAP GEDCOM Merger v2.2.0

## Contexte

Version axée sur la **gestion intelligente des conflits** et l'**export de données**, consolidant les fonctionnalités restantes des roadmaps v2.0.0 et v2.1.0.

**Base de départ** : v2.1.0 (371 tests, 8 catégories, rapport qualité, analyses avancées)

**Date de création** : 2 janvier 2026

---

## ✅ Rappel des versions précédentes

### v2.0.0 (FAIT)
| Fonctionnalité | Statut |
|----------------|--------|
| rawLines / rawLinesByTag | ✅ |
| 18 critères de comparaison | ✅ |
| Combiner SOUR/NOTE à la fusion | ✅ |
| Préférer donnée la plus complète | ✅ |
| Contrôles pré-fusion/suppression | ✅ |

### v2.1.0 (FAIT)
| Fonctionnalité | Statut |
|----------------|--------|
| Rapport qualité à l'upload | ✅ |
| Incohérences chronologiques (7 règles) | ✅ |
| Normalisation intelligente des lieux | ✅ |
| Statistiques généalogiques | ✅ |
| Références orphelines | ✅ |
| Score de suspicion (🔴🟡🟢) | ✅ |
| 371 tests (8 catégories) | ✅ |

---

## 🎯 Objectifs v2.2.0

### Principe directeur
> **Donner le contrôle à l'utilisateur sur les conflits et permettre l'exploitation des données**

---

## 📋 Fonctionnalités planifiées

### 🔴 PRIORITÉ HAUTE (P1)

#### 1. Détection des conflits lors de la fusion
**Origine** : Roadmap v2.0.0 (#6)

**Objectif** : Identifier les valeurs contradictoires AVANT de fusionner.

**Définition d'un conflit** :
Deux valeurs non-nulles ET différentes ET incompatibles.

| Valeur 1 | Valeur 2 | Conflit ? |
|----------|----------|-----------|
| "1726" | "19 SEP 1726" | ❌ Non (compatible - même année) |
| "1726" | "1730" | ✅ OUI (années différentes) |
| "Paris" | "Paris, France" | ❌ Non (compatible - inclusion) |
| "Paris" | "Lyon" | ✅ OUI (villes différentes) |

**Structure de conflit** :
```javascript
conflict = {
  field: 'birth',           // Champ concerné
  label: 'Date de naissance',
  value1: '15 MAR 1726',
  value2: '15 MAR 1730',
  person1Id: 'I504017',
  person2Id: 'I504018',
  person1Name: 'Jean /MARTIN/',
  person2Name: 'Jean Pierre /MARTIN/',
  resolved: false,
  chosenValue: null,        // Valeur choisie par l'utilisateur
  chosenSource: null        // 'person1' | 'person2' | 'manual'
}
```

**Champs à vérifier** :
- birth (date naissance)
- birthPlace (lieu naissance)
- death (date décès)
- deathPlace (lieu décès)
- baptism, baptismPlace
- burial, burialPlace
- occupation
- religion

**Implémentation** :
```javascript
const detectMergeConflicts = (person1, person2) => {
  const conflicts = [];
  
  const fieldsToCheck = [
    { key: 'birth', label: 'Date de naissance', type: 'date' },
    { key: 'birthPlace', label: 'Lieu de naissance', type: 'place' },
    { key: 'death', label: 'Date de décès', type: 'date' },
    { key: 'deathPlace', label: 'Lieu de décès', type: 'place' },
    { key: 'baptism', label: 'Date de baptême', type: 'date' },
    { key: 'burial', label: 'Date d\'inhumation', type: 'date' },
    { key: 'occupation', label: 'Profession', type: 'text' },
  ];
  
  fieldsToCheck.forEach(({ key, label, type }) => {
    const v1 = person1[key];
    const v2 = person2[key];
    
    if (v1 && v2 && !areValuesCompatible(v1, v2, type)) {
      conflicts.push({
        field: key,
        label,
        value1: v1,
        value2: v2,
        person1Id: person1.id,
        person2Id: person2.id,
        person1Name: person1.names[0] || person1.id,
        person2Name: person2.names[0] || person2.id,
        resolved: false,
        chosenValue: null
      });
    }
  });
  
  return conflicts;
};

const areValuesCompatible = (v1, v2, type) => {
  if (type === 'date') {
    // Extraire les années
    const year1 = extractYear(v1);
    const year2 = extractYear(v2);
    // Compatible si même année ou une seule année connue
    if (year1 && year2) return year1 === year2;
    return true;
  }
  
  if (type === 'place') {
    // Compatible si l'un contient l'autre
    const norm1 = v1.toLowerCase().trim();
    const norm2 = v2.toLowerCase().trim();
    return norm1.includes(norm2) || norm2.includes(norm1);
  }
  
  // Texte : compatible si identique (insensible à la casse)
  return v1.toLowerCase().trim() === v2.toLowerCase().trim();
};
```

---

#### 2. Interface de résolution des conflits
**Origine** : Roadmap v2.0.0 (#7)

**Objectif** : Permettre à l'utilisateur de choisir quelle valeur conserver.

**Maquette UI** :
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ⚠️ 3 CONFLITS DÉTECTÉS                                                      │
│ Choisissez les valeurs à conserver pour chaque conflit                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ CONFLIT 1/3 : Date de naissance                                             │
│ Jean /MARTIN/ (I504017) ↔ Jean Pierre /MARTIN/ (I504018)                    │
│                                                                             │
│ ┌─────────────────────────┐    ┌─────────────────────────┐                  │
│ │ ○ 15 MAR 1726          │    │ ● 15 MAR 1730          │                  │
│ │   Source: I504017       │    │   Source: I504018       │                  │
│ └─────────────────────────┘    └─────────────────────────┘                  │
│                                                                             │
│ ───────────────────────────────────────────────────────────────────────────│
│                                                                             │
│ CONFLIT 2/3 : Lieu de naissance                                             │
│                                                                             │
│ ┌─────────────────────────┐    ┌─────────────────────────┐                  │
│ │ ● Paris                 │    │ ○ Lyon                  │                  │
│ └─────────────────────────┘    └─────────────────────────┘                  │
│                                                                             │
│ ───────────────────────────────────────────────────────────────────────────│
│                                                                             │
│ CONFLIT 3/3 : Profession                                                    │
│                                                                             │
│ ┌─────────────────────────┐    ┌─────────────────────────┐                  │
│ │ ○ Laboureur             │    │ ○ Cultivateur           │                  │
│ └─────────────────────────┘    └─────────────────────────┘                  │
│                                                                             │
│ ○ Saisir manuellement : [____________________________]                      │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ Conflits résolus : 2/3                                                      │
│                                                                             │
│ [Annuler]                              [Appliquer et fusionner] (désactivé) │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Comportement** :
1. Le modal s'affiche AVANT la fusion si des conflits sont détectés
2. L'utilisateur doit résoudre TOUS les conflits
3. Option "Saisir manuellement" pour entrer une valeur personnalisée
4. Bouton "Appliquer" activé uniquement quand tous les conflits sont résolus

**Nouvel état React** :
```javascript
const [mergeConflicts, setMergeConflicts] = useState([]);
const [showConflictModal, setShowConflictModal] = useState(false);
const [pendingMergePair, setPendingMergePair] = useState(null);
```

---

#### 3. Nettoyage des FAM orphelines après fusion
**Origine** : Roadmap v2.0.0 (#8)

**Objectif** : Supprimer ou corriger les familles devenues invalides.

**Cas d'invalidité** :

| Cas | Description | Action |
|-----|-------------|--------|
| HUSB = WIFE | Mari et femme pointent vers la même personne | Supprimer FAM |
| HUSB supprimé | Mari pointe vers ID inexistant | Retirer HUSB |
| WIFE supprimée | Femme pointe vers ID inexistant | Retirer WIFE |
| Tous membres fusionnés | Plus aucun membre valide | Supprimer FAM |
| FAM vide | Ni HUSB, ni WIFE, ni CHIL | Supprimer FAM |

**Implémentation** :
```javascript
const cleanOrphanFamilies = (families, mergeMap, deletedIds) => {
  const validFamilies = new Map();
  
  families.forEach((fam, famId) => {
    // Résoudre les IDs fusionnés
    let husb = fam.husband;
    let wife = fam.wife;
    let children = [...(fam.children || [])];
    
    // Appliquer les fusions
    if (husb && mergeMap.has(husb)) husb = mergeMap.get(husb);
    if (wife && mergeMap.has(wife)) wife = mergeMap.get(wife);
    children = children.map(c => mergeMap.has(c) ? mergeMap.get(c) : c);
    
    // Retirer les IDs supprimés
    if (deletedIds.has(husb)) husb = null;
    if (deletedIds.has(wife)) wife = null;
    children = children.filter(c => !deletedIds.has(c));
    
    // Dédupliquer les enfants
    children = [...new Set(children)];
    
    // Vérifier la validité
    const isValid = (
      // Au moins un membre
      (husb || wife || children.length > 0) &&
      // HUSB ≠ WIFE
      !(husb && wife && husb === wife)
    );
    
    if (isValid) {
      validFamilies.set(famId, {
        ...fam,
        husband: husb,
        wife: wife,
        children: children
      });
    }
  });
  
  return validFamilies;
};
```

**Rapport de nettoyage** :
```
🧹 NETTOYAGE DES FAMILLES

Familles analysées : 2,891
Familles supprimées : 12
  - 3 avec HUSB = WIFE (après fusion)
  - 5 sans aucun membre valide
  - 4 avec références cassées

Familles modifiées : 45
  - 23 HUSB retirés (ID supprimé)
  - 18 WIFE retirées (ID supprimé)
  - 4 listes CHIL mises à jour
```

---

### 🟡 PRIORITÉ MOYENNE (P2)

#### 4. Fusion en cascade (dépendances ID)
**Origine** : Roadmap v2.0.0 (#9)

**Objectif** : Gérer les chaînes de fusion A→B→C.

**Problème** :
```
Sélections utilisateur :
  I001 → I002 (fusionner I001 dans I002)
  I002 → I003 (fusionner I002 dans I003)

Sans cascade :
  I001 pointe vers I002 (qui n'existe plus !)

Avec cascade :
  I001 → I003
  I002 → I003
```

**Implémentation** :
```javascript
const resolveTransitiveMerges = (mergeMap) => {
  const resolved = new Map(mergeMap);
  let changed = true;
  let iterations = 0;
  const maxIterations = 100; // Sécurité anti-boucle infinie
  
  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;
    
    resolved.forEach((target, source) => {
      // Si la cible est elle-même une source, suivre la chaîne
      if (resolved.has(target) && resolved.get(target) !== target) {
        resolved.set(source, resolved.get(target));
        changed = true;
      }
    });
  }
  
  if (iterations >= maxIterations) {
    console.warn('resolveTransitiveMerges: boucle détectée, arrêt forcé');
  }
  
  return resolved;
};
```

**Détection de boucles** :
```javascript
const detectMergeLoops = (mergeMap) => {
  const loops = [];
  
  mergeMap.forEach((target, source) => {
    const visited = new Set([source]);
    let current = target;
    
    while (mergeMap.has(current)) {
      if (visited.has(current)) {
        loops.push([...visited, current]);
        break;
      }
      visited.add(current);
      current = mergeMap.get(current);
    }
  });
  
  return loops;
};
```

---

#### 5. Export CSV
**Origine** : Roadmap v2.1.0 (#7)

**Objectif** : Permettre l'export des données pour analyse externe.

**Fichiers exportables** :

| Fichier | Colonnes |
|---------|----------|
| individus.csv | id, nom, prenom, sexe, naissance, lieu_naissance, deces, lieu_deces, pere_id, mere_id |
| familles.csv | id, mari_id, femme_id, date_mariage, lieu_mariage, nb_enfants |
| doublons.csv | id1, id2, nom1, nom2, score, niveau, criteres |
| erreurs.csv | type, severite, id, message |

**Implémentation** :
```javascript
const exportToCSV = (data, filename, columns) => {
  // En-tête
  const header = columns.map(c => c.label).join(';');
  
  // Lignes
  const rows = data.map(item => 
    columns.map(c => {
      const value = c.getter(item);
      // Échapper les guillemets et points-virgules
      if (typeof value === 'string' && (value.includes(';') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(';')
  );
  
  // Créer le fichier
  const csv = [header, ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }); // BOM UTF-8
  
  // Télécharger
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
```

**Boutons d'export** :
```
┌─────────────────────────────────────────┐
│ 📥 EXPORTER LES DONNÉES                 │
├─────────────────────────────────────────┤
│ [📋 Individus (CSV)]  [👨‍👩‍👧 Familles (CSV)] │
│ [🔍 Doublons (CSV)]   [⚠️ Erreurs (CSV)]  │
│ [📦 Tout (JSON)]                         │
└─────────────────────────────────────────┘
```

---

#### 6. Export JSON complet
**Origine** : Roadmap v2.1.0 (#7)

**Objectif** : Export structuré pour intégration avec d'autres outils.

**Structure** :
```json
{
  "metadata": {
    "version": "2.2.0",
    "gedcomVersion": "5.5.1",
    "exportDate": "2026-01-02T10:30:00Z",
    "sourceFile": "sample.ged"
  },
  "statistics": {
    "individuals": 7234,
    "families": 2891,
    "sources": 1456,
    "duplicatesFound": 156
  },
  "quality": {
    "completeness": {
      "withBirth": 78,
      "withBirthPlace": 45
    },
    "chronoErrors": 12,
    "chronoWarnings": 45,
    "orphanRefs": 8
  },
  "individuals": [
    {
      "id": "I001",
      "names": ["Jean /MARTIN/"],
      "sex": "M",
      "birth": "15 MAR 1726",
      "birthPlace": "Paris, France",
      "death": "22 NOV 1798",
      "deathPlace": "Paris, France",
      "fatherId": "I045",
      "motherId": "I046",
      "spouseIds": ["I002"],
      "childIds": ["I100", "I101", "I102"]
    }
  ],
  "families": [
    {
      "id": "F001",
      "husbandId": "I001",
      "wifeId": "I002",
      "marriageDate": "12 JUN 1750",
      "marriagePlace": "Paris, France",
      "childIds": ["I100", "I101", "I102"]
    }
  ],
  "duplicates": [
    {
      "person1Id": "I001",
      "person2Id": "I500",
      "score": 92,
      "level": "FORT",
      "criteria": ["nom", "naissance", "parents"]
    }
  ],
  "issues": [
    {
      "type": "BIRTH_AFTER_DEATH",
      "severity": "error",
      "personId": "I234",
      "message": "Naissance (1800) après décès (1790)"
    }
  ]
}
```

---

### 🟢 PRIORITÉ BASSE (P3)

#### 7. Filtre par branche patronymique
**Origine** : Roadmap v2.1.0 (#8)

**Objectif** : Analyser uniquement les personnes d'un patronyme donné.

**Interface** :
```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 ANALYSER UNE BRANCHE                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Patronyme : [MARTIN____________] [🔍 Analyser]              │
│                                                             │
│ Suggestions : MARTIN (234) | DUPONT (189) | BERNARD (156)   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ 📊 RÉSULTATS POUR /MARTIN/ (234 individus)                  │
│                                                             │
│ • 12 doublons probables (5 FORT, 4 MOYEN, 3 FAIBLE)         │
│ • 3 incohérences chronologiques                             │
│ • 45 données manquantes (naissance, lieu...)                │
│ • Période : 1650 - 1950                                     │
│ • Lieux principaux : Paris (45), Lyon (23), Marseille (12)  │
│                                                             │
│ [Voir les doublons /MARTIN/]  [Exporter la branche]         │
└─────────────────────────────────────────────────────────────┘
```

**Implémentation** :
```javascript
const filterBySurname = (individuals, surname) => {
  const normalizedSurname = surname.toUpperCase().trim();
  
  return individuals.filter(person => {
    return person.names.some(name => {
      const match = name.match(/\/([^/]+)\//);
      if (match) {
        return match[1].toUpperCase() === normalizedSurname;
      }
      return false;
    });
  });
};

const getSurnameStats = (individuals) => {
  const stats = {};
  
  individuals.forEach(person => {
    person.names.forEach(name => {
      const match = name.match(/\/([^/]+)\//);
      if (match) {
        const surname = match[1].toUpperCase();
        stats[surname] = (stats[surname] || 0) + 1;
      }
    });
  });
  
  return Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name, count]) => ({ name, count }));
};
```

---

## 📊 Résumé des priorités

| # | Fonctionnalité | Origine | Priorité | Complexité | Impact |
|---|----------------|---------|----------|------------|--------|
| 1 | Détection conflits fusion | v2.0.0 | 🔴 P1 | Moyenne | Fort |
| 2 | Interface résolution conflits | v2.0.0 | 🔴 P1 | Haute | Fort |
| 3 | Nettoyage FAM orphelines | v2.0.0 | 🔴 P1 | Moyenne | Fort |
| 4 | Fusion en cascade | v2.0.0 | 🟡 P2 | Moyenne | Moyen |
| 5 | Export CSV | v2.1.0 | 🟡 P2 | Faible | Moyen |
| 6 | Export JSON | v2.1.0 | 🟡 P2 | Faible | Moyen |
| 7 | Filtre patronyme | v2.1.0 | 🟢 P3 | Moyenne | Faible |

---

## 🧪 Tests prévus

| Catégorie | Tests | Description |
|-----------|-------|-------------|
| Détection conflits | 12 | Dates, lieux, compatibilité |
| UI résolution | 8 | Modal, sélection, validation |
| Nettoyage FAM | 10 | Tous cas d'invalidité |
| Fusion cascade | 6 | Chaînes, boucles, sécurité |
| Export CSV | 8 | Formats, encodage, colonnes |
| Export JSON | 6 | Structure, validité |
| Filtre patronyme | 5 | Recherche, stats, filtrage |
| **Total** | **~55** | → **~426 tests** |

---

## 📅 Planning prévisionnel

| Phase | Contenu | Estimation |
|-------|---------|------------|
| Phase 1 | Détection conflits + structure | 2h |
| Phase 2 | Modal résolution conflits | 3h |
| Phase 3 | Nettoyage FAM orphelines | 2h |
| Phase 4 | Fusion en cascade | 2h |
| Phase 5 | Export CSV | 2h |
| Phase 6 | Export JSON | 1h |
| Phase 7 | Filtre patronyme | 2h |
| Phase 8 | Tests + documentation | 2h |
| **Total** | | **~16h** |

---

## ✅ Checklist de validation v2.2.0

### P1 - Obligatoire
- [ ] Conflits détectés avant fusion
- [ ] Modal de résolution fonctionnel
- [ ] Tous conflits doivent être résolus
- [ ] FAM orphelines nettoyées après fusion
- [ ] Rapport de nettoyage affiché

### P2 - Important
- [ ] Fusion en cascade A→B→C fonctionne
- [ ] Détection de boucles
- [ ] Export CSV (4 fichiers)
- [ ] Export JSON complet

### P3 - Nice-to-have
- [ ] Filtre par patronyme
- [ ] Suggestions de patronymes
- [ ] Stats par branche

### Technique
- [ ] ~426 tests passent
- [ ] Build Netlify OK
- [ ] Aucune régression v2.1.0
- [ ] Documentation à jour

---

## 🔗 Liens

- **Production** : https://gedcom-merger.netlify.app
- **Dev** : https://dev--gedcom-merger.netlify.app
- **GitHub** : https://github.com/RemyRider/gedcom-merger
- **Branche de travail** : dev

---

## 📚 Historique des roadmaps

| Version | Focus | Statut |
|---------|-------|--------|
| v2.0.0 | Préservation données (rawLines) | ✅ Fait |
| v2.1.0 | Contrôle qualité avancé | ✅ Fait |
| v2.2.0 | Conflits + Exports | 📋 En cours |

---

*Document créé le 2 janvier 2026*
*Version 2.2.0 - Gestion des conflits et exports*
