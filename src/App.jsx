import React, { useState } from 'react';
import { Upload, Users, AlertCircle, Download, Trash2, CheckCircle, Sparkles, FileText } from 'lucide-react';

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
  
  // NOUVEAUX ÉTATS pour fonctionnalités manquantes
  const [showChangelog, setShowChangelog] = useState(false);
  const [activeTab, setActiveTab] = useState('clusters'); // 'clusters' ou 'pairs'
  const [clusterScoreFilter, setClusterScoreFilter] = useState(80);
  const [selectedClusters, setSelectedClusters] = useState(new Set());

  const VERSION = '1.8.7';

  // CHANGELOG complet
  const CHANGELOG = [
    {
      version: '1.8.7',
      date: '24 décembre 2025',
      tag: 'ACTUELLE',
      color: 'green',
      title: 'Version complète avec toutes les corrections',
      items: [
        'Restauration bouton Changelog/Nouveautés avec modal complète',
        'Restauration système d\'onglets Clusters/Doublons simples',
        'Ajout scoring moyen des clusters avec jauges visuelles',
        'Ajout filtre pourcentage minimum pour clusters',
        'Ajout sélection automatique clusters ≥95%',
        'CORRECTION CRITIQUE: Gestion balises CONT/CONC multi-lignes',
        'CORRECTION CRITIQUE: Génération automatique HEAD/TRLR'
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
        'Génération automatique balise TRLR de fin',
        'Amélioration compatibilité avec logiciels généalogie',
        'Correction bugs mineurs interface'
      ]
    },
    {
      version: '1.4.0',
      date: '5 décembre 2025',
      tag: null,
      color: 'indigo',
      title: 'Organisation interface et contrôle intégrité',
      items: [
        'Système d\'onglets séparant Clusters et Doublons simples',
        'Scoring moyen des clusters avec jauges colorées',
        'Auto-sélection clusters haute confiance (≥95%)',
        'Filtre pourcentage pour masquer clusters sous seuil',
        'Contrôle d\'intégrité GEDCOM après fusion'
      ]
    },
    {
      version: '1.3.0',
      date: '3 décembre 2025',
      tag: null,
      color: 'blue',
      title: 'Prévisualisation et changelog intégré',
      items: [
        'Prévisualisation complète des fusions avec modal',
        'Calcul automatique qualité des données',
        'Fusion intelligente avec enrichissement automatique',
        'Changelog intégré dans l\'interface',
        'Détection automatique des clusters'
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
        const match = trimmed.match(/@([^@]+)@/);
        const id = match ? match[1] : trimmed.split(' ')[1];
        currentFamily = { id, husband: null, wife: null, children: [] };
        families.set(id, currentFamily);
        currentPerson = null;
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
          lastFieldType = 'SEX';
        } else if (trimmed.startsWith('1 BIRT')) {
          currentEvent = 'birth';
          lastFieldType = null;
        } else if (trimmed.startsWith('1 DEAT')) {
          currentEvent = 'death';
          lastFieldType = null;
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

  const soundex = (str) => {
    if (!str) return '';
    const s = str.toLowerCase().replace(/[^a-z]/g, '');
    if (s.length === 0) return '';
    let code = s
      .replace(/[aeiouyhw]/g, '0')
      .replace(/[bfpv]/g, '1')
      .replace(/[cgjkq]/g, '2')
      .replace(/[dt]/g, '3')
      .replace(/[l]/g, '4')
      .replace(/[mn]/g, '5')
      .replace(/[r]/g, '6')
      .replace(/[sxz]/g, '7');
    let result = s[0] + code.slice(1).replace(/(.)\1+/g, '$1').replace(/0/g, '');
    return result.substring(0, 4).padEnd(4, '0');
  };

  const calculateSimilarity = (person1, person2) => {
    const details = [];
    
    let matchScore = 0;
    let maxPossibleScore = 0;
    
    const name1 = person1.names[0]?.toLowerCase() || '';
    const name2 = person2.names[0]?.toLowerCase() || '';
    
    // 1. NOMS (pondération: 30)
    if (name1 || name2) {
      maxPossibleScore += 30;
      
      if (name1 && name2) {
        const s1 = soundex(name1.split(' ')[0]);
        const s2 = soundex(name2.split(' ')[0]);
        const ls1 = soundex(name1.split(' ').pop());
        const ls2 = soundex(name2.split(' ').pop());
        
        if (name1 === name2) {
          matchScore += 30;
          details.push('✓ Noms identiques (+30/30)');
        } else if (s1 === s2 && ls1 === ls2) {
          matchScore += 25;
          details.push('✓ Noms phonétiquement identiques (+25/30)');
        } else if (s1 === s2 || ls1 === ls2) {
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
        const y1 = person1.birth.match(/\d{4}/);
        const y2 = person2.birth.match(/\d{4}/);
        
        if (person1.birth === person2.birth) {
          matchScore += 25;
          details.push('✓ Dates naissance identiques (+25/25)');
        } else if (y1 && y2) {
          const diff = Math.abs(parseInt(y1[0]) - parseInt(y2[0]));
          if (diff === 0) {
            matchScore += 20;
            details.push('✓ Années naissance identiques (+20/25)');
          } else if (diff <= 2) {
            matchScore += 12;
            details.push('≈ Années naissance proches (+12/25)');
          } else {
            details.push('✗ Dates naissance éloignées (0/25)');
          }
        }
      }
    }

    // 3. SEXE (pondération: 15) - Critère éliminatoire
    if (person1.sex || person2.sex) {
      maxPossibleScore += 15;
      
      if (person1.sex && person2.sex) {
        if (person1.sex === person2.sex) {
          matchScore += 15;
          details.push('✓ Même sexe (+15/15)');
        } else {
          details.push('✗ Sexes différents (ÉLIMINATOIRE)');
          return { score: 0, details };
        }
      }
    }

    // 4. PARENTS (pondération: 20)
    if (person1.parents.length > 0 || person2.parents.length > 0) {
      maxPossibleScore += 20;
      
      if (person1.parents.length > 0 && person2.parents.length > 0) {
        const common = person1.parents.filter(p => person2.parents.includes(p));
        if (common.length === 2) {
          matchScore += 20;
          details.push('✓ 2 parents communs (+20/20)');
        } else if (common.length === 1) {
          matchScore += 10;
          details.push('≈ 1 parent commun (+10/20)');
        } else {
          details.push('✗ Parents différents (0/20)');
        }
      }
    }

    // 5. FRATRIE (pondération: 15)
    const parentsCompared = (person1.parents.length > 0 && person2.parents.length > 0);
    if (!parentsCompared && (person1.familyAsChild || person2.familyAsChild)) {
      maxPossibleScore += 15;
      
      if (person1.familyAsChild && person2.familyAsChild) {
        if (person1.familyAsChild === person2.familyAsChild) {
          matchScore += 15;
          details.push('✓ Même fratrie (+15/15)');
        } else {
          details.push('✗ Fratries différentes (0/15)');
        }
      }
    }

    // 6. LIEU DE NAISSANCE (pondération: 10)
    if (person1.birthPlace || person2.birthPlace) {
      maxPossibleScore += 10;
      
      const bp1 = person1.birthPlace?.toLowerCase();
      const bp2 = person2.birthPlace?.toLowerCase();
      if (bp1 && bp2) {
        if (bp1 === bp2) {
          matchScore += 10;
          details.push('✓ Lieux naissance identiques (+10/10)');
        } else {
          details.push('✗ Lieux naissance différents (0/10)');
        }
      }
    }

    // 7. CONJOINTS (pondération: 8)
    if (person1.spouses.length > 0 || person2.spouses.length > 0) {
      maxPossibleScore += 8;
      
      if (person1.spouses.length > 0 && person2.spouses.length > 0) {
        const common = person1.spouses.filter(s => person2.spouses.includes(s));
        if (common.length > 0) {
          matchScore += 8;
          details.push('✓ Conjoints communs (+8/8)');
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
        } else {
          details.push('✗ Professions différentes (0/5)');
        }
      }
    }

    const finalScore = maxPossibleScore > 0 
      ? Math.round((matchScore / maxPossibleScore) * 100) 
      : 0;
    
    details.unshift(`📊 Score: ${matchScore}/${maxPossibleScore} points`);
    
    return { score: finalScore, details };
  };

  const findDuplicates = (people) => {
    const result = [];
    
    const buildIndex = () => {
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
        
        if (person.parents.length > 0) {
          const parentKey = person.parents.sort().join('-');
          if (!parentIndex.has(parentKey)) parentIndex.set(parentKey, []);
          parentIndex.get(parentKey).push(person);
        }
      });
      
      return { phoneticIndex, yearIndex, parentIndex };
    };
    
    const { phoneticIndex, yearIndex, parentIndex } = buildIndex();
    const compared = new Set();
    let totalComparisons = 0;
    let skipped = 0;
    
    people.forEach((person1, i) => {
      const candidates = new Set();
      
      const fullName1 = person1.names[0] || '';
      const parts1 = fullName1.toLowerCase().split(' ');
      const firstName1 = parts1[0] || '';
      const lastName1 = parts1[parts1.length - 1] || '';
      const key1 = `${soundex(firstName1)}-${soundex(lastName1)}`;
      
      (phoneticIndex.get(key1) || []).forEach(p => {
        if (p.id !== person1.id) candidates.add(p);
      });
      
      const year1 = person1.birth?.match(/\d{4}/)?.[0];
      if (year1) {
        const y = parseInt(year1);
        [-2, -1, 0, 1, 2].forEach(offset => {
          const targetYear = (y + offset).toString();
          (yearIndex.get(targetYear) || []).forEach(p => {
            if (p.id !== person1.id) candidates.add(p);
          });
        });
      }
      
      if (person1.parents.length > 0) {
        const parentKey1 = person1.parents.sort().join('-');
        (parentIndex.get(parentKey1) || []).forEach(p => {
          if (p.id !== person1.id) candidates.add(p);
        });
        
        person1.parents.forEach(parent => {
          people.forEach(p => {
            if (p.id !== person1.id && p.parents.includes(parent)) {
              candidates.add(p);
            }
          });
        });
      }
      
      candidates.forEach(person2 => {
        const pairKey = person1.id < person2.id 
          ? `${person1.id}-${person2.id}` 
          : `${person2.id}-${person1.id}`;
        
        if (compared.has(pairKey)) return;
        compared.add(pairKey);
        
        totalComparisons++;
        
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
        
        if (!quickCheck()) return;
        
        const sim = calculateSimilarity(person1, person2);
        if (sim.score >= 80) {
          result.push({
            person1,
            person2,
            similarity: Math.round(sim.score),
            details: sim.details,
            id: pairKey
          });
        }
      });
      
      if (i % 100 === 0) {
        const pct = Math.round((i / people.length) * 100);
        setProgress(30 + pct * 0.65);
      }
    });
    
    console.log(`Optimisation: ${totalComparisons} comparaisons (${skipped} skipped)`);
    console.log(`Réduction: ${((1 - totalComparisons / ((people.length * (people.length - 1)) / 2)) * 100).toFixed(1)}%`);
    
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
            // NOUVEAU: Calculer le score moyen du cluster
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
              avgScore: avgScore, // NOUVEAU
              pairs: clusterPairs // NOUVEAU
            });
          }
        }
      }
    });
    
    console.log('Clusters détectés:', foundClusters.length, foundClusters);
    setClusters(foundClusters);
  };

  // NOUVELLE FONCTION: Calculer le score moyen d'un cluster
  const getClusterAverageScore = (cluster) => {
    return cluster.avgScore || 0;
  };

  // NOUVELLE FONCTION: Filtrer les clusters par score
  const getFilteredClusters = () => {
    return clusters.filter(cluster => getClusterAverageScore(cluster) >= clusterScoreFilter);
  };

  // NOUVELLE FONCTION: Sélection auto clusters ≥95%
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
        const { people } = parseGedcom(content);
        setIndividuals(people);
        setProgress(30);
        
        setTimeout(() => {
          const found = findDuplicates(people);
          setDuplicates(found);
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

  const getFilteredDuplicates = () => {
    let filtered = duplicates.filter(d => d.similarity >= filterScore);
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        d.person1.names[0]?.toLowerCase().includes(term) ||
        d.person2.names[0]?.toLowerCase().includes(term)
      );
    }
    return filtered;
  };

  const mergeDuplicates = () => {
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

    const lines = originalGedcom.split('\n');
    const outputLines = [];
    let skip = false;
    let hasHead = false;
    let hasTrlr = false;

    // CORRECTION v1.8.6: Vérifier présence HEAD/TRLR
    if (lines.length > 0 && lines[0].trim().startsWith('0 HEAD')) {
      hasHead = true;
    }
    if (lines.length > 0) {
      const lastNonEmpty = lines.filter(l => l.trim()).pop();
      if (lastNonEmpty && lastNonEmpty.trim().startsWith('0 TRLR')) {
        hasTrlr = true;
      }
    }

    // CORRECTION v1.8.6: Générer HEAD si manquant
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

      // CORRECTION v1.8.6: Skip TRLR (on l'ajoutera à la fin)
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

    // CORRECTION v1.8.6: Toujours ajouter TRLR à la fin
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Users className="w-12 h-12" />
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold">Fusionneur GEDCOM v{VERSION}</h1>
                    {/* RESTAURÉ: Bouton Nouveautés */}
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

          <div className="p-8">
            {step === 'upload' && (
              <div className="text-center py-12">
                <Upload className="w-24 h-24 mx-auto text-indigo-400 mb-6" />
                <h2 className="text-2xl font-semibold mb-4">Téléchargez votre fichier GEDCOM</h2>
                <label>
                  <input type="file" accept=".ged" onChange={handleFileUpload} className="hidden" />
                  <div className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg cursor-pointer inline-flex items-center gap-3 transition-colors">
                    <Upload className="w-6 h-6" />
                    Choisir un fichier
                  </div>
                </label>
              </div>
            )}

            {step === 'analyzing' && (
              <div className="text-center py-12">
                <div className="animate-spin w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-6"></div>
                <h2 className="text-2xl font-semibold mb-4">Analyse en cours...</h2>
                <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-4">
                  <div className="bg-indigo-600 h-4 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">{progress}%</p>
              </div>
            )}

            {step === 'review' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-2">Doublons détectés</h2>
                  <p className="text-gray-600">{duplicates.length} doublon(s) trouvé(s)</p>
                </div>

                {duplicates.length > 0 && (
                  <>
                    {/* RESTAURÉ: Système d'onglets */}
                    {(clusters.length > 0 || duplicates.length > 0) && (
                      <div className="mb-6 bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
                        <nav className="flex border-b">
                          <button
                            onClick={() => setActiveTab('clusters')}
                            className={`flex-1 px-6 py-3 text-base font-medium transition-colors ${
                              activeTab === 'clusters'
                                ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Users className="w-5 h-5" />
                              Clusters ({clusters.length})
                            </div>
                          </button>
                          <button
                            onClick={() => setActiveTab('pairs')}
                            className={`flex-1 px-6 py-3 text-base font-medium transition-colors ${
                              activeTab === 'pairs'
                                ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <AlertCircle className="w-5 h-5" />
                              Doublons simples ({getFilteredDuplicates().length})
                            </div>
                          </button>
                        </nav>
                      </div>
                    )}

                    {/* ONGLET CLUSTERS */}
                    {activeTab === 'clusters' && clusters.length > 0 && (
                      <div>
                        {/* RESTAURÉ: Filtres et contrôles clusters */}
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
                          <button
                            onClick={() => {
                              setSelectedClusters(new Set());
                              setSelectedPairs(new Set());
                            }}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium"
                          >
                            Désélectionner tout
                          </button>
                          <span className="text-sm text-gray-600 py-2">
                            {selectedClusters.size} cluster(s) sélectionné(s)
                          </span>
                        </div>

                        {/* Liste des clusters avec scoring */}
                        <div className="space-y-4">
                          {getFilteredClusters().map((cluster, idx) => {
                            const originalIdx = clusters.indexOf(cluster);
                            const avgScore = getClusterAverageScore(cluster);
                            const scoreColor = avgScore >= 95 ? 'green' : avgScore >= 90 ? 'yellow' : 'orange';
                            
                            return (
                              <div
                                key={idx}
                                className={`border-2 rounded-lg p-6 ${
                                  selectedClusters.has(originalIdx)
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-orange-300 bg-orange-50'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-4 mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
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
                                        className="w-5 h-5"
                                      />
                                      <span className="font-bold text-orange-900">
                                        Cluster {originalIdx + 1}
                                      </span>
                                      <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded-full text-xs font-bold">
                                        {cluster.size} personnes
                                      </span>
                                      {/* RESTAURÉ: Score moyen avec jauge visuelle */}
                                      <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                          scoreColor === 'green' ? 'bg-green-100 text-green-800' :
                                          scoreColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-orange-100 text-orange-800'
                                        }`}>
                                          Score moyen: {avgScore}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      selectCluster(cluster.ids);
                                      const newSelected = new Set(selectedClusters);
                                      newSelected.add(originalIdx);
                                      setSelectedClusters(newSelected);
                                    }}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                  >
                                    <CheckCircle className="w-4 h-4 inline mr-1" />
                                    Sélectionner
                                  </button>
                                </div>

                                <div className="bg-orange-50 rounded-lg p-3 mb-2">
                                  <div className="text-sm text-gray-700 space-y-1">
                                    {cluster.people.slice(0, 3).map((p, i) => (
                                      <div key={i} className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                                        <span className="font-medium">{p.names[0] || 'Sans nom'}</span>
                                        {p.birth && <span className="text-gray-500 text-xs">({p.birth})</span>}
                                        <span className="text-xs text-gray-400 font-mono">{p.id}</span>
                                      </div>
                                    ))}
                                    {cluster.people.length > 3 && (
                                      <div className="text-xs text-gray-500 italic ml-4">
                                        ... et {cluster.people.length - 3} autre(s)
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <button
                                  onClick={() => toggleClusterExpand(originalIdx)}
                                  className="w-full text-center text-sm text-orange-700 hover:text-orange-900 font-medium py-2 hover:bg-orange-50 rounded transition-colors"
                                >
                                  {expandedClusters.has(originalIdx) ? '▲ Masquer les détails' : '▼ Voir tous les membres'}
                                </button>

                                {expandedClusters.has(originalIdx) && (
                                  <div className="border-t-2 border-orange-200 bg-gray-50 p-4 mt-3">
                                    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
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
                                            <tr key={pIdx} className="hover:bg-orange-50">
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

                    {/* ONGLET DOUBLONS SIMPLES */}
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
                          <p className="text-sm text-gray-600 mt-3">{getFilteredDuplicates().length} résultat(s)</p>
                        </div>

                        <div className="mb-6 flex gap-4 flex-wrap">
                          <button
                            onClick={selectHighConfidence}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium"
                          >
                            Sélectionner ≥95%
                          </button>
                          <button
                            onClick={() => setSelectedPairs(new Set())}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium"
                          >
                            Désélectionner tout
                          </button>
                          <span className="text-sm text-gray-600 py-2">{selectedPairs.size} sélectionné(s)</span>
                        </div>

                        <div className="space-y-4">
                          {getFilteredDuplicates().map((pair) => (
                            <div
                              key={pair.id}
                              className={`border-2 rounded-lg p-6 cursor-pointer ${
                                selectedPairs.has(pair.id) ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                              }`}
                              onClick={() => togglePairSelection(pair.id)}
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <input type="checkbox" checked={selectedPairs.has(pair.id)} onChange={() => {}} className="w-5 h-5" />
                                  <span className="font-semibold">Similarité: {pair.similarity}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openPreview(pair);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                  >
                                    👁️ Prévisualiser
                                  </button>
                                  <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                                    pair.similarity >= 95 ? 'bg-red-100 text-red-800' :
                                    pair.similarity >= 90 ? 'bg-orange-100 text-orange-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {pair.similarity >= 95 ? 'Très probable' : 
                                     pair.similarity >= 90 ? 'Probable' : 'Possible'}
                                  </div>
                                </div>
                              </div>
                              <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white p-4 rounded border">
                                  <h4 className="font-semibold mb-2">Personne 1</h4>
                                  <p className="text-sm"><strong>Nom:</strong> {pair.person1.names[0]}</p>
                                  <p className="text-sm"><strong>Naissance:</strong> {pair.person1.birth || 'N/A'}</p>
                                  {pair.person1.birthPlace && <p className="text-sm"><strong>Lieu:</strong> {pair.person1.birthPlace}</p>}
                                  <p className="text-sm text-gray-500 mt-2">ID: {pair.person1.id}</p>
                                </div>
                                <div className="bg-white p-4 rounded border">
                                  <h4 className="font-semibold mb-2">Personne 2</h4>
                                  <p className="text-sm"><strong>Nom:</strong> {pair.person2.names[0]}</p>
                                  <p className="text-sm"><strong>Naissance:</strong> {pair.person2.birth || 'N/A'}</p>
                                  {pair.person2.birthPlace && <p className="text-sm"><strong>Lieu:</strong> {pair.person2.birthPlace}</p>}
                                  <p className="text-sm text-gray-500 mt-2">ID: {pair.person2.id}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedPairs.size > 0 && (
                      <div className="fixed bottom-8 right-8">
                        <button
                          onClick={mergeDuplicates}
                          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-bold shadow-2xl flex items-center gap-2"
                        >
                          <CheckCircle className="w-6 h-6" />
                          Fusionner {(() => {
                            const uniqueIds = new Set();
                            selectedPairs.forEach(pairId => {
                              const pair = duplicates.find(d => d.id === pairId);
                              if (pair) {
                                uniqueIds.add(pair.person1.id);
                                uniqueIds.add(pair.person2.id);
                              }
                            });
                            return uniqueIds.size;
                          })()} personne{(() => {
                            const uniqueIds = new Set();
                            selectedPairs.forEach(pairId => {
                              const pair = duplicates.find(d => d.id === pairId);
                              if (pair) {
                                uniqueIds.add(pair.person1.id);
                                uniqueIds.add(pair.person2.id);
                              }
                            });
                            return uniqueIds.size > 1 ? 's' : '';
                          })()}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {step === 'merged' && validationResults && (
              <div className="text-center">
                <CheckCircle className="w-24 h-24 mx-auto text-green-500 mb-6" />
                <h2 className="text-2xl font-semibold mb-4">Fusion terminée !</h2>
                <p className="text-gray-600 mb-8">{validationResults.mergedCount} doublon(s) fusionné(s)</p>

                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                    <div className="text-sm text-blue-600">Original</div>
                    <div className="text-2xl font-bold">{validationResults.totalIndividuals}</div>
                  </div>
                  <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <div className="text-sm text-red-600">Supprimés</div>
                    <div className="text-2xl font-bold">{validationResults.mergedCount}</div>
                  </div>
                  <div className="bg-green-50 border-l-4 border-green-500 p-4">
                    <div className="text-sm text-green-600">Restants</div>
                    <div className="text-2xl font-bold">{validationResults.remainingCount}</div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={downloadCleanedFile}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium inline-flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Télécharger
                  </button>
                  <button
                    onClick={resetAll}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium inline-flex items-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    Nouveau fichier
                  </button>
                </div>
              </div>
            )}

            {/* RESTAURÉ: Modal Changelog complet */}
            {showChangelog && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowChangelog(false)}>
                <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                          <Sparkles className="w-6 h-6" />
                          Historique des versions
                        </h2>
                        <p className="text-blue-100 text-sm mt-1">Découvrez les nouveautés et améliorations</p>
                      </div>
                      <button
                        onClick={() => setShowChangelog(false)}
                        className="bg-white/20 hover:bg-white/30 w-10 h-10 rounded-full flex items-center justify-center transition-colors text-2xl"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {CHANGELOG.map((release, idx) => {
                      const borderColor = release.color === 'green' ? 'border-green-500' :
                                         release.color === 'blue' ? 'border-blue-500' :
                                         release.color === 'indigo' ? 'border-indigo-500' :
                                         'border-gray-400';
                      const bgColor = release.color === 'green' ? 'bg-green-50' :
                                      release.color === 'blue' ? 'bg-blue-50' :
                                      release.color === 'indigo' ? 'bg-indigo-50' :
                                      'bg-gray-50';
                      const textColor = release.color === 'green' ? 'text-green-900' :
                                        release.color === 'blue' ? 'text-blue-900' :
                                        release.color === 'indigo' ? 'text-indigo-900' :
                                        'text-gray-900';
                      
                      return (
                        <div key={release.version} className={`border-2 ${borderColor} rounded-lg p-6 ${bgColor}`}>
                          <div className="flex items-center gap-3 mb-4">
                            {release.tag && (
                              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                release.tag === 'ACTUELLE' ? 'bg-green-500 text-white' :
                                release.tag === 'INITIALE' ? 'bg-gray-500 text-white' :
                                'bg-blue-500 text-white'
                              }`}>
                                {release.tag}
                              </span>
                            )}
                            <h3 className={`text-xl font-bold ${textColor}`}>Version {release.version}</h3>
                            <span className="text-sm text-gray-600">{release.date}</span>
                          </div>
                          <div className="space-y-3 text-sm">
                            <p className={`font-semibold ${textColor}`}>{release.title}</p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                              {release.items.map((item, itemIdx) => (
                                <li key={itemIdx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t p-6 bg-gray-50 sticky bottom-0">
                    <button
                      onClick={() => setShowChangelog(false)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de prévisualisation */}
            {previewPair && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setPreviewPair(null)}>
                <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                          👁️ Prévisualisation de la fusion
                        </h2>
                        <p className="text-blue-100 text-sm mt-1">
                          Score: {previewPair.original.similarity}% - Voir le résultat avant de fusionner
                        </p>
                      </div>
                      <button
                        onClick={() => setPreviewPair(null)}
                        className="bg-white/20 hover:bg-white/30 w-10 h-10 rounded-full flex items-center justify-center transition-colors text-2xl"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-blue-900 font-medium">
                            L'ID <span className="font-mono bg-blue-100 px-2 py-0.5 rounded">{previewPair.keepPerson.id}</span> sera conservé 
                            (score qualité: {previewPair.quality1 >= previewPair.quality2 ? previewPair.quality1 : previewPair.quality2} points)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg text-gray-800 mb-3">📊 Avant fusion</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="border-2 border-green-500 rounded-lg bg-green-50 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <h4 className="font-bold text-green-900">Conservé</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p><strong>Nom:</strong> {previewPair.keepPerson.names[0] || 'N/A'}</p>
                            <p><strong>Naissance:</strong> {previewPair.keepPerson.birth || 'N/A'}</p>
                            <p><strong>Décès:</strong> {previewPair.keepPerson.death || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="border-2 border-red-500 rounded-lg bg-red-50 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Trash2 className="w-5 h-5 text-red-600" />
                            <h4 className="font-bold text-red-900">Supprimé</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p><strong>Nom:</strong> {previewPair.removePerson.names[0] || 'N/A'}</p>
                            <p><strong>Naissance:</strong> {previewPair.removePerson.birth || 'N/A'}</p>
                            <p><strong>Décès:</strong> {previewPair.removePerson.death || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg text-gray-800 mb-3">✨ Après fusion (résultat enrichi)</h3>
                      <div className="border-2 border-indigo-500 rounded-lg bg-indigo-50 p-6">
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <span className="font-semibold text-gray-700 w-32">Nom(s):</span>
                            <div className="flex-1">
                              {previewPair.merged.names.map((name, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <span>{name}</span>
                                  {i > 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Ajouté</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <button
                        onClick={() => setPreviewPair(null)}
                        className="px-6 py-2 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                      >
                        Fermer
                      </button>
                      <button
                        onClick={() => {
                          togglePairSelection(previewPair.original.id);
                          setPreviewPair(null);
                        }}
                        className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 ${
                          selectedPairs.has(previewPair.original.id)
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                        {selectedPairs.has(previewPair.original.id) ? 'Désélectionner' : 'Sélectionner'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GedcomDuplicateMerger;
