import React, { useState } from 'react';
import { Upload, Users, AlertCircle, Download, Trash2, CheckCircle, Sparkles, FileText, Brain, ChevronDown, ChevronUp, RefreshCw, Shield } from 'lucide-react';

const GedcomDuplicateMerger = () => {
  const [file, setFile] = useState(null);
  const [individuals, setIndividuals] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [selectedPairs, setSelectedPairs] = useState(new Set());
  const [step, setStep] = useState('upload');
  const [originalGedcom, setOriginalGedcom] = useState('');
  const [mergedIds, setMergedIds] = useState(new Map());
  const [validationResults, setValidationResults] = useState(null);
  const [previewPair, setPreviewPair] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScore, setFilterScore] = useState(80);
  const [clusters, setClusters] = useState([]);
  const [progress, setProgress] = useState(0);
  const [expandedClusters, setExpandedClusters] = useState(new Set());
  const [showChangelog, setShowChangelog] = useState(false);
  const [activeTab, setActiveTab] = useState('clusters');
  const [clusterScoreFilter, setClusterScoreFilter] = useState(80);
  const [selectedClusters, setSelectedClusters] = useState(new Set());
  const [toDeletePersons, setToDeletePersons] = useState([]);
  const [selectedToDelete, setSelectedToDelete] = useState(new Set());
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const [integrityReport, setIntegrityReport] = useState(null);
  const [familiesData, setFamiliesData] = useState(new Map());
  const [showIntegrityModal, setShowIntegrityModal] = useState(false);

  const VERSION = '1.9.4';

  const CHANGELOG = [
    {
      version: '1.9.4',
      date: '30 décembre 2025',
      tag: 'ACTUELLE',
      color: 'green',
      title: 'Affichage complet + Contrôle intégrité avancé',
      items: [
        'Affichage détails complet dans Suggestions IA (régression v1.7.2 corrigée)',
        'Contrôle d\'intégrité 8 types restauré (v1.6.1)',
        'Boutons sélection dynamiques selon le filtre %',
        'Bouton Recommencer déplacé dans le header'
      ]
    },
    {
      version: '1.9.3',
      date: '28 décembre 2025',
      tag: null,
      color: 'blue',
      title: 'Onglet À supprimer + Bouton flottant',
      items: [
        'Renommage onglet Isolés → À supprimer avec filtrage strict',
        'Bouton flottant pour actions rapides Fusionner/Supprimer',
        'Tableau clusters avec détails complets',
        'Actions distinctes Fusionner vs Supprimer'
      ]
    },
    {
      version: '1.9.2',
      date: '28 décembre 2025',
      tag: null,
      color: 'indigo',
      title: 'Algorithme anti-faux-positifs',
      items: [
        'Critères suffisants obligatoires au-delà du nom',
        'Rejet des homonymes sans données confirmantes',
        'Tracking des critères validants par paire'
      ]
    },
    {
      version: '1.8.6',
      date: '16 décembre 2025',
      tag: null,
      color: 'purple',
      title: 'Corrections GEDCOM et génération HEAD/TRLR',
      items: [
        'Gestion balises CONT/CONC multi-lignes',
        'Génération automatique HEAD/TRLR',
        'Compatibilité GEDCOM 5.5.1'
      ]
    },
    {
      version: '1.0.0',
      date: '1 décembre 2025',
      tag: 'INITIALE',
      color: 'gray',
      title: 'Version initiale',
      items: [
        'Parseur GEDCOM complet',
        'Détection intelligente avec Soundex français',
        'Système de scoring hybride 9 critères',
        'Fusion sécurisée sans perte de données'
      ]
    }
  ];

  const NAME_VARIANTS = {
    catherine: ['katherine', 'cathrine', 'katrine', 'caterine'],
    jean: ['jehan', 'johan', 'joan'],
    marie: ['maria', 'mary', 'mari'],
    pierre: ['peter', 'pedro', 'piere'],
    jacques: ['james', 'jacob', 'jacque'],
    françois: ['francis', 'francois', 'fransois'],
    louis: ['lewis', 'luis', 'loui'],
    anne: ['ann', 'anna', 'ane'],
    marguerite: ['margaret', 'margueritte', 'margarite'],
    nicolas: ['nicholas', 'nicola', 'nikolas'],
    guillaume: ['william', 'guilaume', 'guillem'],
    antoine: ['anthony', 'antoin', 'antonio'],
    michel: ['michael', 'mickael', 'miguel'],
    philippe: ['philip', 'filippe', 'philipe'],
    charles: ['karl', 'carlo', 'charle'],
    henri: ['henry', 'henrique', 'enrique'],
    joseph: ['josef', 'giuseppe', 'jose'],
    paul: ['paolo', 'pablo', 'paulus'],
    étienne: ['estienne', 'stephen', 'esteban'],
    claude: ['claudio', 'claudius'],
    jeanne: ['johanna', 'jane', 'juana'],
    françoise: ['francisca', 'frances'],
    madeleine: ['magdalena', 'madeline'],
    elisabeth: ['elizabeth', 'isabelle', 'isabel'],
    thérèse: ['theresa', 'teresa'],
    louise: ['luisa', 'louisa'],
    suzanne: ['susanna', 'susan'],
    hélène: ['helena', 'helen', 'elena'],
    victoire: ['victoria', 'vittoria'],
    rose: ['rosa', 'rosalie'],
    germaine: ['germana'],
    léon: ['leon', 'leone', 'leo'],
    augustin: ['augustine', 'agustin'],
    marcel: ['marcello', 'marcelo'],
    gabriel: ['gabriele'],
    émile: ['emilio', 'emil'],
    lucien: ['luciano', 'lucianus'],
    fernand: ['fernando', 'ferdinand'],
    raymond: ['raimundo', 'raimond'],
    maurice: ['mauricio', 'moritz']
  };

  const normalizeFirstName = (name) => {
    const lower = name.toLowerCase().trim();
    for (const [canonical, variants] of Object.entries(NAME_VARIANTS)) {
      if (lower === canonical || variants.includes(lower)) return canonical;
    }
    return lower;
  };

  const soundex = (str) => {
    if (!str) return '';
    const s = str.toUpperCase().replace(/[^A-Z]/g, '');
    if (!s) return '';
    const codes = { B:1, F:1, P:1, V:1, C:2, G:2, J:2, K:2, Q:2, S:2, X:2, Z:2, D:3, T:3, L:4, M:5, N:5, R:6 };
    let result = s[0];
    let lastCode = codes[s[0]] || 0;
    for (let i = 1; i < s.length && result.length < 4; i++) {
      const code = codes[s[i]] || 0;
      if (code && code !== lastCode) { result += code; lastCode = code; }
      else if (!code) lastCode = 0;
    }
    return result.padEnd(4, '0');
  };

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
      
      // Gestion CONT/CONC (v1.8.6)
      if (trimmed.startsWith('2 CONT ') || trimmed.startsWith('3 CONT ')) {
        const value = trimmed.replace(/^\d+ CONT /, '');
        if (currentPerson && lastFieldType) {
          if (lastFieldType === 'NAME' && currentPerson.names.length > 0) {
            currentPerson.names[currentPerson.names.length - 1] += '\n' + value;
          } else if (lastFieldType === 'BIRT_PLAC') {
            currentPerson.birthPlace += '\n' + value;
          } else if (lastFieldType === 'DEAT_PLAC') {
            currentPerson.deathPlace += '\n' + value;
          }
        }
        return;
      }
      if (trimmed.startsWith('2 CONC ') || trimmed.startsWith('3 CONC ')) {
        const value = trimmed.replace(/^\d+ CONC /, '');
        if (currentPerson && lastFieldType) {
          if (lastFieldType === 'NAME' && currentPerson.names.length > 0) {
            currentPerson.names[currentPerson.names.length - 1] += value;
          } else if (lastFieldType === 'BIRT_PLAC') {
            currentPerson.birthPlace += value;
          } else if (lastFieldType === 'DEAT_PLAC') {
            currentPerson.deathPlace += value;
          }
        }
        return;
      }
      
      if (trimmed.startsWith('0') && trimmed.includes('INDI')) {
        if (currentPerson) people.push(currentPerson);
        const match = trimmed.match(/@([^@]+)@/);
        const id = match ? match[1] : trimmed.split(' ')[1];
        currentPerson = { 
          id, names: [], birth: '', birthPlace: '', death: '', deathPlace: '',
          sex: '', parents: [], spouses: [], familyAsChild: null, 
          familiesAsSpouse: [], occupation: '', religion: ''
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
      else if (trimmed.startsWith('0')) {
        if (currentPerson) { people.push(currentPerson); currentPerson = null; }
        currentFamily = null;
        currentEvent = null;
      }
      else if (currentPerson) {
        if (trimmed.startsWith('1 NAME ')) {
          const name = trimmed.substring(7).replace(/\//g, '').trim();
          currentPerson.names.push(name);
          lastFieldType = 'NAME';
        }
        else if (trimmed.startsWith('1 SEX ')) currentPerson.sex = trimmed.substring(6).trim();
        else if (trimmed.startsWith('1 BIRT')) { currentEvent = 'BIRT'; lastFieldType = 'BIRT'; }
        else if (trimmed.startsWith('1 DEAT')) { currentEvent = 'DEAT'; lastFieldType = 'DEAT'; }
        else if (trimmed.startsWith('1 OCCU ')) currentPerson.occupation = trimmed.substring(7).trim();
        else if (trimmed.startsWith('1 RELI ')) currentPerson.religion = trimmed.substring(7).trim();
        else if (trimmed.startsWith('1 FAMC ')) {
          const famMatch = trimmed.match(/@([^@]+)@/);
          if (famMatch) currentPerson.familyAsChild = famMatch[1];
        }
        else if (trimmed.startsWith('1 FAMS ')) {
          const famMatch = trimmed.match(/@([^@]+)@/);
          if (famMatch) currentPerson.familiesAsSpouse.push(famMatch[1]);
        }
        else if (trimmed.startsWith('2 DATE ') && currentEvent) {
          const date = trimmed.substring(7).trim();
          if (currentEvent === 'BIRT') currentPerson.birth = date;
          else if (currentEvent === 'DEAT') currentPerson.death = date;
        }
        else if (trimmed.startsWith('2 PLAC ') && currentEvent) {
          let place = trimmed.substring(7).trim();
          // Normalisation basique des lieux (retrait codes INSEE)
          place = place.replace(/^\d{5}\s+/, '');
          if (currentEvent === 'BIRT') { currentPerson.birthPlace = place; lastFieldType = 'BIRT_PLAC'; }
          else if (currentEvent === 'DEAT') { currentPerson.deathPlace = place; lastFieldType = 'DEAT_PLAC'; }
        }
      }
      else if (currentFamily) {
        if (trimmed.startsWith('1 HUSB ')) {
          const match = trimmed.match(/@([^@]+)@/);
          if (match) currentFamily.husband = match[1];
        }
        else if (trimmed.startsWith('1 WIFE ')) {
          const match = trimmed.match(/@([^@]+)@/);
          if (match) currentFamily.wife = match[1];
        }
        else if (trimmed.startsWith('1 CHIL ')) {
          const match = trimmed.match(/@([^@]+)@/);
          if (match) currentFamily.children.push(match[1]);
        }
      }
    });
    
    if (currentPerson) people.push(currentPerson);

    // Résolution des relations
    families.forEach((family, familyId) => {
      family.children.forEach(childId => {
        const child = people.find(p => p.id === childId);
        if (child) {
          if (family.husband) child.parents.push(family.husband);
          if (family.wife) child.parents.push(family.wife);
        }
      });
      
      if (family.husband && family.wife) {
        const husband = people.find(p => p.id === family.husband);
        const wife = people.find(p => p.id === family.wife);
        if (husband) husband.spouses.push(family.wife);
        if (wife) wife.spouses.push(family.husband);
      }
    });

    setFamiliesData(families);
    return people;
  };

  const calculateSimilarity = (person1, person2) => {
    let score = 0;
    let maxScore = 0;
    const details = [];
    const sufficientCriteria = [];

    // Critère éliminatoire : sexe différent
    if (person1.sex && person2.sex && person1.sex !== person2.sex) {
      return { score: 0, details: ['Sexe différent: éliminatoire'], sufficientCriteria: [] };
    }

    // Nom (30 points) - NÉCESSAIRE mais PAS SUFFISANT
    if (person1.names[0] && person2.names[0]) {
      maxScore += 30;
      const name1Parts = person1.names[0].toLowerCase().split(/\s+/);
      const name2Parts = person2.names[0].toLowerCase().split(/\s+/);
      const normalizedName1 = name1Parts.map(normalizeFirstName);
      const normalizedName2 = name2Parts.map(normalizeFirstName);
      
      const soundex1 = name1Parts.map(soundex).join('');
      const soundex2 = name2Parts.map(soundex).join('');
      
      if (normalizedName1.join(' ') === normalizedName2.join(' ')) {
        score += 30;
        details.push('Nom identique: +30');
      } else if (soundex1 === soundex2) {
        score += 25;
        details.push('Nom phonétiquement similaire: +25');
      } else {
        const commonParts = normalizedName1.filter(p => normalizedName2.includes(p));
        if (commonParts.length > 0) {
          const partScore = Math.round((commonParts.length / Math.max(name1Parts.length, name2Parts.length)) * 20);
          score += partScore;
          details.push(`Parties communes (${commonParts.length}): +${partScore}`);
        }
      }
    }

    // Date de naissance (25 points) - SUFFISANT
    if (person1.birth && person2.birth) {
      maxScore += 25;
      const year1 = person1.birth.match(/\d{4}/)?.[0];
      const year2 = person2.birth.match(/\d{4}/)?.[0];
      if (year1 && year2) {
        const diff = Math.abs(parseInt(year1) - parseInt(year2));
        if (diff === 0) {
          score += 25;
          details.push('Année naissance identique: +25');
          sufficientCriteria.push('annee_naissance');
        } else if (diff <= 2) {
          score += 15;
          details.push(`Année naissance proche (±${diff}): +15`);
          sufficientCriteria.push('annee_naissance_proche');
        }
      }
      if (person1.birth === person2.birth && person1.birth.length > 4) {
        score += 5;
        details.push('Date naissance exacte: +5 bonus');
        sufficientCriteria.push('date_naissance_exacte');
      }
    }

    // Sexe compatible (15 points)
    if (person1.sex && person2.sex) {
      maxScore += 15;
      if (person1.sex === person2.sex) {
        score += 15;
        details.push('Sexe identique: +15');
      }
    }

    // Parents communs (20 points) - SUFFISANT
    if (person1.parents.length > 0 && person2.parents.length > 0) {
      maxScore += 20;
      const commonParents = person1.parents.filter(p => person2.parents.includes(p));
      if (commonParents.length > 0) {
        const parentScore = Math.min(20, commonParents.length * 10);
        score += parentScore;
        details.push(`Parents communs (${commonParents.length}): +${parentScore}`);
        sufficientCriteria.push('parents_communs');
      }
    }

    // Fratrie commune (15 points) - SUFFISANT
    const siblings1 = new Set();
    const siblings2 = new Set();
    individuals.forEach(p => {
      if (p.id !== person1.id && p.parents.some(par => person1.parents.includes(par))) siblings1.add(p.id);
      if (p.id !== person2.id && p.parents.some(par => person2.parents.includes(par))) siblings2.add(p.id);
    });
    if (siblings1.size > 0 && siblings2.size > 0) {
      maxScore += 15;
      const commonSiblings = [...siblings1].filter(s => siblings2.has(s));
      if (commonSiblings.length > 0) {
        score += 15;
        details.push(`Fratrie commune (${commonSiblings.length}): +15`);
        sufficientCriteria.push('fratrie_commune');
      }
    }

    // Lieu de naissance (10 points) - SUFFISANT
    if (person1.birthPlace && person2.birthPlace) {
      maxScore += 10;
      const place1 = person1.birthPlace.toLowerCase().replace(/[,\s]+/g, ' ').trim();
      const place2 = person2.birthPlace.toLowerCase().replace(/[,\s]+/g, ' ').trim();
      if (place1 === place2) {
        score += 10;
        details.push('Lieu naissance identique: +10');
        sufficientCriteria.push('lieu_naissance');
      } else if (place1.includes(place2) || place2.includes(place1)) {
        score += 6;
        details.push('Lieu naissance similaire: +6');
        sufficientCriteria.push('lieu_naissance_similaire');
      }
    }

    // Conjoints communs (8 points) - SUFFISANT
    if (person1.spouses.length > 0 && person2.spouses.length > 0) {
      maxScore += 8;
      const commonSpouses = person1.spouses.filter(s => person2.spouses.includes(s));
      if (commonSpouses.length > 0) {
        score += 8;
        details.push(`Conjoints communs (${commonSpouses.length}): +8`);
        sufficientCriteria.push('conjoints_communs');
      }
    }

    // Date de décès (15 points) - SUFFISANT
    if (person1.death && person2.death) {
      maxScore += 15;
      const year1 = person1.death.match(/\d{4}/)?.[0];
      const year2 = person2.death.match(/\d{4}/)?.[0];
      if (year1 && year2 && Math.abs(parseInt(year1) - parseInt(year2)) <= 2) {
        score += 15;
        details.push('Année décès proche: +15');
        sufficientCriteria.push('annee_deces');
      }
    }

    // Profession (5 points) - SUFFISANT
    if (person1.occupation && person2.occupation) {
      maxScore += 5;
      if (person1.occupation.toLowerCase() === person2.occupation.toLowerCase()) {
        score += 5;
        details.push('Profession identique: +5');
        sufficientCriteria.push('profession');
      }
    }

    // Score final normalisé
    const finalScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    // RÈGLE ANTI-FAUX-POSITIFS (v1.9.2): Au moins 1 critère suffisant requis
    if (sufficientCriteria.length === 0 && finalScore > 0) {
      return { score: 0, details: [...details, '⚠️ REJETÉ: Aucun critère suffisant'], sufficientCriteria: [] };
    }

    return { score: finalScore, details, sufficientCriteria };
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // CONTRÔLE D'INTÉGRITÉ AVANCÉ - 8 TYPES (v1.6.1 restauré)
  // ═══════════════════════════════════════════════════════════════════════════════
  const performIntegrityChecks = (people, families) => {
    const errors = [];
    const warnings = [];
    let completenessScore = 0;
    let totalPoints = 0;

    // 1. Vérification des liens familiaux bidirectionnels
    families.forEach((family, familyId) => {
      // Vérifier que les enfants référencent bien cette famille
      family.children.forEach(childId => {
        const child = people.find(p => p.id === childId);
        if (child && child.familyAsChild !== familyId) {
          warnings.push({
            type: 'unidirectional_link',
            severity: 'warning',
            personId: childId,
            message: `${child?.names[0] || childId}: Lien enfant→famille non bidirectionnel`
          });
        }
      });
      
      // Vérifier que les conjoints référencent cette famille
      [family.husband, family.wife].forEach(spouseId => {
        if (spouseId) {
          const spouse = people.find(p => p.id === spouseId);
          if (spouse && !spouse.familiesAsSpouse.includes(familyId)) {
            warnings.push({
              type: 'unidirectional_link',
              severity: 'warning',
              personId: spouseId,
              message: `${spouse?.names[0] || spouseId}: Lien conjoint→famille non bidirectionnel`
            });
          }
        }
      });
    });

    // 2. Détection des dates incohérentes
    people.forEach(person => {
      const birthYear = person.birth?.match(/\d{4}/)?.[0];
      const deathYear = person.death?.match(/\d{4}/)?.[0];
      
      // Naissance après décès
      if (birthYear && deathYear && parseInt(birthYear) > parseInt(deathYear)) {
        errors.push({
          type: 'birth_after_death',
          severity: 'critical',
          personId: person.id,
          message: `${person.names[0] || person.id}: Naissance (${birthYear}) après décès (${deathYear})`
        });
      }
      
      // Parent né après enfant
      person.parents.forEach(parentId => {
        const parent = people.find(p => p.id === parentId);
        if (parent) {
          const parentBirth = parent.birth?.match(/\d{4}/)?.[0];
          if (parentBirth && birthYear && parseInt(parentBirth) > parseInt(birthYear)) {
            errors.push({
              type: 'parent_after_child',
              severity: 'critical',
              personId: person.id,
              message: `${person.names[0] || person.id}: Parent ${parent.names[0]} né après enfant`
            });
          }
          // Écart d'âge parent-enfant suspect (< 12 ans ou > 80 ans)
          if (parentBirth && birthYear) {
            const ageDiff = parseInt(birthYear) - parseInt(parentBirth);
            if (ageDiff < 12) {
              warnings.push({
                type: 'age_gap_suspect',
                severity: 'warning',
                personId: person.id,
                message: `${person.names[0] || person.id}: Parent ${parent.names[0]} avait ${ageDiff} ans à la naissance`
              });
            } else if (ageDiff > 80) {
              warnings.push({
                type: 'age_gap_suspect',
                severity: 'warning',
                personId: person.id,
                message: `${person.names[0] || person.id}: Parent ${parent.names[0]} aurait eu ${ageDiff} ans`
              });
            }
          }
        }
      });
    });

    // 3. Détection des boucles généalogiques (personne = propre ancêtre)
    const detectLoop = (personId, visited = new Set(), path = []) => {
      if (visited.has(personId)) {
        if (path.includes(personId)) {
          return { hasLoop: true, personId, path };
        }
        return { hasLoop: false };
      }
      visited.add(personId);
      path.push(personId);
      
      const person = people.find(p => p.id === personId);
      if (person) {
        for (const parentId of person.parents) {
          const result = detectLoop(parentId, visited, [...path]);
          if (result.hasLoop) return result;
        }
      }
      return { hasLoop: false };
    };

    // Échantillonnage intelligent (100 premières personnes)
    people.slice(0, 100).forEach(person => {
      const result = detectLoop(person.id);
      if (result.hasLoop) {
        errors.push({
          type: 'genealogical_loop',
          severity: 'critical',
          personId: person.id,
          message: `${person.names[0] || person.id}: Boucle généalogique détectée (ancêtre de soi-même)`
        });
      }
    });

    // 4. Vérification structure GEDCOM (niveaux)
    const gedcomLines = originalGedcom.split('\n');
    let previousLevel = 0;
    gedcomLines.forEach((line, lineNum) => {
      const match = line.trim().match(/^(\d+)/);
      if (match) {
        const level = parseInt(match[1]);
        if (level > previousLevel + 1) {
          warnings.push({
            type: 'structure_error',
            severity: 'warning',
            line: lineNum + 1,
            message: `Ligne ${lineNum + 1}: Saut de niveau GEDCOM (${previousLevel} → ${level})`
          });
        }
        previousLevel = level;
      }
    });

    // 5. Détection des références orphelines
    const allIds = new Set(people.map(p => p.id));
    families.forEach(f => allIds.add(f.id));
    
    const refPattern = /@([^@]+)@/g;
    let match;
    gedcomLines.forEach((line, lineNum) => {
      while ((match = refPattern.exec(line)) !== null) {
        const refId = match[1];
        if (!allIds.has(refId) && !line.includes('0 @')) {
          errors.push({
            type: 'orphan_reference',
            severity: 'critical',
            line: lineNum + 1,
            message: `Ligne ${lineNum + 1}: Référence orpheline @${refId}@`
          });
        }
      }
    });

    // 6. Détection des IDs dupliqués
    const idCounts = new Map();
    people.forEach(p => idCounts.set(p.id, (idCounts.get(p.id) || 0) + 1));
    idCounts.forEach((count, id) => {
      if (count > 1) {
        errors.push({
          type: 'duplicate_id',
          severity: 'critical',
          personId: id,
          message: `ID @${id}@ utilisé ${count} fois`
        });
      }
    });

    // 7. Identification des personnes isolées
    const isolatedCount = people.filter(p => 
      p.parents.length === 0 && 
      p.spouses.length === 0 && 
      p.familiesAsSpouse.length === 0
    ).length;

    // 8. Score de complétude global
    people.forEach(person => {
      if (person.birth) { completenessScore += 2; totalPoints += 2; } else { totalPoints += 2; }
      if (person.death) { completenessScore += 2; totalPoints += 2; } else { totalPoints += 2; }
      if (person.parents.length > 0) { completenessScore += 3; totalPoints += 3; } else { totalPoints += 3; }
      if (person.spouses.length > 0) { completenessScore += 2; totalPoints += 2; } else { totalPoints += 2; }
      if (person.familiesAsSpouse.length > 0) { completenessScore += 1; totalPoints += 1; } else { totalPoints += 1; }
    });

    const completenessPercent = totalPoints > 0 ? Math.round((completenessScore / totalPoints) * 100) : 0;

    return {
      errors,
      warnings,
      stats: {
        totalIndividuals: people.length,
        totalFamilies: families.size,
        isolatedCount,
        completenessPercent,
        errorCount: errors.length,
        warningCount: warnings.length
      }
    };
  };

  const findDuplicates = (people) => {
    const result = [];
    const phoneticIndex = new Map();
    const yearIndex = new Map();
    const parentIndex = new Map();
    let skipped = 0;
    let totalComparisons = 0;

    // Construction des index
    people.forEach(person => {
      if (person.names[0]) {
        const parts = person.names[0].toLowerCase().split(/\s+/);
        const normalizedParts = parts.map(normalizeFirstName);
        const key = normalizedParts.map(soundex).join('-');
        if (!phoneticIndex.has(key)) phoneticIndex.set(key, []);
        phoneticIndex.get(key).push(person);
      }

      const year = person.birth?.match(/\d{4}/)?.[0];
      if (year) {
        [-2, -1, 0, 1, 2].forEach(offset => {
          const y = String(parseInt(year) + offset);
          if (!yearIndex.has(y)) yearIndex.set(y, new Set());
          yearIndex.get(y).add(person.id);
        });
      }

      person.parents.forEach(parentId => {
        if (!parentIndex.has(parentId)) parentIndex.set(parentId, []);
        parentIndex.get(parentId).push(person);
      });
    });

    // Comparaison optimisée
    for (let i = 0; i < people.length; i++) {
      const person1 = people[i];
      
      for (let j = i + 1; j < people.length; j++) {
        const person2 = people[j];
        totalComparisons++;
        
        const pairKey = [person1.id, person2.id].sort().join('-');
        
        // Quick checks
        const quickCheck = () => {
          if (person1.sex && person2.sex && person1.sex !== person2.sex) {
            skipped++;
            return false;
          }
          
          const y1 = person1.birth?.match(/\d{4}/)?.[0];
          const y2 = person2.birth?.match(/\d{4}/)?.[0];
          if (y1 && y2 && Math.abs(parseInt(y1) - parseInt(y2)) > 5) {
            skipped++;
            return false;
          }
          
          return true;
        };
        
        if (!quickCheck()) continue;
        
        const sim = calculateSimilarity(person1, person2);
        if (sim.score >= 80) {
          result.push({
            person1,
            person2,
            similarity: Math.round(sim.score),
            details: sim.details,
            sufficientCriteria: sim.sufficientCriteria,
            id: pairKey
          });
        }
      }
      
      if (i % 100 === 0) {
        const pct = Math.round((i / people.length) * 100);
        setProgress(30 + pct * 0.65);
      }
    }
    
    console.log(`Optimisation: ${totalComparisons} comparaisons (${skipped} skipped)`);
    
    const sorted = result.sort((a, b) => b.similarity - a.similarity);
    detectClusters(sorted, people);
    
    return sorted;
  };

  const detectClusters = (duplicates, allPeople) => {
    const graph = new Map();
    const visited = new Set();
    const foundClusters = [];
    
    duplicates.forEach(dup => {
      const id1 = dup.person1.id;
      const id2 = dup.person2.id;
      
      if (!graph.has(id1)) graph.set(id1, new Set());
      if (!graph.has(id2)) graph.set(id2, new Set());
      
      graph.get(id1).add(id2);
      graph.get(id2).add(id1);
    });
    
    const dfs = (nodeId, cluster) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      cluster.add(nodeId);
      
      const neighbors = graph.get(nodeId) || new Set();
      neighbors.forEach(neighbor => dfs(neighbor, cluster));
    };
    
    graph.forEach((_, nodeId) => {
      if (!visited.has(nodeId)) {
        const cluster = new Set();
        dfs(nodeId, cluster);
        if (cluster.size > 2) {
          const clusterIds = Array.from(cluster);
          const clusterPeople = clusterIds
            .map(id => allPeople.find(p => p.id === id))
            .filter(p => p != null);
          
          if (clusterPeople.length > 2) {
            // Calculer le score moyen du cluster
            const clusterPairs = duplicates.filter(d => 
              clusterIds.includes(d.person1.id) && clusterIds.includes(d.person2.id)
            );
            const avgScore = clusterPairs.length > 0
              ? Math.round(clusterPairs.reduce((sum, p) => sum + p.similarity, 0) / clusterPairs.length)
              : 0;

            foundClusters.push({
              ids: clusterIds,
              size: clusterPeople.length,
              people: clusterPeople,
              avgScore
            });
          }
        }
      }
    });
    
    console.log('Clusters détectés:', foundClusters.length, foundClusters);
    setClusters(foundClusters);
  };

  const detectToDeletePersons = (people) => {
    // Personnes totalement isolées (sans parents, sans enfants, sans conjoint) + personnes sans nom
    const toDelete = people.filter(p => {
      const hasNoName = !p.names[0] || p.names[0].trim() === '' || p.names[0].trim() === '?';
      const isTotallyIsolated = p.parents.length === 0 && 
                                p.spouses.length === 0 && 
                                p.familiesAsSpouse.length === 0;
      
      // On prend soit les totalement isolés, soit ceux sans nom
      return hasNoName || isTotallyIsolated;
    });
    
    setToDeletePersons(toDelete);
  };

  const generateSmartSuggestions = (people, dups) => {
    const suggestions = [];
    const nameGroups = new Map();
    
    people.forEach(person => {
      if (person.names[0]) {
        const nameParts = person.names[0].toLowerCase().split(/\s+/);
        const lastName = nameParts[nameParts.length - 1];
        if (!nameGroups.has(lastName)) nameGroups.set(lastName, []);
        nameGroups.get(lastName).push(person);
      }
    });
    
    nameGroups.forEach((group, lastName) => {
      if (group.length >= 3) {
        const periodGroups = new Map();
        group.forEach(person => {
          const year = person.birth?.match(/\d{4}/)?.[0];
          if (year) {
            const decade = Math.floor(parseInt(year) / 10) * 10;
            if (!periodGroups.has(decade)) periodGroups.set(decade, []);
            periodGroups.get(decade).push(person);
          }
        });
        
        periodGroups.forEach((periodGroup, decade) => {
          if (periodGroup.length >= 3) {
            const confidence = Math.min(95, 60 + periodGroup.length * 5);
            suggestions.push({
              type: 'name_period_cluster',
              lastName,
              decade,
              people: periodGroup,
              confidence,
              reason: `${periodGroup.length} personnes nommées "${lastName}" nées dans les années ${decade}`
            });
          }
        });
      }
    });
    
    setSmartSuggestions(suggestions.sort((a, b) => b.confidence - a.confidence));
  };

  const selectCluster = (clusterIds) => {
    const newSelected = new Set(selectedPairs);
    duplicates.forEach(dup => {
      if (clusterIds.includes(dup.person1.id) && clusterIds.includes(dup.person2.id)) {
        newSelected.add(dup.id);
      }
    });
    setSelectedPairs(newSelected);
  };

  const toggleClusterExpand = (clusterIndex) => {
    const newExpanded = new Set(expandedClusters);
    if (newExpanded.has(clusterIndex)) newExpanded.delete(clusterIndex);
    else newExpanded.add(clusterIndex);
    setExpandedClusters(newExpanded);
  };

  const calculateDataQuality = (person) => {
    let score = 0;
    if (person.names[0]?.length > 5) score += 10;
    if (person.birth) score += 8;
    if (person.death) score += 6;
    if (person.sex) score += 4;
    if (person.birthPlace) score += 7;
    if (person.deathPlace) score += 5;
    score += person.parents.length * 6;
    score += person.spouses.length * 5;
    if (person.occupation) score += 4;
    if (person.familyAsChild) score += 3;
    score += person.familiesAsSpouse.length * 3;
    return score;
  };

  const openPreview = (pair) => setPreviewPair(pair);
  const closePreview = () => setPreviewPair(null);

  const togglePairSelection = (pairId) => {
    const newSelected = new Set(selectedPairs);
    if (newSelected.has(pairId)) newSelected.delete(pairId);
    else newSelected.add(pairId);
    setSelectedPairs(newSelected);
  };

  // v1.9.4: Sélection dynamique selon le filtre actuel
  const selectHighConfidence = () => {
    const highConfidencePairs = duplicates.filter(pair => pair.similarity >= filterScore).map(pair => pair.id);
    setSelectedPairs(new Set(highConfidencePairs));
  };

  const autoSelectHighConfidenceClusters = () => {
    const newSelected = new Set();
    clusters.forEach((cluster, idx) => {
      if (cluster.avgScore >= clusterScoreFilter) newSelected.add(idx);
    });
    setSelectedClusters(newSelected);
  };

  const getClusterAverageScore = (cluster) => cluster.avgScore || 0;
  const getFilteredClusters = () => clusters.filter(cluster => getClusterAverageScore(cluster) >= clusterScoreFilter);

  const getPersonName = (personId) => {
    const person = individuals.find(p => p.id === personId);
    return person?.names[0] || personId;
  };

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setProgress(10);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProgress(20);
        const content = e.target.result;
        setOriginalGedcom(content);
        const parsed = parseGedcom(content);
        setProgress(30);
        setIndividuals(parsed);
        
        // Exécuter le contrôle d'intégrité
        const integrityResults = performIntegrityChecks(parsed, familiesData);
        setIntegrityReport(integrityResults);
        
        const dups = findDuplicates(parsed);
        setDuplicates(dups);
        detectToDeletePersons(parsed);
        generateSmartSuggestions(parsed, dups);
        setProgress(100);
        setTimeout(() => setStep('review'), 500);
      };
      reader.readAsText(uploadedFile);
    }
  };

  const mergeDuplicates = () => {
    const mergeMap = new Map();
    
    selectedPairs.forEach(pairId => {
      const pair = duplicates.find(d => d.id === pairId);
      if (pair) {
        const quality1 = calculateDataQuality(pair.person1);
        const quality2 = calculateDataQuality(pair.person2);
        
        if (quality1 >= quality2) {
          mergeMap.set(pair.person2.id, pair.person1.id);
        } else {
          mergeMap.set(pair.person1.id, pair.person2.id);
        }
      }
    });
    
    setMergedIds(mergeMap);
    const remaining = individuals.length - mergeMap.size - selectedToDelete.size;
    setValidationResults({
      mergedCount: mergeMap.size,
      deletedCount: selectedToDelete.size,
      remainingCount: remaining
    });
    setStep('complete');
  };

  const downloadCleanedFile = () => {
    const lines = originalGedcom.split('\n');
    const idsToRemove = new Set([...mergedIds.keys(), ...selectedToDelete]);
    const mergeMap = mergedIds;
    const outputLines = [];
    
    let skipUntilNextZero = false;
    let hasHead = false;
    let hasTrlr = false;
    
    // Vérifier présence HEAD et TRLR
    lines.forEach(line => {
      if (line.trim().startsWith('0 HEAD')) hasHead = true;
      if (line.trim().startsWith('0 TRLR')) hasTrlr = true;
    });
    
    // Générer HEAD si manquant (v1.8.6)
    if (!hasHead) {
      outputLines.push('0 HEAD');
      outputLines.push('1 SOUR Fusionneur GEDCOM');
      outputLines.push('1 GEDC');
      outputLines.push('2 VERS 5.5.1');
      outputLines.push('1 CHAR UTF-8');
      outputLines.push('1 DATE ' + new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase());
    }
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip TRLR original (on le rajoutera à la fin)
      if (trimmed.startsWith('0 TRLR')) continue;
      
      if (trimmed.startsWith('0 ')) {
        skipUntilNextZero = false;
        const match = trimmed.match(/@([^@]+)@/);
        if (match && idsToRemove.has(match[1])) {
          skipUntilNextZero = true;
          continue;
        }
      }
      
      if (skipUntilNextZero) continue;
      
      let processedLine = line;
      mergeMap.forEach((targetId, sourceId) => {
        processedLine = processedLine.replace(new RegExp('@' + sourceId + '@', 'g'), '@' + targetId + '@');
      });
      outputLines.push(processedLine);
    }
    
    // Ajouter TRLR à la fin (v1.8.6)
    outputLines.push('0 TRLR');
    
    const blob = new Blob([outputLines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gedcom_nettoye_' + new Date().toISOString().slice(0, 10) + '.ged';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setStep('upload');
    setIndividuals([]);
    setDuplicates([]);
    setSelectedPairs(new Set());
    setOriginalGedcom('');
    setSearchTerm('');
    setFilterScore(80);
    setProgress(0);
    setActiveTab('clusters');
    setClusterScoreFilter(80);
    setSelectedClusters(new Set());
    setClusters([]);
    setExpandedClusters(new Set());
    setToDeletePersons([]);
    setSelectedToDelete(new Set());
    setSmartSuggestions([]);
    setIntegrityReport(null);
    setFile(null);
    setMergedIds(new Map());
    setValidationResults(null);
    setPreviewPair(null);
    setFamiliesData(new Map());
    setShowIntegrityModal(false);
  };

  const getFilteredDuplicates = () => duplicates.filter(pair => 
    pair.similarity >= filterScore && 
    (!searchTerm || 
     pair.person1.names.some(n => n.toLowerCase().includes(searchTerm.toLowerCase())) || 
     pair.person2.names.some(n => n.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const getSimplePairs = () => {
    const clusterIds = new Set();
    clusters.forEach(c => c.ids.forEach(id => clusterIds.add(id)));
    return getFilteredDuplicates().filter(pair => 
      !clusterIds.has(pair.person1.id) && !clusterIds.has(pair.person2.id)
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDU JSX
  // ═══════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* HEADER avec bouton Recommencer (v1.9.4) */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">Fusionneur GEDCOM</h1>
              <p className="text-emerald-100 text-sm">v{VERSION} - Contrôle intégrité avancé</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Bouton Recommencer dans le header (v1.9.4) */}
            {step !== 'upload' && (
              <button 
                onClick={resetAll} 
                className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Recommencer</span>
              </button>
            )}
            {/* Bouton Intégrité */}
            {integrityReport && (
              <button 
                onClick={() => setShowIntegrityModal(true)} 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  integrityReport.stats.errorCount > 0 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : integrityReport.stats.warningCount > 0 
                      ? 'bg-yellow-500 hover:bg-yellow-600' 
                      : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Intégrité</span>
                {(integrityReport.stats.errorCount + integrityReport.stats.warningCount) > 0 && (
                  <span className="px-1.5 py-0.5 bg-white/30 rounded text-xs font-bold">
                    {integrityReport.stats.errorCount + integrityReport.stats.warningCount}
                  </span>
                )}
              </button>
            )}
            <button 
              onClick={() => setShowChangelog(true)} 
              className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Nouveautés</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barre de progression */}
      {progress > 0 && progress < 100 && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: progress + '%' }} />
              </div>
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4">
        {/* ÉTAPE UPLOAD */}
        {step === 'upload' && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Charger votre fichier GEDCOM</h2>
              <p className="text-gray-600 mb-6">Sélectionnez un fichier .ged exporté depuis MyHeritage, Geneanet, ou autre logiciel de généalogie.</p>
              <label className="block">
                <input type="file" accept=".ged,.gedcom" onChange={handleFileUpload} className="hidden" />
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl cursor-pointer hover:bg-emerald-700 transition-colors font-medium">
                  <Upload className="w-5 h-5" />Sélectionner un fichier
                </span>
              </label>
              <p className="text-xs text-gray-400 mt-4">v{VERSION} - Contrôle d'intégrité 8 types + Bouton flottant</p>
            </div>
          </div>
        )}

        {/* ÉTAPE REVIEW */}
        {step === 'review' && (
          <div>
            {/* Alertes intégrité */}
            {integrityReport && integrityReport.errors.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {integrityReport.errors.length} erreur(s) critique(s) détectée(s)
                </h3>
                <ul className="mt-2 text-sm text-red-700">
                  {integrityReport.errors.slice(0, 3).map((err, i) => (
                    <li key={i}>• {err.message}</li>
                  ))}
                  {integrityReport.errors.length > 3 && (
                    <li className="italic">... et {integrityReport.errors.length - 3} autre(s)</li>
                  )}
                </ul>
                <button 
                  onClick={() => setShowIntegrityModal(true)}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Voir le rapport complet
                </button>
              </div>
            )}
            
            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              <div className="bg-white rounded-xl p-4 shadow border">
                <div className="text-2xl font-bold text-gray-800">{individuals.length}</div>
                <div className="text-sm text-gray-500">Individus</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow border">
                <div className="text-2xl font-bold text-orange-600">{clusters.length}</div>
                <div className="text-sm text-gray-500">Clusters</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow border">
                <div className="text-2xl font-bold text-blue-600">{getSimplePairs().length}</div>
                <div className="text-sm text-gray-500">Doublons</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow border">
                <div className="text-2xl font-bold text-red-600">{toDeletePersons.length}</div>
                <div className="text-sm text-gray-500">À supprimer</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow border">
                <div className="text-2xl font-bold text-purple-600">{smartSuggestions.length}</div>
                <div className="text-sm text-gray-500">Suggestions IA</div>
              </div>
            </div>

            {/* Onglets */}
            <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
              <div className="flex border-b">
                {[
                  { id: 'clusters', label: 'Clusters', icon: '🟠', count: getFilteredClusters().length },
                  { id: 'pairs', label: 'Doublons', icon: '🔵', count: getSimplePairs().length },
                  { id: 'toDelete', label: 'À supprimer', icon: '🗑️', count: toDeletePersons.length },
                  { id: 'ai', label: 'Suggestions IA', icon: '🟣', count: smartSuggestions.length }
                ].map(tab => (
                  <button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id)} 
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-1">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="ml-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">{tab.count}</span>
                  </button>
                ))}
              </div>

              <div className="p-4">
                {/* ONGLET CLUSTERS */}
                {activeTab === 'clusters' && (
                  <div>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Score min:</label>
                        <input 
                          type="range" 
                          min="80" 
                          max="100" 
                          value={clusterScoreFilter} 
                          onChange={(e) => setClusterScoreFilter(parseInt(e.target.value))} 
                          className="w-24" 
                        />
                        <span className="text-sm font-medium">{clusterScoreFilter}%</span>
                      </div>
                      {/* v1.9.4: Bouton dynamique selon le filtre */}
                      <button 
                        onClick={autoSelectHighConfidenceClusters} 
                        className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                      >
                        Sélectionner ≥{clusterScoreFilter}%
                      </button>
                    </div>
                    
                    {getFilteredClusters().length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Aucun cluster trouvé avec ce filtre</p>
                    ) : (
                      <div className="space-y-3">
                        {getFilteredClusters().map((cluster, idx) => (
                          <div 
                            key={idx} 
                            className={`border rounded-lg p-3 ${
                              selectedClusters.has(idx) ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="font-medium">{cluster.size} personnes</span>
                                <span className={`px-2 py-0.5 rounded text-sm ${
                                  cluster.avgScore >= 95 ? 'bg-green-100 text-green-800' : 
                                  cluster.avgScore >= 90 ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-orange-100 text-orange-800'
                                }`}>
                                  Score: {cluster.avgScore}%
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => toggleClusterExpand(idx)} 
                                  className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-1"
                                >
                                  {expandedClusters.has(idx) ? (
                                    <>Réduire <ChevronUp className="w-4 h-4" /></>
                                  ) : (
                                    <>Détails <ChevronDown className="w-4 h-4" /></>
                                  )}
                                </button>
                                <button 
                                  onClick={() => selectCluster(cluster.ids)} 
                                  className="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                >
                                  Sélectionner
                                </button>
                              </div>
                            </div>
                            
                            {/* Tableau détaillé cluster (v1.7.2 restauré) */}
                            {expandedClusters.has(idx) && (
                              <div className="mt-3 pt-3 border-t">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-2 py-1 text-left font-medium text-gray-900">#</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-900">Nom complet</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-900">Naissance</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-900">Lieu naiss.</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-900">Décès</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-900">Sexe</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-900">Parents</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-900">Conjoints</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-900">ID</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {cluster.people.map((person, pIdx) => (
                                        <tr key={person.id} className={pIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                          <td className="px-2 py-1 text-gray-900">{pIdx + 1}</td>
                                          <td className="px-2 py-1 font-medium text-gray-900">{person.names[0] || 'Sans nom'}</td>
                                          <td className="px-2 py-1 text-gray-900">{person.birth || '-'}</td>
                                          <td className="px-2 py-1 text-gray-900 text-xs">{person.birthPlace || '-'}</td>
                                          <td className="px-2 py-1 text-gray-900">{person.death || '-'}</td>
                                          <td className="px-2 py-1 text-gray-900">{person.sex || '-'}</td>
                                          <td className="px-2 py-1 text-gray-900 text-xs">
                                            {person.parents.length > 0 
                                              ? person.parents.map(pid => {
                                                  const p = individuals.find(x => x.id === pid);
                                                  return p?.names[0]?.split(' ')[0] || pid;
                                                }).join(', ')
                                              : '-'
                                            }
                                          </td>
                                          <td className="px-2 py-1 text-gray-900 text-xs">
                                            {person.spouses.length > 0 
                                              ? person.spouses.map(sid => {
                                                  const s = individuals.find(x => x.id === sid);
                                                  return s?.names[0]?.split(' ')[0] || sid;
                                                }).join(', ')
                                              : '-'
                                            }
                                          </td>
                                          <td className="px-2 py-1 font-mono text-xs text-gray-500">{person.id}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ONGLET DOUBLONS */}
                {activeTab === 'pairs' && (
                  <div>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Score min:</label>
                        <input 
                          type="range" 
                          min="80" 
                          max="100" 
                          value={filterScore} 
                          onChange={(e) => setFilterScore(parseInt(e.target.value))} 
                          className="w-24" 
                        />
                        <span className="text-sm font-medium">{filterScore}%</span>
                      </div>
                      {/* v1.9.4: Bouton dynamique selon le filtre */}
                      <button 
                        onClick={selectHighConfidence} 
                        className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                      >
                        Sélectionner ≥{filterScore}%
                      </button>
                      <button 
                        onClick={() => setSelectedPairs(new Set())} 
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                      >
                        Désélectionner tout
                      </button>
                    </div>
                    
                    <input 
                      type="text" 
                      placeholder="Rechercher par nom..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg mb-4"
                    />
                    
                    {getSimplePairs().length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Aucun doublon simple trouvé</p>
                    ) : (
                      <div className="space-y-3">
                        {getSimplePairs().slice(0, 50).map(pair => (
                          <div 
                            key={pair.id} 
                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                              selectedPairs.has(pair.id) ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => togglePairSelection(pair.id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`px-2 py-0.5 rounded text-sm font-medium ${
                                pair.similarity >= 95 ? 'bg-green-100 text-green-800' : 
                                pair.similarity >= 90 ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {pair.similarity}%
                              </span>
                              <button 
                                onClick={(e) => { e.stopPropagation(); openPreview(pair); }}
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                Prévisualiser
                              </button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-3">
                              {[pair.person1, pair.person2].map((person, i) => (
                                <div key={i} className="bg-gray-50 rounded p-2">
                                  <div className="font-medium text-gray-900">{person.names[0] || 'Sans nom'}</div>
                                  <div className="text-sm text-gray-600">
                                    {person.birth && <span>Né(e): {person.birth}</span>}
                                    {person.birthPlace && <span> • {person.birthPlace}</span>}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {person.death && <span>Décès: {person.death}</span>}
                                    {person.deathPlace && <span> • {person.deathPlace}</span>}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Sexe: {person.sex || '-'}
                                  </div>
                                  {/* v1.9.4: Affichage parents restauré */}
                                  {person.parents.length > 0 && (
                                    <div className="text-sm text-gray-600">
                                      Parents: {person.parents.map(pid => getPersonName(pid)).join(', ')}
                                    </div>
                                  )}
                                  <div className="text-xs text-gray-400 font-mono">{person.id}</div>
                                </div>
                              ))}
                            </div>
                            {pair.sufficientCriteria && pair.sufficientCriteria.length > 0 && (
                              <div className="mt-2 text-xs text-gray-500">
                                Critères validants: {pair.sufficientCriteria.join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ONGLET À SUPPRIMER */}
                {activeTab === 'toDelete' && (
                  <div>
                    <div className="flex gap-2 mb-4">
                      <button 
                        onClick={() => setSelectedToDelete(new Set(toDeletePersons.map(p => p.id)))}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                      >
                        Tout sélectionner ({toDeletePersons.length})
                      </button>
                      <button 
                        onClick={() => setSelectedToDelete(new Set())}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                      >
                        Désélectionner tout
                      </button>
                    </div>
                    
                    {toDeletePersons.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Aucune personne à supprimer</p>
                    ) : (
                      <div className="space-y-2">
                        {toDeletePersons.map(person => (
                          <div 
                            key={person.id}
                            onClick={() => {
                              const newSelected = new Set(selectedToDelete);
                              if (newSelected.has(person.id)) newSelected.delete(person.id);
                              else newSelected.add(person.id);
                              setSelectedToDelete(newSelected);
                            }}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedToDelete.has(person.id) ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <input 
                              type="checkbox" 
                              checked={selectedToDelete.has(person.id)}
                              onChange={() => {}}
                              className="w-4 h-4 text-red-600"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {person.names[0] || <span className="italic text-gray-400">Sans nom</span>}
                              </div>
                              <div className="text-sm text-gray-600">
                                {person.birth || 'Date inconnue'} • {person.sex || '?'} • {person.id}
                              </div>
                            </div>
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ONGLET SUGGESTIONS IA (v1.9.4: Affichage complet restauré v1.7.2) */}
                {activeTab === 'ai' && (
                  <div>
                    {smartSuggestions.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Aucune suggestion IA disponible</p>
                    ) : (
                      <div className="space-y-4">
                        {smartSuggestions.map((suggestion, idx) => (
                          <div key={idx} className="border rounded-lg p-4 bg-purple-50 border-purple-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Brain className="w-5 h-5 text-purple-600" />
                                <span className="font-medium text-purple-900">{suggestion.reason}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-sm font-medium ${
                                suggestion.confidence >= 85 ? 'bg-green-100 text-green-800' : 
                                suggestion.confidence >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-orange-100 text-orange-800'
                              }`}>
                                Confiance: {suggestion.confidence}%
                              </span>
                            </div>
                            {/* v1.9.4: Affichage complet des personnes (régression v1.7.2 corrigée) */}
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                              {suggestion.people.map((person, personIdx) => (
                                <div key={personIdx} className="p-3 bg-white rounded border hover:bg-purple-50 transition-colors">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                    <span className="font-bold text-gray-900">{person.names[0] || 'Sans nom'}</span>
                                    <span className="text-xs text-gray-400 font-mono">{person.id}</span>
                                  </div>
                                  <div className="ml-4 space-y-1 text-sm text-gray-900">
                                    <p>
                                      <strong>Naissance:</strong> {person.birth || '-'} 
                                      {person.birthPlace && <span> • {person.birthPlace}</span>}
                                    </p>
                                    <p>
                                      <strong>Décès:</strong> {person.death || '-'}
                                      {person.deathPlace && <span> • {person.deathPlace}</span>}
                                    </p>
                                    <p><strong>Sexe:</strong> {person.sex || '-'}</p>
                                    <p>
                                      <strong>Parents:</strong> {
                                        person.parents.length > 0 
                                          ? person.parents.map(pid => getPersonName(pid)).join(', ')
                                          : '-'
                                      }
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bouton flottant (v1.9.3) */}
            {(selectedPairs.size > 0 || selectedToDelete.size > 0) && (
              <div className="fixed bottom-6 right-6 z-50">
                <button 
                  onClick={mergeDuplicates}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-all hover:scale-105"
                >
                  <CheckCircle className="w-5 h-5" />
                  {selectedPairs.size > 0 && selectedToDelete.size > 0 
                    ? `Fusionner (${selectedPairs.size}) + Supprimer (${selectedToDelete.size})`
                    : selectedPairs.size > 0 
                      ? `Fusionner ${selectedPairs.size} doublon(s)`
                      : `Supprimer ${selectedToDelete.size} personne(s)`
                  }
                </button>
              </div>
            )}
          </div>
        )}

        {/* ÉTAPE COMPLETE */}
        {step === 'complete' && validationResults && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Traitement terminé !</h2>
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {validationResults.mergedCount + validationResults.deletedCount}
                    </div>
                    <div className="text-sm text-gray-500">
                      {validationResults.mergedCount > 0 && validationResults.deletedCount > 0 
                        ? 'Fusionnés + Supprimés' 
                        : validationResults.mergedCount > 0 ? 'Fusionnés' : 'Supprimés'
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">{validationResults.remainingCount}</div>
                    <div className="text-sm text-gray-500">Restants</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{individuals.length}</div>
                    <div className="text-sm text-gray-500">Original</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={downloadCleanedFile} 
                  className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Télécharger le fichier nettoyé
                </button>
                <button 
                  onClick={resetAll} 
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Traiter un autre fichier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL CHANGELOG */}
      {showChangelog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />Historique des versions
                </h2>
                <button onClick={() => setShowChangelog(false)} className="p-2 hover:bg-white/20 rounded-lg">✕</button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {CHANGELOG.map((version, idx) => (
                <div key={idx} className={`mb-6 pb-6 ${idx < CHANGELOG.length - 1 ? 'border-b' : ''}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${version.color}-100 text-${version.color}-800`}>
                      v{version.version}
                    </span>
                    {version.tag && (
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        version.tag === 'ACTUELLE' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {version.tag}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">{version.date}</span>
                  </div>
                  <h3 className="font-medium text-gray-800 mb-2">{version.title}</h3>
                  <ul className="space-y-1">
                    {version.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-emerald-500">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL INTÉGRITÉ (v1.9.4) */}
      {showIntegrityModal && integrityReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
            <div className={`sticky top-0 px-6 py-4 ${
              integrityReport.stats.errorCount > 0 
                ? 'bg-gradient-to-r from-red-600 to-red-500' 
                : integrityReport.stats.warningCount > 0 
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' 
                  : 'bg-gradient-to-r from-green-600 to-green-500'
            } text-white`}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  Rapport d'intégrité GEDCOM
                </h2>
                <button onClick={() => setShowIntegrityModal(false)} className="p-2 hover:bg-white/20 rounded-lg">✕</button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Statistiques */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-800">{integrityReport.stats.totalIndividuals}</div>
                  <div className="text-xs text-gray-500">Individus</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-800">{integrityReport.stats.totalFamilies}</div>
                  <div className="text-xs text-gray-500">Familles</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">{integrityReport.stats.completenessPercent}%</div>
                  <div className="text-xs text-gray-500">Complétude</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-600">{integrityReport.stats.isolatedCount}</div>
                  <div className="text-xs text-gray-500">Isolés</div>
                </div>
              </div>

              {/* Compteurs erreurs/warnings */}
              <div className="flex gap-4 mb-6">
                <div className={`flex-1 p-3 rounded-lg ${
                  integrityReport.stats.errorCount > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className={`w-5 h-5 ${integrityReport.stats.errorCount > 0 ? 'text-red-600' : 'text-green-600'}`} />
                    <span className={`font-medium ${integrityReport.stats.errorCount > 0 ? 'text-red-800' : 'text-green-800'}`}>
                      {integrityReport.stats.errorCount} erreur(s) critique(s)
                    </span>
                  </div>
                </div>
                <div className={`flex-1 p-3 rounded-lg ${
                  integrityReport.stats.warningCount > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className={`w-5 h-5 ${integrityReport.stats.warningCount > 0 ? 'text-yellow-600' : 'text-green-600'}`} />
                    <span className={`font-medium ${integrityReport.stats.warningCount > 0 ? 'text-yellow-800' : 'text-green-800'}`}>
                      {integrityReport.stats.warningCount} avertissement(s)
                    </span>
                  </div>
                </div>
              </div>

              {/* Liste des erreurs */}
              {integrityReport.errors.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Erreurs critiques
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {integrityReport.errors.slice(0, 20).map((err, i) => (
                      <div key={i} className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <span className="font-medium">[{err.type}]</span> {err.message}
                      </div>
                    ))}
                    {integrityReport.errors.length > 20 && (
                      <p className="text-sm text-red-600 italic">
                        ... et {integrityReport.errors.length - 20} autre(s) erreur(s)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Liste des warnings */}
              {integrityReport.warnings.length > 0 && (
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Avertissements
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {integrityReport.warnings.slice(0, 20).map((warn, i) => (
                      <div key={i} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                        <span className="font-medium">[{warn.type}]</span> {warn.message}
                      </div>
                    ))}
                    {integrityReport.warnings.length > 20 && (
                      <p className="text-sm text-yellow-600 italic">
                        ... et {integrityReport.warnings.length - 20} autre(s) avertissement(s)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Message si tout est OK */}
              {integrityReport.errors.length === 0 && integrityReport.warnings.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-green-800">Fichier valide !</h3>
                  <p className="text-gray-600 mt-2">Aucune erreur ni avertissement détecté.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRÉVISUALISATION */}
      {previewPair && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Prévisualisation de la fusion</h2>
                <button onClick={closePreview} className="p-2 hover:bg-white/20 rounded-lg">✕</button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[75vh]">
              <div className="grid md:grid-cols-2 gap-6">
                {[previewPair.person1, previewPair.person2].map((person, i) => {
                  const quality = calculateDataQuality(person);
                  const isKept = calculateDataQuality(previewPair.person1) >= calculateDataQuality(previewPair.person2) ? i === 0 : i === 1;
                  return (
                    <div key={i} className={`border-2 rounded-xl p-4 ${isKept ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                      {isKept && (
                        <div className="mb-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded w-fit">
                          CONSERVÉ
                        </div>
                      )}
                      <h3 className="font-bold text-lg mb-3">{person.names[0] || 'Sans nom'}</h3>
                      <div className="space-y-2 text-sm">
                        <p><strong>ID:</strong> {person.id}</p>
                        <p><strong>Naissance:</strong> {person.birth || '-'}</p>
                        <p><strong>Lieu naissance:</strong> {person.birthPlace || '-'}</p>
                        <p><strong>Décès:</strong> {person.death || '-'}</p>
                        <p><strong>Lieu décès:</strong> {person.deathPlace || '-'}</p>
                        <p><strong>Sexe:</strong> {person.sex || '-'}</p>
                        <p><strong>Parents:</strong> {person.parents.map(pid => getPersonName(pid)).join(', ') || '-'}</p>
                        <p><strong>Conjoints:</strong> {person.spouses.map(sid => getPersonName(sid)).join(', ') || '-'}</p>
                        <p><strong>Profession:</strong> {person.occupation || '-'}</p>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm text-gray-600">Score qualité: <strong>{quality}</strong></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={closePreview} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                  Fermer
                </button>
                <button 
                  onClick={() => { togglePairSelection(previewPair.id); closePreview(); }}
                  className={`px-4 py-2 rounded-lg ${
                    selectedPairs.has(previewPair.id) 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {selectedPairs.has(previewPair.id) ? 'Désélectionner' : 'Sélectionner pour fusion'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GedcomDuplicateMerger;
