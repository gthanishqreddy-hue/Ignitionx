import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [stats, setStats] = useState({
    campaigns: 0,
    raised: 0,
    backers: 0,
  });

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

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white px-6">

      {/* HERO */}
      <div className="max-w-6xl mx-auto pt-20 text-center">
        <h1 className="text-6xl font-bold tracking-tight leading-tight">
          Ignite Ideas. <br />
          <span className="text-purple-500">Accelerate Dreams.</span>
        </h1>

        <p className="text-gray-400 mt-6 max-w-2xl mx-auto">
          The next-generation crowdfunding platform where bold ideas meet
          the community that believes in them.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <button className="bg-purple-600 px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition">
            Explore Campaigns
          </button>

          <button className="border border-white/20 px-6 py-3 rounded-xl hover:bg-white/10 transition">
            Start a Campaign
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto">

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center">
          <h2 className="text-3xl font-semibold">{stats.campaigns}+</h2>
          <p className="text-gray-400 mt-2">Campaigns</p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center">
          <h2 className="text-3xl font-semibold">${stats.raised}</h2>
          <p className="text-gray-400 mt-2">Total Raised</p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center">
          <h2 className="text-3xl font-semibold">{stats.backers}+</h2>
          <p className="text-gray-400 mt-2">Backers</p>
        </div>

      </div>

      {/* TRUST LINE */}
      <div className="text-center mt-10 text-gray-500 text-sm">
        Trusted by creators worldwide • Secure payments powered by Stripe
      </div>

    </div>
  );
}