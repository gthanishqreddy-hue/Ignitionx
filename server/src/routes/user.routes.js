const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User');
const Campaign = require('../models/Campaign');

// @route GET /api/users/profile/:id
router.get('/profile/:id', async (req, res) => {
  const user = await User.findById(req.params.id).select(
    'name avatar bio website socialLinks role xp level badges streaks campaignsCreated campaignsBacked totalRaised createdAt'
  );
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const campaigns = await Campaign.find({ creator: req.params.id, status: { $ne: 'draft' } })
    .select('title slug coverImage goalAmount currentAmount status backersCount endDate category')
    .sort({ createdAt: -1 })
    .limit(6);

  res.json({ success: true, user, campaigns });
});

// @route PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  const allowed = ['name', 'bio', 'website', 'socialLinks', 'notificationPreferences', 'avatar'];
  const updates = {};
  allowed.forEach((field) => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, user });
});

// @route PUT /api/users/change-password
router.put('/change-password', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  const { currentPassword, newPassword } = req.body;

  if (!(await user.comparePassword(currentPassword))) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
});

// @route GET /api/users/leaderboard
router.get('/leaderboard', async (req, res) => {
  const topBackers = await User.find({ role: { $in: ['backer', 'creator'] } })
    .select('name avatar xp level badges totalBacked campaignsBacked')
    .sort({ xp: -1 })
    .limit(20);

  res.json({ success: true, leaderboard: topBackers });
});

module.exports = router;
