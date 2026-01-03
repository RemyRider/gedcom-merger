# Livraison v2.1.3 - GEDCOM Merger

**Date** : 2 janvier 2026  
**Objectif** : Vrais tests unitaires avec Vitest

---

## Résumé

Cette version ajoute **108 vrais tests unitaires** utilisant Vitest, en plus des 385 tests statiques existants. Les fonctions pures ont été extraites dans `src/utils/` pour permettre des tests isolés.

---

## Différence tests statiques vs Vitest

| Aspect | Tests statiques (avant) | Tests Vitest (nouveau) |
|--------|-------------------------|------------------------|
| **Type** | `includes()` sur le code | Exécution réelle |
| **Méthode** | Vérifie présence de texte | Appelle les fonctions |
| **Données** | Aucune | Fixtures GEDCOM |
| **Assertions** | Code présent | Valeurs retournées |
| **Framework** | Node.js basique | Vitest |

---

## Nouveaux fichiers

### src/utils/helpers.mjs
Fonctions utilitaires pures :
- `extractYear(dateStr)` - Extrait l'année d'une date GEDCOM
- `normalizePlace(place)` - Retire le code postal
- `normalizeFirstName(name)` - Normalise les prénoms (variantes)
- `soundex(str)` - Calcule le code Soundex français
- `normalizePlaceFull(place)` - Normalise un lieu complet
- `getSuspicionLevel(score, criteriaCount)` - Niveau de suspicion doublon

### src/utils/parser.mjs
- `parseGedcom(content)` - Parse un fichier GEDCOM complet

### src/utils/stats.mjs
- `calculateGenealogyStats(people, families)` - Statistiques généalogiques
- `detectChronologicalIssues(people, families)` - Incohérences chronologiques

### src/utils/index.mjs
- Export centralisé de toutes les fonctions

### vitest.config.mjs
- Configuration Vitest pour les tests

---

## Tests Vitest créés

### tests/helpers.test.mjs (47 tests)
```
✓ extractYear - 10 tests
  - Date complète, année seule, ABT, BEF, AFT, null, vide...
  
✓ normalizePlace - 5 tests
  - Code postal, sans code, null, vide, espaces...
  
✓ normalizeFirstName - 11 tests
  - Jean, Jehan, Johan, Johannes, Marie, Maria, Pierre...
  
✓ soundex - 6 tests
  - Vide, null, Martin, Dupont, variantes...
  
✓ normalizePlaceFull - 6 tests
  - PARIS, Paris FRANCE, null, virgules...
  
✓ getSuspicionLevel - 6 tests
  - FORT, MOYEN, FAIBLE selon score et critères
  
✓ NAME_VARIANTS - 3 tests
  - Structure, contenu variantes
```

### tests/parser.test.mjs (30 tests)
```
✓ Cas de base - 3 tests
  - Fichier vide, simple, structure retour
  
✓ Individus - 12 tests
  - ID, nom, sexe, dates, lieux, profession, FAMS...
  
✓ Familles - 4 tests
  - Création, HUSB, WIFE, CHIL
  
✓ Relations - 4 tests
  - Parents, enfants, conjoints, FAMC
  
✓ rawLines - 4 tests
  - Stockage, rawLinesByTag, SOUR, NOTE
  
✓ Cas limites - 3 tests
  - Sans individus, sans nom, sans sexe
```

### tests/stats.test.mjs (31 tests)
```
✓ Structure - 2 tests
  - Propriétés retournées, tableau vide
  
✓ Genre - 4 tests
  - Hommes, femmes, inconnus, total
  
✓ Âges - 5 tests
  - Moyenne, min, max, exclusion >120, absence dates
  
✓ Période - 4 tests
  - Min, max, span, générations estimées
  
✓ Patronymes - 3 tests
  - Comptage, tri fréquence, uniques
  
✓ Prénoms - 2 tests
  - Masculins, féminins
  
✓ Familles - 4 tests
  - Comptage, avec/sans enfants, max enfants, moyenne
  
✓ detectChronologicalIssues - 7 tests
  - BIRTH_AFTER_DEATH, PARENT_BORN_AFTER_CHILD,
    PARENT_TOO_YOUNG, PARENT_TOO_OLD, EXTREME_LONGEVITY,
    dates normales, absence dates
```

---

## Scripts npm

| Commande | Action |
|----------|--------|
| `npm run test` | Exécute les tests Vitest (108) |
| `npm run test:watch` | Vitest en mode watch |
| `npm run test:static` | Tests statiques (385) |
| `npm run test:all` | **Tous les tests (493)** |

---

## Résultats des tests

```
═══════════════════════════════════════════════════════════════════════════════
                              TESTS STATIQUES
═══════════════════════════════════════════════════════════════════════════════
  📊 Tests exécutés: 385
  ✅ Réussis: 385
  ❌ Échoués: 0
  
  ✅ Version 2.1.3 validée (tests statiques)

═══════════════════════════════════════════════════════════════════════════════
                              TESTS VITEST
═══════════════════════════════════════════════════════════════════════════════
 ✓ tests/helpers.test.mjs  (47 tests)
 ✓ tests/parser.test.mjs   (30 tests)
 ✓ tests/stats.test.mjs    (31 tests)

 Test Files  3 passed (3)
      Tests  108 passed (108)
      
═══════════════════════════════════════════════════════════════════════════════
                              TOTAL: 493 TESTS ✅
═══════════════════════════════════════════════════════════════════════════════
```

---

## Netlify build

Le fichier `netlify.toml` a été mis à jour :
```toml
[build]
  command = "npm ci && npm run test:all && npm run build"
```

Netlify exécutera maintenant :
1. Installation des dépendances (npm ci)
2. Tests statiques (385)
3. Tests Vitest (108)
4. Build production (vite build)

---

## Fichiers modifiés

| Fichier | Modifications |
|---------|---------------|
| src/App.jsx | VERSION 2.1.3, CHANGELOG |
| src/utils/helpers.mjs | **NOUVEAU** - Fonctions utilitaires |
| src/utils/parser.mjs | **NOUVEAU** - Parser GEDCOM |
| src/utils/stats.mjs | **NOUVEAU** - Statistiques |
| src/utils/index.mjs | **NOUVEAU** - Exports |
| tests/helpers.test.mjs | **NOUVEAU** - 47 tests |
| tests/parser.test.mjs | **NOUVEAU** - 30 tests |
| tests/stats.test.mjs | **NOUVEAU** - 31 tests |
| tests/test-complete.cjs | VERSION 2.1.3 |
| vitest.config.mjs | **NOUVEAU** - Config Vitest |
| package.json | VERSION 2.1.3, scripts, vitest |
| netlify.toml | test:all |
| CHANGELOG.md | Entrée v2.1.3 |

---

## Déploiement

```bash
cdgedcom
unzip ~/Downloads/gedcom-v2.1.3-final.zip -d /tmp/
cp -r /tmp/gedcom-v2.1.3/* .
git checkout dev
git add .
git commit -m "v2.1.3 - Vrais tests unitaires Vitest (493 tests)"
git push origin dev
```

---

## Avantages

1. **Confiance** : Les fonctions sont réellement testées avec des données
2. **Régression** : Détection immédiate si une modification casse quelque chose
3. **Documentation** : Les tests servent de documentation vivante
4. **Refactoring** : Possibilité de refactorer en toute sécurité
5. **CI/CD** : Netlify bloquera un déploiement si les tests échouent
