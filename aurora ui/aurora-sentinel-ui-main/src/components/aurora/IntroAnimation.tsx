import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import AuroraSentinelLogo from './AuroraSentinelLogo';

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
  const [phase, setPhase] = useState<'intro' | 'exit'>('intro');

  useEffect(() => {
    // After 1.5 seconds, start exit animation
    const timer = setTimeout(() => {
      setPhase('exit');
    }, 1500);

    // After exit animation, call onComplete
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'exit' ? 0 : 1 }}
      transition={{ duration: 0.8, delay: phase === 'exit' ? 0.2 : 0 }}
    >
      {/* Animated aurora background */}
      <div className="absolute inset-0">
        {/* Vertical light streaks */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-full w-px"
            style={{ left: `${10 + i * 12}%` }}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ 
              opacity: [0, 0.3, 0.1, 0.3, 0],
              scaleY: [0, 1, 1, 1, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut'
            }}
          >
            <div 
              className="w-full h-full"
              style={{
                background: `linear-gradient(to bottom, transparent, ${
                  i % 3 === 0 ? 'rgba(34, 211, 238, 0.5)' : 
                  i % 3 === 1 ? 'rgba(139, 92, 246, 0.5)' : 
                  'rgba(6, 182, 212, 0.5)'
                }, transparent)`
              }}
            />
          </motion.div>
        ))}

        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 2 === 0 ? '#22d3ee' : '#8b5cf6',
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
              y: [-20, -60],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeOut'
            }}
          />
        ))}

        {/* Aurora glow orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(34, 211, 238, 0.2), transparent)' }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2), transparent)' }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      {/* Centered Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: phase === 'exit' ? 0 : 1,
          scale: phase === 'exit' ? 0.9 : 1,
          x: phase === 'exit' ? '30vw' : 0,
        }}
        transition={{
          opacity: { duration: 0.8 },
          scale: { duration: 0.8, ease: 'easeOut' },
          x: { duration: 0.8, ease: 'easeInOut' }
        }}
      >
        <AuroraSentinelLogo size="xl" showText={true} glowing={true} />
        
        {/* Tagline */}
        <motion.p
          className="text-center text-muted-foreground mt-6 text-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: phase === 'exit' ? 0 : 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Intelligent Safety. Always Watching.
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default IntroAnimation;
