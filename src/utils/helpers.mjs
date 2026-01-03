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
