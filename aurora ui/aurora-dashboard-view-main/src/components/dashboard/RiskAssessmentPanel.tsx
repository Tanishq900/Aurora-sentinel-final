import { motion } from "framer-motion";
import { Activity, Volume2, Move, Clock, MapPin, Shield } from "lucide-react";
import { useEffect, useState } from "react";

interface RiskMetric {
  label: string;
  value: number;
  icon: React.ElementType;
}

const riskMetrics: RiskMetric[] = [
  { label: "Audio", value: 25, icon: Volume2 },
  { label: "Motion", value: 40, icon: Move },
  { label: "Time", value: 15, icon: Clock },
  { label: "Location", value: 30, icon: MapPin },
];

const RiskAssessmentPanel = () => {
  const [animatedValues, setAnimatedValues] = useState<number[]>([0, 0, 0, 0]);
  const totalScore = riskMetrics.reduce((sum, m) => sum + m.value, 0) / riskMetrics.length;
  const [animatedTotal, setAnimatedTotal] = useState(0);
  
  const getRiskLevel = (score: number) => {
    if (score < 30) return { level: "LOW", color: "text-success", bg: "bg-success/20", border: "border-success/30" };
    if (score < 60) return { level: "MEDIUM", color: "text-warning", bg: "bg-warning/20", border: "border-warning/30" };
    return { level: "HIGH", color: "text-destructive", bg: "bg-destructive/20", border: "border-destructive/30" };
  };

  const getBarClass = (value: number) => {
    if (value < 30) return "risk-bar-safe";
    if (value < 60) return "risk-bar-warning";
    return "risk-bar-danger";
  };

  const risk = getRiskLevel(totalScore);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValues(riskMetrics.map(m => m.value));
      setAnimatedTotal(totalScore);
    }, 300);
    return () => clearTimeout(timer);
  }, [totalScore]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-6 h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="font-orbitron text-lg font-semibold text-foreground">Live Risk Assessment</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>

      <div className="space-y-4">
        {riskMetrics.map((metric, index) => (
          <div key={metric.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <metric.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{metric.label}</span>
              </div>
              <span className="text-sm font-medium text-foreground">{animatedValues[index]}%</span>
            </div>
            <div className="risk-bar">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${animatedValues[index]}%` }}
                transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                className={`risk-bar-fill ${getBarClass(metric.value)}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Total Score</span>
          <span className="font-orbitron text-2xl font-bold text-foreground">
            {animatedTotal.toFixed(0)}%
          </span>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
          className={`flex items-center justify-center gap-2 py-3 rounded-lg ${risk.bg} ${risk.border} border`}
        >
          <Shield className={`w-5 h-5 ${risk.color}`} />
          <span className={`font-orbitron font-bold ${risk.color}`}>
            Risk Level: {risk.level}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RiskAssessmentPanel;