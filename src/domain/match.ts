import type { MatchArea } from "./area";

export type MatchStatus = "waiting" | "running" | "finished";

export type MatchEvent = {
  id: string;
  type: "capture_registered";
  playerId: string;
  createdAt: number;
};

export type MatchSession = {
  id: string;
  playerId: string;
  playerName: string;
  durationSeconds: number;
  captorCount: number;
  status: MatchStatus;
  createdAt: number;
  startedAt: number | null;
  finishedAt: number | null;
  events: MatchEvent[];
  area: MatchArea | null;
};

export type MatchSettings = {
  playerName: string;
  durationMinutes: number;
  captorCount: number;
};

export function createMatch(settings: MatchSettings, now = Date.now(), id = `match-${now}`): MatchSession {
  const playerName = settings.playerName.trim().slice(0, 20) || "Jogador";
  const durationMinutes = Math.floor(settings.durationMinutes);
  const captorCount = Math.floor(settings.captorCount);
  if (!Number.isFinite(durationMinutes) || durationMinutes < 1 || durationMinutes > 180) throw new Error("A duração deve ficar entre 1 e 180 minutos.");
  if (!Number.isFinite(captorCount) || captorCount < 1) throw new Error("A partida precisa ter pelo menos um pegador.");
  return { id, playerId: "local-player", playerName, durationSeconds: durationMinutes * 60, captorCount, status: "waiting", createdAt: now, startedAt: null, finishedAt: null, events: [], area: null };
}

export function startMatch(match: MatchSession, now = Date.now()): MatchSession {
  if (match.status !== "waiting") return match;
  return { ...match, status: "running", startedAt: now, finishedAt: null };
}

export function registerCapture(match: MatchSession, playerId = match.playerId, now = Date.now(), eventId = `capture-${playerId}-${now}`): MatchSession {
  if (match.status !== "running") return match;
  if (match.events.some((event) => event.type === "capture_registered" && event.playerId === playerId)) return match;
  if (match.events.some((event) => event.id === eventId)) return match;
  return { ...match, events: [...match.events, { id: eventId, type: "capture_registered", playerId, createdAt: now }] };
}

export function finishMatch(match: MatchSession, now = Date.now()): MatchSession {
  if (match.status === "finished") return match;
  return { ...match, status: "finished", finishedAt: now };
}

export function getRemainingSeconds(match: MatchSession, now = Date.now()): number {
  if (!match.startedAt) return match.durationSeconds;
  const elapsed = Math.max(0, Math.floor(((match.finishedAt ?? now) - match.startedAt) / 1000));
  return Math.max(0, match.durationSeconds - elapsed);
}

export function hasLocalCapture(match: MatchSession): boolean {
  return match.events.some((event) => event.type === "capture_registered" && event.playerId === match.playerId);
}
