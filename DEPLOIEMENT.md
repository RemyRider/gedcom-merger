# 📦 Guide de déploiement Netlify - Version 1.8.6

## 🎯 Méthode recommandée : Glisser-Déposer (Drop)

### Étape 1 : Préparer le build

Le dossier `dist` est **déjà inclus** dans le package ZIP. Vous n'avez rien à faire !

### Étape 2 : Déployer sur Netlify

1. **Connectez-vous** à [Netlify](https://app.netlify.com/)
2. **Accédez** à votre site "gedcom-merger"
3. **Cliquez** sur "Deploys" dans le menu
4. **Glissez-déposez** le dossier `dist` sur la zone de drop
5. **Attendez** ~30 secondes

✅ **C'est fait !** Votre site est live à : https://gedcom-merger.netlify.app

---

## 🔄 Méthode alternative : CLI Netlify

### Prérequis

```bash
npm install -g netlify-cli
netlify login
```

### Déploiement manuel

```bash
cd /chemin/vers/gedcom-merger-v1.8.6
netlify deploy --prod --dir=dist --site=gedcom-merger
```

---

## 📋 Checklist post-déploiement

### ✅ Vérifications immédiates

- [ ] Site accessible à l'URL
- [ ] Version 1.8.6 affichée dans l'en-tête
- [ ] Upload de fichier GEDCOM fonctionne
- [ ] Analyse complète se termine sans erreur
- [ ] Export du fichier nettoyé fonctionne
- [ ] Design responsive sur mobile

### ✅ Tests fonctionnels

- [ ] Prévisualisation de fusion s'ouvre
- [ ] Clusters détectés et affichables
- [ ] Recherche et filtrage fonctionnent
- [ ] Sélection groupée opérationnelle
- [ ] Modal se ferme correctement

### ✅ Performance

- [ ] Temps de chargement < 2 secondes
- [ ] Analyse de 500 individus < 5 secondes
- [ ] Pas de lag dans l'interface
- [ ] Progression fluide

---

## 🔧 Configuration Netlify

### Headers de sécurité (automatiques)

Le fichier `netlify.toml` configure automatiquement :

```toml
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### Cache des assets (automatique)

```toml
Cache-Control: public, max-age=31536000, immutable
```

Pour `/assets/*` uniquement.

### Redirections SPA (automatiques)

```toml
/*  ->  /index.html  (200)
```

Assure que React Router fonctionne correctement.

---

## 🌐 Domaine personnalisé (optionnel)

### Ajouter un domaine

1. Dans Netlify, allez dans **Domain management**
2. Cliquez sur **Add custom domain**
3. Entrez votre domaine (ex: `gedcom.votresite.fr`)
4. Suivez les instructions DNS de Netlify

### SSL automatique

Netlify provisionne automatiquement un certificat SSL Let's Encrypt.

Délai : 1-5 minutes après configuration DNS.

---

## 🐛 Dépannage

### Problème : Build échoue sur Netlify

**Cause** : Utilisation de Terser au lieu de esbuild  
**Solution** : Vérifiez `vite.config.js` :
```javascript
minify: 'esbuild'  // Pas 'terser' !
```

### Problème : Site affiche version 1.0.0

**Cause** : Mauvais package déployé  
**Solution** : Vérifiez que c'est bien le dossier `dist` de v1.8.6

### Problème : Erreur 404 sur refresh

**Cause** : Redirections SPA non configurées  
**Solution** : Vérifiez `netlify.toml` présent dans le dossier racine

### Problème : Headers sécurité manquants

**Cause** : `netlify.toml` non déployé  
**Solution** : Le fichier doit être à la racine du site

### Problème : Assets non cachés

**Cause** : Configuration cache incorrecte  
**Solution** : Vérifiez section `[[headers]]` dans `netlify.toml`

---

## 📊 Monitoring (optionnel)

### Analytics Netlify

1. Activez **Analytics** dans les paramètres du site
2. Consultez les statistiques de trafic
3. Surveillez les temps de chargement

### Logs de déploiement

1. Accédez à **Deploys** > Cliquez sur un déploiement
2. Consultez les logs de build
3. Vérifiez la durée du build

---

## 🚀 Déploiement continu (optionnel)

### Configuration Git

Si vous souhaitez activer le déploiement automatique :

1. **Créez** un repository Git (GitHub/GitLab/Bitbucket)
2. **Pushez** le code source (pas le `dist`)
3. Dans Netlify, **connectez** votre repository
4. **Configurez** :
   - Build command: `npm run build`
   - Publish directory: `dist`

À chaque commit, Netlify rebuildera automatiquement.

---

## 📦 Structure du package ZIP

```
gedcom-merger-v1.8.6/
├── dist/                    # Build de production (PRÊT À DÉPLOYER)
│   ├── index.html
│   └── assets/
│       ├── index-*.css
│       ├── index-*.js
│       ├── lucide-*.js
│       └── react-vendor-*.js
├── src/                     # Code source
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── netlify.toml             # Configuration Netlify
├── tailwind.config.js
├── postcss.config.js
├── README.md                # Documentation complète
├── CHANGELOG.md             # Historique des versions
├── DEPLOIEMENT.md           # Ce fichier
└── RAPPORT_TESTS_V1_8_6.md # Rapport de tests détaillé
```

---

## ✅ Validation finale

Avant de considérer le déploiement réussi :

1. **Testez** toutes les fonctionnalités principales
2. **Vérifiez** la version affichée (1.8.6)
3. **Validez** les headers de sécurité (DevTools > Network)
4. **Confirmez** le cache des assets (Cache-Control)
5. **Testez** sur mobile, tablette, desktop

---

## 📞 Support

En cas de problème :

1. **Consultez** les logs de build Netlify
2. **Vérifiez** la console du navigateur (F12)
3. **Relisez** ce guide de déploiement
4. **Consultez** le rapport de tests

---

**Préparé par** : Business Analyst  
**Date** : 16 décembre 2025  
**Version** : 1.8.6

🎉 **Bon déploiement !** 🎉
