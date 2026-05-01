export default function Topbar({ user }) {
  return (
    <header className="h-20 border-b border-white/10 bg-[#0b0f19]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-20">
      <h1 className="text-xl font-semibold text-white tracking-tight">Dashboard</h1>
      
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
          <p className="text-xs text-gray-400">{user?.email || ''}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold overflow-hidden">
          {user?.avatar?.url ? (
            <img src={user.avatar.url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            user?.name?.[0]?.toUpperCase() || 'U'
          )}
        </div>
      </div>
    </header>
  );
}
