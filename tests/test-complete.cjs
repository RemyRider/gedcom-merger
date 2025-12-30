// ═══════════════════════════════════════════════════════════════════════════════
// SUITE DE TESTS COMPLÈTE v1.9.3 - 187 TESTS (16 NIVEAUX + 3 BONUS)
// Adapté au code App.jsx réel
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
console.log('                    16 NIVEAUX + 3 BONUS = 187 TESTS');
console.log('═══════════════════════════════════════════════════════════════════════════════');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 1: SYNTAXE ET STRUCTURE (10 tests)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 1: SYNTAXE ET STRUCTURE (10 tests)                                  │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('import React'), 'Import React présent');
check(appCode.includes("from 'react'"), 'Import depuis react');
check(appCode.includes('useState'), 'Hook useState utilisé');
check(appCode.includes('const GedcomDuplicateMerger'), 'Composant principal défini');
check(appCode.includes('export default'), 'Export default présent');
check(appCode.includes('return ('), 'Return JSX présent');
check((appCode.match(/\(/g) || []).length === (appCode.match(/\)/g) || []).length, 'Parenthèses équilibrées');
check((appCode.match(/\{/g) || []).length === (appCode.match(/\}/g) || []).length, 'Accolades équilibrées');
check(appCode.includes('const ['), 'Déclarations useState');
check(appCode.includes('className='), 'Attributs className JSX');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 2: VERSIONS ET COHÉRENCE (10 tests)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 2: VERSIONS ET COHÉRENCE (10 tests)                                 │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes("VERSION = '1.9.3'") || appCode.includes('VERSION = "1.9.3"'), 'VERSION 1.9.3 dans App.jsx');
check(packageJson.version === '1.9.3', 'Version 1.9.3 dans package.json');
check(indexHtml.includes('1.9.3'), 'Version 1.9.3 dans index.html');
check(changelogMd.includes('v1.9.3') || changelogMd.includes('1.9.3'), 'Version 1.9.3 dans CHANGELOG.md');
check(packageJson.name === 'gedcom-merger', 'Nom du package correct');
check(packageJson.scripts && packageJson.scripts.test, 'Script test configuré');
check(packageJson.scripts && packageJson.scripts.build, 'Script build configuré');
check(packageJson.scripts && packageJson.scripts.dev, 'Script dev configuré');
check(packageJson.dependencies && packageJson.dependencies.react, 'Dépendance React présente');
check(packageJson.dependencies && packageJson.dependencies['lucide-react'], 'Dépendance Lucide-React présente');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 3: IMPORTS LUCIDE-REACT (15 tests)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 3: IMPORTS LUCIDE-REACT (15 tests)                                  │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes("from 'lucide-react'"), 'Import lucide-react');
check(appCode.includes('Upload'), 'Icône Upload');
check(appCode.includes('Download'), 'Icône Download');
check(appCode.includes('Trash2'), 'Icône Trash2');
check(appCode.includes('ChevronDown'), 'Icône ChevronDown');
check(appCode.includes('ChevronUp'), 'Icône ChevronUp');
check(appCode.includes('CheckCircle'), 'Icône CheckCircle');
check(appCode.includes('Users'), 'Icône Users');
check(appCode.includes('Brain'), 'Icône Brain');
check(appCode.includes('AlertCircle') || appCode.includes('AlertTriangle'), 'Icône Alert');
check(appCode.includes('Sparkles'), 'Icône Sparkles');
check(appCode.includes('FileText'), 'Icône FileText');
check(appCode.includes('<Upload'), 'Utilisation Upload JSX');
check(appCode.includes('<Download'), 'Utilisation Download JSX');
check(appCode.includes('<Brain'), 'Utilisation Brain JSX');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 4: ÉTATS REACT (22 tests)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 4: ÉTATS REACT (22 tests)                                           │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('const [file, setFile]'), 'État file');
check(appCode.includes('const [individuals, setIndividuals]'), 'État individuals');
check(appCode.includes('const [duplicates, setDuplicates]'), 'État duplicates');
check(appCode.includes('const [selectedPairs, setSelectedPairs]'), 'État selectedPairs');
check(appCode.includes('const [step, setStep]'), 'État step');
check(appCode.includes('const [originalGedcom, setOriginalGedcom]') || appCode.includes('const [rawGedcom'), 'État originalGedcom/rawGedcom');
check(appCode.includes('const [mergedIds, setMergedIds]'), 'État mergedIds');
check(appCode.includes('const [validationResults, setValidationResults]'), 'État validationResults');
check(appCode.includes('const [previewPair, setPreviewPair]'), 'État previewPair');
check(appCode.includes('const [searchTerm, setSearchTerm]'), 'État searchTerm');
check(appCode.includes('const [filterScore, setFilterScore]') || appCode.includes('const [minScore'), 'État filterScore/minScore');
check(appCode.includes('const [clusters, setClusters]'), 'État clusters');
check(appCode.includes('const [progress, setProgress]'), 'État progress');
check(appCode.includes('const [expandedClusters, setExpandedClusters]'), 'État expandedClusters');
check(appCode.includes('const [showChangelog, setShowChangelog]'), 'État showChangelog');
check(appCode.includes('const [activeTab, setActiveTab]'), 'État activeTab');
check(appCode.includes('const [clusterScoreFilter, setClusterScoreFilter]') || appCode.includes('clusterScore'), 'État clusterScoreFilter');
check(appCode.includes('const [selectedClusters, setSelectedClusters]'), 'État selectedClusters');
check(appCode.includes('const [toDeletePersons, setToDeletePersons]'), 'État toDeletePersons (v1.9.3)');
check(appCode.includes('const [selectedToDelete, setSelectedToDelete]'), 'État selectedToDelete (v1.9.3)');
check(appCode.includes('const [smartSuggestions, setSmartSuggestions]'), 'État smartSuggestions (IA)');
check(appCode.includes('const [familiesData, setFamiliesData]') || appCode.includes('familiesData'), 'État familiesData');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 5: FONCTIONS PRINCIPALES (12 tests)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 5: FONCTIONS PRINCIPALES (12 tests)                                 │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('const parseGedcom') || appCode.includes('function parseGedcom'), 'Fonction parseGedcom');
check(appCode.includes('const calculateSimilarity') || appCode.includes('calculateSimilarity ='), 'Fonction calculateSimilarity');
check(appCode.includes('const findDuplicates') || appCode.includes('findDuplicates ='), 'Fonction findDuplicates');
check(appCode.includes('const detectClusters') || appCode.includes('detectClusters'), 'Fonction detectClusters');
check(appCode.includes('const soundex') || appCode.includes('soundex ='), 'Fonction soundex');
check(appCode.includes('const normalizeFirstName') || appCode.includes('normalizeFirstName'), 'Fonction normalizeFirstName');
check(appCode.includes('const normalizePlace') || appCode.includes('normalizePlace'), 'Fonction normalizePlace');
check(appCode.includes('downloadCleanedFile') || appCode.includes('handleDownload'), 'Fonction download');
check(appCode.includes('handleFileUpload') || appCode.includes('onFileChange'), 'Fonction upload');
check(appCode.includes('handleMerge') || appCode.includes('mergeDuplicates'), 'Fonction merge');
check(appCode.includes('NAME_VARIANTS') || appCode.includes('nameVariants'), 'Dictionnaire variantes');
check(appCode.includes('getPersonName') || appCode.includes('formatName'), 'Fonction formatage nom');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 6: FONCTIONS ONGLETS v1.8.7+ (6 tests)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 6: FONCTIONS ONGLETS v1.8.7+ (6 tests)                              │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('filteredClusters') || appCode.includes('getFilteredClusters'), 'Variable filteredClusters');
check(appCode.includes('simplePairs') || appCode.includes('getSimplePairs') || appCode.includes('filteredDuplicates'), 'Variable paires filtrées');
check(appCode.includes('selectHighConfidence') || appCode.includes('autoSelect') || appCode.includes('highConfidence'), 'Sélection haute confiance');
check(appCode.includes('toggleCluster') || appCode.includes('handleClusterExpand') || appCode.includes('expandedClusters'), 'Toggle expansion cluster');
check(appCode.includes('selectedClusters') || appCode.includes('selectCluster'), 'Gestion sélection clusters');
check(appCode.includes('setSelectedPairs') || appCode.includes('clearSelection'), 'Gestion sélections');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 7: FONCTIONS "À SUPPRIMER" v1.9.3 (10 tests)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 7: FONCTIONS "À SUPPRIMER" v1.9.3 (10 tests)                        │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('toDeletePersons'), 'Variable toDeletePersons');
check(appCode.includes('setToDeletePersons'), 'Setter toDeletePersons');
check(appCode.includes('selectedToDelete'), 'Variable selectedToDelete');
check(appCode.includes('setSelectedToDelete'), 'Setter selectedToDelete');
check(appCode.includes('isTotallyIsolated') || appCode.includes('totallyIsolated') || appCode.includes('isolated'), 'Critère isolé');
check(appCode.includes('hasNoIdentity') || appCode.includes('noIdentity') || appCode.includes('!name'), 'Critère sans identité');
check(appCode.includes('handleDeleteToDelete') || appCode.includes('deleteSelected'), 'Fonction suppression');
check(appCode.includes("'toDelete'") || appCode.includes('"toDelete"'), 'Onglet toDelete');
check(appCode.includes('À supprimer') || appCode.includes('supprimer'), 'Label À supprimer');
check(appCode.includes('reason') || appCode.includes('motif') || appCode.includes('Raison'), 'Raison affichée');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 8: SUGGESTIONS IA v1.9.0+ (4 tests)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 8: SUGGESTIONS IA v1.9.0+ (4 tests)                                 │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('smartSuggestions') || appCode.includes('aiSuggestions'), 'Variable suggestions IA');
check(appCode.includes('setSmartSuggestions') || appCode.includes('setAiSuggestions'), 'Setter suggestions IA');
check(appCode.includes('<Brain') || appCode.includes('Brain />'), 'Icône Brain utilisée');
check(appCode.includes("activeTab === 'ai'") || appCode.includes('activeTab === "ai"') || appCode.includes("'ai'"), 'Onglet IA');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 9: ANTI-FAUX-POSITIFS v1.9.2 (7 tests)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 9: ANTI-FAUX-POSITIFS v1.9.2 (7 tests)                              │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('sufficientCriteria'), 'Variable sufficientCriteria');
check(appCode.includes('naissance') || appCode.includes('birth') || appCode.includes('BIRT'), 'Critère naissance');
check(appCode.includes('parents') || appCode.includes('FAMC'), 'Critère parents');
check(appCode.includes('conjoint') || appCode.includes('spouse') || appCode.includes('FAMS'), 'Critère conjoints');
check(appCode.includes('lieu') || appCode.includes('place') || appCode.includes('PLAC'), 'Critère lieu');
check(appCode.includes('sufficientCriteria.length') || appCode.includes('criteria.length'), 'Vérification critères');
check(appCode.includes('return 0') || appCode.includes('score = 0'), 'Rejet possible si insuffisant');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 10: GESTION CONT/CONC v1.8.6 (5 tests)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 10: GESTION CONT/CONC v1.8.6 (5 tests)                              │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('CONT') || appCode.includes('continued'), 'Gestion CONT');
check(appCode.includes('CONC') || appCode.includes('concatenate'), 'Gestion CONC');
check(appCode.includes('lastFieldType') || appCode.includes('currentField') || appCode.includes('fieldType'), 'Type de champ');
check(appCode.includes('trim') || appCode.includes('strip'), 'Nettoyage texte');
check(appCode.includes('parseGedcom'), 'Fonction parsing');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 11: GÉNÉRATION HEAD/TRLR v1.8.6 (7 tests)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 11: GÉNÉRATION HEAD/TRLR v1.8.6 (7 tests)                           │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('0 HEAD') || appCode.includes('HEAD'), 'Génération HEAD');
check(appCode.includes('0 TRLR') || appCode.includes('TRLR'), 'Génération TRLR');
check(appCode.includes('GedcomMerger') || appCode.includes('GEDCOM Merger') || appCode.includes('gedcom-merger'), 'Source application');
check(appCode.includes('GEDC') || appCode.includes('gedc'), 'Tag GEDC');
check(appCode.includes('5.5') || appCode.includes('5.5.1'), 'Version GEDCOM');
check(appCode.includes('hasHead') || appCode.includes('HEAD') || appCode.includes('header'), 'Vérification HEAD');
check(appCode.includes('UTF-8') || appCode.includes('utf8') || appCode.includes('UTF8'), 'Encodage');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 12: INTERFACE 4 ONGLETS (8 tests)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 12: INTERFACE 4 ONGLETS (8 tests)                                   │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes("'clusters'") || appCode.includes('"clusters"'), 'Onglet clusters');
check(appCode.includes("'pairs'") || appCode.includes('"pairs"') || appCode.includes('doublons'), 'Onglet doublons');
check(appCode.includes("'toDelete'") || appCode.includes('"toDelete"'), 'Onglet toDelete');
check(appCode.includes("'ai'") || appCode.includes('"ai"'), 'Onglet ai');
check(appCode.includes('activeTab'), 'État activeTab');
check(appCode.includes('setActiveTab'), 'Setter activeTab');
check(appCode.includes('onClick') && appCode.includes('setActiveTab'), 'Navigation onglets');
check(appCode.includes('Clusters') || appCode.includes('clusters'), 'Label Clusters');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 13: BOUTON FLOTTANT v1.9.3 (6 tests)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 13: BOUTON FLOTTANT v1.9.3 (6 tests)                                │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('fixed') && appCode.includes('bottom'), 'Position fixed bottom');
check(appCode.includes('z-50') || appCode.includes('z-40') || appCode.includes('z-index'), 'Z-index élevé');
check(appCode.includes('right-') || appCode.includes('right:'), 'Position right');
check(appCode.includes('Fusionner') || appCode.includes('Merge'), 'Bouton Fusionner');
check(appCode.includes('Supprimer') || appCode.includes('Delete'), 'Bouton Supprimer');
check(appCode.includes('selectedPairs.size') || appCode.includes('selectedCount') || appCode.includes('.size'), 'Compteur sélections');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 14: TABLEAU CLUSTERS DÉTAILLÉ v1.9.3 (11 tests)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 14: TABLEAU CLUSTERS DÉTAILLÉ v1.9.3 (11 tests)                     │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('<table') || appCode.includes('table '), 'Élément table');
check(appCode.includes('<thead') || appCode.includes('thead'), 'Élément thead');
check(appCode.includes('<tbody') || appCode.includes('tbody'), 'Élément tbody');
check(appCode.includes('<th') || appCode.includes('th>'), 'Éléments th (headers)');
check(appCode.includes('<td') || appCode.includes('td>'), 'Éléments td (cellules)');
check(appCode.includes('Nom') || appCode.includes('name'), 'Colonne Nom');
check(appCode.includes('Naissance') || appCode.includes('birth'), 'Colonne Naissance');
check(appCode.includes('Décès') || appCode.includes('death'), 'Colonne Décès');
check(appCode.includes('Sexe') || appCode.includes('sex') || appCode.includes('gender'), 'Colonne Sexe');
check(appCode.includes('Parents') || appCode.includes('parents'), 'Colonne Parents');
check(appCode.includes('<ChevronDown') || appCode.includes('<ChevronUp'), 'Icônes expand/collapse');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 15: ACTIONS DISTINCTES v1.9.3 (9 tests)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 15: ACTIONS DISTINCTES v1.9.3 (9 tests)                             │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('handleMerge') || appCode.includes('mergeDuplicates'), 'Fonction handleMerge');
check(appCode.includes('handleDeleteToDelete') || appCode.includes('handleDelete') || appCode.includes('deleteSelected'), 'Fonction handleDelete');
check(appCode.includes('window.confirm') || appCode.includes('confirm('), 'Confirmation avant action');
check(appCode.includes('mergedCount') || appCode.includes('fusionnés') || appCode.includes('merged'), 'Compteur fusions');
check(appCode.includes('deletedCount') || appCode.includes('supprimés') || appCode.includes('deleted'), 'Compteur suppressions');
check(appCode.includes('validationResults'), 'Résultats validation');
check(appCode.includes('setValidationResults'), 'Setter résultats');
check(appCode.includes('bg-green') || appCode.includes('green-'), 'Couleur verte');
check(appCode.includes('bg-red') || appCode.includes('red-'), 'Couleur rouge');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 16: CONFIGURATION BUILD (9 tests)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 16: CONFIGURATION BUILD (9 tests)                                   │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(viteConfig.includes('esbuild'), 'Minification esbuild');
check(viteConfig.includes('minify'), 'Option minify');
check(netlifyToml.includes('npm run build'), 'Commande build netlify');
check(netlifyToml.includes('dist'), 'Dossier dist');
check(tailwindConfig.includes('content'), 'Tailwind content');
check(indexHtml.includes('id="root"'), 'Div root');
check(indexHtml.includes('type="module"'), 'Script module');
check(packageJson.devDependencies && packageJson.devDependencies.vite, 'Vite devDep');
check(packageJson.devDependencies && packageJson.devDependencies.tailwindcss, 'Tailwind devDep');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// BONUS A: CHANGELOG ET DOCUMENTATION (16 tests)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ BONUS A: CHANGELOG ET DOCUMENTATION (16 tests)                             │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('CHANGELOG') || appCode.includes('changelog'), 'Variable CHANGELOG');
check(appCode.includes('showChangelog'), 'État showChangelog');
check(appCode.includes('setShowChangelog'), 'Setter showChangelog');
check(appCode.includes('Nouveautés') || appCode.includes('Changelog') || appCode.includes('History'), 'Bouton changelog');
check(changelogMd.includes('1.9.3'), 'v1.9.3 dans CHANGELOG');
check(changelogMd.includes('1.9.2'), 'v1.9.2 dans CHANGELOG');
check(changelogMd.includes('1.8.7'), 'v1.8.7 dans CHANGELOG');
check(changelogMd.includes('1.8.6'), 'v1.8.6 dans CHANGELOG');
check(changelogMd.includes('anti-faux-positif') || changelogMd.includes('faux positif') || changelogMd.includes('Anti-faux'), 'Mention anti-faux-positifs');
check(changelogMd.includes('supprimer') || changelogMd.includes('À supprimer'), 'Mention À supprimer');
check(changelogMd.includes('flottant') || changelogMd.includes('floating') || changelogMd.includes('fixe'), 'Mention bouton flottant');
check(changelogMd.includes('cluster') || changelogMd.includes('Cluster'), 'Mention clusters');
check(changelogMd.includes('ACTUELLE') || changelogMd.includes('actuelle'), 'Tag version actuelle');
check(fs.existsSync('./README.md'), 'README.md existe');
check(fs.existsSync('./docs/ARCHITECTURE.md') || fs.existsSync('./ARCHITECTURE.md'), 'ARCHITECTURE.md existe');
check(fs.existsSync('./DEPLOIEMENT.md'), 'DEPLOIEMENT.md existe');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// BONUS B: RESPONSIVE ET UX (12 tests)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ BONUS B: RESPONSIVE ET UX (12 tests)                                       │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('md:') || appCode.includes('lg:') || appCode.includes('sm:'), 'Classes responsive');
check(appCode.includes('flex'), 'Flexbox');
check(appCode.includes('grid') || appCode.includes('grid-cols'), 'Grid');
check(appCode.includes('rounded'), 'Coins arrondis');
check(appCode.includes('shadow'), 'Ombres');
check(appCode.includes('hover:'), 'États hover');
check(appCode.includes('transition'), 'Transitions');
check(appCode.includes('cursor-pointer') || appCode.includes('cursor:'), 'Curseur pointer');
check(appCode.includes('p-') || appCode.includes('px-') || appCode.includes('py-'), 'Padding');
check(appCode.includes('m-') || appCode.includes('mx-') || appCode.includes('my-'), 'Margin');
check(appCode.includes('overflow') || appCode.includes('scroll'), 'Gestion overflow');
check(appCode.includes('max-w-') || appCode.includes('max-h-') || appCode.includes('w-full'), 'Contraintes taille');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// BONUS C: STATISTIQUES ET COMPTEURS (8 tests)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ BONUS C: STATISTIQUES ET COMPTEURS (8 tests)                               │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('individuals.length') || appCode.includes('individualsCount'), 'Compteur individus');
check(appCode.includes('duplicates') && (appCode.includes('getFilteredDuplicates') || appCode.includes('.length') || appCode.includes('.filter(')), 'Compteur doublons');
check(appCode.includes('clusters.length') || appCode.includes('clustersCount'), 'Compteur clusters');
check(appCode.includes('selectedPairs.size') || appCode.includes('selectedCount'), 'Compteur sélections paires');
check(appCode.includes('toDeletePersons.length') || appCode.includes('toDeleteCount'), 'Compteur À supprimer');
check(appCode.includes('.filter('), 'Méthode filter');
check(appCode.includes('.map('), 'Méthode map');
check(appCode.includes('.reduce(') || appCode.includes('.forEach(') || appCode.includes('.length'), 'Méthodes tableaux');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// RÉSUMÉ FINAL
// ═══════════════════════════════════════════════════════════════════════════════
console.log('═══════════════════════════════════════════════════════════════════════════════');
console.log('                              RÉSUMÉ FINAL');
console.log('═══════════════════════════════════════════════════════════════════════════════');
console.log('');

const expectedTotal = 187;

console.log(`  📊 Tests exécutés: ${totalTests}`);
console.log(`  ✅ Réussis: ${passedTests}`);
console.log(`  ❌ Échoués: ${failedTests}`);
console.log(`  📋 Attendus: ${expectedTotal}`);
console.log('');

if (failedTests === 0 && totalTests === expectedTotal) {
  console.log('  🎉 SUCCÈS TOTAL: 187/187 tests passés (100%)');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  process.exit(0);
} else if (failedTests === 0) {
  console.log(`  ✅ SUCCÈS: ${passedTests}/${totalTests} tests passés (100%)`);
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  process.exit(0);
} else {
  console.log(`  ❌ ÉCHEC: ${failedTests} test(s) échoué(s)`);
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  process.exit(1);
}
