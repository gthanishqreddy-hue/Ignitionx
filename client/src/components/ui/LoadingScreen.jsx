import { motion } from 'framer-motion';
import { FiZap } from 'react-icons/fi';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--color-bg-primary)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center glow-purple"
        >
          <FiZap className="text-white text-2xl" />
        </motion.div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-purple-500"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
