import React, { useState, useRef, useEffect } from 'react';
import { Upload, Users, AlertCircle, Download, Trash2, CheckCircle, Sparkles, FileText, Brain, ChevronDown, ChevronUp, RefreshCw, Shield, GitBranch, Lock, Unlock } from 'lucide-react';
import { FUSION_LEVELS, buildDependencyGraph, calculateFusionOrder, calculateEnrichedQuality, canFuseLevel, prepareLevelForDisplay, calculateFusionStats } from './utils/fusionOrder.mjs';

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
  // v2.1.0 - États pour rapport qualité et analyses avancées
  const [qualityReport, setQualityReport] = useState(null);
  const [showQualityReport, setShowQualityReport] = useState(false);
  const [chronoIssues, setChronoIssues] = useState({ errors: [], warnings: [] });
  const [placeVariants, setPlaceVariants] = useState([]);
  const [genealogyStats, setGenealogyStats] = useState(null);
  const [orphanRefs, setOrphanRefs] = useState([]);
  // v2.1.4 - Message de progression
  const [progressMessage, setProgressMessage] = useState('');
  // v2.2.0 - États pour gestion des conflits de fusion
  const [mergeConflicts, setMergeConflicts] = useState([]);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [pendingMergePair, setPendingMergePair] = useState(null);
  // v2.2.6 - États pour normalisation des lieux
  const [showPlaceNormModal, setShowPlaceNormModal] = useState(false);
  const [placeNormSelections, setPlaceNormSelections] = useState({});
  const [placeApiSuggestions, setPlaceApiSuggestions] = useState({});
  const [loadingPlaceSuggestion, setLoadingPlaceSuggestion] = useState({});
  const [hasPlaceNormalizations, setHasPlaceNormalizations] = useState(false);
  const [placeManualInput, setPlaceManualInput] = useState({}); // Saisie manuelle par groupe
  const [placeManualSuggestions, setPlaceManualSuggestions] = useState({}); // Suggestions autocomplétion
  // v2.3.0 - États pour fusion guidée par étapes
  const [fusionGraph, setFusionGraph] = useState(null); // Graphe de dépendances
  const [fusionOrder, setFusionOrder] = useState([]); // Ordre optimal de fusion [{level, pairs}]
  const [completedLevels, setCompletedLevels] = useState(new Set()); // Niveaux complétés
  const [selectedGuidedPairs, setSelectedGuidedPairs] = useState(new Set()); // Paires sélectionnées par niveau

  // v2.1.4 - Référence au Web Worker
  const workerRef = useRef(null);

  // v2.1.4 - Cleanup du Worker au démontage
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const VERSION = '2.3.0';

  const CHANGELOG = [
    {
      version: '2.3.0',
      date: '13 janvier 2026',
      tag: 'ACTUELLE',
      color: 'green',
      title: 'Fusion intelligente - Ordre optimal',
      items: [
        'NOUVEAU: Onglet "Fusion guidée" avec étapes Bottom-Up',
        'NOUVEAU: Interface par niveaux (enfants → conjoints → parents)',
        'NOUVEAU: Score qualité enrichi pour choix automatique',
        'NOUVEAU: Module fusionOrder.mjs - Graphe de dépendances',
        'NOUVEAU: Détection de cycles dans les dépendances',
        'TECHNIQUE: 572 tests statiques, 225 tests Vitest'
      ]
    },
    {
      version: '2.2.6',
      date: '10 janvier 2026',
      tag: 'PRÉCÉDENTE',
      color: 'blue',
      title: 'Outil normalisation lieux + API Géo',
      items: [
        'NOUVEAU: Modal de normalisation des lieux',
        'NOUVEAU: Intégration API Géo du gouvernement français',
        'Suggestions officielles : Commune, Département, Région',
        'Bouton "Rechercher officiels" pour chaque groupe ou tous',
        'Application des corrections sur le fichier GEDCOM'
      ]
    },
    {
      version: '2.2.5',
      date: '10 janvier 2026',
      tag: '',
      color: 'gray',
      title: 'Scoring amélioré',
      items: [
        'Couleurs inversées: 🟢 FORT, 🟡 MOYEN, 🔴 FAIBLE',
        'Pondération dynamique des noms (rares = +pts, communs = -pts)',
        'Bonus combinaison forte nom+naissance+lieu (+15 pts)',
        'Malus incohérence lieu naissance contradictoire (-10 pts)'
      ]
    },
    {
      version: '2.2.4',
      date: '5 janvier 2026',
      tag: '',
      color: 'gray',
      title: 'Correction fusion en cascade',
      items: [
        'CORRECTION: Fusion en cascade résolue (A→B→C devient A→C)',
        'CORRECTION: Références fusionnées REDIRIGÉES via mergeMap',
        'CORRECTION: cleanOrphanedFamilies utilise mergeMap pour redirections',
        'AMÉLIORATION: Support clusters de N individus'
      ]
    },
    {
      version: '2.2.3',
      date: '4 janvier 2026',
      tag: '',
      color: 'gray',
      title: 'Isolation complète doublons/clusters',
      items: [
        'CORRECTION: Bouton "Sélectionner ≥X%" doublons n\'affecte plus les clusters',
        'AMÉLIORATION: Sélections doublons et clusters complètement indépendantes'
      ]
    },
    {
      version: '2.2.2',
      date: '4 janvier 2026',
      tag: '',
      color: 'gray',
      title: 'Corrections bugs sélection clusters',
      items: [
        'CORRECTION: Bouton "Sélectionner" cluster encadre maintenant le cluster',
        'CORRECTION: Bouton "Désélectionner tout" cluster retire aussi les paires',
        'CORRECTION: Bouton "Désélectionner tout" doublons ne touche plus aux clusters',
        'CORRECTION: Modal prévisualisation a maintenant un ascenseur',
        'AMÉLIORATION: Détection conflit dates plus stricte (dates précises différentes = conflit)',
        'TECHNIQUE: isApproximateDate() pour distinguer dates précises/approximatives'
      ]
    },
    {
      version: '2.2.1',
      date: '4 janvier 2026',
      tag: 'PRÉCÉDENTE',
      color: 'blue',
      title: 'Amélioration UX - Modal qualité',
      items: [
        'AMÉLIORATION: Modal "Rapport Qualité" ne s\'affiche plus automatiquement',
        'AMÉLIORATION: Rapport qualité accessible via bouton "Qualité" uniquement',
        'AMÉLIORATION: Démarrage plus fluide sans interruption modale'
      ]
    },
    {
      version: '2.2.0',
      date: '4 janvier 2026',
      tag: 'PRÉCÉDENTE',
      color: 'blue',
      title: 'Gestion intelligente des conflits de fusion',
      items: [
        'NOUVEAU: Détection automatique des conflits avant fusion',
        'NOUVEAU: Modal de résolution des conflits avec choix utilisateur',
        'NOUVEAU: Comparaison intelligente dates (même année = compatible)',
        'NOUVEAU: Comparaison intelligente lieux (inclusion = compatible)',
        'NOUVEAU: Option saisie manuelle pour valeurs personnalisées',
        'NOUVEAU: Nettoyage automatique des FAM orphelines après fusion',
        'AMÉLIORATION: Fusion bloquée tant que conflits non résolus',
        'TECHNIQUE: detectMergeConflicts(), areValuesCompatible()'
      ]
    },
    {
      version: '2.1.4',
      date: '3 janvier 2026',
      tag: 'PRÉCÉDENTE',
      color: 'blue',
      title: 'Web Worker - Performance optimisée',
      items: [
        'NOUVEAU: Web Worker pour traitement en arrière-plan',
        'AMÉLIORATION: Interface toujours réactive pendant l\'analyse',
        'AMÉLIORATION: Progression fluide temps réel avec messages',
        'AMÉLIORATION: Index composite optimisé (phonétique+sexe+décennie)',
        'AMÉLIORATION: Accès O(1) via peopleById Map',
        'TECHNIQUE: public/gedcom-worker.js (thread séparé)',
        'TECHNIQUE: Communication par postMessage/onmessage',
        'PERFORMANCE: Traitement 3-5x plus rapide sur gros fichiers'
      ]
    },
    {
      version: '2.1.3',
      date: '2 janvier 2026',
      tag: 'PRÉCÉDENTE',
      color: 'blue',
      title: 'Vrais tests unitaires Vitest',
      items: [
        'NOUVEAU: 108 tests Vitest avec exécution réelle de code',
        'NOUVEAU: Tests unitaires pour helpers (extractYear, soundex, etc.)',
        'NOUVEAU: Tests unitaires pour parser GEDCOM',
        'NOUVEAU: Tests unitaires pour statistiques généalogiques',
        'NOUVEAU: Tests de détection incohérences chronologiques',
        'AMÉLIORATION: Fonctions pures extraites dans src/utils/',
        'TECHNIQUE: vitest.config.mjs, fichiers .mjs pour modules ES',
        'TECHNIQUE: npm run test:all exécute tests statiques + Vitest'
      ]
    },
    {
      version: '2.1.2',
      date: '2 janvier 2026',
      tag: 'PRÉCÉDENTE',
      color: 'blue',
      title: 'Performance, progression et statistiques enrichies',
      items: [
        'CORRECTION: Barres de couleur complétude maintenant toutes visibles',
        'AMÉLIORATION: Progression fluide de 5% à 100% (async/await)',
        'AMÉLIORATION: Statistiques enrichies (âges, prénoms, lieux, professions)',
        'NOUVEAU: Âge moyen/médian/min/max au décès',
        'NOUVEAU: Top 5 prénoms masculins et féminins',
        'NOUVEAU: Top 5 lieux de naissance',
        'NOUVEAU: Top 5 professions',
        'NOUVEAU: Nombre de générations estimé',
        'NOUVEAU: Détection des remariages'
      ]
    },
    {
      version: '2.1.1',
      date: '2 janvier 2026',
      tag: null,
      color: 'gray',
      title: 'Détails enrichis dans l\'onglet "À supprimer"',
      items: [
        'AMÉLIORATION: Affichage des parents avec leurs noms dans l\'onglet À supprimer',
        'AMÉLIORATION: Affichage des conjoints avec leurs noms',
        'AMÉLIORATION: Affichage des enfants avec leurs noms',
        'AMÉLIORATION: Détails personne (sexe, naissance, décès, profession)',
        'AMÉLIORATION: Avertissements visuels ⚠️ si relations existantes',
        'AMÉLIORATION: Message explicite sur les références orphelines potentielles',
        'CORRECTION: Stockage des IDs enfants dans detectToDeletePersons'
      ]
    },
    {
      version: '2.1.0',
      date: '2 janvier 2026',
      tag: null,
      color: 'gray',
      title: 'Contrôle qualité avancé et analyse généalogique',
      items: [
        'NOUVEAU: Rapport qualité affiché automatiquement après upload',
        'NOUVEAU: Détection incohérences chronologiques (7 règles)',
        'NOUVEAU: Normalisation intelligente des lieux + détection variantes',
        'NOUVEAU: Statistiques généalogiques (répartition sexe, patronymes, périodes)',
        'NOUVEAU: Détection des références orphelines (FAMC/FAMS/SOUR cassées)',
        'NOUVEAU: Score de suspicion doublons (FORT/MOYEN/FAIBLE)',
        'AMÉLIORATION: Interface enrichie avec modal rapport qualité complet',
        'Inspiré par la compétence gedcom-5-5x-qa-and-analysis'
      ]
    },
    {
      version: '2.0.0',
      date: '31 décembre 2025',
      tag: null,
      color: 'gray',
      title: 'Phase 1 - Préservation complète des données GEDCOM',
      items: [
        'NOUVEAU: rawLines[] stocke TOUTES les lignes GEDCOM originales par personne',
        'NOUVEAU: rawLinesByTag{} indexe les lignes par tag (SOUR, NOTE, OBJE, EVEN...)',
        'NOUVEAU: Fusion SOUR/NOTE/OBJE combine les sources des 2 personnes',
        'NOUVEAU: 18 critères de comparaison (vs 11 avant) - ajout baptême, inhumation, résidence, titre, religion',
        'NOUVEAU: Affichage systématique des 16 champs dans la prévisualisation',
        'NOUVEAU: Contrôles intégrité AVANT fusion (sexe, écart dates, lieux)',
        'NOUVEAU: Contrôles intégrité AVANT suppression (enfants, conjoints, références)',
        'CORRECTION: Comparaison parents/conjoints/enfants par NOM si IDs différents',
        'CORRECTION: Score 100% quand toutes données comparables sont identiques',
        'CORRECTION: Sélection clusters ajoute les paires pour fusion effective',
        'SUPPRESSION: Encart "Nouveauté v1.9.3" sur la page d\'accueil',
        '325 tests (7 catégories)'
      ]
    },
    {
      version: '1.9.5',
      date: '31 décembre 2025',
      tag: null,
      color: 'gray',
      title: 'Fusion intelligente + Parsing corrigé + Déduplication CHIL',
      items: [
        'CRITIQUE: Correction parsing DATE/PLAC niveau 2 uniquement',
        'NOUVEAU: Fusion intelligente combinant les données des 2 personnes',
        'NOUVEAU: Fonction mergePersonData() - plus de perte de données',
        'NOUVEAU: Déduplication automatique des CHIL dans les FAM',
        'NOUVEAU: Note de traçabilité dans les INDI fusionnés',
        'NOUVEAU: Support des clusters (fusion en chaîne)',
        'Noms secondaires marqués TYPE aka',
        '266 tests (22 niveaux + 5 bonus)'
      ]
    },
    {
      version: '1.9.4',
      date: '30 décembre 2025',
      tag: null,
      color: 'gray',
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
          familiesAsSpouse: [], occupation: '', religion: '',
          baptism: '', baptismPlace: '', burial: '', burialPlace: '',
          residence: '', title: '', note: '', children: [],
          // v2.0.0: Lignes brutes pour préservation complète
          rawLines: [line],  // Stocker la ligne 0 @Ixxx@ INDI
          rawLinesByTag: {}  // Indexé par tag: { 'SOUR': [...], 'NOTE': [...], ... }
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
        // v2.0.0: Stocker TOUTES les lignes brutes
        currentPerson.rawLines.push(line);
        
        // v2.0.0: Indexer par tag de niveau 1 pour fusion intelligente
        if (trimmed.startsWith('1 ')) {
          const tagMatch = trimmed.match(/^1\s+(\S+)/);
          if (tagMatch) {
            const tag = tagMatch[1];
            // Tags à indexer pour fusion: SOUR, NOTE, OBJE, EVEN, _* (custom)
            if (['SOUR', 'NOTE', 'OBJE', 'EVEN', 'EDUC', 'NATI', 'IMMI', 'EMIG', 'CENS', 'WILL', 'PROB'].includes(tag) || tag.startsWith('_')) {
              if (!currentPerson.rawLinesByTag[tag]) currentPerson.rawLinesByTag[tag] = [];
              currentPerson.rawLinesByTag[tag].push({ startIdx: currentPerson.rawLines.length - 1, lines: [line] });
            }
          }
        } else if (trimmed.match(/^[2-9]\s/) && currentPerson.rawLinesByTag) {
          // Lignes de niveau 2+ : ajouter au dernier bloc du tag parent
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

  // v2.2.5: Calcul des statistiques de noms pour pondération dynamique
  const calculateSurnameStats = (people) => {
    const stats = {};
    people.forEach(person => {
      const name = person.names[0] || '';
      const lastName = name.split('/')[1]?.toLowerCase()?.trim() || 
                       name.split(' ').pop()?.replace(/\//g, '')?.toLowerCase() || '';
      if (lastName) {
        stats[lastName] = (stats[lastName] || 0) + 1;
      }
    });
    return stats;
  };

  const calculateSimilarity = (person1, person2, allPeople = [], surnameStats = {}) => {
    const details = [];
    let matchScore = 0;
    let maxPossibleScore = 0;
    const sufficientCriteria = [];
    
    // v2.2.5: Variables pour tracking des matchs (bonus combinaison)
    let nameMatches = false;
    let birthYearMatches = false;
    let birthPlaceMatches = false;
    let birthPlaceMismatch = false; // Pour malus incohérence
    
    const name1 = person1.names[0]?.toLowerCase() || '';
    const name2 = person2.names[0]?.toLowerCase() || '';
    
    // v2.2.5: Extraire le nom de famille pour pondération dynamique
    const lastName1 = name1.split('/')[1]?.toLowerCase()?.trim() || 
                      name1.split(' ').pop()?.replace(/\//g, '')?.toLowerCase() || '';
    const lastName2 = name2.split('/')[1]?.toLowerCase()?.trim() || 
                      name2.split(' ').pop()?.replace(/\//g, '')?.toLowerCase() || '';
    
    // v2.2.5: Pondération dynamique selon la rareté du nom
    const getNameWeight = (surname) => {
      const frequency = surnameStats[surname] || 0;
      if (frequency <= 3) return 35;   // Nom très rare (+5)
      if (frequency <= 10) return 32;  // Nom rare (+2)
      if (frequency <= 30) return 30;  // Nom normal
      if (frequency <= 100) return 25; // Nom commun (-5)
      return 20;                       // Nom très commun (-10)
    };
    
    if (name1 || name2) {
      // v2.2.5: Points dynamiques selon rareté
      const nameWeight = Math.max(getNameWeight(lastName1), getNameWeight(lastName2));
      maxPossibleScore += nameWeight;
      
      if (name1 && name2) {
        const firstName1 = normalizeFirstName(name1.split(' ')[0] || name1.split('/')[0]);
        const firstName2 = normalizeFirstName(name2.split(' ')[0] || name2.split('/')[0]);
        const lastName1Clean = name1.split(' ').pop()?.replace(/\//g, '') || '';
        const lastName2Clean = name2.split(' ').pop()?.replace(/\//g, '') || '';
        const s1 = soundex(firstName1), s2 = soundex(firstName2);
        const ls1 = soundex(lastName1Clean), ls2 = soundex(lastName2Clean);
        
        const freqInfo = surnameStats[lastName1] ? ` (fréq: ${surnameStats[lastName1]})` : '';
        
        if (name1 === name2) { 
          matchScore += nameWeight; 
          nameMatches = true; 
          details.push(`✓ Noms identiques (+${nameWeight}/${nameWeight})${freqInfo}`); 
        }
        else if (s1 === s2 && ls1 === ls2) { 
          matchScore += Math.round(nameWeight * 0.85); 
          nameMatches = true; 
          details.push(`✓ Noms phonétiquement identiques (+${Math.round(nameWeight * 0.85)}/${nameWeight})${freqInfo}`); 
        }
        else if (firstName1 === firstName2 && ls1 === ls2) { 
          matchScore += Math.round(nameWeight * 0.85); 
          nameMatches = true; 
          details.push(`✓ Variante prénom reconnue (+${Math.round(nameWeight * 0.85)}/${nameWeight})${freqInfo}`); 
        }
        else if (s1 === s2 || ls1 === ls2) { 
          matchScore += Math.round(nameWeight * 0.65); 
          nameMatches = true; 
          details.push(`≈ Prénom ou nom similaire (+${Math.round(nameWeight * 0.65)}/${nameWeight})`); 
        }
        else if (name1.includes(name2) || name2.includes(name1)) { 
          matchScore += Math.round(nameWeight * 0.5); 
          nameMatches = true; 
          details.push(`≈ Noms partiellement similaires (+${Math.round(nameWeight * 0.5)}/${nameWeight})`); 
        }
        else details.push(`✗ Noms différents (0/${nameWeight})`);
      }
    }

    if (person1.birth || person2.birth) {
      maxPossibleScore += 25;
      if (person1.birth && person2.birth) {
        const y1 = person1.birth.match(/\d{4}/), y2 = person2.birth.match(/\d{4}/);
        if (person1.birth === person2.birth) { 
          matchScore += 25; 
          birthYearMatches = true;
          sufficientCriteria.push('naissance_exacte'); 
          details.push('✓ Dates naissance identiques (+25/25)'); 
        }
        else if (y1 && y2) {
          const diff = Math.abs(parseInt(y1[0]) - parseInt(y2[0]));
          if (diff === 0) { 
            matchScore += 20; 
            birthYearMatches = true;
            sufficientCriteria.push('annee_naissance'); 
            details.push('✓ Années naissance identiques (+20/25)'); 
          }
          else if (diff <= 2) { 
            matchScore += 12; 
            birthYearMatches = true; // Proche = considéré comme match
            sufficientCriteria.push('annee_proche'); 
            details.push('≈ Années naissance proches ±2 ans (+12/25)'); 
          }
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
        else {
          // v2.0.0: Comparer par nom si les IDs sont différents (cas doublons)
          const parentNames1 = person1.parents.map(id => {
            const parent = allPeople.find(p => p.id === id);
            return parent?.names[0]?.toLowerCase() || '';
          }).filter(n => n);
          const parentNames2 = person2.parents.map(id => {
            const parent = allPeople.find(p => p.id === id);
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
        if (bp1 === bp2) { 
          matchScore += 10; 
          birthPlaceMatches = true;
          sufficientCriteria.push('lieu_naissance'); 
          details.push('✓ Lieux naissance identiques (+10/10)'); 
        }
        else if (bp1.includes(bp2) || bp2.includes(bp1)) { 
          matchScore += 5; 
          birthPlaceMatches = true; // Inclusion = considéré comme match
          sufficientCriteria.push('lieu_partiel'); 
          details.push('≈ Lieux naissance similaires (+5/10)'); 
        }
        else { 
          birthPlaceMismatch = true; // v2.2.5: Tracker pour malus
          details.push('✗ Lieux naissance différents (0/10)'); 
        }
      }
    }

    if (person1.spouses.length > 0 || person2.spouses.length > 0) {
      maxPossibleScore += 8;
      if (person1.spouses.length > 0 && person2.spouses.length > 0) {
        const common = person1.spouses.filter(s => person2.spouses.includes(s));
        if (common.length > 0) { matchScore += 8; sufficientCriteria.push('conjoints'); details.push('✓ Conjoints communs (+8/8)'); }
        else {
          // v2.0.0: Comparer par nom si les IDs sont différents (cas doublons)
          const spouseNames1 = person1.spouses.map(id => {
            const spouse = allPeople.find(p => p.id === id);
            return spouse?.names[0]?.toLowerCase() || '';
          }).filter(n => n);
          const spouseNames2 = person2.spouses.map(id => {
            const spouse = allPeople.find(p => p.id === id);
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

    // Lieu de décès (nouveau critère v1.9.5)
    if (person1.deathPlace || person2.deathPlace) {
      maxPossibleScore += 8;
      const dp1 = normalizePlace(person1.deathPlace)?.toLowerCase();
      const dp2 = normalizePlace(person2.deathPlace)?.toLowerCase();
      if (dp1 && dp2) {
        if (dp1 === dp2) { matchScore += 8; sufficientCriteria.push('lieu_deces'); details.push('✓ Lieux décès identiques (+8/8)'); }
        else if (dp1.includes(dp2) || dp2.includes(dp1)) { matchScore += 4; sufficientCriteria.push('lieu_deces_partiel'); details.push('≈ Lieux décès similaires (+4/8)'); }
        else details.push('✗ Lieux décès différents (0/8)');
      }
    }

    // Enfants communs (nouveau critère v1.9.5 - très fort)
    if (person1.children.length > 0 || person2.children.length > 0) {
      maxPossibleScore += 15;
      if (person1.children.length > 0 && person2.children.length > 0) {
        const commonChildren = person1.children.filter(c => person2.children.includes(c));
        if (commonChildren.length >= 2) { matchScore += 15; sufficientCriteria.push('enfants_2+'); details.push('✓ 2+ enfants communs (+15/15)'); }
        else if (commonChildren.length === 1) { matchScore += 10; sufficientCriteria.push('enfant_1'); details.push('≈ 1 enfant commun (+10/15)'); }
        else {
          // v2.0.0: Comparer par nom si les IDs sont différents (cas doublons)
          const childNames1 = person1.children.map(id => {
            const child = allPeople.find(p => p.id === id);
            return child?.names[0]?.toLowerCase() || '';
          }).filter(n => n);
          const childNames2 = person2.children.map(id => {
            const child = allPeople.find(p => p.id === id);
            return child?.names[0]?.toLowerCase() || '';
          }).filter(n => n);
          const commonNames = childNames1.filter(n => childNames2.includes(n));
          if (commonNames.length >= 2) { matchScore += 15; sufficientCriteria.push('enfants_2+_nom'); details.push('✓ 2+ enfants communs (même nom) (+15/15)'); }
          else if (commonNames.length === 1) { matchScore += 10; sufficientCriteria.push('enfant_1_nom'); details.push('≈ 1 enfant commun (même nom) (+10/15)'); }
          else details.push('✗ Enfants différents (0/15)');
        }
      }
    }

    // v2.0.0: Baptême
    if (person1.baptism || person2.baptism) {
      maxPossibleScore += 5;
      if (person1.baptism && person2.baptism) {
        if (person1.baptism === person2.baptism) { matchScore += 5; details.push('✓ Dates baptême identiques (+5/5)'); }
        else {
          const by1 = person1.baptism.match(/\d{4}/), by2 = person2.baptism.match(/\d{4}/);
          if (by1 && by2 && by1[0] === by2[0]) { matchScore += 3; details.push('≈ Années baptême identiques (+3/5)'); }
          else details.push('✗ Dates baptême différentes (0/5)');
        }
      }
    }

    // v2.0.0: Lieu baptême
    if (person1.baptismPlace || person2.baptismPlace) {
      maxPossibleScore += 4;
      const bpl1 = normalizePlace(person1.baptismPlace)?.toLowerCase();
      const bpl2 = normalizePlace(person2.baptismPlace)?.toLowerCase();
      if (bpl1 && bpl2) {
        if (bpl1 === bpl2) { matchScore += 4; details.push('✓ Lieux baptême identiques (+4/4)'); }
        else if (bpl1.includes(bpl2) || bpl2.includes(bpl1)) { matchScore += 2; details.push('≈ Lieux baptême similaires (+2/4)'); }
        else details.push('✗ Lieux baptême différents (0/4)');
      }
    }

    // v2.0.0: Inhumation
    if (person1.burial || person2.burial) {
      maxPossibleScore += 5;
      if (person1.burial && person2.burial) {
        if (person1.burial === person2.burial) { matchScore += 5; details.push('✓ Dates inhumation identiques (+5/5)'); }
        else {
          const bury1 = person1.burial.match(/\d{4}/), bury2 = person2.burial.match(/\d{4}/);
          if (bury1 && bury2 && bury1[0] === bury2[0]) { matchScore += 3; details.push('≈ Années inhumation identiques (+3/5)'); }
          else details.push('✗ Dates inhumation différentes (0/5)');
        }
      }
    }

    // v2.0.0: Lieu inhumation
    if (person1.burialPlace || person2.burialPlace) {
      maxPossibleScore += 4;
      const bupl1 = normalizePlace(person1.burialPlace)?.toLowerCase();
      const bupl2 = normalizePlace(person2.burialPlace)?.toLowerCase();
      if (bupl1 && bupl2) {
        if (bupl1 === bupl2) { matchScore += 4; details.push('✓ Lieux inhumation identiques (+4/4)'); }
        else if (bupl1.includes(bupl2) || bupl2.includes(bupl1)) { matchScore += 2; details.push('≈ Lieux inhumation similaires (+2/4)'); }
        else details.push('✗ Lieux inhumation différents (0/4)');
      }
    }

    // v2.0.0: Résidence
    if (person1.residence || person2.residence) {
      maxPossibleScore += 4;
      const res1 = normalizePlace(person1.residence)?.toLowerCase();
      const res2 = normalizePlace(person2.residence)?.toLowerCase();
      if (res1 && res2) {
        if (res1 === res2) { matchScore += 4; details.push('✓ Résidences identiques (+4/4)'); }
        else if (res1.includes(res2) || res2.includes(res1)) { matchScore += 2; details.push('≈ Résidences similaires (+2/4)'); }
        else details.push('✗ Résidences différentes (0/4)');
      }
    }

    // v2.0.0: Titre
    if (person1.title || person2.title) {
      maxPossibleScore += 3;
      if (person1.title && person2.title) {
        if (person1.title.toLowerCase() === person2.title.toLowerCase()) { matchScore += 3; details.push('✓ Titres identiques (+3/3)'); }
        else details.push('✗ Titres différents (0/3)');
      }
    }

    // v2.0.0: Religion
    if (person1.religion || person2.religion) {
      maxPossibleScore += 3;
      if (person1.religion && person2.religion) {
        if (person1.religion.toLowerCase() === person2.religion.toLowerCase()) { matchScore += 3; details.push('✓ Religions identiques (+3/3)'); }
        else details.push('✗ Religions différentes (0/3)');
      }
    }

    // ============================================================================
    // v2.2.5: BONUS COMBINAISON FORTE
    // ============================================================================
    if (nameMatches && birthYearMatches && birthPlaceMatches) {
      const bonus = 15;
      matchScore += bonus;
      maxPossibleScore += bonus;
      details.push(`🎯 BONUS: Combinaison forte nom+naissance+lieu (+${bonus})`);
    } else if (nameMatches && birthYearMatches) {
      const bonus = 8;
      matchScore += bonus;
      maxPossibleScore += bonus;
      details.push(`🎯 BONUS: Combinaison nom+naissance (+${bonus})`);
    }

    // ============================================================================
    // v2.2.5: MALUS INCOHÉRENCES
    // ============================================================================
    if (birthPlaceMismatch && nameMatches) {
      // Les deux ont un lieu de naissance MAIS différent = suspect
      const malus = 10;
      matchScore -= malus;
      details.push(`⚠️ MALUS: Lieux naissance contradictoires (-${malus})`);
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
    
    // v2.2.5: Calculer les statistiques de noms pour pondération dynamique
    const surnameStats = calculateSurnameStats(people);
    
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
      // v2.2.5: Passer surnameStats à calculateSimilarity
      const sim = calculateSimilarity(person1, person2, people, surnameStats);
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
      let childrenIds = [];
      
      // Trouver les enfants de cette personne
      families.forEach(family => {
        if ((family.husband === person.id || family.wife === person.id) && family.children && family.children.length > 0) {
          hasChildren = true;
          childrenIds = [...childrenIds, ...family.children];
        }
      });
      childrenIds = [...new Set(childrenIds)]; // Dédupliquer
      
      const isTotallyIsolated = !hasParents && !hasChildren && !hasSpouses;
      const fullName = person.names[0] || '';
      const nameParts = fullName.replace(/\//g, ' ').trim().split(/\s+/).filter(p => p.length > 0);
      const hasNoIdentity = nameParts.length === 0;
      if (isTotallyIsolated || hasNoIdentity) {
        let reason = isTotallyIsolated && hasNoIdentity ? 'Isolé + Sans identité' : isTotallyIsolated ? 'Totalement isolé' : 'Sans identité';
        toDelete.push({ 
          ...person, 
          isTotallyIsolated, 
          hasNoIdentity, 
          reason, 
          hasSpouses, 
          hasParents, 
          hasChildren,
          parentIds: person.parents || [],
          spouseIds: person.spouses || [],
          childrenIds: childrenIds
        });
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

  // ═══════════════════════════════════════════════════════════════════════════════
  // v2.1.0 - FONCTIONS P1 : RAPPORT QUALITÉ, INCOHÉRENCES CHRONO, NORMALISATION LIEUX
  // ═══════════════════════════════════════════════════════════════════════════════

  // P1.1 - Générer le rapport qualité à l'upload
  const generateQualityReport = (people, families, gedcomContent) => {
    // Détection version GEDCOM
    const versionMatch = gedcomContent.match(/1 VERS\s+(\d+\.\d+\.?\d*)/);
    const gedcomVersion = versionMatch ? versionMatch[1] : 'Non spécifiée';
    
    // Détection encodage
    const encodingMatch = gedcomContent.match(/1 CHAR\s+(\S+)/);
    const encoding = encodingMatch ? encodingMatch[1] : 'Non spécifié';
    
    // Comptages
    const sourceCount = (gedcomContent.match(/0 @S\d+@ SOUR/g) || []).length;
    const noteCount = (gedcomContent.match(/0 @N\d+@ NOTE/g) || []).length;
    const mediaCount = (gedcomContent.match(/0 @M\d+@ OBJE/g) || []).length;
    
    // Complétude
    const withBirth = people.filter(p => p.birth).length;
    const withBirthPlace = people.filter(p => p.birthPlace).length;
    const withDeath = people.filter(p => p.death).length;
    const withParent = people.filter(p => p.parents.length > 0).length;
    const withSpouse = people.filter(p => p.spouses.length > 0).length;
    const isolated = people.filter(p => p.parents.length === 0 && p.spouses.length === 0 && p.familiesAsSpouse.length === 0).length;
    
    // Tags non standard
    const customTags = [...new Set((gedcomContent.match(/\d+ _\w+/g) || []).map(t => t.split(' ')[1]))];
    
    return {
      gedcomVersion,
      encoding,
      stats: {
        individuals: people.length,
        families: families.size,
        sources: sourceCount,
        notes: noteCount,
        medias: mediaCount
      },
      completeness: {
        withBirth: { count: withBirth, pct: people.length ? Math.round((withBirth / people.length) * 100) : 0 },
        withBirthPlace: { count: withBirthPlace, pct: people.length ? Math.round((withBirthPlace / people.length) * 100) : 0 },
        withDeath: { count: withDeath, pct: people.length ? Math.round((withDeath / people.length) * 100) : 0 },
        withParent: { count: withParent, pct: people.length ? Math.round((withParent / people.length) * 100) : 0 },
        withSpouse: { count: withSpouse, pct: people.length ? Math.round((withSpouse / people.length) * 100) : 0 },
        isolated: { count: isolated, pct: people.length ? Math.round((isolated / people.length) * 100) : 0 }
      },
      customTags
    };
  };

  // P1.2 - Détecter les incohérences chronologiques
  const detectChronologicalIssues = (people, families) => {
    const errors = [];
    const warnings = [];
    
    const extractYear = (dateStr) => {
      if (!dateStr) return null;
      const match = dateStr.match(/(\d{4})/);
      return match ? parseInt(match[1]) : null;
    };
    
    const getPersonById = (id) => people.find(p => p.id === id);
    
    people.forEach(person => {
      const birthYear = extractYear(person.birth);
      const deathYear = extractYear(person.death);
      const baptismYear = extractYear(person.baptism);
      const burialYear = extractYear(person.burial);
      const name = person.names[0] || person.id;
      
      // Règle 1: Naissance après décès
      if (birthYear && deathYear && birthYear > deathYear) {
        errors.push({
          type: 'BIRTH_AFTER_DEATH',
          personId: person.id,
          message: `${name} : naissance (${birthYear}) après décès (${deathYear})`
        });
      }
      
      // Règle 2: Baptême avant naissance
      if (birthYear && baptismYear && baptismYear < birthYear - 1) {
        errors.push({
          type: 'BAPTISM_BEFORE_BIRTH',
          personId: person.id,
          message: `${name} : baptême (${baptismYear}) avant naissance (${birthYear})`
        });
      }
      
      // Règle 3: Inhumation avant décès
      if (deathYear && burialYear && burialYear < deathYear) {
        errors.push({
          type: 'BURIAL_BEFORE_DEATH',
          personId: person.id,
          message: `${name} : inhumation (${burialYear}) avant décès (${deathYear})`
        });
      }
      
      // Règle 4: Parent né après enfant
      if (birthYear && person.parents.length > 0) {
        person.parents.forEach(parentId => {
          const parent = getPersonById(parentId);
          if (parent) {
            const parentBirth = extractYear(parent.birth);
            if (parentBirth && parentBirth >= birthYear) {
              errors.push({
                type: 'PARENT_BORN_AFTER_CHILD',
                personId: person.id,
                message: `${name} : parent ${parent.names[0] || parentId} né en ${parentBirth}, enfant né en ${birthYear}`
              });
            }
            // Règle 5: Parent trop jeune (<12 ans)
            if (parentBirth && birthYear - parentBirth < 12) {
              warnings.push({
                type: 'PARENT_TOO_YOUNG',
                personId: person.id,
                message: `${name} : parent ${parent.names[0] || parentId} avait ${birthYear - parentBirth} ans à la naissance`
              });
            }
            // Règle 6: Parent très âgé (>80 ans)
            if (parentBirth && birthYear - parentBirth > 80) {
              warnings.push({
                type: 'PARENT_TOO_OLD',
                personId: person.id,
                message: `${name} : parent ${parent.names[0] || parentId} avait ${birthYear - parentBirth} ans à la naissance`
              });
            }
          }
        });
      }
      
      // Règle 7: Longévité suspecte (>120 ans)
      if (birthYear && deathYear && deathYear - birthYear > 120) {
        warnings.push({
          type: 'EXTREME_LONGEVITY',
          personId: person.id,
          message: `${name} : longévité de ${deathYear - birthYear} ans (${birthYear}-${deathYear})`
        });
      }
    });
    
    // Vérifications sur les familles (mariages)
    families.forEach((fam, famId) => {
      const husband = fam.husband ? getPersonById(fam.husband) : null;
      const wife = fam.wife ? getPersonById(fam.wife) : null;
      const marriageYear = extractYear(fam.marriage);
      
      // Mariage avant naissance
      if (marriageYear) {
        if (husband) {
          const husbandBirth = extractYear(husband.birth);
          if (husbandBirth && marriageYear < husbandBirth) {
            errors.push({
              type: 'MARRIAGE_BEFORE_BIRTH',
              personId: husband.id,
              message: `${husband.names[0] || husband.id} : mariage (${marriageYear}) avant naissance (${husbandBirth})`
            });
          }
        }
        if (wife) {
          const wifeBirth = extractYear(wife.birth);
          if (wifeBirth && marriageYear < wifeBirth) {
            errors.push({
              type: 'MARRIAGE_BEFORE_BIRTH',
              personId: wife.id,
              message: `${wife.names[0] || wife.id} : mariage (${marriageYear}) avant naissance (${wifeBirth})`
            });
          }
        }
        // Mariage après décès
        if (husband) {
          const husbandDeath = extractYear(husband.death);
          if (husbandDeath && marriageYear > husbandDeath) {
            errors.push({
              type: 'MARRIAGE_AFTER_DEATH',
              personId: husband.id,
              message: `${husband.names[0] || husband.id} : mariage (${marriageYear}) après décès (${husbandDeath})`
            });
          }
        }
        if (wife) {
          const wifeDeath = extractYear(wife.death);
          if (wifeDeath && marriageYear > wifeDeath) {
            errors.push({
              type: 'MARRIAGE_AFTER_DEATH',
              personId: wife.id,
              message: `${wife.names[0] || wife.id} : mariage (${marriageYear}) après décès (${wifeDeath})`
            });
          }
        }
      }
    });
    
    return { errors, warnings };
  };

  // P1.3 - Normalisation avancée des lieux et détection des variantes
  const normalizePlaceFull = (place) => {
    if (!place) return '';
    return place
      .toLowerCase()
      .split(',')
      .map(part => part.trim())
      .filter(part => part.length > 0)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(', ');
  };

  const detectPlaceVariants = (people) => {
    const placeGroups = new Map();
    
    people.forEach(p => {
      [p.birthPlace, p.deathPlace, p.baptismPlace, p.burialPlace, p.residence]
        .filter(Boolean)
        .forEach(place => {
          const normalized = normalizePlaceFull(place);
          if (!placeGroups.has(normalized)) {
            placeGroups.set(normalized, { variants: new Set(), count: 0 });
          }
          placeGroups.get(normalized).variants.add(place);
          placeGroups.get(normalized).count++;
        });
    });
    
    // Retourner les groupes avec >1 variante
    return [...placeGroups.entries()]
      .filter(([_, data]) => data.variants.size > 1)
      .map(([normalized, data]) => ({
        suggested: normalized,
        variants: [...data.variants],
        occurrences: data.count
      }))
      .sort((a, b) => b.occurrences - a.occurrences);
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // v2.1.0 - FONCTIONS P2 : STATS, REFS ORPHELINES, SCORE SUSPICION
  // ═══════════════════════════════════════════════════════════════════════════════

  // v2.2.6 - Application des normalisations de lieux
  const applyPlaceNormalizations = (selections) => {
    if (Object.keys(selections).length === 0) {
      alert('Aucune normalisation sélectionnée');
      return;
    }
    
    // Créer une map de remplacement : variante → forme choisie
    const replacementMap = new Map();
    let groupsNormalized = 0;
    placeVariants.forEach((group, idx) => {
      const chosenForm = selections[idx];
      if (chosenForm) {
        groupsNormalized++;
        group.variants.forEach(variant => {
          if (variant !== chosenForm) {
            replacementMap.set(variant, chosenForm);
          }
        });
      }
    });
    
    if (replacementMap.size === 0) {
      alert('Aucun remplacement à effectuer');
      return;
    }
    
    // Appliquer les remplacements sur toutes les personnes
    let totalReplacements = 0;
    const placeFields = ['birthPlace', 'deathPlace', 'baptismPlace', 'burialPlace', 'residence'];
    
    const updatedPeople = individuals.map(person => {
      let modified = false;
      const updatedPerson = { ...person };
      
      placeFields.forEach(field => {
        if (person[field] && replacementMap.has(person[field])) {
          updatedPerson[field] = replacementMap.get(person[field]);
          
          // v2.2.6: Mettre à jour aussi les rawLines pour le fichier GEDCOM
          if (updatedPerson.rawLines) {
            updatedPerson.rawLines = updatedPerson.rawLines.map(line => {
              if (line.includes('PLAC') && line.includes(person[field])) {
                return line.replace(person[field], replacementMap.get(person[field]));
              }
              return line;
            });
          }
          
          modified = true;
          totalReplacements++;
        }
      });
      
      return modified ? updatedPerson : person;
    });
    
    // Mettre à jour l'état
    setIndividuals(updatedPeople);
    
    // Recalculer les variantes de lieux
    const newVariants = detectPlaceVariants(updatedPeople);
    setPlaceVariants(newVariants);
    
    // Marquer qu'il y a eu des normalisations
    setHasPlaceNormalizations(true);
    
    // Réinitialiser les sélections et fermer le modal
    setPlaceNormSelections({});
    setPlaceApiSuggestions({});
    setPlaceManualInput({});
    setPlaceManualSuggestions({});
    setShowPlaceNormModal(false);
    
    // Aller vers l'écran récapitulatif
    setValidationResults({
      totalIndividuals: individuals.length,
      mergedCount: 0,
      deletedCount: 0,
      remainingCount: individuals.length,
      normalizedPlaces: totalReplacements,
      normalizedGroups: groupsNormalized
    });
    setStep('merged');
  };

  // v2.2.6 - Téléchargement du fichier GEDCOM avec lieux normalisés
  // Utilise les rawLines mises à jour pour préserver toutes les données GEDCOM
  const downloadNormalizedFile = () => {
    if (!originalGedcom) {
      alert('Erreur : fichier GEDCOM original non disponible');
      return;
    }
    
    // Utiliser l'état actuel des individuals (avec rawLines mises à jour)
    const peopleToUse = individuals;
    
    // Créer une map ID -> rawLines mises à jour
    const updatedRawLinesMap = new Map();
    peopleToUse.forEach(person => {
      if (person.rawLines && person.rawLines.length > 0) {
        updatedRawLinesMap.set(person.id, person.rawLines);
      }
    });
    
    const lines = originalGedcom.split('\n');
    const outputLines = [];
    let skipCurrentIndi = false;
    let currentIndiId = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim().replace(/\r/g, '');
      
      // Détecter le début d'un bloc (niveau 0)
      if (trimmed.startsWith('0 ')) {
        // Si on était en train de sauter un INDI, on a fini
        skipCurrentIndi = false;
        currentIndiId = null;
        
        // Vérifier si c'est un INDI avec des rawLines mises à jour
        if (trimmed.includes('INDI')) {
          const match = trimmed.match(/@([^@]+)@/);
          if (match && updatedRawLinesMap.has(match[1])) {
            currentIndiId = match[1];
            // Insérer les rawLines mises à jour (qui contiennent TOUTES les données)
            const updatedLines = updatedRawLinesMap.get(currentIndiId);
            updatedLines.forEach(rawLine => outputLines.push(rawLine));
            skipCurrentIndi = true;
            continue;
          }
        }
      }
      
      // Sauter les lignes du bloc INDI original qu'on a remplacé par les rawLines
      if (skipCurrentIndi) {
        continue;
      }
      
      outputLines.push(line);
    }
    
    // Générer le fichier
    const blob = new Blob([outputLines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gedcom_normalise_' + new Date().toISOString().slice(0,10) + '.ged';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // v2.2.6 - Recherche de lieu via API Géo du gouvernement français
  const searchPlaceApi = async (placeText, groupIdx) => {
    if (!placeText || placeText.length < 2) return;
    
    setLoadingPlaceSuggestion(prev => ({ ...prev, [groupIdx]: true }));
    
    try {
      // Extraire le nom de commune (premier élément, sans code postal)
      const communeName = placeText
        .split(',')[0]
        .replace(/^\d{5}\s*/, '')  // Retirer code postal en préfixe
        .replace(/\s*\d{5}$/, '')  // Retirer code postal en suffixe
        .trim();
      
      if (!communeName || communeName.length < 2) {
        setLoadingPlaceSuggestion(prev => ({ ...prev, [groupIdx]: false }));
        return;
      }
      
      // Appeler l'API Géo
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(communeName)}&fields=nom,departement,region&limit=5`
      );
      
      if (!response.ok) throw new Error('Erreur API');
      
      const communes = await response.json();
      
      if (communes.length > 0) {
        // Formater les suggestions : Commune, Département, Région, France
        const suggestions = communes.map(c => ({
          short: c.nom,
          medium: `${c.nom}, ${c.departement?.nom || ''}`.replace(/, $/, ''),
          full: `${c.nom}, ${c.departement?.nom || ''}, ${c.region?.nom || ''}, France`
            .replace(/, , /g, ', ')
            .replace(/, , /g, ', ')
            .replace(/, France$/, ', France'),
          departement: c.departement?.nom,
          region: c.region?.nom
        }));
        
        setPlaceApiSuggestions(prev => ({ ...prev, [groupIdx]: suggestions }));
      } else {
        setPlaceApiSuggestions(prev => ({ ...prev, [groupIdx]: [] }));
      }
    } catch (error) {
      console.error('Erreur recherche lieu:', error);
      setPlaceApiSuggestions(prev => ({ ...prev, [groupIdx]: null }));
    } finally {
      setLoadingPlaceSuggestion(prev => ({ ...prev, [groupIdx]: false }));
    }
  };

  // v2.2.6 - Rechercher toutes les suggestions API pour tous les groupes
  const searchAllPlacesApi = async () => {
    const promises = placeVariants.map((group, idx) => {
      // Utiliser la première variante ou la suggestion comme base de recherche
      const searchTerm = group.variants[0] || group.suggested;
      return searchPlaceApi(searchTerm, idx);
    });
    await Promise.all(promises);
  };

  // v2.2.6 - Recherche manuelle avec autocomplétion en temps réel
  const searchManualPlace = async (inputText, groupIdx) => {
    // Mettre à jour la valeur du champ
    setPlaceManualInput(prev => ({ ...prev, [groupIdx]: inputText }));
    
    // Ne pas rechercher si moins de 2 caractères
    if (!inputText || inputText.length < 2) {
      setPlaceManualSuggestions(prev => ({ ...prev, [groupIdx]: [] }));
      return;
    }
    
    try {
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(inputText)}&fields=nom,departement,region&limit=5`
      );
      
      if (!response.ok) throw new Error('Erreur API');
      
      const communes = await response.json();
      
      if (communes.length > 0) {
        const suggestions = communes.map(c => ({
          short: c.nom,
          medium: `${c.nom}, ${c.departement?.nom || ''}`.replace(/, $/, ''),
          full: `${c.nom}, ${c.departement?.nom || ''}, ${c.region?.nom || ''}, France`
            .replace(/, , /g, ', ')
            .replace(/, , /g, ', ')
            .replace(/, France$/, ', France'),
          departement: c.departement?.nom,
          region: c.region?.nom
        }));
        setPlaceManualSuggestions(prev => ({ ...prev, [groupIdx]: suggestions }));
      } else {
        setPlaceManualSuggestions(prev => ({ ...prev, [groupIdx]: [] }));
      }
    } catch (error) {
      console.error('Erreur recherche manuelle:', error);
      setPlaceManualSuggestions(prev => ({ ...prev, [groupIdx]: [] }));
    }
  };

  // Sélectionner une suggestion manuelle
  const selectManualSuggestion = (suggestion, groupIdx) => {
    setPlaceNormSelections(prev => ({ ...prev, [groupIdx]: suggestion.full }));
    setPlaceManualInput(prev => ({ ...prev, [groupIdx]: '' }));
    setPlaceManualSuggestions(prev => ({ ...prev, [groupIdx]: [] }));
  };

  // Valider la saisie manuelle (sans suggestion API)
  const validateManualInput = (groupIdx) => {
    const input = placeManualInput[groupIdx];
    if (input && input.trim().length > 0) {
      setPlaceNormSelections(prev => ({ ...prev, [groupIdx]: input.trim() }));
      setPlaceManualInput(prev => ({ ...prev, [groupIdx]: '' }));
      setPlaceManualSuggestions(prev => ({ ...prev, [groupIdx]: [] }));
    }
  };

  // P2.1 - Statistiques généalogiques
  const calculateGenealogyStats = (people, families) => {
    const extractYear = (dateStr) => {
      if (!dateStr) return null;
      const match = dateStr.match(/(\d{4})/);
      return match ? parseInt(match[1]) : null;
    };
    
    // Répartition par sexe
    const males = people.filter(p => p.sex === 'M').length;
    const females = people.filter(p => p.sex === 'F').length;
    const unknown = people.length - males - females;
    
    // Distribution des années de naissance par décennie
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
      // Calcul de l'âge au décès
      if (birthYear && deathYear && deathYear >= birthYear) {
        const age = deathYear - birthYear;
        if (age <= 120) ages.push(age);
      }
    });
    
    // Statistiques d'âge
    const avgAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : null;
    const minAge = ages.length > 0 ? Math.min(...ages) : null;
    const maxAge = ages.length > 0 ? Math.max(...ages) : null;
    const medianAge = ages.length > 0 ? ages.sort((a, b) => a - b)[Math.floor(ages.length / 2)] : null;
    
    // Distribution des âges par tranche
    const ageRanges = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '80+': 0 };
    ages.forEach(age => {
      if (age <= 20) ageRanges['0-20']++;
      else if (age <= 40) ageRanges['21-40']++;
      else if (age <= 60) ageRanges['41-60']++;
      else if (age <= 80) ageRanges['61-80']++;
      else ageRanges['80+']++;
    });
    
    // Nb enfants par famille
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
      // Distribution du nombre d'enfants
      if (childCount === 0) childrenDistribution['0']++;
      else if (childCount <= 2) childrenDistribution['1-2']++;
      else if (childCount <= 5) childrenDistribution['3-5']++;
      else if (childCount <= 10) childrenDistribution['6-10']++;
      else childrenDistribution['10+']++;
    });
    
    // Dates complètes vs partielles
    let fullDates = 0, partialDates = 0, noDates = 0;
    people.forEach(p => {
      if (p.birth) {
        if (/\d{1,2}\s+\w+\s+\d{4}/.test(p.birth)) fullDates++;
        else partialDates++;
      } else {
        noDates++;
      }
    });
    
    // Top 10 patronymes
    const surnames = {};
    people.forEach(p => {
      const name = p.names[0] || '';
      const match = name.match(/\/([^/]+)\//);
      if (match) {
        const surname = match[1].toUpperCase();
        surnames[surname] = (surnames[surname] || 0) + 1;
      }
    });
    const topSurnames = Object.entries(surnames)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
    
    // Top prénoms (Hommes et Femmes séparés)
    const maleFirstNames = {};
    const femaleFirstNames = {};
    people.forEach(p => {
      const name = p.names[0] || '';
      const firstName = name.split('/')[0].trim().split(' ')[0];
      if (firstName && firstName.length > 1) {
        const normalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
        if (p.sex === 'M') {
          maleFirstNames[normalizedName] = (maleFirstNames[normalizedName] || 0) + 1;
        } else if (p.sex === 'F') {
          femaleFirstNames[normalizedName] = (femaleFirstNames[normalizedName] || 0) + 1;
        }
      }
    });
    const topMaleNames = Object.entries(maleFirstNames).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
    const topFemaleNames = Object.entries(femaleFirstNames).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
    
    // Top lieux de naissance
    const birthPlaces = {};
    people.forEach(p => {
      if (p.birthPlace) {
        const place = p.birthPlace.split(',')[0].trim();
        if (place) {
          birthPlaces[place] = (birthPlaces[place] || 0) + 1;
        }
      }
    });
    const topBirthPlaces = Object.entries(birthPlaces).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([place, count]) => ({ place, count }));
    
    // Professions les plus fréquentes
    const occupations = {};
    people.forEach(p => {
      if (p.occupation) {
        const occ = p.occupation.trim();
        if (occ) {
          occupations[occ] = (occupations[occ] || 0) + 1;
        }
      }
    });
    const topOccupations = Object.entries(occupations).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([occupation, count]) => ({ occupation, count }));
    
    // Période couverte
    const birthYears = people.map(p => extractYear(p.birth)).filter(Boolean);
    const deathYears = people.map(p => extractYear(p.death)).filter(Boolean);
    const minYear = birthYears.length ? Math.min(...birthYears) : null;
    const maxYear = Math.max(
      birthYears.length ? Math.max(...birthYears) : 0,
      deathYears.length ? Math.max(...deathYears) : 0
    ) || null;
    
    // Calcul du nombre de générations estimé
    const generationSpan = 25; // Moyenne de 25 ans par génération
    const estimatedGenerations = minYear && maxYear ? Math.round((maxYear - minYear) / generationSpan) : null;
    
    // Individus avec plusieurs mariages
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
      ages: {
        count: ages.length,
        avg: avgAge,
        min: minAge,
        max: maxAge,
        median: medianAge,
        distribution: ageRanges
      },
      dates: {
        full: fullDates,
        partial: partialDates,
        none: noDates,
        fullPct: people.length ? Math.round((fullDates / people.length) * 100) : 0
      },
      period: { 
        min: minYear, 
        max: maxYear,
        span: minYear && maxYear ? maxYear - minYear : null,
        estimatedGenerations
      },
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

  // P2.2 - Détection des références orphelines
  const detectOrphanReferences = (people, families, gedcomContent) => {
    const issues = [];
    const personIds = new Set(people.map(p => p.id));
    const familyIds = new Set(families.keys());
    
    // Individus pointant vers familles inexistantes
    people.forEach(person => {
      if (person.familyAsChild && !familyIds.has(person.familyAsChild)) {
        issues.push({
          type: 'FAMC_BROKEN',
          severity: 'error',
          id: person.id,
          message: `${person.names[0] || person.id} : FAMC ${person.familyAsChild} inexistante`
        });
      }
      person.familiesAsSpouse.forEach(famId => {
        if (!familyIds.has(famId)) {
          issues.push({
            type: 'FAMS_BROKEN',
            severity: 'error',
            id: person.id,
            message: `${person.names[0] || person.id} : FAMS ${famId} inexistante`
          });
        }
      });
    });
    
    // Familles pointant vers individus inexistants
    families.forEach((fam, famId) => {
      if (fam.husband && !personIds.has(fam.husband)) {
        issues.push({
          type: 'HUSB_BROKEN',
          severity: 'error',
          id: famId,
          message: `Famille ${famId} : HUSB ${fam.husband} inexistant`
        });
      }
      if (fam.wife && !personIds.has(fam.wife)) {
        issues.push({
          type: 'WIFE_BROKEN',
          severity: 'error',
          id: famId,
          message: `Famille ${famId} : WIFE ${fam.wife} inexistante`
        });
      }
      (fam.children || []).forEach(childId => {
        if (!personIds.has(childId)) {
          issues.push({
            type: 'CHIL_BROKEN',
            severity: 'error',
            id: famId,
            message: `Famille ${famId} : CHIL ${childId} inexistant`
          });
        }
      });
    });
    
    // Sources orphelines (définies mais jamais référencées)
    const definedSources = [...(gedcomContent.match(/@S\d+@/g) || [])];
    const referencedSources = [...(gedcomContent.match(/SOUR @S\d+@/g) || [])].map(s => s.split(' ')[1]);
    const orphanSources = [...new Set(definedSources)].filter(s => !referencedSources.includes(s) && gedcomContent.includes(`0 ${s} SOUR`));
    orphanSources.forEach(src => {
      issues.push({
        type: 'SOURCE_ORPHAN',
        severity: 'info',
        id: src,
        message: `Source ${src} définie mais jamais référencée`
      });
    });
    
    return issues;
  };

  // P2.3 - Score de suspicion des doublons (FORT/MOYEN/FAIBLE)
  const getSuspicionLevel = (score, criteriaCount) => {
    if (score >= 90 && criteriaCount >= 5) return { level: 'FORT', color: 'red', emoji: '🔴' };
    if (score >= 80 && criteriaCount >= 3) return { level: 'FORT', color: 'red', emoji: '🔴' };
    if (score >= 70 && criteriaCount >= 2) return { level: 'MOYEN', color: 'yellow', emoji: '🟡' };
    if (score >= 60 && criteriaCount >= 4) return { level: 'MOYEN', color: 'yellow', emoji: '🟡' };
    return { level: 'FAIBLE', color: 'green', emoji: '🟢' };
  };

  const getClusterAverageScore = (cluster) => cluster.avgScore || 0;
  const getFilteredClusters = () => clusters.filter(cluster => getClusterAverageScore(cluster) >= clusterScoreFilter);
  const autoSelectHighConfidenceClusters = () => {
    const newSelectedClusters = new Set();
    const newSelectedPairs = new Set(selectedPairs);
    
    clusters.forEach((cluster, idx) => {
      if (getClusterAverageScore(cluster) >= clusterScoreFilter) {
        newSelectedClusters.add(idx);
        // Ajouter toutes les paires de doublons qui font partie de ce cluster
        duplicates.forEach(dup => {
          if (cluster.ids.includes(dup.person1.id) && cluster.ids.includes(dup.person2.id)) {
            newSelectedPairs.add(dup.id);
          }
        });
      }
    });
    
    setSelectedClusters(newSelectedClusters);
    setSelectedPairs(newSelectedPairs);
  };
  // v2.2.2: Corrigé - selectCluster doit aussi marquer le cluster comme sélectionné
  const selectCluster = (clusterIds, clusterIndex) => {
    const newSelected = new Set(selectedPairs);
    duplicates.forEach(dup => { if (clusterIds.includes(dup.person1.id) && clusterIds.includes(dup.person2.id)) newSelected.add(dup.id); });
    setSelectedPairs(newSelected);
    
    // Marquer le cluster comme sélectionné visuellement
    if (clusterIndex !== undefined) {
      const newSelectedClusters = new Set(selectedClusters);
      newSelectedClusters.add(clusterIndex);
      setSelectedClusters(newSelectedClusters);
    }
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

  // ═══════════════════════════════════════════════════════════════════════════════
  // v2.2.0 - FONCTIONS DE DÉTECTION ET RÉSOLUTION DES CONFLITS
  // ═══════════════════════════════════════════════════════════════════════════════

  // Extraire l'année d'une date GEDCOM
  const extractYearFromDate = (dateStr) => {
    if (!dateStr) return null;
    const match = dateStr.match(/(\d{4})/);
    return match ? parseInt(match[1]) : null;
  };

  // v2.2.2: Vérifier si une date est approximative ou partielle
  const isApproximateDate = (dateStr) => {
    if (!dateStr) return true;
    const upper = dateStr.toUpperCase();
    // ABT (about), BEF (before), AFT (after), EST (estimated), CAL (calculated)
    if (/^(ABT|BEF|AFT|EST|CAL|FROM|TO|BET)\b/.test(upper)) return true;
    // Si c'est juste une année (ex: "1726")
    if (/^\d{4}$/.test(dateStr.trim())) return true;
    return false;
  };

  // Vérifier si deux valeurs sont compatibles selon leur type
  const areValuesCompatible = (v1, v2, type) => {
    if (!v1 || !v2) return true; // Si une valeur est vide, pas de conflit
    
    if (type === 'date') {
      // Si les dates sont identiques (texte), c'est compatible
      if (v1.trim().toLowerCase() === v2.trim().toLowerCase()) return true;
      
      // v2.2.2: Si une des dates est approximative/partielle, comparer les années
      if (isApproximateDate(v1) || isApproximateDate(v2)) {
        const year1 = extractYearFromDate(v1);
        const year2 = extractYearFromDate(v2);
        if (year1 && year2) return year1 === year2;
        return true;
      }
      
      // Les deux dates sont précises et différentes → CONFLIT
      return false;
    }
    
    if (type === 'place') {
      // Lieux compatibles si l'un contient l'autre
      const norm1 = v1.toLowerCase().trim();
      const norm2 = v2.toLowerCase().trim();
      return norm1.includes(norm2) || norm2.includes(norm1) || norm1 === norm2;
    }
    
    // Texte: compatible si identique (insensible à la casse)
    return v1.toLowerCase().trim() === v2.toLowerCase().trim();
  };

  // Détecter les conflits entre deux personnes avant fusion
  const detectMergeConflicts = (person1, person2) => {
    const conflicts = [];
    
    const fieldsToCheck = [
      { key: 'birth', label: 'Date de naissance', type: 'date' },
      { key: 'birthPlace', label: 'Lieu de naissance', type: 'place' },
      { key: 'death', label: 'Date de décès', type: 'date' },
      { key: 'deathPlace', label: 'Lieu de décès', type: 'place' },
      { key: 'baptism', label: 'Date de baptême', type: 'date' },
      { key: 'baptismPlace', label: 'Lieu de baptême', type: 'place' },
      { key: 'burial', label: 'Date d\'inhumation', type: 'date' },
      { key: 'burialPlace', label: 'Lieu d\'inhumation', type: 'place' },
      { key: 'occupation', label: 'Profession', type: 'text' },
      { key: 'religion', label: 'Religion', type: 'text' },
    ];
    
    fieldsToCheck.forEach(({ key, label, type }) => {
      const v1 = person1[key];
      const v2 = person2[key];
      
      // Conflit = deux valeurs non-nulles ET différentes ET incompatibles
      if (v1 && v2 && v1 !== v2 && !areValuesCompatible(v1, v2, type)) {
        conflicts.push({
          field: key,
          label,
          type,
          value1: v1,
          value2: v2,
          person1Id: person1.id,
          person2Id: person2.id,
          person1Name: person1.names[0] || person1.id,
          person2Name: person2.names[0] || person2.id,
          resolved: false,
          chosenValue: null,
          chosenSource: null // 'person1' | 'person2' | 'manual'
        });
      }
    });
    
    // v2.2.6: Conflit sur les parents
    if (person1.parents.length > 0 && person2.parents.length > 0) {
      // Vérifier si les parents sont différents
      const parents1Set = new Set(person1.parents);
      const parents2Set = new Set(person2.parents);
      const sameParents = person1.parents.length === person2.parents.length && 
                          person1.parents.every(p => parents2Set.has(p));
      
      if (!sameParents) {
        // Trouver les noms des parents pour l'affichage
        const getParentNames = (parentIds) => {
          return parentIds.map(id => {
            const parent = individuals.find(p => p.id === id);
            return parent ? (parent.names[0] || id) : id;
          }).join(' + ');
        };
        
        conflicts.push({
          field: 'parents',
          label: 'Parents',
          type: 'parents',
          value1: getParentNames(person1.parents),
          value2: getParentNames(person2.parents),
          rawValue1: person1.parents,
          rawValue2: person2.parents,
          person1Id: person1.id,
          person2Id: person2.id,
          person1Name: person1.names[0] || person1.id,
          person2Name: person2.names[0] || person2.id,
          resolved: false,
          chosenValue: null,
          chosenSource: null
        });
      }
    }
    
    // v2.2.6: Conflit sur les conjoints
    if (person1.spouses.length > 0 && person2.spouses.length > 0) {
      const spouses1Set = new Set(person1.spouses);
      const spouses2Set = new Set(person2.spouses);
      // Vérifier s'il y a des conjoints exclusifs (pas en commun)
      const uniqueToP1 = person1.spouses.filter(s => !spouses2Set.has(s));
      const uniqueToP2 = person2.spouses.filter(s => !spouses1Set.has(s));
      
      if (uniqueToP1.length > 0 && uniqueToP2.length > 0) {
        // Il y a des conjoints différents des deux côtés
        const getSpouseNames = (spouseIds) => {
          return spouseIds.map(id => {
            const spouse = individuals.find(p => p.id === id);
            return spouse ? (spouse.names[0] || id) : id;
          }).join(', ');
        };
        
        conflicts.push({
          field: 'spouses',
          label: 'Conjoints',
          type: 'spouses',
          value1: getSpouseNames(person1.spouses),
          value2: getSpouseNames(person2.spouses),
          rawValue1: person1.spouses,
          rawValue2: person2.spouses,
          person1Id: person1.id,
          person2Id: person2.id,
          person1Name: person1.names[0] || person1.id,
          person2Name: person2.names[0] || person2.id,
          resolved: false,
          chosenValue: null,
          chosenSource: null
        });
      }
    }
    
    // v2.2.6: Conflit sur les enfants
    if (person1.children.length > 0 && person2.children.length > 0) {
      const children1Set = new Set(person1.children);
      const children2Set = new Set(person2.children);
      // Vérifier si les enfants sont différents
      const uniqueToP1 = person1.children.filter(c => !children2Set.has(c));
      const uniqueToP2 = person2.children.filter(c => !children1Set.has(c));
      
      if (uniqueToP1.length > 0 && uniqueToP2.length > 0) {
        // Il y a des enfants différents des deux côtés
        const getChildrenNames = (childIds) => {
          return childIds.map(id => {
            const child = individuals.find(p => p.id === id);
            return child ? (child.names[0] || id) : id;
          }).join(', ');
        };
        
        conflicts.push({
          field: 'children',
          label: 'Enfants',
          type: 'children',
          value1: getChildrenNames(person1.children),
          value2: getChildrenNames(person2.children),
          rawValue1: person1.children,
          rawValue2: person2.children,
          person1Id: person1.id,
          person2Id: person2.id,
          person1Name: person1.names[0] || person1.id,
          person2Name: person2.names[0] || person2.id,
          resolved: false,
          chosenValue: null,
          chosenSource: null
        });
      }
    }
    
    return conflicts;
  };

  // Résoudre un conflit en choisissant une valeur
  const resolveConflict = (conflictIndex, chosenValue, chosenSource) => {
    setMergeConflicts(prev => prev.map((conflict, idx) => 
      idx === conflictIndex 
        ? { ...conflict, resolved: true, chosenValue, chosenSource }
        : conflict
    ));
  };

  // Vérifier si tous les conflits sont résolus
  const allConflictsResolved = () => {
    return mergeConflicts.length === 0 || mergeConflicts.every(c => c.resolved);
  };

  // Appliquer les résolutions de conflits à la fusion
  const applyConflictResolutions = (merged, conflicts) => {
    const resolvedMerged = { ...merged };
    
    conflicts.forEach(conflict => {
      if (conflict.resolved && conflict.chosenValue !== null) {
        resolvedMerged[conflict.field] = conflict.chosenValue;
      }
    });
    
    return resolvedMerged;
  };

  // v2.2.4: Nettoyer les familles orphelines après fusion/suppression
  // mergeMap permet de rediriger les références vers la personne fusionnée
  const cleanOrphanedFamilies = (families, removedIds, people, mergeMap = new Map()) => {
    const cleanedFamilies = new Map();
    const orphanReport = { removed: [], modified: [] };
    const peopleIds = new Set(people.filter(p => !removedIds.has(p.id)).map(p => p.id));
    
    // Helper: obtenir l'ID valide (cible de fusion si fusionné, sinon l'ID original si existe)
    const getValidId = (id) => {
      if (!id) return null;
      // Si l'ID a été fusionné, retourner la cible
      if (mergeMap.has(id)) return mergeMap.get(id);
      // Si l'ID existe toujours, le garder
      if (peopleIds.has(id)) return id;
      // Sinon, l'ID n'existe plus (suppression manuelle)
      return null;
    };
    
    families.forEach((family, famId) => {
      let modified = false;
      const cleanedFamily = { ...family };
      
      // v2.2.4: Mettre à jour HUSB vers cible de fusion ou null si supprimé
      const validHusband = getValidId(family.husband);
      if (validHusband !== family.husband) {
        cleanedFamily.husband = validHusband;
        modified = true;
      }
      
      // v2.2.4: Mettre à jour WIFE vers cible de fusion ou null si supprimé
      const validWife = getValidId(family.wife);
      if (validWife !== family.wife) {
        cleanedFamily.wife = validWife;
        modified = true;
      }
      
      // v2.2.4: Mettre à jour les enfants vers cibles de fusion et filtrer les supprimés
      if (family.children && family.children.length > 0) {
        const updatedChildren = family.children
          .map(childId => getValidId(childId))
          .filter(id => id !== null);
        // Dédupliquer (si deux enfants fusionnent vers le même)
        const uniqueChildren = [...new Set(updatedChildren)];
        if (uniqueChildren.length !== family.children.length || 
            !uniqueChildren.every((c, i) => c === family.children[i])) {
          cleanedFamily.children = uniqueChildren;
          modified = true;
        }
      }
      
      // Famille orpheline = ni mari, ni femme, ni enfants
      const isOrphaned = !cleanedFamily.husband && !cleanedFamily.wife && 
                         (!cleanedFamily.children || cleanedFamily.children.length === 0);
      
      if (isOrphaned) {
        orphanReport.removed.push({ famId, reason: 'Famille vide (aucun membre valide)' });
      } else {
        cleanedFamilies.set(famId, cleanedFamily);
        if (modified) {
          orphanReport.modified.push({ famId, family: cleanedFamily });
        }
      }
    });
    
    return { cleanedFamilies, orphanReport };
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // FONCTIONS DE FUSION DE DONNÉES v1.9.5
  // ═══════════════════════════════════════════════════════════════════════════

  // Fonction de fusion des données de deux personnes
  const mergePersonData = (person1, person2) => {
    const quality1 = calculateDataQuality(person1);
    const quality2 = calculateDataQuality(person2);
    const primary = quality1 >= quality2 ? person1 : person2;
    const secondary = quality1 >= quality2 ? person2 : person1;
    
    // v2.0.0: Fusionner les rawLinesByTag (SOUR, NOTE, OBJE, etc.)
    const mergedRawLinesByTag = {};
    const allTags = new Set([
      ...Object.keys(primary.rawLinesByTag || {}),
      ...Object.keys(secondary.rawLinesByTag || {})
    ]);
    
    allTags.forEach(tag => {
      const primaryBlocks = (primary.rawLinesByTag || {})[tag] || [];
      const secondaryBlocks = (secondary.rawLinesByTag || {})[tag] || [];
      
      // Dédupliquer les SOUR par référence @Sxxx@
      if (tag === 'SOUR') {
        const seenRefs = new Set();
        const dedupedBlocks = [];
        [...primaryBlocks, ...secondaryBlocks].forEach(block => {
          const firstLine = block.lines[0] || '';
          const refMatch = firstLine.match(/@([^@]+)@/);
          const ref = refMatch ? refMatch[1] : firstLine;
          if (!seenRefs.has(ref)) {
            seenRefs.add(ref);
            dedupedBlocks.push(block);
          }
        });
        mergedRawLinesByTag[tag] = dedupedBlocks;
      } else {
        // Pour les autres tags, combiner tous les blocs
        mergedRawLinesByTag[tag] = [...primaryBlocks, ...secondaryBlocks];
      }
    });
    
    return {
      id: primary.id,
      removedId: secondary.id,
      // Noms: garder tous les noms uniques
      names: [...new Set([...primary.names, ...secondary.names])],
      // Dates/lieux: préférer la donnée existante
      birth: primary.birth || secondary.birth,
      birthPlace: primary.birthPlace || secondary.birthPlace,
      death: primary.death || secondary.death,
      deathPlace: primary.deathPlace || secondary.deathPlace,
      baptism: primary.baptism || secondary.baptism,
      baptismPlace: primary.baptismPlace || secondary.baptismPlace,
      burial: primary.burial || secondary.burial,
      burialPlace: primary.burialPlace || secondary.burialPlace,
      // Autres champs
      sex: primary.sex || secondary.sex,
      occupation: primary.occupation || secondary.occupation,
      religion: primary.religion || secondary.religion,
      title: primary.title || secondary.title,
      residence: primary.residence || secondary.residence,
      note: [primary.note, secondary.note].filter(Boolean).join(' | '),
      // Relations: combiner et dédupliquer
      parents: [...new Set([...primary.parents, ...secondary.parents])],
      spouses: [...new Set([...primary.spouses, ...secondary.spouses])],
      children: [...new Set([...(primary.children || []), ...(secondary.children || [])])],
      familyAsChild: primary.familyAsChild || secondary.familyAsChild,
      familiesAsSpouse: [...new Set([...primary.familiesAsSpouse, ...secondary.familiesAsSpouse])],
      // v2.0.0: Données brutes fusionnées
      rawLines: primary.rawLines || [],
      rawLinesByTag: mergedRawLinesByTag,
      // Métadonnées fusion
      mergedFrom: [primary.id, secondary.id],
      qualityScore: Math.max(quality1, quality2)
    };
  };

  // Générer les lignes GEDCOM pour une personne fusionnée
  // v2.2.4: Ajout paramètre familiesToRemove pour filtrer les références
  const generateMergedIndiLines = (merged, familiesToRemove = new Set()) => {
    const lines = [];
    lines.push('0 @' + merged.id + '@ INDI');
    
    // Noms (premier = principal, autres = alias)
    merged.names.forEach((name, idx) => {
      lines.push('1 NAME ' + name);
      if (idx > 0) lines.push('2 TYPE aka');
    });
    
    if (merged.sex) lines.push('1 SEX ' + merged.sex);
    
    // Naissance
    if (merged.birth || merged.birthPlace) {
      lines.push('1 BIRT');
      if (merged.birth) lines.push('2 DATE ' + merged.birth);
      if (merged.birthPlace) lines.push('2 PLAC ' + merged.birthPlace);
    }
    
    // Baptême
    if (merged.baptism || merged.baptismPlace) {
      lines.push('1 BAPM');
      if (merged.baptism) lines.push('2 DATE ' + merged.baptism);
      if (merged.baptismPlace) lines.push('2 PLAC ' + merged.baptismPlace);
    }
    
    // Décès
    if (merged.death || merged.deathPlace) {
      lines.push('1 DEAT');
      if (merged.death) lines.push('2 DATE ' + merged.death);
      if (merged.deathPlace) lines.push('2 PLAC ' + merged.deathPlace);
    }
    
    // Inhumation
    if (merged.burial || merged.burialPlace) {
      lines.push('1 BURI');
      if (merged.burial) lines.push('2 DATE ' + merged.burial);
      if (merged.burialPlace) lines.push('2 PLAC ' + merged.burialPlace);
    }
    
    // Autres champs
    if (merged.occupation) lines.push('1 OCCU ' + merged.occupation);
    if (merged.religion) lines.push('1 RELI ' + merged.religion);
    if (merged.title) lines.push('1 TITL ' + merged.title);
    if (merged.residence) {
      lines.push('1 RESI');
      lines.push('2 PLAC ' + merged.residence);
    }
    
    // v2.2.4: Famille comme enfant (vérifier qu'elle existe encore)
    if (merged.familyAsChild && !familiesToRemove.has(merged.familyAsChild)) {
      lines.push('1 FAMC @' + merged.familyAsChild + '@');
    }
    
    // v2.2.4: Familles comme conjoint (dédupliquées, filtrées)
    [...new Set(merged.familiesAsSpouse)]
      .filter(famId => !familiesToRemove.has(famId))
      .forEach(famId => {
        lines.push('1 FAMS @' + famId + '@');
      });
    
    // Note de fusion pour traçabilité
    if (merged.mergedFrom && merged.mergedFrom.length > 1) {
      lines.push('1 NOTE Fusionné par GedcomMerger depuis: ' + merged.mergedFrom.join(', '));
    }
    if (merged.note) {
      lines.push('1 NOTE ' + merged.note);
    }
    
    // v2.0.0: Ajouter les tags fusionnés depuis rawLinesByTag
    if (merged.rawLinesByTag) {
      // Ordre recommandé des tags à ajouter
      const tagsOrder = ['SOUR', 'OBJE', 'EVEN', 'EDUC', 'NATI', 'IMMI', 'EMIG', 'CENS', 'WILL', 'PROB'];
      
      // D'abord les tags connus dans l'ordre
      tagsOrder.forEach(tag => {
        const blocks = merged.rawLinesByTag[tag];
        if (blocks && blocks.length > 0) {
          blocks.forEach(block => {
            if (block.lines && block.lines.length > 0) {
              block.lines.forEach(rawLine => {
                const trimmedLine = rawLine.trim();
                if (trimmedLine) lines.push(trimmedLine);
              });
            }
          });
        }
      });
      
      // Ensuite les tags custom (_TAG)
      Object.keys(merged.rawLinesByTag)
        .filter(tag => tag.startsWith('_'))
        .forEach(tag => {
          const blocks = merged.rawLinesByTag[tag];
          if (blocks && blocks.length > 0) {
            blocks.forEach(block => {
              if (block.lines && block.lines.length > 0) {
                block.lines.forEach(rawLine => {
                  const trimmedLine = rawLine.trim();
                  if (trimmedLine) lines.push(trimmedLine);
                });
              }
            });
          }
        });
    }
    
    return lines;
  };

  const openPreview = (pair) => setPreviewPair(pair);
  const closePreview = () => setPreviewPair(null);
  const togglePairSelection = (pairId) => {
    const newSelected = new Set(selectedPairs);
    if (newSelected.has(pairId)) newSelected.delete(pairId);
    else newSelected.add(pairId);
    setSelectedPairs(newSelected);
  };
  // v2.2.2: Sélectionner uniquement les doublons simples (pas ceux des clusters)
  const selectHighConfidence = () => {
    // Identifier les paires qui font partie d'un cluster
    const clusterPairIds = new Set();
    clusters.forEach(cluster => {
      duplicates.forEach(dup => {
        if (cluster.ids.includes(dup.person1.id) && cluster.ids.includes(dup.person2.id)) {
          clusterPairIds.add(dup.id);
        }
      });
    });
    
    // Sélectionner uniquement les doublons simples avec score >= filterScore
    const highConfidencePairs = duplicates
      .filter(pair => pair.similarity >= filterScore && !clusterPairIds.has(pair.id))
      .map(pair => pair.id);
    
    // Conserver les paires des clusters déjà sélectionnées
    const existingClusterPairs = [...selectedPairs].filter(id => clusterPairIds.has(id));
    setSelectedPairs(new Set([...existingClusterPairs, ...highConfidencePairs]));
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
      setProgressMessage('Lecture du fichier...');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setOriginalGedcom(content);
        
        // v2.1.4: Utilisation du Web Worker pour le traitement
        if (workerRef.current) {
          workerRef.current.terminate();
        }
        
        try {
          // v2.1.4b: Cache-busting pour forcer le rechargement du Worker
          workerRef.current = new Worker('/gedcom-worker.js?v=2.1.4b');
        } catch (err) {
          console.error('Erreur création Worker:', err);
          setProgressMessage('Erreur: Worker non disponible');
          setProgress(0);
          return;
        }
        
        workerRef.current.onmessage = (event) => {
          try {
            const { type, progress: workerProgress, message, data, error } = event.data;
            
            if (type === 'progress') {
              setProgress(workerProgress);
              if (message) setProgressMessage(message);
            }
            else if (type === 'complete') {
              console.log('Worker complete, données reçues:', Object.keys(data));
              
              // Reconstruire la Map des familles à partir du tableau
              const familiesMap = new Map(data.families);
              
              setIndividuals(data.people);
              setFamiliesData(familiesMap);
              setQualityReport(data.qualityReport);
              setChronoIssues(data.chronoIssues);
              setPlaceVariants(data.placeVariants);
              setGenealogyStats(data.genealogyStats);
              setOrphanRefs(data.orphanRefs);
              setDuplicates(data.duplicates);
              setClusters(data.clusters);
              setToDeletePersons(data.toDeletePersons);
              setSmartSuggestions(data.smartSuggestions);
              setIntegrityReport(data.integrityReport);
              
              setProgress(100);
              setProgressMessage('Terminé!');
              setStep('review');
              // v2.2.1: Modal qualité accessible via bouton uniquement
              
              // Cleanup du worker
              if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
              }
            }
            else if (type === 'error') {
              console.error('Erreur Worker:', error);
              setProgressMessage(`Erreur: ${error}`);
              setProgress(0);
              if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
              }
            }
          } catch (err) {
            console.error('Erreur traitement message Worker:', err);
            setProgressMessage(`Erreur: ${err.message}`);
            setProgress(0);
          }
        };
        
        workerRef.current.onerror = (error) => {
          console.error('Erreur Worker (onerror):', error);
          setProgressMessage(`Erreur Worker: ${error.message || 'Erreur inconnue'}`);
          setProgress(0);
          setStep('upload');
        };
        
        // Envoyer le contenu au Worker
        workerRef.current.postMessage({ content });
      };
      reader.readAsText(uploadedFile);
    }
  };

  const handleMerge = () => {
    if (selectedPairs.size === 0) return;
    
    // CONTRÔLES D'INTÉGRITÉ PRÉ-FUSION
    const warnings = [];
    const errors = [];
    
    // v2.2.0: Collecter tous les conflits détectés
    let allConflicts = [];
    
    duplicates.forEach(pair => {
      if (!selectedPairs.has(pair.id)) return;
      
      const p1 = pair.person1, p2 = pair.person2;
      
      // Erreur: même personne
      if (p1.id === p2.id) {
        errors.push(`Impossible de fusionner ${p1.names[0] || p1.id} avec lui-même`);
        return;
      }
      
      // Erreur: sexes différents
      if (p1.sex && p2.sex && p1.sex !== p2.sex) {
        errors.push(`Sexes incompatibles: ${p1.names[0]} (${p1.sex}) ≠ ${p2.names[0]} (${p2.sex})`);
      }
      
      // v2.2.0: Détecter les conflits pour cette paire
      const pairConflicts = detectMergeConflicts(p1, p2);
      if (pairConflicts.length > 0) {
        allConflicts = [...allConflicts, ...pairConflicts];
      }
      
      // Warning: dates de naissance très différentes (> 5 ans mais pas conflit)
      if (p1.birth && p2.birth) {
        const y1 = p1.birth.match(/\d{4}/)?.[0], y2 = p2.birth.match(/\d{4}/)?.[0];
        if (y1 && y2 && Math.abs(parseInt(y1) - parseInt(y2)) > 5) {
          warnings.push(`Écart naissance >5 ans: ${p1.names[0]} (${y1}) vs ${p2.names[0]} (${y2})`);
        }
      }
      
      // Warning: lieux de naissance différents
      if (p1.birthPlace && p2.birthPlace && 
          normalizePlace(p1.birthPlace).toLowerCase() !== normalizePlace(p2.birthPlace).toLowerCase()) {
        // Seulement si pas déjà un conflit détecté sur ce champ
        if (!pairConflicts.some(c => c.field === 'birthPlace')) {
          warnings.push(`Lieux naissance différents: ${p1.names[0]} - "${p1.birthPlace}" vs "${p2.birthPlace}"`);
        }
      }
      
      // Warning: dates de décès très différentes
      if (p1.death && p2.death) {
        const dy1 = p1.death.match(/\d{4}/)?.[0], dy2 = p2.death.match(/\d{4}/)?.[0];
        if (dy1 && dy2 && Math.abs(parseInt(dy1) - parseInt(dy2)) > 5) {
          warnings.push(`Écart décès >5 ans: ${p1.names[0]} (${dy1}) vs ${p2.names[0]} (${dy2})`);
        }
      }
    });
    
    // Bloquer si erreurs critiques
    if (errors.length > 0) {
      alert('❌ ERREURS BLOQUANTES:\n\n' + errors.join('\n') + '\n\nFusion annulée.');
      return;
    }
    
    // v2.2.0: Si conflits détectés, afficher le modal de résolution
    if (allConflicts.length > 0) {
      setMergeConflicts(allConflicts);
      setShowConflictModal(true);
      return; // Attendre que l'utilisateur résolve les conflits
    }
    
    // Demander confirmation si warnings (mais pas de conflits)
    if (warnings.length > 0) {
      const proceed = window.confirm(
        '⚠️ ATTENTION - ' + warnings.length + ' avertissement(s):\n\n' + 
        warnings.slice(0, 5).join('\n') + 
        (warnings.length > 5 ? '\n... et ' + (warnings.length - 5) + ' autres' : '') +
        '\n\nVoulez-vous continuer la fusion ?'
      );
      if (!proceed) return;
    }
    
    // Procéder à la fusion (pas de conflits)
    executeMerge();
  };

  // v2.2.0: Fonction séparée pour exécuter la fusion après résolution des conflits
  const executeMerge = () => {
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

  // v2.2.0: Appliquer les résolutions de conflits et fusionner
  const handleApplyConflictResolutions = () => {
    if (!allConflictsResolved()) {
      alert('⚠️ Veuillez résoudre tous les conflits avant de fusionner.');
      return;
    }
    setShowConflictModal(false);
    executeMerge();
  };

  const handleDeleteToDelete = () => {
    if (selectedToDelete.size === 0) return;
    
    // CONTRÔLES D'INTÉGRITÉ PRÉ-SUPPRESSION
    const warnings = [];
    
    toDeletePersons.forEach(person => {
      if (!selectedToDelete.has(person.id)) return;
      
      // Warning: personne avec des enfants
      if (person.children && person.children.length > 0) {
        warnings.push(`${person.names[0] || person.id} a ${person.children.length} enfant(s) - ils perdront leur lien parental`);
      }
      
      // Warning: personne avec conjoints
      if (person.spouses && person.spouses.length > 0) {
        warnings.push(`${person.names[0] || person.id} a ${person.spouses.length} conjoint(s) - ils perdront leur lien conjugal`);
      }
      
      // Warning: personne référencée comme parent par d'autres
      const referencedBy = individuals.filter(ind => 
        ind.parents.includes(person.id) && !selectedToDelete.has(ind.id)
      );
      if (referencedBy.length > 0) {
        warnings.push(`${person.names[0] || person.id} est parent de ${referencedBy.length} personne(s) non supprimée(s)`);
      }
    });
    
    // Message de confirmation enrichi
    let confirmMessage = '⚠️ Vous allez SUPPRIMER définitivement ' + selectedToDelete.size + ' individu(s) de votre arbre.';
    
    if (warnings.length > 0) {
      confirmMessage += '\n\n🔶 AVERTISSEMENTS:\n' + warnings.slice(0, 5).join('\n');
      if (warnings.length > 5) {
        confirmMessage += '\n... et ' + (warnings.length - 5) + ' autres avertissements';
      }
    }
    
    confirmMessage += '\n\nCette action est irréversible. Continuer ?';
    
    if (!window.confirm(confirmMessage)) return;
    
    setMergedIds(new Map());
    setValidationResults({ totalIndividuals: individuals.length, mergedCount: 0, deletedCount: selectedToDelete.size, remainingCount: individuals.length - selectedToDelete.size });
    setStep('merged');
  };

  const downloadCleanedFile = () => {
    if (!originalGedcom) return;
    
    // ÉTAPE 1: Construire les données de fusion
    const idsToRemove = new Set();
    const mergeMap = new Map();
    const mergedPersons = new Map();
    
    // Créer les personnes fusionnées à partir des paires sélectionnées
    duplicates.forEach(pair => {
      if (selectedPairs.has(pair.id)) {
        let merged = mergePersonData(pair.person1, pair.person2);
        
        // v2.2.0: Appliquer les résolutions de conflits pour cette paire
        const pairConflicts = mergeConflicts.filter(c => 
          (c.person1Id === pair.person1.id && c.person2Id === pair.person2.id) ||
          (c.person1Id === pair.person2.id && c.person2Id === pair.person1.id)
        );
        if (pairConflicts.length > 0) {
          merged = applyConflictResolutions(merged, pairConflicts);
        }
        
        idsToRemove.add(merged.removedId);
        mergeMap.set(merged.removedId, merged.id);
        
        // Si on a déjà fusionné cette personne (cluster), combiner encore
        if (mergedPersons.has(merged.id)) {
          const existing = mergedPersons.get(merged.id);
          const combined = mergePersonData(existing, merged);
          combined.mergedFrom = [...new Set([...(existing.mergedFrom || []), ...(merged.mergedFrom || [])])];
          mergedPersons.set(merged.id, combined);
        } else {
          mergedPersons.set(merged.id, merged);
        }
      }
    });
    
    // v2.2.4: RÉSOLUTION DES CHAÎNES DE FUSION EN CASCADE
    // Si A→B et B→C, alors A doit pointer vers C (la cible finale)
    // Répéter jusqu'à ce qu'il n'y ait plus de chaînes
    let chainsResolved = true;
    let iterations = 0;
    const maxIterations = 100; // Sécurité anti-boucle infinie
    
    while (chainsResolved && iterations < maxIterations) {
      chainsResolved = false;
      iterations++;
      
      mergeMap.forEach((targetId, sourceId) => {
        // Si la cible est elle-même fusionnée vers une autre personne
        if (mergeMap.has(targetId)) {
          const finalTarget = mergeMap.get(targetId);
          mergeMap.set(sourceId, finalTarget);
          chainsResolved = true;
        }
      });
    }
    
    // Ajouter les suppressions manuelles
    selectedToDelete.forEach(id => idsToRemove.add(id));
    
    // v2.2.4: Nettoyer les familles orphelines (avec mergeMap pour redirections)
    const { cleanedFamilies, orphanReport } = cleanOrphanedFamilies(familiesData, idsToRemove, individuals, mergeMap);
    if (orphanReport.removed.length > 0) {
      console.log(`v2.2.0: ${orphanReport.removed.length} famille(s) orpheline(s) supprimée(s)`);
    }
    const familiesToRemove = new Set(orphanReport.removed.map(r => r.famId));
    
    // ÉTAPE 2: Traiter le fichier GEDCOM
    const lines = originalGedcom.split('\n');
    const outputLines = [];
    let skipCurrentBlock = false;
    let currentBlockId = null;
    let inMergedIndi = false;
    
    // Vérifier si HEAD existe
    const hasHead = lines.length > 0 && lines[0].trim().replace(/\r/g, '').startsWith('0 HEAD');
    if (!hasHead) {
      outputLines.push('0 HEAD', '1 SOUR GedcomMerger', '2 VERS ' + VERSION, '2 NAME Fusionneur de Doublons GEDCOM', '1 GEDC', '2 VERS 5.5.1', '2 FORM LINEAGE-LINKED', '1 CHAR UTF-8');
      const now = new Date();
      const dateStr = now.getDate() + ' ' + ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][now.getMonth()] + ' ' + now.getFullYear();
      outputLines.push('1 DATE ' + dateStr);
    }
    
    // Tracking pour dédupliquer les CHIL dans les FAM
    const famChildrenSeen = new Map();
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim().replace(/\r/g, '');
      
      if (trimmed.startsWith('0 TRLR')) continue;
      
      if (trimmed.startsWith('0 ')) {
        skipCurrentBlock = false;
        inMergedIndi = false;
        currentBlockId = null;
        
        if (trimmed.includes('@')) {
          const match = trimmed.match(/@([^@]+)@/);
          if (match) {
            currentBlockId = match[1];
            
            if (idsToRemove.has(currentBlockId)) {
              skipCurrentBlock = true;
              continue;
            }
            
            // v2.2.0: Supprimer les FAM orphelines
            if (trimmed.includes('FAM') && familiesToRemove.has(currentBlockId)) {
              skipCurrentBlock = true;
              continue;
            }
            
            if (trimmed.includes('INDI') && mergedPersons.has(currentBlockId)) {
              const merged = mergedPersons.get(currentBlockId);
              const mergedLines = generateMergedIndiLines(merged, familiesToRemove);
              mergedLines.forEach(ml => outputLines.push(ml));
              inMergedIndi = true;
              continue;
            }
            
            if (trimmed.includes('FAM')) {
              famChildrenSeen.set(currentBlockId, new Set());
            }
          }
        }
      }
      
      if (skipCurrentBlock || inMergedIndi) continue;
      
      let processedLine = line;
      mergeMap.forEach((targetId, sourceId) => {
        processedLine = processedLine.replace(new RegExp('@' + sourceId + '@', 'g'), '@' + targetId + '@');
      });
      
      const trimmedProcessed = processedLine.trim().replace(/\r/g, '');
      
      // v2.2.4: Supprimer les lignes FAMS/FAMC qui pointent vers des familles supprimées
      if ((trimmedProcessed.includes('FAMS') || trimmedProcessed.includes('FAMC')) && !trimmedProcessed.startsWith('0 ')) {
        const famMatch = trimmedProcessed.match(/@([^@]+)@/);
        if (famMatch && familiesToRemove.has(famMatch[1])) {
          continue; // Sauter cette ligne - référence vers famille supprimée
        }
      }
      
      // v2.2.4: Supprimer les lignes HUSB/WIFE/CHIL UNIQUEMENT pour les suppressions manuelles
      // (personnes dans idsToRemove mais PAS dans mergeMap = pas de cible de fusion)
      if ((trimmedProcessed.includes('HUSB') || trimmedProcessed.includes('WIFE') || trimmedProcessed.includes('CHIL')) && !trimmedProcessed.startsWith('0 ')) {
        const personMatch = trimmedProcessed.match(/@([^@]+)@/);
        if (personMatch) {
          const personId = personMatch[1];
          // Suppression manuelle = dans idsToRemove mais pas de cible dans mergeMap
          const isManualDeletion = idsToRemove.has(personId) && !mergeMap.has(personId);
          if (isManualDeletion) {
            continue; // Suppression manuelle, pas de cible de fusion
          }
        }
      }
      
      // Dédupliquer les CHIL dans les FAM
      if (trimmedProcessed.includes('CHIL') && currentBlockId && famChildrenSeen.has(currentBlockId)) {
        const childMatch = trimmedProcessed.match(/@([^@]+)@/);
        if (childMatch) {
          const childId = childMatch[1];
          const seen = famChildrenSeen.get(currentBlockId);
          if (seen.has(childId)) continue;
          seen.add(childId);
        }
      }
      
      outputLines.push(processedLine);
    }
    
    outputLines.push('0 TRLR');
    
    const blob = new Blob([outputLines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gedcom_fusionne_' + new Date().toISOString().slice(0,10) + '.ged';
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
    // v2.2.0: Réinitialiser les états de conflits
    setMergeConflicts([]); setShowConflictModal(false); setPendingMergePair(null);
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
              <p className="text-emerald-100 text-sm">v{VERSION} - {CHANGELOG[0].title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {step !== 'upload' && qualityReport && (
              <button onClick={() => setShowQualityReport(true)} className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Qualité</span>
                {(chronoIssues.errors.length > 0 || orphanRefs.filter(r => r.severity === 'error').length > 0) && (
                  <span className="px-1.5 py-0.5 bg-red-500 rounded-full text-xs">{chronoIssues.errors.length + orphanRefs.filter(r => r.severity === 'error').length}</span>
                )}
              </button>
            )}
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
              {progressMessage && <span className="text-sm text-emerald-600 font-medium">{progressMessage}</span>}
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
                  { id: 'guided', label: 'Fusion guidée', icon: '🎯', count: fusionOrder.reduce((sum, l) => sum + l.pairs.length, 0) },
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
                      <div className="flex gap-2">
                        <button onClick={autoSelectHighConfidenceClusters} className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Sélectionner ≥{clusterScoreFilter}%</button>
                        <button onClick={() => {
                          // v2.2.2: Désélectionner les clusters ET leurs paires associées
                          const clusterPairIds = new Set();
                          selectedClusters.forEach(idx => {
                            const cluster = clusters[idx];
                            if (cluster) {
                              duplicates.forEach(dup => {
                                if (cluster.ids.includes(dup.person1.id) && cluster.ids.includes(dup.person2.id)) {
                                  clusterPairIds.add(dup.id);
                                }
                              });
                            }
                          });
                          // Retirer seulement les paires des clusters (pas les doublons simples)
                          const newSelectedPairs = new Set([...selectedPairs].filter(id => !clusterPairIds.has(id)));
                          setSelectedPairs(newSelectedPairs);
                          setSelectedClusters(new Set());
                        }} className="px-3 py-1 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600">Désélectionner tout</button>
                      </div>
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
                                <button onClick={() => selectCluster(cluster.ids, idx)} className="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700">Sélectionner</button>
                              </div>
                            </div>
                            {expandedClusters.has(idx) && (
                              <div className="mt-3 pt-3 border-t">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-2 py-1 text-left font-medium text-gray-600">#</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-600">ID</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-600">Nom complet</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-600">Sexe</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-600">Naissance</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-600">Lieu naiss.</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-600">Décès</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-600">Lieu décès</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-600">Profession</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-600">Parents</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-600">Conjoints</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-600">Enfants</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {cluster.people.map((person, pIdx) => (
                                        <tr key={person.id} className={pIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                          <td className="px-2 py-1 text-gray-500">{pIdx + 1}</td>
                                          <td className="px-2 py-1 text-xs text-gray-400 font-mono">{person.id}</td>
                                          <td className="px-2 py-1 font-medium">{person.names[0] || '-'}</td>
                                          <td className="px-2 py-1">{person.sex === 'M' ? '♂' : person.sex === 'F' ? '♀' : '-'}</td>
                                          <td className="px-2 py-1">{person.birth || '-'}</td>
                                          <td className="px-2 py-1 text-xs">{person.birthPlace || '-'}</td>
                                          <td className="px-2 py-1">{person.death || '-'}</td>
                                          <td className="px-2 py-1 text-xs">{person.deathPlace || '-'}</td>
                                          <td className="px-2 py-1 text-xs">{person.occupation || '-'}</td>
                                          <td className="px-2 py-1 text-xs">{person.parents.length > 0 ? person.parents.map(p => getPersonName(p)).join(', ') : '-'}</td>
                                          <td className="px-2 py-1 text-xs">{person.spouses.length > 0 ? person.spouses.map(s => getPersonName(s)).join(', ') : '-'}</td>
                                          <td className="px-2 py-1 text-xs">{person.children?.length > 0 ? person.children.map(c => getPersonName(c)).join(', ') : '-'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                <div className="mt-2 pt-2 border-t text-xs text-gray-500 flex flex-wrap gap-3">
                                  <span>📊 Avec naissance: {cluster.people.filter(p => p.birth).length}/{cluster.size}</span>
                                  <span>📊 Avec décès: {cluster.people.filter(p => p.death).length}/{cluster.size}</span>
                                  <span>📊 Avec profession: {cluster.people.filter(p => p.occupation).length}/{cluster.size}</span>
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
                      <div className="flex gap-2">
                        <button onClick={selectHighConfidence} className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">Sélectionner ≥{filterScore}%</button>
                        <button onClick={() => {
                          // v2.2.2: Désélectionner seulement les doublons simples (pas les paires des clusters)
                          const clusterPairIds = new Set();
                          clusters.forEach(cluster => {
                            duplicates.forEach(dup => {
                              if (cluster.ids.includes(dup.person1.id) && cluster.ids.includes(dup.person2.id)) {
                                clusterPairIds.add(dup.id);
                              }
                            });
                          });
                          // Garder seulement les paires des clusters
                          const newSelectedPairs = new Set([...selectedPairs].filter(id => clusterPairIds.has(id)));
                          setSelectedPairs(newSelectedPairs);
                        }} className="px-3 py-1 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600">Désélectionner tout</button>
                      </div>
                    </div>
                    {getSimplePairs().length === 0 ? <p className="text-center text-gray-500 py-8">Aucun doublon simple trouvé</p> : (
                      <div className="space-y-2">
                        {getSimplePairs().slice(0, 50).map((pair) => {
                          const suspicion = getSuspicionLevel(pair.similarity, pair.sufficientCriteria?.length || 0);
                          return (
                          <div key={pair.id} className={`border rounded-lg p-3 ${selectedPairs.has(pair.id) ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium">{pair.person1.names[0] || pair.person1.id}</div>
                                <div className="text-sm text-gray-500">↔ {pair.person2.names[0] || pair.person2.id}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-sm font-medium ${suspicion.level === 'FORT' ? 'bg-red-100 text-red-800' : suspicion.level === 'MOYEN' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{suspicion.emoji} {pair.similarity}%</span>
                                <button onClick={() => openPreview(pair)} className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">Prévisualiser</button>
                                <button onClick={() => togglePairSelection(pair.id)} className={`px-2 py-1 text-sm rounded ${selectedPairs.has(pair.id) ? 'bg-emerald-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{selectedPairs.has(pair.id) ? '✓' : 'Sélectionner'}</button>
                              </div>
                            </div>
                            {pair.sufficientCriteria && pair.sufficientCriteria.length > 0 && <div className="mt-2 text-xs text-emerald-600">Critères validants: {pair.sufficientCriteria.join(', ')}</div>}
                          </div>
                        );})}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'guided' && (
                  <div>
                    {/* En-tête avec statistiques */}
                    <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <GitBranch className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-semibold text-emerald-800">Fusion par étapes (Bottom-Up)</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Fusionnez dans l'ordre optimal : <strong>enfants → conjoints → parents</strong> pour garantir que les relations familiales pointent vers les personnes les plus complètes.
                      </p>
                      {fusionOrder.length > 0 && (
                        <div className="flex gap-4 text-sm">
                          <span className="px-2 py-1 bg-white rounded">📊 {fusionOrder.reduce((sum, l) => sum + l.pairs.length, 0)} paires</span>
                          <span className="px-2 py-1 bg-white rounded">✅ {completedLevels.size}/{fusionOrder.length} niveaux</span>
                          <span className="px-2 py-1 bg-white rounded">🔗 {fusionGraph ? fusionGraph.size : 0} dépendances</span>
                        </div>
                      )}
                    </div>

                    {/* Bouton pour calculer l'ordre de fusion */}
                    {fusionOrder.length === 0 && duplicates.length > 0 && (
                      <div className="text-center py-8">
                        <button 
                          onClick={() => {
                            const graph = buildDependencyGraph(duplicates, individuals);
                            setFusionGraph(graph);
                            const order = calculateFusionOrder(graph);
                            setFusionOrder(order);
                            setCompletedLevels(new Set());
                            setSelectedGuidedPairs(new Set());
                          }}
                          className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 mx-auto"
                        >
                          <GitBranch className="w-5 h-5" />
                          Analyser les dépendances ({duplicates.length} paires)
                        </button>
                        <p className="text-sm text-gray-500 mt-2">Calcule l'ordre optimal de fusion basé sur les relations familiales</p>
                      </div>
                    )}

                    {fusionOrder.length === 0 && duplicates.length === 0 && (
                      <p className="text-center text-gray-500 py-8">Aucun doublon détecté. Chargez un fichier GEDCOM pour commencer.</p>
                    )}

                    {/* Affichage des niveaux de fusion */}
                    {fusionOrder.length > 0 && (
                      <div className="space-y-4">
                        {fusionOrder.map((levelData, levelIdx) => {
                          const isCompleted = completedLevels.has(levelIdx);
                          const canFuse = canFuseLevel(levelIdx, completedLevels);
                          const levelInfo = FUSION_LEVELS[levelIdx] || { label: `Niveau ${levelIdx}`, description: '' };
                          const pairsForDisplay = prepareLevelForDisplay(levelData.pairs, duplicates, individuals);
                          
                          return (
                            <div key={levelIdx} className={`border rounded-lg overflow-hidden ${isCompleted ? 'border-green-300 bg-green-50' : canFuse ? 'border-emerald-300 bg-white' : 'border-gray-200 bg-gray-50 opacity-75'}`}>
                              {/* En-tête du niveau */}
                              <div className={`px-4 py-3 flex items-center justify-between ${isCompleted ? 'bg-green-100' : canFuse ? 'bg-emerald-50' : 'bg-gray-100'}`}>
                                <div className="flex items-center gap-3">
                                  {isCompleted ? (
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                  ) : canFuse ? (
                                    <Unlock className="w-6 h-6 text-emerald-600" />
                                  ) : (
                                    <Lock className="w-6 h-6 text-gray-400" />
                                  )}
                                  <div>
                                    <div className="font-semibold">
                                      ÉTAPE {levelIdx + 1}/{fusionOrder.length} - {levelInfo.label}
                                    </div>
                                    <div className="text-sm text-gray-600">{levelInfo.description} • {levelData.pairs.length} fusion(s)</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isCompleted && <span className="px-2 py-1 bg-green-200 text-green-800 text-sm rounded">✓ Complété</span>}
                                  {!isCompleted && canFuse && (
                                    <span className="px-2 py-1 bg-emerald-200 text-emerald-800 text-sm rounded">Disponible</span>
                                  )}
                                  {!isCompleted && !canFuse && (
                                    <span className="px-2 py-1 bg-gray-200 text-gray-600 text-sm rounded">🔒 Bloqué</span>
                                  )}
                                </div>
                              </div>

                              {/* Contenu du niveau */}
                              {canFuse && !isCompleted && (
                                <div className="p-4">
                                  {/* Boutons d'action */}
                                  <div className="flex gap-2 mb-4">
                                    <button
                                      onClick={() => {
                                        const levelPairIds = new Set(levelData.pairs.map(p => p.id || `${p.person1.id}-${p.person2.id}`));
                                        setSelectedGuidedPairs(prev => {
                                          const newSet = new Set(prev);
                                          levelPairIds.forEach(id => newSet.add(id));
                                          return newSet;
                                        });
                                      }}
                                      className="px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700"
                                    >
                                      Tout sélectionner
                                    </button>
                                    <button
                                      onClick={() => {
                                        const levelPairIds = new Set(levelData.pairs.map(p => p.id || `${p.person1.id}-${p.person2.id}`));
                                        setSelectedGuidedPairs(prev => {
                                          const newSet = new Set(prev);
                                          levelPairIds.forEach(id => newSet.delete(id));
                                          return newSet;
                                        });
                                      }}
                                      className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                                    >
                                      Désélectionner
                                    </button>
                                    <button
                                      onClick={() => {
                                        // Fusionner les paires sélectionnées de ce niveau
                                        const levelPairIds = levelData.pairs.map(p => p.id || `${p.person1.id}-${p.person2.id}`);
                                        const toFuse = levelPairIds.filter(id => selectedGuidedPairs.has(id));
                                        if (toFuse.length > 0) {
                                          // Ajouter à selectedPairs pour utiliser handleMerge existant
                                          const newSelectedPairs = new Set(selectedPairs);
                                          toFuse.forEach(id => newSelectedPairs.add(id));
                                          setSelectedPairs(newSelectedPairs);
                                          // Marquer le niveau comme complété après fusion
                                          setCompletedLevels(prev => new Set([...prev, levelIdx]));
                                        }
                                      }}
                                      disabled={!levelData.pairs.some(p => selectedGuidedPairs.has(p.id || `${p.person1.id}-${p.person2.id}`))}
                                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      ▶ Fusionner sélectionnées
                                    </button>
                                    <button
                                      onClick={() => setCompletedLevels(prev => new Set([...prev, levelIdx]))}
                                      className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                                    >
                                      Passer cette étape
                                    </button>
                                  </div>

                                  {/* Liste des paires */}
                                  <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {pairsForDisplay.map((pairInfo, pairIdx) => {
                                      const pairId = pairInfo.pair.id || `${pairInfo.pair.person1.id}-${pairInfo.pair.person2.id}`;
                                      const isSelected = selectedGuidedPairs.has(pairId);
                                      const quality1 = calculateEnrichedQuality(pairInfo.pair.person1, individuals);
                                      const quality2 = calculateEnrichedQuality(pairInfo.pair.person2, individuals);
                                      const keepPerson = quality1 >= quality2 ? pairInfo.pair.person1 : pairInfo.pair.person2;
                                      const mergePerson = quality1 >= quality2 ? pairInfo.pair.person2 : pairInfo.pair.person1;
                                      const keepQuality = Math.max(quality1, quality2);
                                      const mergeQuality = Math.min(quality1, quality2);
                                      const qualityDiff = keepQuality - mergeQuality;

                                      return (
                                        <div 
                                          key={pairIdx}
                                          className={`p-3 rounded-lg border ${isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'}`}
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-sm font-medium ${pairInfo.pair.similarity >= 90 ? 'bg-green-100 text-green-800' : pairInfo.pair.similarity >= 80 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                  {pairInfo.pair.similarity}%
                                                </span>
                                                <span className="font-medium">{keepPerson.names?.[0] || keepPerson.id}</span>
                                              </div>
                                              <div className="text-sm text-gray-600 mt-1">
                                                <span className="text-green-600">✓ {keepPerson.id}</span> (qualité: {keepQuality})
                                                <span className="mx-2">←</span>
                                                <span className="text-gray-500">{mergePerson.id}</span> (qualité: {mergeQuality})
                                                {qualityDiff > 20 && <span className="ml-2 text-green-600">⚡ Choix clair (+{qualityDiff})</span>}
                                                {qualityDiff <= 10 && <span className="ml-2 text-yellow-600">⚠️ Qualités proches</span>}
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <button 
                                                onClick={() => openPreview(pairInfo.pair)} 
                                                className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                                              >
                                                Voir
                                              </button>
                                              <button
                                                onClick={() => {
                                                  setSelectedGuidedPairs(prev => {
                                                    const newSet = new Set(prev);
                                                    if (newSet.has(pairId)) {
                                                      newSet.delete(pairId);
                                                    } else {
                                                      newSet.add(pairId);
                                                    }
                                                    return newSet;
                                                  });
                                                }}
                                                className={`px-3 py-1 text-sm rounded ${isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                                              >
                                                {isSelected ? '✓' : 'Sélectionner'}
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Message pour niveau bloqué */}
                              {!canFuse && !isCompleted && (
                                <div className="p-4 text-center text-gray-500">
                                  <Lock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                  <p>Complétez d'abord l'étape {levelIdx} pour débloquer</p>
                                </div>
                              )}

                              {/* Message pour niveau complété */}
                              {isCompleted && (
                                <div className="p-4 text-center text-green-600">
                                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                                  <p>Étape complétée !</p>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Actions finales */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Progression: {completedLevels.size}/{fusionOrder.length} étapes</p>
                              <p className="text-sm text-gray-600">
                                {completedLevels.size === fusionOrder.length 
                                  ? '🎉 Toutes les étapes sont complétées !' 
                                  : 'Continuez les fusions étape par étape'}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setFusionOrder([]);
                                  setFusionGraph(null);
                                  setCompletedLevels(new Set());
                                  setSelectedGuidedPairs(new Set());
                                }}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                              >
                                Réinitialiser
                              </button>
                              {selectedPairs.size > 0 && (
                                <button
                                  onClick={handleMerge}
                                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  Exécuter {selectedPairs.size} fusion(s)
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
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
                      <div className="space-y-2 max-h-[500px] overflow-y-auto">
                        {toDeletePersons.map((person) => (
                          <div key={person.id} className={`border rounded-lg p-3 ${selectedToDelete.has(person.id) ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium">{person.names[0] || '[Sans nom]'}</div>
                                <div className="text-xs text-gray-500 font-mono">{person.id}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded ${person.reason === 'Isolé + Sans identité' ? 'bg-purple-100 text-purple-800' : person.reason === 'Totalement isolé' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>{person.reason}</span>
                                <button onClick={() => { const newSelected = new Set(selectedToDelete); if (newSelected.has(person.id)) newSelected.delete(person.id); else newSelected.add(person.id); setSelectedToDelete(newSelected); }} className={`px-2 py-1 text-sm rounded ${selectedToDelete.has(person.id) ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{selectedToDelete.has(person.id) ? '✓' : 'Sélectionner'}</button>
                              </div>
                            </div>
                            
                            {/* Détails de la personne */}
                            <div className="mt-2 pt-2 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                              <div>
                                <span className="text-gray-500">Sexe:</span>
                                <span className="ml-1 font-medium">{person.sex === 'M' ? '♂ Homme' : person.sex === 'F' ? '♀ Femme' : '? Inconnu'}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Naissance:</span>
                                <span className="ml-1 font-medium">{person.birth || '-'}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Décès:</span>
                                <span className="ml-1 font-medium">{person.death || '-'}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Profession:</span>
                                <span className="ml-1 font-medium">{person.occupation || '-'}</span>
                              </div>
                            </div>
                            
                            {/* Relations - Avertissements */}
                            <div className="mt-2 pt-2 border-t border-gray-100 space-y-1 text-xs">
                              {/* Parents */}
                              <div className={`flex items-start gap-1 ${person.hasParents ? 'text-amber-700 bg-amber-50 p-1 rounded' : 'text-gray-400'}`}>
                                <span className="font-medium min-w-[70px]">👨‍👩 Parents:</span>
                                {person.hasParents ? (
                                  <span className="flex-1">
                                    <span className="font-medium">⚠️ </span>
                                    {person.parentIds.map(pid => getPersonName(pid)).join(', ')}
                                  </span>
                                ) : (
                                  <span>Aucun</span>
                                )}
                              </div>
                              
                              {/* Conjoints */}
                              <div className={`flex items-start gap-1 ${person.hasSpouses ? 'text-amber-700 bg-amber-50 p-1 rounded' : 'text-gray-400'}`}>
                                <span className="font-medium min-w-[70px]">💑 Conjoints:</span>
                                {person.hasSpouses ? (
                                  <span className="flex-1">
                                    <span className="font-medium">⚠️ </span>
                                    {person.spouseIds.map(sid => getPersonName(sid)).join(', ')}
                                  </span>
                                ) : (
                                  <span>Aucun</span>
                                )}
                              </div>
                              
                              {/* Enfants */}
                              <div className={`flex items-start gap-1 ${person.hasChildren ? 'text-amber-700 bg-amber-50 p-1 rounded' : 'text-gray-400'}`}>
                                <span className="font-medium min-w-[70px]">👶 Enfants:</span>
                                {person.hasChildren ? (
                                  <span className="flex-1">
                                    <span className="font-medium">⚠️ </span>
                                    {person.childrenIds.map(cid => getPersonName(cid)).join(', ')}
                                  </span>
                                ) : (
                                  <span>Aucun</span>
                                )}
                              </div>
                            </div>
                            
                            {/* Message d'avertissement si relations */}
                            {(person.hasParents || person.hasSpouses || person.hasChildren) && (
                              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                                ⚠️ <strong>Attention:</strong> Cette personne a des relations familiales. La supprimer créera des références orphelines.
                              </div>
                            )}
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
                {/* Affichage pour fusion/suppression */}
                {(validationResults.mergedCount > 0 || validationResults.deletedCount > 0) && (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div><div className="text-2xl font-bold text-gray-800">{validationResults.totalIndividuals}</div><div className="text-sm text-gray-500">Avant</div></div>
                    <div><div className="text-2xl font-bold text-red-600">-{validationResults.mergedCount + validationResults.deletedCount}</div><div className="text-sm text-gray-500">{validationResults.mergedCount > 0 && validationResults.deletedCount > 0 ? 'Fusionnés + Supprimés' : validationResults.mergedCount > 0 ? 'Fusionnés' : 'Supprimés'}</div></div>
                    <div><div className="text-2xl font-bold text-emerald-600">{validationResults.remainingCount}</div><div className="text-sm text-gray-500">Après</div></div>
                  </div>
                )}
                {/* Affichage pour normalisation des lieux */}
                {validationResults.normalizedPlaces > 0 && (
                  <div className={`${(validationResults.mergedCount > 0 || validationResults.deletedCount > 0) ? 'mt-4 pt-4 border-t' : ''}`}>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div><div className="text-2xl font-bold text-blue-600">{validationResults.normalizedGroups}</div><div className="text-sm text-gray-500">Groupes normalisés</div></div>
                      <div><div className="text-2xl font-bold text-emerald-600">{validationResults.normalizedPlaces}</div><div className="text-sm text-gray-500">Lieux corrigés</div></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    // Choisir la bonne fonction selon le type de traitement
                    if (validationResults.normalizedPlaces > 0 && validationResults.mergedCount === 0 && validationResults.deletedCount === 0) {
                      downloadNormalizedFile();
                    } else {
                      downloadCleanedFile();
                    }
                  }} 
                  className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Télécharger le fichier {validationResults.normalizedPlaces > 0 && validationResults.mergedCount === 0 ? 'normalisé' : 'nettoyé'}
                </button>
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

      {/* Modal Résolution des Conflits v2.2.0 */}
      {showConflictModal && mergeConflicts.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
            <div className="sticky top-0 px-6 py-4 bg-orange-600 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <AlertCircle className="w-6 h-6" />
                  {mergeConflicts.length} CONFLIT{mergeConflicts.length > 1 ? 'S' : ''} DÉTECTÉ{mergeConflicts.length > 1 ? 'S' : ''}
                </h2>
                <button onClick={() => { setShowConflictModal(false); setMergeConflicts([]); }} className="p-2 hover:bg-white/20 rounded-lg">✕</button>
              </div>
              <p className="text-orange-100 text-sm mt-1">Choisissez les valeurs à conserver pour chaque conflit</p>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[55vh] space-y-6">
              {mergeConflicts.map((conflict, idx) => (
                <div key={idx} className={`border-2 rounded-xl p-4 ${conflict.resolved ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800">
                      Conflit {idx + 1}/{mergeConflicts.length} : {conflict.label}
                    </h3>
                    {conflict.resolved && <span className="text-green-600 text-sm font-medium">✓ Résolu</span>}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {conflict.person1Name} ({conflict.person1Id}) ↔ {conflict.person2Name} ({conflict.person2Id})
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <button
                      onClick={() => resolveConflict(idx, conflict.rawValue1 || conflict.value1, 'person1')}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        conflict.chosenSource === 'person1' 
                          ? 'border-emerald-500 bg-emerald-100 ring-2 ring-emerald-300' 
                          : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-4 h-4 rounded-full border-2 ${conflict.chosenSource === 'person1' ? 'bg-emerald-500 border-emerald-500' : 'border-gray-400'}`}>
                          {conflict.chosenSource === 'person1' && <div className="w-full h-full flex items-center justify-center text-white text-xs">✓</div>}
                        </div>
                        <span className="text-sm font-medium text-gray-600">Personne 1</span>
                      </div>
                      <p className="font-semibold text-gray-800 break-words">{conflict.value1}</p>
                    </button>
                    
                    <button
                      onClick={() => resolveConflict(idx, conflict.rawValue2 || conflict.value2, 'person2')}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        conflict.chosenSource === 'person2' 
                          ? 'border-emerald-500 bg-emerald-100 ring-2 ring-emerald-300' 
                          : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-4 h-4 rounded-full border-2 ${conflict.chosenSource === 'person2' ? 'bg-emerald-500 border-emerald-500' : 'border-gray-400'}`}>
                          {conflict.chosenSource === 'person2' && <div className="w-full h-full flex items-center justify-center text-white text-xs">✓</div>}
                        </div>
                        <span className="text-sm font-medium text-gray-600">Personne 2</span>
                      </div>
                      <p className="font-semibold text-gray-800 break-words">{conflict.value2}</p>
                    </button>
                  </div>
                  
                  {/* Option fusionner pour parents/conjoints/enfants */}
                  {(conflict.type === 'parents' || conflict.type === 'spouses' || conflict.type === 'children') && (
                    <button
                      onClick={() => {
                        const merged = [...new Set([...(conflict.rawValue1 || []), ...(conflict.rawValue2 || [])])];
                        resolveConflict(idx, merged, 'merged');
                      }}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all mb-3 ${
                        conflict.chosenSource === 'merged' 
                          ? 'border-blue-500 bg-blue-100 ring-2 ring-blue-300' 
                          : 'border-blue-200 bg-blue-50 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-4 h-4 rounded-full border-2 ${conflict.chosenSource === 'merged' ? 'bg-blue-500 border-blue-500' : 'border-blue-400'}`}>
                          {conflict.chosenSource === 'merged' && <div className="w-full h-full flex items-center justify-center text-white text-xs">✓</div>}
                        </div>
                        <span className="text-sm font-medium text-blue-700">🔀 Fusionner les deux (garder tous)</span>
                      </div>
                      <p className="text-sm text-blue-600">{conflict.value1} + {conflict.value2}</p>
                    </button>
                  )}
                  
                  {/* Saisie manuelle uniquement pour les types simples */}
                  {conflict.type !== 'parents' && conflict.type !== 'spouses' && conflict.type !== 'children' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Ou saisissez une valeur manuellement..."
                        className={`flex-1 px-3 py-2 border rounded-lg text-sm ${
                          conflict.chosenSource === 'manual' ? 'border-emerald-500 ring-2 ring-emerald-300' : 'border-gray-300'
                        }`}
                        onFocus={(e) => {
                          if (e.target.value) {
                            resolveConflict(idx, e.target.value, 'manual');
                          }
                        }}
                        onChange={(e) => {
                          if (e.target.value) {
                            resolveConflict(idx, e.target.value, 'manual');
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="sticky bottom-0 bg-gray-100 px-6 py-4 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Conflits résolus : <span className="font-bold">{mergeConflicts.filter(c => c.resolved).length}/{mergeConflicts.length}</span>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => { setShowConflictModal(false); setMergeConflicts([]); }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleApplyConflictResolutions}
                    disabled={!allConflictsResolved()}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                      allConflictsResolved() 
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Appliquer et fusionner
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Normalisation des Lieux v2.2.6 */}
      {showPlaceNormModal && placeVariants.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="sticky top-0 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  📍 Normalisation des Lieux
                </h2>
                <button onClick={() => setShowPlaceNormModal(false)} className="p-2 hover:bg-white/20 rounded-lg">✕</button>
              </div>
              <p className="text-blue-100 text-sm mt-1">
                Sélectionnez la forme correcte pour chaque groupe de variantes
              </p>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800 flex items-start gap-3">
                <div className="flex-1">
                  <p><strong>💡 Astuce :</strong> Chaque groupe contient des variantes d'un même lieu.</p>
                  <p className="mt-1">🌍 Cliquez sur <strong>"Rechercher officiels"</strong> pour obtenir les noms officiels depuis l'API Géo du gouvernement français.</p>
                </div>
                <button
                  onClick={searchAllPlacesApi}
                  className="px-3 py-2 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 flex items-center gap-1 whitespace-nowrap"
                >
                  🌍 Rechercher officiels
                </button>
              </div>
              
              <div className="space-y-4">
                {placeVariants.map((group, idx) => (
                  <div key={idx} className={`border-2 rounded-xl p-4 transition-all ${
                    placeNormSelections[idx] ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">Groupe {idx + 1}/{placeVariants.length}</span>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">{group.occurrences} occ.</span>
                        {!placeApiSuggestions[idx] && (
                          <button
                            onClick={() => searchPlaceApi(group.variants[0], idx)}
                            disabled={loadingPlaceSuggestion[idx]}
                            className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                          >
                            {loadingPlaceSuggestion[idx] ? '⏳' : '🔍 Rechercher'}
                          </button>
                        )}
                      </div>
                      {placeNormSelections[idx] && (
                        <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-lg">
                          <span className="text-green-600 text-sm font-medium">✓</span>
                          <span className="text-sm text-green-800 font-medium max-w-md" title={placeNormSelections[idx]}>
                            {placeNormSelections[idx]}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Suggestions officielles de l'API Géo */}
                    {placeApiSuggestions[idx] && placeApiSuggestions[idx].length > 0 && (
                      <div className="mb-3 p-2 bg-indigo-50 rounded-lg border border-indigo-200">
                        <p className="text-xs text-indigo-700 font-medium mb-2">🏛️ Suggestions officielles (API Géo) :</p>
                        <div className="flex flex-wrap gap-1">
                          {placeApiSuggestions[idx].slice(0, 3).map((suggestion, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => setPlaceNormSelections(prev => ({ ...prev, [idx]: suggestion.full }))}
                              className={`px-2 py-1 rounded text-xs transition-all ${
                                placeNormSelections[idx] === suggestion.full
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-100'
                              }`}
                              title={`${suggestion.full}`}
                            >
                              🏛️ {suggestion.medium}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {placeApiSuggestions[idx] === null && (
                      <p className="text-xs text-orange-600 mb-2">⚠️ Lieu non trouvé dans l'API Géo</p>
                    )}
                    
                    {loadingPlaceSuggestion[idx] && (
                      <p className="text-xs text-indigo-600 mb-2">⏳ Recherche en cours...</p>
                    )}
                    
                    <p className="text-xs text-gray-500 mb-2">Variantes détectées :</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {group.variants.map((variant, vIdx) => (
                        <button
                          key={vIdx}
                          onClick={() => setPlaceNormSelections(prev => ({ ...prev, [idx]: variant }))}
                          className={`p-2 rounded-lg border-2 text-left text-sm transition-all ${
                            placeNormSelections[idx] === variant
                              ? 'border-green-500 bg-green-100 ring-2 ring-green-300'
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                              placeNormSelections[idx] === variant 
                                ? 'bg-green-500 border-green-500' 
                                : 'border-gray-400'
                            }`}>
                              {placeNormSelections[idx] === variant && (
                                <div className="w-full h-full flex items-center justify-center text-white text-xs">✓</div>
                              )}
                            </div>
                            <span className="break-words">{variant}</span>
                          </div>
                        </button>
                      ))}
                      
                      {/* Option suggestion automatique */}
                      {!group.variants.includes(group.suggested) && (
                        <button
                          onClick={() => setPlaceNormSelections(prev => ({ ...prev, [idx]: group.suggested }))}
                          className={`p-2 rounded-lg border-2 text-left text-sm transition-all ${
                            placeNormSelections[idx] === group.suggested
                              ? 'border-green-500 bg-green-100 ring-2 ring-green-300'
                              : 'border-blue-200 bg-blue-50 hover:border-blue-400'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                              placeNormSelections[idx] === group.suggested 
                                ? 'bg-green-500 border-green-500' 
                                : 'border-blue-400'
                            }`}>
                              {placeNormSelections[idx] === group.suggested && (
                                <div className="w-full h-full flex items-center justify-center text-white text-xs">✓</div>
                              )}
                            </div>
                            <span className="break-words text-blue-700">✨ {group.suggested}</span>
                          </div>
                        </button>
                      )}
                    </div>
                    
                    {/* Saisie manuelle avec autocomplétion */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">✏️ Ou saisir un lieu manuellement :</p>
                      <div className="relative">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={placeManualInput[idx] || ''}
                            onChange={(e) => searchManualPlace(e.target.value, idx)}
                            placeholder="Tapez un nom de commune..."
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            onClick={() => validateManualInput(idx)}
                            disabled={!placeManualInput[idx] || placeManualInput[idx].trim().length === 0}
                            className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            title="Valider cette saisie (sans API)"
                          >
                            ✓
                          </button>
                        </div>
                        
                        {/* Suggestions d'autocomplétion */}
                        {placeManualSuggestions[idx] && placeManualSuggestions[idx].length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {placeManualSuggestions[idx].map((suggestion, sIdx) => (
                              <button
                                key={sIdx}
                                onClick={() => selectManualSuggestion(suggestion, idx)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 border-b border-gray-100 last:border-0 flex items-center gap-2"
                              >
                                <span className="text-indigo-600">🏛️</span>
                                <span className="flex-1">{suggestion.full}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-gray-100 px-6 py-4 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Groupes sélectionnés : <span className="font-bold">{Object.keys(placeNormSelections).length}/{placeVariants.length}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      // Sélectionner les suggestions API si disponibles, sinon les suggestions auto
                      const autoSelections = {};
                      placeVariants.forEach((group, idx) => {
                        if (placeApiSuggestions[idx]?.[0]?.full) {
                          autoSelections[idx] = placeApiSuggestions[idx][0].full;
                        } else {
                          autoSelections[idx] = group.suggested;
                        }
                      });
                      setPlaceNormSelections(autoSelections);
                    }}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    ✨ Tout suggérer
                  </button>
                  <button 
                    onClick={() => setShowPlaceNormModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={() => applyPlaceNormalizations(placeNormSelections)}
                    disabled={Object.keys(placeNormSelections).length === 0}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                      Object.keys(placeNormSelections).length > 0
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Appliquer ({Object.keys(placeNormSelections).length})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rapport Qualité v2.1.0 */}
      {showQualityReport && qualityReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">📊 Rapport Qualité GEDCOM</h2>
                <button onClick={() => setShowQualityReport(false)} className="p-2 hover:bg-white/20 rounded-lg">✕</button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Infos fichier */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">📁 Informations fichier</h3>
                  <p className="text-sm"><span className="font-medium">Version GEDCOM:</span> {qualityReport.gedcomVersion}</p>
                  <p className="text-sm"><span className="font-medium">Encodage:</span> {qualityReport.encoding}</p>
                  {qualityReport.customTags.length > 0 && (
                    <p className="text-sm"><span className="font-medium">Tags custom:</span> {qualityReport.customTags.slice(0, 5).join(', ')}{qualityReport.customTags.length > 5 ? '...' : ''}</p>
                  )}
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-700 mb-2">📈 Statistiques</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="font-medium">Individus:</span> {qualityReport.stats.individuals.toLocaleString()}</p>
                    <p><span className="font-medium">Familles:</span> {qualityReport.stats.families.toLocaleString()}</p>
                    <p><span className="font-medium">Sources:</span> {qualityReport.stats.sources.toLocaleString()}</p>
                    <p><span className="font-medium">Notes:</span> {qualityReport.stats.notes.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              {/* Complétude */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">📉 Complétude des données</h3>
                <div className="space-y-2">
                  {/* Barres avec classes Tailwind statiques (évite la purge) */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm w-36">Avec date naissance</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all" style={{ width: `${qualityReport.completeness.withBirth.pct}%` }}></div>
                    </div>
                    <span className="text-sm font-medium w-24 text-right">{qualityReport.completeness.withBirth.pct}% ({qualityReport.completeness.withBirth.count.toLocaleString()})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm w-36">Avec lieu naissance</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all" style={{ width: `${qualityReport.completeness.withBirthPlace.pct}%` }}></div>
                    </div>
                    <span className="text-sm font-medium w-24 text-right">{qualityReport.completeness.withBirthPlace.pct}% ({qualityReport.completeness.withBirthPlace.count.toLocaleString()})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm w-36">Avec date décès</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div className="h-full bg-purple-500 transition-all" style={{ width: `${qualityReport.completeness.withDeath.pct}%` }}></div>
                    </div>
                    <span className="text-sm font-medium w-24 text-right">{qualityReport.completeness.withDeath.pct}% ({qualityReport.completeness.withDeath.count.toLocaleString()})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm w-36">Avec parent(s)</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div className="h-full bg-orange-500 transition-all" style={{ width: `${qualityReport.completeness.withParent.pct}%` }}></div>
                    </div>
                    <span className="text-sm font-medium w-24 text-right">{qualityReport.completeness.withParent.pct}% ({qualityReport.completeness.withParent.count.toLocaleString()})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm w-36">Avec conjoint(s)</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div className="h-full bg-pink-500 transition-all" style={{ width: `${qualityReport.completeness.withSpouse.pct}%` }}></div>
                    </div>
                    <span className="text-sm font-medium w-24 text-right">{qualityReport.completeness.withSpouse.pct}% ({qualityReport.completeness.withSpouse.count.toLocaleString()})</span>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">⚠️ <strong>{qualityReport.completeness.isolated.count.toLocaleString()}</strong> individus isolés ({qualityReport.completeness.isolated.pct}%) - sans famille liée</p>
                </div>
              </div>
              
              {/* Incohérences chronologiques */}
              {(chronoIssues.errors.length > 0 || chronoIssues.warnings.length > 0) && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-3">⏱️ Incohérences chronologiques</h3>
                  {chronoIssues.errors.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-red-600 mb-2">❌ {chronoIssues.errors.length} erreur(s) critique(s)</p>
                      <div className="bg-red-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                        {chronoIssues.errors.slice(0, 10).map((err, idx) => (
                          <p key={idx} className="text-xs text-red-700 mb-1">{err.message}</p>
                        ))}
                        {chronoIssues.errors.length > 10 && <p className="text-xs text-red-500 italic">... et {chronoIssues.errors.length - 10} autres</p>}
                      </div>
                    </div>
                  )}
                  {chronoIssues.warnings.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-yellow-600 mb-2">⚠️ {chronoIssues.warnings.length} avertissement(s)</p>
                      <div className="bg-yellow-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                        {chronoIssues.warnings.slice(0, 10).map((warn, idx) => (
                          <p key={idx} className="text-xs text-yellow-700 mb-1">{warn.message}</p>
                        ))}
                        {chronoIssues.warnings.length > 10 && <p className="text-xs text-yellow-500 italic">... et {chronoIssues.warnings.length - 10} autres</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Variantes de lieux */}
              {placeVariants.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-700">📍 Lieux à normaliser ({placeVariants.length} groupes)</h3>
                    <div className="flex gap-2">
                      {hasPlaceNormalizations && (
                        <button
                          onClick={() => downloadNormalizedFile()}
                          className="px-3 py-1 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700"
                        >
                          💾 Télécharger
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setPlaceNormSelections({});
                          setPlaceApiSuggestions({});
                          setShowQualityReport(false); // Fermer le modal qualité
                          setShowPlaceNormModal(true);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                      >
                        🔧 Normaliser
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                    {placeVariants.slice(0, 8).map((group, idx) => (
                      <div key={idx} className="text-xs mb-2 pb-2 border-b last:border-0">
                        <p className="font-medium text-gray-700">✓ "{group.suggested}"</p>
                        <p className="text-gray-500 ml-4">← {group.variants.join(' | ')} ({group.occurrences} occ.)</p>
                      </div>
                    ))}
                    {placeVariants.length > 8 && <p className="text-xs text-gray-500 italic">... et {placeVariants.length - 8} autres groupes</p>}
                  </div>
                </div>
              )}
              
              {/* Message succès normalisation + téléchargement */}
              {placeVariants.length === 0 && hasPlaceNormalizations && (
                <div className="mb-6">
                  <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div>
                      <h3 className="font-semibold text-emerald-700">✅ Lieux normalisés</h3>
                      <p className="text-sm text-emerald-600">Tous les lieux ont été normalisés avec succès</p>
                    </div>
                    <button
                      onClick={() => downloadNormalizedFile()}
                      className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                    >
                      💾 Télécharger le fichier
                    </button>
                  </div>
                </div>
              )}
              
              {/* Références orphelines */}
              {orphanRefs.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-3">🔗 Références orphelines ({orphanRefs.length})</h3>
                  <div className="bg-orange-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                    {orphanRefs.filter(r => r.severity === 'error').slice(0, 5).map((ref, idx) => (
                      <p key={idx} className="text-xs text-orange-700 mb-1">❌ {ref.message}</p>
                    ))}
                    {orphanRefs.filter(r => r.severity === 'info').slice(0, 3).map((ref, idx) => (
                      <p key={`info-${idx}`} className="text-xs text-orange-600 mb-1">ℹ️ {ref.message}</p>
                    ))}
                    {orphanRefs.length > 8 && <p className="text-xs text-orange-500 italic">... et {orphanRefs.length - 8} autres</p>}
                  </div>
                </div>
              )}
              
              {/* Statistiques généalogiques */}
              {genealogyStats && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-3">🌳 Statistiques généalogiques</h3>
                  
                  {/* Ligne 1: Démographie + Période */}
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-indigo-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-indigo-700 mb-2">👥 Répartition par sexe</p>
                      <p className="text-sm">♂ Hommes: <strong>{genealogyStats.gender.males.toLocaleString()}</strong> ({Math.round(genealogyStats.gender.males / genealogyStats.gender.total * 100)}%)</p>
                      <p className="text-sm">♀ Femmes: <strong>{genealogyStats.gender.females.toLocaleString()}</strong> ({Math.round(genealogyStats.gender.females / genealogyStats.gender.total * 100)}%)</p>
                      {genealogyStats.gender.unknown > 0 && <p className="text-sm text-gray-500">? Inconnu: {genealogyStats.gender.unknown.toLocaleString()}</p>}
                    </div>
                    <div className="bg-teal-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-teal-700 mb-2">📅 Période couverte</p>
                      <p className="text-sm"><strong>{genealogyStats.period.min || '?'} - {genealogyStats.period.max || '?'}</strong></p>
                      {genealogyStats.period.span && <p className="text-sm text-teal-600">{genealogyStats.period.span} ans d'histoire</p>}
                      {genealogyStats.period.estimatedGenerations && <p className="text-sm text-teal-600">~{genealogyStats.period.estimatedGenerations} générations</p>}
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-amber-700 mb-2">📊 Qualité des dates</p>
                      <p className="text-sm">Complètes (JJ/MM/AAAA): <strong>{genealogyStats.dates.fullPct}%</strong></p>
                      <p className="text-sm text-amber-600">Partielles: {genealogyStats.dates.partial.toLocaleString()}</p>
                      <p className="text-sm text-amber-600">Absentes: {genealogyStats.dates.none.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {/* Ligne 2: Familles + Âges */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-purple-700 mb-2">👨‍👩‍👧‍👦 Familles ({genealogyStats.families.total.toLocaleString()})</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p>Avec enfants: <strong>{genealogyStats.families.withChildren}</strong></p>
                          <p>Sans enfant: {genealogyStats.families.withoutChildren}</p>
                          <p>Moy. enfants: <strong>{genealogyStats.families.avgChildren}</strong></p>
                        </div>
                        <div>
                          <p>Total enfants: {genealogyStats.families.totalChildren?.toLocaleString()}</p>
                          <p>Max enfants: <strong>{genealogyStats.families.maxChildren}</strong></p>
                          {genealogyStats.multipleMarriages > 0 && <p className="text-purple-600">Remariages: {genealogyStats.multipleMarriages}</p>}
                        </div>
                      </div>
                    </div>
                    {genealogyStats.ages && genealogyStats.ages.count > 0 && (
                      <div className="bg-rose-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-rose-700 mb-2">⏱️ Âge au décès ({genealogyStats.ages.count.toLocaleString()} calculés)</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p>Moyenne: <strong>{genealogyStats.ages.avg} ans</strong></p>
                            <p>Médiane: {genealogyStats.ages.median} ans</p>
                          </div>
                          <div>
                            <p>Min: {genealogyStats.ages.min} ans</p>
                            <p>Max: {genealogyStats.ages.max} ans</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Ligne 3: Top patronymes + prénoms */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {genealogyStats.topSurnames.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-700 mb-2">👤 Top 10 patronymes ({genealogyStats.uniqueSurnames} uniques)</p>
                        <div className="flex flex-wrap gap-1">
                          {genealogyStats.topSurnames.map((s, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-white rounded border">{s.name} <strong>({s.count})</strong></span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-700 mb-2">✨ Top prénoms</p>
                      {genealogyStats.topMaleNames && genealogyStats.topMaleNames.length > 0 && (
                        <p className="text-sm mb-1">♂ {genealogyStats.topMaleNames.map(n => `${n.name} (${n.count})`).join(', ')}</p>
                      )}
                      {genealogyStats.topFemaleNames && genealogyStats.topFemaleNames.length > 0 && (
                        <p className="text-sm">♀ {genealogyStats.topFemaleNames.map(n => `${n.name} (${n.count})`).join(', ')}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Ligne 4: Lieux + Professions */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {genealogyStats.topBirthPlaces && genealogyStats.topBirthPlaces.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-blue-700 mb-2">📍 Top lieux de naissance ({genealogyStats.uniquePlaces} uniques)</p>
                        <div className="flex flex-wrap gap-1">
                          {genealogyStats.topBirthPlaces.map((p, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-white rounded border">{p.place} <strong>({p.count})</strong></span>
                          ))}
                        </div>
                      </div>
                    )}
                    {genealogyStats.topOccupations && genealogyStats.topOccupations.length > 0 && (
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-green-700 mb-2">💼 Top professions</p>
                        <div className="flex flex-wrap gap-1">
                          {genealogyStats.topOccupations.map((o, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-white rounded border">{o.occupation} <strong>({o.count})</strong></span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Résumé doublons */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4">
                <h3 className="font-semibold text-emerald-700 mb-2">🔍 Doublons détectés</h3>
                <p className="text-lg font-bold text-emerald-600">{duplicates.length} paires de doublons probables</p>
                <p className="text-sm text-emerald-600">{clusters.length} clusters identifiés</p>
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex gap-3">
              <button onClick={() => setShowQualityReport(false)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Continuer vers l'analyse des doublons →
              </button>
            </div>
          </div>
        </div>
      )}

      {previewPair && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-emerald-600 text-white px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Prévisualisation de la fusion</h2>
                <button onClick={closePreview} className="p-2 hover:bg-white/20 rounded-lg">✕</button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-grow">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-2">{previewPair.person1.names[0] || previewPair.person1.id}</h3>
                  <div className="text-sm space-y-1 text-gray-600">
                    <p><span className="font-medium text-gray-700">ID:</span> <span className="font-mono">{previewPair.person1.id}</span></p>
                    <p><span className="font-medium text-gray-700">Sexe:</span> {previewPair.person1.sex === 'M' ? '♂ Masculin' : previewPair.person1.sex === 'F' ? '♀ Féminin' : 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Naissance:</span> {previewPair.person1.birth || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Lieu naissance:</span> {previewPair.person1.birthPlace || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Baptême:</span> {previewPair.person1.baptism || 'N/A'} {previewPair.person1.baptismPlace && `(${previewPair.person1.baptismPlace})`}</p>
                    <p><span className="font-medium text-gray-700">Décès:</span> {previewPair.person1.death || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Lieu décès:</span> {previewPair.person1.deathPlace || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Inhumation:</span> {previewPair.person1.burial || 'N/A'} {previewPair.person1.burialPlace && `(${previewPair.person1.burialPlace})`}</p>
                    <p><span className="font-medium text-gray-700">Profession:</span> {previewPair.person1.occupation || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Titre:</span> {previewPair.person1.title || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Résidence:</span> {previewPair.person1.residence || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Religion:</span> {previewPair.person1.religion || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Parents:</span> {previewPair.person1.parents.length > 0 ? previewPair.person1.parents.map(p => getPersonName(p)).join(', ') : 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Conjoints:</span> {previewPair.person1.spouses.length > 0 ? previewPair.person1.spouses.map(s => getPersonName(s)).join(', ') : 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Enfants:</span> {previewPair.person1.children?.length > 0 ? previewPair.person1.children.map(c => getPersonName(c)).join(', ') : 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Note:</span> {previewPair.person1.note || 'N/A'}</p>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-2">{previewPair.person2.names[0] || previewPair.person2.id}</h3>
                  <div className="text-sm space-y-1 text-gray-600">
                    <p><span className="font-medium text-gray-700">ID:</span> <span className="font-mono">{previewPair.person2.id}</span></p>
                    <p><span className="font-medium text-gray-700">Sexe:</span> {previewPair.person2.sex === 'M' ? '♂ Masculin' : previewPair.person2.sex === 'F' ? '♀ Féminin' : 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Naissance:</span> {previewPair.person2.birth || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Lieu naissance:</span> {previewPair.person2.birthPlace || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Baptême:</span> {previewPair.person2.baptism || 'N/A'} {previewPair.person2.baptismPlace && `(${previewPair.person2.baptismPlace})`}</p>
                    <p><span className="font-medium text-gray-700">Décès:</span> {previewPair.person2.death || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Lieu décès:</span> {previewPair.person2.deathPlace || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Inhumation:</span> {previewPair.person2.burial || 'N/A'} {previewPair.person2.burialPlace && `(${previewPair.person2.burialPlace})`}</p>
                    <p><span className="font-medium text-gray-700">Profession:</span> {previewPair.person2.occupation || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Titre:</span> {previewPair.person2.title || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Résidence:</span> {previewPair.person2.residence || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Religion:</span> {previewPair.person2.religion || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Parents:</span> {previewPair.person2.parents.length > 0 ? previewPair.person2.parents.map(p => getPersonName(p)).join(', ') : 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Conjoints:</span> {previewPair.person2.spouses.length > 0 ? previewPair.person2.spouses.map(s => getPersonName(s)).join(', ') : 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Enfants:</span> {previewPair.person2.children?.length > 0 ? previewPair.person2.children.map(c => getPersonName(c)).join(', ') : 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Note:</span> {previewPair.person2.note || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Détails de la comparaison</h4>
                <div className="text-sm space-y-1">{previewPair.details.map((detail, i) => <p key={i} className="text-gray-600">{detail}</p>)}</div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t flex gap-3 flex-shrink-0">
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
