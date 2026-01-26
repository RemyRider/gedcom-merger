/**
 * GEDCOM Merger v2.4.1 - Fusion Intelligente Cherry-Picking
 * 
 * Fonctionnalités :
 * - Score de propreté pour tri intelligent des doublons
 * - Détection des potentiels doublons après fusion
 * - Cherry-picking valeur par valeur avec suggestions automatiques
 * 
 * @module fusionOrder
 */

// ============================================================================
// CONSTANTES ET TYPES
// ============================================================================

export const FUSION_LEVELS = {
  CHILDREN: 0,
  SPOUSES: 1,
  PARENTS: 2,
  INDEPENDENT: 3
};

export const FUSION_LEVEL_LABELS = {
  [FUSION_LEVELS.CHILDREN]: { label: 'Enfants', emoji: '👶', color: 'emerald' },
  [FUSION_LEVELS.SPOUSES]: { label: 'Conjoints', emoji: '💑', color: 'blue' },
  [FUSION_LEVELS.PARENTS]: { label: 'Parents', emoji: '👴', color: 'amber' },
  [FUSION_LEVELS.INDEPENDENT]: { label: 'Indépendants', emoji: '👤', color: 'gray' }
};

/**
 * Types de champs pour le cherry-picking
 */
export const FIELD_TYPES = {
  SIMPLE: 'simple',
  MULTIVALUE: 'multivalue',
  RELATION: 'relation'
};

/**
 * Configuration des champs pour la fusion
 */
export const MERGE_FIELDS_CONFIG = {
  birth: { type: FIELD_TYPES.SIMPLE, label: 'Date de naissance', category: 'dates' },
  birthPlace: { type: FIELD_TYPES.SIMPLE, label: 'Lieu de naissance', category: 'places' },
  death: { type: FIELD_TYPES.SIMPLE, label: 'Date de décès', category: 'dates' },
  deathPlace: { type: FIELD_TYPES.SIMPLE, label: 'Lieu de décès', category: 'places' },
  baptism: { type: FIELD_TYPES.SIMPLE, label: 'Date de baptême', category: 'dates' },
  baptismPlace: { type: FIELD_TYPES.SIMPLE, label: 'Lieu de baptême', category: 'places' },
  burial: { type: FIELD_TYPES.SIMPLE, label: 'Date d\'inhumation', category: 'dates' },
  burialPlace: { type: FIELD_TYPES.SIMPLE, label: 'Lieu d\'inhumation', category: 'places' },
  occupation: { type: FIELD_TYPES.SIMPLE, label: 'Profession', category: 'info' },
  religion: { type: FIELD_TYPES.SIMPLE, label: 'Religion', category: 'info' },
  sex: { type: FIELD_TYPES.SIMPLE, label: 'Sexe', category: 'info' },
  title: { type: FIELD_TYPES.SIMPLE, label: 'Titre', category: 'info' },
  residence: { type: FIELD_TYPES.SIMPLE, label: 'Résidence', category: 'places' },
  names: { type: FIELD_TYPES.MULTIVALUE, label: 'Noms', category: 'identity' },
  parents: { type: FIELD_TYPES.RELATION, label: 'Parents', category: 'relations' },
  spouses: { type: FIELD_TYPES.RELATION, label: 'Conjoints', category: 'relations' },
  children: { type: FIELD_TYPES.RELATION, label: 'Enfants', category: 'relations' }
};

// ============================================================================
// UTILITAIRES DE BASE
// ============================================================================

export const createPairId = (id1, id2) => {
  return id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
};

export const findDuplicatesAmongIds = (ids, duplicatePairsMap, idToPairsMap) => {
  const foundPairIds = new Set();
  if (!ids || !Array.isArray(ids)) return [];
  
  ids.forEach(id => {
    const pairIds = idToPairsMap.get(id);
    if (pairIds) {
      pairIds.forEach(pairId => {
        const pair = duplicatePairsMap.get(pairId);
        if (pair) {
          const otherId = pair.person1.id === id ? pair.person2.id : pair.person1.id;
          if (ids.includes(otherId)) {
            foundPairIds.add(pairId);
          }
        }
      });
    }
  });
  
  return Array.from(foundPairIds);
};

// ============================================================================
// SCORE DE PROPRETÉ
// ============================================================================

const extractLastName = (name) => {
  if (!name) return '';
  const match = name.match(/\/([^/]+)\//);
  return match ? match[1].trim() : '';
};

const extractFirstName = (name) => {
  if (!name) return '';
  const parts = name.split('/');
  return parts[0] ? parts[0].trim() : '';
};

const extractYear = (dateStr) => {
  if (!dateStr) return null;
  const match = dateStr.match(/\d{4}/);
  return match ? parseInt(match[0], 10) : null;
};

export const calculateQuickSimilarity = (person1, person2) => {
  if (!person1 || !person2) return 0;
  
  let score = 0;
  
  const lastName1 = extractLastName(person1.names?.[0] || '');
  const lastName2 = extractLastName(person2.names?.[0] || '');
  if (lastName1 && lastName2 && lastName1.toLowerCase() === lastName2.toLowerCase()) {
    score += 30;
  }
  
  const firstName1 = extractFirstName(person1.names?.[0] || '');
  const firstName2 = extractFirstName(person2.names?.[0] || '');
  if (firstName1 && firstName2 && firstName1.toLowerCase() === firstName2.toLowerCase()) {
    score += 20;
  }
  
  const year1 = extractYear(person1.birth);
  const year2 = extractYear(person2.birth);
  if (year1 && year2 && Math.abs(year1 - year2) <= 5) {
    score += 25;
  }
  
  if (person1.sex && person2.sex && person1.sex === person2.sex) {
    score += 10;
  }
  
  return score;
};

export const detectPotentialDuplicatesAfterMerge = (person1, person2, peopleById, existingDuplicatePairs) => {
  const potentials = [];
  if (!person1 || !person2 || !peopleById) return potentials;
  
  const checkPairs = (ids1, ids2, type) => {
    const persons1 = (ids1 || []).map(id => peopleById.get(id)).filter(Boolean);
    const persons2 = (ids2 || []).map(id => peopleById.get(id)).filter(Boolean);
    
    persons1.forEach(p1 => {
      persons2.forEach(p2 => {
        if (p1.id !== p2.id) {
          const similarity = calculateQuickSimilarity(p1, p2);
          const alreadyDetected = existingDuplicatePairs?.has(createPairId(p1.id, p2.id));
          if (similarity >= 50 && !alreadyDetected) {
            potentials.push({ type, person1: p1, person2: p2, similarity });
          }
        }
      });
    });
  };
  
  checkPairs(person1.parents, person2.parents, 'parent');
  checkPairs(person1.spouses, person2.spouses, 'spouse');
  checkPairs(person1.children, person2.children, 'child');
  
  return potentials;
};

export const calculateCleanlinessScore = (pair, graph, peopleById, duplicatePairsMap) => {
  if (!pair || !pair.person1 || !pair.person2) {
    return { cleanlinessScore: 100, existingDuplicateRelations: 0, potentialDuplicatesAfterMerge: 0, details: [] };
  }
  
  const pairId = createPairId(pair.person1.id, pair.person2.id);
  const node = graph?.get(pairId);
  const details = [];
  let score = 100;
  
  const existingDuplicateRelations = node ? node.dependencyCount : 0;
  if (existingDuplicateRelations > 0) {
    const penalty = existingDuplicateRelations * 20;
    score -= penalty;
    details.push(`-${penalty} pts : ${existingDuplicateRelations} relation(s) déjà en doublon`);
  }
  
  const potentials = detectPotentialDuplicatesAfterMerge(pair.person1, pair.person2, peopleById, duplicatePairsMap);
  if (potentials.length > 0) {
    const penalty = potentials.length * 10;
    score -= penalty;
    details.push(`-${penalty} pts : ${potentials.length} doublon(s) potentiel(s) après fusion`);
  }
  
  score = Math.max(0, score);
  if (score === 100) details.push('✅ Fusion propre : aucun risque détecté');
  
  return { cleanlinessScore: score, existingDuplicateRelations, potentialDuplicatesAfterMerge: potentials.length, potentialDetails: potentials, details };
};

// ============================================================================
// GRAPHE DE DÉPENDANCES
// ============================================================================

export const buildDependencyGraph = (duplicates, individuals) => {
  const graph = new Map();
  
  if (!duplicates || !Array.isArray(duplicates) || !individuals || !Array.isArray(individuals)) {
    return { graph, stats: { totalPairs: 0 }, duplicatePairsMap: new Map(), idToPairsMap: new Map(), peopleById: new Map() };
  }
  
  const peopleById = new Map(individuals.filter(p => p && p.id).map(p => [p.id, p]));
  const duplicatePairsMap = new Map();
  const idToPairsMap = new Map();
  
  duplicates.forEach(pair => {
    if (!pair?.person1?.id || !pair?.person2?.id) return;
    const pairId = createPairId(pair.person1.id, pair.person2.id);
    duplicatePairsMap.set(pairId, pair);
    [pair.person1.id, pair.person2.id].forEach(id => {
      if (!idToPairsMap.has(id)) idToPairsMap.set(id, new Set());
      idToPairsMap.get(id).add(pairId);
    });
  });
  
  duplicates.forEach(pair => {
    if (!pair?.person1?.id || !pair?.person2?.id) return;
    
    const pairId = createPairId(pair.person1.id, pair.person2.id);
    const p1 = pair.person1, p2 = pair.person2;
    
    const allParents = [...new Set([...(p1.parents || []), ...(p2.parents || [])])];
    const allSpouses = [...new Set([...(p1.spouses || []), ...(p2.spouses || [])])];
    const allChildren = [...new Set([...(p1.children || []), ...(p2.children || [])])];
    
    const parentDuplicates = findDuplicatesAmongIds(allParents, duplicatePairsMap, idToPairsMap);
    const spouseDuplicates = findDuplicatesAmongIds(allSpouses, duplicatePairsMap, idToPairsMap);
    const childDuplicates = findDuplicatesAmongIds(allChildren, duplicatePairsMap, idToPairsMap);
    
    // v2.4.2: TOUTES les relations en doublon sont des dépendances (parents inclus)
    // Les individus sans aucune relation en doublon sont prioritaires
    const blockingDependencies = [...new Set([...parentDuplicates, ...spouseDuplicates, ...childDuplicates])];
    
    graph.set(pairId, {
      pairId, pair,
      persons: [p1.id, p2.id],
      dependencies: blockingDependencies,
      dependencyCount: blockingDependencies.length,
      totalConnections: parentDuplicates.length + spouseDuplicates.length + childDuplicates.length,
      parentDuplicates, spouseDuplicates, childDuplicates,
      hasParentDuplicates: parentDuplicates.length > 0,
      hasSpouseDuplicates: spouseDuplicates.length > 0,
      hasChildDuplicates: childDuplicates.length > 0,
      dependsOn: blockingDependencies,
      blocks: parentDuplicates
    });
  });
  
  // Calculer les scores de propreté
  graph.forEach((node, pairId) => {
    const cleanliness = calculateCleanlinessScore(node.pair, graph, peopleById, duplicatePairsMap);
    node.cleanlinessScore = cleanliness.cleanlinessScore;
    node.cleanlinessDetails = cleanliness;
  });
  
  const nodes = Array.from(graph.values());
  const stats = {
    totalPairs: duplicates.length,
    independent: nodes.filter(n => n.dependencyCount === 0).length,
    with1Dependency: nodes.filter(n => n.dependencyCount === 1).length,
    with2Dependencies: nodes.filter(n => n.dependencyCount === 2).length,
    withMoreDependencies: nodes.filter(n => n.dependencyCount > 2).length,
    cleanPairs: nodes.filter(n => n.cleanlinessScore === 100).length,
    riskyPairs: nodes.filter(n => n.cleanlinessScore < 50).length
  };
  
  return { graph, stats, duplicatePairsMap, idToPairsMap, peopleById };
};

export const sortByCleanlinessScore = (duplicates, graph) => {
  if (!duplicates || !graph) return [];
  
  return duplicates.map(pair => {
    const pairId = createPairId(pair.person1.id, pair.person2.id);
    const node = graph.get(pairId);
    return { ...pair, pairId, cleanlinessScore: node?.cleanlinessScore ?? 100, cleanlinessDetails: node?.cleanlinessDetails, dependencyCount: node?.dependencyCount ?? 0 };
  }).sort((a, b) => {
    if (a.cleanlinessScore !== b.cleanlinessScore) return b.cleanlinessScore - a.cleanlinessScore;
    if (a.dependencyCount !== b.dependencyCount) return a.dependencyCount - b.dependencyCount;
    return (b.score || 0) - (a.score || 0);
  });
};

export const sortByDependencyCount = sortByCleanlinessScore;

// ============================================================================
// CHERRY-PICKING : ANALYSE DES DIFFÉRENCES
// ============================================================================

const valuesAreEqual = (val1, val2) => {
  if (val1 === val2) return true;
  if (!val1 && !val2) return true;
  if (!val1 || !val2) return false;
  
  if (Array.isArray(val1) && Array.isArray(val2)) {
    if (val1.length !== val2.length) return false;
    const s1 = [...val1].sort(), s2 = [...val2].sort();
    return s1.every((v, i) => v === s2[i]);
  }
  
  if (typeof val1 === 'string' && typeof val2 === 'string') {
    return val1.trim().toLowerCase() === val2.trim().toLowerCase();
  }
  
  return false;
};

export const getDatePrecisionScore = (dateStr) => {
  if (!dateStr) return 0;
  const d = dateStr.toUpperCase().trim();
  if (/^(ABT|BEF|AFT|EST|CAL)\s+/.test(d)) return 5;
  if (/^BET\s+\d{4}\s+AND\s+\d{4}$/.test(d)) return 6;
  if (/^\d{1,2}\s+[A-Z]{3}\s+\d{4}$/.test(d)) return 15;
  if (/^[A-Z]{3}\s+\d{4}$/.test(d)) return 12;
  if (/^\d{4}$/.test(d)) return 8;
  return 3;
};

export const getPlacePrecisionScore = (place) => {
  if (!place) return 0;
  const parts = place.split(',').map(p => p.trim()).filter(p => p.length > 0);
  if (parts.length >= 4) return 10;
  if (parts.length === 3) return 8;
  if (parts.length === 2) return 6;
  if (parts.length === 1) return 4;
  return 0;
};

const suggestBestValue = (val1, val2, fieldName, config) => {
  if (!val1 && val2) return { source: 'B', value: val2, reason: 'Seule valeur disponible' };
  if (val1 && !val2) return { source: 'A', value: val1, reason: 'Seule valeur disponible' };
  if (!val1 && !val2) return { source: 'none', value: null, reason: 'Aucune valeur' };
  
  if (config.category === 'dates') {
    const s1 = getDatePrecisionScore(val1), s2 = getDatePrecisionScore(val2);
    if (s1 > s2) return { source: 'A', value: val1, reason: 'Date plus précise' };
    if (s2 > s1) return { source: 'B', value: val2, reason: 'Date plus précise' };
    return { source: 'A', value: val1, reason: 'Précision équivalente' };
  }
  
  if (config.category === 'places') {
    const s1 = getPlacePrecisionScore(val1), s2 = getPlacePrecisionScore(val2);
    if (s1 > s2) return { source: 'A', value: val1, reason: 'Lieu plus complet' };
    if (s2 > s1) return { source: 'B', value: val2, reason: 'Lieu plus complet' };
    return { source: 'A', value: val1, reason: 'Complétude équivalente' };
  }
  
  if (typeof val1 === 'string' && typeof val2 === 'string') {
    if (val1.length > val2.length) return { source: 'A', value: val1, reason: 'Plus détaillé' };
    if (val2.length > val1.length) return { source: 'B', value: val2, reason: 'Plus détaillé' };
  }
  
  return { source: 'A', value: val1, reason: 'Valeur par défaut' };
};

export const analyzeFieldDifferences = (person1, person2, peopleById = new Map()) => {
  const identical = [], different = [], suggestions = {};
  
  if (!person1 || !person2) return { identical, different, suggestions };
  
  Object.entries(MERGE_FIELDS_CONFIG).forEach(([fieldName, config]) => {
    const val1 = person1[fieldName], val2 = person2[fieldName];
    
    if (config.type === FIELD_TYPES.SIMPLE) {
      if (valuesAreEqual(val1, val2)) {
        identical.push({ field: fieldName, label: config.label, value: val1 || val2 || null, type: config.type });
      } else {
        const suggestion = suggestBestValue(val1, val2, fieldName, config);
        different.push({ field: fieldName, label: config.label, valueA: val1 || null, valueB: val2 || null, type: config.type, category: config.category, suggestion });
        suggestions[fieldName] = suggestion;
      }
    } else if (config.type === FIELD_TYPES.MULTIVALUE) {
      const arr1 = Array.isArray(val1) ? val1 : (val1 ? [val1] : []);
      const arr2 = Array.isArray(val2) ? val2 : (val2 ? [val2] : []);
      
      if (valuesAreEqual(arr1, arr2)) {
        identical.push({ field: fieldName, label: config.label, value: arr1, type: config.type });
      } else {
        const allValues = [...new Set([...arr1, ...arr2])];
        different.push({ field: fieldName, label: config.label, valuesA: arr1, valuesB: arr2, allValues, type: config.type });
        suggestions[fieldName] = { source: 'merge', selected: allValues, reason: 'Fusionner tous les noms' };
      }
    } else if (config.type === FIELD_TYPES.RELATION) {
      const ids1 = Array.isArray(val1) ? val1 : (val1 ? [val1] : []);
      const ids2 = Array.isArray(val2) ? val2 : (val2 ? [val2] : []);
      
      const resolve = (ids) => ids.map(id => {
        const p = peopleById.get(id);
        return p ? { id, name: p.names?.[0] || id, person: p } : { id, name: id, person: null };
      });
      
      const persons1 = resolve(ids1), persons2 = resolve(ids2);
      
      if (valuesAreEqual(ids1, ids2)) {
        identical.push({ field: fieldName, label: config.label, value: persons1, type: config.type });
      } else {
        const allIds = [...new Set([...ids1, ...ids2])];
        const allPersons = allIds.map(id => {
          const p = peopleById.get(id);
          return { id, name: p?.names?.[0] || id, person: p || null, fromA: ids1.includes(id), fromB: ids2.includes(id) };
        });
        different.push({ field: fieldName, label: config.label, personsA: persons1, personsB: persons2, allPersons, type: config.type });
        suggestions[fieldName] = { source: 'merge', selected: allIds, reason: 'Fusionner toutes les relations' };
      }
    }
  });
  
  return { identical, different, suggestions };
};

export const prepareCherryPickingData = (pair, peopleById = new Map()) => {
  if (!pair?.person1 || !pair?.person2) return null;
  
  const { identical, different, suggestions } = analyzeFieldDifferences(pair.person1, pair.person2, peopleById);
  
  const group = (arr, cat) => arr.filter(f => MERGE_FIELDS_CONFIG[f.field]?.category === cat);
  
  return {
    pair,
    personA: pair.person1,
    personB: pair.person2,
    identical, different, suggestions,
    groupedIdentical: { identity: group(identical, 'identity'), dates: group(identical, 'dates'), places: group(identical, 'places'), info: group(identical, 'info'), relations: group(identical, 'relations') },
    groupedDifferent: { identity: group(different, 'identity'), dates: group(different, 'dates'), places: group(different, 'places'), info: group(different, 'info'), relations: group(different, 'relations') },
    hasConflicts: different.length > 0,
    stats: { identicalCount: identical.length, differentCount: different.length, totalFields: identical.length + different.length }
  };
};

export const applyMergeChoices = (personA, personB, choices, identical = []) => {
  const merged = { id: personA.id, removedId: personB.id, mergedFrom: [personA.id, personB.id], rawLines: personA.rawLines || [], rawLinesByTag: personA.rawLinesByTag || {} };
  
  identical.forEach(f => { merged[f.field] = f.value; });
  
  Object.entries(choices).forEach(([fieldName, choice]) => {
    const config = MERGE_FIELDS_CONFIG[fieldName];
    if (!config) return;
    
    if (config.type === FIELD_TYPES.SIMPLE) {
      merged[fieldName] = choice.source === 'A' ? personA[fieldName] : choice.source === 'B' ? personB[fieldName] : choice.value;
    } else {
      merged[fieldName] = choice.selected || [];
    }
  });
  
  return merged;
};

// ============================================================================
// FONCTIONS UTILITAIRES COMPLÉMENTAIRES
// ============================================================================

export const calculateEnrichedQuality = (person, peopleById = new Map()) => {
  if (!person) return { score: 0, details: [] };
  
  let score = 0;
  const details = [];
  
  // Précision dates
  score += getDatePrecisionScore(person.birth) + getDatePrecisionScore(person.death);
  // Précision lieux
  score += getPlacePrecisionScore(person.birthPlace) + getPlacePrecisionScore(person.deathPlace);
  
  // Relations valides
  let validRel = 0;
  (person.parents || []).forEach(id => { if (peopleById.has(id)) validRel += 5; });
  (person.spouses || []).forEach(id => { if (peopleById.has(id)) validRel += 5; });
  (person.children || []).forEach(id => { if (peopleById.has(id)) validRel += 3; });
  score += Math.min(30, validRel);
  
  // Comptage sources (SOUR) et notes
  let sourceCount = 0;
  if (person.rawLinesByTag) {
    sourceCount = (person.rawLinesByTag.SOUR || []).length;
    sourceCount += (person.rawLinesByTag.NOTE || []).length;
  } else if (person.rawLines) {
    sourceCount = person.rawLines.filter(l => l.includes(' SOUR ') || l.includes(' NOTE ')).length;
  }
  const sources = sourceCount;
  score += Math.min(15, sources * 3);
  if (sources > 0) details.push(`Sources: ${sources}`);
  
  // Complétude
  if (person.names?.some(n => n && String(n).trim().length > 0)) {
    let filled = 1;
    ['birth', 'birthPlace', 'death', 'deathPlace', 'occupation', 'sex'].forEach(f => { if (person[f]) filled++; });
    score += Math.round((filled / 8) * 10);
  }
  
  return { score: Math.min(100, score), details, sourceCount: sources };
};

const calculateLevel = (pairId, graph, nodeLevel, visiting = new Set()) => {
  if (nodeLevel.has(pairId)) return nodeLevel.get(pairId);
  if (visiting.has(pairId)) return 0;
  visiting.add(pairId);
  const node = graph.get(pairId);
  if (!node || node.dependencies.length === 0) { nodeLevel.set(pairId, 0); return 0; }
  const level = Math.max(...node.dependencies.map(d => calculateLevel(d, graph, nodeLevel, visiting) + 1));
  nodeLevel.set(pairId, level);
  return level;
};

export const calculateFusionOrder = (graph) => {
  if (!graph || graph.size === 0) return [];
  
  const levels = [], remaining = new Set(graph.keys()), merged = new Set();
  let currentLevel = 0;
  
  while (remaining.size > 0 && currentLevel < graph.size + 1) {
    const levelPairs = [];
    remaining.forEach(pairId => {
      const node = graph.get(pairId);
      // Traitement niveau 0 : pas de dépendances ou level === 0
      if (node && (node.dependencies.length === 0 || !node.dependsOn || node.dependsOn.length === 0)) {
        if (node.dependencies.every(d => merged.has(d))) {
          levelPairs.push({ pairId, pair: node.pair, dependencyCount: node.dependencyCount, cleanlinessScore: node.cleanlinessScore });
        }
      } else if (node && node.dependencies.every(d => merged.has(d))) {
        levelPairs.push({ pairId, pair: node.pair, dependencyCount: node.dependencyCount, cleanlinessScore: node.cleanlinessScore });
      }
    });
    
    if (levelPairs.length === 0 && remaining.size > 0) {
      // Cycle détecté - forcer les paires restantes
      console.warn('Cycle détecté dans le graphe de dépendances');
      remaining.forEach(pairId => { const n = graph.get(pairId); if (n) levelPairs.push({ pairId, pair: n.pair, hasCycle: true }); });
      remaining.clear();
    }
    
    levelPairs.sort((a, b) => (b.cleanlinessScore || 0) - (a.cleanlinessScore || 0));
    if (levelPairs.length > 0) {
      levels.push({ level: currentLevel, pairs: levelPairs, count: levelPairs.length });
      levelPairs.forEach(p => { remaining.delete(p.pairId); merged.add(p.pairId); });
    }
    currentLevel++;
  }
  return levels;
};

export const updateGraphAfterMerge = (graph, mergedPairId) => {
  const newGraph = new Map(graph);
  newGraph.delete(mergedPairId);
  newGraph.forEach((node, pairId) => {
    const newDeps = node.dependencies.filter(d => d !== mergedPairId);
    newGraph.set(pairId, { ...node, dependencies: newDeps, dependencyCount: newDeps.length });
  });
  return newGraph;
};

export const detectRelatedDuplicates = (pair, duplicates, individuals) => {
  if (!pair || !duplicates || !individuals) return { hasRelatedDuplicates: false, parents: [], spouses: [], children: [], total: 0, recommendedOrder: [] };
  
  const { graph, duplicatePairsMap } = buildDependencyGraph(duplicates, individuals);
  const pairId = createPairId(pair.person1.id, pair.person2.id);
  const node = graph.get(pairId);
  if (!node) return { hasRelatedDuplicates: false, parents: [], spouses: [], children: [], total: 0, recommendedOrder: [] };
  
  // Récupérer les paires liées avec leur cleanlinessScore
  const getRelated = (ids) => ids.map(pid => { 
    const p = duplicatePairsMap.get(pid); 
    const relatedNode = graph.get(pid);
    return p ? { 
      pairId: pid, 
      person1: p.person1, 
      person2: p.person2, 
      score: p.score,
      cleanlinessScore: relatedNode?.cleanlinessScore || 0,
      dependencyCount: relatedNode?.dependencyCount || 0
    } : null; 
  }).filter(Boolean);
  
  // Trier par cleanlinessScore décroissant (les plus "propres" d'abord = moins de contraintes)
  const sortByCleanest = (arr) => arr.sort((a, b) => b.cleanlinessScore - a.cleanlinessScore);
  
  const parents = sortByCleanest(getRelated(node.parentDuplicates));
  const spouses = sortByCleanest(getRelated(node.spouseDuplicates));
  const children = sortByCleanest(getRelated(node.childDuplicates));
  
  // Ordre recommandé : enfants d'abord, puis conjoints, puis parents (bottom-up)
  // Au sein de chaque catégorie, les plus propres en premier
  const recommendedOrder = [...children, ...spouses, ...parents];
  
  return { hasRelatedDuplicates: node.dependencyCount > 0, parents, spouses, children, total: node.dependencyCount, cleanlinessScore: node.cleanlinessScore, cleanlinessDetails: node.cleanlinessDetails, recommendedOrder };
};

/**
 * Calcule l'impact d'une fusion sur le graphe
 * @returns {Object} { unblocked, unblockedPairs, details }
 */
export const calculateFusionImpact = (pair, graph) => {
  if (!pair || !graph) return { unblocked: 0, unblockedPairs: [], details: [] };
  
  const pairId = createPairId(pair.person1.id, pair.person2.id);
  const unblockedPairs = [];
  
  graph.forEach((node, nodeId) => {
    if (nodeId === pairId) return;
    // Si cette paire dépend de la paire à fusionner
    if (node.dependencies && node.dependencies.includes(pairId)) {
      const remainingDeps = node.dependencies.filter(d => d !== pairId);
      // Si c'était la dernière dépendance, la paire est débloquée
      if (remainingDeps.length === 0) {
        unblockedPairs.push(nodeId);
      }
    }
  });
  
  return {
    unblocked: unblockedPairs.length,
    unblockedPairs,
    details: unblockedPairs.map(id => {
      const node = graph.get(id);
      return node ? `${node.pair.person1.names?.[0] || '?'} ↔ ${node.pair.person2.names?.[0] || '?'}` : id;
    })
  };
};

export const determineMergeOrder = (person1, person2, peopleById = new Map()) => {
  const q1 = calculateEnrichedQuality(person1, peopleById).score;
  const q2 = calculateEnrichedQuality(person2, peopleById).score;
  return { keepPerson: q1 >= q2 ? person1 : person2, mergePerson: q1 >= q2 ? person2 : person1, qualityDiff: Math.abs(q1 - q2), quality1: q1, quality2: q2, isCompleted: true, completed: true };
};

export const calculateFusionStats = (order, graph) => {
  if (!order || !graph) return { totalPairs: 0, totalLevels: 0 };
  const totalPairs = order.reduce((s, l) => s + l.count, 0);
  return { totalPairs, totalLevels: order.length, withDependencies: totalPairs - (order[0]?.count || 0), independent: order[0]?.count || 0, independentPairs: order[0]?.count || 0 };
};

export const needsGuidedFusion = (pair, duplicates, individuals) => detectRelatedDuplicates(pair, duplicates, individuals).hasRelatedDuplicates;

export const generateCascadePlan = (pair, duplicates, individuals) => {
  const { graph } = buildDependencyGraph(duplicates, individuals);
  const order = calculateFusionOrder(graph);
  const steps = [];
  let stepNum = 1;
  order.forEach(l => l.pairs.forEach(p => steps.push({ step: stepNum++, ...p, isMainPair: p.pairId === createPairId(pair.person1.id, pair.person2.id) })));
  return { steps, totalPairs: steps.length, canAutomerge: true };
};

export const canFuseLevel = (pairId, graph, mergedPairs = new Set()) => { const n = graph.get(pairId); return !n || n.dependencies.every(d => mergedPairs.has(d)); };

export const prepareLevelForDisplay = (level, graph) => level.pairs.map(p => ({ ...p, isReady: p.dependencyCount === 0 }));
