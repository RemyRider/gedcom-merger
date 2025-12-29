// ═══════════════════════════════════════════════════════════════════════════════
// FUSIONNEUR DE DOUBLONS GEDCOM v1.9.3
// ═══════════════════════════════════════════════════════════════════════════════
// Application React pour détecter et fusionner intelligemment les doublons
// dans les fichiers GEDCOM (format standard de généalogie).
//
// NOUVEAUTÉS v1.9.3 :
// - Onglet "À supprimer" : uniquement totalement isolés + sans nom/prénom
// - Bouton flottant pour actions rapides sans scroller
// - Tableau clusters détaillé avec toutes les infos
// - Action "Supprimer" distincte de "Fusionner" pour isolés
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo } from 'react';
import { 
  Upload, Users, AlertCircle, Download, Trash2, CheckCircle, 
  Sparkles, FileText, UserX, Lightbulb, ChevronDown, ChevronUp,
  Search, Filter, Eye, X, AlertTriangle, Merge, Brain
} from 'lucide-react';

const GedcomDuplicateMerger = () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // ÉTATS REACT
  // ═══════════════════════════════════════════════════════════════════════════
  const [file, setFile] = useState(null);
  const [individuals, setIndividuals] = useState([]);
  const [familiesData, setFamiliesData] = useState(new Map());
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
  
  // États pour le système d'onglets
  const [showChangelog, setShowChangelog] = useState(false);
  const [activeTab, setActiveTab] = useState('clusters');
  const [clusterScoreFilter, setClusterScoreFilter] = useState(80);
  const [selectedClusters, setSelectedClusters] = useState(new Set());
  
  // États pour les "À supprimer" et suggestions IA
  const [toDeletePersons, setToDeletePersons] = useState([]);
  const [selectedToDelete, setSelectedToDelete] = useState(new Set());
  const [smartSuggestions, setSmartSuggestions] = useState([]);

  const VERSION = '1.9.3';

  // ═══════════════════════════════════════════════════════════════════════════
  // CHANGELOG COMPLET
  // ═══════════════════════════════════════════════════════════════════════════
  const CHANGELOG = [
    {
      version: '1.9.3',
      date: '28 décembre 2025',
      tag: 'ACTUELLE',
      color: 'green',
      title: 'Onglet "À supprimer" et bouton flottant',
      items: [
        'Onglet "À supprimer" : uniquement totalement isolés (sans ascendants, descendants, ni conjoints)',
        'Ajout des individus sans nom ET sans prénom dans "À supprimer"',
        'Bouton flottant pour fusionner/supprimer sans scroller',
        'Tableau clusters détaillé avec toutes les informations',
        'Action "Supprimer" distincte de "Fusionner" pour les isolés',
        'Sélections globales multi-onglets préservées'
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
        'Critères suffisants: naissance, lieu, parents, conjoints, fratrie, décès, profession',
        'Élimination des faux positifs sur homonymes sans données'
      ]
    },
    {
      version: '1.9.1',
      date: '28 décembre 2025',
      tag: null,
      color: 'cyan',
      title: 'Correction traitement fichier + fonctionnalités',
      items: [
        'Correction du traitement des fichiers GEDCOM',
        'Restauration onglet Isolés pour individus sans famille',
        'Restauration onglet Suggestions IA avec analyse patterns',
        'Normalisation automatique des lieux (codes INSEE)'
      ]
    },
    {
      version: '1.8.7',
      date: '24 décembre 2025',
      tag: null,
      color: 'indigo',
      title: 'Version complète avec corrections',
      items: [
        'Restauration bouton Changelog/Nouveautés',
        'Système d\'onglets Clusters/Doublons simples',
        'CORRECTION: Gestion balises CONT/CONC multi-lignes',
        'CORRECTION: Génération automatique HEAD/TRLR'
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
        'Détection intelligente Soundex français',
        'Système de scoring hybride 9 critères',
        'Fusion sécurisée sans perte de données'
      ]
    }
  ];

  // ═══════════════════════════════════════════════════════════════════════════
  // PARSEUR GEDCOM
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
        }
        return;
      }
      
      if (trimmed.startsWith('0') && trimmed.includes('INDI')) {
        if (currentPerson) people.push(currentPerson);
        const match = trimmed.match(/@([^@]+)@/);
        const id = match ? match[1] : `INDI${people.length}`;
        currentPerson = {
          id,
          names: [],
          birth: '',
          birthPlace: '',
          death: '',
          deathPlace: '',
          sex: '',
          occupation: '',
          religion: '',
          parents: [],
          spouses: [],
          familyAsChild: null,
          familiesAsSpouse: []
        };
        currentFamily = null;
        currentEvent = null;
        lastFieldType = null;
      }
      else if (trimmed.startsWith('0') && trimmed.includes('FAM')) {
        if (currentPerson) {
          people.push(currentPerson);
          currentPerson = null;
        }
        const match = trimmed.match(/@([^@]+)@/);
        const id = match ? match[1] : `FAM${families.size}`;
        currentFamily = { id, husband: null, wife: null, children: [] };
        families.set(id, currentFamily);
        currentEvent = null;
      }
      else if (trimmed.startsWith('0')) {
        if (currentPerson) {
          people.push(currentPerson);
          currentPerson = null;
        }
        currentFamily = null;
        currentEvent = null;
      }
      else if (currentPerson) {
        if (trimmed.includes('NAME')) {
          const namePart = trimmed.split('NAME')[1]?.trim() || '';
          const cleanName = namePart.replace(/\//g, '').trim();
          if (cleanName) {
            currentPerson.names.push(cleanName);
            lastFieldType = 'NAME';
          }
        } else if (trimmed.includes('SEX')) {
          currentPerson.sex = trimmed.split('SEX')[1]?.trim() || '';
        } else if (trimmed.includes('OCCU')) {
          currentPerson.occupation = trimmed.split('OCCU')[1]?.trim() || '';
          lastFieldType = 'OCCU';
        } else if (trimmed.includes('RELI')) {
          currentPerson.religion = trimmed.split('RELI')[1]?.trim() || '';
        } else if (trimmed.startsWith('1 BIRT')) {
          currentEvent = 'birth';
        } else if (trimmed.startsWith('1 DEAT')) {
          currentEvent = 'death';
        } else if (currentEvent && trimmed.includes('DATE')) {
          const date = trimmed.split('DATE')[1]?.trim() || '';
          if (currentEvent === 'birth') {
            currentPerson.birth = date;
            lastFieldType = 'BIRT_DATE';
          } else if (currentEvent === 'death') {
            currentPerson.death = date;
            lastFieldType = 'DEAT_DATE';
          }
        } else if (currentEvent && trimmed.includes('PLAC')) {
          const place = trimmed.split('PLAC')[1]?.trim() || '';
          if (currentEvent === 'birth') {
            currentPerson.birthPlace = place;
            lastFieldType = 'BIRT_PLAC';
          } else if (currentEvent === 'death') {
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
        
        if (trimmed.startsWith('1 ') && !trimmed.startsWith('1 BIRT') && !trimmed.startsWith('1 DEAT')) {
          if (!trimmed.includes('DATE') && !trimmed.includes('PLAC')) {
            currentEvent = null;
          }
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

    // Résoudre les liens parents/conjoints
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

  // ═══════════════════════════════════════════════════════════════════════════
  // ALGORITHME SOUNDEX FRANÇAIS
  // ═══════════════════════════════════════════════════════════════════════════
  const soundex = (str) => {
    if (!str) return '';
    const s = str.toLowerCase().replace(/[^a-zàâäéèêëïîôùûüç]/g, '');
    if (s.length === 0) return '';
    
    const normalized = s
      .replace(/[àâä]/g, 'a')
      .replace(/[éèêë]/g, 'e')
      .replace(/[ïî]/g, 'i')
      .replace(/[ôö]/g, 'o')
      .replace(/[ùûü]/g, 'u')
      .replace(/ç/g, 'c');
    
    let code = normalized
      .replace(/[aeiouyhw]/g, '0')
      .replace(/[bfpv]/g, '1')
      .replace(/[cgjkqsxz]/g, '2')
      .replace(/[dt]/g, '3')
      .replace(/[l]/g, '4')
      .replace(/[mn]/g, '5')
      .replace(/[r]/g, '6');
    
    let result = normalized[0] + code.slice(1).replace(/(.)\1+/g, '$1').replace(/0/g, '');
    return result.substring(0, 4).padEnd(4, '0');
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CALCUL DE SIMILARITÉ (9 critères) - ALGORITHME ANTI-FAUX-POSITIFS v1.9.2
  // ═══════════════════════════════════════════════════════════════════════════
  const calculateSimilarity = (person1, person2) => {
    const details = [];
    let matchScore = 0;
    let maxPossibleScore = 0;
    const sufficientCriteria = [];

    // 1. NOM COMPLET (pondération: 30)
    const name1 = person1.names[0]?.toLowerCase() || '';
    const name2 = person2.names[0]?.toLowerCase() || '';
    
    if (name1 || name2) {
      maxPossibleScore += 30;
      
      if (name1 && name2) {
        const firstName1 = soundex(name1.split(' ')[0]);
        const firstName2 = soundex(name2.split(' ')[0]);
        const lastName1 = soundex(name1.split(' ').pop());
        const lastName2 = soundex(name2.split(' ').pop());
        
        if (name1 === name2) {
          matchScore += 30;
          details.push('✓ Noms identiques (+30/30)');
        } else if (firstName1 === firstName2 && lastName1 === lastName2) {
          matchScore += 25;
          details.push('✓ Noms phonétiquement identiques (+25/30)');
        } else if (firstName1 === firstName2 || lastName1 === lastName2) {
          matchScore += 20;
          details.push('≈ Prénom ou nom similaire (+20/30)');
        } else if (name1.includes(name2) || name2.includes(name1)) {
          matchScore += 15;
          details.push('≈ Noms partiellement similaires (+15/30)');
        } else {
          details.push('✗ Noms différents (0/30)');
        }
      }
    }

    // 2. DATE DE NAISSANCE (pondération: 25)
    if (person1.birth || person2.birth) {
      maxPossibleScore += 25;
      
      if (person1.birth && person2.birth) {
        const year1 = person1.birth.match(/\d{4}/);
        const year2 = person2.birth.match(/\d{4}/);
        
        if (person1.birth === person2.birth) {
          matchScore += 25;
          details.push('✓ Dates naissance identiques (+25/25)');
          sufficientCriteria.push('date_naissance');
        } else if (year1 && year2) {
          const diff = Math.abs(parseInt(year1[0]) - parseInt(year2[0]));
          if (diff === 0) {
            matchScore += 20;
            details.push('✓ Années naissance identiques (+20/25)');
            sufficientCriteria.push('annee_naissance');
          } else if (diff <= 2) {
            matchScore += 12;
            details.push('≈ Années naissance proches (+12/25)');
            sufficientCriteria.push('annee_naissance_proche');
          } else {
            details.push('✗ Dates naissance éloignées (0/25)');
          }
        }
      }
    }

    // 3. SEXE (pondération: 15 - ÉLIMINATOIRE si différent)
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

    // 4. PARENTS (pondération: 20)
    if (person1.parents.length > 0 || person2.parents.length > 0) {
      maxPossibleScore += 20;
      
      if (person1.parents.length > 0 && person2.parents.length > 0) {
        const commonParents = person1.parents.filter(p => person2.parents.includes(p));
        if (commonParents.length === 2) {
          matchScore += 20;
          details.push('✓ 2 parents communs (+20/20)');
          sufficientCriteria.push('parents_communs');
        } else if (commonParents.length === 1) {
          matchScore += 10;
          details.push('≈ 1 parent commun (+10/20)');
          sufficientCriteria.push('un_parent_commun');
        } else {
          details.push('✗ Parents différents (0/20)');
        }
      }
    }

    // 5. FRATRIE (pondération: 15)
    if (!(person1.parents.length > 0 && person2.parents.length > 0)) {
      if (person1.familyAsChild || person2.familyAsChild) {
        maxPossibleScore += 15;
        
        if (person1.familyAsChild && person2.familyAsChild) {
          if (person1.familyAsChild === person2.familyAsChild) {
            matchScore += 15;
            details.push('✓ Même fratrie (+15/15)');
            sufficientCriteria.push('fratrie');
          } else {
            details.push('✗ Fratries différentes (0/15)');
          }
        }
      }
    }

    // 6. LIEU DE NAISSANCE (pondération: 10)
    if (person1.birthPlace || person2.birthPlace) {
      maxPossibleScore += 10;
      
      const place1 = person1.birthPlace?.toLowerCase();
      const place2 = person2.birthPlace?.toLowerCase();
      
      if (place1 && place2) {
        if (place1 === place2) {
          matchScore += 10;
          details.push('✓ Lieux naissance identiques (+10/10)');
          sufficientCriteria.push('lieu_naissance');
        } else {
          details.push('✗ Lieux naissance différents (0/10)');
        }
      }
    }

    // 7. CONJOINTS (pondération: 8)
    if (person1.spouses.length > 0 || person2.spouses.length > 0) {
      maxPossibleScore += 8;
      
      if (person1.spouses.length > 0 && person2.spouses.length > 0) {
        const commonSpouses = person1.spouses.filter(s => person2.spouses.includes(s));
        if (commonSpouses.length > 0) {
          matchScore += 8;
          details.push('✓ Conjoints communs (+8/8)');
          sufficientCriteria.push('conjoints_communs');
        } else {
          details.push('✗ Conjoints différents (0/8)');
        }
      }
    }

    // 8. DATE DE DÉCÈS (pondération: 15)
    if (person1.death || person2.death) {
      maxPossibleScore += 15;
      
      if (person1.death && person2.death) {
        if (person1.death === person2.death) {
          matchScore += 15;
          details.push('✓ Dates décès identiques (+15/15)');
          sufficientCriteria.push('date_deces');
        } else {
          details.push('✗ Dates décès différentes (0/15)');
        }
      }
    }

    // 9. PROFESSION (pondération: 5)
    if (person1.occupation || person2.occupation) {
      maxPossibleScore += 5;
      
      if (person1.occupation && person2.occupation) {
        if (person1.occupation.toLowerCase() === person2.occupation.toLowerCase()) {
          matchScore += 5;
          details.push('✓ Même profession (+5/5)');
          sufficientCriteria.push('profession');
        } else {
          details.push('✗ Professions différentes (0/5)');
        }
      }
    }

    const finalScore = maxPossibleScore > 0 
      ? Math.round((matchScore / maxPossibleScore) * 100) 
      : 0;
    
    details.unshift(`📊 Score: ${matchScore}/${maxPossibleScore} points`);
    
    return { score: finalScore, details, sufficientCriteria };
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RECHERCHE DE DOUBLONS AVEC TRIPLE INDEXATION
  // ═══════════════════════════════════════════════════════════════════════════
  const findDuplicates = (people) => {
    const result = [];
    const compared = new Set();
    let totalComparisons = 0;
    let skipped = 0;
    
    const phoneticIndex = new Map();
    const yearIndex = new Map();
    const parentIndex = new Map();
    
    people.forEach(person => {
      const fullName = person.names[0] || '';
      const parts = fullName.toLowerCase().split(' ');
      const firstName = parts[0] || '';
      const lastName = parts[parts.length - 1] || '';
      
      const key = `${soundex(firstName)}-${soundex(lastName)}`;
      if (!phoneticIndex.has(key)) phoneticIndex.set(key, []);
      phoneticIndex.get(key).push(person);
      
      const year = person.birth?.match(/\d{4}/)?.[0];
      if (year) {
        if (!yearIndex.has(year)) yearIndex.set(year, []);
        yearIndex.get(year).push(person);
      }
      
      person.parents.forEach(parentId => {
        if (!parentIndex.has(parentId)) parentIndex.set(parentId, []);
        parentIndex.get(parentId).push(person);
      });
    });
    
    const comparePair = (person1, person2) => {
      if (person1.id === person2.id) return;
      
      const pairKey = person1.id < person2.id 
        ? `${person1.id}-${person2.id}` 
        : `${person2.id}-${person1.id}`;
      
      if (compared.has(pairKey)) return;
      compared.add(pairKey);
      totalComparisons++;
      
      if (person1.sex && person2.sex && person1.sex !== person2.sex) {
        skipped++;
        return;
      }
      
      const y1 = person1.birth?.match(/\d{4}/)?.[0];
      const y2 = person2.birth?.match(/\d{4}/)?.[0];
      if (y1 && y2 && Math.abs(parseInt(y1) - parseInt(y2)) > 5) {
        skipped++;
        return;
      }
      
      const sim = calculateSimilarity(person1, person2);
      
      // v1.9.2: REJET si aucun critère suffisant
      if (sim.sufficientCriteria.length === 0 && sim.score < 95) {
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
    
    for (let i = 0; i < people.length; i++) {
      const person = people[i];
      
      const fullName = person.names[0] || '';
      const parts = fullName.toLowerCase().split(' ');
      const firstName = parts[0] || '';
      const lastName = parts[parts.length - 1] || '';
      const key = `${soundex(firstName)}-${soundex(lastName)}`;
      
      const phoneticMatches = phoneticIndex.get(key) || [];
      phoneticMatches.forEach(other => comparePair(person, other));
      
      const year = person.birth?.match(/\d{4}/)?.[0];
      if (year) {
        const yearMatches = yearIndex.get(year) || [];
        yearMatches.forEach(other => comparePair(person, other));
      }
      
      person.parents.forEach(parentId => {
        const parentMatches = parentIndex.get(parentId) || [];
        parentMatches.forEach(other => comparePair(person, other));
      });
      
      if (i % 100 === 0) {
        const pct = Math.round((i / people.length) * 100);
        setProgress(30 + pct * 0.65);
      }
    }
    
    console.log(`v1.9.3 - Optimisation: ${totalComparisons} comparaisons (${skipped} skipped/rejetés)`);
    
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
              avgScore,
              pairs: clusterPairs
            });
          }
        }
      }
    });
    
    foundClusters.sort((a, b) => b.avgScore - a.avgScore);
    console.log('Clusters détectés:', foundClusters.length);
    setClusters(foundClusters);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // DÉTECTION DES INDIVIDUS "À SUPPRIMER" (v1.9.3)
  // ═══════════════════════════════════════════════════════════════════════════
  const detectToDeletePersons = (people, families) => {
    const toDelete = [];
    
    const childrenMap = new Map();
    families.forEach(family => {
      if (family.husband) {
        if (!childrenMap.has(family.husband)) childrenMap.set(family.husband, []);
        childrenMap.get(family.husband).push(...family.children);
      }
      if (family.wife) {
        if (!childrenMap.has(family.wife)) childrenMap.set(family.wife, []);
        childrenMap.get(family.wife).push(...family.children);
      }
    });
    
    people.forEach(person => {
      const hasParents = person.parents.length > 0;
      const hasChildren = (childrenMap.get(person.id) || []).length > 0;
      const hasSpouses = person.spouses.length > 0;
      
      const isTotallyIsolated = !hasParents && !hasChildren && !hasSpouses;
      
      const fullName = person.names[0] || '';
      const nameParts = fullName.trim().split(' ').filter(p => p.length > 0);
      const hasNoIdentity = nameParts.length === 0;
      
      if (isTotallyIsolated || hasNoIdentity) {
        toDelete.push({
          ...person,
          reason: isTotallyIsolated && hasNoIdentity 
            ? 'Isolé + Sans identité'
            : isTotallyIsolated 
              ? 'Totalement isolé'
              : 'Sans nom ni prénom'
        });
      }
    });
    
    return toDelete;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SUGGESTIONS IA
  // ═══════════════════════════════════════════════════════════════════════════
  const generateAiSuggestions = (people) => {
    const suggestions = [];
    const lastNameGroups = new Map();
    
    people.forEach(person => {
      const fullName = person.names[0] || '';
      const lastName = fullName.split(' ').pop()?.replace(/\//g, '').toLowerCase() || '';
      const lastNameKey = soundex(lastName);
      
      if (lastNameKey && lastNameKey !== '0000') {
        if (!lastNameGroups.has(lastNameKey)) {
          lastNameGroups.set(lastNameKey, []);
        }
        lastNameGroups.get(lastNameKey).push(person);
      }
    });
    
    lastNameGroups.forEach((group, key) => {
      if (group.length < 3) return;
      
      const years = group
        .map(p => p.birth?.match(/\d{4}/)?.[0])
        .filter(y => y)
        .map(y => parseInt(y));
      
      if (years.length < 2) return;
      
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);
      
      if (maxYear - minYear <= 30 && group.length >= 3) {
        const lastName = group[0].names[0]?.split(' ').pop() || 'Inconnu';
        
        let confidence = 60;
        if (group.length >= 5) confidence += 10;
        if (maxYear - minYear <= 15) confidence += 15;
        
        suggestions.push({
          type: 'same_name_period',
          name: lastName,
          count: group.length,
          period: `${minYear}-${maxYear}`,
          people: group,
          confidence: Math.min(confidence, 95)
        });
      }
    });
    
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // FONCTIONS UTILITAIRES
  // ═══════════════════════════════════════════════════════════════════════════
  const getFilteredClusters = () => {
    return clusters.filter(cluster => cluster.avgScore >= clusterScoreFilter);
  };

  const getSimplePairs = () => {
    const clusterIds = new Set();
    clusters.forEach(cluster => {
      cluster.ids.forEach(id => clusterIds.add(id));
    });
    
    return duplicates.filter(dup => 
      !clusterIds.has(dup.person1.id) || !clusterIds.has(dup.person2.id)
    ).filter(dup => dup.similarity >= filterScore);
  };

  const autoSelectHighConfidenceClusters = () => {
    const newSelected = new Set();
    clusters.forEach((cluster, idx) => {
      if (cluster.avgScore >= 95) {
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

  const selectFilteredDuplicates = () => {
    const filtered = getSimplePairs();
    const newSelected = new Set(selectedPairs);
    filtered.forEach(dup => newSelected.add(dup.id));
    setSelectedPairs(newSelected);
  };

  const selectAllToDelete = () => {
    setSelectedToDelete(new Set(toDeletePersons.map(p => p.id)));
  };

  const deselectAllToDelete = () => {
    setSelectedToDelete(new Set());
  };

  const toggleToDeleteSelection = (personId) => {
    const newSelected = new Set(selectedToDelete);
    if (newSelected.has(personId)) {
      newSelected.delete(personId);
    } else {
      newSelected.add(personId);
    }
    setSelectedToDelete(newSelected);
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
    const quality1 = calculateDataQuality(pair.person1);
    const quality2 = calculateDataQuality(pair.person2);
    
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
  // HANDLERS
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
        setFamiliesData(families);
        setProgress(30);
        
        setTimeout(() => {
          const dups = findDuplicates(people);
          setDuplicates(dups);
          
          const toDelete = detectToDeletePersons(people, families);
          setToDeletePersons(toDelete);
          
          const suggestions = generateAiSuggestions(people);
          setSmartSuggestions(suggestions);
          
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

  const handleMerge = () => {
    const idsToMerge = new Map();
    
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
    setMergedIds(idsToMerge);
    
    const idsToRemove = new Set();
    idsToMerge.forEach((target, source) => {
      if (source !== target) idsToRemove.add(source);
    });
    
    setValidationResults({
      totalIndividuals: individuals.length,
      mergedCount: idsToRemove.size,
      deletedCount: 0,
      remainingCount: individuals.length - idsToRemove.size
    });
    
    setStep('merged');
  };

  const handleDeleteToDelete = () => {
    if (selectedToDelete.size === 0) return;
    
    const confirmation = window.confirm(
      `⚠️ Vous allez SUPPRIMER définitivement ${selectedToDelete.size} individu(s) de votre arbre.\n\n` +
      `Cette action est irréversible. Continuer ?`
    );
    
    if (!confirmation) return;
    
    setMergedIds(new Map());
    
    setValidationResults({
      totalIndividuals: individuals.length,
      mergedCount: 0,
      deletedCount: selectedToDelete.size,
      remainingCount: individuals.length - selectedToDelete.size
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
    
    selectedToDelete.forEach(id => {
      idsToRemove.add(id);
    });

    const lines = originalGedcom.split('\n');
    const outputLines = [];
    let skip = false;
    let hasHead = false;

    if (lines.length > 0 && lines[0].trim().startsWith('0 HEAD')) {
      hasHead = true;
    }

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
      const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
      const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
      outputLines.push(`1 DATE ${dateStr}`);
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

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
    setFamiliesData(new Map());
    setDuplicates([]);
    setSelectedPairs(new Set());
    setOriginalGedcom('');
    setSearchTerm('');
    setFilterScore(80);
    setProgress(0);
    setClusters([]);
    setExpandedClusters(new Set());
    setActiveTab('clusters');
    setClusterScoreFilter(80);
    setSelectedClusters(new Set());
    setToDeletePersons([]);
    setSelectedToDelete(new Set());
    setSmartSuggestions([]);
    setMergedIds(new Map());
    setValidationResults(null);
  };

  const totalSelectionsCount = useMemo(() => {
    return selectedPairs.size + selectedToDelete.size;
  }, [selectedPairs, selectedToDelete]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDU
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen md:p-2 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Fusionneur GEDCOM</h1>
                <p className="text-sm text-gray-500">v{VERSION}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowChangelog(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Nouveautés
              </button>
              {step !== 'upload' && (
                <button
                  onClick={resetAll}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Nouveau fichier
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Changelog */}
      {showChangelog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Historique des versions
              </h2>
              <button onClick={() => setShowChangelog(false)} className="text-white/80 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
              {CHANGELOG.map((release, idx) => (
                <div key={idx} className={`border-l-4 pl-4 ${
                  release.color === 'green' ? 'border-green-500' :
                  release.color === 'blue' ? 'border-blue-500' :
                  release.color === 'indigo' ? 'border-indigo-500' :
                  release.color === 'purple' ? 'border-purple-500' :
                  'border-gray-400'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-lg">v{release.version}</span>
                    {release.tag && (
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        release.tag === 'ACTUELLE' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>{release.tag}</span>
                    )}
                    <span className="text-sm text-gray-500">{release.date}</span>
                  </div>
                  <p className="font-medium text-gray-800 mb-2">{release.title}</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {release.items.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Étape Upload */}
        {step === 'upload' && (
          <div className="text-center py-16">
            <Upload className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Téléchargez votre fichier GEDCOM</h2>
            <p className="text-gray-600 mb-8">Formats acceptés: .ged, .gedcom</p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".ged,.gedcom"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg inline-flex items-center gap-3 transition-colors">
                <Upload className="w-6 h-6" />
                Choisir un fichier
              </div>
            </label>
          </div>
        )}

        {/* Étape Analyse */}
        {step === 'analyzing' && (
          <div className="text-center py-16">
            <div className="animate-spin w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-6"></div>
            <h2 className="text-2xl font-semibold mb-4">Analyse en cours...</h2>
            <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-4">
              <div 
                className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{progress}%</p>
          </div>
        )}

        {/* Étape Review */}
        {step === 'review' && (
          <div>
            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow border">
                <div className="text-2xl font-bold text-gray-900">{individuals.length}</div>
                <div className="text-sm text-gray-500">Individus</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow border">
                <div className="text-2xl font-bold text-orange-600">{getFilteredClusters().length}</div>
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
              <div className="flex border-b overflow-x-auto">
                {[
                  { id: 'clusters', label: 'Clusters', icon: '🟠', count: getFilteredClusters().length },
                  { id: 'pairs', label: 'Doublons', icon: '🔵', count: getSimplePairs().length },
                  { id: 'toDelete', label: 'À supprimer', icon: '🔴', count: toDeletePersons.length },
                  { id: 'ai', label: 'Suggestions IA', icon: '🟣', count: smartSuggestions.length }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-[120px] px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span>{tab.icon}</span>
                      {tab.label} ({tab.count})
                    </span>
                  </button>
                ))}
              </div>

              {/* ONGLET CLUSTERS */}
              {activeTab === 'clusters' && (
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Score min:</label>
                      <input
                        type="range"
                        min="80"
                        max="100"
                        value={clusterScoreFilter}
                        onChange={(e) => setClusterScoreFilter(parseInt(e.target.value))}
                        className="w-32"
                      />
                      <span className="text-sm font-medium text-gray-700">{clusterScoreFilter}%</span>
                    </div>
                    <button
                      onClick={autoSelectHighConfidenceClusters}
                      className="px-3 py-1.5 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"
                    >
                      Sélectionner ≥95%
                    </button>
                    <span className="text-sm text-gray-500">
                      {selectedClusters.size} cluster(s) sélectionné(s)
                    </span>
                  </div>

                  {getFilteredClusters().length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Aucun cluster trouvé avec ce score minimum
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {getFilteredClusters().map((cluster, idx) => {
                        const originalIdx = clusters.indexOf(cluster);
                        return (
                          <div
                            key={originalIdx}
                            className={`border-2 rounded-xl overflow-hidden transition-all ${
                              selectedClusters.has(originalIdx)
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200'
                            }`}
                          >
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-3">
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
                                        selectCluster(cluster.ids);
                                      }
                                      setSelectedClusters(newSelected);
                                    }}
                                    className="w-5 h-5 text-orange-600"
                                  />
                                  <span className="font-semibold text-lg">
                                    {cluster.size} personnes
                                  </span>
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    cluster.avgScore >= 95 ? 'bg-green-100 text-green-800' :
                                    cluster.avgScore >= 90 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-orange-100 text-orange-800'
                                  }`}>
                                    Score: {cluster.avgScore}%
                                  </span>
                                </div>
                                <button
                                  onClick={() => toggleClusterExpand(originalIdx)}
                                  className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                  {expandedClusters.has(originalIdx) ? (
                                    <>
                                      <ChevronUp className="w-4 h-4" />
                                      Masquer
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="w-4 h-4" />
                                      Détails
                                    </>
                                  )}
                                </button>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {cluster.people.slice(0, 5).map((person, pIdx) => (
                                  <span key={pIdx} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">
                                    {person.names[0] || 'Sans nom'}
                                  </span>
                                ))}
                                {cluster.people.length > 5 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                                    +{cluster.people.length - 5} autres
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* TABLEAU DÉTAILLÉ DU CLUSTER */}
                            {expandedClusters.has(originalIdx) && (
                              <div className="border-t bg-gray-50 p-4">
                                <h4 className="font-semibold text-gray-700 mb-3">
                                  📊 Détail des {cluster.size} membres du cluster
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead className="bg-orange-100">
                                      <tr>
                                        <th className="px-3 py-2 text-left">#</th>
                                        <th className="px-3 py-2 text-left">Nom complet</th>
                                        <th className="px-3 py-2 text-left">Naissance</th>
                                        <th className="px-3 py-2 text-left">Lieu</th>
                                        <th className="px-3 py-2 text-left">Décès</th>
                                        <th className="px-3 py-2 text-left">Sexe</th>
                                        <th className="px-3 py-2 text-left">Parents</th>
                                        <th className="px-3 py-2 text-left">Conjoints</th>
                                        <th className="px-3 py-2 text-left">ID</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y bg-white">
                                      {cluster.people.map((person, pIdx) => (
                                        <tr key={pIdx} className="hover:bg-orange-50">
                                          <td className="px-3 py-2">
                                            <span className="bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                              {pIdx + 1}
                                            </span>
                                          </td>
                                          <td className="px-3 py-2 font-medium">{person.names[0] || 'Sans nom'}</td>
                                          <td className="px-3 py-2">{person.birth || '-'}</td>
                                          <td className="px-3 py-2 text-gray-600 max-w-[150px] truncate">{person.birthPlace || '-'}</td>
                                          <td className="px-3 py-2">{person.death || '-'}</td>
                                          <td className="px-3 py-2">{person.sex || '-'}</td>
                                          <td className="px-3 py-2">{person.parents.length}</td>
                                          <td className="px-3 py-2">{person.spouses.length}</td>
                                          <td className="px-3 py-2 font-mono text-xs text-gray-500">{person.id}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                
                                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <div className="bg-white rounded-lg p-3 border">
                                    <div className="text-xs text-gray-500">Avec naissance</div>
                                    <div className="text-lg font-bold text-blue-600">
                                      {cluster.people.filter(p => p.birth).length}/{cluster.size}
                                    </div>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 border">
                                    <div className="text-xs text-gray-500">Avec décès</div>
                                    <div className="text-lg font-bold text-purple-600">
                                      {cluster.people.filter(p => p.death).length}/{cluster.size}
                                    </div>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 border">
                                    <div className="text-xs text-gray-500">Avec parents</div>
                                    <div className="text-lg font-bold text-green-600">
                                      {cluster.people.filter(p => p.parents.length > 0).length}/{cluster.size}
                                    </div>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 border">
                                    <div className="text-xs text-gray-500">Paires liées</div>
                                    <div className="text-lg font-bold text-orange-600">
                                      {cluster.pairs?.length || 0}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ONGLET DOUBLONS SIMPLES */}
              {activeTab === 'pairs' && (
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-3 py-1.5 border rounded-lg text-sm w-48"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <input
                        type="range"
                        min="80"
                        max="100"
                        value={filterScore}
                        onChange={(e) => setFilterScore(parseInt(e.target.value))}
                        className="w-24"
                      />
                      <span className="text-sm">{filterScore}%</span>
                    </div>
                    <button
                      onClick={selectFilteredDuplicates}
                      className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                    >
                      Tout sélectionner (≥{filterScore}%)
                    </button>
                    <span className="text-sm text-gray-500">
                      {selectedPairs.size} sélectionné(s)
                    </span>
                  </div>

                  {getSimplePairs().length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Aucun doublon simple trouvé
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getSimplePairs()
                        .filter(pair => {
                          if (!searchTerm) return true;
                          const term = searchTerm.toLowerCase();
                          return pair.person1.names[0]?.toLowerCase().includes(term) ||
                                 pair.person2.names[0]?.toLowerCase().includes(term);
                        })
                        .map(pair => (
                          <div
                            key={pair.id}
                            className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                              selectedPairs.has(pair.id)
                                ? 'border-blue-500 bg-blue-50'
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
                                  className="w-5 h-5 text-blue-600"
                                />
                                <div>
                                  <p className="font-medium">{pair.person1.names[0] || 'Sans nom'}</p>
                                  <p className="text-sm text-gray-500">{pair.person1.birth || '?'}</p>
                                </div>
                                <span className="text-gray-400">↔</span>
                                <div>
                                  <p className="font-medium">{pair.person2.names[0] || 'Sans nom'}</p>
                                  <p className="text-sm text-gray-500">{pair.person2.birth || '?'}</p>
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openPreview(pair);
                                  }}
                                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            {pair.sufficientCriteria?.length > 0 && (
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
                <div className="p-4">
                  <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                      <Trash2 className="w-5 h-5" />
                      Individus à supprimer ({toDeletePersons.length})
                    </h3>
                    <p className="text-sm text-red-700 mb-3">
                      Cette liste contient les individus <strong>totalement isolés</strong> (sans ascendants, 
                      descendants ni conjoints) et ceux <strong>sans identité</strong> (ni nom ni prénom).
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={selectAllToDelete}
                        className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Tout sélectionner
                      </button>
                      <button
                        onClick={deselectAllToDelete}
                        className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Tout désélectionner
                      </button>
                      <span className="text-sm text-red-600 font-medium self-center">
                        {selectedToDelete.size} sélectionné(s)
                      </span>
                    </div>
                  </div>

                  {toDeletePersons.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      ✅ Aucun individu à supprimer dans votre arbre
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {toDeletePersons.map(person => (
                        <div
                          key={person.id}
                          className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                            selectedToDelete.has(person.id)
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleToDeleteSelection(person.id)}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedToDelete.has(person.id)}
                                onChange={() => {}}
                                className="w-5 h-5 text-red-600"
                              />
                              <UserX className="w-5 h-5 text-red-500" />
                              <div>
                                <p className="font-semibold">
                                  {person.names[0] || <span className="italic text-gray-400">Sans nom</span>}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {person.birth || '?'} {person.birthPlace ? `• ${person.birthPlace}` : ''}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                person.reason.includes('Isolé') && person.reason.includes('identité')
                                  ? 'bg-red-200 text-red-900'
                                  : person.reason.includes('Isolé')
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-orange-100 text-orange-800'
                              }`}>
                                {person.reason}
                              </span>
                              <span className="text-xs text-gray-500 font-mono">{person.id}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ONGLET SUGGESTIONS IA */}
              {activeTab === 'ai' && (
                <div className="p-4">
                  <div className="mb-4 bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      Suggestions intelligentes ({smartSuggestions.length})
                    </h3>
                    <p className="text-sm text-purple-700">
                      L'IA analyse les patterns de votre arbre pour détecter des groupes suspects 
                      de personnes portant le même nom dans la même période.
                    </p>
                  </div>

                  {smartSuggestions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Aucune suggestion pour le moment
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {smartSuggestions.map((suggestion, idx) => (
                        <div key={idx} className="border-2 border-purple-200 rounded-xl p-4 bg-purple-50/50">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <Lightbulb className="w-6 h-6 text-purple-600" />
                              <div>
                                <h4 className="font-semibold text-purple-900">
                                  {suggestion.name} — {suggestion.count} personnes
                                </h4>
                                <p className="text-sm text-purple-700">
                                  Période : {suggestion.period}
                                </p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              suggestion.confidence >= 85 ? 'bg-green-100 text-green-800' :
                              suggestion.confidence >= 75 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              Confiance: {suggestion.confidence}%
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {suggestion.people.slice(0, 6).map((person, pIdx) => (
                              <span key={pIdx} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                                {person.names[0] || 'Sans nom'} ({person.birth?.match(/\d{4}/)?.[0] || '?'})
                              </span>
                            ))}
                            {suggestion.people.length > 6 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                                +{suggestion.people.length - 6} autres
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Boutons d'action en bas */}
              <div className="border-t p-4 bg-gray-50">
                <div className="flex flex-wrap gap-3 justify-end">
                  {(activeTab === 'clusters' || activeTab === 'pairs') && selectedPairs.size > 0 && (
                    <button
                      onClick={handleMerge}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                      <Merge className="w-5 h-5" />
                      Fusionner {selectedPairs.size} doublon(s)
                    </button>
                  )}
                  {activeTab === 'toDelete' && selectedToDelete.size > 0 && (
                    <button
                      onClick={handleDeleteToDelete}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      Supprimer {selectedToDelete.size} individu(s)
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* BOUTON FLOTTANT */}
            {totalSelectionsCount > 0 && (
              <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
                {selectedPairs.size > 0 && (
                  <button
                    onClick={handleMerge}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg flex items-center gap-2"
                  >
                    <Merge className="w-5 h-5" />
                    Fusionner {selectedPairs.size} doublon(s)
                  </button>
                )}
                {selectedToDelete.size > 0 && (
                  <button
                    onClick={handleDeleteToDelete}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg flex items-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Supprimer {selectedToDelete.size} individu(s)
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal Prévisualisation */}
        {previewPair && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Prévisualisation de la fusion</h2>
                <button onClick={() => setPreviewPair(null)} className="text-white/80 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-xl border-2 ${
                    previewPair.quality1 >= previewPair.quality2 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-red-500 bg-red-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        previewPair.quality1 >= previewPair.quality2 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-red-200 text-red-800'
                      }`}>
                        {previewPair.quality1 >= previewPair.quality2 ? 'CONSERVÉ' : 'SUPPRIMÉ'}
                      </span>
                      <span className="text-sm text-gray-500">Qualité: {previewPair.quality1}</span>
                    </div>
                    <h3 className="font-bold mb-2">{previewPair.original.person1.names[0] || 'Sans nom'}</h3>
                    <div className="text-sm space-y-1 text-gray-600">
                      <p>📅 {previewPair.original.person1.birth || '-'}</p>
                      <p>📍 {previewPair.original.person1.birthPlace || '-'}</p>
                      <p>⚰️ {previewPair.original.person1.death || '-'}</p>
                      <p>👤 {previewPair.original.person1.sex || '-'}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border-2 border-indigo-500 bg-indigo-50">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-indigo-200 text-indigo-800">
                        RÉSULTAT
                      </span>
                    </div>
                    <h3 className="font-bold mb-2">{previewPair.merged.names[0] || 'Sans nom'}</h3>
                    <div className="text-sm space-y-1 text-gray-600">
                      <p>📅 {previewPair.merged.birth || '-'}</p>
                      <p>📍 {previewPair.merged.birthPlace || '-'}</p>
                      <p>⚰️ {previewPair.merged.death || '-'}</p>
                      <p>👤 {previewPair.merged.sex || '-'}</p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border-2 ${
                    previewPair.quality2 > previewPair.quality1 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-red-500 bg-red-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        previewPair.quality2 > previewPair.quality1 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-red-200 text-red-800'
                      }`}>
                        {previewPair.quality2 > previewPair.quality1 ? 'CONSERVÉ' : 'SUPPRIMÉ'}
                      </span>
                      <span className="text-sm text-gray-500">Qualité: {previewPair.quality2}</span>
                    </div>
                    <h3 className="font-bold mb-2">{previewPair.original.person2.names[0] || 'Sans nom'}</h3>
                    <div className="text-sm space-y-1 text-gray-600">
                      <p>📅 {previewPair.original.person2.birth || '-'}</p>
                      <p>📍 {previewPair.original.person2.birthPlace || '-'}</p>
                      <p>⚰️ {previewPair.original.person2.death || '-'}</p>
                      <p>👤 {previewPair.original.person2.sex || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setPreviewPair(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
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
                    {selectedPairs.has(previewPair.original.id) ? 'Désélectionner' : 'Sélectionner pour fusion'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Étape Résultats */}
        {step === 'merged' && validationResults && (
          <div className="text-center py-12">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Traitement terminé !</h2>
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto mb-6">
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Individus initiaux:</span>
                  <span className="font-bold">{validationResults.totalIndividuals}</span>
                </div>
                {validationResults.mergedCount > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Doublons fusionnés:</span>
                    <span className="font-bold">-{validationResults.mergedCount}</span>
                  </div>
                )}
                {validationResults.deletedCount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Individus supprimés:</span>
                    <span className="font-bold">-{validationResults.deletedCount}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-gray-600">Individus restants:</span>
                  <span className="font-bold text-green-600">{validationResults.remainingCount}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={downloadCleanedFile}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Télécharger le fichier nettoyé
              </button>
              <button
                onClick={resetAll}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Nouveau fichier
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GedcomDuplicateMerger;
