import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/security/AuroraBackground";
import { SecurityHeader } from "@/components/security/SecurityHeader";
import { AlertHistoryTable } from "@/components/security/AlertHistoryTable";

const AlertHistory = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen relative"
    >
      <AuroraBackground />

      <div className="relative z-10">
        <SecurityHeader title="Alert History" userName="Officer Chen" showBackButton />

        <main className="container mx-auto px-4 py-6">
          <AlertHistoryTable />
        </main>
      </div>
    </motion.div>
  );
};

export default AlertHistory;
