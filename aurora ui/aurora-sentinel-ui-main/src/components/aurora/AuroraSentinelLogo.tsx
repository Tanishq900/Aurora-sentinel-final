import { motion } from 'framer-motion';
import logoImage from '@/assets/aurora-sentinel-logo.png';

interface AuroraSentinelLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  glowing?: boolean;
}

const sizeMap = {
  sm: { icon: 144, text: 'text-2xl' },
  md: { icon: 216, text: 'text-4xl' },
  lg: { icon: 400, text: 'text-5xl' },
  xl: { icon: 520, text: 'text-6xl' },
};

const AuroraSentinelLogo = ({ 
  size = 'md', 
  showText = true, 
  className = '',
  glowing = false 
}: AuroraSentinelLogoProps) => {
  const { icon, text } = sizeMap[size];

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      {/* Logo Image */}
      <motion.div
        className="relative"
        animate={glowing ? {
          filter: [
            'drop-shadow(0 0 20px rgba(34, 211, 238, 0.4))',
            'drop-shadow(0 0 40px rgba(34, 211, 238, 0.6))',
            'drop-shadow(0 0 20px rgba(34, 211, 238, 0.4))',
          ]
        } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <img 
          src={logoImage} 
          alt="Aurora Sentinel Logo" 
          width={icon}
          height={icon}
          className="object-contain"
        />
      </motion.div>

      {/* Text */}
      {showText && (
        <div className="text-center">
          <h1 className={`${text} font-bold tracking-tight`}>
            <span className="text-foreground">Aurora</span>{' '}
            <span className="aurora-text">Sentinel</span>
          </h1>
        </div>
      )}
    </div>
  );
};

export default AuroraSentinelLogo;
