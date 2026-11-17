import { describe, expect, it } from "vitest";
import { createMatch, finishMatch, getRemainingSeconds, hasLocalCapture, registerCapture, startMatch } from "./match";

describe("match domain", () => {
  it("creates a waiting match with validated settings", () => {
    const match = createMatch({ playerName: " Erk ", durationMinutes: 15, captorCount: 2 }, 1000, "m1");
    expect(match.playerName).toBe("Erk");
    expect(match.durationSeconds).toBe(900);
    expect(match.captorCount).toBe(2);
    expect(match.status).toBe("waiting");
  });

  it("rejects invalid duration and pegador count", () => {
    expect(() => createMatch({ playerName: "A", durationMinutes: 0, captorCount: 1 })).toThrow();
    expect(() => createMatch({ playerName: "A", durationMinutes: 10, captorCount: 0 })).toThrow();
  });

  it("calculates remaining time from timestamps rather than timer ticks", () => {
    const running = startMatch(createMatch({ playerName: "A", durationMinutes: 2, captorCount: 1 }, 1000), 5000);
    expect(getRemainingSeconds(running, 35000)).toBe(90);
  });

  it("records a local capture only once per player", () => {
    const running = startMatch(createMatch({ playerName: "A", durationMinutes: 2, captorCount: 1 }, 1000), 2000);
    const first = registerCapture(running, "local-player", 3000, "event-1");
    const second = registerCapture(first, "local-player", 4000, "event-2");
    expect(first.events).toHaveLength(1);
    expect(second.events).toHaveLength(1);
    expect(hasLocalCapture(second)).toBe(true);
  });

  it("does not accept captures before start or after finish", () => {
    const waiting = createMatch({ playerName: "A", durationMinutes: 2, captorCount: 1 });
    expect(registerCapture(waiting).events).toHaveLength(0);
    const finished = finishMatch(startMatch(waiting), Date.now());
    expect(registerCapture(finished).events).toHaveLength(0);
  });

  it("finishes a match only once", () => {
    const running = startMatch(createMatch({ playerName: "A", durationMinutes: 2, captorCount: 1 }), 100);
    const finished = finishMatch(running, 200);
    expect(finishMatch(finished, 300).finishedAt).toBe(200);
    expect(getRemainingSeconds(finished, 9999)).toBe(120);
  });
});
