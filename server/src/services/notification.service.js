const Notification = require('../models/Notification');
const { getIO } = require('../sockets/socket');

exports.create = async (data) => {
  const notification = await Notification.create(data);
  // Real-time push via socket
  getIO().to(`user:${data.recipient}`).emit('new_notification', notification);
  return notification;
};

exports.createBulk = async (notifications) => {
  const created = await Notification.insertMany(notifications);
  created.forEach((n) => {
    getIO().to(`user:${n.recipient}`).emit('new_notification', n);
  });
  return created;
};

exports.getForUser = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ recipient: userId }),
    Notification.countDocuments({ recipient: userId, isRead: false }),
  ]);
  return { notifications, total, unreadCount };
};

exports.markAllRead = async (userId) => {
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};
