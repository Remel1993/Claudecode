// @ts-nocheck
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, HeartPulse, ShieldCheck, Stethoscope, Coins,
  Zap, UserX, Check, ArrowRight, ShieldAlert, Sparkles, Dices
} from 'lucide-react';

export interface SimulationInjuryAlertModalProps {
  isOpen: boolean;
  affectedAttr: 'att' | 'opp' | 'def';
  attrLabel: string;
  die?: number;
  career: any;
  team: any;
  onSelectOption: (option: 'accept_injury' | 'physio_elite') => void;
  onCancel?: () => void;
  ui: {
    DieIcon: React.ComponentType<any>;
    Shield: React.ComponentType<any>;
  };
}

export const SimulationInjuryAlertModal: React.FC<SimulationInjuryAlertModalProps> = ({
  isOpen,
  affectedAttr,
  attrLabel,
  die = 6,
  career,
  team,
  onSelectOption,
  onCancel,
  ui
}) => {
  const { DieIcon, Shield } = ui;
  if (!isOpen) return null;

  const currentPE = career?.pe || 0;
  const isDiv2 = career?.div === 2;
  const isChampionsOrElite = (career?.tier >= 5) || (career?.inChampions);
  const physioCost = isDiv2 ? 12 : isChampionsOrElite ? 30 : 20;
  const categoryLabel = isDiv2
    ? 'Segunda División'
    : isChampionsOrElite
    ? 'Champions League / Élite'
    : 'Primera División';
  const canAffordPhysio = currentPE >= physioCost;

  return (
    <div className='fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4'>
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        className='w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-[2.5rem] border border-red-500/40 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col'
      >
        {/* CABECERA DE ALERTA MÉDICA */}
        <div className='px-6 py-5 bg-gradient-to-r from-red-950/80 via-red-900/50 to-slate-900 border-b border-red-500/30 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-11 h-11 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center shrink-0 shadow-lg animate-pulse'>
              <AlertTriangle size={22} />
            </div>
            <div>
              <span className='text-[9px] font-black uppercase tracking-widest text-red-400 flex items-center gap-1.5'>
                <HeartPulse size={12} /> Alerta Médica Previa a Simular
              </span>
              <h3 className='text-base font-black uppercase italic text-white leading-tight mt-0.5'>
                Sobrecarga en el Entrenamiento
              </h3>
            </div>
          </div>
        </div>

        {/* CONTENIDO DEL MODAL */}
        <div className='p-6 space-y-4 overflow-y-auto custom-scrollbar'>
          {/* TARJETA DE INCIDENCIA */}
          <div className='bg-red-950/30 border border-red-500/30 rounded-2xl p-4 space-y-3'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-red-900/40 border border-red-500/40 rounded-xl text-red-400 shrink-0 shadow'>
                <DieIcon value={die} className='w-7 h-7' />
              </div>
              <div className='flex-grow min-w-0'>
                <div className='flex items-center justify-between gap-1'>
                  <span className='text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40'>
                    Dado: Cara {die}
                  </span>
                  <span className='text-[8px] font-bold text-slate-400'>
                    Inmunidad: 0 sem.
                  </span>
                </div>
                <p className='text-xs font-black uppercase italic text-white mt-1'>
                  Baja por lesión en <span className='text-red-400'>{attrLabel}</span>
                </p>
              </div>
            </div>

            <p className='text-[10px] font-bold text-slate-300 leading-relaxed border-t border-red-500/20 pt-2.5'>
              Al preparar la jornada para la simulación, se lanzó el dado semanal y el resultado fue <strong className='text-white'>Cara 6</strong>. Un jugador clave ha sufrido una sobrecarga muscular que compromete el partido inmediato.
            </p>
          </div>

          {/* BALANCE DE PE ACTUAL */}
          <div className='bg-black/40 rounded-2xl px-4 py-2.5 border border-white/5 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Coins size={14} className='text-amber-400' />
              <span className='text-[9px] font-black uppercase tracking-wider text-slate-300'>P/E Disponibles del Club:</span>
            </div>
            <span className='text-xs font-black italic text-emerald-400 tabular-nums'>
              {currentPE} P/E
            </span>
          </div>

          <p className='text-[9px] font-black uppercase tracking-widest text-slate-400 pt-1'>
            Selecciona cómo deseas afrontar la jornada:
          </p>

          {/* OPCIÓN A: ACEPTAR LA BAJA (GRATIS) */}
          <button
            onClick={() => onSelectOption('accept_injury')}
            className='w-full text-left bg-gradient-to-br from-slate-900 to-slate-950 hover:from-slate-800 hover:to-slate-900 border border-white/10 hover:border-amber-500/50 rounded-2xl p-4 transition-all active:scale-[0.98] shadow-lg group space-y-2'
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2.5'>
                <div className='w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0'>
                  <UserX size={16} />
                </div>
                <div>
                  <span className='text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-block'>
                    Opción A · Gratis (0 P/E)
                  </span>
                  <h4 className='text-xs font-black uppercase italic text-white group-hover:text-amber-300 transition-colors mt-0.5'>
                    Aceptar la Baja Médica
                  </h4>
                </div>
              </div>
              <span className='text-xs font-black italic text-slate-300'>0 PE</span>
            </div>

            <ul className='text-[9px] font-bold text-slate-300 space-y-1 pl-1 border-t border-white/5 pt-2'>
              <li className='flex items-center gap-1.5 text-red-300'>
                <span className='w-1.5 h-1.5 rounded-full bg-red-400' />
                Disputa la simulación con <strong className='text-white'>-1 en {attrLabel}</strong>.
              </li>
              <li className='flex items-center gap-1.5 text-emerald-300'>
                <span className='w-1.5 h-1.5 rounded-full bg-emerald-400' />
                Activa <strong className='text-white'>Escudo de Inmunidad Médica por 3 semanas</strong>.
              </li>
              <li className='flex items-center gap-1.5 text-sky-300'>
                <span className='w-1.5 h-1.5 rounded-full bg-sky-400' />
                <strong className='text-white'>Alta médica automática</strong> al finalizar el partido simulado.
              </li>
            </ul>
          </button>

          {/* OPCIÓN B: FISIOTERAPIA DE ÉLITE */}
          <button
            onClick={() => {
              if (canAffordPhysio) onSelectOption('physio_elite');
            }}
            disabled={!canAffordPhysio}
            className={`w-full text-left rounded-2xl p-4 transition-all border shadow-xl space-y-2 ${
              canAffordPhysio
                ? 'bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 hover:from-emerald-900/60 hover:to-slate-900 border-emerald-500/40 hover:border-emerald-400 cursor-pointer active:scale-[0.98] group'
                : 'bg-slate-950/60 border-white/5 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2.5'>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                  canAffordPhysio
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-500 border-white/10'
                }`}>
                  <Stethoscope size={16} />
                </div>
                <div>
                  <div className='flex items-center gap-1.5'>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      canAffordPhysio
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-white/10'
                    }`}>
                      Opción B · Fisioterapia de Élite
                    </span>
                    <span className='text-[7px] font-bold uppercase text-slate-400'>
                      ({categoryLabel})
                    </span>
                  </div>
                  <h4 className={`text-xs font-black uppercase italic mt-0.5 ${
                    canAffordPhysio ? 'text-white group-hover:text-emerald-300 transition-colors' : 'text-slate-400'
                  }`}>
                    Cancelar Lesión con Fisioterapia
                  </h4>
                </div>
              </div>
              <span className={`text-xs font-black italic tabular-nums ${
                canAffordPhysio ? 'text-emerald-400' : 'text-slate-500'
              }`}>
                -{physioCost} PE
              </span>
            </div>

            <ul className='text-[9px] font-bold text-slate-300 space-y-1 pl-1 border-t border-white/5 pt-2'>
              <li className='flex items-center gap-1.5 text-emerald-300'>
                <span className='w-1.5 h-1.5 rounded-full bg-emerald-400' />
                <strong className='text-white'>Anula la lesión:</strong> Juegas la simulación al 100% sin ningún déficit.
              </li>
              <li className='flex items-center gap-1.5 text-emerald-300'>
                <span className='w-1.5 h-1.5 rounded-full bg-emerald-400' />
                Activa <strong className='text-white'>Escudo de Inmunidad Médica por 3 semanas</strong>.
              </li>
              {!canAffordPhysio && (
                <li className='text-red-400 font-bold pt-1'>
                  ⚠️ Saldo insuficiente: necesitas {physioCost} PE (tienes {currentPE} PE).
                </li>
              )}
            </ul>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
