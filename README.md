# Fusionneur de Doublons GEDCOM v1.9.3

Application web moderne pour détecter et fusionner intelligemment les doublons dans vos fichiers GEDCOM (format standard de généalogie).

## 🚀 Fonctionnalités

### Détection intelligente
- **Algorithme Soundex français** adapté aux noms de famille français
- **Triple indexation** pour des performances optimales sur les grands arbres
- **Système de scoring hybride** avec 9 critères pondérés
- **Protection anti-faux-positifs** : un critère suffisant requis au-delà du nom

### Interface multi-onglets
- **🟠 Clusters** : groupes de 3+ personnes potentiellement identiques
- **🔵 Doublons** : paires simples avec score de similarité
- **🔴 À supprimer** : individus totalement isolés ou sans identité
- **🟣 Suggestions IA** : patterns suspects détectés automatiquement

### Actions distinctes
- **Fusionner** : combine les données de plusieurs doublons (enrichissement)
- **Supprimer** : retire définitivement les individus isolés de l'arbre

### UX optimisée
- **Bouton flottant** pour actions rapides sans scroller
- **Tableau détaillé** des clusters avec toutes les informations
- **Prévisualisation** avant fusion
- **Responsive** : mobile, tablette, desktop

## 📋 Critères de détection

### Critères nécessaires
- Nom similaire (Soundex)
- Même sexe (ou indéterminé)

### Critères suffisants (au moins 1 requis)
- Date de naissance identique ou proche
- Lieu de naissance identique
- Parents communs
- Conjoints communs
- Même fratrie
- Date de décès identique
- Même profession

## 🔴 Onglet "À supprimer"

Remonte uniquement les cas critiques :
1. **Totalement isolés** : sans ascendants, sans descendants, sans conjoints
2. **Sans identité** : sans nom ET sans prénom

## 🛠️ Installation locale

```bash
npm install
npm run dev
```

## 🚀 Déploiement Netlify

```bash
npm run build
# Upload du dossier dist/ sur Netlify
```

## 📁 Structure du projet

```
gedcom-merger-v1.9.3/
├── src/
│   ├── App.jsx          # Composant principal
│   ├── main.jsx         # Point d'entrée React
│   └── index.css        # Styles Tailwind
├── index.html           # Page HTML
├── package.json         # Dépendances
├── vite.config.js       # Config Vite (esbuild)
├── tailwind.config.js   # Config Tailwind
├── postcss.config.js    # Config PostCSS
├── netlify.toml         # Config Netlify
├── README.md            # Ce fichier
├── CHANGELOG.md         # Historique versions
└── LIVRAISON_V1_9_3.md  # Notes de livraison
```

## 📊 Performances

- Build : ~6 secondes
- Bundle gzippé : ~60 KB
- Réduction comparaisons : 99%+ grâce à la triple indexation

## 📄 Licence

Usage personnel - Développé pour le nettoyage d'arbres généalogiques MyHeritage.

---
Version 1.9.3 - 28 décembre 2025
