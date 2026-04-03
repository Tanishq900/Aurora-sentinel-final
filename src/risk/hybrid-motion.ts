import type { MotionData } from '../sensors/motion';

export type MotionClassification = 'drop-like' | 'running-like' | 'abnormal' | 'inconclusive';

export interface HybridMotionConfig {
  sampleIntervalMs: number;
  validationWindowMs: number;
  cooldownMs: number;
  spikeDeltaThreshold: number;
  minimumMotionThreshold: number;
  highMotionThreshold: number;
  dropAverageThreshold: number;
  runningVarianceThreshold: number;
  abnormalVarianceThreshold: number;
  abnormalMaxThreshold: number;
  abnormalSpikeCountThreshold: number;
  earlyConfirmConfidence: number;
  earlyRejectConfidence: number;
}

export interface MotionSample {
  timestamp: number;
  motion: number;
}

export interface SpikeDetectionResult {
  detected: boolean;
  delta: number;
  reason?: string;
}

export interface MotionFeatures {
  sampleCount: number;
  average: number;
  variance: number;
  max: number;
  min: number;
  range: number;
  spikeCount: number;
  lowMotionRatio: number;
}

export interface MotionDecision {
  classification: MotionClassification;
  validatedDanger: boolean;
  confidence: number;
  reason: string;
  shouldEarlyConfirm: boolean;
  shouldEarlyReject: boolean;
}

export interface ValidationSnapshot {
  triggeredAt: number;
  lastUpdatedAt: number;
  elapsedMs: number;
  previousMotion: number;
  latestMotion: number;
  cooldownRemainingMs: number;
  spike: SpikeDetectionResult;
  features: MotionFeatures;
  decision: MotionDecision;
}

export const DEFAULT_HYBRID_MOTION_CONFIG: HybridMotionConfig = {
  sampleIntervalMs: 100,
  validationWindowMs: 4000,
  cooldownMs: 7000,
  spikeDeltaThreshold: 0.2,
  minimumMotionThreshold: 0.08,
  highMotionThreshold: 0.65,
  dropAverageThreshold: 0.12,
  runningVarianceThreshold: 0.01,
  abnormalVarianceThreshold: 0.045,
  abnormalMaxThreshold: 0.78,
  abnormalSpikeCountThreshold: 3,
  earlyConfirmConfidence: 0.85,
  earlyRejectConfidence: 0.82,
};

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(Math.max(value, min), max);
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function getMotionValue(motion: Pick<MotionData, 'intensity'>): number {
  return clamp(motion.intensity);
}

export function detectMotionSpike(
  currentMotion: number,
  previousMotion: number,
  config: HybridMotionConfig = DEFAULT_HYBRID_MOTION_CONFIG
): SpikeDetectionResult {
  const delta = Math.abs(currentMotion - previousMotion);
  const meetsDelta = delta >= config.spikeDeltaThreshold;
  const meetsFloor = currentMotion >= config.minimumMotionThreshold;
  const detected = meetsDelta && meetsFloor;

  if (!detected) {
    if (!meetsDelta) {
      return { detected: false, delta: round(delta), reason: 'delta below spike threshold' };
    }

    return { detected: false, delta: round(delta), reason: 'motion below minimum event floor' };
  }

  return {
    detected: true,
    delta: round(delta),
    reason: `motion spike detected (delta ${round(delta)})`,
  };
}

export function extractMotionFeatures(
  samples: readonly MotionSample[],
  config: HybridMotionConfig = DEFAULT_HYBRID_MOTION_CONFIG
): MotionFeatures {
  if (samples.length === 0) {
    return {
      sampleCount: 0,
      average: 0,
      variance: 0,
      max: 0,
      min: 0,
      range: 0,
      spikeCount: 0,
      lowMotionRatio: 1,
    };
  }

  let sum = 0;
  let max = Number.NEGATIVE_INFINITY;
  let min = Number.POSITIVE_INFINITY;

  for (const sample of samples) {
    sum += sample.motion;
    if (sample.motion > max) max = sample.motion;
    if (sample.motion < min) min = sample.motion;
  }

  const average = sum / samples.length;

  let varianceAccumulator = 0;
  let spikeCount = 0;
  let lowMotionCount = 0;

  for (let i = 0; i < samples.length; i++) {
    const current = samples[i].motion;
    const diff = current - average;
    varianceAccumulator += diff * diff;

    if (current <= config.dropAverageThreshold) {
      lowMotionCount += 1;
    }

    if (i > 0) {
      const delta = Math.abs(current - samples[i - 1].motion);
      if (delta >= config.spikeDeltaThreshold) {
        spikeCount += 1;
      }
    }
  }

  const variance = varianceAccumulator / samples.length;

  return {
    sampleCount: samples.length,
    average: round(average),
    variance: round(variance),
    max: round(max),
    min: round(min),
    range: round(max - min),
    spikeCount,
    lowMotionRatio: round(lowMotionCount / samples.length),
  };
}

export function classifyMotionWindow(
  features: MotionFeatures,
  config: HybridMotionConfig = DEFAULT_HYBRID_MOTION_CONFIG
): MotionDecision {
  if (features.sampleCount < 3) {
    return {
      classification: 'inconclusive',
      validatedDanger: false,
      confidence: 0.2,
      reason: 'not enough motion samples for validation',
      shouldEarlyConfirm: false,
      shouldEarlyReject: false,
    };
  }

  const dropConfidence = clamp(
    (config.dropAverageThreshold - features.average) / Math.max(config.dropAverageThreshold, 0.001) * 0.55 +
      features.lowMotionRatio * 0.45
  );

  if (features.average <= config.dropAverageThreshold && features.lowMotionRatio >= 0.6) {
    return {
      classification: 'drop-like',
      validatedDanger: false,
      confidence: round(dropConfidence),
      reason: 'drop-like motion rejected: spike was followed by very low sustained motion',
      shouldEarlyConfirm: false,
      shouldEarlyReject: dropConfidence >= config.earlyRejectConfidence,
    };
  }

  const runningConfidence = clamp(
    (1 - clamp(features.variance / Math.max(config.runningVarianceThreshold, 0.001))) * 0.55 +
      clamp(features.average / Math.max(config.highMotionThreshold, 0.001)) * 0.25 +
      (1 - clamp(features.range / Math.max(config.highMotionThreshold, 0.001))) * 0.2
  );

  if (
    features.average >= config.minimumMotionThreshold &&
    features.variance <= config.runningVarianceThreshold &&
    features.range <= config.highMotionThreshold
  ) {
    return {
      classification: 'running-like',
      validatedDanger: false,
      confidence: round(runningConfidence),
      reason: 'running-like motion rejected: movement is smooth and low-variance',
      shouldEarlyConfirm: false,
      shouldEarlyReject: runningConfidence >= config.earlyRejectConfidence,
    };
  }

  const varianceScore = clamp(features.variance / Math.max(config.abnormalVarianceThreshold, 0.001));
  const maxScore = clamp(features.max / Math.max(config.abnormalMaxThreshold, 0.001));
  const spikeScore = clamp(features.spikeCount / Math.max(config.abnormalSpikeCountThreshold, 1));
  const rangeScore = clamp(features.range / Math.max(config.highMotionThreshold, 0.001));
  const abnormalConfidence = clamp(
    varianceScore * 0.4 +
      maxScore * 0.25 +
      spikeScore * 0.2 +
      rangeScore * 0.15
  );

  if (
    features.variance >= config.abnormalVarianceThreshold ||
    (features.max >= config.abnormalMaxThreshold && features.spikeCount >= config.abnormalSpikeCountThreshold)
  ) {
    return {
      classification: 'abnormal',
      validatedDanger: true,
      confidence: round(abnormalConfidence),
      reason: 'abnormal motion confirmed: high variance and irregular movement detected',
      shouldEarlyConfirm: abnormalConfidence >= config.earlyConfirmConfidence,
      shouldEarlyReject: false,
    };
  }

  return {
    classification: 'inconclusive',
    validatedDanger: false,
    confidence: 0.45,
    reason: 'motion pattern is ambiguous and needs supporting context',
    shouldEarlyConfirm: false,
    shouldEarlyReject: false,
  };
}

export class RollingMotionBuffer {
  private readonly capacity: number;
  private readonly samples: MotionSample[];
  private nextIndex = 0;
  private count = 0;

  constructor(capacity: number) {
    this.capacity = Math.max(1, Math.floor(capacity));
    this.samples = new Array<MotionSample>(this.capacity);
  }

  push(sample: MotionSample): void {
    this.samples[this.nextIndex] = sample;
    this.nextIndex = (this.nextIndex + 1) % this.capacity;
    this.count = Math.min(this.count + 1, this.capacity);
  }

  clear(): void {
    this.nextIndex = 0;
    this.count = 0;
  }

  size(): number {
    return this.count;
  }

  toArray(): MotionSample[] {
    if (this.count === 0) {
      return [];
    }

    const ordered: MotionSample[] = [];
    const start = this.count === this.capacity ? this.nextIndex : 0;

    for (let i = 0; i < this.count; i++) {
      const index = (start + i) % this.capacity;
      ordered.push(this.samples[index]);
    }

    return ordered;
  }
}

export class HybridMotionAnalyzer {
  private readonly config: HybridMotionConfig;
  private readonly rollingBuffer: RollingMotionBuffer;
  private validationStartTime: number | null = null;
  private cooldownUntil = 0;
  private lastMotion = 0;
  private lastSampleAt = 0;
  private lastSnapshot: ValidationSnapshot | null = null;

  constructor(config?: Partial<HybridMotionConfig>) {
    this.config = { ...DEFAULT_HYBRID_MOTION_CONFIG, ...config };
    const capacity = Math.ceil(this.config.validationWindowMs / this.config.sampleIntervalMs);
    this.rollingBuffer = new RollingMotionBuffer(capacity);
  }

  getConfig(): HybridMotionConfig {
    return this.config;
  }

  getLastSnapshot(): ValidationSnapshot | null {
    return this.lastSnapshot;
  }

  isValidating(): boolean {
    return this.validationStartTime !== null;
  }

  isCoolingDown(now = Date.now()): boolean {
    return now < this.cooldownUntil;
  }

  reset(): void {
    this.validationStartTime = null;
    this.cooldownUntil = 0;
    this.lastMotion = 0;
    this.lastSampleAt = 0;
    this.lastSnapshot = null;
    this.rollingBuffer.clear();
  }

  dismiss(now = Date.now()): void {
    this.validationStartTime = null;
    this.cooldownUntil = now + this.config.cooldownMs;
    this.rollingBuffer.clear();
  }

  getCooldownRemainingMs(now = Date.now()): number {
    return Math.max(this.cooldownUntil - now, 0);
  }

  beginValidation(now = Date.now()): void {
    this.validationStartTime = now;
    this.lastSnapshot = null;
    this.rollingBuffer.clear();
  }

  ingestMotion(
    motionData: Pick<MotionData, 'intensity'>,
    now = Date.now()
  ): {
    spike: SpikeDetectionResult;
    snapshot: ValidationSnapshot | null;
    isValidationComplete: boolean;
  } {
    const motion = getMotionValue(motionData);
    const spike = detectMotionSpike(motion, this.lastMotion, this.config);
    const shouldSample = this.lastSampleAt === 0 || now - this.lastSampleAt >= this.config.sampleIntervalMs;

    if (!this.isValidating() && spike.detected && !this.isCoolingDown(now)) {
      this.beginValidation(now);
    }

    if (this.isValidating() && shouldSample) {
      this.rollingBuffer.push({ timestamp: now, motion });
      this.lastSampleAt = now;
      this.lastSnapshot = this.buildSnapshot(spike, now, motion);
    }

    this.lastMotion = motion;

    if (!this.lastSnapshot) {
      return { spike, snapshot: null, isValidationComplete: false };
    }

    const isValidationComplete =
      this.lastSnapshot.elapsedMs >= this.config.validationWindowMs ||
      this.lastSnapshot.decision.shouldEarlyConfirm ||
      this.lastSnapshot.decision.shouldEarlyReject;

    return {
      spike,
      snapshot: this.lastSnapshot,
      isValidationComplete,
    };
  }

  private buildSnapshot(
    spike: SpikeDetectionResult,
    now: number,
    latestMotion: number
  ): ValidationSnapshot {
    const triggeredAt = this.validationStartTime ?? now;
    const features = extractMotionFeatures(this.rollingBuffer.toArray(), this.config);
    const decision = classifyMotionWindow(features, this.config);

    return {
      triggeredAt,
      lastUpdatedAt: now,
      elapsedMs: now - triggeredAt,
      previousMotion: round(this.lastMotion),
      latestMotion: round(latestMotion),
      cooldownRemainingMs: this.getCooldownRemainingMs(now),
      spike,
      features,
      decision,
    };
  }
}
