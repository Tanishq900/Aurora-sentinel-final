import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  glow?: 'cyan' | 'danger' | 'warning' | 'safe' | 'none';
  hover?: boolean;
}

const glowStyles = {
  cyan: 'hover:shadow-[0_0_60px_-15px_hsl(172_66%_50%_/_0.4)]',
  danger: 'hover:shadow-[0_0_60px_-15px_hsl(0_72%_51%_/_0.5)]',
  warning: 'hover:shadow-[0_0_60px_-15px_hsl(38_92%_50%_/_0.4)]',
  safe: 'hover:shadow-[0_0_60px_-15px_hsl(142_76%_36%_/_0.4)]',
  none: '',
};

const GlassCard = ({
  children,
  className,
  glow = 'cyan',
  hover = true,
  ...props
}: GlassCardProps) => {
  return (
    <motion.div
      className={cn(
        'glass-card',
        hover && 'transition-all duration-500',
        hover && glowStyles[glow],
        className
      )}
      whileHover={hover ? { y: -2 } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
