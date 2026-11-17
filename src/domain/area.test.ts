import { describe, expect, it } from "vitest";
import { distanceBetweenCoordinates, isInsideMatchArea, validateMatchAreaRadius } from "./area";

const center = { latitude: -8.05, longitude: -34.9 };

describe("match area", () => {
  it("validates a practical radius range", () => {
    expect(validateMatchAreaRadius(300)).toBe(300);
    expect(() => validateMatchAreaRadius(49)).toThrow();
    expect(() => validateMatchAreaRadius(5001)).toThrow();
    expect(() => validateMatchAreaRadius(100.5)).toThrow();
  });
  it("measures zero distance at the same coordinate", () => {
    expect(distanceBetweenCoordinates(center, center)).toBe(0);
  });
  it("detects positions inside and outside the circular boundary", () => {
    const area = { center, radiusMeters: 300 };
    expect(isInsideMatchArea({ latitude: -8.0505, longitude: -34.9 }, area)).toBe(true);
    expect(isInsideMatchArea({ latitude: -8.06, longitude: -34.9 }, area)).toBe(false);
  });
  it("rejects invalid coordinates", () => {
    expect(() => distanceBetweenCoordinates(center, { latitude: 91, longitude: 0 })).toThrow();
  });
});
