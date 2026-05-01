import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import CampaignCard from "../components/CampaignCard";
import { FiZap, FiShield, FiTrendingUp, FiAward } from "react-icons/fi";

export default function Home() {
  const [stats, setStats] = useState({
    campaigns: 0,
    raised: 0,
    backers: 0,
  });
  
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/campaigns/stats`
        );
        setStats(res.data.stats);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchCampaigns = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/campaigns`
        );
        const activeCampaigns = (res.data.campaigns || []).filter(c => c.status === 'active').slice(0, 4);
        setCampaigns(activeCampaigns.length > 0 ? activeCampaigns : (res.data.campaigns || []).slice(0, 4));
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
    fetchCampaigns();
  }, []);

  const demoCampaigns = [
    {
      _id: "1",
      title: "NeuroLink Pro",
      description: "Next-gen brain-computer interface",
      category: "Technology",
      currentAmount: 125430,
      goalAmount: 150000,
      image: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f",
      slug: "neurolink-pro"
    },
    {
      _id: "2",
      title: "Eclipse: Beyond Earth",
      description: "A sci-fi adventure series",
      category: "Film",
      currentAmount: 98760,
      goalAmount: 130000,
      image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa",
      slug: "eclipse-beyond-earth"
    },
    {
      _id: "3",
      title: "Minimalist Chair Collection",
      description: "Sustainable furniture for the future",
      category: "Design",
      currentAmount: 68120,
      goalAmount: 100000,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
      slug: "minimalist-chair"
    },
    {
      _id: "4",
      title: "Echoes of Tomorrow",
      description: "Debut album by Indie Waves",
      category: "Music",
      currentAmount: 54320,
      goalAmount: 75000,
      image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
      slug: "echoes-of-tomorrow"
    }
  ];

  const displayCampaigns = campaigns.length > 0 ? campaigns : demoCampaigns;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white pb-24 font-sans selection:bg-purple-500/30">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto px-4 pt-24"
      >
        
        {/* SECTION 1: HERO */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          
          {/* LEFT */}
          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-300">
              <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse"></span>
              v3.0 is live — AI Booster
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
              Ignite Ideas. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                Accelerate Dreams.
              </span>
            </h1>
            
            <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
              The next-generation crowdfunding platform where bold ideas meet the community that believes in them. Built for scale, security, and speed.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/campaigns/create" className="px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all duration-300 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:translate-y-[-2px] hover:shadow-lg active:scale-[0.98]">
                Start a Campaign
              </Link>
              <Link to="/discover" className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg active:scale-[0.98]">
                Explore Campaigns
              </Link>
            </div>
            
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0b0f19] bg-gradient-to-br from-purple-500/50 to-indigo-500/50 flex items-center justify-center text-[10px] font-bold">
                    U{i}
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-400">
                <div className="flex text-yellow-500 text-xs mb-0.5">
                  ★★★★★
                </div>
                Trusted by 10,000+ creators
              </div>
            </div>
          </div>
          
          {/* RIGHT */}
          <div className="relative space-y-6">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 blur-[100px] -z-10 rounded-full pointer-events-none" />
            
            {/* LINE CHART CARD */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden transition hover:bg-white/10 duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <FiTrendingUp className="text-6xl text-purple-500" />
              </div>
              <p className="text-sm font-medium text-gray-400 mb-1">Total Raised Platform-wide</p>
              <div className="flex items-baseline gap-3 mb-6">
                <h3 className="text-4xl font-bold text-white">$4,250,000</h3>
                <span className="text-sm font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md">+14.5%</span>
              </div>
              {/* Fake Chart */}
              <div className="h-24 w-full flex items-end gap-1.5 opacity-80">
                {[40, 55, 45, 70, 60, 85, 75, 95, 100, 90, 110, 120].map((h, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-purple-500/20 to-purple-500/60 rounded-t-sm transition-all duration-500 hover:opacity-100" style={{ height: `${(h/120)*100}%` }}></div>
                ))}
              </div>
            </div>
            
            {/* DONUT CATEGORY CARD */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl flex items-center gap-6 md:ml-12 transition hover:bg-white/10 duration-300">
              {/* Fake Donut */}
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path className="text-purple-500" strokeDasharray="45, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path className="text-indigo-500" strokeDasharray="30, 100" strokeDashoffset="-45" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path className="text-cyan-500" strokeDasharray="25, 100" strokeDashoffset="-75" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white mb-3">Top Categories</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs items-center">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div>Technology</span>
                    <span className="text-gray-400 font-medium">45%</span>
                  </div>
                  <div className="flex justify-between text-xs items-center">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div>Creative</span>
                    <span className="text-gray-400 font-medium">30%</span>
                  </div>
                  <div className="flex justify-between text-xs items-center">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-500"></div>Community</span>
                    <span className="text-gray-400 font-medium">25%</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* SECTION 2: STATS STRIP */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl mb-24 gap-6 sm:gap-0 shadow-lg">
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-1">{stats.campaigns.toLocaleString()}+</h2>
            <p className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">Active Campaigns</p>
          </div>
          <div className="hidden sm:block w-px h-12 bg-white/10"></div>
          <div className="text-center flex-1">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-1">${stats.raised.toLocaleString()}</h2>
            <p className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">Total Raised</p>
          </div>
          <div className="hidden sm:block w-px h-12 bg-white/10"></div>
          <div className="text-center sm:text-right flex-1">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-1">{stats.backers.toLocaleString()}+</h2>
            <p className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">Happy Backers</p>
          </div>
        </div>

        {/* SECTION 3: TRENDING CAMPAIGNS */}
        <div className="mb-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">Trending Campaigns</h2>
            <Link to="/discover" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition flex items-center gap-1">
              View all &rarr;
            </Link>
          </div>

          {displayCampaigns.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              🚀 No campaigns yet — be the first to launch!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayCampaigns.map((c, i) => (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <CampaignCard campaign={c} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 4: FEATURE ICON ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:bg-white/10 transition duration-300 group">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <FiZap className="text-purple-400 text-lg" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">AI Campaign Booster</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Optimize your pitch and maximize reach using our proprietary AI scoring model.
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:bg-white/10 transition duration-300 group">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <FiShield className="text-green-400 text-lg" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">Secure & Transparent</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Enterprise-grade payments powered by Stripe with full audit trails.
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:bg-white/10 transition duration-300 group">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <FiTrendingUp className="text-indigo-400 text-lg" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">Trending Algorithm</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Dynamic visibility based on real-time engagement and backer momentum.
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:bg-white/10 transition duration-300 group">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <FiAward className="text-yellow-400 text-lg" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">Gamification</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Earn XP, unlock exclusive badges, and climb the backer leaderboard.
            </p>
          </div>
          
        </div>

      </motion.div>
    </div>
  );
}