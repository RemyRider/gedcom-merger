# 🚀 ROADMAP GEDCOM Merger v2.1.0

## Contexte

Version axée sur le **contrôle qualité avancé** et l'**analyse généalogique** grâce à l'intégration des bonnes pratiques GEDCOM 5.5.x.

**Base de départ** : v2.0.0 (325 tests, 18 critères, rawLines/rawLinesByTag)

**Date de création** : 2 janvier 2026

**Inspiré par** : Compétence "gedcom-5-5x-qa-and-analysis"

---

## ✅ Rappel v2.0.0 (FAIT)

| Fonctionnalité | Statut |
|----------------|--------|
| rawLines / rawLinesByTag | ✅ |
| 18 critères de comparaison | ✅ |
| Comparaison par nom (parents/conjoints/enfants) | ✅ |
| Contrôles pré-fusion (sexes, dates, lieux) | ✅ |
| Contrôles pré-suppression (enfants, conjoints) | ✅ |
| Sélection clusters → selectedPairs | ✅ |
| 325 tests (7 catégories) | ✅ |

---

## 🎯 Objectifs v2.1.0

### Principe directeur
> **Détecter et signaler les problèmes de qualité AVANT la fusion**

---

## 📋 Fonctionnalités planifiées

### 🔴 PRIORITÉ HAUTE (P1)

#### 1. Rapport qualité à l'upload
**Objectif** : Afficher un diagnostic complet du fichier GEDCOM dès l'import.

**Métriques à afficher** :
```
┌─────────────────────────────────────────────────────────────┐
│ 📊 RAPPORT QUALITÉ - sample.ged                             │
├─────────────────────────────────────────────────────────────┤
│ Version GEDCOM : 5.5.1                                      │
│ Encodage : UTF-8                                            │
│                                                             │
│ 📈 STATISTIQUES                                             │
│ • Individus : 7,234                                         │
│ • Familles : 2,891                                          │
│ • Sources : 1,456                                           │
│ • Notes : 3,210                                             │
│ • Médias : 89                                               │
│                                                             │
│ 📉 COMPLÉTUDE                                               │
│ • Avec date naissance : 78% (5,642 / 7,234)                 │
│ • Avec lieu naissance : 45% (3,255 / 7,234)                 │
│ • Avec au moins 1 parent : 62% (4,485 / 7,234)              │
│ • Isolés (sans famille) : 234 personnes                     │
│                                                             │
│ ⚠️ PROBLÈMES DÉTECTÉS                                       │
│ • 12 erreurs critiques                                      │
│ • 45 avertissements                                         │
│ • 156 doublons probables                                    │
└─────────────────────────────────────────────────────────────┘
```

**Implémentation** :
- Nouvelle fonction `generateQualityReport(individuals, families)`
- Nouvel état `qualityReport`
- Affichage après parsing, avant détection doublons

---

#### 2. Détection incohérences chronologiques
**Objectif** : Identifier les impossibilités temporelles.

**Règles à vérifier** :

| Règle | Type | Description |
|-------|------|-------------|
| BIRTH > DEATH | ❌ Erreur | Naissance après décès |
| PARENT_BIRTH > CHILD_BIRTH | ❌ Erreur | Parent né après son enfant |
| PARENT_AGE < 12 | ⚠️ Warning | Parent trop jeune (<12 ans) |
| PARENT_AGE > 80 | ⚠️ Warning | Parent très âgé (>80 ans) |
| MARR < BIRTH | ❌ Erreur | Mariage avant naissance |
| CHILD_BIRTH < PARENT_DEATH - 9m | ⚠️ Warning | Enfant né >9 mois après décès parent |
| MARR > DEATH | ❌ Erreur | Mariage après décès |

**Implémentation** :
```javascript
function detectChronologicalIssues(individuals, families) {
  const errors = [];
  const warnings = [];
  
  individuals.forEach(person => {
    const birthYear = extractYear(person.birth);
    const deathYear = extractYear(person.death);
    
    // Naissance après décès
    if (birthYear && deathYear && birthYear > deathYear) {
      errors.push({
        type: 'BIRTH_AFTER_DEATH',
        personId: person.id,
        message: `${person.names[0]} : naissance (${birthYear}) après décès (${deathYear})`
      });
    }
    
    // Parent né après enfant
    // ... etc.
  });
  
  return { errors, warnings };
}
```

---

#### 3. Normalisation intelligente des lieux
**Objectif** : Grouper les variantes orthographiques d'un même lieu.

**Problème actuel** :
```
"PARIS, FRANCE"
"Paris, France"
"Paris"
"PARIS"
→ 4 entrées différentes au lieu d'une seule
```

**Solution** :
```javascript
function normalizePlaceFull(place) {
  if (!place) return '';
  
  // 1. Normaliser la casse (Title Case)
  let normalized = place
    .toLowerCase()
    .split(',')
    .map(part => part.trim())
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(', ');
  
  // 2. Retirer les doublons de composants
  const parts = normalized.split(', ');
  const uniqueParts = [...new Set(parts)];
  
  return uniqueParts.join(', ');
}

function detectSimilarPlaces(individuals) {
  const placeGroups = new Map(); // normalized → [original1, original2, ...]
  
  individuals.forEach(p => {
    [p.birthPlace, p.deathPlace, p.baptismPlace, p.burialPlace, p.residence]
      .filter(Boolean)
      .forEach(place => {
        const normalized = normalizePlaceFull(place);
        if (!placeGroups.has(normalized)) {
          placeGroups.set(normalized, new Set());
        }
        placeGroups.get(normalized).add(place);
      });
  });
  
  // Retourner les groupes avec >1 variante
  return [...placeGroups.entries()]
    .filter(([_, variants]) => variants.size > 1)
    .map(([normalized, variants]) => ({
      suggested: normalized,
      variants: [...variants],
      count: variants.size
    }));
}
```

**Affichage** :
```
⚠️ LIEUX À NORMALISER (15 groupes)

• "Paris, France" ← PARIS, FRANCE | Paris | PARIS (4 occurrences)
• "Lyon, Rhône, France" ← Lyon | LYON, FRANCE (2 occurrences)
• "Saint-Étienne-De-Saint-Geoirs, Isère" ← ST ETIENNE DE ST GEOIRS | ... (3 occurrences)
```

---

### 🟡 PRIORITÉ MOYENNE (P2)

#### 4. Export statistiques généalogiques
**Objectif** : Fournir des métriques exploitables pour l'analyse.

**Statistiques à calculer** :

| Statistique | Description |
|-------------|-------------|
| Nb moyen enfants/famille | Total enfants / Nb familles avec enfants |
| Distribution années naissance | Histogramme par décennie |
| Répartition H/F | % hommes, % femmes, % inconnu |
| Complétude dates | % dates complètes vs partielles |
| Profondeur généalogique | Nb générations max |
| Top patronymes | 10 noms les plus fréquents |

**Format de sortie** :
```
📊 STATISTIQUES GÉNÉALOGIQUES

Démographie :
• Hommes : 3,456 (48%)
• Femmes : 3,678 (51%)
• Sexe inconnu : 100 (1%)

Familles :
• Nb moyen d'enfants : 4.2
• Familles sans enfant : 234
• Plus grande fratrie : 14 enfants (FAM @F1234@)

Chronologie :
• Période couverte : 1650 - 2020
• Pic de naissances : 1850-1900
• Dates complètes (JJ/MM/AAAA) : 34%
• Dates partielles (année seule) : 58%
• Sans date : 8%

Géographie :
• Nb lieux distincts : 456
• Lieu principal : Paris (1,234 événements)

Généalogie :
• Profondeur max : 12 générations
• Individus isolés : 234 (3.2%)
```

---

#### 5. Détection références orphelines
**Objectif** : Identifier les incohérences de références.

**Types à détecter** :

| Type | Description | Gravité |
|------|-------------|---------|
| FAMC cassé | Individu pointe vers FAM inexistante | ❌ Erreur |
| FAMS cassé | Individu pointe vers FAM inexistante | ❌ Erreur |
| HUSB/WIFE cassé | Famille pointe vers INDI inexistant | ❌ Erreur |
| CHIL cassé | Famille pointe vers enfant inexistant | ❌ Erreur |
| Réf non réciproque | INDI→FAM mais FAM↛INDI | ⚠️ Warning |
| SOUR orpheline | Source définie mais jamais utilisée | ℹ️ Info |
| OBJE orphelin | Média défini mais jamais référencé | ℹ️ Info |

---

#### 6. Score de suspicion doublons
**Objectif** : Remplacer le simple % par un niveau de confiance.

**Système actuel** : Score 0-100%

**Nouveau système** :
```javascript
function getSuspicionLevel(score, criteria) {
  // Score élevé + beaucoup de critères = FORT
  if (score >= 90 && criteria.length >= 5) return 'FORT';
  if (score >= 80 && criteria.length >= 3) return 'FORT';
  
  // Score moyen ou critères limités = MOYEN
  if (score >= 70 && criteria.length >= 2) return 'MOYEN';
  if (score >= 60 && criteria.length >= 4) return 'MOYEN';
  
  // Reste = FAIBLE
  return 'FAIBLE';
}
```

**Affichage** :
```
┌─────────────────────────────────────────┐
│ 🔴 FORT (92%)                           │
│ Jean /MARTIN/ ↔ Jean Pierre /MARTIN/    │
│ Critères : nom, naissance, lieu, parents│
├─────────────────────────────────────────┤
│ 🟡 MOYEN (75%)                          │
│ Marie /DUPONT/ ↔ Marie /DUPOND/         │
│ Critères : nom (phonétique), naissance  │
├─────────────────────────────────────────┤
│ 🟢 FAIBLE (62%)                         │
│ Pierre /BERNARD/ ↔ Pierre /BERNARD/     │
│ Critères : nom uniquement               │
└─────────────────────────────────────────┘
```

---

### 🟢 PRIORITÉ BASSE (P3)

#### 7. Export CSV/JSON
**Objectif** : Permettre l'exploitation externe des données.

**Exports disponibles** :

| Export | Colonnes/Champs |
|--------|-----------------|
| individus.csv | id, nom, prénom, sexe, naissance, lieu_naissance, décès, lieu_décès, père, mère |
| familles.csv | id, mari, femme, date_mariage, lieu_mariage, nb_enfants |
| doublons.csv | id1, id2, score, niveau, critères |
| erreurs.csv | type, id, message, suggestion |

**Format JSON** :
```json
{
  "metadata": {
    "version": "5.5.1",
    "generated": "2026-01-02T10:30:00Z",
    "source": "sample.ged"
  },
  "statistics": { ... },
  "individuals": [ ... ],
  "families": [ ... ],
  "issues": [ ... ]
}
```

---

#### 8. Analyse par branche patronymique
**Objectif** : Filtrer l'analyse sur un patronyme spécifique.

**Interface** :
```
┌─────────────────────────────────────────┐
│ 🔍 Filtrer par patronyme                │
│ ┌─────────────────────────────────────┐ │
│ │ MARTIN                              │ │
│ └─────────────────────────────────────┘ │
│ [Analyser cette branche]                │
└─────────────────────────────────────────┘

Résultat : 234 individus /MARTIN/
• 12 doublons probables
• 3 incohérences chronologiques
• 45 données manquantes
```

---

## 📊 Résumé des priorités

| # | Fonctionnalité | Priorité | Complexité | Impact |
|---|----------------|----------|------------|--------|
| 1 | Rapport qualité upload | 🔴 P1 | Moyenne | Fort |
| 2 | Incohérences chronologiques | 🔴 P1 | Moyenne | Fort |
| 3 | Normalisation lieux | 🔴 P1 | Moyenne | Fort |
| 4 | Export statistiques | 🟡 P2 | Faible | Moyen |
| 5 | Références orphelines | 🟡 P2 | Moyenne | Moyen |
| 6 | Score suspicion doublons | 🟡 P2 | Faible | Moyen |
| 7 | Export CSV/JSON | 🟢 P3 | Faible | Faible |
| 8 | Analyse par branche | 🟢 P3 | Moyenne | Faible |

---

## 🧪 Tests prévus

| Catégorie | Tests | Description |
|-----------|-------|-------------|
| Rapport qualité | 15 | Métriques, complétude, compteurs |
| Incohérences chrono | 12 | Règles temporelles, edge cases |
| Normalisation lieux | 10 | Variantes, groupes, suggestions |
| Statistiques | 8 | Calculs, distributions |
| Références orphelines | 10 | Tous types de références cassées |
| Score suspicion | 6 | Niveaux FORT/MOYEN/FAIBLE |
| Export CSV/JSON | 8 | Formats, colonnes, validité |
| Filtre patronyme | 5 | Sélection, compteurs |
| **Total** | **~74** | → **~400 tests** |

---

## 📅 Planning prévisionnel

| Phase | Contenu | Estimation |
|-------|---------|------------|
| Phase 1 | Rapport qualité + incohérences chrono | 4h |
| Phase 2 | Normalisation lieux | 2h |
| Phase 3 | Statistiques + références orphelines | 3h |
| Phase 4 | Score suspicion + exports | 2h |
| Phase 5 | Filtre patronyme | 2h |
| Phase 6 | Tests + documentation | 3h |
| **Total** | | **~16h** |

---

## ✅ Checklist de validation v2.1.0

### P1 - Obligatoire
- [ ] Rapport qualité affiché après upload
- [ ] Incohérences chronologiques détectées (7 règles)
- [ ] Lieux similaires groupés avec suggestion

### P2 - Important
- [ ] Statistiques généalogiques calculées
- [ ] Références orphelines identifiées
- [ ] Score suspicion FORT/MOYEN/FAIBLE

### P3 - Nice-to-have
- [ ] Export CSV fonctionnel
- [ ] Export JSON fonctionnel
- [ ] Filtre par patronyme

### Technique
- [ ] ~400 tests passent
- [ ] Build Netlify OK
- [ ] Aucune régression v2.0.0
- [ ] Documentation à jour

---

## 🔗 Liens

- **Production** : https://gedcom-merger.netlify.app
- **Dev** : https://dev--gedcom-merger.netlify.app
- **GitHub** : https://github.com/RemyRider/gedcom-merger
- **Branche de travail** : dev

---

## 📚 Ressources

- Compétence : `gedcom-5-5x-qa-and-analysis`
- Spécification GEDCOM 5.5.1 : https://gedcom.io/specifications/FamilySearchGEDCOMv5.5.1.pdf

---

*Document créé le 2 janvier 2026*
*Version 2.1.0 - Contrôle qualité avancé*
