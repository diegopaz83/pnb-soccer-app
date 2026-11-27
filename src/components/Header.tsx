import React from 'react';
import { Shield, Users, Trophy, Calendar, Eye, RefreshCw, LayoutGrid, LogOut, Flame } from 'lucide-react';
import { UserRole } from '../types';

export type AppTab = 'convocatoria' | 'cancha' | 'partidos' | 'goleadores' | 'jugadores';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  role: UserRole;
  onToggleRole: () => void;
  totalPlayers: number;
  activePlayers: number;
  totalMatches: number;
  totalGoals: number;
  convocadosCount: number;
  onResetDemoData: () => void;
  seasonName?: string;
  onOpenSeasonModal?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  role,
  onToggleRole,
  activePlayers,
  totalMatches,
  totalGoals,
  convocadosCount,
  onResetDemoData,
  seasonName = 'Temporada Regular',
  onOpenSeasonModal,
  onLogout,
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top brand & controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-3 border-b border-slate-100">
          
          {/* Logo & School Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs shrink-0">
              <span className="font-display font-black text-sm tracking-wider">PF</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg font-black tracking-tight text-slate-900">
                  PF SOCCER
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200 uppercase tracking-wide">
                  12 vs 12
                </span>
                {onOpenSeasonModal && (
                  <button
                    type="button"
                    onClick={onOpenSeasonModal}
                    title="Ver Marcador Global de la Temporada"
                    className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-black border border-amber-200 uppercase tracking-wide hover:bg-amber-100 transition-colors flex items-center gap-1"
                  >
                    <Trophy className="w-3 h-3 text-amber-600" />
                    <span>{seasonName}</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Convocatoria, Pizarra Táctica y Goleadores
              </p>
            </div>
          </div>

          {/* Role Indicator & Summary Pills */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5">
            
            {/* Quick stats on desktop */}
            <div className="hidden md:flex items-center gap-3 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-600" />
                <span><strong className="text-slate-900">{convocadosCount}</strong> Convocados</span>
              </div>
              <div className="w-px h-3 bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-600" />
                <span><strong className="text-slate-900">{totalMatches}</strong> Partidos</span>
              </div>
              <div className="w-px h-3 bg-slate-200" />
              <button
                type="button"
                onClick={onOpenSeasonModal}
                className="flex items-center gap-1.5 hover:text-amber-700 transition-colors"
                title="Ver Marcador Global de Temporada"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span><strong className="text-slate-900">{totalGoals}</strong> Goles</span>
              </button>
            </div>

            {/* Role indicator */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                id="role-indicator-btn"
                onClick={onToggleRole}
                title={role === 'admin' ? 'Sesión de Administrador activa' : 'Cambiar a Administrador con clave'}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  role === 'admin'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Admin</span>
              </button>

              <button
                id="role-visor-btn"
                onClick={onToggleRole}
                title="Modo Visor (Solo lectura)"
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  role === 'visor'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>Visor</span>
              </button>
            </div>

            {/* Logout button to return to Landing Page */}
            {onLogout && (
              <button
                id="header-logout-btn"
                onClick={onLogout}
                title="Cerrar sesión / Salir a la página de bienvenida"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            {/* Reset / Demo Data button (Admin only) */}
            {role === 'admin' && (
              <button
                id="reset-demo-btn"
                onClick={onResetDemoData}
                title="Restaurar datos iniciales"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1.5 py-2 overflow-x-auto no-scrollbar">
          
          <button
            id="nav-tab-convocatoria"
            onClick={() => setActiveTab('convocatoria')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'convocatoria'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Convocatoria (24)</span>
          </button>

          <button
            id="nav-tab-cancha"
            onClick={() => setActiveTab('cancha')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'cancha'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Cancha (12 vs 12)</span>
          </button>

          <button
            id="nav-tab-partidos"
            onClick={() => setActiveTab('partidos')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'partidos'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Partidos & Goles</span>
          </button>

          <button
            id="nav-tab-goleadores"
            onClick={() => setActiveTab('goleadores')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'goleadores'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Goleadores</span>
          </button>

          {/* Plantel tab is hidden for visor */}
          {role === 'admin' && (
            <button
              id="nav-tab-jugadores"
              onClick={() => setActiveTab('jugadores')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'jugadores'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Plantel General ({activePlayers})</span>
            </button>
          )}

        </nav>

      </div>

      {/* Mobile-First Fixed Bottom Navigation Bar (Thumb-friendly on mobile screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-2 py-2 shadow-lg">
        <div className="flex items-center justify-around">
          <button
            type="button"
            onClick={() => setActiveTab('convocatoria')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] min-w-[56px] ${
              activeTab === 'convocatoria'
                ? 'text-slate-900 font-black'
                : 'text-slate-400 font-semibold hover:text-slate-700'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'convocatoria' ? 'bg-slate-900 text-white' : ''}`}>
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-0.5">Convocatoria</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cancha')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] min-w-[56px] ${
              activeTab === 'cancha'
                ? 'text-slate-900 font-black'
                : 'text-slate-400 font-semibold hover:text-slate-700'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'cancha' ? 'bg-slate-900 text-white' : ''}`}>
              <LayoutGrid className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-0.5">Cancha</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('partidos')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] min-w-[56px] ${
              activeTab === 'partidos'
                ? 'text-slate-900 font-black'
                : 'text-slate-400 font-semibold hover:text-slate-700'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'partidos' ? 'bg-slate-900 text-white' : ''}`}>
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-0.5">Partidos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('goleadores')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] min-w-[56px] ${
              activeTab === 'goleadores'
                ? 'text-slate-900 font-black'
                : 'text-slate-400 font-semibold hover:text-slate-700'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'goleadores' ? 'bg-slate-900 text-white' : ''}`}>
              <Trophy className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-0.5">Goles</span>
          </button>

          {/* Plantel tab only on mobile if admin */}
          {role === 'admin' && (
            <button
              type="button"
              onClick={() => setActiveTab('jugadores')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] min-w-[56px] ${
                activeTab === 'jugadores'
                  ? 'text-slate-900 font-black'
                  : 'text-slate-400 font-semibold hover:text-slate-700'
              }`}
            >
              <div className={`p-1 rounded-lg ${activeTab === 'jugadores' ? 'bg-slate-900 text-white' : ''}`}>
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5">Plantel</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
