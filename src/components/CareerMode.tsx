// @ts-nocheck
import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Trophy, Dices, Star, TrendingUp, Users, BarChart3, Swords,
  Briefcase, Target, Sparkles, AlertTriangle, Check, X, Globe, History, Newspaper, Play,
  FileSignature, ShieldCheck, Pencil, CalendarPlus, Dumbbell, Zap, HeartPulse,
  Calendar, Award, ArrowUp, ArrowDown, Minus, CheckCircle, XCircle, ArrowRight, Lock,
  Plane, Mail, FastForward, Clock, RotateCcw
} from 'lucide-react';
import {
  TIERS, CLASS_INFO, classOf, tierCaps, tacticalOptions, sameDist, peCostFor,
  repBand, objectiveFor, expectedPosition, readPerformance, seasonObjectives,
  isSquadMaxed, careerSpells, CONTRACT_SEASONS, CL_SPOTS, signingRepBonus,
  generateRumors, getRejectionReason, getMarketVacancies, SPECIAL_OFFICE_WEEKS,
  getSpecialOfficeWeeks, calculateCurrentSeasonWeek, getContractObjectivesForTeam,
  calculateBoardConfidence, clPhaseLabel, getChampionsScheduledWeeks
} from '../lib/career';
import { TrainingModal } from './TrainingModal';
import { TrainingDrillModal } from './TrainingDrillModal';
import { RumorsTicker } from './RumorsTicker';
import { SimulationFeedbackBanner } from './SimulationFeedbackBanner';
import { CareerLegendProfile } from './CareerLegendProfile';
import { EndSeasonModal } from './EndSeasonModal';
import { ApplicationResolutionModal } from './ApplicationResolutionModal';
import { CareerChampionsHub } from './CareerChampionsHub';

const Panel = ({ children, className = '' }) => (
  <div className={`bg-slate-900/40 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-lg ${className}`}>
    {children}
  </div>
);

const Stat = ({ label, value, hint, accent = 'emerald' }) => (
  <div className='flex-1 bg-black/30 rounded-2xl px-3 py-2.5 border border-white/5'>
    <p className={`text-[8px] font-black uppercase tracking-widest text-${accent}-400`}>{label}</p>
    <p className='text-lg font-black italic text-white tabular-nums leading-tight'>{value}</p>
    {hint && <p className='text-[8px] font-bold uppercase text-slate-400 tracking-wider'>{hint}</p>}
  </div>
);

const TabButton = ({ active, onClick, icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`min-w-[62px] px-2.5 py-2 flex flex-col items-center justify-center gap-1 rounded-[14px] shrink-0 transition-all relative ${
      active ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {icon}
    <span className='text-[8px] font-black uppercase italic tracking-wider whitespace-nowrap'>{label}</span>
    {badge != null && badge !== 0 && badge !== '' && (
      <span className={`absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[7px] font-black leading-tight shadow-sm ${
        active ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
      }`}>
        {badge}
      </span>
    )}
  </button>
);

const strengthOf = t => (t?.att || 0) + (t?.opp || 0) + (t?.def || 0);

/* Rumores y titulares del mundo del fútbol */
const buildNews = ({
  managerName, teamName, rivalName, position, expected, reputation, log, tier,
  seasonsLeft, maxed, clQualified, clPhaseLabel, division, standingsSize
}) => {
  const items = [];
  const last = log?.[0];
  if (last) {
    items.push({
      tag: 'Crónica',
      text: last.result === 'W'
        ? `${teamName} se impone ${last.gf}-${last.ga} a ${last.rival} y el vestuario respira.`
        : last.result === 'D'
          ? `Reparto de puntos: ${teamName} ${last.gf}-${last.ga} ${last.rival}.`
          : `Derrota ${last.gf}-${last.ga} ante ${last.rival}: la prensa pide reacción.`
    });
  }
  if (rivalName) items.push({ tag: 'Previa', text: `Ambiente de jornada grande: ${teamName} mide fuerzas con ${rivalName}.` });
  if (position && expected) {
    items.push({
      tag: 'Análisis',
      text: position < expected
        ? `Los analistas destacan que ${teamName} rinde por encima de su presupuesto (${position}º frente al ${expected}º previsto).`
        : position > expected
          ? `Crecen las dudas: se esperaba a ${teamName} en el ${expected}º y marcha ${position}º.`
          : `${teamName} cumple el guion previsto en la clasificación.`
    });
  }

  // Mercado: aspirar a un club mejor o riesgo real de despido
  const overachieving = position && expected && expected - position >= 3;
  const underachieving = position && expected && position - expected >= 3;
  const recentLosses = log?.slice(0, 5).filter(l => l.result === 'L').length || 0;
  if (underachieving || recentLosses >= 3) {
    items.push({
      tag: 'Mercado',
      text: `La directiva empieza a sondear el mercado de entrenadores: si ${teamName} no reacciona, el puesto de ${managerName} peligra y el despido sería cuestión de semanas.`
    });
  } else if (overachieving && reputation >= 35) {
    items.push({
      tag: 'Mercado',
      text: `Clubes de mayor entidad preguntan por ${managerName}: con este rendimiento podría aspirar a un banquillo Tier ${Math.min(4, tier + 1)} el próximo verano.`
    });
  } else if (reputation >= 55) {
    items.push({
      tag: 'Mercado',
      text: `${managerName} entra en las quinielas de varios grandes; su nombre suena para proyectos de Champions.`
    });
  } else {
    items.push({
      tag: 'Mercado',
      text: `Sin movimientos: el mercado ve a ${managerName} atado al proyecto de ${teamName} mientras cumpla los objetivos.`
    });
  }

  if (clQualified) {
    items.push({
      tag: 'Champions',
      text: `${teamName} está en la Champions global${clPhaseLabel ? ` (${clPhaseLabel})` : ''}: Europa marca la temporada.`
    });
  } else if (division === 1 && position && position <= CL_SPOTS + 2) {
    items.push({
      tag: 'Champions',
      text: `La pelea por las ${CL_SPOTS} plazas de Champions está viva: ${teamName} marcha ${position}º de ${standingsSize || 20}.`
    });
  }

  items.push({
    tag: 'Contrato',
    text: seasonsLeft <= 1
      ? `Última temporada de contrato de ${managerName}: renovación o salida al final del curso.`
      : `A ${managerName} le quedan ${seasonsLeft} temporadas de contrato en ${teamName}.`
  });

  if (maxed) {
    items.push({
      tag: 'Club',
      text: `${teamName} ha tocado su techo institucional: el entrenamiento ya no aporta y sólo un club mayor puede dar más margen.`
    });
  }

  return items.slice(0, 6);
};

/* ============================ SELECCIÓN DE CLUB ============================ */
export const CareerSelectView = ({ candidates, leagueName, onBack, onStart, ui }) => {
  const { Shield } = ui;
  const [teamId, setTeamId] = useState(candidates?.[0]?.id ?? null);
  const [manager, setManager] = useState('');
  const [confirming, setConfirming] = useState(false);
  const selected = (candidates || []).find(t => t.id === teamId);

  const selectedObjectives = useMemo(() => {
    if (!selected) return [];
    return getContractObjectivesForTeam({
      team: selected,
      div: 2,
      tier: 1,
      totalTeams: candidates?.length || 20,
      coachRep: 10,
      totalRounds: ((candidates?.length || 20) - 1) * 2
    });
  }, [selected, candidates?.length]);

  return (
    <div className='flex-grow px-4 pb-20'>
      <div className='flex items-center gap-3 py-6'>
        <button onClick={onBack} className='p-2 bg-slate-900/30 backdrop-blur-md rounded-xl active:scale-95 transition-all border border-white/10'><ChevronLeft /></button>
        <div>
          <h2 className='text-xl font-black italic uppercase drop-shadow-md'>Modo Carrera</h2>
          <p className='text-[9px] font-bold uppercase tracking-widest text-amber-400'>Elige tu proyecto</p>
        </div>
      </div>

      <Panel className='p-5 mb-5'>
        <p className='text-[9px] font-black uppercase tracking-widest text-amber-400'>{leagueName} · 2ª División · Clase C</p>
        <h3 className='text-base font-black italic uppercase text-white mt-1'>Elige tu equipo</h3>
        <p className='text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1'>Clubes de bajo nivel</p>
        <p className='text-[10px] font-bold text-slate-300 mt-2 leading-relaxed'>
          Empiezas abajo, como Tier 1: sobrevivir, desarrollar y ascender. Los PE pertenecen al club; la reputación es tuya.
          Los contratos duran un máximo de {CONTRACT_SEASONS} temporadas.
        </p>
      </Panel>

      <div className='mb-5'>
        <p className='text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2'>Nombre del técnico</p>
        <input
          value={manager}
          onChange={e => setManager(e.target.value)}
          placeholder='Tu nombre'
          className='w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white placeholder:text-slate-500 outline-none focus:border-amber-400/60'
        />
      </div>

      <div className='space-y-3'>
        {(candidates || []).map(t => (
          <button
            key={t.id}
            onClick={() => setTeamId(t.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-3xl border transition-all active:scale-95 backdrop-blur-md text-left ${
              t.id === teamId ? 'bg-amber-600/40 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)]' : 'bg-slate-900/40 border-white/10'
            }`}
          >
            <Shield color1={t.color1} color2={t.color2} initial={t.name} size='md' isFlag={t.isFlag} />
            <div className='flex-grow'>
              <p className='text-xs font-black uppercase italic text-white drop-shadow-md'>{t.name}</p>
              <p className='text-[8px] font-bold text-slate-200 uppercase bg-black/40 px-1.5 py-0.5 rounded inline-block mt-1'>
                {t.att}/{t.opp}/{t.def} · Fuerza {strengthOf(t)}
              </p>
            </div>
            {t.id === teamId && <div className='bg-white/30 p-1.5 rounded-full'><Check size={14} className='text-white' /></div>}
          </button>
        ))}
      </div>

      {/* Vista previa de objetivos de temporada del club seleccionado */}
      {selected && selectedObjectives.length > 0 && (
        <div className='mt-5 bg-gradient-to-br from-slate-900/90 to-black/80 rounded-3xl p-4 border border-amber-500/30 shadow-xl space-y-2.5'>
          <div className='flex items-center justify-between'>
            <p className='text-[9px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5'>
              <Target size={13} /> Objetivos Exigidos por la Directiva
            </p>
            <span className='text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30'>
              Contrato Inicial
            </span>
          </div>
          <div className='space-y-1.5'>
            {selectedObjectives.map((obj, i) => (
              <div key={i} className='bg-black/40 rounded-xl p-2.5 border border-white/5 flex items-center justify-between gap-2'>
                <div className='min-w-0'>
                  <div className='flex items-center gap-1.5'>
                    <span className='text-[7px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-800 text-amber-300'>
                      {obj.category}
                    </span>
                    <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${
                      obj.priority === 'Crítica' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {obj.priority}
                    </span>
                  </div>
                  <p className='text-[10px] font-black text-white mt-1 leading-snug'>{obj.label}</p>
                </div>
                <span className='text-[9px] font-black text-amber-400 shrink-0 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20'>
                  {obj.targetValue}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setConfirming(true)}
        disabled={!teamId}
        className='mt-6 w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 py-4 rounded-2xl text-[11px] font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2'
      >
        <Briefcase size={15} /> Firmar contrato
      </button>

      <AnimatePresence>
        {confirming && selected && (
          <ConfirmSignModal
            title='Confirmar Proyecto'
            teamName={selected.name}
            detail={`${leagueName} · 2ª División · Contrato de ${CONTRACT_SEASONS} temporadas`}
            contractObjectives={selectedObjectives}
            onCancel={() => setConfirming(false)}
            onConfirm={() => { setConfirming(false); onStart(teamId, manager.trim() || 'Nuevo Técnico'); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ====================== CONFIRMACIÓN DE FIRMA (reutilizable) ====================== */
const ConfirmSignModal = ({ title, teamName, detail, note, contractObjectives = [], onCancel, onConfirm }) => (
  <div className='fixed inset-0 z-[80] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto'>
    <motion.div initial={{ scale: 0.92, y: 16, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ opacity: 0 }}
      className='w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 rounded-[1.75rem] border border-amber-500/40 p-5 text-center shadow-2xl space-y-3 my-auto'>
      <div className='w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto'>
        <FileSignature size={20} />
      </div>
      <h4 className='text-base font-black uppercase italic text-white'>{title}</h4>
      <p className='text-sm font-black uppercase italic text-amber-300'>{teamName}</p>
      <p className='text-[9px] font-bold uppercase tracking-wider text-slate-300'>{detail}</p>
      {note && <p className='text-[9px] font-bold text-slate-400 leading-relaxed'>{note}</p>}

      {/* Resumen de objetivos de contrato estilo FIFA / PES */}
      {contractObjectives?.length > 0 && (
        <div className='bg-black/50 rounded-2xl p-3 border border-white/10 text-left space-y-2'>
          <p className='text-[8px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1'>
            <Target size={11} /> Objetivos Clave de la Temporada:
          </p>
          <div className='space-y-1.5'>
            {contractObjectives.map((obj, i) => (
              <div key={i} className='bg-slate-900/80 rounded-xl p-2 border border-white/5 flex items-center justify-between gap-2'>
                <div className='min-w-0'>
                  <div className='flex items-center gap-1'>
                    <span className='text-[6px] font-black uppercase px-1 py-0.2 rounded bg-slate-800 text-amber-300'>
                      {obj.category}
                    </span>
                    <span className='text-[6px] font-black uppercase px-1 py-0.2 rounded bg-amber-500/20 text-amber-200'>
                      {obj.priority}
                    </span>
                  </div>
                  <p className='text-[9px] font-black text-slate-100 mt-0.5 leading-tight'>{obj.label}</p>
                </div>
                <span className='text-[8px] font-black text-amber-400 shrink-0'>
                  {obj.targetValue}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className='grid grid-cols-2 gap-2 pt-2'>
        <button onClick={onCancel} className='bg-slate-800 text-white py-3 rounded-2xl text-[10px] font-black uppercase italic tracking-widest active:scale-95 transition-all'>
          Cancelar
        </button>
        <button onClick={onConfirm} className='bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 py-3 rounded-2xl text-[10px] font-black uppercase italic tracking-widest active:scale-95 transition-all shadow-lg'>
          Sí, firmar
        </button>
      </div>
    </motion.div>
  </div>
);

/* ================================ CARRERA ================================= */
export const CareerView = ({
  career, team, comp, standings, position, seasonState, nextFixture, rival, isHome,
  divisionFinished, pendingGlobal, worldPending, onBack, onPlayMatch, onSimulateWorld,
  onSetTactic, onSpendPE, onOpenReview, onSimulateMatch, clInfo, onOpenChampions,
  onRenameManager, reviewDone, contractSigned, allLeaguesFinished, championsFinished, onNewSeason,
  onApplyTrainingStats, onApplyDrillResult, onAcceptOffer, onRejectOffer, onSubmitApplication,
  onAdvanceOfficeWeek, onDecideLaterAppOffer, onRejectAppResolution, onDismissAppResolutionModal,
  onDismissSimulationFeedback, allComps, schedule, clComp, onPlayChampionsMatch,
  onSimulateChampionsMatch, onSimulateAllChampions, ui
}) => {
  const { Shield, FormBadges, DieIcon } = ui;
  const [tab, setTab] = useState('main');
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(career.manager || '');
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showDrillModal, setShowDrillModal] = useState(false);
  const [showLegendModal, setShowLegendModal] = useState(false);
  const [showEndSeasonModal, setShowEndSeasonModal] = useState(false);
  const [pendingSigningOffer, setPendingSigningOffer] = useState(null);
  const [submissionModal, setSubmissionModal] = useState(null);
  const [calendarFilter, setCalendarFilter] = useState('TODOS');
  const [toastMessage, setToastMessage] = useState(null);

  const tier = career.tier || 1;
  const caps = tierCaps(tier);
  const cls = classOf(career.compId);
  const band = repBand(career.reputation);
  const base = useMemo(() => ({
    att: Math.max(career.baseDist?.att || 1, team?.att || 1),
    opp: Math.max(career.baseDist?.opp || 1, team?.opp || 1),
    def: Math.max(career.baseDist?.def || 1, team?.def || 1)
  }), [career.baseDist, team?.att, team?.opp, team?.def]);
  const currentMatchday = career.div === 2 ? (comp?.matchday2 || 0) : (comp?.matchday || 0);
  const activeInjury = career.activeInjury && career.activeInjury.matchday === currentMatchday ? career.activeInjury : null;
  const effectiveBase = activeInjury ? { ...base, [activeInjury.attr]: Math.max(1, (base[activeInjury.attr] || 1) - 1) } : base;
  const totalTeamStrength = (base?.att || 0) + (base?.opp || 0) + (base?.def || 0);

  const effectiveTactic = useMemo(() => {
    const t = career.tactic || base;
    if (!activeInjury) return t;
    return {
      ...t,
      [activeInjury.attr]: Math.max(1, (t[activeInjury.attr] || base[activeInjury.attr] || 1) - 1)
    };
  }, [career.tactic, base, activeInjury]);

  const maxLeagueStrength = useMemo(() => {
    const allSquads = standings?.length ? standings : (comp?.teams || []);
    if (!allSquads.length) return 14;
    return Math.max(...allSquads.map(t => (t.att || 0) + (t.opp || 0) + (t.def || 0)), 14);
  }, [standings, comp]);

  const options = useMemo(() => tacticalOptions(base, tier), [base, tier]);
  const expected = useMemo(() => expectedPosition(standings, career.teamId), [standings, career.teamId]);
  const objective = objectiveFor(tier, position || expected);
  const perf = readPerformance(position || expected, expected);
  const log = career.seasonLog || [];
  const wins = log.filter(l => l.result === 'W').length;
  const maxed = isSquadMaxed(team, tier);
  // La Champions del modo carrera ES la Champions global ('C1') sincronizada
  const cl = clInfo;
  const isClQualified = useMemo(() => {
    if (clInfo || career.clQualified) return true;
    if (clComp?.teams?.length > 0) {
      return clComp.teams.some((t: any) => t.id === clComp.careerTeamId || t.name === (clComp.careerTeamName || team?.name));
    }
    return false;
  }, [clInfo, career.clQualified, clComp, team]);

  const clPhaseText = clComp?.phase ? (clComp.phase === 'Final' ? 'FINAL' : clComp.phase !== 'Terminado' ? 'EN VIVO' : null) : null;
  const season = seasonState?.season || 1;
  const seasonsLeft = Math.max(0, (career.contractStart || season) + (career.contractSeasons || CONTRACT_SEASONS) - season);
  const hasTrainedThisMatchday = career.trainedMatchday === currentMatchday;

  const totalRoundsCount = Math.max(0, ((standings?.length || 20) - 1) * 2);

  // Cálculo del estado del calendario de temporada estilo FIFA/PES (adaptado dinámicamente a la liga: 34, 38 o 42 jornadas)
  const currentWeekInfo = useMemo(() => {
    return calculateCurrentSeasonWeek(currentMatchday, career.completedOfficeWeeks || [], totalRoundsCount);
  }, [currentMatchday, career.completedOfficeWeeks, totalRoundsCount]);

  // Generador de rumores dinámicos de mercado
  const dynamicRumors = useMemo(() => generateRumors(allComps || {}, career), [allComps, career]);

  // Lista de vacantes disponibles para postulación activa (hasta 10 clubes afines a tu jerarquía)
  const marketVacancies = useMemo(() => getMarketVacancies(allComps || {}, career, position || expected), [allComps, career, position, expected]);

  const matchCounts = useMemo(() => {
    const l = career.seasonLog || [];
    const w = l.filter((x: any) => x.result === 'W').length;
    const d = l.filter((x: any) => x.result === 'D').length;
    const loss = l.filter((x: any) => x.result === 'L').length;
    const totalPlayed = l.length;
    const pending = Math.max(0, totalRoundsCount - totalPlayed);
    const clMatches = l.filter((x: any) => x.isChampions).length;
    const leagueMatches = l.filter((x: any) => !x.isChampions).length;
    return { wins: w, draws: d, losses: loss, pending, clMatches, leagueMatches };
  }, [career.seasonLog, totalRoundsCount]);

  // Último partido disputado por el mánager (de Liga o de Champions)
  const lastPlayedMatchOverall = useMemo(() => {
    const log = career.seasonLog || [];
    if (log.length === 0) return null;
    const entry = log[0];
    const allTeams = (career.div === 2 ? comp?.teams2 : comp?.teams) || [];
    const clTeams = clComp?.teams || [];

    let rivalTeam: any = null;
    let aggregateInfo: any = null;

    if (entry.isChampions) {
      rivalTeam = clTeams.find((t: any) => t.name === entry.rival || t.name === entry.rival?.name || t.id === entry.rival?.id) || {
        name: entry.rival?.name || entry.rival || 'Rival Europeo',
        color1: '#1e3a8a',
        color2: '#3b82f6'
      };

      // Si fue partido eliminatorio de ida y vuelta en Champions
      const careerClTeam = clTeams.find((t: any) => t.id === clComp?.careerTeamId) ||
        clTeams.find((t: any) => t.name === (clComp?.careerTeamName || team?.name)) || null;

      const phaseKey = ['Octavos', 'Cuartos', 'Semis'].find(p => (entry.phase === p || (entry.competitionLabel || '').includes(p)));
      if (phaseKey && clComp?.bracket?.[phaseKey] && careerClTeam) {
        const bMatches = Array.isArray(clComp.bracket[phaseKey]) ? clComp.bracket[phaseKey] : [clComp.bracket[phaseKey]];
        const bMatch = bMatches.find((bm: any) => bm && (bm.hId === careerClTeam.id || bm.aId === careerClTeam.id));
        if (bMatch && bMatch.sh !== null) {
          const teamIsHId = bMatch.hId === careerClTeam.id;
          const hasVuelta = bMatch.sh2 !== null && bMatch.sh2 !== undefined;
          const totH = (bMatch.sh || 0) + (bMatch.sh2 || 0);
          const totA = (bMatch.sa || 0) + (bMatch.sa2 || 0);
          const myTot = teamIsHId ? totH : totA;
          const rivalTot = teamIsHId ? totA : totH;

          let qualified = null;
          if (hasVuelta) {
            if (totH > totA) qualified = teamIsHId;
            else if (totA > totH) qualified = !teamIsHId;
            else if (bMatch.penH !== null && bMatch.penH !== undefined) {
              qualified = bMatch.penH > bMatch.penA ? teamIsHId : !teamIsHId;
            }
          }

          aggregateInfo = {
            phaseName: phaseKey,
            leg1Score: `${bMatch.sh} - ${bMatch.sa}`,
            leg2Score: hasVuelta ? `${bMatch.sh2} - ${bMatch.sa2}` : null,
            globalScoreText: hasVuelta ? `${myTot} - ${rivalTot}` : null,
            penaltiesText: (bMatch.penH !== null && bMatch.penH !== undefined) ? `(${bMatch.penH}-${bMatch.penA} pen.)` : null,
            qualified
          };
        }
      }
    } else {
      rivalTeam = allTeams.find((t: any) => t.name === entry.rival || t.name === entry.rival?.name || t.id === entry.rival?.id) || {
        name: entry.rival?.name || entry.rival || `Rival J${entry.matchday}`,
        color1: '#334155',
        color2: '#1e293b'
      };
    }

    const isHome = entry.isHome !== undefined ? entry.isHome : true;

    return {
      ...entry,
      competitionLabel: entry.isChampions
        ? `UEFA Champions League · ${clPhaseLabel(entry.phase || 'groups')}`
        : `${comp?.name || 'Liga'} · Jornada ${entry.matchday}`,
      rivalTeam,
      isHome,
      scoreH: isHome ? entry.gf : entry.ga,
      scoreA: isHome ? entry.ga : entry.gf,
      homeTeam: isHome ? team : rivalTeam,
      awayTeam: isHome ? rivalTeam : team,
      aggregateInfo
    };
  }, [career.seasonLog, comp, clComp, team, career.div]);

  // Calendario Global de la Temporada (Liga Nacional + Champions League + Oficinas / FIFA)
  const calendarMonths = useMemo(() => {
    const allTeams = (career.div === 2 ? comp?.teams2 : comp?.teams) || [];
    const clTeams = clComp?.teams || [];
    const logMap = new Map();
    const clLogList: any[] = [];
    (career.seasonLog || []).forEach((l: any) => {
      if (l.isChampions) {
        clLogList.push(l);
      } else {
        logMap.set(l.matchday, l);
      }
    });

    const teamFixtures: any[] = [];
    if (Array.isArray(schedule) && schedule.length > 0) {
      schedule.forEach((round: any[], rIdx: number) => {
        const matchday = rIdx + 1;
        const fix = round.find((m: any) => m.homeId === career.teamId || m.awayId === career.teamId);
        if (fix) {
          const isHome = fix.homeId === career.teamId;
          const rivalId = isHome ? fix.awayId : fix.homeId;
          const rival = allTeams.find((t: any) => t.id === rivalId) || { name: `Rival J${matchday}`, color1: '#1e293b', color2: '#334155' };
          const logEntry = logMap.get(matchday);
          teamFixtures.push({
            matchday,
            isHome,
            rival,
            isChampions: false,
            played: !!logEntry,
            result: logEntry?.result || null,
            gf: logEntry?.gf,
            ga: logEntry?.ga,
            scoreText: logEntry ? `${logEntry.gf} - ${logEntry.ga}` : null,
            repEarned: logEntry?.rep,
            peEarned: logEntry?.pe
          });
        }
      });
    } else {
      const rivals = allTeams.filter((t: any) => t.id !== career.teamId);
      rivals.forEach((r: any, idx: number) => {
        const matchday = idx + 1;
        const isHome = matchday % 2 === 1;
        const logEntry = logMap.get(matchday);
        teamFixtures.push({
          matchday,
          isHome,
          rival: r,
          isChampions: false,
          played: !!logEntry,
          result: logEntry?.result || null,
          gf: logEntry?.gf,
          ga: logEntry?.ga,
          scoreText: logEntry ? `${logEntry.gf} - ${logEntry.ga}` : null,
          repEarned: logEntry?.rep,
          peEarned: logEntry?.pe
        });
      });
    }

    // Identificar el equipo del modo carrera en Champions (C1)
    const careerClTeam = clTeams.find((t: any) => t.id === clComp?.careerTeamId) ||
      clTeams.find((t: any) => t.name === (clComp?.careerTeamName || team?.name)) || null;
    const isUserInCl = isClQualified || !!careerClTeam;

    // Buscar historial cronológico de partidos de Champions jugados por el usuario
    const userClHistoryMatches: any[] = [];
    if (Array.isArray(clComp?.history) && careerClTeam) {
      const chronologicalHistory = [...clComp.history].reverse();
      chronologicalHistory.forEach((h: any) => {
        const m = (h.results || []).find((r: any) => r.hId === careerClTeam.id || r.aId === careerClTeam.id);
        if (m) {
          const ht = clTeams.find((t: any) => t.id === m.hId);
          const at = clTeams.find((t: any) => t.id === m.aId);
          const isHome = m.hId === careerClTeam.id;
          const myScore = isHome ? m.sh : m.sa;
          const rivalScore = isHome ? m.sa : m.sh;
          const rivalTeam = isHome ? at : ht;
          const res = myScore > rivalScore ? 'W' : myScore === rivalScore ? 'D' : 'L';
          userClHistoryMatches.push({
            dayLabel: h.day,
            isHome,
            myScore,
            rivalScore,
            rivalTeam,
            result: res,
            penH: m.penH,
            penA: m.penA
          });
        }
      });
    }

    // Determinar si el usuario fue eliminado y en qué fase
    let clEliminatedPhase: string | null = null;
    if (clComp && careerClTeam) {
      if (clComp.phase !== 'groups') {
        const userGroup = (clComp.groups || []).find((g: any) => g.teamIds?.includes(careerClTeam.id));
        if (userGroup) {
          const groupTeams = clTeams.filter((t: any) => userGroup.teamIds?.includes(t.id))
            .sort((a: any, b: any) => (b.pts || 0) - (a.pts || 0) || ((b.gf || 0) - (b.ga || 0)) - ((a.gf || 0) - (a.ga || 0)) || (b.gf || 0) - (a.gf || 0));
          const top2 = groupTeams.slice(0, 2).map((t: any) => t.id);
          if (!top2.includes(careerClTeam.id)) {
            clEliminatedPhase = 'Fase de Grupos';
          }
        }
        if (!clEliminatedPhase && clComp.bracket) {
          if (clComp.phase === 'Cuartos' || clComp.phase === 'Semis' || clComp.phase === 'Final' || clComp.phase === 'Terminado') {
            const inCuartos = (clComp.bracket.Cuartos || []).some((m: any) => m && (m.hId === careerClTeam.id || m.aId === careerClTeam.id));
            if (!inCuartos) clEliminatedPhase = 'Octavos de Final';
          }
          if (!clEliminatedPhase && (clComp.phase === 'Semis' || clComp.phase === 'Final' || clComp.phase === 'Terminado')) {
            const inSemis = (clComp.bracket.Semis || []).some((m: any) => m && (m.hId === careerClTeam.id || m.aId === careerClTeam.id));
            if (!inSemis) clEliminatedPhase = 'Cuartos de Final';
          }
          if (!clEliminatedPhase && (clComp.phase === 'Final' || clComp.phase === 'Terminado')) {
            const inFinal = (clComp.bracket.Final || []).some((m: any) => m && (m.hId === careerClTeam.id || m.aId === careerClTeam.id));
            if (!inFinal) clEliminatedPhase = 'Semifinales';
          }
        }
      }
    }

    const leagueOfficeWeeks = getSpecialOfficeWeeks(totalRoundsCount);
    const scheduledClWeeks = getChampionsScheduledWeeks(totalRoundsCount);
    const totalSeasonWeeks = totalRoundsCount + leagueOfficeWeeks.length;

    const monthNames = [
      'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO'
    ];

    const allWeeksList: any[] = [];
    let matchdayCounter = 0;

    for (let w = 1; w <= totalSeasonWeeks; w++) {
      const office = leagueOfficeWeeks.find(o => o.week === w);
      const clScheduled = scheduledClWeeks.find(c => c.defaultWeek === w);

      if (office) {
        allWeeksList.push({
          weekNum: w,
          type: office.isMarket ? 'market' : 'international',
          title: office.title.toUpperCase(),
          isSpecial: true,
          desc: office.desc
        });
      } else {
        matchdayCounter++;
        const currentMd = matchdayCounter;
        const fixture = teamFixtures.find(f => f.matchday === currentMd) || {
          matchday: currentMd,
          isHome: currentMd % 2 === 1,
          rival: { name: `Rival J${currentMd}`, color1: '#334155', color2: '#1e293b' },
          played: false,
          result: null
        };

        allWeeksList.push({
          weekNum: w,
          type: 'match',
          isSpecial: false,
          isChampions: false,
          ...fixture
        });
      }

      // Si coincide con semana continental de Champions League
      if (clScheduled && isUserInCl) {
        const roundIdx = clScheduled.clRoundIdx;
        let isPlayed = false;
        let isEliminated = false;
        let isProbable = false;
        let result = null;
        let scoreText = null;
        let clRival: any = null;
        let isHome = roundIdx % 2 === 0;

        if (roundIdx < 6) {
          // Fase de grupos (jornadas 0 a 5)
          const playedMatch = userClHistoryMatches[roundIdx] || clLogList[roundIdx];
          if (playedMatch) {
            isPlayed = true;
            result = playedMatch.result;
            scoreText = `${playedMatch.myScore ?? playedMatch.gf} - ${playedMatch.rivalScore ?? playedMatch.ga}`;
            clRival = playedMatch.rivalTeam || (clTeams.find((t: any) => t.name === playedMatch.rival)) || { name: 'Rival Champions', color1: '#1e3a8a', color2: '#3b82f6' };
          } else {
            // No jugado todavía en grupos
            const userGroup = (clComp?.groups || []).find((g: any) => g.teamIds?.includes(careerClTeam?.id));
            if (userGroup) {
              const rivalsInGroup = clTeams.filter((t: any) => userGroup.teamIds?.includes(t.id) && t.id !== careerClTeam?.id);
              if (rivalsInGroup.length > 0) {
                clRival = rivalsInGroup[roundIdx % rivalsInGroup.length];
              }
            }
            if (!clRival) {
              clRival = { name: 'Rival de Grupo', color1: '#1e3a8a', color2: '#3b82f6' };
            }
          }
        } else {
          // Rondas eliminatorias (Octavos: 6-7, Cuartos: 8-9, Semis: 10-11, Final: 12)
          if (clEliminatedPhase) {
            const elimAtGroup = clEliminatedPhase === 'Fase de Grupos';
            const elimAtOctavos = clEliminatedPhase === 'Octavos de Final';
            const elimAtCuartos = clEliminatedPhase === 'Cuartos de Final';
            const elimAtSemis = clEliminatedPhase === 'Semifinales';

            if (elimAtGroup || (elimAtOctavos && roundIdx >= 8) || (elimAtCuartos && roundIdx >= 10) || (elimAtSemis && roundIdx >= 12)) {
              isEliminated = true;
            }
          }

          if (!isEliminated) {
            const playedMatch = userClHistoryMatches[roundIdx] || clLogList[roundIdx];
            if (playedMatch) {
              isPlayed = true;
              result = playedMatch.result;
              scoreText = `${playedMatch.myScore ?? playedMatch.gf} - ${playedMatch.rivalScore ?? playedMatch.ga}`;
              clRival = playedMatch.rivalTeam || (clTeams.find((t: any) => t.name === playedMatch.rival)) || { name: 'Rival Eliminatoria', color1: '#1e3a8a', color2: '#3b82f6' };
            } else {
              let isCurrentPhase = false;
              if (roundIdx === 6 || roundIdx === 7) isCurrentPhase = clComp?.phase === 'Octavos';
              else if (roundIdx === 8 || roundIdx === 9) isCurrentPhase = clComp?.phase === 'Cuartos';
              else if (roundIdx === 10 || roundIdx === 11) isCurrentPhase = clComp?.phase === 'Semis';
              else if (roundIdx === 12) isCurrentPhase = clComp?.phase === 'Final';

              if (isCurrentPhase && clComp?.bracket) {
                const bracketPhase = clComp.bracket[clComp.phase];
                const matches = Array.isArray(bracketPhase) ? bracketPhase : [bracketPhase].filter(Boolean);
                const matchInBracket = matches.find((m: any) => m && (m.hId === careerClTeam?.id || m.aId === careerClTeam?.id));
                if (matchInBracket) {
                  const isVuelta = (roundIdx === 7 || roundIdx === 9 || roundIdx === 11);
                  const isH = isVuelta ? matchInBracket.aId === careerClTeam?.id : matchInBracket.hId === careerClTeam?.id;
                  const rId = isH ? matchInBracket.aId : matchInBracket.hId;
                  isHome = isH;
                  clRival = clTeams.find((t: any) => t.id === rId) || { name: 'Rival Europeo', color1: '#1e3a8a', color2: '#3b82f6' };
                }
              }

              if (!clRival) {
                isProbable = true;
                clRival = { name: 'Por Determinar (según cuadro)', color1: '#1e3a8a', color2: '#3b82f6' };
              }
            }
          }
        }

        allWeeksList.push({
          weekNum: w,
          type: 'match',
          isSpecial: false,
          isChampions: true,
          clPhaseLabel: clScheduled.label,
          shortLabel: clScheduled.shortLabel,
          matchday: `UCL-${roundIdx + 1}`,
          isHome,
          rival: clRival || { name: 'Rival Champions', color1: '#1e3a8a', color2: '#3b82f6' },
          played: isPlayed,
          isEliminated,
          isProbable,
          eliminatedPhase: clEliminatedPhase,
          result,
          scoreText,
          repEarned: isPlayed ? (result === 'W' ? 0.8 : result === 'D' ? 0.3 : -0.1) : null,
          peEarned: isPlayed ? (result === 'W' ? 3 : result === 'D' ? 2 : 0) : null
        });
      }
    }

    const monthsResult: any[] = [];
    let currentWeekIdx = 0;
    for (let m = 0; m < monthNames.length; m++) {
      const isLast = m === monthNames.length - 1;
      const weeksForThisMonth = isLast ? Math.max(1, allWeeksList.length - currentWeekIdx) : Math.ceil(allWeeksList.length / monthNames.length);
      const monthWeeks = allWeeksList.slice(currentWeekIdx, currentWeekIdx + weeksForThisMonth);
      currentWeekIdx += weeksForThisMonth;
      if (monthWeeks.length > 0) {
        monthsResult.push({
          monthName: monthNames[m],
          items: monthWeeks
        });
      }
    }

    return monthsResult;
  }, [schedule, comp, clComp, career.div, career.teamId, career.seasonLog, totalRoundsCount, isClQualified, team]);

  const handleApplyToJob = (v: any) => {
    if (onSubmitApplication) {
      onSubmitApplication(v);
    }
    setSubmissionModal({
      teamName: v.teamName,
      compName: v.compName,
      div: v.div,
      tier: v.tier,
      color1: v.color1,
      color2: v.color2,
      isFlag: v.isFlag,
      standingStatus: v.standingStatus,
      requiredObjective: v.requiredObjective
    });
  };

  // Si la liga finaliza y no se ha firmado, ofrecer el aviso modal
  useEffect(() => {
    if (divisionFinished && !reviewDone && !contractSigned) {
      setShowEndSeasonModal(true);
    }
  }, [divisionFinished, reviewDone, contractSigned]);

  const draws = useMemo(() => log.filter(l => l.result === 'D').length, [log]);

  const objectives = useMemo(() => seasonObjectives({
    tier,
    div: career.div,
    position,
    expected,
    wins,
    draws,
    played: log.length,
    totalRounds: Math.max(0, ((standings?.length || 20) - 1) * 2),
    reputation: career.reputation,
    pe: career.pe,
    total: standings?.length,
    clQualified: !!cl,
    clPhase: cl?.phase,
    clChampion: !!cl?.champion,
    clEliminated: !!cl?.eliminated
  }), [tier, career.div, position, expected, wins, draws, log.length, standings?.length, career.reputation, career.pe, cl]);

  const coreObjectives = objectives.filter(o => !o.extra);
  const coreMet = coreObjectives.filter(o => o.done || o.status === 'completed').length;

  const boardConfidence = useMemo(() => {
    return calculateBoardConfidence({
      objectives,
      performanceScore: perf.score,
      badStreak: career.badStreak || 0,
      reputation: career.reputation,
      tier
    });
  }, [objectives, perf.score, career.badStreak, career.reputation, tier]);

  const news = useMemo(
    () => buildNews({
      managerName: career.manager, teamName: team?.name, rivalName: rival?.name,
      position, expected, reputation: career.reputation, log: career.seasonLog, tier,
      seasonsLeft, maxed, clQualified: !!cl, clPhaseLabel: cl?.phaseLabel,
      division: career.div, standingsSize: standings?.length
    }),
    [career.manager, team?.name, rival?.name, position, expected, career.reputation, career.seasonLog, tier, seasonsLeft, maxed, cl, career.div, standings?.length]
  );

  const spells = useMemo(() => careerSpells(career.seasonHistory || []), [career.seasonHistory]);

  // Diagnóstico de candidaturas rechazadas
  const badStreakCount = career.badStreak || 0;
  const hasTitles = (career.trophies?.leagues || 0) > 0 || (career.trophies?.promotions || 0) > 0;
  const rejectionDiagnostic = useMemo(() => {
    return getRejectionReason({
      requiredRep: 50,
      coachRep: career.reputation,
      badStreak: badStreakCount,
      hasRecentTitles: hasTitles,
      performanceScore: perf.score
    });
  }, [career.reputation, badStreakCount, hasTitles, perf.score]);

  // Calendario de partidos jugado vs pendiente
  const totalRounds = Math.max(0, ((standings?.length || 20) - 1) * 2);
  const compHistory = (career.div === 2 ? comp?.history2 : comp?.history) || [];

  return (
    <div className='flex-grow flex flex-col px-4 pb-8'>
      <header className='flex items-center gap-3 py-5'>
        <button onClick={onBack} className='p-2 bg-slate-900/30 backdrop-blur-md rounded-xl active:scale-95 transition-all border border-white/10'><ChevronLeft /></button>
        <div className='flex-grow min-w-0'>
          <h1 className='text-2xl font-black uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 drop-shadow-md'>Modo Carrera</h1>
          {editingName ? (
            <div className='flex items-center gap-2 mt-1'>
              <input
                autoFocus
                value={nameDraft}
                maxLength={24}
                onChange={e => setNameDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    onRenameManager(nameDraft);
                    setEditingName(false);
                  }
                }}
                className='bg-slate-900 border border-white/20 rounded-lg px-2 py-0.5 text-[10px] font-bold text-white outline-none focus:border-amber-400'
              />
              <button
                onClick={() => { onRenameManager(nameDraft); setEditingName(false); }}
                className='p-1.5 rounded-lg bg-amber-500 text-slate-950 active:scale-95 transition-all'
              >
                <Check size={13} />
              </button>
              <button
                onClick={() => { setNameDraft(career.manager || ''); setEditingName(false); }}
                className='p-1.5 rounded-lg bg-slate-800 text-slate-300 active:scale-95 transition-all'
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setNameDraft(career.manager || ''); setEditingName(true); }}
              className='flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-300 active:scale-95 transition-all'
            >
              {career.manager} · {band.label}
              <Pencil size={10} className='text-amber-400' />
            </button>
          )}
        </div>

        {/* Acceso directo a Historial de Leyenda en cabecera */}
        <button
          onClick={() => setShowLegendModal(true)}
          className='w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/30 to-yellow-400/20 border border-amber-500/40 flex items-center justify-center text-yellow-400 shrink-0 shadow-lg active:scale-95 transition-all'
          title='Ver Perfil e Historial de Leyenda'
        >
          <Trophy size={20} />
        </button>
      </header>

      {/* TICKER DINÁMICO DE RUMORES DE MERCADO (1 SOLA LÍNEA HORIZONTAL) */}
      <RumorsTicker rumors={dynamicRumors} />

      {/* TARJETA PRINCIPAL DEL CLUB */}
      <Panel className='p-5 mb-4'>
        <div className='flex items-center gap-4'>
          <Shield color1={team?.color1} color2={team?.color2} initial={team?.name} size='lg' isFlag={team?.isFlag} />
          <div className='flex-grow'>
            <div className='flex items-center justify-between gap-2 flex-wrap'>
              <p className='text-[9px] font-black uppercase tracking-widest text-amber-400'>{comp?.name} · {career.div === 2 ? '2ª' : '1ª'} División · Clase {cls}</p>
              <div className='flex items-center gap-1.5 flex-wrap'>
                {career.medicalImmunityWeeks > 0 && (
                  <span className='px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[8px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm'>
                    <ShieldCheck size={11} className='text-emerald-400' />
                    Inmunidad Médica ({career.medicalImmunityWeeks} sem.)
                  </span>
                )}
                {activeInjury && (
                  <span className='px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[8px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm animate-pulse'>
                    <AlertTriangle size={11} className='text-red-400' />
                    Baja temporal: -1 {activeInjury.label}
                  </span>
                )}
              </div>
            </div>
            <h2 className='text-xl font-black uppercase italic text-white tracking-tight drop-shadow-md mt-0.5'>{team?.name}</h2>
            <p className='text-[9px] font-bold uppercase tracking-wider text-slate-300 mt-1'>
              Tier {tier} — {TIERS[tier]?.name} · {team?.att}/{team?.opp}/{team?.def}
              {activeInjury && (
                <span className='text-red-400 font-bold ml-1.5'>
                  (Ajuste para hoy: {effectiveBase.att}/{effectiveBase.opp}/{effectiveBase.def})
                </span>
              )}
            </p>
          </div>
        </div>
        <div className='flex gap-2 mt-4'>
          <Stat label='Reputación' value={career.reputation} hint={band.label} accent='amber' />
          <Stat label='PE' value={maxed ? 'Tope' : career.pe} hint={maxed ? 'Plantilla al máximo' : 'Del club'} />
          <Stat label='Posición' value={position ? `${position}º` : '—'} hint={`Esperado ${expected}º`} accent='blue' />
        </div>
        <div className='mt-3 bg-black/30 rounded-2xl px-4 py-3 border border-white/5 flex items-center justify-between'>
          <div>
            <p className='text-[8px] font-black uppercase tracking-widest text-slate-400'>
              Temporada {season} · Contrato: {seasonsLeft === 0 ? 'último año' : `${seasonsLeft} temporada${seasonsLeft === 1 ? '' : 's'}`}
            </p>
            <p className='text-[10px] font-bold text-slate-200 mt-1'>{perf.label} — {objective?.note}</p>
          </div>
          {divisionFinished && (
            <button
              onClick={() => setShowEndSeasonModal(true)}
              className='px-2.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-[9px] font-black uppercase italic tracking-wider shrink-0 active:scale-95 transition-all shadow-md'
            >
              Liga Finalizada
            </button>
          )}
        </div>
      </Panel>

      {/* BARRA DINÁMICA DE PROGRESO A LEYENDA (REPUTACIÓN EN TIEMPO REAL) */}
      <div
        onClick={() => setShowLegendModal(true)}
        className='bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 hover:to-amber-900/40 border border-amber-500/30 hover:border-amber-500/60 rounded-2xl p-3.5 mb-4 shadow-lg transition-all cursor-pointer group select-none'
        title='Toca para abrir tu perfil y vitrina de trofeos de Leyenda'
      >
        <div className='flex items-center justify-between gap-2 mb-2'>
          <div className='flex items-center gap-2.5'>
            <div className='w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform'>
              <Trophy size={16} className='text-yellow-400' />
            </div>
            <div>
              <p className='text-[8px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1'>
                <Sparkles size={10} /> Progreso de Leyenda (En Vivo)
              </p>
              <p className='text-[11px] font-black uppercase italic text-white leading-none mt-0.5'>
                {band.label} <span className='text-slate-400 text-[9px] font-bold'>· {career.reputation}/100 PTS</span>
              </p>
            </div>
          </div>
          <span className='text-xs font-black text-amber-300 tabular-nums px-2 py-0.5 rounded-lg bg-black/40 border border-white/5'>
            {career.reputation}%
          </span>
        </div>

        <div className='relative h-2.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner'>
          <div
            className='h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
            style={{ width: `${Math.min(100, Math.max(4, career.reputation))}%` }}
          />
        </div>

        <div className='flex items-center justify-between text-[7.5px] font-black uppercase text-slate-400 mt-1.5 px-0.5'>
          <span>Novato (0)</span>
          <span>Promesa (20)</span>
          <span>Consolidado (40)</span>
          <span>Reconocido (60)</span>
          <span className='text-yellow-400 font-bold'>Élite / Leyenda (100)</span>
        </div>
      </div>

      {/* AVISO DE FIN DE ETAPA / DESPIDO */}
      {career.fired && (
        <div className='bg-red-950/80 border border-red-500/50 rounded-2xl p-4 mb-4 shadow-xl'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/40'>
              <AlertTriangle size={20} />
            </div>
            <div className='flex-grow min-w-0'>
              <p className='text-[9px] font-black uppercase tracking-wider text-red-400'>Etapa Finalizada</p>
              <p className='text-xs font-bold text-white'>Has sido despedido de {team?.name}.</p>
              <p className='text-[9px] font-bold text-slate-300 mt-0.5'>
                Puedes revisar la tabla final, tu vitrina histórica o abrir tus ofertas para firmar por tu próximo proyecto.
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2 mt-3 pt-3 border-t border-white/10'>
            <button
              onClick={onOpenReview}
              className='flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 py-2.5 rounded-xl text-[9px] font-black uppercase italic tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md'
            >
              <FileSignature size={13} /> Ver Balance y Ofertas
            </button>
            <button
              onClick={() => setTab('legend')}
              className='px-3 bg-white/10 hover:bg-white/15 text-white py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center gap-1'
            >
              <Award size={13} /> Mi Historial
            </button>
          </div>
        </div>
      )}

      {/* BARRA DE PESTAÑAS (SCROLL HORIZONTAL SIN CORTES) */}
      <Panel className='p-1.5 mb-4 overflow-x-auto no-scrollbar flex items-center gap-1 shrink-0'>
        <TabButton active={tab === 'main'} onClick={() => setTab('main')} icon={<Swords size={15} />} label='Partido' />
        <TabButton active={tab === 'objectives'} onClick={() => setTab('objectives')} icon={<Target size={15} />} label='Objetivos' badge={`${coreMet}/${coreObjectives.length}`} />
        <TabButton active={tab === 'tactic'} onClick={() => setTab('tactic')} icon={<ShieldCheck size={15} />} label='Táctica' />
        <TabButton active={tab === 'squad'} onClick={() => setTab('squad')} icon={<Dumbbell size={15} />} label='Entreno' />
        {isClQualified && (
          <TabButton
            active={tab === 'cl'}
            onClick={() => setTab('cl')}
            icon={<Trophy size={15} className='text-yellow-400' />}
            label='Champions'
            badge={clPhaseText}
          />
        )}
        <TabButton active={tab === 'table'} onClick={() => setTab('table')} icon={<BarChart3 size={15} />} label='Tabla' />
        <TabButton active={tab === 'calendar'} onClick={() => setTab('calendar')} icon={<Calendar size={15} />} label='Calendario' />
        <TabButton active={tab === 'jobs'} onClick={() => setTab('jobs')} icon={<Briefcase size={15} />} label='Empleo' badge={marketVacancies?.length} />
        <TabButton active={tab === 'market'} onClick={() => setTab('market')} icon={<Sparkles size={15} />} label='Buzón' badge={(career.offers || []).filter(o => o.weeksRemaining === undefined || o.weeksRemaining === null || o.weeksRemaining > 0).length || null} />
        <TabButton active={tab === 'legend'} onClick={() => setTab('legend')} icon={<Award size={15} />} label='Leyenda' />
      </Panel>

      {/* TOAST DE NOTIFICACIÓN DE POSTULACIÓN */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className='fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] bg-gradient-to-r from-sky-900 to-indigo-950 border border-sky-400/50 shadow-2xl rounded-2xl p-4 flex items-center gap-3 backdrop-blur-xl'
          >
            <div className='w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30'>
              <Briefcase size={18} />
            </div>
            <p className='text-xs font-bold text-sky-100 flex-grow leading-snug'>
              {toastMessage}
            </p>
            <button
              onClick={() => setToastMessage(null)}
              className='p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 active:scale-95 transition-all'
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode='wait'>
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className='flex-grow space-y-4'>
          {tab === 'main' && (
            <>
              {/* FEEDBACK INLINE DE SIMULACIÓN / RESULTADO */}
              {career.lastSimulationFeedback && (
                <SimulationFeedbackBanner
                  feedback={career.lastSimulationFeedback}
                  onDismiss={onDismissSimulationFeedback}
                />
              )}

              {/* CARD DE ÚLTIMO PARTIDO DISPUTADO CON SU RESULTADO */}
              {lastPlayedMatchOverall && (
                <div className='bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90 rounded-3xl p-4 border border-white/10 shadow-lg space-y-2.5'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-1.5'>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                        lastPlayedMatchOverall.isChampions
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {lastPlayedMatchOverall.isChampions ? '⭐ Champions League' : '🏆 Liga Nacional'}
                      </span>
                      <span className='text-[8px] font-bold text-slate-400'>
                        {lastPlayedMatchOverall.competitionLabel}
                      </span>
                    </div>
                    <span className={`text-[8px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      lastPlayedMatchOverall.result === 'W'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : lastPlayedMatchOverall.result === 'D'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}>
                      {lastPlayedMatchOverall.result === 'W' ? 'Victoria 🏆' : lastPlayedMatchOverall.result === 'D' ? 'Empate 🤝' : 'Derrota ❌'}
                    </span>
                  </div>

                  <div className='bg-black/40 rounded-2xl p-3 border border-white/5 flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2 min-w-0 flex-1'>
                      <Shield
                        color1={lastPlayedMatchOverall.homeTeam?.color1}
                        color2={lastPlayedMatchOverall.homeTeam?.color2}
                        initial={lastPlayedMatchOverall.homeTeam?.name}
                        size='sm'
                        isFlag={lastPlayedMatchOverall.homeTeam?.isFlag}
                      />
                      <span className={`text-[10px] font-black uppercase truncate ${lastPlayedMatchOverall.homeTeam?.id === team?.id || lastPlayedMatchOverall.isHome ? 'text-amber-300' : 'text-white'}`}>
                        {lastPlayedMatchOverall.homeTeam?.name}
                      </span>
                    </div>

                    <div className='text-center shrink-0 px-3.5 py-1 bg-black/60 rounded-xl border border-white/10'>
                      <span className='text-sm font-black italic text-white tabular-nums tracking-wider'>
                        {lastPlayedMatchOverall.scoreH} - {lastPlayedMatchOverall.scoreA}
                      </span>
                    </div>

                    <div className='flex items-center justify-end gap-2 min-w-0 flex-1 text-right'>
                      <span className={`text-[10px] font-black uppercase truncate ${lastPlayedMatchOverall.awayTeam?.id === team?.id || !lastPlayedMatchOverall.isHome ? 'text-amber-300' : 'text-white'}`}>
                        {lastPlayedMatchOverall.awayTeam?.name}
                      </span>
                      <Shield
                        color1={lastPlayedMatchOverall.awayTeam?.color1}
                        color2={lastPlayedMatchOverall.awayTeam?.color2}
                        initial={lastPlayedMatchOverall.awayTeam?.name}
                        size='sm'
                        isFlag={lastPlayedMatchOverall.awayTeam?.isFlag}
                      />
                    </div>
                  </div>

                  {/* Resumen Global de Eliminatoria en Champions */}
                  {lastPlayedMatchOverall.aggregateInfo && (
                    <div className='bg-blue-950/70 rounded-2xl p-2.5 border border-blue-400/30 flex flex-wrap items-center justify-between gap-2 text-[8px] font-bold text-slate-200'>
                      <div className='flex items-center gap-2'>
                        <span className='text-blue-300 font-black uppercase tracking-wider'>Global Eliminatoria:</span>
                        <span className='bg-black/60 px-2 py-0.5 rounded-lg font-black text-white text-[9px] border border-white/10'>
                          Ida: {lastPlayedMatchOverall.aggregateInfo.leg1Score}
                        </span>
                        {lastPlayedMatchOverall.aggregateInfo.leg2Score && (
                          <span className='bg-black/60 px-2 py-0.5 rounded-lg font-black text-white text-[9px] border border-white/10'>
                            Vuelta: {lastPlayedMatchOverall.aggregateInfo.leg2Score}
                          </span>
                        )}
                        {lastPlayedMatchOverall.aggregateInfo.globalScoreText && (
                          <span className='bg-blue-600 px-2.5 py-0.5 rounded-lg font-black text-white text-[9px] shadow-sm'>
                            GLOBAL: {lastPlayedMatchOverall.aggregateInfo.globalScoreText} {lastPlayedMatchOverall.aggregateInfo.penaltiesText || ''}
                          </span>
                        )}
                      </div>
                      {lastPlayedMatchOverall.aggregateInfo.qualified !== null && (
                        <span className={`px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                          lastPlayedMatchOverall.aggregateInfo.qualified
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {lastPlayedMatchOverall.aggregateInfo.qualified ? '✅ ¡Clasificado a siguiente ronda!' : '❌ Eliminado en esta ronda'}
                        </span>
                      )}
                    </div>
                  )}

                  <div className='flex items-center justify-between text-[8px] font-bold text-slate-400 px-1'>
                    <span>Balance: +{lastPlayedMatchOverall.pe || 0} PE ganados</span>
                    <span className='text-amber-400 font-black'>+{lastPlayedMatchOverall.rep || 0} Reputación</span>
                  </div>
                </div>
              )}

              {divisionFinished ? (
                <Panel className='p-5 text-center relative overflow-hidden space-y-3'>
                  <div className='absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none' />
                  <Trophy size={32} className='text-yellow-400 mx-auto animate-bounce' />
                  <h3 className='text-sm font-black uppercase italic text-white'>Temporada de tu club finalizada</h3>
                  <p className='text-[10px] font-bold text-slate-300'>
                    {contractSigned
                      ? 'Contrato firmado: el balance de esta temporada está cerrado.'
                      : reviewDone
                        ? 'El balance de esta temporada ya está resuelto.'
                        : 'Dirígete a tu Buzón para revisar ofertas o abre el Balance Completo.'}
                  </p>

                  <div className='space-y-2 pt-1'>
                    {/* Botón directo de Champions League cuando el equipo está clasificado o en disputa */}
                    {isClQualified && (
                      <button
                        onClick={() => setTab('cl')}
                        className='w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest active:scale-95 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 border border-blue-400/40'
                      >
                        <Trophy size={16} className='text-yellow-300 animate-pulse' />
                        {championsFinished
                          ? 'Ver Hub de Champions League'
                          : !allLeaguesFinished
                            ? 'Simular Resto de Ligas y Jugar Champions'
                            : 'Jugar Champions League'}
                      </button>
                    )}

                    {/* Botón para iniciar nueva temporada global si Champions y Ligas están listas */}
                    {allLeaguesFinished && championsFinished && onNewSeason && (
                      <button
                        onClick={onNewSeason}
                        className='w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2'
                      >
                        <RotateCcw size={15} /> Iniciar Nueva Temporada Global
                      </button>
                    )}

                    <div className='grid grid-cols-2 gap-2'>
                      <button
                        onClick={() => setTab('market')}
                        className='w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 py-3 rounded-2xl text-[10px] font-black uppercase italic tracking-widest active:scale-95 transition-all shadow-md'
                      >
                        Buzón {career.offers?.length > 0 && `(${career.offers.length})`}
                      </button>
                      <button
                        onClick={onOpenReview}
                        disabled={reviewDone || contractSigned}
                        className='w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-2xl text-[10px] font-black uppercase italic tracking-widest active:scale-95 transition-all disabled:opacity-30 border border-white/10'
                      >
                        {contractSigned ? 'Cerrado' : reviewDone ? 'Resuelto' : 'Ver balance'}
                      </button>
                    </div>
                  </div>
                </Panel>

              ) : currentWeekInfo.isOfficeWeek ? (
                /* HUB DE SEMANA DE OFICINA (SIN PARTIDO: MERCADO O PARÓN INTERNACIONAL) */
                <Panel className='p-5 space-y-4 border-indigo-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/30'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <span className='text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 inline-block'>
                        Semana {currentWeekInfo.week} de {currentWeekInfo.totalWeeks || (totalRoundsCount + 5)} · Semana de Oficina
                      </span>
                      <h3 className='text-base font-black uppercase italic text-white mt-1.5'>
                        {currentWeekInfo.officeInfo.title}
                      </h3>
                      <p className='text-[10px] font-bold text-indigo-200/90 mt-0.5'>
                        {currentWeekInfo.officeInfo.subtitle}
                      </p>
                    </div>
                    <div className='w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30 shadow-lg'>
                      {currentWeekInfo.isMarketOpen ? <Briefcase size={22} /> : <Calendar size={22} />}
                    </div>
                  </div>

                  <div className='bg-black/40 rounded-2xl p-3.5 border border-white/5 space-y-2'>
                    <p className='text-[10px] font-bold text-slate-200 leading-relaxed'>
                      {currentWeekInfo.officeInfo.desc}
                    </p>
                    {currentWeekInfo.isMarketOpen ? (
                      <div className='flex items-center gap-2 text-[8px] font-black uppercase text-emerald-400 pt-1 border-t border-white/5'>
                        <span className='w-2 h-2 rounded-full bg-emerald-400 animate-pulse' />
                        Mercado Laboral Abierto: puedes postularte a vacantes en la pestaña "Empleo"
                      </div>
                    ) : (
                      <div className='flex items-center gap-2 text-[8px] font-black uppercase text-slate-400 pt-1 border-t border-white/5'>
                        <span className='w-2 h-2 rounded-full bg-slate-400' />
                        Sin jornada liguera: aprovecha para entrenar o ajustar táctica
                      </div>
                    )}
                  </div>

                  {/* Acciones rápidas de oficina */}
                  <div className='grid grid-cols-3 gap-2'>
                    <button
                      onClick={() => setShowTrainingModal(true)}
                      className='p-3 bg-black/30 hover:bg-black/50 rounded-2xl border border-white/10 text-center active:scale-95 transition-all'
                    >
                      <Dumbbell size={16} className='text-emerald-400 mx-auto mb-1' />
                      <p className='text-[8px] font-black uppercase text-white'>Entrenamiento</p>
                      <p className='text-[7px] font-bold text-emerald-400 mt-0.5'>{career.pe} PE Disp.</p>
                    </button>
                    <button
                      onClick={() => setTab('tactic')}
                      className='p-3 bg-black/30 hover:bg-black/50 rounded-2xl border border-white/10 text-center active:scale-95 transition-all'
                    >
                      <Target size={16} className='text-amber-400 mx-auto mb-1' />
                      <p className='text-[8px] font-black uppercase text-white'>Táctica</p>
                      <p className='text-[7px] font-bold text-amber-300 mt-0.5'>{(career.tactic || base).att}-{(career.tactic || base).opp}-{(career.tactic || base).def}</p>
                    </button>
                    <button
                      onClick={() => setTab('jobs')}
                      className={`p-3 rounded-2xl border text-center active:scale-95 transition-all ${
                        currentWeekInfo.isMarketOpen
                          ? 'bg-sky-500/20 hover:bg-sky-500/30 border-sky-500/40 text-sky-300'
                          : 'bg-black/30 hover:bg-black/50 border-white/10 text-slate-300'
                      }`}
                    >
                      <Briefcase size={16} className={`mx-auto mb-1 ${currentWeekInfo.isMarketOpen ? 'text-sky-400' : 'text-slate-400'}`} />
                      <p className='text-[8px] font-black uppercase text-white'>Bolsa Empleo</p>
                      <p className={`text-[7px] font-bold mt-0.5 ${currentWeekInfo.isMarketOpen ? 'text-sky-300 font-black' : 'text-slate-400'}`}>
                        {currentWeekInfo.isMarketOpen ? '¡Abierto!' : 'Cerrado'}
                      </p>
                    </button>
                  </div>

                  {/* Botón principal de avanzar semana */}
                  <button
                    onClick={() => {
                      if (onAdvanceOfficeWeek) {
                        onAdvanceOfficeWeek(currentWeekInfo.week);
                      }
                    }}
                    className='w-full bg-gradient-to-r from-indigo-500 via-purple-600 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2'
                  >
                    <FastForward size={15} /> Completar y Avanzar Semana {currentWeekInfo.week}
                  </button>
                </Panel>

              ) : nextFixture ? (
                <Panel className='p-5'>
                  <div className='flex items-center justify-between mb-2'>
                    <p className='text-[9px] font-black uppercase tracking-widest text-emerald-400'>
                      Próximo partido · Jornada {(career.div === 2 ? (comp?.matchday2 || 0) : (comp?.matchday || 0)) + 1} de {totalRoundsCount}
                    </p>
                    <span className='text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10'>
                      Semana {currentWeekInfo.week} de {currentWeekInfo.totalWeeks || (totalRoundsCount + 5)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between mt-4'>
                    <div className='flex-1 text-center'>
                      <Shield color1={team?.color1} color2={team?.color2} initial={team?.name} size='md' isFlag={team?.isFlag} />
                      <p className='text-[9px] font-black uppercase italic mt-2 text-white truncate'>{team?.name}</p>
                      <p className='text-[8px] font-black uppercase text-amber-400 mt-0.5'>{isHome ? 'Local' : 'Visitante'}</p>
                    </div>
                    <div className='px-3 text-center'>
                      <p className='text-[8px] font-black uppercase text-slate-400'>{isHome ? 'En casa' : 'Fuera'}</p>
                      <p className='text-2xl font-black italic text-white'>VS</p>
                    </div>
                    <div className='flex-1 text-center'>
                      <Shield color1={rival?.color1} color2={rival?.color2} initial={rival?.name} size='md' isFlag={rival?.isFlag} />
                      <p className='text-[9px] font-black uppercase italic mt-2 text-white truncate'>{rival?.name}</p>
                      <p className='text-[8px] font-black uppercase text-slate-400 mt-0.5'>{isHome ? 'Visitante' : 'Local'}</p>
                    </div>
                  </div>
                  <div className='mt-4 bg-black/30 rounded-2xl px-4 py-3 border border-white/5 flex items-center justify-between'>
                    <div>
                      <p className='text-[8px] font-black uppercase tracking-widest text-slate-400'>Rival</p>
                      <p className='text-[10px] font-bold text-slate-200'>{rival?.att}/{rival?.opp}/{rival?.def} · Fuerza {strengthOf(rival)}</p>
                    </div>
                    <div className='text-right'>
                      <p className='text-[8px] font-black uppercase tracking-widest text-slate-400'>Tu salida</p>
                      <p className={`text-[10px] font-bold ${activeInjury ? 'text-rose-300' : 'text-amber-300'}`}>
                        {effectiveTactic.att}/{effectiveTactic.opp}/{effectiveTactic.def}
                      </p>
                    </div>
                  </div>

                  {/* Aviso de baja temporal por lesión si aplica */}
                  {activeInjury && (
                    <div className='mt-3 bg-red-950/50 border border-red-500/40 rounded-2xl p-3.5 flex items-start gap-2.5 shadow-md'>
                      <AlertTriangle size={16} className='text-red-400 shrink-0 mt-0.5' />
                      <div className='text-[9px] font-bold text-red-200 leading-snug'>
                        <span className='text-white font-black uppercase block tracking-wider'>
                          Baja temporal por lesión: -1 {activeInjury.label}
                        </span>
                        Esta reducción es válida <strong>exclusivamente para este partido</strong>. La plantilla recibirá el alta médica completa de forma automática al término del encuentro.
                      </div>
                    </div>
                  )}

                  {/* Previa y atajo de entrenamiento */}
                  <div className='mt-4 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 rounded-2xl p-3.5 border border-white/10 flex items-center justify-between gap-2'>
                    <div className='min-w-0'>
                      <div className='flex items-center gap-1.5 flex-wrap'>
                        <Dumbbell size={13} className='text-amber-400 shrink-0' />
                        <p className='text-[9px] font-black uppercase tracking-widest text-amber-400 truncate'>
                          Previa de Entrenamiento
                        </p>
                        {career.medicalImmunityWeeks > 0 && (
                          <span className='text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1'>
                            <ShieldCheck size={10} /> Escudo: {career.medicalImmunityWeeks} sem.
                          </span>
                        )}
                      </div>
                      <p className='text-[10px] font-bold text-slate-200 mt-0.5'>
                        {hasTrainedThisMatchday ? 'Sesión de la jornada completada' : 'Entrena intensidad (1D6) o gestiona PE'}
                      </p>
                    </div>
                    <div className='flex items-center gap-1.5 shrink-0'>
                      <button
                        onClick={() => setShowDrillModal(true)}
                        disabled={hasTrainedThisMatchday}
                        className='px-2.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[8px] font-black uppercase italic tracking-wider disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 active:scale-95'
                      >
                        <Dices size={11} /> 1D6
                      </button>
                      <button
                        onClick={() => setShowTrainingModal(true)}
                        className='px-2.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[8px] font-black uppercase italic tracking-wider flex items-center gap-1 active:scale-95'
                      >
                        <Zap size={11} /> PE
                      </button>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-2 mt-4'>
                    <button
                      onClick={onPlayMatch}
                      className='bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-1.5'
                    >
                      <Swords size={15} /> Jugar Partido
                    </button>
                    <button
                      onClick={onSimulateMatch}
                      className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-blue-400/30'
                    >
                      <FastForward size={15} /> Simular Jornada
                    </button>
                  </div>
                </Panel>
              ) : null}

              {/* PANEL RESUMIDO DE OBJETIVOS Y CONFIANZA DIRECTIVA EN VISTA PRINCIPAL */}
              <Panel className='p-5 space-y-4 border-amber-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-amber-950/20'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='flex items-center gap-1.5'>
                      <Target size={13} className='text-amber-400' />
                      <p className='text-[9px] font-black uppercase tracking-widest text-amber-400'>
                        Objetivos de Temporada
                      </p>
                    </div>
                    <h3 className='text-sm font-black uppercase italic text-white mt-0.5'>
                      Confianza de la Directiva: <span className={
                        boardConfidence.score >= 75 ? 'text-emerald-400' :
                        boardConfidence.score >= 50 ? 'text-amber-400' : 'text-red-400'
                      }>{boardConfidence.score}% ({boardConfidence.badge})</span>
                    </h3>
                  </div>
                  <button
                    onClick={() => setTab('objectives')}
                    className='px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-[8px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all'
                  >
                    Ver Todo <ArrowRight size={11} />
                  </button>
                </div>

                {/* Barra de progreso de Confianza de la Directiva */}
                <div className='space-y-1.5 bg-black/40 rounded-2xl p-3 border border-white/5'>
                  <div className='flex items-center justify-between text-[8px] font-black uppercase tracking-wider'>
                    <span className='text-slate-400'>Índice de Aprobación Directiva</span>
                    <span className={
                      boardConfidence.score >= 75 ? 'text-emerald-400' :
                      boardConfidence.score >= 50 ? 'text-amber-400' : 'text-red-400'
                    }>
                      {coreMet} de {coreObjectives.length} Objetivos en Ruta
                    </span>
                  </div>
                  <div className='h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5'>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${boardConfidence.score}%` }}
                      className={`h-full rounded-full ${
                        boardConfidence.score >= 75
                          ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                          : boardConfidence.score >= 50
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          : 'bg-gradient-to-r from-red-500 to-rose-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Lista compacta de los 4 objetivos */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                  {objectives.slice(0, 4).map((obj, i) => (
                    <div key={i} className='bg-black/30 rounded-xl p-2.5 border border-white/5 flex items-center justify-between gap-2'>
                      <div className='min-w-0 flex-grow'>
                        <div className='flex items-center gap-1.5'>
                          <span className='text-[7px] font-black uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-300'>
                            {obj.category}
                          </span>
                          <span className={`text-[7px] font-black uppercase px-1.5 py-0.2 rounded ${
                            obj.status === 'completed' || obj.done
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : obj.status === 'on_track'
                              ? 'bg-sky-500/20 text-sky-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {obj.statusLabel}
                          </span>
                        </div>
                        <p className='text-[9px] font-black text-slate-100 truncate mt-1'>{obj.label}</p>
                      </div>
                      <div className='shrink-0 text-right'>
                        <span className='text-[9px] font-black text-amber-400 tabular-nums'>
                          {obj.currentValue} / {obj.targetValue}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* TITULARES Y PRENSA */}
              <Panel className='p-5'>
                <p className='text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-3'>
                  <Newspaper size={13} /> Titulares y Prensa
                </p>
                <div className='space-y-2.5'>
                  {news.map((item, i) => (
                    <div key={i} className='bg-black/25 rounded-2xl p-3 border border-white/5'>
                      <span className='text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-white/10'>
                        {item.tag}
                      </span>
                      <p className='text-[10px] font-bold text-slate-200 mt-1.5 leading-snug'>{item.text}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </>
          )}

          {/* PESTAÑA COMPLETA DE OBJETIVOS DE TEMPORADA (ESTILO FIFA / PES) */}
          {tab === 'objectives' && (
            <div className='space-y-4'>
              {/* CABECERA Y PANEL DE CONFIANZA DE LA DIRECTIVA */}
              <Panel className='p-5 space-y-4 bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/30 border-amber-500/30'>
                <div className='flex items-center justify-between'>
                  <div>
                    <span className='text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-block'>
                      Temporada {career.season} · {team?.name}
                    </span>
                    <h3 className='text-base font-black uppercase italic text-white mt-1.5'>
                      Centro de Objetivos y Evaluación
                    </h3>
                    <p className='text-[10px] font-bold text-slate-300 mt-0.5'>
                      Exigencias de la junta directiva y estado del banquillo técnico
                    </p>
                  </div>
                  <div className='w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 shadow-lg'>
                    <Target size={24} />
                  </div>
                </div>

                {/* Tarjeta de Confianza de la Directiva */}
                <div className='bg-black/40 rounded-2xl p-4 border border-white/5 space-y-3'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-[8px] font-black uppercase tracking-widest text-slate-400'>
                        Confianza de la Junta Directiva
                      </p>
                      <h4 className={`text-xl font-black italic mt-0.5 ${
                        boardConfidence.score >= 75 ? 'text-emerald-400' :
                        boardConfidence.score >= 50 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {boardConfidence.score}% · {boardConfidence.badge}
                      </h4>
                    </div>
                    <div className='text-right'>
                      <span className='text-[8px] font-black uppercase px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-white/10'>
                        {coreMet} de {coreObjectives.length} Cumplidos / En Ruta
                      </span>
                      <p className='text-[8px] font-bold text-slate-400 mt-1'>
                        {boardConfidence.score >= 75 ? 'Puesto seguro y respaldado' :
                         boardConfidence.score >= 50 ? 'Bajo observación deportiva' :
                         '⚠️ Riesgo de despido al final de temporada'}
                      </p>
                    </div>
                  </div>

                  {/* Barra de satisfacción */}
                  <div className='h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5'>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${boardConfidence.score}%` }}
                      className={`h-full rounded-full ${
                        boardConfidence.score >= 75
                          ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                          : boardConfidence.score >= 50
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          : 'bg-gradient-to-r from-red-500 to-rose-400'
                      }`}
                    />
                  </div>

                  <p className='text-[9px] font-bold text-slate-300 leading-relaxed pt-1'>
                    La directiva evalúa el cumplimiento de los <strong>{coreObjectives.length} objetivos principales</strong> (Liga, Victorias, Desarrollo de Plantilla y Prestigio) para decidir tu continuidad y ofrecerte la renovación o mejores ofertas de mercado al término del contrato.
                  </p>
                </div>
              </Panel>

              {/* LISTA DETALLADA DE OBJETIVOS POR PILARES */}
              <div className='space-y-3'>
                {objectives.map((obj, idx) => {
                  const isDone = obj.done || obj.status === 'completed';
                  const isOnTrack = obj.status === 'on_track';
                  const isAtRisk = obj.status === 'at_risk';

                  return (
                    <Panel
                      key={idx}
                      className={`p-4 space-y-3 border transition-all ${
                        isDone
                          ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 to-slate-900/80'
                          : isOnTrack
                          ? 'border-sky-500/30 bg-gradient-to-br from-sky-950/20 to-slate-900/80'
                          : isAtRisk
                          ? 'border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-slate-900/80'
                          : 'border-red-500/30 bg-gradient-to-br from-red-950/20 to-slate-900/80'
                      }`}
                    >
                      {/* Encabezado del Objetivo */}
                      <div className='flex items-center justify-between gap-3'>
                        <div className='min-w-0'>
                          <div className='flex items-center gap-1.5 flex-wrap'>
                            <span className='text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-white/10'>
                              {obj.category}
                            </span>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                              obj.priority === 'Crítica'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : obj.priority === 'Muy Alta'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}>
                              Prioridad {obj.priority}
                            </span>
                            {obj.extra && (
                              <span className='text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-600/30 text-blue-200 border border-blue-400/40'>
                                Continental
                              </span>
                            )}
                          </div>
                          <h4 className='text-xs font-black uppercase italic text-white mt-1.5 leading-snug'>
                            {obj.label}
                          </h4>
                        </div>

                        {/* Insignia de Estado */}
                        <div className='shrink-0 text-right'>
                          <div className={`px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-wider flex items-center gap-1 ${
                            isDone
                              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                              : isOnTrack
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                              : isAtRisk
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {isDone ? <CheckCircle size={11} /> : isAtRisk ? <AlertTriangle size={11} /> : null}
                            {obj.statusLabel}
                          </div>
                        </div>
                      </div>

                      {/* Barra de Progreso y Valores */}
                      <div className='bg-black/40 rounded-xl p-3 border border-white/5 space-y-2'>
                        <div className='flex items-center justify-between text-[9px] font-bold'>
                          <span className='text-slate-400'>{obj.detail}</span>
                          <span className='text-amber-400 font-black tabular-nums'>
                            {obj.currentValue} / {obj.targetValue}
                          </span>
                        </div>
                        <div className='h-2 w-full bg-slate-800 rounded-full overflow-hidden'>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(5, Math.min(100, obj.progress || 0))}%` }}
                            className={`h-full rounded-full ${
                              isDone
                                ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                                : isOnTrack
                                ? 'bg-gradient-to-r from-sky-500 to-blue-400'
                                : isAtRisk
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                                : 'bg-gradient-to-r from-red-500 to-rose-400'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Acciones contextuales */}
                      {obj.key === 'development' && (
                        <div className='pt-1 flex items-center justify-between'>
                          <span className='text-[8px] font-bold text-slate-400'>
                            {career.pe} PEs disponibles en la tesorería del club
                          </span>
                          <button
                            onClick={() => setShowTrainingModal(true)}
                            className='px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl border border-emerald-500/40 text-[8px] font-black uppercase italic tracking-wider flex items-center gap-1 active:scale-95 transition-all'
                          >
                            <Zap size={10} /> Entrenar Plantilla
                          </button>
                        </div>
                      )}

                      {obj.key === 'position' && (
                        <div className='pt-1 flex items-center justify-between'>
                          <span className='text-[8px] font-bold text-slate-400'>
                            Posición actual: {position ? `${position}º` : '—'} de {standings?.length || 20}
                          </span>
                          <button
                            onClick={() => setTab('table')}
                            className='px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-white/10 text-[8px] font-black uppercase italic tracking-wider flex items-center gap-1 active:scale-95 transition-all'
                          >
                            <BarChart3 size={10} /> Ver Clasificación
                          </button>
                        </div>
                      )}
                    </Panel>
                  );
                })}
              </div>

              {/* ACCIONES RÁPIDAS DEL MÁNAGER */}
              <Panel className='p-4 space-y-2.5'>
                <p className='text-[9px] font-black uppercase tracking-widest text-slate-400'>
                  Accesos Rápidos del Mánager
                </p>
                <div className='grid grid-cols-3 gap-2'>
                  <button
                    onClick={() => setTab('tactic')}
                    className='p-3 bg-black/30 hover:bg-black/50 rounded-2xl border border-white/10 text-center active:scale-95 transition-all'
                  >
                    <ShieldCheck size={16} className='text-amber-400 mx-auto mb-1' />
                    <p className='text-[8px] font-black uppercase text-white'>Pizarra Táctica</p>
                  </button>
                  <button
                    onClick={() => setShowTrainingModal(true)}
                    className='p-3 bg-black/30 hover:bg-black/50 rounded-2xl border border-white/10 text-center active:scale-95 transition-all'
                  >
                    <Dumbbell size={16} className='text-emerald-400 mx-auto mb-1' />
                    <p className='text-[8px] font-black uppercase text-white'>Entrenamiento</p>
                  </button>
                  <button
                    onClick={() => setTab('jobs')}
                    className='p-3 bg-black/30 hover:bg-black/50 rounded-2xl border border-white/10 text-center active:scale-95 transition-all'
                  >
                    <Briefcase size={16} className='text-sky-400 mx-auto mb-1' />
                    <p className='text-[8px] font-black uppercase text-white'>Bolsa de Empleo</p>
                  </button>
                </div>
              </Panel>
            </div>
          )}

          {tab === 'tactic' && (
            <Panel className='p-5 space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-[9px] font-black uppercase tracking-widest text-amber-400'>
                    Pizarra Táctica · {totalTeamStrength} Puntos de Fuerza
                  </p>
                  <h3 className='text-base font-black uppercase italic text-white mt-0.5'>
                    Distribución Táctica Libre
                  </h3>
                </div>
                <div className='w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30'>
                  <Target size={20} />
                </div>
              </div>

              <div className='bg-black/30 rounded-2xl p-3.5 border border-white/5'>
                <p className='text-[10px] font-bold text-slate-300 leading-relaxed'>
                  Puntos totales a distribuir: <strong className='text-amber-300'>{base.att} + {base.opp} + {base.def} = {totalTeamStrength} pts</strong>.
                  Cambia la disposición para el partido sin alterar la fuerza total del club y respetando los máximos estándar (5-5-4).
                </p>
              </div>

              <div className='grid grid-cols-3 gap-2.5 mt-2'>
                {options.map(o => {
                  const active = sameDist(career.tactic || base, o);
                  return (
                    <button key={`${o.att}-${o.opp}-${o.def}`} onClick={() => onSetTactic(o)}
                      className={`py-3.5 rounded-2xl border text-center transition-all active:scale-95 shadow ${
                        active ? 'bg-gradient-to-br from-amber-400 to-amber-500 border-amber-300 text-slate-950 font-black' : 'bg-slate-900/60 hover:bg-slate-800 border-white/10 text-white'
                      }`}>
                      <p className='text-base font-black italic tabular-nums'>{o.att}-{o.opp}-{o.def}</p>
                      <p className={`text-[7px] font-black uppercase tracking-wider ${active ? 'text-slate-900/80' : 'text-slate-400'}`}>ATT · OPP · DEF</p>
                    </button>
                  );
                })}
              </div>
            </Panel>
          )}

          {tab === 'squad' && (
            <Panel className='p-5 space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='shrink-0 p-1 rounded-2xl bg-black/40 border border-white/10'>
                    <Shield
                      color1={team?.color1}
                      color2={team?.color2}
                      initial={team?.name}
                      size='sm'
                      isFlag={team?.isFlag}
                    />
                  </div>
                  <div>
                    <div className='flex items-center gap-1.5'>
                      <span className='text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30'>
                        Tier {tier}
                      </span>
                      <p className='text-[9px] font-black uppercase tracking-widest text-emerald-400'>
                        {career.pe} PE Disponibles
                      </p>
                    </div>
                    <h3 className='text-base font-black uppercase italic text-white mt-0.5'>
                      {team?.name} · Atributos ({totalTeamStrength} pts)
                    </h3>
                  </div>
                </div>
                <div className='w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30'>
                  <Dumbbell size={20} />
                </div>
              </div>

              <button
                onClick={() => setShowTrainingModal(true)}
                className='w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 p-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2'
              >
                <Zap size={16} /> Abrir Ventana de Entrenamiento (Steppers + / -)
              </button>

              <div className='bg-black/30 rounded-2xl p-4 border border-white/5 flex items-center justify-between gap-3'>
                <div>
                  <p className='text-[10px] font-black uppercase italic text-white flex items-center gap-1.5'>
                    <Dices size={14} className='text-amber-400' /> Entrenamiento Semanal Voluntario (1D6)
                  </p>
                  <p className='text-[9px] font-bold text-slate-400 mt-0.5'>
                    {hasTrainedThisMatchday
                      ? 'Sesión de entrenamiento de la jornada completada.'
                      : 'Lanza 1D6: Dado 1 (+7 PE), Dado 2 (+5 PE), 3-5 (Neutro), 6 (Lesión + Inmunidad 3 sem.).'}
                  </p>
                </div>
                <button
                  onClick={() => setShowDrillModal(true)}
                  disabled={hasTrainedThisMatchday}
                  className='px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:pointer-events-none text-slate-950 text-[9px] font-black uppercase italic tracking-wider flex items-center gap-1.5 active:scale-95 shadow shrink-0'
                >
                  <Dices size={13} /> {hasTrainedThisMatchday ? 'Realizado' : 'Entrenar (1D6)'}
                </button>
              </div>

              {career.medicalImmunityWeeks > 0 && (
                <div className='bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center gap-3'>
                  <HeartPulse size={18} className='text-emerald-400 shrink-0' />
                  <div className='text-[9px] font-bold text-emerald-200'>
                    <span className='text-white font-black uppercase block'>Inmunidad Médica Activa</span>
                    Protegido contra bajas por lesión durante {career.medicalImmunityWeeks} jornada{career.medicalImmunityWeeks > 1 ? 's' : ''} más.
                  </div>
                </div>
              )}

              <div className='space-y-2.5'>
                {[
                  { key: 'att', label: 'Ataque (ATT)', cap: 5 },
                  { key: 'opp', label: 'Oportunidades (OPP)', cap: 5 },
                  { key: 'def', label: 'Defensa (DEF)', cap: 4 }
                ].map(a => {
                  const val = team?.[a.key] || 0;
                  const cost = peCostFor(val);
                  const capped = val >= a.cap;
                  return (
                    <div key={a.key} className='flex items-center gap-3 bg-black/30 rounded-2xl px-4 py-3 border border-white/5'>
                      <div className='flex-grow'>
                        <p className='text-[9px] font-black uppercase tracking-widest text-slate-300'>{a.label}</p>
                        <p className='text-lg font-black italic text-white tabular-nums'>{val} <span className='text-[9px] text-slate-400'>/ {a.cap}</span></p>
                      </div>
                      <button
                        onClick={() => setShowTrainingModal(true)}
                        className='px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-[9px] font-black uppercase italic tracking-widest border border-white/10 active:scale-95 transition-all'
                      >
                        {capped ? 'Máximo' : `Gestionar · ${cost} PE`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </Panel>
          )}

          {/* CALENDARIO DE PARTIDOS EN CUADRÍCULA POR MESES Y JORNADAS */}
          {tab === 'calendar' && (
            <Panel className='p-5 space-y-5'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-[9px] font-black uppercase tracking-widest text-amber-400'>
                    {comp?.name} · {career.div === 2 ? '2ª División' : '1ª División'}
                  </p>
                  <h3 className='text-base font-black uppercase italic text-white mt-0.5'>
                    Calendario de la Temporada
                  </h3>
                </div>
                <div className='w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center'>
                  <Calendar size={20} />
                </div>
              </div>

              {/* FILTROS RÁPIDOS CON CONTADORES */}
              <div className='flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1'>
                {[
                  { key: 'TODOS', label: 'Todos', count: log.length + matchCounts.pending, color: 'bg-slate-800 text-slate-200 border-white/10' },
                  { key: 'LIGA', label: 'Liga', count: matchCounts.leagueMatches || totalRoundsCount, color: 'bg-amber-950/60 text-amber-300 border-amber-500/30' },
                  { key: 'CHAMPIONS', label: 'Champions', count: matchCounts.clMatches || 0, color: 'bg-blue-950/60 text-blue-300 border-blue-500/30' },
                  { key: 'VICTORIA', label: 'Victorias', count: matchCounts.wins, color: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' },
                  { key: 'EMPATE', label: 'Empates', count: matchCounts.draws, color: 'bg-slate-900/80 text-slate-300 border-slate-700/50' },
                  { key: 'DERROTA', label: 'Derrotas', count: matchCounts.losses, color: 'bg-red-950/60 text-red-300 border-red-500/30' },
                  { key: 'PENDIENTE', label: 'Pendientes', count: matchCounts.pending, color: 'bg-sky-950/60 text-sky-300 border-sky-500/30' }
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setCalendarFilter(f.key)}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider shrink-0 border flex items-center gap-1.5 transition-all active:scale-95 ${
                      calendarFilter === f.key
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                        : f.color
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[8px] font-black ${calendarFilter === f.key ? 'bg-slate-950/30 text-slate-950' : 'bg-black/40 text-slate-300'}`}>
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* CUADRÍCULA DE MESES */}
              <div className='space-y-6'>
                {calendarMonths.map(month => {
                  const filteredItems = month.items.filter(item => {
                    if (calendarFilter === 'TODOS') return true;
                    if (item.isSpecial) return false;
                    if (calendarFilter === 'LIGA') return !item.isChampions;
                    if (calendarFilter === 'CHAMPIONS') return item.isChampions;
                    if (calendarFilter === 'VICTORIA') return item.result === 'W';
                    if (calendarFilter === 'EMPATE') return item.result === 'D';
                    if (calendarFilter === 'DERROTA') return item.result === 'L';
                    if (calendarFilter === 'PENDIENTE') return !item.played;
                    return true;
                  });

                  if (filteredItems.length === 0) return null;

                  return (
                    <div key={month.monthName} className='space-y-3'>
                      <div className='flex items-center gap-2 px-1'>
                        <span className='w-2 h-2 rounded-full bg-amber-400' />
                        <h4 className='text-xs font-black uppercase italic tracking-widest text-slate-300'>
                          {month.monthName}
                        </h4>
                        <div className='h-px flex-grow bg-white/10' />
                        <span className='text-[8px] font-bold uppercase text-slate-500'>
                          {filteredItems.length} eventos
                        </span>
                      </div>

                      {/* CUADRÍCULA 2 COLUMNAS */}
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5'>
                        {filteredItems.map((item, idx) => {
                          if (item.isSpecial) {
                            const isMarket = item.type === 'market';
                            return (
                              <div
                                key={`special-${idx}`}
                                className={`rounded-2xl p-3.5 border flex items-center gap-3 ${
                                  isMarket
                                    ? 'bg-gradient-to-r from-amber-950/30 to-slate-900/60 border-amber-500/30 text-amber-300'
                                    : 'bg-gradient-to-r from-sky-950/30 to-slate-900/60 border-sky-500/30 text-sky-300'
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                  isMarket ? 'bg-amber-500/20 text-amber-400' : 'bg-sky-500/20 text-sky-400'
                                }`}>
                                  {isMarket ? <Sparkles size={16} /> : <Plane size={16} />}
                                </div>
                                <div className='min-w-0'>
                                  <p className='text-[8px] font-black uppercase tracking-wider text-slate-400'>
                                    Semana {item.weekNum}
                                  </p>
                                  <p className='text-[10px] font-black uppercase italic truncate'>
                                    {item.title}
                                  </p>
                                </div>
                              </div>
                            );
                          }

                          const isW = item.result === 'W';
                          const isD = item.result === 'D';
                          const isL = item.result === 'L';
                          const isUCL = !!item.isChampions;
                          const isEliminated = isUCL && item.isEliminated;
                          const isProbable = isUCL && item.isProbable && !item.played;

                          if (isEliminated) {
                            return (
                              <div
                                key={`ucl-elim-${item.weekNum}-${item.clPhaseLabel}`}
                                className='rounded-2xl p-3 border border-red-500/20 bg-slate-950/40 space-y-1.5 opacity-80'
                              >
                                <div className='flex items-center justify-between'>
                                  <span className='text-[8px] font-black uppercase tracking-wider flex items-center gap-1 text-slate-400'>
                                    <Trophy size={10} className='text-slate-500' />
                                    {item.shortLabel || 'Champions League'}
                                  </span>
                                  <span className='text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20'>
                                    Eliminado
                                  </span>
                                </div>
                                <div className='flex items-center justify-between gap-2'>
                                  <div>
                                    <p className='text-[8px] font-bold text-slate-500 uppercase'>Semana Continental</p>
                                    <h5 className='text-xs font-bold italic text-slate-400'>
                                      {item.eliminatedPhase ? `Eliminado en ${item.eliminatedPhase}` : 'Sin participación'}
                                    </h5>
                                  </div>
                                  <span className='text-[8px] font-bold text-slate-500 uppercase bg-black/40 px-2 py-1 rounded-xl border border-white/5'>
                                    Descanso
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          if (isProbable) {
                            return (
                              <div
                                key={`ucl-prob-${item.weekNum}-${item.clPhaseLabel}`}
                                className='rounded-2xl p-3 border border-blue-500/20 bg-gradient-to-br from-blue-950/20 via-slate-900/40 to-slate-900/60 space-y-1.5'
                              >
                                <div className='flex items-center justify-between'>
                                  <span className='text-[8px] font-black uppercase tracking-wider flex items-center gap-1 text-blue-300'>
                                    <Trophy size={10} className='text-yellow-400' />
                                    {item.shortLabel || 'Champions League'}
                                  </span>
                                  <span className='text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20'>
                                    Fecha Probable
                                  </span>
                                </div>
                                <div className='flex items-center justify-between gap-2'>
                                  <div>
                                    <p className='text-[8px] font-bold text-slate-400 uppercase'>Ronda Continental</p>
                                    <h5 className='text-xs font-bold italic text-slate-300'>
                                      Sujeto a Clasificación
                                    </h5>
                                  </div>
                                  <span className='text-[8px] font-bold text-blue-400 uppercase bg-blue-500/10 px-2 py-1 rounded-xl border border-blue-500/20'>
                                    Pendiente
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={isUCL ? `ucl-${item.weekNum}-${item.clPhaseLabel}` : `match-${item.matchday}`}
                              className={`rounded-2xl p-3 border transition-all space-y-2 ${
                                isUCL
                                  ? item.played
                                    ? isW
                                      ? 'bg-gradient-to-br from-blue-950/40 via-emerald-950/30 to-slate-900/70 border-emerald-500/40'
                                      : isD
                                      ? 'bg-gradient-to-br from-blue-950/40 via-slate-900/60 to-slate-900/70 border-slate-700/50'
                                      : 'bg-gradient-to-br from-blue-950/40 via-red-950/30 to-slate-900/70 border-red-500/40'
                                    : 'bg-gradient-to-br from-blue-950/40 via-indigo-950/30 to-slate-900/60 border-blue-500/30 hover:border-blue-400/50'
                                  : item.played
                                    ? isW
                                      ? 'bg-emerald-950/30 border-emerald-500/30 hover:border-emerald-500/50'
                                      : isD
                                      ? 'bg-slate-900/60 border-slate-700/40 hover:border-slate-700/60'
                                      : 'bg-red-950/30 border-red-500/30 hover:border-red-500/50'
                                    : 'bg-black/30 border-white/10 hover:border-white/20'
                              }`}
                            >
                              <div className='flex items-center justify-between'>
                                <span className={`text-[8px] font-black uppercase tracking-wider flex items-center gap-1 ${isUCL ? 'text-blue-300' : 'text-slate-400'}`}>
                                  {isUCL ? (
                                    <>
                                      <Trophy size={10} className='text-yellow-400' />
                                      {item.shortLabel || 'Champions League'}
                                    </>
                                  ) : (
                                    `Sem. ${item.weekNum} · J${item.matchday}`
                                  )}
                                </span>
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  isUCL
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                    : item.isHome
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : 'bg-slate-800 text-slate-300 border border-white/10'
                                }`}>
                                  {isUCL ? 'Continental' : item.isHome ? 'Casa' : 'Fuera'}
                                </span>
                              </div>

                              <div className='flex items-center justify-between gap-2'>
                                <div className='flex items-center gap-2.5 min-w-0'>
                                  <Shield
                                    color1={item.rival?.color1}
                                    color2={item.rival?.color2}
                                    initial={item.rival?.name}
                                    size='sm'
                                    isFlag={item.rival?.isFlag}
                                  />
                                  <div className='min-w-0'>
                                    <p className='text-[8px] font-bold text-slate-400 uppercase'>
                                      {isUCL ? 'Rival Champions' : 'vs Rival'}
                                    </p>
                                    <h5 className='text-xs font-black uppercase italic text-white truncate'>
                                      {item.rival?.name}
                                    </h5>
                                  </div>
                                </div>

                                <div className='shrink-0 text-right'>
                                  {item.played ? (
                                    <div className='flex items-center gap-2'>
                                      <div className='px-2.5 py-1 bg-black/50 rounded-xl border border-white/10'>
                                        <span className='text-xs font-black italic text-white tabular-nums'>
                                          {item.scoreText}
                                        </span>
                                      </div>
                                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0 ${
                                        isW
                                          ? 'bg-emerald-500 text-slate-950 font-black'
                                          : isD
                                          ? 'bg-slate-700 text-slate-200'
                                          : 'bg-red-600 text-white'
                                      }`}>
                                        {item.result}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-xl ${
                                      isUCL
                                        ? 'bg-blue-900/60 text-blue-300 border border-blue-500/30'
                                        : 'bg-slate-800/80 text-sky-300 border border-sky-500/20'
                                    }`}>
                                      Por disputar
                                    </span>
                                  )}
                                </div>
                              </div>

                              {item.played && (
                                <div className='pt-1.5 border-t border-white/5 flex items-center justify-between text-[8px] font-bold'>
                                  <span className='text-amber-300'>+{item.repEarned || 0} Rep</span>
                                  <span className='text-emerald-300'>+{item.peEarned || 0} PE</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          )}

          {tab === 'cl' && (
            <CareerChampionsHub
              career={career}
              team={team}
              clComp={clComp}
              clInfo={clInfo}
              onPlayChampionsMatch={onPlayChampionsMatch || onOpenChampions}
              onSimulateChampionsMatch={onSimulateChampionsMatch}
              onSimulateAllChampions={onSimulateAllChampions}
              onOpenNewSeason={onNewSeason}
              onBackToCareer={() => setTab('main')}
              onOpenDrill={() => setShowDrillModal(true)}
              onOpenTraining={() => setShowTrainingModal(true)}
              onSetTactic={onSetTactic}
              ui={ui}
            />
          )}

          {tab === 'table' && (
            <Panel className='p-4'>
              <p className='text-[9px] font-black uppercase tracking-widest text-blue-400 px-2 pb-3'>{comp?.name} · {career.div === 2 ? '2ª' : '1ª'} División</p>
              <div className='space-y-1'>
                {(standings || []).map((t, i) => (
                  <div key={t.id} className={`flex items-center gap-2 px-2 py-2 rounded-xl ${t.id === career.teamId ? 'bg-amber-500/20 border border-amber-400/40' : i % 2 ? 'bg-black/20' : ''}`}>
                    <span className='w-5 text-[9px] font-black text-slate-400 tabular-nums'>{i + 1}</span>
                    <Shield color1={t.color1} color2={t.color2} initial={t.name} size='sm' isFlag={t.isFlag} />
                    <span className='flex-grow text-[10px] font-black uppercase italic text-white truncate'>{t.name}</span>
                    <span className='text-[9px] font-bold text-slate-300 tabular-nums w-6 text-center'>{t.p}</span>
                    <span className='text-[9px] font-bold text-slate-300 tabular-nums w-8 text-center'>{t.gf - t.ga}</span>
                    <span className='text-[10px] font-black text-white tabular-nums w-7 text-right'>{t.pts}</span>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* PESTAÑA DEDICADA DE EMPLEO / MERCADO DE BANQUILLOS */}
          {tab === 'jobs' && (
            <div className='space-y-4'>
              {/* TICKER DE RUMORES DE MERCADO */}
              <RumorsTicker rumors={dynamicRumors} />

              {/* POSTULACIÓN ACTIVA EN CURSO */}
              {career.activeApplication && (
                <Panel className='p-5 bg-gradient-to-br from-sky-950/40 to-slate-900/80 border-sky-500/30 space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <span className='inline-block w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse' />
                      <span className='text-xs font-black uppercase tracking-wider text-sky-300'>
                        Candidatura en Revisión Activa
                      </span>
                    </div>
                    <span className='text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-200 border border-sky-500/30'>
                      {career.activeApplication.weeksRemaining ?? 2} {career.activeApplication.weeksRemaining === 1 ? 'semana restante' : 'semanas restantes'}
                    </span>
                  </div>

                  <div className='flex items-center gap-3 bg-black/40 rounded-2xl p-3.5 border border-white/5'>
                    <Shield
                      color1={career.activeApplication.color1}
                      color2={career.activeApplication.color2}
                      initial={career.activeApplication.teamName}
                      size='md'
                      isFlag={career.activeApplication.isFlag}
                    />
                    <div className='min-w-0 flex-grow'>
                      <h4 className='text-sm font-black uppercase italic text-white truncate'>
                        {career.activeApplication.teamName}
                      </h4>
                      <p className='text-[9px] font-bold uppercase text-slate-400'>
                        {career.activeApplication.compName} · {career.activeApplication.div === 2 ? '2ª División' : '1ª División'} · Tier {career.activeApplication.tier}
                      </p>
                    </div>
                    <div className='text-right'>
                      <span className='text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-900/50 text-sky-200 border border-sky-500/30'>
                        En Evaluación
                      </span>
                    </div>
                  </div>

                  <p className='text-[10px] font-bold text-slate-300 leading-relaxed'>
                    La directiva está siguiendo de cerca tu rendimiento durante las próximas jornadas simuladas. Mientras esta candidatura permanezca en curso, la opción de postularte a otros clubes está bloqueada.
                  </p>

                  <div className='text-[8px] font-bold uppercase text-sky-400/80 tracking-wider flex items-center gap-1.5 bg-black/30 p-2.5 rounded-xl border border-sky-500/20'>
                    <Lock size={12} className='shrink-0' /> Proceso a ciegas: el dictamen final llegará directamente a tu buzón al concluir el plazo de evaluación.
                  </div>
                </Panel>
              )}

              {/* LISTA DE VACANTES DISPONIBLES (HASTA 10 CLUBES PARECIDOS EN TIER Y POSICIÓN) */}
              <Panel className='p-5 space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='flex items-center gap-1.5'>
                      <p className='text-[9px] font-black uppercase tracking-widest text-sky-400'>Ofertas y Banquillos</p>
                      {currentWeekInfo.isMarketOpen ? (
                        <span className='text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1'>
                          <span className='w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse' />
                          Mercado Abierto (Semana {currentWeekInfo.week})
                        </span>
                      ) : (
                        <span className='text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/10 flex items-center gap-1'>
                          <Lock size={10} /> Mercado Cerrado (Semana {currentWeekInfo.week})
                        </span>
                      )}
                    </div>
                    <h3 className='text-base font-black uppercase italic text-white mt-0.5'>Bolsa de Empleo ({marketVacancies?.length || 0}/10)</h3>
                  </div>
                  <div className='w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center'>
                    <Briefcase size={20} />
                  </div>
                </div>

                {(() => {
                  const alreadyTransferredOrSigned = career.transferredInSeason === (seasonState?.season || 1) || career.signedForSeason === (seasonState?.season || 1);

                  return (
                    <>
                      {alreadyTransferredOrSigned ? (
                        <div className='bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center gap-3'>
                          <div className='w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0'>
                            <Check size={16} />
                          </div>
                          <div>
                            <p className='text-[9px] font-black uppercase text-emerald-300'>Contrato Recién Firmado</p>
                            <p className='text-[9px] font-bold text-slate-200 mt-0.5 leading-snug'>
                              Has firmado contrato con <strong className='text-white uppercase'>{team?.name}</strong>. Ya no tienes opciones de postulación disponibles durante esta temporada.
                            </p>
                          </div>
                        </div>
                      ) : currentWeekInfo.isMarketOpen ? (
                        <div className='bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center gap-3'>
                          <div className='w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0'>
                            <Sparkles size={16} />
                          </div>
                          <p className='text-[9px] font-bold text-emerald-100 leading-snug'>
                            <strong className='text-white uppercase'>Ventana de Mercado Activa:</strong> Puedes enviar tu candidatura formal a <strong className='text-white'>1 vacante</strong>. La junta directiva realizará una evaluación a ciegas de <strong className='text-white'>2 semanas</strong>.
                          </p>
                        </div>
                      ) : (
                        <div className='bg-slate-900/80 border border-amber-500/30 rounded-2xl p-3.5 flex items-center gap-3'>
                          <div className='w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0'>
                            <Lock size={16} />
                          </div>
                          <div>
                            <p className='text-[9px] font-black uppercase text-amber-300'>Mercado Laboral Cerrado</p>
                            <p className='text-[9px] font-bold text-slate-300 mt-0.5 leading-snug'>
                              Las postulaciones oficiales se admiten en la <strong>Semana 1 (Apertura de Verano)</strong> y en la <strong>Apertura de Invierno (Ecuador del campeonato)</strong>. Puedes explorar los clubes y su estado actual en todo momento.
                            </p>
                          </div>
                        </div>
                      )}

                      {marketVacancies?.length ? (
                        <div className='space-y-3.5'>
                          {marketVacancies.map(v => {
                            const isMyCurrentTeam = v.teamId === career.teamId && v.compId === career.compId && v.div === career.div;
                            const isThisApplied = career.activeApplication && career.activeApplication.teamId === v.teamId;
                            const isLocked = !!career.activeApplication && !isThisApplied;
                            const isMarketClosed = !currentWeekInfo.isMarketOpen;

                            return (
                              <div
                                key={v.id}
                                className={`bg-gradient-to-br from-black/50 to-slate-900/70 rounded-2xl p-4 border transition-all space-y-3 ${
                                  isThisApplied ? 'border-sky-500/50 bg-sky-950/20' : isMyCurrentTeam ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-white/10 hover:border-white/20'
                                }`}
                              >
                                <div className='flex items-center justify-between gap-3'>
                                  <div className='flex items-center gap-3 min-w-0'>
                                    <Shield color1={v.color1} color2={v.color2} initial={v.teamName} size='md' isFlag={v.isFlag} />
                                    <div className='min-w-0'>
                                      <h4 className='text-xs font-black uppercase italic text-white truncate'>{v.teamName}</h4>
                                      <p className='text-[9px] font-bold uppercase text-slate-400'>
                                        {v.compName} · {v.div === 2 ? '2ª Div' : '1ª Div'} · Tier {v.tier} ({TIERS[v.tier]?.name})
                                      </p>
                                    </div>
                                  </div>
                                  <div className='text-right shrink-0'>
                                    <span className='text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-sky-300 border border-white/10'>
                                      {v.standingStatus}
                                    </span>
                                    <p className='text-[8px] font-bold text-amber-300/90 mt-1 uppercase'>
                                      {v.profile}
                                    </p>
                                  </div>
                                </div>

                                {/* Contexto y crisis del club */}
                                <div className='bg-black/40 rounded-xl p-3 border border-white/5 space-y-1.5'>
                                  <p className='text-[9px] font-bold italic text-slate-200 leading-snug'>
                                    "{v.directiveQuote}"
                                  </p>
                                  <p className='text-[8px] font-bold text-slate-400'>
                                    {v.crisisText}
                                  </p>
                                  <div className='flex items-center justify-between pt-1 border-t border-white/5 text-[8px] font-bold'>
                                    <span className='text-slate-400 uppercase'>Objetivo Principal:</span>
                                    <span className='text-amber-300'>{v.requiredObjective}</span>
                                  </div>

                                  {/* Objetivos de contrato completos */}
                                  {v.contractObjectives?.length > 0 && (
                                    <div className='mt-2 space-y-1 bg-black/50 rounded-xl p-2 border border-white/5'>
                                      <p className='text-[7px] font-black uppercase text-sky-400 tracking-wider flex items-center gap-1'>
                                        <Target size={10} /> Objetivos Exigidos al Ser Contratado:
                                      </p>
                                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-1'>
                                        {v.contractObjectives.map((obj, oi) => (
                                          <div key={oi} className='text-[8px] font-bold text-slate-300 flex items-center justify-between bg-slate-900/60 px-2 py-1 rounded'>
                                            <span className='truncate mr-1 text-slate-200'>{obj.label}</span>
                                            <span className='text-amber-400 font-black shrink-0'>{obj.targetValue}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Botón de postulación / estado según reglas de mercado */}
                                {isMyCurrentTeam ? (
                                  <div className='w-full bg-emerald-950/60 text-emerald-300 py-3 rounded-xl text-[9px] font-black uppercase italic tracking-widest flex items-center justify-center gap-2 border border-emerald-500/40'>
                                    <Check size={12} /> Tu Club Actual
                                  </div>
                                ) : alreadyTransferredOrSigned ? (
                                  <button
                                    disabled
                                    className='w-full bg-slate-900/60 text-slate-500 py-3 rounded-xl text-[9px] font-black uppercase italic tracking-widest flex items-center justify-center gap-1.5 border border-white/5 cursor-not-allowed opacity-40'
                                  >
                                    <Lock size={12} /> Contrato Firmado (Sin Postulaciones Disponibles)
                                  </button>
                                ) : isThisApplied ? (
                                  <div className='w-full bg-sky-950/60 text-sky-300 py-3 rounded-xl text-[9px] font-black uppercase italic tracking-widest flex items-center justify-center gap-2 border border-sky-500/40'>
                                    <span className='w-2 h-2 rounded-full bg-sky-400 animate-ping' />
                                    Candidatura en Revisión ({career.activeApplication.weeksRemaining} sem)
                                  </div>
                                ) : isLocked ? (
                                  <button
                                    disabled
                                    className='w-full bg-slate-900/60 text-slate-500 py-3 rounded-xl text-[9px] font-black uppercase italic tracking-widest flex items-center justify-center gap-1.5 border border-white/5 cursor-not-allowed opacity-40'
                                  >
                                    <Lock size={12} /> Postulación Bloqueada (1 Activa en Curso)
                                  </button>
                                ) : isMarketClosed ? (
                                  <button
                                    disabled
                                    className='w-full bg-slate-900/60 text-slate-500 py-3 rounded-xl text-[9px] font-black uppercase italic tracking-widest flex items-center justify-center gap-1.5 border border-white/5 cursor-not-allowed opacity-40'
                                  >
                                    <Lock size={12} /> Mercado Cerrado (Apertura en Semanas de Verano e Invierno)
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleApplyToJob(v)}
                                    className='w-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white py-3 rounded-xl text-[9px] font-black uppercase italic tracking-widest active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-sky-600/20'
                                  >
                                    <Briefcase size={13} /> Postularse al Club (Evaluación 2 Semanas)
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className='text-center py-8 bg-black/20 rounded-2xl border border-white/5'>
                          <Briefcase size={28} className='text-slate-600 mx-auto mb-2' />
                          <p className='text-[10px] font-bold text-slate-300'>No hay vacantes abiertas afines a tu jerarquía en este momento.</p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </Panel>
            </div>
          )}

          {/* BUZÓN Y PROPUESTAS DE CONTRATO */}
          {tab === 'market' && (
            <>
              {/* BUZÓN DE PROPUESTAS FORMALES */}
              <Panel className='p-5 space-y-4'>
                <div className='flex items-center justify-between gap-2 flex-wrap'>
                  <div>
                    <p className='text-[9px] font-black uppercase tracking-widest text-amber-400'>Buzón del Técnico</p>
                    <h3 className='text-base font-black uppercase italic text-white mt-0.5'>Propuestas de Contrato</h3>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[8.5px] font-bold'>
                      <Clock size={11} className='text-amber-400' />
                      <span>Caducidad a 2 semanas</span>
                    </div>
                    <div className='w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center'>
                      <Sparkles size={20} />
                    </div>
                  </div>
                </div>

                {(() => {
                  const activeOffers = (career.offers || []).filter(o => o.weeksRemaining === undefined || o.weeksRemaining === null || o.weeksRemaining > 0);
                  return activeOffers.length > 0 ? (
                    <div className='space-y-3 mt-3'>
                      {activeOffers.map(o => {
                        const weeksLeft = o.weeksRemaining !== undefined && o.weeksRemaining !== null ? o.weeksRemaining : 2;
                        return (
                          <div key={o.id} className='bg-gradient-to-br from-black/40 to-slate-900/60 rounded-2xl p-4 border border-white/10 space-y-3'>
                            <div className='flex items-center justify-between gap-3'>
                              <div className='flex items-center gap-3'>
                                <Shield color1={o.color1} color2={o.color2} initial={o.teamName} size='md' isFlag={o.isFlag} />
                                <div>
                                  <h4 className='text-xs font-black uppercase italic text-white'>{o.teamName}</h4>
                                  <p className='text-[9px] font-bold uppercase text-slate-400'>
                                    {o.compName} · {o.div === 2 ? '2ª División' : '1ª División'} · Tier {o.tier}
                                  </p>
                                </div>
                              </div>
                              <div className='text-right space-y-1'>
                                <span className='text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-white/10'>
                                  {o.profile}
                                </span>
                                <div>
                                  {weeksLeft > 1 ? (
                                    <span className='text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1'>
                                      <Clock size={10} className='text-emerald-400' />
                                      Expira en {weeksLeft} sem.
                                    </span>
                                  ) : (
                                    <span className='text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1 animate-pulse'>
                                      <AlertTriangle size={10} className='text-amber-400' />
                                      ¡Última semana!
                                    </span>
                                  )}
                                </div>
                                {o.position && (
                                  <p className='text-[8px] font-bold text-slate-400 mt-0.5'>
                                    Posición: {o.position}º ({o.pts} pts)
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Insignia de estado competitivo & Objetivo */}
                            <div className='bg-black/30 rounded-xl p-2.5 border border-white/5 space-y-1.5'>
                              {o.standingStatus && (
                                <div className='flex items-center justify-between text-[8px] font-black uppercase'>
                                  <span className='text-slate-400'>Estado:</span>
                                  <span className='text-amber-300'>{o.standingStatus}</span>
                                </div>
                              )}
                              {o.requiredObjective && (
                                <div className='flex items-center justify-between text-[8px] font-bold'>
                                  <span className='text-slate-400 uppercase'>Exigencia:</span>
                                  <span className='text-slate-200'>{o.requiredObjective}</span>
                                </div>
                              )}

                              {/* Lista de objetivos de temporada exigidos por el club oferente */}
                              {o.contractObjectives?.length > 0 && (
                                <div className='mt-2 space-y-1 bg-black/40 rounded-xl p-2 border border-white/5'>
                                  <p className='text-[7px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1'>
                                    <Target size={10} /> Objetivos del Proyecto Deportivo:
                                  </p>
                                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-1'>
                                    {o.contractObjectives.map((obj, oi) => (
                                      <div key={oi} className='text-[8px] font-bold text-slate-300 flex items-center justify-between bg-slate-900/80 px-2 py-1 rounded border border-white/5'>
                                        <span className='truncate mr-1 text-slate-200'>{obj.label}</span>
                                        <span className='text-amber-400 font-black shrink-0'>{obj.targetValue}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <p className='text-[9px] font-bold text-slate-300 leading-snug italic'>
                              "{o.reason}"
                            </p>

                            <div className='flex items-center gap-2 pt-1'>
                              <button
                                onClick={() => {
                                  if (onAcceptOffer) {
                                    onAcceptOffer(o);
                                  } else {
                                    setPendingSigningOffer(o);
                                  }
                                }}
                                className='flex-grow bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 py-2.5 rounded-xl text-[9px] font-black uppercase italic tracking-widest active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md'
                              >
                                <FileSignature size={13} /> Firmar Contrato ({CONTRACT_SEASONS} Temporadas)
                              </button>
                              {onRejectOffer && (
                                <button
                                  onClick={() => onRejectOffer(o.id)}
                                  className='px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-white/10 text-[9px] font-black uppercase active:scale-95 transition-all'
                                >
                                  Rechazar
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className='text-center py-6 bg-black/20 rounded-2xl border border-white/5'>
                      <Sparkles size={24} className='text-slate-600 mx-auto mb-2' />
                      <p className='text-[10px] font-bold text-slate-300'>El buzón está vacío en este momento.</p>
                      <p className='text-[8px] font-bold text-slate-500 mt-0.5'>Las ofertas recibidas permanecen 2 semanas oficiales antes de expirar si no se firman.</p>
                    </div>
                  );
                })()}
              </Panel>

              {/* CARTAS DE RESOLUCIÓN DE CANDIDATURAS RECIENTES */}
              {career.applicationHistory?.length > 0 && (
                <Panel className='p-5 space-y-3'>
                  <p className='text-[9px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-2'>
                    <Mail size={13} /> Resoluciones de Candidatura
                  </p>
                  <div className='space-y-2.5'>
                    {career.applicationHistory.map(res => (
                      <div
                        key={res.id}
                        className={`rounded-2xl p-3.5 border space-y-1.5 ${
                          res.accepted
                            ? 'bg-emerald-950/30 border-emerald-500/30'
                            : 'bg-red-950/20 border-red-500/20'
                        }`}
                      >
                        <div className='flex items-center justify-between'>
                          <h4 className={`text-[10px] font-black uppercase italic ${res.accepted ? 'text-emerald-300' : 'text-red-300'}`}>
                            {res.teamName} ({res.compName})
                          </h4>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                            res.accepted ? 'bg-emerald-900/50 text-emerald-200' : 'bg-red-900/50 text-red-200'
                          }`}>
                            {res.accepted ? 'Aceptada' : 'No Seleccionado'}
                          </span>
                        </div>
                        <p className='text-[9px] font-bold text-slate-300 leading-relaxed'>
                          {res.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </Panel>
              )}

              {/* DIAGNÓSTICO DE CANDIDATURAS NO FRUCTÍFERAS / RECHAZOS */}
              <Panel className='p-5 space-y-3'>
                <p className='text-[9px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-2'>
                  <AlertTriangle size={13} /> Diagnóstico de Candidaturas No Fructíferas
                </p>
                <div className='bg-red-950/20 border border-red-500/20 rounded-2xl p-3.5 space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Lock size={14} className='text-red-400 shrink-0' />
                    <h4 className='text-[10px] font-black uppercase italic text-red-300'>
                      {rejectionDiagnostic.title}
                    </h4>
                  </div>
                  <p className='text-[10px] font-bold text-slate-300 leading-relaxed'>
                    {rejectionDiagnostic.message}
                  </p>
                </div>
              </Panel>

              {/* TRAYECTORIA */}
              <Panel className='p-5'>
                <p className='text-[9px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-2'><History size={12} /> Trayectoria de Clubes</p>
                {spells.length ? (
                  <div className='space-y-2 mt-3'>
                    {spells.map((s, i) => (
                      <div key={i} className='bg-black/25 rounded-xl px-3 py-2'>
                        <p className='text-[10px] font-black uppercase italic text-white'>
                          {s.from === s.to ? `T${s.from}` : `T${s.from}–T${s.to}`} · {s.teamName}
                        </p>
                        <p className='text-[9px] font-bold text-slate-300'>
                          {s.compName || '—'} · {s.seasons} temporada{s.seasons === 1 ? '' : 's'} · mejor {s.bestPosition}º
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-[10px] font-bold text-slate-300 mt-2'>Tu primera etapa aún está en marcha.</p>
                )}
              </Panel>
            </>
          )}

          {/* HISTORIAL DE LEYENDA INTEGRADO */}
          {tab === 'legend' && (
            <CareerLegendProfile
              career={career}
              team={team}
              ui={ui}
              isModal={false}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* MODAL DE HISTORIAL DE LEYENDA (POPUP DESDE CABECERA) */}
      <AnimatePresence>
        {showLegendModal && (
          <CareerLegendProfile
            career={career}
            team={team}
            onClose={() => setShowLegendModal(false)}
            ui={ui}
            isModal={true}
          />
        )}
      </AnimatePresence>

      {/* MODAL DE LIGA TERMINADA */}
      <EndSeasonModal
        isOpen={showEndSeasonModal}
        onClose={() => setShowEndSeasonModal(false)}
        onGoToInbox={() => setTab('market')}
        onOpenReview={onOpenReview}
        onOpenChampions={() => {
          setShowEndSeasonModal(false);
          if (onOpenChampions) onOpenChampions();
          setTab('cl');
        }}
        onNewSeason={onNewSeason}
        championsFinished={championsFinished}
        allLeaguesFinished={allLeaguesFinished}
        team={team}
        position={position}
        totalTeams={standings?.length || 20}
        objectivesMet={coreMet}
        objectivesTotal={coreObjectives.length}
        season={season}
        isChampion={position === 1}
        isPromoted={career.div === 2 && position <= 3}
        offersCount={career.offers?.length || 0}
        ui={ui}
      />

      {/* CONFIRMACIÓN DE FIRMA DESDE BUZÓN */}
      <AnimatePresence>
        {pendingSigningOffer && (
          <ConfirmSignModal
            title='¿Firmar nuevo contrato?'
            teamName={pendingSigningOffer.teamName}
            detail={`${pendingSigningOffer.compName} · ${pendingSigningOffer.div === 2 ? '2ª' : '1ª'} División · Tier ${pendingSigningOffer.tier}`}
            contractObjectives={pendingSigningOffer.contractObjectives || []}
            note={(() => {
              const bonus = signingRepBonus({ fromTier: career.tier || 1, toTier: pendingSigningOffer.tier || 1 });
              const baseNote = `Firmarás ${CONTRACT_SEASONS} temporadas y dejarás ${team?.name}. Tu reputación viaja contigo; los PE del club actual no.`;
              return bonus > 0 ? `${baseNote} Plus por dar el salto: +${bonus} de reputación.` : baseNote;
            })()}
            onCancel={() => setPendingSigningOffer(null)}
            onConfirm={() => {
              const o = pendingSigningOffer;
              setPendingSigningOffer(null);
              onAcceptOffer && onAcceptOffer(o);
            }}
          />
        )}
      </AnimatePresence>

      {/* MODAL DE ALERTA EMERGENTE DE RESOLUCIÓN DE CANDIDATURA */}
      <ApplicationResolutionModal
        isOpen={!!career.pendingAppResolutionModal}
        resolution={career.pendingAppResolutionModal}
        career={career}
        onAccept={(offer) => {
          if (onAcceptOffer) {
            onAcceptOffer(offer);
          }
        }}
        onReject={() => {
          if (onRejectAppResolution) {
            onRejectAppResolution();
          } else if (onDismissAppResolutionModal) {
            onDismissAppResolutionModal();
          }
        }}
        onDecideLater={(offer) => {
          if (onDecideLaterAppOffer) {
            onDecideLaterAppOffer(offer);
          } else if (onDismissAppResolutionModal) {
            onDismissAppResolutionModal();
          }
          setToastMessage(`Propuesta de ${offer.teamName} guardada en tu buzón (vigencia: 2 semanas).`);
        }}
        onDismiss={() => {
          if (onDismissAppResolutionModal) {
            onDismissAppResolutionModal();
          }
        }}
        ui={ui}
      />

      {/* MODAL DE CONFIRMACIÓN DE ENVÍO DE CANDIDATURA */}
      <AnimatePresence>
        {submissionModal && (
          <div className='fixed inset-0 z-[80] bg-black/85 backdrop-blur-md flex items-center justify-center p-4'>
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className='w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-[2.25rem] border border-sky-500/40 p-6 text-center shadow-2xl space-y-4'
            >
              <div className='w-14 h-14 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center mx-auto shadow-lg'>
                <Briefcase size={28} />
              </div>
              <div>
                <span className='px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[8px] font-black uppercase tracking-wider'>
                  Candidatura Registrada
                </span>
                <h3 className='text-base font-black uppercase italic text-white mt-2'>
                  {submissionModal.teamName}
                </h3>
                <p className='text-[9px] font-bold text-slate-300 mt-0.5 uppercase'>
                  {submissionModal.compName} · Tier {submissionModal.tier}
                </p>
              </div>

              <div className='bg-black/40 rounded-2xl p-3.5 border border-white/5 space-y-2 text-left'>
                <div className='flex items-center gap-2 text-sky-300 text-[9px] font-black uppercase'>
                  <Clock size={13} /> Proceso de Evaluación: 2 Semanas
                </div>
                <p className='text-[9px] font-bold text-slate-300 leading-relaxed'>
                  La junta directiva de <strong>{submissionModal.teamName}</strong> evaluará tu trayectoria y rendimiento durante las próximas <strong>2 semanas de juego</strong>.
                </p>
                <p className='text-[8.5px] font-bold text-slate-400 leading-snug'>
                  Recibirás una alerta emergente formal en pantalla con la resolución de la directiva y opciones para aceptar, rechazar o decidir más tarde.
                </p>
              </div>

              <button
                onClick={() => setSubmissionModal(null)}
                className='w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white py-3 rounded-2xl text-[10px] font-black uppercase italic tracking-widest active:scale-95 transition-all shadow-lg shadow-sky-500/25'
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODALES DE ENTRENAMIENTO */}
      <TrainingModal
        isOpen={showTrainingModal}
        onClose={() => setShowTrainingModal(false)}
        team={team}
        career={career}
        maxLeagueStrength={maxLeagueStrength}
        onApplyStats={onApplyTrainingStats || onSpendPE}
        ui={ui}
      />

      <TrainingDrillModal
        isOpen={showDrillModal}
        onClose={() => setShowDrillModal(false)}
        career={career}
        team={team}
        onApplyDrillResult={onApplyDrillResult}
        ui={ui}
      />
    </div>
  );
};

/* ========================== BALANCE DE TEMPORADA ========================== */
export const CareerSeasonReviewModal = ({ review, onAcceptOffer, onRenew, onStay, ui }) => {
  const { Shield } = ui;
  const [pendingOffer, setPendingOffer] = useState(null);
  const [confirmRenew, setConfirmRenew] = useState(false);
  if (!review) return null;

  const marketTitle = review.fired
    ? 'Nuevos proyectos para tu perfil'
    : review.contractEnd
      ? 'Fin de contrato: renovar o cambiar de aires'
      : 'Mercado de entrenadores';

  return (
    <div className='fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4'>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className='w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 rounded-[2rem] border border-amber-500/30 overflow-hidden max-h-[88vh] overflow-y-auto custom-scrollbar relative'>
        {/* CABECERA CON BOTONES DE RETORNO / ATRÁS */}
        <div className='px-6 py-5 bg-gradient-to-r from-amber-900/50 to-transparent border-b border-white/10 relative'>
          <div className='flex items-center justify-between gap-2 mb-2'>
            <button
              onClick={onStay}
              className='p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white active:scale-95 transition-all border border-white/10 flex items-center gap-1 text-[9px] font-black uppercase tracking-wider'
              title='Volver a la vista del club sin perder nada'
            >
              <ChevronLeft size={14} /> Atrás
            </button>
            <button
              onClick={onStay}
              className='p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white active:scale-95 transition-all border border-white/10'
              title='Cerrar balance'
            >
              <X size={15} />
            </button>
          </div>

          <p className='text-[9px] font-black uppercase tracking-widest text-amber-400'>Balance de temporada {review.season}</p>
          <h3 className='text-lg font-black uppercase italic text-white'>{review.teamName} — {review.position}º</h3>
          <p className='text-[9px] font-bold uppercase text-slate-300 mt-1'>{review.performance} · esperado {review.expected}º</p>
        </div>
        <div className='p-6 space-y-4'>
          <div className='flex gap-2'>
            <Stat label='Reputación' value={review.repAfter} hint={`${review.repDelta > 0 ? '+' : ''}${review.repDelta}`} accent='amber' />
            <Stat
              label='PE ganados'
              value={`+${review.peGain}`}
              hint={review.peRoom === 0 ? 'Sin margen de mejora' : review.peGain === 0 ? 'Club al máximo' : 'Del club'}
            />
          </div>
          <div className='bg-black/40 rounded-2xl px-4 py-3 border border-white/5'>
            <p className='text-[9px] font-black uppercase tracking-widest text-slate-400'>Veredicto</p>
            <p className='text-[11px] font-bold text-white mt-1'>{review.note}</p>
            {typeof review.objectivesMet === 'number' && (
              <p className={`text-[10px] font-black uppercase italic mt-2 ${review.objectivesMet === 0 ? 'text-red-400' : review.objectivesMet === review.objectivesTotal ? 'text-emerald-400' : 'text-amber-300'}`}>
                Objetivos cumplidos: {review.objectivesMet}/{review.objectivesTotal}
              </p>
            )}
            {review.clResult && <p className='text-[10px] font-black uppercase italic text-blue-300 mt-2'>{review.clResult}</p>}
            {review.clQualified && <p className='text-[10px] font-black uppercase italic text-blue-400 mt-2'>Clasificado a la Champions global</p>}
            {review.promote && <p className='text-[10px] font-black uppercase italic text-emerald-400 mt-2'>Ascenso a Tier {review.newTier}</p>}
            {review.fired && <p className='text-[10px] font-black uppercase italic text-red-400 mt-2 flex items-center gap-1'><AlertTriangle size={12} /> Has sido despedido</p>}
            {review.fired && <p className='text-[10px] font-bold text-slate-300 mt-1'>Pierdes los PE del club y tu nombre se resiente en el mercado.</p>}
            {review.unemployed && <p className='text-[10px] font-black uppercase italic text-red-300 mt-2'>Ningún club te ofrece banquillo: te quedas sin equipo.</p>}
            {!review.fired && review.contractEnd && (
              <p className='text-[10px] font-black uppercase italic text-amber-300 mt-2 flex items-center gap-1'>
                <FileSignature size={12} /> Contrato cumplido ({CONTRACT_SEASONS} temporadas)
              </p>
            )}
          </div>

          {!review.fired && review.contractEnd && (
            <button onClick={() => setConfirmRenew(true)} className='w-full bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest active:scale-95 transition-all'>
              Renovar {CONTRACT_SEASONS} temporadas en {review.teamName}
            </button>
          )}

          {review.offers?.length > 0 && (
            <div>
              <p className='text-[9px] font-black uppercase tracking-widest text-amber-400 mb-2'>{marketTitle}</p>
              <div className='space-y-2'>
                {review.offers.map(o => (
                  <button key={o.id} onClick={() => setPendingOffer(o)} className='w-full flex items-center gap-3 bg-black/40 hover:bg-amber-600/20 rounded-2xl p-3 border border-white/10 text-left active:scale-95 transition-all'>
                    <Shield color1={o.color1} color2={o.color2} initial={o.teamName} size='sm' isFlag={o.isFlag} />
                    <div className='flex-grow min-w-0'>
                      <p className='text-[10px] font-black uppercase italic text-white truncate'>{o.teamName}</p>
                      <p className='text-[8px] font-bold uppercase text-slate-300 truncate'>
                        {o.compName} · {o.div === 2 ? '2ª' : '1ª'} · Tier {o.tier} {o.standingStatus ? `· ${o.standingStatus}` : ''}
                      </p>
                    </div>
                    <Check size={14} className='text-emerald-400 shrink-0' />
                  </button>
                ))}
              </div>
              <p className='text-[8px] font-bold uppercase text-slate-400 tracking-wider mt-2'>Se te pedirá confirmación antes de firmar.</p>
            </div>
          )}

          {/* ACCIONES PRINCIPALES Y BOTÓN ATRÁS GARANTIZADO */}
          <div className='space-y-2 pt-2'>
            {(!review.fired || review.offers?.length === 0) && (
              <button onClick={onStay} className='w-full bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest active:scale-95 transition-all'>
                {review.fired ? 'Buscar otro proyecto desde cero' : review.contractEnd ? 'Decidir más tarde' : 'Continuar en el club'}
              </button>
            )}

            <button
              onClick={onStay}
              className='w-full bg-black/40 hover:bg-black/60 text-slate-400 hover:text-white border border-white/5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5'
            >
              <ChevronLeft size={13} /> Volver a la vista del club / tablas
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {pendingOffer && (
          <ConfirmSignModal
            title='¿Estás seguro?'
            teamName={pendingOffer.teamName}
            detail={`${pendingOffer.compName} · ${pendingOffer.div === 2 ? '2ª' : '1ª'} División · Tier ${pendingOffer.tier}`}
            contractObjectives={pendingOffer.contractObjectives || []}
            note={(() => {
              const bonus = signingRepBonus({ fromTier: review.currentTier || 1, toTier: pendingOffer.tier || 1 });
              const base = `Firmarás ${CONTRACT_SEASONS} temporadas y dejarás ${review.teamName}. Tu reputación viaja contigo; los PE del club actual no.`;
              return bonus > 0 ? `${base} Plus por dar el salto: +${bonus} de reputación.` : base;
            })()}
            onCancel={() => setPendingOffer(null)}
            onConfirm={() => { const o = pendingOffer; setPendingOffer(null); onAcceptOffer(o); }}
          />
        )}
        {confirmRenew && (
          <ConfirmSignModal
            title='¿Renovar contrato?'
            teamName={review.teamName}
            detail={`Nuevo contrato de ${CONTRACT_SEASONS} temporadas`}
            onCancel={() => setConfirmRenew(false)}
            onConfirm={() => { setConfirmRenew(false); onRenew && onRenew(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ============================ PARTIDO DE CARRERA ============================ */
export const CareerMatchView = ({ matchState, rolling, onRoll, onFinish, ui }) => {
  const { Shield, DieIcon, PenaltyDots } = ui;
  if (!matchState) return null;

  const isChampions = matchState.isChampions || matchState.careerChampionsMatch;

  return (
    <div className='flex-grow flex flex-col px-4'>
      <div className='flex justify-between items-center mb-4 py-2'>
        <div className='w-10' />
        <div className='flex flex-col items-center gap-1'>
          <div className={`px-4 py-1 backdrop-blur-md rounded-full text-[9px] font-black uppercase italic animate-pulse shadow-md ${
            isChampions ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-400/40' : 'bg-red-600/80 text-white'
          }`}>
            {isChampions ? '⭐ UEFA Champions League' : 'En Directo'}
          </div>
          <span className='text-[8px] font-black uppercase italic text-slate-300 tracking-wider'>
            {isChampions ? (matchState.championsPhase ? clPhaseLabel(matchState.championsPhase) : 'Noche Europea') : 'Jornada de Liga'}
          </span>
        </div>
        <div className='w-10' />
      </div>

      <div className={`backdrop-blur-md rounded-[2.5rem] p-6 mb-4 border-b-4 relative shadow-xl ${
        isChampions
          ? 'bg-gradient-to-br from-blue-950/60 via-slate-900/60 to-indigo-950/60 border-blue-700/60 shadow-blue-500/10'
          : 'bg-slate-900/40 border-slate-800'
      }`}>
        <div className='flex items-center'>
          <div className='flex-1 flex flex-col items-center text-center'>
            {matchState.phase === 'penalties' && PenaltyDots && <PenaltyDots history={matchState.penalties?.historyH} />}
            <Shield color1={matchState.home?.color1} color2={matchState.home?.color2} initial={matchState.home?.name} size='lg' isFlag={matchState.home?.isFlag} />
            <p className='text-[10px] font-black uppercase italic mt-2 truncate text-white drop-shadow-md w-full'>{matchState.home?.name}</p>
            <p className='text-[8px] font-bold text-slate-300 mt-1 bg-black/40 backdrop-blur-sm inline-block px-2 rounded'>{matchState.home.att + '/' + matchState.home.opp + '/' + matchState.home.def}</p>
          </div>

          <div className='px-4 flex flex-col items-center shrink-0 w-32'>
            <div className='text-5xl font-black italic tracking-tighter flex gap-3 tabular-nums drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] text-white'>
              <span>{matchState.scoreH}</span>
              <span className='text-slate-400'>-</span>
              <span>{matchState.scoreA}</span>
            </div>
            {!matchState.finished && (
              <div className='text-[8px] font-black text-white/70 uppercase italic mt-1 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm'>
                {matchState.oppH} vs {matchState.oppA} TIROS RESTANTES
              </div>
            )}
          </div>

          <div className='flex-1 flex flex-col items-center text-center'>
            {matchState.phase === 'penalties' && PenaltyDots && <PenaltyDots history={matchState.penalties?.historyA} />}
            <Shield color1={matchState.away?.color1} color2={matchState.away?.color2} initial={matchState.away?.name} size='lg' isFlag={matchState.away?.isFlag} />
            <p className='text-[10px] font-black uppercase italic mt-2 truncate text-white drop-shadow-md w-full'>{matchState.away?.name}</p>
            <p className='text-[8px] font-bold text-slate-300 mt-1 bg-black/40 backdrop-blur-sm inline-block px-2 rounded'>{matchState.away.att + '/' + matchState.away.opp + '/' + matchState.away.def}</p>
          </div>
        </div>
      </div>

      <div className='flex-grow bg-[#2e7d32]/60 backdrop-blur-md rounded-[3rem] border-8 border-slate-900/40 relative overflow-hidden flex flex-col items-center justify-center shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] min-h-[220px]'>
        <div className='absolute top-1/2 left-0 w-full h-[2px] bg-white/20 -translate-y-1/2'></div>
        <div className='absolute top-1/2 left-1/2 w-40 h-40 border-[2px] border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2'></div>
        <div className='absolute top-1/2 left-1/2 w-3 h-3 bg-white/20 rounded-full -translate-x-1/2 -translate-y-1/2'></div>

        {!matchState.finished ? (
          <div className='z-10 flex flex-col items-center gap-8'>
            <div className={'transition-all duration-300 transform ' + (rolling ? 'scale-125 rotate-45' : 'scale-100')}>
              <DieIcon value={matchState.lastDie} className='w-24 h-24 text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.8)]' />
            </div>
            <button
              onClick={onRoll}
              disabled={rolling}
              className='bg-white/90 backdrop-blur-sm text-emerald-900 px-10 py-5 rounded-3xl font-black uppercase italic tracking-widest shadow-[0_10px_20px_rgba(0,0,0,0.5)] active:scale-90 transition-transform disabled:opacity-50'
            >
              {rolling ? 'Lanzando...' : 'Lanzar Dado'}
            </button>
          </div>
        ) : (
          <div className='z-10 text-center p-6 bg-black/40 backdrop-blur-md rounded-3xl border border-white/20 max-w-[80%] shadow-2xl'>
            <Trophy size={48} className='text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' />
            <h3 className='text-lg font-black uppercase italic mb-4 text-white drop-shadow-md'>¡Fin del Partido!</h3>
            <button
              onClick={onFinish}
              className='w-full bg-white/90 backdrop-blur-sm text-slate-950 py-4 rounded-2xl font-black uppercase italic tracking-widest active:scale-95 transition-all shadow-md'
            >
              Finalizar
            </button>
          </div>
        )}
      </div>

      <div className='mt-4 bg-slate-900/40 backdrop-blur-md rounded-3xl p-5 h-40 overflow-y-auto border border-white/10 space-y-2 shadow-lg custom-scrollbar'>
        {matchState.logs?.map((log, i) => (
          <div key={i} className={'text-[10px] font-bold italic flex gap-3 ' + (i === 0 ? 'text-white drop-shadow-md' : 'text-slate-300')}>
            <span className='opacity-60 shrink-0'>⚽</span>
            <p>{log}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
