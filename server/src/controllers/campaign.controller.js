const Campaign = require('../models/Campaign');
const Contribution = require('../models/Contribution');
const notificationService = require('../services/notification.service');
const { getIO } = require('../sockets/socket');

// @route   GET /api/campaigns
exports.getCampaigns = async (req, res) => {
  const {
    category, status = 'active', search, sort = 'trending',
    page = 1, limit = 12, featured, minGoal, maxGoal,
  } = req.query;

  const query = { status };
  if (category) query.category = category;
  if (featured === 'true') query.isFeatured = true;
  if (search) query.$text = { $search: search };
  if (minGoal || maxGoal) {
    query.goalAmount = {};
    if (minGoal) query.goalAmount.$gte = Number(minGoal);
    if (maxGoal) query.goalAmount.$lte = Number(maxGoal);
  }

  const sortOptions = {
    trending: { trendingScore: -1 },
    newest: { createdAt: -1 },
    'most-funded': { currentAmount: -1 },
    'ending-soon': { endDate: 1 },
    'most-backed': { backersCount: -1 },
  };

  const skip = (Number(page) - 1) * Number(limit);
  const [campaigns, total] = await Promise.all([
    Campaign.find(query)
      .populate('creator', 'name avatar')
      .sort(sortOptions[sort] || sortOptions.trending)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Campaign.countDocuments(query),
  ]);

  res.json({
    success: true,
    campaigns,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      limit: Number(limit),
    },
  });
};

// @route   GET /api/campaigns/:slug
exports.getCampaignBySlug = async (req, res) => {
  const campaign = await Campaign.findOne({ slug: req.params.slug })
    .populate('creator', 'name avatar bio website socialLinks campaignsCreated')
    .lean();

  if (!campaign) {
    return res.status(404).json({ success: false, message: 'Campaign not found' });
  }

  // Increment view count async
  Campaign.findByIdAndUpdate(campaign._id, { $inc: { views: 1 } }).exec();

  res.json({ success: true, campaign });
};

// @route   POST /api/campaigns
exports.createCampaign = async (req, res) => {
  const campaign = await Campaign.create({ ...req.body, creator: req.user._id });

  req.user.campaignsCreated += 1;
  await req.user.save({ validateBeforeSave: false });

  res.status(201).json({ success: true, campaign });
};

// @route   PUT /api/campaigns/:id
exports.updateCampaign = async (req, res) => {
  let campaign = await Campaign.findById(req.params.id);
  if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

  if (campaign.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  if (campaign.status === 'active' && req.body.status === 'active') {
    // restrict fields that can be changed once live
    const { title, description, coverImage, images, videoPitch, milestones } = req.body;
    Object.assign(campaign, { title, description, coverImage, images, videoPitch, milestones });
  } else {
    Object.assign(campaign, req.body);
  }

  await campaign.save();
  res.json({ success: true, campaign });
};

// @route   DELETE /api/campaigns/:id
exports.deleteCampaign = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

  if (campaign.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  if (campaign.status === 'active' && campaign.currentAmount > 0) {
    return res.status(400).json({ success: false, message: 'Cannot delete a campaign with contributions. Cancel it instead.' });
  }

  await campaign.deleteOne();
  res.json({ success: true, message: 'Campaign removed' });
};

// @route   POST /api/campaigns/:id/milestone
exports.addMilestoneUpdate = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

  if (campaign.creator.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Only the creator can post updates' });
  }

  const { milestoneId, update } = req.body;
  const milestone = campaign.milestones.id(milestoneId);
  if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

  milestone.update = update;
  milestone.isCompleted = true;
  milestone.completedAt = new Date();
  await campaign.save();

  // Notify all backers
  const contributions = await Contribution.find({ campaign: campaign._id, status: 'succeeded' }).distinct('backer');
  await notificationService.createBulk(contributions.map((uid) => ({
    recipient: uid,
    type: 'milestone_reached',
    title: `🎯 Milestone Reached: ${campaign.title}`,
    message: `"${milestone.title}" has been completed!`,
    link: `/campaigns/${campaign.slug}`,
  })));

  // Real-time emit
  getIO().to(`campaign:${campaign._id}`).emit('milestone_reached', { milestoneId, update });

  res.json({ success: true, campaign });
};

// @route   GET /api/campaigns/:id/analytics
exports.getCampaignAnalytics = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

  if (campaign.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const contributions = await Contribution.find({
    campaign: req.params.id,
    status: 'succeeded',
  }).sort({ createdAt: 1 });

  // Group by day
  const dailyFunding = {};
  contributions.forEach((c) => {
    const day = c.createdAt.toISOString().split('T')[0];
    dailyFunding[day] = (dailyFunding[day] || 0) + c.amount;
  });

  const avgContribution = contributions.length
    ? (contributions.reduce((a, c) => a + c.amount, 0) / contributions.length).toFixed(2)
    : 0;

  res.json({
    success: true,
    analytics: {
      totalRaised: campaign.currentAmount,
      goalAmount: campaign.goalAmount,
      fundingPercentage: campaign.fundingPercentage,
      backersCount: campaign.backersCount,
      views: campaign.views,
      shares: campaign.shares,
      avgContribution,
      daysRemaining: campaign.daysRemaining,
      dailyFunding: Object.entries(dailyFunding).map(([date, amount]) => ({ date, amount })),
    },
  });
};

// @route   POST /api/campaigns/:id/share
exports.trackShare = async (req, res) => {
  await Campaign.findByIdAndUpdate(req.params.id, { $inc: { shares: 1 } });
  res.json({ success: true });
};
