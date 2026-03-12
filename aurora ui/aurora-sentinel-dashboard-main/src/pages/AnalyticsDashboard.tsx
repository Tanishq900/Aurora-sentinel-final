import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, Zap } from "lucide-react";
import { AuroraBackground } from "@/components/security/AuroraBackground";
import { SecurityHeader } from "@/components/security/SecurityHeader";
import { MetricCard } from "@/components/security/MetricCard";
import { SOSBarChart, AIRiskLineChart, ComparisonChart } from "@/components/security/AnalyticsCharts";

const AnalyticsDashboard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen relative"
    >
      <AuroraBackground />

      <div className="relative z-10">
        <SecurityHeader title="Analytics Dashboard" userName="Officer Chen" showBackButton />

        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Metric Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Total SOS This Week"
              value={77}
              subtitle="From all campus zones"
              icon={AlertTriangle}
              trend="up"
              trendValue="12%"
              delay={0.1}
              variant="critical"
            />
            <MetricCard
              title="Peak Day"
              value="Friday"
              subtitle="22 alerts recorded"
              icon={TrendingUp}
              delay={0.2}
              variant="warning"
            />
            <MetricCard
              title="Highest AI Risk Count"
              value={52}
              subtitle="Recorded at 8:00 PM"
              icon={Zap}
              delay={0.3}
              variant="default"
            />
          </section>

          {/* Charts Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SOSBarChart />
            <AIRiskLineChart />
          </section>

          {/* Comparison Chart */}
          <section>
            <ComparisonChart />
          </section>
        </main>
      </div>
    </motion.div>
  );
};

export default AnalyticsDashboard;
