# Changelog - GEDCOM Merger

## v2.0.0 - Phase 1 : Préservation complète des données (31 décembre 2025)

### 🎯 Objectif principal
> **Aucune donnée GEDCOM ne doit être perdue lors de la fusion**

### ✨ Nouvelles fonctionnalités

#### rawLines[] - Stockage des lignes brutes
Chaque personne stocke désormais TOUTES ses lignes GEDCOM originales dans un tableau `rawLines[]`. Cela permet de préserver intégralement les données même pour les tags non parsés.

#### rawLinesByTag{} - Indexation par tag
Les lignes sont également indexées par tag de niveau 1 dans un objet `rawLinesByTag{}`. Les tags indexés incluent :
- **SOUR** : Sources et citations
- **NOTE** : Notes de niveau 1
- **OBJE** : Médias et photos
- **EVEN** : Événements personnalisés
- **EDUC, NATI, IMMI, EMIG, CENS, WILL, PROB** : Événements spéciaux
- **_TAG** : Tous les tags propriétaires (custom)

#### Fusion intelligente des sources
La fonction `mergePersonData()` fusionne maintenant les `rawLinesByTag` des deux personnes. Pour les SOUR, une déduplication par référence `@Sxxx@` évite les doublons.

#### Génération GEDCOM améliorée
La fonction `generateMergedIndiLines()` utilise désormais les `rawLinesByTag` pour écrire les tags spéciaux dans le fichier de sortie, garantissant zéro perte de données.

### 🧪 Tests
- **295 tests** (22 niveaux + 6 bonus)
- Nouveau BONUS F : 18 tests pour la préservation des données
- 100% de réussite

### 📁 Structure des données modifiée

```javascript
currentPerson = {
  id, names, birth, birthPlace, // ... champs parsés existants
  
  // NOUVEAU v2.0.0
  rawLines: [],           // Toutes les lignes GEDCOM originales
  rawLinesByTag: {        // Indexées par tag pour fusion intelligente
    'SOUR': [{ startIdx, lines: [...] }],
    'NOTE': [...],
    'OBJE': [...],
    '_MYPROP': [...]
  }
}
```

---

## v1.9.5 - Fusion Intelligente (31 décembre 2025)

### Améliorations majeures

- **CRITIQUE**: Correction parsing DATE/PLAC niveau 2 uniquement
- **NOUVEAU**: Fonction `mergePersonData()` - combine les données des 2 personnes
- **NOUVEAU**: Déduplication automatique des CHIL dans les FAM
- **NOUVEAU**: Note de traçabilité dans les INDI fusionnés
- **NOUVEAU**: Support des clusters (fusion en chaîne)
- Noms secondaires marqués TYPE aka

### Tests
- 266 tests (22 niveaux + 5 bonus)

---

## v1.9.4 - Contrôle intégrité (30 décembre 2025)

- Contrôle d'intégrité 8 types restauré
- Bouton Recommencer dans le header
- Boutons sélection avec valeur dynamique du filtre

---

## v1.9.3 - Interface améliorée (30 décembre 2025)

- Onglet "À supprimer" remplace "Isolés"
- Bouton flottant pour actions rapides
- Tableau clusters détaillé (9 colonnes)
- Action "Supprimer" distincte de "Fusionner"

---

## v1.9.2 - Anti-faux-positifs (28 décembre 2025)

- **CORRECTION MAJEURE**: Nom + Sexe ne suffisent plus
- Nouvelle règle: AU MOINS 1 critère suffisant requis
- Critères: naissance, lieu, parents, conjoints, fratrie, décès, profession

---

## v1.9.0 - Interface 4 onglets (28 décembre 2025)

- 4 onglets : Clusters, Doublons, À supprimer, IA
- Restauration suggestions IA avec score de confiance

---

## v1.8.6 - Conformité GEDCOM (16 décembre 2025)

- Génération HEAD/TRLR automatique
- Gestion CONT/CONC
- Conformité GEDCOM 5.5.1

---

## v1.0.0 - Version initiale (29 novembre 2025)

- Algorithme Soundex français
- Triple indexation (phonétique, année, parents)
- Scoring hybride 9 critères
- Interface React responsive
