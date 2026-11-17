export type RadarConfig = {
  /** Time between synchronized radar activations. */
  intervalMs: number;
  /** How long detected positions remain visible. */
  visibilityMs: number;
  /** Advance warning shown before each activation. */
  warningMs: number;
  /** Maximum distance used later by the detection layer. */
  rangeMeters: number;
};

export type RadarPhase = "inactive" | "warning" | "active" | "finished";

export type RadarState = {
  phase: RadarPhase;
  cycle: number;
  nextActivationAt: number | null;
  visibleUntil: number | null;
  rangeMeters: number;
};

export function validateRadarConfig(config: RadarConfig): RadarConfig {
  const values = [config.intervalMs, config.visibilityMs, config.warningMs, config.rangeMeters];
  if (values.some((value) => !Number.isFinite(value) || value <= 0)) {
    throw new Error("As configurações do radar devem ser números positivos.");
  }
  if (config.visibilityMs >= config.intervalMs) {
    throw new Error("A visibilidade do radar deve ser menor que o intervalo.");
  }
  if (config.warningMs >= config.intervalMs - config.visibilityMs) {
    throw new Error("O aviso precisa terminar antes da janela de visibilidade.");
  }
  return config;
}

/**
 * Derives the same radar phase on every device from the shared match start time.
 * Devices must receive the same startedAt and config to remain synchronized.
 */
export function getRadarState(
  status: "waiting" | "running" | "finished",
  startedAt: number | null,
  now: number,
  config: RadarConfig,
): RadarState {
  validateRadarConfig(config);
  if (status === "finished") {
    return { phase: "finished", cycle: 0, nextActivationAt: null, visibleUntil: null, rangeMeters: config.rangeMeters };
  }
  if (status !== "running" || startedAt === null || !Number.isFinite(startedAt) || now < startedAt) {
    return { phase: "inactive", cycle: 0, nextActivationAt: null, visibleUntil: null, rangeMeters: config.rangeMeters };
  }

  const elapsed = now - startedAt;
  const cycle = Math.floor(elapsed / config.intervalMs);
  const positionInCycle = elapsed % config.intervalMs;
  const activationNumber = cycle + 1;
  const nextActivationAt = startedAt + activationNumber * config.intervalMs;
  const visibleUntil = startedAt + cycle * config.intervalMs + config.visibilityMs;

  if (cycle > 0 && positionInCycle < config.visibilityMs) {
    return { phase: "active", cycle, nextActivationAt, visibleUntil, rangeMeters: config.rangeMeters };
  }
  if (positionInCycle >= config.intervalMs - config.warningMs) {
    return { phase: "warning", cycle: activationNumber, nextActivationAt, visibleUntil: null, rangeMeters: config.rangeMeters };
  }
  return { phase: "inactive", cycle: activationNumber, nextActivationAt, visibleUntil: null, rangeMeters: config.rangeMeters };
}
