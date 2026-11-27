import React, { useState } from 'react';
import { X, Calendar, MapPin, Clock, PlusCircle } from 'lucide-react';
import { FORMATIONS_12 } from '../data/initialData';
import { Match, Player } from '../types';

interface NewMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onSaveNewMatch: (newMatch: Match) => void;
}

export const NewMatchModal: React.FC<NewMatchModalProps> = ({
  isOpen,
  onClose,
  players,
  onSaveNewMatch,
}) => {
  if (!isOpen) return null;

  const [jornada, setJornada] = useState(`Partido Semanal 12 vs 12 (#${Date.now().toString().slice(-2)})`);
  const [equipo1Nombre, setEquipo1Nombre] = useState('Equipo Rojo');
  const [equipo2Nombre, setEquipo2Nombre] = useState('Equipo Blanco');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState('09:30 AM');
  const [lugar, setLugar] = useState('Sede Principal PF Soccer - Cancha 1');
  const [formacionId, setFormacionId] = useState('1-4-4-3');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipo1Nombre.trim() || !equipo2Nombre.trim()) return;

    // Pick 24 active players
    const activePlayers = players.filter((p) => p.status === 'activo');
    const eq1 = activePlayers.slice(0, 12).map((p) => p.id);
    const eq2 = activePlayers.slice(12, 24).map((p) => p.id);

    const newMatch: Match = {
      id: `m-${Date.now()}`,
      jornada: jornada.trim(),
      fecha,
      hora: hora.trim(),
      equipo1Nombre: equipo1Nombre.trim(),
      equipo2Nombre: equipo2Nombre.trim(),
      equipo1Color: 'rojo',
      equipo2Color: 'blanco',
      lugar: lugar.trim(),
      estado: 'programado',
      golesPFSoccer: 0,
      golesRival: 0,
      playerGoals: {},
      convocatoria: [...eq1, ...eq2],
      equipo1PlayerIds: eq1,
      equipo2PlayerIds: eq2,
      formacionId,
      cronica: 'Encuentro programado para la jornada 12 vs 12.',
    };

    onSaveNewMatch(newMatch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Nuevo Partido
            </span>
            <h2 className="font-display font-black text-slate-900 text-lg">
              Programar Partido Semanal (12 vs 12)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nombre de la Jornada *
            </label>
            <input
              type="text"
              required
              value={jornada}
              onChange={(e) => setJornada(e.target.value)}
              placeholder="Ej: Semana 5 - Partido 12 vs 12"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Teams Config */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              Equipos (12 jugadores por bando)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  Equipo A
                </label>
                <input
                  type="text"
                  required
                  value={equipo1Nombre}
                  onChange={(e) => setEquipo1Nombre(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 ring-1 ring-slate-400" />
                  Equipo B
                </label>
                <input
                  type="text"
                  required
                  value={equipo2Nombre}
                  onChange={(e) => setEquipo2Nombre(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Date & Hour */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Fecha *
              </label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Hora *
              </label>
              <input
                type="text"
                required
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                placeholder="Ej: 09:30 AM"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Lugar / Cancha *
            </label>
            <input
              type="text"
              required
              value={lugar}
              onChange={(e) => setLugar(e.target.value)}
              placeholder="Ej: Sede Principal PF Soccer - Cancha 1"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Formation */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Formación Táctica Inicial
            </label>
            <select
              value={formacionId}
              onChange={(e) => setFormacionId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
            >
              {FORMATIONS_12.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs transition-colors"
            >
              Crear Partido (24 Convocados)
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
