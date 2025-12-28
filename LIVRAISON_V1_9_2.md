# 📦 LIVRAISON v1.9.2 - CORRECTION ALGORITHME ANTI-FAUX-POSITIFS

**Date** : 28 décembre 2025  
**Version** : 1.9.2  
**Statut** : ✅ PRODUCTION READY

---

## 🎯 RÉSUMÉ DE LA CORRECTION

### Problème identifié

Depuis la v1.8.7, l'algorithme de comparaison remontait **trop de faux positifs**.

**Cause racine** : Le système hybride relatif donnait des scores élevés même quand seuls le nom et le sexe correspondaient, sans autre critère confirmant.

**Exemple du bug** :
```
Jean MARTIN (M) vs Jean MARTIN (M)
Seules données: nom + sexe
Score v1.8.7: 100% → FAUX POSITIF!
Score v1.9.2: 0% → REJETÉ (critère suffisant manquant)
```

### Solution implémentée

**Nouvelle règle métier stricte** :

```
POUR ÊTRE DOUBLON, IL FAUT :
├─ Nom identique (NÉCESSAIRE mais PAS SUFFISANT)
├─ Sexe compatible (NÉCESSAIRE, ÉLIMINATOIRE si différent)
└─ AU MOINS 1 critère SUFFISANT parmi :
   ├─ Date/année de naissance
   ├─ Lieu de naissance
   ├─ Parents communs
   ├─ Conjoints communs
   ├─ Fratrie commune
   ├─ Date de décès
   └─ Profession
```

---

## 📋 COMMANDES DE DÉPLOIEMENT

### Étape 1 : Extraire le ZIP

```bash
cd ~/Downloads
unzip gedcom-merger-v1.9.2.zip
```

### Étape 2 : Copier vers le repo Git

```bash
# Définir le chemin du repo
REPO="/Users/HotRoads/Library/Mobile Documents/com~apple~CloudDocs/Claude Gedcom/GITHUB/GEDCOM-Merger-GitHub-Ready"

# Copier les fichiers source
cp ~/Downloads/gedcom-merger-v1.9.2/src/App.jsx "$REPO/src/"
cp ~/Downloads/gedcom-merger-v1.9.2/src/main.jsx "$REPO/src/"
cp ~/Downloads/gedcom-merger-v1.9.2/src/index.css "$REPO/src/"

# Copier les fichiers de config
cp ~/Downloads/gedcom-merger-v1.9.2/package.json "$REPO/"
cp ~/Downloads/gedcom-merger-v1.9.2/vite.config.js "$REPO/"
cp ~/Downloads/gedcom-merger-v1.9.2/tailwind.config.js "$REPO/"
cp ~/Downloads/gedcom-merger-v1.9.2/postcss.config.js "$REPO/"
cp ~/Downloads/gedcom-merger-v1.9.2/netlify.toml "$REPO/"
cp ~/Downloads/gedcom-merger-v1.9.2/index.html "$REPO/"

# Copier la documentation
cp ~/Downloads/gedcom-merger-v1.9.2/README.md "$REPO/"
cp ~/Downloads/gedcom-merger-v1.9.2/CHANGELOG.md "$REPO/"
cp ~/Downloads/gedcom-merger-v1.9.2/LIVRAISON_V1_9_2.md "$REPO/"
cp ~/Downloads/gedcom-merger-v1.9.2/RAPPORT_TESTS_V1_9_2.md "$REPO/"
```

### Étape 3 : Commit et Push sur dev

```bash
cd "$REPO"
# ou: cdgedcom

git checkout dev
git status
git add .
git commit -m "v1.9.2: CORRECTION CRITIQUE algorithme anti-faux-positifs"
git push origin dev
```

### Étape 4 : Tester sur environnement dev

URL : https://dev--gedcom-merger.netlify.app

**Checklist de test** :

- [ ] Upload d'un fichier .ged fonctionne
- [ ] Barre de progression s'affiche
- [ ] Écran de révision apparaît avec statistiques
- [ ] **TEST ANTI-FAUX-POSITIFS** : Vérifier que les homonymes sans données ne sont PAS considérés doublons
- [ ] Onglet Clusters affiche les groupes avec score moyen
- [ ] Onglet Doublons affiche les paires (avec critères suffisants affichés)
- [ ] Onglet Isolés fonctionne
- [ ] Onglet Suggestions IA fonctionne
- [ ] Fusion et export du fichier nettoyé OK

### Étape 5 : Si tests OK → Production

```bash
git checkout main
git merge dev
git push origin main
```

URL Production : https://gedcom-merger.netlify.app

---

## 🧪 VALIDATION DE LA CORRECTION

### Test 1 : Rejet des homonymes sans données

**Entrée** : Deux personnes avec uniquement le même nom et sexe
**Attendu v1.9.2** : Ne doit PAS apparaître dans les doublons
**Méthode** : Créer un fichier GEDCOM de test avec 2 "Jean MARTIN (M)" sans autres données

### Test 2 : Acceptation avec critère suffisant

**Entrée** : Deux personnes avec même nom + même année de naissance
**Attendu v1.9.2** : Doit apparaître dans les doublons avec critère affiché
**Méthode** : Vérifier que "Critères validants: annee_naissance" s'affiche

### Test 3 : Élimination sexe différent

**Entrée** : Deux personnes avec même nom mais sexes différents
**Attendu v1.9.2** : Ne doit PAS apparaître (sexe éliminatoire)

---

## 📊 MÉTRIQUES

### Code
- **Lignes App.jsx** : ~1700 lignes
- **États React** : 22
- **Fonctions principales** : 28

### Algorithme corrigé
- **Critères nécessaires** : Nom, Sexe
- **Critères suffisants** : 7 (naissance, lieu, parents, conjoints, fratrie, décès, profession)
- **Tracking critères** : Oui (champ `sufficientCriteria`)
- **Rejet précoce** : Oui (si aucun critère suffisant)

### Performance attendue
- **Build** : ~6-8 secondes
- **Bundle gzippé** : ~60 KB
- **Réduction comparaisons** : 99%+ (triple indexation + rejets précoces)

---

## 📁 CONTENU DU ZIP

```
gedcom-merger-v1.9.2/
├── src/
│   ├── App.jsx              # Code principal (corrigé)
│   ├── main.jsx             # Point d'entrée React
│   └── index.css            # Styles Tailwind
├── index.html               # Page HTML
├── package.json             # Dépendances (v1.9.2)
├── vite.config.js           # Config Vite (esbuild)
├── tailwind.config.js       # Config Tailwind
├── postcss.config.js        # Config PostCSS
├── netlify.toml             # Config Netlify
├── README.md                # Documentation utilisateur
├── CHANGELOG.md             # Historique versions
├── LIVRAISON_V1_9_2.md      # Ce fichier
└── RAPPORT_TESTS_V1_9_2.md  # Rapport de tests
```

---

## ⚠️ POINTS CRITIQUES

1. **vite.config.js** : DOIT utiliser `minify: 'esbuild'` (pas 'terser')
2. **Règle anti-faux-positifs** : Vérifier visuellement que les homonymes seuls sont rejetés
3. **Critères affichés** : L'interface doit montrer "Critères validants: xxx"

---

## 🎯 CONCLUSION

La v1.9.2 corrige la régression majeure de l'algorithme de comparaison. Les faux positifs basés uniquement sur le nom et le sexe sont désormais **éliminés**.

**Livré par** : Claude AI  
**Validé** : ⏳ À valider sur dev--gedcom-merger.netlify.app
