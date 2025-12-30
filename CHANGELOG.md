# Changelog GEDCOM Merger

## v1.9.3 (30 décembre 2025) - ACTUELLE

### Corrections chirurgicales depuis v1.9.2

1. **Onglet "À supprimer"** (remplace "Isolés")
   - Filtrage strict : totalement isolés OU sans identité
   - Totalement isolé = sans parents ET sans enfants ET sans conjoints
   - Sans identité = pas de nom ET pas de prénom

2. **Bouton flottant**
   - Position fixe en bas à droite
   - "Fusionner X doublon(s)" - bouton indigo
   - "Supprimer X individu(s)" - bouton rouge

3. **Tableau clusters détaillé**
   - 9 colonnes : #, Nom, Naissance, Lieu, Décès, Sexe, Parents, Conjoints, ID
   - Statistiques : avec naissance, avec décès, paires liées
   - Boutons Détails/Réduire avec icônes ChevronDown/Up

4. **Action "Supprimer" distincte**
   - Fonction handleDeleteToDelete() séparée de handleMerge()
   - Confirmation explicite avant suppression
   - Compteurs distincts dans validationResults

### Préservé de v1.9.2
- Algorithme anti-faux-positifs complet
- Triple indexation pour performance
- 4 onglets avec compteurs

---

## v1.9.2 (28 décembre 2025)

### CORRECTION CRITIQUE : Algorithme anti-faux-positifs

- Nom + Sexe ne suffisent plus pour être doublon
- Règle : AU MOINS 1 critère suffisant requis
- Critères suffisants : naissance, lieu, parents, conjoints, fratrie, décès, profession
- Élimination des faux positifs sur homonymes sans données

---

## v1.9.1 (28 décembre 2025)

- Correction du traitement des fichiers GEDCOM
- Restauration onglet Isolés
- Restauration onglet Suggestions IA
- Normalisation automatique des lieux (codes INSEE)

---

## v1.8.7 (24 décembre 2025)

- Restauration bouton Changelog/Nouveautés
- Système d'onglets Clusters/Doublons simples
- Scoring moyen des clusters avec jauges visuelles
- Filtre pourcentage minimum

---

## v1.8.6 (16 décembre 2025)

- Correction gestion balises CONT/CONC multi-lignes
- Génération automatique en-tête HEAD complet
- Génération automatique balise TRLR de fin

---

## v1.0.0 (1 décembre 2025)

Version initiale :
- Parseur GEDCOM complet
- Détection intelligente avec Soundex français
- Système de scoring hybride 9 critères
- Fusion sécurisée sans perte de données
