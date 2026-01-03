/**
 * GEDCOM Merger - Statistiques généalogiques
 * Fonctions d'analyse extraites pour tests unitaires
 */

import { extractYear } from './helpers.mjs';

/**
 * Calcule les statistiques généalogiques d'un fichier GEDCOM
 * @param {Array} people - Liste des individus
 * @param {Map} families - Map des familles
 * @returns {object} - Statistiques complètes
 */
export const calculateGenealogyStats = (people, families) => {
  // Répartition par sexe
  const males = people.filter(p => p.sex === 'M').length;
  const females = people.filter(p => p.sex === 'F').length;
  const unknown = people.length - males - females;
  
  // Distribution des années de naissance par décennie
  const birthDecades = {};
  const deathDecades = {};
  const ages = [];
  
  people.forEach(p => {
    const birthYear = extractYear(p.birth);
    const deathYear = extractYear(p.death);
    
    if (birthYear) {
      const decade = Math.floor(birthYear / 10) * 10;
      birthDecades[decade] = (birthDecades[decade] || 0) + 1;
    }
    if (deathYear) {
      const decade = Math.floor(deathYear / 10) * 10;
      deathDecades[decade] = (deathDecades[decade] || 0) + 1;
    }
    // Calcul de l'âge au décès
    if (birthYear && deathYear && deathYear >= birthYear) {
      const age = deathYear - birthYear;
      if (age <= 120) ages.push(age);
    }
  });
  
  // Statistiques d'âge
  const avgAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : null;
  const minAge = ages.length > 0 ? Math.min(...ages) : null;
  const maxAge = ages.length > 0 ? Math.max(...ages) : null;
  const medianAge = ages.length > 0 ? ages.sort((a, b) => a - b)[Math.floor(ages.length / 2)] : null;
  
  // Distribution des âges par tranche
  const ageRanges = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '80+': 0 };
  ages.forEach(age => {
    if (age <= 20) ageRanges['0-20']++;
    else if (age <= 40) ageRanges['21-40']++;
    else if (age <= 60) ageRanges['41-60']++;
    else if (age <= 80) ageRanges['61-80']++;
    else ageRanges['80+']++;
  });
  
  // Nb enfants par famille
  let totalChildren = 0;
  let familiesWithChildren = 0;
  let maxChildren = 0;
  let maxChildrenFamily = null;
  let childrenDistribution = { '0': 0, '1-2': 0, '3-5': 0, '6-10': 0, '10+': 0 };
  
  families.forEach((fam, famId) => {
    const childCount = fam.children?.length || 0;
    totalChildren += childCount;
    if (childCount > 0) familiesWithChildren++;
    if (childCount > maxChildren) {
      maxChildren = childCount;
      maxChildrenFamily = famId;
    }
    // Distribution du nombre d'enfants
    if (childCount === 0) childrenDistribution['0']++;
    else if (childCount <= 2) childrenDistribution['1-2']++;
    else if (childCount <= 5) childrenDistribution['3-5']++;
    else if (childCount <= 10) childrenDistribution['6-10']++;
    else childrenDistribution['10+']++;
  });
  
  // Dates complètes vs partielles
  let fullDates = 0, partialDates = 0, noDates = 0;
  people.forEach(p => {
    if (p.birth) {
      if (/\d{1,2}\s+\w+\s+\d{4}/.test(p.birth)) fullDates++;
      else partialDates++;
    } else {
      noDates++;
    }
  });
  
  // Top 10 patronymes
  const surnames = {};
  people.forEach(p => {
    const name = p.names[0] || '';
    const match = name.match(/\/([^/]+)\//);
    if (match) {
      const surname = match[1].toUpperCase();
      surnames[surname] = (surnames[surname] || 0) + 1;
    }
  });
  const topSurnames = Object.entries(surnames)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));
  
  // Top prénoms (Hommes et Femmes séparés)
  const maleFirstNames = {};
  const femaleFirstNames = {};
  people.forEach(p => {
    const name = p.names[0] || '';
    const firstName = name.split('/')[0].trim().split(' ')[0];
    if (firstName && firstName.length > 1) {
      const normalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      if (p.sex === 'M') {
        maleFirstNames[normalizedName] = (maleFirstNames[normalizedName] || 0) + 1;
      } else if (p.sex === 'F') {
        femaleFirstNames[normalizedName] = (femaleFirstNames[normalizedName] || 0) + 1;
      }
    }
  });
  const topMaleNames = Object.entries(maleFirstNames).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
  const topFemaleNames = Object.entries(femaleFirstNames).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
  
  // Top lieux de naissance
  const birthPlaces = {};
  people.forEach(p => {
    if (p.birthPlace) {
      const place = p.birthPlace.split(',')[0].trim();
      if (place) {
        birthPlaces[place] = (birthPlaces[place] || 0) + 1;
      }
    }
  });
  const topBirthPlaces = Object.entries(birthPlaces).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([place, count]) => ({ place, count }));
  
  // Professions les plus fréquentes
  const occupations = {};
  people.forEach(p => {
    if (p.occupation) {
      const occ = p.occupation.trim();
      if (occ) {
        occupations[occ] = (occupations[occ] || 0) + 1;
      }
    }
  });
  const topOccupations = Object.entries(occupations).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([occupation, count]) => ({ occupation, count }));
  
  // Période couverte
  const birthYears = people.map(p => extractYear(p.birth)).filter(Boolean);
  const deathYears = people.map(p => extractYear(p.death)).filter(Boolean);
  const minYear = birthYears.length ? Math.min(...birthYears) : null;
  const maxYear = Math.max(
    birthYears.length ? Math.max(...birthYears) : 0,
    deathYears.length ? Math.max(...deathYears) : 0
  ) || null;
  
  // Calcul du nombre de générations estimé
  const generationSpan = 25;
  const estimatedGenerations = minYear && maxYear ? Math.round((maxYear - minYear) / generationSpan) : null;
  
  // Individus avec plusieurs mariages
  const multipleMarriages = people.filter(p => p.spouses && p.spouses.length > 1).length;
  
  return {
    gender: { males, females, unknown, total: people.length },
    families: {
      total: families.size,
      withChildren: familiesWithChildren,
      withoutChildren: families.size - familiesWithChildren,
      avgChildren: familiesWithChildren ? (totalChildren / familiesWithChildren).toFixed(1) : 0,
      totalChildren,
      maxChildren,
      maxChildrenFamily,
      childrenDistribution
    },
    ages: {
      count: ages.length,
      avg: avgAge,
      min: minAge,
      max: maxAge,
      median: medianAge,
      distribution: ageRanges
    },
    dates: {
      full: fullDates,
      partial: partialDates,
      none: noDates,
      fullPct: people.length ? Math.round((fullDates / people.length) * 100) : 0
    },
    period: { 
      min: minYear, 
      max: maxYear,
      span: minYear && maxYear ? maxYear - minYear : null,
      estimatedGenerations
    },
    birthDecades,
    deathDecades,
    topSurnames,
    topMaleNames,
    topFemaleNames,
    topBirthPlaces,
    topOccupations,
    uniqueSurnames: Object.keys(surnames).length,
    uniquePlaces: Object.keys(birthPlaces).length,
    multipleMarriages
  };
};

/**
 * Détecte les incohérences chronologiques
 * @param {Array} people - Liste des individus
 * @param {Map} families - Map des familles
 * @returns {object} - { errors: Array, warnings: Array }
 */
export const detectChronologicalIssues = (people, families) => {
  const errors = [];
  const warnings = [];
  
  const getPersonById = (id) => people.find(p => p.id === id);
  
  people.forEach(person => {
    const birthYear = extractYear(person.birth);
    const deathYear = extractYear(person.death);
    const baptismYear = extractYear(person.baptism);
    const burialYear = extractYear(person.burial);
    const name = person.names[0] || person.id;
    
    // Règle 1: Naissance après décès
    if (birthYear && deathYear && birthYear > deathYear) {
      errors.push({
        type: 'BIRTH_AFTER_DEATH',
        personId: person.id,
        message: `${name} : naissance (${birthYear}) après décès (${deathYear})`
      });
    }
    
    // Règle 2: Baptême avant naissance
    if (birthYear && baptismYear && baptismYear < birthYear - 1) {
      errors.push({
        type: 'BAPTISM_BEFORE_BIRTH',
        personId: person.id,
        message: `${name} : baptême (${baptismYear}) avant naissance (${birthYear})`
      });
    }
    
    // Règle 3: Inhumation avant décès
    if (deathYear && burialYear && burialYear < deathYear) {
      errors.push({
        type: 'BURIAL_BEFORE_DEATH',
        personId: person.id,
        message: `${name} : inhumation (${burialYear}) avant décès (${deathYear})`
      });
    }
    
    // Règle 4: Parent né après enfant
    if (birthYear && person.parents.length > 0) {
      person.parents.forEach(parentId => {
        const parent = getPersonById(parentId);
        if (parent) {
          const parentBirth = extractYear(parent.birth);
          if (parentBirth && parentBirth >= birthYear) {
            errors.push({
              type: 'PARENT_BORN_AFTER_CHILD',
              personId: person.id,
              message: `${name} : parent ${parent.names[0] || parentId} né en ${parentBirth}, enfant né en ${birthYear}`
            });
          }
          // Règle 5: Parent trop jeune (<12 ans)
          if (parentBirth && birthYear - parentBirth < 12) {
            warnings.push({
              type: 'PARENT_TOO_YOUNG',
              personId: person.id,
              message: `${name} : parent ${parent.names[0] || parentId} avait ${birthYear - parentBirth} ans à la naissance`
            });
          }
          // Règle 6: Parent très âgé (>80 ans)
          if (parentBirth && birthYear - parentBirth > 80) {
            warnings.push({
              type: 'PARENT_TOO_OLD',
              personId: person.id,
              message: `${name} : parent ${parent.names[0] || parentId} avait ${birthYear - parentBirth} ans à la naissance`
            });
          }
        }
      });
    }
    
    // Règle 7: Longévité suspecte (>120 ans)
    if (birthYear && deathYear && deathYear - birthYear > 120) {
      warnings.push({
        type: 'EXTREME_LONGEVITY',
        personId: person.id,
        message: `${name} : longévité de ${deathYear - birthYear} ans (${birthYear}-${deathYear})`
      });
    }
  });
  
  return { errors, warnings };
};
