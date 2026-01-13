/**
 * GEDCOM Merger v2.4.0 - Fusion intelligente contextuelle
 * 
 * Module pour calculer l'ordre optimal de fusion des doublons.
 * Principe Top-Down : fusionner les parents stables avant les conjoints avant les enfants.
 * 
 * @module fusionOrder
 */

// ============================================================================
// TYPES ET CONSTANTES
// ============================================================================

/**
 * Niveaux de fusion Top-Down (ordre croissant = fusionner en premier)
 * 
 * LOGIQUE :
 * - Niveau 0 : Individus SANS parents doublons → ancêtres stables
 * - Niveau 1 : Individus SANS conjoints doublons → relations matrimoniales stables
 * - Niveau 2 : Individus AVEC dépendances → fusionner après leurs dépendances
 * - Niveau 3 : Indépendants → aucune relation avec d'autres doublons
 */
export const FUSION_LEVELS = {
  NO_PARENT_DUPLICATES: 0,    // Pas de parents doublons → fusionner en premier
  NO_SPOUSE_DUPLICATES: 1,    // Pas de conjoints doublons
  HAS_DEPENDENCIES: 2,        // A des dépendances → fusionner en dernier
  INDEPENDENT: 3              // Aucune relation avec d'autres doublons
};

/**
 * Labels pour l'affichage UI
 */
export const FUSION_LEVEL_LABELS = {
  [FUSION_LEVELS.NO_PARENT_DUPLICATES]: { 
    label: 'Parents stables', 
    emoji: '👴', 
    color: 'emerald',
    description: 'Individus sans parents en doublon - fusionner en premier'
  },
  [FUSION_LEVELS.NO_SPOUSE_DUPLICATES]: { 
    label: 'Conjoints stables', 
    emoji: '💑', 
    color: 'blue',
    description: 'Individus sans conjoints en doublon'
  },
  [FUSION_LEVELS.HAS_DEPENDENCIES]: { 
    label: 'Avec dépendances', 
    emoji: '🔗', 
    color: 'amber',
    description: 'Individus avec des relations qui sont aussi des doublons'
  },
  [FUSION_LEVELS.INDEPENDENT]: { 
    label: 'Indépendants', 
    emoji: '👤', 
    color: 'gray',
    description: 'Aucune relation avec d\'autres doublons'
  }
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
  
  ids.forEach(id => {
    const pairIds = idToPairsMap.get(id);
    if (pairIds) {
      pairIds.forEach(pairId => {
        const pair = duplicatePairsMap.get(pairId);
        if (pair) {
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
 * @returns {Object} - { graph: Map, stats: Object }
 */
export const buildDependencyGraph = (duplicates, individuals) => {
  const graph = new Map();
  
  // Index pour accès rapide
  const peopleById = new Map(individuals.map(p => [p.id, p]));
  const duplicatePairsMap = new Map();
  const idToPairsMap = new Map();
  
  // Construire les index
  duplicates.forEach(pair => {
    const pairId = createPairId(pair.person1.id, pair.person2.id);
    duplicatePairsMap.set(pairId, pair);
    
    [pair.person1.id, pair.person2.id].forEach(id => {
      if (!idToPairsMap.has(id)) idToPairsMap.set(id, new Set());
      idToPairsMap.get(id).add(pairId);
    });
  });
  
  // Pour chaque paire, analyser les dépendances
  duplicates.forEach(pair => {
    const pairId = createPairId(pair.person1.id, pair.person2.id);
    const p1 = pair.person1;
    const p2 = pair.person2;
    
    // Collecter toutes les relations des deux personnes
    const allParents = [...new Set([...(p1.parents || []), ...(p2.parents || [])])];
    const allSpouses = [...new Set([...(p1.spouses || []), ...(p2.spouses || [])])];
    const allChildren = [...new Set([...(p1.children || []), ...(p2.children || [])])];
    
    // Trouver les doublons parmi les relations
    const parentDuplicates = findDuplicatesAmongIds(allParents, duplicatePairsMap, idToPairsMap);
    const spouseDuplicates = findDuplicatesAmongIds(allSpouses, duplicatePairsMap, idToPairsMap);
    const childDuplicates = findDuplicatesAmongIds(allChildren, duplicatePairsMap, idToPairsMap);
    
    // Top-Down : les parents doublons sont des dépendances (à fusionner AVANT)
    // Les enfants doublons sont des bloqués (à fusionner APRÈS)
    const dependsOn = [...parentDuplicates, ...spouseDuplicates];
    const blocks = childDuplicates;
    
    graph.set(pairId, {
      pairId,
      pair,
      persons: [p1.id, p2.id],
      dependsOn,        // Paires à fusionner AVANT celle-ci
      blocks,           // Paires à fusionner APRÈS celle-ci
      parentDuplicates,
      spouseDuplicates,
      childDuplicates,
      hasParentDuplicates: parentDuplicates.length > 0,
      hasSpouseDuplicates: spouseDuplicates.length > 0,
      hasChildDuplicates: childDuplicates.length > 0
    });
  });
  
  // Statistiques
  const stats = {
    totalPairs: duplicates.length,
    withParentDuplicates: Array.from(graph.values()).filter(n => n.hasParentDuplicates).length,
    withSpouseDuplicates: Array.from(graph.values()).filter(n => n.hasSpouseDuplicates).length,
    withChildDuplicates: Array.from(graph.values()).filter(n => n.hasChildDuplicates).length,
    independent: Array.from(graph.values()).filter(n => 
      !n.hasParentDuplicates && !n.hasSpouseDuplicates && !n.hasChildDuplicates
    ).length
  };
  
  return { graph, stats, duplicatePairsMap, idToPairsMap, peopleById };
};

// ============================================================================
// CALCUL DE L'ORDRE DE FUSION (TOP-DOWN)
// ============================================================================

/**
 * Calcule l'ordre de fusion optimal selon l'approche Top-Down
 * 
 * @param {Map} graph - Graphe de dépendances
 * @returns {Array} - Niveaux de fusion ordonnés
 */
export const calculateFusionOrder = (graph) => {
  const levels = new Map();
  const nodeLevel = new Map();
  const visited = new Set();
  const visiting = new Set();
  
  /**
   * DFS pour calculer le niveau d'un nœud (Top-Down)
   * Niveau = max(niveaux des dépendances) + 1, ou 0 si pas de dépendances
   */
  const calculateLevel = (pairId) => {
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
    
    // Pas de dépendances = niveau 0 (parents stables, fusionner en premier)
    if (!node.dependsOn || node.dependsOn.length === 0) {
      visiting.delete(pairId);
      
      // Sous-classification selon le type
      let level;
      if (!node.hasParentDuplicates && !node.hasSpouseDuplicates) {
        level = FUSION_LEVELS.NO_PARENT_DUPLICATES;
      } else if (!node.hasSpouseDuplicates) {
        level = FUSION_LEVELS.NO_SPOUSE_DUPLICATES;
      } else {
        level = FUSION_LEVELS.INDEPENDENT;
      }
      
      nodeLevel.set(pairId, level);
      return level;
    }
    
    // Calculer récursivement le niveau max des dépendances
    let maxDepLevel = -1;
    for (const depId of node.dependsOn) {
      if (graph.has(depId)) {
        const depLevel = calculateLevel(depId);
        maxDepLevel = Math.max(maxDepLevel, depLevel);
      }
    }
    
    // Le niveau de ce nœud = max des dépendances + 1
    const level = maxDepLevel >= 0 ? FUSION_LEVELS.HAS_DEPENDENCIES : FUSION_LEVELS.NO_PARENT_DUPLICATES;
    
    visiting.delete(pairId);
    nodeLevel.set(pairId, level);
    return level;
  };
  
  // Calculer le niveau de chaque nœud
  for (const pairId of graph.keys()) {
    calculateLevel(pairId);
  }
  
  // Grouper par niveau
  for (const [pairId, level] of nodeLevel) {
    if (!levels.has(level)) levels.set(level, []);
    levels.get(level).push(pairId);
  }
  
  // Convertir en array trié par niveau
  const result = Array.from(levels.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([level, pairIds]) => ({
      level,
      label: FUSION_LEVEL_LABELS[level]?.label || `Niveau ${level}`,
      emoji: FUSION_LEVEL_LABELS[level]?.emoji || '📋',
      color: FUSION_LEVEL_LABELS[level]?.color || 'gray',
      description: FUSION_LEVEL_LABELS[level]?.description || '',
      pairIds,
      count: pairIds.length
    }));
  
  return result;
};

// ============================================================================
// DÉTECTION DES DOUBLONS LIÉS (POUR FUSION GUIDÉE CONTEXTUELLE)
// ============================================================================

/**
 * Détecte les doublons liés à une paire donnée
 * Utilisé pour déclencher l'assistant de fusion guidée
 * 
 * @param {Object} pair - Paire de doublons à analyser
 * @param {Array} duplicates - Liste de tous les doublons
 * @param {Array} individuals - Liste de tous les individus
 * @returns {Object} - { hasRelatedDuplicates, parents[], spouses[], children[] }
 */
export const detectRelatedDuplicates = (pair, duplicates, individuals) => {
  const { graph, duplicatePairsMap, peopleById } = buildDependencyGraph(duplicates, individuals);
  
  const pairId = createPairId(pair.person1.id, pair.person2.id);
  const node = graph.get(pairId);
  
  if (!node) {
    return {
      hasRelatedDuplicates: false,
      parents: [],
      spouses: [],
      children: [],
      total: 0
    };
  }
  
  // Récupérer les détails de chaque paire liée
  const getRelatedPairs = (pairIds) => {
    return pairIds.map(pid => {
      const p = duplicatePairsMap.get(pid);
      if (!p) return null;
      return {
        pairId: pid,
        person1: p.person1,
        person2: p.person2,
        score: p.score,
        level: p.level
      };
    }).filter(Boolean);
  };
  
  const parents = getRelatedPairs(node.parentDuplicates);
  const spouses = getRelatedPairs(node.spouseDuplicates);
  const children = getRelatedPairs(node.childDuplicates);
  
  return {
    hasRelatedDuplicates: parents.length > 0 || spouses.length > 0 || children.length > 0,
    parents,
    spouses,
    children,
    total: parents.length + spouses.length + children.length,
    // Ordre recommandé (Top-Down)
    recommendedOrder: [...parents, ...spouses, ...children]
  };
};

/**
 * Vérifie si une fusion nécessite l'assistant guidé
 * 
 * @param {Object} pair - Paire à vérifier
 * @param {Array} duplicates - Liste des doublons
 * @param {Array} individuals - Liste des individus
 * @returns {boolean} - true si l'assistant doit être affiché
 */
export const needsGuidedFusion = (pair, duplicates, individuals) => {
  const related = detectRelatedDuplicates(pair, duplicates, individuals);
  return related.hasRelatedDuplicates;
};

// ============================================================================
// SCORE DE QUALITÉ ENRICHI
// ============================================================================

/**
 * Calcule la précision d'une date
 * @param {string} dateStr - Date au format GEDCOM
 * @returns {number} - Score 0-100
 */
export const getDatePrecisionScore = (dateStr) => {
  if (!dateStr) return 0;
  
  const d = dateStr.toUpperCase();
  
  // Date complète exacte : "15 MAR 1850"
  if (/^\d{1,2}\s+[A-Z]{3}\s+\d{4}$/.test(d)) return 100;
  
  // Mois et année : "MAR 1850"
  if (/^[A-Z]{3}\s+\d{4}$/.test(d)) return 70;
  
  // Année seule : "1850"
  if (/^\d{4}$/.test(d)) return 50;
  
  // Date approximative : "ABT 1850", "BEF 1850", "AFT 1850"
  if (/^(ABT|BEF|AFT|EST|CAL)\s+/.test(d)) return 30;
  
  // Période : "BET 1850 AND 1860"
  if (/^BET\s+\d{4}\s+AND\s+\d{4}$/.test(d)) return 40;
  
  return 10; // Autre format
};

/**
 * Calcule la précision d'un lieu
 * @param {string} place - Lieu au format GEDCOM
 * @returns {number} - Score 0-100
 */
export const getPlacePrecisionScore = (place) => {
  if (!place) return 0;
  
  const parts = place.split(',').map(p => p.trim()).filter(Boolean);
  
  // 4+ niveaux : "Rue, Ville, Département, Région, Pays"
  if (parts.length >= 4) return 100;
  
  // 3 niveaux : "Ville, Département, Pays"
  if (parts.length === 3) return 80;
  
  // 2 niveaux : "Ville, Pays"
  if (parts.length === 2) return 60;
  
  // 1 niveau : "Pays" ou "Ville"
  if (parts.length === 1) return 30;
  
  return 0;
};

/**
 * Calcule un score de qualité enrichi pour une personne
 * Utilisé pour déterminer quelle personne garder lors de la fusion
 * 
 * @param {Object} person - Personne à évaluer
 * @param {Map} peopleById - Index des personnes par ID
 * @returns {Object} - { total, breakdown }
 */
export const calculateEnrichedQuality = (person, peopleById = new Map()) => {
  let total = 0;
  const breakdown = {};
  
  // 1. Précision des dates (max 25 pts)
  const birthPrecision = getDatePrecisionScore(person.birth);
  const deathPrecision = getDatePrecisionScore(person.death);
  const baptismPrecision = getDatePrecisionScore(person.baptism);
  breakdown.datePrecision = Math.round((birthPrecision + deathPrecision + baptismPrecision) / 12);
  total += breakdown.datePrecision;
  
  // 2. Précision des lieux (max 20 pts)
  const birthPlacePrecision = getPlacePrecisionScore(person.birthPlace);
  const deathPlacePrecision = getPlacePrecisionScore(person.deathPlace);
  breakdown.placePrecision = Math.round((birthPlacePrecision + deathPlacePrecision) / 10);
  total += breakdown.placePrecision;
  
  // 3. Relations valides (max 30 pts)
  let validParents = 0, validSpouses = 0, validChildren = 0;
  
  (person.parents || []).forEach(parentId => {
    if (peopleById.has(parentId)) validParents++;
  });
  (person.spouses || []).forEach(spouseId => {
    if (peopleById.has(spouseId)) validSpouses++;
  });
  (person.children || []).forEach(childId => {
    if (peopleById.has(childId)) validChildren++;
  });
  
  breakdown.validRelations = Math.min(30, validParents * 5 + validSpouses * 5 + validChildren * 3);
  total += breakdown.validRelations;
  
  // 4. Sources et notes (max 15 pts)
  let sourceCount = 0;
  if (person.rawLinesByTag) {
    sourceCount = (person.rawLinesByTag.SOUR || []).length;
    sourceCount += (person.rawLinesByTag.NOTE || []).length;
  } else if (person.rawLines) {
    sourceCount = person.rawLines.filter(l => l.includes(' SOUR ') || l.includes(' NOTE ')).length;
  }
  breakdown.sources = Math.min(15, sourceCount * 3);
  total += breakdown.sources;
  
  // 5. Complétude des champs (max 10 pts)
  let filledFields = 0;
  ['name', 'birth', 'birthPlace', 'death', 'deathPlace', 'occupation', 'sex'].forEach(field => {
    if (person[field]) filledFields++;
  });
  breakdown.completeness = Math.round((filledFields / 7) * 10);
  total += breakdown.completeness;
  
  return {
    total: Math.min(100, total),
    breakdown,
    person: person.id
  };
};

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Prépare les données d'un niveau pour l'affichage
 * 
 * @param {Object} levelData - Données du niveau
 * @param {Map} graph - Graphe de dépendances
 * @param {Map} duplicatePairsMap - Map des paires
 * @param {Map} peopleById - Index des personnes
 * @returns {Array} - Paires enrichies pour l'affichage
 */
export const prepareLevelForDisplay = (levelData, graph, duplicatePairsMap, peopleById) => {
  return levelData.pairIds.map(pairId => {
    const pair = duplicatePairsMap.get(pairId);
    const node = graph.get(pairId);
    
    if (!pair) return null;
    
    const quality1 = calculateEnrichedQuality(pair.person1, peopleById);
    const quality2 = calculateEnrichedQuality(pair.person2, peopleById);
    
    return {
      pairId,
      person1: pair.person1,
      person2: pair.person2,
      score: pair.score,
      level: pair.level,
      quality1,
      quality2,
      keepPerson: quality1.total >= quality2.total ? pair.person1 : pair.person2,
      mergePerson: quality1.total >= quality2.total ? pair.person2 : pair.person1,
      qualityDiff: Math.abs(quality1.total - quality2.total),
      dependencies: node ? {
        parents: node.parentDuplicates.length,
        spouses: node.spouseDuplicates.length,
        children: node.childDuplicates.length
      } : { parents: 0, spouses: 0, children: 0 }
    };
  }).filter(Boolean);
};

/**
 * Vérifie si un niveau peut être fusionné
 * (tous les niveaux précédents doivent être complétés)
 * 
 * @param {number} level - Niveau à vérifier
 * @param {Array} completedLevels - Niveaux déjà complétés
 * @returns {boolean}
 */
export const canFuseLevel = (level, completedLevels) => {
  if (level === 0) return true;
  
  // Tous les niveaux inférieurs doivent être complétés
  for (let i = 0; i < level; i++) {
    if (!completedLevels.includes(i)) return false;
  }
  return true;
};

/**
 * Calcule les statistiques de fusion
 * 
 * @param {Array} fusionOrder - Ordre de fusion calculé
 * @param {Map} graph - Graphe de dépendances
 * @returns {Object} - Statistiques
 */
export const calculateFusionStats = (fusionOrder, graph) => {
  const totalPairs = fusionOrder.reduce((sum, level) => sum + level.count, 0);
  const withDependencies = Array.from(graph.values()).filter(n => n.dependsOn.length > 0).length;
  const independent = Array.from(graph.values()).filter(n => 
    !n.hasParentDuplicates && !n.hasSpouseDuplicates && !n.hasChildDuplicates
  ).length;
  
  return {
    totalPairs,
    totalLevels: fusionOrder.length,
    withDependencies,
    independent,
    levelBreakdown: fusionOrder.map(l => ({ level: l.level, label: l.label, count: l.count }))
  };
};

/**
 * Calcule l'impact d'une fusion sur les autres doublons
 * 
 * @param {Object} pair - Paire à fusionner
 * @param {Map} graph - Graphe de dépendances
 * @returns {Object} - Impact de la fusion
 */
export const calculateFusionImpact = (pair, graph) => {
  const pairId = createPairId(pair.person1.id, pair.person2.id);
  const node = graph.get(pairId);
  
  if (!node) {
    return {
      blockedPairs: 0,
      unlockedPairs: 0,
      familiesToConsolidate: 0
    };
  }
  
  return {
    blockedPairs: node.blocks.length,
    dependenciesRemaining: node.dependsOn.length,
    parentDuplicates: node.parentDuplicates.length,
    spouseDuplicates: node.spouseDuplicates.length,
    childDuplicates: node.childDuplicates.length
  };
};
