const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Contribution = require('../models/Contribution');
const Campaign = require('../models/Campaign');

router.get('/', protect, async (req, res) => {
  const { campaignId, page = 1, limit = 20 } = req.query;
  const query = { backer: req.user._id, status: 'succeeded' };
  if (campaignId) query.campaign = campaignId;

  const contributions = await Contribution.find(query)
    .populate('campaign', 'title slug coverImage goalAmount currentAmount status endDate')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Contribution.countDocuments(query);
  res.json({ success: true, contributions, total });
});

router.get('/campaign/:campaignId', async (req, res) => {
  const campaign = await Campaign.findById(req.params.campaignId);
  if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

  const contributions = await Contribution.find({
    campaign: req.params.campaignId,
    status: 'succeeded',
  })
    .populate('backer', 'name avatar')
    .sort({ amount: -1 })
    .limit(50);

  const visible = contributions.map((c) => ({
    _id: c._id,
    amount: c.amount,
    message: c.message,
    createdAt: c.createdAt,
    backer: c.anonymous ? null : c.backer,
  }));

  res.json({ success: true, contributions: visible });
});

module.exports = router;
