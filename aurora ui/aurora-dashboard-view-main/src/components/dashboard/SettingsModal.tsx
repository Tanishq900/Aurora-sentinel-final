import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PresentationModal = ({ isOpen, onClose }: PresentationModalProps) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "aurora2026") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    setIsAuthenticated(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="glass-card p-8 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-orbitron text-xl font-bold text-foreground">
                Settings
              </h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {!isAuthenticated ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 mb-6">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Enter the presentation password to continue
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="pr-10 bg-muted/50 border-border focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive"
                  >
                    {error}
                  </motion.p>
                )}

                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Access Presentation Mode
                </Button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-success/20 border border-success/30 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-success" />
                </div>
                <h3 className="font-orbitron text-lg font-semibold text-foreground mb-2">
                  Access Granted
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Presentation mode is now active. All sensitive data is hidden.
                </p>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  Close Modal
                </Button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PresentationModal;