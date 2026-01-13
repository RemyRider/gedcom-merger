# 🚀 ROADMAP GEDCOM Merger v2.4.0

## Contexte

Version axée sur la **fusion guidée contextuelle** avec un ordre de traitement **Top-Down** (parents stables → conjoints → enfants).

**Base de départ** : v2.3.0 (720 tests, module fusionOrder.mjs)

**Date de création** : 13 janvier 2026

---

## 🎯 Objectif principal v2.4.0

### Principe directeur

> **Proposer une assistance intelligente uniquement quand c'est nécessaire, avec un ordre de fusion optimal**

### Changement de paradigme

**v2.3.0 (abandonné)** : Onglet permanent "Fusion guidée" avec approche Bottom-Up
**v2.4.0 (nouveau)** : Assistant contextuel déclenché à la demande avec approche Top-Down

### Ordre de fusion corrigé (Top-Down)

```
LOGIQUE TOP-DOWN - Du plus stable au plus dépendant

┌─────────────────────────────────────────────────────────────────────────────────┐
│ ÉTAPE 1 : Individus sans parents doublons                                       │
│           → Ancêtres "stables", pas de dépendances amont                        │
│           → Leurs références parentales sont fiables                            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ÉTAPE 2 : Individus sans conjoints doublons                                     │
│           → Parents déjà fusionnés                                              │
│           → Relations matrimoniales peuvent être résolues                       │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ÉTAPE 3 : Enfants                                                               │
│           → Parents et conjoints déjà fusionnés                                 │
│           → Toutes les références pointent vers les bons individus              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Fonctionnalités planifiées

### 🔴 PRIORITÉ HAUTE (P1)

#### 1. Fusion guidée contextuelle

**Déclenchement** : Quand l'utilisateur clique "Fusionner" sur une paire/cluster qui a des relations qui sont aussi des doublons.

**Workflow** :

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      FLUX FUSION GUIDÉE CONTEXTUELLE                            │
└─────────────────────────────────────────────────────────────────────────────────┘

  UTILISATEUR                    SYSTÈME                         RÉSULTAT
  ────────────────────────────────────────────────────────────────────────────────

  Clique "Fusionner"    ──►    detectRelatedDuplicates()    
  sur Jean DUPONT               - Parents sont doublons ?
                                - Conjoints sont doublons ?
                                - Enfants sont doublons ?
                                        │
                        ┌───────────────┴───────────────┐
                        │                               │
                   PAS DE                          DOUBLONS
                   DOUBLONS                        DÉTECTÉS
                        │                               │
                        ▼                               ▼
                   Fusion directe              Modal d'assistance
                   (comportement actuel)       "Avant de fusionner..."
                                                       │
                                                       ▼
                                              ┌────────────────────┐
                                              │ Proposer l'ordre   │
                                              │ optimal Top-Down   │
                                              └────────────────────┘
                                                       │
                                                       ▼
                                              Fusion guidée étape
                                              par étape avec recalcul
```

**Modal d'assistance** :

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ⚠️ Relations en doublon détectées                                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Avant de fusionner Jean DUPONT (I100 + I200), nous avons détecté :            │
│                                                                                 │
│  👨‍👩‍👧 Parents :                                                                   │
│     • Pierre DUPONT (I50 + I150) - Score: 85%                                  │
│     • Marie MARTIN (I51 + I151) - Score: 78%                                   │
│                                                                                 │
│  💑 Conjoints :                                                                 │
│     • Suzanne BERNARD (I300 + I400) - Score: 92%                               │
│                                                                                 │
│  👶 Enfants :                                                                   │
│     (aucun doublon détecté)                                                    │
│                                                                                 │
│  ────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  💡 Recommandation : Fusionner d'abord les parents pour garantir              │
│     la cohérence des références familiales.                                    │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │
│  │ 🔄 Commencer    │  │ ⏭️ Ignorer et   │  │ ❌ Annuler      │                 │
│  │ fusion guidée   │  │ fusionner       │  │                 │                 │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### 2. Recalcul dynamique après fusion

**Objectif** : Après chaque fusion d'une paire liée, mettre à jour :
- La liste des doublons restants
- Les dépendances de la paire originale
- L'affichage de l'assistant

**Implémentation** :

```javascript
const handleGuidedFusion = async (originalPair, relatedPair) => {
  // 1. Fusionner la paire liée
  await executeMerge(relatedPair);
  
  // 2. Recalculer les doublons
  const updatedDuplicates = findDuplicates(individuals);
  
  // 3. Recalculer les dépendances de la paire originale
  const updatedDependencies = detectRelatedDuplicates(originalPair, updatedDuplicates);
  
  // 4. Si plus de dépendances → proposer fusion de l'original
  if (updatedDependencies.length === 0) {
    showFusionReady(originalPair);
  } else {
    // Continuer avec les dépendances restantes
    updateAssistantModal(updatedDependencies);
  }
};
```

#### 3. Nouvelle structure FUSION_LEVELS (Top-Down)

```javascript
// Nouveau dans fusionOrder.mjs
export const FUSION_LEVELS = {
  NO_PARENT_DUPLICATES: 0,    // Pas de parents doublons → fusionner en premier
  NO_SPOUSE_DUPLICATES: 1,    // Pas de conjoints doublons
  HAS_DEPENDENCIES: 2,        // A des dépendances → fusionner en dernier
  INDEPENDENT: 3              // Aucune relation avec d'autres doublons
};

export const FUSION_LEVEL_LABELS = {
  0: { label: 'Parents stables', emoji: '👴', color: 'emerald' },
  1: { label: 'Conjoints stables', emoji: '💑', color: 'blue' },
  2: { label: 'Avec dépendances', emoji: '🔗', color: 'amber' },
  3: { label: 'Indépendants', emoji: '👤', color: 'gray' }
};
```

---

### 🟡 PRIORITÉ MOYENNE (P2)

#### 4. Sélection en cascade

**Objectif** : Quand l'utilisateur sélectionne une paire dans l'assistant, présélectionner automatiquement ses dépendances.

```
Exemple :
- Utilisateur sélectionne "Jean DUPONT" 
- → Auto-sélection de ses parents "Pierre DUPONT" et "Marie MARTIN"
- → L'utilisateur peut décocher si nécessaire
```

#### 5. Prévisualisation de l'impact

**Objectif** : Montrer avant fusion ce qui va changer dans les relations.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  📊 Impact de la fusion                                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Fusionner Pierre DUPONT (I50 → I150) va :                                     │
│                                                                                 │
│  ✓ Mettre à jour 3 références FAMC                                             │
│  ✓ Consolider 2 familles en 1                                                  │
│  ✓ Préserver 5 sources de I50 + 3 sources de I150                              │
│                                                                                 │
│  Familles affectées :                                                          │
│  • F50 (Pierre + Marie) + F150 (Pierre + Marie) → F50                          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🟢 PRIORITÉ BASSE (P3)

#### 6. Export du plan de fusion

**Objectif** : Permettre d'exporter l'ordre de fusion recommandé avant exécution.

```json
{
  "fusionPlan": {
    "generated": "2026-01-13T14:30:00Z",
    "totalPairs": 12,
    "steps": [
      {
        "order": 1,
        "level": "NO_PARENT_DUPLICATES",
        "pairs": [
          { "keep": "I150", "merge": "I50", "score": 85 },
          { "keep": "I151", "merge": "I51", "score": 78 }
        ]
      },
      {
        "order": 2,
        "level": "NO_SPOUSE_DUPLICATES",
        "pairs": [...]
      }
    ]
  }
}
```

---

## 📁 Nouveaux fichiers / Modifications

### Fichiers modifiés

| Fichier | Modifications |
|---------|---------------|
| `src/App.jsx` | + Modal assistant fusion guidée |
| | + État `guidedFusionContext` |
| | + Fonction `detectRelatedDuplicates()` |
| | + Fonction `handleGuidedFusion()` |
| `src/utils/fusionOrder.mjs` | Modification FUSION_LEVELS (Top-Down) |
| | + Fonction `getRelatedDuplicates()` |
| | + Fonction `calculateFusionImpact()` |

### Nouveaux états React

```javascript
// Dans App.jsx
const [guidedFusionContext, setGuidedFusionContext] = useState(null);
// Structure:
// {
//   originalPair: { person1, person2, pairId },
//   relatedDuplicates: {
//     parents: [...],
//     spouses: [...],
//     children: [...]
//   },
//   currentStep: 0,
//   completedPairs: []
// }

const [showGuidedAssistant, setShowGuidedAssistant] = useState(false);
```

---

## 🧪 Tests prévus

### Nouveaux tests statiques (+30)

| Catégorie | Tests | Description |
|-----------|-------|-------------|
| Détection relations | 8 | `detectRelatedDuplicates()` |
| Modal assistant | 10 | Affichage, boutons, états |
| Recalcul dynamique | 7 | Mise à jour après fusion |
| Sélection cascade | 5 | Auto-sélection dépendances |

### Nouveaux tests Vitest (+20)

| Fichier | Tests | Description |
|---------|-------|-------------|
| `guidedFusion.test.mjs` | 20 | Scénarios de fusion guidée |

**Total attendu v2.4.0** : 770 tests (557 statiques + 213 Vitest)

---

## 📅 Planning estimé

| Phase | Durée | Livrables |
|-------|-------|-----------|
| **Phase 1** | 2h | Modification FUSION_LEVELS, `detectRelatedDuplicates()` |
| **Phase 2** | 3h | Modal assistant, états React |
| **Phase 3** | 2h | Recalcul dynamique, `handleGuidedFusion()` |
| **Phase 4** | 2h | Tests, documentation |
| **Total** | ~9h | v2.4.0 complète |

---

## ✅ Critères de validation

### Fonctionnels

- [ ] Clic "Fusionner" sur paire avec dépendances → Modal assistant s'affiche
- [ ] Clic "Fusionner" sur paire sans dépendances → Fusion directe (comme avant)
- [ ] Bouton "Commencer fusion guidée" → Affiche la première étape
- [ ] Après fusion d'une dépendance → Recalcul et mise à jour de l'assistant
- [ ] Bouton "Ignorer et fusionner" → Fusion directe sans traiter les dépendances
- [ ] Ordre Top-Down respecté (parents → conjoints → enfants)

### Techniques

- [ ] Pas de régression sur les 720 tests existants
- [ ] Build Netlify réussi
- [ ] Performance : Modal s'affiche en < 500ms
- [ ] Aucune erreur console

### UX

- [ ] Assistant clair et non intrusif
- [ ] Possibilité de skip à tout moment
- [ ] Feedback visuel sur les dépendances résolues

---

## 🔄 Compatibilité ascendante

**Garanties v2.4.0** :
- ✅ Tous les fichiers GEDCOM v2.3.0 restent compatibles
- ✅ L'option "Ignorer et fusionner" préserve le comportement v2.2.x
- ✅ Aucune donnée perdue lors de la fusion guidée
- ✅ rawLines toujours préservés

---

*Roadmap créée le 13 janvier 2026*
