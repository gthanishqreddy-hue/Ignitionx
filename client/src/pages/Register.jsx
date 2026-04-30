import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'backer' });
  const [showPass, setShowPass] = useState(false);
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    const result = await register(form.name, form.email, form.password, form.role);
    if (result.success) {
      toast.success(`Welcome to IgnitionX, ${form.name}! 🔥`);
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Account — IgnitionX</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12 relative">
        {/* Background orbs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center animate-pulse-glow">
                <FiZap className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold gradient-text">IgnitionX</span>
            </div>
            <h1 className="text-2xl font-black text-white">Create your account</h1>
            <p className="text-slate-400 text-sm mt-1">Join the movement. Ignite your next big idea.</p>
          </div>

          <div className="glass rounded-2xl p-8 border border-white/8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 block">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input
                    type="text" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/70 transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 block">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input
                    type="email" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/70 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 block">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input
                    type={showPass ? 'text' : 'password'} required value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 8 characters"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/70 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 block">I want to...</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'backer', label: '💜 Back Projects', desc: 'Support great ideas' },
                    { value: 'creator', label: '🚀 Create Campaigns', desc: 'Raise funds for my idea' },
                  ].map(({ value, label, desc }) => (
                    <button
                      key={value} type="button"
                      onClick={() => setForm({ ...form, role: value })}
                      className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                        form.role === value
                          ? 'border-purple-500/60 bg-purple-500/10 text-white'
                          : 'border-white/8 bg-white/3 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <div className="text-sm font-semibold">{label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={isLoading}
                className="w-full btn-primary py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><FiZap /> Create Account</>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
