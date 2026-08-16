import React, { useState, useMemo } from 'react';
import { Trophy, Dices, Zap, Shield as ShieldIcon, ChevronRight, Calendar, Award, CheckCircle, CheckCircle2, XCircle, Clock, Sparkles, Layers, ArrowLeft, RotateCcw, ShieldCheck, Dumbbell, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clPhaseLabel, getChampionsObjectiveTarget, CL_PHASE_ORDER, tacticalOptions, sameDist, generateLeagueSchedule, getChampionsMatchKey } from '../lib/career';
import { sanitizeChampionsBracket } from '../lib/championsSanitizer';

interface CareerChampionsHubProps {
  career: any;
  team: any;
  clComp: any;
  clInfo: any;
  onPlayChampionsMatch: () => void;
  onSimulateChampionsMatch: () => void;
  onSimulateAllChampions?: () => void;
  onOpenNewSeason?: () => void;
  onBackToCareer?: () => void;
  onOpenDrill?: () => void;
  onOpenTraining?: () => void;
  onSetTactic?: (tactic: any) => void;
  ui: any;
}

export const CareerChampionsHub: React.FC<CareerChampionsHubProps> = ({
  career,
  team,
  clComp,
  clInfo,
  onPlayChampionsMatch,
  onSimulateChampionsMatch,
  onSimulateAllChampions,
  onOpenNewSeason,
  onBackToCareer,
  onOpenDrill,
  onOpenTraining,
  onSetTactic,
  ui
}) => {
  const { Shield } = ui;
  const [subTab, setSubTab] = useState<'match' | 'tactic' | 'groups' | 'bracket' | 'schedule' | 'objective'>('match');
  const [selectedGroupIdx, setSelectedGroupIdx] = useState<number | null>(null);

  // Identificar el equipo del modo carrera dentro de la Champions (C1)
  const careerClTeam = useMemo(() => {
    if (!clComp?.teams?.length || !team) return null;
    return clComp.teams.find((t: any) => t.id === clComp.careerTeamId) ||
      clComp.teams.find((t: any) => t.name === (clComp.careerTeamName || team.name)) || null;
  }, [clComp, team]);

  const phase = clComp?.phase || 'groups';
  const matchday = clComp?.matchday || 0;
  const isFinished = clComp?.showWinner || phase === 'Terminado';

  // Bracket seguro y auto-reparado con formato oficial UEFA (ida y vuelta en Octavos/Cuartos/Semis, partido único en Final)
  const safeBracket = useMemo(() => {
    return sanitizeChampionsBracket(clComp?.bracket, clComp?.teams) || clComp?.bracket;
  }, [clComp?.bracket, clComp?.teams]);

  // Base táctica y opciones
  const baseTactic = useMemo(() => ({
    att: career.baseDist?.att || team?.att || 3,
    opp: career.baseDist?.opp || team?.opp || 3,
    def: career.baseDist?.def || team?.def || 3
  }), [career.baseDist, team]);

  const effectiveTactic = useMemo(() => {
    const tactic = career.tactic ? { ...career.tactic } : { ...baseTactic };
    if (career.activeInjury) {
      const attr = career.activeInjury.attr as 'att' | 'opp' | 'def';
      if (attr) {
        tactic[attr] = Math.max(1, (tactic[attr] || 1) - 1);
      }
    }
    return tactic;
  }, [career.tactic, baseTactic, career.activeInjury]);

  const totalTeamStrength = baseTactic.att + baseTactic.opp + baseTactic.def;
  const currentTier = career?.tier || team?.tier || 1;
  const tacticOptionsList = useMemo(() => tacticalOptions(baseTactic, currentTier), [baseTactic, currentTier]);

  // Buscar el grupo del usuario
  const userGroup = useMemo(() => {
    if (!clComp?.groups || !careerClTeam) return null;
    return clComp.groups.find((g: any) => g.teamIds?.includes(careerClTeam.id)) || clComp.groups[0] || null;
  }, [clComp, careerClTeam]);

  // Si no se ha seleccionado grupo manualmente, mostrar por defecto el grupo del usuario
  const activeGroupIdx = useMemo(() => {
    if (selectedGroupIdx !== null) return selectedGroupIdx;
    if (!userGroup || !clComp?.groups) return 0;
    const idx = clComp.groups.findIndex((g: any) => g.name === userGroup.name);
    return idx >= 0 ? idx : 0;
  }, [selectedGroupIdx, userGroup, clComp]);

  // Determinar si el club no clasificó a Champions esta temporada
  const isNotQualified = useMemo(() => {
    if (careerClTeam) return false;
    if (career.clQualified) return false;
    if (clInfo && !clInfo.notQualified) return false;
    return true;
  }, [careerClTeam, career.clQualified, clInfo]);

  // Encontrar el último partido jugado por el usuario en Champions League (cronológicamente el más reciente)
  const lastPlayedChampionsMatch = useMemo(() => {
    // Si el club no clasificó o no tiene equipo asignado en Champions, no renderizar tarjeta de partido previo
    if (isNotQualified || !careerClTeam || careerClTeam.id === undefined || careerClTeam.id === null) return null;
    const userClId = careerClTeam.id;

    // 1. Buscar en el historial general de Champions (C1) - index 0 es la jornada más reciente
    let historyMatch: any = null;
    if (Array.isArray(clComp?.history) && clComp.history.length > 0) {
      for (let i = 0; i < clComp.history.length; i++) {
        const h = clComp.history[i];
        const m = (h.results || []).find((r: any) => r && (r.hId === userClId || r.aId === userClId));
        if (m) {
          const ht = clComp.teams.find((t: any) => t.id === m.hId) || { name: 'Local' };
          const at = clComp.teams.find((t: any) => t.id === m.aId) || { name: 'Visitante' };
          const isHome = m.hId === userClId;
          const myScore = isHome ? m.sh : m.sa;
          const rivalScore = isHome ? m.sa : m.sh;
          const rivalTeam = (isHome ? at : ht) || { name: 'Rival Europeo' };
          const res = myScore > rivalScore ? 'W' : myScore === rivalScore ? 'D' : 'L';

          // Detectar si fue partido de eliminatoria de ida y vuelta
          let aggregateInfo: any = null;
          const isKnockout = ['Octavos', 'Cuartos', 'Semis'].some(p => (h.day || '').includes(p));
          const phaseKey = ['Octavos', 'Cuartos', 'Semis'].find(p => (h.day || '').includes(p));
          
          if (isKnockout && phaseKey && safeBracket?.[phaseKey]) {
            const bMatches = Array.isArray(safeBracket[phaseKey]) ? safeBracket[phaseKey] : [safeBracket[phaseKey]];
            const bMatch = bMatches.find((bm: any) => bm && (bm.hId === userClId || bm.aId === userClId));
            if (bMatch && bMatch.sh !== null) {
              const hasVuelta = bMatch.sh2 !== null && bMatch.sh2 !== undefined;
              const isVuelta = (h.day || '').includes('Vuelta') || hasVuelta;

              // En la ida: hId es Local, aId es Visitante
              // En la vuelta: aId es Local (recibe la vuelta), hId es Visitante
              // Totales globales:
              // hId: goles en ida (sh) + goles en vuelta (sa2)
              // aId: goles en ida (sa) + goles en vuelta (sh2)
              const totHId = (bMatch.sh || 0) + (bMatch.sa2 || 0);
              const totAId = (bMatch.sa || 0) + (bMatch.sh2 || 0);

              // Alinear el resultado global de cara al escudo mostrado a la izquierda y derecha en este partido
              const leftTotal = isVuelta ? totAId : (bMatch.sh || 0);
              const rightTotal = isVuelta ? totHId : (bMatch.sa || 0);
              const globalLeft = isVuelta ? totAId : totHId;
              const globalRight = isVuelta ? totHId : totAId;

              let qualified = null;
              if (hasVuelta) {
                let winnerId = null;
                if (totHId > totAId) winnerId = bMatch.hId;
                else if (totAId > totHId) winnerId = bMatch.aId;
                else if (bMatch.penH !== null && bMatch.penH !== undefined) {
                  // penH es del local de vuelta (aId), penA es del visitante de vuelta (hId)
                  winnerId = bMatch.penH > bMatch.penA ? bMatch.aId : bMatch.hId;
                }
                if (winnerId !== null) {
                  qualified = winnerId === userClId;
                }
              }

              aggregateInfo = {
                phaseName: phaseKey,
                isVuelta,
                leg1Score: `${bMatch.sh} - ${bMatch.sa}`,
                leg2Score: hasVuelta ? `${bMatch.sh2} - ${bMatch.sa2}` : null,
                leftTotal,
                rightTotal,
                globalScoreText: hasVuelta ? `${globalLeft} - ${globalRight}` : `${bMatch.sh} - ${bMatch.sa}`,
                penaltiesText: (bMatch.penH !== null && bMatch.penH !== undefined) ? `(${bMatch.penH}-${bMatch.penA} pen.)` : null,
                qualified
              };
            }
          }

          const clLogEntry = (career.seasonLog || []).find((l: any) => l.isChampions);

          historyMatch = {
            dayLabel: h.day,
            home: ht,
            away: at,
            isHome,
            scoreH: m.sh,
            scoreA: m.sa,
            penH: m.penH,
            penA: m.penA,
            myScore,
            rivalScore,
            rivalTeam,
            result: res,
            aggregateInfo,
            pe: clLogEntry?.pe ?? (res === 'W' ? 3 : res === 'D' ? 2 : 0),
            rep: clLogEntry?.rep ?? (res === 'W' ? 0.8 : res === 'D' ? 0.3 : -0.1)
          };
          break;
        }
      }
    }

    if (historyMatch) return historyMatch;

    const clLogEntry = (career.seasonLog || []).find((l: any) => l.isChampions);
    if (clLogEntry && !isNotQualified) {
      return {
        dayLabel: `Champions · ${clPhaseLabel(clLogEntry.phase || 'groups')}`,
        home: null,
        away: null,
        isHome: true,
        scoreH: clLogEntry.gf,
        scoreA: clLogEntry.ga,
        myScore: clLogEntry.gf,
        rivalScore: clLogEntry.ga,
        rivalTeam: { name: clLogEntry.rival || 'Rival Europeo' },
        result: clLogEntry.result,
        aggregateInfo: null,
        pe: clLogEntry.pe,
        rep: clLogEntry.rep
      };
    }

    return null;
  }, [career.seasonLog, clComp, careerClTeam, isNotQualified, safeBracket]);

  // Calcular el partido actual del usuario en Champions
  const currentMatchData = useMemo(() => {
    if (!clComp || !careerClTeam) return null;

    if (phase === 'groups') {
      if (!userGroup) return null;
      const groupTeams = (clComp.teams || []).filter((t: any) => userGroup.teamIds?.includes(t.id));
      const schedule = generateLeagueSchedule(groupTeams, true);
      const roundIdx = matchday % 6;
      const currentRound = schedule[roundIdx] || [];
      const match = currentRound.find((m: any) => m.homeId === careerClTeam.id || m.awayId === careerClTeam.id);
      if (match) {
        const rawHome = clComp.teams.find((t: any) => t.id === match.homeId);
        const rawAway = clComp.teams.find((t: any) => t.id === match.awayId);
        const isHome = match.homeId === careerClTeam.id;
        const rival = isHome ? rawAway : rawHome;
        return {
          match,
          home: rawHome,
          away: rawAway,
          isHome,
          rival,
          phaseLabel: `Fase de Grupos · Jornada ${roundIdx + 1} de 6`,
          groupName: userGroup.name,
          isVuelta: false,
          aggregate: null
        };
      }
    } else if (['Octavos', 'Cuartos', 'Semis', 'Final'].includes(phase)) {
      const bracketMatches = Array.isArray(safeBracket?.[phase])
        ? safeBracket[phase]
        : [safeBracket?.[phase]].filter(Boolean);

      const match = bracketMatches.find((m: any) => m && (m.hId === careerClTeam.id || m.aId === careerClTeam.id));
      if (match) {
        const isVuelta = matchday % 2 !== 0 && phase !== 'Final';
        const homeId = isVuelta ? match.aId : match.hId;
        const awayId = isVuelta ? match.hId : match.aId;
        const rawHome = clComp.teams.find((t: any) => t.id === homeId);
        const rawAway = clComp.teams.find((t: any) => t.id === awayId);
        const isHome = homeId === careerClTeam.id;
        const rival = isHome ? rawAway : rawHome;

        let aggregate = null;
        if (isVuelta && match.sh !== null && match.sa !== null) {
          // Ida: match.sh (goles anotados por match.hId), match.sa (goles anotados por match.aId)
          // En la vuelta: rawHome es match.aId (Local a la izquierda) y rawAway es match.hId (Visitante a la derecha)
          aggregate = {
            homeLeg1: match.sa, // goles que metió el que ahora es local en la ida
            awayLeg1: match.sh  // goles que metió el que ahora es visitante en la ida
          };
        }

        const legText = phase === 'Final' ? 'Gran Final (Partido Único)' : isVuelta ? 'Vuelta' : 'Ida';
        return {
          match,
          home: rawHome,
          away: rawAway,
          isHome,
          rival,
          phaseLabel: `${clPhaseLabel(phase)} · ${legText}`,
          isVuelta,
          aggregate,
          leg1Score: (aggregate && aggregate.homeLeg1 !== null && aggregate.awayLeg1 !== null)
            ? `${aggregate.homeLeg1} - ${aggregate.awayLeg1}`
            : (match.sh !== null && match.sa !== null ? `${match.sh} - ${match.sa}` : null)
        };
      }
    }
    return null;
  }, [clComp, safeBracket, careerClTeam, phase, matchday, userGroup]);

  // Clave de partido de Champions League para independizar entrenamiento
  const clMatchKey = useMemo(() => {
    const s = career.season || career.clSeason || clComp?.season || 1;
    const p = clComp?.phase || 'groups';
    const md = clComp?.matchday || 0;
    return getChampionsMatchKey(s, p, md);
  }, [career.season, career.clSeason, clComp?.phase, clComp?.matchday, clComp?.season]);

  const hasTrainedThisClMatch = useMemo(() => {
    return career.trainedMatchKey === clMatchKey || career.trainedClMatchKey === clMatchKey;
  }, [career.trainedMatchKey, career.trainedClMatchKey, clMatchKey]);

  // Determinar si el club fue campeón de Champions
  const isChampion = useMemo(() => {
    if (isNotQualified) return false;
    const finalMatch = safeBracket?.Final?.[0] || safeBracket?.Final;
    if (!isFinished || !finalMatch || !careerClTeam) return false;
    const { hId, aId, sh, sa, penH, penA } = finalMatch;
    if (sh === null || sa === null) return false;
    let winnerId = null;
    if (sh > sa) winnerId = hId;
    else if (sa > sh) winnerId = aId;
    else if (penH !== null && penA !== null) winnerId = penH > penA ? hId : aId;
    return winnerId === careerClTeam.id;
  }, [isNotQualified, isFinished, safeBracket, careerClTeam]);

  // Determinar si el club fue finalista (subcampeón) de Champions
  const isFinalist = useMemo(() => {
    if (isNotQualified || !careerClTeam) return false;
    const finalMatch = safeBracket?.Final?.[0] || safeBracket?.Final;
    if (!finalMatch) return false;
    return finalMatch.hId === careerClTeam.id || finalMatch.aId === careerClTeam.id;
  }, [isNotQualified, careerClTeam, safeBracket]);

  // Determinar si sigue vivo en Champions
  const isAlive = useMemo(() => {
    if (isNotQualified) return false;
    if (isFinished) return false;
    if (!careerClTeam) return false;
    if (phase === 'groups') return true;
    return !!currentMatchData?.match;
  }, [isNotQualified, isFinished, careerClTeam, phase, currentMatchData]);

  // Objetivo continental
  const clObjective = useMemo(() => {
    const target = getChampionsObjectiveTarget(career.tier || 1);
    const targetRank = CL_PHASE_ORDER.indexOf(target.targetPhase);
    const currentRank = CL_PHASE_ORDER.indexOf(phase);
    let done = false;
    let progress = 20;
    let status: 'completed' | 'on_track' | 'at_risk' | 'failed' = 'on_track';
    let statusLabel = 'En Carrera';

    if (isNotQualified) {
      done = false;
      progress = 0;
      status = 'failed';
      statusLabel = 'No Clasificado';
    } else if (isChampion) {
      done = true;
      progress = 100;
      status = 'completed';
      statusLabel = '¡Campeón de Europa!';
    } else if (!isAlive && !isFinished) {
      if (currentRank >= targetRank) {
        done = true;
        progress = 100;
        status = 'completed';
        statusLabel = 'Objetivo Cumplido';
      } else {
        done = false;
        progress = Math.max(10, Math.round((currentRank / (targetRank || 1)) * 80));
        status = 'failed';
        statusLabel = 'Eliminado';
      }
    } else if (isFinished && !isChampion) {
      if (currentRank >= targetRank) {
        done = true;
        progress = 100;
        status = 'completed';
        statusLabel = 'Objetivo Cumplido';
      } else {
        done = false;
        status = 'failed';
        statusLabel = 'No Alcanzado';
      }
    } else {
      if (currentRank >= targetRank) {
        done = true;
        progress = 100;
        status = 'completed';
        statusLabel = 'Objetivo Alcanzado';
      } else {
        done = false;
        progress = Math.max(20, Math.min(90, Math.round(((currentRank + 1) / (targetRank + 1)) * 90)));
        status = 'on_track';
        statusLabel = `En ${clPhaseLabel(phase)}`;
      }
    }

    return { target, done, progress, status, statusLabel };
  }, [isNotQualified, career.tier, phase, isChampion, isAlive, isFinished]);

  return (
    <div className='space-y-4 text-white'>
      {/* HEADER DE CHAMPIONS LEAGUE */}
      <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-slate-950 to-indigo-950 border border-blue-500/30 p-5 shadow-2xl'>
        {/* Estrellas decorativas de fondo */}
        <div className='absolute -right-10 -top-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none' />
        <div className='absolute left-1/3 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none' />

        <div className='relative z-10 flex flex-col gap-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 flex items-center justify-center shadow-lg border border-blue-400/40'>
                <Trophy size={24} className='text-yellow-300 animate-pulse' />
              </div>
              <div>
                <div className='flex items-center gap-2'>
                  <span className='text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20'>
                    UEFA Champions League
                  </span>
                  <span className='text-[9px] font-bold text-slate-400'>
                    Temporada {career.season || 1}
                  </span>
                </div>
                <h2 className='text-lg font-black uppercase italic tracking-tight text-white mt-0.5 flex items-center gap-2'>
                  {team?.name || 'Tu Club'}
                  {careerClTeam && (
                    <span className='text-xs font-bold text-slate-300 not-italic'>
                      ({careerClTeam.att}/{careerClTeam.opp}/{careerClTeam.def})
                    </span>
                  )}
                </h2>
              </div>
            </div>

            {/* Badge de estado en Europa */}
            <div>
              {isChampion ? (
                <div className='bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-black text-[9px] uppercase px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce'>
                  <Trophy size={12} /> Campeón 🏆
                </div>
              ) : isNotQualified ? (
                <div className='bg-slate-800/80 text-slate-400 border border-white/10 font-black text-[9px] uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5'>
                  <XCircle size={11} className='text-slate-400' /> No Clasificado
                </div>
              ) : isAlive ? (
                <div className='bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-[9px] uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5'>
                  <Sparkles size={11} className='animate-spin' /> {clPhaseLabel(phase)}
                </div>
              ) : (
                <div className='bg-red-500/20 text-red-300 border border-red-500/30 font-black text-[9px] uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5'>
                  <XCircle size={11} /> Eliminado
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas de Champions del Club */}
          {careerClTeam && (
            <div className='grid grid-cols-5 gap-2 bg-black/40 rounded-2xl p-2.5 border border-white/5'>
              <div className='text-center'>
                <p className='text-[8px] font-black uppercase text-slate-400'>PJ</p>
                <p className='text-xs font-black text-white tabular-nums'>{careerClTeam.p || 0}</p>
              </div>
              <div className='text-center'>
                <p className='text-[8px] font-black uppercase text-slate-400'>V - E - D</p>
                <p className='text-xs font-black text-white tabular-nums'>
                  {careerClTeam.w || 0}-{careerClTeam.d || 0}-{careerClTeam.l || 0}
                </p>
              </div>
              <div className='text-center'>
                <p className='text-[8px] font-black uppercase text-slate-400'>GF / GC</p>
                <p className='text-xs font-black text-white tabular-nums'>
                  {careerClTeam.gf || 0}/{careerClTeam.ga || 0}
                </p>
              </div>
              <div className='text-center'>
                <p className='text-[8px] font-black uppercase text-slate-400'>DG</p>
                <p className='text-xs font-black text-emerald-400 tabular-nums'>
                  {((careerClTeam.gf || 0) - (careerClTeam.ga || 0)) > 0 ? `+${(careerClTeam.gf || 0) - (careerClTeam.ga || 0)}` : ((careerClTeam.gf || 0) - (careerClTeam.ga || 0))}
                </p>
              </div>
              <div className='text-center'>
                <p className='text-[8px] font-black uppercase text-blue-400'>PTS</p>
                <p className='text-xs font-black text-blue-300 tabular-nums'>{careerClTeam.pts || 0}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NAVEGACIÓN DE SUB-PESTAÑAS */}
      <div className='grid grid-cols-3 sm:grid-cols-6 gap-1 bg-slate-900/60 p-1 rounded-2xl border border-white/5 text-[9px] font-black uppercase tracking-wider'>
        <button
          onClick={() => setSubTab('match')}
          className={`py-2 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
            subTab === 'match'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Dices size={12} />
          <span>Partido</span>
        </button>
        <button
          onClick={() => setSubTab('tactic')}
          className={`py-2 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
            subTab === 'tactic'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck size={12} />
          <span>Táctica</span>
        </button>
        <button
          onClick={() => setSubTab('groups')}
          className={`py-2 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
            subTab === 'groups'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers size={12} />
          <span>Grupos</span>
        </button>
        <button
          onClick={() => setSubTab('bracket')}
          className={`py-2 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
            subTab === 'bracket'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy size={12} />
          <span>Cuadro</span>
        </button>
        <button
          onClick={() => setSubTab('schedule')}
          className={`py-2 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
            subTab === 'schedule'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar size={12} />
          <span>Fechas</span>
        </button>
        <button
          onClick={() => setSubTab('objective')}
          className={`py-2 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
            subTab === 'objective'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award size={12} />
          <span>Objetivo</span>
        </button>
      </div>

      {/* CONTENIDO DE SUB-PESTAÑAS */}
      <AnimatePresence mode='wait'>
        {/* SUB-PESTAÑA 1: PARTIDO ACTIVO / PRÓXIMO CRUCE */}
        {subTab === 'match' && (
          <motion.div
            key='match'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className='space-y-4'
          >
            {/* SECCIÓN 1: ÚLTIMO PARTIDO JUGADO EN CHAMPIONS (CON RESULTADO) */}
            {lastPlayedChampionsMatch && (
              <div className='bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-blue-950/40 rounded-3xl p-4 border border-blue-500/30 shadow-lg space-y-2.5'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-1.5'>
                    <span className='text-[8px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20'>
                      Último Partido Disputado
                    </span>
                    <span className='text-[8px] font-bold text-slate-400'>
                      {lastPlayedChampionsMatch.dayLabel}
                    </span>
                  </div>
                  <span className={`text-[8px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    lastPlayedChampionsMatch.result === 'W'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : lastPlayedChampionsMatch.result === 'D'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-red-500/20 text-red-300 border border-red-500/40'
                  }`}>
                    {lastPlayedChampionsMatch.result === 'W' ? 'Victoria 🏆' : lastPlayedChampionsMatch.result === 'D' ? 'Empate 🤝' : 'Derrota ❌'}
                  </span>
                </div>

                <div className='bg-black/40 rounded-2xl p-3 border border-white/5 flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-2 min-w-0 flex-1'>
                    <Shield
                      color1={lastPlayedChampionsMatch.isHome ? (team?.color1 || lastPlayedChampionsMatch.home?.color1) : lastPlayedChampionsMatch.home?.color1}
                      color2={lastPlayedChampionsMatch.isHome ? (team?.color2 || lastPlayedChampionsMatch.home?.color2) : lastPlayedChampionsMatch.home?.color2}
                      initial={lastPlayedChampionsMatch.isHome ? (team?.name || lastPlayedChampionsMatch.home?.name) : lastPlayedChampionsMatch.home?.name}
                      size='sm'
                      isFlag={lastPlayedChampionsMatch.isHome ? (team?.isFlag ?? lastPlayedChampionsMatch.home?.isFlag) : lastPlayedChampionsMatch.home?.isFlag}
                    />
                    <span className={`text-[10px] font-black uppercase truncate ${lastPlayedChampionsMatch.isHome ? 'text-blue-300' : 'text-white'}`}>
                      {lastPlayedChampionsMatch.isHome ? (team?.name || lastPlayedChampionsMatch.home?.name) : (lastPlayedChampionsMatch.home?.name || lastPlayedChampionsMatch.rivalTeam?.name)}
                    </span>
                  </div>

                  <div className='text-center shrink-0 px-3 py-1 bg-black/60 rounded-xl border border-white/10'>
                    <span className='text-sm font-black italic text-white tabular-nums tracking-wider'>
                      {lastPlayedChampionsMatch.scoreH} - {lastPlayedChampionsMatch.scoreA}
                    </span>
                    {lastPlayedChampionsMatch.penH !== null && lastPlayedChampionsMatch.penH !== undefined && (
                      <span className='block text-[7.5px] font-bold text-amber-300'>
                        ({lastPlayedChampionsMatch.penH}-{lastPlayedChampionsMatch.penA} pen.)
                      </span>
                    )}
                  </div>

                  <div className='flex items-center justify-end gap-2 min-w-0 flex-1 text-right'>
                    <span className={`text-[10px] font-black uppercase truncate ${!lastPlayedChampionsMatch.isHome ? 'text-blue-300' : 'text-white'}`}>
                      {!lastPlayedChampionsMatch.isHome ? (team?.name || lastPlayedChampionsMatch.away?.name) : (lastPlayedChampionsMatch.away?.name || lastPlayedChampionsMatch.rivalTeam?.name)}
                    </span>
                    <Shield
                      color1={!lastPlayedChampionsMatch.isHome ? (team?.color1 || lastPlayedChampionsMatch.away?.color1) : lastPlayedChampionsMatch.away?.color1}
                      color2={!lastPlayedChampionsMatch.isHome ? (team?.color2 || lastPlayedChampionsMatch.away?.color2) : lastPlayedChampionsMatch.away?.color2}
                      initial={!lastPlayedChampionsMatch.isHome ? (team?.name || lastPlayedChampionsMatch.away?.name) : lastPlayedChampionsMatch.away?.name}
                      size='sm'
                      isFlag={!lastPlayedChampionsMatch.isHome ? (team?.isFlag ?? lastPlayedChampionsMatch.away?.isFlag) : lastPlayedChampionsMatch.away?.isFlag}
                    />
                  </div>
                </div>

                {/* Resumen Global de Eliminatoria (Ida y Vuelta) */}
                {lastPlayedChampionsMatch.aggregateInfo && (
                  <div className='bg-blue-950/60 rounded-2xl p-2.5 border border-blue-400/30 flex flex-wrap items-center justify-between gap-2 text-[8px] font-bold text-slate-200'>
                    <div className='flex items-center gap-2'>
                      {lastPlayedChampionsMatch.aggregateInfo.globalScoreText ? (
                        <span className='bg-blue-600 px-3 py-1 rounded-xl font-black text-white text-[9.5px] shadow-sm tracking-wide'>
                          RESULTADO GLOBAL: {lastPlayedChampionsMatch.aggregateInfo.globalScoreText} {lastPlayedChampionsMatch.aggregateInfo.penaltiesText || ''}
                        </span>
                      ) : (
                        <span className='bg-blue-600/80 px-2.5 py-1 rounded-xl font-black text-white text-[9px]'>
                          GLOBAL: {lastPlayedChampionsMatch.aggregateInfo.myTotal} - {lastPlayedChampionsMatch.aggregateInfo.rivalTotal}
                        </span>
                      )}
                    </div>
                    {lastPlayedChampionsMatch.aggregateInfo.qualified !== null && (
                      <span className={`px-2.5 py-1 rounded-full font-black uppercase tracking-wider text-[8px] ${
                        lastPlayedChampionsMatch.aggregateInfo.qualified
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {lastPlayedChampionsMatch.aggregateInfo.qualified ? '✅ ¡Clasificado a siguiente ronda!' : '❌ Eliminado en esta ronda'}
                      </span>
                    )}
                  </div>
                )}

                <div className='flex items-center justify-between text-[8px] font-bold text-slate-400 px-1'>
                  <span>Balance Continental: +{lastPlayedChampionsMatch.pe || 0} PE ganados</span>
                  <span className='text-amber-400 font-black'>+{lastPlayedChampionsMatch.rep || 0} Reputación</span>
                </div>
              </div>
            )}

            {isChampion ? (
              <div className='bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-slate-900 border border-yellow-500/40 rounded-3xl p-6 text-center space-y-4 shadow-xl'>
                <Trophy size={48} className='text-yellow-400 mx-auto animate-bounce drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]' />
                <h3 className='text-xl font-black uppercase italic text-white'>¡CAMPEÓN DE LA UEFA CHAMPIONS LEAGUE!</h3>
                <p className='text-xs font-bold text-yellow-200/90 max-w-md mx-auto'>
                  Has alcanzado la gloria máxima del fútbol continental. Tu nombre y tu club quedan grabados para siempre en la historia de Europa.
                </p>
                <div className='flex justify-center gap-3 pt-2'>
                  <div className='bg-black/40 px-4 py-2 rounded-2xl border border-yellow-500/30 text-center'>
                    <p className='text-[8px] font-black uppercase text-yellow-400'>Recompensa Mánager</p>
                    <p className='text-sm font-black text-white'>+10 PE · +8.0 Rep</p>
                  </div>
                </div>
                {onOpenNewSeason && (
                  <button
                    onClick={onOpenNewSeason}
                    className='w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2'
                  >
                    <RotateCcw size={15} /> Iniciar Nueva Temporada Global
                  </button>
                )}
              </div>
            ) : currentMatchData ? (
              <div className='bg-slate-900/80 rounded-3xl p-5 border border-blue-500/30 space-y-4 shadow-xl'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <span className='w-2 h-2 rounded-full bg-blue-400 animate-ping' />
                    <span className='text-[10px] font-black uppercase tracking-wider text-blue-300'>
                      Próximo Partido · {currentMatchData.phaseLabel}
                    </span>
                  </div>
                  {currentMatchData.aggregate && (
                    <span className='text-[9px] font-black bg-blue-500/20 text-blue-200 px-2.5 py-1 rounded-full border border-blue-500/30'>
                      Resultado Ida: {currentMatchData.leg1Score}
                    </span>
                  )}
                </div>

                {/* Matchup Card */}
                <div className='bg-black/40 rounded-2xl p-4 border border-white/5 flex items-center justify-between'>
                  {/* Local */}
                  <div className='flex-1 flex flex-col items-center text-center'>
                    <Shield
                      color1={currentMatchData.isHome ? (team?.color1 || currentMatchData.home?.color1) : currentMatchData.home?.color1}
                      color2={currentMatchData.isHome ? (team?.color2 || currentMatchData.home?.color2) : currentMatchData.home?.color2}
                      initial={currentMatchData.isHome ? (team?.name || currentMatchData.home?.name) : currentMatchData.home?.name}
                      size='md'
                      isFlag={currentMatchData.isHome ? (team?.isFlag ?? currentMatchData.home?.isFlag) : currentMatchData.home?.isFlag}
                    />
                    <h4 className={`text-xs font-black uppercase italic mt-2 truncate w-full ${currentMatchData.isHome ? 'text-blue-400' : 'text-white'}`}>
                      {currentMatchData.isHome ? (team?.name || currentMatchData.home?.name) : currentMatchData.home?.name}
                    </h4>
                    <span className='text-[8px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full mt-1'>
                      {currentMatchData.isHome
                        ? `${effectiveTactic.att}/${effectiveTactic.opp}/${effectiveTactic.def}`
                        : `${currentMatchData.home?.att}/${currentMatchData.home?.opp}/${currentMatchData.home?.def}`}
                    </span>
                  </div>

                  {/* VS */}
                  <div className='px-4 flex flex-col items-center shrink-0'>
                    <span className='text-xs font-black italic text-slate-500'>VS</span>
                    <span className='text-[8px] font-bold text-slate-400 uppercase mt-1'>
                      {currentMatchData.isHome ? 'En Casa' : 'De Visita'}
                    </span>
                  </div>

                  {/* Visitante */}
                  <div className='flex-1 flex flex-col items-center text-center'>
                    <Shield
                      color1={!currentMatchData.isHome ? (team?.color1 || currentMatchData.away?.color1) : currentMatchData.away?.color1}
                      color2={!currentMatchData.isHome ? (team?.color2 || currentMatchData.away?.color2) : currentMatchData.away?.color2}
                      initial={!currentMatchData.isHome ? (team?.name || currentMatchData.away?.name) : currentMatchData.away?.name}
                      size='md'
                      isFlag={!currentMatchData.isHome ? (team?.isFlag ?? currentMatchData.away?.isFlag) : currentMatchData.away?.isFlag}
                    />
                    <h4 className={`text-xs font-black uppercase italic mt-2 truncate w-full ${!currentMatchData.isHome ? 'text-blue-400' : 'text-white'}`}>
                      {!currentMatchData.isHome ? (team?.name || currentMatchData.away?.name) : currentMatchData.away?.name}
                    </h4>
                    <span className='text-[8px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full mt-1'>
                      {!currentMatchData.isHome
                        ? `${effectiveTactic.att}/${effectiveTactic.opp}/${effectiveTactic.def}`
                        : `${currentMatchData.away?.att}/${currentMatchData.away?.opp}/${currentMatchData.away?.def}`}
                    </span>
                  </div>
                </div>

                {/* Dinámicas de Salud / Inmunidad / Lesiones en Champions */}
                <div className='space-y-2'>
                  {career.activeInjury && (
                    <div className='bg-red-950/50 border border-red-500/40 rounded-2xl p-3 flex items-start gap-2.5 shadow-md'>
                      <span className='text-red-400 font-black text-sm'>⚠️</span>
                      <div className='text-[9px] font-bold text-red-200 leading-snug'>
                        <span className='text-white font-black uppercase block tracking-wider'>
                          Baja temporal por lesión: -1 {career.activeInjury.label || career.activeInjury.attr?.toUpperCase()}
                        </span>
                        Afecta exclusivamente a este partido europeo. Alta médica automática tras el encuentro.
                      </div>
                    </div>
                  )}

                  {/* Previa de Entrenamiento Champions */}
                  <div className='bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-purple-900/30 rounded-2xl p-3 border border-white/10 flex items-center justify-between gap-2'>
                    <div className='min-w-0'>
                      <div className='flex items-center gap-1.5 flex-wrap'>
                        <p className='text-[9px] font-black uppercase tracking-widest text-blue-300'>
                          Preparación Europea
                        </p>
                        {hasTrainedThisClMatch ? (
                          <span className='text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1'>
                            <CheckCircle2 size={10} /> Sesión Completada
                          </span>
                        ) : career.medicalImmunityWeeks > 0 ? (
                          <span className='text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'>
                            Inmunidad: {career.medicalImmunityWeeks} sem.
                          </span>
                        ) : null}
                      </div>
                      <p className='text-[9px] font-bold text-slate-300 mt-0.5'>
                        {hasTrainedThisClMatch ? 'Intensidad aplicada a este encuentro' : `${career.pe} PE disponibles en tu club`}
                      </p>
                    </div>
                    {(onOpenDrill || onOpenTraining) && (
                      <div className='flex items-center gap-1.5 shrink-0'>
                        {onOpenDrill && (
                          <button
                            onClick={onOpenDrill}
                            disabled={hasTrainedThisClMatch}
                            className={`px-3 py-1.5 rounded-xl border text-[8px] font-black uppercase italic active:scale-95 transition-all flex items-center gap-1 ${
                              hasTrainedThisClMatch
                                ? 'bg-slate-800/60 border-white/10 text-slate-500 cursor-not-allowed opacity-60'
                                : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-300'
                            }`}
                          >
                            <Dices size={11} />
                            {hasTrainedThisClMatch ? 'Hecho' : '1D6'}
                          </button>
                        )}
                        {onOpenTraining && (
                          <button
                            onClick={onOpenTraining}
                            className='px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[8px] font-black uppercase italic active:scale-95'
                          >
                            PE
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones de Partido */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1'>
                  <button
                    onClick={onPlayChampionsMatch}
                    className='w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest active:scale-95 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 border border-blue-400/40'
                  >
                    <Dices size={16} className='text-yellow-300 animate-pulse' />
                    Jugar Partido con Dados
                  </button>

                  <button
                    onClick={onSimulateChampionsMatch}
                    className='w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest active:scale-95 transition-all border border-white/10 flex items-center justify-center gap-2'
                  >
                    <Zap size={16} className='text-amber-400' />
                    Simular Partido Rápido
                  </button>
                </div>
              </div>
            ) : isNotQualified ? (
              <div className='bg-slate-900/80 rounded-3xl p-6 text-center space-y-4 border border-white/10 shadow-xl'>
                <div className='w-14 h-14 rounded-2xl bg-slate-800/80 border border-white/10 flex items-center justify-center mx-auto shadow-inner'>
                  <XCircle size={32} className='text-slate-400' />
                </div>
                <div>
                  <span className='text-[8px] font-black uppercase tracking-widest text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-white/10'>
                    No Clasificado
                  </span>
                  <h3 className='text-sm font-black uppercase italic text-white mt-2'>
                    Sin Participación Continental Esta Temporada
                  </h3>
                  <p className='text-xs font-bold text-slate-300 max-w-sm mx-auto mt-1 leading-relaxed'>
                    Tu club no logró la clasificación a la UEFA Champions League para esta temporada. Para acceder a la máxima competición de Europa, debes finalizar entre los 4 primeros (Top 4) en la 1ª División de tu liga nacional.
                  </p>
                </div>

                <div className='flex flex-col sm:flex-row gap-2 justify-center pt-2'>
                  {onSimulateAllChampions && !isFinished && (
                    <button
                      onClick={onSimulateAllChampions}
                      className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest active:scale-95 transition-all shadow flex items-center justify-center gap-2'
                    >
                      <Zap size={14} className='text-yellow-300' /> Simular Torneo Completo
                    </button>
                  )}
                  {onOpenNewSeason && isFinished && (
                    <button
                      onClick={onOpenNewSeason}
                      className='bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2'
                    >
                      <RotateCcw size={15} /> Iniciar Nueva Temporada Global
                    </button>
                  )}
                  {onBackToCareer && (
                    <button
                      onClick={onBackToCareer}
                      className='bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest border border-white/10 active:scale-95 transition-all'
                    >
                      Volver a la Liga Nacional
                    </button>
                  )}
                </div>
              </div>
            ) : isFinalist && isFinished ? (
              <div className='bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900 border border-slate-400/40 rounded-3xl p-6 text-center space-y-4 shadow-xl'>
                <div className='w-14 h-14 rounded-2xl bg-slate-700/60 border border-slate-400/30 flex items-center justify-center mx-auto shadow-inner'>
                  <Trophy size={32} className='text-slate-300' />
                </div>
                <div>
                  <span className='text-[8px] font-black uppercase tracking-widest text-slate-300 bg-slate-700/60 px-3 py-1 rounded-full border border-slate-400/30'>
                    Subcampeón de la UEFA Champions League
                  </span>
                  <h3 className='text-base font-black uppercase italic text-white mt-2'>
                    Gran Finalista de Europa
                  </h3>
                  <p className='text-xs font-bold text-slate-300 max-w-sm mx-auto mt-1 leading-relaxed'>
                    Tu club llegó hasta la Gran Final de la Champions League completando una temporada continental histórica como subcampeón de Europa.
                  </p>
                </div>

                <div className='flex justify-center gap-3 pt-1'>
                  <div className='bg-black/40 px-4 py-2 rounded-2xl border border-slate-500/30 text-center'>
                    <p className='text-[8px] font-black uppercase text-slate-400'>Recompensa Mánager</p>
                    <p className='text-xs font-black text-white'>+6 PE · +4.5 Reputación</p>
                  </div>
                </div>

                <div className='flex flex-col sm:flex-row gap-2 justify-center pt-2'>
                  {onOpenNewSeason && (
                    <button
                      onClick={onOpenNewSeason}
                      className='bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2'
                    >
                      <RotateCcw size={15} /> Iniciar Nueva Temporada Global
                    </button>
                  )}
                  {onBackToCareer && (
                    <button
                      onClick={onBackToCareer}
                      className='bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest border border-white/10 active:scale-95 transition-all'
                    >
                      Volver a la Liga Nacional
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className='bg-slate-900/80 rounded-3xl p-6 text-center space-y-4 border border-red-500/30 shadow-xl'>
                <XCircle size={40} className='text-red-400 mx-auto' />
                <div>
                  <span className='text-[8px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/30'>
                    {isFinished ? 'Temporada Continental Finalizada' : 'Eliminado de la Competición'}
                  </span>
                  <h3 className='text-sm font-black uppercase italic text-white mt-2'>
                    {isFinished ? 'Torneo Continental Concluido' : 'Tu Club Ha Sido Eliminado'}
                  </h3>
                  <p className='text-xs font-bold text-slate-300 max-w-sm mx-auto mt-1 leading-relaxed'>
                    {isFinished
                      ? 'La UEFA Champions League ha llegado a su fin. Puedes revisar el cuadro de honor y la tabla final o iniciar la nueva temporada global.'
                      : 'Tu equipo ha quedado fuera de la Champions League esta temporada. Puedes simular el resto del torneo para ver al campeón o regresar a competir en tu Liga Nacional.'}
                  </p>
                </div>

                <div className='flex flex-col sm:flex-row gap-2 justify-center pt-2'>
                  {onSimulateAllChampions && !isFinished && (
                    <button
                      onClick={onSimulateAllChampions}
                      className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest active:scale-95 transition-all shadow flex items-center justify-center gap-2'
                    >
                      <Zap size={14} className='text-yellow-300' /> Simular Resto de la Champions League
                    </button>
                  )}
                  {onOpenNewSeason && isFinished && (
                    <button
                      onClick={onOpenNewSeason}
                      className='bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2'
                    >
                      <RotateCcw size={15} /> Iniciar Nueva Temporada Global
                    </button>
                  )}
                  {onBackToCareer && (
                    <button
                      onClick={onBackToCareer}
                      className='bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest border border-white/10 active:scale-95 transition-all'
                    >
                      Volver a la Liga Nacional
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB-PESTAÑA: TÁCTICA & PIZARRA */}
        {subTab === 'tactic' && (
          <motion.div
            key='tactic'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className='space-y-4'
          >
            <div className='bg-slate-900/80 rounded-3xl p-5 border border-blue-500/30 space-y-4 shadow-xl'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-[9px] font-black uppercase tracking-widest text-amber-400'>
                    Pizarra Táctica · {totalTeamStrength} Puntos de Fuerza
                  </p>
                  <h3 className='text-base font-black uppercase italic text-white mt-0.5'>
                    Distribución Táctica para Europa
                  </h3>
                </div>
                <div className='w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30'>
                  <Target size={20} />
                </div>
              </div>

              <div className='bg-black/40 rounded-2xl p-3.5 border border-white/5'>
                <p className='text-[10px] font-bold text-slate-300 leading-relaxed'>
                  Puntos totales a distribuir: <strong className='text-amber-300'>{baseTactic.att} + {baseTactic.opp} + {baseTactic.def} = {totalTeamStrength} pts</strong>.
                  Ajusta la estrategia para los cruces de Champions respetando los límites de plantilla (5-5-4).
                </p>
              </div>

              {/* Grid de opciones tácticas */}
              <div className='grid grid-cols-3 gap-2.5'>
                {tacticOptionsList.map(o => {
                  const active = sameDist(career.tactic || baseTactic, o);
                  return (
                    <button
                      key={`${o.att}-${o.opp}-${o.def}`}
                      onClick={() => onSetTactic && onSetTactic(o)}
                      className={`py-3.5 rounded-2xl border text-center transition-all active:scale-95 shadow ${
                        active
                          ? 'bg-gradient-to-br from-amber-400 to-amber-500 border-amber-300 text-slate-950 font-black'
                          : 'bg-slate-900/60 hover:bg-slate-800 border-white/10 text-white'
                      }`}
                    >
                      <p className='text-base font-black italic tabular-nums'>{o.att}-{o.opp}-{o.def}</p>
                      <p className={`text-[7px] font-black uppercase tracking-wider ${active ? 'text-slate-900/80' : 'text-slate-400'}`}>
                        ATT · OPP · DEF
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Botones de Entrenamiento y PE */}
              <div className='pt-2 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-2'>
                {onOpenTraining && (
                  <button
                    onClick={onOpenTraining}
                    className='p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[9px] font-black uppercase italic tracking-wider flex items-center justify-center gap-1.5 active:scale-95 shadow'
                  >
                    <Dumbbell size={14} /> Subir Atributos ({career.pe || 0} PE)
                  </button>
                )}
                {onOpenDrill && (
                  <button
                    onClick={onOpenDrill}
                    disabled={hasTrainedThisClMatch}
                    className={`p-3 rounded-2xl text-[9px] font-black uppercase italic tracking-wider border flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
                      hasTrainedThisClMatch
                        ? 'bg-slate-800/40 border-white/5 text-slate-500 cursor-not-allowed opacity-60'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-white/10'
                    }`}
                  >
                    <Dices size={14} className={hasTrainedThisClMatch ? 'text-slate-500' : 'text-amber-400'} />
                    {hasTrainedThisClMatch ? 'Sesión Completada (1D6 Hecho)' : 'Lanzar Dado de Entreno (1D6)'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* SUB-PESTAÑA 2: FASE DE GRUPOS */}
        {subTab === 'groups' && (
          <motion.div
            key='groups'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className='space-y-4'
          >
            {/* Selector de Grupo */}
            <div className='flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar'>
              {(clComp.groups || []).map((g: any, i: number) => {
                const isMyGroup = g.teamIds?.includes(careerClTeam?.id);
                return (
                  <button
                    key={g.name}
                    onClick={() => setSelectedGroupIdx(i)}
                    className={`px-3.5 py-2 rounded-xl text-[9px] font-black uppercase whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      activeGroupIdx === i
                        ? 'bg-blue-600 text-white shadow-md'
                        : isMyGroup
                          ? 'bg-blue-950/60 text-blue-300 border border-blue-500/40'
                          : 'bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{g.name}</span>
                    {isMyGroup && <span className='w-1.5 h-1.5 rounded-full bg-yellow-400' />}
                  </button>
                );
              })}
            </div>

            {/* Tabla del Grupo Activo */}
            {clComp.groups?.[activeGroupIdx] && (
              <div className='bg-slate-900/80 rounded-3xl p-4 border border-blue-500/20 space-y-2'>
                <div className='flex items-center justify-between px-2 pb-1'>
                  <h3 className='text-xs font-black uppercase italic text-blue-300'>
                    {clComp.groups[activeGroupIdx].name}
                  </h3>
                  <span className='text-[8px] font-bold text-slate-400 uppercase'>
                    Top 2 clasifican a Octavos
                  </span>
                </div>

                <div className='space-y-1.5'>
                  {(() => {
                    const g = clComp.groups[activeGroupIdx];
                    const gTeams = (clComp.teams || [])
                      .filter((t: any) => g.teamIds?.includes(t.id))
                      .sort((a: any, b: any) => (b.pts || 0) - (a.pts || 0) || ((b.gf || 0) - (b.ga || 0)) - ((a.gf || 0) - (a.ga || 0)) || (b.gf || 0) - (a.gf || 0));

                    return gTeams.map((t: any, idx: number) => {
                      const isMe = t.id === careerClTeam?.id;
                      const isQualifying = idx < 2;

                      return (
                        <div
                          key={t.id}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl transition-all ${
                            isMe
                              ? 'bg-blue-600/25 border border-blue-400/50 shadow-md'
                              : idx % 2 === 0
                                ? 'bg-black/30'
                                : 'bg-black/15'
                          } ${isQualifying ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-transparent'}`}
                        >
                          <span className={`w-4 text-[9px] font-black tabular-nums ${isQualifying ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {idx + 1}
                          </span>
                          <Shield color1={t.color1} color2={t.color2} initial={t.name} size='sm' isFlag={t.isFlag} />
                          <div className='flex-grow min-w-0'>
                            <p className={`text-[10px] font-black uppercase italic truncate ${isMe ? 'text-blue-300' : 'text-white'}`}>
                              {t.name} {isMe && '★'}
                            </p>
                          </div>
                          <span className='text-[9px] font-bold text-slate-400 tabular-nums w-5 text-center'>{t.p || 0}</span>
                          <span className='text-[9px] font-bold text-slate-400 tabular-nums w-5 text-center'>{t.w || 0}</span>
                          <span className='text-[9px] font-bold text-slate-400 tabular-nums w-5 text-center'>{t.d || 0}</span>
                          <span className='text-[9px] font-bold text-slate-400 tabular-nums w-5 text-center'>{t.l || 0}</span>
                          <span className='text-[9px] font-bold text-slate-400 tabular-nums w-7 text-center'>
                            {(t.gf || 0) - (t.ga || 0) > 0 ? `+${(t.gf || 0) - (t.ga || 0)}` : (t.gf || 0) - (t.ga || 0)}
                          </span>
                          <span className='text-[10px] font-black text-white tabular-nums w-6 text-right'>{t.pts || 0}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB-PESTAÑA 3: CUADRO ELIMINATORIO / BRACKET */}
        {subTab === 'bracket' && (
          <motion.div
            key='bracket'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className='space-y-4'
          >
            {safeBracket ? (
              <div className='flex gap-4 overflow-x-auto pb-4 custom-scrollbar'>
                {['Octavos', 'Cuartos', 'Semis', 'Final'].filter(p => safeBracket[p]).map(p => (
                  <div key={p} className='min-w-[280px] sm:min-w-[310px] flex-shrink-0 space-y-2.5'>
                    <div className='flex items-center justify-between bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 px-3.5 py-2 rounded-2xl border border-blue-500/30 shadow-md'>
                      <div>
                        <h4 className='text-[11px] font-black uppercase italic text-blue-300'>{clPhaseLabel(p)}</h4>
                        <span className='text-[8px] font-bold text-slate-400'>{p === 'Final' ? 'Partido Único (Sede Neutral)' : 'Eliminatoria Ida y Vuelta'}</span>
                      </div>
                      {p !== 'Final' ? (
                        <div className='flex items-center gap-2 text-[7.5px] font-black uppercase tracking-wider text-slate-400'>
                          <span className='w-6 text-center text-slate-300'>Ida</span>
                          <span className='w-6 text-center text-slate-300'>Vta</span>
                          <span className='w-8 text-center text-amber-300'>Glob</span>
                        </div>
                      ) : (
                        <span className='text-[8px] font-black uppercase text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30'>Final</span>
                      )}
                    </div>

                    <div className='space-y-2.5'>
                      {(Array.isArray(safeBracket[p]) ? safeBracket[p] : [safeBracket[p]]).filter(Boolean).map((m: any, mi: number) => {
                        const h = clComp.teams.find((t: any) => t.id === m.hId);
                        const a = clComp.teams.find((t: any) => t.id === m.aId);
                        const isMyMatch = m.hId === careerClTeam?.id || m.aId === careerClTeam?.id;

                        let winner = null;
                        if (p !== 'Final' ? (m.sh2 !== null && m.sh2 !== undefined) : (m.sh !== null && m.sh !== undefined)) {
                          if (p !== 'Final') {
                            const totH = (m.sh || 0) + (m.sh2 || 0);
                            const totA = (m.sa || 0) + (m.sa2 || 0);
                            if (totH > totA) winner = h;
                            else if (totA > totH) winner = a;
                            else if (m.penH !== null && m.penH !== undefined) winner = m.penH > m.penA ? h : a;
                          } else {
                            if (m.sh > m.sa) winner = h;
                            else if (m.sa > m.sh) winner = a;
                            else if (m.penH !== null && m.penH !== undefined) winner = m.penH > m.penA ? h : a;
                          }
                        }

                        const isTwoLegged = p !== 'Final';
                        const hasIda = m.sh !== null && m.sh !== undefined && m.sa !== null && m.sa !== undefined;
                        const hasVuelta = isTwoLegged && m.sh2 !== null && m.sh2 !== undefined && m.sa2 !== null && m.sa2 !== undefined;
                        const totH = (m.sh || 0) + (m.sh2 || 0);
                        const totA = (m.sa || 0) + (m.sa2 || 0);

                        return (
                          <div
                            key={mi}
                            className={`rounded-2xl p-3.5 border transition-all space-y-2 shadow-lg ${
                              isMyMatch
                                ? 'bg-gradient-to-br from-blue-950/90 via-slate-900/95 to-indigo-950/80 border-blue-400/70 shadow-blue-500/10 ring-1 ring-blue-500/30'
                                : 'bg-slate-900/85 border-white/10'
                            }`}
                          >
                            {/* Cabecera del Cruce */}
                            <div className='flex items-center justify-between text-[8px] font-black uppercase tracking-wider pb-1.5 border-b border-white/5'>
                              <div className='flex items-center gap-1.5'>
                                <span className='text-slate-400'>Llave {mi + 1}</span>
                                {isMyMatch && (
                                  <span className='px-1.5 py-0.2 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/40 text-[7px]'>
                                    Tu Partido
                                  </span>
                                )}
                              </div>

                              {isTwoLegged ? (
                                <span className={`px-2 py-0.5 rounded-full text-[7.5px] font-bold ${
                                  hasVuelta
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : hasIda
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                    : 'bg-slate-800 text-slate-400 border border-white/10'
                                }`}>
                                  {hasVuelta ? `Global: ${totH} - ${totA}` : hasIda ? 'Ida disputada' : 'Por disputar'}
                                </span>
                              ) : (
                                <span className={`px-2 py-0.5 rounded-full text-[7.5px] font-bold ${
                                  m.sh !== null ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {m.sh !== null ? `Resultado: ${m.sh} - ${m.sa}` : 'Por disputar'}
                                </span>
                              )}
                            </div>

                            {/* Fila Equipo 1 (Local en Ida / Equipo A) */}
                            <div className='flex justify-between items-center py-1'>
                              <div className='flex items-center gap-2 flex-1 min-w-0 pr-2'>
                                <Shield color1={h?.color1} color2={h?.color2} initial={h?.name} size='xs' isFlag={h?.isFlag} />
                                <span className={`text-[10px] font-black uppercase italic truncate ${
                                  winner?.id === h?.id
                                    ? 'text-yellow-300'
                                    : h?.id === careerClTeam?.id
                                    ? 'text-blue-300'
                                    : h
                                    ? 'text-white'
                                    : 'text-slate-500'
                                }`}>
                                  {h?.name || 'Por Definir'}
                                </span>
                              </div>

                              {isTwoLegged ? (
                                <div className='flex items-center gap-2 tabular-nums text-[10px] shrink-0'>
                                  {/* Ida */}
                                  <span className={`w-6 text-center py-0.5 rounded font-extrabold ${
                                    hasIda ? 'bg-black/50 text-slate-200 border border-white/5' : 'text-slate-600'
                                  }`} title='Goles en Ida'>
                                    {hasIda ? m.sh : '—'}
                                  </span>

                                  {/* Vuelta */}
                                  <span className={`w-6 text-center py-0.5 rounded font-extrabold ${
                                    hasVuelta ? 'bg-black/50 text-slate-200 border border-white/5' : 'text-slate-600'
                                  }`} title='Goles en Vuelta'>
                                    {hasVuelta ? m.sh2 : '—'}
                                  </span>

                                  {/* Global */}
                                  <span className={`w-8 text-center py-0.5 rounded-lg font-black shadow-sm ${
                                    hasVuelta
                                      ? (winner?.id === h?.id ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black' : 'bg-blue-900/60 text-blue-200 border border-blue-500/30')
                                      : 'text-slate-600'
                                  }`} title='Marcador Global Acumulado'>
                                    {hasVuelta ? totH : '—'}
                                  </span>

                                  {/* Penaltis si hubo */}
                                  {hasVuelta && m.penH !== null && m.penH !== undefined && (
                                    <span className='text-amber-400 text-[8px] font-black bg-amber-500/20 px-1 py-0.5 rounded border border-amber-500/30'>
                                      ({m.penH})
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className='flex items-center gap-1.5 tabular-nums text-[11px] shrink-0'>
                                  <span className={`px-2.5 py-0.5 rounded-lg font-black ${
                                    m.sh !== null
                                      ? (winner?.id === h?.id ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-white border border-white/10')
                                      : 'text-slate-600'
                                  }`}>
                                    {m.sh !== null ? m.sh : '—'}
                                  </span>
                                  {m.penH !== null && m.penH !== undefined && (
                                    <span className='text-amber-400 text-[8px] font-black bg-amber-500/20 px-1.5 py-0.5 rounded'>
                                      ({m.penH} pen.)
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Fila Equipo 2 (Visitante en Ida / Equipo B) */}
                            <div className='flex justify-between items-center py-1 border-t border-white/5'>
                              <div className='flex items-center gap-2 flex-1 min-w-0 pr-2'>
                                <Shield color1={a?.color1} color2={a?.color2} initial={a?.name} size='xs' isFlag={a?.isFlag} />
                                <span className={`text-[10px] font-black uppercase italic truncate ${
                                  winner?.id === a?.id
                                    ? 'text-yellow-300'
                                    : a?.id === careerClTeam?.id
                                    ? 'text-blue-300'
                                    : a
                                    ? 'text-white'
                                    : 'text-slate-500'
                                }`}>
                                  {a?.name || 'Por Definir'}
                                </span>
                              </div>

                              {isTwoLegged ? (
                                <div className='flex items-center gap-2 tabular-nums text-[10px] shrink-0'>
                                  {/* Ida */}
                                  <span className={`w-6 text-center py-0.5 rounded font-extrabold ${
                                    hasIda ? 'bg-black/50 text-slate-200 border border-white/5' : 'text-slate-600'
                                  }`} title='Goles en Ida'>
                                    {hasIda ? m.sa : '—'}
                                  </span>

                                  {/* Vuelta */}
                                  <span className={`w-6 text-center py-0.5 rounded font-extrabold ${
                                    hasVuelta ? 'bg-black/50 text-slate-200 border border-white/5' : 'text-slate-600'
                                  }`} title='Goles en Vuelta'>
                                    {hasVuelta ? m.sa2 : '—'}
                                  </span>

                                  {/* Global */}
                                  <span className={`w-8 text-center py-0.5 rounded-lg font-black shadow-sm ${
                                    hasVuelta
                                      ? (winner?.id === a?.id ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black' : 'bg-blue-900/60 text-blue-200 border border-blue-500/30')
                                      : 'text-slate-600'
                                  }`} title='Marcador Global Acumulado'>
                                    {hasVuelta ? totA : '—'}
                                  </span>

                                  {/* Penaltis si hubo */}
                                  {hasVuelta && m.penA !== null && m.penA !== undefined && (
                                    <span className='text-amber-400 text-[8px] font-black bg-amber-500/20 px-1 py-0.5 rounded border border-amber-500/30'>
                                      ({m.penA})
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className='flex items-center gap-1.5 tabular-nums text-[11px] shrink-0'>
                                  <span className={`px-2.5 py-0.5 rounded-lg font-black ${
                                    m.sa !== null
                                      ? (winner?.id === a?.id ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-white border border-white/10')
                                      : 'text-slate-600'
                                  }`}>
                                    {m.sa !== null ? m.sa : '—'}
                                  </span>
                                  {m.penA !== null && m.penA !== undefined && (
                                    <span className='text-amber-400 text-[8px] font-black bg-amber-500/20 px-1.5 py-0.5 rounded'>
                                      ({m.penA} pen.)
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Resumen del Ganador / Clasificado */}
                            {winner ? (
                              <div className='mt-1 pt-1.5 border-t border-white/5 flex items-center justify-between text-[8px] font-black uppercase'>
                                <span className='text-emerald-400 flex items-center gap-1'>
                                  <CheckCircle size={10} /> {p === 'Final' ? '🏆 Campeón:' : 'Pasa:'}
                                </span>
                                <span className='truncate font-black text-amber-300 max-w-[150px]'>{winner.name}</span>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='bg-slate-900/60 rounded-3xl p-8 text-center space-y-2 border border-white/5'>
                <Trophy size={32} className='text-slate-500 mx-auto' />
                <h4 className='text-xs font-black uppercase italic text-slate-300'>Cuadro de Eliminatorias no sorteado</h4>
                <p className='text-[10px] font-bold text-slate-400'>
                  Las eliminatorias (Octavos, Cuartos, Semifinales y Final) se sortearán automáticamente al concluir las 6 jornadas de la Fase de Grupos.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB-PESTAÑA 4: CALENDARIO & HISTORIAL DE FECHAS */}
        {subTab === 'schedule' && (
          <motion.div
            key='schedule'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className='space-y-4'
          >
            {clComp.history?.length > 0 ? (
              clComp.history.map((h: any, i: number) => {
                const isKnockoutDay = ['Octavos', 'Cuartos', 'Semis', 'Final'].some(k => (h.day || '').includes(k));
                return (
                  <div key={i} className='bg-slate-900/80 rounded-3xl p-4 border border-white/10 space-y-3 shadow-lg'>
                    <div className='flex items-center justify-between pb-2 border-b border-white/5'>
                      <div className='flex items-center gap-2'>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isKnockoutDay
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}>
                          {h.day}
                        </span>
                      </div>
                      <span className='text-[8px] font-bold text-slate-400'>
                        {h.results?.length || 0} {h.results?.length === 1 ? 'partido disputado' : 'partidos disputados'}
                      </span>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                      {h.results?.map((r: any, ri: number) => {
                        const rawHome = clComp.teams.find((t: any) => t.id === r.hId);
                        const rawAway = clComp.teams.find((t: any) => t.id === r.aId);
                        const isHomeMe = r.hId === careerClTeam?.id;
                        const isAwayMe = r.aId === careerClTeam?.id;
                        const isMe = isHomeMe || isAwayMe;

                        const home = isHomeMe ? { ...rawHome, ...team } : rawHome;
                        const away = isAwayMe ? { ...rawAway, ...team } : rawAway;

                        const homeWon = r.sh > r.sa || (r.penH !== null && r.penH !== undefined && r.penH > r.penA);
                        const awayWon = r.sa > r.sh || (r.penA !== null && r.penA !== undefined && r.penA > r.penH);
                        const isTie = r.sh === r.sa && (r.penH === null || r.penH === undefined);

                        return (
                          <div
                            key={ri}
                            className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                              isMe
                                ? 'bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border-blue-400/50 shadow-md ring-1 ring-blue-400/20'
                                : 'bg-black/30 border-white/5 hover:border-white/10'
                            }`}
                          >
                            {/* Equipo Local */}
                            <div className='flex items-center gap-2 flex-1 min-w-0 pr-2'>
                              <Shield color1={home?.color1} color2={home?.color2} initial={home?.name} size='xs' isFlag={home?.isFlag} />
                              <span className={`text-[10px] font-black uppercase truncate ${
                                isHomeMe ? 'text-blue-300' : homeWon ? 'text-white' : isTie ? 'text-slate-300' : 'text-slate-400'
                              }`}>
                                {home?.name || 'Local'}
                              </span>
                            </div>

                            {/* Marcador */}
                            <div className='shrink-0 text-center px-2.5 py-1 bg-black/60 rounded-xl border border-white/10'>
                              <span className='text-[11px] font-black tracking-wider text-white tabular-nums'>
                                {r.sh} - {r.sa}
                              </span>
                              {r.penH !== null && r.penH !== undefined && (
                                <span className='block text-[7.5px] font-bold text-amber-300'>
                                  ({r.penH}-{r.penA} pen)
                                </span>
                              )}
                            </div>

                            {/* Equipo Visitante */}
                            <div className='flex items-center justify-end gap-2 flex-1 min-w-0 pl-2 text-right'>
                              <span className={`text-[10px] font-black uppercase truncate ${
                                isAwayMe ? 'text-blue-300' : awayWon ? 'text-white' : isTie ? 'text-slate-300' : 'text-slate-400'
                              }`}>
                                {away?.name || 'Visitante'}
                              </span>
                              <Shield color1={away?.color1} color2={away?.color2} initial={away?.name} size='xs' isFlag={away?.isFlag} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className='bg-slate-900/60 rounded-3xl p-8 text-center text-slate-400 text-xs font-bold border border-white/5 space-y-2'>
                <p className='text-sm text-slate-300 font-black uppercase'>Sin partidos registrados</p>
                <p className='text-[10px]'>Aún no se han disputado jornadas en la presente edición de la UEFA Champions League.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB-PESTAÑA 5: OBJETIVO DE CHAMPIONS LEAGUE */}
        {subTab === 'objective' && (
          <motion.div
            key='objective'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className='space-y-4'
          >
            <div className='bg-slate-900/80 rounded-3xl p-5 border border-blue-500/30 space-y-4 shadow-xl'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Trophy size={18} className='text-yellow-400' />
                  <h3 className='text-sm font-black uppercase italic text-white'>
                    Exigencia Continental de la Junta Directiva
                  </h3>
                </div>
                <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${
                  clObjective.status === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : clObjective.status === 'failed'
                      ? 'bg-red-500/20 text-red-300 border-red-500/30'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                }`}>
                  {clObjective.statusLabel}
                </span>
              </div>

              <div className='bg-black/40 rounded-2xl p-4 border border-white/5 space-y-2'>
                <p className='text-xs font-black text-white'>{clObjective.target.label}</p>
                <p className='text-[10px] font-bold text-slate-300'>{clObjective.target.detail}</p>
                <div className='flex items-center justify-between pt-2 border-t border-white/5 text-[9px]'>
                  <span className='text-slate-400 font-bold'>Meta Mínima:</span>
                  <span className='text-white font-black'>{clObjective.target.targetValue}</span>
                </div>
              </div>

              {/* Barra de Progreso */}
              <div className='space-y-1.5'>
                <div className='flex justify-between text-[9px] font-black uppercase'>
                  <span className='text-slate-400'>Progreso Europeo</span>
                  <span className='text-blue-300 tabular-nums'>{clObjective.progress}%</span>
                </div>
                <div className='w-full h-2.5 bg-black/50 rounded-full overflow-hidden p-0.5 border border-white/10'>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      clObjective.status === 'completed'
                        ? 'bg-emerald-500'
                        : clObjective.status === 'failed'
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                    }`}
                    style={{ width: `${clObjective.progress}%` }}
                  />
                </div>
              </div>

              {/* Recompensas */}
              {isNotQualified ? (
                <div className='bg-black/30 rounded-xl p-3 text-center border border-white/5'>
                  <p className='text-[8px] font-black uppercase text-slate-400'>Beneficios Continental</p>
                  <p className='text-xs font-black text-slate-300 mt-0.5'>Sin beneficios por objetivo</p>
                  <p className='text-[9px] font-bold text-slate-500 mt-0.5'>Al no haber clasificado a Champions League, no se perciben PE ni Reputación por este concepto.</p>
                </div>
              ) : (
                <div className='grid grid-cols-2 gap-2 pt-1'>
                  <div className='bg-black/30 rounded-xl p-2.5 text-center border border-white/5'>
                    <p className='text-[8px] font-black uppercase text-amber-400'>Puntos de Entrenamiento</p>
                    <p className='text-xs font-black text-white'>+{clObjective.target.pe} PE</p>
                  </div>
                  <div className='bg-black/30 rounded-xl p-2.5 text-center border border-white/5'>
                    <p className='text-[8px] font-black uppercase text-sky-400'>Reputación Continental</p>
                    <p className='text-xs font-black text-white'>+{clObjective.target.rep} pts</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
