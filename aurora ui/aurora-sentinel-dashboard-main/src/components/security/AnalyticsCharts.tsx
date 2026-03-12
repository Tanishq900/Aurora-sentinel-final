import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const sosPerDayData = [
  { day: "Mon", sos: 12 },
  { day: "Tue", sos: 8 },
  { day: "Wed", sos: 15 },
  { day: "Thu", sos: 10 },
  { day: "Fri", sos: 22 },
  { day: "Sat", sos: 6 },
  { day: "Sun", sos: 4 },
];

const aiRiskData = [
  { time: "00:00", risk: 15 },
  { time: "04:00", risk: 8 },
  { time: "08:00", risk: 25 },
  { time: "12:00", risk: 45 },
  { time: "16:00", risk: 38 },
  { time: "20:00", risk: 52 },
  { time: "23:59", risk: 28 },
];

const comparisonData = [
  { day: "Mon", sos: 12, ai: 18 },
  { day: "Tue", sos: 8, ai: 12 },
  { day: "Wed", sos: 15, ai: 22 },
  { day: "Thu", sos: 10, ai: 14 },
  { day: "Fri", sos: 22, ai: 35 },
  { day: "Sat", sos: 6, ai: 8 },
  { day: "Sun", sos: 4, ai: 5 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel px-4 py-3 border border-border/50">
        <p className="text-sm font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const SOSBarChart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="glass-panel-glow p-6"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">SOS Alerts per Day</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sosPerDayData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="sos"
              name="SOS Alerts"
              fill="hsl(var(--destructive))"
              radius={[4, 4, 0, 0]}
              animationBegin={500}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export const AIRiskLineChart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="glass-panel-glow p-6"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">AI Risk Spikes</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={aiRiskData}>
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="risk"
              name="Risk Level"
              stroke="hsl(var(--warning))"
              fill="url(#riskGradient)"
              strokeWidth={2}
              animationBegin={700}
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export const ComparisonChart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      className="glass-panel-glow p-6"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">SOS vs AI Alerts Comparison</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value) => <span className="text-muted-foreground text-sm">{value}</span>}
            />
            <Line
              type="monotone"
              dataKey="sos"
              name="SOS Alerts"
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--destructive))", strokeWidth: 2 }}
              animationBegin={900}
              animationDuration={1200}
            />
            <Line
              type="monotone"
              dataKey="ai"
              name="AI Alerts"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
              animationBegin={1100}
              animationDuration={1200}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
