const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const Campaign = require('../models/Campaign');
const Contribution = require('../models/Contribution');
const User = require('../models/User');

// @route GET /api/reports/platform  (admin)
router.get('/platform', protect, authorize('admin'), async (req, res) => {
  const [totalCampaigns, totalUsers, totalContributions, fundedCampaigns] = await Promise.all([
    Campaign.countDocuments(),
    User.countDocuments(),
    Contribution.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Campaign.countDocuments({ status: 'funded' }),
  ]);

  const topCategories = await Campaign.aggregate([
    { $match: { status: { $in: ['active', 'funded'] } } },
    { $group: { _id: '$category', count: { $sum: 1 }, totalRaised: { $sum: '$currentAmount' } } },
    { $sort: { totalRaised: -1 } },
    { $limit: 10 },
  ]);

  const monthlyFunding = await Contribution.aggregate([
    { $match: { status: 'succeeded' } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);

  res.json({
    success: true,
    report: {
      overview: {
        totalCampaigns,
        totalUsers,
        totalRaised: totalContributions[0]?.total || 0,
        totalContributions: totalContributions[0]?.count || 0,
        fundedCampaigns,
        successRate: totalCampaigns ? ((fundedCampaigns / totalCampaigns) * 100).toFixed(1) : 0,
      },
      topCategories,
      monthlyFunding,
    },
  });
});

// @route GET /api/reports/creator  (creator dashboard)
router.get('/creator', protect, authorize('creator', 'admin'), async (req, res) => {
  const campaigns = await Campaign.find({ creator: req.user._id });
  const campaignIds = campaigns.map((c) => c._id);

  const contributions = await Contribution.find({
    campaign: { $in: campaignIds },
    status: 'succeeded',
  })
    .populate('campaign', 'title slug')
    .sort({ createdAt: -1 });

  const totalRaised = contributions.reduce((acc, c) => acc + c.amount, 0);

  const byCampaign = {};
  contributions.forEach((c) => {
    const key = c.campaign._id.toString();
    if (!byCampaign[key]) {
      byCampaign[key] = { title: c.campaign.title, slug: c.campaign.slug, total: 0, backers: 0 };
    }
    byCampaign[key].total += c.amount;
    byCampaign[key].backers += 1;
  });

  res.json({
    success: true,
    report: {
      totalCampaigns: campaigns.length,
      totalRaised,
      totalBackers: contributions.length,
      campaigns: Object.values(byCampaign),
      recentContributions: contributions.slice(0, 10),
    },
  });
});

// @route GET /api/reports/campaign/:id  (JSP-style data for PDF)
router.get('/campaign/:id', protect, async (req, res) => {
  const campaign = await Campaign.findById(req.params.id).populate('creator', 'name email');
  if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

  if (campaign.creator._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const contributions = await Contribution.find({
    campaign: req.params.id,
    status: 'succeeded',
  }).populate('backer', 'name email');

  res.json({
    success: true,
    report: {
      campaign: {
        title: campaign.title,
        creator: campaign.creator.name,
        goalAmount: campaign.goalAmount,
        currentAmount: campaign.currentAmount,
        fundingPercentage: campaign.fundingPercentage,
        backersCount: campaign.backersCount,
        status: campaign.status,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        category: campaign.category,
      },
      contributions: contributions.map((c) => ({
        backer: c.anonymous ? 'Anonymous' : c.backer?.name,
        amount: c.amount,
        date: c.createdAt,
        status: c.status,
      })),
      generatedAt: new Date().toISOString(),
    },
  });
});

// @route GET /api/reports/campaign/:id/download-jsp  (Actual JSP file generation)
router.get('/campaign/:id/download-jsp', protect, async (req, res) => {
  const campaign = await Campaign.findById(req.params.id).populate('creator', 'name email');
  if (!campaign) return res.status(404).send('Campaign not found');

  if (campaign.creator._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).send('Not authorized');
  }

  const contributions = await Contribution.find({
    campaign: req.params.id,
    status: 'succeeded',
  }).populate('backer', 'name email');

  // Generating a raw text file formatted as JSP (JavaServer Pages) or simple report
  let jspContent = `<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Campaign Report - ${campaign.title}</title>
<style>
  body { font-family: Arial, sans-serif; padding: 20px; }
  .header { border-bottom: 2px solid #7c3aed; padding-bottom: 10px; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  th { background-color: #f2f2f2; }
</style>
</head>
<body>
  <div class="header">
    <h1>IgnitionX Campaign Report</h1>
    <h2>${campaign.title}</h2>
  </div>
  <p><strong>Creator:</strong> ${campaign.creator.name}</p>
  <p><strong>Goal:</strong> $${campaign.goalAmount}</p>
  <p><strong>Raised:</strong> $${campaign.currentAmount} (${campaign.fundingPercentage}%)</p>
  <p><strong>Backers:</strong> ${campaign.backersCount}</p>
  <p><strong>Status:</strong> ${campaign.status}</p>
  <p><strong>Report Generated:</strong> ${new Date().toISOString()}</p>
  
  <h3>Contributions List</h3>
  <table>
    <tr>
      <th>Backer</th>
      <th>Amount</th>
      <th>Date</th>
    </tr>`;

  contributions.forEach(c => {
    const backerName = c.anonymous ? 'Anonymous' : (c.backer ? c.backer.name : 'Unknown');
    jspContent += `
    <tr>
      <td>${backerName}</td>
      <td>$${c.amount}</td>
      <td>${c.createdAt.toISOString().split('T')[0]}</td>
    </tr>`;
  });

  jspContent += `
  </table>
</body>
</html>`;

  res.setHeader('Content-disposition', `attachment; filename=report-${campaign.slug}.jsp`);
  res.setHeader('Content-type', 'text/plain');
  res.send(jspContent);
});

module.exports = router;
