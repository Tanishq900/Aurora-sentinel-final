import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { BarChart3, History, LogOut, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import auroraLogo from "@/assets/aurora-logo.png";

interface SecurityHeaderProps {
  title: string;
  userName?: string;
  showBackButton?: boolean;
}

export const SecurityHeader = ({ title, userName = "Security Officer", showBackButton = false }: SecurityHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isCommandCenter = location.pathname === "/" || location.pathname === "/security";
  const isAnalytics = location.pathname === "/analytics";
  const isHistory = location.pathname === "/history";

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-panel border-b border-border/50 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <img src={auroraLogo} alt="Aurora Sentinel" className="h-10 w-10 object-contain" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold aurora-text">{title}</h1>
              <p className="text-xs text-muted-foreground">Welcome, {userName}</p>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          {!isCommandCenter && (
            <NavButton
              icon={<Shield className="h-4 w-4" />}
              label="Dashboard"
              onClick={() => navigate("/")}
              active={false}
            />
          )}
          {!isAnalytics && (
            <NavButton
              icon={<BarChart3 className="h-4 w-4" />}
              label="Analytics"
              onClick={() => navigate("/analytics")}
              active={isAnalytics}
            />
          )}
          {!isHistory && (
            <NavButton
              icon={<History className="h-4 w-4" />}
              label="History"
              onClick={() => navigate("/history")}
              active={isHistory}
            />
          )}
          <NavButton
            icon={<LogOut className="h-4 w-4" />}
            label="Logout"
            onClick={() => {}}
            variant="destructive"
          />
        </nav>
      </div>
    </motion.header>
  );
};

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  variant?: "default" | "destructive";
}

const NavButton = ({ icon, label, onClick, active, variant = "default" }: NavButtonProps) => {
  const baseClasses = "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300";
  const defaultClasses = active
    ? "bg-primary/20 text-primary border border-primary/30"
    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50";
  const destructiveClasses = "text-destructive hover:bg-destructive/10 hover:text-destructive";

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${baseClasses} ${variant === "destructive" ? destructiveClasses : defaultClasses}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </motion.button>
  );
};
