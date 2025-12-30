# Guide de Déploiement GEDCOM Merger

## Déploiement Netlify

### Prérequis

- Compte Netlify
- Repository GitHub connecté

### Configuration

Le fichier `netlify.toml` configure automatiquement :
- **Tests automatiques** : `npm test` s'exécute AVANT chaque build
- Commande build : `npm run build`
- Répertoire de sortie : `dist`

**Si les tests échouent, le build est bloqué** → Protection contre les régressions !

### Workflow

1. **Développement** : Pousser sur la branche `dev`
2. **Production** : Merger `dev` vers `main`

Les deux environnements se déploient automatiquement :
- **Dev** : https://dev--gedcom-merger.netlify.app
- **Prod** : https://gedcom-merger.netlify.app

### Vérifications avant déploiement

```bash
npm test          # 226 tests doivent passer
npm run build     # Vérifier le build
```

### Logs Netlify

Si un déploiement échoue, vérifier les logs :
- ✅ Tests passés → Build continue
- ❌ Tests échoués → Build bloqué avec détail des échecs
