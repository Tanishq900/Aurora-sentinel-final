import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  pulseDelay: number;
  connections: number[];
}

interface ConstellationBackgroundProps {
  interactive?: boolean;
  density?: number;
}

const ConstellationBackground = ({ interactive = true, density = 50 }: ConstellationBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stars, setStars] = useState<Star[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (dimensions.width === 0) return;

    const newStars: Star[] = [];
    const gridSize = Math.sqrt((dimensions.width * dimensions.height) / density);

    for (let i = 0; i < density; i++) {
      const star: Star = {
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        pulseDelay: Math.random() * 5,
        connections: [],
      };
      newStars.push(star);
    }

    // Create connections between nearby stars
    newStars.forEach((star, i) => {
      const nearby = newStars
        .filter((other, j) => {
          if (i === j) return false;
          const dist = Math.sqrt(
            Math.pow(star.x - other.x, 2) + Math.pow(star.y - other.y, 2)
          );
          return dist < gridSize * 1.5;
        })
        .slice(0, 3)
        .map((s) => s.id);
      star.connections = nearby;
    });

    setStars(newStars);
  }, [dimensions, density]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const getStarOffset = (star: Star) => {
    if (!interactive) return { x: 0, y: 0 };
    const dist = Math.sqrt(
      Math.pow(star.x - mousePos.x, 2) + Math.pow(star.y - mousePos.y, 2)
    );
    const maxDist = 200;
    if (dist > maxDist) return { x: 0, y: 0 };

    const factor = (1 - dist / maxDist) * 15;
    const angle = Math.atan2(star.y - mousePos.y, star.x - mousePos.x);
    return {
      x: Math.cos(angle) * factor,
      y: Math.sin(angle) * factor,
    };
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Aurora waves */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-0 right-0 h-96 aurora-wave"
          style={{
            background: 'linear-gradient(180deg, hsl(172 66% 50% / 0.1) 0%, transparent 100%)',
          }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scaleY: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-20 left-1/4 right-1/4 h-64"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(280 70% 55% / 0.15) 0%, transparent 70%)',
          }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
            x: [-20, 20, -20],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-72"
          style={{
            background: 'linear-gradient(0deg, hsl(160 84% 39% / 0.08) 0%, transparent 100%)',
          }}
          animate={{
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Constellation SVG */}
      <svg className="absolute inset-0 w-full h-full">
        {/* Connection lines */}
        {stars.map((star) =>
          star.connections.map((connId) => {
            const target = stars.find((s) => s.id === connId);
            if (!target) return null;
            const starOffset = getStarOffset(star);
            const targetOffset = getStarOffset(target);

            return (
              <motion.line
                key={`${star.id}-${connId}`}
                x1={star.x + starOffset.x}
                y1={star.y + starOffset.y}
                x2={target.x + targetOffset.x}
                y2={target.y + targetOffset.y}
                stroke="url(#lineGradient)"
                strokeWidth={0.5}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ duration: 2, delay: star.pulseDelay * 0.1 }}
              />
            );
          })
        )}

        {/* Traveling pulse effect */}
        {stars.slice(0, 5).map((star) => {
          const target = stars.find((s) => star.connections.includes(s.id));
          if (!target) return null;

          return (
            <motion.circle
              key={`pulse-${star.id}`}
              r={2}
              fill="hsl(172 66% 50%)"
              initial={{ opacity: 0 }}
              animate={{
                cx: [star.x, target.x],
                cy: [star.y, target.y],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: star.pulseDelay,
                ease: 'linear',
              }}
            />
          );
        })}

        {/* Stars */}
        {stars.map((star) => {
          const offset = getStarOffset(star);
          return (
            <motion.g key={star.id}>
              {/* Glow */}
              <motion.circle
                cx={star.x + offset.x}
                cy={star.y + offset.y}
                r={star.size * 4}
                fill="hsl(172 66% 50% / 0.15)"
                animate={{
                  opacity: [0.1, 0.3, 0.1],
                  r: [star.size * 3, star.size * 5, star.size * 3],
                }}
                transition={{
                  duration: 3 + star.pulseDelay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              {/* Core */}
              <motion.circle
                cx={star.x + offset.x}
                cy={star.y + offset.y}
                r={star.size}
                fill="white"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [star.opacity * 0.5, star.opacity, star.opacity * 0.5],
                }}
                transition={{
                  duration: 2 + star.pulseDelay * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.g>
          );
        })}

        {/* Gradient definitions */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(172 66% 50%)" stopOpacity={0.3} />
            <stop offset="50%" stopColor="hsl(160 84% 39%)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="hsl(280 70% 55%)" stopOpacity={0.3} />
          </linearGradient>
        </defs>
      </svg>

      {/* Mouse interaction glow */}
      {interactive && (
        <motion.div
          className="pointer-events-none absolute w-64 h-64 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: mousePos.x,
            top: mousePos.y,
            background: 'radial-gradient(circle, hsl(172 66% 50% / 0.1) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </div>
  );
};

export default ConstellationBackground;
