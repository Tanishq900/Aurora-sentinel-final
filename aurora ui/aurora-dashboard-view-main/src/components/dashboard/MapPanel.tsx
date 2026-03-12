import { motion } from "framer-motion";
import { Map, MapPin, AlertCircle, Shield } from "lucide-react";

const zones = [
  { id: 1, name: "Library", risk: "low", x: 20, y: 30 },
  { id: 2, name: "Parking Lot B", risk: "high", x: 70, y: 60 },
  { id: 3, name: "Student Center", risk: "low", x: 45, y: 45 },
  { id: 4, name: "Science Building", risk: "medium", x: 30, y: 70 },
];

const MapPanel = () => {
  const getZoneColor = (risk: string) => {
    switch (risk) {
      case "low": return "bg-success/30 border-success";
      case "medium": return "bg-warning/30 border-warning";
      case "high": return "bg-destructive/30 border-destructive";
      default: return "bg-muted border-muted-foreground";
    }
  };

  const getMarkerColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-success";
      case "medium": return "text-warning";
      case "high": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-6 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Map className="w-5 h-5 text-primary" />
          <h2 className="font-orbitron text-lg font-semibold text-foreground">Live Location & Risk Zones</h2>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-muted-foreground">Safe</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-muted-foreground">Caution</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Alert</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative rounded-xl overflow-hidden bg-secondary/30 border border-border min-h-[250px]">
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Map zones */}
        {zones.map((zone, index) => (
          <motion.div
            key={zone.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
            className="absolute"
            style={{ left: `${zone.x}%`, top: `${zone.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div className={`w-16 h-16 rounded-full ${getZoneColor(zone.risk)} border-2 opacity-40`} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <MapPin className={`w-6 h-6 ${getMarkerColor(zone.risk)}`} />
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap">
              <span className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                {zone.name}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Current location indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute"
          style={{ left: '50%', top: '40%', transform: 'translate(-50%, -50%)' }}
        >
          <div className="relative">
            <div className="w-4 h-4 rounded-full bg-primary animate-ping absolute" />
            <div className="w-4 h-4 rounded-full bg-primary relative z-10 border-2 border-background" />
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap">
            <span className="text-xs font-medium text-primary bg-background/80 px-2 py-1 rounded flex items-center gap-1">
              <Shield className="w-3 h-3" />
              You are here
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MapPanel;