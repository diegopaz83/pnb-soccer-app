export type PlayerPosition = 
  | 'POR' // Portero
  | 'DFC' // Defensa Central
  | 'LI'  // Lateral Izquierdo
  | 'LD'  // Lateral Derecho
  | 'MCD' // Mediocampista Defensivo
  | 'MC'  // Mediocampista Central
  | 'MCO' // Mediocampista Ofensivo
  | 'EI'  // Extremo Izquierdo
  | 'ED'  // Extremo Derecho
  | 'DC'; // Delantero Centro

export interface Player {
  id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  posicion: PlayerPosition;
  posicionSecundaria?: PlayerPosition;
  dorsal: number;
  foto: string;
  status: 'activo' | 'inactivo';
  piernaHabil: 'Derecha' | 'Izquierda' | 'Ambidiestro';
  apodo?: string;
  fechaNacimiento?: string;
  notas?: string;
}

export type UserRole = 'admin' | 'visor';

export interface FormationPitchCoord {
  id: string;
  rolePos: PlayerPosition;
  label: string;
  x: number; // percentage from left 0 - 100
  y: number; // percentage from top 0 - 100
  team: 'A' | 'B';
}

export interface Formation12 {
  id: string;
  name: string; // "1-4-4-3 (12 jugadores)"
  description: string;
  slotsA: FormationPitchCoord[]; // 12 slots for Team A
  slotsB: FormationPitchCoord[]; // 12 slots for Team B
}

export interface LineupSlotPosition {
  slotId: string;
  playerId: string | null;
  team: 'A' | 'B';
  x: number;
  y: number;
}

export interface GoalRecord {
  id: string;
  playerId: string;
  playerName: string;
  team: 'A' | 'B';
  playerDorsal?: number;
  minuto?: number;
}

export interface Match {
  id: string;
  jornada: string; // e.g. "Partido Semanal 12 vs 12"
  fecha: string;
  hora: string;
  lugar: string;
  rival?: string;
  equipo1Nombre: string; // Default: "Equipo A (Rojos)"
  equipo2Nombre: string; // Default: "Equipo B (Blancos)"
  equipo1Color?: string; // 'rojo' | 'blanco' | 'verde' | 'azul'
  equipo2Color?: string;
  estado: 'programado' | 'en_juego' | 'finalizado';
  golesPFSoccer: number; // Goles Equipo A
  golesRival: number; // Goles Equipo B
  playerGoals: Record<string, number>; // playerId -> count of goals
  golesDetalle?: GoalRecord[];
  convocatoria: string[]; // 24 player IDs
  equipo1PlayerIds: string[]; // 12 players for Team A
  equipo2PlayerIds: string[]; // 12 players for Team B
  pitchPositions?: Record<string, { x: number; y: number; team: 'A' | 'B' }>; // custom drag & drop coordinates
  formacionId?: string;
  cronica?: string;
  mvpPlayerId?: string;
}

export interface SeasonInfo {
  id: string;
  name: string; // e.g. "Temporada 2026"
  startDate: string;
  status: 'activa' | 'cerrada';
}

export interface AuthSession {
  isLoggedIn: boolean;
  role: UserRole;
  userHandle: string;
  loginTime?: string;
}

export interface SeasonGlobalScoreboard {
  partidosJugados: number;
  victoriasEquipo1: number;
  victoriasEquipo2: number;
  empates: number;
  golesEquipo1: number;
  golesEquipo2: number;
  golesTotales: number;
  goleadorLider?: {
    player: Player;
    goles: number;
  };
}

export interface TopScorerItem {
  player: Player;
  totalGoles: number;
  partidosJugados: number;
  promedioGoles: number;
  golesUltimoPartido: number;
  ranking: number;
}
