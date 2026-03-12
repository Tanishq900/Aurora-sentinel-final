import { motion } from "framer-motion";
import { AlertTriangle, AlertCircle, Info, Clock, MapPin, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  location: string;
  time: string;
  description: string;
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "critical",
    title: "SOS Alert Triggered",
    location: "Library Zone - Block A",
    time: "Just now",
    description: "Emergency button pressed. Immediate response required.",
  },
  {
    id: "2",
    type: "critical",
    title: "AI Risk Detection",
    location: "Sports Complex",
    time: "1 min ago",
    description: "Unusual crowd gathering detected by AI surveillance.",
  },
  {
    id: "3",
    type: "warning",
    title: "Suspicious Activity",
    location: "Parking Lot B",
    time: "5 min ago",
    description: "Unidentified vehicle parked in restricted zone.",
  },
  {
    id: "4",
    type: "warning",
    title: "Perimeter Alert",
    location: "East Gate",
    time: "8 min ago",
    description: "Motion detected near perimeter fence after hours.",
  },
  {
    id: "5",
    type: "info",
    title: "System Check Complete",
    location: "Central Hub",
    time: "15 min ago",
    description: "All surveillance cameras operational.",
  },
];

export const LiveAlerts = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="glass-panel p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          Live Alerts
        </h2>
        <span className="text-xs text-muted-foreground">
          {mockAlerts.filter((a) => a.type === "critical").length} Critical
        </span>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {mockAlerts.map((alert, index) => (
          <AlertCard key={alert.id} alert={alert} index={index} />
        ))}
      </div>
    </motion.div>
  );
};

const AlertCard = ({ alert, index }: { alert: Alert; index: number }) => {
  const typeConfig = {
    critical: {
      icon: AlertTriangle,
      panelClass: "glass-panel-critical",
      badgeClass: "badge-critical",
      iconColor: "text-destructive",
    },
    warning: {
      icon: AlertCircle,
      panelClass: "glass-panel-warning",
      badgeClass: "badge-warning",
      iconColor: "text-warning",
    },
    info: {
      icon: Info,
      panelClass: "glass-panel",
      badgeClass: "badge-info",
      iconColor: "text-primary",
    },
  };

  const config = typeConfig[alert.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
      className={`${config.panelClass} p-4 transition-all duration-300 hover:scale-[1.01]`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-background/50 ${config.iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">{alert.title}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.badgeClass}`}>
              {alert.type.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {alert.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {alert.time}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};
