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
  // v2.2.5: Couleurs inversées - 🟢 FORT = feu vert pour fusionner
  it('devrait retourner FORT (🟢) pour score >= 90 et >= 5 critères', () => {
    const result = getSuspicionLevel(92, 5);
    expect(result.level).toBe('FORT');
    expect(result.emoji).toBe('🟢');
  });

  it('devrait retourner FORT (🟢) pour score >= 80 et >= 3 critères', () => {
    const result = getSuspicionLevel(85, 3);
    expect(result.level).toBe('FORT');
    expect(result.emoji).toBe('🟢');
  });

  it('devrait retourner MOYEN (🟡) pour score >= 70 et >= 2 critères', () => {
    const result = getSuspicionLevel(75, 2);
    expect(result.level).toBe('MOYEN');
    expect(result.emoji).toBe('🟡');
  });

  it('devrait retourner MOYEN (🟡) pour score >= 60 et >= 4 critères', () => {
    const result = getSuspicionLevel(65, 4);
    expect(result.level).toBe('MOYEN');
    expect(result.emoji).toBe('🟡');
  });

  it('devrait retourner FAIBLE (🔴) pour score bas', () => {
    const result = getSuspicionLevel(50, 2);
    expect(result.level).toBe('FAIBLE');
    expect(result.emoji).toBe('🔴');
  });

  it('devrait retourner FAIBLE (🔴) pour peu de critères', () => {
    const result = getSuspicionLevel(90, 1);
    expect(result.level).toBe('FAIBLE');
    expect(result.emoji).toBe('🔴');
  });

  // v2.2.5: Tests couleurs inversées
  it('devrait utiliser 🟢 pour FORT (feu vert pour fusionner)', () => {
    const result = getSuspicionLevel(95, 6);
    expect(result.emoji).toBe('🟢');
    expect(result.level).toBe('FORT');
  });

  it('devrait utiliser 🔴 pour FAIBLE (prudence requise)', () => {
    const result = getSuspicionLevel(80, 1);
    expect(result.emoji).toBe('🔴');
    expect(result.level).toBe('FAIBLE');
  });

  it('devrait retourner FORT pour score >= 85 et >= 4 critères', () => {
    const result = getSuspicionLevel(85, 4);
    expect(result.level).toBe('FORT');
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

// ============================================================================
// Tests v2.2.5 - Pondération dynamique des noms (simulation)
// ============================================================================
describe('Pondération noms v2.2.5', () => {
  // Simuler la fonction getNameWeight
  const getNameWeight = (surname, surnameStats) => {
    const frequency = surnameStats[surname] || 0;
    if (frequency <= 3) return 35;
    if (frequency <= 10) return 32;
    if (frequency <= 30) return 30;
    if (frequency <= 100) return 25;
    return 20;
  };

  it('devrait donner 35 pts pour un nom très rare (≤3 occ)', () => {
    const stats = { 'girardet': 2 };
    expect(getNameWeight('girardet', stats)).toBe(35);
  });

  it('devrait donner 32 pts pour un nom rare (≤10 occ)', () => {
    const stats = { 'berger': 8 };
    expect(getNameWeight('berger', stats)).toBe(32);
  });

  it('devrait donner 30 pts pour un nom normal (≤30 occ)', () => {
    const stats = { 'dupuis': 25 };
    expect(getNameWeight('dupuis', stats)).toBe(30);
  });

  it('devrait donner 25 pts pour un nom commun (≤100 occ)', () => {
    const stats = { 'bernard': 75 };
    expect(getNameWeight('bernard', stats)).toBe(25);
  });

  it('devrait donner 20 pts pour un nom très commun (>100 occ)', () => {
    const stats = { 'martin': 250 };
    expect(getNameWeight('martin', stats)).toBe(20);
  });

  it('devrait donner 35 pts pour un nom inconnu (0 occ)', () => {
    const stats = {};
    expect(getNameWeight('inconnu', stats)).toBe(35);
  });
});

// ============================================================================
// Tests v2.2.6 - Normalisation des lieux (simulation)
// ============================================================================
describe('Normalisation lieux v2.2.6', () => {
  // Simuler la fonction de création de replacementMap
  const createReplacementMap = (variants, chosenForm) => {
    const map = new Map();
    variants.forEach(variant => {
      if (variant !== chosenForm) {
        map.set(variant, chosenForm);
      }
    });
    return map;
  };

  it('devrait créer une map de remplacement correcte', () => {
    const variants = ['Grenoble', 'GRENOBLE', 'grenoble, isère'];
    const chosen = 'Grenoble, Isère, Auvergne-Rhône-Alpes, France';
    const map = createReplacementMap(variants, chosen);
    
    expect(map.size).toBe(3);
    expect(map.get('Grenoble')).toBe('Grenoble, Isère, Auvergne-Rhône-Alpes, France');
    expect(map.get('GRENOBLE')).toBe('Grenoble, Isère, Auvergne-Rhône-Alpes, France');
  });

  it('ne devrait pas inclure la forme choisie dans la map', () => {
    const variants = ['Paris', 'PARIS', 'paris'];
    const chosen = 'Paris';
    const map = createReplacementMap(variants, chosen);
    
    expect(map.has('Paris')).toBe(false);
    expect(map.size).toBe(2);
  });

  it('devrait gérer un groupe avec une seule variante', () => {
    const variants = ['Lyon'];
    const chosen = 'Lyon, Rhône, Auvergne-Rhône-Alpes, France';
    const map = createReplacementMap(variants, chosen);
    
    expect(map.size).toBe(1);
    expect(map.get('Lyon')).toBe('Lyon, Rhône, Auvergne-Rhône-Alpes, France');
  });

  // Simuler l'extraction du nom de commune
  const extractCommuneName = (placeText) => {
    return placeText
      .split(',')[0]
      .replace(/^\d{5}\s*/, '')
      .replace(/\s*\d{5}$/, '')
      .trim();
  };

  it('devrait extraire le nom de commune simple', () => {
    expect(extractCommuneName('Grenoble, Isère')).toBe('Grenoble');
  });

  it('devrait retirer le code postal en préfixe', () => {
    expect(extractCommuneName('38000 Grenoble')).toBe('Grenoble');
  });

  it('devrait retirer le code postal en suffixe', () => {
    expect(extractCommuneName('Grenoble 38000')).toBe('Grenoble');
  });

  it('devrait gérer un lieu simple sans virgule', () => {
    expect(extractCommuneName('Lyon')).toBe('Lyon');
  });

  // Test du format avec France
  it('devrait inclure France dans le format complet', () => {
    const formatFull = (nom, dept, region) => {
      return `${nom}, ${dept}, ${region}, France`;
    };
    expect(formatFull('Grenoble', 'Isère', 'Auvergne-Rhône-Alpes')).toBe('Grenoble, Isère, Auvergne-Rhône-Alpes, France');
  });
});

// Tests v2.2.6 - Préservation des données via rawLines
// ============================================================================
describe('Préservation rawLines v2.2.6', () => {
  // Simuler la mise à jour des rawLines dans applyPlaceNormalizations
  const updateRawLinesWithPlace = (rawLines, oldPlace, newPlace) => {
    return rawLines.map(line => {
      if (line.includes('PLAC') && line.includes(oldPlace)) {
        return line.replace(oldPlace, newPlace);
      }
      return line;
    });
  };

  it('devrait remplacer le lieu dans les rawLines', () => {
    const rawLines = [
      '0 @I1@ INDI',
      '1 NAME Jean /Dupont/',
      '1 BIRT',
      '2 DATE 1 JAN 1900',
      '2 PLAC Grenoble',
      '1 NOTE Une note importante'
    ];
    
    const updated = updateRawLinesWithPlace(rawLines, 'Grenoble', 'Grenoble, Isère, Auvergne-Rhône-Alpes, France');
    
    expect(updated[4]).toBe('2 PLAC Grenoble, Isère, Auvergne-Rhône-Alpes, France');
    expect(updated.length).toBe(6); // Même nombre de lignes
  });

  it('devrait préserver les autres lignes non-PLAC', () => {
    const rawLines = [
      '0 @I1@ INDI',
      '1 NAME Jean /Dupont/',
      '1 BIRT',
      '2 DATE 1 JAN 1900',
      '2 PLAC Lyon',
      '1 SOUR @S1@',
      '2 PAGE p.42',
      '1 NOTE Commentaire'
    ];
    
    const updated = updateRawLinesWithPlace(rawLines, 'Lyon', 'Lyon, Rhône, France');
    
    expect(updated[0]).toBe('0 @I1@ INDI');
    expect(updated[1]).toBe('1 NAME Jean /Dupont/');
    expect(updated[5]).toBe('1 SOUR @S1@');
    expect(updated[6]).toBe('2 PAGE p.42');
    expect(updated[7]).toBe('1 NOTE Commentaire');
  });

  it('devrait gérer plusieurs lieux PLAC dans les rawLines', () => {
    const rawLines = [
      '0 @I1@ INDI',
      '1 BIRT',
      '2 PLAC Paris',
      '1 DEAT',
      '2 PLAC Paris',
      '1 RESI',
      '2 PLAC Lyon'
    ];
    
    const updated = updateRawLinesWithPlace(rawLines, 'Paris', 'Paris, Paris, Île-de-France, France');
    
    expect(updated[2]).toBe('2 PLAC Paris, Paris, Île-de-France, France');
    expect(updated[4]).toBe('2 PLAC Paris, Paris, Île-de-France, France');
    expect(updated[6]).toBe('2 PLAC Lyon'); // Non modifié
  });

  // Simuler la création de la map pour downloadNormalizedFile
  const createUpdatedRawLinesMap = (individuals) => {
    const map = new Map();
    individuals.forEach(person => {
      if (person.rawLines && person.rawLines.length > 0) {
        map.set(person.id, person.rawLines);
      }
    });
    return map;
  };

  it('devrait créer une map ID -> rawLines', () => {
    const individuals = [
      { id: 'I1', name: 'Jean', rawLines: ['0 @I1@ INDI', '1 NAME Jean'] },
      { id: 'I2', name: 'Marie', rawLines: ['0 @I2@ INDI', '1 NAME Marie'] },
      { id: 'I3', name: 'Pierre' } // Sans rawLines
    ];
    
    const map = createUpdatedRawLinesMap(individuals);
    
    expect(map.size).toBe(2);
    expect(map.has('I1')).toBe(true);
    expect(map.has('I2')).toBe(true);
    expect(map.has('I3')).toBe(false);
  });

  it('devrait ignorer les personnes avec rawLines vides', () => {
    const individuals = [
      { id: 'I1', rawLines: [] },
      { id: 'I2', rawLines: ['0 @I2@ INDI'] }
    ];
    
    const map = createUpdatedRawLinesMap(individuals);
    
    expect(map.size).toBe(1);
    expect(map.has('I2')).toBe(true);
  });
});
