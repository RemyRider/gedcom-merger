/**
 * GEDCOM Merger - Parser GEDCOM
 * Fonctions de parsing extraites pour tests unitaires
 */

import { normalizePlace } from './helpers.mjs';

/**
 * Parse un fichier GEDCOM et retourne les individus et familles
 * @param {string} content - Contenu du fichier GEDCOM
 * @returns {object} - { people: Array, families: Map }
 */
export const parseGedcom = (content) => {
  const lines = content.split('\n');
  const people = [];
  const families = new Map();
  let currentPerson = null;
  let currentFamily = null;
  let currentEvent = null;
  let lastFieldType = null;

  lines.forEach(line => {
    const trimmed = line.trim();
    
    if (currentPerson && (trimmed.startsWith('2 CONT ') || trimmed.startsWith('2 CONC '))) {
      const isCont = trimmed.startsWith('2 CONT ');
      const value = trimmed.split(isCont ? '2 CONT ' : '2 CONC ')[1] || '';
      const separator = isCont ? '\n' : '';
      if (lastFieldType === 'NAME' && currentPerson.names.length > 0) {
        currentPerson.names[currentPerson.names.length - 1] += separator + value;
      } else if (lastFieldType === 'BIRT_DATE') currentPerson.birth += separator + value;
      else if (lastFieldType === 'BIRT_PLAC') currentPerson.birthPlace += separator + value;
      else if (lastFieldType === 'DEAT_DATE') currentPerson.death += separator + value;
      else if (lastFieldType === 'DEAT_PLAC') currentPerson.deathPlace += separator + value;
      else if (lastFieldType === 'OCCU') currentPerson.occupation += separator + value;
      return;
    }
    
    if (trimmed.startsWith('0') && trimmed.includes('INDI')) {
      if (currentPerson) people.push(currentPerson);
      const match = trimmed.match(/@([^@]+)@/);
      const id = match ? match[1] : trimmed.split(' ')[1];
      currentPerson = { 
        id, names: [], birth: '', birthPlace: '', death: '', deathPlace: '',
        sex: '', parents: [], spouses: [], familyAsChild: null, 
        familiesAsSpouse: [], occupation: '', religion: '',
        baptism: '', baptismPlace: '', burial: '', burialPlace: '',
        residence: '', title: '', note: '', children: [],
        rawLines: [line],
        rawLinesByTag: {}
      };
      currentEvent = null;
      lastFieldType = null;
    } 
    else if (trimmed.startsWith('0') && trimmed.includes('FAM')) {
      if (currentPerson) { people.push(currentPerson); currentPerson = null; }
      const match = trimmed.match(/@([^@]+)@/);
      const id = match ? match[1] : trimmed.split(' ')[1];
      currentFamily = { id, husband: null, wife: null, children: [] };
      families.set(id, currentFamily);
      currentEvent = null;
    }
    else if (currentPerson) {
      currentPerson.rawLines.push(line);
      
      if (trimmed.startsWith('1 ')) {
        const tagMatch = trimmed.match(/^1\s+(\S+)/);
        if (tagMatch) {
          const tag = tagMatch[1];
          if (['SOUR', 'NOTE', 'OBJE', 'EVEN', 'EDUC', 'NATI', 'IMMI', 'EMIG', 'CENS', 'WILL', 'PROB'].includes(tag) || tag.startsWith('_')) {
            if (!currentPerson.rawLinesByTag[tag]) currentPerson.rawLinesByTag[tag] = [];
            currentPerson.rawLinesByTag[tag].push({ startIdx: currentPerson.rawLines.length - 1, lines: [line] });
          }
        }
      } else if (trimmed.match(/^[2-9]\s/) && currentPerson.rawLinesByTag) {
        const lastTagKey = Object.keys(currentPerson.rawLinesByTag).find(key => {
          const blocks = currentPerson.rawLinesByTag[key];
          if (blocks && blocks.length > 0) {
            const lastBlock = blocks[blocks.length - 1];
            return lastBlock.startIdx === currentPerson.rawLines.length - 2 || 
                   (lastBlock.lines && lastBlock.startIdx + lastBlock.lines.length === currentPerson.rawLines.length - 1);
          }
          return false;
        });
        if (lastTagKey) {
          const blocks = currentPerson.rawLinesByTag[lastTagKey];
          blocks[blocks.length - 1].lines.push(line);
        }
      }
      
      if (trimmed.includes('NAME')) {
        const name = trimmed.split('NAME')[1]?.trim();
        if (name) { currentPerson.names.push(name); lastFieldType = 'NAME'; }
      } else if (trimmed.includes('SEX')) {
        currentPerson.sex = trimmed.split('SEX')[1]?.trim() || '';
      } else if (trimmed.startsWith('1 BIRT')) currentEvent = 'birth';
      else if (trimmed.startsWith('1 DEAT')) currentEvent = 'death';
      else if (trimmed.startsWith('1 BAPM') || trimmed.startsWith('1 CHR')) currentEvent = 'baptism';
      else if (trimmed.startsWith('1 BURI') || trimmed.startsWith('1 CREM')) currentEvent = 'burial';
      else if (trimmed.startsWith('1 RESI')) currentEvent = 'residence';
      else if (trimmed.startsWith('1 OCCU')) {
        currentPerson.occupation = trimmed.split('OCCU')[1]?.trim() || '';
        lastFieldType = 'OCCU';
      } else if (trimmed.startsWith('1 TITL')) {
        currentPerson.title = trimmed.split('TITL')[1]?.trim() || '';
      } else if (trimmed.startsWith('1 RELI')) {
        currentPerson.religion = trimmed.split('RELI')[1]?.trim() || '';
      } else if (trimmed.startsWith('1 NOTE')) {
        currentPerson.note = trimmed.split('NOTE')[1]?.trim() || '';
      } else if (currentEvent && trimmed.includes('DATE')) {
        const date = trimmed.split('DATE')[1]?.trim() || '';
        if (currentEvent === 'birth') { currentPerson.birth = date; lastFieldType = 'BIRT_DATE'; }
        else if (currentEvent === 'death') { currentPerson.death = date; lastFieldType = 'DEAT_DATE'; }
        else if (currentEvent === 'baptism') { currentPerson.baptism = date; }
        else if (currentEvent === 'burial') { currentPerson.burial = date; }
      } else if (currentEvent && trimmed.includes('PLAC')) {
        const place = normalizePlace(trimmed.split('PLAC')[1]?.trim() || '');
        if (currentEvent === 'birth') { currentPerson.birthPlace = place; lastFieldType = 'BIRT_PLAC'; }
        else if (currentEvent === 'death') { currentPerson.deathPlace = place; lastFieldType = 'DEAT_PLAC'; }
        else if (currentEvent === 'baptism') { currentPerson.baptismPlace = place; }
        else if (currentEvent === 'burial') { currentPerson.burialPlace = place; }
        else if (currentEvent === 'residence') { currentPerson.residence = place; }
      } else if (trimmed.includes('FAMC')) {
        const match = trimmed.match(/@([^@]+)@/);
        if (match) currentPerson.familyAsChild = match[1];
      } else if (trimmed.includes('FAMS')) {
        const match = trimmed.match(/@([^@]+)@/);
        if (match) currentPerson.familiesAsSpouse.push(match[1]);
      }
    }
    else if (currentFamily) {
      if (trimmed.includes('HUSB')) {
        const match = trimmed.match(/@([^@]+)@/);
        if (match) currentFamily.husband = match[1];
      } else if (trimmed.includes('WIFE')) {
        const match = trimmed.match(/@([^@]+)@/);
        if (match) currentFamily.wife = match[1];
      } else if (trimmed.includes('CHIL')) {
        const match = trimmed.match(/@([^@]+)@/);
        if (match) currentFamily.children.push(match[1]);
      }
    }
  });
  
  if (currentPerson) people.push(currentPerson);
  
  // Relier parents/enfants/conjoints
  people.forEach(person => {
    if (person.familyAsChild) {
      const family = families.get(person.familyAsChild);
      if (family) {
        if (family.husband) person.parents.push(family.husband);
        if (family.wife) person.parents.push(family.wife);
      }
    }
    person.familiesAsSpouse.forEach(famId => {
      const family = families.get(famId);
      if (family) {
        if (family.husband && family.husband !== person.id) person.spouses.push(family.husband);
        if (family.wife && family.wife !== person.id) person.spouses.push(family.wife);
        family.children.forEach(childId => {
          if (!person.children.includes(childId)) person.children.push(childId);
        });
      }
    });
  });
  
  return { people, families };
};
