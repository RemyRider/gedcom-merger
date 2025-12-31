# Livraison GEDCOM Merger v2.0.0

**Date** : 31 décembre 2025  
**Version** : 2.0.0  
**Phase** : 1 - Préservation complète des données GEDCOM

---

## 🎯 Objectif de cette version

> **Aucune donnée GEDCOM ne doit être perdue lors de la fusion**

Cette version pose les bases d'une fusion sans perte en stockant les lignes GEDCOM brutes et en les fusionnant intelligemment.

---

## ✨ Modifications apportées

### 1. Structure currentPerson étendue (parseGedcom)

```javascript
currentPerson = {
  // Existant...
  
  // NOUVEAU v2.0.0
  rawLines: [line],           // Stocke TOUTES les lignes
  rawLinesByTag: {}           // Indexe par tag de niveau 1
}
```

### 2. Stockage des lignes brutes (parseGedcom)

Chaque ligne GEDCOM est maintenant :
- Ajoutée à `rawLines[]`
- Indexée dans `rawLinesByTag{}` si c'est un tag spécial

Tags indexés :
- SOUR, NOTE, OBJE, EVEN
- EDUC, NATI, IMMI, EMIG, CENS, WILL, PROB
- Tous les tags custom `_TAG`

### 3. Fusion des rawLinesByTag (mergePersonData)

```javascript
// Nouveau code ajouté
const mergedRawLinesByTag = {};
const allTags = new Set([
  ...Object.keys(primary.rawLinesByTag || {}),
  ...Object.keys(secondary.rawLinesByTag || {})
]);

// Déduplication SOUR par référence @Sxxx@
// Combinaison des autres tags
```

### 4. Export des tags fusionnés (generateMergedIndiLines)

Les tags stockés dans `rawLinesByTag` sont maintenant écrits dans le fichier de sortie :

```javascript
// Ordre des tags
const tagsOrder = ['SOUR', 'OBJE', 'EVEN', 'EDUC', ...];

// Export tags connus puis custom
tagsOrder.forEach(tag => { ... });
Object.keys(merged.rawLinesByTag)
  .filter(tag => tag.startsWith('_'))
  .forEach(tag => { ... });
```

---

## 🧪 Tests

- **295 tests** (22 niveaux + 6 bonus)
- **18 nouveaux tests** (BONUS F) pour v2.0.0
- **100% de réussite**

### Nouveaux tests BONUS F

| Test | Vérifie |
|------|---------|
| rawLines présent | Structure initiale |
| rawLinesByTag présent | Structure initiale |
| Stockage lignes | rawLines.push |
| Tags SOUR, OBJE, EVEN | Indexation |
| Tags custom _TAG | Indexation |
| mergedRawLinesByTag | Fusion |
| Déduplication SOUR | Par référence |
| Export dans generateMergedIndiLines | Utilisation |

---

## 📁 Fichiers modifiés

| Fichier | Modification |
|---------|--------------|
| src/App.jsx | +50 lignes (parseGedcom, mergePersonData, generateMergedIndiLines) |
| tests/test-complete.cjs | +18 tests (BONUS F) |
| package.json | Version 2.0.0 |
| index.html | Version 2.0.0 |
| CHANGELOG.md | Nouvelle entrée |

---

## 🚀 Déploiement

```bash
# 1. Extraire
unzip gedcom-v2.0.0.zip
cd gedcom-v2.0.0

# 2. Copier vers repo
cp -r * /chemin/vers/GEDCOM-Merger-GitHub-Ready/

# 3. Git
cd /chemin/vers/GEDCOM-Merger-GitHub-Ready
git checkout dev
git add .
git commit -m "v2.0.0 - Phase 1: Préservation données GEDCOM"
git push origin dev
```

---

## 📋 Prochaines phases (Roadmap v2.0.0)

| Phase | Contenu | Statut |
|-------|---------|--------|
| **Phase 1** | rawLines + fusion SOUR/NOTE | ✅ FAIT |
| Phase 2 | Choix meilleure valeur (date complète > année) | À faire |
| Phase 3 | Détection conflits + UI résolution | À faire |
| Phase 4 | Nettoyage FAM orphelines + fusion cascade | À faire |

---

**Validé par** : Claude  
**À déployer sur** : gedcom-merger.netlify.app
