import { motion } from "framer-motion";
import { LogOut, Settings, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import auroraLogo from "@/assets/aurora-logo.png";

interface DashboardHeaderProps {
  onSettingsClick: () => void;
}

const DashboardHeader = ({ onSettingsClick }: DashboardHeaderProps) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card px-6 py-4 flex items-center justify-between relative overflow-visible"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <img src={auroraLogo} alt="Aurora Sentinel Logo" className="w-36 h-36 object-contain absolute left-6 top-1/2 -translate-y-1/2" />
          <div className="ml-32 flex flex-col justify-center">
            <h1 className="font-orbitron text-xl font-bold text-gradient">
              Aurora Sentinel
            </h1>
            <p className="text-xs text-muted-foreground">Student Dashboard</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onSettingsClick}
          className="text-muted-foreground hover:text-foreground hover:bg-muted gap-2"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Settings</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;