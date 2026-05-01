import { Link } from 'react-router-dom';

export default function CampaignCard({ campaign }) {
  const { title, slug, tagline, coverImage, category, currentAmount = 0, goalAmount = 1 } = campaign;
  const progress = Math.min((currentAmount / goalAmount) * 100, 100);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col backdrop-blur-md h-full group transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:shadow-xl">
      {/* Image */}
      <div className="relative h-48 bg-white/5">
        {coverImage?.url ? (
          <img src={coverImage.url} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center">
            <span className="text-white/30 font-bold">No Image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-white">{category || 'General'}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow relative">
        <h3 className="text-lg font-semibold text-white line-clamp-1 mb-2 group-hover:text-gray-300 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2 mb-6 flex-grow leading-relaxed">
          {tagline}
        </p>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-3">
            <span className="font-semibold text-white">{progress.toFixed(0)}% funded</span>
            <span className="text-white font-medium">${currentAmount.toLocaleString()}</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white/80 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Button */}
        <Link 
          to={`/campaigns/${slug}`}
          className="w-full block text-center py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
        >
          View Campaign
        </Link>
      </div>
    </div>
  );
}
