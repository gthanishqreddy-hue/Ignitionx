import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiZap } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-8xl font-black gradient-text mb-4">404</div>
        <h1 className="text-2xl font-black text-white mb-3">Page Not Found</h1>
        <p className="text-slate-400 mb-8">This idea doesn't exist yet. Maybe you should build it.</p>
        <Link to="/">
          <button className="btn-primary flex items-center gap-2 mx-auto">
            <FiHome /> Back to Home
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
