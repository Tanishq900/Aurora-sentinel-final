import { motion } from "framer-motion";
import { Clock, AlertTriangle, CheckCircle, Info, Bell } from "lucide-react";

interface TimelineEvent {
  id: number;
  time: string;
  title: string;
  description: string;
  type: "critical" | "warning" | "info" | "success";
}

const events: TimelineEvent[] = [
  {
    id: 1,
    time: "2 min ago",
    title: "Motion Detected",
    description: "Unusual activity near Parking Lot B",
    type: "warning",
  },
  {
    id: 2,
    time: "15 min ago",
    title: "Security Alert Resolved",
    description: "False alarm at Science Building cleared",
    type: "success",
  },
  {
    id: 3,
    time: "1 hour ago",
    title: "System Update",
    description: "Risk assessment algorithm updated",
    type: "info",
  },
  {
    id: 4,
    time: "3 hours ago",
    title: "Emergency Drill",
    description: "Campus-wide drill completed successfully",
    type: "success",
  },
];

const EventTimeline = () => {
  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "critical": return AlertTriangle;
      case "warning": return Bell;
      case "success": return CheckCircle;
      default: return Info;
    }
  };

  const getEventColor = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "critical": return "text-destructive";
      case "warning": return "text-warning";
      case "success": return "text-success";
      default: return "text-primary";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-6 h-full flex flex-col"
    >
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-5 h-5 text-primary" />
        <h2 className="font-orbitron text-lg font-semibold text-foreground">Event Timeline</h2>
      </div>

      <div className="flex-1 overflow-auto pr-2 space-y-0">
        {events.map((event, index) => {
          const Icon = getEventIcon(event.type);
          const isCritical = event.type === "critical";
          
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              className={`timeline-item ${isCritical ? 'timeline-item-critical' : ''}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-4 h-4 mt-0.5 ${getEventColor(event.type)}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {event.title}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {event.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {event.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default EventTimeline;