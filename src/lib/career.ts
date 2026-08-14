// @ts-nocheck
/**
 * MODO CARRERA — lógica pura basada en el GDD DiceLeague (V8 + V11 ampliado).
 * Sin dependencias de React: sólo cálculo de tiers, PE, reputación,
 * objetivos, expectativas, contratos, Champions y mercado de entrenadores.
 */

export const CAREER_LEAGUE_ID = 'L7'; // Miscelánea Europea
export const CAREER_DIV = 2; // Segunda División

// Duración máxima de un contrato: al terminar hay que renovar o cambiar de aires
export const CONTRACT_SEASONS = 3;

// Plazas de clasificación a Champions en 1ª División
export const CL_SPOTS = 4;

// Clases de liga (GDD §4)
export const LEAGUE_CLASS = {
  L1: 'A', L2: 'A', L3: 'A', L4: 'A', // Élite
  L6: 'B', L5: 'B',                   // Estratégica / consolidación
  L7: 'C'                             // Desarrollo
};

export const CLASS_INFO = {
  A: { label: 'Élite', repMult: 1.0, maxTier: 4 },
  B: { label: 'Estratégica', repMult: 0.75, maxTier: 3 },
  C: { label: 'Desarrollo', repMult: 0.5, maxTier: 2 }
};

// Tiers de clubes (GDD §5) — techos generales y filosofía
export const TIERS = {
  1: { name: 'Fondo de Segunda', caps: { att: 5, opp: 5, def: 4 }, philosophy: 'Sobrevivir, desarrollar y ascender' },
  2: { name: 'Cima de Segunda', caps: { att: 5, opp: 5, def: 4 }, philosophy: 'Luchar por ascenso y consolidarse' },
  3: { name: 'Media de Primera', caps: { att: 5, opp: 5, def: 4 }, philosophy: 'Consolidarse y competir arriba' },
  4: { name: 'Gigante de Primera', caps: { att: 5, opp: 5, def: 4 }, philosophy: 'Gestionar resultados; exigencia máxima' }
};

// Costos de evolución con PE: costo del salto hacia el nivel destino
export const PE_COST = { 2: 15, 3: 35, 4: 70, 5: 70 };

export const peCostFor = (currentValue) => PE_COST[currentValue + 1] ?? 999;

export const tierOf = (team) => {
  const total = (team?.att || 0) + (team?.opp || 0) + (team?.def || 0);
  if (total >= 14) return 4;
  if (total >= 13) return 3;
  if (total >= 11) return 2;
  return 1;
};

// Límites absolutos estándar: ATT máx 5, OPP máx 5, DEF máx 4
export const MAX_SQUAD_CAPS = { att: 5, opp: 5, def: 4 };

export const tierCaps = (_tier) => MAX_SQUAD_CAPS;

export const classOf = (compId) => LEAGUE_CLASS[compId] || 'C';

export const strengthOf = (t) => (t?.att || 0) + (t?.opp || 0) + (t?.def || 0);

/** El club llegó a su techo absoluto (5-5-4): los atributos ya no pueden subir más. */
export const isSquadMaxed = (team, _tier) => {
  if (!team) return false;
  return (team.att || 0) >= MAX_SQUAD_CAPS.att &&
         (team.opp || 0) >= MAX_SQUAD_CAPS.opp &&
         (team.def || 0) >= MAX_SQUAD_CAPS.def;
};

/**
 * Costo restante para alcanzar el máximo absoluto 5-5-4
 */
export const remainingUpgradeCost = (team, _tier) => {
  if (!team) return 0;
  let total = 0;
  ['att', 'opp', 'def'].forEach(attr => {
    for (let v = team[attr] || 0; v < MAX_SQUAD_CAPS[attr]; v++) total += peCostFor(v);
  });
  return total;
};

/**
 * Acumulación libre de PE sin tope artificial restrictivo
 */
export const capPE = (pe, _team, _tier) => Math.max(0, pe);

/**
 * Plus de reputación al firmar por un club mayor: el mercado premia dar el
 * salto, no saltar de banquillo en banquillo. Máximo 15 puntos.
 */
export const signingRepBonus = ({ fromTier = 1, toTier = 1, fromStrength = 0, toStrength = 0 } = {}) => {
  const tierStep = (toTier || 1) - (fromTier || 1);
  if (tierStep <= 0) return 0;
  const strengthStep = Math.max(0, (toStrength || 0) - (fromStrength || 0));
  const bonus = tierStep * 8 + Math.min(6, strengthStep * 1.5);
  return clampRep(Math.min(15, bonus));
};


// Bandas de reputación (GDD §26)
export const REPUTATION_BANDS = [
  { min: 0, max: 20, label: 'Desconocido', desc: 'Clubes Tier 1 y proyectos modestos' },
  { min: 21, max: 40, label: 'Prometedor', desc: 'Clubes Tier 1 y Tier 2 de clase C/B' },
  { min: 41, max: 60, label: 'Consolidado', desc: 'Tier 2 y Tier 3 de clase B' },
  { min: 61, max: 70, label: 'Reconocido', desc: 'Clase A media y Tier 3' },
  { min: 71, max: 100, label: 'Élite mundial', desc: 'Clase A y gigantes Tier 4' }
];

export const repBand = (rep) =>
  REPUTATION_BANDS.find(b => rep >= b.min && rep <= b.max) || REPUTATION_BANDS[0];

export const clampRep = (v) => Math.max(0, Math.min(100, Math.round(v * 10) / 10));

// Distribuciones tácticas permitidas (GDD §6): mismo total, techos del tier
export const tacticalOptions = (base, tier) => {
  const total = (base?.att || 0) + (base?.opp || 0) + (base?.def || 0);
  const caps = tierCaps(tier);
  const min = 1;
  const out = [];
  for (let att = min; att <= caps.att; att++) {
    for (let opp = min; opp <= caps.opp; opp++) {
      const def = total - att - opp;
      if (def < min || def > caps.def) continue;
      out.push({ att, opp, def });
    }
  }
  return out.sort((a, b) => b.att - a.att || b.opp - a.opp);
};

export const sameDist = (a, b) => !!a && !!b && a.att === b.att && a.opp === b.opp && a.def === b.def;

// PE por resultado (GDD §9)
export const peForResult = (result) => (result === 'W' ? 3 : result === 'D' ? 1 : 0);

// Reputación por partido con contexto de rival y exigencia de élite (GDD §11 + Especificación Élite)
export const repForMatch = (result, ownStrength, rivalStrength, coachRep = 10) => {
  const gap = (rivalStrength || 0) - (ownStrength || 0); // >0 rival superior, <0 rival inferior

  // 1. Exigencia de Élite (85-100 de reputación en clubes de élite / frente a rivales)
  if (coachRep >= 85) {
    if (result === 'W') {
      // Ganar partidos con reputación alta otorga puntos mínimos
      return gap > 0 ? 0.4 : 0.15;
    }
    if (result === 'D') {
      // Empate contra clubes de menor rango aplica penalización severa
      return gap >= 2 ? 0.1 : -1.0;
    }
    // Derrota contra clubes de menor rango aplica penalizaciones severas
    return gap > 0 ? -1.8 : -3.5;
  }

  // Comportamiento regular
  if (result === 'W') return clampRep(0.5 + Math.max(0, Math.min(0.5, gap * 0.15)) + 0.25);
  if (result === 'D') return 0.2 + Math.max(0, Math.min(0.1, gap * 0.05));
  return -(0.5 + Math.max(0, Math.min(0.5, -gap * 0.15)) + 0.25);
};

// Objetivos por Tier (GDD §12) — evaluados sobre 20 equipos
const OBJECTIVES = {
  1: [
    { from: 1, to: 6, rep: 20, pe: 50, note: 'Ascenso a Tier 2', promote: true },
    { from: 7, to: 11, rep: 10, pe: 30, note: 'Temporada notable' },
    { from: 12, to: 15, rep: 5, pe: 15, note: 'Objetivo cumplido' },
    { from: 16, to: 17, rep: -8, pe: 5, note: 'Temporada preocupante' },
    { from: 18, to: 20, rep: -20, pe: 0, note: 'Descenso; despido seguro', fire: true }
  ],
  2: [
    { from: 1, to: 2, rep: 25, pe: 60, note: 'Ascenso a Tier 3', promote: true },
    { from: 3, to: 10, rep: 5, pe: 20, note: 'Objetivo cumplido' },
    { from: 11, to: 20, rep: -15, pe: 0, note: 'Posible despido', riskFire: true }
  ],
  3: [
    { from: 1, to: 4, rep: 20, pe: 50, note: 'Gran temporada', promote: true },
    { from: 5, to: 12, rep: 5, pe: 20, note: 'Objetivo cumplido' },
    { from: 13, to: 20, rep: -25, pe: 0, note: 'Despido inminente', fire: true }
  ],
  4: [
    { from: 1, to: 1, rep: 25, pe: 0, note: 'Campeón: exigencia cumplida' },
    { from: 2, to: 4, rep: 5, pe: 0, note: 'Aceptable' },
    { from: 5, to: 20, rep: -25, pe: 0, note: 'Crisis; despido probable', riskFire: true }
  ]
};

export const objectiveFor = (tier, position) => {
  const table = OBJECTIVES[tier] || OBJECTIVES[1];
  return table.find(r => position >= r.from && position <= r.to) || table[table.length - 1];
};

// Posición esperada (GDD §17): prestigio del club dentro de su división
export const expectedPosition = (teams, teamId) => {
  const ranked = [...(teams || [])].sort((a, b) => strengthOf(b) - strengthOf(a));
  const idx = ranked.findIndex(t => t.id === teamId);
  return idx < 0 ? Math.ceil((teams?.length || 20) / 2) : idx + 1;
};

// Detección de rendimiento inesperado (GDD §16)
export const readPerformance = (position, expected) => {
  const diff = expected - position; // >0 mejor de lo esperado
  if (diff >= 8) return { key: 'milagro', label: 'Sorpresa mayúscula', detail: 'Muy por encima de lo esperado', score: 3 };
  if (diff >= 4) return { key: 'sobresaliente', label: 'Rendimiento sobresaliente', detail: 'Por encima de lo esperado', score: 2 };
  if (diff >= 2) return { key: 'destacado', label: 'Actuación destacada', detail: 'Ligeramente por encima', score: 1 };
  if (diff <= -8) return { key: 'crisis', label: 'Crisis deportiva', detail: 'Muy por debajo de lo esperado', score: -3 };
  if (diff <= -4) return { key: 'decepcion', label: 'Temporada decepcionante', detail: 'Por debajo de lo esperado', score: -2 };
  if (diff <= -2) return { key: 'flojo', label: 'Rendimiento flojo', detail: 'Ligeramente por debajo', score: -1 };
  return { key: 'normal', label: 'Rendimiento esperado', detail: 'Dentro de lo previsto', score: 0 };
};

/* ============================ OBJETIVOS DE TEMPORADA ============================
 * Tres objetivos aterrizados a la realidad del club: se calculan desde la posición
 * esperada por presupuesto, los partidos realmente jugados y la reputación actual.
 * Si el club puede pelear Champions, se añade un objetivo extra.
 */
/* ============================ OBJETIVOS DE TEMPORADA ============================
 * Objetivos de temporada estilo FIFA / PES:
 * 1) Éxito Nacional (Posición de Liga adaptada a Tier, División y Expectativa)
 * 2) Rendimiento y Victorias (Ritmo de victorias exigido por la directiva)
 * 3) Desarrollo de Plantilla (Entrenamiento, evolución de atributos y acumulación de PEs)
 * 4) Prestigio del Mánager (Reputación técnica y confianza institucional)
 * 5) Éxito Continental (Si disputa la UEFA Champions League global)
 */

export interface SeasonObjectiveItem {
  key: string;
  category: 'Éxito Nacional' | 'Rendimiento' | 'Desarrollo' | 'Prestigio' | 'Continental';
  priority: 'Crítica' | 'Muy Alta' | 'Alta' | 'Media';
  label: string;
  detail: string;
  done: boolean;
  progress: number; // 0 - 100
  currentValue: string | number;
  targetValue: string | number;
  status: 'completed' | 'on_track' | 'at_risk' | 'failed';
  statusLabel: string;
  extra?: boolean;
}

/** Calcula los 3 a 4 objetivos exigidos por un club al firmar contrato */
export const getContractObjectivesForTeam = ({
  team,
  div = 1,
  tier = 1,
  totalTeams = 20,
  coachRep = 10,
  totalRounds = 38
}) => {
  const size = totalTeams || 20;
  const tTier = tier || (team ? tierOf(team) : 1);
  const rounds = totalRounds || (size - 1) * 2;

  // 1. Objetivo de Liga
  let leagueLabel = 'Asegurar la permanencia en la categoría';
  let leaguePriority: 'Crítica' | 'Muy Alta' | 'Alta' | 'Media' = 'Alta';
  let leagueTargetPos = size - 3; // 17º

  if (div === 2) {
    if (tTier >= 2) {
      leagueLabel = 'Lograr el ascenso directo a 1ª División (Top 3)';
      leaguePriority = 'Crítica';
      leagueTargetPos = 3;
    } else {
      leagueLabel = 'Finalizar en la mitad superior de la tabla (Top 10)';
      leaguePriority = 'Alta';
      leagueTargetPos = Math.min(10, Math.ceil(size / 2));
    }
  } else {
    if (tTier >= 4) {
      leagueLabel = 'Conquistar el título de Campeón de Liga (1º)';
      leaguePriority = 'Crítica';
      leagueTargetPos = 1;
    } else if (tTier === 3) {
      leagueLabel = 'Clasificar a la UEFA Champions League (Top 4)';
      leaguePriority = 'Muy Alta';
      leagueTargetPos = 4;
    } else if (tTier === 2) {
      leagueLabel = 'Pelear puestos europeos / Mitad alta (Top 6)';
      leaguePriority = 'Alta';
      leagueTargetPos = 6;
    } else {
      leagueLabel = 'Evitar el descenso y consolidar la permanencia (17º o mejor)';
      leaguePriority = 'Crítica';
      leagueTargetPos = size - 3;
    }
  }

  // 2. Objetivo de Victorias
  const winRate = leagueTargetPos <= 1 ? 0.62 : leagueTargetPos <= 4 ? 0.50 : leagueTargetPos <= 8 ? 0.38 : 0.28;
  const winTarget = Math.max(4, Math.round(rounds * winRate));

  // 3. Objetivo de Desarrollo (PEs / Entrenamiento)
  const peTarget = tTier >= 4 ? 30 : tTier === 3 ? 24 : tTier === 2 ? 18 : 12;

  // 4. Objetivo de Reputación
  const repTarget = clampRep(Math.min(100, Math.max((coachRep || 10) + (tTier >= 3 ? 4 : 6), tTier * 20)));

  return [
    {
      key: 'position',
      category: 'Éxito Nacional',
      priority: leaguePriority,
      label: leagueLabel,
      detail: `Exigencia de la directiva: puesto ${leagueTargetPos}º o superior`,
      targetValue: `${leagueTargetPos}º`,
      done: false
    },
    {
      key: 'wins',
      category: 'Rendimiento',
      priority: 'Alta',
      label: `Alcanzar ${winTarget} victorias en la liga`,
      detail: `Promedio mínimo de victorias en ${rounds} jornadas`,
      targetValue: `${winTarget} triunfos`,
      done: false
    },
    {
      key: 'development',
      category: 'Desarrollo',
      priority: 'Media',
      label: `Evolucionar la plantilla (acumular/invertir ${peTarget} PE)`,
      detail: 'Mejora de atributos mediante entrenamientos y partidos',
      targetValue: `${peTarget} PE`,
      done: false
    },
    {
      key: 'reputation',
      category: 'Prestigio',
      priority: 'Alta',
      label: `Alcanzar ${repTarget} pts de reputación de mánager`,
      detail: 'Consolidar la jerarquía técnica en el banquillo',
      targetValue: `${repTarget} pts`,
      done: false
    }
  ];
};

export const seasonObjectives = ({
  tier, div, position, expected, wins = 0, draws = 0, played = 0, totalRounds = 0,
  reputation = 10, pe = 0, total = 20, clQualified = false, clPhase = null, clChampion = false, clEliminated = false
}) => {
  const size = total || 20;
  const exp = Math.max(1, Math.min(size, expected || Math.ceil(size / 2)));
  const rounds = totalRounds || Math.max(played, (size - 1) * 2);

  // 1) Posición de liga: adaptada a la realidad del club
  let posTarget: number;
  let posPriority: 'Crítica' | 'Muy Alta' | 'Alta' | 'Media' = 'Alta';
  let posLabel = '';

  if (div === 2) {
    if (tier >= 2) {
      posTarget = 3;
      posPriority = 'Crítica';
      posLabel = 'Lograr el ascenso directo a 1ª División (Top 3)';
    } else {
      posTarget = Math.max(1, Math.min(10, exp - 1));
      posPriority = 'Alta';
      posLabel = `Terminar entre los ${posTarget} primeros`;
    }
  } else {
    if (tier >= 4) {
      posTarget = 1;
      posPriority = 'Crítica';
      posLabel = 'Conquistar el título de Campeón de Liga (1º)';
    } else if (tier === 3) {
      posTarget = 4;
      posPriority = 'Muy Alta';
      posLabel = 'Clasificar a la UEFA Champions League (Top 4)';
    } else if (tier === 2) {
      posTarget = Math.max(4, Math.min(8, exp - 1));
      posPriority = 'Alta';
      posLabel = `Pelear puestos europeos / Mitad alta (Top ${posTarget})`;
    } else {
      posTarget = Math.min(size - 3, Math.max(12, exp));
      posPriority = 'Crítica';
      posLabel = `Evitar el descenso y lograr la permanencia (${posTarget}º o mejor)`;
    }
  }

  // Progreso y estado de Liga
  const isPosDone = played > 0 && !!position && position <= posTarget;
  let posStatus: 'completed' | 'on_track' | 'at_risk' | 'failed' = 'on_track';
  let posStatusLabel = 'En Camino';

  if (!played) {
    posStatus = 'on_track';
    posStatusLabel = 'Por Iniciar';
  } else if (isPosDone) {
    posStatus = played >= rounds ? 'completed' : 'on_track';
    posStatusLabel = played >= rounds ? 'Cumplido' : 'En Puestos';
  } else {
    const diff = position - posTarget;
    if (played >= rounds) {
      posStatus = 'failed';
      posStatusLabel = 'No Cumplido';
    } else if (diff <= 2) {
      posStatus = 'at_risk';
      posStatusLabel = 'A tiro';
    } else {
      posStatus = 'at_risk';
      posStatusLabel = 'En Riesgo';
    }
  }

  const posProgress = !played || !position
    ? 50
    : Math.max(0, Math.min(100, Math.round(((size - position + 1) / (size - posTarget + 1)) * 100)));

  // 2) Victorias: ritmo exigido por la directiva
  const winRate = posTarget <= 1 ? 0.62 : posTarget <= 4 ? 0.50 : posTarget <= 8 ? 0.38 : 0.28;
  const winTarget = Math.max(4, Math.round(rounds * winRate));
  const isWinDone = wins >= winTarget;
  const winProgress = Math.min(100, Math.round((wins / winTarget) * 100));

  let winStatus: 'completed' | 'on_track' | 'at_risk' | 'failed' = 'on_track';
  let winStatusLabel = 'En Progreso';
  if (isWinDone) {
    winStatus = 'completed';
    winStatusLabel = 'Cumplido';
  } else if (played >= rounds) {
    winStatus = 'failed';
    winStatusLabel = 'No Alcanzado';
  } else {
    const projectedWins = played > 0 ? (wins / played) * rounds : 0;
    if (projectedWins >= winTarget) {
      winStatus = 'on_track';
      winStatusLabel = `${wins}/${winTarget} W`;
    } else {
      winStatus = 'at_risk';
      winStatusLabel = 'Ritmo Bajo';
    }
  }

  // 3) Desarrollo de Plantilla (Inversión / Acumulación de PEs)
  const peTarget = tier >= 4 ? 25 : tier === 3 ? 20 : tier === 2 ? 15 : 10;
  // Calculamos PE histórico acumulado en temporada o PE actual + victorias
  const estimatedSeasonPE = Math.max(pe, wins * 3 + draws * 1);
  const isPeDone = estimatedSeasonPE >= peTarget;
  const peProgress = Math.min(100, Math.round((estimatedSeasonPE / peTarget) * 100));

  let peStatus: 'completed' | 'on_track' | 'at_risk' | 'failed' = 'on_track';
  let peStatusLabel = 'En Progreso';
  if (isPeDone) {
    peStatus = 'completed';
    peStatusLabel = 'Cumplido';
  } else if (played >= rounds && estimatedSeasonPE < peTarget) {
    peStatus = 'failed';
    peStatusLabel = 'Insuficiente';
  } else {
    peStatus = estimatedSeasonPE >= peTarget * 0.5 ? 'on_track' : 'at_risk';
    peStatusLabel = `${estimatedSeasonPE}/${peTarget} PE`;
  }

  // 4) Reputación del Mánager
  const repTarget = clampRep(Math.min(100, (reputation || 0) + (tier >= 3 ? 4 : 6)));
  const isRepDone = (reputation || 0) >= repTarget;
  const repProgress = Math.min(100, Math.round(((reputation || 10) / repTarget) * 100));

  let repStatus: 'completed' | 'on_track' | 'at_risk' | 'failed' = 'on_track';
  let repStatusLabel = 'En Progreso';
  if (isRepDone) {
    repStatus = 'completed';
    repStatusLabel = 'Cumplido';
  } else {
    repStatus = (reputation || 0) >= repTarget - 2 ? 'on_track' : 'at_risk';
    repStatusLabel = `${reputation || 0}/${repTarget} pts`;
  }

  const items = [
    {
      key: 'position',
      category: 'Éxito Nacional',
      priority: posPriority,
      label: posLabel,
      detail: played && position ? `Marchas ${position}º de ${size} (Objetivo: ${posTarget}º o mejor)` : `Objetivo inicial: ${posTarget}º de ${size}`,
      done: isPosDone,
      progress: posProgress,
      currentValue: played && position ? `${position}º` : '—',
      targetValue: `${posTarget}º`,
      status: posStatus,
      statusLabel: posStatusLabel
    },
    {
      key: 'wins',
      category: 'Rendimiento',
      priority: 'Alta',
      label: `Ganar al menos ${winTarget} partidos de liga`,
      detail: `Llevas ${wins} victorias de ${winTarget} exigidas en ${played}/${rounds} jornadas`,
      done: isWinDone,
      progress: winProgress,
      currentValue: `${wins} W`,
      targetValue: `${winTarget} W`,
      status: winStatus,
      statusLabel: winStatusLabel
    },
    {
      key: 'development',
      category: 'Desarrollo',
      priority: 'Media',
      label: `Desarrollo de plantilla: generar ${peTarget} PE`,
      detail: `Llevas ${estimatedSeasonPE} PE generados (entrenamientos y resultados)`,
      done: isPeDone,
      progress: peProgress,
      currentValue: `${estimatedSeasonPE} PE`,
      targetValue: `${peTarget} PE`,
      status: peStatus,
      statusLabel: peStatusLabel
    },
    {
      key: 'reputation',
      category: 'Prestigio',
      priority: 'Alta',
      label: `Elevar la reputación técnica a ${repTarget} pts`,
      detail: `Reputación actual del mánager: ${reputation} pts (Meta: ${repTarget} pts)`,
      done: isRepDone,
      progress: repProgress,
      currentValue: `${reputation} pts`,
      targetValue: `${repTarget} pts`,
      status: repStatus,
      statusLabel: repStatusLabel
    }
  ];

  // 5) Objetivo Continental (UEFA Champions League)
  if (clQualified) {
    const isChampionsFinal = clPhase === 'Final';
    const isChampionsSemis = clPhase === 'Semis';
    const clLabel = tier >= 4 || isChampionsFinal || isChampionsSemis
      ? 'Conquistar la UEFA Champions League'
      : 'Avanzar a rondas eliminatorias de Champions';

    items.push({
      key: 'champions',
      category: 'Continental',
      priority: 'Muy Alta',
      extra: true,
      label: clLabel,
      detail: clChampion
        ? '🏆 ¡Campeón de Europa!'
        : clEliminated
          ? '❌ Eliminado de la competición'
          : `Fase actual en curso: ${clPhaseLabel(clPhase)}`,
      done: clChampion,
      progress: clChampion ? 100 : clEliminated ? 0 : 65,
      currentValue: clChampion ? 'Campeón' : clEliminated ? 'Eliminado' : clPhaseLabel(clPhase),
      targetValue: 'Título / Rondas KO',
      status: clChampion ? 'completed' : clEliminated ? 'failed' : 'on_track',
      statusLabel: clChampion ? 'Campeón' : clEliminated ? 'Eliminado' : 'En Curso'
    });
  } else if (div === 1 && tier >= 3) {
    const isClSpot = played > 0 && !!position && position <= CL_SPOTS;
    items.push({
      key: 'championsSpot',
      category: 'Continental',
      priority: 'Muy Alta',
      extra: true,
      label: `Clasificar a UEFA Champions League (Top ${CL_SPOTS})`,
      detail: played && position ? `Marchas ${position}º (Plazas Champions: 1º al ${CL_SPOTS}º)` : `Exigencia: Top ${CL_SPOTS} de la liga`,
      done: isClSpot,
      progress: !played || !position ? 40 : Math.max(0, Math.min(100, Math.round(((size - position + 1) / (size - CL_SPOTS + 1)) * 100))),
      currentValue: played && position ? `${position}º` : '—',
      targetValue: `Top ${CL_SPOTS}`,
      status: isClSpot ? 'on_track' : played >= rounds ? 'failed' : 'at_risk',
      statusLabel: isClSpot ? 'En Champions' : 'Fuera de Zona'
    });
  }

  return items;
};

/** Calcula la Confianza de la Directiva (0% a 100%) estilo FIFA / PES */
export const calculateBoardConfidence = ({
  objectives = [],
  performanceScore = 0,
  badStreak = 0,
  reputation = 10,
  tier = 1
}) => {
  let baseScore = 75; // 75% confianza inicial estándar

  // Rendimiento de objetivos
  const coreObjs = objectives.filter(o => !o.extra);
  const total = coreObjs.length || 1;
  const completed = coreObjs.filter(o => o.done || o.status === 'completed').length;
  const onTrack = coreObjs.filter(o => o.status === 'on_track').length;
  const atRisk = coreObjs.filter(o => o.status === 'at_risk').length;
  const failed = coreObjs.filter(o => o.status === 'failed').length;

  baseScore += (completed * 8) + (onTrack * 3) - (atRisk * 6) - (failed * 14);

  // Rendimiento en puntos / expectativas
  baseScore += (performanceScore * 5);

  // Castigo por mala racha
  if (badStreak >= 3) baseScore -= 18;
  else if (badStreak >= 2) baseScore -= 10;
  else if (badStreak === 1) baseScore -= 4;

  // Exigencia de Tier
  if (tier >= 4 && performanceScore < 0) baseScore -= 8;

  const score = Math.max(10, Math.min(99, Math.round(baseScore)));

  let label = 'Estable';
  let color = 'emerald';
  let badge = 'Confianza Plena';

  if (score >= 85) {
    label = 'Excelente';
    color = 'emerald';
    badge = 'Muy Satisfecha';
  } else if (score >= 70) {
    label = 'Buena';
    color = 'sky';
    badge = 'Satisfecha';
  } else if (score >= 50) {
    label = 'Aceptable';
    color = 'amber';
    badge = 'Bajo Observación';
  } else {
    label = 'En Peligro';
    color = 'red';
    badge = 'Puesto en Riesgo';
  }

  return {
    score,
    label,
    color,
    badge,
    completedCount: completed,
    totalCount: total
  };
};

/* ================================= CHAMPIONS =================================
 * NO existe una Champions propia del modo carrera: el técnico juega la MISMA
 * Champions League de la temporada global (competición 'C1'), con sus 32
 * participantes, su fase de grupos y sus eliminatorias. Aquí sólo viven las
 * utilidades de lectura de ese torneo.
 */
export const CL_PHASE_ORDER = ['groups', 'Octavos', 'Cuartos', 'Semis', 'Final', 'Terminado'];

export const clPhaseLabel = (phase) => ({
  groups: 'Fase de grupos',
  Octavos: 'Octavos de final',
  Cuartos: 'Cuartos de final',
  Semis: 'Semifinales',
  Final: 'Final',
  Terminado: 'Torneo terminado'
}[phase] || 'Fase de grupos');

/** Reputación por el recorrido europeo del club en la Champions global. */
export const clProgressRep = ({ champion = false, phaseReached = null, played = false } = {}) => {
  if (champion) return 8;
  if (!played) return 0;
  const idx = CL_PHASE_ORDER.indexOf(phaseReached || 'groups');
  if (idx >= 4) return 5; // llegó a la Final
  if (idx === 3) return 3.5; // Semifinales
  if (idx === 2) return 2.5; // Cuartos
  if (idx === 1) return 1.5; // Octavos
  return 0.5; // sólo grupos
};

/* ======================== MERCADO DE ENTRENADORES ==========================
 * (GDD §18-20) La progresión es coherente: nadie salta de Tier 1 a un gigante.
 * - Buen año (objetivos cumplidos + rendimiento sobre lo esperado) → puedes
 *   subir COMO MÁXIMO un Tier respecto al club que dirigías.
 * - Fin de contrato sin brillar → clubes de tu mismo nivel o por debajo.
 * - Despido → el mercado castiga: sólo proyectos de menor Tier, pocas ofertas
 *   y, con mala reputación, ninguna.
 * La reputación es un filtro DURO: sin ella no hay club grande posible.
 */
const MIN_REP_FOR_CLASS = { C: 0, B: 35, A: 60 };
const MIN_REP_FOR_TIER = { 1: 0, 2: 20, 3: 45, 4: 70 };

/** Cuántas ofertas puede recibir el técnico según su situación y reputación. */
export const offerCountFor = ({ kind, reputation = 0, objectivesMet = 0, score = 0 }) => {
  if (kind === 'fired') {
    if (reputation < 15) return 0;             // despedido y sin nombre: paro
    if (reputation < 35 || score <= -2) return 1;
    return 2;
  }
  if (kind === 'renewal') return reputation >= 45 || objectivesMet >= 2 ? 3 : 2;
  // Interés por rendimiento durante/al final de una buena temporada
  if (score >= 3 && objectivesMet >= 2) return 3;
  if (score >= 2 || objectivesMet >= 2) return 2;
  return 1;
};

/**
 * Devuelve ofertas realistas: nunca un salto de más de un Tier, siempre con la
 * reputación suficiente y con castigo real tras un despido.
 */
export const buildOffers = ({
  comps, career, performance, reputation, season, leagueNames,
  kind = 'performance', objectivesMet = 0, count = null
}) => {
  if (!comps) return [];
  const score = performance?.score ?? 0;
  const currentTier = career.tier || 1;
  const goodSeason = objectivesMet >= 2 && score >= 1;

  // Sin buen año no hay clubes llamando a media temporada
  if (kind === 'performance' && !goodSeason) return [];

  const wanted = count ?? offerCountFor({ kind, reputation, objectivesMet, score });
  if (wanted <= 0) return [];

  // Techo y suelo de nivel según lo ocurrido en la temporada
  let maxTier, minTier;
  if (kind === 'fired') {
    maxTier = Math.max(1, currentTier - 1);
    minTier = 1;
  } else if (kind === 'renewal') {
    maxTier = goodSeason ? Math.min(4, currentTier + 1) : currentTier;
    minTier = Math.max(1, currentTier - 1);
  } else {
    maxTier = Math.min(4, currentTier + 1);
    minTier = currentTier;
  }

  const candidates = [];
  Object.keys(LEAGUE_CLASS).forEach(compId => {
    const comp = comps[compId];
    if (!comp) return;
    [1, 2].forEach(div => {
      const teams = div === 2 ? comp.teams2 : comp.teams;
      (teams || []).forEach(team => {
        if (compId === career.compId && div === career.div && team.id === career.teamId) return;
        const tier = tierOf(team);
        const cls = classOf(compId);
        if (tier > (CLASS_INFO[cls]?.maxTier || 4)) return;
        if (tier > maxTier || tier < minTier) return;
        // Filtro de reputación: duro y sin excepciones
        if (reputation < (MIN_REP_FOR_CLASS[cls] || 0)) return;
        if (reputation < (MIN_REP_FOR_TIER[tier] || 0)) return;
        const appeal = score * 2 + reputation / 25 - (tier - currentTier) * 1.5;
        candidates.push({
          compId, compName: leagueNames?.[compId] || comp.name, div, team, tier, cls,
          appeal, strength: strengthOf(team)
        });
      });
    });
  });
  if (!candidates.length) return [];

  // Reparto por niveles: como mucho UN club del Tier superior; el resto, de tu nivel
  const stepUp = candidates.filter(c => c.tier === currentTier + 1).sort((a, b) => b.strength - a.strength);
  const same = candidates.filter(c => c.tier === currentTier).sort(() => Math.random() - 0.5);
  const lower = candidates.filter(c => c.tier < currentTier).sort((a, b) => b.strength - a.strength);

  const pick = (arr) => (arr.length ? arr.splice(Math.floor(Math.random() * Math.min(arr.length, 5)), 1)[0] : null);
  const chosen = [];
  if (goodSeason && kind !== 'fired' && stepUp.length) {
    const up = pick(stepUp);
    if (up) chosen.push(up);
  }
  while (chosen.length < wanted) {
    const c = kind === 'fired'
      ? (pick(lower) || pick(same))
      : (pick(same) || pick(lower) || pick(stepUp));
    if (!c) break;
    if (!chosen.some(x => x.compId === c.compId && x.div === c.div && x.team.id === c.team.id)) chosen.push(c);
  }

  const reasonFor = (c) => {
    if (kind === 'fired') return c.tier < currentTier ? 'Proyecto de reconstrucción para relanzarte' : 'Última oportunidad tras el despido';
    if (kind === 'renewal') return c.tier > currentTier ? 'Salto de nivel al acabar contrato' : 'Oferta de mercado al acabar tu contrato';
    return c.tier > currentTier
      ? `${performance?.label || 'Gran temporada'}: te quieren para un proyecto mayor`
      : performance?.label || 'Interés por tu trabajo';
  };

  return chosen.slice(0, wanted).map(c => {
    // Calcular posición y puntos actuales o finales del club candidato
    const comp = comps[c.compId];
    const teamsList = c.div === 2 ? comp?.teams2 : comp?.teams;
    const sorted = [...(teamsList || [])].sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
    const clubIdx = sorted.findIndex(t => t.id === c.team.id);
    const clubPos = clubIdx >= 0 ? clubIdx + 1 : Math.ceil((sorted.length || 20) / 2);
    const clubPts = clubIdx >= 0 ? sorted[clubIdx].pts : (c.tier * 12);
    const totalTeams = sorted.length || 20;

    // Estado competitivo
    let standingStatus = 'Media Tabla';
    if (c.div === 1) {
      if (clubPos === 1) standingStatus = '🏆 Lucha por el Título';
      else if (clubPos <= 4) standingStatus = '⭐ Zona Champions';
      else if (clubPos <= 6) standingStatus = '🌍 Zona Europea';
      else if (clubPos >= totalTeams - 2) standingStatus = '⚠️ Zona de Descenso';
    } else {
      if (clubPos <= 3) standingStatus = '🚀 Zona de Ascenso';
      else if (clubPos >= totalTeams - 2) standingStatus = '⚠️ Zona Crítica';
    }

    // Objetivo requerido por la directiva
    let requiredObjective = 'Asegurar la permanencia y desarrollar la plantilla';
    if (c.tier >= 4) requiredObjective = 'Conquistar el título de liga y pelear la Champions';
    else if (c.tier === 3) requiredObjective = 'Clasificar a competiciones europeas (Top 4)';
    else if (c.div === 2 || c.tier === 2) requiredObjective = 'Lograr el ascenso directo a 1ª División';

    const contractObjectives = getContractObjectivesForTeam({
      team: c.team,
      div: c.div,
      tier: c.tier,
      totalTeams,
      coachRep: reputation,
      totalRounds: (totalTeams - 1) * 2
    });

    return {
      id: `${season}-${c.compId}-${c.div}-${c.team.id}`,
      season,
      compId: c.compId,
      compName: c.compName,
      div: c.div,
      teamId: c.team.id,
      teamName: c.team.name,
      color1: c.team.color1,
      color2: c.team.color2,
      isFlag: c.team.isFlag,
      tier: c.tier,
      cls: c.cls,
      position: clubPos,
      pts: clubPts,
      standingStatus,
      requiredObjective,
      contractObjectives,
      step: c.tier > currentTier ? 'up' : c.tier === currentTier ? 'same' : 'down',
      profile: c.tier >= 4 ? 'Gigante Europeo' : c.tier >= 3 ? 'Club Dominante' : c.tier === 2 ? 'Media Tabla / Aspirante' : 'Proyecto Modesto',
      seasons: CONTRACT_SEASONS,
      reason: reasonFor(c)
    };
  });
};

/* ================== UMBRALES DE EXIGENCIA Y ALGORITMO DETERMINISTA ===================
 * Umbral de Exigencia del Club (E_club):
 * - Tier 1 (Élite / Gigantes / Tier 4 en código): 88 pts
 * - Tier 2 (Top 6 / Europa / Tier 3 en código): 75 pts
 * - Tier 3 (Tabla Media / Tier 2 en código): 60 pts
 * - Tier 4 (Lucha por Descenso / 2ª Div / Tier 1 en código): 40 pts
 */
export const getClubExigence = (tier = 1) => {
  if (tier >= 4) return 88;
  if (tier === 3) return 75;
  if (tier === 2) return 60;
  return 40;
};

/**
 * Cálculo del Puntaje de Candidato (PC):
 * PC = Reputación Base + Modificador de Rendimiento Actual + Bono de Historial
 * - Reputación Base: 0 - 100
 * - Modificador de Rendimiento:
 *   * Superando objetivos con el club actual: +10 pts
 *   * Cumpliendo objetivos con el club actual: 0 pts
 *   * Por debajo de objetivos con el club actual: -15 pts
 * - Bono de Historial:
 *   * Campeón de Liga/Copa o Ascenso en la temporada anterior: +5 pts
 */
export const calculateCandidateScore = ({
  reputation = 10,
  performanceScore = 0,
  position = null,
  expected = null,
  hasRecentHistoryBonus = false
}) => {
  const baseRep = clampRep(reputation);

  let perfMod = 0;
  if (performanceScore >= 1 || (position && expected && position < expected - 1)) {
    perfMod = 10;
  } else if (performanceScore <= -1 || (position && expected && position > expected + 1)) {
    perfMod = -15;
  } else {
    perfMod = 0;
  }

  const historyBonus = hasRecentHistoryBonus ? 5 : 0;
  const pc = baseRep + perfMod + historyBonus;

  return {
    pc,
    baseRep,
    perfMod,
    historyBonus
  };
};

/**
 * Evaluación determinista de la postulación activa:
 * Resultado = ACEPTADO si PC >= E_club, RECHAZADO si PC < E_club.
 * Si es rechazado, genera el mensaje narrativo según el factor con mayor impacto negativo.
 */
export const evaluateApplication = ({
  clubTier = 1,
  reputation = 10,
  performanceScore = 0,
  position = null,
  expected = null,
  hasRecentHistoryBonus = false
}) => {
  const exigence = getClubExigence(clubTier);
  const { pc, baseRep, perfMod, historyBonus } = calculateCandidateScore({
    reputation,
    performanceScore,
    position,
    expected,
    hasRecentHistoryBonus
  });

  const accepted = pc >= exigence;

  if (accepted) {
    return {
      accepted: true,
      pc,
      exigence,
      rejectionType: null,
      message: '¡Propuesta aceptada! La junta directiva ha aprobado tu contratación.'
    };
  }

  // Si PC < E_club, el mensaje de rechazo se basa en el factor con mayor impacto negativo:
  let message = 'Agradecemos tu interés, pero la junta directiva busca un perfil con mayor jerarquía y renombre internacional.';
  let rejectionType = 'reputation';

  if (perfMod < 0) {
    // Si el Modificador de Rendimiento es negativo (-15 pts)
    message = 'La directiva ha seguido tus últimos partidos y le preocupa la racha reciente de tu equipo. Buscamos un técnico en una dinámica más positiva.';
    rejectionType = 'performance';
  } else if (baseRep < exigence - 8) {
    // Si la Reputación Base es muy baja
    message = 'Agradecemos tu interés, pero la junta directiva busca un perfil con mayor jerarquía y renombre internacional.';
    rejectionType = 'reputation';
  } else if (!hasRecentHistoryBonus) {
    // Si falta Bono de Historial (+5 pts)
    message = 'Para este proyecto exigimos un entrenador con experiencia reciente levantando trofeos o logrando ascensos directos.';
    rejectionType = 'history';
  }

  return {
    accepted: false,
    pc,
    exigence,
    rejectionType,
    message
  };
};

/* ================== VACANTES DE MERCADO PARA POSTULACIÓN =================== */
export const getMarketVacancies = (comps = {}, career = {}, currentPosition = 9) => {
  const candidates = [];
  const compIds = Object.keys(comps || {});
  const currentTier = career.tier || 1;
  const currentPos = currentPosition || 9;

  compIds.forEach(compId => {
    const comp = comps[compId];
    if (!comp) return;

    [1, 2].forEach(div => {
      const teams = div === 2 ? comp.teams2 : comp.teams;
      if (!Array.isArray(teams) || teams.length === 0) return;

      const sorted = [...teams].sort((a, b) => (b.pts || 0) - (a.pts || 0) || ((b.gf || 0) - (b.ga || 0)) - ((a.gf || 0) - (a.ga || 0)));
      const total = sorted.length;

      sorted.forEach((team, idx) => {
        if (compId === career.compId && div === career.div && team.id === career.teamId) return;
        const tier = tierOf(team);

        // REGLA: En la bolsa de empleo solo aparecen equipos de tier parecido (mismo tier) o más bajos
        if (tier > currentTier) return;

        const pos = idx + 1;
        const pts = team.pts || 0;
        const losses = team.l || 0;

        const isStruggling = pos >= total - 5 || losses >= 3;
        const isSafe = pos < total - 5 && pos > 4;
        const isPromotion = div === 2 && pos <= 3;
        const isEurope = div === 1 && pos <= 6;

        let status = 'ESTABLE';
        if (isStruggling) status = 'EN CRISIS';
        else if (isPromotion) status = 'ZONA DE ASCENSO';
        else if (isEurope) status = 'ZONA EUROPEA';

        let project = 'PROYECTO DEPORTIVO';
        if (isStruggling) project = 'SALVACIÓN';
        else if (tier >= 4 || pos <= 3) project = 'PROYECTO DE VERANO';
        else if (tier === 3) project = 'PROYECTO EUROPEO';

        let directiveQuote = 'Estabilizar el club';
        if (tier >= 4) directiveQuote = 'Conquistar el título y reinar en Europa';
        else if (tier === 3) directiveQuote = 'Clasificar a competiciones europeas (Top 4)';
        else if (div === 2 && pos <= 4) directiveQuote = 'Lograr el ascenso directo a 1ª División';
        else if (isStruggling) directiveQuote = 'Estabilizar el club y eludir el descenso';

        let crisisText = isStruggling
          ? `CRISIS DEPORTIVA: ${pos}º DE ${total}`
          : `SITUACIÓN ACTUAL: ${pos}º DE ${total} (${pts} PTS)`;

        let standingStatus = 'Media Tabla';
        if (div === 1) {
          if (pos === 1) standingStatus = '🏆 Lucha por el Título';
          else if (pos <= 4) standingStatus = '⭐ Zona Champions';
          else if (pos <= 6) standingStatus = '🌍 Zona Europea';
          else if (pos >= total - 2) standingStatus = '⚠️ Zona de Descenso';
        } else {
          if (pos <= 3) standingStatus = '🚀 Zona de Ascenso';
          else if (pos >= total - 2) standingStatus = '⚠️ Zona Crítica';
        }

        // Medir similitud de Tier y Posición (mismo tier o inferiores)
        const tierDiff = currentTier - tier;
        const posDiff = Math.abs(pos - currentPos);
        const similarityScore = tierDiff * 10 + posDiff;

        const contractObjectives = getContractObjectivesForTeam({
          team,
          div,
          tier,
          totalTeams: total,
          coachRep: career.reputation || 10,
          totalRounds: (total - 1) * 2
        });

        candidates.push({
          id: `vac-${compId}-${div}-${team.id}`,
          compId,
          compName: comp.name,
          leagueSubtitle: `${(comp.name || 'Liga').toUpperCase()} · ${div === 2 ? '2ª' : '1ª'} · ${pos}º DE ${total}`,
          div,
          teamId: team.id,
          teamName: team.name,
          color1: team.color1,
          color2: team.color2,
          isFlag: team.isFlag,
          tier,
          position: pos,
          totalTeams: total,
          pts,
          status,
          project,
          tierLabel: `TIER ${tier}`,
          directiveQuote,
          crisisText,
          standingStatus,
          requiredObjective: directiveQuote,
          contractObjectives,
          profile: tier >= 4 ? 'Gigante de Primera' : tier === 3 ? 'Top 6 / Europa' : tier === 2 ? 'Tabla Media / 2ª Alta' : 'Lucha por Descenso / 2ª',
          similarityScore
        });
      });
    });
  });

  // Ordenar por similitud a tier y posición de liga del mánager, garantizando hasta 10 vacantes
  candidates.sort((a, b) => a.similarityScore - b.similarityScore);
  return candidates.slice(0, 10);
};

/* ================== SISTEMA DE RETROALIMENTACIÓN EN RECHAZOS =================== */
export const getRejectionReason = ({ requiredRep = 40, coachRep = 20, badStreak = 0, hasRecentTitles = false, performanceScore = 0 }) => {
  if (badStreak >= 2 || performanceScore <= -2) {
    return {
      type: 'streak',
      title: 'Mala Dinámica Reciente',
      message: 'La directiva ha seguido tus últimos partidos y le preocupa la racha reciente de tu equipo. Buscamos un técnico en una dinámica más positiva.'
    };
  }

  if (requiredRep - coachRep > 15) {
    return {
      type: 'reputation',
      title: 'Reputación Insuficiente',
      message: 'Agradecemos tu interés, pero la junta directiva busca un perfil con mayor jerarquía y renombre internacional.'
    };
  }

  if (!hasRecentTitles) {
    return {
      type: 'trophies',
      title: 'Falta de Palmarés / Títulos',
      message: 'Para este proyecto exigimos un entrenador con experiencia reciente levantando trofeos o logrando ascensos directos.'
    };
  }

  return {
    type: 'reputation',
    title: 'Perfil no compatible',
    message: 'Agradecemos tu interés, pero la junta directiva busca un perfil con mayor jerarquía y renombre internacional.'
  };
};

/* ======================= GENERADOR DINÁMICO DE RUMORES ======================= */
export const generateRumors = (comps = {}, career = {}) => {
  const rumors = [];
  const compIds = Object.keys(comps || {});
  const seenTeamIds = new Set();
  const seenIds = new Set();

  compIds.forEach(compId => {
    const comp = comps[compId];
    if (!comp) return;

    [1, 2].forEach(div => {
      const teams = div === 2 ? comp.teams2 : comp.teams;
      if (!Array.isArray(teams) || teams.length === 0) return;

      const sorted = [...teams].sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
      const total = sorted.length;

      // 1. Estatus de Técnico en Peligro (Tier 1/2/3 con derrotas o en zona de descenso)
      sorted.forEach((t, idx) => {
        if (!t || t.id === career?.teamId) return;
        if (seenTeamIds.has(t.id)) return;
        const tier = tierOf(t);
        const inRelegation = idx >= total - 3;
        const heavyLosses = (t.l || 0) >= 3 && (t.w || 0) <= 1 && (t.p || 0) >= 4;

        if ((inRelegation || heavyLosses) && tier >= 2 && rumors.length < 6) {
          seenTeamIds.add(t.id);
          const rumorId = `rumor-danger-${compId}-${div}-${t.id}-${rumors.length}`;
          if (!seenIds.has(rumorId)) {
            seenIds.add(rumorId);
            rumors.push({
              id: rumorId,
              type: 'danger',
              tag: 'RUMOR',
              text: `La junta directiva de ${t.name} evalúa el futuro de su DT tras los últimos resultados.`
            });
          }
        }
      });

      // 2. Aviso de Vacante Disponible
      const needyClub = sorted.find(t => t && (t.p || 0) >= 6 && t.pts <= 4 && t.id !== career?.teamId && !seenTeamIds.has(t.id));
      if (needyClub && rumors.length < 8) {
        seenTeamIds.add(needyClub.id);
        const rumorId = `rumor-vacancy-${compId}-${div}-${needyClub.id}-${rumors.length}`;
        if (!seenIds.has(rumorId)) {
          seenIds.add(rumorId);
          rumors.push({
            id: rumorId,
            type: 'vacancy',
            tag: 'VACANTE',
            text: `${needyClub.name} busca oficialmente nuevo director técnico en el mercado.`
          });
        }
      }
    });

    // 3. Pistas de Expectativa / Prensa General
    if (comp.name && rumors.length < 10) {
      const rumorId = `rumor-press-${compId}-${rumors.length}`;
      if (!seenIds.has(rumorId)) {
        seenIds.add(rumorId);
        rumors.push({
          id: rumorId,
          type: 'press',
          tag: 'PRENSA',
          text: `Crece la presión sobre los banquillos en la lucha por el título de la ${comp.name}.`
        });
      }
    }
  });

  // Fallbacks universales si no hay suficientes
  if (rumors.length === 0) {
    rumors.push(
      { id: 'fallback-press-1', type: 'press', tag: 'PRENSA', text: 'El mercado de directores técnicos se agita de cara a la próxima ventana de fichajes.' },
      { id: 'fallback-rumor-2', type: 'rumor', tag: 'RUMOR', text: 'Varios clubes de primera división envían ojeadores para monitorear tácticas emergentes.' },
      { id: 'fallback-market-3', type: 'press', tag: 'MERCADO', text: 'Los representantes de entrenadores buscan proyectos ambiciosos en las principales ligas.' }
    );
  }

  return rumors;
};

/* =============================== DESPIDOS =================================
 * Más duros: la probabilidad crece con lo mal que fue la temporada y con la
 * mala racha acumulada. Un objetivo fallado ya no se perdona dos veces.
 */
export const fireChance = ({ objective, score = 0, objectivesMet = 0, badStreak = 0, tier = 1 }) => {
  if (objective?.fire) return 1;
  if (!objective?.riskFire) {
    // Aun sin riesgo formal, dos temporadas seguidas por debajo pesan
    if (badStreak >= 2 && score <= -2 && objectivesMet === 0) return 0.35;
    return 0;
  }
  let p = 0.65;
  if (score <= -3) p = 0.95;
  else if (score <= -2) p = 0.85;
  else if (score <= -1) p = 0.75;
  if (objectivesMet === 0) p += 0.1;
  if (objectivesMet >= 2) p -= 0.25;
  if (badStreak >= 1) p += 0.15;
  if (tier >= 4) p += 0.05; // en un gigante la paciencia es mínima
  return Math.max(0.1, Math.min(0.98, p));
};


// Los 5 equipos con estadísticas más mediocres de una división
export const worstTeams = (teams, count = 5) => {
  return [...(teams || [])]
    .sort((a, b) => strengthOf(a) - strengthOf(b) || (a.name || '').localeCompare(b.name || ''))
    .slice(0, count);
};

/** Trayectoria: sólo los cambios de club, sin repetir información por temporada. */
export const careerSpells = (history = []) => {
  const asc = [...history].sort((a, b) => a.season - b.season);
  const spells = [];
  asc.forEach(s => {
    const last = spells[spells.length - 1];
    if (last && last.teamName === s.teamName && last.compName === s.compName) {
      last.to = s.season;
      last.seasons += 1;
      last.bestPosition = Math.min(last.bestPosition, s.position || 99);
      last.repAfter = s.repAfter;
      return;
    }
    spells.push({
      teamName: s.teamName,
      compName: s.compName,
      from: s.season,
      to: s.season,
      seasons: 1,
      bestPosition: s.position || 99,
      repAfter: s.repAfter,
      arrival: s.arrival || (spells.length === 0 ? 'Inicio de carrera' : 'Cambio de club')
    });
  });
  return spells.reverse();
};

export const SPECIAL_OFFICE_WEEKS = [
  {
    week: 1,
    triggerAfterMd: 0,
    title: 'Apertura de Mercado de Verano',
    subtitle: 'Planificación de Temporada y Mercado Laboral',
    desc: 'Ventana oficial de fichajes y contratación de directores técnicos antes del arranque de la liga. Momento ideal para postularte a un nuevo banquillo.',
    isMarket: true
  },
  {
    week: 8,
    triggerAfterMd: 6,
    title: 'Parón Internacional · Semana de Oficina',
    subtitle: 'Ventana FIFA de Selecciones',
    desc: 'Semana de descanso liguero por compromisos internacionales. Trabajo de táctica y recuperación física en la ciudad deportiva.',
    isMarket: false
  },
  {
    week: 16,
    triggerAfterMd: 13,
    title: 'Parón Internacional · Semana de Oficina',
    subtitle: 'Compromisos Internacionales',
    desc: 'Parón en las principales ligas europeas. Sesión de preparación y análisis del rendimiento tras la primera parte del torneo.',
    isMarket: false
  },
  {
    week: 23,
    triggerAfterMd: 19,
    title: 'Apertura de Mercado de Invierno',
    subtitle: 'Ecuador del Campeonato y Mercado Laboral',
    desc: 'Concluida la primera vuelta (Jornada 19), se abre la ventana de invierno para relevo y contratación de técnicos en crisis o proyectos ambiciosos.',
    isMarket: true
  },
  {
    week: 32,
    triggerAfterMd: 27,
    title: 'Parón Internacional · Semana de Oficina',
    subtitle: 'Último Parón Internacional',
    desc: 'Última ventana FIFA antes de afrontar las jornadas decisivas del campeonato. Ajustes tácticos y preparación física final.',
    isMarket: false
  }
];

export const calculateCurrentSeasonWeek = (matchdaysPlayed = 0, completedOfficeWeeks = []) => {
  const completed = Array.isArray(completedOfficeWeeks) ? completedOfficeWeeks : [];
  
  // 1. Comprobar si hay una semana especial de oficina pendiente justo en esta jornada
  const activeOffice = SPECIAL_OFFICE_WEEKS.find(w => matchdaysPlayed === w.triggerAfterMd && !completed.includes(w.week));
  if (activeOffice) {
    return {
      week: activeOffice.week,
      isOfficeWeek: true,
      isMarketOpen: activeOffice.isMarket,
      officeInfo: activeOffice
    };
  }

  // 2. Si no es semana de oficina activa, calcular el número de semana de calendario (1 a 43)
  let officeOffset = 0;
  if (completed.includes(1) || matchdaysPlayed > 0) officeOffset += 1;
  if (completed.includes(8) || matchdaysPlayed >= 7) officeOffset += 1;
  if (completed.includes(16) || matchdaysPlayed >= 14) officeOffset += 1;
  if (completed.includes(23) || matchdaysPlayed >= 20) officeOffset += 1;
  if (completed.includes(32) || matchdaysPlayed >= 28) officeOffset += 1;

  const week = Math.min(43, Math.max(1, matchdaysPlayed + officeOffset + (completed.includes(1) ? 0 : 1)));

  return {
    week,
    isOfficeWeek: false,
    isMarketOpen: false,
    officeInfo: null
  };
};

export const DEFAULT_CAREER = {
  active: false,
  manager: 'Nuevo Técnico',
  compId: CAREER_LEAGUE_ID,
  div: CAREER_DIV,
  teamId: null,
  tier: 1,
  pe: 0,
  reputation: 10,
  startedSeason: 1,
  contractStart: 1,
  contractSeasons: CONTRACT_SEASONS,
  tactic: null,
  baseDist: null,
  seasonLog: [],
  seasonHistory: [],
  offers: [],
  fired: false,
  // Champions: la carrera se engancha a la Champions global ('C1'), no crea otra
  clSeason: null,
  clQualifiedFor: null,
  badStreak: 0,
  lastObjectivesMet: 0,
  lastProcessedSeason: 0,
  // Temporada en la que ya se firmó (renovación o club nuevo): bloquea el balance
  signedForSeason: 0,
  // Club del primer contrato: si te despiden de él y era de los más humildes,
  // puedes volver a empezar allí
  firstTeamId: null,
  firstTeamCompId: null,
  firstTeamDiv: null,
  // Sistema de Entrenamiento & Salud
  medicalImmunityWeeks: 0,
  trainedMatchday: -1,
  // Semanas especiales de oficina completadas
  completedOfficeWeeks: [],
  // Modal de resolución pendiente de candidatura
  pendingAppResolutionModal: null,
  // Registro de estadísticas originales para restaurar el club si el DT cambia de equipo
  originalTeamStats: null,
  // Estadísticas agregadas de por vida e Historial de Leyenda
  stats: {
    matches: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    gf: 0,
    ga: 0
  },
  trophies: {
    leagues: 0,
    champions: 0,
    promotions: 0
  },
  lastSimulationFeedback: null,
  // Postulación activa en mercado (máximo 1 activa, 2 semanas en revisión a ciegas)
  activeApplication: null,
  applicationHistory: []
};
