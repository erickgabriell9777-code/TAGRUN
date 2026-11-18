export type ClockSyncSample = {
  /** Local device time immediately before sending the request. */
  sentAt: number;
  /** Local device time immediately after receiving the response. */
  receivedAt: number;
  /** Timestamp supplied by the authoritative match host in that response. */
  serverTime: number;
};

export type ClockSyncEstimate = {
  offsetMs: number;
  roundTripMs: number;
  uncertaintyMs: number;
};

export function estimateClockOffset(samples: ClockSyncSample[]): ClockSyncEstimate | null {
  const valid = samples.filter((sample) =>
    Number.isFinite(sample.sentAt) &&
    Number.isFinite(sample.receivedAt) &&
    Number.isFinite(sample.serverTime) &&
    sample.receivedAt >= sample.sentAt
  );
  if (valid.length === 0) return null;

  // The lowest-latency sample is least affected by variable network delay.
  const best = valid.reduce((current, candidate) =>
    candidate.receivedAt - candidate.sentAt < current.receivedAt - current.sentAt ? candidate : current
  );
  const roundTripMs = best.receivedAt - best.sentAt;
  const midpoint = best.sentAt + roundTripMs / 2;
  return {
    offsetMs: best.serverTime - midpoint,
    roundTripMs,
    uncertaintyMs: roundTripMs / 2,
  };
}

export function getSynchronizedNow(localNow: number, estimate: ClockSyncEstimate | null): number {
  if (!Number.isFinite(localNow)) throw new Error("O horário local precisa ser válido.");
  return estimate ? localNow + estimate.offsetMs : localNow;
}
