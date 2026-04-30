import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiUser, FiSave, FiCamera } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../lib/api';
import useAuthStore from '../store/authStore';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    website: user?.website || '',
    socialLinks: user?.socialLinks || { twitter: '', linkedin: '', instagram: '' },
  });
  const [saving, setSaving] = useState(false);
  const [contributions, setContributions] = useState([]);

  useEffect(() => {
    api.get('/contributions').then(({ data }) => setContributions(data.contributions || [])).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Profile — IgnitionX</title>
      </Helmet>
      <div className="min-h-screen pt-24 px-4 max-w-4xl mx-auto pb-20">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-black text-white mb-8">My Profile</motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 border border-white/8 text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                {user?.avatar?.url ? (
                  <img src={user.avatar.url} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full gradient-primary flex items-center justify-center text-3xl text-white font-black">
                    {user?.name?.[0]}
                  </div>
                )}
                <button className="absolute bottom-0 right-0 w-8 h-8 glass rounded-full flex items-center justify-center text-slate-400 hover:text-white border border-white/10">
                  <FiCamera className="text-xs" />
                </button>
              </div>
              <h2 className="text-lg font-bold text-white">{user?.name}</h2>
              <p className="text-sm text-purple-400 capitalize">{user?.role}</p>
              <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-white/5">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{user?.level}</div>
                  <div className="text-xs text-slate-400">Level</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{user?.xp?.toLocaleString()}</div>
                  <div className="text-xs text-slate-400">XP</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{user?.badges?.length || 0}</div>
                  <div className="text-xs text-slate-400">Badges</div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSave} className="glass rounded-2xl p-6 border border-white/8 space-y-5">
              <h3 className="text-base font-bold text-white">Edit Profile</h3>
              {[
                { key: 'name', label: 'Name', type: 'text', placeholder: 'Your name' },
                { key: 'bio', label: 'Bio', type: 'textarea', placeholder: 'Tell your story...' },
                { key: 'website', label: 'Website', type: 'url', placeholder: 'https://yoursite.com' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 block">{label}</label>
                  {type === 'textarea' ? (
                    <textarea value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      placeholder={placeholder} rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/70 transition-colors resize-none" />
                  ) : (
                    <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/70 transition-colors" />
                  )}
                </div>
              ))}

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 block">Social Links</label>
                <div className="space-y-3">
                  {['twitter', 'linkedin', 'instagram'].map((social) => (
                    <input key={social} type="url" placeholder={`${social}.com/username`}
                      value={form.socialLinks[social]}
                      onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, [social]: e.target.value } })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/70 transition-colors capitalize" />
                  ))}
                </div>
              </div>

              <button type="submit" disabled={saving}
                className="btn-primary py-3 px-6 text-sm flex items-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave />}
                Save Changes
              </button>
            </form>

            {/* Contributions */}
            <div className="glass rounded-2xl p-6 border border-white/8 mt-6">
              <h3 className="text-base font-bold text-white mb-4">My Contributions</h3>
              {contributions.length === 0 ? (
                <p className="text-slate-500 text-sm">You haven't backed any campaigns yet.</p>
              ) : (
                <div className="space-y-3">
                  {contributions.slice(0, 5).map((c) => (
                    <div key={c._id} className="flex items-center gap-3 py-2">
                      {c.campaign?.coverImage?.url && (
                        <img src={c.campaign.coverImage.url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{c.campaign?.title}</p>
                        <p className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="text-sm font-bold text-purple-400">${c.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
