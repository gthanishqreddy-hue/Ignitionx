import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import api from '../../lib/api';

export default function NotificationPanel({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const panelRef = useRef(null);

  useEffect(() => {
    api.get('/notifications?limit=8').then(({ data }) => setNotifications(data.notifications || [])).catch(() => {});
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => {
    api.put('/notifications/read-all').then(() => {
      setNotifications((n) => n.map((x) => ({ ...x, isRead: true })));
    });
  };

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 mt-2 w-80 glass-strong rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <span className="text-sm font-bold text-white">Notifications</span>
        <button onClick={markAllRead} className="text-xs text-purple-400 hover:text-purple-300">Mark all read</button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">No notifications yet</div>
        ) : notifications.map((n) => (
          <div key={n._id}
            className={`px-4 py-3 border-b border-white/5 hover:bg-white/3 transition-colors ${!n.isRead ? 'bg-purple-500/5' : ''}`}>
            <p className="text-sm font-semibold text-white">{n.title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
            <p className="text-[10px] text-slate-500 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
