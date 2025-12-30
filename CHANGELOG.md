# Changelog - Fusionneur GEDCOM

## v1.9.4 (30 décembre 2025) - ACTUELLE

### Nouvelles fonctionnalités
- Contrôle d'intégrité 8 types restauré (style v1.6.1)
- Bouton "Recommencer" déplacé dans le header
- Boutons de sélection affichent la valeur dynamique du filtre
- Modal d'intégrité avec rapport détaillé complet

### Vérifications d'intégrité
- Type 1: Liens bidirectionnels famille-individu
- Type 2: Dates incohérentes (naissance après décès)
- Type 3: Boucles généalogiques
- Type 4: Structure GEDCOM (sauts de niveau)
- Type 5: Références orphelines
- Type 6: IDs dupliqués
- Type 7: Personnes isolées
- Type 8: Score de complétude

### Tests
- 226 tests automatisés (20 niveaux + 3 bonus)
- Tests exécutés automatiquement avant chaque build Netlify

---

## v1.9.3 (30 décembre 2025)

### Nouvelles fonctionnalités
- Onglet "À supprimer" remplace "Isolés" avec filtrage strict
- Critères: totalement isolés (sans famille) OU sans nom/prénom
- Bouton flottant pour actions rapides sans scroller
- Tableau clusters détaillé avec 9 colonnes
- Action "Supprimer" distincte de "Fusionner"

### Préservation
- Algorithme anti-faux-positifs v1.9.2 préservé

---

## v1.9.2 (28 décembre 2025)

### Correction critique
- CORRECTION MAJEURE: Nom + Sexe ne suffisent plus pour être doublon
- Nouvelle règle: AU MOINS 1 critère suffisant requis
- Critères suffisants: naissance, lieu, parents, conjoints, fratrie, décès, profession

---

## v1.8.7 (24 décembre 2025)

### Améliorations
- Système onglets Clusters/Doublons simples
- Scoring moyen des clusters avec jauges visuelles
- Filtre pourcentage minimum pour clusters

---

## v1.8.6 (16 décembre 2025)

### Corrections GEDCOM
- Correction gestion balises CONT/CONC multi-lignes
- Génération automatique en-tête HEAD complet
