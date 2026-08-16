import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Award, TrendingUp, Calendar, Trash2, X, Star, ChevronDown, ChevronUp, CheckCircle, Shield as ShieldIcon, Briefcase, Sparkles, Filter } from 'lucide-react';
import { repBand } from '../lib/career';

export interface ArchivedCareer {
  id: string;
  manager: string;
  reputation: number;
  tier: number;
  teamName: string;
  teamId?: number;
  compId?: string;
  div?: number;
  startedSeason: number;
  finalSeason: number;
  seasonsCount: number;
  stats: {
    matches: number;
    wins: number;
    draws: number;
    losses: number;
    gf: number;
    ga: number;
  };
  trophies: {
    leagues: number;
    champions: number;
    promotions: number;
  };
  seasonHistory: any[];
  archivedAt: string;
  isChampion: boolean;
  status: string;
}

interface CareerHistoryArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  pastCareers: ArchivedCareer[];
  onDeletePastCareer: (careerId: string) => void;
  ui: any;
}

export const CareerHistoryArchiveModal: React.FC<CareerHistoryArchiveModalProps> = ({
  isOpen,
  onClose,
  pastCareers = [],
  onDeletePastCareer,
  ui
}) => {
  const { Shield } = ui || {};
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');

  if (!isOpen) return null;

  const filteredCareers = pastCareers.filter(c => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      (c.manager || '').toLowerCase().includes(q) ||
      (c.teamName || '').toLowerCase().includes(q) ||
      (c.status || '').toLowerCase().includes(q)
    );
  });

  // Estadísticas globales históricas acumuladas
  const totalCareers = pastCareers.length;
  const totalLeagues = pastCareers.reduce((acc, c) => acc + (c.trophies?.leagues || 0), 0);
  const totalChampions = pastCareers.reduce((acc, c) => acc + (c.trophies?.champions || 0), 0);
  const totalPromotions = pastCareers.reduce((acc, c) => acc + (c.trophies?.promotions || 0), 0);
  const totalMatches = pastCareers.reduce((acc, c) => acc + (c.stats?.matches || 0), 0);
  const totalWins = pastCareers.reduce((acc, c) => acc + (c.stats?.wins || 0), 0);
  const globalWinRate = totalMatches > 0 ? ((totalWins / totalMatches) * 100).toFixed(1) : '0.0';

  return (
    <div className='fixed inset-0 z-[85] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto'>
      <motion.div
        initial={{ scale: 0.93, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.93, opacity: 0 }}
        className='w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-[2rem] border border-amber-500/40 p-5 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[92vh] flex flex-col'
      >
        {/* CABECERA */}
        <div className='flex items-center justify-between gap-3 pb-3 border-b border-white/10 shrink-0'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 p-0.5 shadow-lg flex items-center justify-center shrink-0'>
              <div className='w-full h-full bg-slate-950 rounded-[0.9rem] flex items-center justify-center'>
                <Trophy size={24} className='text-yellow-400' />
              </div>
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <h3 className='text-base sm:text-lg font-black uppercase italic text-white'>
                  Salón de la Fama & Historial
                </h3>
                <span className='text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30'>
                  {totalCareers} {totalCareers === 1 ? 'Carrera' : 'Carreras'}
                </span>
              </div>
              <p className='text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5'>
                Registro de proyectos finalizados y vitrina histórica de mánagers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className='p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 active:scale-95 transition-all'
            title='Cerrar historial'
          >
            <X size={18} />
          </button>
        </div>

        {/* RESUMEN GLOBAL HISTÓRICO */}
        {totalCareers > 0 && (
          <div className='grid grid-cols-2 sm:grid-cols-5 gap-2 shrink-0'>
            <div className='bg-black/40 rounded-2xl p-2.5 border border-white/5 text-center'>
              <p className='text-[8px] font-black uppercase text-slate-400'>Proyectos</p>
              <p className='text-base font-black italic text-white tabular-nums'>{totalCareers}</p>
            </div>
            <div className='bg-black/40 rounded-2xl p-2.5 border border-white/5 text-center'>
              <p className='text-[8px] font-black uppercase text-yellow-400 flex items-center justify-center gap-1'>
                <Trophy size={11} /> Ligas
              </p>
              <p className='text-base font-black italic text-yellow-300 tabular-nums'>{totalLeagues}</p>
            </div>
            <div className='bg-black/40 rounded-2xl p-2.5 border border-white/5 text-center'>
              <p className='text-[8px] font-black uppercase text-blue-400 flex items-center justify-center gap-1'>
                <Award size={11} /> Champions
              </p>
              <p className='text-base font-black italic text-blue-300 tabular-nums'>{totalChampions}</p>
            </div>
            <div className='bg-black/40 rounded-2xl p-2.5 border border-white/5 text-center'>
              <p className='text-[8px] font-black uppercase text-emerald-400 flex items-center justify-center gap-1'>
                <TrendingUp size={11} /> Ascensos
              </p>
              <p className='text-base font-black italic text-emerald-300 tabular-nums'>{totalPromotions}</p>
            </div>
            <div className='col-span-2 sm:col-span-1 bg-black/40 rounded-2xl p-2.5 border border-white/5 text-center'>
              <p className='text-[8px] font-black uppercase text-slate-400'>% Victorias</p>
              <p className='text-base font-black italic text-emerald-400 tabular-nums'>{globalWinRate}%</p>
            </div>
          </div>
        )}

        {/* BUSCADOR */}
        {totalCareers > 2 && (
          <div className='relative shrink-0'>
            <input
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              placeholder='Buscar por mánager, equipo o logro...'
              className='w-full bg-slate-900/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-bold text-white placeholder:text-slate-500 outline-none focus:border-amber-400/50'
            />
          </div>
        )}

        {/* LISTADO DE CARRERAS */}
        <div className='flex-grow overflow-y-auto custom-scrollbar space-y-3.5 pr-1'>
          {filteredCareers.length > 0 ? (
            filteredCareers.map(c => {
              const band = repBand(c.reputation || 10);
              const isExpanded = expandedId === c.id;
              const hasTrophies = (c.trophies?.leagues || 0) > 0 || (c.trophies?.champions || 0) > 0 || (c.trophies?.promotions || 0) > 0;
              const winRate = (c.stats?.matches || 0) > 0 ? (((c.stats?.wins || 0) / c.stats.matches) * 100).toFixed(1) : '0.0';

              return (
                <div
                  key={c.id}
                  className={`rounded-3xl border transition-all overflow-hidden ${
                    (c.trophies?.champions || 0) > 0
                      ? 'bg-gradient-to-br from-blue-950/40 via-slate-900/90 to-yellow-950/20 border-yellow-500/40 shadow-lg'
                      : hasTrophies
                      ? 'bg-slate-900/80 border-amber-500/30'
                      : 'bg-slate-900/60 border-white/5'
                  }`}
                >
                  {/* CABECERA DE LA CARRERA ARCHIVADA */}
                  <div className='p-4 space-y-3'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <h4 className='text-sm sm:text-base font-black uppercase italic text-white truncate'>
                            {c.manager || 'Mánager Legendario'}
                          </h4>
                          <span className='text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1'>
                            <Star size={9} className='fill-amber-400 text-amber-400' /> {band.label}
                          </span>
                          <span className='text-[8px] font-bold text-slate-400'>
                            Rep. <strong className='text-amber-400'>{c.reputation}</strong>/100
                          </span>
                        </div>

                        <div className='flex items-center gap-2 text-[9px] font-bold text-slate-300 mt-1 flex-wrap'>
                          <span className='text-amber-400 font-black uppercase'>{c.teamName}</span>
                          <span>·</span>
                          <span>{c.seasonsCount} {c.seasonsCount === 1 ? 'temporada' : 'temporadas'} (T{c.startedSeason} - T{c.finalSeason})</span>
                          <span>·</span>
                          <span className='text-slate-400'>{new Date(c.archivedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className='text-right shrink-0 space-y-1'>
                        <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full border inline-block ${
                          (c.trophies?.champions || 0) > 0
                            ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                            : (c.trophies?.leagues || 0) > 0
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : (c.trophies?.promotions || 0) > 0
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-300 border-white/10'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                    </div>

                    {/* VITRINA Y ESTADÍSTICAS DEL PROYECTO */}
                    <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center text-[9px]'>
                      <div className='bg-black/30 rounded-xl p-2 border border-white/5'>
                        <p className='text-[7.5px] font-black uppercase text-slate-400'>Títulos Ganados</p>
                        <p className='text-xs font-black text-amber-300 tabular-nums flex items-center justify-center gap-1.5 mt-0.5'>
                          <span>🏆 {c.trophies?.leagues || 0}L</span>
                          <span>⭐ {c.trophies?.champions || 0}UCL</span>
                          <span>🚀 {c.trophies?.promotions || 0}A</span>
                        </p>
                      </div>

                      <div className='bg-black/30 rounded-xl p-2 border border-white/5'>
                        <p className='text-[7.5px] font-black uppercase text-slate-400'>Partidos</p>
                        <p className='text-xs font-black text-white tabular-nums mt-0.5'>
                          {c.stats?.matches || 0} PJ
                        </p>
                      </div>

                      <div className='bg-black/30 rounded-xl p-2 border border-white/5'>
                        <p className='text-[7.5px] font-black uppercase text-slate-400'>V / E / D</p>
                        <p className='text-xs font-black text-slate-200 tabular-nums mt-0.5'>
                          <span className='text-emerald-400'>{c.stats?.wins || 0}</span>/
                          <span className='text-slate-400'>{c.stats?.draws || 0}</span>/
                          <span className='text-red-400'>{c.stats?.losses || 0}</span>
                        </p>
                      </div>

                      <div className='bg-black/30 rounded-xl p-2 border border-white/5'>
                        <p className='text-[7.5px] font-black uppercase text-slate-400'>Rendimiento</p>
                        <p className='text-xs font-black text-emerald-400 tabular-nums mt-0.5'>
                          {winRate}%
                        </p>
                      </div>
                    </div>

                    {/* BOTONES DE ACCIÓN */}
                    <div className='flex items-center justify-between pt-1 border-t border-white/5'>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : c.id)}
                        className='text-[9px] font-black uppercase tracking-wider text-amber-400 hover:text-amber-300 flex items-center gap-1.5 active:scale-95 transition-all'
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp size={14} /> Ocultar Trayectoria Temporada a Temporada
                          </>
                        ) : (
                          <>
                            <ChevronDown size={14} /> Ver Detalle de {c.seasonHistory?.length || c.seasonsCount} Temporadas
                          </>
                        )}
                      </button>

                      {confirmDeleteId === c.id ? (
                        <div className='flex items-center gap-1.5'>
                          <span className='text-[8px] font-bold text-red-400'>¿Eliminar?</span>
                          <button
                            onClick={() => {
                              onDeletePastCareer(c.id);
                              setConfirmDeleteId(null);
                            }}
                            className='px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[8px] font-black uppercase active:scale-95 transition-all'
                          >
                            Sí, Borrar
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className='px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[8px] font-black uppercase active:scale-95 transition-all'
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(c.id)}
                          className='text-[9px] font-bold text-slate-500 hover:text-red-400 flex items-center gap-1 p-1 rounded hover:bg-red-500/10 transition-all'
                          title='Eliminar del historial'
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* LÍNEA DEL TIEMPO DESPLEGABLE */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className='bg-black/50 border-t border-white/5 p-4 space-y-2.5'
                      >
                        <p className='text-[8px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5'>
                          <Calendar size={12} /> Registro Cronológico de Temporadas:
                        </p>

                        {c.seasonHistory && c.seasonHistory.length > 0 ? (
                          <div className='space-y-2'>
                            {c.seasonHistory.map((s: any, si: number) => {
                              const isChamp = s.position === 1;
                              const isPromo = s.promoted || (s.position <= 3 && s.div === 2);

                              return (
                                <div
                                  key={si}
                                  className={`rounded-2xl p-3 border text-[9px] ${
                                    isChamp
                                      ? 'bg-yellow-500/10 border-yellow-500/30'
                                      : isPromo
                                      ? 'bg-emerald-500/10 border-emerald-500/30'
                                      : 'bg-slate-900/60 border-white/5'
                                  }`}
                                >
                                  <div className='flex items-center justify-between'>
                                    <div>
                                      <div className='flex items-center gap-1.5'>
                                        <span className='font-black text-amber-300 uppercase'>
                                          Temporada {s.season}
                                        </span>
                                        <span>·</span>
                                        <span className='font-bold text-white uppercase'>{s.teamName}</span>
                                        <span className='text-slate-400'>({s.compName || 'Liga'} · {s.div === 2 ? '2ª Div' : '1ª Div'})</span>
                                      </div>
                                    </div>

                                    <div className='text-right'>
                                      <span className={`font-black italic ${isChamp ? 'text-yellow-400' : 'text-emerald-400'}`}>
                                        {s.position ? `${s.position}º puesto` : '—'}
                                      </span>
                                      {s.pts && <span className='text-slate-400 font-bold ml-1'>({s.pts} pts)</span>}
                                    </div>
                                  </div>

                                  <div className='flex items-center gap-2 mt-1.5 flex-wrap'>
                                    {isChamp && (
                                      <span className='text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'>
                                        🏆 Campeón de Liga
                                      </span>
                                    )}
                                    {isPromo && !isChamp && (
                                      <span className='text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'>
                                        🚀 Ascenso
                                      </span>
                                    )}
                                    {s.clResult && (
                                      <span className='text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30'>
                                        ⭐ {s.clResult}
                                      </span>
                                    )}
                                    {s.repAfter && (
                                      <span className='text-[7.5px] font-bold text-slate-400'>
                                        Rep Final: {s.repAfter}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className='text-[9px] font-bold text-slate-400'>
                            Proyecto archivado durante el transcurso de la temporada {c.finalSeason}.
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className='bg-slate-900/40 rounded-3xl p-8 text-center space-y-3 border border-white/5'>
              <Trophy size={40} className='text-slate-600 mx-auto' />
              <h4 className='text-sm font-black uppercase italic text-slate-300'>
                {filterQuery ? 'No se encontraron carreras con ese filtro' : 'Aún no hay carreras en el historial'}
              </h4>
              <p className='text-[10px] font-bold text-slate-400 max-w-sm mx-auto leading-relaxed'>
                Cuando concluyas o archives un proyecto de mánager, se registrará aquí para siempre con todos sus títulos de liga, trofeos de Champions League y ascensos conquistados.
              </p>
            </div>
          )}
        </div>

        {/* PIE */}
        <div className='pt-2 border-t border-white/10 shrink-0 flex justify-end'>
          <button
            onClick={onClose}
            className='w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all'
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
