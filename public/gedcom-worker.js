/**
 * GEDCOM Merger v2.1.4 - Web Worker
 * 
 * Ce worker s'exécute dans un thread séparé pour éviter de bloquer l'interface.
 * Toutes les opérations lourdes (parsing, détection doublons, stats) sont ici.
 */

// ============================================================================
// CONSTANTES
// ============================================================================

const NAME_VARIANTS = {
  'jean': ['jehan', 'johan', 'johannes', 'joan', 'jan'],
  'marie': ['maria', 'mary', 'marye', 'maryse'],
  'pierre': ['peter', 'petrus', 'perre', 'peire'],
  'jacques': ['jacob', 'jacobus', 'jacque', 'james'],
  'françois': ['francois', 'franciscus', 'franz'],
  'antoine': ['anthoine', 'antonius', 'anthony'],
  'catherine': ['katherine', 'caterine', 'katarina'],
  'marguerite': ['margueritte', 'margareta', 'margaret'],
  'anne': ['anna', 'anne', 'hanne'],
  'jeanne': ['jehanne', 'johanna', 'jane'],
  'guillaume': ['william', 'wilhelmus', 'guilhem'],
  'louis': ['ludovic', 'ludovicus', 'lewis'],
  'charles': ['carolus', 'karl', 'carlo'],
  'henri': ['henry', 'henricus', 'heinrich'],
  'nicolas': ['nicolaus', 'nicholas', 'nicola'],
  'philippe': ['philip', 'philippus', 'filippo'],
  'michel': ['michael', 'michaelus', 'miguel'],
  'joseph': ['josephus', 'josef', 'giuseppe'],
  'etienne': ['estienne', 'stephanus', 'stephen'],
  'laurent': ['laurentius', 'lawrence', 'lorenzo']
};

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

const normalizePlace = (place) => {
  if (!place) return '';
  return place.replace(/^\d{5}\s+/, '').trim();
};

const normalizeFirstName = (name) => {
  if (!name) return '';
  const lower = name.toLowerCase().trim();
  for (const [canonical, variants] of Object.entries(NAME_VARIANTS)) {
    if (lower === canonical || variants.includes(lower)) return canonical;
  }
  return lower;
};

const soundex = (str) => {
  if (!str) return '0000';
  const normalized = normalizeFirstName(str);
  const s = normalized.toUpperCase()
    .replace(/[^A-Z]/g, '')
    .replace(/[AEIOUYH]/g, '0')
    .replace(/[BFPV]/g, '1')
    .replace(/[CGJKQSXZ]/g, '2')
    .replace(/[DT]/g, '3')
    .replace(/[L]/g, '4')
    .replace(/[MN]/g, '5')
    .replace(/[R]/g, '6');
  if (s.length === 0) return '0000';
  const first = normalized[0]?.toUpperCase() || '0';
  const result = first + s.substring(1).replace(/(.)\1+/g, '$1').replace(/0/g, '');
  return result.substring(0, 4).padEnd(4, '0');
};

const normalizePlaceFull = (place) => {
  if (!place) return '';
  return place
    .toLowerCase()
    .split(',')
    .map(part => part.trim())
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(', ');
};

const extractYear = (dateStr) => {
  if (!dateStr) return null;
  const match = dateStr.match(/(\d{4})/);
  return match ? parseInt(match[1]) : null;
};

const getSuspicionLevel = (score, criteriaCount) => {
  if ((score >= 90 && criteriaCount >= 5) || (score >= 80 && criteriaCount >= 3)) {
    return { level: 'FORT', emoji: '🔴' };
  }
  if ((score >= 70 && criteriaCount >= 2) || (score >= 60 && criteriaCount >= 4)) {
    return { level: 'MOYEN', emoji: '🟡' };
  }
  return { level: 'FAIBLE', emoji: '🟢' };
};

// ============================================================================
// PARSING GEDCOM
// ============================================================================

const parseGedcom = (content) => {
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

// ============================================================================
// CALCUL DE SIMILARITÉ (optimisé avec peopleById)
// ============================================================================

const calculateSimilarity = (person1, person2, peopleById) => {
  const details = [];
  let matchScore = 0;
  let maxPossibleScore = 0;
  const sufficientCriteria = [];
  
  const name1 = person1.names[0]?.toLowerCase() || '';
  const name2 = person2.names[0]?.toLowerCase() || '';
  
  let nameMatches = false;
  if (name1 || name2) {
    maxPossibleScore += 30;
    if (name1 && name2) {
      const firstName1 = normalizeFirstName(name1.split(' ')[0] || name1.split('/')[0]);
      const firstName2 = normalizeFirstName(name2.split(' ')[0] || name2.split('/')[0]);
      const lastName1 = name1.split(' ').pop()?.replace(/\//g, '') || '';
      const lastName2 = name2.split(' ').pop()?.replace(/\//g, '') || '';
      const s1 = soundex(firstName1), s2 = soundex(firstName2);
      const ls1 = soundex(lastName1), ls2 = soundex(lastName2);
      
      if (name1 === name2) { matchScore += 30; nameMatches = true; details.push('✓ Noms identiques (+30/30)'); }
      else if (s1 === s2 && ls1 === ls2) { matchScore += 25; nameMatches = true; details.push('✓ Noms phonétiquement identiques (+25/30)'); }
      else if (firstName1 === firstName2 && ls1 === ls2) { matchScore += 25; nameMatches = true; details.push('✓ Variante prénom reconnue (+25/30)'); }
      else if (s1 === s2 || ls1 === ls2) { matchScore += 20; nameMatches = true; details.push('≈ Prénom ou nom similaire (+20/30)'); }
      else if (name1.includes(name2) || name2.includes(name1)) { matchScore += 15; nameMatches = true; details.push('≈ Noms partiellement similaires (+15/30)'); }
      else details.push('✗ Noms différents (0/30)');
    }
  }

  if (person1.birth || person2.birth) {
    maxPossibleScore += 25;
    if (person1.birth && person2.birth) {
      const y1 = person1.birth.match(/\d{4}/), y2 = person2.birth.match(/\d{4}/);
      if (person1.birth === person2.birth) { matchScore += 25; sufficientCriteria.push('naissance_exacte'); details.push('✓ Dates naissance identiques (+25/25)'); }
      else if (y1 && y2) {
        const diff = Math.abs(parseInt(y1[0]) - parseInt(y2[0]));
        if (diff === 0) { matchScore += 20; sufficientCriteria.push('annee_naissance'); details.push('✓ Années naissance identiques (+20/25)'); }
        else if (diff <= 2) { matchScore += 12; sufficientCriteria.push('annee_proche'); details.push('≈ Années naissance proches ±2 ans (+12/25)'); }
        else if (diff <= 5) { matchScore += 5; details.push('≈ Années naissance éloignées ±5 ans (+5/25)'); }
        else details.push('✗ Dates naissance trop éloignées (0/25)');
      }
    }
  }

  if (person1.sex || person2.sex) {
    maxPossibleScore += 15;
    if (person1.sex && person2.sex) {
      if (person1.sex === person2.sex) { matchScore += 15; details.push('✓ Même sexe (+15/15)'); }
      else { details.push('✗ Sexes différents (ÉLIMINATOIRE)'); return { score: 0, details, sufficientCriteria: [], rejected: true }; }
    }
  }

  if (person1.parents.length > 0 || person2.parents.length > 0) {
    maxPossibleScore += 20;
    if (person1.parents.length > 0 && person2.parents.length > 0) {
      const common = person1.parents.filter(p => person2.parents.includes(p));
      if (common.length === 2) { matchScore += 20; sufficientCriteria.push('parents_2'); details.push('✓ 2 parents communs (+20/20)'); }
      else if (common.length === 1) { matchScore += 10; sufficientCriteria.push('parent_1'); details.push('≈ 1 parent commun (+10/20)'); }
      else {
        // v2.0.0: Comparer par nom si les IDs sont différents
        const parentNames1 = person1.parents.map(id => {
          const parent = peopleById.get(id);
          return parent?.names[0]?.toLowerCase() || '';
        }).filter(n => n);
        const parentNames2 = person2.parents.map(id => {
          const parent = peopleById.get(id);
          return parent?.names[0]?.toLowerCase() || '';
        }).filter(n => n);
        const commonNames = parentNames1.filter(n => parentNames2.includes(n));
        if (commonNames.length === 2) { matchScore += 20; sufficientCriteria.push('parents_2_nom'); details.push('✓ 2 parents communs (même nom) (+20/20)'); }
        else if (commonNames.length === 1) { matchScore += 10; sufficientCriteria.push('parent_1_nom'); details.push('≈ 1 parent commun (même nom) (+10/20)'); }
        else details.push('✗ Parents différents (0/20)');
      }
    }
  }

  const parentsCompared = (person1.parents.length > 0 && person2.parents.length > 0);
  if (!parentsCompared && (person1.familyAsChild || person2.familyAsChild)) {
    maxPossibleScore += 15;
    if (person1.familyAsChild && person2.familyAsChild) {
      if (person1.familyAsChild === person2.familyAsChild) { matchScore += 15; sufficientCriteria.push('fratrie'); details.push('✓ Même fratrie (+15/15)'); }
      else details.push('✗ Fratries différentes (0/15)');
    }
  }

  if (person1.birthPlace || person2.birthPlace) {
    maxPossibleScore += 10;
    const bp1 = normalizePlace(person1.birthPlace)?.toLowerCase();
    const bp2 = normalizePlace(person2.birthPlace)?.toLowerCase();
    if (bp1 && bp2) {
      if (bp1 === bp2) { matchScore += 10; sufficientCriteria.push('lieu_naissance'); details.push('✓ Lieux naissance identiques (+10/10)'); }
      else if (bp1.includes(bp2) || bp2.includes(bp1)) { matchScore += 5; sufficientCriteria.push('lieu_partiel'); details.push('≈ Lieux naissance similaires (+5/10)'); }
      else details.push('✗ Lieux naissance différents (0/10)');
    }
  }

  if (person1.spouses.length > 0 || person2.spouses.length > 0) {
    maxPossibleScore += 8;
    if (person1.spouses.length > 0 && person2.spouses.length > 0) {
      const common = person1.spouses.filter(s => person2.spouses.includes(s));
      if (common.length > 0) { matchScore += 8; sufficientCriteria.push('conjoints'); details.push('✓ Conjoints communs (+8/8)'); }
      else {
        const spouseNames1 = person1.spouses.map(id => {
          const spouse = peopleById.get(id);
          return spouse?.names[0]?.toLowerCase() || '';
        }).filter(n => n);
        const spouseNames2 = person2.spouses.map(id => {
          const spouse = peopleById.get(id);
          return spouse?.names[0]?.toLowerCase() || '';
        }).filter(n => n);
        const commonNames = spouseNames1.filter(n => spouseNames2.includes(n));
        if (commonNames.length > 0) { matchScore += 8; sufficientCriteria.push('conjoints_nom'); details.push('✓ Conjoints communs (même nom) (+8/8)'); }
        else details.push('✗ Conjoints différents (0/8)');
      }
    }
  }

  if (person1.death || person2.death) {
    maxPossibleScore += 15;
    if (person1.death && person2.death) {
      const dy1 = person1.death.match(/\d{4}/), dy2 = person2.death.match(/\d{4}/);
      if (person1.death === person2.death) { matchScore += 15; sufficientCriteria.push('deces_exact'); details.push('✓ Dates décès identiques (+15/15)'); }
      else if (dy1 && dy2) {
        const diff = Math.abs(parseInt(dy1[0]) - parseInt(dy2[0]));
        if (diff === 0) { matchScore += 12; sufficientCriteria.push('annee_deces'); details.push('✓ Années décès identiques (+12/15)'); }
        else if (diff <= 2) { matchScore += 6; details.push('≈ Années décès proches ±2 ans (+6/15)'); }
        else details.push('✗ Dates décès trop éloignées (0/15)');
      }
    }
  }

  if (person1.occupation || person2.occupation) {
    maxPossibleScore += 5;
    if (person1.occupation && person2.occupation) {
      const occ1 = person1.occupation.toLowerCase().trim();
      const occ2 = person2.occupation.toLowerCase().trim();
      if (occ1 === occ2) { matchScore += 5; sufficientCriteria.push('profession'); details.push('✓ Professions identiques (+5/5)'); }
      else if (occ1.includes(occ2) || occ2.includes(occ1)) { matchScore += 3; details.push('≈ Professions similaires (+3/5)'); }
      else details.push('✗ Professions différentes (0/5)');
    }
  }

  // v2.0.0: Critères étendus (baptême, inhumation, résidence, titre, religion)
  if (person1.baptism || person2.baptism) {
    maxPossibleScore += 5;
    if (person1.baptism && person2.baptism) {
      const by1 = person1.baptism.match(/\d{4}/), by2 = person2.baptism.match(/\d{4}/);
      if (person1.baptism === person2.baptism) { matchScore += 5; details.push('✓ Baptêmes identiques (+5/5)'); }
      else if (by1 && by2 && Math.abs(parseInt(by1[0]) - parseInt(by2[0])) <= 1) { matchScore += 3; details.push('≈ Baptêmes proches (+3/5)'); }
      else details.push('✗ Baptêmes différents (0/5)');
    }
  }

  if (person1.baptismPlace || person2.baptismPlace) {
    maxPossibleScore += 3;
    const bpl1 = normalizePlace(person1.baptismPlace)?.toLowerCase();
    const bpl2 = normalizePlace(person2.baptismPlace)?.toLowerCase();
    if (bpl1 && bpl2) {
      if (bpl1 === bpl2) { matchScore += 3; details.push('✓ Lieux baptême identiques (+3/3)'); }
      else details.push('✗ Lieux baptême différents (0/3)');
    }
  }

  if (person1.burial || person2.burial) {
    maxPossibleScore += 4;
    if (person1.burial && person2.burial) {
      const bury1 = person1.burial.match(/\d{4}/), bury2 = person2.burial.match(/\d{4}/);
      if (person1.burial === person2.burial) { matchScore += 4; details.push('✓ Inhumations identiques (+4/4)'); }
      else if (bury1 && bury2 && Math.abs(parseInt(bury1[0]) - parseInt(bury2[0])) <= 1) { matchScore += 2; details.push('≈ Inhumations proches (+2/4)'); }
      else details.push('✗ Inhumations différentes (0/4)');
    }
  }

  if (person1.burialPlace || person2.burialPlace) {
    maxPossibleScore += 3;
    const bupl1 = normalizePlace(person1.burialPlace)?.toLowerCase();
    const bupl2 = normalizePlace(person2.burialPlace)?.toLowerCase();
    if (bupl1 && bupl2) {
      if (bupl1 === bupl2) { matchScore += 3; details.push('✓ Lieux inhumation identiques (+3/3)'); }
      else details.push('✗ Lieux inhumation différents (0/3)');
    }
  }

  if (person1.residence || person2.residence) {
    maxPossibleScore += 3;
    const res1 = normalizePlace(person1.residence)?.toLowerCase();
    const res2 = normalizePlace(person2.residence)?.toLowerCase();
    if (res1 && res2) {
      if (res1 === res2) { matchScore += 3; details.push('✓ Résidences identiques (+3/3)'); }
      else details.push('✗ Résidences différentes (0/3)');
    }
  }

  if (person1.title || person2.title) {
    maxPossibleScore += 2;
    if (person1.title && person2.title) {
      if (person1.title.toLowerCase() === person2.title.toLowerCase()) { matchScore += 2; details.push('✓ Titres identiques (+2/2)'); }
      else details.push('✗ Titres différents (0/2)');
    }
  }

  if (person1.religion || person2.religion) {
    maxPossibleScore += 2;
    if (person1.religion && person2.religion) {
      if (person1.religion.toLowerCase() === person2.religion.toLowerCase()) { matchScore += 2; details.push('✓ Religions identiques (+2/2)'); }
      else details.push('✗ Religions différentes (0/2)');
    }
  }

  // v2.0.0: Comparaison enfants par nom
  if (person1.children.length > 0 || person2.children.length > 0) {
    maxPossibleScore += 6;
    if (person1.children.length > 0 && person2.children.length > 0) {
      const commonChildren = person1.children.filter(c => person2.children.includes(c));
      if (commonChildren.length > 0) { matchScore += 6; sufficientCriteria.push('enfants'); details.push('✓ Enfants communs (+6/6)'); }
      else {
        const childNames1 = person1.children.map(id => {
          const child = peopleById.get(id);
          return child?.names[0]?.toLowerCase() || '';
        }).filter(n => n);
        const childNames2 = person2.children.map(id => {
          const child = peopleById.get(id);
          return child?.names[0]?.toLowerCase() || '';
        }).filter(n => n);
        const commonNames = childNames1.filter(n => childNames2.includes(n));
        if (commonNames.length >= 2) { matchScore += 6; sufficientCriteria.push('enfants_nom'); details.push('✓ 2+ enfants même nom (+6/6)'); }
        else if (commonNames.length === 1) { matchScore += 3; details.push('≈ 1 enfant même nom (+3/6)'); }
        else details.push('✗ Enfants différents (0/6)');
      }
    }
  }

  // Règle anti-faux-positif v1.9.2
  if (nameMatches && sufficientCriteria.length === 0 && matchScore > 0) {
    details.push('⚠️ REJETÉ: Nom similaire mais aucun critère suffisant');
    return { score: 0, details, sufficientCriteria: [], rejected: true };
  }

  const finalScore = maxPossibleScore > 0 ? (matchScore / maxPossibleScore) * 100 : 0;
  return { score: finalScore, details, sufficientCriteria };
};

// ============================================================================
// DÉTECTION DOUBLONS (optimisé)
// ============================================================================

const findDuplicates = (people, progressCallback) => {
  const result = [];
  
  // Index O(1) pour accès rapide par ID
  const peopleById = new Map();
  people.forEach(p => peopleById.set(p.id, p));
  
  // Index phonétique + sexe + décennie
  const compositeIndex = new Map();
  
  people.forEach(person => {
    const fullName = person.names[0] || '';
    const parts = fullName.toLowerCase().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts[parts.length - 1]?.replace(/\//g, '') || '';
    const phoneticKey = soundex(firstName) + '-' + soundex(lastName);
    const sex = person.sex || '?';
    const yearMatch = person.birth?.match(/\d{4}/);
    const decade = yearMatch ? Math.floor(parseInt(yearMatch[0]) / 10) * 10 : 0;
    
    // Clé composite: phonétique + sexe + décennie (±10 ans)
    for (let d = decade - 10; d <= decade + 10; d += 10) {
      const key = `${phoneticKey}-${sex}-${d}`;
      if (!compositeIndex.has(key)) compositeIndex.set(key, []);
      compositeIndex.get(key).push(person);
    }
  });
  
  const compared = new Set();
  let processedCount = 0;
  const totalPeople = people.length;
  
  people.forEach((person, i) => {
    const fullName = person.names[0] || '';
    const parts = fullName.toLowerCase().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts[parts.length - 1]?.replace(/\//g, '') || '';
    const phoneticKey = soundex(firstName) + '-' + soundex(lastName);
    const sex = person.sex || '?';
    const yearMatch = person.birth?.match(/\d{4}/);
    const decade = yearMatch ? Math.floor(parseInt(yearMatch[0]) / 10) * 10 : 0;
    
    // Chercher les candidats avec la même clé composite
    const key = `${phoneticKey}-${sex}-${decade}`;
    const candidates = compositeIndex.get(key) || [];
    
    candidates.forEach(other => {
      if (person.id === other.id) return;
      const pairKey = person.id < other.id ? person.id + '-' + other.id : other.id + '-' + person.id;
      if (compared.has(pairKey)) return;
      compared.add(pairKey);
      
      // Élimination rapide par sexe
      if (person.sex && other.sex && person.sex !== other.sex) return;
      
      // Élimination rapide par année
      const y1 = person.birth?.match(/\d{4}/)?.[0];
      const y2 = other.birth?.match(/\d{4}/)?.[0];
      if (y1 && y2 && Math.abs(parseInt(y1) - parseInt(y2)) > 10) return;
      
      const sim = calculateSimilarity(person, other, peopleById);
      if (sim.rejected) return;
      if (sim.score >= 80) {
        result.push({ 
          person1: person, 
          person2: other, 
          similarity: Math.round(sim.score), 
          details: sim.details, 
          sufficientCriteria: sim.sufficientCriteria, 
          id: pairKey 
        });
      }
    });
    
    processedCount++;
    if (i % 200 === 0 && progressCallback) {
      progressCallback(30 + Math.round((processedCount / totalPeople) * 50));
    }
  });
  
  return result.sort((a, b) => b.similarity - a.similarity);
};

// ============================================================================
// DÉTECTION CLUSTERS
// ============================================================================

const detectClusters = (duplicates, allPeople) => {
  const graph = new Map(), visited = new Set(), foundClusters = [];
  
  duplicates.forEach(dup => {
    if (!graph.has(dup.person1.id)) graph.set(dup.person1.id, new Set());
    if (!graph.has(dup.person2.id)) graph.set(dup.person2.id, new Set());
    graph.get(dup.person1.id).add(dup.person2.id);
    graph.get(dup.person2.id).add(dup.person1.id);
  });
  
  const dfs = (nodeId, cluster) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    cluster.add(nodeId);
    (graph.get(nodeId) || new Set()).forEach(neighbor => dfs(neighbor, cluster));
  };
  
  const peopleById = new Map();
  allPeople.forEach(p => peopleById.set(p.id, p));
  
  graph.forEach((_, nodeId) => {
    if (!visited.has(nodeId)) {
      const cluster = new Set();
      dfs(nodeId, cluster);
      if (cluster.size > 2) {
        const clusterIds = Array.from(cluster);
        const clusterPeople = clusterIds.map(id => peopleById.get(id)).filter(p => p != null);
        if (clusterPeople.length > 2) {
          const clusterPairs = duplicates.filter(d => clusterIds.includes(d.person1.id) && clusterIds.includes(d.person2.id));
          const avgScore = clusterPairs.length > 0 ? Math.round(clusterPairs.reduce((sum, p) => sum + p.similarity, 0) / clusterPairs.length) : 0;
          foundClusters.push({ ids: clusterIds, size: clusterPeople.length, people: clusterPeople, avgScore, pairs: clusterPairs });
        }
      }
    }
  });
  
  return foundClusters.sort((a, b) => b.avgScore - a.avgScore);
};

// ============================================================================
// RAPPORT QUALITÉ
// ============================================================================

const generateQualityReport = (people, families, content) => {
  const versionMatch = content.match(/1 VERS ([\d.]+)/);
  const encodingMatch = content.match(/1 CHAR (\w+)/);
  const sourceMatch = content.match(/1 SOUR ([^\n]+)/);
  
  const withBirthDate = people.filter(p => p.birth).length;
  const withBirthPlace = people.filter(p => p.birthPlace).length;
  const withDeathDate = people.filter(p => p.death).length;
  const withParents = people.filter(p => p.parents.length > 0).length;
  const withSpouses = people.filter(p => p.spouses.length > 0).length;
  
  const customTags = [];
  const customMatch = content.match(/^\d+ _\w+/gm);
  if (customMatch) {
    const unique = [...new Set(customMatch.map(m => m.split(' ')[1]))];
    customTags.push(...unique.slice(0, 10));
  }
  
  return {
    version: versionMatch?.[1] || 'Non spécifiée',
    encoding: encodingMatch?.[1] || 'Non spécifié',
    source: sourceMatch?.[1]?.trim() || 'Non spécifiée',
    totalIndividuals: people.length,
    totalFamilies: families.size,
    completeness: {
      birthDate: { count: withBirthDate, pct: Math.round((withBirthDate / people.length) * 100) },
      birthPlace: { count: withBirthPlace, pct: Math.round((withBirthPlace / people.length) * 100) },
      deathDate: { count: withDeathDate, pct: Math.round((withDeathDate / people.length) * 100) },
      parents: { count: withParents, pct: Math.round((withParents / people.length) * 100) },
      spouses: { count: withSpouses, pct: Math.round((withSpouses / people.length) * 100) }
    },
    customTags
  };
};

// ============================================================================
// INCOHÉRENCES CHRONOLOGIQUES
// ============================================================================

const detectChronologicalIssues = (people, families) => {
  const errors = [];
  const warnings = [];
  
  const peopleById = new Map();
  people.forEach(p => peopleById.set(p.id, p));
  
  people.forEach(person => {
    const birthYear = extractYear(person.birth);
    const deathYear = extractYear(person.death);
    const baptismYear = extractYear(person.baptism);
    const burialYear = extractYear(person.burial);
    const name = person.names[0] || person.id;
    
    if (birthYear && deathYear && birthYear > deathYear) {
      errors.push({ type: 'BIRTH_AFTER_DEATH', personId: person.id, message: `${name} : naissance (${birthYear}) après décès (${deathYear})` });
    }
    
    if (birthYear && baptismYear && baptismYear < birthYear - 1) {
      errors.push({ type: 'BAPTISM_BEFORE_BIRTH', personId: person.id, message: `${name} : baptême (${baptismYear}) avant naissance (${birthYear})` });
    }
    
    if (deathYear && burialYear && burialYear < deathYear) {
      errors.push({ type: 'BURIAL_BEFORE_DEATH', personId: person.id, message: `${name} : inhumation (${burialYear}) avant décès (${deathYear})` });
    }
    
    if (birthYear && person.parents.length > 0) {
      person.parents.forEach(parentId => {
        const parent = peopleById.get(parentId);
        if (parent) {
          const parentBirth = extractYear(parent.birth);
          if (parentBirth && parentBirth >= birthYear) {
            errors.push({ type: 'PARENT_BORN_AFTER_CHILD', personId: person.id, message: `${name} : parent ${parent.names[0] || parentId} né en ${parentBirth}, enfant né en ${birthYear}` });
          }
          if (parentBirth && birthYear - parentBirth < 12) {
            warnings.push({ type: 'PARENT_TOO_YOUNG', personId: person.id, message: `${name} : parent ${parent.names[0] || parentId} avait ${birthYear - parentBirth} ans à la naissance` });
          }
          if (parentBirth && birthYear - parentBirth > 80) {
            warnings.push({ type: 'PARENT_TOO_OLD', personId: person.id, message: `${name} : parent ${parent.names[0] || parentId} avait ${birthYear - parentBirth} ans à la naissance` });
          }
        }
      });
    }
    
    if (birthYear && deathYear && deathYear - birthYear > 120) {
      warnings.push({ type: 'EXTREME_LONGEVITY', personId: person.id, message: `${name} : longévité de ${deathYear - birthYear} ans (${birthYear}-${deathYear})` });
    }
  });
  
  return { errors, warnings };
};

// ============================================================================
// VARIANTES DE LIEUX
// ============================================================================

const detectPlaceVariants = (people) => {
  const placeGroups = new Map();
  
  people.forEach(p => {
    [p.birthPlace, p.deathPlace, p.baptismPlace, p.burialPlace, p.residence].forEach(place => {
      if (place) {
        const normalized = normalizePlaceFull(place);
        if (!placeGroups.has(normalized)) placeGroups.set(normalized, new Set());
        placeGroups.get(normalized).add(place);
      }
    });
  });
  
  const variants = [];
  placeGroups.forEach((originals, normalized) => {
    if (originals.size > 1) {
      variants.push({ normalized, originals: Array.from(originals), count: originals.size });
    }
  });
  
  return variants.sort((a, b) => b.count - a.count);
};

// ============================================================================
// STATISTIQUES GÉNÉALOGIQUES
// ============================================================================

const calculateGenealogyStats = (people, families) => {
  const males = people.filter(p => p.sex === 'M').length;
  const females = people.filter(p => p.sex === 'F').length;
  const unknown = people.length - males - females;
  
  const birthDecades = {};
  const deathDecades = {};
  const ages = [];
  
  people.forEach(p => {
    const birthYear = extractYear(p.birth);
    const deathYear = extractYear(p.death);
    
    if (birthYear) {
      const decade = Math.floor(birthYear / 10) * 10;
      birthDecades[decade] = (birthDecades[decade] || 0) + 1;
    }
    if (deathYear) {
      const decade = Math.floor(deathYear / 10) * 10;
      deathDecades[decade] = (deathDecades[decade] || 0) + 1;
    }
    if (birthYear && deathYear && deathYear >= birthYear) {
      const age = deathYear - birthYear;
      if (age <= 120) ages.push(age);
    }
  });
  
  const avgAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : null;
  const minAge = ages.length > 0 ? Math.min(...ages) : null;
  const maxAge = ages.length > 0 ? Math.max(...ages) : null;
  const medianAge = ages.length > 0 ? ages.sort((a, b) => a - b)[Math.floor(ages.length / 2)] : null;
  
  const ageRanges = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '80+': 0 };
  ages.forEach(age => {
    if (age <= 20) ageRanges['0-20']++;
    else if (age <= 40) ageRanges['21-40']++;
    else if (age <= 60) ageRanges['41-60']++;
    else if (age <= 80) ageRanges['61-80']++;
    else ageRanges['80+']++;
  });
  
  let totalChildren = 0;
  let familiesWithChildren = 0;
  let maxChildren = 0;
  let maxChildrenFamily = null;
  let childrenDistribution = { '0': 0, '1-2': 0, '3-5': 0, '6-10': 0, '10+': 0 };
  
  families.forEach((fam, famId) => {
    const childCount = fam.children?.length || 0;
    totalChildren += childCount;
    if (childCount > 0) familiesWithChildren++;
    if (childCount > maxChildren) {
      maxChildren = childCount;
      maxChildrenFamily = famId;
    }
    if (childCount === 0) childrenDistribution['0']++;
    else if (childCount <= 2) childrenDistribution['1-2']++;
    else if (childCount <= 5) childrenDistribution['3-5']++;
    else if (childCount <= 10) childrenDistribution['6-10']++;
    else childrenDistribution['10+']++;
  });
  
  let fullDates = 0, partialDates = 0, noDates = 0;
  people.forEach(p => {
    if (p.birth) {
      if (/\d{1,2}\s+\w+\s+\d{4}/.test(p.birth)) fullDates++;
      else partialDates++;
    } else {
      noDates++;
    }
  });
  
  const surnames = {};
  people.forEach(p => {
    const name = p.names[0] || '';
    const match = name.match(/\/([^/]+)\//);
    if (match) {
      const surname = match[1].toUpperCase();
      surnames[surname] = (surnames[surname] || 0) + 1;
    }
  });
  const topSurnames = Object.entries(surnames).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => ({ name, count }));
  
  const maleFirstNames = {};
  const femaleFirstNames = {};
  people.forEach(p => {
    const name = p.names[0] || '';
    const firstName = name.split('/')[0].trim().split(' ')[0];
    if (firstName && firstName.length > 1) {
      const normalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      if (p.sex === 'M') maleFirstNames[normalizedName] = (maleFirstNames[normalizedName] || 0) + 1;
      else if (p.sex === 'F') femaleFirstNames[normalizedName] = (femaleFirstNames[normalizedName] || 0) + 1;
    }
  });
  const topMaleNames = Object.entries(maleFirstNames).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
  const topFemaleNames = Object.entries(femaleFirstNames).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
  
  const birthPlaces = {};
  people.forEach(p => {
    if (p.birthPlace) {
      const place = p.birthPlace.split(',')[0].trim();
      if (place) birthPlaces[place] = (birthPlaces[place] || 0) + 1;
    }
  });
  const topBirthPlaces = Object.entries(birthPlaces).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([place, count]) => ({ place, count }));
  
  const occupations = {};
  people.forEach(p => {
    if (p.occupation) {
      const occ = p.occupation.trim();
      if (occ) occupations[occ] = (occupations[occ] || 0) + 1;
    }
  });
  const topOccupations = Object.entries(occupations).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([occupation, count]) => ({ occupation, count }));
  
  const birthYears = people.map(p => extractYear(p.birth)).filter(Boolean);
  const deathYears = people.map(p => extractYear(p.death)).filter(Boolean);
  const minYear = birthYears.length ? Math.min(...birthYears) : null;
  const maxYear = Math.max(birthYears.length ? Math.max(...birthYears) : 0, deathYears.length ? Math.max(...deathYears) : 0) || null;
  const generationSpan = 25;
  const estimatedGenerations = minYear && maxYear ? Math.round((maxYear - minYear) / generationSpan) : null;
  const multipleMarriages = people.filter(p => p.spouses && p.spouses.length > 1).length;
  
  return {
    gender: { males, females, unknown, total: people.length },
    families: {
      total: families.size,
      withChildren: familiesWithChildren,
      withoutChildren: families.size - familiesWithChildren,
      avgChildren: familiesWithChildren ? (totalChildren / familiesWithChildren).toFixed(1) : 0,
      totalChildren,
      maxChildren,
      maxChildrenFamily,
      childrenDistribution
    },
    ages: { count: ages.length, avg: avgAge, min: minAge, max: maxAge, median: medianAge, distribution: ageRanges },
    dates: { full: fullDates, partial: partialDates, none: noDates, fullPct: people.length ? Math.round((fullDates / people.length) * 100) : 0 },
    period: { min: minYear, max: maxYear, span: minYear && maxYear ? maxYear - minYear : null, estimatedGenerations },
    birthDecades,
    deathDecades,
    topSurnames,
    topMaleNames,
    topFemaleNames,
    topBirthPlaces,
    topOccupations,
    uniqueSurnames: Object.keys(surnames).length,
    uniquePlaces: Object.keys(birthPlaces).length,
    multipleMarriages
  };
};

// ============================================================================
// RÉFÉRENCES ORPHELINES
// ============================================================================

const detectOrphanReferences = (people, families, content) => {
  const orphans = { famc: [], fams: [], husb: [], wife: [], chil: [], sour: [] };
  const peopleIds = new Set(people.map(p => p.id));
  const familyIds = new Set(families.keys());
  
  people.forEach(p => {
    if (p.familyAsChild && !familyIds.has(p.familyAsChild)) {
      orphans.famc.push({ personId: p.id, refId: p.familyAsChild });
    }
    p.familiesAsSpouse.forEach(famId => {
      if (!familyIds.has(famId)) {
        orphans.fams.push({ personId: p.id, refId: famId });
      }
    });
  });
  
  families.forEach((fam, famId) => {
    if (fam.husband && !peopleIds.has(fam.husband)) {
      orphans.husb.push({ familyId: famId, refId: fam.husband });
    }
    if (fam.wife && !peopleIds.has(fam.wife)) {
      orphans.wife.push({ familyId: famId, refId: fam.wife });
    }
    fam.children.forEach(childId => {
      if (!peopleIds.has(childId)) {
        orphans.chil.push({ familyId: famId, refId: childId });
      }
    });
  });
  
  const sourceRefs = content.match(/@S\d+@/g) || [];
  const sourceDefs = content.match(/^0 @S\d+@ SOUR/gm) || [];
  const definedSources = new Set(sourceDefs.map(s => s.match(/@S\d+@/)?.[0]).filter(Boolean));
  sourceRefs.forEach(ref => {
    if (!definedSources.has(ref) && !orphans.sour.some(o => o.refId === ref)) {
      orphans.sour.push({ refId: ref });
    }
  });
  
  return orphans;
};

// ============================================================================
// PERSONNES À SUPPRIMER
// ============================================================================

const detectToDeletePersons = (people, families) => {
  const result = [];
  const peopleById = new Map();
  people.forEach(p => peopleById.set(p.id, p));
  
  people.forEach(person => {
    const hasNoName = !person.names[0] || person.names[0].replace(/\//g, '').trim() === '';
    const hasNoEvents = !person.birth && !person.death && !person.baptism && !person.burial;
    const isIsolated = person.parents.length === 0 && person.spouses.length === 0 && person.children.length === 0;
    
    if (hasNoName || (hasNoEvents && isIsolated)) {
      result.push({
        person,
        reasons: [
          hasNoName ? 'Sans nom' : null,
          hasNoEvents ? 'Aucun événement' : null,
          isIsolated ? 'Isolé (sans famille)' : null
        ].filter(Boolean),
        parentIds: person.parents,
        spouseIds: person.spouses,
        childrenIds: person.children
      });
    }
  });
  
  return result;
};

// ============================================================================
// SUGGESTIONS IA
// ============================================================================

const generateAiSuggestions = (people) => {
  const suggestions = [];
  
  const incompletePeople = people.filter(p => {
    const hasName = p.names[0] && p.names[0].replace(/\//g, '').trim() !== '';
    const hasBirth = !!p.birth;
    const hasParents = p.parents.length > 0;
    return hasName && (!hasBirth || !hasParents);
  });
  
  incompletePeople.slice(0, 5).forEach(person => {
    const missing = [];
    if (!person.birth) missing.push('date de naissance');
    if (person.parents.length === 0) missing.push('parents');
    
    suggestions.push({
      person,
      type: 'incomplete',
      confidence: 70,
      reason: `Données manquantes: ${missing.join(', ')}`
    });
  });
  
  return suggestions;
};

// ============================================================================
// CONTRÔLES D'INTÉGRITÉ
// ============================================================================

const performIntegrityChecks = (people, families) => {
  const errors = [];
  const warnings = [];
  let isolatedCount = 0;
  let noNameCount = 0;
  
  people.forEach(person => {
    if (!person.names[0] || person.names[0].replace(/\//g, '').trim() === '') {
      noNameCount++;
      warnings.push(`Personne ${person.id} sans nom`);
    }
    
    if (person.parents.length === 0 && person.spouses.length === 0 && person.children.length === 0) {
      isolatedCount++;
    }
    
    const birthYear = extractYear(person.birth);
    const deathYear = extractYear(person.death);
    if (birthYear && deathYear && birthYear > deathYear) {
      errors.push(`${person.names[0] || person.id}: naissance après décès`);
    }
  });
  
  const completeness = Math.round((people.filter(p => p.birth && p.names[0]).length / people.length) * 100);
  
  return {
    errors,
    warnings,
    stats: {
      total: people.length,
      isolated: isolatedCount,
      noName: noNameCount,
      completeness
    }
  };
};

// ============================================================================
// GESTIONNAIRE DE MESSAGES
// ============================================================================

self.onmessage = function(e) {
  const { content } = e.data;
  
  try {
    self.postMessage({ type: 'progress', progress: 5, message: 'Démarrage...' });
    
    // Parsing GEDCOM
    self.postMessage({ type: 'progress', progress: 10, message: 'Parsing GEDCOM...' });
    const { people, families } = parseGedcom(content);
    
    self.postMessage({ type: 'progress', progress: 20, message: 'Analyse qualité...' });
    
    // Rapport qualité
    const qualityReport = generateQualityReport(people, families, content);
    self.postMessage({ type: 'progress', progress: 30, message: 'Incohérences...' });
    
    // Incohérences chronologiques
    const chronoIssues = detectChronologicalIssues(people, families);
    self.postMessage({ type: 'progress', progress: 40, message: 'Variantes lieux...' });
    
    // Variantes de lieux
    const placeVariants = detectPlaceVariants(people);
    self.postMessage({ type: 'progress', progress: 45, message: 'Statistiques...' });
    
    // Statistiques généalogiques
    const genealogyStats = calculateGenealogyStats(people, families);
    self.postMessage({ type: 'progress', progress: 50, message: 'Références...' });
    
    // Références orphelines
    const orphanRefs = detectOrphanReferences(people, families, content);
    self.postMessage({ type: 'progress', progress: 55, message: 'Détection doublons...' });
    
    // Détection doublons (le plus long)
    const duplicates = findDuplicates(people, (progress) => {
      self.postMessage({ type: 'progress', progress, message: 'Détection doublons...' });
    });
    
    self.postMessage({ type: 'progress', progress: 85, message: 'Clusters...' });
    
    // Clusters
    const clusters = detectClusters(duplicates, people);
    
    self.postMessage({ type: 'progress', progress: 90, message: 'Finalisation...' });
    
    // Personnes à supprimer
    const toDeletePersons = detectToDeletePersons(people, families);
    
    // Suggestions IA
    const smartSuggestions = generateAiSuggestions(people);
    
    // Intégrité
    const integrityReport = performIntegrityChecks(people, families);
    
    self.postMessage({ type: 'progress', progress: 95, message: 'Terminé!' });
    
    // Résultat final
    self.postMessage({
      type: 'complete',
      progress: 100,
      data: {
        people,
        families: Array.from(families.entries()), // Map -> Array pour transfert
        qualityReport,
        chronoIssues,
        placeVariants,
        genealogyStats,
        orphanRefs,
        duplicates,
        clusters,
        toDeletePersons,
        smartSuggestions,
        integrityReport
      }
    });
    
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message
    });
  }
};
