/**
 * Frontend Risk Engine - Matches backend calculations
 */

import { AudioData } from '../sensors/audio';
import { MotionData } from '../sensors/motion';
import type { MotionClassification, ValidationSnapshot } from './hybrid-motion';

export interface RiskFactors {
  audio: number;
  motion: number;
  time: number;
  location: number;
  total: number;
}

export interface RiskSnapshot {
  audio: {
    stress: number;
    score: number;
  };
  motion: {
    intensity: number;
    score: number;
    rawScore: number;
    classification: MotionClassification;
    confidence: number;
    validatedDanger: boolean;
    reason?: string;
  };
  time: {
    riskFactor: number;
    score: number;
  };
  location: {
    riskFactor: number;
    score: number;
  };
  total: number;
  level: 'low' | 'medium' | 'high';
  autoSOS: {
    shouldTrigger: boolean;
    supportSignals: string[];
    confidence: number;
    reason: string;
  };
}

let lastAutoSOSTimestamp = 0;

export interface RiskCalculationOptions {
  motionValidation?: ValidationSnapshot | null;
}

export interface AutoSOSDecision {
  shouldTrigger: boolean;
  supportSignals: string[];
  confidence: number;
  reason: string;
}

export function calculateAudioStress(inputs: { rms: number; pitchVariance: number; spikeCount: number }): number {
  const { rms, pitchVariance, spikeCount } = inputs;
  
  const audioStress = 
    (rms * 0.5) +
    (pitchVariance * 0.3) +
    (Math.min(spikeCount / 5, 1) * 0.2);
  
  const audioScore = audioStress * 35;
  return Math.min(audioScore, 35);
}

export function calculateMotionIntensity(inputs: { accelerationMagnitude: number; jitter: number }): number {
  const { accelerationMagnitude, jitter } = inputs;
  
  const motionIntensity = Math.min(
    (accelerationMagnitude / 30) * 0.6 +
    (jitter / 20) * 0.4,
    1
  );
  
  const motionScore = motionIntensity * 25;
  return Math.min(motionScore, 25);
}

export function calculateTimeRisk(date?: Date): number {
  const now = date || new Date();
  const hour = now.getHours();
  
  let timeRiskFactor: number;
  
  if (hour >= 6 && hour < 20) {
    timeRiskFactor = 0.2;
  } else if (hour >= 20 && hour < 24) {
    timeRiskFactor = 0.6;
  } else if (hour >= 0 && hour < 4) {
    timeRiskFactor = 1.0;
  } else {
    timeRiskFactor = 0.4;
  }
  
  const timeScore = timeRiskFactor * 20;
  return timeScore;
}

export function calculateLocationRisk(location?: any): number {
  // Default: neutral/no zone = 10
  let locationScore = 10;
  
  // If location has zone info from backend, use it
  if (location?.matchedZone) {
    if (location.matchedZone.type === 'high') {
      locationScore = 20; // High-risk zone = 20
    } else {
      locationScore = 12; // Low-risk zone = 12
    }
  } else if (location?.isNormalZone) {
    locationScore = 10; // Neutral/no zone = 10
  }
  
  const presentationMode = (location?.presentationMode as boolean | undefined) === true;
  if (presentationMode) {
    return 20;
  }

  return locationScore;
}

export function calculateValidatedMotionScore(
  rawMotionScore: number,
  motionValidation?: ValidationSnapshot | null
): {
  score: number;
  classification: MotionClassification;
  confidence: number;
  validatedDanger: boolean;
  reason?: string;
} {
  if (!motionValidation) {
    return {
      score: Math.min(rawMotionScore * 0.35, 8),
      classification: 'inconclusive',
      confidence: 0,
      validatedDanger: false,
      reason: 'no validated motion event yet',
    };
  }

  const { classification, confidence, validatedDanger, reason } = motionValidation.decision;

  let score = rawMotionScore;

  switch (classification) {
    case 'abnormal':
      score = rawMotionScore;
      break;
    case 'running-like':
      score = Math.min(rawMotionScore * 0.25, 6);
      break;
    case 'drop-like':
      score = 0;
      break;
    case 'inconclusive':
    default:
      score = Math.min(rawMotionScore * 0.4, 10);
      break;
  }

  return {
    score,
    classification,
    confidence,
    validatedDanger,
    reason,
  };
}

export function evaluateAutoSOSDecision(snapshot: RiskSnapshot): AutoSOSDecision {
  const supportSignals: string[] = [];

  const highAudio = snapshot.audio.score >= 18;
  const unsafeLocation = snapshot.location.score >= 15;
  const riskyTime = snapshot.time.score >= 12;
  const veryHighConfidence = snapshot.motion.confidence >= 0.92;

  if (highAudio) supportSignals.push('high audio');
  if (unsafeLocation) supportSignals.push('unsafe location');
  if (riskyTime) supportSignals.push('risky time');

  const hasSupportSignal = supportSignals.length > 0;
  const validatedDanger = snapshot.motion.validatedDanger;
  const confidence = snapshot.motion.confidence;
  if (!validatedDanger) {
    return {
      shouldTrigger: false,
      supportSignals,
      confidence,
      reason: 'motion event not validated as dangerous',
    };
  }

  if (!hasSupportSignal && !veryHighConfidence) {
    return {
      shouldTrigger: false,
      supportSignals,
      confidence,
      reason: 'validated motion needs audio, location, or time support',
    };
  }

  return {
    shouldTrigger: true,
    supportSignals,
    confidence,
    reason: hasSupportSignal
      ? `validated abnormal motion + ${supportSignals.join(' + ')}`
      : 'validated abnormal motion with very high confidence',
  };
}

export function calculateTotalRisk(
  audioData: AudioData,
  motionData: MotionData,
  location?: any,
  date?: Date,
  options?: RiskCalculationOptions
): RiskSnapshot {
  const audioScore = calculateAudioStress({
    rms: audioData.rms,
    pitchVariance: audioData.pitchVariance,
    spikeCount: audioData.spikeCount,
  });

  const motionScore = calculateMotionIntensity({
    accelerationMagnitude: motionData.accelerationMagnitude,
    jitter: motionData.jitter,
  });
  const validatedMotion = calculateValidatedMotionScore(motionScore, options?.motionValidation);

  const timeScore = calculateTimeRisk(date);
  const locationScore = calculateLocationRisk(location);

  const totalRisk = audioScore + validatedMotion.score + timeScore + locationScore;

  let level: 'low' | 'medium' | 'high';
  if (totalRisk < 25) {
    level = 'low';
  } else if (totalRisk < 50) {
    level = 'medium';
  } else {
    level = 'high';
  }

  return {
    audio: {
      stress: audioData.stress,
      score: audioScore,
    },
    motion: {
      intensity: motionData.intensity,
      score: validatedMotion.score,
      rawScore: motionScore,
      classification: validatedMotion.classification,
      confidence: validatedMotion.confidence,
      validatedDanger: validatedMotion.validatedDanger,
      reason: validatedMotion.reason,
    },
    time: {
      riskFactor: (() => {
        const hour = (date || new Date()).getHours();
        if (hour >= 6 && hour < 20) return 0.2;
        if (hour >= 20 && hour < 24) return 0.6;
        if (hour >= 0 && hour < 4) return 1.0;
        return 0.4;
      })(),
      score: timeScore,
    },
    location: {
      riskFactor: 1.0,
      score: locationScore,
    },
    total: totalRisk,
    level,
    autoSOS: evaluateAutoSOSDecision({
      audio: {
        stress: audioData.stress,
        score: audioScore,
      },
      motion: {
        intensity: motionData.intensity,
        score: validatedMotion.score,
        rawScore: motionScore,
        classification: validatedMotion.classification,
        confidence: validatedMotion.confidence,
        validatedDanger: validatedMotion.validatedDanger,
        reason: validatedMotion.reason,
      },
      time: {
        riskFactor: (() => {
          const hour = (date || new Date()).getHours();
          if (hour >= 6 && hour < 20) return 0.2;
          if (hour >= 20 && hour < 24) return 0.6;
          if (hour >= 0 && hour < 4) return 1.0;
          return 0.4;
        })(),
        score: timeScore,
      },
      location: {
        riskFactor: 1.0,
        score: locationScore,
      },
      total: totalRisk,
      level,
      autoSOS: {
        shouldTrigger: false,
        supportSignals: [],
        confidence: 0,
        reason: '',
      },
    }),
  };
}

/**
 * Check if auto-SOS should be triggered
 */
export function shouldTriggerAutoSOS(totalRisk: number, _presentationMode?: boolean, force = false): boolean {
  const threshold = 50;
  if (!force && totalRisk <= threshold) {
    return false;
  }

  const now = Date.now();
  if (now - lastAutoSOSTimestamp < 10000) {
    return false;
  }

  lastAutoSOSTimestamp = now;
  return true;
}
