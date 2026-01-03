/**
 * Tests unitaires pour src/utils/helpers.js
 * VRAIS tests avec exécution de code et assertions
 */

import { describe, it, expect } from 'vitest';
import { 
  extractYear, 
  normalizePlace, 
  normalizeFirstName, 
  soundex, 
  normalizePlaceFull,
  getSuspicionLevel,
  NAME_VARIANTS 
} from '../src/utils/helpers.mjs';

// ============================================================================
// Tests extractYear
// ============================================================================
describe('extractYear', () => {
  it('devrait extraire l\'année d\'une date complète', () => {
    expect(extractYear('15 MAR 1726')).toBe(1726);
  });

  it('devrait extraire l\'année d\'une année seule', () => {
    expect(extractYear('1850')).toBe(1850);
  });

  it('devrait retourner null pour une chaîne vide', () => {
    expect(extractYear('')).toBe(null);
  });

  it('devrait retourner null pour null', () => {
    expect(extractYear(null)).toBe(null);
  });

  it('devrait retourner null pour undefined', () => {
    expect(extractYear(undefined)).toBe(null);
  });

  it('devrait extraire l\'année avec ABT (environ)', () => {
    expect(extractYear('ABT 1800')).toBe(1800);
  });

  it('devrait extraire l\'année avec BEF (avant)', () => {
    expect(extractYear('BEF 1900')).toBe(1900);
  });

  it('devrait extraire l\'année avec AFT (après)', () => {
    expect(extractYear('AFT 1750')).toBe(1750);
  });

  it('devrait extraire l\'année d\'une date française', () => {
    expect(extractYear('12 JANVIER 1789')).toBe(1789);
  });

  it('devrait retourner null si pas d\'année', () => {
    expect(extractYear('MAR')).toBe(null);
  });
});

// ============================================================================
// Tests normalizePlace
// ============================================================================
describe('normalizePlace', () => {
  it('devrait retirer le code postal en préfixe', () => {
    expect(normalizePlace('75001 Paris')).toBe('Paris');
  });

  it('devrait garder le lieu sans code postal', () => {
    expect(normalizePlace('Paris, France')).toBe('Paris, France');
  });

  it('devrait retourner une chaîne vide pour null', () => {
    expect(normalizePlace(null)).toBe('');
  });

  it('devrait retourner une chaîne vide pour chaîne vide', () => {
    expect(normalizePlace('')).toBe('');
  });

  it('devrait trimmer les espaces', () => {
    expect(normalizePlace('  Lyon  ')).toBe('Lyon');
  });
});

// ============================================================================
// Tests normalizeFirstName
// ============================================================================
describe('normalizeFirstName', () => {
  it('devrait normaliser Jean', () => {
    expect(normalizeFirstName('Jean')).toBe('jean');
  });

  it('devrait convertir Jehan en jean', () => {
    expect(normalizeFirstName('Jehan')).toBe('jean');
  });

  it('devrait convertir Johan en jean', () => {
    expect(normalizeFirstName('Johan')).toBe('jean');
  });

  it('devrait convertir Johannes en jean', () => {
    expect(normalizeFirstName('Johannes')).toBe('jean');
  });

  it('devrait normaliser Marie', () => {
    expect(normalizeFirstName('Marie')).toBe('marie');
  });

  it('devrait convertir Maria en marie', () => {
    expect(normalizeFirstName('Maria')).toBe('marie');
  });

  it('devrait convertir Pierre', () => {
    expect(normalizeFirstName('Pierre')).toBe('pierre');
  });

  it('devrait convertir Peter en pierre', () => {
    expect(normalizeFirstName('Peter')).toBe('pierre');
  });

  it('devrait retourner une chaîne vide pour null', () => {
    expect(normalizeFirstName(null)).toBe('');
  });

  it('devrait retourner le prénom en minuscule si non reconnu', () => {
    expect(normalizeFirstName('Zébulon')).toBe('zébulon');
  });

  it('devrait trimmer les espaces', () => {
    expect(normalizeFirstName('  Jean  ')).toBe('jean');
  });
});

// ============================================================================
// Tests soundex
// ============================================================================
describe('soundex', () => {
  it('devrait retourner 0000 pour chaîne vide', () => {
    expect(soundex('')).toBe('0000');
  });

  it('devrait retourner 0000 pour null', () => {
    expect(soundex(null)).toBe('0000');
  });

  it('devrait encoder Martin', () => {
    const result = soundex('Martin');
    expect(result).toHaveLength(4);
    expect(result[0]).toBe('M');
  });

  it('devrait encoder Dupont', () => {
    const result = soundex('Dupont');
    expect(result).toHaveLength(4);
    expect(result[0]).toBe('D');
  });

  it('devrait donner le même code pour variantes similaires', () => {
    // Jean et Jehan devraient avoir des codes similaires
    const jean = soundex('Jean');
    const jehan = soundex('Jehan');
    expect(jean).toBe(jehan); // Normalisés tous les deux en "jean"
  });

  it('devrait encoder un nom avec accents', () => {
    const result = soundex('François');
    expect(result).toHaveLength(4);
  });
});

// ============================================================================
// Tests normalizePlaceFull
// ============================================================================
describe('normalizePlaceFull', () => {
  it('devrait retourner une chaîne vide pour null', () => {
    expect(normalizePlaceFull(null)).toBe('');
  });

  it('devrait retourner une chaîne vide pour chaîne vide', () => {
    expect(normalizePlaceFull('')).toBe('');
  });

  it('devrait convertir PARIS en Paris', () => {
    expect(normalizePlaceFull('PARIS')).toBe('Paris');
  });

  it('devrait normaliser Paris, FRANCE en Paris, France', () => {
    expect(normalizePlaceFull('Paris, FRANCE')).toBe('Paris, France');
  });

  it('devrait normaliser LYON, rhone, FRANCE', () => {
    expect(normalizePlaceFull('LYON, rhone, FRANCE')).toBe('Lyon, Rhone, France');
  });

  it('devrait trimmer les espaces autour des virgules', () => {
    expect(normalizePlaceFull('Paris ,  France')).toBe('Paris, France');
  });
});

// ============================================================================
// Tests getSuspicionLevel
// ============================================================================
describe('getSuspicionLevel', () => {
  it('devrait retourner FORT pour score >= 90 et >= 5 critères', () => {
    const result = getSuspicionLevel(92, 5);
    expect(result.level).toBe('FORT');
    expect(result.emoji).toBe('🔴');
  });

  it('devrait retourner FORT pour score >= 80 et >= 3 critères', () => {
    const result = getSuspicionLevel(85, 3);
    expect(result.level).toBe('FORT');
    expect(result.emoji).toBe('🔴');
  });

  it('devrait retourner MOYEN pour score >= 70 et >= 2 critères', () => {
    const result = getSuspicionLevel(75, 2);
    expect(result.level).toBe('MOYEN');
    expect(result.emoji).toBe('🟡');
  });

  it('devrait retourner MOYEN pour score >= 60 et >= 4 critères', () => {
    const result = getSuspicionLevel(65, 4);
    expect(result.level).toBe('MOYEN');
    expect(result.emoji).toBe('🟡');
  });

  it('devrait retourner FAIBLE pour score bas', () => {
    const result = getSuspicionLevel(50, 2);
    expect(result.level).toBe('FAIBLE');
    expect(result.emoji).toBe('🟢');
  });

  it('devrait retourner FAIBLE pour peu de critères', () => {
    const result = getSuspicionLevel(90, 1);
    expect(result.level).toBe('FAIBLE');
    expect(result.emoji).toBe('🟢');
  });
});

// ============================================================================
// Tests NAME_VARIANTS
// ============================================================================
describe('NAME_VARIANTS', () => {
  it('devrait contenir les variantes de Jean', () => {
    expect(NAME_VARIANTS['jean']).toContain('jehan');
    expect(NAME_VARIANTS['jean']).toContain('johan');
  });

  it('devrait contenir les variantes de Marie', () => {
    expect(NAME_VARIANTS['marie']).toContain('maria');
    expect(NAME_VARIANTS['marie']).toContain('mary');
  });

  it('devrait contenir au moins 15 prénoms', () => {
    expect(Object.keys(NAME_VARIANTS).length).toBeGreaterThanOrEqual(15);
  });
});
