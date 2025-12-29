# Documentation des Tests v1.9.3

## Exécution

```bash
npm test
# ou
node tests/test-complete.cjs
```

## Structure des tests

16 niveaux + 3 bonus = 187 tests

### Niveaux principaux

1. **Syntaxe et structure** (10 tests)
2. **Versions et cohérence** (10 tests)
3. **Imports Lucide-React** (15 tests)
4. **États React** (22 tests)
5. **Fonctions principales** (12 tests)
6. **Fonctions onglets** (6 tests)
7. **Fonctions "À supprimer"** (10 tests)
8. **Suggestions IA** (4 tests)
9. **Anti-faux-positifs** (7 tests)
10. **Gestion CONT/CONC** (5 tests)
11. **Génération HEAD/TRLR** (7 tests)
12. **Interface 4 onglets** (8 tests)
13. **Bouton flottant** (6 tests)
14. **Tableau clusters** (11 tests)
15. **Actions distinctes** (9 tests)
16. **Configuration build** (9 tests)

### Niveaux bonus

A. **Changelog** (16 tests)
B. **Responsive/UX** (12 tests)
C. **Compteurs** (8 tests)

## Tests de régression

Chaque nouvelle version doit passer :
- Tous les tests des versions précédentes
- Les nouveaux tests spécifiques

## Ajout de tests

Éditer `tests/test-complete.cjs` et ajouter :

```javascript
check(appCode.includes('maFonction'), 'Description du test');
```
