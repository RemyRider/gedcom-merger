# 🚀 SETUP GITHUB - GUIDE PAS À PAS

**Temps estimé :** 10 minutes  
**Prérequis :** Mac avec Terminal

---

## 📋 ÉTAPE 1 : Créer un compte GitHub (si pas déjà fait)

1. Aller sur https://github.com
2. Cliquer "Sign up"
3. Suivre les instructions (email, mot de passe, username)
4. Vérifier votre email
5. ✅ Compte créé !

**Si vous avez déjà un compte GitHub, passez à l'étape 2.**

---

## 📂 ÉTAPE 2 : Créer le repository sur GitHub

1. **Aller sur** : https://github.com/new

2. **Remplir le formulaire** :
   ```
   Repository name: gedcom-merger
   Description: Application web React pour détecter et fusionner les doublons GEDCOM
   
   🔘 Public (recommandé pour déploiement gratuit Netlify)
   OU
   🔘 Private (si vous préférez garder le code privé)
   
   ⚠️ NE PAS cocher "Add a README file"
   ⚠️ NE PAS ajouter .gitignore
   ⚠️ NE PAS choisir de licence maintenant
   ```

3. **Cliquer** : "Create repository"

4. **GitHub vous affiche une page avec des commandes**
   - ✅ Gardez cette page ouverte, on va l'utiliser !
   - Vous verrez : `git remote add origin https://github.com/VOTRE_USERNAME/gedcom-merger.git`

---

## 💻 ÉTAPE 3 : Préparer le projet sur votre Mac

### 3.1 Télécharger le projet

1. **Télécharger** le fichier `gedcom-merger-v1.8.6-COMPLET.zip` que je vous ai fourni

2. **Extraire** l'archive dans un dossier facile à trouver
   - Exemple : `~/Documents/gedcom-merger-v1.8.6`
   - OU : `~/Desktop/gedcom-merger-v1.8.6`

3. **Noter le chemin** de votre dossier (vous en aurez besoin)

### 3.2 Ouvrir le Terminal

**Appuyez sur** : `⌘ + Espace`  
**Tapez** : `terminal`  
**Appuyez sur** : `Entrée`

✅ Le Terminal s'ouvre !

---

## 🎯 ÉTAPE 4 : Configurer Git (une seule fois)

**Copiez-collez ces commandes dans le Terminal** (une par une, Entrée après chaque) :

```bash
# Configurer votre nom (remplacez par votre vrai nom)
git config --global user.name "Votre Nom Complet"

# Configurer votre email (le même que GitHub !)
git config --global user.email "votre.email@example.com"

# Vérifier la configuration
git config --list
```

**Vous devez voir** :
```
user.name=Votre Nom Complet
user.email=votre.email@example.com
```

✅ Configuration OK !

---

## 📦 ÉTAPE 5 : Initialiser Git dans votre projet

**Attention : Adaptez le chemin selon OÙ vous avez extrait le projet !**

### Si vous avez extrait dans Documents :
```bash
cd ~/Documents/gedcom-merger-v1.8.6
```

### Si vous avez extrait sur le Bureau :
```bash
cd ~/Desktop/gedcom-merger-v1.8.6
```

### Si vous avez extrait ailleurs :
```bash
cd /chemin/complet/vers/gedcom-merger-v1.8.6
```

**Vérifier que vous êtes au bon endroit** :
```bash
ls
```

**Vous devez voir** :
```
CHANGELOG.md    dist/           package.json    src/
DEPLOIEMENT.md  index.html      netlify.toml    vite.config.js
README.md       node_modules/   ...
```

✅ Vous êtes au bon endroit !

---

## 🔄 ÉTAPE 6 : Premier commit

**Copiez-collez ces commandes** (une par une) :

```bash
# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "🚀 Version 1.8.6 initiale - Fusionneur GEDCOM"

# Renommer la branche en main
git branch -M main
```

**Vous devez voir** :
```
[main (root-commit) abc1234] 🚀 Version 1.8.6 initiale
 XX files changed, XXXX insertions(+)
```

✅ Premier commit créé !

---

## 🌐 ÉTAPE 7 : Connecter à GitHub

**IMPORTANT : Remplacez `VOTRE_USERNAME` par votre vrai username GitHub !**

Exemple : Si votre username est "remiol", la commande devient :
```bash
git remote add origin https://github.com/remiol/gedcom-merger.git
```

**Commande à adapter** :
```bash
# ⚠️ ADAPTEZ CETTE COMMANDE avec votre username !
git remote add origin https://github.com/VOTRE_USERNAME/gedcom-merger.git

# Vérifier la connexion
git remote -v
```

**Vous devez voir** :
```
origin  https://github.com/VOTRE_USERNAME/gedcom-merger.git (fetch)
origin  https://github.com/VOTRE_USERNAME/gedcom-merger.git (push)
```

✅ Connexion établie !

---

## 🚀 ÉTAPE 8 : Premier push vers GitHub

**Copiez-collez cette commande** :

```bash
git push -u origin main
```

**GitHub va demander votre authentification** :

### Première fois :
- Une fenêtre s'ouvre dans votre navigateur
- Cliquez "Authorize Git Credential Manager"
- Entrez votre mot de passe GitHub si demandé
- ✅ Authentification sauvegardée !

**Vous devez voir** :
```
Enumerating objects: XX, done.
Counting objects: 100% (XX/XX), done.
...
To https://github.com/VOTRE_USERNAME/gedcom-merger.git
 * [new branch]      main -> main
```

✅ Code envoyé sur GitHub ! 🎉

---

## 🎉 ÉTAPE 9 : Vérifier sur GitHub

1. **Aller sur** : https://github.com/VOTRE_USERNAME/gedcom-merger

2. **Vous devez voir** :
   - ✅ Tous vos fichiers
   - ✅ Le README affiché
   - ✅ "1 commit" en haut
   - ✅ Badge vert "main"

**Bravo ! Votre code est sur GitHub !** 🎊

---

## 🌐 ÉTAPE 10 : Connecter Netlify à GitHub

### 10.1 Se connecter à Netlify

1. **Aller sur** : https://app.netlify.com
2. **Se connecter** avec votre compte (celui qui a le site gedcom-merger)

### 10.2 Configurer le déploiement continu

1. **Aller sur votre site** : https://app.netlify.com/sites/gedcom-merger/overview

2. **Cliquer sur** : "Site configuration"

3. **Dans le menu latéral** : "Build & deploy"

4. **Section "Build settings"** : Cliquer "Link repository"

5. **Choisir** : GitHub

6. **Autoriser Netlify** à accéder à GitHub (si première fois)

7. **Sélectionner** : Le repository `gedcom-merger`

8. **Configurer le build** :
   ```
   Branch to deploy: main
   
   Build command: npm run build
   
   Publish directory: dist
   ```

9. **Cliquer** : "Deploy site"

**Netlify va automatiquement** :
- ✅ Cloner votre repo
- ✅ Installer les dépendances (npm install)
- ✅ Builder le projet (npm run build)
- ✅ Déployer le résultat

**Temps : 2-3 minutes** ⏱️

### 10.3 Vérifier le déploiement

1. **Aller sur** : "Deploys" dans le menu Netlify

2. **Vous devez voir** :
   - 🟢 "Published" (après quelques minutes)
   - OU 🟡 "Building" (en cours)

3. **Une fois Published** :
   - Cliquer sur le deploy
   - Cliquer sur le lien du site
   - ✅ Votre application est en ligne !

---

## 🎯 ÉTAPE 11 : Test du workflow complet

**Faisons un petit test pour vérifier que tout fonctionne !**

### 11.1 Modifier un fichier

```bash
# Toujours dans le Terminal, dans votre dossier projet

# Ouvrir le README dans votre éditeur
open README.md

# Ou utiliser nano dans le Terminal :
nano README.md
```

**Faites une petite modification** :
- Ajoutez une ligne de texte
- Exemple : "Test de déploiement automatique"

**Sauvegarder** :
- Si TextEdit : ⌘ + S puis fermer
- Si nano : Ctrl + X, puis Y, puis Entrée

### 11.2 Commit et push

```bash
# Ajouter la modification
git add README.md

# Créer un commit
git commit -m "Test: modification du README"

# Envoyer vers GitHub
git push
```

### 11.3 Observer le déploiement automatique

1. **Aller sur Netlify** : https://app.netlify.com/sites/gedcom-merger/deploys

2. **Vous devez voir** :
   - Un nouveau deploy qui se lance automatiquement ! 🎉
   - Status : "Building..."
   - Puis après 2-3 min : "Published"

3. **Rafraîchir votre site** : https://gedcom-merger.netlify.app
   - ✅ Votre modification est en ligne !

**🎊 FÉLICITATIONS ! Le workflow complet fonctionne !**

---

## 📝 RÉSUMÉ : Les 3 commandes que vous utiliserez

**Dorénavant, à chaque fois que vous modifiez quelque chose :**

```bash
# 1. Aller dans le dossier
cd ~/Documents/gedcom-merger-v1.8.6

# 2. Préparer et sauvegarder
git add .
git commit -m "Description de ce que j'ai changé"

# 3. Envoyer
git push
```

**Temps : 10 secondes** ⚡

**Et Netlify déploie automatiquement !** 🚀

---

## 🎓 Commandes Git utiles

```bash
# Voir l'état actuel
git status

# Voir l'historique des commits
git log

# Voir les modifications non commitées
git diff

# Annuler les modifications locales (avant commit)
git checkout -- fichier.txt

# Voir les branches
git branch

# Tirer les modifications depuis GitHub (si collaboration)
git pull
```

---

## ❓ Dépannage

### Erreur : "fatal: not a git repository"
**Solution** : Vous n'êtes pas dans le bon dossier
```bash
cd ~/Documents/gedcom-merger-v1.8.6
```

### Erreur : "Permission denied (publickey)"
**Solution** : Problème d'authentification GitHub
1. Aller sur https://github.com/settings/tokens
2. Créer un Personal Access Token
3. Utiliser le token comme mot de passe

### Erreur : "Updates were rejected"
**Solution** : Votre version locale est en retard
```bash
git pull origin main
git push
```

### Le build Netlify échoue
**Solution** : Vérifier les logs dans Netlify
1. Aller sur le deploy qui a échoué
2. Lire les logs
3. Souvent : problème de dépendances ou de configuration

---

## 🎉 Workflow pour Claude

**Maintenant, quand vous travaillez avec moi :**

```
Vous : "Claude, je veux améliorer la détection des clusters"

Moi : 
- Je clone votre repo GitHub
- Je fais les modifications
- Je vous fournis un patch ou les commandes Git
- Vous faites : git add . && git commit -m "..." && git push
- Netlify déploie automatiquement

Temps total : 5 minutes max ! ⚡
```

**Avantages** :
- ✅ Je pars de la vraie dernière version
- ✅ Historique complet des modifications
- ✅ Rollback facile si problème
- ✅ Déploiement automatique
- ✅ Workflow professionnel

---

## 🎯 Prochaines étapes

Une fois le setup terminé, vous pourrez :

1. **Demander des évolutions** à Claude
2. **Je clone votre repo** en 5 secondes
3. **Je fais les modifications**
4. **Vous push** en 10 secondes
5. **Netlify déploie** automatiquement
6. **✅ Nouvelle version en ligne** en 2-3 minutes

**Workflow ultra-efficace !** 🚀

---

## 📞 Aide

Si vous rencontrez un problème, demandez à Claude :
- "Claude, j'ai cette erreur Git : [copier l'erreur]"
- Je vous aide en temps réel !

---

**🎊 Bravo pour avoir mis en place un workflow professionnel !**

Vous avez maintenant :
- ✅ Votre code sur GitHub
- ✅ Déploiement automatique sur Netlify  
- ✅ Historique complet des versions
- ✅ Workflow efficace avec Claude

**Temps de setup : 10 minutes**  
**Gain de temps futur : 10-15 min par session avec Claude**

---

**Document créé le** : 16 décembre 2025  
**Par** : Claude Assistant  
**Pour** : Rémiol - Setup GitHub + Netlify
