import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiUsers, FiClock, FiShare2, FiPlay, FiHeart, FiMessageSquare } from 'react-icons/fi';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import CampaignCard from '../components/campaign/CampaignCard';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

function ProgressBar({ percentage }) {
  return (
    <div className="progress-bar h-3">
      <motion.div
        className="progress-fill"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(percentage, 100)}%` }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

export default function CampaignDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuthStore();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('story');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const { data } = await api.get(`/campaigns/${slug}`);
        setCampaign(data.campaign);
        setLoading(false);
      } catch {
        navigate('/discover');
      }
    };
    fetchCampaign();
  }, [slug]);

  // Socket.io real-time updates
  useEffect(() => {
    if (!campaign?._id) return;
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token: token || '' },
    });
    socket.emit('join_campaign', campaign._id);
    socket.on('campaign_updated', (updates) => {
      setCampaign((prev) => ({ ...prev, ...updates }));
    });
    socket.on('new_comment', (comment) => {
      setComments((prev) => [comment, ...prev]);
    });
    return () => {
      socket.emit('leave_campaign', campaign._id);
      socket.disconnect();
    };
  }, [campaign?._id, token]);

  // Load comments
  useEffect(() => {
    if (!campaign?._id) return;
    api.get(`/campaigns/${campaign._id}/comments`).then(({ data }) => setComments(data.comments || []));
  }, [campaign?._id]);

  const handleContribute = async () => {
    if (!isAuthenticated) { toast.error('Sign in to back this campaign'); navigate('/login'); return; }
    if (!amount || Number(amount) < 1) { toast.error('Minimum contribution is $1'); return; }
    navigate(`/checkout/${campaign._id}?amount=${amount}`);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: campaign.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
    api.post(`/campaigns/${campaign._id}/share`).catch(() => {});
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Sign in to comment'); return; }
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/campaigns/${campaign._id}/comments`, { content: newComment });
      setNewComment('');
      toast.success('Comment posted!');
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/5 rounded-2xl" style={{ paddingTop: '56.25%' }} />
            <div className="h-8 bg-white/5 rounded w-3/4" />
            <div className="h-4 bg-white/5 rounded w-full" />
          </div>
          <div className="glass rounded-2xl h-96" />
        </div>
      </div>
    );
  }

  if (!campaign) return null;

  const fundingPercentage = parseFloat(campaign.fundingPercentage || 0);
  const daysLeft = campaign.daysRemaining ?? 0;

  return (
    <>
      <Helmet>
        <title>{campaign.title} — IgnitionX</title>
        <meta name="description" content={campaign.tagline} />
        <meta property="og:title" content={campaign.title} />
        <meta property="og:description" content={campaign.tagline} />
        {campaign.coverImage?.url && <meta property="og:image" content={campaign.coverImage.url} />}
      </Helmet>

      <div className="min-h-screen pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4">

          {/* Cover image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl overflow-hidden mb-8"
            style={{ paddingTop: '42%' }}
          >
            {campaign.coverImage?.url ? (
              <img
                src={campaign.coverImage.url}
                alt={campaign.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 gradient-primary opacity-60 flex items-center justify-center">
                <span className="text-6xl font-black text-white/30">{campaign.category}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {campaign.isFeatured && (
                <span className="glass text-sm text-purple-300 px-3 py-1.5 rounded-full border border-purple-500/30">⭐ Featured</span>
              )}
              <span className="glass text-sm text-slate-300 px-3 py-1.5 rounded-full">{campaign.category}</span>
            </div>

            {/* Video play button */}
            {campaign.videoPitch?.url && (
              <a href={campaign.videoPitch.url} target="_blank" rel="noreferrer"
                className="absolute inset-0 flex items-center justify-center group">
                <div className="w-16 h-16 rounded-full glass-strong flex items-center justify-center group-hover:scale-110 transition-transform glow-purple">
                  <FiPlay className="text-white text-xl ml-1" />
                </div>
              </a>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              {/* Creator */}
              <div className="flex items-center gap-3 mb-4">
                {campaign.creator?.avatar?.url ? (
                  <img src={campaign.creator.avatar.url} alt={campaign.creator.name}
                    className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                    {campaign.creator?.name?.[0]}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-white">{campaign.creator?.name}</p>
                  <p className="text-xs text-slate-400">{campaign.creator?.bio?.slice(0, 60) || 'Campaign Creator'}</p>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">{campaign.title}</h1>
              <p className="text-lg text-slate-400 mb-6">{campaign.tagline}</p>

              {/* Tabs */}
              <div className="flex gap-1 glass rounded-xl p-1 mb-6 border border-white/8">
                {[
                  { id: 'story', label: 'Story' },
                  { id: 'milestones', label: `Milestones (${campaign.milestones?.length || 0})` },
                  { id: 'rewards', label: `Rewards (${campaign.rewardTiers?.length || 0})` },
                  { id: 'comments', label: `Comments (${comments.length})` },
                ].map(({ id, label }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === id ? 'gradient-primary text-white' : 'text-slate-400 hover:text-white'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {activeTab === 'story' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="prose prose-invert max-w-none">
                  <div className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
                    {campaign.description}
                  </div>
                  {campaign.risks && (
                    <div className="mt-8 glass rounded-xl p-5 border border-amber-500/20">
                      <h4 className="text-base font-bold text-amber-400 mb-2">⚠️ Risks & Challenges</h4>
                      <p className="text-sm text-slate-400">{campaign.risks}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'milestones' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {campaign.milestones?.length > 0 ? campaign.milestones.map((m, i) => (
                    <div key={m._id || i} className={`glass rounded-xl p-5 border ${m.isCompleted ? 'border-green-500/30' : 'border-white/8'}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full mr-2 ${m.isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'}`}>
                            {m.isCompleted ? '✅ Completed' : `Milestone ${i + 1}`}
                          </span>
                          <h4 className="text-base font-bold text-white mt-2">{m.title}</h4>
                          <p className="text-sm text-slate-400 mt-1">{m.description}</p>
                          {m.update && <p className="text-sm text-green-300 mt-2 italic">"{m.update}"</p>}
                        </div>
                        <span className="text-purple-400 font-bold text-sm">${m.targetAmount?.toLocaleString()}</span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-slate-500 text-sm">No milestones set for this campaign.</p>
                  )}
                </motion.div>
              )}

              {activeTab === 'rewards' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {campaign.rewardTiers?.length > 0 ? campaign.rewardTiers.map((tier, i) => (
                    <div key={tier._id || i} className="glass rounded-xl p-5 border border-white/8 hover-lift">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-base font-bold text-white">{tier.title}</h4>
                        <span className="gradient-text text-xl font-black">${tier.amount}</span>
                      </div>
                      <p className="text-sm text-slate-400 mb-3">{tier.description}</p>
                      {tier.items?.length > 0 && (
                        <ul className="text-xs text-slate-400 space-y-1">
                          {tier.items.map((item, j) => (
                            <li key={j} className="flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-purple-500" /> {item}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                        <span className="text-xs text-slate-500">
                          {tier.currentBackers || 0}{tier.maxBackers ? `/${tier.maxBackers}` : ''} backers
                        </span>
                        <button
                          onClick={() => { setAmount(tier.amount); handleContribute(); }}
                          className="btn-primary text-xs py-2 px-4">
                          Select Reward
                        </button>
                      </div>
                    </div>
                  )) : (
                    <p className="text-slate-500 text-sm">No reward tiers defined.</p>
                  )}
                </motion.div>
              )}

              {activeTab === 'comments' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {/* Comment form */}
                  <form onSubmit={handleComment} className="glass rounded-xl p-4 border border-white/8">
                    <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts on this campaign..."
                      rows={3}
                      className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none resize-none mb-3"
                    />
                    <div className="flex justify-end">
                      <button type="submit" disabled={submitting || !newComment.trim()}
                        className="btn-primary text-xs py-2 px-4 flex items-center gap-1">
                        <FiMessageSquare /> Post Comment
                      </button>
                    </div>
                  </form>
                  {comments.map((c, i) => (
                    <div key={c._id || i} className="glass rounded-xl p-4 border border-white/8">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-xs text-white font-bold">
                          {c.author?.name?.[0]}
                        </div>
                        <span className="text-sm font-semibold text-white">{c.author?.name}</span>
                        <span className="text-xs text-slate-500">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">{c.content}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <div className="glass rounded-2xl p-6 border border-white/8">
                  {/* Stats */}
                  <div className="mb-4">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-3xl font-black text-white">${campaign.currentAmount?.toLocaleString()}</span>
                      <span className="text-sm text-slate-400">of ${campaign.goalAmount?.toLocaleString()}</span>
                    </div>
                    <ProgressBar percentage={fundingPercentage} />
                    <span className="text-purple-400 font-bold text-sm">{fundingPercentage}% funded</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5 mb-4">
                    <div>
                      <div className="flex items-center gap-1 text-sm text-white font-bold">
                        <FiUsers className="text-purple-400" />
                        {campaign.backersCount?.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">backers</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-sm text-white font-bold">
                        <FiClock className="text-cyan-400" />
                        {daysLeft}
                      </div>
                      <div className="text-xs text-slate-500">days left</div>
                    </div>
                  </div>

                  {/* Contribute */}
                  {campaign.status === 'active' && daysLeft > 0 ? (
                    <>
                      <div className="relative mb-3">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
                        <input
                          type="number" value={amount} min={1}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white outline-none focus:border-purple-500/70 transition-colors text-sm"
                        />
                      </div>
                      <div className="flex gap-2 mb-3">
                        {[10, 25, 50, 100].map((v) => (
                          <button key={v} onClick={() => setAmount(v)}
                            className={`flex-1 py-2 text-xs rounded-lg border transition-all ${
                              Number(amount) === v ? 'gradient-primary text-white border-transparent' : 'border-white/10 text-slate-400 hover:border-purple-500/40'
                            }`}>
                            ${v}
                          </button>
                        ))}
                      </div>
                      <button onClick={handleContribute}
                        className="w-full btn-primary py-3.5 rounded-xl text-sm font-semibold animate-pulse-glow">
                        ⚡ Back This Project
                      </button>
                    </>
                  ) : (
                    <div className={`text-center py-3 rounded-xl text-sm font-semibold ${
                      campaign.status === 'funded' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {campaign.status === 'funded' ? '🏆 Fully Funded!' : '⏰ Campaign Ended'}
                    </div>
                  )}

                  {/* Share */}
                  <button onClick={handleShare}
                    className="w-full btn-ghost mt-3 py-2.5 text-sm flex items-center justify-center gap-2">
                    <FiShare2 /> Share Campaign
                  </button>
                </div>

                {/* Creator card */}
                {campaign.creator && (
                  <div className="glass rounded-2xl p-5 border border-white/8">
                    <h4 className="text-sm font-bold text-white mb-3">About the Creator</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                        {campaign.creator.name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{campaign.creator.name}</p>
                        <p className="text-xs text-slate-400">{campaign.creator.campaignsCreated} campaigns</p>
                      </div>
                    </div>
                    {campaign.creator.bio && (
                      <p className="text-xs text-slate-400 mt-3 line-clamp-3">{campaign.creator.bio}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
