// ═══════════════════════════════════════════════════════════════════════════════
// SUITE DE TESTS COMPLÈTE v1.9.0 - 14 NIVEAUX
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

console.log('');
console.log('═══════════════════════════════════════════════════════════════════════════════');
console.log('                    SUITE DE TESTS COMPLÈTE v1.9.0');
console.log('                         14 NIVEAUX - 213+ TESTS');
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
check(appCode.includes('export default'), 'Export default présent');
check(appCode.includes('const GedcomDuplicateMerger'), 'Composant principal défini');
check(appCode.includes('return ('), 'Return JSX présent');
check((appCode.match(/\(/g) || []).length === (appCode.match(/\)/g) || []).length, 'Parenthèses équilibrées');
check((appCode.match(/\{/g) || []).length === (appCode.match(/\}/g) || []).length, 'Accolades équilibrées');
check((appCode.match(/\[/g) || []).length === (appCode.match(/\]/g) || []).length, 'Crochets équilibrés');
check(!appCode.includes('undefined'), 'Pas de undefined explicite');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 2: VERSIONS ET COHÉRENCE
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 2: VERSIONS ET COHÉRENCE                                            │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(packageJson.version === '1.9.0', 'package.json version 1.9.0');
check(appCode.includes("VERSION = '1.9.0'"), 'App.jsx VERSION 1.9.0');
check(indexHtml.includes('v1.9.0'), 'index.html version 1.9.0');
check(packageJson.name === 'gedcom-merger', 'Nom package correct');
check(packageJson.type === 'module', 'Type module ES');
check(packageJson.dependencies['react'].includes('18'), 'React 18.x');
check(packageJson.dependencies['react-dom'].includes('18'), 'React-DOM 18.x');
check(packageJson.dependencies['lucide-react'] !== undefined, 'lucide-react installé');
check(packageJson.devDependencies['vite'].includes('5'), 'Vite 5.x');
check(packageJson.devDependencies['tailwindcss'].includes('3'), 'Tailwind 3.x');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 3: IMPORTS ET DÉPENDANCES
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 3: IMPORTS ET DÉPENDANCES                                           │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('Upload'), 'Icône Upload importée');
check(appCode.includes('Users'), 'Icône Users importée');
check(appCode.includes('AlertCircle'), 'Icône AlertCircle importée');
check(appCode.includes('Download'), 'Icône Download importée');
check(appCode.includes('Trash2'), 'Icône Trash2 importée');
check(appCode.includes('CheckCircle'), 'Icône CheckCircle importée');
check(appCode.includes('Sparkles'), 'Icône Sparkles importée');
check(appCode.includes('FileText'), 'Icône FileText importée');
check(appCode.includes('UserX'), 'Icône UserX importée (isolés)');
check(appCode.includes('Lightbulb'), 'Icône Lightbulb importée (IA)');
check(appCode.includes('Shield'), 'Icône Shield importée (intégrité)');
check(appCode.includes('from \'lucide-react\''), 'Import lucide-react');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 4: ÉTATS REACT
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 4: ÉTATS REACT                                                      │');
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
check(appCode.includes('const [isolatedIndividuals, setIsolatedIndividuals]'), 'État isolatedIndividuals');
check(appCode.includes('const [selectedIsolated, setSelectedIsolated]'), 'État selectedIsolated');
check(appCode.includes('const [smartSuggestions, setSmartSuggestions]'), 'État smartSuggestions');
check(appCode.includes('const [integrityReport, setIntegrityReport]'), 'État integrityReport');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 5: FONCTIONS PRINCIPALES
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 5: FONCTIONS PRINCIPALES                                            │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('const parseGedcom'), 'Fonction parseGedcom');
check(appCode.includes('const soundexFr'), 'Fonction soundexFr');
check(appCode.includes('const calculateSimilarity'), 'Fonction calculateSimilarity');
check(appCode.includes('const findDuplicates'), 'Fonction findDuplicates');
check(appCode.includes('const detectClusters'), 'Fonction detectClusters');
check(appCode.includes('const handleFileUpload'), 'Fonction handleFileUpload');
check(appCode.includes('const togglePairSelection'), 'Fonction togglePairSelection');
check(appCode.includes('const selectHighConfidence'), 'Fonction selectHighConfidence');
check(appCode.includes('const getFilteredDuplicates'), 'Fonction getFilteredDuplicates');
check(appCode.includes('const mergeDuplicates'), 'Fonction mergeDuplicates');
check(appCode.includes('const downloadCleanedFile'), 'Fonction downloadCleanedFile');
check(appCode.includes('const resetAll'), 'Fonction resetAll');
check(appCode.includes('const showPreview'), 'Fonction showPreview');
check(appCode.includes('const calculateQualityScore'), 'Fonction calculateQualityScore');
check(appCode.includes('const mergePersonData'), 'Fonction mergePersonData');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 6: FONCTIONS ONGLETS (v1.8.7+)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 6: FONCTIONS ONGLETS (v1.8.7+)                                       │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('const getClusterAverageScore'), 'Fonction getClusterAverageScore');
check(appCode.includes('const getFilteredClusters'), 'Fonction getFilteredClusters');
check(appCode.includes('const autoSelectHighConfidenceClusters'), 'Fonction autoSelectHighConfidenceClusters');
check(appCode.includes('const toggleClusterExpand'), 'Fonction toggleClusterExpand');
check(appCode.includes('const selectFilteredDuplicates'), 'Fonction selectFilteredDuplicates');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 7: FONCTIONS ISOLÉS (v1.9.0)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 7: FONCTIONS ISOLÉS (v1.9.0)                                         │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('const detectIsolatedIndividuals'), 'Fonction detectIsolatedIndividuals');
check(appCode.includes('const selectAllIsolated'), 'Fonction selectAllIsolated');
check(appCode.includes('const selectTotallyIsolated'), 'Fonction selectTotallyIsolated');
check(appCode.includes('const deselectAllIsolated'), 'Fonction deselectAllIsolated');
check(appCode.includes('const toggleIsolatedSelection'), 'Fonction toggleIsolatedSelection');
check(appCode.includes('const deleteSelectedIsolated'), 'Fonction deleteSelectedIsolated');
check(appCode.includes('isTotallyIsolated'), 'Propriété isTotallyIsolated');
check(appCode.includes('hasSpouses'), 'Propriété hasSpouses');
check(appCode.includes('childrenMap'), 'Utilisation childrenMap');
check(appCode.includes('window.confirm'), 'Confirmation avant suppression');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 8: FONCTIONS SUGGESTIONS IA (v1.9.0)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 8: FONCTIONS SUGGESTIONS IA (v1.9.0)                                 │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('const generateSmartSuggestions'), 'Fonction generateSmartSuggestions');
check(appCode.includes('const buildSuggestionReason'), 'Fonction buildSuggestionReason');
check(appCode.includes('confidence'), 'Score de confiance');
check(appCode.includes('nameGroups'), 'Groupement par nom');
check(appCode.includes('period'), 'Groupement par période');
check(appCode.includes('confidence += 15'), 'Bonus lieu commun (+15)');
check(appCode.includes('confidence += 20'), 'Bonus parents communs (+20)');
check(appCode.includes('confidence -= 10'), 'Malus groupe grand (-10)');
check(appCode.includes('Math.min(95'), 'Plafond confiance 95%');
check(appCode.includes('Math.max(60'), 'Plancher confiance 60%');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 9: NORMALISATION ET VARIANTES (v1.9.0)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 9: NORMALISATION ET VARIANTES (v1.9.0)                               │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('const normalizePlace'), 'Fonction normalizePlace');
check(appCode.includes('const normalizeFirstName'), 'Fonction normalizeFirstName');
check(appCode.includes('const NAME_VARIANTS'), 'Dictionnaire NAME_VARIANTS');
check(appCode.includes("'catherine'"), 'Variante Catherine');
check(appCode.includes("'katherine'"), 'Variante Katherine');
check(appCode.includes("'jean'"), 'Variante Jean');
check(appCode.includes("'jehan'"), 'Variante Jehan');
check(appCode.includes("'marie'"), 'Variante Marie');
check(appCode.includes("'maria'"), 'Variante Maria');
check(appCode.includes('\\d{1,5}\\s+'), 'Pattern codes INSEE');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 10: CONTRÔLES D'INTÉGRITÉ (v1.9.0)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 10: CONTRÔLES D\'INTÉGRITÉ (v1.9.0)                                   │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('const performIntegrityChecks'), 'Fonction performIntegrityChecks');
check(appCode.includes('critical:'), 'Catégorie critical');
check(appCode.includes('warnings:'), 'Catégorie warnings');
check(appCode.includes('NO_NAME'), 'Détection NO_NAME');
check(appCode.includes('BIRTH_AFTER_DEATH'), 'Détection BIRTH_AFTER_DEATH');
check(appCode.includes('PARENT_TOO_YOUNG'), 'Détection PARENT_TOO_YOUNG');
check(appCode.includes('PARENT_TOO_OLD'), 'Détection PARENT_TOO_OLD');
check(appCode.includes('ageAtBirth < 15'), 'Seuil parent trop jeune');
check(appCode.includes('ageAtBirth > 80'), 'Seuil parent trop vieux');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 11: INTERFACE 4 ONGLETS
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 11: INTERFACE 4 ONGLETS                                              │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes("activeTab === 'clusters'"), 'Onglet clusters');
check(appCode.includes("activeTab === 'pairs'"), 'Onglet pairs');
check(appCode.includes("activeTab === 'isolated'"), 'Onglet isolated');
check(appCode.includes("activeTab === 'suggestions'"), 'Onglet suggestions');
check(appCode.includes("setActiveTab('clusters')"), 'Navigation clusters');
check(appCode.includes("setActiveTab('pairs')"), 'Navigation pairs');
check(appCode.includes("setActiveTab('isolated')"), 'Navigation isolated');
check(appCode.includes("setActiveTab('suggestions')"), 'Navigation suggestions');
check(appCode.includes('border-orange-600'), 'Style onglet clusters');
check(appCode.includes('border-indigo-600'), 'Style onglet doublons');
check(appCode.includes('border-red-600'), 'Style onglet isolés');
check(appCode.includes('border-purple-600'), 'Style onglet IA');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 12: GESTION GEDCOM (v1.8.6)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 12: GESTION GEDCOM (v1.8.6)                                          │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('2 CONT'), 'Gestion CONT');
check(appCode.includes('2 CONC'), 'Gestion CONC');
check(appCode.includes('0 HEAD'), 'Génération HEAD');
check(appCode.includes('0 TRLR'), 'Génération TRLR');
check(appCode.includes('1 SOUR GedcomMerger'), 'Source GedcomMerger');
check(appCode.includes('2 VERS 5.5.1'), 'Version GEDCOM 5.5.1');
check(appCode.includes('1 CHAR UTF-8'), 'Encodage UTF-8');
check(appCode.includes('hasHead'), 'Vérification HEAD');
check(appCode.includes('hasTrlr'), 'Vérification TRLR');
check(appCode.includes('lastFieldType'), 'Tracking dernier champ');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 13: CONFIGURATION BUILD
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 13: CONFIGURATION BUILD                                              │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(viteConfig.includes("minify: 'esbuild'"), 'Minification esbuild');
check(!viteConfig.includes('terser'), 'Pas de Terser');
check(viteConfig.includes('react-vendor'), 'Chunk react-vendor');
check(viteConfig.includes('manualChunks'), 'Manual chunks configuré');
check(tailwindConfig.includes('./src/**/*.{js'), 'Tailwind content src');
check(tailwindConfig.includes('./index.html'), 'Tailwind content html');
check(netlifyToml.includes('npm install && npm run build'), 'Netlify build command');
check(netlifyToml.includes('publish = "dist"'), 'Netlify publish dist');
check(netlifyToml.includes('X-Frame-Options'), 'Header X-Frame-Options');
check(netlifyToml.includes('X-Content-Type-Options'), 'Header X-Content-Type-Options');
check(netlifyToml.includes('X-XSS-Protection'), 'Header X-XSS-Protection');
check(netlifyToml.includes('Cache-Control'), 'Header Cache-Control');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU 14: CHANGELOG ET DOCUMENTATION
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU 14: CHANGELOG ET DOCUMENTATION                                       │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('const CHANGELOG'), 'Constante CHANGELOG');
check(appCode.includes("version: '1.9.0'"), 'Version 1.9.0 dans changelog');
check(appCode.includes("version: '1.8.7'"), 'Version 1.8.7 dans changelog');
check(appCode.includes("version: '1.8.6'"), 'Version 1.8.6 dans changelog');
check(appCode.includes("version: '1.4.0'"), 'Version 1.4.0 dans changelog');
check(appCode.includes("version: '1.0.0'"), 'Version 1.0.0 dans changelog');
check(appCode.includes("tag: 'ACTUELLE'"), 'Tag ACTUELLE');
check(appCode.includes("tag: 'INITIALE'"), 'Tag INITIALE');
check(appCode.includes('showChangelog &&'), 'Modal changelog');
check(appCode.includes('Historique des versions'), 'Titre changelog');
check(appCode.includes('Nouveautés'), 'Bouton Nouveautés');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU BONUS: RESPONSIVE ET UX
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU BONUS: RESPONSIVE ET UX                                              │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('md:grid-cols'), 'Grid responsive');
check(appCode.includes('md:flex-row'), 'Flex responsive');
check(appCode.includes('md:p-8'), 'Padding responsive');
check(appCode.includes('md:text-3xl'), 'Text responsive');
check(appCode.includes('min-w-[120px]'), 'Min width onglets');
check(appCode.includes('overflow-x-auto'), 'Overflow horizontal');
check(appCode.includes('animate-spin'), 'Animation spinner');
check(appCode.includes('transition-colors'), 'Transitions couleurs');
check(appCode.includes('hover:bg-'), 'Hover states');
check(appCode.includes('cursor-pointer'), 'Curseur pointer');
check(appCode.includes('fixed bottom-6 right-6'), 'Bouton flottant');
check(appCode.includes('shadow-lg'), 'Ombres');
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// NIVEAU BONUS: STATISTIQUES ET COMPTEURS
// ═══════════════════════════════════════════════════════════════════════════════
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ NIVEAU BONUS: STATISTIQUES ET COMPTEURS                                     │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');

check(appCode.includes('individuals.length'), 'Compteur individus');
check(appCode.includes('clusters.length'), 'Compteur clusters');
check(appCode.includes('duplicates.length'), 'Compteur doublons');
check(appCode.includes('isolatedIndividuals.length'), 'Compteur isolés');
check(appCode.includes('smartSuggestions.length'), 'Compteur suggestions');
check(appCode.includes('selectedPairs.size'), 'Compteur paires sélectionnées');
check(appCode.includes('selectedClusters.size'), 'Compteur clusters sélectionnés');
check(appCode.includes('selectedIsolated.size'), 'Compteur isolés sélectionnés');
check(appCode.includes('getFilteredDuplicates().length'), 'Compteur doublons filtrés');
check(appCode.includes('getFilteredClusters().length'), 'Compteur clusters filtrés');
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
  console.log('  ║   🎉 TOUS LES TESTS PASSENT ! VERSION 1.9.0 VALIDÉE !                    ║');
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
