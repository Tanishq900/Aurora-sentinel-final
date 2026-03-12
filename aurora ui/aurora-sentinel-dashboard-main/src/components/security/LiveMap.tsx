import { motion } from "framer-motion";
import { MapPin, AlertTriangle, Wifi } from "lucide-react";

interface SOSLocation {
  id: string;
  lat: number;
  lng: number;
  severity: "critical" | "warning" | "info";
  label: string;
  time: string;
}

const mockSOSLocations: SOSLocation[] = [
  { id: "1", lat: 25, lng: 30, severity: "critical", label: "Library Zone", time: "2 min ago" },
  { id: "2", lat: 60, lng: 55, severity: "warning", label: "Parking Lot B", time: "5 min ago" },
  { id: "3", lat: 40, lng: 75, severity: "critical", label: "Sports Complex", time: "1 min ago" },
  { id: "4", lat: 75, lng: 20, severity: "info", label: "Main Gate", time: "10 min ago" },
  { id: "5", lat: 55, lng: 85, severity: "warning", label: "Cafeteria", time: "3 min ago" },
];

export const LiveMap = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="map-container h-[400px] relative"
    >
      {/* Map Header */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50">
          <Wifi className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-sm font-medium text-primary">LIVE</span>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50">
          <span className="text-sm text-muted-foreground">Campus Map • {mockSOSLocations.length} Active SOS</span>
        </div>
      </div>

      {/* Map Grid */}
      <div className="absolute inset-0 map-grid opacity-50" />

      {/* Campus Outline (Simplified) */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          d="M10,10 L90,10 L90,90 L10,90 Z"
          fill="none"
          stroke="hsl(var(--aurora-cyan) / 0.3)"
          strokeWidth="0.3"
        />
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
          d="M20,20 L50,20 L50,50 L20,50 Z"
          fill="hsl(var(--aurora-cyan) / 0.05)"
          stroke="hsl(var(--aurora-cyan) / 0.2)"
          strokeWidth="0.2"
        />
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.7, ease: "easeInOut" }}
          d="M55,30 L85,30 L85,70 L55,70 Z"
          fill="hsl(var(--aurora-teal) / 0.05)"
          stroke="hsl(var(--aurora-teal) / 0.2)"
          strokeWidth="0.2"
        />
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.9, ease: "easeInOut" }}
          d="M20,55 L45,55 L45,85 L20,85 Z"
          fill="hsl(var(--aurora-blue) / 0.05)"
          stroke="hsl(var(--aurora-blue) / 0.2)"
          strokeWidth="0.2"
        />
      </svg>

      {/* SOS Markers */}
      {mockSOSLocations.map((location, index) => (
        <SOSMarker key={location.id} location={location} index={index} />
      ))}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 p-3 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-destructive pulse-critical" />
          <span className="text-muted-foreground">Critical SOS</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-warning pulse-warning" />
          <span className="text-muted-foreground">Warning</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Info</span>
        </div>
      </div>
    </motion.div>
  );
};

const SOSMarker = ({ location, index }: { location: SOSLocation; index: number }) => {
  const severityColors = {
    critical: "bg-destructive",
    warning: "bg-warning",
    info: "bg-primary",
  };

  const pulseClass = {
    critical: "pulse-critical",
    warning: "pulse-warning",
    info: "",
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 200 }}
      className="absolute group cursor-pointer"
      style={{ left: `${location.lat}%`, top: `${location.lng}%` }}
    >
      {/* Pulse Ring */}
      <div
        className={`absolute -inset-2 rounded-full ${severityColors[location.severity]}/30 ${pulseClass[location.severity]}`}
      />
      
      {/* Marker */}
      <div
        className={`relative w-4 h-4 rounded-full ${severityColors[location.severity]} flex items-center justify-center`}
      >
        {location.severity === "critical" ? (
          <AlertTriangle className="h-2.5 w-2.5 text-destructive-foreground" />
        ) : (
          <MapPin className="h-2.5 w-2.5 text-primary-foreground" />
        )}
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
        <div className="px-3 py-2 rounded-lg bg-background/95 backdrop-blur-sm border border-border/50 whitespace-nowrap">
          <p className="text-sm font-medium text-foreground">{location.label}</p>
          <p className="text-xs text-muted-foreground">{location.time}</p>
        </div>
      </div>
    </motion.div>
  );
};
