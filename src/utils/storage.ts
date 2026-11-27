import { FORMATIONS_12, INITIAL_MATCHES, INITIAL_PLAYERS } from '../data/initialData';
import { Match, Player, SeasonGlobalScoreboard, SeasonInfo, TopScorerItem, UserRole } from '../types';

const STORAGE_KEYS = {
  PLAYERS: 'pf_soccer_players_v2',
  MATCHES: 'pf_soccer_matches_v2',
  ACTIVE_MATCH: 'pf_soccer_active_match_v2',
  ROLE: 'pf_soccer_role_v2',
  SEASON: 'pf_soccer_season_v2',
  AUTH: 'pf_soccer_auth_v2',
};

export const DEFAULT_SEASON: SeasonInfo = {
  id: 's-2026',
  name: 'Temporada Oficial 2026',
  startDate: '2026-01-01',
  status: 'activa',
};

export function loadStoredPlayers(): Player[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.id) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading players from localStorage', e);
  }
  return INITIAL_PLAYERS;
}

export function saveStoredPlayers(players: Player[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  } catch (e) {
    console.warn('Quota warning saving players to localStorage, auto-sanitizing photos...', e);
    try {
      // If quota exceeded, sanitize any over-sized photos (e.g. uncompressed raw images)
      const sanitized = players.map((p) => {
        if (p.foto && p.foto.length > 35000) {
          // Truncated or replace with fallback preset to avoid dropping player record
          return { ...p, foto: p.foto.slice(0, 15000) };
        }
        return p;
      });
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(sanitized));
    } catch (err2) {
      console.error('Critical quota exceeded in localStorage', err2);
    }
  }
}

export function loadStoredMatches(): Match[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.id) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading matches from localStorage', e);
  }
  return INITIAL_MATCHES;
}

export function saveStoredMatches(matches: Match[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  } catch (e) {
    console.error('Error saving matches to localStorage', e);
  }
}

export function loadStoredRole(): UserRole {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ROLE);
    if (data === 'admin' || data === 'visor') {
      return data;
    }
  } catch (e) {
    console.error('Error loading role from localStorage', e);
  }
  return 'visor'; // Safe default
}

export function saveStoredRole(role: UserRole): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  } catch (e) {
    console.error('Error saving role to localStorage', e);
  }
}

// Authentication Session (for landing page)
export interface AuthSession {
  isLoggedIn: boolean;
  role: UserRole;
  userHandle: string;
}

export function loadStoredAuthSession(): AuthSession {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed.isLoggedIn === 'boolean') {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading auth session', e);
  }
  return { isLoggedIn: false, role: 'visor', userHandle: '' };
}

export function saveStoredAuthSession(session: AuthSession): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(session));
    saveStoredRole(session.role);
  } catch (e) {
    console.error('Error saving auth session', e);
  }
}

export function clearStoredAuthSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  } catch (e) {
    console.error('Error clearing auth session', e);
  }
}

// Season Info
export function loadStoredSeason(): SeasonInfo {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SEASON);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed?.name) return parsed;
    }
  } catch (e) {
    console.error('Error loading season info', e);
  }
  return DEFAULT_SEASON;
}

export function saveStoredSeason(season: SeasonInfo): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SEASON, JSON.stringify(season));
  } catch (e) {
    console.error('Error saving season info', e);
  }
}

/**
 * Calculates global season scoreboard (Team A vs Team B balance)
 */
export function calculateSeasonGlobalScoreboard(
  matches: Match[],
  players: Player[]
): SeasonGlobalScoreboard {
  const finished = matches.filter((m) => m.estado === 'finalizado');
  let v1 = 0;
  let v2 = 0;
  let emp = 0;
  let g1 = 0;
  let g2 = 0;

  finished.forEach((m) => {
    g1 += m.golesPFSoccer || 0;
    g2 += m.golesRival || 0;
    if (m.golesPFSoccer > m.golesRival) {
      v1++;
    } else if (m.golesRival > m.golesPFSoccer) {
      v2++;
    } else {
      emp++;
    }
  });

  // Identify leading top scorer
  const scorers = calculateTopScorers(players, matches);
  const leader = scorers[0]?.totalGoles > 0 ? { player: scorers[0].player, goles: scorers[0].totalGoles } : undefined;

  return {
    partidosJugados: finished.length,
    victoriasEquipo1: v1,
    victoriasEquipo2: v2,
    empates: emp,
    golesEquipo1: g1,
    golesEquipo2: g2,
    golesTotales: g1 + g2,
    goleadorLider: leader,
  };
}

/**
 * Resets season matches and goal tallies while retaining the active player roster
 */
export function startNewSeason(
  newSeasonName: string,
  players: Player[]
): { newSeason: SeasonInfo; newMatches: Match[] } {
  const newSeason: SeasonInfo = {
    id: `s-${Date.now()}`,
    name: newSeasonName.trim() || `Temporada ${new Date().getFullYear()}`,
    startDate: new Date().toISOString().split('T')[0],
    status: 'activa',
  };

  // Generate a clean scheduled match #1 with first 24 active players
  const activeIds = players.filter((p) => p.status === 'activo').map((p) => p.id);
  const team1 = activeIds.slice(0, 12);
  const team2 = activeIds.slice(12, 24);

  const initialCleanMatch: Match = {
    id: `m-jornada-1-${Date.now()}`,
    jornada: 'Jornada 1 • 12 vs 12',
    fecha: new Date().toISOString().split('T')[0],
    hora: '19:30',
    lugar: 'Cancha Sintética Principal PF',
    equipo1Nombre: 'Equipo Rojo (PF A)',
    equipo2Nombre: 'Equipo Blanco (PF B)',
    equipo1Color: 'rojo',
    equipo2Color: 'blanco',
    estado: 'programado',
    golesPFSoccer: 0,
    golesRival: 0,
    playerGoals: {},
    convocatoria: [...team1, ...team2],
    equipo1PlayerIds: team1,
    equipo2PlayerIds: team2,
    formacionId: '1-4-4-3',
  };

  const newMatches = [initialCleanMatch];
  saveStoredSeason(newSeason);
  saveStoredMatches(newMatches);

  return { newSeason, newMatches };
}

export function resetAllToDefault(): { players: Player[]; matches: Match[]; role: UserRole; season: SeasonInfo } {
  try {
    localStorage.removeItem(STORAGE_KEYS.PLAYERS);
    localStorage.removeItem(STORAGE_KEYS.MATCHES);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_MATCH);
    localStorage.removeItem(STORAGE_KEYS.ROLE);
    localStorage.removeItem(STORAGE_KEYS.SEASON);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  } catch (e) {
    console.error('Error resetting localStorage', e);
  }
  return {
    players: INITIAL_PLAYERS,
    matches: INITIAL_MATCHES,
    role: 'admin',
    season: DEFAULT_SEASON,
  };
}

/**
 * Calculates top scorers dynamically based on match goal records and player list
 */
export function calculateTopScorers(players: Player[], matches: Match[]): TopScorerItem[] {
  const goalMap: Record<string, { total: number; lastMatchGoals: number; matchesSet: Set<string> }> = {};

  // Sort matches by date to identify the last played match
  const playedMatches = matches
    .filter((m) => m.estado === 'finalizado')
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const lastPlayedMatchId = playedMatches[0]?.id;

  // Initialize for all players
  players.forEach((p) => {
    goalMap[p.id] = {
      total: 0,
      lastMatchGoals: 0,
      matchesSet: new Set<string>(),
    };
  });

  // Aggregate goals from played matches
  playedMatches.forEach((m) => {
    // Count convocatorias or participation
    m.convocatoria?.forEach((pId) => {
      if (!goalMap[pId]) {
        goalMap[pId] = { total: 0, lastMatchGoals: 0, matchesSet: new Set() };
      }
      goalMap[pId].matchesSet.add(m.id);
    });

    // Count goals from playerGoals
    if (m.playerGoals && Object.keys(m.playerGoals).length > 0) {
      Object.entries(m.playerGoals).forEach(([pId, count]) => {
        const numGoals = Number(count) || 0;
        if (numGoals > 0) {
          if (!goalMap[pId]) {
            goalMap[pId] = { total: 0, lastMatchGoals: 0, matchesSet: new Set() };
          }
          goalMap[pId].total += numGoals;
          if (m.id === lastPlayedMatchId) {
            goalMap[pId].lastMatchGoals += numGoals;
          }
        }
      });
    }
  });

  // Transform and sort
  const playerMap = new Map(players.map((p) => [p.id, p]));
  const items: TopScorerItem[] = [];

  Object.entries(goalMap).forEach(([playerId, stats]) => {
    const player = playerMap.get(playerId);
    if (!player) return;

    const matchesCount = Math.max(stats.matchesSet.size, stats.total > 0 ? 1 : 0);
    const avg = matchesCount > 0 ? parseFloat((stats.total / matchesCount).toFixed(2)) : 0;

    items.push({
      player,
      totalGoles: stats.total,
      partidosJugados: matchesCount,
      promedioGoles: avg,
      golesUltimoPartido: stats.lastMatchGoals,
      ranking: 1,
    });
  });

  // Sort descending by total goals, then average, then matches played
  items.sort((a, b) => {
    if (b.totalGoles !== a.totalGoles) return b.totalGoles - a.totalGoles;
    if (b.promedioGoles !== a.promedioGoles) return b.promedioGoles - a.promedioGoles;
    return a.partidosJugados - b.partidosJugados;
  });

  // Assign rankings (handling ties)
  let currentRank = 1;
  for (let i = 0; i < items.length; i++) {
    if (i > 0 && items[i].totalGoles < items[i - 1].totalGoles) {
      currentRank = i + 1;
    }
    items[i].ranking = currentRank;
  }

  return items;
}

export { FORMATIONS_12 };
