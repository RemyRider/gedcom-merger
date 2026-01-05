/**
 * GEDCOM Merger - Fonctions utilitaires
 * Extraites de App.jsx pour permettre les tests unitaires
 */

// Variantes de prénoms français/latins
export const NAME_VARIANTS = {
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

/**
 * Extrait l'année d'une date GEDCOM
 * @param {string} dateStr - Date au format GEDCOM (ex: "15 MAR 1726" ou "1726")
 * @returns {number|null} - L'année ou null si non trouvée
 */
export const extractYear = (dateStr) => {
  if (!dateStr) return null;
  const match = dateStr.match(/(\d{4})/);
  return match ? parseInt(match[1]) : null;
};

/**
 * Normalise un lieu (retire le code postal en préfixe)
 * @param {string} place - Lieu brut
 * @returns {string} - Lieu normalisé
 */
export const normalizePlace = (place) => {
  if (!place) return '';
  return place.replace(/^\d{5}\s+/, '').trim();
};

/**
 * Normalise un prénom en utilisant les variantes connues
 * @param {string} name - Prénom brut
 * @returns {string} - Prénom canonique
 */
export const normalizeFirstName = (name) => {
  if (!name) return '';
  const lower = name.toLowerCase().trim();
  for (const [canonical, variants] of Object.entries(NAME_VARIANTS)) {
    if (lower === canonical || variants.includes(lower)) return canonical;
  }
  return lower;
};

/**
 * Calcule le code Soundex français d'une chaîne
 * @param {string} str - Chaîne à encoder
 * @returns {string} - Code Soundex (4 caractères)
 */
export const soundex = (str) => {
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

/**
 * Normalise un lieu complet (casse + virgules)
 * @param {string} place - Lieu brut
 * @returns {string} - Lieu normalisé en Title Case
 */
export const normalizePlaceFull = (place) => {
  if (!place) return '';
  return place
    .toLowerCase()
    .split(',')
    .map(part => part.trim())
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(', ');
};

/**
 * Détermine le niveau de suspicion d'un doublon
 * @param {number} score - Score de similarité (0-100)
 * @param {number} criteriaCount - Nombre de critères correspondants
 * @returns {object} - { level: 'FORT'|'MOYEN'|'FAIBLE', emoji: string }
 */
export const getSuspicionLevel = (score, criteriaCount) => {
  if ((score >= 90 && criteriaCount >= 5) || (score >= 80 && criteriaCount >= 3)) {
    return { level: 'FORT', emoji: '🔴' };
  }
  if ((score >= 70 && criteriaCount >= 2) || (score >= 60 && criteriaCount >= 4)) {
    return { level: 'MOYEN', emoji: '🟡' };
  }
  return { level: 'FAIBLE', emoji: '🟢' };
};

// ============================================================================
// v2.2.0 - FONCTIONS DE GESTION DES CONFLITS
// ============================================================================

/**
 * Vérifie si deux valeurs sont compatibles selon leur type
 * @param {string} v1 - Première valeur
 * @param {string} v2 - Deuxième valeur
 * @param {string} type - Type de comparaison: 'date', 'place', ou 'text'
 * @returns {boolean} - true si les valeurs sont compatibles
 */
export const areValuesCompatible = (v1, v2, type) => {
  if (!v1 || !v2) return true; // Si une valeur est vide, pas de conflit
  
  if (type === 'date') {
    // Si les dates sont identiques (texte), c'est compatible
    if (v1.trim().toLowerCase() === v2.trim().toLowerCase()) return true;
    
    // v2.2.2: Si une des dates est approximative/partielle, comparer les années
    if (isApproximateDate(v1) || isApproximateDate(v2)) {
      const year1 = extractYear(v1);
      const year2 = extractYear(v2);
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

/**
 * v2.2.2: Vérifie si une date est approximative ou partielle
 * @param {string} dateStr - Date au format GEDCOM
 * @returns {boolean} - true si la date est approximative/partielle
 */
export const isApproximateDate = (dateStr) => {
  if (!dateStr) return true;
  const upper = dateStr.toUpperCase();
  // ABT (about), BEF (before), AFT (after), EST (estimated), CAL (calculated)
  if (/^(ABT|BEF|AFT|EST|CAL|FROM|TO|BET)\b/.test(upper)) return true;
  // Si c'est juste une année (ex: "1726")
  if (/^\d{4}$/.test(dateStr.trim())) return true;
  return false;
};

/**
 * Liste des champs à vérifier pour les conflits
 */
export const CONFLICT_FIELDS = [
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

/**
 * Détecte les conflits entre deux personnes avant fusion
 * @param {object} person1 - Première personne
 * @param {object} person2 - Deuxième personne
 * @returns {Array} - Liste des conflits détectés
 */
export const detectMergeConflicts = (person1, person2) => {
  const conflicts = [];
  
  CONFLICT_FIELDS.forEach(({ key, label, type }) => {
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
        person1Name: person1.names?.[0] || person1.id,
        person2Name: person2.names?.[0] || person2.id,
        resolved: false,
        chosenValue: null,
        chosenSource: null
      });
    }
  });
  
  return conflicts;
};

/**
 * v2.2.4: Nettoie les familles orphelines après fusion/suppression
 * @param {Map} families - Map des familles
 * @param {Set} removedIds - IDs des personnes supprimées
 * @param {Array} people - Liste des personnes restantes
 * @param {Map} mergeMap - Map des redirections (removedId -> targetId)
 * @returns {object} - { cleanedFamilies: Map, orphanReport: object }
 */
export const cleanOrphanedFamilies = (families, removedIds, people, mergeMap = new Map()) => {
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
    
    // v2.2.4: Mettre à jour enfants vers cibles de fusion, filtrer supprimés
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
