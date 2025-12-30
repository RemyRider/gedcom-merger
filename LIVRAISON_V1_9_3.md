# Livraison GEDCOM Merger v1.9.3

**Date** : 30 décembre 2025  
**Version** : 1.9.3  
**Base** : Corrections chirurgicales sur v1.9.2 stable

---

## 4 Corrections implémentées

### 1. ✅ Onglet "À supprimer" (remplace "Isolés")

**Critères stricts :**
- Totalement isolé = sans parents ET sans enfants ET sans conjoints
- OU Sans identité = pas de nom ET pas de prénom

**Implémentation :**
- Fonction `detectToDeletePersons()` remplace `detectIsolatedPersons()`
- États `toDeletePersons` et `selectedToDelete`
- Boutons de sélection : "Totalement isolés", "Sans identité"

### 2. ✅ Bouton flottant

**Position :** `fixed bottom-6 right-6 z-50`

**Boutons :**
- "Fusionner X doublon(s)" - indigo
- "Supprimer X individu(s)" - rouge

### 3. ✅ Tableau clusters détaillé

**9 colonnes :**
1. # (numéro)
2. Nom complet
3. Naissance
4. Lieu
5. Décès
6. Sexe
7. Parents (via getPersonName)
8. Conjoints (via getPersonName)
9. ID

**Statistiques :** Avec naissance, Avec décès, Paires liées

### 4. ✅ Action "Supprimer" distincte

- Fonction `handleDeleteToDelete()` séparée de `handleMerge()`
- Confirmation `window.confirm()` obligatoire
- Compteurs `mergedCount` et `deletedCount` distincts

---

## Tests

```
✅ SUCCÈS: 89/89 tests passés
```

## Fichiers livrés

```
gedcom-merger-v1.9.3/
├── src/App.jsx         # Composant principal
├── src/main.jsx        # Point d'entrée
├── src/index.css       # Tailwind
├── index.html          # Template
├── package.json        # v1.9.3
├── vite.config.js      # esbuild
├── tailwind.config.js
├── postcss.config.js
├── tests/test-complete.cjs
├── docs/ARCHITECTURE.md
├── docs/TESTS.md
├── README.md
├── CHANGELOG.md
├── DEPLOIEMENT.md
├── LIVRAISON_V1_9_3.md
└── RAPPORT_TESTS_V1_9_3.md
```

## Déploiement

```bash
npm install
npm run build
# Upload dist/ sur Netlify
```

---

**Validé par** : Claude  
**À déployer sur** : gedcom-merger.netlify.app
