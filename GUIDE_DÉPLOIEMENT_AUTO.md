# 🚀 Guide de déploiement automatique v1.8.6

**3 solutions pour déployer automatiquement votre Fusionneur GEDCOM !**

---

## 🎯 Diagnostic du problème actuel

**Problème détecté** : Le serveur MCP Netlify nécessite une reconnexion d'authentification.

**Solutions proposées** :
1. **Scripts automatisés** (Linux/Mac et Windows) ⭐ NOUVEAU
2. **Netlify CLI manuel** (commandes simples)
3. **Drag & Drop optimisé** (30 secondes)

---

## ✨ SOLUTION 1 : Scripts de déploiement automatisés (RECOMMANDÉ)

### Pour Linux / Mac / WSL

```bash
# 1. Aller dans le dossier du projet
cd gedcom-merger-v1.8.6

# 2. Rendre le script exécutable
chmod +x deploy.sh

# 3. Lancer le déploiement
./deploy.sh
```

**Le script fait tout automatiquement** :
- ✅ Vérifie le dossier dist/
- ✅ Installe Netlify CLI si nécessaire
- ✅ Se connecte à Netlify (une seule fois)
- ✅ Déploie sur gedcom-merger
- ✅ Affiche l'URL du site

**Durée** : 2-3 minutes (première fois), 30 secondes (ensuite)

### Pour Windows (PowerShell)

```powershell
# 1. Ouvrir PowerShell en mode Administrateur
# (Clic droit sur PowerShell → "Exécuter en tant qu'administrateur")

# 2. Autoriser l'exécution de scripts (une seule fois)
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# 3. Aller dans le dossier du projet
cd gedcom-merger-v1.8.6

# 4. Lancer le déploiement
.\deploy.ps1
```

**Le script fait tout automatiquement** :
- ✅ Vérifie le dossier dist/
- ✅ Installe Netlify CLI si nécessaire
- ✅ Se connecte à Netlify (une seule fois)
- ✅ Déploie sur gedcom-merger
- ✅ Affiche l'URL du site

**Durée** : 2-3 minutes (première fois), 30 secondes (ensuite)

---

## 🔧 SOLUTION 2 : Commandes manuelles Netlify CLI

Si vous préférez taper les commandes vous-même :

### Installation (une seule fois)

```bash
npm install -g netlify-cli
```

### Connexion (une seule fois)

```bash
netlify login
```

Cela ouvre votre navigateur pour autoriser l'accès.

### Déploiement

```bash
cd gedcom-merger-v1.8.6
netlify deploy --prod --site gedcom-merger --dir=dist
```

**Durée** : 30 secondes

---

## 📦 SOLUTION 3 : Drag & Drop optimisé

Pour un déploiement sans installation ni ligne de commande :

### Utiliser le ZIP dist-only (NOUVEAU)

J'ai créé un ZIP spécial contenant **uniquement** le dossier dist/ :

**Fichier** : `gedcom-merger-v1.8.6-DIST-ONLY.zip` (60 Ko)

### Étapes

1. **Extraire** le ZIP `gedcom-merger-v1.8.6-DIST-ONLY.zip`

2. **Aller sur Netlify** : https://app.netlify.com/sites/gedcom-merger/deploys

3. **Cliquer** "Deploy manually"

4. **Glisser-déposer** le dossier **`dist/`**

5. **Attendre 30 secondes**

6. ✅ **Déployé !**

**Durée** : 30 secondes

---

## 🔑 SOLUTION 4 : Reconnecter le MCP Netlify

Pour restaurer le déploiement automatique depuis Claude :

1. **Ouvrir les paramètres Claude**
   - Cliquez sur votre profil (en haut à droite)
   - Sélectionnez "Settings"

2. **Aller dans "Integrations"**
   - Cherchez "Netlify" dans la liste

3. **Reconnecter**
   - Cliquez sur "Reconnect" ou "Disconnect" puis "Connect"
   - Autorisez l'accès à votre compte Netlify

4. **Réessayer depuis Claude**
   - Dites : "déploie maintenant sur gedcom-merger"
   - Le déploiement automatique fonctionnera !

---

## ❓ Quelle solution choisir ?

### Vous êtes à l'aise avec la ligne de commande ?
→ **Solution 1 : Scripts automatisés** (le plus simple et reproductible)

### Vous préférez les commandes manuelles ?
→ **Solution 2 : CLI manuel** (contrôle total)

### Vous voulez zero configuration ?
→ **Solution 3 : Drag & Drop** (30 secondes, pas d'installation)

### Vous voulez déployer depuis Claude ?
→ **Solution 4 : Reconnecter MCP** (intégration complète)

---

## 📋 Contenu du package v1.8.6

Vous avez maintenant **3 fichiers** de déploiement :

1. **deploy.sh** (Linux/Mac/WSL)
   - Script Bash automatisé
   - Vérifie tout et déploie

2. **deploy.ps1** (Windows PowerShell)
   - Script PowerShell automatisé
   - Vérifie tout et déploie

3. **gedcom-merger-v1.8.6-DIST-ONLY.zip** (60 Ko)
   - Contient uniquement dist/
   - Prêt pour drag & drop

---

## ✅ Après déploiement

### Vérifications rapides

Testez sur **https://gedcom-merger.netlify.app** :

- [ ] Page se charge
- [ ] Version 1.8.6 affichée dans l'en-tête
- [ ] Upload fichier GEDCOM fonctionne
- [ ] Détection doublons OK
- [ ] Système multi-onglets actif
- [ ] Interface responsive (testez sur mobile)

### Si tout fonctionne ✅

**Félicitations !** Votre Fusionneur GEDCOM v1.8.6 est en production !

---

## 🐛 Dépannage

### Erreur : "netlify: command not found"

**Solution** : Installez Netlify CLI
```bash
npm install -g netlify-cli
```

### Erreur : "You are not logged in"

**Solution** : Connectez-vous
```bash
netlify login
```

### Erreur : "Site not found"

**Solution** : Vérifiez le nom du site
```bash
netlify sites:list
```

Le nom correct est `gedcom-merger`.

### Le script ne s'exécute pas (Linux/Mac)

**Solution** : Rendez-le exécutable
```bash
chmod +x deploy.sh
```

### Le script ne s'exécute pas (Windows)

**Solution** : Autorisez l'exécution (PowerShell Admin)
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

---

## 🎯 Résumé des fichiers

Dans le package complet :

```
gedcom-merger-v1.8.6/
├── deploy.sh                  ← Script Linux/Mac ⭐ NOUVEAU
├── deploy.ps1                 ← Script Windows ⭐ NOUVEAU
├── dist/                      ← Build production (191 Ko)
├── src/                       ← Code source
├── package.json
├── netlify.toml
└── Documentation (.md)
```

Fichier séparé :
```
gedcom-merger-v1.8.6-DIST-ONLY.zip  ← Pour drag & drop (60 Ko) ⭐ NOUVEAU
```

---

## 💡 Recommandations

### Pour un déploiement ponctuel
→ Drag & Drop (Solution 3)

### Pour des déploiements réguliers
→ Scripts automatisés (Solution 1)

### Pour une intégration complète
→ Reconnecter MCP (Solution 4)

---

## 📞 Support

Si vous rencontrez un problème :

1. Consultez la section Dépannage ci-dessus
2. Vérifiez les logs Netlify : https://app.netlify.com/sites/gedcom-merger/deploys
3. Testez localement : `npm run build && npm run preview`

---

**Vous avez maintenant 4 solutions de déploiement !**

**Choisissez celle qui vous convient le mieux et lancez-vous ! 🚀**

---

**Document créé le** : 16 décembre 2025  
**Contact** : Rémiol - Business Analyst
