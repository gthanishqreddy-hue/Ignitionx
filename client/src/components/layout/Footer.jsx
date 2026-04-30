import { Link } from 'react-router-dom';
import { FiZap, FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-20 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <FiZap className="text-white text-base" />
              </div>
              <span className="text-lg font-bold gradient-text">IgnitionX</span>
            </div>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
              The next-generation crowdfunding platform built for bold ideas and the communities that believe in them.
            </p>
            <div className="flex gap-4 mt-5">
              {[FiGithub, FiTwitter, FiLinkedin].map((Icon, i) => (
                <button key={i} className="w-8 h-8 glass rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                  <Icon className="text-sm" />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: 'Platform', links: [
                { to: '/discover', label: 'Discover' },
                { to: '/leaderboard', label: 'Leaderboard' },
                { to: '/register', label: 'Start a Campaign' },
              ],
            },
            {
              title: 'Account', links: [
                { to: '/login', label: 'Sign In' },
                { to: '/register', label: 'Create Account' },
                { to: '/dashboard', label: 'Dashboard' },
              ],
            },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="text-sm text-slate-400 hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} IgnitionX. Built by Thanishq Reddy, Abhiram Reddy, Shivakaran Reddy, Chirag & Jai Sai Karthik.</p>
          <div className="flex gap-4">
            {['Privacy', 'Terms', 'Support'].map((label) => (
              <Link key={label} to="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
