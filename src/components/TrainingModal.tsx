// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Dumbbell, Award, Zap, HeartPulse, Check, RotateCcw,
  Plus, Minus, ShieldCheck, TrendingUp, Sparkles, AlertCircle
} from 'lucide-react';
import { peCostFor, strengthOf, isSquadMaxed, MAX_SQUAD_CAPS } from '../lib/career';

export interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: any;
  career: any;
  maxLeagueStrength?: number;
  onApplyStats: (newStats: { att: number; opp: number; def: number }, peSpent: number) => void;
  ui: {
    Shield: React.ComponentType<any>;
    DieIcon: React.ComponentType<any>;
  };
}

export const TrainingModal: React.FC<TrainingModalProps> = ({
  isOpen,
  onClose,
  team,
  career,
  maxLeagueStrength = 14,
  onApplyStats,
  ui
}) => {
  const { Shield } = ui;
  const tier = career?.tier || 1;
  const currentPE = career?.pe || 0;

  // Estadísticas base del equipo
  const currentAtt = team?.att || 1;
  const currentOpp = team?.opp || 1;
  const currentDef = team?.def || 1;
  const currentStrength = currentAtt + currentOpp + currentDef;

  // Estadísticas en borrador / preparación en el modal
  const [stagedAtt, setStagedAtt] = useState(currentAtt);
  const [stagedOpp, setStagedOpp] = useState(currentOpp);
  const [stagedDef, setStagedDef] = useState(currentDef);

  // Sincronizar al abrir o cambiar de equipo
  useEffect(() => {
    if (isOpen) {
      setStagedAtt(team?.att || 1);
      setStagedOpp(team?.opp || 1);
      setStagedDef(team?.def || 1);
    }
  }, [isOpen, team?.att, team?.opp, team?.def]);

  // Techos máximos respetando 5-5-4
  const caps = MAX_SQUAD_CAPS; // { att: 5, opp: 5, def: 4 }
  const effectiveMaxStrength = Math.max(14, maxLeagueStrength);

  // Calcular costo de PE por cada incremento
  const calculateTotalCost = (fromVal: number, toVal: number) => {
    let cost = 0;
    for (let v = fromVal; v < toVal; v++) {
      cost += peCostFor(v);
    }
    return cost;
  };

  const attCost = calculateTotalCost(currentAtt, stagedAtt);
  const oppCost = calculateTotalCost(currentOpp, stagedOpp);
  const defCost = calculateTotalCost(currentDef, stagedDef);
  const totalCost = attCost + oppCost + defCost;
  const remainingPE = currentPE - totalCost;

  const stagedStrength = stagedAtt + stagedOpp + stagedDef;
  const hasChanges = stagedAtt !== currentAtt || stagedOpp !== currentOpp || stagedDef !== currentDef;
  const canAfford = remainingPE >= 0;
  const maxed = isSquadMaxed(team, tier);

  const handleIncrement = (attr: 'att' | 'opp' | 'def') => {
    if (stagedStrength >= effectiveMaxStrength) return;

    if (attr === 'att' && stagedAtt < caps.att) {
      const nextCost = peCostFor(stagedAtt);
      if (remainingPE >= nextCost) {
        setStagedAtt(prev => prev + 1);
      }
    } else if (attr === 'opp' && stagedOpp < caps.opp) {
      const nextCost = peCostFor(stagedOpp);
      if (remainingPE >= nextCost) {
        setStagedOpp(prev => prev + 1);
      }
    } else if (attr === 'def' && stagedDef < caps.def) {
      const nextCost = peCostFor(stagedDef);
      if (remainingPE >= nextCost) {
        setStagedDef(prev => prev + 1);
      }
    }
  };

  const handleDecrement = (attr: 'att' | 'opp' | 'def') => {
    if (attr === 'att' && stagedAtt > currentAtt) setStagedAtt(prev => prev - 1);
    if (attr === 'opp' && stagedOpp > currentOpp) setStagedOpp(prev => prev - 1);
    if (attr === 'def' && stagedDef > currentDef) setStagedDef(prev => prev - 1);
  };

  const handleReset = () => {
    setStagedAtt(currentAtt);
    setStagedOpp(currentOpp);
    setStagedDef(currentDef);
  };

  const handleApply = () => {
    if (!hasChanges || !canAfford) return;
    onApplyStats({ att: stagedAtt, opp: stagedOpp, def: stagedDef }, totalCost);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-lg bg-slate-900/95 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Barra superior de acento */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-amber-400 to-blue-500 shrink-0" />

          {/* CABECERA: Logo del equipo con Tier correspondiente */}
          <div className="p-5 sm:p-6 pb-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-slate-950/40">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="shrink-0 p-1 rounded-2xl bg-black/40 border border-white/10 shadow-inner">
                <Shield
                  color1={team?.color1}
                  color2={team?.color2}
                  initial={team?.name}
                  size="md"
                  isFlag={team?.isFlag}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Award size={11} className="text-amber-400" /> Tier {tier} · {career?.div === 2 ? '2ª División' : '1ª División'}
                  </span>
                  {career?.medicalImmunityWeeks > 0 && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <HeartPulse size={10} /> Inmunidad {career.medicalImmunityWeeks} sem.
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-black uppercase italic text-white tracking-tight truncate mt-1">
                  Centro de Entrenamiento
                </h2>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 truncate">
                  {team?.name} · Gestión y Evolución de Atributos
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 active:scale-95 transition-all shrink-0 ml-2"
            >
              <X size={18} />
            </button>
          </div>

          {/* CUERPO DEL MODAL */}
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-grow">
            
            {/* PANEL DE MÉTRICAS: PUNTOS DE FUERZA Y PE DISPONIBLES */}
            <div className="grid grid-cols-2 gap-3">
              {/* Puntos de Fuerza Actuales y Totales */}
              <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                    <Dumbbell size={12} className="text-blue-400" /> Puntos de Fuerza
                  </span>
                  <span className="text-[8px] font-bold text-slate-400">
                    Techo Liga: <strong className="text-white">{effectiveMaxStrength}</strong>
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black italic text-white tabular-nums">
                    {stagedStrength}
                  </span>
                  {stagedStrength > currentStrength && (
                    <span className="text-xs font-black text-emerald-400 italic">
                      (+{stagedStrength - currentStrength})
                    </span>
                  )}
                  <span className="text-[9px] font-bold text-slate-400 ml-auto">
                    {stagedAtt}-{stagedOpp}-{stagedDef}
                  </span>
                </div>
                <p className="text-[8px] font-bold text-slate-400 mt-1">
                  Total distribuible: <strong className="text-slate-200">{stagedAtt} + {stagedOpp} + {stagedDef} = {stagedStrength} pts</strong>
                </p>
                {/* Barra de progreso visual hacia el techo de fuerza */}
                <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden mt-2 p-0.5 border border-white/5">
                  <div
                    className="bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (stagedStrength / effectiveMaxStrength) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Banco de Puntos de Evolución (PE) */}
              <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                    <Zap size={12} className="text-amber-400" /> Banco de PE
                  </span>
                  {totalCost > 0 && (
                    <span className="text-[9px] font-black text-amber-400 tabular-nums">
                      -{totalCost} PE
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span
                    className={`text-3xl font-black italic tabular-nums ${
                      remainingPE < 0 ? 'text-red-400' : remainingPE === 0 && totalCost > 0 ? 'text-amber-300' : 'text-emerald-400'
                    }`}
                  >
                    {remainingPE}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    / {currentPE} PE
                  </span>
                </div>
                <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                  Aplica tus PE cuando desees
                </p>
                <div className="mt-2 text-[8px] font-bold text-slate-400 flex items-center gap-1">
                  <Sparkles size={10} className="text-amber-300" /> Sin tope de acumulación
                </div>
              </div>
            </div>

            {/* TABLA DE CONTROLES: BOTONES DE SUBIR Y BAJAR (+) Y (-) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">
                  Ajuste de Estadísticas (Máximo 5-5-4)
                </span>
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                  Costos PE: 1→2 (15) · 2→3 (35) · 3→4 (70) · 4→5 (70)
                </span>
              </div>

              {[
                { key: 'att', label: 'Ataque (ATT)', val: stagedAtt, cur: currentAtt, cap: caps.att, badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30' },
                { key: 'opp', label: 'Ocasiones (OPP)', val: stagedOpp, cur: currentOpp, cap: caps.opp, badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
                { key: 'def', label: 'Defensa (DEF)', val: stagedDef, cur: currentDef, cap: caps.def, badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }
              ].map(stat => {
                const isCapped = stat.val >= stat.cap;
                const nextCost = !isCapped ? peCostFor(stat.val) : 0;
                const canAdd = !isCapped && remainingPE >= nextCost && stagedStrength < effectiveMaxStrength;
                const canSub = stat.val > stat.cur;

                return (
                  <div
                    key={stat.key}
                    className={`bg-slate-950/60 rounded-2xl p-4 border transition-all ${
                      stat.val > stat.cur
                        ? 'border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                        : 'border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {/* Información de la estadística */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase italic text-white">
                            {stat.label}
                          </span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${stat.badgeColor}`}>
                            Máx {stat.cap}
                          </span>
                          {stat.val > stat.cur && (
                            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              +{stat.val - stat.cur}
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 mt-1">
                          {isCapped ? (
                            <span className="text-amber-400 font-black">Límite alcanzado (Máx: {stat.cap})</span>
                          ) : (
                            <span>
                              Subir a {stat.val + 1}: <strong className="text-emerald-300">+{nextCost} PE</strong>
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Botones de Subir y Bajar (+ y -) */}
                      <div className="flex items-center gap-2.5">
                        {/* Botón Bajar (-) */}
                        <button
                          type="button"
                          onClick={() => handleDecrement(stat.key as any)}
                          disabled={!canSub}
                          className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-20 disabled:pointer-events-none text-slate-200 border border-white/10 flex items-center justify-center active:scale-95 transition-all shadow"
                          title="Bajar atributo"
                        >
                          <Minus size={15} />
                        </button>

                        {/* Valor Actual y Máximo */}
                        <div className="w-12 text-center">
                          <span
                            className={`text-2xl font-black italic tabular-nums ${
                              stat.val > stat.cur ? 'text-emerald-400' : 'text-white'
                            }`}
                          >
                            {stat.val}
                          </span>
                          <span className="text-[9px] font-bold text-slate-500 block -mt-1">
                            /{stat.cap}
                          </span>
                        </div>

                        {/* Botón Subir (+) */}
                        <button
                          type="button"
                          onClick={() => handleIncrement(stat.key as any)}
                          disabled={!canAdd}
                          className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-20 disabled:pointer-events-none text-white border border-emerald-400/30 flex items-center justify-center active:scale-95 transition-all shadow-md"
                          title="Subir atributo con PE"
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resumen de cambios en preparación */}
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center justify-between"
              >
                <div>
                  <p className="text-[10px] font-black uppercase italic text-emerald-300">
                    Cambios listos para aplicar:
                  </p>
                  <p className="text-[9px] font-bold text-slate-300 mt-0.5">
                    {stagedAtt}/{stagedOpp}/{stagedDef} (Fuerza {stagedStrength}) · Inversión: <strong className="text-amber-300">{totalCost} PE</strong>
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 active:scale-95"
                >
                  <RotateCcw size={11} /> Descartar
                </button>
              </motion.div>
            )}
          </div>

          {/* PIE DEL MODAL: APLICAR CAMBIOS */}
          <div className="p-4 sm:p-5 border-t border-white/10 bg-slate-950/70 shrink-0 flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-white/10 text-[10px] font-black uppercase italic tracking-widest active:scale-95 transition-all"
            >
              Cerrar
            </button>
            <button
              onClick={handleApply}
              disabled={!hasChanges || !canAfford}
              className="flex-[2] py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 font-black text-[10px] uppercase italic tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              <Check size={16} /> Aplicar Entrenamiento {totalCost > 0 ? `(${totalCost} PE)` : ''}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TrainingModal;
