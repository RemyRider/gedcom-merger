/**
 * Tests unitaires pour src/utils/parser.js
 * VRAIS tests avec exécution de code et assertions
 */

import { describe, it, expect } from 'vitest';
import { parseGedcom } from '../src/utils/parser.mjs';

// ============================================================================
// Fixtures GEDCOM de test
// ============================================================================
const SIMPLE_GEDCOM = `0 HEAD
1 SOUR Test
1 GEDC
2 VERS 5.5.1
0 @I1@ INDI
1 NAME Jean /MARTIN/
1 SEX M
1 BIRT
2 DATE 15 MAR 1726
2 PLAC Paris, France
1 DEAT
2 DATE 22 NOV 1798
2 PLAC Paris, France
1 FAMS @F1@
0 @I2@ INDI
1 NAME Marie /DUPONT/
1 SEX F
1 BIRT
2 DATE 1730
2 PLAC Lyon
1 FAMS @F1@
0 @F1@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 CHIL @I3@
0 @I3@ INDI
1 NAME Pierre /MARTIN/
1 SEX M
1 BIRT
2 DATE ABT 1755
1 FAMC @F1@
0 TRLR`;

const EMPTY_GEDCOM = `0 HEAD
0 TRLR`;

const GEDCOM_WITH_OCCUPATION = `0 HEAD
0 @I1@ INDI
1 NAME Jean /LABOUREUR/
1 SEX M
1 OCCU Laboureur
0 TRLR`;

const GEDCOM_WITH_MULTIPLE_NAMES = `0 HEAD
0 @I1@ INDI
1 NAME Jean Pierre /MARTIN/
1 NAME Jean /MARTIN/
1 SEX M
0 TRLR`;

const GEDCOM_WITH_SOURCES = `0 HEAD
0 @I1@ INDI
1 NAME Jean /MARTIN/
1 SEX M
1 SOUR @S1@
2 PAGE Page 123
1 NOTE Une note importante
0 TRLR`;

// ============================================================================
// Tests parseGedcom - Cas de base
// ============================================================================
describe('parseGedcom - Cas de base', () => {
  it('devrait parser un fichier GEDCOM vide', () => {
    const { people, families } = parseGedcom(EMPTY_GEDCOM);
    expect(people).toHaveLength(0);
    expect(families.size).toBe(0);
  });

  it('devrait parser un fichier GEDCOM simple', () => {
    const { people, families } = parseGedcom(SIMPLE_GEDCOM);
    expect(people.length).toBeGreaterThan(0);
    expect(families.size).toBeGreaterThan(0);
  });

  it('devrait retourner un objet avec people et families', () => {
    const result = parseGedcom(SIMPLE_GEDCOM);
    expect(result).toHaveProperty('people');
    expect(result).toHaveProperty('families');
    expect(Array.isArray(result.people)).toBe(true);
    expect(result.families instanceof Map).toBe(true);
  });
});

// ============================================================================
// Tests parseGedcom - Individus
// ============================================================================
describe('parseGedcom - Individus', () => {
  it('devrait extraire l\'ID de l\'individu', () => {
    const { people } = parseGedcom(SIMPLE_GEDCOM);
    const jean = people.find(p => p.names[0]?.includes('Jean /MARTIN/'));
    expect(jean).toBeDefined();
    expect(jean.id).toBe('I1');
  });

  it('devrait extraire le nom complet', () => {
    const { people } = parseGedcom(SIMPLE_GEDCOM);
    const jean = people.find(p => p.id === 'I1');
    expect(jean.names).toHaveLength(1);
    expect(jean.names[0]).toBe('Jean /MARTIN/');
  });

  it('devrait extraire le sexe', () => {
    const { people } = parseGedcom(SIMPLE_GEDCOM);
    const jean = people.find(p => p.id === 'I1');
    expect(jean.sex).toBe('M');
    
    const marie = people.find(p => p.id === 'I2');
    expect(marie.sex).toBe('F');
  });

  it('devrait extraire la date de naissance', () => {
    const { people } = parseGedcom(SIMPLE_GEDCOM);
    const jean = people.find(p => p.id === 'I1');
    expect(jean.birth).toBe('15 MAR 1726');
  });

  it('devrait extraire le lieu de naissance', () => {
    const { people } = parseGedcom(SIMPLE_GEDCOM);
    const jean = people.find(p => p.id === 'I1');
    expect(jean.birthPlace).toBe('Paris, France');
  });

  it('devrait extraire la date de décès', () => {
    const { people } = parseGedcom(SIMPLE_GEDCOM);
    const jean = people.find(p => p.id === 'I1');
    expect(jean.death).toBe('22 NOV 1798');
  });

  it('devrait extraire le lieu de décès', () => {
    const { people } = parseGedcom(SIMPLE_GEDCOM);
    const jean = people.find(p => p.id === 'I1');
    expect(jean.deathPlace).toBe('Paris, France');
  });

  it('devrait extraire la profession', () => {
    const { people } = parseGedcom(GEDCOM_WITH_OCCUPATION);
    const person = people[0];
    expect(person.occupation).toBe('Laboureur');
  });

  it('devrait gérer les dates partielles (année seule)', () => {
    const { people } = parseGedcom(SIMPLE_GEDCOM);
    const marie = people.find(p => p.id === 'I2');
    expect(marie.birth).toBe('1730');
  });

  it('devrait gérer les dates approximatives (ABT)', () => {
    const { people } = parseGedcom(SIMPLE_GEDCOM);
    const pierre = people.find(p => p.id === 'I3');
    expect(pierre.birth).toBe('ABT 1755');
  });

  it('devrait gérer plusieurs noms', () => {
    const { people } = parseGedcom(GEDCOM_WITH_MULTIPLE_NAMES);
    const person = people[0];
    expect(person.names.length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================================
// Tests parseGedcom - Familles
// ============================================================================
describe('parseGedcom - Familles', () => {
  it('devrait créer une famille', () => {
    const { families } = parseGedcom(SIMPLE_GEDCOM);
    expect(families.size).toBe(1);
    expect(families.has('F1')).toBe(true);
  });

  it('devrait identifier le mari', () => {
    const { families } = parseGedcom(SIMPLE_GEDCOM);
    const family = families.get('F1');
    expect(family.husband).toBe('I1');
  });

  it('devrait identifier la femme', () => {
    const { families } = parseGedcom(SIMPLE_GEDCOM);
    const family = families.get('F1');
    expect(family.wife).toBe('I2');
  });

  it('devrait identifier les enfants', () => {
    const { families } = parseGedcom(SIMPLE_GEDCOM);
    const family = families.get('F1');
    expect(family.children).toContain('I3');
  });
});

// ============================================================================
// Tests parseGedcom - Relations
// ============================================================================
describe('parseGedcom - Relations', () => {
  it('devrait lier l\'enfant à ses parents', () => {
    const { people } = parseGedcom(SIMPLE_GEDCOM);
    const pierre = people.find(p => p.id === 'I3');
    expect(pierre.parents).toContain('I1');
    expect(pierre.parents).toContain('I2');
  });

  it('devrait identifier la famille d\'origine', () => {
    const { people } = parseGedcom(SIMPLE_GEDCOM);
    const pierre = people.find(p => p.id === 'I3');
    expect(pierre.familyAsChild).toBe('F1');
  });

  it('devrait lier les conjoints', () => {
    const { people } = parseGedcom(SIMPLE_GEDCOM);
    const jean = people.find(p => p.id === 'I1');
    expect(jean.spouses).toContain('I2');
    
    const marie = people.find(p => p.id === 'I2');
    expect(marie.spouses).toContain('I1');
  });

  it('devrait lier les enfants aux parents', () => {
    const { people } = parseGedcom(SIMPLE_GEDCOM);
    const jean = people.find(p => p.id === 'I1');
    expect(jean.children).toContain('I3');
  });
});

// ============================================================================
// Tests parseGedcom - rawLines (v2.0.0)
// ============================================================================
describe('parseGedcom - rawLines', () => {
  it('devrait stocker rawLines pour chaque individu', () => {
    const { people } = parseGedcom(SIMPLE_GEDCOM);
    const jean = people.find(p => p.id === 'I1');
    expect(jean.rawLines).toBeDefined();
    expect(Array.isArray(jean.rawLines)).toBe(true);
    expect(jean.rawLines.length).toBeGreaterThan(0);
  });

  it('devrait stocker rawLinesByTag', () => {
    const { people } = parseGedcom(GEDCOM_WITH_SOURCES);
    const person = people[0];
    expect(person.rawLinesByTag).toBeDefined();
    expect(typeof person.rawLinesByTag).toBe('object');
  });

  it('devrait indexer les SOUR dans rawLinesByTag', () => {
    const { people } = parseGedcom(GEDCOM_WITH_SOURCES);
    const person = people[0];
    expect(person.rawLinesByTag['SOUR']).toBeDefined();
  });

  it('devrait indexer les NOTE dans rawLinesByTag', () => {
    const { people } = parseGedcom(GEDCOM_WITH_SOURCES);
    const person = people[0];
    expect(person.rawLinesByTag['NOTE']).toBeDefined();
  });
});

// ============================================================================
// Tests parseGedcom - Cas limites
// ============================================================================
describe('parseGedcom - Cas limites', () => {
  it('devrait gérer un fichier sans individus', () => {
    const gedcom = `0 HEAD
0 @F1@ FAM
1 HUSB @I1@
0 TRLR`;
    const { people, families } = parseGedcom(gedcom);
    expect(people).toHaveLength(0);
    expect(families.size).toBe(1);
  });

  it('devrait gérer un individu sans nom', () => {
    const gedcom = `0 HEAD
0 @I1@ INDI
1 SEX M
0 TRLR`;
    const { people } = parseGedcom(gedcom);
    expect(people).toHaveLength(1);
    expect(people[0].names).toHaveLength(0);
    expect(people[0].id).toBe('I1');
  });

  it('devrait gérer un individu sans sexe', () => {
    const gedcom = `0 HEAD
0 @I1@ INDI
1 NAME Jean /MARTIN/
0 TRLR`;
    const { people } = parseGedcom(gedcom);
    expect(people).toHaveLength(1);
    expect(people[0].sex).toBe('');
  });

  it('devrait gérer des lignes vides', () => {
    const gedcom = `0 HEAD

0 @I1@ INDI
1 NAME Jean /MARTIN/

1 SEX M
0 TRLR`;
    const { people } = parseGedcom(gedcom);
    expect(people).toHaveLength(1);
  });
});
