const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Campaign = require('../models/Campaign');
const Contribution = require('../models/Contribution');
const User = require('../models/User');
const notificationService = require('../services/notification.service');
const emailService = require('../services/email.service');
const gamificationService = require('../services/gamification.service');
const { getIO } = require('../sockets/socket');

// @route   POST /api/payments/create-intent
exports.createPaymentIntent = async (req, res) => {
  const { campaignId, amount, rewardTierId, anonymous, message } = req.body;

  const campaign = await Campaign.findById(campaignId);
  if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
  if (campaign.status !== 'active') {
    return res.status(400).json({ success: false, message: 'This campaign is not accepting contributions' });
  }
  if (new Date() > campaign.endDate) {
    return res.status(400).json({ success: false, message: 'Campaign has ended' });
  }
  if (amount < 1) {
    return res.status(400).json({ success: false, message: 'Minimum contribution is $1' });
  }

  // Get or create Stripe customer
  let customerId = req.user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: req.user.email,
      name: req.user.name,
      metadata: { userId: req.user._id.toString() },
    });
    customerId = customer.id;
    await User.findByIdAndUpdate(req.user._id, { stripeCustomerId: customerId });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // cents
    currency: campaign.currency.toLowerCase(),
    customer: customerId,
    metadata: {
      campaignId: campaign._id.toString(),
      campaignTitle: campaign.title,
      backerId: req.user._id.toString(),
      rewardTierId: rewardTierId || '',
    },
    description: `Contribution to "${campaign.title}"`,
    receipt_email: req.user.email,
  });

  // Create pending contribution record
  await Contribution.create({
    campaign: campaignId,
    backer: req.user._id,
    amount,
    currency: campaign.currency,
    rewardTier: rewardTierId || undefined,
    anonymous: anonymous || false,
    message: message || '',
    stripePaymentIntentId: paymentIntent.id,
    status: 'pending',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });
};

// @route   POST /api/payments/webhook  (raw body)
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ success: false, message: `Webhook error: ${err.message}` });
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      const contribution = await Contribution.findOneAndUpdate(
        { stripePaymentIntentId: pi.id },
        { status: 'succeeded', stripeChargeId: pi.latest_charge },
        { new: true }
      );

      if (contribution) {
        // Update campaign totals
        const campaign = await Campaign.findByIdAndUpdate(
          contribution.campaign,
          {
            $inc: { currentAmount: contribution.amount, backersCount: 1 },
          },
          { new: true }
        );
        campaign.updateTrendingScore();
        await campaign.save();

        // Check if campaign reached goal
        if (campaign.currentAmount >= campaign.goalAmount && campaign.status === 'active') {
          campaign.status = 'funded';
          await campaign.save();

          // Notify creator
          await notificationService.create({
            recipient: campaign.creator,
            type: 'campaign_funded',
            title: '🎉 Your campaign is fully funded!',
            message: `"${campaign.title}" has reached its goal of $${campaign.goalAmount}!`,
            link: `/campaigns/${campaign.slug}`,
          });

          await emailService.sendCampaignFundedEmail(campaign);
        }

        // Update backer stats + gamification
        await User.findByIdAndUpdate(contribution.backer, {
          $inc: { totalBacked: contribution.amount, campaignsBacked: 1 },
        });
        await gamificationService.onContribution(contribution.backer, contribution.amount, campaign);

        // Notify creator of new backer
        await notificationService.create({
          recipient: campaign.creator,
          type: 'new_backer',
          title: '💰 New backer!',
          message: `Someone backed "${campaign.title}" with $${contribution.amount}`,
          link: `/dashboard/campaigns/${campaign._id}/backers`,
        });

        // Send confirmation email to backer
        const backer = await User.findById(contribution.backer);
        await emailService.sendContributionConfirmation(backer, campaign, contribution);

        // Real-time update
        getIO().to(`campaign:${campaign._id}`).emit('campaign_updated', {
          currentAmount: campaign.currentAmount,
          backersCount: campaign.backersCount,
          fundingPercentage: campaign.fundingPercentage,
        });
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      await Contribution.findOneAndUpdate(
        { stripePaymentIntentId: pi.id },
        { status: 'failed' }
      );
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object;
      const contribution = await Contribution.findOneAndUpdate(
        { stripeChargeId: charge.id },
        { status: 'refunded', refundedAt: new Date(), refundAmount: charge.amount_refunded / 100 },
        { new: true }
      );
      if (contribution) {
        await Campaign.findByIdAndUpdate(contribution.campaign, {
          $inc: { currentAmount: -contribution.amount, backersCount: -1 },
        });
        const backer = await User.findById(contribution.backer);
        await notificationService.create({
          recipient: backer._id,
          type: 'refund_issued',
          title: '💸 Refund issued',
          message: `Your $${contribution.amount} contribution has been refunded.`,
        });
        await emailService.sendRefundEmail(backer, contribution);
      }
      break;
    }
  }

  res.json({ received: true });
};

// @route   POST /api/payments/refund/:contributionId
exports.requestRefund = async (req, res) => {
  const contribution = await Contribution.findById(req.params.contributionId);
  if (!contribution) return res.status(404).json({ success: false, message: 'Contribution not found' });
  if (contribution.backer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  if (contribution.status !== 'succeeded') {
    return res.status(400).json({ success: false, message: 'Cannot refund this contribution' });
  }

  const campaign = await Campaign.findById(contribution.campaign);
  if (campaign?.status === 'funded' || campaign?.status === 'active') {
    // Check refund window (7 days)
    const daysSinceBacking = (Date.now() - contribution.createdAt) / (1000 * 60 * 60 * 24);
    if (daysSinceBacking > 7) {
      return res.status(400).json({ success: false, message: 'Refund window has passed (7 days)' });
    }
  }

  const refund = await stripe.refunds.create({
    payment_intent: contribution.stripePaymentIntentId,
    reason: req.body.reason || 'requested_by_customer',
  });

  res.json({ success: true, refund: { id: refund.id, status: refund.status } });
};

// @route   GET /api/payments/contributions
exports.getMyContributions = async (req, res) => {
  const contributions = await Contribution.find({
    backer: req.user._id,
    status: 'succeeded',
  })
    .populate('campaign', 'title slug coverImage endDate status goalAmount currentAmount')
    .sort({ createdAt: -1 });

  res.json({ success: true, contributions });
};
