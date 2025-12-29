// ═══════════════════════════════════════════════════════════════════════════════
// SUITE DE TESTS COMPLÈTE v1.9.3 - 16 NIVEAUX + BONUS
// Basé sur tests v1.9.0 (128 tests) + nouveaux tests v1.9.3
// ═══════════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

const check = (condition, testName) => {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ ${testName}`);
    return true;
  } else {
    failedTests++;
    console.log(`  ❌ ${testName}`);
    return false;
  }
};

// Charger les fichiers
const appCode = fs.readFileSync('./src/App.jsx', 'utf8');
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const indexHtml = fs.readFileSync('./index.html', 'utf8');
const viteConfig = fs.readFileSync('./vite.config.js', 'utf8');
const netlifyToml = fs.readFileSync('./netlify.toml', 'utf8');
const tailwindConfig = fs.readFileSync('./tailwind.config.js', 'utf8');
const changelogMd = fs.readFileSync('./CHANGELOG.md', 'utf8');

console.log('');
console.log('═══════════════════════════════════════════════════════════════════════════════');
console.log('                    SUITE DE TESTS COMPLÈTE v1.9.3');
console.log('                    16 NIVEAUX + BONUS - TESTS DE RÉGRESSION');
console.log('═══════════════════════════════════════════════════════════════════════════════');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 1: SYNTAXE ET STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 1: SYNTAXE ET STRUCTURE                                             │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('import React'), 'Import React présent');
check(appCode.includes('from \'react\''), 'Import depuis react');
check(appCode.includes('useState'), 'Hook useState utilisé');
check(appCode.includes('useMemo'), 'Hook useMemo utilisé');
check(appCode.includes('export default'), 'Export default présent');
check(appCode.includes('const GedcomDuplicateMerger'), 'Composant principal défini');
check(appCode.includes('return ('), 'Return JSX présent');
check((appCode.match(/\(/g) || []).length === (appCode.match(/\)/g) || []).length, 'Parenthèses équilibrées');
check((appCode.match(/\{/g) || []).length === (appCode.match(/\}/g) || []).length, 'Accolades équilibrées');
check((appCode.match(/\[/g) || []).length === (appCode.match(/\]/g) || []).length, 'Crochets équilibrés');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 2: VERSIONS ET COHÉRENCE
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 2: VERSIONS ET COHÉRENCE                                            │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(packageJson.version === '1.9.3', 'package.json version 1.9.3');
check(appCode.includes("VERSION = '1.9.3'"), 'App.jsx VERSION 1.9.3');
check(indexHtml.includes('v1.9.3'), 'index.html version 1.9.3');
check(packageJson.name === 'gedcom-merger', 'Nom package correct');
check(packageJson.type === 'module', 'Type module ES');
check(packageJson.dependencies['react'].includes('18'), 'React 18.x');
check(packageJson.dependencies['react-dom'].includes('18'), 'React-DOM 18.x');
check(packageJson.dependencies['lucide-react'] !== undefined, 'lucide-react installé');
check(packageJson.devDependencies['vite'].includes('5'), 'Vite 5.x');
check(packageJson.devDependencies['tailwindcss'].includes('3'), 'Tailwind 3.x');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 3: IMPORTS LUCIDE-REACT
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 3: IMPORTS LUCIDE-REACT                                             │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('Upload'), 'Icône Upload');
check(appCode.includes('Users'), 'Icône Users');
check(appCode.includes('AlertCircle'), 'Icône AlertCircle');
check(appCode.includes('Download'), 'Icône Download');
check(appCode.includes('Trash2'), 'Icône Trash2');
check(appCode.includes('CheckCircle'), 'Icône CheckCircle');
check(appCode.includes('Sparkles'), 'Icône Sparkles');
check(appCode.includes('UserX'), 'Icône UserX');
check(appCode.includes('Lightbulb'), 'Icône Lightbulb');
check(appCode.includes('ChevronDown'), 'Icône ChevronDown');
check(appCode.includes('ChevronUp'), 'Icône ChevronUp');
check(appCode.includes('Eye'), 'Icône Eye');
check(appCode.includes('Merge'), 'Icône Merge');
check(appCode.includes('Brain'), 'Icône Brain');
check(appCode.includes('from \'lucide-react\''), 'Import lucide-react');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 4: ÉTATS REACT (TOUS)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 4: ÉTATS REACT (TOUS)                                               │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('const [file, setFile]'), 'État file');
check(appCode.includes('const [individuals, setIndividuals]'), 'État individuals');
check(appCode.includes('const [duplicates, setDuplicates]'), 'État duplicates');
check(appCode.includes('const [selectedPairs, setSelectedPairs]'), 'État selectedPairs');
check(appCode.includes('const [step, setStep]'), 'État step');
check(appCode.includes('const [originalGedcom, setOriginalGedcom]'), 'État originalGedcom');
check(appCode.includes('const [mergedIds, setMergedIds]'), 'État mergedIds');
check(appCode.includes('const [validationResults, setValidationResults]'), 'État validationResults');
check(appCode.includes('const [previewPair, setPreviewPair]'), 'État previewPair');
check(appCode.includes('const [searchTerm, setSearchTerm]'), 'État searchTerm');
check(appCode.includes('const [filterScore, setFilterScore]'), 'État filterScore');
check(appCode.includes('const [clusters, setClusters]'), 'État clusters');
check(appCode.includes('const [progress, setProgress]'), 'État progress');
check(appCode.includes('const [expandedClusters, setExpandedClusters]'), 'État expandedClusters');
check(appCode.includes('const [showChangelog, setShowChangelog]'), 'État showChangelog');
check(appCode.includes('const [activeTab, setActiveTab]'), 'État activeTab');
check(appCode.includes('const [clusterScoreFilter, setClusterScoreFilter]'), 'État clusterScoreFilter');
check(appCode.includes('const [selectedClusters, setSelectedClusters]'), 'État selectedClusters');
check(appCode.includes('const [smartSuggestions, setSmartSuggestions]'), 'État smartSuggestions');
check(appCode.includes('const [familiesData, setFamiliesData]'), 'État familiesData');
check(appCode.includes('const [toDeletePersons, setToDeletePersons]'), 'État toDeletePersons (v1.9.3)');
check(appCode.includes('const [selectedToDelete, setSelectedToDelete]'), 'État selectedToDelete (v1.9.3)');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 5: FONCTIONS PRINCIPALES
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 5: FONCTIONS PRINCIPALES                                            │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('const parseGedcom'), 'Fonction parseGedcom');
check(appCode.includes('const soundex'), 'Fonction soundex');
check(appCode.includes('const calculateSimilarity'), 'Fonction calculateSimilarity');
check(appCode.includes('const findDuplicates'), 'Fonction findDuplicates');
check(appCode.includes('const detectClusters'), 'Fonction detectClusters');
check(appCode.includes('const handleFileUpload'), 'Fonction handleFileUpload');
check(appCode.includes('const togglePairSelection'), 'Fonction togglePairSelection');
check(appCode.includes('const downloadCleanedFile'), 'Fonction downloadCleanedFile');
check(appCode.includes('const resetAll'), 'Fonction resetAll');
check(appCode.includes('const openPreview'), 'Fonction openPreview');
check(appCode.includes('const calculateDataQuality'), 'Fonction calculateDataQuality');
check(appCode.includes('const mergePersonData'), 'Fonction mergePersonData');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 6: FONCTIONS ONGLETS (v1.8.7+)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 6: FONCTIONS ONGLETS (v1.8.7+)                                       │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('const getFilteredClusters'), 'Fonction getFilteredClusters');
check(appCode.includes('const getSimplePairs'), 'Fonction getSimplePairs');
check(appCode.includes('const autoSelectHighConfidenceClusters'), 'Fonction autoSelectHighConfidenceClusters');
check(appCode.includes('const toggleClusterExpand'), 'Fonction toggleClusterExpand');
check(appCode.includes('const selectFilteredDuplicates'), 'Fonction selectFilteredDuplicates');
check(appCode.includes('const selectCluster'), 'Fonction selectCluster');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 7: FONCTIONS "À SUPPRIMER" (v1.9.3)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 7: FONCTIONS "À SUPPRIMER" (v1.9.3 - NOUVEAU)                       │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('const detectToDeletePersons'), 'Fonction detectToDeletePersons');
check(appCode.includes('const selectAllToDelete'), 'Fonction selectAllToDelete');
check(appCode.includes('const deselectAllToDelete'), 'Fonction deselectAllToDelete');
check(appCode.includes('const toggleToDeleteSelection'), 'Fonction toggleToDeleteSelection');
check(appCode.includes('const handleDeleteToDelete'), 'Fonction handleDeleteToDelete');
check(appCode.includes('isTotallyIsolated'), 'Critère isTotallyIsolated');
check(appCode.includes('hasNoIdentity'), 'Critère hasNoIdentity');
check(appCode.includes('childrenMap'), 'Utilisation childrenMap pour descendants');
check(appCode.includes("reason:"), 'Raison de suppression stockée');
check(appCode.includes('hasSpouses'), 'Propriété hasSpouses');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 8: SUGGESTIONS IA (v1.9.0+)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 8: SUGGESTIONS IA (v1.9.0+)                                         │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('const generateAiSuggestions'), 'Fonction generateAiSuggestions');
check(appCode.includes('confidence'), 'Score de confiance');
check(appCode.includes('lastNameGroups'), 'Groupement par nom de famille');
check(appCode.includes('period'), 'Période de naissance');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 9: ALGORITHME ANTI-FAUX-POSITIFS (v1.9.2)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 9: ALGORITHME ANTI-FAUX-POSITIFS (v1.9.2)                           │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('sufficientCriteria'), 'Variable sufficientCriteria');
check(appCode.includes("sufficientCriteria.push('date_naissance')"), 'Critère date_naissance');
check(appCode.includes("sufficientCriteria.push('annee_naissance')"), 'Critère annee_naissance');
check(appCode.includes("sufficientCriteria.push('parents_communs')") || appCode.includes("sufficientCriteria.push('parents_2')"), 'Critère parents_communs');
check(appCode.includes("sufficientCriteria.push('lieu_naissance')"), 'Critère lieu_naissance');
check(appCode.includes("sufficientCriteria.push('conjoints_communs')") || appCode.includes("sufficientCriteria.push('conjoints')"), 'Critère conjoints_communs');
check(appCode.includes('sufficientCriteria.length === 0'), 'Vérification critères suffisants');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 10: GESTION CONT/CONC (v1.8.6)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 10: GESTION CONT/CONC (v1.8.6)                                       │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes("'2 CONT '") || appCode.includes("2 CONT"), 'Détection balise CONT');
check(appCode.includes("'2 CONC '") || appCode.includes("2 CONC"), 'Détection balise CONC');
check(appCode.includes('lastFieldType'), 'Variable lastFieldType');
check(appCode.includes("lastFieldType === 'NAME'"), 'Gestion CONT/CONC pour NAME');
check(appCode.includes("lastFieldType === 'BIRT_DATE'") || appCode.includes("lastFieldType === 'BIRT'"), 'Gestion CONT/CONC pour BIRT');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 11: GÉNÉRATION HEAD/TRLR (v1.8.6)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 11: GÉNÉRATION HEAD/TRLR (v1.8.6)                                    │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes("'0 HEAD'") || appCode.includes("0 HEAD"), 'Génération HEAD');
check(appCode.includes("'0 TRLR'") || appCode.includes("0 TRLR"), 'Génération TRLR');
check(appCode.includes('GedcomMerger'), 'Source GedcomMerger');
check(appCode.includes('GEDC'), 'Tag GEDC');
check(appCode.includes('5.5.1'), 'Version GEDCOM 5.5.1');
check(appCode.includes('hasHead'), 'Vérification HEAD existant');
check(appCode.includes('CHAR') && appCode.includes('UTF-8'), 'Encodage UTF-8');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 12: INTERFACE 4 ONGLETS
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 12: INTERFACE 4 ONGLETS                                              │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes("activeTab === 'clusters'"), 'Onglet clusters');
check(appCode.includes("activeTab === 'pairs'"), 'Onglet pairs');
check(appCode.includes("activeTab === 'toDelete'") || appCode.includes("activeTab === 'isolated'"), 'Onglet toDelete/isolated');
check(appCode.includes("activeTab === 'ai'") || appCode.includes("activeTab === 'suggestions'"), 'Onglet ai/suggestions');
check(appCode.includes("setActiveTab('clusters')") || appCode.includes("setActiveTab(tab.id)"), 'Navigation clusters');
check(appCode.includes("setActiveTab('pairs')") || appCode.includes("id: 'pairs'"), 'Navigation pairs');
check(appCode.includes("setActiveTab('toDelete')") || appCode.includes("id: 'toDelete'"), 'Navigation toDelete');
check(appCode.includes("setActiveTab('ai')") || appCode.includes("id: 'ai'"), 'Navigation ai');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 13: BOUTON FLOTTANT (v1.9.3)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 13: BOUTON FLOTTANT (v1.9.3 - NOUVEAU)                              │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('totalSelectionsCount'), 'Variable totalSelectionsCount');
check(appCode.includes('useMemo(() =>'), 'useMemo pour totalSelectionsCount');
check(appCode.includes('selectedPairs.size') && appCode.includes('selectedToDelete.size'), 'Calcul total sélections');
check(appCode.includes('fixed bottom-6 right-6') || appCode.includes('fixed bottom-4 right-4'), 'Position fixe bottom-right');
check(appCode.includes('z-50'), 'Z-index élevé');
check(appCode.includes('totalSelectionsCount > 0'), 'Affichage conditionnel');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 14: TABLEAU CLUSTERS DÉTAILLÉ (v1.9.3)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 14: TABLEAU CLUSTERS DÉTAILLÉ (v1.9.3 - NOUVEAU)                    │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('<table'), 'Élément table HTML');
check(appCode.includes('<thead'), 'Élément thead');
check(appCode.includes('<tbody'), 'Élément tbody');
check(appCode.includes('Nom complet'), 'Colonne Nom complet');
check(appCode.includes('Naissance'), 'Colonne Naissance');
check(appCode.includes('Lieu'), 'Colonne Lieu');
check(appCode.includes('Décès'), 'Colonne Décès');
check(appCode.includes('Sexe'), 'Colonne Sexe');
check(appCode.includes('Parents'), 'Colonne Parents');
check(appCode.includes('Conjoints'), 'Colonne Conjoints');
check(appCode.includes('>ID<') || appCode.includes('>ID</'), 'Colonne ID');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 15: ACTIONS DISTINCTES (v1.9.3)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 15: ACTIONS DISTINCTES (v1.9.3 - NOUVEAU)                           │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('handleMerge'), 'Fonction handleMerge');
check(appCode.includes('handleDeleteToDelete'), 'Fonction handleDeleteToDelete');
check(appCode.includes('window.confirm'), 'Confirmation avant suppression');
check(appCode.includes('Fusionner'), 'Libellé Fusionner');
check(appCode.includes('Supprimer'), 'Libellé Supprimer');
check(appCode.includes('doublon'), 'Terme doublon');
check(appCode.includes('individu'), 'Terme individu');
check(appCode.includes('mergedCount'), 'Compteur mergedCount');
check(appCode.includes('deletedCount'), 'Compteur deletedCount');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 16: CONFIGURATION BUILD
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 16: CONFIGURATION BUILD                                              │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(viteConfig.includes("'esbuild'") || viteConfig.includes('"esbuild"'), 'Minification esbuild');
check(!viteConfig.includes('terser'), 'Pas de Terser');
check(tailwindConfig.includes('./src/**/*.{js') || tailwindConfig.includes('./src/**/*.jsx'), 'Tailwind content src');
check(tailwindConfig.includes('./index.html'), 'Tailwind content html');
check(netlifyToml.includes('npm install && npm run build'), 'Netlify build command');
check(netlifyToml.includes('publish = "dist"'), 'Netlify publish dist');
check(netlifyToml.includes('X-Frame-Options'), 'Header X-Frame-Options');
check(netlifyToml.includes('X-Content-Type-Options'), 'Header X-Content-Type-Options');
check(netlifyToml.includes('Cache-Control'), 'Header Cache-Control');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU BONUS A: CHANGELOG ET DOCUMENTATION
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU BONUS A: CHANGELOG ET DOCUMENTATION                                 │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(changelogMd.includes('[1.9.3]'), 'CHANGELOG.md contient v1.9.3');
check(changelogMd.includes('[1.9.2]'), 'CHANGELOG.md contient v1.9.2');
check(changelogMd.includes('[1.9.1]'), 'CHANGELOG.md contient v1.9.1');
check(changelogMd.includes('[1.8.7]'), 'CHANGELOG.md contient v1.8.7');
check(changelogMd.includes('[1.0.0]'), 'CHANGELOG.md contient v1.0.0');
check(appCode.includes("version: '1.9.3'"), 'CHANGELOG App.jsx v1.9.3');
check(appCode.includes("version: '1.9.2'"), 'CHANGELOG App.jsx v1.9.2');
check(appCode.includes("version: '1.9.1'"), 'CHANGELOG App.jsx v1.9.1');
check(appCode.includes("version: '1.8.7'"), 'CHANGELOG App.jsx v1.8.7');
check(appCode.includes("version: '1.0.0'"), 'CHANGELOG App.jsx v1.0.0');
check(appCode.includes('const CHANGELOG'), 'Constante CHANGELOG');
check(appCode.includes("tag: 'ACTUELLE'"), 'Tag ACTUELLE');
check(appCode.includes("tag: 'INITIALE'"), 'Tag INITIALE');
check(appCode.includes('showChangelog &&'), 'Modal changelog');
check(appCode.includes('Historique des versions'), 'Titre changelog');
check(appCode.includes('Nouveautés'), 'Bouton Nouveautés');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU BONUS B: RESPONSIVE ET UX
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU BONUS B: RESPONSIVE ET UX                                           │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('md:grid-cols'), 'Grid responsive');
check(appCode.includes('md:flex-row'), 'Flex responsive');
check(appCode.includes('md:p-') || appCode.includes('md:px-'), 'Padding responsive');
check(appCode.includes('md:text-'), 'Text responsive');
check(appCode.includes('min-w-['), 'Min width définis');
check(appCode.includes('overflow-x-auto'), 'Overflow horizontal');
check(appCode.includes('animate-spin'), 'Animation spinner');
check(appCode.includes('transition-'), 'Transitions');
check(appCode.includes('hover:bg-'), 'Hover states');
check(appCode.includes('cursor-pointer'), 'Curseur pointer');
check(appCode.includes('shadow-lg') || appCode.includes('shadow-xl'), 'Ombres');
check(appCode.includes('rounded-'), 'Coins arrondis');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU BONUS C: STATISTIQUES ET COMPTEURS
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU BONUS C: STATISTIQUES ET COMPTEURS                                  │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('individuals.length'), 'Compteur individus');
check(appCode.includes('clusters.length') || appCode.includes('getFilteredClusters().length'), 'Compteur clusters');
check(appCode.includes('duplicates.length') || appCode.includes('getSimplePairs().length'), 'Compteur doublons');
check(appCode.includes('toDeletePersons.length') || appCode.includes('isolatedIndividuals.length'), 'Compteur toDelete/isolés');
check(appCode.includes('smartSuggestions.length'), 'Compteur suggestions');
check(appCode.includes('selectedPairs.size'), 'Compteur paires sélectionnées');
check(appCode.includes('selectedClusters.size'), 'Compteur clusters sélectionnés');
check(appCode.includes('selectedToDelete.size') || appCode.includes('selectedIsolated.size'), 'Compteur toDelete/isolés sélectionnés');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// RÉSUMÉ FINAL
// ═══════════════════════════════════════════════════════════════════════════════
console.log('═══════════════════════════════════════════════════════════════════════════════');
console.log('                              RÉSUMÉ FINAL');
console.log('═══════════════════════════════════════════════════════════════════════════════');
console.log('');
console.log(`  Total tests     : ${totalTests}`);
console.log(`  Tests réussis   : ${passedTests} ✅`);
console.log(`  Tests échoués   : ${failedTests} ❌`);
console.log(`  Taux de succès  : ${((passedTests / totalTests) * 100).toFixed(1)}%`);
console.log('');

if (failedTests === 0) {
  console.log('  ╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('  ║                                                                           ║');
  console.log('  ║   🎉 TOUS LES TESTS PASSENT ! VERSION 1.9.3 VALIDÉE !                    ║');
  console.log('  ║                                                                           ║');
  console.log('  ╚═══════════════════════════════════════════════════════════════════════════╝');
} else {
  console.log('  ╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('  ║                                                                           ║');
  console.log(`  ║   ⚠️  ${failedTests} TEST(S) ÉCHOUÉ(S) - CORRECTIONS NÉCESSAIRES              ║`);
  console.log('  ║                                                                           ║');
  console.log('  ╚═══════════════════════════════════════════════════════════════════════════╝');
}
console.log('');

process.exit(failedTests > 0 ? 1 : 0);
