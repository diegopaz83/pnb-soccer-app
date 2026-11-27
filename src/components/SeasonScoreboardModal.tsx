import React, { useState } from 'react';
import { Trophy, Flame, RotateCcw, AlertTriangle, Check, X, Calendar, Shield, Award, Sparkles, RefreshCw } from 'lucide-react';
import { Match, Player, SeasonGlobalScoreboard, SeasonInfo, UserRole } from '../types';

interface SeasonScoreboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  season: SeasonInfo;
  scoreboard: SeasonGlobalScoreboard;
  role: UserRole;
  onStartNewSeason: (seasonName: string) => void;
  onFullResetToFactory: () => void;
  onUpdateSeasonName: (newName: string) => void;
}

export const SeasonScoreboardModal: React.FC<SeasonScoreboardModalProps> = ({
  isOpen,
  onClose,
  season,
  scoreboard,
  role,
  onStartNewSeason,
  onFullResetToFactory,
  onUpdateSeasonName,
}) => {
  const [seasonName, setSeasonName] = useState(season.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [confirmMode, setConfirmMode] = useState<'none' | 'new_season' | 'factory_reset'>('none');
  const [newSeasonInputName, setNewSeasonInputName] = useState('');

  if (!isOpen) return null;

  const handleSaveName = () => {
    if (seasonName.trim()) {
      onUpdateSeasonName(seasonName.trim());
      setIsEditingName(false);
    }
  };

  const handleExecuteNewSeason = () => {
    onStartNewSeason(newSeasonInputName.trim() || `Temporada ${new Date().getFullYear() + 1}`);
    setConfirmMode('none');
    onClose();
  };

  const handleExecuteFactoryReset = () => {
    onFullResetToFactory();
    setConfirmMode('none');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Marcador Global
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {season.startDate ? `Desde ${season.startDate}` : 'Temporada Activa'}
                </span>
              </div>
              
              {isEditingName && role === 'admin' ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={seasonName}
                    onChange={(e) => setSeasonName(e.target.value)}
                    className="text-lg font-display font-black text-slate-900 border-b-2 border-amber-500 focus:outline-none px-1 py-0.5"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="p-1 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-0.5">
                  <h2 className="text-xl font-display font-black text-slate-900">
                    {season.name}
                  </h2>
                  {role === 'admin' && (
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-xs font-bold text-amber-600 hover:text-amber-800 hover:underline"
                    >
                      Editar
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Season Scoreboard Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Partidos
            </span>
            <span className="font-display font-black text-2xl text-slate-900">
              {scoreboard.partidosJugados}
            </span>
            <span className="text-[10px] text-slate-500 block">
              Disputados
            </span>
          </div>

          <div className="bg-red-50/70 border border-red-200/70 rounded-2xl p-3 text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-red-600 block">
              Equipo Rojo
            </span>
            <span className="font-display font-black text-2xl text-red-600">
              {scoreboard.victoriasEquipo1}
            </span>
            <span className="text-[10px] text-red-700 font-semibold block">
              {scoreboard.golesEquipo1} goles
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center text-white">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Equipo Blanco
            </span>
            <span className="font-display font-black text-2xl text-white">
              {scoreboard.victoriasEquipo2}
            </span>
            <span className="text-[10px] text-slate-300 font-semibold block">
              {scoreboard.golesEquipo2} goles
            </span>
          </div>
        </div>

        {/* Additional metrics */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
          <span>Empates registrados: <strong>{scoreboard.empates}</strong></span>
          <span>Goles totales de temporada: <strong className="text-emerald-700">⚽ {scoreboard.golesTotales}</strong></span>
        </div>

        {/* Top Scorer Leader Badge */}
        {scoreboard.goleadorLider ? (
          <div className="bg-gradient-to-r from-amber-50 via-amber-100/60 to-yellow-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-white border-2 border-amber-400 shadow-sm shrink-0">
                <img
                  src={scoreboard.goleadorLider.player.foto}
                  alt={scoreboard.goleadorLider.player.nombre}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 text-[9px] shadow-xs">
                  ⭐
                </span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-600" />
                  Líder Goleador Actual
                </span>
                <h4 className="font-display font-black text-slate-900 text-base">
                  {scoreboard.goleadorLider.player.nombre}
                </h4>
                <span className="text-xs text-slate-600">
                  Dorsal #{scoreboard.goleadorLider.player.dorsal} • {scoreboard.goleadorLider.player.posicion}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-display font-black text-2xl text-amber-700 block">
                {scoreboard.goleadorLider.goles}
              </span>
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                Goles
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500">
            Aún no hay goles registrados en esta temporada.
          </div>
        )}

        {/* Admin Season Actions */}
        {role === 'admin' && (
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">
              Gestión Técnica de Temporada
            </span>

            {confirmMode === 'none' ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  id="btn-trigger-new-season"
                  onClick={() => {
                    setNewSeasonInputName(`Temporada ${new Date().getFullYear()} - Ciclo II`);
                    setConfirmMode('new_season');
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Iniciar Nueva Temporada (Reiniciar Goles)</span>
                </button>

                <button
                  type="button"
                  id="btn-trigger-factory-reset"
                  onClick={() => setConfirmMode('factory_reset')}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer Todo de Fábrica</span>
                </button>
              </div>
            ) : confirmMode === 'new_season' ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3 animate-in fade-in">
                <div className="flex items-start gap-2 text-emerald-950 text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">¿Iniciar nueva temporada?</strong>
                    <span>
                      Esta acción reinicia el marcador global, partidos y la tabla de goleadores a cero para abrir una nueva temporada. <strong>Todos los jugadores del plantel se conservan intactos.</strong>
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                    Nombre para la nueva temporada:
                  </label>
                  <input
                    type="text"
                    value={newSeasonInputName}
                    onChange={(e) => setNewSeasonInputName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-emerald-300 rounded-xl focus:outline-none focus:border-emerald-600 font-bold"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setConfirmMode('none')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-emerald-100/60"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteNewSeason}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs"
                  >
                    Confirmar e Iniciar Nueva Temporada
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3 animate-in fade-in">
                <div className="flex items-start gap-2 text-red-950 text-xs">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">¿Restablecer todo a valores de fábrica?</strong>
                    <span>
                      Se borrarán todos los cambios locales y se restaurará la base de datos inicial de jugadores y partidos de demostración.
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setConfirmMode('none')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-red-100/60"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteFactoryReset}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs"
                  >
                    Sí, Borrar y Restablecer
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
