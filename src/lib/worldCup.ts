// src/lib/worldCup.ts
// Catálogo integral de selecciones nacionales y generador dinámico para la Copa del Mundo

export interface NationalTeam {
  name: string;
  att: number;
  opp: number;
  def: number;
  color1: string;
  color2: string;
  isFlag: boolean;
  region: 'EU' | 'SA' | 'NA' | 'AF' | 'AS' | 'OC';
  tier?: 1 | 2 | 3 | 4; // 1: Élite mundial, 2: Potencia continental, 3: Aspirante competitivo, 4: Revelación/Sorpresa
}

// Catálogo ampliado de más de 60 selecciones internacionales con estadísticas equilibradas y banderas
export const ALL_WORLD_CUP_TEAMS: NationalTeam[] = [
  // ==========================================
  // UEFA (EUROPA) - 24 selecciones
  // ==========================================
  { name: 'Francia', att: 5, opp: 5, def: 4, color1: '#002395', color2: '#ffffff', isFlag: true, region: 'EU', tier: 1 },
  { name: 'España', att: 5, opp: 5, def: 4, color1: '#aa151b', color2: '#f1bf00', isFlag: true, region: 'EU', tier: 1 },
  { name: 'Inglaterra', att: 4, opp: 5, def: 4, color1: '#ffffff', color2: '#ce1124', isFlag: true, region: 'EU', tier: 1 },
  { name: 'Alemania', att: 4, opp: 5, def: 4, color1: '#000000', color2: '#ffce00', isFlag: true, region: 'EU', tier: 1 },
  { name: 'Portugal', att: 4, opp: 5, def: 4, color1: '#046a38', color2: '#da291c', isFlag: true, region: 'EU', tier: 1 },
  { name: 'Países Bajos', att: 4, opp: 4, def: 4, color1: '#f36c21', color2: '#ffffff', isFlag: true, region: 'EU', tier: 1 },
  { name: 'Italia', att: 3, opp: 4, def: 4, color1: '#008c45', color2: '#ffffff', isFlag: true, region: 'EU', tier: 1 },
  
  // Nivel 2 y 3 (Variabilidad alta en clasificaciones y playoffs europeos)
  { name: 'Croacia', att: 3, opp: 4, def: 4, color1: '#ff0000', color2: '#ffffff', isFlag: true, region: 'EU', tier: 2 },
  { name: 'Bélgica', att: 4, opp: 4, def: 3, color1: '#e30613', color2: '#000000', isFlag: true, region: 'EU', tier: 2 },
  { name: 'Dinamarca', att: 3, opp: 4, def: 3, color1: '#c60c30', color2: '#ffffff', isFlag: true, region: 'EU', tier: 2 },
  { name: 'Suiza', att: 3, opp: 3, def: 4, color1: '#d52b1e', color2: '#ffffff', isFlag: true, region: 'EU', tier: 2 },
  { name: 'Austria', att: 3, opp: 4, def: 3, color1: '#ed2939', color2: '#ffffff', isFlag: true, region: 'EU', tier: 2 },
  { name: 'Turquía', att: 3, opp: 4, def: 3, color1: '#e30a17', color2: '#ffffff', isFlag: true, region: 'EU', tier: 2 },
  
  { name: 'Noruega', att: 4, opp: 4, def: 3, color1: '#ba0c2f', color2: '#00205b', isFlag: true, region: 'EU', tier: 3 },
  { name: 'Suecia', att: 3, opp: 3, def: 3, color1: '#006aa7', color2: '#fecc00', isFlag: true, region: 'EU', tier: 3 },
  { name: 'Polonia', att: 3, opp: 3, def: 3, color1: '#ffffff', color2: '#dc143c', isFlag: true, region: 'EU', tier: 3 },
  { name: 'Serbia', att: 3, opp: 3, def: 3, color1: '#c6363c', color2: '#0c4076', isFlag: true, region: 'EU', tier: 3 },
  { name: 'Escocia', att: 2, opp: 3, def: 4, color1: '#003366', color2: '#ffffff', isFlag: true, region: 'EU', tier: 3 },
  { name: 'Ucrania', att: 3, opp: 3, def: 3, color1: '#0057b7', color2: '#ffd700', isFlag: true, region: 'EU', tier: 3 },
  { name: 'República Checa', att: 2, opp: 3, def: 3, color1: '#d7141a', color2: '#11457e', isFlag: true, region: 'EU', tier: 3 },
  { name: 'Hungría', att: 2, opp: 3, def: 3, color1: '#ce2939', color2: '#477050', isFlag: true, region: 'EU', tier: 3 },
  { name: 'Grecia', att: 2, opp: 2, def: 4, color1: '#0d5eaf', color2: '#ffffff', isFlag: true, region: 'EU', tier: 3 },
  { name: 'Rumania', att: 2, opp: 3, def: 3, color1: '#002b7f', color2: '#fcd116', isFlag: true, region: 'EU', tier: 3 },
  { name: 'Gales', att: 2, opp: 3, def: 3, color1: '#d30731', color2: '#00ab39', isFlag: true, region: 'EU', tier: 3 },

  // ==========================================
  // CONMEBOL (SUDAMÉRICA) - 10 selecciones
  // ==========================================
  { name: 'Argentina', att: 5, opp: 5, def: 4, color1: '#75aadb', color2: '#ffffff', isFlag: true, region: 'SA', tier: 1 },
  { name: 'Brasil', att: 4, opp: 5, def: 4, color1: '#fedf00', color2: '#009b3a', isFlag: true, region: 'SA', tier: 1 },
  { name: 'Uruguay', att: 4, opp: 4, def: 4, color1: '#0081c8', color2: '#ffffff', isFlag: true, region: 'SA', tier: 1 },
  { name: 'Colombia', att: 4, opp: 4, def: 3, color1: '#fcd116', color2: '#003893', isFlag: true, region: 'SA', tier: 2 },
  { name: 'Ecuador', att: 3, opp: 4, def: 4, color1: '#ffdd00', color2: '#0033a0', isFlag: true, region: 'SA', tier: 2 },
  { name: 'Chile', att: 2, opp: 3, def: 3, color1: '#0039a6', color2: '#d52b1e', isFlag: true, region: 'SA', tier: 3 },
  { name: 'Paraguay', att: 2, opp: 3, def: 4, color1: '#d52b1e', color2: '#003893', isFlag: true, region: 'SA', tier: 3 },
  { name: 'Perú', att: 2, opp: 3, def: 3, color1: '#ffffff', color2: '#d91023', isFlag: true, region: 'SA', tier: 3 },
  { name: 'Venezuela', att: 2, opp: 3, def: 3, color1: '#800000', color2: '#ffffff', isFlag: true, region: 'SA', tier: 3 },
  { name: 'Bolivia', att: 1, opp: 2, def: 3, color1: '#007934', color2: '#d52b1e', isFlag: true, region: 'SA', tier: 4 },

  // ==========================================
  // CAF (ÁFRICA) - 12 selecciones
  // ==========================================
  { name: 'Marruecos', att: 3, opp: 4, def: 4, color1: '#c1272d', color2: '#006233', isFlag: true, region: 'AF', tier: 1 },
  { name: 'Senegal', att: 4, opp: 4, def: 4, color1: '#00853f', color2: '#fdef42', isFlag: true, region: 'AF', tier: 2 },
  { name: 'Nigeria', att: 4, opp: 4, def: 3, color1: '#008751', color2: '#ffffff', isFlag: true, region: 'AF', tier: 2 },
  { name: 'Costa de Marfil', att: 4, opp: 3, def: 3, color1: '#f77f00', color2: '#009b3a', isFlag: true, region: 'AF', tier: 2 },
  { name: 'Argelia', att: 3, opp: 4, def: 3, color1: '#006633', color2: '#ffffff', isFlag: true, region: 'AF', tier: 2 },
  { name: 'Egipto', att: 3, opp: 3, def: 3, color1: '#ce1126', color2: '#000000', isFlag: true, region: 'AF', tier: 2 },
  { name: 'Camerún', att: 3, opp: 3, def: 3, color1: '#007a5e', color2: '#ce1126', isFlag: true, region: 'AF', tier: 3 },
  { name: 'Ghana', att: 3, opp: 3, def: 2, color1: '#ffffff', color2: '#000000', isFlag: true, region: 'AF', tier: 3 },
  { name: 'Túnez', att: 2, opp: 3, def: 3, color1: '#e70013', color2: '#ffffff', isFlag: true, region: 'AF', tier: 3 },
  { name: 'Malí', att: 2, opp: 3, def: 3, color1: '#14b53a', color2: '#fcd116', isFlag: true, region: 'AF', tier: 3 },
  { name: 'RD Congo', att: 2, opp: 3, def: 3, color1: '#007fff', color2: '#ce1126', isFlag: true, region: 'AF', tier: 3 },
  { name: 'Sudáfrica', att: 2, opp: 3, def: 3, color1: '#007a3d', color2: '#ffb612', isFlag: true, region: 'AF', tier: 3 },

  // ==========================================
  // AFC & OFC (ASIA Y OCEANÍA) - 10 selecciones
  // ==========================================
  { name: 'Japón', att: 4, opp: 4, def: 4, color1: '#ffffff', color2: '#bc002d', isFlag: true, region: 'AS', tier: 2 },
  { name: 'Corea del Sur', att: 3, opp: 4, def: 3, color1: '#ffffff', color2: '#cd2e3a', isFlag: true, region: 'AS', tier: 2 },
  { name: 'Australia', att: 2, opp: 3, def: 3, color1: '#00008b', color2: '#ffcd00', isFlag: true, region: 'AS', tier: 2 },
  { name: 'Arabia Saudita', att: 2, opp: 3, def: 3, color1: '#006c35', color2: '#ffffff', isFlag: true, region: 'AS', tier: 2 },
  { name: 'Irán', att: 2, opp: 3, def: 4, color1: '#239f40', color2: '#da0000', isFlag: true, region: 'AS', tier: 2 },
  { name: 'Catar', att: 2, opp: 3, def: 3, color1: '#8a1538', color2: '#ffffff', isFlag: true, region: 'AS', tier: 3 },
  { name: 'Uzbekistán', att: 2, opp: 3, def: 3, color1: '#0099b5', color2: '#1eb53a', isFlag: true, region: 'AS', tier: 3 },
  { name: 'Irak', att: 2, opp: 2, def: 3, color1: '#000000', color2: '#ce1126', isFlag: true, region: 'AS', tier: 3 },
  { name: 'Emiratos Árabes', att: 2, opp: 2, def: 3, color1: '#00732f', color2: '#ff0000', isFlag: true, region: 'AS', tier: 4 },
  { name: 'Nueva Zelanda', att: 2, opp: 2, def: 3, color1: '#ffffff', color2: '#000000', isFlag: true, region: 'OC', tier: 3 },

  // ==========================================
  // CONCACAF (NORTE, CENTROAMÉRICA Y CARIBE) - 7 selecciones
  // ==========================================
  { name: 'USA', att: 3, opp: 4, def: 3, color1: '#b22234', color2: '#3c3b6e', isFlag: true, region: 'NA', tier: 2 },
  { name: 'México', att: 3, opp: 4, def: 3, color1: '#006847', color2: '#ce1126', isFlag: true, region: 'NA', tier: 2 },
  { name: 'Canadá', att: 3, opp: 3, def: 3, color1: '#ff0000', color2: '#ffffff', isFlag: true, region: 'NA', tier: 2 },
  { name: 'Costa Rica', att: 2, opp: 3, def: 3, color1: '#002b7f', color2: '#ce1126', isFlag: true, region: 'NA', tier: 3 },
  { name: 'Panamá', att: 2, opp: 3, def: 3, color1: '#da121a', color2: '#072357', isFlag: true, region: 'NA', tier: 3 },
  { name: 'Jamaica', att: 2, opp: 3, def: 2, color1: '#fed100', color2: '#009b3a', isFlag: true, region: 'NA', tier: 3 },
  { name: 'Honduras', att: 2, opp: 2, def: 3, color1: '#0073cf', color2: '#ffffff', isFlag: true, region: 'NA', tier: 4 }
];

// Helper para barajar un array
const shuffleArray = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/**
 * Genera un grupo de 32 selecciones dinámico y realista para la Copa del Mundo.
 * Distribución de cupos por confederación:
 * - UEFA (Europa): 13 cupos (6 gigantes fijos + 7 rotativos de alta competitividad)
 * - CONMEBOL (Sudamérica): 5 cupos (3 gigantes fijos + 2 rotativos)
 * - CAF (África): 5 cupos (alta rotación y competencia entre potencias africanas)
 * - AFC / OFC (Asia y Oceanía): 5 cupos (Japón/Corea/Australia + rotativos)
 * - CONCACAF (Norte y Centroamérica): 4 cupos (USA/México/Canadá + 1 rotativo)
 *
 * Si se pasan selecciones personalizadas (`customTeams`), se preservan obligatoriamente.
 */
export const buildDynamicWCPool = (options?: {
  randomize?: boolean;
  customTeams?: any[];
}): NationalTeam[] => {
  const { customTeams = [] } = options || {};
  const selected: NationalTeam[] = [];
  const selectedNames = new Set<string>();

  // 1. Agregar selecciones personalizadas ya configuradas por el usuario
  if (Array.isArray(customTeams) && customTeams.length > 0) {
    customTeams.forEach((t) => {
      if (t && t.name && !selectedNames.has(t.name.toLowerCase())) {
        selected.push({
          name: t.name,
          att: t.att || 3,
          opp: t.opp || 3,
          def: t.def || 3,
          color1: t.color1 || '#0033a0',
          color2: t.color2 || '#ffffff',
          isFlag: t.isFlag ?? true,
          region: (t.region as any) || 'EU',
          tier: t.tier || 3
        });
        selectedNames.add(t.name.toLowerCase());
      }
    });
  }

  if (selected.length >= 32) {
    return selected.slice(0, 32);
  }

  // 2. Agrupar selecciones disponibles por región
  const availableByRegion: Record<string, NationalTeam[]> = {
    EU: ALL_WORLD_CUP_TEAMS.filter((t) => t.region === 'EU' && !selectedNames.has(t.name.toLowerCase())),
    SA: ALL_WORLD_CUP_TEAMS.filter((t) => t.region === 'SA' && !selectedNames.has(t.name.toLowerCase())),
    AF: ALL_WORLD_CUP_TEAMS.filter((t) => t.region === 'AF' && !selectedNames.has(t.name.toLowerCase())),
    AS_OC: ALL_WORLD_CUP_TEAMS.filter((t) => (t.region === 'AS' || t.region === 'OC') && !selectedNames.has(t.name.toLowerCase())),
    NA: ALL_WORLD_CUP_TEAMS.filter((t) => t.region === 'NA' && !selectedNames.has(t.name.toLowerCase()))
  };

  // Cuotas ideales por confederación para un torneo de 32 naciones
  const targetQuotas = {
    EU: 13,
    SA: 5,
    AF: 5,
    AS_OC: 5,
    NA: 4
  };

  // 3. Algoritmo de clasificación clasificatoria continental con tiers y rotación
  const pickFromRegion = (pool: NationalTeam[], targetCount: number): NationalTeam[] => {
    const currentInRegion = selected.filter((t) => {
      if (pool === availableByRegion.AS_OC) return t.region === 'AS' || t.region === 'OC';
      return t.region === pool[0]?.region;
    }).length;

    const needed = Math.max(0, targetCount - currentInRegion);
    if (needed <= 0 || !pool.length) return [];

    // Separar por Tiers: Tier 1 (fijos/alta prob), Tier 2 (muy probables), Tier 3 (rotativos/sorpresa)
    const t1 = pool.filter((t) => t.tier === 1);
    const t2 = pool.filter((t) => t.tier === 2);
    const t3 = pool.filter((t) => (t.tier || 3) >= 3);

    const result: NationalTeam[] = [];

    // 85-100% de los Tier 1 clasifican casi siempre
    const shuffledT1 = shuffleArray(t1);
    const t1Count = Math.min(needed, shuffledT1.length);
    for (let i = 0; i < t1Count; i++) {
      result.push(shuffledT1[i]);
    }

    // El resto se reparte con peso entre Tier 2 y Tier 3 (para crear variabilidad realista: Noruega, Suecia, Turquía, Argelia, Chile, Costa Rica, etc.)
    const remainingNeeded = needed - result.length;
    if (remainingNeeded > 0) {
      // Combinar Tier 2 (peso doble) y Tier 3
      const contenders = shuffleArray([
        ...t2,
        ...t2, // doble probabilidad
        ...t3
      ]);

      const seen = new Set(result.map((r) => r.name.toLowerCase()));
      for (const candidate of contenders) {
        if (!seen.has(candidate.name.toLowerCase())) {
          seen.add(candidate.name.toLowerCase());
          result.push(candidate);
          if (result.length >= needed) break;
        }
      }
    }

    return result;
  };

  // Seleccionar por cada región
  const pickedEU = pickFromRegion(availableByRegion.EU, targetQuotas.EU);
  pickedEU.forEach((t) => { selected.push(t); selectedNames.add(t.name.toLowerCase()); });

  const pickedSA = pickFromRegion(availableByRegion.SA, targetQuotas.SA);
  pickedSA.forEach((t) => { selected.push(t); selectedNames.add(t.name.toLowerCase()); });

  const pickedAF = pickFromRegion(availableByRegion.AF, targetQuotas.AF);
  pickedAF.forEach((t) => { selected.push(t); selectedNames.add(t.name.toLowerCase()); });

  const pickedAS = pickFromRegion(availableByRegion.AS_OC, targetQuotas.AS_OC);
  pickedAS.forEach((t) => { selected.push(t); selectedNames.add(t.name.toLowerCase()); });

  const pickedNA = pickFromRegion(availableByRegion.NA, targetQuotas.NA);
  pickedNA.forEach((t) => { selected.push(t); selectedNames.add(t.name.toLowerCase()); });

  // 4. Si aún faltan para llegar a 32 (por restricciones de pool), rellenar con las mejores selecciones restantes
  if (selected.length < 32) {
    const remainingGlobal = shuffleArray(ALL_WORLD_CUP_TEAMS.filter((t) => !selectedNames.has(t.name.toLowerCase())));
    for (const team of remainingGlobal) {
      selected.push(team);
      selectedNames.add(team.name.toLowerCase());
      if (selected.length === 32) break;
    }
  }

  return selected.slice(0, 32);
};
