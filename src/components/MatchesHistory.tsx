import React, { useState } from 'react';
import { 
  Calendar, 
  Trophy, 
  MapPin, 
  Clock, 
  PlusCircle, 
  Shield, 
  Award, 
  Trash2,
  Users,
  LayoutGrid,
  MoreVertical,
  Edit3
} from 'lucide-react';
import { Match, Player, UserRole } from '../types';

interface MatchesHistoryProps {
  matches: Match[];
  players: Player[];
  role: UserRole;
  onOpenNewMatchModal?: () => void;
  onOpenResultModal: (match: Match) => void;
  onSelectMatchForLineup: (match: Match) => void;
  onDeleteMatch: (matchId: string) => void;
  onGoToConvocatoria?: () => void;
}

export const MatchesHistory: React.FC<MatchesHistoryProps> = ({
  matches,
  players,
  role,
  onOpenNewMatchModal,
  onOpenResultModal,
  onSelectMatchForLineup,
  onDeleteMatch,
  onGoToConvocatoria,
}) => {
  const [filter, setFilter] = useState<'todos' | 'finalizado' | 'programado'>('todos');
  const [openKebabMatchId, setOpenKebabMatchId] = useState<string | null>(null);
  const playerMap = new Map<string, Player>(players.map((p) => [p.id, p]));

  // Season metrics
  const finishedMatches = matches.filter((m) => m.estado === 'finalizado');
  const totalGoals = finishedMatches.reduce(
    (acc, m) => acc + (m.golesPFSoccer || 0) + (m.golesRival || 0),
    0
  );

  const filteredMatches = matches
    .filter((m) => filter === 'todos' || m.estado === filter)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
            Resultados Semanales
          </span>
          <h2 className="font-display font-black text-slate-900 text-xl sm:text-2xl">
            Historial de Partidos (12 vs 12)
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Registro oficial de partidos jugados, goleadores por fecha y figuras destacadas.
          </p>
        </div>

        {/* Quick link to active Convocatoria */}
        {onGoToConvocatoria && (
          <button
            id="go-convocatoria-btn"
            onClick={onGoToConvocatoria}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors self-stretch sm:self-auto justify-center"
          >
            <Users className="w-4 h-4" />
            <span>Ir a Convocatoria Actual</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('todos')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'todos'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Todos ({matches.length})
        </button>

        <button
          onClick={() => setFilter('finalizado')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'finalizado'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Jugados ({finishedMatches.length})
        </button>

        <button
          onClick={() => setFilter('programado')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'programado'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Próximos ({matches.filter((m) => m.estado !== 'finalizado').length})
        </button>
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {filteredMatches.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 text-xs">
            No se encontraron partidos en esta categoría.
          </div>
        ) : (
          filteredMatches.map((match) => {
            const isFinished = match.estado === 'finalizado';
            const isPlaying = match.estado === 'en_juego';
            const mvp = match.mvpPlayerId ? playerMap.get(match.mvpPlayerId) : null;

            const team1Label = match.equipo1Nombre || 'Equipo Rojo';
            const team2Label = match.equipo2Nombre || 'Equipo Blanco';

            const equipoAIds = match.equipo1PlayerIds || [];
            const equipoBIds = match.equipo2PlayerIds || [];

            // Scorers list
            const scorersList = Object.entries(match.playerGoals || {})
              .filter(([_, count]) => (Number(count) || 0) > 0)
              .map(([pId, count]) => ({
                player: playerMap.get(pId),
                count: Number(count) || 0,
              }));

            return (
              <div
                key={match.id}
                className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs hover:border-slate-300 transition-all"
              >
                {/* Match Card Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-slate-900 text-sm">
                      {match.jornada}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        isFinished
                          ? 'bg-slate-100 text-slate-800'
                          : isPlaying
                          ? 'bg-emerald-50 text-emerald-800 animate-pulse'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {isFinished ? 'Finalizado' : isPlaying ? 'En Juego' : 'Programado'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {match.fecha}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {match.hora}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {match.lugar}
                    </span>

                    {/* Kebab menu with edit / delete options */}
                    {role === 'admin' && (
                      <div className="relative ml-1">
                        <button
                          type="button"
                          onClick={() => setOpenKebabMatchId(openKebabMatchId === match.id ? null : match.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Opciones del partido"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openKebabMatchId === match.id && (
                          <>
                            <div
                              className="fixed inset-0 z-20"
                              onClick={() => setOpenKebabMatchId(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 z-30 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 animate-in fade-in zoom-in-95 text-slate-700">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenKebabMatchId(null);
                                  onOpenResultModal(match);
                                }}
                                className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-slate-50 flex items-center gap-2 transition-colors text-slate-800"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                                <span>Editar marcador / goles</span>
                              </button>

                              <div className="my-1 border-t border-slate-100" />

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenKebabMatchId(null);
                                  if (window.confirm('¿Seguro que deseas eliminar este partido del histórico?')) {
                                    onDeleteMatch(match.id);
                                  }
                                }}
                                className="w-full px-3.5 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                <span>Eliminar partido</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Scoreboard Row */}
                <div className="py-4 grid grid-cols-1 md:grid-cols-5 items-center gap-4">
                  
                  {/* Team A */}
                  <div className="md:col-span-2 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                      A
                    </div>
                    <div>
                      <span className="font-display font-black text-slate-900 text-base block">
                        {team1Label}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {equipoAIds.length} jugadores convocados
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="md:col-span-1 flex flex-col items-center justify-center bg-slate-50 rounded-2xl py-2 px-4 border border-slate-100">
                    {isFinished || isPlaying ? (
                      <div className="flex items-center gap-3 font-display font-black text-3xl text-slate-900">
                        <span>{match.golesPFSoccer || 0}</span>
                        <span className="text-slate-300 font-light">-</span>
                        <span>{match.golesRival || 0}</span>
                      </div>
                    ) : (
                      <span className="font-display font-bold text-slate-400 text-xs">
                        VS
                      </span>
                    )}
                  </div>

                  {/* Team B */}
                  <div className="md:col-span-2 flex items-center justify-start md:justify-end gap-3 text-left md:text-right">
                    <div className="order-2 md:order-1">
                      <span className="font-display font-black text-slate-900 text-base block">
                        {team2Label}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {equipoBIds.length} jugadores convocados
                      </span>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center font-black text-xs shrink-0 order-1 md:order-2">
                      B
                    </div>
                  </div>

                </div>

                {/* Scorers Strip */}
                {(scorersList.length > 0 || mvp) && (
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    {scorersList.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-50 text-slate-800 px-2.5 py-1 rounded-xl border border-slate-200/70"
                      >
                        <span>⚽</span>
                        <span>{item.player?.nombre || 'Goleador'}</span>
                        {item.count > 1 && (
                          <span className="font-black bg-slate-900 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                            x{item.count}
                          </span>
                        )}
                      </span>
                    ))}

                    {mvp && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-50 text-amber-900 px-2.5 py-1 rounded-xl border border-amber-200">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>Figura: #{mvp.dorsal} {mvp.nombre}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Actions Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectMatchForLineup(match)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Ver en Cancha (12 vs 12)</span>
                  </button>

                  <div className="text-[11px] text-slate-400 font-medium flex items-center gap-2">
                    <span>
                      {isFinished 
                        ? 'Resultado sellado oficial' 
                        : isPlaying 
                        ? 'Partido en desarrollo' 
                        : 'Convocatoria abierta'}
                    </span>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
