import { Link } from 'react-router-dom';

export default function CampaignCard({ campaign }) {
  const { title, slug, tagline, coverImage, category, currentAmount = 0, goalAmount = 1 } = campaign;
  const progress = Math.min((currentAmount / goalAmount) * 100, 100);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col backdrop-blur-md h-full group transition-all duration-300 ease-out hover:scale-[1.02] hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/10">

      {/* Image */}
      <div className="relative h-48 bg-white/5 overflow-hidden">
        {coverImage?.url ? (
          <img
            src={coverImage.url}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center">
            <span className="text-white/20 text-sm font-medium tracking-wide">No Image</span>
          </div>
        )}
        {/* Overlay gradient — always visible, deepens on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Category badge */}
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-white/80">{category || 'General'}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-base font-semibold text-white leading-tight tracking-tight line-clamp-1 mb-1.5 group-hover:text-gray-200 transition-colors duration-200">
          {title}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2 mb-5 flex-grow leading-relaxed">
          {tagline}
        </p>

        {/* Progress */}
        <div className="mb-5">
          <div className="flex justify-between items-baseline text-xs mb-2">
            <span className="font-semibold text-white">{progress.toFixed(0)}% funded</span>
            <span className="text-gray-400 font-medium tabular-nums">${currentAmount.toLocaleString()}</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* CTA Button */}
        <Link
          to={`/campaigns/${slug}`}
          className="w-full block text-center py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-sm font-medium text-white/90 transition-all duration-300 ease-out hover:translate-y-[-1px] active:scale-[0.98] active:translate-y-0"
        >
          View Campaign
        </Link>
      </div>
    </div>
  );
}
