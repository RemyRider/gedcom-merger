# Roadmap - GEDCOM Merger

## Version Actuelle : 2.4.0 ✅

Fusion guidée contextuelle avec approche Bottom-Up.

---

## Version 2.5.0 - Export et Reporting

**Objectif** : Permettre l'export des données d'analyse et des doublons détectés.

### Fonctionnalités Planifiées

#### Export CSV
- Liste des doublons avec scores
- Détails des critères de comparaison
- Statistiques par personne

#### Export JSON
- Structure complète des doublons
- Graphe de dépendances
- Métadonnées d'analyse

#### Rapport PDF
- Synthèse visuelle
- Graphiques de répartition
- Recommandations de fusion

### Estimation
- **Durée** : 6-8 heures
- **Tests supplémentaires** : ~40
- **Total tests attendu** : ~820

---

## Version 2.6.0 - Fusion par Lot

**Objectif** : Permettre la fusion de plusieurs paires en une seule opération avec confirmation groupée.

### Fonctionnalités Planifiées

#### Sélection Multiple Intelligente
- Checkbox "Tout sélectionner" par niveau
- Filtrage par score minimum
- Exclusion des paires avec conflits

#### Confirmation Groupée
- Récapitulatif des fusions planifiées
- Liste des conflits potentiels
- Ordre de fusion optimisé affiché

#### Rollback Partiel
- Possibilité d'annuler des fusions individuelles
- Historique des opérations
- Restauration sélective

### Estimation
- **Durée** : 8-10 heures
- **Tests supplémentaires** : ~50
- **Total tests attendu** : ~870

---

## Version 2.7.0 - Amélioration IA

**Objectif** : Renforcer la détection des doublons avec des algorithmes plus sophistiqués.

### Fonctionnalités Planifiées

#### Matching Phonétique Étendu
- Cologne Phonetic (allemand)
- NYSIIS (anglais)
- Caverphone (anglais/australien)
- Double Metaphone

#### Détection de Patterns
- Familles multiples avec mêmes prénoms
- Doublons de familles entières
- Incohérences générationnelles

#### Suggestions Intelligentes
- Recommandations de fusion automatiques
- Score de confiance
- Explication des critères

### Estimation
- **Durée** : 10-15 heures
- **Tests supplémentaires** : ~60
- **Total tests attendu** : ~930

---

## Version 3.0.0 - Multi-Fichiers

**Objectif** : Permettre la comparaison et fusion entre plusieurs fichiers GEDCOM.

### Fonctionnalités Planifiées

#### Import Multiple
- Charger 2+ fichiers GEDCOM
- Détection des doublons inter-fichiers
- Mapping des IDs entre fichiers

#### Fusion Inter-Fichiers
- Consolidation d'arbres généalogiques
- Résolution des conflits de données
- Préservation des sources

#### Arbre Maître
- Création d'un arbre consolidé
- Historique des sources
- Traçabilité des fusions

### Estimation
- **Durée** : 20-30 heures
- **Tests supplémentaires** : ~100
- **Total tests attendu** : ~1030

---

## Version 3.1.0 - Interface Améliorée

**Objectif** : Améliorer l'expérience utilisateur avec une interface plus moderne.

### Fonctionnalités Planifiées

#### Visualisation Arborescente
- Affichage graphique des relations
- Navigation interactive
- Zoom sur les branches

#### Mode Sombre
- Thème clair/sombre
- Préférence système
- Personnalisation couleurs

#### Responsive Mobile
- Interface adaptée tablettes
- Navigation tactile
- Actions par swipe

### Estimation
- **Durée** : 15-20 heures
- **Tests supplémentaires** : ~40
- **Total tests attendu** : ~1070

---

## Backlog (Non Planifié)

### Idées Futures
- [ ] Synchronisation avec MyHeritage API
- [ ] Import/Export vers autres formats (GRAMPS, Ancestry)
- [ ] Détection de photos en doublon
- [ ] OCR pour documents scannés
- [ ] Mode collaboratif multi-utilisateurs
- [ ] Historique des modifications avec versioning
- [ ] Intégration bases de données généalogiques (Geneanet, FamilySearch)

### Améliorations Techniques
- [ ] Migration vers TypeScript
- [ ] Tests E2E avec Playwright
- [ ] PWA (Progressive Web App)
- [ ] Internationalisation (i18n)
- [ ] Documentation API avec Storybook

---

## Principes de Développement

### Règles Immuables
1. **CommonJS pour config** : `postcss.config.cjs` et `tailwind.config.cjs`
2. **rawLines obligatoire** : Préservation des données GEDCOM
3. **Tests avant commit** : `npm run test:all` doit passer
4. **Incrémental** : Modifications chirurgicales, jamais de réécriture complète

### Workflow
1. Récupérer depuis `main` (stable)
2. Développer sur `dev`
3. Tester localement (statiques + Vitest)
4. Push sur `dev` → vérifier Netlify
5. Merger sur `main` quand stable

### Qualité
- Couverture tests : > 80%
- Zéro régression sur tests existants
- Documentation à jour à chaque version
