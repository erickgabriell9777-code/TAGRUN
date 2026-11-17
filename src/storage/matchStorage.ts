import AsyncStorage from "@react-native-async-storage/async-storage";
import type { MatchSession } from "../domain/match";

const MATCH_STORAGE_KEY = "@tagrun/current-match/v1";

export async function saveMatch(match: MatchSession): Promise<void> {
  await AsyncStorage.setItem(MATCH_STORAGE_KEY, JSON.stringify(match));
}

export async function loadMatch(): Promise<MatchSession | null> {
  const raw = await AsyncStorage.getItem(MATCH_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isMatchSession(parsed)) {
      await AsyncStorage.removeItem(MATCH_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    await AsyncStorage.removeItem(MATCH_STORAGE_KEY);
    return null;
  }
}

export async function clearMatch(): Promise<void> {
  await AsyncStorage.removeItem(MATCH_STORAGE_KEY);
}

function isMatchSession(value: unknown): value is MatchSession {
  if (!value || typeof value !== "object") return false;
  const match = value as Partial<MatchSession>;
  return typeof match.id === "string" &&
    typeof match.playerId === "string" &&
    typeof match.playerName === "string" &&
    typeof match.durationSeconds === "number" &&
    typeof match.captorCount === "number" &&
    (match.status === "waiting" || match.status === "running" || match.status === "finished") &&
    typeof match.createdAt === "number" &&
    (match.startedAt === null || typeof match.startedAt === "number") &&
    (match.finishedAt === null || typeof match.finishedAt === "number") &&
    Array.isArray(match.events) &&
    match.events.every((event) => event && typeof event.id === "string" && event.type === "capture_registered" && typeof event.playerId === "string" && typeof event.createdAt === "number");
}
