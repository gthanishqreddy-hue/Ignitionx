import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiSearch, FiSliders, FiX } from 'react-icons/fi';
import CampaignCard from '../components/campaign/CampaignCard';
import api from '../lib/api';

const CATEGORIES = [
  'All', 'Technology', 'Art', 'Film', 'Music', 'Games', 'Design',
  'Food', 'Fashion', 'Education', 'Environment', 'Health', 'Sports',
];

const SORT_OPTIONS = [
  { value: 'trending', label: '🔥 Trending' },
  { value: 'newest', label: '✨ Newest' },
  { value: 'most-funded', label: '💰 Most Funded' },
  { value: 'ending-soon', label: '⏳ Ending Soon' },
  { value: 'most-backed', label: '👥 Most Backed' },
];

export default function Discover() {
  const [campaigns, setCampaigns] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('trending');
  const [showFilters, setShowFilters] = useState(false);

  const fetchCampaigns = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: 'active',
        sort,
        page: reset ? 1 : page,
        limit: 12,
        ...(search && { search }),
        ...(category !== 'All' && { category }),
      });
      const { data } = await api.get(`/campaigns?${params}`);
      if (reset) {
        setCampaigns(data.campaigns);
        setPage(1);
      } else {
        setCampaigns((prev) => [...prev, ...data.campaigns]);
      }
      setTotal(data.pagination?.total || 0);
    } catch (_) {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, page]);

  useEffect(() => {
    fetchCampaigns(true);
  }, [search, category, sort]);

  const loadMore = () => {
    setPage((p) => p + 1);
    fetchCampaigns(false);
  };

  return (
    <>
      <Helmet>
        <title>Discover Campaigns — IgnitionX</title>
        <meta name="description" content="Browse and back innovative campaigns across technology, art, music, games and more." />
      </Helmet>

      <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Discover <span className="gradient-text">Campaigns</span>
          </h1>
          <p className="text-slate-400">Find the next big idea and be the spark that ignites it.</p>
        </motion.div>

        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/50 border border-white/8 transition-colors bg-transparent"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <FiX />
              </button>
            )}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="glass rounded-xl px-4 py-3 text-sm text-slate-300 outline-none border border-white/8 bg-transparent cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} style={{ background: '#0d0d1a' }}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                category === cat
                  ? 'gradient-primary text-white shadow-lg shadow-purple-500/30'
                  : 'glass text-slate-400 hover:text-white border border-white/8'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-slate-500 text-sm mb-6">
            Showing {campaigns.length} of {total} campaigns
          </p>
        )}

        {/* Grid */}
        {loading && campaigns.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
                <div className="bg-white/5" style={{ paddingTop: '56.25%' }} />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                  <div className="h-3 bg-white/5 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">No campaigns found</h3>
            <p className="text-slate-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {campaigns.map((campaign, i) => (
                <CampaignCard key={campaign._id} campaign={campaign} index={i % 12} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Load more */}
        {campaigns.length < total && !loading && (
          <div className="text-center mt-12">
            <button onClick={loadMore} className="btn-ghost px-8 py-3">
              Load More Campaigns
            </button>
          </div>
        )}
      </div>
    </>
  );
}
