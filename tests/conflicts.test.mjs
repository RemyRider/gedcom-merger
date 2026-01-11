/**
 * Tests unitaires pour les fonctions de gestion des conflits v2.2.0
 * VRAIS tests avec exécution de code et assertions
 */

import { describe, it, expect } from 'vitest';
import { 
  areValuesCompatible, 
  detectMergeConflicts,
  cleanOrphanedFamilies,
  isApproximateDate,
  CONFLICT_FIELDS,
  CONFLICT_ARRAY_FIELDS
} from '../src/utils/helpers.mjs';

// ============================================================================
// Tests isApproximateDate (v2.2.2)
// ============================================================================
describe('isApproximateDate', () => {
  it('devrait retourner true pour une année seule', () => {
    expect(isApproximateDate('1726')).toBe(true);
  });

  it('devrait retourner true pour ABT (environ)', () => {
    expect(isApproximateDate('ABT 1800')).toBe(true);
  });

  it('devrait retourner true pour BEF (avant)', () => {
    expect(isApproximateDate('BEF 1900')).toBe(true);
  });

  it('devrait retourner true pour AFT (après)', () => {
    expect(isApproximateDate('AFT 1750')).toBe(true);
  });

  it('devrait retourner true pour EST (estimé)', () => {
    expect(isApproximateDate('EST 1800')).toBe(true);
  });

  it('devrait retourner false pour une date précise', () => {
    expect(isApproximateDate('15 MAR 1726')).toBe(false);
  });

  it('devrait retourner false pour 29 NOV 2025', () => {
    expect(isApproximateDate('29 NOV 2025')).toBe(false);
  });

  it('devrait retourner true pour null', () => {
    expect(isApproximateDate(null)).toBe(true);
  });

  it('devrait retourner true pour chaîne vide', () => {
    expect(isApproximateDate('')).toBe(true);
  });
});

// ============================================================================
// Tests areValuesCompatible
// ============================================================================
describe('areValuesCompatible', () => {
  describe('type date', () => {
    it('devrait retourner true si une valeur est vide', () => {
      expect(areValuesCompatible('', '1726', 'date')).toBe(true);
      expect(areValuesCompatible('1726', '', 'date')).toBe(true);
      expect(areValuesCompatible(null, '1726', 'date')).toBe(true);
    });

    it('devrait retourner true si même année avec dates approximatives', () => {
      expect(areValuesCompatible('1726', '15 MAR 1726', 'date')).toBe(true);
    });

    it('devrait retourner true si même année avec ABT/BEF', () => {
      expect(areValuesCompatible('ABT 1800', 'BEF 1800', 'date')).toBe(true);
    });

    it('devrait retourner false pour années différentes', () => {
      expect(areValuesCompatible('1720', '1724', 'date')).toBe(false);
    });

    // v2.2.2: Tests pour dates précises
    it('devrait retourner false pour dates précises différentes même année', () => {
      expect(areValuesCompatible('29 NOV 2025', '12 NOV 2025', 'date')).toBe(false);
    });

    it('devrait retourner false pour 15 MAR 1726 vs 20 SEP 1726 (précises)', () => {
      expect(areValuesCompatible('15 MAR 1726', '20 SEP 1726', 'date')).toBe(false);
    });

    it('devrait retourner true pour dates identiques', () => {
      expect(areValuesCompatible('29 NOV 2025', '29 NOV 2025', 'date')).toBe(true);
    });

    it('devrait retourner true si une date est approximative (année seule)', () => {
      expect(areValuesCompatible('1726', '15 MAR 1726', 'date')).toBe(true);
    });
  });

  describe('type place', () => {
    it('devrait retourner true si une valeur est vide', () => {
      expect(areValuesCompatible('', 'Paris', 'place')).toBe(true);
      expect(areValuesCompatible('Paris', '', 'place')).toBe(true);
    });

    it('devrait retourner true si identiques', () => {
      expect(areValuesCompatible('Paris', 'Paris', 'place')).toBe(true);
    });

    it('devrait retourner true si identiques (casse différente)', () => {
      expect(areValuesCompatible('PARIS', 'paris', 'place')).toBe(true);
    });

    it('devrait retourner true si l\'un contient l\'autre', () => {
      expect(areValuesCompatible('Paris', 'Paris, France', 'place')).toBe(true);
      expect(areValuesCompatible('Paris, France', 'Paris', 'place')).toBe(true);
    });

    it('devrait retourner false si complètement différents', () => {
      expect(areValuesCompatible('Paris', 'Lyon', 'place')).toBe(false);
    });

    it('devrait retourner false pour villes similaires mais différentes', () => {
      expect(areValuesCompatible('Saint-Denis', 'Saint-Cloud', 'place')).toBe(false);
    });
  });

  describe('type text', () => {
    it('devrait retourner true si une valeur est vide', () => {
      expect(areValuesCompatible('', 'Laboureur', 'text')).toBe(true);
    });

    it('devrait retourner true si identiques', () => {
      expect(areValuesCompatible('Laboureur', 'Laboureur', 'text')).toBe(true);
    });

    it('devrait retourner true si identiques (casse différente)', () => {
      expect(areValuesCompatible('LABOUREUR', 'laboureur', 'text')).toBe(true);
    });

    it('devrait retourner false si différents', () => {
      expect(areValuesCompatible('Laboureur', 'Tisserand', 'text')).toBe(false);
    });

    it('devrait trimmer les espaces', () => {
      expect(areValuesCompatible('  Laboureur  ', 'Laboureur', 'text')).toBe(true);
    });
  });
});

// ============================================================================
// Tests CONFLICT_FIELDS
// ============================================================================
describe('CONFLICT_FIELDS', () => {
  it('devrait contenir 10 champs', () => {
    expect(CONFLICT_FIELDS).toHaveLength(10);
  });

  it('devrait contenir birth et birthPlace', () => {
    expect(CONFLICT_FIELDS.find(f => f.key === 'birth')).toBeDefined();
    expect(CONFLICT_FIELDS.find(f => f.key === 'birthPlace')).toBeDefined();
  });

  it('devrait contenir death et deathPlace', () => {
    expect(CONFLICT_FIELDS.find(f => f.key === 'death')).toBeDefined();
    expect(CONFLICT_FIELDS.find(f => f.key === 'deathPlace')).toBeDefined();
  });

  it('devrait contenir occupation et religion', () => {
    expect(CONFLICT_FIELDS.find(f => f.key === 'occupation')).toBeDefined();
    expect(CONFLICT_FIELDS.find(f => f.key === 'religion')).toBeDefined();
  });

  it('devrait avoir les bons types pour les dates', () => {
    expect(CONFLICT_FIELDS.find(f => f.key === 'birth').type).toBe('date');
    expect(CONFLICT_FIELDS.find(f => f.key === 'death').type).toBe('date');
  });

  it('devrait avoir les bons types pour les lieux', () => {
    expect(CONFLICT_FIELDS.find(f => f.key === 'birthPlace').type).toBe('place');
    expect(CONFLICT_FIELDS.find(f => f.key === 'deathPlace').type).toBe('place');
  });
});

// ============================================================================
// Tests detectMergeConflicts
// ============================================================================
describe('detectMergeConflicts', () => {
  it('devrait retourner un tableau vide si pas de conflit', () => {
    const person1 = { id: 'I1', names: ['Jean /DUPONT/'], birth: '1726' };
    const person2 = { id: 'I2', names: ['Jean /DUPONT/'], birth: '1726' };
    const conflicts = detectMergeConflicts(person1, person2);
    expect(conflicts).toHaveLength(0);
  });

  it('devrait détecter un conflit de date de naissance (années différentes)', () => {
    const person1 = { id: 'I1', names: ['Jean /DUPONT/'], birth: '15 MAR 1726' };
    const person2 = { id: 'I2', names: ['Jean /DUPONT/'], birth: '15 MAR 1730' };
    const conflicts = detectMergeConflicts(person1, person2);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].field).toBe('birth');
  });

  // v2.2.2: Test pour dates précises différentes même année
  it('devrait détecter un conflit pour dates précises différentes même année', () => {
    const person1 = { id: 'I1', names: ['Jacques /COING/'], death: '29 NOV 2025' };
    const person2 = { id: 'I2', names: ['Jacques /COING/'], death: '12 NOV 2025' };
    const conflicts = detectMergeConflicts(person1, person2);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].field).toBe('death');
    expect(conflicts[0].value1).toBe('29 NOV 2025');
    expect(conflicts[0].value2).toBe('12 NOV 2025');
  });

  it('devrait ne pas détecter de conflit si une date est approximative', () => {
    const person1 = { id: 'I1', names: ['Jean /DUPONT/'], birth: '1726' };
    const person2 = { id: 'I2', names: ['Jean /DUPONT/'], birth: '15 MAR 1726' };
    const conflicts = detectMergeConflicts(person1, person2);
    expect(conflicts).toHaveLength(0);
  });

  it('devrait détecter un conflit de lieu si différents', () => {
    const person1 = { id: 'I1', names: ['Jean /DUPONT/'], birthPlace: 'Paris' };
    const person2 = { id: 'I2', names: ['Jean /DUPONT/'], birthPlace: 'Lyon' };
    const conflicts = detectMergeConflicts(person1, person2);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].field).toBe('birthPlace');
  });

  it('devrait ne pas détecter de conflit si lieu contient l\'autre', () => {
    const person1 = { id: 'I1', names: ['Jean /DUPONT/'], birthPlace: 'Paris' };
    const person2 = { id: 'I2', names: ['Jean /DUPONT/'], birthPlace: 'Paris, France' };
    const conflicts = detectMergeConflicts(person1, person2);
    expect(conflicts).toHaveLength(0);
  });

  it('devrait détecter un conflit de profession', () => {
    const person1 = { id: 'I1', names: ['Jean /DUPONT/'], occupation: 'Laboureur' };
    const person2 = { id: 'I2', names: ['Jean /DUPONT/'], occupation: 'Tisserand' };
    const conflicts = detectMergeConflicts(person1, person2);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].field).toBe('occupation');
  });

  it('devrait ne pas détecter de conflit si une valeur est vide', () => {
    const person1 = { id: 'I1', names: ['Jean /DUPONT/'], birth: '1726' };
    const person2 = { id: 'I2', names: ['Jean /DUPONT/'], birth: '' };
    const conflicts = detectMergeConflicts(person1, person2);
    expect(conflicts).toHaveLength(0);
  });

  it('devrait détecter plusieurs conflits', () => {
    const person1 = { id: 'I1', names: ['Jean /DUPONT/'], birth: '1726', death: '1790', occupation: 'Laboureur' };
    const person2 = { id: 'I2', names: ['Jean /DUPONT/'], birth: '1730', death: '1795', occupation: 'Tisserand' };
    const conflicts = detectMergeConflicts(person1, person2);
    expect(conflicts).toHaveLength(3);
    expect(conflicts.map(c => c.field)).toContain('birth');
    expect(conflicts.map(c => c.field)).toContain('death');
    expect(conflicts.map(c => c.field)).toContain('occupation');
  });

  it('devrait inclure les infos des personnes dans le conflit', () => {
    const person1 = { id: 'I1', names: ['Jean /DUPONT/'], birth: '1726' };
    const person2 = { id: 'I2', names: ['Pierre /MARTIN/'], birth: '1730' };
    const conflicts = detectMergeConflicts(person1, person2);
    expect(conflicts[0].person1Id).toBe('I1');
    expect(conflicts[0].person2Id).toBe('I2');
    expect(conflicts[0].person1Name).toBe('Jean /DUPONT/');
    expect(conflicts[0].person2Name).toBe('Pierre /MARTIN/');
  });

  it('devrait avoir resolved=false par défaut', () => {
    const person1 = { id: 'I1', names: ['Jean'], birth: '1726' };
    const person2 = { id: 'I2', names: ['Jean'], birth: '1730' };
    const conflicts = detectMergeConflicts(person1, person2);
    expect(conflicts[0].resolved).toBe(false);
    expect(conflicts[0].chosenValue).toBe(null);
    expect(conflicts[0].chosenSource).toBe(null);
  });
});

// ============================================================================
// Tests cleanOrphanedFamilies
// ============================================================================
describe('cleanOrphanedFamilies', () => {
  it('devrait retourner les familles intactes si personne supprimé', () => {
    const families = new Map([
      ['F1', { husband: 'I1', wife: 'I2', children: ['I3'] }]
    ]);
    const people = [{ id: 'I1' }, { id: 'I2' }, { id: 'I3' }];
    const removedIds = new Set();
    
    const { cleanedFamilies, orphanReport } = cleanOrphanedFamilies(families, removedIds, people);
    
    expect(cleanedFamilies.size).toBe(1);
    expect(orphanReport.removed).toHaveLength(0);
    expect(orphanReport.modified).toHaveLength(0);
  });

  it('devrait supprimer une famille complètement orpheline', () => {
    const families = new Map([
      ['F1', { husband: 'I1', wife: 'I2', children: [] }]
    ]);
    const people = [{ id: 'I1' }, { id: 'I2' }];
    const removedIds = new Set(['I1', 'I2']);
    
    const { cleanedFamilies, orphanReport } = cleanOrphanedFamilies(families, removedIds, people);
    
    expect(cleanedFamilies.size).toBe(0);
    expect(orphanReport.removed).toHaveLength(1);
    expect(orphanReport.removed[0].famId).toBe('F1');
  });

  it('devrait modifier une famille si un conjoint est supprimé', () => {
    const families = new Map([
      ['F1', { husband: 'I1', wife: 'I2', children: ['I3'] }]
    ]);
    const people = [{ id: 'I1' }, { id: 'I2' }, { id: 'I3' }];
    const removedIds = new Set(['I1']);
    
    const { cleanedFamilies, orphanReport } = cleanOrphanedFamilies(families, removedIds, people);
    
    expect(cleanedFamilies.size).toBe(1);
    expect(cleanedFamilies.get('F1').husband).toBe(null);
    expect(cleanedFamilies.get('F1').wife).toBe('I2');
    expect(orphanReport.modified).toHaveLength(1);
  });

  it('devrait filtrer les enfants supprimés', () => {
    const families = new Map([
      ['F1', { husband: 'I1', wife: 'I2', children: ['I3', 'I4', 'I5'] }]
    ]);
    const people = [{ id: 'I1' }, { id: 'I2' }, { id: 'I3' }, { id: 'I4' }, { id: 'I5' }];
    const removedIds = new Set(['I4', 'I5']);
    
    const { cleanedFamilies, orphanReport } = cleanOrphanedFamilies(families, removedIds, people);
    
    expect(cleanedFamilies.get('F1').children).toHaveLength(1);
    expect(cleanedFamilies.get('F1').children).toContain('I3');
    expect(orphanReport.modified).toHaveLength(1);
  });

  it('devrait garder une famille avec seulement des enfants', () => {
    const families = new Map([
      ['F1', { husband: 'I1', wife: 'I2', children: ['I3'] }]
    ]);
    const people = [{ id: 'I1' }, { id: 'I2' }, { id: 'I3' }];
    const removedIds = new Set(['I1', 'I2']);
    
    const { cleanedFamilies, orphanReport } = cleanOrphanedFamilies(families, removedIds, people);
    
    expect(cleanedFamilies.size).toBe(1);
    expect(cleanedFamilies.get('F1').husband).toBe(null);
    expect(cleanedFamilies.get('F1').wife).toBe(null);
    expect(cleanedFamilies.get('F1').children).toHaveLength(1);
  });

  it('devrait gérer plusieurs familles', () => {
    const families = new Map([
      ['F1', { husband: 'I1', wife: 'I2', children: [] }],
      ['F2', { husband: 'I3', wife: 'I4', children: ['I5'] }]
    ]);
    const people = [{ id: 'I1' }, { id: 'I2' }, { id: 'I3' }, { id: 'I4' }, { id: 'I5' }];
    const removedIds = new Set(['I1', 'I2']);
    
    const { cleanedFamilies, orphanReport } = cleanOrphanedFamilies(families, removedIds, people);
    
    expect(cleanedFamilies.size).toBe(1);
    expect(cleanedFamilies.has('F1')).toBe(false);
    expect(cleanedFamilies.has('F2')).toBe(true);
    expect(orphanReport.removed).toHaveLength(1);
  });

  // v2.2.4: Tests avec mergeMap
  it('devrait rediriger HUSB vers cible de fusion', () => {
    const families = new Map([
      ['F1', { husband: 'I1', wife: 'I2', children: ['I3'] }]
    ]);
    const people = [{ id: 'I1' }, { id: 'I2' }, { id: 'I3' }, { id: 'I99' }];
    const removedIds = new Set(['I1']); // I1 est fusionné vers I99
    const mergeMap = new Map([['I1', 'I99']]);
    
    const { cleanedFamilies, orphanReport } = cleanOrphanedFamilies(families, removedIds, people, mergeMap);
    
    expect(cleanedFamilies.get('F1').husband).toBe('I99'); // Redirigé, pas null
    expect(cleanedFamilies.get('F1').wife).toBe('I2');
    expect(orphanReport.modified).toHaveLength(1);
  });

  it('devrait rediriger WIFE vers cible de fusion', () => {
    const families = new Map([
      ['F1', { husband: 'I1', wife: 'I2', children: [] }]
    ]);
    const people = [{ id: 'I1' }, { id: 'I2' }, { id: 'I99' }];
    const removedIds = new Set(['I2']); // I2 fusionné vers I99
    const mergeMap = new Map([['I2', 'I99']]);
    
    const { cleanedFamilies, orphanReport } = cleanOrphanedFamilies(families, removedIds, people, mergeMap);
    
    expect(cleanedFamilies.get('F1').wife).toBe('I99');
    expect(cleanedFamilies.get('F1').husband).toBe('I1');
  });

  it('devrait rediriger enfants vers cibles de fusion', () => {
    const families = new Map([
      ['F1', { husband: 'I1', wife: 'I2', children: ['I3', 'I4'] }]
    ]);
    const people = [{ id: 'I1' }, { id: 'I2' }, { id: 'I3' }, { id: 'I4' }, { id: 'I99' }];
    const removedIds = new Set(['I4']); // I4 fusionné vers I99
    const mergeMap = new Map([['I4', 'I99']]);
    
    const { cleanedFamilies, orphanReport } = cleanOrphanedFamilies(families, removedIds, people, mergeMap);
    
    expect(cleanedFamilies.get('F1').children).toContain('I3');
    expect(cleanedFamilies.get('F1').children).toContain('I99'); // I4 redirigé vers I99
    expect(cleanedFamilies.get('F1').children).not.toContain('I4');
  });

  it('devrait dédupliquer si deux enfants fusionnent vers le même', () => {
    const families = new Map([
      ['F1', { husband: 'I1', wife: 'I2', children: ['I3', 'I4'] }]
    ]);
    const people = [{ id: 'I1' }, { id: 'I2' }, { id: 'I3' }, { id: 'I4' }];
    const removedIds = new Set(['I4']); // I4 fusionné vers I3
    const mergeMap = new Map([['I4', 'I3']]);
    
    const { cleanedFamilies, orphanReport } = cleanOrphanedFamilies(families, removedIds, people, mergeMap);
    
    expect(cleanedFamilies.get('F1').children).toHaveLength(1);
    expect(cleanedFamilies.get('F1').children).toContain('I3');
  });

  it('devrait supprimer famille si tous redirigent vers null (pas de mergeMap)', () => {
    const families = new Map([
      ['F1', { husband: 'I1', wife: 'I2', children: [] }]
    ]);
    const people = [{ id: 'I1' }, { id: 'I2' }];
    const removedIds = new Set(['I1', 'I2']); // Suppressions manuelles, pas de mergeMap
    const mergeMap = new Map(); // Vide = suppressions manuelles
    
    const { cleanedFamilies, orphanReport } = cleanOrphanedFamilies(families, removedIds, people, mergeMap);
    
    expect(cleanedFamilies.size).toBe(0);
    expect(orphanReport.removed).toHaveLength(1);
  });
});

// ============================================================================
// Tests v2.2.6 - Conflits sur champs tableau (parents, conjoints, enfants)
// ============================================================================
describe('Conflits sur champs tableau v2.2.6', () => {
  it('devrait détecter un conflit sur les parents différents', () => {
    const p1 = { id: 'I1', names: ['Jean'], parents: ['I10', 'I11'] };
    const p2 = { id: 'I2', names: ['Jean'], parents: ['I20', 'I21'] };
    
    const conflicts = detectMergeConflicts(p1, p2);
    const parentsConflict = conflicts.find(c => c.field === 'parents');
    
    expect(parentsConflict).toBeDefined();
    expect(parentsConflict.type).toBe('parents');
    expect(parentsConflict.rawValue1).toEqual(['I10', 'I11']);
    expect(parentsConflict.rawValue2).toEqual(['I20', 'I21']);
  });

  it('ne devrait pas détecter de conflit si parents identiques', () => {
    const p1 = { id: 'I1', names: ['Jean'], parents: ['I10', 'I11'] };
    const p2 = { id: 'I2', names: ['Jean'], parents: ['I10', 'I11'] };
    
    const conflicts = detectMergeConflicts(p1, p2);
    const parentsConflict = conflicts.find(c => c.field === 'parents');
    
    expect(parentsConflict).toBeUndefined();
  });

  it('ne devrait pas détecter de conflit si un seul a des parents', () => {
    const p1 = { id: 'I1', names: ['Jean'], parents: ['I10', 'I11'] };
    const p2 = { id: 'I2', names: ['Jean'], parents: [] };
    
    const conflicts = detectMergeConflicts(p1, p2);
    const parentsConflict = conflicts.find(c => c.field === 'parents');
    
    expect(parentsConflict).toBeUndefined();
  });

  it('devrait détecter un conflit sur les conjoints différents', () => {
    const p1 = { id: 'I1', names: ['Jean'], spouses: ['I50'] };
    const p2 = { id: 'I2', names: ['Jean'], spouses: ['I60'] };
    
    const conflicts = detectMergeConflicts(p1, p2);
    const spousesConflict = conflicts.find(c => c.field === 'spouses');
    
    expect(spousesConflict).toBeDefined();
    expect(spousesConflict.type).toBe('spouses');
  });

  it('ne devrait pas détecter de conflit si conjoints partiellement communs', () => {
    const p1 = { id: 'I1', names: ['Jean'], spouses: ['I50', 'I60'] };
    const p2 = { id: 'I2', names: ['Jean'], spouses: ['I50'] };
    
    const conflicts = detectMergeConflicts(p1, p2);
    const spousesConflict = conflicts.find(c => c.field === 'spouses');
    
    // Pas de conflit car p2 n'a pas d'élément unique
    expect(spousesConflict).toBeUndefined();
  });

  it('devrait détecter un conflit sur les enfants différents', () => {
    const p1 = { id: 'I1', names: ['Jean'], children: ['I100', 'I101'] };
    const p2 = { id: 'I2', names: ['Jean'], children: ['I200', 'I201'] };
    
    const conflicts = detectMergeConflicts(p1, p2);
    const childrenConflict = conflicts.find(c => c.field === 'children');
    
    expect(childrenConflict).toBeDefined();
    expect(childrenConflict.type).toBe('children');
    expect(childrenConflict.rawValue1).toEqual(['I100', 'I101']);
    expect(childrenConflict.rawValue2).toEqual(['I200', 'I201']);
  });

  it('devrait avoir CONFLICT_ARRAY_FIELDS avec 3 champs', () => {
    expect(CONFLICT_ARRAY_FIELDS).toHaveLength(3);
    expect(CONFLICT_ARRAY_FIELDS.map(f => f.key)).toEqual(['parents', 'spouses', 'children']);
  });
});
