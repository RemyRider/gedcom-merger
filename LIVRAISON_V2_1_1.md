# Livraison v2.1.1 - GEDCOM Merger

**Date** : 2 janvier 2026  
**Objectif** : Détails enrichis dans l'onglet "À supprimer"

---

## Résumé des modifications

### Amélioration de l'onglet "À supprimer"

**Avant (v2.1.0)** :
```
┌─────────────────────────────────────────┐
│ Jean /MARTIN/                           │
│ [Totalement isolé]          [Sélectionner]
└─────────────────────────────────────────┘
```

**Après (v2.1.1)** :
```
┌─────────────────────────────────────────────────────────────┐
│ Jean /MARTIN/                                               │
│ I12345                            [Totalement isolé] [✓]    │
├─────────────────────────────────────────────────────────────┤
│ Sexe: ♂ Homme  │ Naissance: 1726  │ Décès: 1798  │ Prof: - │
├─────────────────────────────────────────────────────────────┤
│ 👨‍👩 Parents:   Aucun                                         │
│ 💑 Conjoints: ⚠️ Marie /DUPONT/                              │
│ 👶 Enfants:   ⚠️ Pierre /MARTIN/, Jean /MARTIN/             │
├─────────────────────────────────────────────────────────────┤
│ ⚠️ Attention: Cette personne a des relations familiales.    │
│ La supprimer créera des références orphelines.              │
└─────────────────────────────────────────────────────────────┘
```

---

## Détail des modifications

### 1. Fonction `detectToDeletePersons` améliorée

**Avant** :
```javascript
toDelete.push({ 
  ...person, 
  hasSpouses,   // booléen
  hasParents,   // booléen
  hasChildren   // booléen
});
```

**Après** :
```javascript
toDelete.push({ 
  ...person, 
  hasSpouses,
  hasParents,
  hasChildren,
  parentIds: person.parents || [],      // IDs des parents
  spouseIds: person.spouses || [],      // IDs des conjoints
  childrenIds: childrenIds              // IDs des enfants (calculés)
});
```

### 2. Affichage enrichi

| Élément | Description |
|---------|-------------|
| ID | Affiché en police mono sous le nom |
| Détails | Grille 4 colonnes : Sexe, Naissance, Décès, Profession |
| Parents | Noms complets, fond jaune si présents |
| Conjoints | Noms complets, fond jaune si présents |
| Enfants | Noms complets, fond jaune si présents |
| Avertissement | Encart orange si relations existantes |

---

## Fichiers modifiés

| Fichier | Modifications |
|---------|---------------|
| src/App.jsx | VERSION 2.1.1, CHANGELOG, detectToDeletePersons, UI À supprimer |
| tests/test-complete.cjs | +6 tests (section 8.8) |
| package.json | Version 2.1.1 |
| CHANGELOG.md | Entrée v2.1.1 |

---

## Tests

✅ **377/377 tests passent (100%)**

| Catégorie | Tests |
|-----------|-------|
| 1. Fondamentaux | 61 |
| 2. Parsing GEDCOM | 52 |
| 3. Détection doublons | 42 |
| 4. Fusion & suppression | 34 |
| 5. Interface utilisateur | 79 |
| 6. Suggestions IA | 18 |
| 7. Config & déploiement | 39 |
| **8. Qualité & analyses v2.1.x** | **52** |
| **TOTAL** | **377** |

### Nouveaux tests (8.8)

| Test | Description |
|------|-------------|
| Stockage parentIds | Vérifier parentIds dans toDelete |
| Stockage spouseIds | Vérifier spouseIds dans toDelete |
| Stockage childrenIds | Vérifier childrenIds dans toDelete |
| Affichage Parents | Emoji 👨‍👩 et texte |
| Affichage Conjoints | Emoji 💑 et texte |
| Affichage Enfants | Emoji 👶 et texte |

---

## Déploiement

```bash
# Extraire le ZIP
unzip gedcom-v2.1.1-final.zip

# Copier vers le repo
cp -r gedcom-v2.1.1/* /chemin/vers/GEDCOM-Merger-GitHub-Ready/

# Déployer sur dev
cd /chemin/vers/GEDCOM-Merger-GitHub-Ready/
git checkout dev
git add .
git commit -m "v2.1.1 - Détails enrichis onglet À supprimer"
git push origin dev
```

---

## Avantages utilisateur

1. **Meilleure compréhension** : L'utilisateur voit immédiatement pourquoi une personne est suggérée à la suppression
2. **Décision éclairée** : Les noms des parents/conjoints/enfants permettent de vérifier avant de supprimer
3. **Prévention d'erreurs** : L'avertissement rappelle les conséquences de la suppression
4. **Gain de temps** : Plus besoin de chercher les relations dans un autre onglet
