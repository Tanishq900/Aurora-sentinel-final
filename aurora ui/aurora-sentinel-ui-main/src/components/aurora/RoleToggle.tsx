import { motion } from 'framer-motion';
import { User, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleToggleProps {
  role: 'student' | 'security';
  onChange: (role: 'student' | 'security') => void;
}

const RoleToggle = ({ role, onChange }: RoleToggleProps) => {
  return (
    <div className="relative flex items-center p-1 rounded-xl bg-muted/50 border border-border">
      {/* Sliding background */}
      <motion.div
        className={cn(
          'absolute top-1 bottom-1 rounded-lg',
          role === 'student'
            ? 'bg-gradient-to-r from-aurora-cyan/20 to-aurora-emerald/20 border border-aurora-cyan/30'
            : 'bg-gradient-to-r from-aurora-violet/20 to-aurora-pink/20 border border-aurora-violet/30'
        )}
        initial={false}
        animate={{
          left: role === 'student' ? '4px' : '50%',
          width: 'calc(50% - 4px)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />

      <button
        type="button"
        className={cn(
          'relative flex items-center justify-center gap-2 flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors',
          role === 'student' ? 'text-aurora-cyan' : 'text-muted-foreground'
        )}
        onClick={() => onChange('student')}
      >
        <User size={16} />
        <span>Student</span>
      </button>

      <button
        type="button"
        className={cn(
          'relative flex items-center justify-center gap-2 flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors',
          role === 'security' ? 'text-aurora-violet' : 'text-muted-foreground'
        )}
        onClick={() => onChange('security')}
      >
        <Shield size={16} />
        <span>Security</span>
      </button>
    </div>
  );
};

export default RoleToggle;
