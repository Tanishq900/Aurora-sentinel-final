import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/security/AuroraBackground";
import { SecurityHeader } from "@/components/security/SecurityHeader";
import { LiveMap } from "@/components/security/LiveMap";
import { LiveAlerts } from "@/components/security/LiveAlerts";

const SecurityCommandCenter = () => {
  return (
    <div className="min-h-screen relative">
      <AuroraBackground />
      
      <div className="relative z-10">
        <SecurityHeader title="Security Command Center" userName="Officer Chen" />
        
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-6 space-y-6"
        >
          {/* Live Map Section */}
          <section>
            <LiveMap />
          </section>

          {/* Live Alerts Section */}
          <section>
            <LiveAlerts />
          </section>
        </motion.main>
      </div>
    </div>
  );
};

export default SecurityCommandCenter;
