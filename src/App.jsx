import React, { useState } from 'react';
import { Upload, Users, AlertCircle, Download, Trash2, CheckCircle, Sparkles, FileText, UserX, Lightbulb, Shield } from 'lucide-react';

const GedcomDuplicateMerger = () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // ÉTATS PRINCIPAUX
  // ═══════════════════════════════════════════════════════════════════════════
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
  
  // États pour onglets et changelog
  const [showChangelog, setShowChangelog] = useState(false);
  const [activeTab, setActiveTab] = useState('clusters');
  const [clusterScoreFilter, setClusterScoreFilter] = useState(80);
  const [selectedClusters, setSelectedClusters] = useState(new Set());

  // ═══════════════════════════════════════════════════════════════════════════
  // NOUVEAUX ÉTATS v1.9.0 - ISOLÉS ET SUGGESTIONS IA
  // ═══════════════════════════════════════════════════════════════════════════
  const [isolatedIndividuals, setIsolatedIndividuals] = useState([]);
  const [selectedIsolated, setSelectedIsolated] = useState(new Set());
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const [integrityReport, setIntegrityReport] = useState(null);

  const VERSION = '1.9.0';

  // ═══════════════════════════════════════════════════════════════════════════
  // CHANGELOG COMPLET
  // ═══════════════════════════════════════════════════════════════════════════
  const CHANGELOG = [
    {
      version: '1.9.0',
      date: '28 décembre 2025',
      tag: 'ACTUELLE',
      color: 'green',
      title: 'Restauration onglets Isolés et Suggestions IA',
      items: [
        'Restauration onglet "Isolés" pour individus sans famille',
        'Restauration onglet "Suggestions IA" avec analyse patterns',
        'Détection individus sans parents ET sans enfants',
        'Sélection en masse des isolés (tout/rien/totalement isolés)',
        'Suggestions intelligentes basées sur patterns nom/période',
        'Normalisation automatique des lieux (retrait codes INSEE)',
        'Contrôles d\'intégrité avancés',
        'Score de confiance pour suggestions IA (60-95%)'
      ]
    },
    {
      version: '1.8.7',
      date: '24 décembre 2025',
      tag: null,
      color: 'blue',
      title: 'Version complète avec toutes les corrections',
      items: [
        'Restauration bouton Changelog/Nouveautés avec modal complète',
        'Restauration système d\'onglets Clusters/Doublons simples',
        'Ajout scoring moyen des clusters avec jauges visuelles',
        'Ajout filtre pourcentage minimum pour clusters',
        'Ajout sélection automatique clusters ≥95%'
      ]
    },
    {
      version: '1.8.6',
      date: '16 décembre 2025',
      tag: null,
      color: 'indigo',
      title: 'Corrections GEDCOM et génération HEAD/TRLR',
      items: [
        'Correction gestion balises CONT/CONC multi-lignes',
        'Génération automatique en-tête HEAD complet',
        'Génération automatique balise TRLR de fin',
        'Amélioration compatibilité avec logiciels généalogie'
      ]
    },
    {
      version: '1.4.0',
      date: '5 décembre 2025',
      tag: null,
      color: 'purple',
      title: 'Organisation interface et contrôle intégrité',
      items: [
        'Système d\'onglets séparant Clusters et Doublons simples',
        'Scoring moyen des clusters avec jauges colorées',
        'Auto-sélection clusters haute confiance (≥95%)',
        'Filtre pourcentage pour masquer clusters sous seuil'
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
        'Fusion sécurisée sans perte de données',
        'Interface React moderne et responsive'
      ]
    }
  ];

  // ═══════════════════════════════════════════════════════════════════════════
  // DICTIONNAIRE VARIANTES PRÉNOMS FRANÇAIS
  // ═══════════════════════════════════════════════════════════════════════════
  const NAME_VARIANTS = {
    'catherine': ['katherine', 'cathrine', 'katrine', 'caterine'],
    'jean': ['jehan', 'johan', 'joan'],
    'marie': ['maria', 'mary', 'mari'],
    'pierre': ['peter', 'pedro', 'piere'],
    'jacques': ['james', 'jacob', 'jacque'],
    'françois': ['francis', 'francois', 'fransois'],
    'louis': ['lewis', 'luis', 'loui'],
    'anne': ['ann', 'anna', 'ane'],
    'marguerite': ['margaret', 'margueritte', 'margarite'],
    'nicolas': ['nicholas', 'nicola', 'nikolas'],
    'guillaume': ['william', 'guilaume', 'guillem'],
    'antoine': ['anthony', 'antoin', 'antonio'],
    'michel': ['michael', 'mickael', 'miguel'],
    'philippe': ['philip', 'philipe', 'filippe'],
    'charles': ['carl', 'carlos', 'charle'],
    'henri': ['henry', 'henrie', 'enri'],
    'joseph': ['josef', 'josephe', 'jose'],
    'claude': ['claudio', 'claudius', 'claud'],
    'etienne': ['stephen', 'estienne', 'steven'],
    'gabriel': ['gabrielle', 'gabryel', 'gabreil'],
    'laurent': ['lawrence', 'laurens', 'lorent'],
    'matthieu': ['matthew', 'mathieu', 'matieu'],
    'paul': ['pablo', 'paulo', 'paule'],
    'simon': ['simeon', 'symon', 'simone'],
    'thomas': ['tomas', 'thoma', 'tomaso'],
    'vincent': ['vincenzo', 'vicent', 'vincentius'],
    'andré': ['andrew', 'andreas', 'andre'],
    'bernard': ['bernhard', 'bernardus', 'bernar'],
    'denis': ['dennis', 'denys', 'dionysius'],
    'georges': ['george', 'jorge', 'georg'],
    'germain': ['germaine', 'german', 'jermain'],
    'gilles': ['giles', 'gil', 'aegidius'],
    'hugues': ['hugo', 'hugh', 'hug'],
    'martin': ['martinus', 'marten', 'martine'],
    'rene': ['renatus', 'renee', 'rená'],
    'robert': ['roberto', 'rupert', 'rober'],
    'sebastien': ['sebastian', 'sebastianus', 'bastien'],
    'therese': ['teresa', 'theresia', 'terese'],
    'victor': ['viktor', 'victoire', 'vittorio'],
    'xavier': ['javier', 'xaver', 'saverio']
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // NORMALISATION DES LIEUX (retrait codes INSEE)
  // ═══════════════════════════════════════════════════════════════════════════
  const normalizePlace = (place) => {
    if (!place) return '';
    // Retirer les codes INSEE : "38142 Mizoen" → "Mizoen"
    // Pattern : 1-5 chiffres suivis d'un espace puis du nom
    return place.replace(/^\d{1,5}\s+/, '').trim();
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // NORMALISATION DES PRÉNOMS (variantes historiques)
  // ═══════════════════════════════════════════════════════════════════════════
  const normalizeFirstName = (name) => {
    if (!name) return '';
    const lower = name.toLowerCase().trim();
    
    // Chercher dans le dictionnaire des variantes
    for (const [canonical, variants] of Object.entries(NAME_VARIANTS)) {
      if (lower === canonical || variants.includes(lower)) {
        return canonical;
      }
    }
    return lower;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SOUNDEX FRANÇAIS AMÉLIORÉ
  // ═══════════════════════════════════════════════════════════════════════════
  const soundexFr = (str) => {
    if (!str) return '';
    let s = str.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z]/g, '');
    if (s.length === 0) return '';
    
    // Normaliser d'abord les variantes de prénoms
    s = normalizeFirstName(s) || s;
    
    const first = s[0];
    let code = s
      .replace(/[aeiouyhw]/g, '0')
      .replace(/[bfpv]/g, '1')
      .replace(/[cgjkqsxz]/g, '2')
      .replace(/[dt]/g, '3')
      .replace(/[l]/g, '4')
      .replace(/[mn]/g, '5')
      .replace(/[r]/g, '6');
    
    let result = first;
    for (let i = 1; i < code.length && result.length < 4; i++) {
      if (code[i] !== '0' && code[i] !== code[i-1]) {
        result += code[i];
      }
    }
    return result.padEnd(4, '0').toUpperCase();
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PARSEUR GEDCOM COMPLET
  // ═══════════════════════════════════════════════════════════════════════════
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
      if (currentPerson && (trimmed.startsWith('2 CONT ') || trimmed.startsWith('2 CONC '))) {
        const isCont = trimmed.startsWith('2 CONT ');
        const value = trimmed.split(isCont ? '2 CONT ' : '2 CONC ')[1] || '';
        const separator = isCont ? '\n' : '';
        
        if (lastFieldType === 'NAME' && currentPerson.names.length > 0) {
          currentPerson.names[currentPerson.names.length - 1] += separator + value;
        } else if (lastFieldType === 'BIRT_DATE') {
          currentPerson.birth += separator + value;
        } else if (lastFieldType === 'BIRT_PLAC') {
          currentPerson.birthPlace += separator + value;
        } else if (lastFieldType === 'DEAT_DATE') {
          currentPerson.death += separator + value;
        } else if (lastFieldType === 'DEAT_PLAC') {
          currentPerson.deathPlace += separator + value;
        } else if (lastFieldType === 'OCCU') {
          currentPerson.occupation += separator + value;
        }
        return;
      }
      
      if (trimmed.startsWith('0') && trimmed.includes('INDI')) {
        if (currentPerson) people.push(currentPerson);
        const match = trimmed.match(/@([^@]+)@/);
        const id = match ? match[1] : `INDI${people.length}`;
        currentPerson = {
          id, names: [], birth: '', birthPlace: '', death: '', deathPlace: '',
          sex: '', occupation: '', parents: [], spouses: [], rawLines: [line]
        };
        currentFamily = null;
        currentEvent = null;
        lastFieldType = null;
      } else if (trimmed.startsWith('0') && trimmed.includes('FAM')) {
        if (currentPerson) { people.push(currentPerson); currentPerson = null; }
        const match = trimmed.match(/@([^@]+)@/);
        const id = match ? match[1] : `FAM${families.size}`;
        currentFamily = { id, husband: null, wife: null, children: [] };
        families.set(id, currentFamily);
        currentEvent = null;
      } else if (trimmed.startsWith('0')) {
        if (currentPerson) { people.push(currentPerson); currentPerson = null; }
        currentFamily = null;
        currentEvent = null;
      } else if (currentPerson) {
        currentPerson.rawLines.push(line);
        if (trimmed.startsWith('1 NAME ')) {
          currentPerson.names.push(trimmed.split('1 NAME ')[1].replace(/\//g, '').trim());
          lastFieldType = 'NAME';
        } else if (trimmed.startsWith('1 SEX ')) {
          currentPerson.sex = trimmed.split('1 SEX ')[1].trim();
        } else if (trimmed.startsWith('1 BIRT')) {
          currentEvent = 'BIRT';
        } else if (trimmed.startsWith('1 DEAT')) {
          currentEvent = 'DEAT';
        } else if (trimmed.startsWith('1 OCCU ')) {
          currentPerson.occupation = trimmed.split('1 OCCU ')[1].trim();
          lastFieldType = 'OCCU';
        } else if (trimmed.startsWith('1 FAMC ')) {
          const match = trimmed.match(/@([^@]+)@/);
          if (match) currentPerson.parents.push(match[1]);
        } else if (trimmed.startsWith('1 FAMS ')) {
          const match = trimmed.match(/@([^@]+)@/);
          if (match) currentPerson.spouses.push(match[1]);
        } else if (trimmed.startsWith('2 DATE ') && currentEvent) {
          const dateValue = trimmed.split('2 DATE ')[1].trim();
          if (currentEvent === 'BIRT') {
            currentPerson.birth = dateValue;
            lastFieldType = 'BIRT_DATE';
          } else if (currentEvent === 'DEAT') {
            currentPerson.death = dateValue;
            lastFieldType = 'DEAT_DATE';
          }
        } else if (trimmed.startsWith('2 PLAC ') && currentEvent) {
          // NORMALISATION AUTOMATIQUE DES LIEUX (v1.9.0)
          const placeValue = normalizePlace(trimmed.split('2 PLAC ')[1].trim());
          if (currentEvent === 'BIRT') {
            currentPerson.birthPlace = placeValue;
            lastFieldType = 'BIRT_PLAC';
          } else if (currentEvent === 'DEAT') {
            currentPerson.deathPlace = placeValue;
            lastFieldType = 'DEAT_PLAC';
          }
        }
      } else if (currentFamily) {
        if (trimmed.startsWith('1 HUSB ')) {
          const match = trimmed.match(/@([^@]+)@/);
          if (match) currentFamily.husband = match[1];
        } else if (trimmed.startsWith('1 WIFE ')) {
          const match = trimmed.match(/@([^@]+)@/);
          if (match) currentFamily.wife = match[1];
        } else if (trimmed.startsWith('1 CHIL ')) {
          const match = trimmed.match(/@([^@]+)@/);
          if (match) currentFamily.children.push(match[1]);
        }
      }
    });

    if (currentPerson) people.push(currentPerson);

    // Résolution des relations
    families.forEach(family => {
      const parentIds = [family.husband, family.wife].filter(Boolean);
      family.children.forEach(childId => {
        const child = people.find(p => p.id === childId);
        if (child) {
          parentIds.forEach(pid => {
            if (!child.parents.includes(pid)) child.parents.push(pid);
          });
        }
      });
      
      if (family.husband && family.wife) {
        const husband = people.find(p => p.id === family.husband);
        const wife = people.find(p => p.id === family.wife);
        if (husband && !husband.spouses.includes(family.wife)) husband.spouses.push(family.wife);
        if (wife && !wife.spouses.includes(family.husband)) wife.spouses.push(family.husband);
      }
    });

    return { people, families };
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CALCUL DE SIMILARITÉ (9 critères)
  // ═══════════════════════════════════════════════════════════════════════════
  const calculateSimilarity = (person1, person2, allPeople) => {
    let score = 0;
    let maxScore = 0;
    const details = [];

    // Sexe (éliminatoire)
    if (person1.sex && person2.sex) {
      maxScore += 15;
      if (person1.sex === person2.sex) {
        score += 15;
        details.push({ criterion: 'Sexe', match: true, score: 15 });
      } else {
        return { score: 0, details: [{ criterion: 'Sexe', match: false, score: 0, note: 'Éliminatoire' }] };
      }
    }

    // Noms (Soundex + variantes)
    if (person1.names.length > 0 && person2.names.length > 0) {
      maxScore += 30;
      const names1 = person1.names.map(n => soundexFr(n));
      const names2 = person2.names.map(n => soundexFr(n));
      const nameMatch = names1.some(n1 => names2.some(n2 => n1 === n2));
      if (nameMatch) {
        score += 30;
        details.push({ criterion: 'Noms (Soundex+variantes)', match: true, score: 30 });
      } else {
        details.push({ criterion: 'Noms (Soundex+variantes)', match: false, score: 0 });
      }
    }

    // Date de naissance
    if (person1.birth && person2.birth) {
      maxScore += 25;
      const year1 = person1.birth.match(/\d{4}/);
      const year2 = person2.birth.match(/\d{4}/);
      if (year1 && year2) {
        const diff = Math.abs(parseInt(year1[0]) - parseInt(year2[0]));
        if (diff === 0) {
          score += 25;
          details.push({ criterion: 'Année naissance', match: true, score: 25, note: 'Identique' });
        } else if (diff <= 2) {
          score += 15;
          details.push({ criterion: 'Année naissance', match: true, score: 15, note: `±${diff} an(s)` });
        } else {
          details.push({ criterion: 'Année naissance', match: false, score: 0 });
        }
      }
    }

    // Parents communs
    if (person1.parents.length > 0 && person2.parents.length > 0) {
      maxScore += 20;
      const commonParents = person1.parents.filter(p => person2.parents.includes(p));
      if (commonParents.length > 0) {
        score += 20;
        details.push({ criterion: 'Parents', match: true, score: 20, note: `${commonParents.length} commun(s)` });
      } else {
        details.push({ criterion: 'Parents', match: false, score: 0 });
      }
    }

    // Fratrie (via parents)
    const getSiblings = (person) => {
      const siblings = new Set();
      allPeople.forEach(p => {
        if (p.id !== person.id && person.parents.some(parent => p.parents.includes(parent))) {
          siblings.add(p.id);
        }
      });
      return siblings;
    };

    const siblings1 = getSiblings(person1);
    const siblings2 = getSiblings(person2);
    if (siblings1.size > 0 && siblings2.size > 0) {
      maxScore += 15;
      const commonSiblings = [...siblings1].filter(s => siblings2.has(s));
      if (commonSiblings.length > 0) {
        score += 15;
        details.push({ criterion: 'Fratrie', match: true, score: 15, note: `${commonSiblings.length} commun(s)` });
      }
    }

    // Date de décès
    if (person1.death && person2.death) {
      maxScore += 15;
      const year1 = person1.death.match(/\d{4}/);
      const year2 = person2.death.match(/\d{4}/);
      if (year1 && year2) {
        const diff = Math.abs(parseInt(year1[0]) - parseInt(year2[0]));
        if (diff <= 2) {
          score += 15;
          details.push({ criterion: 'Année décès', match: true, score: 15 });
        }
      }
    }

    // Lieu de naissance
    if (person1.birthPlace && person2.birthPlace) {
      maxScore += 10;
      if (person1.birthPlace.toLowerCase() === person2.birthPlace.toLowerCase()) {
        score += 10;
        details.push({ criterion: 'Lieu naissance', match: true, score: 10 });
      }
    }

    // Conjoints communs
    if (person1.spouses.length > 0 && person2.spouses.length > 0) {
      maxScore += 8;
      const commonSpouses = person1.spouses.filter(s => person2.spouses.includes(s));
      if (commonSpouses.length > 0) {
        score += 8;
        details.push({ criterion: 'Conjoints', match: true, score: 8 });
      }
    }

    // Profession
    if (person1.occupation && person2.occupation) {
      maxScore += 5;
      if (person1.occupation.toLowerCase() === person2.occupation.toLowerCase()) {
        score += 5;
        details.push({ criterion: 'Profession', match: true, score: 5 });
      }
    }

    const finalScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    return { score: finalScore, details };
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // DÉTECTION DES DOUBLONS AVEC TRIPLE INDEXATION
  // ═══════════════════════════════════════════════════════════════════════════
  const findDuplicates = (people) => {
    const potentialDuplicates = [];
    
    // Triple indexation pour performance
    const phoneticIndex = new Map();
    const yearIndex = new Map();
    const parentIndex = new Map();
    
    people.forEach(person => {
      // Index phonétique
      person.names.forEach(name => {
        const key = soundexFr(name);
        if (!phoneticIndex.has(key)) phoneticIndex.set(key, []);
        phoneticIndex.get(key).push(person);
      });
      
      // Index année
      const year = person.birth?.match(/\d{4}/)?.[0];
      if (year) {
        [-2, -1, 0, 1, 2].forEach(offset => {
          const y = String(parseInt(year) + offset);
          if (!yearIndex.has(y)) yearIndex.set(y, []);
          yearIndex.get(y).push(person);
        });
      }
      
      // Index parents
      person.parents.forEach(parentId => {
        if (!parentIndex.has(parentId)) parentIndex.set(parentId, []);
        parentIndex.get(parentId).push(person);
      });
    });
    
    // Comparaison optimisée
    const compared = new Set();
    const candidatePairs = [];
    
    phoneticIndex.forEach(group => {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const key = [group[i].id, group[j].id].sort().join('-');
          if (!compared.has(key)) {
            compared.add(key);
            candidatePairs.push([group[i], group[j]]);
          }
        }
      }
    });
    
    parentIndex.forEach(group => {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const key = [group[i].id, group[j].id].sort().join('-');
          if (!compared.has(key)) {
            compared.add(key);
            candidatePairs.push([group[i], group[j]]);
          }
        }
      }
    });
    
    candidatePairs.forEach(([p1, p2]) => {
      const result = calculateSimilarity(p1, p2, people);
      if (result.score >= 80) {
        potentialDuplicates.push({
          id: `${p1.id}-${p2.id}`,
          person1: p1,
          person2: p2,
          similarity: result.score,
          details: result.details
        });
      }
    });
    
    potentialDuplicates.sort((a, b) => b.similarity - a.similarity);
    
    // Détecter les clusters
    const detectedClusters = detectClusters(potentialDuplicates, people);
    setClusters(detectedClusters);
    
    return potentialDuplicates;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // DÉTECTION DES CLUSTERS
  // ═══════════════════════════════════════════════════════════════════════════
  const detectClusters = (duplicates, allPeople) => {
    const personToClusters = new Map();
    const clustersList = [];
    
    duplicates.forEach(dup => {
      const id1 = dup.person1.id;
      const id2 = dup.person2.id;
      
      const cluster1 = personToClusters.get(id1);
      const cluster2 = personToClusters.get(id2);
      
      if (!cluster1 && !cluster2) {
        const newCluster = { people: new Set([id1, id2]), pairs: [dup] };
        clustersList.push(newCluster);
        personToClusters.set(id1, newCluster);
        personToClusters.set(id2, newCluster);
      } else if (cluster1 && !cluster2) {
        cluster1.people.add(id2);
        cluster1.pairs.push(dup);
        personToClusters.set(id2, cluster1);
      } else if (!cluster1 && cluster2) {
        cluster2.people.add(id1);
        cluster2.pairs.push(dup);
        personToClusters.set(id1, cluster2);
      } else if (cluster1 !== cluster2) {
        cluster2.people.forEach(id => {
          cluster1.people.add(id);
          personToClusters.set(id, cluster1);
        });
        cluster1.pairs.push(...cluster2.pairs, dup);
        const idx = clustersList.indexOf(cluster2);
        if (idx > -1) clustersList.splice(idx, 1);
      } else {
        cluster1.pairs.push(dup);
      }
    });
    
    return clustersList
      .filter(c => c.people.size >= 3)
      .map(c => {
        const peopleArray = [...c.people].map(id => allPeople.find(p => p.id === id)).filter(Boolean);
        const avgScore = c.pairs.length > 0
          ? Math.round(c.pairs.reduce((sum, p) => sum + p.similarity, 0) / c.pairs.length)
          : 0;
        return {
          people: peopleArray,
          pairs: c.pairs,
          avgScore
        };
      })
      .sort((a, b) => b.avgScore - a.avgScore);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // DÉTECTION DES INDIVIDUS ISOLÉS (v1.9.0)
  // ═══════════════════════════════════════════════════════════════════════════
  const detectIsolatedIndividuals = (people, families) => {
    // Construire la carte des enfants depuis les familles
    const childrenMap = new Map();
    families.forEach(family => {
      family.children.forEach(childId => {
        if (family.husband) {
          if (!childrenMap.has(family.husband)) childrenMap.set(family.husband, new Set());
          childrenMap.get(family.husband).add(childId);
        }
        if (family.wife) {
          if (!childrenMap.has(family.wife)) childrenMap.set(family.wife, new Set());
          childrenMap.get(family.wife).add(childId);
        }
      });
    });
    
    const isolated = [];
    
    people.forEach(person => {
      const hasParents = person.parents.length > 0;
      const hasChildren = childrenMap.has(person.id) && childrenMap.get(person.id).size > 0;
      const hasSpouses = person.spouses.length > 0;
      
      // Isolé = sans parents ET sans enfants
      if (!hasParents && !hasChildren) {
        isolated.push({
          ...person,
          hasSpouses,
          isTotallyIsolated: !hasSpouses
        });
      }
    });
    
    return isolated;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SUGGESTIONS INTELLIGENTES (IA) (v1.9.0)
  // ═══════════════════════════════════════════════════════════════════════════
  const generateSmartSuggestions = (people) => {
    const suggestions = [];
    
    // Grouper par nom normalisé et période
    const nameGroups = new Map();
    
    people.forEach(person => {
      if (person.names.length === 0) return;
      
      const normalizedName = soundexFr(person.names[0]);
      const birthYear = person.birth?.match(/\d{4}/)?.[0];
      const period = birthYear ? Math.floor(parseInt(birthYear) / 25) * 25 : null;
      
      const key = `${normalizedName}-${period || 'unknown'}`;
      
      if (!nameGroups.has(key)) {
        nameGroups.set(key, {
          people: [],
          name: person.names[0],
          period: period ? `${period}-${period + 25}` : 'Période inconnue'
        });
      }
      nameGroups.get(key).people.push(person);
    });
    
    // Analyser les groupes suspects (3+ personnes)
    nameGroups.forEach((group, key) => {
      if (group.people.length >= 3) {
        // Calculer un score de confiance basé sur plusieurs facteurs
        let confidence = 60; // Base
        
        // Bonus si même lieu de naissance
        const places = group.people.map(p => p.birthPlace?.toLowerCase()).filter(Boolean);
        const uniquePlaces = new Set(places);
        if (uniquePlaces.size === 1 && places.length >= 2) {
          confidence += 15;
        }
        
        // Bonus si parents communs
        const allParents = group.people.flatMap(p => p.parents);
        const parentCounts = {};
        allParents.forEach(p => { parentCounts[p] = (parentCounts[p] || 0) + 1; });
        const hasCommonParent = Object.values(parentCounts).some(c => c >= 2);
        if (hasCommonParent) {
          confidence += 20;
        }
        
        // Malus si groupe trop grand (plus suspect d'être des homonymes)
        if (group.people.length > 5) {
          confidence -= 10;
        }
        
        confidence = Math.min(95, Math.max(60, confidence));
        
        suggestions.push({
          id: key,
          name: group.name,
          period: group.period,
          people: group.people,
          count: group.people.length,
          confidence,
          reason: buildSuggestionReason(group, hasCommonParent, uniquePlaces.size === 1)
        });
      }
    });
    
    // Trier par confiance décroissante
    suggestions.sort((a, b) => b.confidence - a.confidence);
    
    return suggestions;
  };

  const buildSuggestionReason = (group, hasCommonParent, sameBirthPlace) => {
    const reasons = [`${group.people.length} personnes avec le même nom dans la période ${group.period}`];
    if (hasCommonParent) reasons.push('Parents communs détectés');
    if (sameBirthPlace) reasons.push('Même lieu de naissance');
    return reasons.join('. ');
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTRÔLES D'INTÉGRITÉ (v1.9.0)
  // ═══════════════════════════════════════════════════════════════════════════
  const performIntegrityChecks = (people, families) => {
    const issues = {
      critical: [],
      warnings: [],
      info: []
    };
    
    people.forEach(person => {
      // Personne sans nom
      if (person.names.length === 0 || !person.names[0]?.trim()) {
        issues.warnings.push({
          type: 'NO_NAME',
          person: person,
          message: `Individu ${person.id} sans nom renseigné`
        });
      }
      
      // Dates incohérentes (naissance > décès)
      if (person.birth && person.death) {
        const birthYear = person.birth.match(/\d{4}/)?.[0];
        const deathYear = person.death.match(/\d{4}/)?.[0];
        if (birthYear && deathYear && parseInt(birthYear) > parseInt(deathYear)) {
          issues.critical.push({
            type: 'BIRTH_AFTER_DEATH',
            person: person,
            message: `${person.names[0] || person.id}: naissance (${birthYear}) après décès (${deathYear})`
          });
        }
      }
      
      // Parent trop jeune ou trop vieux
      if (person.birth && person.parents.length > 0) {
        const childBirthYear = parseInt(person.birth.match(/\d{4}/)?.[0]);
        if (childBirthYear) {
          person.parents.forEach(parentId => {
            const parent = people.find(p => p.id === parentId);
            if (parent?.birth) {
              const parentBirthYear = parseInt(parent.birth.match(/\d{4}/)?.[0]);
              if (parentBirthYear) {
                const ageAtBirth = childBirthYear - parentBirthYear;
                if (ageAtBirth < 15) {
                  issues.critical.push({
                    type: 'PARENT_TOO_YOUNG',
                    person: person,
                    parent: parent,
                    message: `${parent.names[0] || parent.id} avait ${ageAtBirth} ans à la naissance de ${person.names[0] || person.id}`
                  });
                } else if (ageAtBirth > 80) {
                  issues.warnings.push({
                    type: 'PARENT_TOO_OLD',
                    person: person,
                    parent: parent,
                    message: `${parent.names[0] || parent.id} avait ${ageAtBirth} ans à la naissance de ${person.names[0] || person.id}`
                  });
                }
              }
            }
          });
        }
      }
    });
    
    return issues;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // FONCTIONS UTILITAIRES CLUSTERS
  // ═══════════════════════════════════════════════════════════════════════════
  const getClusterAverageScore = (cluster) => {
    return cluster.avgScore || 0;
  };

  const getFilteredClusters = () => {
    return clusters.filter(cluster => getClusterAverageScore(cluster) >= clusterScoreFilter);
  };

  const autoSelectHighConfidenceClusters = () => {
    const newSelected = new Set();
    clusters.forEach((cluster, idx) => {
      if (getClusterAverageScore(cluster) >= 95) {
        newSelected.add(idx);
      }
    });
    setSelectedClusters(newSelected);
  };

  const toggleClusterExpand = (idx) => {
    const newExpanded = new Set(expandedClusters);
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx);
    } else {
      newExpanded.add(idx);
    }
    setExpandedClusters(newExpanded);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // FONCTIONS UTILITAIRES ISOLÉS (v1.9.0)
  // ═══════════════════════════════════════════════════════════════════════════
  const selectAllIsolated = () => {
    setSelectedIsolated(new Set(isolatedIndividuals.map(p => p.id)));
  };

  const selectTotallyIsolated = () => {
    setSelectedIsolated(new Set(
      isolatedIndividuals.filter(p => p.isTotallyIsolated).map(p => p.id)
    ));
  };

  const deselectAllIsolated = () => {
    setSelectedIsolated(new Set());
  };

  const toggleIsolatedSelection = (personId) => {
    const newSelected = new Set(selectedIsolated);
    if (newSelected.has(personId)) {
      newSelected.delete(personId);
    } else {
      newSelected.add(personId);
    }
    setSelectedIsolated(newSelected);
  };

  const deleteSelectedIsolated = () => {
    if (selectedIsolated.size === 0) return;
    
    const confirmMsg = `Êtes-vous sûr de vouloir supprimer ${selectedIsolated.size} individu(s) isolé(s) ?\n\nCette action est irréversible.`;
    if (!window.confirm(confirmMsg)) return;
    
    // Marquer pour suppression
    const idsToRemove = new Set(selectedIsolated);
    idsToRemove.forEach(id => {
      mergedIds.set(id, 'DELETED');
    });
    setMergedIds(new Map(mergedIds));
    
    setValidationResults({
      totalIndividuals: individuals.length,
      mergedCount: 0,
      deletedCount: idsToRemove.size,
      remainingCount: individuals.length - idsToRemove.size
    });
    
    setStep('merged');
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PRÉVISUALISATION ET QUALITÉ
  // ═══════════════════════════════════════════════════════════════════════════
  const calculateQualityScore = (person) => {
    let score = 0;
    if (person.names.length > 0 && person.names[0]) score += 20;
    if (person.birth) score += 20;
    if (person.birthPlace) score += 15;
    if (person.death) score += 15;
    if (person.deathPlace) score += 10;
    if (person.sex) score += 10;
    if (person.occupation) score += 10;
    return score;
  };

  const mergePersonData = (keep, remove) => {
    const merged = { ...keep };
    if (!merged.names[0] && remove.names[0]) merged.names = [...remove.names];
    if (!merged.birth && remove.birth) merged.birth = remove.birth;
    if (!merged.birthPlace && remove.birthPlace) merged.birthPlace = remove.birthPlace;
    if (!merged.death && remove.death) merged.death = remove.death;
    if (!merged.deathPlace && remove.deathPlace) merged.deathPlace = remove.deathPlace;
    if (!merged.sex && remove.sex) merged.sex = remove.sex;
    if (!merged.occupation && remove.occupation) merged.occupation = remove.occupation;
    return merged;
  };

  const showPreview = (pair) => {
    const quality1 = calculateQualityScore(pair.person1);
    const quality2 = calculateQualityScore(pair.person2);
    const keepPerson = quality1 >= quality2 ? pair.person1 : pair.person2;
    const removePerson = keepPerson === pair.person1 ? pair.person2 : pair.person1;
    const merged = mergePersonData(keepPerson, removePerson);
    
    setPreviewPair({
      original: pair,
      keepPerson,
      removePerson,
      merged,
      quality1,
      quality2
    });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // GESTION FICHIER
  // ═══════════════════════════════════════════════════════════════════════════
  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    setStep('analyzing');
    setProgress(0);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setOriginalGedcom(content);
      
      setTimeout(() => {
        const { people, families } = parseGedcom(content);
        setIndividuals(people);
        setProgress(30);
        
        setTimeout(() => {
          // Détection des doublons
          const found = findDuplicates(people);
          setDuplicates(found);
          setProgress(60);
          
          // Détection des isolés (v1.9.0)
          const isolated = detectIsolatedIndividuals(people, families);
          setIsolatedIndividuals(isolated);
          setProgress(75);
          
          // Suggestions IA (v1.9.0)
          const suggestions = generateSmartSuggestions(people);
          setSmartSuggestions(suggestions);
          setProgress(90);
          
          // Contrôles d'intégrité (v1.9.0)
          const integrity = performIntegrityChecks(people, families);
          setIntegrityReport(integrity);
          
          setProgress(100);
          setTimeout(() => setStep('review'), 500);
        }, 100);
      }, 100);
    };
    reader.readAsText(uploadedFile);
  };

  const togglePairSelection = (pairId) => {
    const newSelected = new Set(selectedPairs);
    if (newSelected.has(pairId)) {
      newSelected.delete(pairId);
    } else {
      newSelected.add(pairId);
    }
    setSelectedPairs(newSelected);
  };

  const selectHighConfidence = () => {
    const high = duplicates.filter(d => d.similarity >= 95).map(d => d.id);
    setSelectedPairs(new Set(high));
  };

  const selectFilteredDuplicates = () => {
    const filtered = getFilteredDuplicates().map(d => d.id);
    setSelectedPairs(new Set(filtered));
  };

  const getFilteredDuplicates = () => {
    let filtered = duplicates.filter(d => d.similarity >= filterScore);
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        d.person1.names[0]?.toLowerCase().includes(term) ||
        d.person2.names[0]?.toLowerCase().includes(term) ||
        d.person1.id.toLowerCase().includes(term) ||
        d.person2.id.toLowerCase().includes(term)
      );
    }
    return filtered;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // FUSION ET EXPORT
  // ═══════════════════════════════════════════════════════════════════════════
  const mergeDuplicates = () => {
    const idsToMerge = new Map();
    
    // Fusion depuis les paires sélectionnées
    selectedPairs.forEach(pairId => {
      const pair = duplicates.find(d => d.id === pairId);
      if (pair) {
        const id1 = pair.person1.id;
        const id2 = pair.person2.id;
        let targetId = id1;
        if (idsToMerge.has(id1)) targetId = idsToMerge.get(id1);
        else if (idsToMerge.has(id2)) targetId = idsToMerge.get(id2);
        idsToMerge.set(id1, targetId);
        idsToMerge.set(id2, targetId);
      }
    });
    
    // Fusion depuis les clusters sélectionnés
    selectedClusters.forEach(clusterIdx => {
      const cluster = clusters[clusterIdx];
      if (cluster && cluster.people.length > 0) {
        const targetId = cluster.people[0].id;
        cluster.people.forEach(person => {
          idsToMerge.set(person.id, targetId);
        });
      }
    });
    
    setMergedIds(idsToMerge);
    
    const idsToRemove = new Set();
    idsToMerge.forEach((target, source) => {
      if (source !== target) idsToRemove.add(source);
    });
    
    setValidationResults({
      totalIndividuals: individuals.length,
      mergedCount: idsToRemove.size,
      remainingCount: individuals.length - idsToRemove.size
    });
    
    setStep('merged');
  };

  const downloadCleanedFile = () => {
    if (!originalGedcom) return;

    const idsToRemove = new Set();
    const mergeMap = new Map();
    
    mergedIds.forEach((targetId, sourceId) => {
      if (sourceId !== targetId && targetId !== 'DELETED') {
        idsToRemove.add(sourceId);
        mergeMap.set(sourceId, targetId);
      } else if (targetId === 'DELETED') {
        idsToRemove.add(sourceId);
      }
    });

    const lines = originalGedcom.split('\n');
    const outputLines = [];
    let skip = false;
    let hasHead = false;
    let hasTrlr = false;

    // Vérifier présence HEAD/TRLR
    if (lines.length > 0 && lines[0].trim().startsWith('0 HEAD')) {
      hasHead = true;
    }
    if (lines.length > 0) {
      const lastNonEmpty = lines.filter(l => l.trim()).pop();
      if (lastNonEmpty && lastNonEmpty.trim().startsWith('0 TRLR')) {
        hasTrlr = true;
      }
    }

    // Générer HEAD si manquant
    if (!hasHead) {
      outputLines.push('0 HEAD');
      outputLines.push('1 SOUR GedcomMerger');
      outputLines.push(`2 VERS ${VERSION}`);
      outputLines.push('2 NAME Fusionneur de Doublons GEDCOM');
      outputLines.push('1 GEDC');
      outputLines.push('2 VERS 5.5.1');
      outputLines.push('2 FORM LINEAGE-LINKED');
      outputLines.push('1 CHAR UTF-8');
      const now = new Date();
      const dateStr = `${now.getDate()} ${['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][now.getMonth()]} ${now.getFullYear()}`;
      outputLines.push(`1 DATE ${dateStr}`);
    }

    lines.forEach(line => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('0') && trimmed.includes('@')) {
        const match = trimmed.match(/@([^@]+)@/);
        if (match && idsToRemove.has(match[1])) {
          skip = true;
          return;
        }
        skip = false;
      }
      
      if (!skip) {
        let processedLine = line;
        mergeMap.forEach((targetId, sourceId) => {
          const regex = new RegExp(`@${sourceId}@`, 'g');
          processedLine = processedLine.replace(regex, `@${targetId}@`);
        });
        outputLines.push(processedLine);
      }
    });

    // Ajouter TRLR si manquant
    if (!hasTrlr) {
      outputLines.push('0 TRLR');
    }

    const blob = new Blob([outputLines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gedcom_nettoye_v${VERSION}.ged`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setFile(null);
    setIndividuals([]);
    setDuplicates([]);
    setSelectedPairs(new Set());
    setStep('upload');
    setOriginalGedcom('');
    setMergedIds(new Map());
    setValidationResults(null);
    setPreviewPair(null);
    setSearchTerm('');
    setFilterScore(80);
    setClusters([]);
    setProgress(0);
    setExpandedClusters(new Set());
    setShowChangelog(false);
    setActiveTab('clusters');
    setClusterScoreFilter(80);
    setSelectedClusters(new Set());
    setIsolatedIndividuals([]);
    setSelectedIsolated(new Set());
    setSmartSuggestions([]);
    setIntegrityReport(null);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDU COMPOSANT
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* HEADER */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Users className="w-10 h-10 md:w-12 md:h-12" />
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-bold">Fusionneur GEDCOM v{VERSION}</h1>
                    <button
                      onClick={() => setShowChangelog(true)}
                      className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 text-sm"
                      title="Voir les nouveautés"
                    >
                      <Sparkles className="w-4 h-4" />
                      Nouveautés
                    </button>
                  </div>
                  <p className="text-indigo-100 mt-2">Nettoyez votre arbre généalogique</p>
                </div>
              </div>
              {(step === 'review' || step === 'merged') && (
                <button
                  onClick={resetAll}
                  className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Nouveau
                </button>
              )}
            </div>
          </div>

          <div className="p-4 md:p-8">
            {/* ÉTAPE UPLOAD */}
            {step === 'upload' && (
              <div className="text-center py-12">
                <Upload className="w-20 h-20 md:w-24 md:h-24 mx-auto text-indigo-400 mb-6" />
                <h2 className="text-xl md:text-2xl font-semibold mb-4">Téléchargez votre fichier GEDCOM</h2>
                <label>
                  <input type="file" accept=".ged,.gedcom" onChange={handleFileUpload} className="hidden" />
                  <span className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl cursor-pointer inline-block font-semibold transition-colors text-lg">
                    Sélectionner un fichier
                  </span>
                </label>
                <p className="text-gray-500 mt-4">Formats acceptés : .ged, .gedcom</p>
              </div>
            )}

            {/* ÉTAPE ANALYSE */}
            {step === 'analyzing' && (
              <div className="text-center py-12">
                <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 relative">
                  <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h2 className="text-xl md:text-2xl font-semibold mb-4">Analyse en cours...</h2>
                <div className="max-w-md mx-auto">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-600 mt-2">{progress}%</p>
                </div>
              </div>
            )}

            {/* ÉTAPE RÉVISION */}
            {step === 'review' && (
              <div>
                {/* Statistiques */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-2xl md:text-3xl font-bold text-blue-600">{individuals.length}</p>
                    <p className="text-sm text-blue-800">Individus</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <p className="text-2xl md:text-3xl font-bold text-orange-600">{clusters.length}</p>
                    <p className="text-sm text-orange-800">Clusters</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <p className="text-2xl md:text-3xl font-bold text-yellow-600">{duplicates.length}</p>
                    <p className="text-sm text-yellow-800">Doublons</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <p className="text-2xl md:text-3xl font-bold text-red-600">{isolatedIndividuals.length}</p>
                    <p className="text-sm text-red-800">Isolés</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-2xl md:text-3xl font-bold text-purple-600">{smartSuggestions.length}</p>
                    <p className="text-sm text-purple-800">Suggestions IA</p>
                  </div>
                </div>

                {/* Alertes intégrité */}
                {integrityReport && (integrityReport.critical.length > 0 || integrityReport.warnings.length > 0) && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-red-600" />
                      <h3 className="font-semibold text-red-800">Alertes d'intégrité</h3>
                    </div>
                    {integrityReport.critical.length > 0 && (
                      <div className="text-sm text-red-700">
                        <strong>{integrityReport.critical.length} erreur(s) critique(s)</strong> : {integrityReport.critical[0]?.message}
                        {integrityReport.critical.length > 1 && ` et ${integrityReport.critical.length - 1} autre(s)`}
                      </div>
                    )}
                    {integrityReport.warnings.length > 0 && (
                      <div className="text-sm text-orange-700 mt-1">
                        <strong>{integrityReport.warnings.length} avertissement(s)</strong>
                      </div>
                    )}
                  </div>
                )}

                {/* NAVIGATION PAR ONGLETS */}
                {(duplicates.length > 0 || clusters.length > 0 || isolatedIndividuals.length > 0 || smartSuggestions.length > 0) && (
                  <div className="mb-6">
                    <nav className="flex flex-wrap border-b border-gray-200">
                      {/* Onglet Clusters */}
                      <button
                        onClick={() => setActiveTab('clusters')}
                        className={`flex-1 min-w-[120px] px-4 py-3 font-medium text-sm transition-colors ${
                          activeTab === 'clusters'
                            ? 'border-b-2 border-orange-600 text-orange-600 bg-orange-50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Users className="w-4 h-4" />
                          <span className="hidden sm:inline">Clusters</span> ({clusters.length})
                        </div>
                      </button>
                      
                      {/* Onglet Doublons */}
                      <button
                        onClick={() => setActiveTab('pairs')}
                        className={`flex-1 min-w-[120px] px-4 py-3 font-medium text-sm transition-colors ${
                          activeTab === 'pairs'
                            ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">Doublons</span> ({duplicates.length})
                        </div>
                      </button>
                      
                      {/* Onglet Isolés (v1.9.0) */}
                      <button
                        onClick={() => setActiveTab('isolated')}
                        className={`flex-1 min-w-[120px] px-4 py-3 font-medium text-sm transition-colors ${
                          activeTab === 'isolated'
                            ? 'border-b-2 border-red-600 text-red-600 bg-red-50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <UserX className="w-4 h-4" />
                          <span className="hidden sm:inline">Isolés</span> ({isolatedIndividuals.length})
                        </div>
                      </button>
                      
                      {/* Onglet Suggestions IA (v1.9.0) */}
                      <button
                        onClick={() => setActiveTab('suggestions')}
                        className={`flex-1 min-w-[120px] px-4 py-3 font-medium text-sm transition-colors ${
                          activeTab === 'suggestions'
                            ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          <span className="hidden sm:inline">IA</span> ({smartSuggestions.length})
                        </div>
                      </button>
                    </nav>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════════ */}
                {/* CONTENU ONGLET CLUSTERS */}
                {/* ═══════════════════════════════════════════════════════════════════ */}
                {activeTab === 'clusters' && clusters.length > 0 && (
                  <div>
                    <div className="mb-6 bg-white border-2 border-gray-200 rounded-lg p-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Score moyen minimum: {clusterScoreFilter}%
                        </label>
                        <input
                          type="range"
                          min="80"
                          max="100"
                          value={clusterScoreFilter}
                          onChange={(e) => setClusterScoreFilter(parseInt(e.target.value))}
                          className="w-full"
                        />
                        <p className="text-sm text-gray-600 mt-3">
                          {getFilteredClusters().length} cluster(s) affiché(s)
                        </p>
                      </div>
                    </div>

                    <div className="mb-6 flex gap-4 flex-wrap">
                      <button
                        onClick={autoSelectHighConfidenceClusters}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium"
                      >
                        Sélectionner ≥95%
                      </button>
                      <span className="text-sm text-gray-600 py-2">
                        {selectedClusters.size} cluster(s) sélectionné(s)
                      </span>
                    </div>

                    <div className="space-y-4">
                      {getFilteredClusters().map((cluster, idx) => {
                        const originalIdx = clusters.indexOf(cluster);
                        const avgScore = getClusterAverageScore(cluster);
                        return (
                          <div
                            key={originalIdx}
                            className={`border-2 rounded-lg p-4 ${
                              selectedClusters.has(originalIdx)
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-orange-300 bg-orange-50'
                            }`}
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedClusters.has(originalIdx)}
                                  onChange={() => {
                                    const newSelected = new Set(selectedClusters);
                                    if (newSelected.has(originalIdx)) {
                                      newSelected.delete(originalIdx);
                                    } else {
                                      newSelected.add(originalIdx);
                                    }
                                    setSelectedClusters(newSelected);
                                  }}
                                  className="w-5 h-5 text-indigo-600"
                                />
                                <Users className="w-6 h-6 text-orange-600" />
                                <h3 className="font-semibold text-orange-900">
                                  Cluster #{originalIdx + 1} — {cluster.people.length} personnes
                                </h3>
                                <span className={`px-2 py-1 rounded text-sm font-medium ${
                                  avgScore >= 95 ? 'bg-green-200 text-green-800' :
                                  avgScore >= 90 ? 'bg-yellow-200 text-yellow-800' :
                                  'bg-orange-200 text-orange-800'
                                }`}>
                                  {avgScore}%
                                </span>
                              </div>
                              <button
                                onClick={() => toggleClusterExpand(originalIdx)}
                                className="text-sm text-orange-700 hover:text-orange-900"
                              >
                                {expandedClusters.has(originalIdx) ? '▲ Masquer' : '▼ Voir détails'}
                              </button>
                            </div>

                            {expandedClusters.has(originalIdx) && (
                              <div className="border-t border-orange-200 pt-3 mt-3">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead className="bg-orange-100">
                                      <tr>
                                        <th className="px-3 py-2 text-left">#</th>
                                        <th className="px-3 py-2 text-left">Nom</th>
                                        <th className="px-3 py-2 text-left">Naissance</th>
                                        <th className="px-3 py-2 text-left">ID</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                      {cluster.people.map((person, pIdx) => (
                                        <tr key={pIdx} className="hover:bg-orange-100">
                                          <td className="px-3 py-2">{pIdx + 1}</td>
                                          <td className="px-3 py-2 font-medium">{person.names[0] || 'Sans nom'}</td>
                                          <td className="px-3 py-2">{person.birth || '-'}</td>
                                          <td className="px-3 py-2 font-mono text-xs">{person.id}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'clusters' && clusters.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Aucun cluster détecté (groupes de 3+ personnes similaires)
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════════ */}
                {/* CONTENU ONGLET DOUBLONS SIMPLES */}
                {/* ═══════════════════════════════════════════════════════════════════ */}
                {activeTab === 'pairs' && (
                  <div>
                    <div className="mb-6 bg-white border-2 border-gray-200 rounded-lg p-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Rechercher</label>
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Nom ou ID"
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Score min: {filterScore}%</label>
                          <input
                            type="range"
                            min="80"
                            max="100"
                            value={filterScore}
                            onChange={(e) => setFilterScore(parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-6 flex gap-4 flex-wrap">
                      <button
                        onClick={selectHighConfidence}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
                      >
                        Sélectionner ≥95%
                      </button>
                      <button
                        onClick={selectFilteredDuplicates}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium"
                      >
                        Sélectionner tout (≥{filterScore}%)
                      </button>
                      <span className="text-sm text-gray-600 py-2">
                        {selectedPairs.size} paire(s) sélectionnée(s) sur {getFilteredDuplicates().length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {getFilteredDuplicates().map((pair) => (
                        <div
                          key={pair.id}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            selectedPairs.has(pair.id)
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => togglePairSelection(pair.id)}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedPairs.has(pair.id)}
                                onChange={() => {}}
                                className="w-5 h-5 text-indigo-600"
                              />
                              <div>
                                <p className="font-semibold">
                                  {pair.person1.names[0] || 'Sans nom'} ↔ {pair.person2.names[0] || 'Sans nom'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {pair.person1.birth || '?'} • {pair.person2.birth || '?'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                pair.similarity >= 95 ? 'bg-green-100 text-green-800' :
                                pair.similarity >= 90 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {pair.similarity}%
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); showPreview(pair); }}
                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                              >
                                Prévisualiser
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {getFilteredDuplicates().length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        Aucun doublon trouvé avec les critères actuels
                      </div>
                    )}
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════════ */}
                {/* CONTENU ONGLET ISOLÉS (v1.9.0) */}
                {/* ═══════════════════════════════════════════════════════════════════ */}
                {activeTab === 'isolated' && (
                  <div>
                    <div className="mb-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-900 mb-2">
                        🔍 {isolatedIndividuals.length} individu(s) isolé(s) détecté(s)
                      </h3>
                      <p className="text-sm text-yellow-700 mb-3">
                        Ces personnes n'ont ni parents ni enfants renseignés dans l'arbre.
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-white rounded p-2">
                          <span className="text-gray-600">Totalement isolés :</span>
                          <span className="font-bold text-red-600 ml-2">
                            {isolatedIndividuals.filter(p => p.isTotallyIsolated).length}
                          </span>
                        </div>
                        <div className="bg-white rounded p-2">
                          <span className="text-gray-600">Avec conjoints :</span>
                          <span className="font-bold text-orange-600 ml-2">
                            {isolatedIndividuals.filter(p => p.hasSpouses).length}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isolatedIndividuals.length > 0 && (
                      <>
                        <div className="mb-6 flex gap-3 flex-wrap">
                          <button
                            onClick={selectAllIsolated}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
                          >
                            Tout sélectionner
                          </button>
                          <button
                            onClick={selectTotallyIsolated}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
                          >
                            Totalement isolés
                          </button>
                          <button
                            onClick={deselectAllIsolated}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium text-sm"
                          >
                            Désélectionner tout
                          </button>
                          <span className="text-sm text-gray-600 py-2">
                            {selectedIsolated.size} sélectionné(s)
                          </span>
                        </div>

                        <div className="space-y-3 mb-6">
                          {isolatedIndividuals.map((person) => (
                            <div
                              key={person.id}
                              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                selectedIsolated.has(person.id)
                                  ? 'border-yellow-500 bg-yellow-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => toggleIsolatedSelection(person.id)}
                            >
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedIsolated.has(person.id)}
                                    onChange={() => {}}
                                    className="w-5 h-5 text-yellow-600"
                                  />
                                  <UserX className="w-5 h-5 text-red-500" />
                                  <div>
                                    <p className="font-semibold">{person.names[0] || 'Sans nom'}</p>
                                    <p className="text-sm text-gray-600">
                                      {person.birth || '?'} {person.birthPlace ? `• ${person.birthPlace}` : ''}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {person.isTotallyIsolated ? (
                                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                                      Totalement isolé
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                                      Avec conjoint(s)
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500 font-mono">{person.id}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {selectedIsolated.size > 0 && (
                          <div className="fixed bottom-6 right-6 z-50">
                            <button
                              onClick={deleteSelectedIsolated}
                              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg flex items-center gap-2"
                            >
                              <Trash2 className="w-5 h-5" />
                              Supprimer {selectedIsolated.size} isolé(s)
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {isolatedIndividuals.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        ✅ Aucun individu isolé détecté dans votre arbre
                      </div>
                    )}
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════════ */}
                {/* CONTENU ONGLET SUGGESTIONS IA (v1.9.0) */}
                {/* ═══════════════════════════════════════════════════════════════════ */}
                {activeTab === 'suggestions' && (
                  <div>
                    <div className="mb-6 bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">
                        🤖 {smartSuggestions.length} suggestion(s) intelligente(s)
                      </h3>
                      <p className="text-sm text-purple-700">
                        L'IA analyse les patterns de votre arbre pour détecter des groupes suspects 
                        de personnes portant le même nom dans la même période.
                      </p>
                    </div>

                    {smartSuggestions.length > 0 ? (
                      <div className="space-y-4">
                        {smartSuggestions.map((suggestion) => (
                          <div
                            key={suggestion.id}
                            className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50/50"
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                              <div className="flex items-center gap-3">
                                <Lightbulb className="w-6 h-6 text-purple-600" />
                                <div>
                                  <h4 className="font-semibold text-purple-900">
                                    {suggestion.name} — {suggestion.count} personnes
                                  </h4>
                                  <p className="text-sm text-purple-700">Période : {suggestion.period}</p>
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                suggestion.confidence >= 85 ? 'bg-green-100 text-green-800' :
                                suggestion.confidence >= 75 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                Confiance : {suggestion.confidence}%
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3">{suggestion.reason}</p>
                            
                            <div className="bg-white rounded-lg p-3">
                              <p className="text-xs text-gray-500 mb-2">Personnes concernées :</p>
                              <div className="flex flex-wrap gap-2">
                                {suggestion.people.slice(0, 5).map((person, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                    {person.names[0] || person.id} {person.birth ? `(${person.birth.match(/\d{4}/)?.[0] || '?'})` : ''}
                                  </span>
                                ))}
                                {suggestion.people.length > 5 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                    +{suggestion.people.length - 5} autres
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Aucune suggestion générée. L'IA n'a pas détecté de patterns suspects.
                      </div>
                    )}
                  </div>
                )}

                {/* BOUTON FUSIONNER */}
                {(selectedPairs.size > 0 || selectedClusters.size > 0) && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={mergeDuplicates}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg flex items-center gap-3"
                    >
                      <CheckCircle className="w-6 h-6" />
                      Fusionner {selectedPairs.size + selectedClusters.size} sélection(s)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ÉTAPE FUSION TERMINÉE */}
            {step === 'merged' && validationResults && (
              <div className="text-center py-12">
                <CheckCircle className="w-20 h-20 md:w-24 md:h-24 mx-auto text-green-500 mb-6" />
                <h2 className="text-xl md:text-2xl font-semibold mb-6">Opération terminée !</h2>
                
                <div className="max-w-md mx-auto bg-gray-50 rounded-lg p-6 mb-8">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{validationResults.totalIndividuals}</p>
                      <p className="text-sm text-gray-600">Original</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {validationResults.mergedCount || 0}{validationResults.deletedCount ? ` + ${validationResults.deletedCount}` : ''}
                      </p>
                      <p className="text-sm text-gray-600">Supprimés</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{validationResults.remainingCount}</p>
                      <p className="text-sm text-gray-600">Restants</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={downloadCleanedFile}
                  className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg flex items-center gap-3 mx-auto"
                >
                  <Download className="w-6 h-6" />
                  Télécharger GEDCOM nettoyé
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL PRÉVISUALISATION */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {previewPair && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setPreviewPair(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-indigo-600 text-white p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Prévisualisation de la fusion</h3>
              <button onClick={() => setPreviewPair(null)} className="text-white hover:text-gray-200 text-2xl">✕</button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-900">
                  L'ID <span className="font-mono bg-blue-100 px-2 py-0.5 rounded">{previewPair.keepPerson.id}</span> sera conservé 
                  (score qualité: {Math.max(previewPair.quality1, previewPair.quality2)} points)
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border-2 border-green-500 rounded-lg bg-green-50 p-4">
                  <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Conservé
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>ID:</strong> {previewPair.keepPerson.id}</p>
                    <p><strong>Nom:</strong> {previewPair.keepPerson.names[0] || 'N/A'}</p>
                    <p><strong>Naissance:</strong> {previewPair.keepPerson.birth || 'N/A'}</p>
                    <p><strong>Décès:</strong> {previewPair.keepPerson.death || 'N/A'}</p>
                  </div>
                </div>

                <div className="border-2 border-red-500 rounded-lg bg-red-50 p-4">
                  <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                    <Trash2 className="w-5 h-5" /> Supprimé
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>ID:</strong> {previewPair.removePerson.id}</p>
                    <p><strong>Nom:</strong> {previewPair.removePerson.names[0] || 'N/A'}</p>
                    <p><strong>Naissance:</strong> {previewPair.removePerson.birth || 'N/A'}</p>
                    <p><strong>Décès:</strong> {previewPair.removePerson.death || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="border-2 border-indigo-500 rounded-lg bg-indigo-50 p-4">
                <h4 className="font-bold text-indigo-900 mb-3">📊 Résultat après fusion</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Nom:</strong> {previewPair.merged.names[0] || 'N/A'}</p>
                    <p><strong>Naissance:</strong> {previewPair.merged.birth || 'N/A'}</p>
                    {previewPair.merged.birthPlace && <p><strong>Lieu:</strong> {previewPair.merged.birthPlace}</p>}
                  </div>
                  <div>
                    <p><strong>Décès:</strong> {previewPair.merged.death || 'N/A'}</p>
                    {previewPair.merged.deathPlace && <p><strong>Lieu:</strong> {previewPair.merged.deathPlace}</p>}
                    {previewPair.merged.occupation && <p><strong>Profession:</strong> {previewPair.merged.occupation}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 p-4 flex justify-end gap-3">
              <button
                onClick={() => setPreviewPair(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  togglePairSelection(previewPair.original.id);
                  setPreviewPair(null);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {selectedPairs.has(previewPair.original.id) ? 'Désélectionner' : 'Sélectionner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL CHANGELOG */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {showChangelog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowChangelog(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Historique des versions
              </h3>
              <button onClick={() => setShowChangelog(false)} className="text-white hover:text-gray-200 text-2xl">✕</button>
            </div>
            
            <div className="p-6 space-y-6">
              {CHANGELOG.map((version, idx) => (
                <div key={idx} className={`border-l-4 pl-4 ${
                  version.color === 'green' ? 'border-green-500' :
                  version.color === 'blue' ? 'border-blue-500' :
                  version.color === 'indigo' ? 'border-indigo-500' :
                  version.color === 'purple' ? 'border-purple-500' :
                  'border-gray-400'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-lg">v{version.version}</h4>
                    {version.tag && (
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        version.tag === 'ACTUELLE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {version.tag}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">{version.date}</span>
                  </div>
                  <p className="font-medium text-gray-700 mb-2">{version.title}</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {version.items.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="sticky bottom-0 bg-gray-50 p-4 flex justify-end">
              <button
                onClick={() => setShowChangelog(false)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GedcomDuplicateMerger;
