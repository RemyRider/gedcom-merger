# Corrections v2.3.0 - Instructions

## ⚠️ Modifications requises dans test-complete.cjs

Après avoir copié les nouveaux fichiers, exécuter ces commandes :

```bash
# 1. Corriger la version dans le titre
sed -i "s/SUITE DE TESTS GEDCOM MERGER v2.2.6/SUITE DE TESTS GEDCOM MERGER v2.3.0/g" tests/test-complete.cjs

# 2. Corriger le compteur de tests (482 → 527 avec les 45 nouveaux)
sed -i "s/482 TESTS STATIQUES AU TOTAL/527 TESTS STATIQUES AU TOTAL/g" tests/test-complete.cjs
sed -i "s/482 TESTS STATIQUES/527 TESTS STATIQUES/g" tests/test-complete.cjs

# 3. Corriger la vérification de version package.json
sed -i "s/packageJson.version === '2.2.6'/packageJson.version === '2.3.0'/g" tests/test-complete.cjs
sed -i "s/Version 2.2.6 dans package.json/Version 2.3.0 dans package.json/g" tests/test-complete.cjs

# 4. Ajouter les tests v2.3.0 à la fin du fichier (avant le résumé final)
# Copier le contenu de test-v2.3.0-static.cjs et l'insérer dans test-complete.cjs
```

## Alternative : Script automatique

```bash
# Exécuter dans le dossier du repo
cd /chemin/vers/gedcom-merger

# Corrections version
sed -i '' 's/v2.2.6/v2.3.0/g' tests/test-complete.cjs
sed -i '' "s/=== '2.2.6'/=== '2.3.0'/g" tests/test-complete.cjs
sed -i '' 's/482/527/g' tests/test-complete.cjs
```

**Note macOS** : Utiliser `sed -i ''` au lieu de `sed -i`
