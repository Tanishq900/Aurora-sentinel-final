import { motion } from "framer-motion";

export const AuroraBackground = () => {
  return (
    <div className="aurora-bg">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-aurora-cyan/5 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-aurora-teal/5 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-aurora-blue/3 blur-3xl" />
      </motion.div>
    </div>
  );
};
