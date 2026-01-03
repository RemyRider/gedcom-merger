/**
 * Tests unitaires pour src/utils/stats.js
 * VRAIS tests avec exécution de code et assertions
 */

import { describe, it, expect } from 'vitest';
import { calculateGenealogyStats, detectChronologicalIssues } from '../src/utils/stats.mjs';

// ============================================================================
// Fixtures de test
// ============================================================================
const createPerson = (overrides = {}) => ({
  id: 'I1',
  names: ['Jean /MARTIN/'],
  sex: 'M',
  birth: '1800',
  birthPlace: 'Paris',
  death: '1870',
  deathPlace: 'Paris',
  occupation: '',
  parents: [],
  spouses: [],
  children: [],
  ...overrides
});

const createFamily = (overrides = {}) => ({
  id: 'F1',
  husband: null,
  wife: null,
  children: [],
  ...overrides
});

// ============================================================================
// Tests calculateGenealogyStats - Structure de retour
// ============================================================================
describe('calculateGenealogyStats - Structure', () => {
  it('devrait retourner un objet avec toutes les propriétés', () => {
    const people = [createPerson()];
    const families = new Map();
    const stats = calculateGenealogyStats(people, families);
    
    expect(stats).toHaveProperty('gender');
    expect(stats).toHaveProperty('families');
    expect(stats).toHaveProperty('ages');
    expect(stats).toHaveProperty('dates');
    expect(stats).toHaveProperty('period');
    expect(stats).toHaveProperty('birthDecades');
    expect(stats).toHaveProperty('topSurnames');
    expect(stats).toHaveProperty('topMaleNames');
    expect(stats).toHaveProperty('topFemaleNames');
    expect(stats).toHaveProperty('topBirthPlaces');
    expect(stats).toHaveProperty('topOccupations');
  });

  it('devrait gérer un tableau vide', () => {
    const stats = calculateGenealogyStats([], new Map());
    expect(stats.gender.total).toBe(0);
    expect(stats.gender.males).toBe(0);
    expect(stats.gender.females).toBe(0);
  });
});

// ============================================================================
// Tests calculateGenealogyStats - Genre
// ============================================================================
describe('calculateGenealogyStats - Genre', () => {
  it('devrait compter les hommes', () => {
    const people = [
      createPerson({ id: 'I1', sex: 'M' }),
      createPerson({ id: 'I2', sex: 'M' }),
      createPerson({ id: 'I3', sex: 'F' })
    ];
    const stats = calculateGenealogyStats(people, new Map());
    expect(stats.gender.males).toBe(2);
  });

  it('devrait compter les femmes', () => {
    const people = [
      createPerson({ id: 'I1', sex: 'F' }),
      createPerson({ id: 'I2', sex: 'F' }),
      createPerson({ id: 'I3', sex: 'M' })
    ];
    const stats = calculateGenealogyStats(people, new Map());
    expect(stats.gender.females).toBe(2);
  });

  it('devrait compter les sexes inconnus', () => {
    const people = [
      createPerson({ id: 'I1', sex: '' }),
      createPerson({ id: 'I2', sex: 'M' })
    ];
    const stats = calculateGenealogyStats(people, new Map());
    expect(stats.gender.unknown).toBe(1);
  });

  it('devrait calculer le total', () => {
    const people = [
      createPerson({ id: 'I1' }),
      createPerson({ id: 'I2' }),
      createPerson({ id: 'I3' })
    ];
    const stats = calculateGenealogyStats(people, new Map());
    expect(stats.gender.total).toBe(3);
  });
});

// ============================================================================
// Tests calculateGenealogyStats - Âges
// ============================================================================
describe('calculateGenealogyStats - Âges', () => {
  it('devrait calculer l\'âge moyen', () => {
    const people = [
      createPerson({ id: 'I1', birth: '1800', death: '1870' }), // 70 ans
      createPerson({ id: 'I2', birth: '1810', death: '1860' })  // 50 ans
    ];
    const stats = calculateGenealogyStats(people, new Map());
    expect(stats.ages.avg).toBe(60); // (70+50)/2
  });

  it('devrait calculer l\'âge minimum', () => {
    const people = [
      createPerson({ id: 'I1', birth: '1800', death: '1850' }), // 50 ans
      createPerson({ id: 'I2', birth: '1810', death: '1830' })  // 20 ans
    ];
    const stats = calculateGenealogyStats(people, new Map());
    expect(stats.ages.min).toBe(20);
  });

  it('devrait calculer l\'âge maximum', () => {
    const people = [
      createPerson({ id: 'I1', birth: '1800', death: '1850' }), // 50 ans
      createPerson({ id: 'I2', birth: '1810', death: '1900' })  // 90 ans
    ];
    const stats = calculateGenealogyStats(people, new Map());
    expect(stats.ages.max).toBe(90);
  });

  it('devrait exclure les âges > 120 ans', () => {
    const people = [
      createPerson({ id: 'I1', birth: '1700', death: '1900' }), // 200 ans - exclu
      createPerson({ id: 'I2', birth: '1800', death: '1870' })  // 70 ans
    ];
    const stats = calculateGenealogyStats(people, new Map());
    expect(stats.ages.count).toBe(1);
    expect(stats.ages.avg).toBe(70);
  });

  it('devrait gérer l\'absence de dates', () => {
    const people = [
      createPerson({ id: 'I1', birth: '', death: '' }),
      createPerson({ id: 'I2', birth: '1800', death: '' })
    ];
    const stats = calculateGenealogyStats(people, new Map());
    expect(stats.ages.count).toBe(0);
    expect(stats.ages.avg).toBe(null);
  });
});

// ============================================================================
// Tests calculateGenealogyStats - Période
// ============================================================================
describe('calculateGenealogyStats - Période', () => {
  it('devrait calculer l\'année min', () => {
    const people = [
      createPerson({ id: 'I1', birth: '1750' }),
      createPerson({ id: 'I2', birth: '1800' })
    ];
    const stats = calculateGenealogyStats(people, new Map());
    expect(stats.period.min).toBe(1750);
  });

  it('devrait calculer l\'année max', () => {
    const people = [
      createPerson({ id: 'I1', birth: '1750', death: '1820' }),
      createPerson({ id: 'I2', birth: '1800', death: '1900' })
    ];
    const stats = calculateGenealogyStats(people, new Map());
    expect(stats.period.max).toBe(1900);
  });

  it('devrait calculer le span', () => {
    const people = [
      createPerson({ id: 'I1', birth: '1700' }),
      createPerson({ id: 'I2', birth: '1900' })
    ];
    const stats = calculateGenealogyStats(people, new Map());
    expect(stats.period.span).toBe(200);
  });

  it('devrait estimer le nombre de générations', () => {
    const people = [
      createPerson({ id: 'I1', birth: '1700' }),
      createPerson({ id: 'I2', birth: '1900' })
    ];
    const stats = calculateGenealogyStats(people, new Map());
    expect(stats.period.estimatedGenerations).toBe(8); // 200/25 = 8
  });
});

// ============================================================================
// Tests calculateGenealogyStats - Patronymes
// ============================================================================
describe('calculateGenealogyStats - Patronymes', () => {
  it('devrait compter les patronymes', () => {
    const people = [
      createPerson({ id: 'I1', names: ['Jean /MARTIN/'] }),
      createPerson({ id: 'I2', names: ['Pierre /MARTIN/'] }),
      createPerson({ id: 'I3', names: ['Marie /DUPONT/'] })
    ];
    const stats = calculateGenealogyStats(people, new Map());
    expect(stats.topSurnames).toHaveLength(2);
  });

  it('devrait trier par fréquence décroissante', () => {
    const people = [
      createPerson({ id: 'I1', names: ['Jean /MARTIN/'] }),
      createPerson({ id: 'I2', names: ['Pierre /MARTIN/'] }),
      createPerson({ id: 'I3', names: ['Marie /DUPONT/'] })
    ];
    const stats = calculateGenealogyStats(people, new Map());
    expect(stats.topSurnames[0].name).toBe('MARTIN');
    expect(stats.topSurnames[0].count).toBe(2);
  });

  it('devrait compter les patronymes uniques', () => {
    const people = [
      createPerson({ id: 'I1', names: ['Jean /MARTIN/'] }),
      createPerson({ id: 'I2', names: ['Marie /DUPONT/'] }),
      createPerson({ id: 'I3', names: ['Pierre /BERNARD/'] })
    ];
    const stats = calculateGenealogyStats(people, new Map());
    expect(stats.uniqueSurnames).toBe(3);
  });
});

// ============================================================================
// Tests calculateGenealogyStats - Prénoms
// ============================================================================
describe('calculateGenealogyStats - Prénoms', () => {
  it('devrait compter les prénoms masculins', () => {
    const people = [
      createPerson({ id: 'I1', names: ['Jean /MARTIN/'], sex: 'M' }),
      createPerson({ id: 'I2', names: ['Jean /DUPONT/'], sex: 'M' }),
      createPerson({ id: 'I3', names: ['Pierre /BERNARD/'], sex: 'M' })
    ];
    const stats = calculateGenealogyStats(people, new Map());
    expect(stats.topMaleNames[0].name).toBe('Jean');
    expect(stats.topMaleNames[0].count).toBe(2);
  });

  it('devrait compter les prénoms féminins', () => {
    const people = [
      createPerson({ id: 'I1', names: ['Marie /MARTIN/'], sex: 'F' }),
      createPerson({ id: 'I2', names: ['Marie /DUPONT/'], sex: 'F' }),
      createPerson({ id: 'I3', names: ['Anne /BERNARD/'], sex: 'F' })
    ];
    const stats = calculateGenealogyStats(people, new Map());
    expect(stats.topFemaleNames[0].name).toBe('Marie');
    expect(stats.topFemaleNames[0].count).toBe(2);
  });
});

// ============================================================================
// Tests calculateGenealogyStats - Familles
// ============================================================================
describe('calculateGenealogyStats - Familles', () => {
  it('devrait compter les familles', () => {
    const families = new Map();
    families.set('F1', createFamily({ children: ['I3'] }));
    families.set('F2', createFamily({ children: [] }));
    
    const stats = calculateGenealogyStats([], families);
    expect(stats.families.total).toBe(2);
  });

  it('devrait compter les familles avec enfants', () => {
    const families = new Map();
    families.set('F1', createFamily({ children: ['I3', 'I4'] }));
    families.set('F2', createFamily({ children: [] }));
    
    const stats = calculateGenealogyStats([], families);
    expect(stats.families.withChildren).toBe(1);
    expect(stats.families.withoutChildren).toBe(1);
  });

  it('devrait calculer le nombre max d\'enfants', () => {
    const families = new Map();
    families.set('F1', createFamily({ children: ['I3', 'I4', 'I5'] }));
    families.set('F2', createFamily({ children: ['I6'] }));
    
    const stats = calculateGenealogyStats([], families);
    expect(stats.families.maxChildren).toBe(3);
  });

  it('devrait calculer la moyenne d\'enfants', () => {
    const families = new Map();
    families.set('F1', createFamily({ children: ['I3', 'I4'] })); // 2 enfants
    families.set('F2', createFamily({ children: ['I5', 'I6', 'I7', 'I8'] })); // 4 enfants
    
    const stats = calculateGenealogyStats([], families);
    expect(stats.families.avgChildren).toBe('3.0'); // (2+4)/2 = 3
  });
});

// ============================================================================
// Tests detectChronologicalIssues
// ============================================================================
describe('detectChronologicalIssues', () => {
  it('devrait détecter naissance après décès', () => {
    const people = [
      createPerson({ id: 'I1', birth: '1900', death: '1800' })
    ];
    const { errors } = detectChronologicalIssues(people, new Map());
    expect(errors.some(e => e.type === 'BIRTH_AFTER_DEATH')).toBe(true);
  });

  it('devrait détecter parent né après enfant', () => {
    const parent = createPerson({ id: 'I1', birth: '1900', names: ['Parent /TEST/'] });
    const child = createPerson({ id: 'I2', birth: '1850', parents: ['I1'], names: ['Enfant /TEST/'] });
    
    const { errors } = detectChronologicalIssues([parent, child], new Map());
    expect(errors.some(e => e.type === 'PARENT_BORN_AFTER_CHILD')).toBe(true);
  });

  it('devrait avertir si parent trop jeune (<12 ans)', () => {
    const parent = createPerson({ id: 'I1', birth: '1840', names: ['Parent /TEST/'] });
    const child = createPerson({ id: 'I2', birth: '1850', parents: ['I1'], names: ['Enfant /TEST/'] }); // Parent avait 10 ans
    
    const { warnings } = detectChronologicalIssues([parent, child], new Map());
    expect(warnings.some(w => w.type === 'PARENT_TOO_YOUNG')).toBe(true);
  });

  it('devrait avertir si parent très âgé (>80 ans)', () => {
    const parent = createPerson({ id: 'I1', birth: '1750', names: ['Parent /TEST/'] });
    const child = createPerson({ id: 'I2', birth: '1850', parents: ['I1'], names: ['Enfant /TEST/'] }); // Parent avait 100 ans
    
    const { warnings } = detectChronologicalIssues([parent, child], new Map());
    expect(warnings.some(w => w.type === 'PARENT_TOO_OLD')).toBe(true);
  });

  it('devrait avertir si longévité extrême (>120 ans)', () => {
    const people = [
      createPerson({ id: 'I1', birth: '1700', death: '1900' }) // 200 ans
    ];
    const { warnings } = detectChronologicalIssues(people, new Map());
    expect(warnings.some(w => w.type === 'EXTREME_LONGEVITY')).toBe(true);
  });

  it('ne devrait pas signaler de problème pour des dates normales', () => {
    const people = [
      createPerson({ id: 'I1', birth: '1800', death: '1870' }) // 70 ans, normal
    ];
    const { errors, warnings } = detectChronologicalIssues(people, new Map());
    expect(errors).toHaveLength(0);
    expect(warnings).toHaveLength(0);
  });

  it('devrait gérer l\'absence de dates', () => {
    const people = [
      createPerson({ id: 'I1', birth: '', death: '' })
    ];
    const { errors, warnings } = detectChronologicalIssues(people, new Map());
    expect(errors).toHaveLength(0);
    expect(warnings).toHaveLength(0);
  });
});
