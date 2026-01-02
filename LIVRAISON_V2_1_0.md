# Livraison v2.1.0 - GEDCOM Merger

**Date** : 2 janvier 2026  
**Objectif** : Contrôle qualité avancé et analyse généalogique (P1 + P2)

---

## Résumé des modifications

### P1 - Rapport qualité à l'upload

**Nouveau modal affiché automatiquement après import :**

| Section | Contenu |
|---------|---------|
| Infos fichier | Version GEDCOM, encodage, tags custom |
| Statistiques | Individus, familles, sources, notes, médias |
| Complétude | % avec naissance, lieu, parents, conjoints |
| Isolés | Nb personnes sans famille liée |

### P1 - Incohérences chronologiques

**7 règles de détection :**

| Règle | Type | Description |
|-------|------|-------------|
| BIRTH_AFTER_DEATH | ❌ Erreur | Naissance après décès |
| BAPTISM_BEFORE_BIRTH | ❌ Erreur | Baptême avant naissance |
| BURIAL_BEFORE_DEATH | ❌ Erreur | Inhumation avant décès |
| PARENT_BORN_AFTER_CHILD | ❌ Erreur | Parent né après enfant |
| MARRIAGE_BEFORE_BIRTH | ❌ Erreur | Mariage avant naissance |
| MARRIAGE_AFTER_DEATH | ❌ Erreur | Mariage après décès |
| PARENT_TOO_YOUNG | ⚠️ Warning | Parent < 12 ans |
| PARENT_TOO_OLD | ⚠️ Warning | Parent > 80 ans |
| EXTREME_LONGEVITY | ⚠️ Warning | Longévité > 120 ans |

### P1 - Normalisation lieux

**Détection et groupement des variantes :**
```
"PARIS, FRANCE" | "Paris, France" | "Paris" → "Paris, France"
```

### P2 - Statistiques généalogiques

| Statistique | Description |
|-------------|-------------|
| Répartition H/F | Hommes, femmes, inconnus |
| Enfants/famille | Moyenne, maximum |
| Période | Années min/max |
| Dates | Complètes vs partielles |
| Top patronymes | 10 noms les plus fréquents |

### P2 - Références orphelines

| Type | Description |
|------|-------------|
| FAMC_BROKEN | Individu pointe vers FAM inexistante |
| FAMS_BROKEN | Individu pointe vers FAM inexistante |
| HUSB/WIFE_BROKEN | Famille pointe vers INDI inexistant |
| SOURCE_ORPHAN | Source définie mais jamais utilisée |

### P2 - Score de suspicion

| Niveau | Emoji | Critères |
|--------|-------|----------|
| FORT | 🔴 | Score ≥80% + ≥3 critères |
| MOYEN | 🟡 | Score ≥60% + ≥2 critères |
| FAIBLE | 🟢 | Autres cas |

---

## Interface utilisateur

### Nouveau bouton "Qualité"
- Affiché dans la barre d'outils après upload
- Badge rouge si erreurs critiques détectées
- Ouvre le modal de rapport qualité

### Emojis sur les doublons
- 🔴 FORT - À fusionner en priorité
- 🟡 MOYEN - À vérifier
- 🟢 FAIBLE - Probablement faux positif

---

## Fichiers modifiés

| Fichier | Modifications |
|---------|---------------|
| src/App.jsx | +6 états, +6 fonctions, modal qualité, bouton, emojis |
| tests/test-complete.cjs | +46 tests (catégorie 8) |
| package.json | Version 2.1.0 |
| CHANGELOG.md | Entrée v2.1.0 |
| ROADMAP_V2_1_0.md | Documentation complète |

---

## Tests

✅ **371/371 tests passent (100%)**

| Catégorie | Tests |
|-----------|-------|
| 1. Fondamentaux | 61 |
| 2. Parsing GEDCOM | 52 |
| 3. Détection doublons | 42 |
| 4. Fusion & suppression | 34 |
| 5. Interface utilisateur | 79 |
| 6. Suggestions IA | 18 |
| 7. Config & déploiement | 39 |
| **8. Qualité & analyses v2.1.0** | **46** |
| **TOTAL** | **371** |

---

## Déploiement

```bash
# Extraire le ZIP
unzip gedcom-v2.1.0-final.zip

# Copier vers le repo
cp -r gedcom-v2.1.0/* /chemin/vers/GEDCOM-Merger-GitHub-Ready/

# Déployer sur dev
cd /chemin/vers/GEDCOM-Merger-GitHub-Ready/
git checkout dev
git add .
git commit -m "v2.1.0 - Contrôle qualité avancé P1+P2"
git push origin dev
```

---

## Inspiré par

Compétence Claude : `gedcom-5-5x-qa-and-analysis`
- Parsing robuste GEDCOM 5.5.x
- Contrôle qualité et détection d'erreurs
- Statistiques généalogiques
- Export structuré

---

## Prochaines étapes (P3)

1. Export CSV/JSON des données
2. Filtre par branche patronymique
