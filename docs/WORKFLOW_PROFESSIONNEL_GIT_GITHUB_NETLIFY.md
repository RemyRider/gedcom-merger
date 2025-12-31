# 🚀 Workflow Professionnel Git + GitHub + Netlify

**Projet** : Fusionneur de Doublons GEDCOM v1.8.6  
**Repository** : https://github.com/RemyRider/gedcom-merger  
**Date de setup** : 16 décembre 2025  
**Environnements** : Dev + Production

---

## 📋 Vue d'ensemble

Vous disposez maintenant d'un workflow professionnel complet avec :

- ✅ **Code versionné** sur GitHub
- ✅ **2 environnements** distincts (dev + production)
- ✅ **Déploiement automatique** sur chaque push
- ✅ **Tests itératifs** sans risque pour la production
- ✅ **Collaboration facilitée** avec Claude

---

## 🌍 Vos environnements

### 🧪 Développement (branche `dev`)

**URL** : https://dev--gedcom-merger.netlify.app

**Usage** :
- Tests de nouvelles fonctionnalités
- Itérations et corrections
- Validation avant mise en production

**Workflow** : Push → Build automatique → Test

---

### ✨ Production (branche `main`)

**URL** : https://gedcom-merger.netlify.app

**Usage** :
- Version stable publique
- Mise à jour uniquement quand satisfait
- Site officiel pour les utilisateurs

**Workflow** : Merge dev → Push → Déploiement production

---

## 💻 Localisation du projet

**Chemin sur votre Mac** :
```
/Users/HotRoads/Library/Mobile Documents/com~apple~CloudDocs/Claude Gedcom/GITHUB/GEDCOM-Merger-GitHub-Ready
```

**Raccourci Terminal** :
```bash
# Vous pouvez créer un alias (optionnel)
alias cdgedcom='cd "/Users/HotRoads/Library/Mobile Documents/com~apple~CloudDocs/Claude Gedcom/GITHUB/GEDCOM-Merger-GitHub-Ready"'
```

---

## 🔄 Workflow quotidien de développement

### Étape 1 : Basculer sur la branche dev

```bash
# Ouvrir Terminal (⌘ + Espace → "terminal")
cd "/Users/HotRoads/Library/Mobile Documents/com~apple~CloudDocs/Claude Gedcom/GITHUB/GEDCOM-Merger-GitHub-Ready"

# Basculer sur dev
git checkout dev
```

**Vérifier** : Le prompt devrait indiquer `(dev)`

---

### Étape 2 : Faire vos modifications

```bash
# Option A : Modifier des fichiers existants
open -a "Visual Studio Code" .  # Si vous utilisez VSCode
# OU
open -a TextEdit src/App.jsx    # Avec TextEdit

# Option B : Travailler avec Claude
# Claude modifie le code et vous fournit les fichiers
```

---

### Étape 3 : Commit et push vers dev

```bash
# 1. Ajouter tous les fichiers modifiés
git add .

# 2. Créer un commit avec un message descriptif
git commit -m "Feature: amélioration détection des clusters"

# 3. Envoyer vers GitHub
git push
```

**Temps** : 10 secondes ⚡

---

### Étape 4 : Tester sur l'environnement de dev

1. **Attendre** : 2-3 minutes (temps du build Netlify)

2. **Vérifier le déploiement** : 
   - https://app.netlify.com/sites/gedcom-merger/deploys
   - Chercher "Branch deploy: dev"
   - Status doit être 🟢 "Published"

3. **Tester** : https://dev--gedcom-merger.netlify.app
   - Vérifier que vos modifications fonctionnent
   - Tester tous les cas d'usage
   - Noter les problèmes éventuels

---

### Étape 5 : Itérer si nécessaire

**Si pas satisfait :**

```bash
# Refaire des modifications
# ... coder ...

# Recommencer les étapes 3-4
git add .
git commit -m "Fix: correction du bug X"
git push

# Tester à nouveau sur dev--gedcom-merger.netlify.app
```

**Répéter autant de fois que nécessaire !** 🔄

**Aucun impact sur la production** : https://gedcom-merger.netlify.app reste inchangé ✅

---

## 🎯 Mise en production

### Quand vous êtes satisfait du résultat sur dev

```bash
# 1. Basculer sur la branche main
git checkout main

# 2. Récupérer les changements de dev
git merge dev

# 3. (Optionnel) Créer un tag de version
git tag -a v1.9.0 -m "Version 1.9.0 - Amélioration détection clusters"

# 4. Envoyer vers GitHub
git push

# 5. (Si tag créé) Envoyer aussi le tag
git push --tags
```

**Résultat** :
- ✅ Netlify détecte le push sur `main`
- ✅ Build et déploiement automatique
- ✅ Production mise à jour en 2-3 minutes
- ✅ Accessible sur https://gedcom-merger.netlify.app

---

## 📊 Schéma du workflow

```
┌─────────────────────────────────────────────────┐
│          VOTRE MAC (Local)                       │
│                                                  │
│  Branche DEV                 Branche MAIN        │
│  ├─ Modifications           ├─ git merge dev    │
│  ├─ Tests                   ├─ Version stable   │
│  └─ Itérations              └─ Production ready │
└─────────────┬──────────────────┬─────────────────┘
              │                  │
         git push            git push
              │                  │
              v                  v
┌──────────────────────────────────────────────────┐
│               GITHUB                              │
│                                                   │
│  Branche dev              Branche main            │
│  └─ Code test            └─ Code production      │
└──────────────┬───────────────────┬────────────────┘
               │                   │
          Webhook              Webhook
               │                   │
               v                   v
┌───────────────────────────────────────────────────┐
│              NETLIFY                               │
│                                                    │
│  🧪 DEV BUILD              ✨ PRODUCTION BUILD    │
│  ├─ npm install           ├─ npm install          │
│  ├─ npm run build         ├─ npm run build        │
│  └─ Deploy                └─ Deploy               │
│                                                    │
│  dev--gedcom-merger       gedcom-merger           │
│  .netlify.app             .netlify.app            │
└───────────────────────────────────────────────────┘
```

---

## 🎓 Commandes Git essentielles

### Gestion des branches

```bash
# Voir toutes les branches
git branch

# Voir la branche actuelle
git branch --show-current

# Basculer sur dev
git checkout dev

# Basculer sur main
git checkout main

# Créer une nouvelle branche
git checkout -b nom-branche
```

---

### Gestion des modifications

```bash
# Voir l'état des fichiers
git status

# Voir les modifications non commitées
git diff

# Voir les modifications d'un fichier spécifique
git diff src/App.jsx

# Ajouter tous les fichiers
git add .

# Ajouter un fichier spécifique
git add src/App.jsx

# Commit avec message
git commit -m "Description du changement"

# Modifier le dernier commit (avant push)
git commit --amend
```

---

### Synchronisation avec GitHub

```bash
# Envoyer vers GitHub
git push

# Récupérer les changements depuis GitHub
git pull

# Voir l'historique des commits
git log

# Voir l'historique compact
git log --oneline

# Voir les branches distantes
git branch -r
```

---

### Fusion et tags

```bash
# Merger dev dans main
git checkout main
git merge dev

# Créer un tag
git tag -a v1.9.0 -m "Description de la version"

# Voir tous les tags
git tag

# Envoyer les tags vers GitHub
git push --tags

# Supprimer un tag local
git tag -d v1.9.0
```

---

### Annulation et récupération

```bash
# Annuler les modifications d'un fichier (avant commit)
git checkout -- src/App.jsx

# Annuler tous les changements non commités
git checkout -- .

# Revenir au dernier commit
git reset --hard HEAD

# Annuler le dernier commit (garde les modifications)
git reset --soft HEAD~1

# Voir les commits supprimés (pour récupération)
git reflog
```

---

## 🔍 Monitoring et débogage

### Netlify Deploy Status

**Tableau de bord** : https://app.netlify.com/sites/gedcom-merger/deploys

**Statuts possibles** :
- 🟡 **Building** : Build en cours
- 🟢 **Published** : Déployé avec succès
- 🔴 **Failed** : Échec du build

**En cas d'échec** :
1. Cliquer sur le deploy échoué
2. Lire les logs d'erreur
3. Corriger le problème localement
4. Recommiter et pusher

---

### GitHub Actions (si configuré)

**Repository** : https://github.com/RemyRider/gedcom-merger/actions

Vérifier :
- ✅ Tests passent
- ✅ Build réussit
- ✅ Pas d'erreurs de lint

---

### Vérification locale avant push

```bash
# Tester le build localement
npm run build

# Lancer en dev pour tester
npm run dev

# Vérifier la syntaxe (si ESLint configuré)
npm run lint
```

---

## 🚨 Situations courantes et solutions

### "Je suis perdu, sur quelle branche je suis ?"

```bash
git branch
# L'étoile (*) indique la branche actuelle
```

---

### "J'ai modifié des fichiers mais je veux annuler"

```bash
# Annuler TOUS les changements
git checkout -- .

# Annuler un fichier spécifique
git checkout -- src/App.jsx
```

---

### "J'ai commité mais pas encore pushé, je veux corriger"

```bash
# Modifier le dernier commit
git commit --amend

# Ou annuler complètement le dernier commit
git reset --soft HEAD~1
# Vos modifications sont conservées, vous pouvez recommiter
```

---

### "J'ai pushé mais je veux revenir en arrière"

```bash
# Option 1 : Créer un nouveau commit qui annule
git revert HEAD
git push

# Option 2 : Force push (DANGER !)
git reset --hard HEAD~1
git push --force
# ⚠️ À utiliser UNIQUEMENT si personne d'autre ne travaille sur le repo
```

---

### "Le build Netlify échoue"

1. **Vérifier les logs** : https://app.netlify.com/sites/gedcom-merger/deploys
2. **Erreurs courantes** :
   - Dépendances manquantes → Vérifier package.json
   - Erreur de syntaxe → Tester `npm run build` localement
   - Variables d'environnement → Configurer dans Netlify

3. **Solution** :
   - Corriger localement
   - Tester avec `npm run build`
   - Commit et push

---

### "Je veux supprimer la branche dev et recommencer"

```bash
# Supprimer la branche locale
git branch -D dev

# Supprimer la branche sur GitHub
git push origin --delete dev

# Recréer proprement
git checkout -b dev
git push -u origin dev
```

---

## 🤝 Workflow avec Claude

### Session type de développement

```
┌─────────────────────────────────────────┐
│  1. Vous décrivez ce que vous voulez    │
│     "Claude, améliore la détection      │
│      des clusters pour X raison"        │
└─────────────────┬───────────────────────┘
                  │
                  v
┌─────────────────────────────────────────┐
│  2. Claude analyse votre repo GitHub    │
│     git clone RemyRider/gedcom-merger   │
│     → Il voit tout l'historique         │
│     → Il comprend le contexte           │
└─────────────────┬───────────────────────┘
                  │
                  v
┌─────────────────────────────────────────┐
│  3. Claude code la solution             │
│     → Modifications dans src/App.jsx    │
│     → Tests de cohérence                │
│     → Documentation mise à jour         │
└─────────────────┬───────────────────────┘
                  │
                  v
┌─────────────────────────────────────────┐
│  4. Claude vous fournit le code         │
│     → Fichiers complets                 │
│     → OU patch Git                      │
│     → OU instructions précises          │
└─────────────────┬───────────────────────┘
                  │
                  v
┌─────────────────────────────────────────┐
│  5. Vous appliquez sur votre Mac        │
│     git checkout dev                    │
│     [Appliquer les modifications]       │
│     git add .                           │
│     git commit -m "..."                 │
│     git push                            │
└─────────────────┬───────────────────────┘
                  │
                  v
┌─────────────────────────────────────────┐
│  6. Vous testez sur DEV                 │
│     → https://dev--gedcom-merger...     │
│     → Vérifier la nouvelle feature      │
│     → Noter ce qui ne va pas            │
└─────────────────┬───────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
    Pas OK ?           OK ?
         │                 │
         v                 v
    ┌────────┐      ┌──────────┐
    │ Retour │      │ Mettre   │
    │ étape 1│      │ en PROD  │
    └────────┘      └──────────┘
                         │
                         v
                   git checkout main
                   git merge dev
                   git push
```

---

### Exemple concret de session

**Session 1 : Première itération**

```
Vous : "Claude, ajoute un bouton pour sauvegarder 
       les réglages de filtrage"

Claude : [clone le repo]
         [code la fonctionnalité]
         [vous fournit les fichiers]

Vous : git checkout dev
       [coller le code fourni par Claude]
       git add .
       git commit -m "Feature: sauvegarde réglages filtrage"
       git push

→ Test sur dev--gedcom-merger.netlify.app
→ Constat : Le bouton apparaît mais ne sauvegarde pas 
            correctement dans localStorage
```

**Session 2 : Correction**

```
Vous : "Le bouton apparaît mais localStorage ne 
       fonctionne pas, regarde la console"

Claude : [voit l'historique du commit précédent]
         [comprend le problème]
         [corrige le code]

Vous : [applique la correction]
       git add .
       git commit -m "Fix: correction sauvegarde localStorage"
       git push

→ Test sur dev--gedcom-merger.netlify.app
→ Constat : Ça fonctionne parfaitement !
```

**Session 3 : Production**

```
Vous : git checkout main
       git merge dev
       git tag -a v1.9.0 -m "Feature: sauvegarde réglages"
       git push
       git push --tags

→ Production mise à jour !
→ Feature disponible sur gedcom-merger.netlify.app
```

---

### Avantages de ce workflow avec Claude

✅ **Pas de réexplication** : Claude clone votre repo et voit tout  
✅ **Contexte complet** : Historique des commits et évolutions  
✅ **Itérations rapides** : Test → Feedback → Correction  
✅ **Production protégée** : Jamais de risque sur l'URL publique  
✅ **Traçabilité** : Chaque changement est versionné et expliqué  

---

## 📚 Ressources supplémentaires

### Documentation dans votre projet

- **README.md** : Documentation principale de l'application
- **CHANGELOG.md** : Historique des versions
- **SETUP_GITHUB_COMPLET.md** : Guide détaillé du setup initial
- **DEPLOIEMENT.md** : Instructions de déploiement

---

### Liens utiles

- **Repo GitHub** : https://github.com/RemyRider/gedcom-merger
- **Netlify Dashboard** : https://app.netlify.com/sites/gedcom-merger
- **Production** : https://gedcom-merger.netlify.app
- **Dev** : https://dev--gedcom-merger.netlify.app
- **GitHub Settings** : https://github.com/RemyRider/gedcom-merger/settings

---

### Documentation Git

- **Git Book (FR)** : https://git-scm.com/book/fr/v2
- **Atlassian Git Tutorial** : https://www.atlassian.com/git/tutorials
- **Oh Shit Git** : https://ohshitgit.com/fr (pour se sortir des situations difficiles)

---

### Documentation Netlify

- **Netlify Docs** : https://docs.netlify.com
- **Deploy Contexts** : https://docs.netlify.com/site-deploys/overview/#deploy-contexts
- **Branch Deploys** : https://docs.netlify.com/site-deploys/overview/#branch-deploy-controls

---

## 🎯 Checklist de vérification

### Setup initial (une fois) ✅

- [x] Compte GitHub créé
- [x] Repository `gedcom-merger` créé
- [x] Git configuré avec nom et email
- [x] Code pushé sur `main`
- [x] Netlify connecté à GitHub
- [x] Production déployée sur `main`
- [x] Branche `dev` créée
- [x] Netlify configuré pour déployer `dev`
- [x] Dev déployé sur branche `dev`

---

### Avant chaque session de travail

- [ ] Terminal ouvert
- [ ] Dans le bon répertoire
- [ ] Sur la branche `dev` (`git branch` pour vérifier)
- [ ] Dernière version récupérée (`git pull`)

---

### Avant de pusher

- [ ] Code testé localement (`npm run dev`)
- [ ] Build fonctionne (`npm run build`)
- [ ] Message de commit descriptif préparé

---

### Avant mise en production

- [ ] Testé plusieurs fois sur `dev--gedcom-merger.netlify.app`
- [ ] Aucun bug bloquant détecté
- [ ] Fonctionnalité complète et utilisable
- [ ] Documentation mise à jour si nécessaire

---

## 🎉 Récapitulatif

**Vous maîtrisez maintenant :**

✅ **Git** : add, commit, push, merge, branches  
✅ **GitHub** : Repository, historique, collaboration  
✅ **Netlify** : Déploiement automatique, 2 environnements  
✅ **Workflow pro** : dev → test → prod  
✅ **Collaboration avec Claude** : Itérations efficaces  

**Temps économisé par session avec Claude** : 10-15 minutes  
**Gain de productivité** : Énorme ! 🚀  

---

## 💡 Derniers conseils

1. **Commiter souvent** : Petits commits fréquents > gros commits rares
2. **Messages clairs** : "Fix bug filtrage" > "modif"
3. **Tester sur dev** : TOUJOURS avant de merger sur main
4. **Demander à Claude** : En cas de doute sur Git, demandez-moi !
5. **Sauvegarder** : GitHub est votre sauvegarde, mais gardez une copie locale aussi

---

**Document créé le** : 16 décembre 2025  
**Par** : Claude Assistant (Sonnet 4.5)  
**Pour** : Rémiol - Setup professionnel Git + GitHub + Netlify  
**Version** : 1.0

---

**🎊 Félicitations pour votre setup professionnel ! 🎊**

Vous êtes maintenant équipé comme dans une vraie équipe de développement.  
Bon développement avec votre Fusionneur GEDCOM ! 🌳
