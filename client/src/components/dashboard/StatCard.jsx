export default function StatCard({ title, value }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition duration-300 hover:scale-[1.02] shadow-lg shadow-black/20 backdrop-blur-sm relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <h3 className="text-sm font-medium text-gray-400 mb-2 relative z-10">{title}</h3>
      <p className="text-3xl font-bold text-white tracking-tight relative z-10">{value}</p>
    </div>
  );
}
