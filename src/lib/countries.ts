// src/lib/countries.ts
// Mapeo exhaustivo y normalizado de países y selecciones a códigos ISO 3166-1 alpha-2 para banderas de FlagCDN

const rawCountryMap: Record<string, string> = {
  // Sudamérica (CONMEBOL)
  'argentina': 'ar',
  'brasil': 'br',
  'brazil': 'br',
  'uruguay': 'uy',
  'colombia': 'co',
  'chile': 'cl',
  'ecuador': 'ec',
  'peru': 'pe',
  'paraguay': 'py',
  'bolivia': 'bo',
  'venezuela': 've',
  'guyana': 'gy',
  'surinam': 'sr',
  'suriname': 'sr',
  'guayana francesa': 'gf',

  // Norte, Centroamérica y Caribe (CONCACAF)
  'mexico': 'mx',
  'estados unidos': 'us',
  'usa': 'us',
  'eeuu': 'us',
  'united states': 'us',
  'canada': 'ca',
  'costa rica': 'cr',
  'panama': 'pa',
  'honduras': 'hn',
  'el salvador': 'sv',
  'guatemala': 'gt',
  'jamaica': 'jm',
  'cuba': 'cu',
  'haiti': 'ht',
  'republica dominicana': 'do',
  'dominican republic': 'do',
  'trinidad y tobago': 'tt',
  'trinidad and tobago': 'tt',
  'curazao': 'cw',
  'curacao': 'cw',
  'nicaragua': 'ni',
  'belice': 'bz',
  'belize': 'bz',
  'puerto rico': 'pr',
  'guadalupe': 'gp',
  'martinica': 'mq',
  'barbados': 'bb',
  'bermudas': 'bm',

  // Europa (UEFA)
  'espana': 'es',
  'spain': 'es',
  'francia': 'fr',
  'france': 'fr',
  'alemania': 'de',
  'germany': 'de',
  'inglaterra': 'gb-eng',
  'england': 'gb-eng',
  'italia': 'it',
  'italy': 'it',
  'portugal': 'pt',
  'paises bajos': 'nl',
  'netherlands': 'nl',
  'holanda': 'nl',
  'holland': 'nl',
  'belgica': 'be',
  'belgium': 'be',
  'croacia': 'hr',
  'croatia': 'hr',
  'suiza': 'ch',
  'switzerland': 'ch',
  'dinamarca': 'dk',
  'denmark': 'dk',
  'suecia': 'se',
  'sweden': 'se',
  'noruega': 'no',
  'norway': 'no',
  'polonia': 'pl',
  'poland': 'pl',
  'serbia': 'rs',
  'austria': 'at',
  'turquia': 'tr',
  'turkey': 'tr',
  'grecia': 'gr',
  'greece': 'gr',
  'ucrania': 'ua',
  'ukraine': 'ua',
  'republica checa': 'cz',
  'czech republic': 'cz',
  'chequia': 'cz',
  'czechia': 'cz',
  'escocia': 'gb-sct',
  'scotland': 'gb-sct',
  'gales': 'gb-wls',
  'wales': 'gb-wls',
  'irlanda': 'ie',
  'ireland': 'ie',
  'irlanda del norte': 'gb-nir',
  'northern ireland': 'gb-nir',
  'hungria': 'hu',
  'hungary': 'hu',
  'rumania': 'ro',
  'romania': 'ro',
  'bulgaria': 'bg',
  'finlandia': 'fi',
  'finland': 'fi',
  'eslovaquia': 'sk',
  'slovakia': 'sk',
  'eslovenia': 'si',
  'slovenia': 'si',
  'islandia': 'is',
  'iceland': 'is',
  'bosnia': 'ba',
  'bosnia y herzegovina': 'ba',
  'bosnia and herzegovina': 'ba',
  'albania': 'al',
  'macedonia del norte': 'mk',
  'north macedonia': 'mk',
  'macedonia': 'mk',
  'montenegro': 'me',
  'georgia': 'ge',
  'armenia': 'am',
  'azerbaiyan': 'az',
  'azerbaijan': 'az',
  'chipre': 'cy',
  'cyprus': 'cy',
  'israel': 'il',
  'kazajistan': 'kz',
  'kazakhstan': 'kz',
  'rusia': 'ru',
  'russia': 'ru',
  'bielorrusia': 'by',
  'belarus': 'by',
  'luxemburgo': 'lu',
  'luxembourg': 'lu',
  'letonia': 'lv',
  'latvia': 'lv',
  'lituania': 'lt',
  'lithuania': 'lt',
  'estonia': 'ee',
  'kosovo': 'xk',
  'malta': 'mt',
  'moldavia': 'md',
  'moldova': 'md',
  'andorra': 'ad',
  'san marino': 'sm',
  'gibraltar': 'gi',
  'liechtenstein': 'li',
  'islas feroe': 'fo',
  'faroe islands': 'fo',

  // África (CAF)
  'marruecos': 'ma',
  'morocco': 'ma',
  'senegal': 'sn',
  'nigeria': 'ng',
  'camerun': 'cm',
  'cameroon': 'cm',
  'ghana': 'gh',
  'egipto': 'eg',
  'egypt': 'eg',
  'costa de marfil': 'ci',
  'ivory coast': 'ci',
  'cote d\'ivoire': 'ci',
  'tunez': 'tn',
  'tunisia': 'tn',
  'argelia': 'dz',
  'algeria': 'dz',
  'sudafrica': 'za',
  'south africa': 'za',
  'mali': 'ml',
  'burkina faso': 'bf',
  'rd congo': 'cd',
  'congo': 'cg',
  'guinea': 'gn',
  'guinea ecuatorial': 'gq',
  'equatorial guinea': 'gq',
  'gabon': 'ga',
  'angola': 'ao',
  'zambia': 'zm',
  'cabo verde': 'cv',
  'cape verde': 'cv',
  'uganda': 'ug',
  'kenia': 'ke',
  'kenya': 'ke',
  'mozambique': 'mz',
  'madagascar': 'mg',
  'tanzania': 'tz',
  'benin': 'bj',
  'togo': 'tg',
  'mauritania': 'mr',
  'etiopia': 'et',
  'ethiopia': 'et',
  'libia': 'ly',
  'libya': 'ly',
  'sudan': 'sd',
  'zimbabue': 'zw',
  'zimbabwe': 'zw',
  'namibia': 'na',

  // Asia y Oriente Medio (AFC)
  'japon': 'jp',
  'japan': 'jp',
  'corea del sur': 'kr',
  'south korea': 'kr',
  'korea': 'kr',
  'arabia saudita': 'sa',
  'saudi arabia': 'sa',
  'arabia saudi': 'sa',
  'iran': 'ir',
  'qatar': 'qa',
  'catar': 'qa',
  'emiratos arabes unidos': 'ae',
  'emiratos arabes': 'ae',
  'eau': 'ae',
  'uae': 'ae',
  'irak': 'iq',
  'iraq': 'iq',
  'australia': 'au',
  'china': 'cn',
  'uzbekistan': 'uz',
  'jordania': 'jo',
  'jordan': 'jo',
  'oman': 'om',
  'barein': 'bh',
  'bahrein': 'bh',
  'bahrain': 'bh',
  'siria': 'sy',
  'syria': 'sy',
  'kuwait': 'kw',
  'palestina': 'ps',
  'palestine': 'ps',
  'libano': 'lb',
  'lebanon': 'lb',
  'vietnam': 'vn',
  'tailandia': 'th',
  'thailand': 'th',
  'indonesia': 'id',
  'malasia': 'my',
  'malaysia': 'my',
  'india': 'in',
  'corea del norte': 'kp',
  'north korea': 'kp',
  'filipinas': 'ph',
  'philippines': 'ph',
  'singapur': 'sg',
  'singapore': 'sg',

  // Oceanía (OFC)
  'nueva zelanda': 'nz',
  'new zealand': 'nz',
  'fiyi': 'fj',
  'fiji': 'fj',
  'tahiti': 'pf',
  'nueva caledonia': 'nc',
  'papua nueva guinea': 'pg',
  'islas salomon': 'sb',
  'solomon islands': 'sb',
  'samoa': 'ws',
  'tonga': 'to',
  'vanuatu': 'vu',
};

// Normalizar texto: minúsculas, sin acentos, sin puntuación innecesaria
export const normalizeCountryName = (name: string): string => {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // eliminar tildes
    .replace(/[^a-z0-9\s]/g, ' ') // limpiar caracteres raros
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Obtiene el código ISO de 2 letras de una selección/país a partir de su nombre o alias.
 */
export const getCountryCode = (teamName: string): string | undefined => {
  if (!teamName || typeof teamName !== 'string') return undefined;

  const clean = teamName.trim();
  // Si ya es un código ISO de 2 o 3 caracteres válido (ej: 'ar', 'ES', 'gb-eng')
  const lowerClean = clean.toLowerCase();
  if (lowerClean.length === 2 && /^[a-z]{2}$/.test(lowerClean)) {
    return lowerClean;
  }
  if (lowerClean.startsWith('gb-')) {
    return lowerClean;
  }

  const normalized = normalizeCountryName(clean);

  // Búsqueda directa normalizada
  if (rawCountryMap[normalized]) {
    return rawCountryMap[normalized];
  }

  // Búsqueda en mapa original
  if (rawCountryMap[clean]) {
    return rawCountryMap[clean];
  }

  // Búsqueda parcial o de coincidencia de palabras clave
  const mapKeys = Object.keys(rawCountryMap);
  for (const key of mapKeys) {
    if (normalized === key || normalized.startsWith(key + ' ') || normalized.endsWith(' ' + key)) {
      return rawCountryMap[key];
    }
  }

  // Coincidencia de subcadena más larga
  let bestMatch: string | undefined = undefined;
  let bestLen = 0;
  for (const key of mapKeys) {
    if (key.length >= 4 && (normalized.includes(key) || key.includes(normalized))) {
      if (key.length > bestLen) {
        bestLen = key.length;
        bestMatch = rawCountryMap[key];
      }
    }
  }

  return bestMatch;
};

/**
 * Retorna la URL oficial del SVG de la bandera en FlagCDN
 */
export const getCountryFlagUrl = (teamName: string): string | null => {
  const code = getCountryCode(teamName);
  if (!code) return null;
  // Manejo de banderas del Reino Unido (England, Scotland, Wales) en FlagCDN
  if (code === 'gb-eng') return 'https://flagcdn.com/gb-eng.svg';
  if (code === 'gb-sct') return 'https://flagcdn.com/gb-sct.svg';
  if (code === 'gb-wls') return 'https://flagcdn.com/gb-wls.svg';
  if (code === 'gb-nir') return 'https://flagcdn.com/gb-nir.svg';
  return `https://flagcdn.com/${code}.svg`;
};

/**
 * Sugerencia de región por defecto según el país
 */
export const inferCountryRegion = (teamName: string): 'EU' | 'SA' | 'NA' | 'AF' | 'AS' | 'OC' => {
  const code = getCountryCode(teamName) || '';
  const saCodes = ['ar', 'br', 'uy', 'co', 'cl', 'ec', 'pe', 'py', 'bo', 've', 'gy', 'sr', 'gf'];
  const naCodes = ['mx', 'us', 'ca', 'cr', 'pa', 'hn', 'sv', 'gt', 'jm', 'cu', 'ht', 'do', 'tt', 'cw', 'ni', 'bz', 'pr'];
  const afCodes = ['ma', 'sn', 'ng', 'cm', 'gh', 'eg', 'ci', 'tn', 'dz', 'za', 'ml', 'bf', 'cd', 'cg', 'gn', 'gq', 'ga', 'ao', 'zm', 'cv', 'ug', 'ke', 'mz', 'mg', 'tz', 'bj', 'tg', 'mr', 'et', 'ly', 'sd', 'zw', 'na'];
  const asCodes = ['jp', 'kr', 'sa', 'ir', 'qa', 'ae', 'iq', 'au', 'cn', 'uz', 'jo', 'om', 'bh', 'sy', 'kw', 'ps', 'lb', 'vn', 'th', 'id', 'my', 'in', 'kp', 'ph', 'sg'];
  const ocCodes = ['nz', 'fj', 'pf', 'nc', 'pg', 'sb', 'ws', 'to', 'vu'];

  if (saCodes.includes(code)) return 'SA';
  if (naCodes.includes(code)) return 'NA';
  if (afCodes.includes(code)) return 'AF';
  if (asCodes.includes(code)) return 'AS';
  if (ocCodes.includes(code)) return 'OC';
  return 'EU';
};
