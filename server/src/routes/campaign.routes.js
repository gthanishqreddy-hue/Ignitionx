const express = require('express');
const router = express.Router();
const campaign = require('../controllers/campaign.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth.middleware');

router.get('/', optionalAuth, campaign.getCampaigns);
router.get('/:slug', optionalAuth, campaign.getCampaignBySlug);

router.post('/', protect, authorize('creator', 'admin'), campaign.createCampaign);
router.put('/:id', protect, campaign.updateCampaign);
router.delete('/:id', protect, campaign.deleteCampaign);

router.post('/:id/milestone', protect, campaign.addMilestoneUpdate);
router.get('/:id/analytics', protect, campaign.getCampaignAnalytics);
router.post('/:id/share', optionalAuth, campaign.trackShare);

// AI Booster
const aiCtrl = require('../controllers/ai.controller');
router.post('/:id/ai-boost', protect, aiCtrl.boostCampaign);

// Comments
const commentCtrl = require('../controllers/comment.controller');
router.get('/:id/comments', commentCtrl.getComments);
router.post('/:id/comments', protect, commentCtrl.addComment);
router.delete('/:id/comments/:commentId', protect, commentCtrl.deleteComment);
router.post('/:id/comments/:commentId/like', protect, commentCtrl.likeComment);


// ✅ ADD HERE (before export)
router.get('/stats', async (req, res) => {
    const Campaign = require('../models/Campaign');

    const totalCampaigns = await Campaign.countDocuments();

    const totalRaisedData = await Campaign.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: '$currentAmount' }
            }
        }
    ]);

    const totalRaised = totalRaisedData[0]?.total || 0;

    res.json({
        success: true,
        stats: {
            campaigns: totalCampaigns,
            raised: totalRaised,
            backers: totalCampaigns * 5
        }
    });
});


module.exports = router;