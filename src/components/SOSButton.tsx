import { useState, useEffect, useRef, useCallback } from 'react';
import { sosService } from '../services/sos.service';
import type { RiskSnapshot } from '../risk/engine';
import SOSConfirmationModal from './SOSConfirmationModal';

interface SOSButtonProps {
  onSOSTriggered?: () => void;
  triggerType?: 'manual' | 'ai';
  onCancelAuto?: () => void;
  location?: { lat: number; lng: number } | null;
  riskSnapshot: RiskSnapshot;
}

export default function SOSButton({ 
  onSOSTriggered, 
  triggerType: externalTriggerType,
  onCancelAuto,
  location,
  riskSnapshot,
}: SOSButtonProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internalTriggerType, setInternalTriggerType] = useState<'manual' | 'ai'>('manual');
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const isCountdownRunningRef = useRef<boolean>(false);
  const isSOSSentRef = useRef<boolean>(false); // Prevent duplicate SOS submissions

  const waitForNextPaint = () =>
    new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

  const startSOS = (type: 'manual' | 'ai' = 'manual') => {
    isSOSSentRef.current = false; // Reset the sent flag when starting new SOS
    setInternalTriggerType(type);
    setCountdown(10);
    setIsTriggering(true);
  };

  // Support external trigger (for auto-SOS)
  // Once AI SOS is triggered, keep it active until manually canceled
  useEffect(() => {
    if (externalTriggerType === 'ai' && countdown === null && !isTriggering) {
      startSOS('ai');
    }
    // Note: We don't reset when externalTriggerType changes back to undefined
    // This ensures the countdown stays active once triggered
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalTriggerType]);

  const handleSOSClick = () => {
    if (isSubmitting) return;
    if (countdown === null) {
      // Start countdown for manual SOS
      startSOS('manual');
    }
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(null);
    setIsTriggering(false);
    if (internalTriggerType === 'ai' && onCancelAuto) {
      onCancelAuto();
    }
  };

  const triggerSOS = useCallback(async () => {
    // Prevent duplicate submissions
    if (isSOSSentRef.current) {
      return;
    }
    isSOSSentRef.current = true;
    setCountdown(null);
    setIsTriggering(false);
    setIsSubmitting(true);

    try {
      await waitForNextPaint();

      await sosService.createSOS({
        risk_score: riskSnapshot.total,
        factors: {
          audio: riskSnapshot.audio.score,
          motion: riskSnapshot.motion.score,
          time: riskSnapshot.time.score,
          location: riskSnapshot.location.score,
        },
        location: location || undefined,
        trigger_type: internalTriggerType,
      });
      
      if (onSOSTriggered) {
        onSOSTriggered();
      }
    } catch (error) {
      console.error('Failed to trigger SOS:', error);
      isSOSSentRef.current = false; // Allow retry on error
    } finally {
      setIsSubmitting(false);
    }
  }, [internalTriggerType, onSOSTriggered, location, riskSnapshot]);

  const handleSendNow = () => {
    if (isSubmitting) return;
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    void triggerSOS();
  };

  // Countdown timer effect - set up interval only once when countdown starts
  useEffect(() => {
    // If countdown is null, clear interval and reset flag
    if (isSubmitting) return;
    if (countdown === null) {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      isCountdownRunningRef.current = false;
      return;
    }

    // If countdown reached 0, trigger SOS and stop
    if (countdown <= 0) {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      isCountdownRunningRef.current = false;
      triggerSOS();
      return;
    }

    // Only start interval if it's not already running
    if (!isCountdownRunningRef.current && countdown > 0) {
      isCountdownRunningRef.current = true;
      
      // Start countdown timer - decrement every second
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 0) {
            // Stop interval when countdown reaches 0
            isCountdownRunningRef.current = false;
            if (countdownRef.current) {
              clearInterval(countdownRef.current);
              countdownRef.current = null;
            }
            return 0;
          }
          // Decrement countdown
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      // Don't clear on every render - only when component unmounts or countdown becomes null
      if (countdown === null && countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
        isCountdownRunningRef.current = false;
      }
    };
  }, [countdown, triggerSOS]);

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleSOSClick}
          disabled={isSubmitting}
          className={`
            relative w-32 h-32 rounded-full font-bold text-xl
            transition-all duration-300
            ${isTriggering 
              ? 'bg-danger hover:bg-red-600 animate-pulse'
              : 'bg-danger hover:bg-red-600'
            }
            text-white
            border border-danger/50
            shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(239,68,68,0.35)]
            hover:shadow-[0_22px_70px_rgba(0,0,0,0.65),0_0_55px_rgba(239,68,68,0.45)]
            active:scale-[0.98]
            focus:outline-none focus:ring-4 focus:ring-danger/40
            disabled:opacity-70 disabled:cursor-wait
          `}
        >
          <span>{isSubmitting ? '...' : 'SOS'}</span>
        </button>
        
        <div className="text-white text-center">
          <p className="text-sm text-slate-400">{isSubmitting ? 'Sending emergency alert...' : isTriggering ? 'Confirm or cancel the countdown' : 'Click to trigger emergency'}</p>
        </div>
      </div>

      {/* SOS Confirmation Modal */}
      <SOSConfirmationModal
        isOpen={isTriggering && countdown !== null}
        countdown={countdown !== null ? countdown : 0}
        triggerType={internalTriggerType}
        isSending={isSubmitting}
        onSendNow={handleSendNow}
        onCancel={handleCancel}
      />
    </>
  );
}
