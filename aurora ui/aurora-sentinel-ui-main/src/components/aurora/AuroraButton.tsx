import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface AuroraButtonProps extends Omit<HTMLMotionProps<"button">, 'children'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const variants: Record<ButtonVariant, string> = {
  primary: cn(
    'bg-gradient-to-r from-aurora-cyan to-aurora-emerald text-primary-foreground',
    'hover:shadow-[0_0_40px_-10px_hsl(172_66%_50%_/_0.6)]',
    'border-transparent'
  ),
  secondary: cn(
    'bg-secondary text-secondary-foreground',
    'hover:bg-secondary/80',
    'border-border'
  ),
  danger: cn(
    'bg-gradient-to-r from-danger to-warning text-white',
    'hover:shadow-[0_0_40px_-10px_hsl(0_72%_51%_/_0.6)]',
    'border-transparent'
  ),
  ghost: cn(
    'bg-transparent text-foreground',
    'hover:bg-muted',
    'border-transparent'
  ),
  outline: cn(
    'bg-transparent text-primary border-primary/30',
    'hover:bg-primary/10 hover:border-primary/50'
  ),
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-base',
  lg: 'h-14 px-8 text-lg',
};

const AuroraButton = forwardRef<HTMLButtonElement, AuroraButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 font-medium rounded-lg border',
          'transition-all duration-300 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background',
          'disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={disabled || loading}
        {...props}
      >
        {/* Shimmer overlay */}
        <span className="absolute inset-0 rounded-lg overflow-hidden">
          <span className="absolute inset-0 shimmer" />
        </span>

        {/* Content */}
        <span className="relative flex items-center gap-2">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            icon && iconPosition === 'left' && <span>{icon}</span>
          )}
          <span>{children}</span>
          {!loading && icon && iconPosition === 'right' && <span>{icon}</span>}
        </span>
      </motion.button>
    );
  }
);

AuroraButton.displayName = 'AuroraButton';

export default AuroraButton;
