/**
 * Tests unitaires pour les fonctions de gestion des conflits v2.2.0
 * VRAIS tests avec exécution de code et assertions
 */

import { describe, it, expect } from 'vitest';
import { 
  areValuesCompatible, 
  detectMergeConflicts,
  cleanOrphanedFamilies,
  CONFLICT_FIELDS
} from '../src/utils/helpers.mjs';

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

    it('devrait retourner true si même année (date complète)', () => {
      expect(areValuesCompatible('15 MAR 1726', '20 SEP 1726', 'date')).toBe(true);
    });

    it('devrait retourner true si même année (formats différents)', () => {
      expect(areValuesCompatible('1726', '15 MAR 1726', 'date')).toBe(true);
    });

    it('devrait retourner false si années différentes', () => {
      expect(areValuesCompatible('15 MAR 1726', '15 MAR 1730', 'date')).toBe(false);
    });

    it('devrait retourner false pour 4 ans d\'écart', () => {
      expect(areValuesCompatible('1720', '1724', 'date')).toBe(false);
    });

    it('devrait retourner true si même année avec ABT/BEF', () => {
      expect(areValuesCompatible('ABT 1800', 'BEF 1800', 'date')).toBe(true);
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

  it('devrait détecter un conflit de date de naissance', () => {
    const person1 = { id: 'I1', names: ['Jean /DUPONT/'], birth: '15 MAR 1726' };
    const person2 = { id: 'I2', names: ['Jean /DUPONT/'], birth: '15 MAR 1730' };
    const conflicts = detectMergeConflicts(person1, person2);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].field).toBe('birth');
    expect(conflicts[0].value1).toBe('15 MAR 1726');
    expect(conflicts[0].value2).toBe('15 MAR 1730');
  });

  it('devrait ne pas détecter de conflit si même année', () => {
    const person1 = { id: 'I1', names: ['Jean /DUPONT/'], birth: '15 MAR 1726' };
    const person2 = { id: 'I2', names: ['Jean /DUPONT/'], birth: '20 SEP 1726' };
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
});
