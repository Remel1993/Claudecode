import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, AlertCircle, Briefcase, Newspaper, Pause, Play, ChevronLeft, ChevronRight, List, X, Sparkles } from 'lucide-react';

export interface Rumor {
  id: string;
  type: 'danger' | 'vacancy' | 'press' | 'rumor';
  tag: string;
  text: string;
}

interface RumorsTickerProps {
  rumors: Rumor[];
}

export const RumorsTicker: React.FC<RumorsTickerProps> = ({ rumors }) => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intervalo suave y amplio de 8.5 segundos por rumor para lectura tranquila
  useEffect(() => {
    if (!rumors || rumors.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % rumors.length);
    }, 8500);
    return () => clearInterval(timer);
  }, [rumors, isPaused]);

  if (!rumors || rumors.length === 0) return null;

  const current = rumors[index % rumors.length] || rumors[0];

  const getTagColor = (type: string) => {
    switch (type) {
      case 'danger':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'vacancy':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'press':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'danger':
        return <AlertCircle size={12} className="text-red-400 shrink-0" />;
      case 'vacancy':
        return <Briefcase size={12} className="text-amber-400 shrink-0" />;
      case 'press':
        return <Newspaper size={12} className="text-blue-400 shrink-0" />;
      default:
        return <Radio size={12} className="text-purple-400 shrink-0" />;
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex(prev => (prev - 1 + rumors.length) % rumors.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex(prev => (prev + 1) % rumors.length);
  };

  return (
    <>
      <div
        className="w-full bg-slate-950/85 backdrop-blur-md border border-amber-500/25 rounded-2xl px-3 py-2 shadow-lg mb-3 select-none transition-all hover:border-amber-500/40"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* Indicador EN VIVO y Etiqueta */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-[8px] font-black tracking-widest uppercase text-amber-400 flex items-center gap-1">
              RUMORES
            </span>
          </div>

          <div className="h-3.5 w-[1px] bg-white/15 shrink-0" />

          {/* CONTENEDOR DE TEXTO CORREDIZO Y LEGIBLE */}
          <div
            ref={containerRef}
            className="relative flex-grow min-w-0 h-6 overflow-hidden flex items-center cursor-pointer"
            onClick={() => setShowAllModal(true)}
            title="Toca para ver todos los rumores completos"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={current?.id ? `${current.id}-${index}` : `current-rumor-${index}`}
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="flex items-center gap-2 whitespace-nowrap min-w-0 overflow-x-auto no-scrollbar py-0.5"
              >
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border shrink-0 flex items-center gap-1 shadow-sm ${getTagColor(current.type)}`}>
                  {getIcon(current.type)}
                  {current.tag}
                </span>

                {/* Texto suave y claro con tipografía nítida */}
                <span className="text-[11px] font-semibold text-slate-100 drop-shadow-sm tracking-tight leading-none whitespace-nowrap">
                  {current.text}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* CONTROLES INTERACTIVOS (PAUSA, ANTERIOR, SIGUIENTE, VER TODOS) */}
          <div className="flex items-center gap-1 shrink-0 bg-black/40 rounded-xl p-0.5 border border-white/5">
            <button
              onClick={handlePrev}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              title="Rumor anterior"
            >
              <ChevronLeft size={13} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPaused(p => !p);
              }}
              className={`p-1 rounded-lg active:scale-95 transition-all ${
                isPaused ? 'text-amber-400 bg-amber-500/20' : 'text-slate-400 hover:text-white'
              }`}
              title={isPaused ? 'Reanudar lectura automática' : 'Pausar para leer con calma'}
            >
              {isPaused ? <Play size={11} className="fill-current" /> : <Pause size={11} />}
            </button>

            <button
              onClick={handleNext}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              title="Siguiente rumor"
            >
              <ChevronRight size={13} />
            </button>

            <div className="h-3 w-[1px] bg-white/10 mx-0.5" />

            <button
              onClick={() => setShowAllModal(true)}
              className="px-1.5 py-1 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/15 text-[8px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all"
              title="Ver lista completa de rumores"
            >
              <List size={12} />
              <span className="hidden xs:inline">Ver Todo</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE LECTURA COMPLETA DE RUMORES */}
      <AnimatePresence>
        {showAllModal && (
          <div className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-[2rem] border border-amber-500/30 p-5 shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Radio size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase italic text-white">Mercado y Rumores de Prensa</h3>
                    <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Actualización en tiempo real ({rumors.length} informaciones)</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAllModal(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white active:scale-95 transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
                {rumors.map((r, i) => (
                  <div
                    key={r.id ? `${r.id}-${i}` : `rumor-card-${i}`}
                    className="p-3 bg-slate-900/70 border border-white/10 rounded-2xl space-y-1.5 hover:border-amber-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border flex items-center gap-1 ${getTagColor(r.type)}`}>
                        {getIcon(r.type)}
                        {r.tag}
                      </span>
                      <span className="text-[8px] font-bold uppercase text-slate-500">Jornada Activa</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-100 leading-relaxed">
                      {r.text}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowAllModal(false)}
                className="mt-4 w-full bg-slate-800 text-white py-3 rounded-xl text-[10px] font-black uppercase italic tracking-widest active:scale-95 transition-all border border-white/10"
              >
                Cerrar y Continuar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
