import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FiPlus, FiBarChart2, FiUsers, FiDollarSign, FiClock, FiEdit2, FiEye, FiTrendingUp } from 'react-icons/fi';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import toast from 'react-hot-toast';
import api from '../lib/api';
import useAuthStore from '../store/authStore';

function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass rounded-2xl p-5 border border-white/8 hover-lift"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon style={{ color }} className="text-base" />
        </div>
      </div>
      <div className="text-3xl font-black text-white">{value}</div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [campaigns, setCampaigns] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/campaigns?status=active&limit=20'),
      api.get('/reports/creator'),
    ]).then(([campaignRes, reportRes]) => {
      // Filter creator's own campaigns
      const myCampaigns = campaignRes.data.campaigns?.filter(
        (c) => c.creator?._id === user?._id || c.creator === user?._id
      ) || [];
      setCampaigns(myCampaigns);
      setReport(reportRes.data.report);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const chartData = report?.recentContributions?.slice(0, 10).map((c) => ({
    date: new Date(c.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    amount: c.amount,
  })).reverse() || [];

  return (
    <>
      <Helmet>
        <title>Dashboard — IgnitionX</title>
      </Helmet>
      <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <p className="text-sm text-slate-400 mb-1">Welcome back,</p>
            <h1 className="text-3xl font-black text-white">
              {user?.name} <span className="gradient-text">✦</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-purple-400 font-semibold">Lv.{user?.level}</span>
              <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full gradient-primary rounded-full" style={{ width: `${((user?.xp || 0) % 100)}%` }} />
              </div>
              <span className="text-xs text-slate-500">{user?.xp} XP</span>
            </div>
          </motion.div>

          {(user?.role === 'creator' || user?.role === 'admin') && (
            <Link to="/campaigns/create">
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="btn-primary flex items-center gap-2 px-5 py-3"
              >
                <FiPlus /> New Campaign
              </motion.button>
            </Link>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={FiDollarSign} label="Total Raised" value={`$${(report?.totalRaised || 0).toLocaleString()}`} color="#7c3aed" delay={0} />
          <StatCard icon={FiUsers} label="Total Backers" value={(report?.totalBackers || 0).toLocaleString()} color="#06b6d4" delay={0.1} />
          <StatCard icon={FiBarChart2} label="Campaigns" value={report?.totalCampaigns || 0} color="#ec4899" delay={0.2} />
          <StatCard icon={FiTrendingUp} label="Badges Earned" value={user?.badges?.length || 0} color="#f59e0b" delay={0.3} />
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6 border border-white/8 mb-8"
          >
            <h3 className="text-base font-bold text-white mb-6">📈 Recent Contributions</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="purple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 11 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#0d0d1a', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '12px', color: '#e2e8f0' }}
                  formatter={(v) => [`$${v}`, 'Amount']}
                />
                <Area type="monotone" dataKey="amount" stroke="#7c3aed" fill="url(#purple)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Badges */}
        {user?.badges?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-6 border border-white/8 mb-8">
            <h3 className="text-base font-bold text-white mb-4">🏆 Your Badges</h3>
            <div className="flex flex-wrap gap-3">
              {user.badges.map((badge, i) => (
                <div key={i} className="flex items-center gap-2 glass rounded-xl px-4 py-2 border border-white/8">
                  <span className="text-xl">{badge.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-white">{badge.name}</div>
                    <div className="text-xs text-slate-400">{badge.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* My Campaigns */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">My Campaigns</h3>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="glass rounded-2xl h-24 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="glass rounded-2xl p-10 border border-white/8 text-center">
              <div className="text-4xl mb-3">🚀</div>
              <h4 className="text-lg font-bold text-white mb-2">No campaigns yet</h4>
              <p className="text-slate-400 text-sm mb-4">Launch your first campaign and start raising funds</p>
              {(user?.role === 'creator' || user?.role === 'admin') && (
                <Link to="/campaigns/create">
                  <button className="btn-primary px-6 py-2.5 text-sm">Create Campaign</button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((c) => (
                <div key={c._id} className="glass rounded-xl p-4 border border-white/8 flex items-center gap-4">
                  {c.coverImage?.url && (
                    <img src={c.coverImage.url} alt={c.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{c.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        c.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        c.status === 'funded' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>{c.status}</span>
                      <span className="text-xs text-slate-400">${c.currentAmount?.toLocaleString()} raised</span>
                      <span className="text-xs text-slate-500">{c.backersCount} backers</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/campaigns/${c.slug}`}>
                      <button className="w-8 h-8 glass rounded-lg flex items-center justify-center text-slate-400 hover:text-white">
                        <FiEye className="text-sm" />
                      </button>
                    </Link>
                    <button className="w-8 h-8 glass rounded-lg flex items-center justify-center text-slate-400 hover:text-purple-400">
                      <FiEdit2 className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
