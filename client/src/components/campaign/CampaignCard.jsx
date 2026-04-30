import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiClock, FiUsers, FiZap } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

function ProgressBar({ percentage }) {
  return (
    <div className="progress-bar">
      <motion.div
        className="progress-fill"
        initial={{ width: 0 }}
        whileInView={{ width: `${Math.min(percentage, 100)}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

export default function CampaignCard({ campaign, index = 0 }) {
  const {
    title, slug, tagline, coverImage, goalAmount, currentAmount,
    fundingPercentage, backersCount, endDate, category, creator,
    isFeatured, isEditorsPick, status,
  } = campaign;

  const daysLeft = Math.max(
    Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24)),
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link to={`/campaigns/${slug}`}>
        <div className="glass rounded-2xl overflow-hidden hover-lift card-shine group cursor-pointer h-full flex flex-col">
          {/* Cover image */}
          <div className="relative overflow-hidden" style={{ paddingTop: '56.25%' }}>
            {coverImage?.url ? (
              <img
                src={coverImage.url}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 gradient-primary opacity-60 flex items-center justify-center">
                <FiZap className="text-white text-4xl opacity-50" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {isFeatured && (
                <span className="glass text-xs text-purple-300 px-2 py-1 rounded-full border border-purple-500/30 font-medium">
                  ⭐ Featured
                </span>
              )}
              {isEditorsPick && (
                <span className="glass text-xs text-cyan-300 px-2 py-1 rounded-full border border-cyan-500/30 font-medium">
                  🏆 Editor's Pick
                </span>
              )}
              {status === 'funded' && (
                <span className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full border border-green-500/30 font-medium">
                  ✅ Funded
                </span>
              )}
            </div>

            {/* Category */}
            <div className="absolute bottom-3 right-3">
              <span className="glass text-xs text-slate-300 px-3 py-1 rounded-full">
                {category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            {/* Creator */}
            {creator && (
              <div className="flex items-center gap-2 mb-3">
                {creator.avatar?.url ? (
                  <img src={creator.avatar.url} alt={creator.name} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-[10px] text-white font-bold">
                    {creator.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-xs text-slate-400">{creator.name}</span>
              </div>
            )}

            <h3 className="text-base font-bold text-white mb-1 line-clamp-2 group-hover:text-purple-300 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1">{tagline}</p>

            {/* Progress */}
            <div className="space-y-2 mb-4">
              <ProgressBar percentage={parseFloat(fundingPercentage)} />
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-purple-400">
                  {parseFloat(fundingPercentage).toFixed(0)}% funded
                </span>
                <span className="text-sm font-semibold text-white">
                  ${currentAmount?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/5">
              <div className="flex items-center gap-1">
                <FiUsers className="text-slate-500" />
                <span>{backersCount?.toLocaleString()} backers</span>
              </div>
              <div className="flex items-center gap-1">
                <FiClock className="text-slate-500" />
                <span>{daysLeft > 0 ? `${daysLeft}d left` : 'Ended'}</span>
              </div>
              <div className="text-slate-500">
                Goal: ${goalAmount?.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
