# Livraison v2.0.0 - GEDCOM Merger

**Date** : 2 janvier 2026  
**Objectif** : Phase 1 - Préservation complète des données GEDCOM + améliorations scoring + contrôles intégrité

---

## Résumé des modifications

### 1. Préservation des données GEDCOM

**Problème résolu** : Les versions précédentes ne conservaient que les champs connus, perdant les tags SOUR, NOTE, OBJE et tags custom.

**Solution** :
```javascript
currentPerson = {
  // champs existants...
  rawLines: [],        // TOUTES les lignes GEDCOM
  rawLinesByTag: {}    // Indexées par tag
};
```

### 2. Extension des critères de comparaison (11 → 18)

**Nouveaux critères ajoutés** :

| Critère | Points | Logique |
|---------|--------|---------|
| Baptême | 5 | Date exacte ou année |
| Lieu baptême | 4 | Identique ou similaire |
| Inhumation | 5 | Date exacte ou année |
| Lieu inhumation | 4 | Identique ou similaire |
| Résidence | 4 | Identique ou similaire |
| Titre | 3 | Identique |
| Religion | 3 | Identique |

**Score max possible** : 190 points (vs 136 avant)

### 3. Comparaison par nom (parents/conjoints/enfants)

**Problème** : Deux doublons ont souvent des conjoints/parents avec des IDs différents mais le même nom.

**Avant** :
```javascript
const common = person1.spouses.filter(s => person2.spouses.includes(s));
// Si Paul /RONNA/ = I500310 et I501510 → pas de match
```

**Après** :
```javascript
// Si IDs différents, comparer par nom
const spouseNames1 = person1.spouses.map(id => getPersonName(id));
const commonNames = spouseNames1.filter(n => spouseNames2.includes(n));
// Paul /RONNA/ = Paul /RONNA/ → match !
```

### 4. Contrôles d'intégrité avant fusion

**Nouveau** : Vérifications automatiques avant toute fusion :

| Type | Comportement |
|------|--------------|
| Sexes incompatibles | ❌ **Bloquant** - Fusion refusée |
| Écart naissance >5 ans | ⚠️ Warning - Confirmation demandée |
| Lieux naissance différents | ⚠️ Warning - Confirmation demandée |
| Écart décès >5 ans | ⚠️ Warning - Confirmation demandée |

### 5. Contrôles d'intégrité avant suppression

**Nouveau** : Avertissements avant suppression :

- Personne avec enfants → "ils perdront leur lien parental"
- Personne avec conjoints → "ils perdront leur lien conjugal"
- Personne référencée comme parent → "est parent de X personne(s)"

### 6. Correction sélection clusters

**Problème** : Le bouton "Sélectionner ≥X%" des clusters ne fonctionnait pas pour la fusion.

**Cause** : `autoSelectHighConfidenceClusters` mettait à jour `selectedClusters` mais pas `selectedPairs`.

**Correction** : La fonction ajoute maintenant les paires correspondantes dans `selectedPairs`.

### 7. Affichage complet dans la prévisualisation

**Avant** : Champs conditionnels (affichés seulement si remplis)  
**Après** : 16 champs toujours affichés avec "N/A" si vide

### 8. Suppression de l'encart "Nouveauté"

L'encart "Nouveauté v1.9.3" sur la page d'upload a été supprimé.

---

## Fichiers modifiés

| Fichier | Modifications |
|---------|---------------|
| src/App.jsx | +7 critères comparaison, affichage 16 champs, comparaison par nom, rawLines, contrôles intégrité, correction sélection clusters |
| CHANGELOG.md | Mise à jour v2.0.0 |
| README.md | 18 critères documentés |
| tests/test-complete.cjs | Réorganisation : 7 catégories, 325 tests |

---

## Tests

✅ **325/325 tests passent (100%)**

Tests réorganisés en 7 catégories :
1. Fondamentaux (61 tests)
2. Parsing GEDCOM (52 tests)
3. Détection doublons (42 tests)
4. Fusion & suppression (34 tests)
5. Interface utilisateur (79 tests)
6. Suggestions IA (18 tests)
7. Configuration & déploiement (39 tests)

---

## Déploiement

```bash
# Extraire le ZIP
unzip gedcom-v2.0.0-fixed.zip

# Copier vers le repo
cp -r gedcom-v2.0.0/* /chemin/vers/GEDCOM-Merger-GitHub-Ready/

# Déployer sur dev
cd /chemin/vers/GEDCOM-Merger-GitHub-Ready/
git checkout dev
git add .
git commit -m "v2.0.0 - Phase 1 complète + contrôles intégrité"
git push origin dev
```

---

## Prochaines étapes (Phase 2)

1. Choix de la meilleure valeur (date complète > année seule)
2. Détection des conflits (valeurs différentes non vides)
3. Interface de résolution des conflits
