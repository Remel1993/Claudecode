import React from 'react';
import { motion } from 'framer-motion';
import {
  Dumbbell, Dices, Zap, AlertTriangle, ShieldCheck, CheckCircle2, X
} from 'lucide-react';

export interface SimulationFeedbackData {
  matchday: number;
  homeName?: string;
  awayName?: string;
  scoreH?: number;
  scoreA?: number;
  myGf?: number;
  myGa?: number;
  result?: 'W' | 'D' | 'L';
  posBefore?: number;
  posAfter?: number;
  repDelta?: number;
  peDelta?: number;
  isHome?: boolean;
  rivalName?: string;
  isChampions?: boolean;
  trainingResult?: {
    simulated: boolean;
    die: number;
    peGained: number;
    injuryOccurred: boolean;
    immunityPrevented: boolean;
    statLost?: string;
    message?: string;
    newImmunityWeeks?: number;
  };
}

interface SimulationFeedbackBannerProps {
  feedback: SimulationFeedbackData | null;
  onDismiss?: () => void;
}

export const SimulationFeedbackBanner: React.FC<SimulationFeedbackBannerProps> = ({
  feedback,
  onDismiss
}) => {
  if (!feedback || !feedback.trainingResult) return null;

  const train = feedback.trainingResult;
  const isSuccess = train.peGained > 0;
  const isInjury = train.injuryOccurred && !train.immunityPrevented;
  const isProtected = train.immunityPrevented;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`w-full rounded-3xl border p-3.5 shadow-xl mb-4 relative overflow-hidden backdrop-blur-md transition-all ${
        isSuccess
          ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-emerald-950/80 border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
          : isInjury
          ? 'bg-gradient-to-r from-red-950/80 via-slate-900/90 to-red-950/80 border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.15)]'
          : isProtected
          ? 'bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-indigo-950/80 border-blue-500/40'
          : 'bg-gradient-to-r from-slate-900/90 via-slate-950/90 to-slate-900/90 border-white/10'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Encabezado del entrenamiento previo */}
        <div className="flex items-center gap-2 min-w-0">
          <div className={`p-1.5 rounded-xl flex items-center justify-center shrink-0 ${
            isSuccess
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : isInjury
              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
              : isProtected
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : 'bg-white/10 text-slate-300 border border-white/10'
          }`}>
            {isSuccess ? (
              <Zap size={14} className="text-amber-400" />
            ) : isInjury ? (
              <AlertTriangle size={14} className="text-red-400" />
            ) : isProtected ? (
              <ShieldCheck size={14} className="text-blue-400" />
            ) : (
              <Dumbbell size={14} className="text-slate-300" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase italic tracking-wider text-white flex items-center gap-1.5 truncate">
              Entrenamiento Previo {train.simulated ? '· Simulado (1D6)' : '· Sesión Voluntaria'}
            </span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">
              Jornada {feedback.matchday}
            </span>
          </div>
        </div>

        {/* Badge de Recompensa / Estado del entrenamiento y botón Ocultar */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="font-black uppercase text-[9px] px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 shadow-inner">
            {isSuccess ? (
              <span className="text-emerald-300 font-black flex items-center gap-1">
                <Zap size={11} className="text-amber-400" /> +{train.peGained} PE
              </span>
            ) : isInjury ? (
              <span className="text-red-400 font-black">-1 {train.statLost || 'Stat'}</span>
            ) : isProtected ? (
              <span className="text-blue-300 font-black flex items-center gap-1">
                <ShieldCheck size={11} /> Protegido
              </span>
            ) : (
              <span className="text-slate-400 font-bold">Sin Incidencias</span>
            )}
          </div>

          {onDismiss && (
            <button
              onClick={onDismiss}
              title="Ocultar informe de entrenamiento"
              className="text-[8px] font-bold uppercase tracking-wider text-slate-400 hover:text-white px-2 py-1 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-white/10 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <X size={11} /> Ocultar
            </button>
          )}
        </div>
      </div>

      {/* Contenido detallado del resultado del entrenamiento */}
      <div className="mt-2.5 bg-black/30 rounded-2xl p-2.5 border border-white/5 flex items-center justify-between gap-3 text-[9px]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded-lg bg-black/50 text-slate-300 border border-white/10 shrink-0 flex items-center justify-center font-black text-[10px] tabular-nums w-6 h-6">
            {train.die || '—'}
          </div>
          <p className="text-slate-200 font-bold leading-tight truncate">
            {train.message || (
              isSuccess
                ? `¡Sesión completada con éxito! Has obtenido +${train.peGained} PE para el club.`
                : isInjury
                ? `¡Sobrecarga muscular! Baja temporal de -1 ${train.statLost || 'Stat'} para el partido. Alta médica disponible tras el encuentro.`
                : isProtected
                ? '¡La Inmunidad Médica activa evitó cualquier percance físico durante la sesión!'
                : 'Sesión de mantenimiento regular sin PE adicionales ni lesiones.'
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SimulationFeedbackBanner;
