# Guide de déploiement - GEDCOM Merger v2.0.0

## Prérequis

- Node.js 18+
- npm ou yarn
- Compte Netlify (gratuit)

## Déploiement rapide

### Option A : Glisser-déposer (le plus simple)

```bash
# 1. Build local
npm install
npm test        # Vérifier que les 295 tests passent
npm run build   # Génère le dossier dist/

# 2. Déploiement
# Aller sur https://app.netlify.com/drop
# Glisser-déposer le dossier dist/
```

### Option B : Via GitHub (recommandé)

```bash
# 1. Copier les fichiers vers votre repo local
cd ~/chemin/vers/GEDCOM-Merger-GitHub-Ready
cp -r ~/Downloads/gedcom-v2.0.0/* .

# 2. Pousser vers GitHub
git checkout dev
git add .
git commit -m "v2.0.0 - Phase 1: Préservation données GEDCOM"
git push origin dev

# 3. Netlify déploie automatiquement sur dev--gedcom-merger.netlify.app

# 4. Si OK, merger vers main pour production
git checkout main
git merge dev
git push origin main
```

## Configuration Netlify (netlify.toml)

```toml
[build]
  command = "npm test && npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
```

Cette configuration :
- Exécute les 295 tests AVANT le build
- Bloque le déploiement si un test échoue
- Publie le dossier dist/

## Vérification post-déploiement

### Checklist

- [ ] URL accessible (https://gedcom-merger.netlify.app)
- [ ] Version affichée : v2.0.0
- [ ] Upload fichier .ged fonctionne
- [ ] Barre de progression s'affiche
- [ ] 4 onglets visibles (Clusters, Doublons, À supprimer, IA)
- [ ] Fusion et export OK
- [ ] CSS chargé correctement (gradients, couleurs)

### Test de non-régression

1. Uploader un fichier GEDCOM de test
2. Vérifier la détection de doublons
3. Sélectionner des paires
4. Exporter le fichier fusionné
5. Vérifier que les SOUR sont préservées dans le fichier de sortie

## Rollback en cas de problème

```bash
# Revenir à la version précédente
git checkout main
git revert HEAD
git push origin main
```

Ou depuis l'interface Netlify : Deploys → Sélectionner un déploiement précédent → "Publish deploy"

## Environnements

| Environnement | URL | Branche |
|---------------|-----|---------|
| Production | https://gedcom-merger.netlify.app | main |
| Développement | https://dev--gedcom-merger.netlify.app | dev |

## Support

En cas de problème :
1. Vérifier les logs Netlify (Deploys → Détails)
2. Vérifier la console navigateur (F12)
3. Créer une issue sur GitHub
