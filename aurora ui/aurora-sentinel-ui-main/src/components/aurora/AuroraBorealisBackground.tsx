import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface AuroraBorealisBackgroundProps {
  interactive?: boolean;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
}

const AuroraBorealisBackground = ({ interactive = true }: AuroraBorealisBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [stars, setStars] = useState<Star[]>([]);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  // Generate stars
  useEffect(() => {
    const newStars: Star[] = [];
    for (let i = 0; i < 100; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 2 + 1,
      });
    }
    setStars(newStars);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, [interactive]);

  // Aurora canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const drawAurora = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      timeRef.current += 0.005;
      const time = timeRef.current;

      // Interactive offset based on mouse position
      const mouseOffsetX = (mousePos.x - 0.5) * 100;
      const mouseOffsetY = (mousePos.y - 0.5) * 50;

      // Draw multiple aurora layers
      const layers = [
        { 
          color1: 'hsla(160, 84%, 39%, 0.6)', 
          color2: 'hsla(172, 66%, 50%, 0.3)',
          offset: 0,
          amplitude: 80,
          frequency: 0.003,
          speed: 1,
          height: 0.5
        },
        { 
          color1: 'hsla(172, 66%, 50%, 0.5)', 
          color2: 'hsla(142, 70%, 45%, 0.2)',
          offset: 20,
          amplitude: 60,
          frequency: 0.004,
          speed: 0.8,
          height: 0.45
        },
        { 
          color1: 'hsla(280, 70%, 55%, 0.4)', 
          color2: 'hsla(320, 60%, 45%, 0.15)',
          offset: -30,
          amplitude: 50,
          frequency: 0.005,
          speed: 1.2,
          height: 0.35
        },
        { 
          color1: 'hsla(200, 80%, 50%, 0.3)', 
          color2: 'hsla(172, 66%, 50%, 0.1)',
          offset: 40,
          amplitude: 70,
          frequency: 0.0035,
          speed: 0.6,
          height: 0.55
        },
      ];

      layers.forEach((layer) => {
        ctx.beginPath();
        ctx.moveTo(0, 0);

        // Create wavy aurora shape
        for (let x = 0; x <= width; x += 2) {
          const baseY = height * (1 - layer.height);
          const wave1 = Math.sin((x + mouseOffsetX) * layer.frequency + time * layer.speed) * layer.amplitude;
          const wave2 = Math.sin((x + mouseOffsetX) * layer.frequency * 1.5 + time * layer.speed * 0.7) * (layer.amplitude * 0.5);
          const wave3 = Math.sin((x + mouseOffsetX) * layer.frequency * 0.5 + time * layer.speed * 1.3) * (layer.amplitude * 0.3);
          
          const y = baseY + wave1 + wave2 + wave3 + layer.offset + mouseOffsetY * 0.3;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Complete the shape
        ctx.lineTo(width, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();

        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.3, layer.color2);
        gradient.addColorStop(0.6, layer.color1);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fill();
      });

      // Draw vertical aurora rays
      const rayCount = 20;
      for (let i = 0; i < rayCount; i++) {
        const x = (width / rayCount) * i + Math.sin(time * 0.5 + i) * 30 + mouseOffsetX * 0.5;
        const rayHeight = height * (0.4 + Math.sin(time + i * 0.5) * 0.2);
        
        const rayGradient = ctx.createLinearGradient(x, 0, x, rayHeight);
        rayGradient.addColorStop(0, 'hsla(160, 84%, 45%, 0.15)');
        rayGradient.addColorStop(0.5, 'hsla(172, 66%, 50%, 0.08)');
        rayGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(x - 5, 0);
        ctx.quadraticCurveTo(
          x + Math.sin(time * 2 + i) * 10, 
          rayHeight * 0.5,
          x + 5, 
          rayHeight
        );
        ctx.quadraticCurveTo(
          x - Math.sin(time * 2 + i) * 10,
          rayHeight * 0.5,
          x - 5,
          0
        );
        ctx.closePath();
        ctx.fillStyle = rayGradient;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(drawAurora);
    };

    drawAurora();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mousePos]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Deep space gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 100%, hsl(280 30% 15% / 0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, hsl(200 40% 10% / 0.3) 0%, transparent 40%),
            linear-gradient(180deg, hsl(230 30% 8%) 0%, hsl(240 25% 5%) 100%)
          `,
        }}
      />

      {/* Ground/horizon glow */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-40"
        style={{
          background: 'linear-gradient(0deg, hsl(30 60% 20% / 0.3) 0%, hsl(280 40% 15% / 0.2) 50%, transparent 100%)',
        }}
        animate={{
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Treeline silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 60">
          <path
            d="M0,60 L0,45 
               L30,45 L45,25 L60,45 
               L90,45 L100,30 L110,45
               L140,45 L155,20 L170,45
               L200,45 L210,35 L220,45
               L260,45 L280,15 L300,45
               L340,45 L350,28 L360,45
               L400,45 L420,18 L440,45
               L480,45 L495,22 L510,45
               L550,45 L560,32 L570,45
               L610,45 L630,12 L650,45
               L690,45 L700,25 L710,45
               L750,45 L770,20 L790,45
               L830,45 L845,28 L860,45
               L900,45 L920,15 L940,45
               L980,45 L990,30 L1000,45
               L1040,45 L1060,18 L1080,45
               L1120,45 L1140,25 L1160,45
               L1200,45 L1200,60 Z"
            fill="hsl(240 20% 3%)"
          />
        </svg>
      </div>

      {/* Aurora canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Stars */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {stars.map((star) => (
          <motion.circle
            key={star.id}
            cx={`${star.x}%`}
            cy={`${star.y}%`}
            r={star.size}
            fill="white"
            initial={{ opacity: star.opacity * 0.5 }}
            animate={{
              opacity: [star.opacity * 0.3, star.opacity, star.opacity * 0.3],
            }}
            transition={{
              duration: star.twinkleSpeed,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2,
            }}
          />
        ))}
      </svg>

      {/* Interactive mouse glow */}
      {interactive && (
        <motion.div
          className="pointer-events-none absolute w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${mousePos.x * 100}%`,
            top: `${mousePos.y * 100}%`,
            background: 'radial-gradient(circle, hsl(172 66% 50% / 0.08) 0%, transparent 60%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </div>
  );
};

export default AuroraBorealisBackground;
