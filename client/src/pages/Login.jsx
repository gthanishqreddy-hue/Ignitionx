import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiMail, FiLock, FiEye, FiEyeOff, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success('Welcome back! 🔥');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign In — IgnitionX</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center px-4 relative">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center animate-pulse-glow">
                <FiZap className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold gradient-text">IgnitionX</span>
            </div>
            <h1 className="text-2xl font-black text-white">Welcome back</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to your account to continue</p>
          </div>

          <div className="glass rounded-2xl p-8 border border-white/8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 block">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input type="email" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/70 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 block">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input type={showPass ? 'text' : 'password'} required value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Your password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/70 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <div className="text-right mt-1.5">
                  <Link to="/forgot-password" className="text-xs text-slate-500 hover:text-purple-400 transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button type="submit" disabled={isLoading}
                className="w-full btn-primary py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold mt-2">
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><FiZap /> Sign In</>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
