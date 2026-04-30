const Comment = require('../models/Comment');
const Campaign = require('../models/Campaign');
const notificationService = require('../services/notification.service');
const { getIO } = require('../sockets/socket');

exports.getComments = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const comments = await Comment.find({
    campaign: req.params.id,
    parent: null,
    isDeleted: false,
  })
    .populate('author', 'name avatar role')
    .populate({
      path: 'replies',
      populate: { path: 'author', select: 'name avatar role' },
      match: { isDeleted: false },
    })
    .sort({ isPinned: -1, createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Comment.countDocuments({ campaign: req.params.id, parent: null, isDeleted: false });

  res.json({ success: true, comments, total });
};

exports.addComment = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id).select('creator title slug');
  if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

  const comment = await Comment.create({
    campaign: req.params.id,
    author: req.user._id,
    content: req.body.content,
    parent: req.body.parentId || null,
  });

  await comment.populate('author', 'name avatar role');

  // Notify campaign creator (if not self-comment)
  if (campaign.creator.toString() !== req.user._id.toString()) {
    await notificationService.create({
      recipient: campaign.creator,
      type: 'new_comment',
      title: '💬 New comment on your campaign',
      message: `${req.user.name} commented: "${req.body.content.slice(0, 80)}..."`,
      link: `/campaigns/${campaign.slug}#comments`,
    });
  }

  // Real-time broadcast
  getIO().to(`campaign:${req.params.id}`).emit('new_comment', comment);

  res.status(201).json({ success: true, comment });
};

exports.deleteComment = async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

  const campaign = await Campaign.findById(comment.campaign).select('creator');
  const canDelete =
    comment.author.toString() === req.user._id.toString() ||
    (campaign && campaign.creator.toString() === req.user._id.toString()) ||
    req.user.role === 'admin';

  if (!canDelete) return res.status(403).json({ success: false, message: 'Not authorized' });

  comment.isDeleted = true;
  comment.content = '[Comment removed]';
  await comment.save();

  getIO().to(`campaign:${comment.campaign}`).emit('comment_deleted', { commentId: comment._id });
  res.json({ success: true, message: 'Comment removed' });
};

exports.likeComment = async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

  const alreadyLiked = comment.likes.includes(req.user._id);
  if (alreadyLiked) {
    comment.likes.pull(req.user._id);
    comment.likesCount = Math.max(0, comment.likesCount - 1);
  } else {
    comment.likes.push(req.user._id);
    comment.likesCount += 1;
  }
  await comment.save();

  res.json({ success: true, likesCount: comment.likesCount, liked: !alreadyLiked });
};
