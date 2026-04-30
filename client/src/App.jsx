import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { Suspense, lazy } from 'react';

import Layout from './components/layout/Layout';
import LoadingScreen from './components/ui/LoadingScreen';
import ProtectedRoute from './components/layout/ProtectedRoute';
import './index.css';

const Home = lazy(() => import('./pages/Home'));
const Discover = lazy(() => import('./pages/Discover'));
const CampaignDetail = lazy(() => import('./pages/CampaignDetail'));
const CreateCampaign = lazy(() => import('./pages/CreateCampaign'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Checkout = lazy(() => import('./pages/Checkout'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="discover" element={<Discover />} />
              <Route path="campaigns/:slug" element={<CampaignDetail />} />
              <Route path="leaderboard" element={<Leaderboard />} />

              {/* Auth */}
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />

              {/* Protected */}
              <Route element={<ProtectedRoute />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="campaigns/create" element={<CreateCampaign />} />
                <Route path="checkout/:campaignId" element={<Checkout />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(13, 13, 26, 0.95)',
              color: '#e2e8f0',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              padding: '14px 18px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#7c3aed', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
