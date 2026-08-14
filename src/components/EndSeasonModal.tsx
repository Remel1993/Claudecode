import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, CheckCircle2, XCircle, Inbox, FileText, ArrowRight, Shield as ShieldIcon, RotateCcw, X, ChevronLeft } from 'lucide-react';

interface EndSeasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToInbox: () => void;
  onOpenReview: () => void;
  onOpenChampions?: () => void;
  onNewSeason?: () => void;
  championsFinished?: boolean;
  allLeaguesFinished?: boolean;
  team: any;
  position: number;
  totalTeams: number;
  objectivesMet: number;
  objectivesTotal: number;
  season: number;
  isChampion: boolean;
  isPromoted: boolean;
  offersCount: number;
  ui: any;
}

export const EndSeasonModal: React.FC<EndSeasonModalProps> = ({
  isOpen,
  onClose,
  onGoToInbox,
  onOpenReview,
  onOpenChampions,
  onNewSeason,
  championsFinished,
  allLeaguesFinished,
  team,
  position,
  totalTeams,
  objectivesMet,
  objectivesTotal,
  season,
  isChampion,
  isPromoted,
  offersCount,
  ui
}) => {
  if (!isOpen) return null;
  const { Shield } = ui || {};

  const allMet = objectivesMet >= objectivesTotal && objectivesTotal > 0;
  const partialMet = objectivesMet > 0;

  return (
    <div className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.88, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-[2.25rem] border border-amber-500/40 p-6 text-center shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden relative max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        {/* Botón de Atrás / Cerrar en la esquina superior */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white active:scale-95 transition-all border border-white/10 flex items-center gap-1 text-[9px] font-black uppercase tracking-wider z-10"
          title="Volver a la vista del club"
        >
          <ChevronLeft size={14} /> Atrás
        </button>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white active:scale-95 transition-all border border-white/10 z-10"
          title="Cerrar modal"
        >
          <X size={15} />
        </button>

        {/* Glow ambient de fondo */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Icono Cabecera */}
        <div className="relative mx-auto mb-4 mt-4 w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-600 p-0.5 shadow-xl flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[1.4rem] flex items-center justify-center">
            {isChampion ? (
              <Trophy size={32} className="text-yellow-400 animate-bounce" />
            ) : (
              <ShieldIcon size={30} className="text-amber-400" />
            )}
          </div>
        </div>

        <h3 className="text-xs font-black uppercase tracking-widest text-amber-400">Temporada {season} Finalizada</h3>
        <h2 className="text-xl font-black uppercase italic text-white tracking-tight mt-1">¡Liga Terminada!</h2>

        <div className="mt-4 bg-slate-900/60 border border-white/10 rounded-2xl p-4 text-left space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {Shield && <Shield color1={team?.color1} color2={team?.color2} initial={team?.name} size="sm" isFlag={team?.isFlag} />}
              <div>
                <p className="text-[11px] font-black uppercase italic text-white">{team?.name}</p>
                <p className="text-[9px] font-bold text-slate-400">Posición en la Tabla</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-base font-black italic tabular-nums ${isChampion ? 'text-yellow-400' : 'text-emerald-400'}`}>
                {position ? `${position}º lugar` : '—'}
              </span>
              <p className="text-[8px] font-bold text-slate-400">de {totalTeams} equipos</p>
            </div>
          </div>

          <div className="h-[1px] bg-white/10" />

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-300">Estado de Objetivos</span>
            <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase italic flex items-center gap-1.5 ${
              allMet
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : partialMet
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {allMet || partialMet ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
              {allMet ? 'Objetivo Cumplido' : partialMet ? 'Parcialmente Cumplido' : 'Objetivo No Alcanzado'}
            </span>
          </div>

          {isChampion && (
            <div className="bg-yellow-500/15 border border-yellow-500/30 rounded-xl p-2.5 text-center">
              <p className="text-[10px] font-black uppercase italic text-yellow-300">🏆 ¡CAMPEÓN DE LIGA!</p>
            </div>
          )}

          {isPromoted && !isChampion && (
            <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-2.5 text-center">
              <p className="text-[10px] font-black uppercase italic text-emerald-300">🚀 ¡ASCENSO DIRECTO A 1ª DIVISIÓN!</p>
            </div>
          )}
        </div>

        {/* Mensaje de orientación destacado */}
        <div className="mt-4 bg-gradient-to-r from-amber-500/20 to-yellow-600/20 border border-amber-400/40 rounded-2xl p-3.5 text-center">
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center justify-center gap-1.5 mb-1">
            <Inbox size={14} className="animate-pulse" /> Aviso de Contrataciones
          </p>
          <p className="text-[11px] font-bold text-slate-100 leading-snug">
            Revisa tus opciones de Champions League, tu <span className="text-amber-300 underline font-black">Buzón</span> de ofertas o inicia la siguiente temporada.
          </p>
        </div>

        {/* Acciones */}
        <div className="mt-5 space-y-2">
          {/* Botón directo para ir y jugar la Champions League */}
          {onOpenChampions && (
            <button
              onClick={() => {
                onClose();
                onOpenChampions();
              }}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 border border-blue-400/40"
            >
              <Trophy size={16} className="text-yellow-300 animate-pulse" />
              {championsFinished ? 'Ver Champions League' : 'Jugar Champions League'} <ArrowRight size={14} />
            </button>
          )}

          {/* Si ya terminaron las ligas y la Champions, botón directo para empezar otra temporada */}
          {allLeaguesFinished && championsFinished && onNewSeason && (
            <button
              onClick={() => {
                onClose();
                onNewSeason();
              }}
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={15} /> Iniciar Nueva Temporada Global
            </button>
          )}

          <button
            onClick={() => {
              onClose();
              onGoToInbox();
            }}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Inbox size={15} /> Ir a mi Buzón de Ofertas {offersCount > 0 && `(${offersCount})`} <ArrowRight size={14} />
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenReview();
            }}
            className="w-full bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-white/10 py-3 rounded-2xl text-[10px] font-black uppercase italic tracking-widest active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <FileText size={14} /> Ver Balance Completo
          </button>

          {/* Botón explícito Atrás para no atrapar al usuario */}
          <button
            onClick={onClose}
            className="w-full bg-black/40 hover:bg-black/60 text-slate-400 hover:text-white border border-white/5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <ChevronLeft size={13} /> Volver a la vista del club
          </button>
        </div>
      </motion.div>
    </div>
  );
};
