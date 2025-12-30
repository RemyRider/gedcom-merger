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
  const [showIntegrityModal, setShowIntegrityModal] = useState(false);
  const [familiesData, setFamiliesData] = useState(new Map());

  const VERSION = '1.9.4';

  const CHANGELOG = [
    {
      version: '1.9.4',
      date: '30 décembre 2025',
      tag: 'ACTUELLE',
      color: 'green',
      title: 'Contrôle intégrité + Boutons dynamiques + Recommencer header',
      items: [
        'Contrôle d\'intégrité 8 types restauré (v1.6.1)',
        'Bouton Recommencer déplacé dans le header',
        'Boutons sélection affichent la valeur dynamique du filtre',
        'Affichage complet des détails dans l\'onglet IA',
        'Modal intégrité avec rapport détaillé'
      ]
    },
    {
      version: '1.9.3',
      date: '30 décembre 2025',
      tag: null,
      color: 'blue',
      title: 'Onglet À supprimer + Bouton flottant + Tableau clusters',
      items: [
        'Onglet "À supprimer" remplace "Isolés" avec filtrage strict',
        'Critères: totalement isolés (sans famille) OU sans nom/prénom',
        'Bouton flottant pour actions rapides sans scroller',
        'Tableau clusters détaillé avec 9 colonnes',
        'Action "Supprimer" distincte de "Fusionner"',
        'Préservation complète algorithme anti-faux-positifs v1.9.2'
      ]
    },
    {
      version: '1.9.2',
      date: '28 décembre 2025',
      tag: null,
      color: 'blue',
      title: 'CORRECTION CRITIQUE : Algorithme anti-faux-positifs',
      items: [
        'CORRECTION MAJEURE: Nom + Sexe ne suffisent plus pour être doublon',
        'Nouvelle règle: AU MOINS 1 critère suffisant requis',
        'Critères suffisants: naissance, lieu, parents, conjoints, fratrie, décès, profession'
      ]
    },
    {
      version: '1.8.7',
      date: '24 décembre 2025',
      tag: null,
      color: 'indigo',
      title: 'Version complète avec toutes les corrections',
      items: [
        'Système onglets Clusters/Doublons simples',
        'Scoring moyen des clusters avec jauges visuelles',
        'Filtre pourcentage minimum pour clusters'
      ]
    },
    {
      version: '1.8.6',
      date: '16 décembre 2025',
      tag: null,
      color: 'blue',
      title: 'Corrections GEDCOM et génération HEAD/TRLR',
      items: [
        'Correction gestion balises CONT/CONC multi-lignes',
        'Génération automatique en-tête HEAD complet'
      ]
    }
  ];

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
      else if (currentPerson) {
        if (trimmed.includes('NAME')) {
          const name = trimmed.split('NAME')[1]?.trim();
          if (name) { currentPerson.names.push(name); lastFieldType = 'NAME'; }
        } else if (trimmed.includes('SEX')) {
          currentPerson.sex = trimmed.split('SEX')[1]?.trim() || '';
        } else if (trimmed.startsWith('1 BIRT')) currentEvent = 'birth';
        else if (trimmed.startsWith('1 DEAT')) currentEvent = 'death';
        else if (trimmed.startsWith('1 OCCU')) {
          currentPerson.occupation = trimmed.split('OCCU')[1]?.trim() || '';
          lastFieldType = 'OCCU';
        } else if (currentEvent && trimmed.includes('DATE')) {
          const date = trimmed.split('DATE')[1]?.trim() || '';
          if (currentEvent === 'birth') { currentPerson.birth = date; lastFieldType = 'BIRT_DATE'; }
          else if (currentEvent === 'death') { currentPerson.death = date; lastFieldType = 'DEAT_DATE'; }
        } else if (currentEvent && trimmed.includes('PLAC')) {
          const place = normalizePlace(trimmed.split('PLAC')[1]?.trim() || '');
          if (currentEvent === 'birth') { currentPerson.birthPlace = place; lastFieldType = 'BIRT_PLAC'; }
          else if (currentEvent === 'death') { currentPerson.deathPlace = place; lastFieldType = 'DEAT_PLAC'; }
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
        }
      });
    });
    
    return { people, families };
  };

  const calculateSimilarity = (person1, person2) => {
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
        else { details.push('✗ Sexes différents (ÉLIMINATOIRE)'); return { score: 0, details, sufficientCriteria: [] }; }
      }
    }

    if (person1.parents.length > 0 || person2.parents.length > 0) {
      maxPossibleScore += 20;
      if (person1.parents.length > 0 && person2.parents.length > 0) {
        const common = person1.parents.filter(p => person2.parents.includes(p));
        if (common.length === 2) { matchScore += 20; sufficientCriteria.push('parents_2'); details.push('✓ 2 parents communs (+20/20)'); }
        else if (common.length === 1) { matchScore += 10; sufficientCriteria.push('parent_1'); details.push('≈ 1 parent commun (+10/20)'); }
        else details.push('✗ Parents différents (0/20)');
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
        else details.push('✗ Conjoints différents (0/8)');
      }
    }

    if (person1.death || person2.death) {
      maxPossibleScore += 15;
      if (person1.death && person2.death) {
        const dy1 = person1.death.match(/\d{4}/), dy2 = person2.death.match(/\d{4}/);
        if (person1.death === person2.death) { matchScore += 15; sufficientCriteria.push('deces_exact'); details.push('✓ Dates décès identiques (+15/15)'); }
        else if (dy1 && dy2 && dy1[0] === dy2[0]) { matchScore += 10; sufficientCriteria.push('annee_deces'); details.push('✓ Années décès identiques (+10/15)'); }
        else details.push('✗ Dates décès différentes (0/15)');
      }
    }

    if (person1.occupation || person2.occupation) {
      maxPossibleScore += 5;
      if (person1.occupation && person2.occupation) {
        if (person1.occupation.toLowerCase() === person2.occupation.toLowerCase()) { matchScore += 5; sufficientCriteria.push('profession'); details.push('✓ Même profession (+5/5)'); }
        else details.push('✗ Professions différentes (0/5)');
      }
    }

    const finalScore = maxPossibleScore > 0 ? Math.round((matchScore / maxPossibleScore) * 100) : 0;
    
    if (nameMatches && sufficientCriteria.length === 0) {
      details.unshift('⚠️ REJET: Nom seul insuffisant - aucun critère confirmant');
      return { score: 0, details, sufficientCriteria, rejected: true, rejectionReason: 'Nom + Sexe seuls ne suffisent pas.' };
    }
    
    details.unshift('📊 Score: ' + matchScore + '/' + maxPossibleScore + ' points | Critères suffisants: ' + (sufficientCriteria.length > 0 ? sufficientCriteria.join(', ') : 'AUCUN'));
    return { score: finalScore, details, sufficientCriteria };
  };

  const findDuplicates = (people) => {
    const result = [];
    const phoneticIndex = new Map(), yearIndex = new Map(), parentIndex = new Map();
    
    people.forEach(person => {
      const fullName = person.names[0] || '';
      const parts = fullName.toLowerCase().split(' ');
      const firstName = parts[0] || '', lastName = parts[parts.length - 1]?.replace(/\//g, '') || '';
      const key = soundex(firstName) + '-' + soundex(lastName);
      if (!phoneticIndex.has(key)) phoneticIndex.set(key, []);
      phoneticIndex.get(key).push(person);
      
      const year = person.birth?.match(/\d{4}/)?.[0];
      if (year) {
        const y = parseInt(year);
        for (let i = y - 5; i <= y + 5; i++) {
          const yearKey = String(i);
          if (!yearIndex.has(yearKey)) yearIndex.set(yearKey, []);
          yearIndex.get(yearKey).push(person);
        }
      }
      person.parents.forEach(parentId => {
        if (!parentIndex.has(parentId)) parentIndex.set(parentId, []);
        parentIndex.get(parentId).push(person);
      });
    });
    
    const compared = new Set();
    
    const comparePair = (person1, person2) => {
      if (person1.id === person2.id) return;
      const pairKey = person1.id < person2.id ? person1.id + '-' + person2.id : person2.id + '-' + person1.id;
      if (compared.has(pairKey)) return;
      compared.add(pairKey);
      if (person1.sex && person2.sex && person1.sex !== person2.sex) return;
      const y1 = person1.birth?.match(/\d{4}/)?.[0], y2 = person2.birth?.match(/\d{4}/)?.[0];
      if (y1 && y2 && Math.abs(parseInt(y1) - parseInt(y2)) > 10) return;
      const sim = calculateSimilarity(person1, person2);
      if (sim.rejected) return;
      if (sim.score >= 80) {
        result.push({ person1, person2, similarity: Math.round(sim.score), details: sim.details, sufficientCriteria: sim.sufficientCriteria, id: pairKey });
      }
    };
    
    people.forEach((person, i) => {
      const fullName = person.names[0] || '';
      const parts = fullName.toLowerCase().split(' ');
      const firstName = parts[0] || '', lastName = parts[parts.length - 1]?.replace(/\//g, '') || '';
      const phoneticKey = soundex(firstName) + '-' + soundex(lastName);
      (phoneticIndex.get(phoneticKey) || []).forEach(other => comparePair(person, other));
      const year = person.birth?.match(/\d{4}/)?.[0];
      if (year) (yearIndex.get(year) || []).forEach(other => comparePair(person, other));
      person.parents.forEach(parentId => (parentIndex.get(parentId) || []).forEach(other => comparePair(person, other)));
      if (i % 100 === 0) setProgress(30 + Math.round((i / people.length) * 65));
    });
    
    const sorted = result.sort((a, b) => b.similarity - a.similarity);
    detectClusters(sorted, people);
    return sorted;
  };

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
    
    graph.forEach((_, nodeId) => {
      if (!visited.has(nodeId)) {
        const cluster = new Set();
        dfs(nodeId, cluster);
        if (cluster.size > 2) {
          const clusterIds = Array.from(cluster);
          const clusterPeople = clusterIds.map(id => allPeople.find(p => p.id === id)).filter(p => p != null);
          if (clusterPeople.length > 2) {
            const clusterPairs = duplicates.filter(d => clusterIds.includes(d.person1.id) && clusterIds.includes(d.person2.id));
            const avgScore = clusterPairs.length > 0 ? Math.round(clusterPairs.reduce((sum, p) => sum + p.similarity, 0) / clusterPairs.length) : 0;
            foundClusters.push({ ids: clusterIds, size: clusterPeople.length, people: clusterPeople, avgScore, pairs: clusterPairs });
          }
        }
      }
    });
    foundClusters.sort((a, b) => b.avgScore - a.avgScore);
    setClusters(foundClusters);
  };

  const detectToDeletePersons = (people, families) => {
    const toDelete = [];
    people.forEach(person => {
      const hasParents = person.parents.length > 0;
      const hasSpouses = person.spouses.length > 0;
      let hasChildren = false;
      families.forEach(family => {
        if ((family.husband === person.id || family.wife === person.id) && family.children.length > 0) hasChildren = true;
      });
      const isTotallyIsolated = !hasParents && !hasChildren && !hasSpouses;
      const fullName = person.names[0] || '';
      const nameParts = fullName.replace(/\//g, ' ').trim().split(/\s+/).filter(p => p.length > 0);
      const hasNoIdentity = nameParts.length === 0;
      if (isTotallyIsolated || hasNoIdentity) {
        let reason = isTotallyIsolated && hasNoIdentity ? 'Isolé + Sans identité' : isTotallyIsolated ? 'Totalement isolé' : 'Sans identité';
        toDelete.push({ ...person, isTotallyIsolated, hasNoIdentity, reason, hasSpouses, hasParents, hasChildren });
      }
    });
    return toDelete;
  };

  const generateAiSuggestions = (people) => {
    const suggestions = [];
    const lastNameGroups = new Map();
    people.forEach(person => {
      const fullName = person.names[0] || '';
      const lastName = fullName.split(' ').pop()?.replace(/\//g, '').toLowerCase() || '';
      const lastNameKey = soundex(lastName);
      if (!lastNameGroups.has(lastNameKey)) lastNameGroups.set(lastNameKey, []);
      lastNameGroups.get(lastNameKey).push(person);
    });
    lastNameGroups.forEach((group) => {
      if (group.length < 2) return;
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const p1 = group[i], p2 = group[j];
          if (p1.sex && p2.sex && p1.sex !== p2.sex) continue;
          const y1 = p1.birth?.match(/\d{4}/)?.[0], y2 = p2.birth?.match(/\d{4}/)?.[0];
          let yearDiff = (y1 && y2) ? Math.abs(parseInt(y1) - parseInt(y2)) : null;
          if (yearDiff === null || yearDiff <= 25) {
            const reasons = [];
            let confidence = 60;
            if (yearDiff !== null && yearDiff <= 10) { reasons.push('Nés à ' + yearDiff + ' ans d\'écart'); confidence += 15; }
            if (p1.birthPlace && p2.birthPlace && normalizePlace(p1.birthPlace).toLowerCase() === normalizePlace(p2.birthPlace).toLowerCase()) { reasons.push('Même lieu de naissance'); confidence += 10; }
            if (p1.parents.some(par => p2.parents.includes(par))) { reasons.push('Parents communs'); confidence += 10; }
            if (reasons.length >= 2 && confidence >= 60) suggestions.push({ person1: p1, person2: p2, confidence: Math.min(confidence, 95), reasons, type: 'pattern_match' });
          }
        }
      }
    });
    suggestions.sort((a, b) => b.confidence - a.confidence);
    return suggestions.slice(0, 50);
  };

  const checkIntegrity = (people) => {
    const errors = [], warnings = [];
    people.forEach(person => {
      if (!person.names[0] || person.names[0].trim() === '') errors.push({ type: 'no_name', personId: person.id, message: 'Personne ' + person.id + ' sans nom' });
      if (person.birth && person.death) {
        const birthYear = person.birth.match(/\d{4}/)?.[0], deathYear = person.death.match(/\d{4}/)?.[0];
        if (birthYear && deathYear && parseInt(birthYear) > parseInt(deathYear)) errors.push({ type: 'date_error', personId: person.id, message: (person.names[0] || person.id) + ': Naissance après décès' });
      }
    });
    return { errors, warnings };
  };

  const performIntegrityChecks = (people, families) => {
    const errors = [], warnings = [];
    let isolatedCount = 0, totalCompleteness = 0;
    const idSet = new Set(people.map(p => p.id));
    
    // Type 1: Vérification liens bidirectionnels famille-individu
    families.forEach((family, famId) => {
      if (family.husband && idSet.has(family.husband)) {
        const husband = people.find(p => p.id === family.husband);
        if (husband && !husband.familiesAsSpouse.includes(famId)) {
          warnings.push({ type: 'unidirectional_link', message: 'Lien unidirectionnel: Famille ' + famId + ' → ' + family.husband });
        }
      }
    });
    
    people.forEach(person => {
      // Type 4: Vérification structure GEDCOM (niveau cohérent)
      if (person.familyAsChild && !families.has(person.familyAsChild)) {
        warnings.push({ type: 'structure_error', message: (person.names[0] || person.id) + ': Saut de niveau - famille ' + person.familyAsChild + ' inexistante' });
      }
      
      // Type sans nom
      if (!person.names[0] || person.names[0].trim() === '') 
        errors.push({ type: 'no_name', message: person.id + ': Sans nom' });
      
      // Type 2: Dates incohérentes (naissance après décès)
      if (person.birth && person.death) {
        const by = person.birth.match(/\d{4}/)?.[0], dy = person.death.match(/\d{4}/)?.[0];
        if (by && dy && parseInt(by) > parseInt(dy))
          errors.push({ type: 'birth_after_death', message: (person.names[0] || person.id) + ': Naissance après décès' });
      }
      
      // Type 5: Références orphelines (parents inexistants)
      person.parents.forEach(parentId => {
        if (!idSet.has(parentId))
          warnings.push({ type: 'orphan_reference', message: (person.names[0] || person.id) + ': Parent ' + parentId + ' inexistant' });
      });
      
      // Type 7: Compteur isolés
      const hasFamily = person.parents.length > 0 || person.spouses.length > 0 || person.familiesAsSpouse.length > 0;
      if (!hasFamily) isolatedCount++;
      
      // Type 8: Score complétude
      let score = 0;
      if (person.names[0]) score += 2;
      if (person.birth) score += 2;
      if (person.death) score += 2;
      if (person.sex) score += 1;
      if (person.birthPlace) score += 1;
      if (person.parents.length > 0) score += 2;
      totalCompleteness += score;
    });
    
    // Type 3: Boucles généalogiques (échantillon)
    const checkLoop = (personId, ancestors = new Set()) => {
      if (ancestors.has(personId)) return true;
      const person = people.find(p => p.id === personId);
      if (!person) return false;
      ancestors.add(personId);
      for (const parentId of person.parents) {
        if (checkLoop(parentId, new Set(ancestors))) return true;
      }
      return false;
    };
    people.slice(0, 100).forEach(person => {
      if (checkLoop(person.id)) 
        errors.push({ type: 'genealogical_loop', message: (person.names[0] || person.id) + ': Boucle généalogique détectée' });
    });
    
    // Type 6: IDs dupliqués
    const idCounts = {};
    people.forEach(p => { idCounts[p.id] = (idCounts[p.id] || 0) + 1; });
    Object.entries(idCounts).forEach(([id, count]) => {
      if (count > 1) errors.push({ type: 'duplicate_id', message: 'ID ' + id + ' dupliqué ' + count + ' fois' });
    });
    
    const completenessScore = people.length > 0 ? Math.round((totalCompleteness / (people.length * 10)) * 100) : 0;
    
    return { 
      errors, 
      warnings, 
      isolatedCount, 
      completenessScore,
      errorCount: errors.length,
      warningCount: warnings.length,
      totalChecked: people.length
    };
  };

  const getClusterAverageScore = (cluster) => cluster.avgScore || 0;
  const getFilteredClusters = () => clusters.filter(cluster => getClusterAverageScore(cluster) >= clusterScoreFilter);
  const autoSelectHighConfidenceClusters = () => {
    const newSelected = new Set();
    clusters.forEach((cluster, idx) => { if (getClusterAverageScore(cluster) >= clusterScoreFilter) newSelected.add(idx); });
    setSelectedClusters(newSelected);
  };
  const selectCluster = (clusterIds) => {
    const newSelected = new Set(selectedPairs);
    duplicates.forEach(dup => { if (clusterIds.includes(dup.person1.id) && clusterIds.includes(dup.person2.id)) newSelected.add(dup.id); });
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
  const selectHighConfidence = () => {
    const highConfidencePairs = duplicates.filter(pair => pair.similarity >= filterScore).map(pair => pair.id);
    setSelectedPairs(new Set(highConfidencePairs));
  };
  const getPersonName = (personId) => {
    const person = individuals.find(p => p.id === personId);
    return person?.names[0] || personId;
  };

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setProgress(5);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setOriginalGedcom(content);
        setProgress(15);
        const { people, families } = parseGedcom(content);
        setProgress(30);
        setIndividuals(people);
        setFamiliesData(families);
        const dups = findDuplicates(people);
        setDuplicates(dups);
        const toDelete = detectToDeletePersons(people, families);
        setToDeletePersons(toDelete);
        const suggestions = generateAiSuggestions(people);
        setSmartSuggestions(suggestions);
        const integrity = performIntegrityChecks(people, families);
        setIntegrityReport(integrity);
        setProgress(100);
        setStep('review');
      };
      reader.readAsText(uploadedFile);
    }
  };

  const handleMerge = () => {
    if (selectedPairs.size === 0) return;
    const idsToMerge = new Map();
    duplicates.forEach(pair => {
      if (selectedPairs.has(pair.id)) {
        const quality1 = calculateDataQuality(pair.person1), quality2 = calculateDataQuality(pair.person2);
        const keepPerson = quality1 >= quality2 ? pair.person1 : pair.person2;
        const id1 = pair.person1.id, id2 = pair.person2.id;
        let targetId = keepPerson.id;
        if (idsToMerge.has(id1)) targetId = idsToMerge.get(id1);
        else if (idsToMerge.has(id2)) targetId = idsToMerge.get(id2);
        idsToMerge.set(id1, targetId);
        idsToMerge.set(id2, targetId);
      }
    });
    setMergedIds(idsToMerge);
    const idsToRemove = new Set();
    idsToMerge.forEach((target, source) => { if (source !== target) idsToRemove.add(source); });
    setValidationResults({ totalIndividuals: individuals.length, mergedCount: idsToRemove.size, deletedCount: 0, remainingCount: individuals.length - idsToRemove.size });
    setStep('merged');
  };

  const handleDeleteToDelete = () => {
    if (selectedToDelete.size === 0) return;
    if (!window.confirm('⚠️ Vous allez SUPPRIMER définitivement ' + selectedToDelete.size + ' individu(s) de votre arbre.\n\nCette action est irréversible. Continuer ?')) return;
    setMergedIds(new Map());
    setValidationResults({ totalIndividuals: individuals.length, mergedCount: 0, deletedCount: selectedToDelete.size, remainingCount: individuals.length - selectedToDelete.size });
    setStep('merged');
  };

  const downloadCleanedFile = () => {
    if (!originalGedcom) return;
    const idsToRemove = new Set();
    const mergeMap = new Map();
    mergedIds.forEach((targetId, sourceId) => { if (sourceId !== targetId) { idsToRemove.add(sourceId); mergeMap.set(sourceId, targetId); } });
    selectedToDelete.forEach(id => idsToRemove.add(id));
    const lines = originalGedcom.split('\n');
    const outputLines = [];
    let skip = false;
    let hasHead = lines.length > 0 && lines[0].trim().startsWith('0 HEAD');
    if (!hasHead) {
      outputLines.push('0 HEAD', '1 SOUR GedcomMerger', '2 VERS ' + VERSION, '2 NAME Fusionneur de Doublons GEDCOM', '1 GEDC', '2 VERS 5.5.1', '2 FORM LINEAGE-LINKED', '1 CHAR UTF-8');
      const now = new Date();
      const dateStr = now.getDate() + ' ' + ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][now.getMonth()] + ' ' + now.getFullYear();
      outputLines.push('1 DATE ' + dateStr);
    }
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i], trimmed = line.trim();
      if (trimmed.startsWith('0 TRLR')) continue;
      if (trimmed.startsWith('0 ')) {
        skip = false;
        if (trimmed.includes('@')) {
          const match = trimmed.match(/@([^@]+)@/);
          if (match && idsToRemove.has(match[1])) { skip = true; continue; }
        }
      }
      if (skip) continue;
      let processedLine = line;
      mergeMap.forEach((targetId, sourceId) => { processedLine = processedLine.replace(new RegExp('@' + sourceId + '@', 'g'), '@' + targetId + '@'); });
      outputLines.push(processedLine);
    }
    outputLines.push('0 TRLR');
    const blob = new Blob([outputLines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gedcom_nettoye_' + new Date().toISOString().slice(0,10) + '.ged';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setStep('upload'); setIndividuals([]); setDuplicates([]); setSelectedPairs(new Set());
    setOriginalGedcom(''); setSearchTerm(''); setFilterScore(80); setProgress(0);
    setActiveTab('clusters'); setClusterScoreFilter(80); setSelectedClusters(new Set());
    setClusters([]); setExpandedClusters(new Set()); setToDeletePersons([]);
    setSelectedToDelete(new Set()); setSmartSuggestions([]); setIntegrityReport(null);
    setFile(null); setMergedIds(new Map()); setValidationResults(null); setPreviewPair(null);
    setFamiliesData(new Map());
  };

  const getFilteredDuplicates = () => duplicates.filter(pair => pair.similarity >= filterScore && (!searchTerm || pair.person1.names.some(n => n.toLowerCase().includes(searchTerm.toLowerCase())) || pair.person2.names.some(n => n.toLowerCase().includes(searchTerm.toLowerCase()))));
  const getSimplePairs = () => {
    const clusterIds = new Set();
    clusters.forEach(c => c.ids.forEach(id => clusterIds.add(id)));
    return getFilteredDuplicates().filter(pair => !clusterIds.has(pair.person1.id) && !clusterIds.has(pair.person2.id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">Fusionneur GEDCOM</h1>
              <p className="text-emerald-100 text-sm">v{VERSION} - Contrôle intégrité + Boutons dynamiques</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {step !== 'upload' && integrityReport && (
              <button onClick={() => setShowIntegrityModal(true)} className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Intégrité</span>
                {integrityReport.errorCount > 0 && <span className="px-1.5 py-0.5 bg-red-500 rounded-full text-xs">{integrityReport.errorCount}</span>}
              </button>
            )}
            {step !== 'upload' && (
              <button onClick={resetAll} className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                <RefreshCw className="w-4 h-4" /><span className="hidden sm:inline">Recommencer</span>
              </button>
            )}
            <button onClick={() => setShowChangelog(true)} className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
              <Sparkles className="w-4 h-4" /><span className="hidden sm:inline">Nouveautés</span>
            </button>
          </div>
        </div>
      </div>

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

      <div className="max-w-7xl mx-auto px-4 py-6">
        {step === 'upload' && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="text-center mb-6">
                <Upload className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Importer votre fichier GEDCOM</h2>
                <p className="text-gray-500 mt-2">Glissez-déposez ou sélectionnez un fichier .ged</p>
              </div>
              <label className="block">
                <div className="border-2 border-dashed border-emerald-300 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                  <input type="file" accept=".ged,.gedcom" onChange={handleFileUpload} className="hidden" />
                  <FileText className="w-12 h-12 mx-auto text-emerald-400 mb-3" />
                  <p className="text-emerald-600 font-medium">Cliquez pour sélectionner</p>
                  <p className="text-gray-400 text-sm mt-1">ou glissez-déposez ici</p>
                </div>
              </label>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2"><AlertCircle className="w-5 h-5" />Nouveauté v1.9.3</h3>
                <p className="text-blue-700 text-sm mt-1">Nouvel onglet "À supprimer" avec critères stricts : individus totalement isolés (sans famille) ou sans identité. Bouton flottant pour actions rapides.</p>
              </div>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div>
            {integrityReport && integrityReport.errors.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-800 flex items-center gap-2"><AlertCircle className="w-5 h-5" />{integrityReport.errors.length} erreur(s) détectée(s)</h3>
                <ul className="mt-2 text-sm text-red-700">{integrityReport.errors.slice(0, 5).map((err, i) => <li key={i}>• {err.message}</li>)}</ul>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              <div className="bg-white rounded-xl p-4 shadow border"><div className="text-2xl font-bold text-gray-800">{individuals.length}</div><div className="text-sm text-gray-500">Individus</div></div>
              <div className="bg-white rounded-xl p-4 shadow border"><div className="text-2xl font-bold text-orange-600">{clusters.length}</div><div className="text-sm text-gray-500">Clusters</div></div>
              <div className="bg-white rounded-xl p-4 shadow border"><div className="text-2xl font-bold text-blue-600">{getSimplePairs().length}</div><div className="text-sm text-gray-500">Doublons</div></div>
              <div className="bg-white rounded-xl p-4 shadow border"><div className="text-2xl font-bold text-red-600">{toDeletePersons.length}</div><div className="text-sm text-gray-500">À supprimer</div></div>
              <div className="bg-white rounded-xl p-4 shadow border"><div className="text-2xl font-bold text-purple-600">{smartSuggestions.length}</div><div className="text-sm text-gray-500">Suggestions IA</div></div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
              <div className="flex border-b">
                {[
                  { id: 'clusters', label: 'Clusters', icon: '🟠', count: getFilteredClusters().length },
                  { id: 'pairs', label: 'Doublons', icon: '🔵', count: getSimplePairs().length },
                  { id: 'toDelete', label: 'À supprimer', icon: '🗑️', count: toDeletePersons.length },
                  { id: 'ai', label: 'Suggestions IA', icon: '🟣', count: smartSuggestions.length }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                    <span className="mr-1">{tab.icon}</span><span className="hidden sm:inline">{tab.label}</span><span className="ml-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">{tab.count}</span>
                  </button>
                ))}
              </div>

              <div className="p-4">
                {activeTab === 'clusters' && (
                  <div>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Score min:</label>
                        <input type="range" min="80" max="100" value={clusterScoreFilter} onChange={(e) => setClusterScoreFilter(parseInt(e.target.value))} className="w-24" />
                        <span className="text-sm font-medium">{clusterScoreFilter}%</span>
                      </div>
                      <button onClick={autoSelectHighConfidenceClusters} className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Sélectionner ≥{clusterScoreFilter}%</button>
                    </div>
                    {getFilteredClusters().length === 0 ? <p className="text-center text-gray-500 py-8">Aucun cluster trouvé avec ce filtre</p> : (
                      <div className="space-y-3">
                        {getFilteredClusters().map((cluster, idx) => (
                          <div key={idx} className={`border rounded-lg p-3 ${selectedClusters.has(idx) ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="font-medium">{cluster.size} personnes</span>
                                <span className={`px-2 py-0.5 rounded text-sm ${cluster.avgScore >= 95 ? 'bg-green-100 text-green-800' : cluster.avgScore >= 90 ? 'bg-yellow-100 text-yellow-800' : 'bg-orange-100 text-orange-800'}`}>Score: {cluster.avgScore}%</span>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => toggleClusterExpand(idx)} className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-1">
                                  {expandedClusters.has(idx) ? <>Réduire <ChevronUp className="w-4 h-4" /></> : <>Détails <ChevronDown className="w-4 h-4" /></>}
                                </button>
                                <button onClick={() => selectCluster(cluster.ids)} className="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700">Sélectionner</button>
                              </div>
                            </div>
                            {expandedClusters.has(idx) && (
                              <div className="mt-3 pt-3 border-t">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-2 py-1 text-left font-medium text-gray-600">#</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-600">Nom complet</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-600">Naissance</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-600">Lieu</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-600">Décès</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-600">Sexe</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-600">Parents</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-600">Conjoints</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-600">ID</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {cluster.people.map((person, pIdx) => (
                                        <tr key={person.id} className={pIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                          <td className="px-2 py-1 text-gray-500">{pIdx + 1}</td>
                                          <td className="px-2 py-1 font-medium">{person.names[0] || '-'}</td>
                                          <td className="px-2 py-1">{person.birth || '-'}</td>
                                          <td className="px-2 py-1">{person.birthPlace || '-'}</td>
                                          <td className="px-2 py-1">{person.death || '-'}</td>
                                          <td className="px-2 py-1">{person.sex || '-'}</td>
                                          <td className="px-2 py-1 text-xs">{person.parents.length > 0 ? person.parents.map(p => getPersonName(p)).join(', ') : '-'}</td>
                                          <td className="px-2 py-1 text-xs">{person.spouses.length > 0 ? person.spouses.map(s => getPersonName(s)).join(', ') : '-'}</td>
                                          <td className="px-2 py-1 text-xs text-gray-400">{person.id}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                <div className="mt-2 pt-2 border-t text-xs text-gray-500 flex flex-wrap gap-3">
                                  <span>📊 Avec naissance: {cluster.people.filter(p => p.birth).length}/{cluster.size}</span>
                                  <span>📊 Avec décès: {cluster.people.filter(p => p.death).length}/{cluster.size}</span>
                                  <span>📊 Paires liées: {cluster.pairs?.length || 0}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'pairs' && (
                  <div>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <input type="text" placeholder="Rechercher par nom ou ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-3 py-2 border rounded-lg text-sm flex-1 min-w-[200px]" />
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Score min:</label>
                        <input type="range" min="80" max="100" value={filterScore} onChange={(e) => setFilterScore(parseInt(e.target.value))} className="w-24" />
                        <span className="text-sm font-medium">{filterScore}%</span>
                      </div>
                      <button onClick={selectHighConfidence} className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">Sélectionner ≥{filterScore}%</button>
                    </div>
                    {getSimplePairs().length === 0 ? <p className="text-center text-gray-500 py-8">Aucun doublon simple trouvé</p> : (
                      <div className="space-y-2">
                        {getSimplePairs().slice(0, 50).map((pair) => (
                          <div key={pair.id} className={`border rounded-lg p-3 ${selectedPairs.has(pair.id) ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium">{pair.person1.names[0] || pair.person1.id}</div>
                                <div className="text-sm text-gray-500">↔ {pair.person2.names[0] || pair.person2.id}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-sm font-medium ${pair.similarity >= 95 ? 'bg-green-100 text-green-800' : pair.similarity >= 90 ? 'bg-yellow-100 text-yellow-800' : 'bg-orange-100 text-orange-800'}`}>{pair.similarity}%</span>
                                <button onClick={() => openPreview(pair)} className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">Prévisualiser</button>
                                <button onClick={() => togglePairSelection(pair.id)} className={`px-2 py-1 text-sm rounded ${selectedPairs.has(pair.id) ? 'bg-emerald-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{selectedPairs.has(pair.id) ? '✓' : 'Sélectionner'}</button>
                              </div>
                            </div>
                            {pair.sufficientCriteria && pair.sufficientCriteria.length > 0 && <div className="mt-2 text-xs text-emerald-600">Critères validants: {pair.sufficientCriteria.join(', ')}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'toDelete' && (
                  <div>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <button onClick={() => setSelectedToDelete(new Set(toDeletePersons.map(p => p.id)))} className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">Tout sélectionner</button>
                      <button onClick={() => setSelectedToDelete(new Set(toDeletePersons.filter(p => p.isTotallyIsolated).map(p => p.id)))} className="px-3 py-1 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700">Totalement isolés</button>
                      <button onClick={() => setSelectedToDelete(new Set(toDeletePersons.filter(p => p.hasNoIdentity).map(p => p.id)))} className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">Sans identité</button>
                      <button onClick={() => setSelectedToDelete(new Set())} className="px-3 py-1 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600">Désélectionner tout</button>
                      <span className="text-sm text-gray-500 self-center">{selectedToDelete.size} sélectionné(s)</span>
                    </div>
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm"><span className="font-medium">Totalement isolés:</span> {toDeletePersons.filter(p => p.isTotallyIsolated).length}<span className="mx-2">|</span><span className="font-medium">Sans identité:</span> {toDeletePersons.filter(p => p.hasNoIdentity).length}</div>
                      <p className="text-xs text-gray-500 mt-1">Critères: totalement isolé (sans parents, enfants, conjoints) OU sans nom/prénom</p>
                    </div>
                    {toDeletePersons.length === 0 ? <p className="text-center text-gray-500 py-8">Aucun individu à supprimer trouvé</p> : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {toDeletePersons.map((person) => (
                          <div key={person.id} className={`border rounded-lg p-3 ${selectedToDelete.has(person.id) ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{person.names[0] || '[ID: ' + person.id + ']'}</div>
                                <div className="flex gap-2 mt-1">
                                  <span className={`text-xs px-2 py-0.5 rounded ${person.reason === 'Isolé + Sans identité' ? 'bg-purple-100 text-purple-800' : person.reason === 'Totalement isolé' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>{person.reason}</span>
                                </div>
                              </div>
                              <button onClick={() => { const newSelected = new Set(selectedToDelete); if (newSelected.has(person.id)) newSelected.delete(person.id); else newSelected.add(person.id); setSelectedToDelete(newSelected); }} className={`px-2 py-1 text-sm rounded ${selectedToDelete.has(person.id) ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{selectedToDelete.has(person.id) ? '✓' : 'Sélectionner'}</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'ai' && (
                  <div>
                    <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 text-purple-800"><Brain className="w-5 h-5" /><span className="font-medium">Analyse de patterns</span></div>
                      <p className="text-sm text-purple-600 mt-1">Ces suggestions sont basées sur l'analyse des noms, périodes et lieux. Vérifiez chaque suggestion avant de l'accepter.</p>
                    </div>
                    {smartSuggestions.length === 0 ? <p className="text-center text-gray-500 py-8">Aucune suggestion IA disponible</p> : (
                      <div className="space-y-3">
                        {smartSuggestions.map((suggestion, idx) => (
                          <div key={idx} className="border border-purple-200 rounded-lg p-3 bg-purple-50/30">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`px-2 py-1 rounded text-sm font-medium ${suggestion.confidence >= 90 ? 'bg-green-100 text-green-800' : suggestion.confidence >= 75 ? 'bg-yellow-100 text-yellow-800' : 'bg-purple-100 text-purple-800'}`}>Confiance: {suggestion.confidence}%</span>
                            </div>
                            <div className="text-sm">
                              <div className="font-medium">{suggestion.person1.names[0] || suggestion.person1.id}</div>
                              <div className="text-gray-500">↔ {suggestion.person2.names[0] || suggestion.person2.id}</div>
                            </div>
                            <div className="mt-2 text-xs text-purple-600">Raisons: {suggestion.reasons.join(' • ')}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {(selectedPairs.size > 0 || selectedToDelete.size > 0) && (
              <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
                {selectedPairs.size > 0 && <button onClick={handleMerge} className="px-6 py-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 font-medium flex items-center gap-2"><Users className="w-5 h-5" />Fusionner {selectedPairs.size} doublon(s)</button>}
                {selectedToDelete.size > 0 && <button onClick={handleDeleteToDelete} className="px-6 py-3 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 font-medium flex items-center gap-2"><Trash2 className="w-5 h-5" />Supprimer {selectedToDelete.size} individu(s)</button>}
              </div>
            )}

            <div className="mt-6 flex justify-center">
              <button onClick={resetAll} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Recommencer</button>
            </div>
          </div>
        )}

        {step === 'merged' && validationResults && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 border">
              <div className="text-center mb-6">
                <CheckCircle className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Traitement terminé !</h2>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div><div className="text-2xl font-bold text-gray-800">{validationResults.totalIndividuals}</div><div className="text-sm text-gray-500">Avant</div></div>
                  <div><div className="text-2xl font-bold text-red-600">-{validationResults.mergedCount + validationResults.deletedCount}</div><div className="text-sm text-gray-500">{validationResults.mergedCount > 0 && validationResults.deletedCount > 0 ? 'Fusionnés + Supprimés' : validationResults.mergedCount > 0 ? 'Fusionnés' : 'Supprimés'}</div></div>
                  <div><div className="text-2xl font-bold text-emerald-600">{validationResults.remainingCount}</div><div className="text-sm text-gray-500">Après</div></div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={downloadCleanedFile} className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium flex items-center justify-center gap-2"><Download className="w-5 h-5" />Télécharger le fichier nettoyé</button>
                <button onClick={resetAll} className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Traiter un autre fichier</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showChangelog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2"><Sparkles className="w-6 h-6" />Historique des versions</h2>
                <button onClick={() => setShowChangelog(false)} className="p-2 hover:bg-white/20 rounded-lg">✕</button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {CHANGELOG.map((version, idx) => (
                <div key={idx} className={`mb-6 pb-6 ${idx < CHANGELOG.length - 1 ? 'border-b' : ''}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${version.color}-100 text-${version.color}-800`}>v{version.version}</span>
                    {version.tag && <span className={`px-2 py-0.5 rounded text-xs font-bold ${version.tag === 'ACTUELLE' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>{version.tag}</span>}
                    <span className="text-sm text-gray-500">{version.date}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{version.title}</h3>
                  <ul className="space-y-1">{version.items.map((item, i) => <li key={i} className="text-sm text-gray-600 flex items-start gap-2"><span className="text-emerald-500 mt-1">•</span><span>{item}</span></li>)}</ul>
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t">
              <button onClick={() => setShowChangelog(false)} className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {showIntegrityModal && integrityReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className={`sticky top-0 px-6 py-4 ${integrityReport.errorCount > 0 ? 'bg-red-600' : integrityReport.warningCount > 0 ? 'bg-yellow-600' : 'bg-green-600'} text-white`}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2"><Shield className="w-6 h-6" />Rapport d'intégrité</h2>
                <button onClick={() => setShowIntegrityModal(false)} className="p-2 hover:bg-white/20 rounded-lg">✕</button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-800">{integrityReport.totalChecked}</div>
                  <div className="text-sm text-gray-500">Individus analysés</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{integrityReport.errorCount}</div>
                  <div className="text-sm text-red-500">Erreurs</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{integrityReport.warningCount}</div>
                  <div className="text-sm text-yellow-500">Avertissements</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{integrityReport.completenessScore}%</div>
                  <div className="text-sm text-blue-500">Complétude</div>
                </div>
              </div>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600"><strong>Personnes isolées:</strong> {integrityReport.isolatedCount}</p>
              </div>
              {integrityReport.errors.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-red-800 mb-2">Erreurs ({integrityReport.errors.length})</h3>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {integrityReport.errors.slice(0, 20).map((err, i) => (
                      <div key={i} className="text-sm p-2 bg-red-50 rounded text-red-700">• {err.message}</div>
                    ))}
                    {integrityReport.errors.length > 20 && <p className="text-sm text-gray-500">... et {integrityReport.errors.length - 20} autres erreurs</p>}
                  </div>
                </div>
              )}
              {integrityReport.warnings.length > 0 && (
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">Avertissements ({integrityReport.warnings.length})</h3>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {integrityReport.warnings.slice(0, 20).map((warn, i) => (
                      <div key={i} className="text-sm p-2 bg-yellow-50 rounded text-yellow-700">• {warn.message}</div>
                    ))}
                    {integrityReport.warnings.length > 20 && <p className="text-sm text-gray-500">... et {integrityReport.warnings.length - 20} autres avertissements</p>}
                  </div>
                </div>
              )}
              {integrityReport.errorCount === 0 && integrityReport.warningCount === 0 && (
                <div className="text-center py-8 text-green-600">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                  <p className="font-semibold">Aucun problème détecté !</p>
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t">
              <button onClick={() => setShowIntegrityModal(false)} className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {previewPair && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-emerald-600 text-white px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Prévisualisation de la fusion</h2>
                <button onClick={closePreview} className="p-2 hover:bg-white/20 rounded-lg">✕</button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-2">{previewPair.person1.names[0] || previewPair.person1.id}</h3>
                  <div className="text-sm space-y-1 text-gray-600">
                    <p>ID: {previewPair.person1.id}</p>
                    <p>Naissance: {previewPair.person1.birth || 'N/A'}</p>
                    <p>Lieu: {previewPair.person1.birthPlace || 'N/A'}</p>
                    <p>Décès: {previewPair.person1.death || 'N/A'}</p>
                    <p>Sexe: {previewPair.person1.sex || 'N/A'}</p>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-2">{previewPair.person2.names[0] || previewPair.person2.id}</h3>
                  <div className="text-sm space-y-1 text-gray-600">
                    <p>ID: {previewPair.person2.id}</p>
                    <p>Naissance: {previewPair.person2.birth || 'N/A'}</p>
                    <p>Lieu: {previewPair.person2.birthPlace || 'N/A'}</p>
                    <p>Décès: {previewPair.person2.death || 'N/A'}</p>
                    <p>Sexe: {previewPair.person2.sex || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Détails de la comparaison</h4>
                <div className="text-sm space-y-1">{previewPair.details.map((detail, i) => <p key={i} className="text-gray-600">{detail}</p>)}</div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex gap-3">
              <button onClick={closePreview} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Fermer</button>
              <button onClick={() => { togglePairSelection(previewPair.id); closePreview(); }} className={`flex-1 px-4 py-2 rounded-lg ${selectedPairs.has(previewPair.id) ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>{selectedPairs.has(previewPair.id) ? 'Désélectionner' : 'Sélectionner pour fusion'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GedcomDuplicateMerger;
