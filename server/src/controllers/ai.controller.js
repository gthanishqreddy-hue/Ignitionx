const Campaign = require('../models/Campaign');

// @route   POST /api/campaigns/:id/ai-boost
// @desc    Analyze campaign and generate AI suggestions
exports.boostCampaign = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) {
    return res.status(404).json({ success: false, message: 'Campaign not found' });
  }

  if (campaign.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  // Mock AI analysis logic
  const suggestions = [];
  let score = 50;

  if (campaign.title.length < 20) {
    suggestions.push('Make your title more descriptive to capture attention instantly.');
  } else {
    score += 10;
  }

  if (campaign.description.length < 500) {
    suggestions.push('Expand your story. Backers want to know the deep "why" behind your project.');
  } else {
    score += 15;
  }

  if (!campaign.videoPitch || !campaign.videoPitch.url) {
    suggestions.push('Campaigns with a video pitch raise 105% more on average. Add a cinematic video.');
  } else {
    score += 15;
  }

  if (campaign.rewardTiers.length < 3) {
    suggestions.push('Offer at least 3 reward tiers (e.g., $10, $50, $100) to cater to different backer levels.');
  } else {
    score += 10;
  }

  if (campaign.goalAmount > 50000 && campaign.milestones.length === 0) {
    suggestions.push('High-goal campaigns perform better with milestones. Break down your $50k+ goal.');
  }

  // Update campaign
  campaign.aiBoostScore = score;
  campaign.aiSuggestions = suggestions;
  await campaign.save();

  res.json({
    success: true,
    aiBoostScore: score,
    aiSuggestions: suggestions,
  });
};
