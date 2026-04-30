const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const notificationService = require('../services/notification.service');
const Notification = require('../models/Notification');

router.get('/', protect, async (req, res) => {
  const data = await notificationService.getForUser(req.user._id, req.query.page, req.query.limit);
  res.json({ success: true, ...data });
});

router.put('/read-all', protect, async (req, res) => {
  await notificationService.markAllRead(req.user._id);
  res.json({ success: true, message: 'All notifications marked as read' });
});

router.put('/:id/read', protect, async (req, res) => {
  const n = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  if (!n) return res.status(404).json({ success: false, message: 'Notification not found' });
  res.json({ success: true, notification: n });
});

router.delete('/:id', protect, async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
  res.json({ success: true, message: 'Notification removed' });
});

module.exports = router;
