import React, { useState } from 'react';
import { 
  Users, 
  ArrowLeftRight, 
  Sparkles, 
  CheckCircle2, 
  Search, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Calendar, 
  MapPin, 
  Edit2,
  Armchair,
  ArrowUp
} from 'lucide-react';
import { Match, Player, UserRole } from '../types';

interface ConvocatoriaViewProps {
  selectedMatch: Match;
  matches: Match[];
  players: Player[];
  role: UserRole;
  onSelectMatch: (match: Match) => void;
  onUpdateMatch: (updatedMatch: Match) => void;
  onGoToPitch: () => void;
}

export const ConvocatoriaView: React.FC<ConvocatoriaViewProps> = ({
  selectedMatch,
  matches,
  players,
  role,
  onSelectMatch,
  onUpdateMatch,
  onGoToPitch,
}) => {
  const [searchPool, setSearchPool] = useState('');
  const [editingTeamName, setEditingTeamName] = useState<'A' | 'B' | null>(null);
  const [tempTeamAName, setTempTeamAName] = useState(selectedMatch?.equipo1Nombre || 'Equipo Rojo');
  const [tempTeamBName, setTempTeamBName] = useState(selectedMatch?.equipo2Nombre || 'Equipo Blanco');

  const playerMap = new Map<string, Player>(players.map((p) => [p.id, p]));

  const equipoAIds = selectedMatch?.equipo1PlayerIds || [];
  const equipoBIds = selectedMatch?.equipo2PlayerIds || [];
  
  // Separation into Titulares (first 12) and Banca (from 13th onwards)
  const titularesA = equipoAIds.slice(0, 12);
  const bancaA = equipoAIds.slice(12);

  const titularesB = equipoBIds.slice(0, 12);
  const bancaB = equipoBIds.slice(12);

  const totalConvocados = equipoAIds.length + equipoBIds.length;

  // Available Pool in DB (Active players not yet in A or B)
  const convocadosSet = new Set([...equipoAIds, ...equipoBIds]);
  const availablePool = players.filter((p) => !convocadosSet.has(p.id) && p.status === 'activo');

  const filteredPool = availablePool.filter((p) =>
    p.nombre.toLowerCase().includes(searchPool.toLowerCase()) ||
    p.posicion.toLowerCase().includes(searchPool.toLowerCase()) ||
    p.dorsal.toString().includes(searchPool)
  );

  // Quick Action: Auto-load standard 24 players (12 for A, 12 for B)
  const handleLoadHabituales = () => {
    if (role !== 'admin') return;

    const activePlayers = players.filter((p) => p.status === 'activo');
    const first12 = activePlayers.slice(0, 12).map((p) => p.id);
    const next12 = activePlayers.slice(12, 24).map((p) => p.id);

    const updated: Match = {
      ...selectedMatch,
      equipo1PlayerIds: first12,
      equipo2PlayerIds: next12,
      convocatoria: [...first12, ...next12],
    };
    onUpdateMatch(updated);
  };

  // Quick Action: Swap teams A and B
  const handleSwapTeams = () => {
    if (role !== 'admin') return;
    const updated: Match = {
      ...selectedMatch,
      equipo1PlayerIds: equipoBIds,
      equipo2PlayerIds: equipoAIds,
      convocatoria: [...equipoBIds, ...equipoAIds],
    };
    onUpdateMatch(updated);
  };

  // Transfer a player between Team A and Team B (goes to end, so if > 12 goes to bench)
  const handleTransferPlayer = (playerId: string, from: 'A' | 'B') => {
    if (role !== 'admin') return;

    let newA = [...equipoAIds];
    let newB = [...equipoBIds];

    if (from === 'A') {
      newA = newA.filter((id) => id !== playerId);
      newB.push(playerId); // Added to B (if >= 12, goes directly to bench)
    } else {
      newB = newB.filter((id) => id !== playerId);
      newA.push(playerId); // Added to A (if >= 12, goes directly to bench)
    }

    const updated: Match = {
      ...selectedMatch,
      equipo1PlayerIds: newA,
      equipo2PlayerIds: newB,
      convocatoria: [...newA, ...newB],
    };
    onUpdateMatch(updated);
  };

  // Promote a bench player to titular (swaps with the 12th player)
  const handlePromoteToTitular = (playerId: string, team: 'A' | 'B') => {
    if (role !== 'admin') return;
    const ids = team === 'A' ? [...equipoAIds] : [...equipoBIds];
    const playerIndex = ids.indexOf(playerId);
    if (playerIndex <= 11) return; // Already titular

    // Move to titular slot (e.g. index 11), shifting the 12th to bench
    const [removed] = ids.splice(playerIndex, 1);
    ids.splice(11, 0, removed);

    const updated: Match = {
      ...selectedMatch,
      equipo1PlayerIds: team === 'A' ? ids : equipoAIds,
      equipo2PlayerIds: team === 'B' ? ids : equipoBIds,
      convocatoria: team === 'A' ? [...ids, ...equipoBIds] : [...equipoAIds, ...ids],
    };
    onUpdateMatch(updated);
  };

  // Send a titular to bench (moves to index 12+)
  const handleSendToBench = (playerId: string, team: 'A' | 'B') => {
    if (role !== 'admin') return;
    const ids = team === 'A' ? [...equipoAIds] : [...equipoBIds];
    const playerIndex = ids.indexOf(playerId);
    if (playerIndex < 0 || ids.length <= 12) return;

    const [removed] = ids.splice(playerIndex, 1);
    ids.push(removed);

    const updated: Match = {
      ...selectedMatch,
      equipo1PlayerIds: team === 'A' ? ids : equipoAIds,
      equipo2PlayerIds: team === 'B' ? ids : equipoBIds,
      convocatoria: team === 'A' ? [...ids, ...equipoBIds] : [...equipoAIds, ...ids],
    };
    onUpdateMatch(updated);
  };

  // Remove player from convocatoria back to reserve pool
  const handleRemoveFromConvocatoria = (playerId: string) => {
    if (role !== 'admin') return;
    const newA = equipoAIds.filter((id) => id !== playerId);
    const newB = equipoBIds.filter((id) => id !== playerId);

    const updated: Match = {
      ...selectedMatch,
      equipo1PlayerIds: newA,
      equipo2PlayerIds: newB,
      convocatoria: [...newA, ...newB],
    };
    onUpdateMatch(updated);
  };

  // Add available player to Team A or B (if >= 12, automatically goes to bench)
  const handleAddPlayerToTeam = (playerId: string, targetTeam: 'A' | 'B') => {
    if (role !== 'admin') return;

    const newA = [...equipoAIds];
    const newB = [...equipoBIds];

    if (targetTeam === 'A') {
      newA.push(playerId);
    } else {
      newB.push(playerId);
    }

    const updated: Match = {
      ...selectedMatch,
      equipo1PlayerIds: newA,
      equipo2PlayerIds: newB,
      convocatoria: [...newA, ...newB],
    };
    onUpdateMatch(updated);
  };

  // Save custom team name
  const handleSaveTeamName = (team: 'A' | 'B') => {
    const updated: Match = {
      ...selectedMatch,
      equipo1Nombre: team === 'A' ? tempTeamAName.trim() : selectedMatch.equipo1Nombre,
      equipo2Nombre: team === 'B' ? tempTeamBName.trim() : selectedMatch.equipo2Nombre,
    };
    onUpdateMatch(updated);
    setEditingTeamName(null);
  };

  const team1Label = selectedMatch.equipo1Nombre || 'Equipo Rojo';
  const team2Label = selectedMatch.equipo2Nombre || 'Equipo Blanco';

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Convocatoria Oficial
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {selectedMatch.fecha}
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {selectedMatch.lugar}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-slate-900 text-xl sm:text-2xl">
                {selectedMatch.jornada}
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              12 titulares en cancha por bando. Jugadores adicionales van automáticamente a la <strong>Banca de Suplentes</strong>.
            </p>
          </div>

          {/* Right Action & Status Badge */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                Total Convocados
              </span>
              <span className="font-display font-black text-xl text-slate-900">
                {totalConvocados} Jugadores
              </span>
            </div>

            <button
              onClick={onGoToPitch}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <span>Ver Cancha (12 vs 12)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Quick Admin Actions Row */}
        {role === 'admin' && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleLoadHabituales}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cargar 24 Habituales (12 y 12)</span>
              </button>

              <button
                type="button"
                onClick={handleSwapTeams}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-slate-600" />
                <span>Intercambiar Equipos (A ↔ B)</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-400 font-medium">
              Si agregas más de 12 a un equipo, los extras van a la banca de suplentes.
            </span>
          </div>
        )}
      </div>

      {/* Main 3-Column Layout: Equipo A | Equipo B | Banco de Reservas / Base de Datos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* ===================== COLUMNA EQUIPO A ===================== */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Team A Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-red-600 ring-2 ring-red-200" />
                
                {editingTeamName === 'A' ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={tempTeamAName}
                      onChange={(e) => setTempTeamAName(e.target.value)}
                      className="text-xs font-bold border border-slate-300 rounded px-2 py-0.5 w-32"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveTeamName('A')}
                      className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded font-bold"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display font-black text-slate-900 text-base">
                      {team1Label}
                    </h3>
                    {role === 'admin' && (
                      <button
                        onClick={() => setEditingTeamName('A')}
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                        title="Editar nombre"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs">
                <span className="font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                  {titularesA.length}/12 Titulares
                </span>
                {bancaA.length > 0 && (
                  <span className="font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    +{bancaA.length} Banca
                  </span>
                )}
              </div>
            </div>

            {/* SECCIÓN 1: 12 TITULARES EN CANCHA */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Titulares en Cancha ({titularesA.length}/12)
                </span>
              </div>

              <div className="space-y-1.5">
                {titularesA.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                    Sin titulares convocados en {team1Label}.
                  </div>
                ) : (
                  titularesA.map((pId, idx) => {
                    const p = playerMap.get(pId);
                    if (!p) return null;

                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 transition-colors"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-[10px] font-black text-slate-400 w-4 text-center">
                            {idx + 1}
                          </span>

                          <div className="w-7 h-7 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
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
                            <span className="text-xs font-bold text-slate-800 block truncate max-w-[130px]">
                              {p.nombre}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              #{p.dorsal} • {p.posicion}
                            </span>
                          </div>
                        </div>

                        {/* Admin Controls */}
                        {role === 'admin' && (
                          <div className="flex items-center gap-1 shrink-0">
                            {equipoAIds.length > 12 && (
                              <button
                                type="button"
                                onClick={() => handleSendToBench(p.id, 'A')}
                                title="Enviar a la Banca"
                                className="p-1 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg text-[10px]"
                              >
                                <Armchair className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleTransferPlayer(p.id, 'A')}
                              title={`Pasar a ${team2Label}`}
                              className="p-1 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg border border-slate-200"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => handleRemoveFromConvocatoria(p.id)}
                              title="Desconvocar"
                              className="p-1 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* SECCIÓN 2: BANCA DE SUPLENTES EQUIPO A */}
            {bancaA.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 flex items-center gap-1">
                    <Armchair className="w-3 h-3" />
                    Banca de Suplentes ({bancaA.length})
                  </span>
                </div>

                <div className="space-y-1.5">
                  {bancaA.map((pId) => {
                    const p = playerMap.get(pId);
                    if (!p) return null;

                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2 rounded-2xl bg-amber-50/50 hover:bg-amber-50 border border-amber-200/60 transition-colors"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1 rounded">
                            Banca
                          </span>

                          <div className="overflow-hidden">
                            <span className="text-xs font-bold text-slate-800 block truncate max-w-[130px]">
                              {p.nombre}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              #{p.dorsal} • {p.posicion}
                            </span>
                          </div>
                        </div>

                        {role === 'admin' && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handlePromoteToTitular(p.id, 'A')}
                              title="Subir a Titular"
                              className="px-2 py-0.5 bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 text-[10px] font-bold rounded-lg flex items-center gap-0.5"
                            >
                              <ArrowUp className="w-3 h-3" />
                              <span>Titular</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleTransferPlayer(p.id, 'A')}
                              title={`Pasar a ${team2Label}`}
                              className="p-1 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg border border-slate-200"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveFromConvocatoria(p.id)}
                              title="Desconvocar"
                              className="p-1 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          <div className="pt-3 mt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
            Total en {team1Label}: {equipoAIds.length} ({titularesA.length} en cancha, {bancaA.length} en banca)
          </div>
        </div>

        {/* ===================== COLUMNA EQUIPO B ===================== */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Team B Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-slate-300 ring-2 ring-slate-400" />
                
                {editingTeamName === 'B' ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={tempTeamBName}
                      onChange={(e) => setTempTeamBName(e.target.value)}
                      className="text-xs font-bold border border-slate-300 rounded px-2 py-0.5 w-32"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveTeamName('B')}
                      className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded font-bold"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display font-black text-slate-900 text-base">
                      {team2Label}
                    </h3>
                    {role === 'admin' && (
                      <button
                        onClick={() => setEditingTeamName('B')}
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                        title="Editar nombre"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs">
                <span className="font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {titularesB.length}/12 Titulares
                </span>
                {bancaB.length > 0 && (
                  <span className="font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    +{bancaB.length} Banca
                  </span>
                )}
              </div>
            </div>

            {/* SECCIÓN 1: 12 TITULARES EN CANCHA */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Titulares en Cancha ({titularesB.length}/12)
                </span>
              </div>

              <div className="space-y-1.5">
                {titularesB.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                    Sin titulares convocados en {team2Label}.
                  </div>
                ) : (
                  titularesB.map((pId, idx) => {
                    const p = playerMap.get(pId);
                    if (!p) return null;

                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 transition-colors"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-[10px] font-black text-slate-400 w-4 text-center">
                            {idx + 1}
                          </span>

                          <div className="w-7 h-7 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
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
                            <span className="text-xs font-bold text-slate-800 block truncate max-w-[130px]">
                              {p.nombre}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              #{p.dorsal} • {p.posicion}
                            </span>
                          </div>
                        </div>

                        {/* Admin Controls */}
                        {role === 'admin' && (
                          <div className="flex items-center gap-1 shrink-0">
                            {equipoBIds.length > 12 && (
                              <button
                                type="button"
                                onClick={() => handleSendToBench(p.id, 'B')}
                                title="Enviar a la Banca"
                                className="p-1 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg text-[10px]"
                              >
                                <Armchair className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleTransferPlayer(p.id, 'B')}
                              title={`Pasar a ${team1Label}`}
                              className="p-1 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg border border-slate-200"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => handleRemoveFromConvocatoria(p.id)}
                              title="Desconvocar"
                              className="p-1 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* SECCIÓN 2: BANCA DE SUPLENTES EQUIPO B */}
            {bancaB.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 flex items-center gap-1">
                    <Armchair className="w-3 h-3" />
                    Banca de Suplentes ({bancaB.length})
                  </span>
                </div>

                <div className="space-y-1.5">
                  {bancaB.map((pId) => {
                    const p = playerMap.get(pId);
                    if (!p) return null;

                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2 rounded-2xl bg-amber-50/50 hover:bg-amber-50 border border-amber-200/60 transition-colors"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1 rounded">
                            Banca
                          </span>

                          <div className="overflow-hidden">
                            <span className="text-xs font-bold text-slate-800 block truncate max-w-[130px]">
                              {p.nombre}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              #{p.dorsal} • {p.posicion}
                            </span>
                          </div>
                        </div>

                        {role === 'admin' && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handlePromoteToTitular(p.id, 'B')}
                              title="Subir a Titular"
                              className="px-2 py-0.5 bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 text-[10px] font-bold rounded-lg flex items-center gap-0.5"
                            >
                              <ArrowUp className="w-3 h-3" />
                              <span>Titular</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleTransferPlayer(p.id, 'B')}
                              title={`Pasar a ${team1Label}`}
                              className="p-1 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg border border-slate-200"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveFromConvocatoria(p.id)}
                              title="Desconvocar"
                              className="p-1 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          <div className="pt-3 mt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
            Total en {team2Label}: {equipoBIds.length} ({titularesB.length} en cancha, {bancaB.length} en banca)
          </div>
        </div>

        {/* ===================== COLUMNA 3: PLANTEL DISPONIBLE ===================== */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Base de Jugadores
                </span>
                <h3 className="font-display font-black text-slate-900 text-base">
                  Disponibles ({availablePool.length})
                </h3>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre o posición..."
                value={searchPool}
                onChange={(e) => setSearchPool(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400"
              />
            </div>

            {/* List of Available Players */}
            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredPool.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  {searchPool ? 'No hay jugadores que coincidan con la búsqueda.' : 'Todos los jugadores activos están convocados.'}
                </div>
              ) : (
                filteredPool.map((p) => {
                  const toBenchA = equipoAIds.length >= 12;
                  const toBenchB = equipoBIds.length >= 12;

                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2 rounded-2xl bg-slate-50/70 hover:bg-slate-100/90 border border-slate-200/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-7 h-7 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
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
                          <span className="text-xs font-bold text-slate-800 block truncate max-w-[120px]">
                            {p.nombre}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            #{p.dorsal} • {p.posicion}
                          </span>
                        </div>
                      </div>

                      {/* Add Buttons */}
                      {role === 'admin' && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleAddPlayerToTeam(p.id, 'A')}
                            title={`Añadir a ${team1Label} ${toBenchA ? '(a la Banca)' : '(Titular)'}`}
                            className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold rounded-lg border border-red-200 transition-colors"
                          >
                            + {team1Label.split(' ')[0]} {toBenchA ? '(Banca)' : ''}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAddPlayerToTeam(p.id, 'B')}
                            title={`Añadir a ${team2Label} ${toBenchB ? '(a la Banca)' : '(Titular)'}`}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold rounded-lg border border-slate-200 transition-colors"
                          >
                            + {team2Label.split(' ')[0]} {toBenchB ? '(Banca)' : ''}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>

          <div className="pt-3 mt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
            Plantel total: {players.length} jugadores en la escuela
          </div>
        </div>

      </div>

    </div>
  );
};
