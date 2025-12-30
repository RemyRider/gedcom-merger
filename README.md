# Fusionneur GEDCOM v1.9.3

Application web responsive pour détecter et fusionner les doublons dans les fichiers de généalogie GEDCOM.

## Nouveautés v1.9.3 (30 décembre 2025)

### 4 Corrections majeures

1. **Onglet "À supprimer"** remplace "Isolés" avec filtrage strict
   - Critère 1: Totalement isolé (sans parents ET sans enfants ET sans conjoints)
   - Critère 2: Sans identité (pas de nom ET pas de prénom)

2. **Bouton flottant** pour actions rapides sans scroller
   - Bouton "Fusionner X doublon(s)" en bas à droite
   - Bouton "Supprimer X individu(s)" distinct

3. **Tableau clusters détaillé** avec 9 colonnes
   - Nom complet, Naissance, Lieu, Décès, Sexe
   - Parents, Conjoints, ID
   - Statistiques du cluster

4. **Action "Supprimer" distincte** de "Fusionner"
   - Confirmation explicite avant suppression
   - Compteurs séparés dans les résultats

## Fonctionnalités

- Détection intelligente avec Soundex français
- Algorithme anti-faux-positifs (critères suffisants requis)
- Triple indexation pour performance optimale
- 4 onglets : Clusters, Doublons, À supprimer, Suggestions IA
- Export GEDCOM nettoyé avec HEAD/TRLR générés

## Installation

```bash
npm install
npm run dev
```

## Déploiement Netlify

```bash
npm run build
# Uploader le contenu du dossier dist/
```

## Structure

```
src/
  App.jsx       # Composant principal (~1500 lignes)
  main.jsx      # Point d'entrée React
  index.css     # Styles Tailwind
```

## Algorithme anti-faux-positifs (v1.9.2)

Le nom + sexe sont NÉCESSAIRES mais PAS SUFFISANTS. Au moins 1 critère suffisant requis :
- Date de naissance exacte ou année
- Lieu de naissance
- Parents communs (1 ou 2)
- Fratrie identique
- Conjoints communs
- Date de décès
- Profession identique

## Licence

MIT - Rémiol 2025
