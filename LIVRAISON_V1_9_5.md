# Livraison GEDCOM Merger v1.9.5

**Date** : 31 décembre 2025
**Tests** : 246/246 (100%)

## Nouvelles fonctionnalités

### 1. Sous-titre dynamique
Le sous-titre de l'écran d'accueil est maintenant basé sur `CHANGELOG[0].title`, garantissant qu'il est toujours à jour.

### 2. Affichage complet des détails
Tous les champs parsés sont maintenant affichés :
- ID (format monospace)
- Sexe (♂/♀)
- Naissance (date + lieu)
- Baptême (date + lieu) - si disponible
- Décès (date + lieu)
- Inhumation (date + lieu) - si disponible
- Profession
- Titre
- Résidence
- Religion
- Parents, Conjoints, Enfants
- Notes

### 3. Boutons "Désélectionner tout"
Ajoutés sur les onglets :
- **Clusters** : `setSelectedClusters(new Set())`
- **Doublons** : `setSelectedPairs(new Set())`

### 4. Parsing GEDCOM étendu
Nouveaux champs parsés :
| Tag | Champ | Usage |
|-----|-------|-------|
| `BAPM`/`CHR` | baptism, baptismPlace | Date/lieu baptême |
| `BURI`/`CREM` | burial, burialPlace | Date/lieu inhumation |
| `RESI` | residence | Lieu de résidence |
| `TITL` | title | Titre (noblesse, etc.) |
| `NOTE` | note | Notes diverses |
| (enfants) | children[] | Liste des enfants |

### 5. Algorithme amélioré
Nouveaux critères de comparaison :

| Critère | Points | Critère suffisant |
|---------|--------|-------------------|
| Lieu de décès identique | +8/8 | ✅ lieu_deces |
| Lieu de décès similaire | +4/8 | ✅ lieu_deces_partiel |
| 2+ enfants communs | +15/15 | ✅ enfants_2+ |
| 1 enfant commun | +10/15 | ✅ enfant_1 |

## Structure des tests

| Niveau | Description | Tests |
|--------|-------------|-------|
| 1-20 | Niveaux v1.9.4 | 226 |
| 21 | Anti-régression UI | 10 |
| 22 ★ | Fonctionnalités v1.9.5 | 10 |
| Bonus A-C | Documentation, UX, Stats | 37 |
| **Total** | | **246** |

## Fichiers modifiés

- `src/App.jsx` : +150 lignes (parsing + algo + UI)
- `tests/test-complete.cjs` : +10 tests niveau 22
- `package.json` : version 1.9.5
- `CHANGELOG.md` : entrée v1.9.5
- `README.md` : mise à jour
- `DEPLOIEMENT.md` : documentation déploiement

## Instructions de déploiement

```bash
cd ~/Downloads
unzip -o gedcom-v1.9.5.zip
cp -r ~/Downloads/gedcom-v1.9.5/* /chemin/vers/repo
cd /chemin/vers/repo
git checkout dev
git add .
git commit -m "feat: v1.9.5 - Détails complets + Désélection + Parsing étendu"
git push origin dev
```
