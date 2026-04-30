import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiPlus, FiTrash2, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../lib/api';

const CATEGORIES = [
  'Technology', 'Art', 'Film', 'Music', 'Games', 'Design',
  'Food', 'Fashion', 'Education', 'Environment', 'Health', 'Sports', 'Other',
];

const STEPS = ['Basics', 'Details', 'Rewards', 'Milestones', 'Review'];

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '', tagline: '', category: 'Technology', description: '',
    goalAmount: '', startDate: '', endDate: '',
    coverImage: { url: '', publicId: '' },
    videoPitch: { url: '', publicId: '' },
    risks: '', location: { country: '', city: '' },
    rewardTiers: [],
    milestones: [],
  });

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const addReward = () => {
    if (form.rewardTiers.length >= 10) return;
    update('rewardTiers', [...form.rewardTiers, {
      title: '', description: '', amount: '', estimatedDelivery: '', items: [''],
    }]);
  };

  const updateReward = (i, field, val) => {
    const tiers = [...form.rewardTiers];
    tiers[i] = { ...tiers[i], [field]: val };
    update('rewardTiers', tiers);
  };

  const removeReward = (i) => update('rewardTiers', form.rewardTiers.filter((_, idx) => idx !== i));

  const addMilestone = () => {
    update('milestones', [...form.milestones, { title: '', description: '', targetAmount: '' }]);
  };

  const updateMilestone = (i, field, val) => {
    const ms = [...form.milestones];
    ms[i] = { ...ms[i], [field]: val };
    update('milestones', ms);
  };

  const removeMilestone = (i) => update('milestones', form.milestones.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        goalAmount: Number(form.goalAmount),
        rewardTiers: form.rewardTiers.map((t) => ({ ...t, amount: Number(t.amount) })),
        milestones: form.milestones.map((m) => ({ ...m, targetAmount: Number(m.targetAmount) })),
        status: 'active',
      };
      const { data } = await api.post('/campaigns', payload);
      toast.success('Campaign launched! 🚀');
      navigate(`/campaigns/${data.campaign.slug}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/70 transition-colors";
  const labelClass = "text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 block";

  return (
    <>
      <Helmet>
        <title>Launch Campaign — IgnitionX</title>
      </Helmet>
      <div className="min-h-screen pt-24 px-4 max-w-3xl mx-auto pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-white mb-2">🚀 Launch Your Campaign</h1>
          <p className="text-slate-400 text-sm mb-8">Share your idea with the world and find the backers who believe in it.</p>

          {/* Step indicator */}
          <div className="flex items-center gap-0 mb-10">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex flex-col items-center gap-1 ${i <= step ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < step ? 'gradient-primary text-white' : i === step ? 'border-2 border-purple-500 text-purple-400' : 'border border-white/20 text-slate-500'
                  }`}>{i < step ? '✓' : i + 1}</div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap hidden sm:block">{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 ${i < step ? 'gradient-primary' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl p-6 border border-white/8">
            {/* Step 0: Basics */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Campaign Title *</label>
                  <input value={form.title} onChange={(e) => update('title', e.target.value)}
                    placeholder="Give your campaign a compelling name..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Tagline *</label>
                  <input value={form.tagline} onChange={(e) => update('tagline', e.target.value)}
                    placeholder="One sentence that captures everything..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Category *</label>
                  <select value={form.category} onChange={(e) => update('category', e.target.value)}
                    className={`${inputClass} cursor-pointer`} style={{ background: '#0d0d1a' }}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Goal Amount (USD) *</label>
                    <input type="number" value={form.goalAmount} min={100}
                      onChange={(e) => update('goalAmount', e.target.value)}
                      placeholder="5000" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Country</label>
                    <input value={form.location.country} onChange={(e) => update('location', { ...form.location, country: e.target.value })}
                      placeholder="United States" className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Start Date *</label>
                    <input type="date" value={form.startDate} min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => update('startDate', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>End Date *</label>
                    <input type="date" value={form.endDate} min={form.startDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => update('endDate', e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Details */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Cover Image URL</label>
                  <input value={form.coverImage.url} onChange={(e) => update('coverImage', { ...form.coverImage, url: e.target.value })}
                    placeholder="https://... (Use Cloudinary upload in production)" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Video Pitch URL</label>
                  <input value={form.videoPitch.url} onChange={(e) => update('videoPitch', { ...form.videoPitch, url: e.target.value })}
                    placeholder="https://... (YouTube, Vimeo, or Cloudinary)" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Full Description * (min 100 chars)</label>
                  <textarea value={form.description} onChange={(e) => update('description', e.target.value)}
                    rows={10} placeholder="Tell your story. Why does this matter? What will you build? Who is it for?..."
                    className={`${inputClass} resize-none`} />
                  <p className="text-xs text-slate-500 mt-1">{form.description.length}/5000 characters</p>
                </div>
                <div>
                  <label className={labelClass}>Risks & Challenges</label>
                  <textarea value={form.risks} onChange={(e) => update('risks', e.target.value)}
                    rows={4} placeholder="Be transparent about potential challenges and how you'll address them..."
                    className={`${inputClass} resize-none`} />
                </div>
              </div>
            )}

            {/* Step 2: Rewards */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-400">Define reward tiers for your backers (optional)</p>
                  <button onClick={addReward} className="btn-primary text-xs py-2 px-3 flex items-center gap-1">
                    <FiPlus /> Add Tier
                  </button>
                </div>
                {form.rewardTiers.length === 0 && (
                  <div className="text-center py-10 text-slate-500 text-sm">
                    No reward tiers yet. Click "Add Tier" to create one.
                  </div>
                )}
                {form.rewardTiers.map((tier, i) => (
                  <div key={i} className="glass rounded-xl p-4 border border-white/8 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-purple-400">Tier {i + 1}</span>
                      <button onClick={() => removeReward(i)} className="text-red-400 hover:text-red-300"><FiTrash2 className="text-sm" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="Tier title" value={tier.title} onChange={(e) => updateReward(i, 'title', e.target.value)} className={inputClass} />
                      <input type="number" placeholder="Amount ($)" value={tier.amount} onChange={(e) => updateReward(i, 'amount', e.target.value)} className={inputClass} />
                    </div>
                    <textarea placeholder="What backers get at this tier..." value={tier.description} onChange={(e) => updateReward(i, 'description', e.target.value)} rows={2} className={`${inputClass} resize-none`} />
                  </div>
                ))}
              </div>
            )}

            {/* Step 3: Milestones */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-400">Set funding milestones to keep backers engaged</p>
                  <button onClick={addMilestone} className="btn-primary text-xs py-2 px-3 flex items-center gap-1">
                    <FiPlus /> Add Milestone
                  </button>
                </div>
                {form.milestones.length === 0 && (
                  <div className="text-center py-10 text-slate-500 text-sm">No milestones yet.</div>
                )}
                {form.milestones.map((m, i) => (
                  <div key={i} className="glass rounded-xl p-4 border border-white/8 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-cyan-400">Milestone {i + 1}</span>
                      <button onClick={() => removeMilestone(i)} className="text-red-400"><FiTrash2 className="text-sm" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="Milestone title" value={m.title} onChange={(e) => updateMilestone(i, 'title', e.target.value)} className={inputClass} />
                      <input type="number" placeholder="Target amount ($)" value={m.targetAmount} onChange={(e) => updateMilestone(i, 'targetAmount', e.target.value)} className={inputClass} />
                    </div>
                    <input placeholder="Description..." value={m.description} onChange={(e) => updateMilestone(i, 'description', e.target.value)} className={inputClass} />
                  </div>
                ))}
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-white mb-2">Review Your Campaign</h3>
                <div className="space-y-3">
                  {[
                    ['Title', form.title],
                    ['Tagline', form.tagline],
                    ['Category', form.category],
                    ['Goal', `$${Number(form.goalAmount).toLocaleString()}`],
                    ['Duration', `${form.startDate} → ${form.endDate}`],
                    ['Reward Tiers', form.rewardTiers.length],
                    ['Milestones', form.milestones.length],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-slate-400">{label}</span>
                      <span className="text-sm font-semibold text-white">{value || '—'}</span>
                    </div>
                  ))}
                </div>
                <div className="glass rounded-xl p-4 border border-amber-500/20 text-sm text-amber-300">
                  ⚠️ Once active, your campaign will be publicly visible. Ensure all details are correct.
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button disabled={step === 0} onClick={() => setStep((s) => s - 1)}
              className="btn-ghost flex items-center gap-2 disabled:opacity-30">
              <FiArrowLeft /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep((s) => s + 1)}
                className="btn-primary flex items-center gap-2">
                Next <FiArrowRight />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting}
                className="btn-primary flex items-center gap-2 px-8 animate-pulse-glow">
                {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '🚀'}
                Launch Campaign
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
