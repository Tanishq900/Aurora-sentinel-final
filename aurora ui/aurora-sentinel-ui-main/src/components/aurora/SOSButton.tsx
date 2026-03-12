import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SOSButtonProps {
  onSOS: () => void;
  onCancel?: () => void;
}

const SOSButton = ({ onSOS, onCancel }: SOSButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [isTriggered, setIsTriggered] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPressed && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isPressed && countdown === 0) {
      setIsTriggered(true);
      onSOS();
    }

    return () => clearTimeout(timer);
  }, [isPressed, countdown, onSOS]);

  const handlePress = () => {
    setIsPressed(true);
    setCountdown(10);
  };

  const handleCancel = () => {
    setIsPressed(false);
    setCountdown(10);
    setIsTriggered(false);
    onCancel?.();
  };

  const progress = ((10 - countdown) / 10) * 100;

  return (
    <div className="relative flex flex-col items-center gap-8">
      {/* Darkening overlay */}
      <AnimatePresence>
        {isPressed && (
          <motion.div
            className="fixed inset-0 bg-background/80 z-40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* SOS Button Container */}
      <div className="relative z-50">
        {/* Pulse rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                'absolute rounded-full border-2',
                isPressed ? 'border-danger' : 'border-danger/30'
              )}
              style={{
                width: 200 + i * 40,
                height: 200 + i * 40,
              }}
              animate={
                isPressed
                  ? {
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5],
                    }
                  : {
                      scale: [1, 1.1, 1],
                      opacity: [0.2, 0.4, 0.2],
                    }
              }
              transition={{
                duration: isPressed ? 0.5 : 2,
                repeat: Infinity,
                delay: i * (isPressed ? 0.15 : 0.5),
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Progress ring */}
        <AnimatePresence>
          {isPressed && !isTriggered && (
            <motion.svg
              className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)]"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: -90 }}
              exit={{ opacity: 0 }}
            >
              <circle
                cx="50%"
                cy="50%"
                r="90"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="4"
              />
              <motion.circle
                cx="50%"
                cy="50%"
                r="90"
                fill="none"
                stroke="hsl(var(--danger))"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={565}
                animate={{
                  strokeDashoffset: 565 - (565 * progress) / 100,
                }}
                transition={{ duration: 0.3, ease: 'linear' }}
                style={{
                  filter: 'drop-shadow(0 0 10px hsl(var(--danger)))',
                }}
              />
            </motion.svg>
          )}
        </AnimatePresence>

        {/* Main button */}
        <motion.button
          className={cn(
            'relative w-44 h-44 rounded-full font-bold text-lg tracking-wider',
            'flex flex-col items-center justify-center gap-2',
            'bg-gradient-to-br from-danger via-red-600 to-orange-600',
            'border-4 border-danger/50',
            'shadow-[0_0_60px_-15px_hsl(var(--danger))]',
            'focus:outline-none',
            isTriggered && 'pointer-events-none'
          )}
          animate={
            isPressed
              ? { scale: 0.95 }
              : {
                  scale: [1, 1.03, 1],
                }
          }
          transition={
            isPressed
              ? { duration: 0.1 }
              : {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
          }
          onClick={handlePress}
          disabled={isTriggered}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AlertTriangle className="w-10 h-10 text-white" />
          <span className="text-white text-xl font-black">
            {isPressed && !isTriggered ? countdown : 'SOS'}
          </span>

          {/* Shockwave on press */}
          <AnimatePresence>
            {isPressed && (
              <motion.div
                className="absolute inset-0 rounded-full bg-white"
                initial={{ opacity: 0.5, scale: 1 }}
                animate={{ opacity: 0, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Cancel button */}
      <AnimatePresence>
        {isPressed && !isTriggered && (
          <motion.button
            className={cn(
              'z-50 flex items-center gap-2 px-8 py-4 rounded-full',
              'bg-muted/80 backdrop-blur-sm border border-border',
              'text-foreground font-semibold',
              'hover:bg-aurora-cyan/20 hover:border-aurora-cyan/50 hover:text-aurora-cyan',
              'transition-all duration-300'
            )}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            onClick={handleCancel}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X size={20} />
            <span>Cancel SOS</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Alert sent confirmation */}
      <AnimatePresence>
        {isTriggered && (
          <motion.div
            className="z-50 flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              className="w-20 h-20 rounded-full bg-danger/20 border-2 border-danger flex items-center justify-center"
              animate={{
                boxShadow: [
                  '0 0 0 0 hsl(var(--danger) / 0.4)',
                  '0 0 0 20px hsl(var(--danger) / 0)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <AlertTriangle className="w-10 h-10 text-danger" />
            </motion.div>
            <div className="text-center">
              <p className="text-xl font-bold text-danger text-glow-danger">
                ALERT SENT
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Security has been notified
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      {!isPressed && (
        <motion.p
          className="text-center text-muted-foreground text-sm max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Press and hold to trigger emergency alert.
          <br />
          10-second countdown to cancel.
        </motion.p>
      )}
    </div>
  );
};

export default SOSButton;
