import { useEffect, useState } from "react";
import axios from "axios";
import CampaignCard from "../components/CampaignCard";

export default function Home() {
  const [stats, setStats] = useState({
    campaigns: 0,
    raised: 0,
    backers: 0,
  });
  
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/campaigns/stats`
        );
        setStats(res.data.stats);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchCampaigns = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/campaigns`
        );
        const activeCampaigns = (res.data.campaigns || []).filter(c => c.status === 'active').slice(0, 4);
        setCampaigns(activeCampaigns.length > 0 ? activeCampaigns : (res.data.campaigns || []).slice(0, 4));
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
    fetchCampaigns();
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white px-6">

      {/* HERO */}
      <div className="max-w-6xl mx-auto pt-20 text-center">
        <h1 className="text-6xl font-bold tracking-tight leading-tight">
          Ignite Ideas. <br />
          <span className="text-white/80">Accelerate Dreams.</span>
        </h1>

        <p className="text-gray-400 mt-6 max-w-2xl mx-auto">
          The next-generation crowdfunding platform where bold ideas meet
          the community that believes in them.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <button className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition duration-300">
            Explore Campaigns
          </button>

          <button className="border border-white/20 px-6 py-3 rounded-xl hover:bg-white/10 transition duration-300">
            Start a Campaign
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto mb-24">

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition duration-300 hover:scale-[1.02]">
          <h2 className="text-3xl font-semibold">{stats.campaigns}+</h2>
          <p className="text-gray-400 mt-2">Campaigns</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition duration-300 hover:scale-[1.02]">
          <h2 className="text-3xl font-semibold">${stats.raised}</h2>
          <p className="text-gray-400 mt-2">Total Raised</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition duration-300 hover:scale-[1.02]">
          <h2 className="text-3xl font-semibold">{stats.backers}+</h2>
          <p className="text-gray-400 mt-2">Backers</p>
        </div>

      </div>

      {/* TRENDING CAMPAIGNS */}
      <div className="max-w-6xl mx-auto mb-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold text-white tracking-tight">Trending Campaigns</h2>
        </div>

        {campaigns.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
            <h3 className="text-xl font-medium text-white mb-2">No campaigns yet</h3>
            <p className="text-gray-400">Be the first to launch a campaign on IgnitionX.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign._id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>

      {/* TRUST LINE */}
      <div className="text-center mt-10 pb-10 text-gray-500 text-sm">
        Trusted by creators worldwide • Secure payments powered by Stripe
      </div>

    </div>
  );
}