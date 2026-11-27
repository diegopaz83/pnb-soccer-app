import React, { useState } from 'react';
import { Trophy, Medal, Award, Flame, Search, Users } from 'lucide-react';
import { Match, Player, TopScorerItem } from '../types';
import { calculateTopScorers } from '../utils/storage';

interface TopScorersProps {
  players: Player[];
  matches: Match[];
}

export const TopScorers: React.FC<TopScorersProps> = ({ players, matches }) => {
  const [search, setSearch] = useState('');
  const [filterPos, setFilterPos] = useState('TODAS');

  const topScorers = calculateTopScorers(players, matches);
  const totalGoalsScored = topScorers.reduce((acc, curr) => acc + curr.totalGoles, 0);

  const filteredScorers = topScorers.filter((item) => {
    const matchSearch =
      item.player.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (item.player.apodo && item.player.apodo.toLowerCase().includes(search.toLowerCase())) ||
      item.player.dorsal.toString().includes(search);

    const matchPos =
      filterPos === 'TODAS' ||
      (filterPos === 'DEL' && ['DC', 'EI', 'ED'].includes(item.player.posicion)) ||
      (filterPos === 'MED' && ['MC', 'MCD', 'MCO'].includes(item.player.posicion)) ||
      (filterPos === 'DEF' && ['DFC', 'LI', 'LD'].includes(item.player.posicion));

    return matchSearch && matchPos;
  });

  // Top 3 Podium
  const podiumTop3 = topScorers.filter((s) => s.totalGoles > 0).slice(0, 3);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-slate-900 text-xl sm:text-2xl">
                Tabla de Goleadores
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200 uppercase tracking-wide">
                Pichichi PF
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Ranking de goles anotados por cada jugador en la temporada oficial.
            </p>
          </div>
        </div>

        {/* Global stats pills */}
        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200/80">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
              Total Goles Anotados
            </span>
            <span className="font-display font-black text-2xl text-emerald-600">
              {totalGoalsScored} Goles
            </span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
              Goleadores
            </span>
            <span className="font-display font-black text-2xl text-slate-900">
              {topScorers.filter((s) => s.totalGoles > 0).length}
            </span>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {podiumTop3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {podiumTop3.map((scorer, index) => {
            const isGold = index === 0;
            const isSilver = index === 1;
            const isBronze = index === 2;

            return (
              <div
                key={scorer.player.id}
                className={`bg-white border rounded-3xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                  isGold
                    ? 'border-amber-300 ring-2 ring-amber-100'
                    : isSilver
                    ? 'border-slate-300'
                    : 'border-orange-200'
                }`}
              >
                <div>
                  {/* Rank Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-xl flex items-center gap-1 ${
                        isGold
                          ? 'bg-amber-100 text-amber-800'
                          : isSilver
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      <Medal className="w-3.5 h-3.5" />
                      #{index + 1} en la Tabla
                    </span>

                    <span className="font-display font-black text-xs text-slate-400">
                      #{scorer.player.dorsal}
                    </span>
                  </div>

                  {/* Player Avatar & Info */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-xs">
                      {scorer.player.foto ? (
                        <img
                          src={scorer.player.foto}
                          alt={scorer.player.nombre}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="flex items-center justify-center h-full font-black text-slate-600 text-base">
                          #{scorer.player.dorsal}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-display font-black text-slate-900 text-base">
                        {scorer.player.nombre}
                      </h3>
                      {scorer.player.apodo && (
                        <span className="text-xs text-emerald-700 font-bold block">
                          "{scorer.player.apodo}"
                        </span>
                      )}
                      <span className="text-xs text-slate-500 font-medium">
                        {scorer.player.posicion} • {scorer.player.piernaHabil}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stat numbers */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Promedio
                    </span>
                    <span className="font-bold text-xs text-slate-700">
                      {scorer.promedioGoles} gol/p
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Goles Totales
                    </span>
                    <span className="font-display font-black text-2xl text-emerald-600">
                      {scorer.totalGoles} ⚽
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Filter & Search Controls */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por jugador o dorsal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['TODAS', 'DEL', 'MED', 'DEF'].map((pos) => (
            <button
              key={pos}
              onClick={() => setFilterPos(pos)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterPos === pos
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pos === 'TODAS' ? 'Todas' : pos === 'DEL' ? 'Delanteros' : pos === 'MED' ? 'Medios' : 'Defensas'}
            </button>
          ))}
        </div>
      </div>

      {/* Table with All Scorers */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4 text-center w-12">#</th>
                <th className="py-3.5 px-4">Jugador</th>
                <th className="py-3.5 px-4">Posición</th>
                <th className="py-3.5 px-4 text-center">Partidos</th>
                <th className="py-3.5 px-4 text-center">Promedio</th>
                <th className="py-3.5 px-4 text-right pr-6">Goles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredScorers.map((item) => {
                const hasGoals = item.totalGoles > 0;

                return (
                  <tr
                    key={item.player.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      item.ranking === 1 && hasGoals ? 'bg-amber-50/30 font-semibold' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 text-center">
                      {item.ranking === 1 && hasGoals ? (
                        <span className="inline-flex w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-black items-center justify-center text-xs shadow-xs">
                          1
                        </span>
                      ) : item.ranking === 2 && hasGoals ? (
                        <span className="inline-flex w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-black items-center justify-center text-xs">
                          2
                        </span>
                      ) : item.ranking === 3 && hasGoals ? (
                        <span className="inline-flex w-6 h-6 rounded-full bg-orange-300 text-orange-950 font-black items-center justify-center text-xs">
                          3
                        </span>
                      ) : (
                        <span className="text-slate-400 font-bold">{item.ranking}</span>
                      )}
                    </td>

                    {/* Player Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          {item.player.foto ? (
                            <img
                              src={item.player.foto}
                              alt={item.player.nombre}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="flex items-center justify-center h-full font-bold text-xs text-slate-500">
                              #{item.player.dorsal}
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="font-bold text-slate-900 block">
                            {item.player.nombre}
                          </span>
                          {item.player.apodo && (
                            <span className="text-[10px] text-emerald-700 font-semibold">
                              "{item.player.apodo}"
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Position */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-bold text-[11px] border border-slate-200">
                        {item.player.posicion}
                      </span>
                    </td>

                    {/* Matches */}
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-600">
                      {item.partidosJugados}
                    </td>

                    {/* Average */}
                    <td className="py-3.5 px-4 text-center text-slate-500">
                      {item.promedioGoles.toFixed(2)}
                    </td>

                    {/* Total Goals */}
                    <td className="py-3.5 px-4 text-right pr-6">
                      <span
                        className={`font-display font-black text-sm ${
                          hasGoals ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        {item.totalGoles} {hasGoals ? '⚽' : ''}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
