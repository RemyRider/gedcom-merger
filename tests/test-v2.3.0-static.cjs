// ═══════════════════════════════════════════════════════════════════════════════
// TESTS STATIQUES v2.3.0 - FUSION INTELLIGENTE
// 45 nouveaux tests pour la catégorie 11
// À ajouter à test-complete.cjs
// ═══════════════════════════════════════════════════════════════════════════════

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║         CATÉGORIE 11: FUSION INTELLIGENTE v2.3.0 (45 tests)                   ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
console.log('║         CATÉGORIE 11: FUSION INTELLIGENTE v2.3.0 (45 tests)                  ║');
console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
console.log('');

// Charger fusionOrder.mjs
let fusionOrderCode = '';
try { fusionOrderCode = fs.readFileSync('./src/utils/fusionOrder.mjs', 'utf8'); } catch (e) { fusionOrderCode = ''; }

// --- 11.1 Module fusionOrder.mjs (12 tests) ---
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ 11.1 Module fusionOrder.mjs (12 tests)                                     │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');
check(fs.existsSync('./src/utils/fusionOrder.mjs'), 'Fichier fusionOrder.mjs existe');
check(fusionOrderCode.includes('export const FUSION_LEVELS'), 'Constante FUSION_LEVELS exportée');
check(fusionOrderCode.includes('CHILDREN: 0'), 'Niveau CHILDREN = 0');
check(fusionOrderCode.includes('SPOUSES: 1'), 'Niveau SPOUSES = 1');
check(fusionOrderCode.includes('PARENTS: 2'), 'Niveau PARENTS = 2');
check(fusionOrderCode.includes('INDEPENDENT: 3'), 'Niveau INDEPENDENT = 3');
check(fusionOrderCode.includes('export const createPairId'), 'Fonction createPairId exportée');
check(fusionOrderCode.includes('export const buildDependencyGraph'), 'Fonction buildDependencyGraph exportée');
check(fusionOrderCode.includes('export const calculateFusionOrder'), 'Fonction calculateFusionOrder exportée');
check(fusionOrderCode.includes('export const calculateEnrichedQuality'), 'Fonction calculateEnrichedQuality exportée');
check(fusionOrderCode.includes('export const canFuseLevel'), 'Fonction canFuseLevel exportée');
check(fusionOrderCode.includes('export const calculateFusionStats'), 'Fonction calculateFusionStats exportée');
console.log('');

// --- 11.2 Graphe de dépendances (10 tests) ---
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ 11.2 Graphe de dépendances (10 tests)                                      │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');
check(fusionOrderCode.includes('dependsOn'), 'Propriété dependsOn dans nœuds');
check(fusionOrderCode.includes('blocks'), 'Propriété blocks dans nœuds');
check(fusionOrderCode.includes('childDuplicates'), 'Détection enfants doublons');
check(fusionOrderCode.includes('spouseDuplicates'), 'Détection conjoints doublons');
check(fusionOrderCode.includes('parentDuplicates'), 'Détection parents doublons');
check(fusionOrderCode.includes('findDuplicatesAmongIds'), 'Fonction findDuplicatesAmongIds');
check(fusionOrderCode.includes('idToPairsMap'), 'Map inversée ID → paires');
check(fusionOrderCode.includes('duplicatePairsMap'), 'Map paires doublons');
check(fusionOrderCode.includes('peopleById'), 'Index personnes par ID');
check(fusionOrderCode.includes('allChildren') || fusionOrderCode.includes('allSpouses'), 'Collecte relations combinées');
console.log('');

// --- 11.3 Tri topologique (8 tests) ---
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ 11.3 Tri topologique (8 tests)                                             │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');
check(fusionOrderCode.includes('calculateLevel'), 'Fonction récursive calculateLevel');
check(fusionOrderCode.includes('nodeLevel'), 'Map niveaux calculés');
check(fusionOrderCode.includes('visited'), 'Set nœuds visités');
check(fusionOrderCode.includes('visiting'), 'Détection cycles');
check(fusionOrderCode.includes('maxDepLevel'), 'Calcul niveau max dépendances');
check(fusionOrderCode.includes('sortedLevels'), 'Résultat trié');
check(fusionOrderCode.includes("level === 0"), 'Traitement niveau 0');
check(fusionOrderCode.includes('Cycle détecté'), 'Message détection cycle');
console.log('');

// --- 11.4 Score qualité enrichi (10 tests) ---
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ 11.4 Score qualité enrichi (10 tests)                                      │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');
check(fusionOrderCode.includes('getDatePrecisionScore'), 'Fonction getDatePrecisionScore');
check(fusionOrderCode.includes('getPlacePrecisionScore'), 'Fonction getPlacePrecisionScore');
check(fusionOrderCode.includes('ABT') && fusionOrderCode.includes('BEF'), 'Gestion dates approximatives');
check(fusionOrderCode.includes('parts.length'), 'Comptage niveaux géographiques');
check(fusionOrderCode.includes('validParents'), 'Validation parents');
check(fusionOrderCode.includes('validSpouses'), 'Validation conjoints');
check(fusionOrderCode.includes('validChildren'), 'Validation enfants');
check(fusionOrderCode.includes('sourceCount'), 'Comptage sources');
check(fusionOrderCode.includes('SOUR'), 'Tag SOUR pour sources');
check(fusionOrderCode.includes('maxScore: 100'), 'Score max 100');
console.log('');

// --- 11.5 Utilitaires UI (5 tests) ---
console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
console.log('│ 11.5 Utilitaires UI (5 tests)                                              │');
console.log('└─────────────────────────────────────────────────────────────────────────────┘');
check(fusionOrderCode.includes('prepareLevelForDisplay'), 'Fonction prepareLevelForDisplay');
check(fusionOrderCode.includes('keepPerson'), 'Détermination personne à garder');
check(fusionOrderCode.includes('mergePerson'), 'Détermination personne à fusionner');
check(fusionOrderCode.includes('qualityDiff'), 'Différence de qualité');
check(fusionOrderCode.includes('isCompleted'), 'État complété');
console.log('');
