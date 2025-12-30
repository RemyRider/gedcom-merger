# Guide de Déploiement GEDCOM Merger

## Déploiement Netlify

### Prérequis

- Compte Netlify
- Repository GitHub connecté

### Configuration

Le fichier `netlify.toml` configure automatiquement :
- Commande build : `npm run build`
- Répertoire de sortie : `dist`

### Workflow

1. **Développement** : Pousser sur la branche `dev`
2. **Production** : Merger `dev` vers `main`

Les deux environnements se déploient automatiquement :
- **Dev** : https://dev--gedcom-merger.netlify.app
- **Prod** : https://gedcom-merger.netlify.app

### Vérifications avant déploiement

```bash
npm test          # Exécuter les tests
npm run build     # Vérifier le build
```
