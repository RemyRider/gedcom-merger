# 🌳 Fusionneur de Doublons GEDCOM v1.9.0

Application web React pour détecter et fusionner intelligemment les doublons dans vos fichiers GEDCOM, avec détection des individus isolés et suggestions IA.

## 🚀 Démo

**Production** : https://gedcom-merger.netlify.app  
**Développement** : https://dev--gedcom-merger.netlify.app

## ✨ Fonctionnalités

### 🔍 Détection intelligente des doublons
- Parser GEDCOM complet (INDI, FAM, relations)
- Algorithme Soundex adapté au français
- Dictionnaire de 40 variantes de prénoms français
- 9 critères de similarité pondérés
- Triple indexation pour performances optimales
- Détection automatique des clusters (3+ personnes)

### 👥 4 onglets d'analyse

| Onglet | Description |
|--------|-------------|
| **Clusters** | Groupes de 3+ personnes interconnectées avec score moyen |
| **Doublons** | Paires de doublons classiques avec prévisualisation |
| **Isolés** | Individus sans parents ni enfants (nettoyage) |
| **Suggestions IA** | Analyse patterns avec score de confiance |

### 🧹 Gestion des individus isolés
- Détection automatique des personnes sans famille
- Distinction : totalement isolés vs avec conjoints
- Sélection en masse (tout / totalement isolés / désélectionner)
- Suppression sécurisée avec confirmation

### 🤖 Suggestions intelligentes (IA)
- Analyse des patterns nom + période temporelle
- Score de confiance 60-95%
- Prise en compte : lieux communs, parents communs
- Guide pour les cas complexes

### 📍 Normalisation des lieux
- Retrait automatique des codes INSEE
- Exemple : "38142 Mizoen" → "Mizoen"
- Conservation des noms historiques

### 🛡️ Contrôles d'intégrité
- Détection des dates incohérentes
- Alerte parents trop jeunes/vieux
- Individus sans nom

### 💾 Export sécurisé
- Génération automatique HEAD/TRLR si manquants
- Gestion correcte des balises CONT/CONC
- Fichier compatible avec tous les logiciels

## 🛠️ Technologies

- React 18.3.1
- Vite 5.4.2 (build avec esbuild)
- Tailwind CSS 3.4
- Lucide React (icônes)

## 📦 Installation locale

```bash
# Cloner le repo
git clone https://github.com/RemyRider/gedcom-merger.git
cd gedcom-merger

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production
npm run build
```

## 🌐 Déploiement Netlify

### Option 1 : Drag & Drop
1. Glissez le dossier `dist/` sur https://app.netlify.com/drop

### Option 2 : Déploiement continu
1. Connectez votre repo GitHub à Netlify
2. Build command : `npm install && npm run build`
3. Publish directory : `dist`

## 🔒 Sécurité & Confidentialité

- ✅ Traitement 100% côté client
- ✅ Aucune donnée envoyée à un serveur
- ✅ Headers de sécurité configurés
- ✅ Protection XSS automatique (React)

## 📊 Workflow Git recommandé

```bash
# Développement sur branche dev
git checkout dev
# ... modifications ...
git add .
git commit -m "v1.9.x - description"
git push origin dev

# Test sur https://dev--gedcom-merger.netlify.app

# Si OK, passage en production
git checkout main
git merge dev
git push origin main

# Déploiement auto sur https://gedcom-merger.netlify.app
```

## 📄 Licence

Projet personnel - Tous droits réservés

## 👤 Auteur

Développé par Rémiol - Business Analyst & Développeur

## 🐛 Bugs / Suggestions

Ouvrez une issue sur GitHub ou contactez-moi directement.

---

**⭐ Si ce projet vous aide, n'hésitez pas à lui donner une étoile !**
