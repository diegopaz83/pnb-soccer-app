import React, { useState, useEffect } from 'react';
import { 
  Header, 
  AppTab 
} from './components/Header';
import { 
  ConvocatoriaView 
} from './components/ConvocatoriaView';
import { 
  PitchView 
} from './components/PitchView';
import { 
  MatchesHistory 
} from './components/MatchesHistory';
import { 
  TopScorers 
} from './components/TopScorers';
import { 
  PlayersAdmin 
} from './components/PlayersAdmin';
import { 
  PlayerModal 
} from './components/PlayerModal';
import { 
  NewMatchModal 
} from './components/NewMatchModal';
import { 
  MatchResultModal 
} from './components/MatchResultModal';
import { 
  RoleSwitchModal 
} from './components/RoleSwitchModal';
import { 
  ConfirmModal 
} from './components/ConfirmModal';
import { 
  LandingLogin 
} from './components/LandingLogin';
import { 
  SeasonScoreboardModal 
} from './components/SeasonScoreboardModal';
import { 
  Match, 
  Player, 
  UserRole,
  AuthSession,
  SeasonInfo 
} from './types';
import { INITIAL_MATCHES } from './data/initialData';
import { 
  loadStoredMatches, 
  loadStoredPlayers, 
  loadStoredRole, 
  resetAllToDefault, 
  saveStoredMatches, 
  saveStoredPlayers, 
  saveStoredRole,
  loadStoredAuthSession,
  saveStoredAuthSession,
  clearStoredAuthSession,
  loadStoredSeason,
  saveStoredSeason,
  startNewSeason,
  calculateSeasonGlobalScoreboard
} from './utils/storage';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  // Authentication & Landing State
  const [session, setSession] = useState<AuthSession>(loadStoredAuthSession);

  // Navigation & Role State
  const [activeTab, setActiveTab] = useState<AppTab>('convocatoria');
  const [role, setRole] = useState<UserRole>(() => {
    const saved = loadStoredAuthSession();
    return saved.isLoggedIn ? saved.role : loadStoredRole();
  });

  // Season State & Modals
  const [season, setSeason] = useState<SeasonInfo>(loadStoredSeason);
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);

  // Core Data
  const [players, setPlayers] = useState<Player[]>(loadStoredPlayers);
  const [matches, setMatches] = useState<Match[]>(loadStoredMatches);

  // Active selected match for tactical board & convocatoria
  const [selectedMatch, setSelectedMatch] = useState<Match>(() => {
    const loaded = loadStoredMatches();
    const upcoming = loaded.find((m) => m.estado === 'programado');
    return upcoming || loaded[0] || INITIAL_MATCHES[0];
  });

  // Modals state
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);

  const [isNewMatchModalOpen, setIsNewMatchModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [matchToResult, setMatchToResult] = useState<Match | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // In-app safe confirmation modal state (replaces window.confirm)
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Ensure visor cannot be in sensitive players tab
  useEffect(() => {
    if (role === 'visor' && activeTab === 'jugadores') {
      setActiveTab('cancha');
    }
  }, [role, activeTab]);

  // Sync to localStorage
  useEffect(() => {
    saveStoredPlayers(players);
  }, [players]);

  useEffect(() => {
    saveStoredMatches(matches);
    if (!selectedMatch || !matches.some((m) => m.id === selectedMatch.id)) {
      const fallback = matches.find((m) => m.estado === 'programado') || matches[0] || INITIAL_MATCHES[0];
      setSelectedMatch(fallback);
    }
  }, [matches, selectedMatch]);

  useEffect(() => {
    saveStoredRole(role);
  }, [role]);

  // Auth Handlers
  const handleLogin = (loginRole: UserRole, userHandle: string) => {
    const newSession: AuthSession = {
      isLoggedIn: true,
      role: loginRole,
      userHandle,
      loginTime: new Date().toISOString(),
    };
    saveStoredAuthSession(newSession);
    setSession(newSession);
    setRole(loginRole);
    if (loginRole === 'visor') {
      setActiveTab('cancha');
    }
    showToast(`¡Bienvenido a PF SOCCER como ${loginRole === 'admin' ? 'Administrador' : 'Jugador / Visor'}!`);
  };

  const handleLogout = () => {
    clearStoredAuthSession();
    const cleanSession: AuthSession = { isLoggedIn: false, role: 'visor', userHandle: '' };
    setSession(cleanSession);
    setRole('visor');
    showToast('Sesión cerrada. Regresando a la página de bienvenida.');
  };

  // Season Handlers
  const scoreboard = calculateSeasonGlobalScoreboard(matches, players);

  const handleStartNewSeason = (newSeasonName: string) => {
    const { newSeason: updatedSeason, newMatches } = startNewSeason(newSeasonName, players);
    setMatches(newMatches);
    setSeason(updatedSeason);
    if (newMatches.length > 0) {
      setSelectedMatch(newMatches[0]);
    }
    showToast(`¡Nueva temporada "${newSeasonName}" iniciada! Partidos y goleadores reiniciados.`);
  };

  const handleUpdateSeasonName = (newName: string) => {
    const updated = { ...season, name: newName };
    saveStoredSeason(updated);
    setSeason(updated);
    showToast(`Nombre de temporada actualizado a "${newName}".`);
  };

  // Player Handlers
  const handleSavePlayer = (player: Player) => {
    setPlayers((prev) => {
      const exists = prev.some((p) => p.id === player.id);
      if (exists) {
        showToast(`Jugador ${player.nombre} actualizado.`);
        return prev.map((p) => (p.id === player.id ? player : p));
      } else {
        showToast(`Jugador ${player.nombre} añadido al plantel.`);
        return [player, ...prev];
      }
    });
  };

  const handleTogglePlayerStatus = (playerId: string) => {
    if (role === 'visor') return;
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === playerId) {
          const newStatus = p.status === 'activo' ? 'inactivo' : 'activo';
          showToast(`${p.nombre} marcado como ${newStatus.toUpperCase()}`);
          return { ...p, status: newStatus };
        }
        return p;
      })
    );
  };

  const handleDeletePlayer = (playerId: string) => {
    if (role === 'visor') return;
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    setConfirmModalConfig({
      isOpen: true,
      title: 'Eliminar Jugador',
      message: `¿Estás seguro de que deseas eliminar a ${player.nombre} (#${player.dorsal}) del plantel de PF SOCCER? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar Jugador',
      isDanger: true,
      onConfirm: () => {
        setPlayers((prev) => prev.filter((p) => p.id !== playerId));
        // Also remove from any matches if currently convocated
        setMatches((prev) =>
          prev.map((m) => ({
            ...m,
            equipo1PlayerIds: m.equipo1PlayerIds?.filter((id) => id !== playerId) || [],
            equipo2PlayerIds: m.equipo2PlayerIds?.filter((id) => id !== playerId) || [],
            convocatoria: m.convocatoria?.filter((id) => id !== playerId) || [],
          }))
        );
        showToast(`Jugador ${player.nombre} eliminado del plantel.`);
      },
    });
  };

  // Match Handlers
  const handleStartNewConvocatoria = () => {
    const nextNumber = matches.length + 1;
    const nextJornada = `Jornada ${nextNumber} - Torneo 12v12`;

    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const activePlayers = players.filter((p) => p.status === 'activo');
    const team1Ids = activePlayers.slice(0, 12).map((p) => p.id);
    const team2Ids = activePlayers.slice(12, 24).map((p) => p.id);
    const allConvocados = [...team1Ids, ...team2Ids];

    const newMatch: Match = {
      id: `match-${Date.now()}`,
      jornada: nextJornada,
      fecha: formattedDate,
      hora: '19:00',
      lugar: 'Cancha Principal PF (12v12)',
      equipo1Nombre: 'Equipo Rojo',
      equipo2Nombre: 'Equipo Blanco',
      formacionId: '1-4-4-3',
      equipo1PlayerIds: team1Ids,
      equipo2PlayerIds: team2Ids,
      convocatoria: allConvocados,
      golesPFSoccer: 0,
      golesRival: 0,
      estado: 'programado',
      playerGoals: {},
    };

    setMatches((prev) => [newMatch, ...prev]);
    setSelectedMatch(newMatch);
    setActiveTab('convocatoria');
    showToast(`¡Nueva convocatoria iniciada para la ${nextJornada}!`);
  };

  const handleSaveNewMatch = (newMatch: Match) => {
    setMatches((prev) => [newMatch, ...prev]);
    setSelectedMatch(newMatch);
    setActiveTab('convocatoria');
    showToast(`Partido "${newMatch.jornada}" programado con 24 convocados.`);
  };

  const handleUpdateMatch = (updatedMatch: Match) => {
    setMatches((prev) => prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m)));
    if (selectedMatch.id === updatedMatch.id) {
      setSelectedMatch(updatedMatch);
    }
  };

  const handleSaveMatchResult = (updatedMatch: Match) => {
    handleUpdateMatch(updatedMatch);
    setIsResultModalOpen(false);
    showToast(`Marcador y goles guardados correctamente.`);
  };

  const handleDeleteMatch = (matchId: string) => {
    if (role === 'visor') return;
    const targetMatch = matches.find((m) => m.id === matchId);

    setConfirmModalConfig({
      isOpen: true,
      title: 'Eliminar Partido',
      message: `¿Estás seguro de eliminar el partido "${targetMatch?.jornada || 'Seleccionado'}" del historial?`,
      confirmLabel: 'Eliminar Partido',
      isDanger: true,
      onConfirm: () => {
        const remaining = matches.filter((m) => m.id !== matchId);
        setMatches(remaining);
        if (selectedMatch.id === matchId && remaining.length > 0) {
          setSelectedMatch(remaining[0]);
        }
        showToast('Partido eliminado del historial.');
      },
    });
  };

  // Reset demo data
  const handleResetDemoData = () => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Restaurar Datos Oficiales',
      message: '¿Deseas restaurar todos los datos iniciales de PF SOCCER (12 vs 12, 24 convocados, historial y goleadores)?',
      confirmLabel: 'Restaurar Datos',
      isDanger: false,
      onConfirm: () => {
        const def = resetAllToDefault();
        setPlayers(def.players);
        setMatches(def.matches);
        setRole('admin');
        setSelectedMatch(def.matches[3] || def.matches[0]);
        showToast('Datos de ejemplo de PF SOCCER restaurados.');
      },
    });
  };

  // Aggregated stats
  const activePlayersCount = players.filter((p) => p.status === 'activo').length;
  const totalGoals = matches.reduce((acc, m) => acc + (m.golesPFSoccer || 0) + (m.golesRival || 0), 0);
  const convocadosCount = ((selectedMatch?.equipo1PlayerIds?.length || 0) + (selectedMatch?.equipo2PlayerIds?.length || 0));

  // If user hasn't logged in, show the Landing Login Page
  if (!session.isLoggedIn) {
    return <LandingLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-slate-900 flex flex-col selection:bg-slate-200">
      
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role={role}
        onToggleRole={() => setIsRoleModalOpen(true)}
        totalPlayers={players.length}
        activePlayers={activePlayersCount}
        totalMatches={matches.length}
        totalGoals={totalGoals}
        convocadosCount={convocadosCount}
        onResetDemoData={handleResetDemoData}
        seasonName={season.name}
        onOpenSeasonModal={() => setIsSeasonModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area (with bottom padding for mobile-first bottom nav bar) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-8">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Tab 1: Convocatoria & Equipos (24 convocados: 12 en Equipo A, 12 en Equipo B) */}
        {activeTab === 'convocatoria' && (
          <ConvocatoriaView
            selectedMatch={selectedMatch}
            matches={matches}
            players={players}
            role={role}
            onSelectMatch={setSelectedMatch}
            onUpdateMatch={handleUpdateMatch}
            onGoToPitch={() => setActiveTab('cancha')}
          />
        )}

        {/* Tab 2: Cancha Táctica (12 vs 12 - 24 jugadores en cancha simultáneamente) */}
        {activeTab === 'cancha' && (
          <PitchView
            players={players}
            matches={matches}
            selectedMatch={selectedMatch}
            role={role}
            onSelectMatch={setSelectedMatch}
            onUpdateMatch={handleUpdateMatch}
            onOpenConvocatoria={() => setActiveTab('convocatoria')}
            onStartNewConvocatoria={handleStartNewConvocatoria}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onOpenResultModal={(match) => {
              setMatchToResult(match);
              setIsResultModalOpen(true);
            }}
          />
        )}

        {/* Tab 3: Partidos & Goles (Histórico Oficial) */}
        {activeTab === 'partidos' && (
          <MatchesHistory
            matches={matches}
            players={players}
            role={role}
            onGoToConvocatoria={() => setActiveTab('convocatoria')}
            onOpenNewMatchModal={handleStartNewConvocatoria}
            onOpenResultModal={(match) => {
              setMatchToResult(match);
              setIsResultModalOpen(true);
            }}
            onSelectMatchForLineup={(match) => {
              setSelectedMatch(match);
              setActiveTab('cancha');
            }}
            onDeleteMatch={handleDeleteMatch}
          />
        )}

        {/* Tab 4: Tabla de Goleadores */}
        {activeTab === 'goleadores' && (
          <TopScorers players={players} matches={matches} />
        )}

        {/* Tab 5: Plantel General (Base de datos de jugadores) */}
        {activeTab === 'jugadores' && (
          <PlayersAdmin
            players={players}
            matches={matches}
            role={role}
            onOpenNewPlayerModal={() => {
              setPlayerToEdit(null);
              setIsPlayerModalOpen(true);
            }}
            onOpenEditPlayerModal={(player) => {
              setPlayerToEdit(player);
              setIsPlayerModalOpen(true);
            }}
            onTogglePlayerStatus={handleTogglePlayerStatus}
            onDeletePlayer={handleDeletePlayer}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center font-black text-[10px]">
              PF
            </div>
            <span className="font-bold text-slate-900">PF SOCCER</span>
            <span className="text-slate-300">•</span>
            <span>Sistema Oficial de Convocatorias y Partidos 12 vs 12</span>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <button
              onClick={() => setIsSeasonModalOpen(true)}
              className="text-amber-600 hover:text-amber-700 hover:underline font-bold text-xs flex items-center gap-1"
            >
              🏆 <span>{season.name}</span>
            </button>
            <span className="text-slate-300">•</span>
            <span>Acceso: <strong className="text-slate-900 capitalize">{role}</strong></span>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="text-slate-900 hover:underline font-bold text-xs"
            >
              Cambiar Rol
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:underline font-bold text-xs"
            >
              Salir
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {isPlayerModalOpen && (
        <PlayerModal
          isOpen={isPlayerModalOpen}
          onClose={() => setIsPlayerModalOpen(false)}
          onSave={handleSavePlayer}
          playerToEdit={playerToEdit}
        />
      )}

      {isNewMatchModalOpen && (
        <NewMatchModal
          isOpen={isNewMatchModalOpen}
          onClose={() => setIsNewMatchModalOpen(false)}
          players={players}
          onSaveNewMatch={handleSaveNewMatch}
        />
      )}

      {isResultModalOpen && matchToResult && (
        <MatchResultModal
          match={matchToResult}
          players={players}
          onClose={() => {
            setIsResultModalOpen(false);
            setMatchToResult(null);
          }}
          onSave={handleSaveMatchResult}
        />
      )}

      {isRoleModalOpen && (
        <RoleSwitchModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          currentRole={role}
          onSelectRole={(newRole) => {
            setRole(newRole);
            const updatedSession: AuthSession = { ...session, role: newRole };
            saveStoredAuthSession(updatedSession);
            setSession(updatedSession);
            if (newRole === 'visor' && activeTab === 'jugadores') {
              setActiveTab('cancha');
            }
            setIsRoleModalOpen(false);
            showToast(`Modo cambiado a ${newRole.toUpperCase()}.`);
          }}
        />
      )}

      {isSeasonModalOpen && (
        <SeasonScoreboardModal
          isOpen={isSeasonModalOpen}
          onClose={() => setIsSeasonModalOpen(false)}
          season={season}
          scoreboard={scoreboard}
          role={role}
          onStartNewSeason={handleStartNewSeason}
          onFullResetToFactory={handleResetDemoData}
          onUpdateSeasonName={handleUpdateSeasonName}
        />
      )}

      {confirmModalConfig && (
        <ConfirmModal
          isOpen={confirmModalConfig.isOpen}
          title={confirmModalConfig.title}
          message={confirmModalConfig.message}
          confirmLabel={confirmModalConfig.confirmLabel}
          isDanger={confirmModalConfig.isDanger}
          onConfirm={confirmModalConfig.onConfirm}
          onClose={() => setConfirmModalConfig(null)}
        />
      )}

    </div>
  );
}
