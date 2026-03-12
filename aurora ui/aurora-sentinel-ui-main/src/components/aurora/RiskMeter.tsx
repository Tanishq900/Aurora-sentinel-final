import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface RiskMeterProps {
  value: number; // 0-100
  size?: number;
}

const getColor = (value: number): string => {
  if (value < 25) return 'hsl(142, 76%, 36%)'; // Green
  if (value < 50) return 'hsl(48, 96%, 53%)'; // Yellow
  if (value < 75) return 'hsl(38, 92%, 50%)'; // Amber
  return 'hsl(0, 72%, 51%)'; // Red
};

const getLabel = (value: number): string => {
  if (value < 25) return 'LOW';
  if (value < 50) return 'MODERATE';
  if (value < 75) return 'ELEVATED';
  return 'HIGH';
};

const RiskMeter = ({ value, size = 200 }: RiskMeterProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Smooth interpolation
    const duration = 500;
    const steps = 30;
    const stepDuration = duration / steps;
    const increment = (value - displayValue) / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setDisplayValue((prev) => {
        const next = prev + increment;
        return currentStep >= steps ? value : next;
      });

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [value]);

  const color = getColor(displayValue);
  const label = getLabel(displayValue);

  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius * 0.75; // 270 degree arc
  const strokeDashoffset = circumference - (circumference * displayValue) / 100;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background arc */}
      <svg
        className="absolute inset-0 -rotate-[135deg]"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.25}
        />
      </svg>

      {/* Progress arc */}
      <svg
        className="absolute inset-0 -rotate-[135deg]"
        width={size}
        height={size}
      >
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 15px ${color})`,
          }}
        />
      </svg>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-8 rounded-full"
        style={{
          background: `radial-gradient(circle at center, ${color}20 0%, transparent 70%)`,
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-mono text-4xl font-bold"
          style={{ color }}
          key={Math.round(displayValue)}
        >
          {Math.round(displayValue)}
        </motion.span>
        <span
          className="text-xs font-semibold tracking-wider mt-1"
          style={{ color }}
        >
          {label}
        </span>
      </div>

      {/* Tick marks */}
      {[0, 25, 50, 75, 100].map((tick) => {
        const angle = -135 + (tick / 100) * 270;
        const rad = (angle * Math.PI) / 180;
        const tickRadius = radius + 15;
        const x = size / 2 + Math.cos(rad) * tickRadius;
        const y = size / 2 + Math.sin(rad) * tickRadius;

        return (
          <span
            key={tick}
            className="absolute text-[10px] font-mono text-muted-foreground -translate-x-1/2 -translate-y-1/2"
            style={{ left: x, top: y }}
          >
            {tick}
          </span>
        );
      })}
    </div>
  );
};

export default RiskMeter;
