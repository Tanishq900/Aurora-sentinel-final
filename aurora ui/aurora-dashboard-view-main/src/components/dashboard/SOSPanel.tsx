import { motion } from "framer-motion";
import { AlertTriangle, Phone } from "lucide-react";

const SOSPanel = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card-danger p-6 h-full flex flex-col"
    >
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <h2 className="font-orbitron text-lg font-semibold text-foreground">Emergency SOS</h2>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="sos-button w-32 h-32 rounded-full bg-destructive flex items-center justify-center cursor-pointer transition-all duration-300 hover:brightness-110"
        >
          <div className="flex flex-col items-center gap-2">
            <Phone className="w-8 h-8 text-destructive-foreground" />
            <span className="font-orbitron text-sm font-bold text-destructive-foreground">SOS</span>
          </div>
        </motion.button>
        
        <p className="mt-6 text-sm text-muted-foreground text-center max-w-[200px]">
          Press and hold for 3 seconds to activate emergency protocol
        </p>
      </div>
      
      <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
        <p className="text-xs text-destructive text-center font-medium">
          Campus Security: (555) 911-HELP
        </p>
      </div>
    </motion.div>
  );
};

export default SOSPanel;