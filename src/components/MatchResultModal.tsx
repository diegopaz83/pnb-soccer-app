import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  Trophy, 
  Star, 
  Check, 
  Calendar, 
  Clock, 
  MapPin,
  Shield
} from 'lucide-react';
import { Match, Player } from '../types';

interface MatchResultModalProps {
  match: Match;
  players: Player[];
  onClose: () => void;
  onSave: (updatedMatch: Match) => void;
}

export const MatchResultModal: React.FC<MatchResultModalProps> = ({
  match,
  players,
  onClose,
  onSave,
}) => {
  const playerMap = new Map<string, Player>(players.map((p) => [p.id, p]));

  // Active team tab for goal counters: 'A' or 'B'
  const [activeTab, setActiveTab] = useState<'A' | 'B'>('A');

  // Goals per player map { playerId: count }
  const [playerGoals, setPlayerGoals] = useState<Record<string, number>>(() => {
    return { ...(match.playerGoals || {}) };
  });

  const [estado, setEstado] = useState<'programado' | 'en_juego' | 'finalizado'>(
    match.estado === 'programado' ? 'finalizado' : match.estado
  );
  const [selectedMvp, setSelectedMvp] = useState<string>(match.mvpPlayerId || '');

  const team1Label = match.equipo1Nombre || 'Equipo Rojo';
  const team2Label = match.equipo2Nombre || 'Equipo Blanco';

  const equipoAIds = match.equipo1PlayerIds || [];
  const equipoBIds = match.equipo2PlayerIds || [];

  // Calculate score for Team A and Team B based on player goals
  const calculateTeamGoals = (ids: string[]) => {
    return ids.reduce((acc, id) => acc + (Number(playerGoals[id]) || 0), 0);
  };

  const scoreA = calculateTeamGoals(equipoAIds);
  const scoreB = calculateTeamGoals(equipoBIds);

  // Increment goal
  const handleAddGoal = (playerId: string) => {
    const current = Number(playerGoals[playerId]) || 0;
    setPlayerGoals({
      ...playerGoals,
      [playerId]: current + 1,
    });
  };

  // Decrement goal
  const handleRemoveGoal = (playerId: string) => {
    const current = Number(playerGoals[playerId]) || 0;
    if (current <= 0) return;
    const updated = { ...playerGoals, [playerId]: current - 1 };
    if (updated[playerId] === 0) {
      delete updated[playerId];
    }
    setPlayerGoals(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: Match = {
      ...match,
      estado,
      golesPFSoccer: scoreA,
      golesRival: scoreB,
      playerGoals,
      mvpPlayerId: selectedMvp || undefined,
    };

    onSave(updated);
  };

  const activeTeamIds = activeTab === 'A' ? equipoAIds : equipoBIds;
  const activeTeamName = activeTab === 'A' ? team1Label : team2Label;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200/80 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Marcador & Goleadores
            </span>
            <h2 className="font-display font-black text-slate-900 text-lg sm:text-xl">
              Registrar Resultado del Partido
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          
          {/* Scoreboard Display */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-5 text-center">
            <div className="grid grid-cols-5 items-center gap-2">
              
              {/* Team A */}
              <div className="col-span-2 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">
                    {team1Label}
                  </span>
                </div>
                <div className="font-display font-black text-4xl sm:text-5xl text-slate-900">
                  {scoreA}
                </div>
              </div>

              {/* VS Divider */}
              <div className="col-span-1 text-center">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  VS
                </span>
              </div>

              {/* Team B */}
              <div className="col-span-2 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 ring-1 ring-slate-400" />
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">
                    {team2Label}
                  </span>
                </div>
                <div className="font-display font-black text-4xl sm:text-5xl text-slate-900">
                  {scoreB}
                </div>
              </div>

            </div>

            <div className="mt-3 pt-3 border-t border-slate-200/50 flex items-center justify-center gap-2">
              {(['programado', 'en_juego', 'finalizado'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setEstado(st)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    estado === st
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st === 'programado' ? 'Programado' : st === 'en_juego' ? 'En Juego' : 'Finalizado'}
                </button>
              ))}
            </div>
          </div>

          {/* Goal Scorer Counter Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-sm">
                  ¿Quién hizo los goles?
                </h3>
                <p className="text-xs text-slate-500">
                  Toca <strong>+</strong> en el jugador para sumarle goles. El marcador se calcula solo.
                </p>
              </div>

              {/* Team Switcher Tabs */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('A')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'A'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {team1Label} ({scoreA})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('B')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'B'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {team2Label} ({scoreB})
                </button>
              </div>
            </div>

            {/* Players List with Intuitive Counters */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {activeTeamIds.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No hay jugadores convocados en este equipo.
                </div>
              ) : (
                activeTeamIds.map((pId) => {
                  const p = playerMap.get(pId);
                  if (!p) return null;

                  const goalsCount = Number(playerGoals[p.id]) || 0;
                  const isMvp = selectedMvp === p.id;

                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                        goalsCount > 0
                          ? 'bg-emerald-50/70 border-emerald-200'
                          : 'bg-white border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      {/* Player Info */}
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          {p.foto ? (
                            <img
                              src={p.foto}
                              alt={p.nombre}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="flex items-center justify-center h-full text-xs font-bold text-slate-400">
                              #{p.dorsal}
                            </span>
                          )}
                        </div>

                        <div className="overflow-hidden">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {p.nombre}
                            </span>
                            {isMvp && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                                MVP
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            #{p.dorsal} • {p.posicion}
                          </span>
                        </div>
                      </div>

                      {/* MVP Star + Goal Counter [-] [count] [+] */}
                      <div className="flex items-center gap-3 shrink-0">
                        
                        {/* MVP selector button */}
                        <button
                          type="button"
                          onClick={() => setSelectedMvp(isMvp ? '' : p.id)}
                          title={isMvp ? 'Quitar MVP' : 'Marcar como MVP del partido'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isMvp
                              ? 'text-amber-500 bg-amber-50'
                              : 'text-slate-300 hover:text-amber-500'
                          }`}
                        >
                          <Star className={`w-4 h-4 ${isMvp ? 'fill-amber-400 text-amber-500' : ''}`} />
                        </button>

                        {/* Tactile Counter */}
                        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 border border-slate-200/80">
                          <button
                            type="button"
                            onClick={() => handleRemoveGoal(p.id)}
                            disabled={goalsCount === 0}
                            className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <span className="w-7 text-center font-display font-black text-sm text-slate-900">
                            {goalsCount}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleAddGoal(p.id)}
                            className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center transition-colors shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Resultado</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
