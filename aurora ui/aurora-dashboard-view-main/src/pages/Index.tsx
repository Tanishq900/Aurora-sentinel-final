import { useState } from "react";
import { motion } from "framer-motion";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SOSPanel from "@/components/dashboard/SOSPanel";
import RiskAssessmentPanel from "@/components/dashboard/RiskAssessmentPanel";
import MapPanel from "@/components/dashboard/MapPanel";
import EventTimeline from "@/components/dashboard/EventTimeline";
import HistoryTable from "@/components/dashboard/HistoryTable";
import SettingsModal from "@/components/dashboard/SettingsModal";

const Index = () => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background aurora-gradient">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            opacity: [0.1, 0.2, 0.1],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            opacity: [0.1, 0.15, 0.1],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px]"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <DashboardHeader onSettingsClick={() => setIsSettingsModalOpen(true)} />

        {/* Top Row: SOS + Risk Assessment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <SOSPanel />
          </div>
          <div className="lg:col-span-2">
            <RiskAssessmentPanel />
          </div>
        </div>

        {/* Middle Row: Map + Event Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MapPanel />
          <EventTimeline />
        </div>

        {/* Bottom Row: History Table */}
        <HistoryTable />

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center py-4"
        >
          <p className="text-xs text-muted-foreground">
            Aurora Sentinel v2.0 • Campus Safety System • 
            <span className="text-success ml-1">● All Systems Operational</span>
          </p>
        </motion.footer>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};

export default Index;