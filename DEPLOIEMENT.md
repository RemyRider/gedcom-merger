# Guide de Déploiement GEDCOM Merger v1.9.3

## Prérequis

- Node.js 18+
- npm ou yarn

## Installation locale

```bash
# Extraire le ZIP
unzip gedcom-merger-v1.9.3.zip
cd gedcom-merger-v1.9.3

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

## Build production

```bash
npm run build
```

Le dossier `dist/` contient les fichiers à déployer.

## Déploiement Netlify

### Option 1 : Upload manuel
1. Exécuter `npm run build`
2. Aller sur https://app.netlify.com
3. Drag & drop le dossier `dist/`

### Option 2 : GitHub + Auto-deploy
1. Pousser sur GitHub
2. Connecter le repo à Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`

## URLs

- **Production** : https://gedcom-merger.netlify.app
- **Dev** : https://dev--gedcom-merger.netlify.app

## Vérification post-déploiement

1. Charger un fichier GEDCOM de test
2. Vérifier les 4 onglets (Clusters, Doublons, À supprimer, IA)
3. Tester le bouton flottant
4. Vérifier le tableau détaillé des clusters
5. Tester une fusion et une suppression

## Rollback

En cas de problème, revenir à v1.9.2 :
```bash
git checkout v1.9.2
npm run build
# Redéployer
```
