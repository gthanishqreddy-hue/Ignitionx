import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import CategoryChart from '../components/dashboard/CategoryChart';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [campaigns, setCampaigns] = useState([]);
  const [report, setReport] = useState({
    totalCampaigns: 0,
    totalRaised: 0,
    totalBackers: 0
  });

  useEffect(() => {
    api.get('/campaigns')
      .then((res) => {
        const allCampaigns = res.data.campaigns || [];
        const myCampaigns = allCampaigns.filter(
          (c) => c.creator?._id === user?._id || c.creator === user?._id
        );
        setCampaigns(myCampaigns);
        
        const totalRaised = myCampaigns.reduce((sum, c) => sum + (c.currentAmount || 0), 0);
        const totalBackers = myCampaigns.reduce((sum, c) => sum + (c.backersCount || 0), 0);
        
        setReport({
          totalCampaigns: myCampaigns.length,
          totalRaised,
          totalBackers
        });
      })
      .catch((err) => console.error(err));
  }, [user]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0b0f19] text-white flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col h-full bg-[#0b0f19] overflow-y-auto">
        <Topbar user={user} />
        
        <main className="flex-1 p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard title="Total Campaigns" value={report.totalCampaigns} />
              <StatCard title="Total Raised" value={`$${report.totalRaised.toLocaleString()}`} />
              <StatCard title="Backers" value={report.totalBackers.toLocaleString()} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <RevenueChart />
              </div>
              <div className="lg:col-span-1">
                <CategoryChart />
              </div>
            </div>

            {/* Campaigns Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                <h2 className="text-lg font-semibold">Your Campaigns</h2>
                <Link 
                  to="/campaigns/create" 
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-medium rounded-lg transition duration-300"
                >
                  Create New
                </Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-gray-400 text-sm border-b border-white/10">
                      <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Title</th>
                      <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Status</th>
                      <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Raised</th>
                      <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Goal</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {campaigns.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-16 text-center text-gray-400">
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-4xl mb-4">✨</span>
                            <p className="text-base font-medium text-white mb-1">No campaigns yet</p>
                            <p className="text-sm">Start your first campaign and bring your idea to life.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      campaigns.map((c) => (
                        <tr key={c._id} className="border-b border-white/5 hover:bg-white/5 transition duration-300 group">
                          <td className="px-6 py-5">
                            <Link to={`/campaigns/${c.slug}`} className="font-medium text-white group-hover:text-gray-300 transition">
                              {c.title}
                            </Link>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                              c.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                              c.status === 'funded' ? 'bg-white/10 text-white border border-white/20' :
                              'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                            }`}>
                              {c.status || 'draft'}
                            </span>
                          </td>
                          <td className="px-6 py-5 font-medium">${(c.currentAmount || 0).toLocaleString()}</td>
                          <td className="px-6 py-5 text-gray-400">${(c.goalAmount || 1).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
