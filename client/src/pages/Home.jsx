import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import CampaignCard from "../components/CampaignCard";
import { FiZap, FiShield, FiTrendingUp, FiAward } from "react-icons/fi";

// Skeleton card for loading state
function SkeletonCard() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-white/10 rounded-lg w-3/4" />
        <div className="h-3 bg-white/5 rounded-lg w-full" />
        <div className="h-3 bg-white/5 rounded-lg w-5/6" />
        <div className="h-1 bg-white/10 rounded-full w-full mt-4" />
        <div className="h-9 bg-white/5 rounded-xl w-full mt-3" />
      </div>
    </div>
  );
}

export default function Home() {
  const [stats, setStats] = useState({ campaigns: 0, raised: 0, backers: 0 });
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/campaigns/stats`);
        setStats(res.data.stats);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchCampaigns = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/campaigns`);
        const activeCampaigns = (res.data.campaigns || []).filter(c => c.status === 'active').slice(0, 4);
        setCampaigns(activeCampaigns.length > 0 ? activeCampaigns : (res.data.campaigns || []).slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    fetchCampaigns();
  }, []);

  const demoCampaigns = [
    {
      _id: "1",
      title: "NeuroLink Pro",
      tagline: "Next-gen brain-computer interface",
      category: "Technology",
      currentAmount: 125430,
      goalAmount: 150000,
      slug: "neurolink-pro"
    },
    {
      _id: "2",
      title: "Eclipse: Beyond Earth",
      tagline: "A sci-fi adventure series",
      category: "Film",
      currentAmount: 98760,
      goalAmount: 130000,
      slug: "eclipse-beyond-earth"
    },
    {
      _id: "3",
      title: "Minimalist Chair Collection",
      tagline: "Sustainable furniture for the future",
      category: "Design",
      currentAmount: 68120,
      goalAmount: 100000,
      slug: "minimalist-chair"
    },
    {
      _id: "4",
      title: "Echoes of Tomorrow",
      tagline: "Debut album by Indie Waves",
      category: "Music",
      currentAmount: 54320,
      goalAmount: 75000,
      slug: "echoes-of-tomorrow"
    }
  ];

  const displayCampaigns = campaigns.length > 0 ? campaigns : demoCampaigns;

  const features = [
    {
      icon: <FiZap />,
      color: "purple",
      title: "AI Campaign Booster",
      desc: "Optimize your pitch and maximize reach using our proprietary AI scoring model."
    },
    {
      icon: <FiShield />,
      color: "green",
      title: "Secure & Transparent",
      desc: "Enterprise-grade payments powered by Stripe with full audit trails."
    },
    {
      icon: <FiTrendingUp />,
      color: "indigo",
      title: "Trending Algorithm",
      desc: "Dynamic visibility based on real-time engagement and backer momentum."
    },
    {
      icon: <FiAward />,
      color: "yellow",
      title: "Gamification",
      desc: "Earn XP, unlock exclusive badges, and climb the backer leaderboard."
    },
  ];

  const colorMap = {
    purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400" },
    green:  { bg: "bg-green-500/10",  border: "border-green-500/20",  text: "text-green-400" },
    indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-400" },
    yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-400" },
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white font-sans selection:bg-purple-500/30">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-6xl mx-auto px-6 pt-28 pb-24"
      >

        {/* ── SECTION 1: HERO ─────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-14 items-center mb-28">

          {/* Left */}
          <div className="space-y-7 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-300 tracking-wide">
              <span className="flex h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
              v3.0 is live — AI Booster
            </div>

            <h1 className="text-5xl md:text-[4rem] font-bold tracking-tight leading-[1.08]">
              Ignite Ideas.<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                Accelerate Dreams.
              </span>
            </h1>

            <p className="text-base text-gray-400 max-w-md leading-relaxed">
              The next-generation crowdfunding platform where bold ideas meet the community that believes in them.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/campaigns/create"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium transition-all duration-300 ease-out shadow-md hover:shadow-lg hover:opacity-90 hover:translate-y-[-1px] active:scale-[0.98] active:translate-y-0"
              >
                Start a Campaign
              </Link>
              <Link
                to="/discover"
                className="px-5 py-2.5 rounded-xl border border-white/20 bg-white/0 hover:bg-white/5 text-white text-sm font-medium transition-all duration-300 ease-out hover:translate-y-[-1px] active:scale-[0.98] active:translate-y-0"
              >
                Explore Campaigns
              </Link>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-[#0b0f19] bg-gradient-to-br from-purple-500/60 to-indigo-500/60 flex items-center justify-center text-[9px] font-bold">
                    U{i}
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-400">
                <div className="text-yellow-500 text-xs leading-none mb-0.5">★★★★★</div>
                Trusted by 10,000+ creators
              </div>
            </div>
          </div>

          {/* Right — Visual Cards */}
          <div className="relative space-y-5">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/8 blur-[90px] -z-10 rounded-full pointer-events-none" />

            {/* Raised card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden transition-all duration-300 hover:bg-white/[0.07] hover:border-white/20 hover:shadow-lg">
              <div className="absolute top-0 right-0 p-4 opacity-[0.07]">
                <FiTrendingUp className="text-5xl text-purple-400" />
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-widest">Total Raised</p>
              <div className="flex items-baseline gap-2.5 mb-5">
                <h3 className="text-3xl font-bold text-white tracking-tight">$4,250,000</h3>
                <span className="text-xs font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md">+14.5%</span>
              </div>
              <div className="h-20 w-full flex items-end gap-1 opacity-70">
                {[40, 55, 45, 70, 60, 85, 75, 95, 100, 90, 110, 120].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-purple-500/30 to-purple-500/70 rounded-t-[3px] transition-all duration-500"
                    style={{ height: `${(h / 120) * 100}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Category donut card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl flex items-center gap-5 md:ml-10 transition-all duration-300 hover:bg-white/[0.07] hover:border-white/20 hover:shadow-lg">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path className="text-purple-500" strokeDasharray="45, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path className="text-indigo-500" strokeDasharray="30, 100" strokeDashoffset="-45" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path className="text-cyan-500" strokeDasharray="25, 100" strokeDashoffset="-75" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-semibold text-white mb-2.5 uppercase tracking-widest">Top Categories</h4>
                <div className="space-y-1.5">
                  {[["bg-purple-500", "Technology", "45%"], ["bg-indigo-500", "Creative", "30%"], ["bg-cyan-500", "Community", "25%"]].map(([dot, label, pct]) => (
                    <div key={label} className="flex justify-between text-xs items-center">
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />{label}
                      </span>
                      <span className="text-gray-500 font-medium tabular-nums">{pct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: STATS STRIP ──────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white/5 border border-white/10 rounded-2xl px-8 py-7 backdrop-blur-xl mb-28 gap-6 sm:gap-0">
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-3xl font-bold text-white tracking-tight tabular-nums">{stats.campaigns.toLocaleString()}+</h2>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Active Campaigns</p>
          </div>
          <div className="hidden sm:block w-px h-10 bg-white/10" />
          <div className="text-center flex-1">
            <h2 className="text-3xl font-bold text-white tracking-tight tabular-nums">${stats.raised.toLocaleString()}</h2>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Total Raised</p>
          </div>
          <div className="hidden sm:block w-px h-10 bg-white/10" />
          <div className="text-center sm:text-right flex-1">
            <h2 className="text-3xl font-bold text-white tracking-tight tabular-nums">{stats.backers.toLocaleString()}+</h2>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Happy Backers</p>
          </div>
        </div>

        {/* ── SECTION 3: TRENDING CAMPAIGNS ───────────────────── */}
        <div className="mb-28">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-white tracking-tight">Trending Campaigns</h2>
            <Link to="/discover" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors duration-200 flex items-center gap-1">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : displayCampaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-semibold text-white mb-2">No campaigns yet</p>
              <p className="text-sm text-gray-500 mb-6 max-w-sm leading-relaxed">
                Be the first to launch something amazing on IgnitionX.
              </p>
              <Link
                to="/campaigns/create"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium transition-all duration-300 hover:opacity-90 hover:translate-y-[-1px] active:scale-[0.98]"
              >
                Start a Campaign
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayCampaigns.map((c, i) => (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full"
                >
                  <CampaignCard campaign={c} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* ── SECTION 4: FEATURES ─────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {features.map(({ icon, color, title, desc }) => {
            const c = colorMap[color];
            return (
              <div
                key={title}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md transition-all duration-300 ease-out hover:bg-white/[0.08] hover:border-white/20 hover:shadow-lg hover:translate-y-[-2px] group"
              >
                <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <span className={`${c.text} text-base`}>{icon}</span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5 tracking-tight">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            );
          })}
        </div>

      </motion.div>
    </div>
  );
}