import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  delay?: number;
  variant?: "default" | "critical" | "warning" | "success";
}

export const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  delay = 0,
  variant = "default",
}: MetricCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const isNumeric = typeof value === "number";

  useEffect(() => {
    if (isNumeric) {
      const controls = animate(0, value, {
        duration: 1.5,
        delay: delay + 0.3,
        onUpdate: (v) => setDisplayValue(Math.round(v)),
      });
      return () => controls.stop();
    }
  }, [value, delay, isNumeric]);

  const variantStyles = {
    default: "glass-panel-glow",
    critical: "glass-panel-critical",
    warning: "glass-panel-warning",
    success: "glass-panel border-success/30",
  };

  const iconBgStyles = {
    default: "bg-primary/20 text-primary",
    critical: "bg-destructive/20 text-destructive",
    warning: "bg-warning/20 text-warning",
    success: "bg-success/20 text-success",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`${variantStyles[variant]} p-6 transition-all duration-300 hover:scale-[1.02]`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
            className="text-3xl font-bold text-foreground"
          >
            {isNumeric ? displayValue : value}
          </motion.p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-xs font-medium ${
                  trend === "up"
                    ? "text-destructive"
                    : trend === "down"
                    ? "text-success"
                    : "text-muted-foreground"
                }`}
              >
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
              </span>
              <span className="text-xs text-muted-foreground">vs last week</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBgStyles[variant]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
};
