import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiArrowRight, FiZap, FiTarget, FiUsers, FiTrendingUp, FiShield, FiStar } from 'react-icons/fi';
import { useInView } from 'framer-motion';
import CampaignCard from '../components/campaign/CampaignCard';
import api from '../lib/api';

// Animated counter
function Counter({ target, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const step = target / 60;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(Math.floor(current));
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// Floating orb
function Orb({ className, style }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      style={style}
    />
  );
}

const CATEGORIES = [
  'Technology', 'Art', 'Film', 'Music', 'Games', 'Design',
  'Food', 'Fashion', 'Education', 'Environment',
];

const FEATURES = [
  {
    icon: FiZap,
    title: 'AI Campaign Booster',
    description: 'Our AI analyzes top campaigns and gives you actionable suggestions to maximize funding success.',
    color: '#7c3aed',
  },
  {
    icon: FiShield,
    title: 'Secure & Transparent',
    description: 'Stripe-powered payments with real-time fund tracking. Every dollar is auditable.',
    color: '#06b6d4',
  },
  {
    icon: FiTrendingUp,
    title: 'Trending Algorithm',
    description: 'Smart discovery engine surfaces the most exciting campaigns based on momentum.',
    color: '#ec4899',
  },
  {
    icon: FiStar,
    title: 'Gamification',
    description: 'Earn badges, climb leaderboards, and build your backer reputation as you support ideas.',
    color: '#f59e0b',
  },
  {
    icon: FiTarget,
    title: 'Milestone System',
    description: 'Creators post updates at each milestone. Backers stay informed every step of the way.',
    color: '#10b981',
  },
  {
    icon: FiUsers,
    title: 'Community First',
    description: 'Comments, replies, and reactions. Build a community around every campaign.',
    color: '#8b5cf6',
  },
];

export default function Home() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const [campaigns, setCampaigns] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    api.get('/campaigns?sort=trending&limit=6&status=active')
      .then(({ data }) => setCampaigns(data.campaigns || []))
      .catch(() => {});
  }, []);

  return (
    <>
      <Helmet>
        <title>IgnitionX — Ignite Ideas. Accelerate Dreams.</title>
        <meta name="description" content="The next-generation crowdfunding platform built for bold ideas and the people who back them. Launch your campaign or discover the next big thing." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Helmet>

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 gradient-hero" />

        {/* Animated orbs */}
        <Orb
          className="w-96 h-96 animate-float"
          style={{
            top: '10%', left: '5%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)',
            animationDelay: '0s',
          }}
        />
        <Orb
          className="w-80 h-80 animate-float"
          style={{
            top: '30%', right: '8%',
            background: 'radial-gradient(circle, rgba(79,70,229,0.25) 0%, transparent 70%)',
            animationDelay: '-2s',
          }}
        />
        <Orb
          className="w-64 h-64 animate-float"
          style={{
            bottom: '15%', left: '30%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)',
            animationDelay: '-4s',
          }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center max-w-5xl mx-auto px-4 pt-24 pb-16">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 border border-purple-500/30"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-slate-300">v3.0 is live — AI Booster, Gamification & more</span>
            <FiArrowRight className="text-purple-400 text-sm" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] mb-6"
          >
            <span className="text-white">Ignite </span>
            <span className="gradient-text glow-text">Ideas.</span>
            <br />
            <span className="text-white">Accelerate </span>
            <span className="gradient-text glow-text">Dreams.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The next-generation crowdfunding platform where bold ideas meet the
            community that believes in them. Launch, fund, and track with AI-powered precision.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/discover">
              <button className="btn-primary text-base px-8 py-4 flex items-center gap-2 rounded-xl">
                Explore Campaigns <FiArrowRight />
              </button>
            </Link>
            <Link to="/register">
              <button className="btn-ghost text-base px-8 py-4 rounded-xl flex items-center gap-2">
                <FiZap className="text-purple-400" /> Start a Campaign
              </button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-3 gap-6 mt-20 max-w-lg mx-auto"
          >
            {[
              { value: 12000, suffix: '+', label: 'Campaigns' },
              { value: 4200000, prefix: '$', label: 'Total Raised' },
              { value: 89000, suffix: '+', label: 'Backers' },
            ].map(({ value, suffix, prefix, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl sm:text-3xl font-black gradient-text">
                  <Counter target={value} suffix={suffix} prefix={prefix} />
                </div>
                <div className="text-xs text-slate-500 mt-1">{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-5 h-9 rounded-full border-2 border-white/20 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-purple-500 animate-pulse" />
          </div>
        </motion.div>
      </section>

      {/* ── FEATURED CAMPAIGNS ────────────────────────────────────────────────── */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            🔥 <span className="gradient-text">Trending</span> Right Now
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            The most exciting campaigns gaining momentum this week. Be an early backer.
          </p>
        </motion.div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {['all', ...CATEGORIES.slice(0, 7)].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? 'gradient-primary text-white shadow-lg shadow-purple-500/30'
                  : 'glass text-slate-400 hover:text-white border border-white/8'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {campaigns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign, i) => (
              <CampaignCard key={campaign._id} campaign={campaign} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <FiZap className="text-white text-2xl" />
            </div>
            <p className="text-slate-400 text-lg">Connect your backend to see live campaigns</p>
            <p className="text-slate-500 text-sm mt-2">Start the server and campaigns will appear here</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/discover">
            <button className="btn-ghost px-8 py-3 flex items-center gap-2 mx-auto">
              View all campaigns <FiArrowRight />
            </button>
          </Link>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Built for the <span className="gradient-text">Next Generation</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Every feature is designed to maximize campaign success and backer engagement.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, description, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass rounded-2xl p-6 hover-lift card-shine group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `${color}20`, border: `1px solid ${color}30` }}
                >
                  <Icon style={{ color }} className="text-xl" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">How It <span className="gradient-text">Works</span></h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-purple-500/0 via-purple-500/60 to-purple-500/0" />
          {[
            { step: '01', title: 'Create Your Campaign', desc: 'Build your campaign page with images, video pitch, milestones, and reward tiers in minutes.' },
            { step: '02', title: 'Share & Fundraise', desc: 'Our trending algorithm and AI booster help you reach the right audience and maximize backing.' },
            { step: '03', title: 'Deliver & Grow', desc: 'Post milestone updates, engage your community, and build lasting momentum for your idea.' },
          ].map(({ step, title, desc }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center relative"
            >
              <div className="w-20 h-20 rounded-2xl glass border border-purple-500/20 flex items-center justify-center mx-auto mb-6 relative glow-purple-sm">
                <span className="text-3xl font-black gradient-text">{step}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center glass rounded-3xl p-12 border border-purple-500/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.5) 0%, transparent 70%)' }} />
          <div className="relative">
            <div className="text-5xl mb-6">🚀</div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Ready to <span className="gradient-text">Ignite Your Idea?</span>
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              Join thousands of creators who've turned their visions into reality. Your next big thing starts here.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/register">
                <button className="btn-primary text-base px-8 py-4 rounded-xl animate-pulse-glow">
                  Start Your Campaign
                </button>
              </Link>
              <Link to="/discover">
                <button className="btn-ghost text-base px-8 py-4 rounded-xl">
                  Browse Campaigns
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
