import React, { useState } from 'react';
import { Users, CheckCircle, X, Search, Filter, Shield, Scale, Sparkles, UserCheck } from 'lucide-react';
import { Match, Player, UserRole } from '../types';

interface ConvocatoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMatch: Match;
  players: Player[];
  role: UserRole;
  onUpdateTeamsAndConvocatoria: (
    matchId: string,
    convocadosIds: string[],
    equipo1Ids: string[],
    equipo2Ids: string[],
    equipo1Nombre: string,
    equipo2Nombre: string
  ) => void;
}

export const ConvocatoriaModal: React.FC<ConvocatoriaModalProps> = ({
  isOpen,
  onClose,
  selectedMatch,
  players,
  role,
  onUpdateTeamsAndConvocatoria,
}) => {
  if (!isOpen) return null;

  const activePlayers = players.filter((p) => p.status === 'activo');
  
  // Team names
  const [eq1Name, setEq1Name] = useState<string>(
    selectedMatch.equipo1Nombre || 'Equipo Verde'
  );
  const [eq2Name, setEq2Name] = useState<string>(
    selectedMatch.equipo2Nombre || 'Equipo Blanco'
  );

  // Convocatoria selection
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (selectedMatch.convocatoria && selectedMatch.convocatoria.length > 0) {
      return [...selectedMatch.convocatoria];
    }
    // Default: all active players are already convoked!
    return activePlayers.map((p) => p.id);
  });

  // Team 1 and Team 2 assignments
  const [team1Ids, setTeam1Ids] = useState<string[]>(() => {
    if (selectedMatch.equipo1PlayerIds && selectedMatch.equipo1PlayerIds.length > 0) {
      return [...selectedMatch.equipo1PlayerIds];
    }
    // If not set, take first half of convocados
    const conv = selectedMatch.convocatoria?.length ? selectedMatch.convocatoria : activePlayers.map(p => p.id);
    const half = Math.ceil(conv.length / 2);
    return conv.slice(0, half);
  });

  const [team2Ids, setTeam2Ids] = useState<string[]>(() => {
    if (selectedMatch.equipo2PlayerIds && selectedMatch.equipo2PlayerIds.length > 0) {
      return [...selectedMatch.equipo2PlayerIds];
    }
    const conv = selectedMatch.convocatoria?.length ? selectedMatch.convocatoria : activePlayers.map(p => p.id);
    const half = Math.ceil(conv.length / 2);
    return conv.slice(half);
  });

  const [search, setSearch] = useState('');
  const [filterPos, setFilterPos] = useState<string>('TODAS');

  // Filter players
  const filteredPlayers = activePlayers.filter((p) => {
    const matchSearch =
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.cedula.includes(search) ||
      p.dorsal.toString().includes(search);
    const matchPos =
      filterPos === 'TODAS' ||
      (filterPos === 'POR' && p.posicion === 'POR') ||
      (filterPos === 'DEF' && ['DFC', 'LI', 'LD'].includes(p.posicion)) ||
      (filterPos === 'MED' && ['MC', 'MCD', 'MCO'].includes(p.posicion)) ||
      (filterPos === 'DEL' && ['DC', 'EI', 'ED'].includes(p.posicion));
    return matchSearch && matchPos;
  });

  // Assign player to Team 1, Team 2, or remove from convocation
  const handleSetPlayerTeam = (playerId: string, team: 1 | 2 | 0) => {
    if (role === 'visor') return;

    if (team === 0) {
      // Remove from convocation
      setSelectedIds(selectedIds.filter((id) => id !== playerId));
      setTeam1Ids(team1Ids.filter((id) => id !== playerId));
      setTeam2Ids(team2Ids.filter((id) => id !== playerId));
    } else if (team === 1) {
      // Add to convocation if needed, set to team 1, remove from team 2
      if (!selectedIds.includes(playerId)) {
        setSelectedIds([...selectedIds, playerId]);
      }
      if (!team1Ids.includes(playerId)) {
        setTeam1Ids([...team1Ids, playerId]);
      }
      setTeam2Ids(team2Ids.filter((id) => id !== playerId));
    } else if (team === 2) {
      // Add to convocation if needed, set to team 2, remove from team 1
      if (!selectedIds.includes(playerId)) {
        setSelectedIds([...selectedIds, playerId]);
      }
      if (!team2Ids.includes(playerId)) {
        setTeam2Ids([...team2Ids, playerId]);
      }
      setTeam1Ids(team1Ids.filter((id) => id !== playerId));
    }
  };

  // Convoke all habitual active players with one click
  const handleConvokeHabituales = () => {
    if (role === 'visor') return;
    const allIds = activePlayers.map((p) => p.id);
    setSelectedIds(allIds);

    // Distribute evenly if teams were empty
    if (team1Ids.length === 0 && team2Ids.length === 0) {
      const half = Math.ceil(allIds.length / 2);
      setTeam1Ids(allIds.slice(0, half));
      setTeam2Ids(allIds.slice(half));
    }
  };

  // Auto-balance teams by soccer position (Goalkeepers, Defenders, Midfielders, Attackers)
  const handleAutoBalance = () => {
    if (role === 'visor') return;

    const convPlayers = activePlayers.filter((p) => selectedIds.includes(p.id));
    const por = convPlayers.filter((p) => p.posicion === 'POR');
    const def = convPlayers.filter((p) => ['DFC', 'LI', 'LD'].includes(p.posicion));
    const med = convPlayers.filter((p) => ['MC', 'MCD', 'MCO'].includes(p.posicion));
    const del = convPlayers.filter((p) => ['DC', 'EI', 'ED'].includes(p.posicion));

    const t1: string[] = [];
    const t2: string[] = [];

    const distribute = (group: Player[]) => {
      group.forEach((p, idx) => {
        if (idx % 2 === 0) {
          t1.push(p.id);
        } else {
          t2.push(p.id);
        }
      });
    };

    distribute(por);
    distribute(def);
    distribute(med);
    distribute(del);

    setTeam1Ids(t1);
    setTeam2Ids(t2);
  };

  const handleSave = () => {
    onUpdateTeamsAndConvocatoria(
      selectedMatch.id,
      selectedIds,
      team1Ids,
      team2Ids,
      eq1Name,
      eq2Name
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Organizador del Partido
              </span>
            </div>
            <h2 className="font-display font-black text-slate-900 text-xl mt-1.5">
              Convocatoria y Armado de Equipos
            </h2>
            <p className="text-xs text-slate-500">
              {selectedMatch.jornada} • Asigna fácilmente cada jugador al <strong>Equipo 1</strong> o al <strong>Equipo 2</strong>.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Team Configuration Strip & Quick Actions */}
        <div className="py-3 border-b border-slate-100 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Team 1 box */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-600 shadow-sm" />
                {role === 'admin' ? (
                  <input
                    type="text"
                    value={eq1Name}
                    onChange={(e) => setEq1Name(e.target.value)}
                    placeholder="Nombre Equipo 1"
                    className="bg-transparent font-bold text-sm text-emerald-950 focus:outline-none border-b border-emerald-300 focus:border-emerald-600 px-1 py-0.5"
                  />
                ) : (
                  <span className="font-bold text-sm text-emerald-950 px-1 py-0.5">
                    {eq1Name}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-xl shadow-xs border border-emerald-200">
                {team1Ids.length} jugadores
              </span>
            </div>

            {/* Team 2 box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-400 shadow-sm" />
                {role === 'admin' ? (
                  <input
                    type="text"
                    value={eq2Name}
                    onChange={(e) => setEq2Name(e.target.value)}
                    placeholder="Nombre Equipo 2"
                    className="bg-transparent font-bold text-sm text-slate-900 focus:outline-none border-b border-slate-300 focus:border-slate-600 px-1 py-0.5"
                  />
                ) : (
                  <span className="font-bold text-sm text-slate-900 px-1 py-0.5">
                    {eq2Name}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-xl shadow-xs border border-slate-200">
                {team2Ids.length} jugadores
              </span>
            </div>
          </div>

          {/* Quick Buttons: Habituales & Equilibrar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {role === 'admin' ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleConvokeHabituales}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Convocar Habituales ({activePlayers.length})</span>
                </button>

                <button
                  type="button"
                  onClick={handleAutoBalance}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100/70 hover:bg-emerald-200/70 text-emerald-800 font-bold text-xs transition-colors"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Equilibrar 50/50 por Posición</span>
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-500 font-medium italic">
                Alineación y convocatoria oficial del partido
              </div>
            )}

            <span className="text-xs text-slate-500 font-medium">
              Total Convocados: <strong className="text-slate-900">{selectedIds.length}</strong>
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="py-3 flex flex-col sm:flex-row gap-2 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nombre o dorsal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            {['TODAS', 'POR', 'DEF', 'MED', 'DEL'].map((pos) => (
              <button
                key={pos}
                onClick={() => setFilterPos(pos)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  filterPos === pos
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* Players List with 1-Click Team Assignment */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-96">
          {filteredPlayers.map((player) => {
            const isTeam1 = team1Ids.includes(player.id);
            const isTeam2 = team2Ids.includes(player.id);
            const isConvoked = selectedIds.includes(player.id);

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isTeam1
                    ? 'bg-emerald-50/50 border-emerald-300'
                    : isTeam2
                    ? 'bg-slate-100/60 border-slate-300'
                    : isConvoked
                    ? 'bg-amber-50/40 border-amber-200'
                    : 'bg-white border-slate-200 opacity-60'
                }`}
              >
                {/* Player details */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    {player.foto ? (
                      <img
                        src={player.foto}
                        alt={player.nombre}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="flex items-center justify-center h-full font-bold text-xs text-slate-600">
                        #{player.dorsal}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {player.nombre}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        #{player.dorsal}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {player.posicion} • {player.piernaHabil}
                    </span>
                  </div>
                </div>

                {/* Team Selector Buttons */}
                <div className="flex items-center gap-1.5">
                  {role === 'admin' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSetPlayerTeam(player.id, 1)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isTeam1
                            ? 'bg-emerald-600 text-white shadow-xs scale-105'
                            : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800'
                        }`}
                      >
                        🟢 {eq1Name.split(' ')[0]}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetPlayerTeam(player.id, 2)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isTeam2
                            ? 'bg-slate-800 text-white shadow-xs scale-105'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                        }`}
                      >
                        ⚪ {eq2Name.split(' ')[0]}
                      </button>

                      {isConvoked && (
                        <button
                          type="button"
                          onClick={() => handleSetPlayerTeam(player.id, 0)}
                          title="Quitar de la convocatoria"
                          className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-xs font-bold">
                      {isTeam1 ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white shadow-xs inline-block">
                          🟢 {eq1Name.split(' ')[0]}
                        </span>
                      ) : isTeam2 ? (
                        <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-white shadow-xs inline-block">
                          ⚪ {eq2Name.split(' ')[0]}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-400 text-[11px]">
                          No convocado
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            {role === 'admin'
              ? 'El administrador siempre puede ajustar los dos equipos en cualquier momento.'
              : 'Vista de convocatoria oficial para jugadores y espectadores.'}
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {role === 'admin' ? 'Cancelar' : 'Cerrar'}
            </button>
            {role === 'admin' && (
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
              >
                Guardar Equipos y Convocatoria
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
