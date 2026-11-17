import { describe, expect, it } from "vitest";
import { getRadarState, validateRadarConfig, type RadarConfig } from "./radar";

const config: RadarConfig = {
  intervalMs: 90_000,
  visibilityMs: 5_000,
  warningMs: 10_000,
  rangeMeters: 100,
};

describe("synchronized radar", () => {
  it("stays inactive before the match starts", () => {
    expect(getRadarState("waiting", null, 50_000, config).phase).toBe("inactive");
  });

  it("warns all devices before the first activation", () => {
    const state = getRadarState("running", 1_000, 81_000, config);
    expect(state.phase).toBe("warning");
    expect(state.nextActivationAt).toBe(91_000);
  });

  it("activates at the same timestamp derived from match start", () => {
    const state = getRadarState("running", 1_000, 91_000, config);
    expect(state.phase).toBe("active");
    expect(state.cycle).toBe(1);
    expect(state.visibleUntil).toBe(96_000);
    expect(state.rangeMeters).toBe(100);
  });

  it("ends visibility exactly at the configured boundary", () => {
    expect(getRadarState("running", 1_000, 96_000, config).phase).toBe("inactive");
  });

  it("does not activate early when the local clock is before match start", () => {
    expect(getRadarState("running", 10_000, 9_999, config).phase).toBe("inactive");
  });

  it("marks the radar finished with no future activation", () => {
    const state = getRadarState("finished", 1_000, 200_000, config);
    expect(state.phase).toBe("finished");
    expect(state.nextActivationAt).toBeNull();
  });

  it("rejects overlapping or invalid timing settings", () => {
    expect(() => validateRadarConfig({ ...config, visibilityMs: 90_000 })).toThrow();
    expect(() => validateRadarConfig({ ...config, warningMs: 85_000 })).toThrow();
    expect(() => validateRadarConfig({ ...config, rangeMeters: 0 })).toThrow();
  });
});
