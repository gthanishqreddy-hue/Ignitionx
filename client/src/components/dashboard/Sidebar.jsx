import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiPlusSquare, FiUser } from 'react-icons/fi';

export default function Sidebar() {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: FiHome },
    { name: 'Create Campaign', path: '/campaigns/create', icon: FiPlusSquare },
    { name: 'Profile', path: '/profile', icon: FiUser },
  ];

  return (
    <aside className="w-64 h-full bg-black/40 border-r border-white/10 backdrop-blur-xl hidden md:flex flex-col absolute left-0 top-0 bottom-0 z-10">
      <div className="p-6 border-b border-white/10">
        <Link to="/" className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-black tracking-tighter text-sm">IX</span>
          IgnitionX
        </Link>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-2">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition duration-300 ${
                isActive 
                  ? 'bg-white/10 text-white font-medium border border-white/5' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <link.icon className="text-lg opacity-80" />
              {link.name}
            </Link>
          );
        })}
      </div>

      <div className="p-6 border-t border-white/10">
        <div className="text-xs text-gray-500 font-medium">
          © 2026 IgnitionX
        </div>
      </div>
    </aside>
  );
}
