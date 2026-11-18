import { describe, expect, it } from "vitest";
import { estimateClockOffset, getSynchronizedNow } from "./clockSync";

describe("clock synchronization", () => {
  it("estimates offset using the request midpoint", () => {
    const estimate = estimateClockOffset([{ sentAt: 1_000, receivedAt: 1_200, serverTime: 1_300 }]);
    expect(estimate).toEqual({ offsetMs: 200, roundTripMs: 200, uncertaintyMs: 100 });
  });

  it("chooses the sample with the lowest round-trip time", () => {
    const estimate = estimateClockOffset([
      { sentAt: 0, receivedAt: 1_000, serverTime: 1_600 },
      { sentAt: 2_000, receivedAt: 2_100, serverTime: 2_200 },
    ]);
    expect(estimate?.roundTripMs).toBe(100);
    expect(estimate?.offsetMs).toBe(150);
  });

  it("ignores invalid samples and returns null when none remain", () => {
    expect(estimateClockOffset([{ sentAt: 5, receivedAt: 4, serverTime: 9 }])).toBeNull();
  });

  it("applies the estimated offset to local time", () => {
    expect(getSynchronizedNow(5_000, { offsetMs: 250, roundTripMs: 50, uncertaintyMs: 25 })).toBe(5_250);
    expect(getSynchronizedNow(5_000, null)).toBe(5_000);
  });

  it("rejects an invalid local timestamp", () => {
    expect(() => getSynchronizedNow(Number.NaN, null)).toThrow();
  });
});
