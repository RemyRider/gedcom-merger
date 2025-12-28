# 🌳 Fusionneur de Doublons GEDCOM v1.9.2

Application web React pour détecter et fusionner intelligemment les doublons dans vos fichiers GEDCOM, avec détection des individus isolés et suggestions IA.

## 🎯 CORRECTION MAJEURE v1.9.2

**Problème résolu** : L'algorithme de comparaison générait trop de faux positifs depuis la v1.8.7.

**Cause** : Le système hybride relatif donnait des scores élevés même quand seuls le nom et le sexe correspondaient.

**Solution** : Nouvelle règle anti-faux-positifs :

```
POUR ÊTRE DOUBLON, IL FAUT :
├─ Nom identique (NÉCESSAIRE)
├─ Sexe compatible (NÉCESSAIRE si renseigné)
└─ AU MOINS 1 critère SUFFISANT parmi :
   ├─ Date/année de naissance
   ├─ Lieu de naissance  
   ├─ Parents communs
   ├─ Conjoints communs
   ├─ Fratrie commune
   ├─ Date de décès
   └─ Profession
```

**Exemples** :

| Cas | Données | Verdict v1.9.2 |
|-----|---------|----------------|
| Jean MARTIN (M) seul | Nom + Sexe uniquement | ❌ **REJETÉ** |
| Jean MARTIN (M) né 1950 | Nom + Sexe + Naissance | ✅ **DOUBLON** |
| Jean MARTIN (M) + Marie épouse | Nom + Sexe + Conjoint | ✅ **DOUBLON** |

## 🚀 Fonctionnalités

### Détection intelligente
- Parser GEDCOM complet (INDI, FAM, relations)
- Algorithme Soundex adapté au français
- 40 variantes de prénoms français (Jean/Jehan, Marie/Maria...)
- 9 critères de similarité pondérés
- Triple indexation pour performances optimales (99% réduction comparaisons)
- Normalisation automatique des lieux (retrait codes INSEE)

### Interface à 4 onglets
- **🟠 Clusters** : Groupes de 3+ personnes interconnectées avec score moyen
- **🔵 Doublons** : Paires de doublons simples
- **🔴 Isolés** : Individus sans parents ET sans enfants
- **🟣 Suggestions IA** : Analyse de patterns avec score de confiance

### Fusion sécurisée
- Prévisualisation complète avant fusion
- Enrichissement automatique sans perte de données
- Export GEDCOM nettoyé avec HEAD/TRLR générés si manquants
- Statistiques avant/après

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production
npm run build
```

## 🌐 Déploiement Netlify

### Via GitHub (recommandé)

```bash
# Dans votre repo Git local
git checkout dev
git add .
git commit -m "v1.9.2: Correction algorithme anti-faux-positifs"
git push origin dev

# Tester sur https://dev--gedcom-merger.netlify.app
# Si OK:
git checkout main && git merge dev && git push origin main
```

### Via ZIP

1. Builder: `npm run build`
2. Glisser-déposer le dossier `dist/` sur https://app.netlify.com/drop

## 🔒 Sécurité

- Traitement 100% côté client (aucun serveur)
- Aucune donnée envoyée sur internet
- Protection XSS automatique (React)
- Headers sécurité configurés (Netlify)

## 📝 Technologies

- React 18.3.1
- Vite 5.4.2
- Tailwind CSS 3.4
- Lucide React (icônes)
- esbuild (minification - pas Terser!)

## 📊 Changelog

Voir [CHANGELOG.md](CHANGELOG.md) pour l'historique complet.

## 🐛 Dépannage

### Trop de faux positifs (versions < 1.9.2)
→ Mettre à jour vers v1.9.2 qui implémente la règle anti-faux-positifs

### Build échoue sur Netlify
→ Vérifier que `vite.config.js` utilise `minify: 'esbuild'` (pas 'terser')

### Score 100% avec seulement le nom
→ Ceci n'est plus possible en v1.9.2 grâce à la validation "critère suffisant"

## 📄 Licence

Projet personnel - Tous droits réservés
