import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import GlassCard from './GlassCard';

interface RiskFactorProps {
  icon: ReactNode;
  label: string;
  value: number;
  maxValue?: number;
  unit?: string;
  type?: 'waveform' | 'bars' | 'pulse' | 'grid';
}

const getColor = (value: number, max: number): string => {
  const percent = (value / max) * 100;
  if (percent < 25) return 'hsl(142, 76%, 36%)';
  if (percent < 50) return 'hsl(48, 96%, 53%)';
  if (percent < 75) return 'hsl(38, 92%, 50%)';
  return 'hsl(0, 72%, 51%)';
};

const Waveform = ({ value, color }: { value: number; color: string }) => (
  <div className="flex items-center gap-0.5 h-8">
    {[...Array(16)].map((_, i) => {
      const height = Math.sin((i / 16) * Math.PI * 2 + Date.now() / 500) * 0.5 + 0.5;
      const intensity = (value / 100) * height;

      return (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            height: `${20 + intensity * 60}%`,
            opacity: 0.4 + intensity * 0.6,
          }}
          transition={{
            duration: 0.15,
            ease: 'easeOut',
          }}
        />
      );
    })}
  </div>
);

const Bars = ({ value, color }: { value: number; color: string }) => (
  <div className="flex items-end gap-1 h-8">
    {[...Array(8)].map((_, i) => {
      const baseHeight = 20 + (i * 10);
      const active = (value / 100) * 8 > i;

      return (
        <motion.div
          key={i}
          className="w-2 rounded-sm"
          style={{ backgroundColor: active ? color : 'hsl(var(--muted))' }}
          animate={{
            height: active ? `${baseHeight}%` : '20%',
            opacity: active ? 1 : 0.3,
          }}
          transition={{ duration: 0.2, delay: i * 0.05 }}
        />
      );
    })}
  </div>
);

const Pulse = ({ value, color }: { value: number; color: string }) => (
  <div className="relative flex items-center justify-center h-8 w-full">
    <motion.div
      className="absolute w-6 h-6 rounded-full"
      style={{ backgroundColor: color, opacity: 0.2 }}
      animate={{
        scale: [1, 1.5 + (value / 100) * 0.5, 1],
        opacity: [0.2, 0.4, 0.2],
      }}
      transition={{ duration: 1, repeat: Infinity }}
    />
    <motion.div
      className="w-4 h-4 rounded-full"
      style={{ backgroundColor: color }}
      animate={{
        scale: [1, 1.1, 1],
      }}
      transition={{ duration: 0.5, repeat: Infinity }}
    />
  </div>
);

const Grid = ({ value, color }: { value: number; color: string }) => (
  <div className="grid grid-cols-4 gap-1 w-16 h-8">
    {[...Array(16)].map((_, i) => {
      const active = (value / 100) * 16 > i;
      return (
        <motion.div
          key={i}
          className="rounded-sm"
          style={{ backgroundColor: active ? color : 'hsl(var(--muted))' }}
          animate={{
            opacity: active ? [0.5, 1, 0.5] : 0.2,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.05,
          }}
        />
      );
    })}
  </div>
);

const RiskFactor = ({
  icon,
  label,
  value,
  maxValue = 100,
  unit = '',
  type = 'bars',
}: RiskFactorProps) => {
  const color = getColor(value, maxValue);

  const visualizations = {
    waveform: <Waveform value={value} color={color} />,
    bars: <Bars value={value} color={color} />,
    pulse: <Pulse value={value} color={color} />,
    grid: <Grid value={value} color={color} />,
  };

  return (
    <GlassCard className="p-4" hover={false}>
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {label}
            </span>
            <span className="font-mono text-sm font-semibold" style={{ color }}>
              {value}
              {unit}
            </span>
          </div>
          {visualizations[type]}
        </div>
      </div>

      {/* Particle effect for high values */}
      {value > 75 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{ backgroundColor: color }}
              initial={{ x: '50%', y: '100%', opacity: 0 }}
              animate={{
                y: '-20%',
                opacity: [0, 0.8, 0],
                x: `${40 + i * 5}%`,
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </GlassCard>
  );
};

export default RiskFactor;
