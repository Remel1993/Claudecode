import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Trash2, Archive, X, Trophy, ArrowRight } from 'lucide-react';

interface DeleteCareerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmArchiveAndReset?: () => void;
  onArchiveAndReset?: () => void;
  onConfirmHardDelete?: () => void;
  onHardDelete?: () => void;
  career: any;
  team: any;
  ui?: any;
}

export const DeleteCareerModal: React.FC<DeleteCareerModalProps> = ({
  isOpen,
  onClose,
  onConfirmArchiveAndReset,
  onArchiveAndReset,
  onConfirmHardDelete,
  onHardDelete,
  career,
  team
}) => {
  if (!isOpen) return null;

  const managerName = career?.manager || 'Mánager';
  const teamName = team?.name || 'Club';
  const leagues = career?.trophies?.leagues || 0;
  const champions = career?.trophies?.champions || 0;
  const promotions = career?.trophies?.promotions || 0;
  const hasHistory = leagues > 0 || champions > 0 || promotions > 0 || (career?.seasonHistory?.length || 0) > 0 || (career?.stats?.matches || 0) > 0;

  const handleArchive = () => {
    if (typeof onConfirmArchiveAndReset === 'function') {
      onConfirmArchiveAndReset();
    } else if (typeof onArchiveAndReset === 'function') {
      onArchiveAndReset();
    }
    onClose();
  };

  const handleHard = () => {
    if (typeof onConfirmHardDelete === 'function') {
      onConfirmHardDelete();
    } else if (typeof onHardDelete === 'function') {
      onHardDelete();
    }
    onClose();
  };

  return (
    <div className='fixed inset-0 z-[90] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto'>
      <motion.div
        initial={{ scale: 0.92, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className='w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-[2rem] border border-red-500/40 p-5 sm:p-6 shadow-2xl space-y-4 my-auto'
      >
        <div className='w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto'>
          <Trash2 size={24} />
        </div>

        <div className='text-center space-y-1.5'>
          <h3 className='text-base sm:text-lg font-black uppercase italic text-white'>
            ¿Finalizar o Eliminar Proyecto de Carrera?
          </h3>
          <p className='text-xs font-bold text-amber-300 uppercase tracking-wider'>
            {managerName} · {teamName}
          </p>
          <p className='text-[10px] font-bold text-slate-300 leading-relaxed max-w-sm mx-auto'>
            Esta acción concluirá tu ciclo actual de mánager. Puedes archivar todos tus logros y vitrina de trofeos en el <strong>Salón de la Fama histórico</strong> antes de iniciar una nueva aventura.
          </p>
        </div>

        {hasHistory && (
          <div className='bg-black/40 rounded-2xl p-3.5 border border-white/5 space-y-1.5'>
            <p className='text-[8px] font-black uppercase tracking-widest text-amber-400'>
              Balance del Proyecto Actual:
            </p>
            <div className='flex items-center justify-around text-center text-[9px] pt-1'>
              <div>
                <p className='text-xs font-black text-white'>{career?.reputation || 10}</p>
                <p className='text-[7.5px] text-slate-400 uppercase font-bold'>Reputación</p>
              </div>
              <div>
                <p className='text-xs font-black text-yellow-300'>🏆 {leagues}L · ⭐ {champions}UCL</p>
                <p className='text-[7.5px] text-slate-400 uppercase font-bold'>Palmarés</p>
              </div>
              <div>
                <p className='text-xs font-black text-emerald-300'>{career?.seasonHistory?.length || 1} Temp.</p>
                <p className='text-[7.5px] text-slate-400 uppercase font-bold'>Trayectoria</p>
              </div>
            </div>
          </div>
        )}

        <div className='space-y-2.5 pt-2'>
          <button
            onClick={handleArchive}
            className='w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2'
          >
            <Archive size={15} /> Archivar en Historial y Empezar Nueva Carrera
          </button>

          <button
            onClick={handleHard}
            className='w-full bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2'
          >
            <Trash2 size={14} /> Eliminar Definitivamente sin Guardar
          </button>

          <button
            onClick={onClose}
            className='w-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all'
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
