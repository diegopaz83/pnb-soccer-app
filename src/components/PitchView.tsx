import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Users, 
  RotateCcw, 
  Copy, 
  Check, 
  Calendar, 
  MapPin, 
  Clock,
  Plus,
  Minus,
  Star,
  Armchair,
  ArrowLeftRight,
  X,
  Trophy,
  Sparkles,
  Flag,
  ChevronRight,
  ArrowRight,
  Award
} from 'lucide-react';
import { Match, Player, UserRole } from '../types';
import { FORMATIONS_12 } from '../data/initialData';

interface PitchViewProps {
  players: Player[];
  matches: Match[];
  selectedMatch: Match;
  role: UserRole;
  onSelectMatch: (match: Match) => void;
  onUpdateMatch: (updatedMatch: Match) => void;
  onOpenConvocatoria: () => void;
  onStartNewConvocatoria?: () => void;
  onNavigateToTab?: (tab: 'convocatoria' | 'cancha' | 'partidos' | 'goleadores' | 'jugadores') => void;
  onOpenResultModal?: (match: Match) => void;
}

interface PlayerPitchItem {
  playerId: string;
  team: 'A' | 'B';
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  roleLabel: string;
}

export const PitchView: React.FC<PitchViewProps> = ({
  players,
  matches,
  selectedMatch,
  role,
  onSelectMatch,
  onUpdateMatch,
  onOpenConvocatoria,
  onStartNewConvocatoria,
  onNavigateToTab,
  onOpenResultModal,
}) => {
  const pitchRef = useRef<HTMLDivElement>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);

  // Selected player for Goal Scoring & Match actions
  const [goalPlayerModal, setGoalPlayerModal] = useState<{
    player: Player;
    team: 'A' | 'B';
    isBench: boolean;
    currentGoals: number;
    isMvp: boolean;
  } | null>(null);

  const [selectedFormationId, setSelectedFormationId] = useState<string>(
    selectedMatch?.formacionId || '1-4-4-3'
  );

  const currentFormation = FORMATIONS_12.find((f) => f.id === selectedFormationId) || FORMATIONS_12[0];
  const playerMap = new Map<string, Player>(players.map((p) => [p.id, p]));

  const equipoAIds = selectedMatch?.equipo1PlayerIds || [];
  const equipoBIds = selectedMatch?.equipo2PlayerIds || [];

  // Separation: First 12 are titulars on pitch; 13+ are on bench
  const titularesA = equipoAIds.slice(0, 12);
  const bancaA = equipoAIds.slice(12);

  const titularesB = equipoBIds.slice(0, 12);
  const bancaB = equipoBIds.slice(12);

  // Custom drag & drop coordinates
  const customPositions = selectedMatch?.pitchPositions || {};

  // Compute 12 positions for Team A (Titulares)
  const teamAPlayersOnPitch: PlayerPitchItem[] = titularesA.map((pId, idx) => {
    const defaultSlot = currentFormation.slotsA[idx] || {
      id: `slot-a-${idx}`,
      rolePos: 'MC',
      label: 'JUG',
      x: 20 + (idx % 4) * 20,
      y: 60 + Math.floor(idx / 4) * 12,
      team: 'A' as const,
    };

    const custom = customPositions[pId];
    return {
      playerId: pId,
      team: 'A' as const,
      x: custom ? custom.x : defaultSlot.x,
      y: custom ? custom.y : defaultSlot.y,
      roleLabel: defaultSlot.label,
    };
  });

  // Compute 12 positions for Team B (Titulares)
  const teamBPlayersOnPitch: PlayerPitchItem[] = titularesB.map((pId, idx) => {
    const defaultSlot = currentFormation.slotsB[idx] || {
      id: `slot-b-${idx}`,
      rolePos: 'MC',
      label: 'JUG',
      x: 20 + (idx % 4) * 20,
      y: 20 + Math.floor(idx / 4) * 12,
      team: 'B' as const,
    };

    const custom = customPositions[pId];
    return {
      playerId: pId,
      team: 'B' as const,
      x: custom ? custom.x : defaultSlot.x,
      y: custom ? custom.y : defaultSlot.y,
      roleLabel: defaultSlot.label,
    };
  });

  const all24OnPitch = [...teamAPlayersOnPitch, ...teamBPlayersOnPitch];

  // Dragging state
  const [draggingPlayerId, setDraggingPlayerId] = useState<string | null>(null);

  // Handle Drag Start
  const handleDragStart = (e: React.DragEvent, playerId: string) => {
    if (role !== 'admin') return;
    setDraggingPlayerId(playerId);
    e.dataTransfer.setData('text/plain', playerId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle Drag Over
  const handleDragOver = (e: React.DragEvent) => {
    if (role !== 'admin') return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle Drop on Pitch
  const handleDrop = (e: React.DragEvent) => {
    if (role !== 'admin') return;
    e.preventDefault();
    const playerId = draggingPlayerId || e.dataTransfer.getData('text/plain');
    if (!playerId || !pitchRef.current) return;

    const rect = pitchRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    let x = Math.round(((clientX - rect.left) / rect.width) * 100);
    let y = Math.round(((clientY - rect.top) / rect.height) * 100);

    x = Math.max(6, Math.min(94, x));
    y = Math.max(5, Math.min(95, y));

    const isTeamA = equipoAIds.includes(playerId);
    const updatedCustom = {
      ...(selectedMatch.pitchPositions || {}),
      [playerId]: {
        x,
        y,
        team: isTeamA ? ('A' as const) : ('B' as const),
      },
    };

    const updatedMatch: Match = {
      ...selectedMatch,
      pitchPositions: updatedCustom,
    };

    onUpdateMatch(updatedMatch);
    setDraggingPlayerId(null);
  };

  // Reset positions to default formation
  const handleResetFormation = () => {
    if (role !== 'admin') return;
    const updatedMatch: Match = {
      ...selectedMatch,
      pitchPositions: {},
      formacionId: selectedFormationId,
    };
    onUpdateMatch(updatedMatch);
  };

  // Celebration animation based on result
  const triggerCelebration = (sA: number, sB: number) => {
    if (sA > sB) {
      // Equipo Rojo Victory Animation: Red & Gold confetti bursts
      confetti({
        particleCount: 110,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#dc2626', '#ef4444', '#f87171', '#f59e0b', '#ffffff'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 75,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#dc2626', '#fbbf24', '#f87171'],
        });
        confetti({
          particleCount: 75,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ef4444', '#ffffff', '#fbbf24'],
        });
      }, 250);
    } else if (sB > sA) {
      // Equipo Blanco / Rival Victory Animation: Blue, Cyan & White confetti bursts
      confetti({
        particleCount: 110,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#38bdf8', '#60a5fa', '#ffffff', '#fbbf24'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 75,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#2563eb', '#38bdf8', '#ffffff'],
        });
        confetti({
          particleCount: 75,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#60a5fa', '#ffffff', '#fbbf24'],
        });
      }, 250);
    } else {
      // Empate Épico Animation: Purple, gold, silver celebratory confetti
      confetti({
        particleCount: 120,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#a855f7', '#fbbf24', '#ec4899', '#ffffff'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 90,
          spread: 100,
          origin: { y: 0.7 },
          colors: ['#8b5cf6', '#fbbf24', '#ec4899'],
        });
      }, 300);
    }
  };

  // Finalize Match Action
  const handleFinalizeMatch = () => {
    const scoreA = selectedMatch.golesPFSoccer || 0;
    const scoreB = selectedMatch.golesRival || 0;

    const finishedMatch: Match = {
      ...selectedMatch,
      estado: 'finalizado',
    };

    onUpdateMatch(finishedMatch);
    setIsCelebrationOpen(true);
    triggerCelebration(scoreA, scoreB);
  };

  // Open player goal modal (Admin only)
  const handleOpenPlayerGoalModal = (player: Player, team: 'A' | 'B', isBench: boolean) => {
    if (role !== 'admin') return; // Read-only for visor
    const goals = Number(selectedMatch.playerGoals?.[player.id]) || 0;
    const isMvp = selectedMatch.mvpPlayerId === player.id;
    setGoalPlayerModal({
      player,
      team,
      isBench,
      currentGoals: goals,
      isMvp,
    });
  };

  // Save Goal Count from Modal
  const handleSaveGoalModal = (newGoals: number, isMvp: boolean, closeModal = true) => {
    if (!goalPlayerModal) return;
    const pId = goalPlayerModal.player.id;

    const updatedGoals = { ...(selectedMatch.playerGoals || {}) };
    if (newGoals > 0) {
      updatedGoals[pId] = newGoals;
    } else {
      delete updatedGoals[pId];
    }

    // Recalculate match score automatically
    const scoreA = equipoAIds.reduce((acc, id) => acc + (Number(updatedGoals[id]) || 0), 0);
    const scoreB = equipoBIds.reduce((acc, id) => acc + (Number(updatedGoals[id]) || 0), 0);

    const updatedMatch: Match = {
      ...selectedMatch,
      playerGoals: updatedGoals,
      golesPFSoccer: scoreA,
      golesRival: scoreB,
      estado: (scoreA > 0 || scoreB > 0) && selectedMatch.estado === 'programado' ? 'en_juego' : selectedMatch.estado,
      mvpPlayerId: isMvp ? pId : (selectedMatch.mvpPlayerId === pId ? undefined : selectedMatch.mvpPlayerId),
    };

    onUpdateMatch(updatedMatch);
    if (closeModal) {
      setGoalPlayerModal(null);
    }
  };

  // Substitute: Move titular to bench or bench player to titular
  const handleSubstitutePlayer = (playerId: string, currentTeam: 'A' | 'B', isBench: boolean) => {
    if (role !== 'admin') return;
    const ids = currentTeam === 'A' ? [...equipoAIds] : [...equipoBIds];
    const index = ids.indexOf(playerId);
    if (index === -1) return;

    if (isBench) {
      // Sub in: Swap with the 12th titular player (index 11)
      const [promoted] = ids.splice(index, 1);
      ids.splice(11, 0, promoted);
    } else {
      // Send to bench: Move to end
      if (ids.length <= 12) return; // Cannot send to bench if only 12 exist
      const [demoted] = ids.splice(index, 1);
      ids.push(demoted);
    }

    const updatedMatch: Match = {
      ...selectedMatch,
      equipo1PlayerIds: currentTeam === 'A' ? ids : equipoAIds,
      equipo2PlayerIds: currentTeam === 'B' ? ids : equipoBIds,
      convocatoria: currentTeam === 'A' ? [...ids, ...equipoBIds] : [...equipoAIds, ...ids],
    };

    onUpdateMatch(updatedMatch);
    setGoalPlayerModal(null);
  };

  // Copy WhatsApp summary
  const handleCopyWhatsApp = () => {
    const text = `⚽ *PF SOCCER - PARTIDO 12 VS 12* ⚽
📅 *Fecha:* ${selectedMatch.fecha} | ⏰ ${selectedMatch.hora}
📍 *Lugar:* ${selectedMatch.lugar}

🔴 *${team1Label.toUpperCase()} (${titularesA.length} en cancha + ${bancaA.length} banca):*
${titularesA.map((id, i) => {
  const p = playerMap.get(id);
  return `${i + 1}. #${p?.dorsal || ''} ${p?.nombre || ''} (${p?.posicion || ''})`;
}).join('\n')}
${bancaA.length > 0 ? `\n*Banca:* ${bancaA.map((id) => `#${playerMap.get(id)?.dorsal} ${playerMap.get(id)?.nombre}`).join(', ')}` : ''}

⚪ *${team2Label.toUpperCase()} (${titularesB.length} en cancha + ${bancaB.length} banca):*
${titularesB.map((id, i) => {
  const p = playerMap.get(id);
  return `${i + 1}. #${p?.dorsal || ''} ${p?.nombre || ''} (${p?.posicion || ''})`;
}).join('\n')}
${bancaB.length > 0 ? `\n*Banca:* ${bancaB.map((id) => `#${playerMap.get(id)?.dorsal} ${playerMap.get(id)?.nombre}`).join(', ')}` : ''}

*Marcador:* ${selectedMatch.golesPFSoccer || 0} - ${selectedMatch.golesRival || 0}
¡Nos vemos en la cancha!`;

    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const team1Label = selectedMatch.equipo1Nombre || 'Equipo Rojo';
  const team2Label = selectedMatch.equipo2Nombre || 'Equipo Blanco';

  // Calculate live score
  const scoreA = selectedMatch.golesPFSoccer || 0;
  const scoreB = selectedMatch.golesRival || 0;

  return (
    <div className="space-y-5">
      
      {/* Top Header & Scoreboard Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Pizarra Táctica & En Vivo
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
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Haz clic en cualquier jugador para <strong>registrar sus goles</strong> de forma inmediata.
            </p>
          </div>

          {/* Real-time Match Score Display & Finalize Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center justify-between sm:justify-start gap-4 bg-slate-50 border border-slate-200/80 px-5 py-3 rounded-2xl">
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5 mb-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[90px]">
                    {team1Label}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {titularesA.length} en cancha
                </span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-xl border border-slate-200 shadow-2xs font-display font-black text-2xl text-slate-900">
                <span>{scoreA}</span>
                <span className="text-slate-300 font-light">-</span>
                <span>{scoreB}</span>
              </div>

              <div className="text-left">
                <div className="flex items-center justify-start gap-1.5 mb-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 ring-1 ring-slate-400" />
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[90px]">
                    {team2Label}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {titularesB.length} en cancha
                </span>
              </div>
            </div>

            {/* Match State Action Buttons */}
            {selectedMatch.estado !== 'finalizado' ? (
              role === 'admin' && (
                <button
                  type="button"
                  id="final-partido-btn"
                  onClick={handleFinalizeMatch}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all ring-2 ring-red-500/30"
                >
                  <Flag className="w-4 h-4 text-white" />
                  <span>FINAL DEL PARTIDO</span>
                </button>
              )
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCelebrationOpen(true);
                    triggerCelebration(scoreA, scoreB);
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Celebración</span>
                </button>

                {onStartNewConvocatoria && role === 'admin' && (
                  <button
                    type="button"
                    onClick={onStartNewConvocatoria}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nueva Convocatoria</span>
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Tactical Controls & Actions Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-2">
            {role === 'admin' && (
              <>
                {/* Formation selector */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  {FORMATIONS_12.map((form) => (
                    <button
                      key={form.id}
                      type="button"
                      onClick={() => {
                        setSelectedFormationId(form.id);
                        const updated: Match = {
                          ...selectedMatch,
                          formacionId: form.id,
                          pitchPositions: {}, // reset custom positions when formation changes
                        };
                        onUpdateMatch(updated);
                      }}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                        selectedFormationId === form.id
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {form.name.split(' ')[0]}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleResetFormation}
                  title="Restaurar posiciones tácticas"
                  className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSuccess ? '¡Copiado!' : 'Copiar para WhatsApp'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenConvocatoria}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 hover:underline"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Gestionar Convocatoria ({equipoAIds.length + equipoBIds.length} jugadores)</span>
          </button>

        </div>
      </div>

      {/* TACTICAL PITCH: 24 PLAYERS (12 VS 12) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-6 shadow-xs">
        
        {/* Pitch Legend */}
        <div className="flex items-center justify-between pb-3 text-xs font-semibold text-slate-500 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-300 ring-1 ring-slate-400" />
            <span className="font-bold text-slate-800">{team2Label}</span>
            <span className="text-[10px] text-slate-400 font-normal">(Mitad Superior • 12 en cancha)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600" />
            <span className="font-bold text-slate-800">{team1Label}</span>
            <span className="text-[10px] text-slate-400 font-normal">(Mitad Inferior • 12 en cancha)</span>
          </div>
        </div>

        {/* Soccer Field Graphic Container - Fits 100% horizontally without scrolling, taller vertically on mobile */}
        <div className="w-full flex justify-center pb-2">
          <div 
            ref={pitchRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="relative w-full aspect-[1/1.65] sm:aspect-[3/4] max-w-2xl mx-auto rounded-2xl sm:rounded-3xl overflow-hidden shadow-inner select-none border-2 sm:border-4 border-[#1E4D2B]"
            style={{
              background: 'linear-gradient(to bottom, #2d6a4f, #1b4332)',
            }}
          >
          {/* Pitch Markings (White Lines) */}
          <div className="absolute inset-2 sm:inset-3 border-2 border-white/40 rounded-xl sm:rounded-2xl pointer-events-none" />
          <div className="absolute top-1/2 left-2 sm:left-3 right-2 sm:right-3 h-0.5 bg-white/40 -translate-y-1/2 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 w-20 h-20 sm:w-28 sm:h-28 border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/60 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          
          {/* Top Area (Team B Goal) */}
          <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 w-32 sm:w-48 h-12 sm:h-20 border-2 border-white/40 border-t-0 rounded-b-xl pointer-events-none" />
          <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 w-16 sm:w-24 h-5 sm:h-8 border-2 border-white/40 border-t-0 pointer-events-none" />
          
          {/* Bottom Area (Team A Goal) */}
          <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 w-32 sm:w-48 h-12 sm:h-20 border-2 border-white/40 border-b-0 rounded-t-xl pointer-events-none" />
          <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 w-16 sm:w-24 h-5 sm:h-8 border-2 border-white/40 border-b-0 pointer-events-none" />

          {/* 24 Player Tokens on Pitch */}
          {all24OnPitch.map((item) => {
            const player = playerMap.get(item.playerId);
            if (!player) return null;

            const isTeamA = item.team === 'A';
            const isDragging = draggingPlayerId === player.id;
            const goals = Number(selectedMatch.playerGoals?.[player.id]) || 0;
            const isMvp = selectedMatch.mvpPlayerId === player.id;

            return (
              <div
                key={player.id}
                draggable={role === 'admin'}
                onDragStart={(e) => handleDragStart(e, player.id)}
                onClick={() => handleOpenPlayerGoalModal(player, item.team, false)}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute z-20 flex flex-col items-center cursor-pointer transition-transform duration-75 group ${
                  isDragging ? 'opacity-40 scale-110' : 'hover:scale-110'
                }`}
              >
                {/* Token Circle */}
                <div
                  className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-display font-black text-[10px] sm:text-xs shadow-md border sm:border-2 transition-transform ${
                    isTeamA
                      ? 'bg-red-600 text-white border-white shadow-red-950/40 ring-1 sm:ring-2 ring-red-700/50'
                      : 'bg-white text-slate-900 border-slate-300 shadow-slate-950/40 ring-1 sm:ring-2 ring-white/50'
                  }`}
                >
                  {player.foto ? (
                    <img
                      src={player.foto}
                      alt={player.nombre}
                      className="w-full h-full rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>#{player.dorsal}</span>
                  )}

                  {/* Goal Badge if player scored */}
                  {goals > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[9px] font-black px-1 rounded-full border border-white shadow-xs">
                      ⚽{goals}
                    </span>
                  )}

                  {/* MVP Badge */}
                  {isMvp && (
                    <span className="absolute -top-1.5 -left-1.5 bg-amber-400 text-amber-950 text-[9px] font-black p-0.5 rounded-full border border-white shadow-xs">
                      ⭐
                    </span>
                  )}
                </div>

                {/* Player Name Pill */}
                <div className="mt-0.5 sm:mt-1 px-1 sm:px-2 py-0.2 rounded-md bg-slate-950/80 backdrop-blur-xs text-white text-[8px] sm:text-[10px] font-bold whitespace-nowrap shadow-xs max-w-[62px] sm:max-w-[85px] truncate text-center border border-white/10 group-hover:bg-slate-900">
                  {player.nombre.split(' ')[0]}
                </div>
              </div>
            );
          })}
        </div>
        </div>

        {/* Pitch Instructions */}
        <p className="text-center text-xs text-slate-400 mt-4">
          {role === 'admin'
            ? 'Toca a cualquier jugador para sumarle goles, o arrástralo para cambiar su posición táctica.'
            : 'Modo visor: visualizando los 24 jugadores en cancha y sus goles.'}
        </p>

      </div>

      {/* BANCA DE SUPLENTES (If more than 12 players in either team) */}
      {(bancaA.length > 0 || bancaB.length > 0) && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Armchair className="w-4 h-4 text-amber-600" />
              <h3 className="font-display font-black text-slate-900 text-sm sm:text-base">
                Banca de Suplentes del Partido
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Toca un suplente para asignarle goles o ingresarlo a la cancha
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Banca Team A */}
            <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Banca de {team1Label}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  {bancaA.length} en banca
                </span>
              </div>

              {bancaA.length === 0 ? (
                <span className="text-xs text-slate-400 italic">Banca vacía.</span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {bancaA.map((pId) => {
                    const p = playerMap.get(pId);
                    if (!p) return null;
                    const goals = Number(selectedMatch.playerGoals?.[p.id]) || 0;

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleOpenPlayerGoalModal(p, 'A', true)}
                        className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-white border border-slate-200 hover:border-slate-400 shadow-2xs transition-all text-left"
                      >
                        <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px]">
                          #{p.dorsal}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block truncate max-w-[100px]">
                            {p.nombre}
                          </span>
                          <span className="text-[9px] text-slate-400 block">
                            {p.posicion} {goals > 0 ? `• ⚽ ${goals}` : ''}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Banca Team B */}
            <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 ring-1 ring-slate-400" />
                  <span className="text-xs font-bold text-slate-800">
                    Banca de {team2Label}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  {bancaB.length} en banca
                </span>
              </div>

              {bancaB.length === 0 ? (
                <span className="text-xs text-slate-400 italic">Banca vacía.</span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {bancaB.map((pId) => {
                    const p = playerMap.get(pId);
                    if (!p) return null;
                    const goals = Number(selectedMatch.playerGoals?.[p.id]) || 0;

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleOpenPlayerGoalModal(p, 'B', true)}
                        className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-white border border-slate-200 hover:border-slate-400 shadow-2xs transition-all text-left"
                      >
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 border border-slate-300 flex items-center justify-center font-bold text-[10px]">
                          #{p.dorsal}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block truncate max-w-[100px]">
                            {p.nombre}
                          </span>
                          <span className="text-[9px] text-slate-400 block">
                            {p.posicion} {goals > 0 ? `• ⚽ ${goals}` : ''}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* MODAL: DIRECT GOAL SCORING & PLAYER CARD ON PITCH */}
      {goalPlayerModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4"
          onClick={() => setGoalPlayerModal(null)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200/80 animate-in fade-in zoom-in-95 duration-150 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  {goalPlayerModal.player.foto ? (
                    <img
                      src={goalPlayerModal.player.foto}
                      alt={goalPlayerModal.player.nombre}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-black text-slate-400">
                      #{goalPlayerModal.player.dorsal}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-black text-slate-900 text-base">
                      {goalPlayerModal.player.nombre}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    #{goalPlayerModal.player.dorsal} • {goalPlayerModal.player.posicion} • {goalPlayerModal.team === 'A' ? team1Label : team2Label}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setGoalPlayerModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Teammate Switcher (Same Team) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Compañeros ({goalPlayerModal.team === 'A' ? team1Label : team2Label}):</span>
                <span className="text-[10px] text-slate-400 font-medium">Toca para cambiar</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
                {(goalPlayerModal.team === 'A' ? equipoAIds : equipoBIds).map((pId) => {
                  const tm = playerMap.get(pId);
                  if (!tm) return null;
                  const isSelected = tm.id === goalPlayerModal.player.id;
                  const tmGoals = Number(selectedMatch.playerGoals?.[pId]) || 0;
                  const isTmBench = (goalPlayerModal.team === 'A' ? bancaA : bancaB).includes(pId);

                  return (
                    <button
                      key={pId}
                      type="button"
                      onClick={() => {
                        // Save current player goals first without closing modal
                        handleSaveGoalModal(goalPlayerModal.currentGoals, goalPlayerModal.isMvp, false);
                        // Switch to chosen teammate
                        setGoalPlayerModal({
                          player: tm,
                          team: goalPlayerModal.team,
                          isBench: isTmBench,
                          currentGoals: Number(selectedMatch.playerGoals?.[pId]) || 0,
                          isMvp: selectedMatch.mvpPlayerId === pId,
                        });
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border ${
                        isSelected
                          ? (goalPlayerModal.team === 'A'
                              ? 'bg-red-600 text-white border-red-700 shadow-xs scale-105'
                              : 'bg-blue-600 text-white border-blue-700 shadow-xs scale-105')
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>#{tm.dorsal} {tm.nombre.split(' ')[0]}</span>
                      {isTmBench && (
                        <span className={`text-[9px] px-1 py-0.2 rounded-sm ${isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}`}>
                          Banca
                        </span>
                      )}
                      {tmGoals > 0 && (
                        <span className={`text-[10px] font-black ${isSelected ? 'text-white' : 'text-emerald-700'}`}>
                          ⚽{tmGoals}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Direct Goal Counter Box */}
            <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl text-center space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                Goles en este Partido
              </span>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={goalPlayerModal.currentGoals <= 0}
                  onClick={() =>
                    setGoalPlayerModal({
                      ...goalPlayerModal,
                      currentGoals: Math.max(0, goalPlayerModal.currentGoals - 1),
                    })
                  }
                  className="w-10 h-10 rounded-xl bg-white hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center border border-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-2xs"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="w-14 text-center">
                  <span className="font-display font-black text-4xl text-slate-900">
                    {goalPlayerModal.currentGoals}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setGoalPlayerModal({
                      ...goalPlayerModal,
                      currentGoals: goalPlayerModal.currentGoals + 1,
                    })
                  }
                  className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {goalPlayerModal.currentGoals > 0 && (
                <span className="text-xs font-bold text-emerald-700 block">
                  ⚽ {goalPlayerModal.currentGoals} {goalPlayerModal.currentGoals === 1 ? 'gol anotado' : 'goles anotados'}
                </span>
              )}
            </div>

            {/* MVP Star Selector */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/70">
              <div className="flex items-center gap-2">
                <Star className={`w-4 h-4 ${goalPlayerModal.isMvp ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
                <span className="text-xs font-bold text-slate-800">Figura del Partido (MVP)</span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setGoalPlayerModal({
                    ...goalPlayerModal,
                    isMvp: !goalPlayerModal.isMvp,
                  })
                }
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  goalPlayerModal.isMvp
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {goalPlayerModal.isMvp ? 'Elegido ⭐' : 'Elegir'}
              </button>
            </div>

            {/* Bench & Substitution Action (If Admin) */}
            {role === 'admin' && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  Estado: <strong>{goalPlayerModal.isBench ? 'En Banca' : 'En Cancha'}</strong>
                </span>

                {goalPlayerModal.isBench ? (
                  <button
                    type="button"
                    onClick={() => handleSubstitutePlayer(goalPlayerModal.player.id, goalPlayerModal.team, true)}
                    className="text-amber-800 hover:underline font-bold"
                  >
                    Ingresar a Cancha ↑
                  </button>
                ) : (
                  (goalPlayerModal.team === 'A' ? equipoAIds.length : equipoBIds.length) > 12 && (
                    <button
                      type="button"
                      onClick={() => handleSubstitutePlayer(goalPlayerModal.player.id, goalPlayerModal.team, false)}
                      className="text-slate-500 hover:underline font-medium"
                    >
                      Mover a la Banca ↓
                    </button>
                  )
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setGoalPlayerModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => handleSaveGoalModal(goalPlayerModal.currentGoals, goalPlayerModal.isMvp)}
                className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Goles</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CELEBRATION MODAL: FINAL DEL PARTIDO & FESTIVITY */}
      {isCelebrationOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => setIsCelebrationOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Banner dynamically styled according to winner */}
            <div
              className={`p-6 text-center text-white relative ${
                scoreA > scoreB
                  ? 'bg-gradient-to-br from-red-600 via-red-700 to-rose-900'
                  : scoreB > scoreA
                  ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-950'
                  : 'bg-gradient-to-br from-purple-600 via-indigo-700 to-slate-900'
              }`}
            >
              <button
                type="button"
                onClick={() => setIsCelebrationOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 mb-3 shadow-inner">
                {scoreA !== scoreB ? (
                  <Trophy className="w-8 h-8 text-amber-300 animate-bounce" />
                ) : (
                  <Award className="w-8 h-8 text-amber-300" />
                )}
              </div>

              <div className="inline-block px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase mb-1 bg-white/20 backdrop-blur-xs border border-white/20">
                {selectedMatch.jornada} • Final
              </div>

              <h3 className="font-display font-black text-2xl sm:text-3xl tracking-tight">
                {scoreA > scoreB
                  ? `¡VICTORIA DE ${team1Label.toUpperCase()}! 🔴🏆`
                  : scoreB > scoreA
                  ? `¡VICTORIA DE ${team2Label.toUpperCase()}! ⚪🏆`
                  : '¡EMPATE ÉPICO! 🤝⚽'}
              </h3>

              <p className="text-xs text-white/80 font-medium mt-1 max-w-xs mx-auto">
                {scoreA > scoreB
                  ? `El Equipo Rojo se queda con el triunfo de esta jornada.`
                  : scoreB > scoreA
                  ? `El Equipo Blanco / Rival se impone con categoría en la cancha.`
                  : 'Gran duelo deportivo con marcador igualado de principio a fin.'}
              </p>
            </div>

            {/* Modal Body: Final Score & Highlights */}
            <div className="p-6 space-y-5">
              {/* Score card */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <div className="text-center flex-1">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                    <span className="text-xs font-black text-slate-800 truncate max-w-[110px]">
                      {team1Label}
                    </span>
                  </div>
                  <span className="font-display font-black text-3xl text-slate-900">
                    {scoreA}
                  </span>
                </div>

                <div className="px-3 text-slate-300 font-light text-xl">vs</div>

                <div className="text-center flex-1">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 ring-1 ring-slate-400" />
                    <span className="text-xs font-black text-slate-800 truncate max-w-[110px]">
                      {team2Label}
                    </span>
                  </div>
                  <span className="font-display font-black text-3xl text-slate-900">
                    {scoreB}
                  </span>
                </div>
              </div>

              {/* Match Highlights: MVP & Scorers */}
              <div className="space-y-3">
                {/* MVP */}
                {selectedMatch.mvpPlayerId && (
                  <div className="flex items-center justify-between p-3 bg-amber-50/80 border border-amber-200 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-amber-100 border border-amber-300 shrink-0">
                        {playerMap.get(selectedMatch.mvpPlayerId)?.foto ? (
                          <img
                            src={playerMap.get(selectedMatch.mvpPlayerId)!.foto}
                            alt=""
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-black text-amber-800 text-xs">
                            #{playerMap.get(selectedMatch.mvpPlayerId)?.dorsal}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-600" /> Figura del Partido
                        </span>
                        <div className="font-display font-black text-slate-900 text-sm">
                          {playerMap.get(selectedMatch.mvpPlayerId)?.nombre}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-md">
                      MVP ⭐
                    </span>
                  </div>
                )}

                {/* Scorers breakdown */}
                {Object.entries(selectedMatch.playerGoals || {}).filter(([_, c]) => (Number(c) || 0) > 0).length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      Goleadores del Partido
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedMatch.playerGoals || {})
                        .filter(([_, c]) => (Number(c) || 0) > 0)
                        .map(([pId, count]) => {
                          const pl = playerMap.get(pId);
                          if (!pl) return null;
                          const isTeamA = equipoAIds.includes(pId);
                          return (
                            <span
                              key={pId}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${
                                isTeamA
                                  ? 'bg-red-50 text-red-800 border-red-200'
                                  : 'bg-blue-50 text-blue-800 border-blue-200'
                              }`}
                            >
                              <span>#{pl.dorsal} {pl.nombre.split(' ')[0]}</span>
                              <span className="font-black">⚽{count}</span>
                            </span>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: Next Convocatoria & History */}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                {onStartNewConvocatoria && role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCelebrationOpen(false);
                      onStartNewConvocatoria();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm shadow-md transition-colors"
                  >
                    <span>Iniciar Nueva Convocatoria (Siguiente Partido)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCelebrationOpen(false);
                      onNavigateToTab?.('partidos');
                    }}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                  >
                    <Trophy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ver en Historial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCelebrationOpen(false)}
                    className="flex items-center justify-center py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
