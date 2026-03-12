import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuroraInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showPasswordStrength?: boolean;
}

const calculateStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 15;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^A-Za-z0-9]/.test(password)) strength += 10;
  return Math.min(strength, 100);
};

const getStrengthColor = (strength: number): string => {
  if (strength < 25) return 'hsl(var(--danger))';
  if (strength < 50) return 'hsl(var(--warning))';
  if (strength < 75) return 'hsl(172 66% 50%)';
  return 'hsl(var(--safe))';
};

const getStrengthLabel = (strength: number): string => {
  if (strength < 25) return 'Weak';
  if (strength < 50) return 'Fair';
  if (strength < 75) return 'Good';
  return 'Strong';
};

const AuroraInput = forwardRef<HTMLInputElement, AuroraInputProps>(
  ({ label, error, showPasswordStrength, type, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [value, setValue] = useState('');

    const isPassword = type === 'password';
    const strength = showPasswordStrength ? calculateStrength(value) : 0;

    return (
      <div className="relative space-y-2">
        {label && (
          <label className="block text-sm font-medium text-muted-foreground">
            {label}
          </label>
        )}

        <div className="relative">
          {/* Glow effect */}
          <AnimatePresence>
            {isFocused && (
              <motion.div
                className="absolute -inset-[2px] rounded-lg opacity-50"
                style={{
                  background: error
                    ? 'linear-gradient(135deg, hsl(var(--danger) / 0.3), hsl(var(--danger) / 0.1))'
                    : 'linear-gradient(135deg, hsl(172 66% 50% / 0.3), hsl(160 84% 39% / 0.1))',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>

          <input
            ref={ref}
            type={isPassword && showPassword ? 'text' : type}
            className={cn(
              'relative w-full rounded-lg border border-border bg-card/50 px-4 py-3 text-foreground',
              'placeholder:text-muted-foreground/50 backdrop-blur-sm',
              'transition-all duration-300',
              'focus:outline-none focus:border-primary/50',
              isPassword && 'pr-12',
              error && 'border-destructive/50',
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => {
              setValue(e.target.value);
              props.onChange?.(e);
            }}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        {/* Password strength indicator */}
        <AnimatePresence>
          {showPasswordStrength && value && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: getStrengthColor(strength) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${strength}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </div>
                <span
                  className="text-xs font-medium"
                  style={{ color: getStrengthColor(strength) }}
                >
                  {getStrengthLabel(strength)}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                <StrengthCheck label="8+ chars" met={value.length >= 8} />
                <StrengthCheck label="Uppercase" met={/[A-Z]/.test(value)} />
                <StrengthCheck label="Number" met={/[0-9]/.test(value)} />
                <StrengthCheck label="Symbol" met={/[^A-Za-z0-9]/.test(value)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-1.5 text-destructive text-sm"
            >
              <AlertCircle size={14} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

const StrengthCheck = ({ label, met }: { label: string; met: boolean }) => (
  <span className={cn('flex items-center gap-1', met ? 'text-safe' : 'text-muted-foreground/50')}>
    {met ? <Check size={12} /> : <X size={12} />}
    {label}
  </span>
);

AuroraInput.displayName = 'AuroraInput';

export default AuroraInput;
