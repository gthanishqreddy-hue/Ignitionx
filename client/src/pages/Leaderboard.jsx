import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiTrendingUp, FiZap, FiAward } from 'react-icons/fi';
import api from '../lib/api';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/leaderboard').then(({ data }) => {
      setLeaderboard(data.leaderboard || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet>
        <title>Leaderboard — IgnitionX</title>
      </Helmet>
      <div className="min-h-screen pt-24 px-4 max-w-3xl mx-auto pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-black text-white mb-3">
            🏆 <span className="gradient-text">Backer Leaderboard</span>
          </h1>
          <p className="text-slate-400">The most legendary supporters in the IgnitionX community.</p>
        </motion.div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl h-16 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((user, i) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass rounded-2xl p-4 border flex items-center gap-4 hover-lift ${
                  i === 0 ? 'border-yellow-500/30' : i === 1 ? 'border-slate-400/30' : i === 2 ? 'border-amber-700/30' : 'border-white/8'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black ${
                  i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                  i === 1 ? 'bg-slate-400/20 text-slate-300' :
                  i === 2 ? 'bg-amber-700/20 text-amber-600' :
                  'glass text-slate-400'
                }`}>
                  {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                </div>

                {user.avatar?.url ? (
                  <img src={user.avatar.url} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                    {user.name?.[0]}
                  </div>
                )}

                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{user.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-purple-400">Lv.{user.level}</span>
                    <span className="text-xs text-slate-500">{user.campaignsBacked} campaigns backed</span>
                    <span className="text-xs text-slate-500">{user.badges?.length || 0} badges</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-bold gradient-text">
                    <FiZap className="text-purple-400" /> {user.xp?.toLocaleString()} XP
                  </div>
                  <div className="text-xs text-slate-500">${user.totalBacked?.toLocaleString()} backed</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
