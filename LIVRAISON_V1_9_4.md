# Livraison v1.9.4 - Fusionneur GEDCOM

**Date** : 30 décembre 2025
**Version** : 1.9.4

## Résumé

Cette version restaure le contrôle d'intégrité avancé (8 types) et améliore l'ergonomie avec des boutons dynamiques.

## Nouvelles fonctionnalités

1. **Contrôle d'intégrité 8 types**
   - Liens bidirectionnels famille-individu
   - Dates incohérentes
   - Boucles généalogiques
   - Structure GEDCOM
   - Références orphelines
   - IDs dupliqués
   - Personnes isolées
   - Score de complétude

2. **Bouton Recommencer dans le header**
   - Visible uniquement après chargement d'un fichier
   - Icône RefreshCw

3. **Boutons de sélection dynamiques**
   - Affichent la valeur du filtre en cours (ex: "≥85%")
   - S'adaptent automatiquement au slider

4. **Modal d'intégrité**
   - Accessible via bouton "Intégrité" dans le header
   - Affiche statistiques et liste des problèmes

## Tests

- **226 tests automatisés** (100% passés)
- Tests exécutés avant chaque build Netlify
- Configuration: `npm test && npm run build`

## Fichiers modifiés

- src/App.jsx (modifications chirurgicales depuis v1.9.3)
- tests/test-complete.cjs (226 tests)
- netlify.toml (tests automatiques)
- package.json, index.html (version)

## Déploiement

```bash
# Extraire le ZIP
unzip gedcom-v1.9.4.zip

# Copier vers le repo
cp -r * /chemin/vers/repo/

# Pousser vers GitHub
git add .
git commit -m "v1.9.4 - Contrôle intégrité 8 types + Boutons dynamiques"
git push origin dev
```

Netlify déploiera automatiquement après les tests.
