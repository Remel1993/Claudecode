// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { roll1D6 } from '../lib/career';
import {
  Dumbbell, Dices, HeartPulse, AlertTriangle, ShieldCheck, Check,
  X, Zap, Sparkles, Award, ArrowRight, ShieldAlert, Activity, RotateCcw,
  UserX, Stethoscope, Coins
} from 'lucide-react';

export interface TrainingDrillModalProps {
  isOpen: boolean;
  onClose: () => void;
  career: any;
  team: any;
  onApplyDrillResult: (result: {
    die: number;
    peGained: number;
    peCost?: number;
    physioPaid?: boolean;
    injuryOccurred: boolean;
    immunityPrevented: boolean;
    affectedAttr?: 'att' | 'opp' | 'def';
    statLost?: boolean;
    newImmunityWeeks?: number;
    message?: string;
  }) => void;
  ui: {
    DieIcon: React.ComponentType<any>;
    Shield: React.ComponentType<any>;
  };
}

export const TrainingDrillModal: React.FC<TrainingDrillModalProps> = ({
  isOpen,
  onClose,
  career,
  team,
  onApplyDrillResult,
  ui
}) => {
  const { DieIcon } = ui;
  const [rolling, setRolling] = useState(false);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [drillOutcome, setDrillOutcome] = useState<any | null>(null);
  const [pendingDecision, setPendingDecision] = useState<any | null>(null);

  const currentPE = career?.pe || 0;
  const immunityWeeks = career?.medicalImmunityWeeks || 0;

  // Cálculo de categoría y costo de Fisioterapia de Élite
  const isDiv2 = career?.div === 2;
  const isChampionsOrElite = (career?.tier >= 5) || (career?.inChampions);
  const physioCost = isDiv2 ? 12 : isChampionsOrElite ? 30 : 20;
  const categoryLabel = isDiv2
    ? 'Segunda División'
    : isChampionsOrElite
    ? 'Champions League / Élite'
    : 'Primera División';
  const canAffordPhysio = currentPE >= physioCost;

  // Resetear siempre el estado cuando se abre el modal en cualquier jornada
  useEffect(() => {
    if (isOpen) {
      setRolling(false);
      setDiceValue(null);
      setDrillOutcome(null);
      setPendingDecision(null);
    }
  }, [isOpen]);

  const handleRollDrill = () => {
    if (rolling) return;
    setRolling(true);
    setDiceValue(1);
    setDrillOutcome(null);
    setPendingDecision(null);

    let rollCount = 0;
    const maxRolls = 14;
    const interval = setInterval(() => {
      setDiceValue(roll1D6());
      rollCount++;
      if (rollCount >= maxRolls) {
        clearInterval(interval);
        const finalVal = roll1D6();
        setDiceValue(finalVal);
        setRolling(false);
        processDrillOutcome(finalVal);
      }
    }, 75);
  };

  const processDrillOutcome = (die: number) => {
    if (die === 1) {
      // Dado 1: +2 PE
      setDrillOutcome({
        die,
        type: 'master',
        title: '¡Sesión Sobresaliente!',
        desc: 'El equipo completó un entrenamiento de máxima intensidad táctica y física.',
        peGained: 2,
        badge: '+2 PE Ganados',
        injuryOccurred: false,
        immunityPrevented: false
      });
    } else if (die === 2) {
      // Dado 2: +1 PE
      setDrillOutcome({
        die,
        type: 'good',
        title: '¡Buen Entrenamiento!',
        desc: 'El grupo respondió con gran compromiso y asimiló las instrucciones tácticas.',
        peGained: 1,
        badge: '+1 PE Ganado',
        injuryOccurred: false,
        immunityPrevented: false
      });
    } else if (die === 3 || die === 4 || die === 5) {
      // Dado 3, 4, 5: Neutro
      setDrillOutcome({
        die,
        type: 'neutral',
        title: 'Sesión Rutinaria (Neutro)',
        desc: 'Entrenamiento estándar completado sin incidencias ni avances de puntos en esta jornada.',
        peGained: 0,
        badge: '0 PE (Sin incidencias)',
        injuryOccurred: false,
        immunityPrevented: false
      });
    } else if (die === 6) {
      // Dado 6: Lesión -> Selección de atributo al azar
      const attrs: Array<'att' | 'opp' | 'def'> = [];
      if ((team?.att || 1) > 1) attrs.push('att');
      if ((team?.opp || 1) > 1) attrs.push('opp');
      if ((team?.def || 1) > 1) attrs.push('def');
      if (attrs.length === 0) attrs.push('att');

      const affected = attrs[Math.floor(Math.random() * attrs.length)];
      const attrNames: Record<string, string> = {
        att: 'Ataque (ATT)',
        opp: 'Ocasiones (OPP)',
        def: 'Defensa (DEF)'
      };

      if (immunityWeeks > 0) {
        // La Inmunidad Médica activa previene la lesión automáticamente
        setDrillOutcome({
          die,
          type: 'immunity',
          title: '🛡️ ¡Inmunidad Médica Activa!',
          desc: `El cuerpo médico del club previno a tiempo una dolencia muscular en ${attrNames[affected]}. ¡No se pierde ningún atributo gracias a la protección médica previa!`,
          peGained: 0,
          immunityPrevented: true,
          injuryOccurred: true,
          badge: `Protegido (${immunityWeeks} sem.)`
        });
      } else {
        // Sin inmunidad: Se abre el Modal de Decisión médica con 2 opciones
        setPendingDecision({
          die,
          affectedAttr: affected,
          attrLabel: attrNames[affected],
          physioCost,
          categoryLabel,
          canAffordPhysio
        });
      }
    }
  };

  const handleSelectDecision = (option: 'accept_injury' | 'physio_elite') => {
    if (!pendingDecision) return;
    const { affectedAttr, attrLabel, physioCost: cost } = pendingDecision;

    if (option === 'accept_injury') {
      setDrillOutcome({
        die: 6,
        type: 'injury_accepted',
        title: 'Baja Médica Aceptada',
        desc: `El equipo jugará el próximo partido con -1 en ${attrLabel}. La plantilla recibirá el alta médica completa de forma automática al término del encuentro y se activa el Escudo de Inmunidad Médica por 3 semanas.`,
        peGained: 0,
        peCost: 0,
        affectedAttr,
        statLost: true,
        physioPaid: false,
        injuryOccurred: true,
        immunityPrevented: false,
        newImmunityWeeks: 3,
        badge: '-1 Stat (1 partido) + Escudo 3 sem.'
      });
    } else {
      // Fisioterapia de Élite
      setDrillOutcome({
        die: 6,
        type: 'physio_treated',
        title: 'Fisioterapia de Élite Aplicada',
        desc: `Tratamiento médico intensivo completado con éxito tras abonar ${cost} P/E (${categoryLabel}). Se anula la baja (juegas al 100% sin déficit) y se activa el Escudo de Inmunidad Médica por 3 semanas.`,
        peGained: 0,
        peCost: cost,
        affectedAttr,
        statLost: false,
        physioPaid: true,
        injuryOccurred: true,
        immunityPrevented: false,
        newImmunityWeeks: 3,
        badge: `Lesión Cancelada (-${cost} PE) + Escudo 3 sem.`
      });
    }
    setPendingDecision(null);
  };

  const handleConfirmResult = () => {
    if (!drillOutcome) return;

    onApplyDrillResult({
      die: drillOutcome.die,
      peGained: drillOutcome.peGained || 0,
      peCost: drillOutcome.peCost || 0,
      physioPaid: !!drillOutcome.physioPaid,
      injuryOccurred: !!drillOutcome.injuryOccurred,
      immunityPrevented: !!drillOutcome.immunityPrevented,
      affectedAttr: drillOutcome.affectedAttr,
      statLost: !!drillOutcome.statLost,
      newImmunityWeeks: drillOutcome.newImmunityWeeks || (drillOutcome.type?.includes('injury') || drillOutcome.type === 'physio_treated' ? 3 : 0),
      message: drillOutcome.desc
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[75] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-slate-900/95 border border-white/10 rounded-[2.25rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] overflow-y-auto custom-scrollbar"
        >
          {/* Barra superior de acento */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-500 shrink-0" />

          {/* Cabecera */}
          <div className="p-5 pb-3 border-b border-white/10 flex items-center justify-between shrink-0 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-md">
                <Dumbbell size={20} />
              </div>
              <div>
                <h3 className="text-base font-black uppercase italic text-white">
                  Entrenamiento Voluntario
                </h3>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Prueba de Intensidad Semanal (1D6)
                </p>
              </div>
            </div>
            {!rolling && !pendingDecision && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 active:scale-95 transition-all"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Cuerpo */}
          <div className="p-5 space-y-4">
            {/* Estado de Inmunidad Médica / Banco de PE */}
            {immunityWeeks > 0 ? (
              <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-2xl p-3 flex items-center gap-3">
                <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
                <div className="text-[9px] text-emerald-200 font-bold leading-tight">
                  <strong className="text-white block font-black uppercase tracking-wider">Escudo de Inmunidad Médica Activo</strong>
                  Protege a la plantilla de lesiones durante {immunityWeeks} semana{immunityWeeks > 1 ? 's' : ''} más.
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-3 flex items-center justify-between text-[9px] text-slate-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <Coins size={13} className="text-amber-400" />
                  Tu Banco de P/E: <strong className="text-emerald-400">{currentPE} P/E</strong>
                </span>
                <span>Frecuencia: <strong className="text-amber-300">1 sesión por jornada</strong></span>
              </div>
            )}

            {/* Escenario de Lanzamiento de Dado */}
            <div className="bg-slate-950/70 border border-white/10 rounded-3xl p-5 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[160px]">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />

              {diceValue === null ? (
                <div className="flex flex-col items-center gap-3 py-1">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                    <Dices size={28} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-300 max-w-xs">
                    Lanza el dado 1D6 para poner a prueba la intensidad de tus jugadores en el entreno.
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 w-full max-w-xs text-[8px] font-bold uppercase mt-1">
                    <span className="bg-emerald-950/60 text-emerald-300 p-1.5 rounded-xl border border-emerald-500/20">Dado 1: +2 PE</span>
                    <span className="bg-teal-950/60 text-teal-300 p-1.5 rounded-xl border border-teal-500/20">Dado 2: +1 PE</span>
                    <span className="bg-slate-800/80 text-slate-300 p-1.5 rounded-xl border border-white/10">3-4-5: Neutro</span>
                  </div>
                  <div className="w-full max-w-xs text-[8px] font-black uppercase text-red-300 bg-red-950/40 p-1.5 rounded-xl border border-red-500/20">
                    Dado 6: Sobrecarga / Decisión Médica (+3 sem. Escudo)
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2.5">
                  <motion.div
                    animate={rolling ? { scale: [1, 1.25, 0.95, 1.15, 1], rotate: [0, 90, 180, 270, 360] } : { scale: 1, rotate: 0 }}
                    transition={rolling ? { repeat: Infinity, duration: 0.35 } : { duration: 0.25 }}
                    className={`w-20 h-20 rounded-3xl flex items-center justify-center border-2 border-white/40 p-3 shadow-2xl transition-all ${
                      rolling
                        ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.6)]'
                        : diceValue === 1 || diceValue === 2
                        ? 'bg-gradient-to-br from-emerald-400 to-green-600 text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.5)]'
                        : diceValue === 6
                        ? 'bg-gradient-to-br from-red-500 to-rose-700 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)]'
                        : 'bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                    }`}
                  >
                    <DieIcon value={diceValue} className="w-14 h-14" />
                  </motion.div>
                  <p className="text-[11px] font-black uppercase italic text-amber-300">
                    {rolling ? 'Rodando dado de entrenamiento...' : `Resultado: Dado ${diceValue}`}
                  </p>
                </div>
              )}
            </div>

            {/* MODAL DE DECISIÓN MÉDICA (CARA 6 SIN INMUNIDAD) */}
            {pendingDecision && !rolling && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-red-950/60 border border-red-500/40 rounded-3xl p-4.5 space-y-3.5 shadow-2xl"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30 shrink-0">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase italic text-white tracking-wide">
                      ⚠️ Sobrecarga Muscular Detectada
                    </h4>
                    <p className="text-[10px] text-red-200 font-bold leading-tight mt-0.5">
                      Zona afectada al azar: <span className="text-white font-black underline decoration-red-400">{pendingDecision.attrLabel}</span>. Elige cómo tratar la situación:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* OPCIÓN A: ACEPTAR LA BAJA */}
                  <button
                    onClick={() => handleSelectDecision('accept_injury')}
                    className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-white/10 hover:border-amber-400/40 text-left transition-all active:scale-[0.98] group flex flex-col justify-between relative shadow-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                          Opción A
                        </span>
                        <span className="text-[8px] font-black uppercase text-emerald-400">Gratis (0 P/E)</span>
                      </div>
                      <h5 className="text-[11px] font-black uppercase italic text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5 pt-1">
                        <UserX size={13} className="text-red-400 shrink-0" /> Aceptar la Baja
                      </h5>
                      <p className="text-[9px] text-slate-300 font-bold leading-relaxed">
                        Juegas el siguiente partido con <strong>-1 en {pendingDecision.attrLabel}</strong>. Alta médica completa tras el partido.
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-1 text-[8px] font-black uppercase text-emerald-300">
                      <ShieldCheck size={11} className="text-emerald-400" /> +3 sem. Inmunidad Médica
                    </div>
                  </button>

                  {/* OPCIÓN B: FISIOTERAPIA DE ÉLITE */}
                  <button
                    onClick={() => handleSelectDecision('physio_elite')}
                    disabled={!pendingDecision.canAffordPhysio}
                    className={`p-3.5 rounded-2xl text-left transition-all relative flex flex-col justify-between shadow-lg ${
                      pendingDecision.canAffordPhysio
                        ? 'bg-gradient-to-br from-emerald-950/80 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 hover:from-emerald-950 active:scale-[0.98] group'
                        : 'bg-slate-900/60 border border-white/5 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Opción B · Élite
                        </span>
                        <span className={`text-[8px] font-black uppercase ${pendingDecision.canAffordPhysio ? 'text-amber-400' : 'text-red-400'}`}>
                          {pendingDecision.physioCost} P/E
                        </span>
                      </div>
                      <h5 className="text-[11px] font-black uppercase italic text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5 pt-1">
                        <Stethoscope size={13} className="text-emerald-400 shrink-0" /> Fisioterapia de Élite
                      </h5>
                      <p className="text-[9px] text-slate-300 font-bold leading-relaxed">
                        Cancela la lesión. Tu equipo juega al <strong>100% sin déficit</strong> de puntos en el partido.
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[8px] font-black uppercase">
                      <span className="flex items-center gap-1 text-emerald-300">
                        <ShieldCheck size={11} className="text-emerald-400" /> +3 sem. Inmunidad
                      </span>
                      {!pendingDecision.canAffordPhysio && (
                        <span className="text-red-400 font-bold">P/E Insuficientes</span>
                      )}
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Tarjeta de Resultado Detallada */}
            {drillOutcome && !rolling && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-4 border ${
                  drillOutcome.type === 'master' || drillOutcome.type === 'good' || drillOutcome.type === 'physio_treated'
                    ? 'bg-emerald-950/50 border-emerald-500/40'
                    : drillOutcome.type === 'neutral'
                    ? 'bg-slate-900/80 border-slate-700/40'
                    : drillOutcome.type === 'immunity'
                    ? 'bg-blue-950/50 border-blue-400/40'
                    : 'bg-red-950/50 border-red-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-black uppercase italic text-white flex items-center gap-1.5">
                    {drillOutcome.peGained > 0 && <Zap size={14} className="text-amber-400" />}
                    {drillOutcome.type === 'immunity' && <ShieldCheck size={14} className="text-emerald-400" />}
                    {drillOutcome.type === 'physio_treated' && <Sparkles size={14} className="text-emerald-400" />}
                    {drillOutcome.type?.includes('injury') && <AlertTriangle size={14} className="text-red-400" />}
                    {drillOutcome.title}
                  </h4>
                  <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-black/40 text-amber-300 border border-white/10">
                    {drillOutcome.badge}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-300 leading-relaxed mt-1">
                  {drillOutcome.desc}
                </p>
              </motion.div>
            )}

            {/* Botones de acción */}
            <div className="pt-1">
              {diceValue === null ? (
                <button
                  onClick={handleRollDrill}
                  disabled={rolling}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Dices size={16} /> Lanzar Dado de Entrenamiento (1D6)
                </button>
              ) : rolling ? (
                <button
                  disabled
                  className="w-full bg-slate-800 text-slate-400 py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest flex items-center justify-center gap-2"
                >
                  <Dices size={16} className="animate-spin" /> Rodando...
                </button>
              ) : pendingDecision ? (
                <p className="text-center text-[9px] font-bold uppercase tracking-wider text-slate-400 py-1">
                  Selecciona una de las 2 opciones médicas arriba para continuar
                </p>
              ) : (
                <button
                  onClick={handleConfirmResult}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={16} /> Aplicar y Continuar
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TrainingDrillModal;
