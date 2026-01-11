/**
 * GEDCOM Merger v2.3.0 - Fusion intelligente
 * 
 * Module pour calculer l'ordre optimal de fusion des doublons.
 * Principe : fusionner les enfants avant les conjoints avant les parents.
 * 
 * @module fusionOrder
 */

// ============================================================================
// TYPES ET CONSTANTES
// ============================================================================

/**
 * Niveaux de fusion (ordre croissant = fusionner en premier)
 */
export const FUSION_LEVELS = {
  CHILDREN: 0,    // Enfants - fusionner en premier
  SPOUSES: 1,     // Conjoints - fusionner ensuite
  PARENTS: 2,     // Parents - fusionner en dernier
  INDEPENDENT: 3  // Doublons sans dépendances relationnelles
};

/**
 * Labels pour l'affichage UI
 */
export const FUSION_LEVEL_LABELS = {
  [FUSION_LEVELS.CHILDREN]: 'Enfants',
  [FUSION_LEVELS.SPOUSES]: 'Conjoints',
  [FUSION_LEVELS.PARENTS]: 'Parents',
  [FUSION_LEVELS.INDEPENDENT]: 'Indépendants'
};

// ============================================================================
// CONSTRUCTION DU GRAPHE DE DÉPENDANCES
// ============================================================================

/**
 * Crée un identifiant unique pour une paire de doublons (ordre canonique)
 * @param {string} id1 - Premier ID
 * @param {string} id2 - Second ID
 * @returns {string} - Identifiant de paire
 */
export const createPairId = (id1, id2) => {
  return id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
};

/**
 * Trouve les doublons parmi un ensemble d'IDs
 * @param {string[]} ids - Liste d'IDs à vérifier
 * @param {Map} duplicatePairsMap - Map des paires de doublons (pairId -> pair)
 * @param {Map} idToPairsMap - Map inversée (personId -> Set de pairIds)
 * @returns {string[]} - Liste des pairIds de doublons trouvés
 */
export const findDuplicatesAmongIds = (ids, duplicatePairsMap, idToPairsMap) => {
  const foundPairIds = new Set();
  
  // Pour chaque ID, trouver ses paires de doublons
  ids.forEach(id => {
    const pairIds = idToPairsMap.get(id);
    if (pairIds) {
      pairIds.forEach(pairId => {
        const pair = duplicatePairsMap.get(pairId);
        if (pair) {
          // Vérifier que les deux membres de la paire sont dans la liste
          const otherId = pair.person1.id === id ? pair.person2.id : pair.person1.id;
          if (ids.includes(otherId)) {
            foundPairIds.add(pairId);
          }
        }
      });
    }
  });
  
  return Array.from(foundPairIds);
};

/**
 * Construit le graphe de dépendances entre les paires de doublons
 * 
 * @param {Array} duplicates - Liste des paires de doublons
 * @param {Array} individuals - Liste de tous les individus
 * @returns {Object} - { graph: Map, idToPairsMap: Map, duplicatePairsMap: Map }
 */
export const buildDependencyGraph = (duplicates, individuals) => {
  // Index pour accès rapide
  const peopleById = new Map();
  individuals.forEach(p => peopleById.set(p.id, p));
  
  // Map des paires de doublons par ID de paire
  const duplicatePairsMap = new Map();
  duplicates.forEach(pair => {
    const pairId = pair.id || createPairId(pair.person1.id, pair.person2.id);
    duplicatePairsMap.set(pairId, { ...pair, id: pairId });
  });
  
  // Map inversée : personId -> Set de pairIds
  const idToPairsMap = new Map();
  duplicatePairsMap.forEach((pair, pairId) => {
    [pair.person1.id, pair.person2.id].forEach(id => {
      if (!idToPairsMap.has(id)) idToPairsMap.set(id, new Set());
      idToPairsMap.get(id).add(pairId);
    });
  });
  
  // Construire le graphe de dépendances
  const graph = new Map();
  
  duplicatePairsMap.forEach((pair, pairId) => {
    const p1 = pair.person1;
    const p2 = pair.person2;
    
    // Collecter toutes les relations des deux personnes
    const allChildren = [...new Set([...(p1.children || []), ...(p2.children || [])])];
    const allSpouses = [...new Set([...(p1.spouses || []), ...(p2.spouses || [])])];
    const allParents = [...new Set([...(p1.parents || []), ...(p2.parents || [])])];
    
    // Trouver les doublons parmi les relations
    const childDuplicates = findDuplicatesAmongIds(allChildren, duplicatePairsMap, idToPairsMap);
    const spouseDuplicates = findDuplicatesAmongIds(allSpouses, duplicatePairsMap, idToPairsMap);
    const parentDuplicates = findDuplicatesAmongIds(allParents, duplicatePairsMap, idToPairsMap);
    
    // Ce nœud dépend de ses enfants et conjoints doublons (ils doivent être fusionnés AVANT)
    const dependsOn = [...new Set([...childDuplicates, ...spouseDuplicates])];
    
    // Ce nœud bloque ses parents doublons (ils doivent être fusionnés APRÈS)
    const blocks = parentDuplicates;
    
    graph.set(pairId, {
      id: pairId,
      pair,
      persons: [p1.id, p2.id],
      childDuplicates,
      spouseDuplicates,
      parentDuplicates,
      dependsOn,   // Fusionner ceux-ci AVANT ce nœud
      blocks,      // Ce nœud doit être fusionné AVANT ceux-ci
      level: null  // Sera calculé par le tri topologique
    });
  });
  
  return { graph, idToPairsMap, duplicatePairsMap };
};

// ============================================================================
// TRI TOPOLOGIQUE - CALCUL DE L'ORDRE OPTIMAL
// ============================================================================

/**
 * Calcule l'ordre optimal de fusion via tri topologique
 * Les nœuds sans dépendances (niveau 0) sont fusionnés en premier.
 * 
 * @param {Map} graph - Graphe de dépendances
 * @returns {Array} - Liste ordonnée des niveaux : [{ level, pairs, label }]
 */
export const calculateFusionOrder = (graph) => {
  const levels = new Map(); // level -> [pairIds]
  const nodeLevel = new Map(); // pairId -> level
  const visited = new Set();
  const visiting = new Set(); // Pour détecter les cycles
  
  /**
   * DFS pour calculer le niveau d'un nœud
   * Niveau = max(niveaux des dépendances) + 1, ou 0 si pas de dépendances
   */
  const calculateLevel = (pairId) => {
    // Déjà calculé
    if (nodeLevel.has(pairId)) return nodeLevel.get(pairId);
    
    // Détection de cycle
    if (visiting.has(pairId)) {
      console.warn(`Cycle détecté pour ${pairId}, niveau forcé à 0`);
      return 0;
    }
    
    visiting.add(pairId);
    
    const node = graph.get(pairId);
    if (!node) {
      visiting.delete(pairId);
      return FUSION_LEVELS.INDEPENDENT;
    }
    
    // Pas de dépendances = niveau 0 (feuille, fusionner en premier)
    if (!node.dependsOn || node.dependsOn.length === 0) {
      visiting.delete(pairId);
      nodeLevel.set(pairId, 0);
      return 0;
    }
    
    // Niveau = max(niveaux des dépendances) + 1
    let maxDepLevel = -1;
    for (const depId of node.dependsOn) {
      // Vérifier que la dépendance existe dans le graphe
      if (graph.has(depId)) {
        const depLevel = calculateLevel(depId);
        maxDepLevel = Math.max(maxDepLevel, depLevel);
      }
    }
    
    const level = maxDepLevel + 1;
    visiting.delete(pairId);
    nodeLevel.set(pairId, level);
    return level;
  };
  
  // Calculer le niveau de chaque nœud
  graph.forEach((node, pairId) => {
    const level = calculateLevel(pairId);
    if (!levels.has(level)) levels.set(level, []);
    levels.get(level).push(pairId);
  });
  
  // Construire le résultat trié
  const sortedLevels = Array.from(levels.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([level, pairIds]) => {
      // Déterminer le label du niveau
      let label = FUSION_LEVEL_LABELS[FUSION_LEVELS.INDEPENDENT];
      
      if (level === 0) {
        // Niveau 0 : principalement des enfants ou indépendants
        const hasChildRelations = pairIds.some(pairId => {
          const node = graph.get(pairId);
          return node && node.blocks && node.blocks.length > 0;
        });
        label = hasChildRelations ? FUSION_LEVEL_LABELS[FUSION_LEVELS.CHILDREN] : FUSION_LEVEL_LABELS[FUSION_LEVELS.INDEPENDENT];
      } else if (level === 1) {
        label = FUSION_LEVEL_LABELS[FUSION_LEVELS.SPOUSES];
      } else {
        label = FUSION_LEVEL_LABELS[FUSION_LEVELS.PARENTS];
      }
      
      return {
        level,
        pairIds,
        label,
        count: pairIds.length
      };
    });
  
  return sortedLevels;
};

// ============================================================================
// SCORE DE QUALITÉ ENRICHI
// ============================================================================

/**
 * Calcule un score de précision pour une date GEDCOM
 * @param {string} dateStr - Date au format GEDCOM
 * @returns {number} - Score de précision (0-15)
 */
export const getDatePrecisionScore = (dateStr) => {
  if (!dateStr) return 0;
  
  const upper = dateStr.toUpperCase();
  
  // Date approximative = score réduit
  if (/^(ABT|BEF|AFT|EST|CAL|FROM|TO|BET)\b/.test(upper)) {
    // Juste une année approximative
    if (/^\w+\s+\d{4}$/.test(upper)) return 5;
    // Date approximative avec mois
    if (/^\w+\s+\w+\s+\d{4}$/.test(upper)) return 8;
    // Date approximative complète
    return 10;
  }
  
  // Juste une année
  if (/^\d{4}$/.test(dateStr.trim())) return 8;
  
  // Année + mois
  if (/^\w+\s+\d{4}$/.test(upper)) return 12;
  
  // Date complète (jour + mois + année)
  if (/^\d{1,2}\s+\w+\s+\d{4}$/.test(upper)) return 15;
  
  return 5; // Format non reconnu
};

/**
 * Calcule un score de précision pour un lieu
 * @param {string} place - Lieu
 * @returns {number} - Score de précision (0-10)
 */
export const getPlacePrecisionScore = (place) => {
  if (!place) return 0;
  
  const parts = place.split(',').map(p => p.trim()).filter(p => p.length > 0);
  
  // Plus il y a de niveaux géographiques, plus c'est précis
  if (parts.length >= 4) return 10;  // Commune, Département, Région, Pays
  if (parts.length === 3) return 8;   // Commune, Département, Pays
  if (parts.length === 2) return 6;   // Commune, Département
  if (parts.length === 1) return 4;   // Commune seule
  
  return 2;
};

/**
 * Calcule le score de qualité enrichi d'une personne (v2.3.0)
 * 
 * @param {Object} person - Personne à évaluer
 * @param {Map} peopleById - Map des personnes par ID (pour validation des relations)
 * @returns {Object} - { score, details }
 */
export const calculateEnrichedQuality = (person, peopleById = new Map()) => {
  let score = 0;
  const details = [];
  
  // === QUALITÉ DES DONNÉES (50%) ===
  
  // Noms (0-15 points)
  const nameCount = person.names?.length || 0;
  const nameScore = Math.min(nameCount, 3) * 5;
  score += nameScore;
  if (nameScore > 0) details.push(`Noms: +${nameScore} (${nameCount} nom(s))`);
  
  // Dates avec précision (0-30 points)
  const birthDateScore = getDatePrecisionScore(person.birth);
  const deathDateScore = getDatePrecisionScore(person.death);
  score += birthDateScore + deathDateScore;
  if (birthDateScore > 0) details.push(`Date naissance: +${birthDateScore}`);
  if (deathDateScore > 0) details.push(`Date décès: +${deathDateScore}`);
  
  // Lieux avec précision (0-20 points)
  const birthPlaceScore = getPlacePrecisionScore(person.birthPlace);
  const deathPlaceScore = getPlacePrecisionScore(person.deathPlace);
  score += birthPlaceScore + deathPlaceScore;
  if (birthPlaceScore > 0) details.push(`Lieu naissance: +${birthPlaceScore}`);
  if (deathPlaceScore > 0) details.push(`Lieu décès: +${deathPlaceScore}`);
  
  // Autres champs (0-15 points)
  if (person.occupation) { score += 5; details.push('Profession: +5'); }
  if (person.religion) { score += 3; details.push('Religion: +3'); }
  if (person.baptism) { score += 4; details.push('Baptême: +4'); }
  if (person.burial) { score += 3; details.push('Inhumation: +3'); }
  
  // === COHÉRENCE RELATIONNELLE (30%) ===
  
  // Relations valides (0-30 points)
  let validParents = 0;
  let validSpouses = 0;
  let validChildren = 0;
  
  (person.parents || []).forEach(parentId => {
    if (peopleById.has(parentId)) validParents++;
  });
  (person.spouses || []).forEach(spouseId => {
    if (peopleById.has(spouseId)) validSpouses++;
  });
  (person.children || []).forEach(childId => {
    if (peopleById.has(childId)) validChildren++;
  });
  
  const parentScore = Math.min(validParents, 2) * 5; // Max 10
  const spouseScore = Math.min(validSpouses, 2) * 5; // Max 10
  const childrenScore = Math.min(validChildren, 4) * 2.5; // Max 10
  
  score += parentScore + spouseScore + childrenScore;
  if (parentScore > 0) details.push(`Parents valides: +${parentScore} (${validParents})`);
  if (spouseScore > 0) details.push(`Conjoints valides: +${spouseScore} (${validSpouses})`);
  if (childrenScore > 0) details.push(`Enfants valides: +${childrenScore} (${validChildren})`);
  
  // === SOURCES ET DOCUMENTATION (20%) ===
  
  // Sources référencées
  const sourceCount = (person.rawLinesByTag?.SOUR || []).length;
  const sourceScore = Math.min(sourceCount, 5) * 4; // Max 20
  score += sourceScore;
  if (sourceScore > 0) details.push(`Sources: +${sourceScore} (${sourceCount})`);
  
  return {
    score: Math.round(score),
    maxScore: 100,
    percentage: Math.round((score / 100) * 100),
    details
  };
};

// ============================================================================
// FONCTIONS UTILITAIRES POUR L'UI
// ============================================================================

/**
 * Prépare les données d'affichage pour une étape de fusion
 * 
 * @param {Object} levelData - Données du niveau { level, pairIds, label, count }
 * @param {Map} graph - Graphe de dépendances
 * @param {Map} duplicatePairsMap - Map des paires
 * @param {Map} peopleById - Map des personnes
 * @returns {Object} - Données formatées pour l'UI
 */
export const prepareLevelForDisplay = (levelData, graph, duplicatePairsMap, peopleById) => {
  const pairs = levelData.pairIds.map(pairId => {
    const node = graph.get(pairId);
    const pair = duplicatePairsMap.get(pairId);
    
    if (!pair) return null;
    
    // Calculer les scores de qualité enrichis
    const quality1 = calculateEnrichedQuality(pair.person1, peopleById);
    const quality2 = calculateEnrichedQuality(pair.person2, peopleById);
    
    // Déterminer la direction recommandée (garder le plus complet)
    const keepPerson = quality1.score >= quality2.score ? pair.person1 : pair.person2;
    const mergePerson = quality1.score >= quality2.score ? pair.person2 : pair.person1;
    const keepQuality = quality1.score >= quality2.score ? quality1 : quality2;
    const mergeQuality = quality1.score >= quality2.score ? quality2 : quality1;
    
    return {
      pairId,
      pair,
      similarity: pair.similarity,
      keepPerson,
      mergePerson,
      keepQuality,
      mergeQuality,
      qualityDiff: Math.abs(quality1.score - quality2.score),
      hasConflict: quality1.score === quality2.score && quality1.score > 0,
      dependsOn: node?.dependsOn || [],
      blocks: node?.blocks || []
    };
  }).filter(Boolean);
  
  // Trier par score de similarité décroissant
  pairs.sort((a, b) => b.similarity - a.similarity);
  
  return {
    level: levelData.level,
    label: levelData.label,
    count: pairs.length,
    pairs,
    isBlocked: false, // Sera mis à jour par l'UI
    isCompleted: false
  };
};

/**
 * Vérifie si un niveau peut être fusionné (toutes ses dépendances sont terminées)
 * 
 * @param {number} level - Niveau à vérifier
 * @param {Array} completedLevels - Niveaux déjà complétés
 * @returns {boolean} - true si le niveau peut être fusionné
 */
export const canFuseLevel = (level, completedLevels) => {
  // Le niveau 0 peut toujours être fusionné
  if (level === 0) return true;
  
  // Les autres niveaux nécessitent que tous les niveaux inférieurs soient complétés
  for (let i = 0; i < level; i++) {
    if (!completedLevels.includes(i)) return false;
  }
  
  return true;
};

/**
 * Calcule les statistiques globales de fusion
 * 
 * @param {Array} fusionOrder - Ordre de fusion calculé
 * @param {Map} graph - Graphe de dépendances
 * @returns {Object} - Statistiques
 */
export const calculateFusionStats = (fusionOrder, graph) => {
  let totalPairs = 0;
  let pairsWithDependencies = 0;
  let maxDependencyDepth = 0;
  
  fusionOrder.forEach(level => {
    totalPairs += level.count;
    
    level.pairIds.forEach(pairId => {
      const node = graph.get(pairId);
      if (node && node.dependsOn && node.dependsOn.length > 0) {
        pairsWithDependencies++;
      }
    });
    
    maxDependencyDepth = Math.max(maxDependencyDepth, level.level);
  });
  
  return {
    totalPairs,
    totalLevels: fusionOrder.length,
    pairsWithDependencies,
    independentPairs: totalPairs - pairsWithDependencies,
    maxDependencyDepth,
    complexityScore: pairsWithDependencies > 0 
      ? Math.round((pairsWithDependencies / totalPairs) * 100) 
      : 0
  };
};
