/**
 * Tests Vitest pour fusionOrder.mjs (v2.3.0)
 * 
 * Catégories :
 * - Construction du graphe de dépendances
 * - Tri topologique (ordre optimal)
 * - Score de qualité enrichi
 * - Utilitaires d'affichage
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
  FUSION_LEVEL_LABELS
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

const createDuplicatePair = (p1, p2, similarity = 90) => ({
  id: createPairId(p1.id, p2.id),
  person1: p1,
  person2: p2,
  similarity,
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
    
    // Seulement I001 dans la liste, pas I002
    const result = findDuplicatesAmongIds(['I001', 'I003'], duplicatePairsMap, idToPairsMap);
    expect(result).toHaveLength(0);
  });
});

// ============================================================================
// TESTS : buildDependencyGraph
// ============================================================================

describe('buildDependencyGraph', () => {
  it('construit un graphe simple sans dépendances', () => {
    const p1 = createPerson('I001');
    const p2 = createPerson('I002');
    const duplicates = [createDuplicatePair(p1, p2)];
    const individuals = [p1, p2];
    
    const { graph } = buildDependencyGraph(duplicates, individuals);
    
    expect(graph.size).toBe(1);
    const node = graph.get('I001-I002');
    expect(node).toBeDefined();
    expect(node.dependsOn).toHaveLength(0);
  });

  it('détecte les dépendances enfant → parent', () => {
    // Parent (Daniel) avec enfant (Anne)
    const daniel1 = createPerson('I001', { children: ['I003'] });
    const daniel2 = createPerson('I002', { children: ['I004'] });
    const anne1 = createPerson('I003', { parents: ['I001'] });
    const anne2 = createPerson('I004', { parents: ['I002'] });
    
    const duplicates = [
      createDuplicatePair(daniel1, daniel2), // Parent doublons
      createDuplicatePair(anne1, anne2)       // Enfant doublons
    ];
    const individuals = [daniel1, daniel2, anne1, anne2];
    
    const { graph } = buildDependencyGraph(duplicates, individuals);
    
    // Daniel dépend de Anne (les enfants doivent être fusionnés avant)
    const danielNode = graph.get('I001-I002');
    expect(danielNode.childDuplicates).toContain('I003-I004');
    expect(danielNode.dependsOn).toContain('I003-I004');
    
    // Anne bloque Daniel (elle doit être fusionnée avant lui)
    const anneNode = graph.get('I003-I004');
    expect(anneNode.blocks).toContain('I001-I002');
  });

  it('détecte les dépendances conjoint', () => {
    const mari1 = createPerson('I001', { spouses: ['I003'] });
    const mari2 = createPerson('I002', { spouses: ['I004'] });
    const femme1 = createPerson('I003', { spouses: ['I001'] });
    const femme2 = createPerson('I004', { spouses: ['I002'] });
    
    const duplicates = [
      createDuplicatePair(mari1, mari2),
      createDuplicatePair(femme1, femme2)
    ];
    const individuals = [mari1, mari2, femme1, femme2];
    
    const { graph } = buildDependencyGraph(duplicates, individuals);
    
    const mariNode = graph.get('I001-I002');
    expect(mariNode.spouseDuplicates).toContain('I003-I004');
  });
});

// ============================================================================
// TESTS : calculateFusionOrder
// ============================================================================

describe('calculateFusionOrder', () => {
  it('place les nœuds sans dépendances au niveau 0', () => {
    const p1 = createPerson('I001');
    const p2 = createPerson('I002');
    const duplicates = [createDuplicatePair(p1, p2)];
    
    const { graph } = buildDependencyGraph(duplicates, [p1, p2]);
    const order = calculateFusionOrder(graph);
    
    expect(order).toHaveLength(1);
    expect(order[0].level).toBe(0);
    expect(order[0].pairIds).toContain('I001-I002');
  });

  it('ordonne enfants → parents correctement', () => {
    // Enfant
    const enfant1 = createPerson('I003');
    const enfant2 = createPerson('I004');
    // Parent avec les enfants
    const parent1 = createPerson('I001', { children: ['I003'] });
    const parent2 = createPerson('I002', { children: ['I004'] });
    
    const duplicates = [
      createDuplicatePair(parent1, parent2),
      createDuplicatePair(enfant1, enfant2)
    ];
    const individuals = [parent1, parent2, enfant1, enfant2];
    
    const { graph } = buildDependencyGraph(duplicates, individuals);
    const order = calculateFusionOrder(graph);
    
    // L'enfant doit être au niveau 0, le parent au niveau 1
    const enfantLevel = order.find(l => l.pairIds.includes('I003-I004'));
    const parentLevel = order.find(l => l.pairIds.includes('I001-I002'));
    
    expect(enfantLevel.level).toBeLessThan(parentLevel.level);
  });

  it('gère les graphes complexes (3 niveaux)', () => {
    // Petit-enfant
    const petitEnfant1 = createPerson('I005');
    const petitEnfant2 = createPerson('I006');
    // Enfant avec petit-enfant
    const enfant1 = createPerson('I003', { children: ['I005'] });
    const enfant2 = createPerson('I004', { children: ['I006'] });
    // Parent avec enfant
    const parent1 = createPerson('I001', { children: ['I003'] });
    const parent2 = createPerson('I002', { children: ['I004'] });
    
    const duplicates = [
      createDuplicatePair(parent1, parent2),
      createDuplicatePair(enfant1, enfant2),
      createDuplicatePair(petitEnfant1, petitEnfant2)
    ];
    const individuals = [parent1, parent2, enfant1, enfant2, petitEnfant1, petitEnfant2];
    
    const { graph } = buildDependencyGraph(duplicates, individuals);
    const order = calculateFusionOrder(graph);
    
    // Ordre: petit-enfant (0) → enfant (1) → parent (2)
    const peLevel = order.find(l => l.pairIds.includes('I005-I006'));
    const enfLevel = order.find(l => l.pairIds.includes('I003-I004'));
    const parLevel = order.find(l => l.pairIds.includes('I001-I002'));
    
    expect(peLevel.level).toBeLessThan(enfLevel.level);
    expect(enfLevel.level).toBeLessThan(parLevel.level);
  });
});

// ============================================================================
// TESTS : getDatePrecisionScore
// ============================================================================

describe('getDatePrecisionScore', () => {
  it('retourne 0 pour une date vide', () => {
    expect(getDatePrecisionScore('')).toBe(0);
    expect(getDatePrecisionScore(null)).toBe(0);
    expect(getDatePrecisionScore(undefined)).toBe(0);
  });

  it('retourne 15 pour une date complète précise', () => {
    expect(getDatePrecisionScore('15 MAR 1726')).toBe(15);
    expect(getDatePrecisionScore('1 JAN 1800')).toBe(15);
  });

  it('retourne 12 pour une date avec mois et année', () => {
    expect(getDatePrecisionScore('MAR 1726')).toBe(12);
    expect(getDatePrecisionScore('JAN 1800')).toBe(12);
  });

  it('retourne 8 pour une année seule', () => {
    expect(getDatePrecisionScore('1726')).toBe(8);
    expect(getDatePrecisionScore('1800')).toBe(8);
  });

  it('réduit le score pour les dates approximatives', () => {
    expect(getDatePrecisionScore('ABT 1726')).toBeLessThan(15);
    expect(getDatePrecisionScore('BEF 1726')).toBeLessThan(15);
    expect(getDatePrecisionScore('AFT 1726')).toBeLessThan(15);
  });
});

// ============================================================================
// TESTS : getPlacePrecisionScore
// ============================================================================

describe('getPlacePrecisionScore', () => {
  it('retourne 0 pour un lieu vide', () => {
    expect(getPlacePrecisionScore('')).toBe(0);
    expect(getPlacePrecisionScore(null)).toBe(0);
  });

  it('retourne 10 pour un lieu complet (4 niveaux)', () => {
    expect(getPlacePrecisionScore('Lyon, Rhône, Auvergne-Rhône-Alpes, France')).toBe(10);
  });

  it('retourne 8 pour 3 niveaux', () => {
    expect(getPlacePrecisionScore('Lyon, Rhône, France')).toBe(8);
  });

  it('retourne 6 pour 2 niveaux', () => {
    expect(getPlacePrecisionScore('Lyon, Rhône')).toBe(6);
  });

  it('retourne 4 pour 1 niveau', () => {
    expect(getPlacePrecisionScore('Lyon')).toBe(4);
  });
});

// ============================================================================
// TESTS : calculateEnrichedQuality
// ============================================================================

describe('calculateEnrichedQuality', () => {
  it('retourne 0 pour une personne vide', () => {
    const person = createPerson('I001', { names: [] });
    const result = calculateEnrichedQuality(person);
    expect(result.score).toBe(0);
  });

  it('augmente le score avec des données complètes', () => {
    const person = createPerson('I001', {
      names: ['Jean /DUPONT/'],
      birth: '15 MAR 1726',
      birthPlace: 'Lyon, Rhône, France',
      death: '20 DEC 1800',
      deathPlace: 'Paris, Seine, France',
      occupation: 'Menuisier'
    });
    
    const result = calculateEnrichedQuality(person);
    expect(result.score).toBeGreaterThan(50);
  });

  it('prend en compte les sources', () => {
    const personWithSources = createPerson('I001', {
      rawLinesByTag: {
        SOUR: [{ lines: ['1 SOUR @S1@'] }, { lines: ['1 SOUR @S2@'] }]
      }
    });
    const personWithoutSources = createPerson('I002');
    
    const scoreWithSources = calculateEnrichedQuality(personWithSources);
    const scoreWithoutSources = calculateEnrichedQuality(personWithoutSources);
    
    expect(scoreWithSources.score).toBeGreaterThan(scoreWithoutSources.score);
  });

  it('valide les relations existantes', () => {
    const parent = createPerson('I001');
    const child = createPerson('I002', { parents: ['I001'] });
    
    const peopleById = new Map([['I001', parent], ['I002', child]]);
    
    const result = calculateEnrichedQuality(child, peopleById);
    expect(result.details.some(d => d.includes('Parents valides'))).toBe(true);
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
