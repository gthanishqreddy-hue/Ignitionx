import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiMenu, FiX, FiBell, FiUser, FiLogOut, FiPlus, FiBarChart2 } from 'react-icons/fi';
import useAuthStore from '../../store/authStore';
import NotificationPanel from '../ui/NotificationPanel';

const navLinks = [
  { to: '/discover', label: 'Discover' },
  { to: '/leaderboard', label: 'Leaderboard' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? 'rgba(5,5,8,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center animate-pulse-glow">
              <FiZap className="text-white text-base" />
            </div>
            <span className="text-lg font-bold gradient-text">IgnitionX</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-purple-400 bg-purple-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {user?.role === 'creator' || user?.role === 'admin' ? (
                  <Link to="/campaigns/create">
                    <button className="btn-primary text-sm flex items-center gap-2 py-2 px-4">
                      <FiPlus /> Launch Campaign
                    </button>
                  </Link>
                ) : null}

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
                    className="w-9 h-9 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-white transition-colors relative"
                  >
                    <FiBell />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 rounded-full text-[10px] flex items-center justify-center text-white font-bold">3</span>
                  </button>
                  <AnimatePresence>
                    {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
                  </AnimatePresence>
                </div>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                    className="flex items-center gap-2 glass rounded-lg px-3 py-2 transition-all hover:border-purple-500/30"
                  >
                    {user?.avatar?.url ? (
                      <img src={user.avatar.url} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs text-white font-bold">
                        {user?.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm text-slate-300 font-medium max-w-24 truncate">{user?.name}</span>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 glass-strong rounded-xl shadow-2xl border border-white/10 overflow-hidden"
                      >
                        <div className="p-3 border-b border-white/5">
                          <p className="text-sm font-semibold text-white">{user?.name}</p>
                          <p className="text-xs text-slate-400">{user?.email}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-purple-400">Lv.{user?.level}</span>
                            <span className="text-xs text-slate-500">• {user?.xp} XP</span>
                          </div>
                        </div>
                        <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}>
                          <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 transition-colors">
                            <FiBarChart2 /> Dashboard
                          </div>
                        </Link>
                        <Link to="/profile" onClick={() => setUserMenuOpen(false)}>
                          <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 transition-colors">
                            <FiUser /> Profile
                          </div>
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                          <FiLogOut /> Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button className="btn-ghost text-sm py-2">Sign in</button>
                </Link>
                <Link to="/register">
                  <button className="btn-primary text-sm py-2 px-5">Get Started</button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden w-9 h-9 glass rounded-lg flex items-center justify-center text-slate-400"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden glass-strong rounded-2xl mb-3 overflow-hidden border border-white/8"
            >
              <div className="p-4 flex flex-col gap-2">
                {navLinks.map(({ to, label }) => (
                  <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">
                    {label}
                  </Link>
                ))}
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-lg text-slate-300 hover:bg-white/5 text-sm">Dashboard</Link>
                    <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="px-4 py-3 text-left rounded-lg text-red-400 hover:bg-red-500/10 text-sm">Sign out</button>
                  </>
                ) : (
                  <div className="flex gap-2 pt-2">
                    <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <button className="w-full btn-ghost text-sm">Sign in</button>
                    </Link>
                    <Link to="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <button className="w-full btn-primary text-sm">Get Started</button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
