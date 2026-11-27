import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  Phone, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  MessageCircle,
  Trophy,
  Calendar,
  Shield
} from 'lucide-react';
import { Match, Player, UserRole } from '../types';

interface PlayersAdminProps {
  players: Player[];
  matches: Match[];
  role: UserRole;
  onOpenNewPlayerModal: () => void;
  onOpenEditPlayerModal: (player: Player) => void;
  onTogglePlayerStatus: (playerId: string) => void;
  onDeletePlayer: (playerId: string) => void;
}

export const PlayersAdmin: React.FC<PlayersAdminProps> = ({
  players,
  matches,
  role,
  onOpenNewPlayerModal,
  onOpenEditPlayerModal,
  onTogglePlayerStatus,
  onDeletePlayer,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  const [positionFilter, setPositionFilter] = useState<string>('todos');
  const [selectedPlayerForDetail, setSelectedPlayerForDetail] = useState<Player | null>(null);

  // Goal counts per player
  const playerGoalsCount = React.useMemo(() => {
    const map: Record<string, number> = {};
    matches.forEach((m) => {
      if (m.playerGoals) {
        Object.entries(m.playerGoals).forEach(([pId, count]) => {
          map[pId] = (map[pId] || 0) + Number(count);
        });
      } else if (m.golesDetalle) {
        m.golesDetalle.forEach((g) => {
          map[g.playerId] = (map[g.playerId] || 0) + 1;
        });
      }
    });
    return map;
  }, [matches]);

  const filteredPlayers = players.filter((p) => {
    const matchSearch =
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.cedula.includes(search) ||
      p.telefono.includes(search) ||
      (p.apodo && p.apodo.toLowerCase().includes(search.toLowerCase())) ||
      p.dorsal.toString().includes(search);

    const matchStatus = statusFilter === 'todos' || p.status === statusFilter;

    const matchPos =
      positionFilter === 'todos' ||
      (positionFilter === 'POR' && p.posicion === 'POR') ||
      (positionFilter === 'DEF' && ['DFC', 'LI', 'LD'].includes(p.posicion)) ||
      (positionFilter === 'MED' && ['MC', 'MCD', 'MCO'].includes(p.posicion)) ||
      (positionFilter === 'DEL' && ['DC', 'EI', 'ED'].includes(p.posicion));

    return matchSearch && matchStatus && matchPos;
  });

  const activeCount = players.filter((p) => p.status === 'activo').length;
  const inactiveCount = players.filter((p) => p.status === 'inactivo').length;

  if (role === 'visor') {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm my-8 animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
          <Shield className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/60 px-2.5 py-1 rounded-full border border-amber-200">
            Protección de Datos Personales
          </span>
          <h3 className="font-display font-black text-slate-900 text-2xl">
            Plantel Confidencial
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            El directorio privado del plantel contiene teléfonos, cédulas y datos personales de los jugadores. Esta información está protegida y sólo puede ser gestionada por el Administrador Técnico.
          </p>
        </div>
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
          💡 Puedes consultar la alineación pública, convocados y la tabla de goleadores desde las demás secciones.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-slate-900 text-xl sm:text-2xl">
                Plantel de Jugadores
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                {players.length} Total
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {role === 'admin'
                ? 'Administración de ficha técnica, fotos, contacto y estado de cada integrante.'
                : 'Directorio oficial y nómina de jugadores de PF SOCCER.'}
            </p>
          </div>
        </div>

        {/* Actions & Status Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <strong>{activeCount}</strong> Activos
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <strong>{inactiveCount}</strong> Inactivos
            </span>
          </div>

          {role === 'admin' && (
            <button
              onClick={onOpenNewPlayerModal}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nuevo Jugador</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre, cédula, dorsal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['todos', 'activo', 'inactivo'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Position filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'todos', label: 'Todas' },
              { id: 'POR', label: 'POR' },
              { id: 'DEF', label: 'DEF' },
              { id: 'MED', label: 'MED' },
              { id: 'DEL', label: 'DEL' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPositionFilter(p.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  positionFilter === p.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Players Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPlayers.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400">
            No se encontraron jugadores que coincidan con los filtros.
          </div>
        ) : (
          filteredPlayers.map((player) => {
            const isActive = player.status === 'activo';
            const totalGoals = playerGoalsCount[player.id] || 0;

            return (
              <div
                key={player.id}
                className={`bg-white border rounded-3xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  isActive ? 'border-slate-200' : 'border-slate-200 bg-slate-50/50 opacity-75'
                }`}
              >
                <div>
                  {/* Top card bar: dorsal, status & position badge */}
                  <div className="flex items-center justify-between">
                    <span className="font-display font-black text-base text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-xl border border-slate-200">
                      #{player.dorsal}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {player.posicion}
                      </span>

                      {role === 'admin' ? (
                        <button
                          type="button"
                          onClick={() => onTogglePlayerStatus(player.id)}
                          title="Cambiar estado activo/inactivo"
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{isActive ? 'Activo' : 'Inactivo'}</span>
                        </button>
                      ) : (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Photo & Name */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-xs">
                      {player.foto ? (
                        <img
                          src={player.foto}
                          alt={player.nombre}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="flex items-center justify-center h-full font-black text-slate-400 text-sm">
                          #{player.dorsal}
                        </span>
                      )}
                    </div>

                    <div className="overflow-hidden">
                      <h3 className="font-display font-black text-slate-900 text-sm truncate">
                        {player.nombre}
                      </h3>
                      {player.apodo && (
                        <span className="text-xs text-emerald-700 font-bold block truncate">
                          "{player.apodo}"
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500 font-medium block">
                        Pie {player.piernaHabil}
                      </span>
                    </div>
                  </div>

                  {/* Attributes snippet */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Cédula
                      </span>
                      <span className="font-semibold text-slate-800">{player.cedula}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Teléfono
                      </span>
                      <a
                        href={`https://wa.me/57${player.telefono.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:underline font-semibold flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        {player.telefono}
                      </a>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> Goles en Escuela
                      </span>
                      <span className="font-black text-emerald-700">
                        {totalGoals} ⚽
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlayerForDetail(player)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
                  >
                    Ver Ficha
                  </button>

                  {role === 'admin' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onOpenEditPlayerModal(player)}
                        title="Editar datos del jugador"
                        className="p-1.5 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeletePlayer(player.id)}
                        title="Eliminar jugador"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Player Detail Modal */}
      {selectedPlayerForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Ficha Técnica Oficial
              </span>
              <button
                onClick={() => setSelectedPlayerForDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                {selectedPlayerForDetail.foto ? (
                  <img
                    src={selectedPlayerForDetail.foto}
                    alt={selectedPlayerForDetail.nombre}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="flex items-center justify-center h-full font-black text-slate-500 text-lg">
                    #{selectedPlayerForDetail.dorsal}
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-display font-black text-slate-900 text-lg">
                  {selectedPlayerForDetail.nombre}
                </h3>
                {selectedPlayerForDetail.apodo && (
                  <span className="text-xs text-emerald-700 font-bold block">
                    "{selectedPlayerForDetail.apodo}"
                  </span>
                )}
                <span className="text-xs text-slate-500 font-medium">
                  Dorsal #{selectedPlayerForDetail.dorsal} • {selectedPlayerForDetail.posicion}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div className="flex justify-between">
                <span className="text-slate-500">Cédula:</span>
                <span className="font-bold text-slate-800">{selectedPlayerForDetail.cedula}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Teléfono:</span>
                <span className="font-bold text-slate-800">{selectedPlayerForDetail.telefono}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pierna Hábil:</span>
                <span className="font-bold text-slate-800">{selectedPlayerForDetail.piernaHabil}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Goles en Temporada:</span>
                <span className="font-black text-emerald-700">
                  {playerGoalsCount[selectedPlayerForDetail.id] || 0} ⚽
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estado en Escuela:</span>
                <span className={`font-bold capitalize ${selectedPlayerForDetail.status === 'activo' ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {selectedPlayerForDetail.status}
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPlayerForDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
