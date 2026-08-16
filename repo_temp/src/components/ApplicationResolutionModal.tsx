import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, XCircle, Sparkles, AlertTriangle, FileSignature,
  Clock, Check, X, ChevronRight, Briefcase, Mail, Shield as ShieldIcon, Target
} from 'lucide-react';
import { CONTRACT_SEASONS, signingRepBonus } from '../lib/career';

interface ApplicationResolutionModalProps {
  isOpen: boolean;
  resolution: {
    accepted: boolean;
    teamName: string;
    compName: string;
    div?: number;
    tier?: number;
    color1?: string;
    color2?: string;
    isFlag?: boolean;
    standingStatus?: string;
    requiredObjective?: string;
    message?: string;
    rejectionType?: string | null;
    offer?: any;
  } | null;
  career?: any;
  onAccept: (offer: any) => void;
  onReject: (offer: any) => void;
  onDecideLater: (offer: any) => void;
  onDismiss: () => void;
  ui: any;
}

export const ApplicationResolutionModal: React.FC<ApplicationResolutionModalProps> = ({
  isOpen,
  resolution,
  career,
  onAccept,
  onReject,
  onDecideLater,
  onDismiss,
  ui
}) => {
  const [confirmReject, setConfirmReject] = useState(false);
  const [confirmAccept, setConfirmAccept] = useState(false);

  if (!isOpen || !resolution) return null;

  const { Shield } = ui || {};
  const isAccepted = resolution.accepted;
  const offer = resolution.offer || {
    teamName: resolution.teamName,
    compName: resolution.compName,
    div: resolution.div || 1,
    tier: resolution.tier || 1,
    color1: resolution.color1,
    color2: resolution.color2,
    isFlag: resolution.isFlag,
    standingStatus: resolution.standingStatus,
    requiredObjective: resolution.requiredObjective
  };

  const repBonus = isAccepted
    ? signingRepBonus({
        fromTier: career?.tier || 1,
        toTier: offer.tier || 1
      })
    : 0;

  return (
    <div className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.88, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-sm rounded-[2.25rem] border overflow-hidden relative max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl ${
          isAccepted
            ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-black border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.2)]'
            : 'bg-gradient-to-b from-slate-900 via-slate-950 to-black border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.2)]'
        }`}
      >
        {/* Cabecera del Modal */}
        <div
          className={`px-6 py-5 border-b relative ${
            isAccepted
              ? 'bg-gradient-to-r from-emerald-900/60 via-emerald-950/40 to-transparent border-emerald-500/20'
              : 'bg-gradient-to-r from-red-900/60 via-red-950/40 to-transparent border-red-500/20'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1 border ${
                isAccepted
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border-red-500/30'
              }`}
            >
              {isAccepted ? <Sparkles size={11} className="text-emerald-400" /> : <Mail size={11} className="text-red-400" />}
              {isAccepted ? 'Propuesta de Contrato Formal' : 'Resolución de Candidatura'}
            </span>

            <button
              onClick={isAccepted ? () => onDecideLater(offer) : onDismiss}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/10"
              title="Cerrar"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex items-center gap-3.5 mt-3">
            {Shield && (
              <Shield
                color1={resolution.color1}
                color2={resolution.color2}
                initial={resolution.teamName}
                size="md"
                isFlag={resolution.isFlag}
              />
            )}
            <div className="min-w-0">
              <h3 className="text-lg font-black uppercase italic text-white leading-tight truncate">
                {resolution.teamName}
              </h3>
              <p className="text-[9px] font-bold uppercase text-slate-300">
                {resolution.compName} · {resolution.div === 2 ? '2ª División' : '1ª División'} · Tier {resolution.tier || 1}
              </p>
            </div>
          </div>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 space-y-4">
          {/* Mensaje de la Directiva / Carta Formal */}
          <div
            className={`rounded-2xl p-4 border space-y-2 ${
              isAccepted
                ? 'bg-emerald-950/30 border-emerald-500/20'
                : 'bg-red-950/20 border-red-500/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <p
                className={`text-[8px] font-black uppercase tracking-wider ${
                  isAccepted ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {isAccepted ? '¡Candidatura Aprobada!' : 'Candidatura No Seleccionada'}
              </p>
              {resolution.standingStatus && (
                <span className="text-[7.5px] font-bold uppercase px-2 py-0.5 rounded bg-black/40 text-slate-300 border border-white/5">
                  {resolution.standingStatus}
                </span>
              )}
            </div>

            <p className="text-[11px] font-bold text-slate-100 leading-relaxed italic">
              "{resolution.message}"
            </p>

            {isAccepted && (
              <div className="pt-2 border-t border-white/5 space-y-1 text-[9px] font-bold text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Duración de Contrato:</span>
                  <span className="text-white font-black">{CONTRACT_SEASONS} Temporadas</span>
                </div>
                {repBonus > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400">Bonus por Salto de Categoría:</span>
                    <span className="text-amber-300 font-black">+{repBonus} Reputación</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Objetivos exigidos por el club (si es aceptada) */}
          {isAccepted && offer.contractObjectives && offer.contractObjectives.length > 0 && (
            <div className="bg-black/40 rounded-2xl p-3.5 border border-white/5 space-y-2">
              <p className="text-[8px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <Target size={12} /> Objetivos Exigidos del Proyecto:
              </p>
              <div className="space-y-1">
                {offer.contractObjectives.map((obj: any, i: number) => (
                  <div key={i} className="text-[8px] font-bold text-slate-300 flex items-center justify-between bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-white/5">
                    <span className="truncate mr-2 text-slate-200">{obj.label}</span>
                    <span className="text-amber-400 font-black shrink-0">{obj.targetValue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aviso sobre vigencia al decidir más tarde */}
          {isAccepted && (
            <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-2xl p-3 flex items-start gap-2.5">
              <Clock size={15} className="text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-indigo-200 leading-snug">
                Si eliges <strong>"Decidir más tarde"</strong>, la oferta se guardará en tu buzón con <strong>2 semanas de vigencia</strong>. Pasado ese tiempo, la directiva retirará la propuesta.
              </p>
            </div>
          )}

          {/* Acciones para Propuesta Aceptada */}
          {isAccepted ? (
            <div className="space-y-2 pt-2">
              {/* Botón 1: Aceptar y Firmar */}
              <button
                onClick={() => setConfirmAccept(true)}
                className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Check size={14} /> Aceptar y Firmar Contrato
              </button>

              {/* Botón 2: Decidir Más Tarde */}
              <button
                onClick={() => onDecideLater(offer)}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white py-3 rounded-2xl text-[10px] font-black uppercase italic tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-indigo-400/30"
              >
                <Clock size={13} /> Decidir Más Tarde (Guardar en Buzón)
              </button>

              {/* Botón 3: Rechazar */}
              <button
                onClick={() => setConfirmReject(true)}
                className="w-full bg-black/40 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-white/10 hover:border-red-500/30 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1"
              >
                <X size={13} /> Rechazar Oferta
              </button>
            </div>
          ) : (
            /* Acciones para Candidatura Rechazada */
            <div className="pt-2">
              <button
                onClick={onDismiss}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                <Check size={14} /> Entendido / Continuar
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Modal de confirmación para aceptar y firmar */}
      <AnimatePresence>
        {confirmAccept && (
          <div className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs bg-slate-900 rounded-3xl border border-emerald-500/40 p-5 text-center space-y-4 shadow-2xl"
            >
              <FileSignature size={32} className="text-emerald-400 mx-auto" />
              <div>
                <h4 className="text-sm font-black uppercase italic text-white">
                  ¿Confirmar firma con {resolution.teamName}?
                </h4>
                <p className="text-[10px] font-bold text-slate-300 mt-1">
                  Firmarás por {CONTRACT_SEASONS} temporadas. Tu reputación viajará contigo y asumirás el mando inmediatamente.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setConfirmAccept(false)}
                  className="py-2.5 rounded-xl bg-slate-800 text-slate-300 text-[9px] font-black uppercase active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setConfirmAccept(false);
                    onAccept(offer);
                  }}
                  className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[9px] font-black uppercase italic tracking-wider active:scale-95 shadow-md"
                >
                  Firmar Ahora
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de confirmación para rechazar */}
      <AnimatePresence>
        {confirmReject && (
          <div className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs bg-slate-900 rounded-3xl border border-red-500/40 p-5 text-center space-y-4 shadow-2xl"
            >
              <AlertTriangle size={32} className="text-red-400 mx-auto" />
              <div>
                <h4 className="text-sm font-black uppercase italic text-white">
                  ¿Rechazar propuesta de {resolution.teamName}?
                </h4>
                <p className="text-[10px] font-bold text-slate-300 mt-1">
                  Esta propuesta se descartará permanentemente y no entrará a tu buzón.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setConfirmReject(false)}
                  className="py-2.5 rounded-xl bg-slate-800 text-slate-300 text-[9px] font-black uppercase active:scale-95"
                >
                  Volver
                </button>
                <button
                  onClick={() => {
                    setConfirmReject(false);
                    onReject(offer);
                  }}
                  className="py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[9px] font-black uppercase italic tracking-wider active:scale-95 shadow-md"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
