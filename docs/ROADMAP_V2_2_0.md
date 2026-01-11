# 🚀 ROADMAP GEDCOM Merger v2.2.0

## Contexte

Version axée sur la **gestion intelligente des conflits** et l'**intégrité des données**, consolidant les fonctionnalités restantes des roadmaps v2.0.0 et v2.1.0.

**Base de départ** : v2.1.4 (501 tests, Web Worker, rapport qualité)

**Date de création** : 2 janvier 2026  
**Dernière mise à jour** : 5 janvier 2026

---

## ✅ Rappel des versions précédentes

### v2.0.0 (FAIT)
| Fonctionnalité | Statut |
|----------------|--------|
| rawLines / rawLinesByTag | ✅ |
| 18 critères de comparaison | ✅ |
| Combiner SOUR/NOTE à la fusion | ✅ |
| Préférer donnée la plus complète | ✅ |
| Contrôles pré-fusion/suppression | ✅ |

### v2.1.0 (FAIT)
| Fonctionnalité | Statut |
|----------------|--------|
| Rapport qualité à l'upload | ✅ |
| Incohérences chronologiques (7 règles) | ✅ |
| Normalisation intelligente des lieux | ✅ |
| Statistiques généalogiques | ✅ |
| Références orphelines | ✅ |
| Score de suspicion (🔴🟡🟢) | ✅ |
| Web Worker (v2.1.4) | ✅ |
| 501 tests (8 catégories) | ✅ |

---

## 🎯 Objectifs v2.2.0

### Principe directeur
> **Donner le contrôle à l'utilisateur sur les conflits et garantir l'intégrité du fichier GEDCOM généré**

---

## 📋 État des fonctionnalités v2.2.x

### ✅ PHASE 1 - TERMINÉE (v2.2.0 → v2.2.1)

#### 1. Détection des conflits lors de la fusion ✅
**Statut** : Implémenté v2.2.0

- 10 champs vérifiés : birth, birthPlace, death, deathPlace, baptism, baptismPlace, burial, burialPlace, occupation, religion
- Logique de compatibilité intelligente (dates approximatives, lieux inclusifs)
- Structure `mergeConflicts[]` dans l'état React

#### 2. Interface de résolution des conflits ✅
**Statut** : Implémenté v2.2.0

- Modal s'affiche si conflits détectés
- Sélection radio pour chaque conflit
- Bouton "Appliquer" activé quand tous résolus
- Application des résolutions dans `applyConflictResolutions()`

#### 3. Nettoyage FAM orphelines ✅
**Statut** : Implémenté v2.2.1

- `cleanOrphanedFamilies()` détecte les familles sans membres
- Rapport de nettoyage affiché dans la console
- Suppression automatique des FAM vides

---

### ✅ PHASE 2 - TERMINÉE (v2.2.2 → v2.2.6)

#### 4. Corrections bugs interface ✅
**Statut** : Implémenté v2.2.2

- Bouton "Sélectionner" cluster encadre visuellement
- Bouton "Désélectionner tout" cluster retire les paires associées
- Boutons "Désélectionner tout" doublons/clusters indépendants
- Modal prévisualisation avec ascenseur fonctionnel
- Détection conflit stricte sur dates précises

#### 5. Isolation doublons/clusters ✅
**Statut** : Implémenté v2.2.3

- `selectHighConfidence()` n'affecte que les doublons simples
- Sélections complètement indépendantes

#### 6. Fusion en cascade ✅ 🎉
**Statut** : Implémenté v2.2.4

**Problème résolu** : Quand A→B et B→C, les références vers A pointaient vers B (supprimé) au lieu de C.

**Solution** :
```javascript
// Résolution des chaînes de fusion
while (chainsResolved && iterations < maxIterations) {
  mergeMap.forEach((targetId, sourceId) => {
    if (mergeMap.has(targetId)) {
      mergeMap.set(sourceId, mergeMap.get(targetId));
      chainsResolved = true;
    }
  });
}
```

**Résultat** : Support complet des clusters de N individus.

#### 7. Redirection des références HUSB/WIFE/CHIL ✅
**Statut** : Implémenté v2.2.4

**Problème résolu** : Les références vers les personnes fusionnées étaient supprimées au lieu d'être redirigées.

**Solution** :
- `cleanOrphanedFamilies(families, removedIds, people, mergeMap)` - nouveau paramètre
- Helper `getValidId(id)` : retourne la cible de fusion ou l'ID original
- Déduplication si deux enfants fusionnent vers la même personne

#### 8. Scoring amélioré ✅
**Statut** : Implémenté v2.2.5

**Améliorations** :
- **Couleurs inversées** : 🟢 FORT (feu vert) / 🟡 MOYEN / 🔴 FAIBLE (prudence)
- **Pondération dynamique** : noms rares = +35 pts, très communs = 20 pts
- **Bonus combinaison** : +15 pts si nom+naissance+lieu concordent, +8 pts si nom+naissance
- **Malus incohérence** : -10 pts si lieux de naissance contradictoires

#### 9. Normalisation des lieux avec API Géo ✅
**Statut** : Implémenté v2.2.6

**Fonctionnalités** :
- Modal dédié pour corriger les variantes de lieux
- Intégration API Géo du gouvernement français (geo.api.gouv.fr)
- Suggestions officielles : Commune, Département, Région
- Application des corrections sur le fichier GEDCOM (rawLines)

---

### 🟡 PHASE 3 - À FAIRE

#### 8. Export CSV
**Priorité** : P2

**Fichiers prévus** :
- `individus.csv` : ID, Nom, Prénom, Naissance, Décès, Lieu
- `familles.csv` : ID, Mari, Femme, Mariage, Enfants
- `doublons.csv` : ID1, ID2, Score, Niveau, Critères
- `problemes.csv` : Type, ID, Message

#### 9. Export JSON
**Priorité** : P2

Structure complète avec individus, familles, doublons détectés, problèmes.

---

### 🟢 PHASE 4 - OPTIONNEL

#### 10. Filtre par branche patronymique
**Priorité** : P3

Analyser uniquement les personnes d'un patronyme donné.

---

## 📊 Résumé des priorités

| # | Fonctionnalité | Version | Priorité | Statut |
|---|----------------|---------|----------|--------|
| 1 | Détection conflits fusion | v2.2.0 | 🔴 P1 | ✅ Fait |
| 2 | Interface résolution conflits | v2.2.0 | 🔴 P1 | ✅ Fait |
| 3 | Nettoyage FAM orphelines | v2.2.1 | 🔴 P1 | ✅ Fait |
| 4 | Corrections bugs interface | v2.2.2 | 🔴 P1 | ✅ Fait |
| 5 | Isolation doublons/clusters | v2.2.3 | 🔴 P1 | ✅ Fait |
| 6 | Fusion en cascade | v2.2.4 | 🟡 P2 | ✅ Fait |
| 7 | Redirection références | v2.2.4 | 🟡 P2 | ✅ Fait |
| 8 | Scoring amélioré | v2.2.5 | 🟡 P2 | ✅ Fait |
| 9 | Normalisation lieux + API Géo | v2.2.6 | 🟡 P2 | ✅ Fait |
| 10 | Export CSV | - | 🟡 P2 | 📋 À faire |
| 11 | Export JSON | - | 🟡 P2 | 📋 À faire |
| 12 | Filtre patronyme | - | 🟢 P3 | 📋 À faire |

---

## 🧪 Tests

| Version | Tests statiques | Tests Vitest | Total |
|---------|-----------------|--------------|-------|
| v2.1.4 | 393 | 108 | 501 |
| v2.2.0 | 417 | 135 | 552 |
| v2.2.2 | 429 | 159 | 588 |
| v2.2.4 | 429 | 164 | 593 |
| **v2.2.6** | **482** | **193** | **675** |

---

## ✅ Checklist de validation v2.2.x

### P1 - Obligatoire ✅
- [x] Conflits détectés avant fusion
- [x] Modal de résolution fonctionnel
- [x] Tous conflits doivent être résolus
- [x] FAM orphelines nettoyées après fusion
- [x] Rapport de nettoyage affiché

### P2 - Important ✅
- [x] Fusion en cascade A→B→C fonctionne
- [x] Support clusters N individus
- [x] Références HUSB/WIFE/CHIL redirigées
- [x] Déduplication enfants automatique
- [x] Scoring amélioré (couleurs, pondération, bonus/malus)
- [x] Normalisation lieux avec API Géo
- [ ] Export CSV (4 fichiers)
- [ ] Export JSON complet

### P3 - Nice-to-have
- [ ] Filtre par patronyme
- [ ] Suggestions de patronymes
- [ ] Stats par branche

### Technique
- [x] 675 tests passent
- [x] Build Netlify OK
- [x] Aucune régression v2.1.4
- [x] Documentation à jour

---

## 🔗 Liens

- **Production** : https://gedcom-merger.netlify.app
- **Dev** : https://dev--gedcom-merger.netlify.app
- **GitHub** : https://github.com/RemyRider/gedcom-merger
- **Branche de travail** : dev

---

## 📚 Historique des roadmaps

| Version | Focus | Statut |
|---------|-------|--------|
| v2.0.0 | Préservation données (rawLines) | ✅ Fait |
| v2.1.0 | Contrôle qualité avancé | ✅ Fait |
| v2.2.0 | Conflits + Intégrité fusion | ✅ P1+P2 Fait |

---

*Document mis à jour le 10 janvier 2026*  
*Version 2.2.6 - Scoring amélioré + Normalisation lieux API Géo*
