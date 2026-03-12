import { motion, AnimatePresence } from 'framer-motion';
import { Brain, AlertCircle, TrendingUp, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FeedbackMessage {
  id: string;
  type: 'info' | 'warning' | 'alert';
  message: string;
  icon: React.ReactNode;
}

const messages: FeedbackMessage[] = [
  {
    id: '1',
    type: 'info',
    message: 'All systems nominal. Environment stable.',
    icon: <Activity className="w-4 h-4" />,
  },
  {
    id: '2',
    type: 'warning',
    message: 'Elevated audio stress detected in vicinity.',
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    id: '3',
    type: 'info',
    message: 'Motion patterns within normal parameters.',
    icon: <Activity className="w-4 h-4" />,
  },
  {
    id: '4',
    type: 'alert',
    message: 'Unusual activity pattern detected.',
    icon: <AlertCircle className="w-4 h-4" />,
  },
];

const typeStyles = {
  info: {
    bg: 'bg-aurora-cyan/10',
    border: 'border-aurora-cyan/30',
    text: 'text-aurora-cyan',
    glow: 'shadow-[0_0_20px_-5px_hsl(172_66%_50%_/_0.3)]',
  },
  warning: {
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    text: 'text-warning',
    glow: 'shadow-[0_0_20px_-5px_hsl(38_92%_50%_/_0.3)]',
  },
  alert: {
    bg: 'bg-danger/10',
    border: 'border-danger/30',
    text: 'text-danger',
    glow: 'shadow-[0_0_20px_-5px_hsl(0_72%_51%_/_0.3)]',
  },
};

interface AIFeedbackProps {
  riskLevel?: number;
}

const AIFeedback = ({ riskLevel = 30 }: AIFeedbackProps) => {
  const [currentMessage, setCurrentMessage] = useState<FeedbackMessage>(messages[0]);
  const [isTyping, setIsTyping] = useState(false);
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    // Select message based on risk level
    let messageIndex = 0;
    if (riskLevel > 75) messageIndex = 3;
    else if (riskLevel > 50) messageIndex = 1;
    else if (riskLevel > 25) messageIndex = 2;

    const newMessage = messages[messageIndex];
    if (newMessage.id !== currentMessage.id) {
      setCurrentMessage(newMessage);
      setDisplayText('');
      setIsTyping(true);
    }
  }, [riskLevel, currentMessage.id]);

  useEffect(() => {
    if (!isTyping) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index < currentMessage.message.length) {
        setDisplayText(currentMessage.message.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isTyping, currentMessage.message]);

  const styles = typeStyles[currentMessage.type];

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMessage.id}
          className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm ${styles.bg} ${styles.border} ${styles.glow}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {/* AI Brain Icon */}
          <div className={`flex-shrink-0 p-2 rounded-lg ${styles.bg} ${styles.text}`}>
            <Brain className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Aurora AI
              </span>
              <span className={`${styles.text}`}>{currentMessage.icon}</span>
            </div>

            <p className={`text-sm font-medium ${styles.text}`}>
              {displayText}
              {isTyping && (
                <motion.span
                  className="inline-block w-0.5 h-4 ml-0.5 bg-current"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </p>
          </div>

          {/* Processing indicator */}
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${styles.text}`}
                style={{ backgroundColor: 'currentColor' }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AIFeedback;
