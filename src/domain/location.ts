export type DeviceLocation = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
};

export type LocationFreshness = "fresh" | "stale" | "unavailable";

export const LOCATION_STALE_AFTER_MS = 15_000;

export function getLocationFreshness(location: DeviceLocation | null, now = Date.now(), staleAfterMs = LOCATION_STALE_AFTER_MS): LocationFreshness {
  if (!location) return "unavailable";
  if (!Number.isFinite(location.timestamp) || now - location.timestamp > staleAfterMs || location.timestamp > now) return "stale";
  return "fresh";
}

export function formatLocationAge(ageMs: number): string {
  const safeAge = Math.max(0, Math.floor(ageMs / 1000));
  if (safeAge < 2) return "agora";
  if (safeAge < 60) return "há " + safeAge + " s";
  return "há " + Math.floor(safeAge / 60) + " min";
}
