import type { DeviceLocation } from "./location";

export type MatchArea = {
  center: { latitude: number; longitude: number };
  radiusMeters: number;
};

const EARTH_RADIUS_METERS = 6_371_000;

export function validateMatchAreaRadius(radiusMeters: number): number {
  if (!Number.isFinite(radiusMeters) || !Number.isInteger(radiusMeters) || radiusMeters < 50 || radiusMeters > 5000) {
    throw new Error("O raio da área deve ser um número inteiro entre 50 e 5.000 metros.");
  }
  return radiusMeters;
}

export function distanceBetweenCoordinates(a: Pick<DeviceLocation, "latitude" | "longitude">, b: Pick<DeviceLocation, "latitude" | "longitude">): number {
  const values = [a.latitude, a.longitude, b.latitude, b.longitude];
  if (!values.every(Number.isFinite) || Math.abs(a.latitude) > 90 || Math.abs(b.latitude) > 90 || Math.abs(a.longitude) > 180 || Math.abs(b.longitude) > 180) {
    throw new Error("Coordenadas inválidas.");
  }
  const toRadians = (degrees: number) => degrees * Math.PI / 180;
  const latitudeDelta = toRadians(b.latitude - a.latitude);
  const longitudeDelta = toRadians(b.longitude - a.longitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(toRadians(a.latitude)) * Math.cos(toRadians(b.latitude)) * Math.sin(longitudeDelta / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(Math.min(1, haversine)));
}

export function isInsideMatchArea(location: Pick<DeviceLocation, "latitude" | "longitude">, area: MatchArea): boolean {
  validateMatchAreaRadius(area.radiusMeters);
  return distanceBetweenCoordinates(location, area.center) <= area.radiusMeters;
}
