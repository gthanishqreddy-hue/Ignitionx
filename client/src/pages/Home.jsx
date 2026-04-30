import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiArrowRight, FiZap } from 'react-icons/fi';
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
    const step = target / 60 || 1;
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

export default function Home() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const [campaigns, setCampaigns] = useState([]);

  // ✅ NEW: stats state
  const [stats, setStats] = useState({
    campaigns: 0,
    raised: 0,
    backers: 0,
  });

  useEffect(() => {
    // existing campaigns fetch
    api.get('/campaigns?sort=trending&limit=6&status=active')
      .then(({ data }) => setCampaigns(data.campaigns || []))
      .catch(() => { });

    // ✅ NEW: fetch real stats
    api.get('/campaigns/stats')
      .then(({ data }) => setStats(data.stats))
      .catch(() => { });

  }, []);

  return (
    <>
      <Helmet>
        <title>IgnitionX</title>
      </Helmet>

      {/* HERO */}
      <section className="text-center py-20">

        <motion.div style={{ y: heroY, opacity: heroOpacity }}>

          <h1 className="text-5xl font-bold mb-6">
            Ignite Ideas 🚀
          </h1>

          {/* ✅ REAL STATS (UPDATED) */}
          <div className="grid grid-cols-3 gap-6 mt-10 max-w-lg mx-auto">

            <div>
              <div className="text-2xl font-bold text-purple-500">
                <Counter target={stats.campaigns} suffix="+" />
              </div>
              <p className="text-sm text-gray-400">Campaigns</p>
            </div>

            <div>
              <div className="text-2xl font-bold text-purple-500">
                <Counter target={stats.raised} prefix="$" />
              </div>
              <p className="text-sm text-gray-400">Total Raised</p>
            </div>

            <div>
              <div className="text-2xl font-bold text-purple-500">
                <Counter target={stats.backers} suffix="+" />
              </div>
              <p className="text-sm text-gray-400">Backers</p>
            </div>

          </div>

        </motion.div>
      </section>

      {/* CAMPAIGNS */}
      <section className="py-16 px-4 max-w-6xl mx-auto">

        {campaigns.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {campaigns.map((c, i) => (
              <CampaignCard key={c._id} campaign={c} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <FiZap className="text-4xl mx-auto mb-4 text-purple-500" />
            <p>No campaigns yet</p>
          </div>
        )}

      </section>

      {/* CTA */}
      <div className="text-center py-10">
        <Link to="/discover">
          <button className="btn-primary px-6 py-3 flex items-center gap-2 mx-auto">
            Explore Campaigns <FiArrowRight />
          </button>
        </Link>
      </div>

    </>
  );
}