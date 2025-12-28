import React, { useState } from 'react';
import { Upload, Users, AlertCircle, Download, Trash2, CheckCircle, Sparkles, FileText, Brain, UserX } from 'lucide-react';

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
  
  // États pour fonctionnalités avancées
  const [showChangelog, setShowChangelog] = useState(false);
  const [activeTab, setActiveTab] = useState('clusters');
  const [clusterScoreFilter, setClusterScoreFilter] = useState(80);
  const [selectedClusters, setSelectedClusters] = useState(new Set());
  
  // États pour onglets Isolés et Suggestions IA
  const [isolatedPersons, setIsolatedPersons] = useState([]);
  const [selectedIsolated, setSelectedIsolated] = useState(new Set());
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const [integrityReport, setIntegrityReport] = useState(null);

  const VERSION = '1.9.2';

  // ═══════════════════════════════════════════════════════════════════════════
  // CHANGELOG COMPLET
  // ═══════════════════════════════════════════════════════════════════════════
  const CHANGELOG = [
    {
      version: '1.9.2',
      date: '28 décembre 2025',
      tag: 'ACTUELLE',
      color: 'green',
      title: 'CORRECTION CRITIQUE : Algorithme anti-faux-positifs',
      items: [
        'CORRECTION MAJEURE: Nom + Sexe ne suffisent plus pour être doublon',
        'Nouvelle règle: AU MOINS 1 critère suffisant requis',
        'Critères suffisants: naissance, lieu, parents, conjoints, fratrie, décès, profession',
        'Élimination des faux positifs sur homonymes sans données',
        'Préservation des 4 onglets: Clusters, Doublons, Isolés, Suggestions IA',
        'Maintien de toutes les fonctionnalités v1.9.1'
      ]
    },
    {
      version: '1.9.1',
      date: '28 décembre 2025',
      tag: null,
      color: 'blue',
      title: 'Correction traitement fichier + fonctionnalités',
      items: [
        'Correction du traitement des fichiers GEDCOM',
        'Restauration onglet Isolés pour individus sans famille',
        'Restauration onglet Suggestions IA avec analyse patterns',
        'Normalisation automatique des lieux (codes INSEE)',
        'Contrôles d\'intégrité avancés'
      ]
    },
    {
      version: '1.8.7',
      date: '24 décembre 2025',
      tag: null,
      color: 'indigo',
      title: 'Version complète avec toutes les corrections',
      items: [
        'Restauration bouton Changelog/Nouveautés',
        'Système d\'onglets Clusters/Doublons simples',
        'Scoring moyen des clusters avec jauges visuelles',
        'Filtre pourcentage minimum pour clusters',
        'Sélection automatique clusters ≥95%'
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
        'Génération automatique en-tête HEAD complet',
        'Génération automatique balise TRLR de fin'
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

  // ═══════════════════════════════════════════════════════════════════════════
  // DICTIONNAIRE VARIANTES PRÉNOMS FRANÇAIS (40 entrées)
  // ═══════════════════════════════════════════════════════════════════════════
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
    'andré': ['andreas', 'andrew', 'andre'],
    'claude': ['claudius', 'claudio'],
    'michel': ['michael', 'michaelus', 'miguel'],
    'joseph': ['josephus', 'josef', 'giuseppe'],
    'etienne': ['estienne', 'stephanus', 'stephen'],
    'laurent': ['laurentius', 'lawrence', 'lorenzo'],
    'bernard': ['bernardus', 'bernhard'],
    'martin': ['martinus', 'marten'],
    'simon': ['simeon', 'symeon'],
    'paul': ['paulus', 'paulo', 'pablo'],
    'denis': ['denys', 'dionysius'],
    'rene': ['renatus', 'renaud'],
    'gabriel': ['gabrielis'],
    'vincent': ['vincentius', 'vincenzo'],
    'suzanne': ['susanna', 'susan', 'susanne'],
    'therese': ['theresia', 'teresa'],
    'elisabeth': ['elizabeth', 'elizabetha', 'isabelle'],
    'madeleine': ['magdalena', 'magdalene'],
    'francoise': ['francisca', 'franziska'],
    'genevieve': ['genoveva', 'geneveva'],
    'helene': ['helena', 'helaine', 'ellen'],
    'louise': ['louisa', 'luisa'],
    'rose': ['rosa', 'rosalie'],
    'victoire': ['victoria', 'victorine']
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // NORMALISATION LIEU (retrait codes INSEE)
  // ═══════════════════════════════════════════════════════════════════════════
  const normalizePlace = (place) => {
    if (!place) return '';
    // Retirer codes INSEE type "38142 Mizoen" → "Mizoen"
    return place.replace(/^\d{5}\s+/, '').trim();
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // NORMALISATION PRÉNOM (avec variantes)
  // ═══════════════════════════════════════════════════════════════════════════
  const normalizeFirstName = (name) => {
    if (!name) return '';
    const lower = name.toLowerCase().trim();
    
    // Chercher dans les variantes
    for (const [canonical, variants] of Object.entries(NAME_VARIANTS)) {
      if (lower === canonical || variants.includes(lower)) {
        return canonical;
      }
    }
    return lower;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SOUNDEX FRANÇAIS
  // ═══════════════════════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════════════════════
  // PARSING GEDCOM
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
      
      // CORRECTION v1.8.6: Gestion CONT/CONC
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
        } else if (lastFieldType === 'RELI') {
          currentPerson.religion += separator + value;
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
        if (currentPerson) {
          people.push(currentPerson);
          currentPerson = null;
        }
        const match = trimmed.match(/@([^@]+)@/);
        const id = match ? match[1] : trimmed.split(' ')[1];
        currentFamily = { id, husband: null, wife: null, children: [] };
        families.set(id, currentFamily);
        currentEvent = null;
      }
      else if (currentPerson) {
        if (trimmed.includes('NAME')) {
          const name = trimmed.split('NAME')[1]?.trim();
          if (name) {
            currentPerson.names.push(name);
            lastFieldType = 'NAME';
          }
        } else if (trimmed.includes('SEX')) {
          currentPerson.sex = trimmed.split('SEX')[1]?.trim() || '';
        } else if (trimmed.startsWith('1 BIRT')) {
          currentEvent = 'birth';
        } else if (trimmed.startsWith('1 DEAT')) {
          currentEvent = 'death';
        } else if (trimmed.startsWith('1 OCCU')) {
          currentPerson.occupation = trimmed.split('OCCU')[1]?.trim() || '';
          lastFieldType = 'OCCU';
        } else if (trimmed.startsWith('1 RELI')) {
          currentPerson.religion = trimmed.split('RELI')[1]?.trim() || '';
          lastFieldType = 'RELI';
        } else if (currentEvent && trimmed.includes('DATE')) {
          const date = trimmed.split('DATE')[1]?.trim() || '';
          if (currentEvent === 'birth') {
            currentPerson.birth = date;
            lastFieldType = 'BIRT_DATE';
          }
          else if (currentEvent === 'death') {
            currentPerson.death = date;
            lastFieldType = 'DEAT_DATE';
          }
        } else if (currentEvent && trimmed.includes('PLAC')) {
          const place = normalizePlace(trimmed.split('PLAC')[1]?.trim() || '');
          if (currentEvent === 'birth') {
            currentPerson.birthPlace = place;
            lastFieldType = 'BIRT_PLAC';
          }
          else if (currentEvent === 'death') {
            currentPerson.deathPlace = place;
            lastFieldType = 'DEAT_PLAC';
          }
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
    
    // Résolution des relations
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
          if (family.husband && family.husband !== person.id) {
            person.spouses.push(family.husband);
          }
          if (family.wife && family.wife !== person.id) {
            person.spouses.push(family.wife);
          }
        }
      });
    });
    
    return { people, families };
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ALGORITHME DE SIMILARITÉ - v1.9.2 CORRIGÉ ANTI-FAUX-POSITIFS
  // ═══════════════════════════════════════════════════════════════════════════
  const calculateSimilarity = (person1, person2) => {
    const details = [];
    
    // Système hybride : Score de correspondance / Score maximum possible
    let matchScore = 0;
    let maxPossibleScore = 0;
    
    // ═══════════════════════════════════════════════════════════════════════
    // NOUVEAU v1.9.2: Tracking des critères SUFFISANTS (pas juste nom/sexe)
    // ═══════════════════════════════════════════════════════════════════════
    const sufficientCriteria = [];
    
    const name1 = person1.names[0]?.toLowerCase() || '';
    const name2 = person2.names[0]?.toLowerCase() || '';
    
    // 1. NOMS (pondération: 30) - CRITÈRE NÉCESSAIRE
    let nameMatches = false;
    if (name1 || name2) {
      maxPossibleScore += 30;
      
      if (name1 && name2) {
        const firstName1 = normalizeFirstName(name1.split(' ')[0] || name1.split('/')[0]);
        const firstName2 = normalizeFirstName(name2.split(' ')[0] || name2.split('/')[0]);
        const lastName1 = name1.split(' ').pop()?.replace(/\//g, '') || '';
        const lastName2 = name2.split(' ').pop()?.replace(/\//g, '') || '';
        
        const s1 = soundex(firstName1);
        const s2 = soundex(firstName2);
        const ls1 = soundex(lastName1);
        const ls2 = soundex(lastName2);
        
        if (name1 === name2) {
          matchScore += 30;
          nameMatches = true;
          details.push('✓ Noms identiques (+30/30)');
        } else if (s1 === s2 && ls1 === ls2) {
          matchScore += 25;
          nameMatches = true;
          details.push('✓ Noms phonétiquement identiques (+25/30)');
        } else if (firstName1 === firstName2 && ls1 === ls2) {
          matchScore += 25;
          nameMatches = true;
          details.push('✓ Variante prénom reconnue (+25/30)');
        } else if (s1 === s2 || ls1 === ls2) {
          matchScore += 20;
          nameMatches = true;
          details.push('≈ Prénom ou nom similaire (+20/30)');
        } else if (name1.includes(name2) || name2.includes(name1)) {
          matchScore += 15;
          nameMatches = true;
          details.push('≈ Noms partiellement similaires (+15/30)');
        } else {
          details.push('✗ Noms différents (0/30)');
        }
      }
    }

    // 2. DATE DE NAISSANCE (pondération: 25) - CRITÈRE SUFFISANT
    if (person1.birth || person2.birth) {
      maxPossibleScore += 25;
      
      if (person1.birth && person2.birth) {
        const y1 = person1.birth.match(/\d{4}/);
        const y2 = person2.birth.match(/\d{4}/);
        
        if (person1.birth === person2.birth) {
          matchScore += 25;
          sufficientCriteria.push('naissance_exacte');
          details.push('✓ Dates naissance identiques (+25/25)');
        } else if (y1 && y2) {
          const diff = Math.abs(parseInt(y1[0]) - parseInt(y2[0]));
          if (diff === 0) {
            matchScore += 20;
            sufficientCriteria.push('annee_naissance');
            details.push('✓ Années naissance identiques (+20/25)');
          } else if (diff <= 2) {
            matchScore += 12;
            sufficientCriteria.push('annee_proche');
            details.push('≈ Années naissance proches ±2 ans (+12/25)');
          } else if (diff <= 5) {
            matchScore += 5;
            details.push('≈ Années naissance éloignées ±5 ans (+5/25)');
          } else {
            details.push('✗ Dates naissance trop éloignées (0/25)');
          }
        }
      }
    }

    // 3. SEXE (pondération: 15) - CRITÈRE NÉCESSAIRE mais PAS SUFFISANT
    // ⚠️ ÉLIMINATOIRE si différent
    if (person1.sex || person2.sex) {
      maxPossibleScore += 15;
      
      if (person1.sex && person2.sex) {
        if (person1.sex === person2.sex) {
          matchScore += 15;
          details.push('✓ Même sexe (+15/15)');
        } else {
          details.push('✗ Sexes différents (ÉLIMINATOIRE)');
          return { score: 0, details, sufficientCriteria: [] };
        }
      }
    }

    // 4. PARENTS (pondération: 20) - CRITÈRE SUFFISANT (très fort)
    if (person1.parents.length > 0 || person2.parents.length > 0) {
      maxPossibleScore += 20;
      
      if (person1.parents.length > 0 && person2.parents.length > 0) {
        const common = person1.parents.filter(p => person2.parents.includes(p));
        if (common.length === 2) {
          matchScore += 20;
          sufficientCriteria.push('parents_2');
          details.push('✓ 2 parents communs (+20/20)');
        } else if (common.length === 1) {
          matchScore += 10;
          sufficientCriteria.push('parent_1');
          details.push('≈ 1 parent commun (+10/20)');
        } else {
          details.push('✗ Parents différents (0/20)');
        }
      }
    }

    // 5. FRATRIE (pondération: 15) - CRITÈRE SUFFISANT
    const parentsCompared = (person1.parents.length > 0 && person2.parents.length > 0);
    if (!parentsCompared && (person1.familyAsChild || person2.familyAsChild)) {
      maxPossibleScore += 15;
      
      if (person1.familyAsChild && person2.familyAsChild) {
        if (person1.familyAsChild === person2.familyAsChild) {
          matchScore += 15;
          sufficientCriteria.push('fratrie');
          details.push('✓ Même fratrie (+15/15)');
        } else {
          details.push('✗ Fratries différentes (0/15)');
        }
      }
    }

    // 6. LIEU DE NAISSANCE (pondération: 10) - CRITÈRE SUFFISANT
    if (person1.birthPlace || person2.birthPlace) {
      maxPossibleScore += 10;
      
      const bp1 = normalizePlace(person1.birthPlace)?.toLowerCase();
      const bp2 = normalizePlace(person2.birthPlace)?.toLowerCase();
      if (bp1 && bp2) {
        if (bp1 === bp2) {
          matchScore += 10;
          sufficientCriteria.push('lieu_naissance');
          details.push('✓ Lieux naissance identiques (+10/10)');
        } else if (bp1.includes(bp2) || bp2.includes(bp1)) {
          matchScore += 5;
          sufficientCriteria.push('lieu_partiel');
          details.push('≈ Lieux naissance similaires (+5/10)');
        } else {
          details.push('✗ Lieux naissance différents (0/10)');
        }
      }
    }

    // 7. CONJOINTS (pondération: 8) - CRITÈRE SUFFISANT (très fort)
    if (person1.spouses.length > 0 || person2.spouses.length > 0) {
      maxPossibleScore += 8;
      
      if (person1.spouses.length > 0 && person2.spouses.length > 0) {
        const common = person1.spouses.filter(s => person2.spouses.includes(s));
        if (common.length > 0) {
          matchScore += 8;
          sufficientCriteria.push('conjoints');
          details.push('✓ Conjoints communs (+8/8)');
        } else {
          details.push('✗ Conjoints différents (0/8)');
        }
      }
    }

    // 8. DATE DE DÉCÈS (pondération: 15) - CRITÈRE SUFFISANT
    if (person1.death || person2.death) {
      maxPossibleScore += 15;
      
      if (person1.death && person2.death) {
        const dy1 = person1.death.match(/\d{4}/);
        const dy2 = person2.death.match(/\d{4}/);
        
        if (person1.death === person2.death) {
          matchScore += 15;
          sufficientCriteria.push('deces_exact');
          details.push('✓ Dates décès identiques (+15/15)');
        } else if (dy1 && dy2 && dy1[0] === dy2[0]) {
          matchScore += 10;
          sufficientCriteria.push('annee_deces');
          details.push('✓ Années décès identiques (+10/15)');
        } else {
          details.push('✗ Dates décès différentes (0/15)');
        }
      }
    }

    // 9. PROFESSION (pondération: 5) - CRITÈRE SUFFISANT (faible)
    if (person1.occupation || person2.occupation) {
      maxPossibleScore += 5;
      
      if (person1.occupation && person2.occupation) {
        if (person1.occupation.toLowerCase() === person2.occupation.toLowerCase()) {
          matchScore += 5;
          sufficientCriteria.push('profession');
          details.push('✓ Même profession (+5/5)');
        } else {
          details.push('✗ Professions différentes (0/5)');
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // NOUVEAU v1.9.2: VALIDATION ANTI-FAUX-POSITIFS
    // ═══════════════════════════════════════════════════════════════════════
    // Règle: Nom + Sexe NÉCESSAIRES mais PAS SUFFISANTS
    // Il faut AU MOINS 1 critère suffisant pour valider le doublon
    
    const finalScore = maxPossibleScore > 0 
      ? Math.round((matchScore / maxPossibleScore) * 100) 
      : 0;
    
    // Si le nom correspond mais AUCUN critère suffisant → REJET
    if (nameMatches && sufficientCriteria.length === 0) {
      details.unshift('⚠️ REJET: Nom seul insuffisant - aucun critère confirmant');
      return { 
        score: 0, 
        details, 
        sufficientCriteria,
        rejected: true,
        rejectionReason: 'Nom + Sexe seuls ne suffisent pas. Aucun critère suffisant trouvé.'
      };
    }
    
    details.unshift(`📊 Score: ${matchScore}/${maxPossibleScore} points | Critères suffisants: ${sufficientCriteria.length > 0 ? sufficientCriteria.join(', ') : 'AUCUN'}`);
    
    return { score: finalScore, details, sufficientCriteria };
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RECHERCHE DES DOUBLONS AVEC TRIPLE INDEXATION
  // ═══════════════════════════════════════════════════════════════════════════
  const findDuplicates = (people) => {
    const result = [];
    
    // Construction des index pour optimisation
    const buildIndex = () => {
      const phoneticIndex = new Map();
      const yearIndex = new Map();
      const parentIndex = new Map();
      
      people.forEach(person => {
        // Index phonétique (Soundex)
        const fullName = person.names[0] || '';
        const parts = fullName.toLowerCase().split(' ');
        const firstName = parts[0] || '';
        const lastName = parts[parts.length - 1]?.replace(/\//g, '') || '';
        
        const key = `${soundex(firstName)}-${soundex(lastName)}`;
        if (!phoneticIndex.has(key)) phoneticIndex.set(key, []);
        phoneticIndex.get(key).push(person);
        
        // Index par année de naissance (±5 ans)
        const year = person.birth?.match(/\d{4}/)?.[0];
        if (year) {
          const y = parseInt(year);
          for (let i = y - 5; i <= y + 5; i++) {
            const yearKey = String(i);
            if (!yearIndex.has(yearKey)) yearIndex.set(yearKey, []);
            yearIndex.get(yearKey).push(person);
          }
        }
        
        // Index par parents
        person.parents.forEach(parentId => {
          if (!parentIndex.has(parentId)) parentIndex.set(parentId, []);
          parentIndex.get(parentId).push(person);
        });
      });
      
      return { phoneticIndex, yearIndex, parentIndex };
    };
    
    const { phoneticIndex, yearIndex, parentIndex } = buildIndex();
    
    const compared = new Set();
    let totalComparisons = 0;
    let skipped = 0;
    
    // Fonction pour comparer une paire
    const comparePair = (person1, person2) => {
      if (person1.id === person2.id) return;
      
      const pairKey = person1.id < person2.id 
        ? `${person1.id}-${person2.id}` 
        : `${person2.id}-${person1.id}`;
      
      if (compared.has(pairKey)) return;
      compared.add(pairKey);
      
      totalComparisons++;
      
      // Quick check avant calcul complet
      if (person1.sex && person2.sex && person1.sex !== person2.sex) {
        skipped++;
        return;
      }
      
      const y1 = person1.birth?.match(/\d{4}/)?.[0];
      const y2 = person2.birth?.match(/\d{4}/)?.[0];
      if (y1 && y2 && Math.abs(parseInt(y1) - parseInt(y2)) > 10) {
        skipped++;
        return;
      }
      
      const sim = calculateSimilarity(person1, person2);
      
      // v1.9.2: On ignore les résultats rejetés par la règle anti-faux-positifs
      if (sim.rejected) {
        skipped++;
        return;
      }
      
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
    };
    
    // Comparer via les index
    people.forEach((person, i) => {
      // Via index phonétique
      const fullName = person.names[0] || '';
      const parts = fullName.toLowerCase().split(' ');
      const firstName = parts[0] || '';
      const lastName = parts[parts.length - 1]?.replace(/\//g, '') || '';
      const phoneticKey = `${soundex(firstName)}-${soundex(lastName)}`;
      
      const phoneticMatches = phoneticIndex.get(phoneticKey) || [];
      phoneticMatches.forEach(other => comparePair(person, other));
      
      // Via index année
      const year = person.birth?.match(/\d{4}/)?.[0];
      if (year) {
        const yearMatches = yearIndex.get(year) || [];
        yearMatches.forEach(other => comparePair(person, other));
      }
      
      // Via index parents
      person.parents.forEach(parentId => {
        const parentMatches = parentIndex.get(parentId) || [];
        parentMatches.forEach(other => comparePair(person, other));
      });
      
      // Progression
      if (i % 100 === 0) {
        const pct = Math.round((i / people.length) * 100);
        setProgress(30 + pct * 0.65);
      }
    });
    
    console.log(`v1.9.2 - Optimisation: ${totalComparisons} comparaisons (${skipped} skipped/rejetés)`);
    console.log(`Réduction: ${((1 - totalComparisons / ((people.length * (people.length - 1)) / 2)) * 100).toFixed(1)}%`);
    
    const sorted = result.sort((a, b) => b.similarity - a.similarity);
    
    detectClusters(sorted, people);
    
    return sorted;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // DÉTECTION DES CLUSTERS
  // ═══════════════════════════════════════════════════════════════════════════
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
              avgScore: avgScore,
              pairs: clusterPairs
            });
          }
        }
      }
    });
    
    // Tri par score moyen décroissant
    foundClusters.sort((a, b) => b.avgScore - a.avgScore);
    
    console.log('Clusters détectés:', foundClusters.length);
    setClusters(foundClusters);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // DÉTECTION DES INDIVIDUS ISOLÉS
  // ═══════════════════════════════════════════════════════════════════════════
  const detectIsolatedPersons = (people, families) => {
    const isolated = [];
    
    people.forEach(person => {
      const hasParents = person.parents.length > 0;
      
      // Vérifier si a des enfants
      let hasChildren = false;
      families.forEach(family => {
        if (family.husband === person.id || family.wife === person.id) {
          if (family.children.length > 0) {
            hasChildren = true;
          }
        }
      });
      
      // Isolé = pas de parents ET pas d'enfants
      if (!hasParents && !hasChildren) {
        const hasSpouses = person.spouses.length > 0;
        isolated.push({
          ...person,
          isTotallyIsolated: !hasSpouses,
          hasSpouses
        });
      }
    });
    
    return isolated;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SUGGESTIONS IA (analyse de patterns)
  // ═══════════════════════════════════════════════════════════════════════════
  const generateAiSuggestions = (people) => {
    const suggestions = [];
    
    // Grouper par nom de famille (soundex)
    const lastNameGroups = new Map();
    
    people.forEach(person => {
      const fullName = person.names[0] || '';
      const lastName = fullName.split(' ').pop()?.replace(/\//g, '').toLowerCase() || '';
      const lastNameKey = soundex(lastName);
      
      if (!lastNameGroups.has(lastNameKey)) {
        lastNameGroups.set(lastNameKey, []);
      }
      lastNameGroups.get(lastNameKey).push(person);
    });
    
    // Analyser chaque groupe
    lastNameGroups.forEach((group, key) => {
      if (group.length < 2) return;
      
      // Chercher les patterns suspects
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const p1 = group[i];
          const p2 = group[j];
          
          // Ignorer si sexes différents
          if (p1.sex && p2.sex && p1.sex !== p2.sex) continue;
          
          // Calculer la proximité temporelle
          const y1 = p1.birth?.match(/\d{4}/)?.[0];
          const y2 = p2.birth?.match(/\d{4}/)?.[0];
          
          let yearDiff = null;
          if (y1 && y2) {
            yearDiff = Math.abs(parseInt(y1) - parseInt(y2));
          }
          
          // Suggestion si même période (25 ans)
          if (yearDiff === null || yearDiff <= 25) {
            const reasons = [];
            let confidence = 60;
            
            if (yearDiff !== null && yearDiff <= 10) {
              reasons.push(`Nés à ${yearDiff} ans d'écart`);
              confidence += 15;
            }
            
            if (p1.birthPlace && p2.birthPlace) {
              const bp1 = normalizePlace(p1.birthPlace).toLowerCase();
              const bp2 = normalizePlace(p2.birthPlace).toLowerCase();
              if (bp1 === bp2) {
                reasons.push('Même lieu de naissance');
                confidence += 10;
              }
            }
            
            // Vérifier parents communs potentiels
            if (p1.parents.some(par => p2.parents.includes(par))) {
              reasons.push('Parents communs');
              confidence += 10;
            }
            
            if (reasons.length >= 2 && confidence >= 60) {
              suggestions.push({
                person1: p1,
                person2: p2,
                confidence: Math.min(confidence, 95),
                reasons,
                type: 'pattern_match'
              });
            }
          }
        }
      }
    });
    
    // Trier par confiance décroissante
    suggestions.sort((a, b) => b.confidence - a.confidence);
    
    return suggestions.slice(0, 50); // Top 50
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTRÔLES D'INTÉGRITÉ
  // ═══════════════════════════════════════════════════════════════════════════
  const checkIntegrity = (people) => {
    const errors = [];
    const warnings = [];
    
    people.forEach(person => {
      // Personne sans nom
      if (!person.names[0] || person.names[0].trim() === '') {
        errors.push({
          type: 'no_name',
          personId: person.id,
          message: `Personne ${person.id} sans nom`
        });
      }
      
      // Dates incohérentes
      if (person.birth && person.death) {
        const birthYear = person.birth.match(/\d{4}/)?.[0];
        const deathYear = person.death.match(/\d{4}/)?.[0];
        
        if (birthYear && deathYear && parseInt(birthYear) > parseInt(deathYear)) {
          errors.push({
            type: 'date_error',
            personId: person.id,
            message: `${person.names[0] || person.id}: Naissance (${birthYear}) après décès (${deathYear})`
          });
        }
      }
      
      // Parents trop jeunes ou trop vieux
      if (person.birth) {
        const childBirthYear = parseInt(person.birth.match(/\d{4}/)?.[0] || '0');
        
        person.parents.forEach(parentId => {
          const parent = people.find(p => p.id === parentId);
          if (parent?.birth) {
            const parentBirthYear = parseInt(parent.birth.match(/\d{4}/)?.[0] || '0');
            const ageAtBirth = childBirthYear - parentBirthYear;
            
            if (ageAtBirth < 15) {
              warnings.push({
                type: 'parent_too_young',
                personId: person.id,
                parentId,
                message: `${parent.names[0] || parentId} avait ${ageAtBirth} ans à la naissance de ${person.names[0] || person.id}`
              });
            }
            if (ageAtBirth > 80) {
              warnings.push({
                type: 'parent_too_old',
                personId: person.id,
                parentId,
                message: `${parent.names[0] || parentId} avait ${ageAtBirth} ans à la naissance de ${person.names[0] || person.id}`
              });
            }
          }
        });
      }
    });
    
    return { errors, warnings };
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // FONCTIONS UTILITAIRES
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
    if (newExpanded.has(clusterIndex)) {
      newExpanded.delete(clusterIndex);
    } else {
      newExpanded.add(clusterIndex);
    }
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
    if (person.religion) score += 2;
    if (person.familyAsChild) score += 3;
    score += person.familiesAsSpouse.length * 3;
    return score;
  };

  const mergePersonData = (keepPerson, removePerson) => {
    const merged = { ...keepPerson };
    
    if (!merged.birth && removePerson.birth) merged.birth = removePerson.birth;
    if (!merged.birthPlace && removePerson.birthPlace) merged.birthPlace = removePerson.birthPlace;
    if (!merged.death && removePerson.death) merged.death = removePerson.death;
    if (!merged.deathPlace && removePerson.deathPlace) merged.deathPlace = removePerson.deathPlace;
    if (!merged.sex && removePerson.sex) merged.sex = removePerson.sex;
    if (!merged.occupation && removePerson.occupation) merged.occupation = removePerson.occupation;
    if (!merged.religion && removePerson.religion) merged.religion = removePerson.religion;
    
    removePerson.names.forEach(name => {
      if (!merged.names.includes(name)) merged.names.push(name);
    });
    
    removePerson.parents.forEach(parent => {
      if (!merged.parents.includes(parent)) merged.parents.push(parent);
    });
    
    removePerson.spouses.forEach(spouse => {
      if (!merged.spouses.includes(spouse)) merged.spouses.push(spouse);
    });
    
    if (!merged.familyAsChild && removePerson.familyAsChild) {
      merged.familyAsChild = removePerson.familyAsChild;
    }
    
    removePerson.familiesAsSpouse.forEach(fam => {
      if (!merged.familiesAsSpouse.includes(fam)) merged.familiesAsSpouse.push(fam);
    });
    
    return merged;
  };

  const openPreview = (pair) => {
    setPreviewPair(pair);
  };

  const closePreview = () => {
    setPreviewPair(null);
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
    const highConfidencePairs = duplicates
      .filter(pair => pair.similarity >= 95)
      .map(pair => pair.id);
    setSelectedPairs(new Set(highConfidencePairs));
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // GESTION FICHIER
  // ═══════════════════════════════════════════════════════════════════════════
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
        
        // Détection des doublons
        const dups = findDuplicates(people);
        setDuplicates(dups);
        
        // Détection des isolés
        const isolated = detectIsolatedPersons(people, families);
        setIsolatedPersons(isolated);
        
        // Suggestions IA
        const suggestions = generateAiSuggestions(people);
        setSmartSuggestions(suggestions);
        
        // Contrôles d'intégrité
        const integrity = checkIntegrity(people);
        setIntegrityReport(integrity);
        
        setProgress(100);
        setStep('review');
      };
      reader.readAsText(uploadedFile);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // FUSION ET EXPORT
  // ═══════════════════════════════════════════════════════════════════════════
  const handleMerge = () => {
    const idsToMerge = new Map();
    
    duplicates.forEach(pair => {
      if (selectedPairs.has(pair.id)) {
        const quality1 = calculateDataQuality(pair.person1);
        const quality2 = calculateDataQuality(pair.person2);
        
        const keepPerson = quality1 >= quality2 ? pair.person1 : pair.person2;
        const removePerson = quality1 >= quality2 ? pair.person2 : pair.person1;
        
        const id1 = pair.person1.id;
        const id2 = pair.person2.id;
        let targetId = keepPerson.id;
        
        if (idsToMerge.has(id1)) targetId = idsToMerge.get(id1);
        else if (idsToMerge.has(id2)) targetId = idsToMerge.get(id2);
        
        idsToMerge.set(id1, targetId);
        idsToMerge.set(id2, targetId);
      }
    });
    
    setMergedIds(idsToMerge);
    
    const idsToRemove = new Set();
    idsToMerge.forEach((target, source) => {
      if (source !== target) idsToRemove.add(source);
    });
    
    // Ajouter les isolés sélectionnés
    selectedIsolated.forEach(id => idsToRemove.add(id));
    
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
      if (sourceId !== targetId) {
        idsToRemove.add(sourceId);
        mergeMap.set(sourceId, targetId);
      }
    });
    
    // Ajouter les isolés sélectionnés
    selectedIsolated.forEach(id => idsToRemove.add(id));

    const lines = originalGedcom.split('\n');
    const outputLines = [];
    let skip = false;
    let hasHead = false;

    // Vérifier présence HEAD
    if (lines.length > 0 && lines[0].trim().startsWith('0 HEAD')) {
      hasHead = true;
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
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      outputLines.push(`1 DATE ${dateStr}`);
      outputLines.push(`2 TIME ${timeStr}`);
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip TRLR (on l'ajoutera à la fin)
      if (trimmed.startsWith('0 TRLR')) {
        continue;
      }

      if (trimmed.startsWith('0 ')) {
        skip = false;
        if (trimmed.includes('@')) {
          const match = trimmed.match(/@([^@]+)@/);
          if (match && idsToRemove.has(match[1])) {
            skip = true;
            continue;
          }
        }
      }

      if (skip) continue;

      let processedLine = line;
      mergeMap.forEach((targetId, sourceId) => {
        processedLine = processedLine.replace(new RegExp(`@${sourceId}@`, 'g'), `@${targetId}@`);
      });

      outputLines.push(processedLine);
    }

    // Toujours ajouter TRLR à la fin
    outputLines.push('0 TRLR');

    const blob = new Blob([outputLines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gedcom_nettoye_${new Date().toISOString().slice(0,10)}.ged`;
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
    setIsolatedPersons([]);
    setSelectedIsolated(new Set());
    setSmartSuggestions([]);
    setIntegrityReport(null);
    setFile(null);
    setMergedIds(new Map());
    setValidationResults(null);
    setPreviewPair(null);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // FILTRAGE ET COMPTEURS
  // ═══════════════════════════════════════════════════════════════════════════
  const getFilteredDuplicates = () => {
    return duplicates.filter(pair => {
      const scoreMatch = pair.similarity >= filterScore;
      const searchMatch = !searchTerm || 
        pair.person1.names.some(n => n.toLowerCase().includes(searchTerm.toLowerCase())) ||
        pair.person2.names.some(n => n.toLowerCase().includes(searchTerm.toLowerCase())) ||
        pair.person1.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pair.person2.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      return scoreMatch && searchMatch;
    });
  };

  const getSimplePairs = () => {
    const clusterIds = new Set();
    clusters.forEach(c => c.ids.forEach(id => clusterIds.add(id)));
    
    return getFilteredDuplicates().filter(pair => 
      !clusterIds.has(pair.person1.id) && !clusterIds.has(pair.person2.id)
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">Fusionneur GEDCOM</h1>
              <p className="text-emerald-100 text-sm">v{VERSION} - Algorithme anti-faux-positifs</p>
            </div>
          </div>
          <button
            onClick={() => setShowChangelog(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveautés</span>
          </button>
        </div>
      </div>

      {/* Barre de progression */}
      {progress > 0 && progress < 100 && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* ÉTAPE: Upload */}
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
                  <input
                    type="file"
                    accept=".ged,.gedcom"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <FileText className="w-12 h-12 mx-auto text-emerald-400 mb-3" />
                  <p className="text-emerald-600 font-medium">Cliquez pour sélectionner</p>
                  <p className="text-gray-400 text-sm mt-1">ou glissez-déposez ici</p>
                </div>
              </label>
              
              {/* Info v1.9.2 */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Nouveauté v1.9.2
                </h3>
                <p className="text-blue-700 text-sm mt-1">
                  L'algorithme anti-faux-positifs rejette désormais les correspondances basées uniquement sur le nom et le sexe. 
                  Un critère supplémentaire (naissance, parents, lieu...) est requis pour valider un doublon.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE: Review */}
        {step === 'review' && (
          <div>
            {/* Alertes intégrité */}
            {integrityReport && (integrityReport.errors.length > 0 || integrityReport.warnings.length > 0) && (
              <div className="mb-4 space-y-2">
                {integrityReport.errors.length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-semibold text-red-800 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      {integrityReport.errors.length} erreur(s) détectée(s)
                    </h3>
                    <ul className="mt-2 text-sm text-red-700">
                      {integrityReport.errors.slice(0, 5).map((err, i) => (
                        <li key={i}>• {err.message}</li>
                      ))}
                      {integrityReport.errors.length > 5 && (
                        <li className="text-red-500">... et {integrityReport.errors.length - 5} autre(s)</li>
                      )}
                    </ul>
                  </div>
                )}
                {integrityReport.warnings.length > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      {integrityReport.warnings.length} avertissement(s)
                    </h3>
                  </div>
                )}
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
                <div className="text-2xl font-bold text-red-600">{isolatedPersons.length}</div>
                <div className="text-sm text-gray-500">Isolés</div>
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
                  { id: 'isolated', label: 'Isolés', icon: '🔴', count: isolatedPersons.length },
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
                {/* Onglet Clusters */}
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
                      <button
                        onClick={autoSelectHighConfidenceClusters}
                        className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                      >
                        Sélectionner ≥95%
                      </button>
                    </div>
                    
                    {getFilteredClusters().length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Aucun cluster trouvé avec ce filtre</p>
                    ) : (
                      <div className="space-y-3">
                        {getFilteredClusters().map((cluster, idx) => (
                          <div key={idx} className={`border rounded-lg p-3 ${
                            selectedClusters.has(idx) ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                          }`}>
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
                                  className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                                >
                                  {expandedClusters.has(idx) ? 'Réduire' : 'Détails'}
                                </button>
                                <button
                                  onClick={() => selectCluster(cluster.ids)}
                                  className="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                >
                                  Sélectionner
                                </button>
                              </div>
                            </div>
                            
                            {expandedClusters.has(idx) && (
                              <div className="mt-3 pt-3 border-t">
                                <div className="text-sm text-gray-600">
                                  {cluster.people.map(p => p.names[0] || p.id).join(', ')}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Onglet Doublons simples */}
                {activeTab === 'pairs' && (
                  <div>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <input
                        type="text"
                        placeholder="Rechercher par nom ou ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-3 py-2 border rounded-lg text-sm flex-1 min-w-[200px]"
                      />
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
                      <button
                        onClick={selectHighConfidence}
                        className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700"
                      >
                        Sélectionner ≥95%
                      </button>
                    </div>
                    
                    {getSimplePairs().length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Aucun doublon simple trouvé</p>
                    ) : (
                      <div className="space-y-2">
                        {getSimplePairs().slice(0, 50).map((pair) => (
                          <div key={pair.id} className={`border rounded-lg p-3 ${
                            selectedPairs.has(pair.id) ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium">{pair.person1.names[0] || pair.person1.id}</div>
                                <div className="text-sm text-gray-500">↔ {pair.person2.names[0] || pair.person2.id}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-sm font-medium ${
                                  pair.similarity >= 95 ? 'bg-green-100 text-green-800' :
                                  pair.similarity >= 90 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-orange-100 text-orange-800'
                                }`}>
                                  {pair.similarity}%
                                </span>
                                <button
                                  onClick={() => openPreview(pair)}
                                  className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                                >
                                  Prévisualiser
                                </button>
                                <button
                                  onClick={() => togglePairSelection(pair.id)}
                                  className={`px-2 py-1 text-sm rounded ${
                                    selectedPairs.has(pair.id)
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-gray-100 hover:bg-gray-200'
                                  }`}
                                >
                                  {selectedPairs.has(pair.id) ? '✓' : 'Sélectionner'}
                                </button>
                              </div>
                            </div>
                            {/* Afficher les critères suffisants */}
                            {pair.sufficientCriteria && pair.sufficientCriteria.length > 0 && (
                              <div className="mt-2 text-xs text-emerald-600">
                                Critères validants: {pair.sufficientCriteria.join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Onglet Isolés */}
                {activeTab === 'isolated' && (
                  <div>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <button
                        onClick={() => setSelectedIsolated(new Set(isolatedPersons.map(p => p.id)))}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                      >
                        Tout sélectionner
                      </button>
                      <button
                        onClick={() => setSelectedIsolated(new Set(
                          isolatedPersons.filter(p => p.isTotallyIsolated).map(p => p.id)
                        ))}
                        className="px-3 py-1 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700"
                      >
                        Totalement isolés
                      </button>
                      <button
                        onClick={() => setSelectedIsolated(new Set())}
                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600"
                      >
                        Désélectionner tout
                      </button>
                      <span className="text-sm text-gray-500 self-center">
                        {selectedIsolated.size} sélectionné(s)
                      </span>
                    </div>
                    
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm">
                        <span className="font-medium">Totalement isolés:</span> {isolatedPersons.filter(p => p.isTotallyIsolated).length}
                        <span className="mx-2">|</span>
                        <span className="font-medium">Avec conjoints:</span> {isolatedPersons.filter(p => !p.isTotallyIsolated).length}
                      </div>
                    </div>
                    
                    {isolatedPersons.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Aucun individu isolé trouvé</p>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {isolatedPersons.map((person) => (
                          <div key={person.id} className={`border rounded-lg p-3 ${
                            selectedIsolated.has(person.id) ? 'border-red-500 bg-red-50' : 'border-gray-200'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{person.names[0] || person.id}</div>
                                <div className="text-xs text-gray-500">
                                  {person.isTotallyIsolated 
                                    ? '⚠️ Totalement isolé (aucune famille)'
                                    : '👤 Sans ascendants ni descendants'
                                  }
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  const newSelected = new Set(selectedIsolated);
                                  if (newSelected.has(person.id)) {
                                    newSelected.delete(person.id);
                                  } else {
                                    newSelected.add(person.id);
                                  }
                                  setSelectedIsolated(newSelected);
                                }}
                                className={`px-2 py-1 text-sm rounded ${
                                  selectedIsolated.has(person.id)
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                              >
                                {selectedIsolated.has(person.id) ? '✓' : 'Sélectionner'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Onglet Suggestions IA */}
                {activeTab === 'ai' && (
                  <div>
                    <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 text-purple-800">
                        <Brain className="w-5 h-5" />
                        <span className="font-medium">Analyse de patterns</span>
                      </div>
                      <p className="text-sm text-purple-600 mt-1">
                        Ces suggestions sont basées sur l'analyse des noms, périodes et lieux.
                        Vérifiez chaque suggestion avant de l'accepter.
                      </p>
                    </div>
                    
                    {smartSuggestions.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Aucune suggestion IA disponible</p>
                    ) : (
                      <div className="space-y-3">
                        {smartSuggestions.map((suggestion, idx) => (
                          <div key={idx} className="border border-purple-200 rounded-lg p-3 bg-purple-50/30">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`px-2 py-1 rounded text-sm font-medium ${
                                suggestion.confidence >= 90 ? 'bg-green-100 text-green-800' :
                                suggestion.confidence >= 75 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                Confiance: {suggestion.confidence}%
                              </span>
                            </div>
                            <div className="text-sm">
                              <div className="font-medium">{suggestion.person1.names[0] || suggestion.person1.id}</div>
                              <div className="text-gray-500">↔ {suggestion.person2.names[0] || suggestion.person2.id}</div>
                            </div>
                            <div className="mt-2 text-xs text-purple-600">
                              Raisons: {suggestion.reasons.join(' • ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <button
                onClick={resetAll}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Recommencer
              </button>
              
              {(selectedPairs.size > 0 || selectedIsolated.size > 0) && (
                <button
                  onClick={handleMerge}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                >
                  Fusionner ({selectedPairs.size + selectedIsolated.size} sélections)
                </button>
              )}
            </div>
          </div>
        )}

        {/* ÉTAPE: Merged */}
        {step === 'merged' && validationResults && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 border">
              <div className="text-center mb-6">
                <CheckCircle className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Fusion terminée !</h2>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{validationResults.totalIndividuals}</div>
                    <div className="text-sm text-gray-500">Avant</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">-{validationResults.mergedCount}</div>
                    <div className="text-sm text-gray-500">Supprimés</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">{validationResults.remainingCount}</div>
                    <div className="text-sm text-gray-500">Après</div>
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

      {/* Modal Changelog */}
      {showChangelog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  Historique des versions
                </h2>
                <button
                  onClick={() => setShowChangelog(false)}
                  className="p-2 hover:bg-white/20 rounded-lg"
                >
                  ✕
                </button>
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
                        version.tag === 'ACTUELLE' ? 'bg-green-500 text-white' : 'bg-gray-200'
                      }`}>
                        {version.tag}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">{version.date}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{version.title}</h3>
                  <ul className="space-y-1">
                    {version.items.map((item, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-emerald-500 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t">
              <button
                onClick={() => setShowChangelog(false)}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Prévisualisation */}
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
                <div className="text-sm space-y-1">
                  {previewPair.details.map((detail, i) => (
                    <p key={i} className="text-gray-600">{detail}</p>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex gap-3">
              <button onClick={closePreview} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                Fermer
              </button>
              <button
                onClick={() => { togglePairSelection(previewPair.id); closePreview(); }}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  selectedPairs.has(previewPair.id)
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {selectedPairs.has(previewPair.id) ? 'Désélectionner' : 'Sélectionner pour fusion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GedcomDuplicateMerger;
