# LIVRAISON v1.9.4 - GEDCOM Merger

**Date** : 30 décembre 2025  
**Version** : 1.9.4  
**Base** : Corrections régressions v1.7.2 + Restauration fonctionnalités v1.6.1

---

## 4 AMÉLIORATIONS IMPLÉMENTÉES

### 1. Affichage détail complet (régression v1.7.2 corrigée)

**Onglet Suggestions IA enrichi :**

Chaque carte de suggestion affiche désormais les informations complètes pour chaque personne du groupe. Le nom apparaît en gras avec l'identifiant GEDCOM. Les dates et lieux de naissance et de décès sont affichés sur des lignes distinctes. Le sexe est clairement indiqué. La liste des parents affiche les noms résolus via la fonction getPersonName plutôt que les identifiants bruts.

**Tableau clusters avec colonnes complètes :**

Le tableau affiché lors de l'expansion d'un cluster contient neuf colonnes incluant le lieu de naissance, le sexe, et les parents. Les colonnes Parents et Conjoints affichent les prénoms abrégés pour une lecture rapide. L'identifiant GEDCOM est affiché en police monospace.

### 2. Contrôle d'intégrité 8 types (v1.6.1 restauré)

La fonction performIntegrityChecks analyse huit types de problèmes distincts conformément à la spécification v1.6.1. Un bouton Shield dans le header affiche le statut global avec code couleur. La modal d'intégrité détaille les erreurs critiques, avertissements, et statistiques.

**Types de vérification :**

Le système vérifie les liens familiaux bidirectionnels, les dates incohérentes incluant naissance après décès et parent né après enfant avec détection des écarts d'âge suspects, les boucles généalogiques via échantillonnage des cent premières personnes, la structure GEDCOM et les sauts de niveau, les références orphelines vers des identifiants inexistants, les identifiants dupliqués, les personnes isolées, et le score de complétude global.

### 3. Boutons sélection dynamiques

**Avant (v1.9.3)** : Bouton fixe "Sélectionner ≥95%"

**Après (v1.9.4)** : Bouton dynamique "Sélectionner ≥{filterScore}%"

Le texte du bouton reflète la valeur actuelle du slider. La logique de sélection utilise également cette valeur dynamique. Cette modification s'applique aux deux onglets Clusters et Doublons.

### 4. Bouton Recommencer dans le header

Le bouton permettant de recommencer avec un nouveau fichier est déplacé du bas de la page vers le header principal. Il utilise l'icône RefreshCw et n'apparaît qu'après le chargement d'un fichier. Cette position persistante permet un accès immédiat sans défilement.

---

## COMMANDES DE DÉPLOIEMENT

### Étape 1 : Extraire le ZIP

```bash
cd ~/Downloads
unzip gedcom-merger-v1.9.4.zip
```

### Étape 2 : Copier vers le repo Git

```bash
REPO="/Users/HotRoads/Library/Mobile Documents/com~apple~CloudDocs/Claude Gedcom/GITHUB/GEDCOM-Merger-GitHub-Ready"

# Copier les fichiers source
cp -r ~/Downloads/gedcom-merger-v1.9.4/src/* "$REPO/src/"

# Copier les fichiers de config
cp ~/Downloads/gedcom-merger-v1.9.4/package.json "$REPO/"
cp ~/Downloads/gedcom-merger-v1.9.4/vite.config.js "$REPO/"
cp ~/Downloads/gedcom-merger-v1.9.4/tailwind.config.js "$REPO/"
cp ~/Downloads/gedcom-merger-v1.9.4/postcss.config.js "$REPO/"
cp ~/Downloads/gedcom-merger-v1.9.4/netlify.toml "$REPO/"
cp ~/Downloads/gedcom-merger-v1.9.4/index.html "$REPO/"

# Copier la documentation
cp ~/Downloads/gedcom-merger-v1.9.4/*.md "$REPO/"

# Copier les tests
cp -r ~/Downloads/gedcom-merger-v1.9.4/tests "$REPO/"
```

### Étape 3 : Tester localement

```bash
cd "$REPO"
npm install
node tests/test-complete.cjs
npm run build
```

### Étape 4 : Commit et Push sur dev

```bash
git checkout dev
git add .
git commit -m "v1.9.4: Affichage complet + Intégrité 8 types + Boutons dynamiques + Header"
git push origin dev
```

### Étape 5 : Tester sur dev

URL : https://dev--gedcom-merger.netlify.app

**Checklist de test :**

- [ ] Upload fichier .ged fonctionne
- [ ] Bouton Recommencer visible dans le header après upload
- [ ] Bouton Intégrité (Shield) visible dans le header
- [ ] Modal intégrité affiche statistiques et erreurs
- [ ] Onglet Clusters affiche tableau complet avec 9 colonnes
- [ ] Bouton clusters dynamique "Sélectionner ≥X%" avec X selon slider
- [ ] Onglet Doublons affiche parents résolus
- [ ] Bouton doublons dynamique selon slider
- [ ] Onglet Suggestions IA affiche cartes complètes
- [ ] Fusion et export fonctionnent

### Étape 6 : Production

```bash
git checkout main
git merge dev
git push origin main
```

URL Production : https://gedcom-merger.netlify.app

---

## CONTENU DU ZIP

```
gedcom-merger-v1.9.4/
├── src/
│   ├── App.jsx              # Composant principal (~1800 lignes)
│   ├── main.jsx             # Point d'entrée React
│   └── index.css            # Styles Tailwind
├── tests/
│   └── test-complete.cjs    # 186 tests automatisés
├── index.html               # Page HTML
├── package.json             # v1.9.4
├── vite.config.js           # esbuild (pas Terser)
├── tailwind.config.js
├── postcss.config.js
├── netlify.toml             # Headers sécurité + cache
├── README.md                # Documentation utilisateur
├── CHANGELOG.md             # Historique complet
├── DEPLOIEMENT.md           # Guide Netlify
├── LIVRAISON_V1_9_4.md      # Ce fichier
└── RAPPORT_TESTS_V1_9_4.md  # 186/186 tests passés
```

---

## MÉTRIQUES

| Métrique | Valeur |
|----------|--------|
| Tests | 186/186 (100%) |
| États React | 24 |
| Fonctions | 28 |
| Types intégrité | 8 |
| Variantes prénoms | 40 |

---

**Validé par** : Claude  
**À déployer sur** : gedcom-merger.netlify.app
