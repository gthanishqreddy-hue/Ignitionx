import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements, CardElement, useStripe, useElements,
} from '@stripe/react-stripe-js';
import { FiLock, FiArrowLeft, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../lib/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const CARD_STYLE = {
  style: {
    base: {
      color: '#e2e8f0',
      fontFamily: 'Inter, sans-serif',
      fontSize: '15px',
      '::placeholder': { color: '#475569' },
      iconColor: '#7c3aed',
    },
    invalid: { color: '#ef4444', iconColor: '#ef4444' },
  },
  hidePostalCode: true,
};

function CheckoutForm({ campaign, amount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);

    try {
      // Create payment intent
      const { data } = await api.post('/payments/create-intent', {
        campaignId: campaign._id,
        amount: Number(amount),
        anonymous,
        message,
      });

      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (error) {
        toast.error(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Card field */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 block">
          Card Details
        </label>
        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus-within:border-purple-500/70 transition-colors">
          <CardElement options={CARD_STYLE} />
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 block">
          Message to creator (optional)
        </label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)}
          rows={2} maxLength={500}
          placeholder="Show your support..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/70 transition-colors resize-none"
        />
      </div>

      {/* Anonymous */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <div
          onClick={() => setAnonymous(!anonymous)}
          className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
            anonymous ? 'gradient-primary border-transparent' : 'border-white/20 bg-white/5'
          }`}
        >
          {anonymous && <FiCheck className="text-white text-xs" />}
        </div>
        <span className="text-sm text-slate-300">Back anonymously</span>
      </label>

      <button type="submit" disabled={!stripe || processing}
        className="w-full btn-primary py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2 animate-pulse-glow">
        {processing ? (
          <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
        ) : (
          <><FiLock /> Confirm ${Number(amount).toLocaleString()} Payment</>
        )}
      </button>

      <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1">
        <FiLock className="text-green-400" />
        Secured by Stripe. Your card details are never stored.
      </p>
    </form>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const amount = searchParams.get('amount') || '25';
  const campaignId = window.location.pathname.split('/').pop();

  const [campaign, setCampaign] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get(`/campaigns`).then(({ data }) => {
      // Find from URL param
      const found = data.campaigns?.find((c) => c._id === campaignId);
      setCampaign(found);
    }).catch(() => navigate('/discover'));
  }, [campaignId]);

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-6 animate-pulse-glow" style={{ '--tw-shadow-color': '#10b981' }}>
            <FiCheck className="text-green-400 text-3xl" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Payment Successful! 🎉</h1>
          <p className="text-slate-400 mb-2">You backed <strong className="text-white">{campaign?.title}</strong> with <strong className="text-purple-400">${amount}</strong>.</p>
          <p className="text-slate-400 mb-8">A confirmation email is on its way to you.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/dashboard')} className="btn-primary px-6 py-3">
              View Dashboard
            </button>
            <button onClick={() => navigate('/discover')} className="btn-ghost px-6 py-3">
              Discover More
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout — IgnitionX</title>
      </Helmet>
      <div className="min-h-screen pt-24 px-4 pb-20 max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors">
          <FiArrowLeft /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-black text-white mb-2">Complete Your Contribution</h1>
          <p className="text-slate-400 text-sm mb-8">Your payment is secured by Stripe.</p>

          {/* Summary */}
          {campaign && (
            <div className="glass rounded-2xl p-5 border border-white/8 mb-6">
              <div className="flex items-center gap-4">
                {campaign.coverImage?.url && (
                  <img src={campaign.coverImage.url} alt={campaign.title}
                    className="w-16 h-16 rounded-xl object-cover" />
                )}
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">You're backing</p>
                  <p className="text-sm font-bold text-white">{campaign.title}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-slate-400">Amount</p>
                  <p className="text-2xl font-black gradient-text">${amount}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stripe form */}
          <div className="glass rounded-2xl p-6 border border-white/8">
            <Elements stripe={stripePromise}>
              <CheckoutForm
                campaign={campaign || { _id: campaignId }}
                amount={amount}
                onSuccess={() => setSuccess(true)}
              />
            </Elements>
          </div>
        </motion.div>
      </div>
    </>
  );
}
