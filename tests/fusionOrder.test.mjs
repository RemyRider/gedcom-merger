/**
 * Tests Vitest pour fusionOrder.mjs (v2.4.1)
 * 
 * Catégories :
 * - Construction du graphe de dépendances
 * - Tri topologique (ordre optimal)
 * - Score de qualité enrichi
 * - Score de propreté (v2.4.1)
 * - Cherry-picking (v2.4.1)
 * - Suggestions automatiques (v2.4.1)
 */

import { describe, it, expect } from 'vitest';
import {
  createPairId,
  findDuplicatesAmongIds,
  buildDependencyGraph,
  calculateFusionOrder,
  getDatePrecisionScore,
  getPlacePrecisionScore,
  calculateEnrichedQuality,
  prepareLevelForDisplay,
  canFuseLevel,
  calculateFusionStats,
  FUSION_LEVELS,
  FUSION_LEVEL_LABELS,
  // v2.4.1 - Score de propreté
  calculateCleanlinessScore,
  detectPotentialDuplicatesAfterMerge,
  calculateQuickSimilarity,
  sortByCleanlinessScore,
  // v2.4.1 - Cherry-picking
  analyzeFieldDifferences,
  prepareCherryPickingData,
  applyMergeChoices,
  FIELD_TYPES,
  MERGE_FIELDS_CONFIG
} from '../src/utils/fusionOrder.mjs';

// ============================================================================
// DONNÉES DE TEST
// ============================================================================

const createPerson = (id, overrides = {}) => ({
  id,
  names: [`Prénom /${id.toUpperCase()}/`],
  birth: '',
  birthPlace: '',
  death: '',
  deathPlace: '',
  sex: 'M',
  parents: [],
  spouses: [],
  children: [],
  occupation: '',
  religion: '',
  baptism: '',
  burial: '',
  rawLinesByTag: {},
  ...overrides
});

const createDuplicatePair = (p1, p2, score = 90) => ({
  id: createPairId(p1.id, p2.id),
  person1: p1,
  person2: p2,
  score,
  similarity: score,
  details: [],
  sufficientCriteria: ['test']
});

// ============================================================================
// TESTS : createPairId
// ============================================================================

describe('createPairId', () => {
  it('crée un ID canonique (ordre alphabétique)', () => {
    expect(createPairId('I001', 'I002')).toBe('I001-I002');
    expect(createPairId('I002', 'I001')).toBe('I001-I002');
  });

  it('gère des IDs identiques', () => {
    expect(createPairId('I001', 'I001')).toBe('I001-I001');
  });

  it('gère des IDs avec caractères spéciaux', () => {
    expect(createPairId('I_001', 'I_002')).toBe('I_001-I_002');
  });
});

// ============================================================================
// TESTS : getDatePrecisionScore
// ============================================================================

describe('getDatePrecisionScore', () => {
  it('retourne 0 pour valeur vide/null', () => {
    expect(getDatePrecisionScore('')).toBe(0);
    expect(getDatePrecisionScore(null)).toBe(0);
    expect(getDatePrecisionScore(undefined)).toBe(0);
  });

  it('retourne 15 pour date complète (jour mois année)', () => {
    expect(getDatePrecisionScore('15 MAR 1850')).toBe(15);
    expect(getDatePrecisionScore('1 JAN 1900')).toBe(15);
  });

  it('retourne 12 pour mois + année', () => {
    expect(getDatePrecisionScore('MAR 1850')).toBe(12);
    expect(getDatePrecisionScore('JAN 1900')).toBe(12);
  });

  it('retourne 8 pour année seule', () => {
    expect(getDatePrecisionScore('1850')).toBe(8);
    expect(getDatePrecisionScore('1900')).toBe(8);
  });

  it('retourne 5 pour date approximative (ABT, BEF, AFT)', () => {
    expect(getDatePrecisionScore('ABT 1850')).toBe(5);
    expect(getDatePrecisionScore('BEF 1900')).toBe(5);
    expect(getDatePrecisionScore('AFT 1800')).toBe(5);
  });

  it('retourne 6 pour intervalle (BET...AND)', () => {
    expect(getDatePrecisionScore('BET 1850 AND 1860')).toBe(6);
  });
});

// ============================================================================
// TESTS : getPlacePrecisionScore
// ============================================================================

describe('getPlacePrecisionScore', () => {
  it('retourne 0 pour valeur vide/null', () => {
    expect(getPlacePrecisionScore('')).toBe(0);
    expect(getPlacePrecisionScore(null)).toBe(0);
  });

  it('retourne 4 pour lieu simple (1 niveau)', () => {
    expect(getPlacePrecisionScore('Lyon')).toBe(4);
    expect(getPlacePrecisionScore('Paris')).toBe(4);
  });

  it('retourne 6 pour lieu 2 niveaux', () => {
    expect(getPlacePrecisionScore('Lyon, Rhône')).toBe(6);
  });

  it('retourne 8 pour lieu 3 niveaux', () => {
    expect(getPlacePrecisionScore('Lyon, Rhône, France')).toBe(8);
  });

  it('retourne 10 pour lieu 4+ niveaux', () => {
    expect(getPlacePrecisionScore('Lyon, Rhône, Auvergne-Rhône-Alpes, France')).toBe(10);
  });
});

// ============================================================================
// TESTS : calculateEnrichedQuality
// ============================================================================

describe('calculateEnrichedQuality', () => {
  it('retourne 0 pour personne null/undefined', () => {
    expect(calculateEnrichedQuality(null).score).toBe(0);
    expect(calculateEnrichedQuality(undefined).score).toBe(0);
  });

  it('calcule le score basé sur les dates', () => {
    const person = createPerson('I001', { birth: '15 MAR 1850', death: '1920' });
    const result = calculateEnrichedQuality(person);
    expect(result.score).toBeGreaterThan(0);
  });

  it('calcule le score basé sur les lieux', () => {
    const person = createPerson('I001', { 
      birthPlace: 'Lyon, Rhône, France',
      deathPlace: 'Paris'
    });
    const result = calculateEnrichedQuality(person);
    expect(result.score).toBeGreaterThan(0);
  });

  it('compte les sources (SOUR)', () => {
    const person = createPerson('I001', {
      rawLinesByTag: { SOUR: ['1 SOUR @S1@', '1 SOUR @S2@'] }
    });
    const result = calculateEnrichedQuality(person);
    expect(result.sourceCount).toBe(2);
  });
});

// ============================================================================
// TESTS : buildDependencyGraph
// ============================================================================

describe('buildDependencyGraph', () => {
  it('construit un graphe vide pour entrées vides', () => {
    const { graph } = buildDependencyGraph([], []);
    expect(graph.size).toBe(0);
  });

  it('construit un graphe avec paires indépendantes', () => {
    const p1 = createPerson('I001');
    const p2 = createPerson('I002');
    const p3 = createPerson('I003');
    const p4 = createPerson('I004');
    
    const duplicates = [
      createDuplicatePair(p1, p2),
      createDuplicatePair(p3, p4)
    ];
    
    const { graph, stats } = buildDependencyGraph(duplicates, [p1, p2, p3, p4]);
    
    expect(graph.size).toBe(2);
    expect(stats.totalPairs).toBe(2);
    expect(stats.independent).toBe(2);
  });

  it('détecte les dépendances enfants-parents', () => {
    const parent1 = createPerson('I001', { children: ['I003'] });
    const parent2 = createPerson('I002', { children: ['I004'] });
    const child1 = createPerson('I003', { parents: ['I001'] });
    const child2 = createPerson('I004', { parents: ['I002'] });
    
    const duplicates = [
      createDuplicatePair(parent1, parent2),
      createDuplicatePair(child1, child2)
    ];
    
    const { graph } = buildDependencyGraph(duplicates, [parent1, parent2, child1, child2]);
    
    const parentPairId = createPairId('I001', 'I002');
    const node = graph.get(parentPairId);
    
    expect(node.hasChildDuplicates).toBe(true);
  });

  it('calcule les scores de propreté', () => {
    const p1 = createPerson('I001');
    const p2 = createPerson('I002');
    
    const duplicates = [createDuplicatePair(p1, p2)];
    const { graph } = buildDependencyGraph(duplicates, [p1, p2]);
    
    const pairId = createPairId('I001', 'I002');
    const node = graph.get(pairId);
    
    expect(node.cleanlinessScore).toBeDefined();
    expect(node.cleanlinessScore).toBe(100); // Pas de dépendances = propre
  });
});

// ============================================================================
// TESTS v2.4.1 : calculateQuickSimilarity
// ============================================================================

describe('calculateQuickSimilarity', () => {
  it('retourne 0 pour personnes null', () => {
    expect(calculateQuickSimilarity(null, null)).toBe(0);
    expect(calculateQuickSimilarity(createPerson('I001'), null)).toBe(0);
  });

  it('ajoute 30 points pour même nom de famille', () => {
    const p1 = createPerson('I001', { names: ['Jean /DUPONT/'] });
    const p2 = createPerson('I002', { names: ['Pierre /DUPONT/'] });
    const score = calculateQuickSimilarity(p1, p2);
    expect(score).toBeGreaterThanOrEqual(30);
  });

  it('ajoute 20 points pour même prénom', () => {
    const p1 = createPerson('I001', { names: ['Jean /MARTIN/'] });
    const p2 = createPerson('I002', { names: ['Jean /DUPONT/'] });
    const score = calculateQuickSimilarity(p1, p2);
    expect(score).toBeGreaterThanOrEqual(20);
  });

  it('ajoute 25 points pour années de naissance proches (±5 ans)', () => {
    const p1 = createPerson('I001', { birth: '1850' });
    const p2 = createPerson('I002', { birth: '1852' });
    const score = calculateQuickSimilarity(p1, p2);
    expect(score).toBeGreaterThanOrEqual(25);
  });

  it('ajoute 10 points pour même sexe', () => {
    const p1 = createPerson('I001', { sex: 'M' });
    const p2 = createPerson('I002', { sex: 'M' });
    const score = calculateQuickSimilarity(p1, p2);
    expect(score).toBeGreaterThanOrEqual(10);
  });
});

// ============================================================================
// TESTS v2.4.1 : calculateCleanlinessScore
// ============================================================================

describe('calculateCleanlinessScore', () => {
  it('retourne 100 pour paire sans dépendances', () => {
    const p1 = createPerson('I001');
    const p2 = createPerson('I002');
    const pair = createDuplicatePair(p1, p2);
    
    const result = calculateCleanlinessScore(pair, new Map(), new Map(), new Map());
    expect(result.cleanlinessScore).toBe(100);
  });

  it('pénalise de 20 pts par relation déjà en doublon', () => {
    const graph = new Map();
    const pairId = 'I001-I002';
    graph.set(pairId, { dependencyCount: 2 });
    
    const pair = { person1: { id: 'I001' }, person2: { id: 'I002' } };
    const result = calculateCleanlinessScore(pair, graph, new Map(), new Map());
    
    expect(result.existingDuplicateRelations).toBe(2);
    expect(result.cleanlinessScore).toBe(60); // 100 - 2*20
  });

  it('inclut message fusion propre pour score 100', () => {
    const pair = { person1: { id: 'I001' }, person2: { id: 'I002' } };
    const result = calculateCleanlinessScore(pair, new Map(), new Map(), new Map());
    
    expect(result.details.some(d => d.includes('Fusion propre'))).toBe(true);
  });
});

// ============================================================================
// TESTS v2.4.1 : sortByCleanlinessScore
// ============================================================================

describe('sortByCleanlinessScore', () => {
  it('trie par score de propreté décroissant', () => {
    const p1 = createPerson('I001');
    const p2 = createPerson('I002');
    const p3 = createPerson('I003');
    const p4 = createPerson('I004');
    
    const duplicates = [
      createDuplicatePair(p1, p2, 80),
      createDuplicatePair(p3, p4, 90)
    ];
    
    const { graph } = buildDependencyGraph(duplicates, [p1, p2, p3, p4]);
    const sorted = sortByCleanlinessScore(duplicates, graph);
    
    // Les deux ont cleanlinessScore = 100 (indépendants)
    // Donc triés par score de similarité décroissant
    expect(sorted[0].score).toBeGreaterThanOrEqual(sorted[1].score);
  });
});

// ============================================================================
// TESTS v2.4.1 : FIELD_TYPES & MERGE_FIELDS_CONFIG
// ============================================================================

describe('FIELD_TYPES', () => {
  it('définit les types SIMPLE, MULTIVALUE, RELATION', () => {
    expect(FIELD_TYPES.SIMPLE).toBe('simple');
    expect(FIELD_TYPES.MULTIVALUE).toBe('multivalue');
    expect(FIELD_TYPES.RELATION).toBe('relation');
  });
});

describe('MERGE_FIELDS_CONFIG', () => {
  it('configure birth comme champ simple de type dates', () => {
    expect(MERGE_FIELDS_CONFIG.birth.type).toBe('simple');
    expect(MERGE_FIELDS_CONFIG.birth.category).toBe('dates');
  });

  it('configure names comme champ multivalue', () => {
    expect(MERGE_FIELDS_CONFIG.names.type).toBe('multivalue');
    expect(MERGE_FIELDS_CONFIG.names.category).toBe('identity');
  });

  it('configure parents comme champ relation', () => {
    expect(MERGE_FIELDS_CONFIG.parents.type).toBe('relation');
    expect(MERGE_FIELDS_CONFIG.parents.category).toBe('relations');
  });
});

// ============================================================================
// TESTS v2.4.1 : analyzeFieldDifferences
// ============================================================================

describe('analyzeFieldDifferences', () => {
  it('retourne des tableaux vides pour personnes null', () => {
    const result = analyzeFieldDifferences(null, null);
    expect(result.identical).toEqual([]);
    expect(result.different).toEqual([]);
  });

  it('détecte les champs identiques', () => {
    const p1 = createPerson('I001', { sex: 'M', birth: '1850' });
    const p2 = createPerson('I002', { sex: 'M', birth: '1850' });
    
    const result = analyzeFieldDifferences(p1, p2);
    
    const identicalSex = result.identical.find(f => f.field === 'sex');
    expect(identicalSex).toBeDefined();
    expect(identicalSex.value).toBe('M');
  });

  it('détecte les champs différents avec suggestion', () => {
    const p1 = createPerson('I001', { birth: '15 MAR 1850' });
    const p2 = createPerson('I002', { birth: '1850' });
    
    const result = analyzeFieldDifferences(p1, p2);
    
    const diffBirth = result.different.find(f => f.field === 'birth');
    expect(diffBirth).toBeDefined();
    expect(diffBirth.valueA).toBe('15 MAR 1850');
    expect(diffBirth.valueB).toBe('1850');
    expect(diffBirth.suggestion.source).toBe('A'); // Plus précis
  });

  it('suggère union pour les noms différents', () => {
    const p1 = createPerson('I001', { names: ['Jean /DUPONT/'] });
    const p2 = createPerson('I002', { names: ['J. /DUPONT/'] });
    
    const result = analyzeFieldDifferences(p1, p2);
    
    expect(result.suggestions.names.source).toBe('merge');
    expect(result.suggestions.names.selected).toContain('Jean /DUPONT/');
    expect(result.suggestions.names.selected).toContain('J. /DUPONT/');
  });

  it('suggère union pour les relations différentes', () => {
    const p1 = createPerson('I001', { parents: ['I010'] });
    const p2 = createPerson('I002', { parents: ['I011'] });
    const peopleById = new Map([
      ['I010', { id: 'I010', names: ['Pierre /DUPONT/'] }],
      ['I011', { id: 'I011', names: ['Paul /DUPONT/'] }]
    ]);
    
    const result = analyzeFieldDifferences(p1, p2, peopleById);
    
    expect(result.suggestions.parents.source).toBe('merge');
    expect(result.suggestions.parents.selected).toContain('I010');
    expect(result.suggestions.parents.selected).toContain('I011');
  });
});

// ============================================================================
// TESTS v2.4.1 : prepareCherryPickingData
// ============================================================================

describe('prepareCherryPickingData', () => {
  it('retourne null pour paire invalide', () => {
    expect(prepareCherryPickingData(null)).toBe(null);
    expect(prepareCherryPickingData({})).toBe(null);
  });

  it('prépare les données avec statistiques', () => {
    const p1 = createPerson('I001', { sex: 'M', birth: '1850' });
    const p2 = createPerson('I002', { sex: 'M', birth: '1855' });
    const pair = createDuplicatePair(p1, p2);
    
    const result = prepareCherryPickingData(pair);
    
    expect(result.personA).toBe(p1);
    expect(result.personB).toBe(p2);
    expect(result.stats.identicalCount).toBeGreaterThan(0);
    expect(result.stats.differentCount).toBeGreaterThan(0);
  });

  it('groupe les champs par catégorie', () => {
    const p1 = createPerson('I001', { birth: '1850', birthPlace: 'Lyon' });
    const p2 = createPerson('I002', { birth: '1850', birthPlace: 'Paris' });
    const pair = createDuplicatePair(p1, p2);
    
    const result = prepareCherryPickingData(pair);
    
    expect(result.groupedIdentical).toBeDefined();
    expect(result.groupedDifferent).toBeDefined();
    expect(result.groupedDifferent.places).toBeDefined();
  });

  it('indique hasConflicts si des champs diffèrent', () => {
    const p1 = createPerson('I001', { birth: '1850' });
    const p2 = createPerson('I002', { birth: '1860' });
    const pair = createDuplicatePair(p1, p2);
    
    const result = prepareCherryPickingData(pair);
    
    expect(result.hasConflicts).toBe(true);
  });
});

// ============================================================================
// TESTS v2.4.1 : applyMergeChoices
// ============================================================================

describe('applyMergeChoices', () => {
  it('conserve l\'ID de la personne A', () => {
    const p1 = createPerson('I001');
    const p2 = createPerson('I002');
    
    const merged = applyMergeChoices(p1, p2, {}, []);
    
    expect(merged.id).toBe('I001');
    expect(merged.removedId).toBe('I002');
  });

  it('applique le choix source A', () => {
    const p1 = createPerson('I001', { birth: '15 MAR 1850' });
    const p2 = createPerson('I002', { birth: '1850' });
    
    const choices = { birth: { source: 'A', value: '15 MAR 1850' } };
    const merged = applyMergeChoices(p1, p2, choices, []);
    
    expect(merged.birth).toBe('15 MAR 1850');
  });

  it('applique le choix source B', () => {
    const p1 = createPerson('I001', { birthPlace: 'Lyon' });
    const p2 = createPerson('I002', { birthPlace: 'Lyon, Rhône, France' });
    
    const choices = { birthPlace: { source: 'B', value: 'Lyon, Rhône, France' } };
    const merged = applyMergeChoices(p1, p2, choices, []);
    
    expect(merged.birthPlace).toBe('Lyon, Rhône, France');
  });

  it('applique la sélection multiple pour les noms', () => {
    const p1 = createPerson('I001', { names: ['Jean /DUPONT/'] });
    const p2 = createPerson('I002', { names: ['J. /DUPONT/'] });
    
    const choices = { 
      names: { source: 'merge', selected: ['Jean /DUPONT/', 'J. /DUPONT/'] } 
    };
    const merged = applyMergeChoices(p1, p2, choices, []);
    
    expect(merged.names).toContain('Jean /DUPONT/');
    expect(merged.names).toContain('J. /DUPONT/');
  });

  it('conserve les champs identiques', () => {
    const p1 = createPerson('I001', { sex: 'M' });
    const p2 = createPerson('I002', { sex: 'M' });
    
    const identical = [{ field: 'sex', value: 'M' }];
    const merged = applyMergeChoices(p1, p2, {}, identical);
    
    expect(merged.sex).toBe('M');
  });
});

// ============================================================================
// TESTS : calculateFusionOrder
// ============================================================================

describe('calculateFusionOrder', () => {
  it('retourne un tableau vide pour graphe vide', () => {
    const order = calculateFusionOrder(new Map());
    expect(order).toEqual([]);
  });

  it('place les paires indépendantes au niveau 0', () => {
    const p1 = createPerson('I001');
    const p2 = createPerson('I002');
    
    const duplicates = [createDuplicatePair(p1, p2)];
    const { graph } = buildDependencyGraph(duplicates, [p1, p2]);
    const order = calculateFusionOrder(graph);
    
    expect(order.length).toBe(1);
    expect(order[0].level).toBe(0);
  });
});

// ============================================================================
// TESTS : findDuplicatesAmongIds
// ============================================================================

describe('findDuplicatesAmongIds', () => {
  it('trouve les doublons parmi une liste d\'IDs', () => {
    const p1 = createPerson('I001');
    const p2 = createPerson('I002');
    const pair = createDuplicatePair(p1, p2);
    
    const duplicatePairsMap = new Map([[pair.id, pair]]);
    const idToPairsMap = new Map([
      ['I001', new Set([pair.id])],
      ['I002', new Set([pair.id])]
    ]);
    
    const result = findDuplicatesAmongIds(['I001', 'I002'], duplicatePairsMap, idToPairsMap);
    expect(result).toContain(pair.id);
  });

  it('ne trouve rien si les IDs ne sont pas des doublons', () => {
    const duplicatePairsMap = new Map();
    const idToPairsMap = new Map();
    
    const result = findDuplicatesAmongIds(['I001', 'I002'], duplicatePairsMap, idToPairsMap);
    expect(result).toHaveLength(0);
  });

  it('ne retourne pas de paire si un seul membre est dans la liste', () => {
    const p1 = createPerson('I001');
    const p2 = createPerson('I002');
    const pair = createDuplicatePair(p1, p2);
    
    const duplicatePairsMap = new Map([[pair.id, pair]]);
    const idToPairsMap = new Map([
      ['I001', new Set([pair.id])],
      ['I002', new Set([pair.id])]
    ]);
    
    const result = findDuplicatesAmongIds(['I001', 'I003'], duplicatePairsMap, idToPairsMap);
    expect(result).toHaveLength(0);
  });
});

// ============================================================================
// TESTS : canFuseLevel
// ============================================================================

describe('canFuseLevel', () => {
  it('autorise toujours le niveau 0', () => {
    expect(canFuseLevel(0, [])).toBe(true);
    expect(canFuseLevel(0, [1, 2])).toBe(true);
  });

  it('bloque le niveau 1 si niveau 0 non complété', () => {
    expect(canFuseLevel(1, [])).toBe(false);
    expect(canFuseLevel(1, [0])).toBe(true);
  });

  it('bloque le niveau 2 si niveaux 0 et 1 non complétés', () => {
    expect(canFuseLevel(2, [])).toBe(false);
    expect(canFuseLevel(2, [0])).toBe(false);
    expect(canFuseLevel(2, [0, 1])).toBe(true);
  });
});

// ============================================================================
// TESTS : calculateFusionStats
// ============================================================================

describe('calculateFusionStats', () => {
  it('calcule les statistiques correctement', () => {
    const p1 = createPerson('I001');
    const p2 = createPerson('I002');
    const p3 = createPerson('I003');
    const p4 = createPerson('I004');
    
    const duplicates = [
      createDuplicatePair(p1, p2),
      createDuplicatePair(p3, p4)
    ];
    
    const { graph } = buildDependencyGraph(duplicates, [p1, p2, p3, p4]);
    const order = calculateFusionOrder(graph);
    const stats = calculateFusionStats(order, graph);
    
    expect(stats.totalPairs).toBe(2);
    expect(stats.totalLevels).toBe(1);
    expect(stats.independentPairs).toBe(2);
  });
});

// ============================================================================
// TESTS : CONSTANTES
// ============================================================================

describe('Constantes FUSION_LEVELS', () => {
  it('définit les niveaux dans le bon ordre', () => {
    expect(FUSION_LEVELS.CHILDREN).toBeLessThan(FUSION_LEVELS.SPOUSES);
    expect(FUSION_LEVELS.SPOUSES).toBeLessThan(FUSION_LEVELS.PARENTS);
    expect(FUSION_LEVELS.PARENTS).toBeLessThan(FUSION_LEVELS.INDEPENDENT);
  });

  it('a des labels pour tous les niveaux', () => {
    expect(FUSION_LEVEL_LABELS[FUSION_LEVELS.CHILDREN]).toBeDefined();
    expect(FUSION_LEVEL_LABELS[FUSION_LEVELS.SPOUSES]).toBeDefined();
    expect(FUSION_LEVEL_LABELS[FUSION_LEVELS.PARENTS]).toBeDefined();
    expect(FUSION_LEVEL_LABELS[FUSION_LEVELS.INDEPENDENT]).toBeDefined();
  });
});
