import { describe, expect, it } from "vitest";
import { formatLocationAge, getLocationFreshness, type DeviceLocation } from "./location";

const fix: DeviceLocation = { latitude: -8.05, longitude: -34.9, accuracy: 8, timestamp: 10_000 };

describe("location freshness", () => {
  it("marks a recent GPS fix as fresh", () => { expect(getLocationFreshness(fix, 20_000)).toBe("fresh"); });
  it("marks a GPS fix older than the limit as stale", () => { expect(getLocationFreshness(fix, 26_000)).toBe("stale"); });
  it("does not treat a future timestamp as live", () => { expect(getLocationFreshness(fix, 9_000)).toBe("stale"); });
  it("reports unavailable when no fix exists", () => { expect(getLocationFreshness(null, 20_000)).toBe("unavailable"); });
  it("formats elapsed time for the location label", () => {
    expect(formatLocationAge(1_000)).toBe("agora");
    expect(formatLocationAge(8_000)).toBe("há 8 s");
    expect(formatLocationAge(125_000)).toBe("há 2 min");
  });
});
