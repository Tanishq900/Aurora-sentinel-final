import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Shield } from 'lucide-react';
import IntroAnimation from '@/components/aurora/IntroAnimation';
import AuroraBorealisBackground from '@/components/aurora/AuroraBorealisBackground';
import GlassCard from '@/components/aurora/GlassCard';
import AuroraInput from '@/components/aurora/AuroraInput';
import AuroraButton from '@/components/aurora/AuroraButton';
import RoleToggle from '@/components/aurora/RoleToggle';
import AuroraSentinelLogo from '@/components/aurora/AuroraSentinelLogo';

type AuthMode = 'login' | 'register';
type Role = 'student' | 'security';

const LoginPage = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<Role>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate authentication
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setLoading(false);
    // Authentication complete - stays on login page for demo
    console.log('Login submitted:', { email, role });
  };

  return (
    <>
      {/* Intro Animation */}
      <AnimatePresence>
        {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      </AnimatePresence>

      {/* Main Login Page */}
      <div className="min-h-screen flex">
        {/* Left side - Auth Panel (55%) */}
        <motion.div
          className="w-full lg:w-[55%] flex items-center justify-center p-8 relative"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: showIntro ? 0 : 1, x: showIntro ? -100 : 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-aurora-cyan/5" />

          <GlassCard className="w-full max-w-md p-8 relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-aurora-cyan/10 border border-aurora-cyan/20 mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Sparkles className="w-3.5 h-3.5 text-aurora-cyan" />
                <span className="text-xs font-medium text-aurora-cyan">
                  {mode === 'login' ? 'Welcome Back' : 'Get Started'}
                </span>
              </motion.div>

              <h2 className="text-2xl font-bold text-foreground mb-2">
                {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === 'login'
                  ? 'Enter your credentials to access the system'
                  : 'Fill in your details to get started'}
              </p>
            </div>

            {/* Role Toggle */}
            <div className="mb-6">
              <RoleToggle role={role} onChange={setRole} />
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {mode === 'register' && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <AuroraInput
                      label="Full Name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AuroraInput
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <AuroraInput
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                showPasswordStrength={mode === 'register'}
              />

              <AuroraButton
                type="submit"
                className="w-full mt-6"
                size="lg"
                loading={loading}
                icon={<ArrowRight size={18} />}
                iconPosition="right"
              >
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </AuroraButton>
            </form>

            {/* Mode Toggle */}
            <div className="mt-6 text-center">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              >
                {mode === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <span className="text-aurora-cyan font-medium">Sign up</span>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <span className="text-aurora-cyan font-medium">Sign in</span>
                  </>
                )}
              </button>
            </div>

            {/* Security badge */}
            <motion.div
              className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                End-to-end encrypted • FERPA compliant
              </span>
            </motion.div>
          </GlassCard>
        </motion.div>

        {/* Right side - Branding Panel (45%) */}
        <motion.div
          className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: showIntro ? 0 : 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <AuroraBorealisBackground interactive={true} />

          {/* Branding Content */}
          <motion.div
            className="relative z-10 text-center px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showIntro ? 0 : 1, y: showIntro ? 20 : 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <AuroraSentinelLogo size="lg" showText={true} glowing={true} />
            
            <motion.p
              className="text-muted-foreground mt-6 max-w-sm mx-auto text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Intelligent Safety. Always Watching.
            </motion.p>

          </motion.div>

          {/* Decorative elements */}
          <motion.div
            className="absolute bottom-8 left-8 right-8 flex justify-between items-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: showIntro ? 0 : 0.6 }}
            transition={{ delay: 1.6 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-aurora-emerald animate-pulse" />
              <span className="text-xs text-muted-foreground">System Online</span>
            </div>
            <span className="text-xs text-muted-foreground">v2.0 Campus Sentinel</span>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
