const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

let io;

exports.initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [process.env.CLIENT_URL, 'http://localhost:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // Auth middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} | User: ${socket.userId}`);

    // Join personal room
    socket.join(`user:${socket.userId}`);

    // Join campaign room for real-time updates
    socket.on('join_campaign', (campaignId) => {
      socket.join(`campaign:${campaignId}`);
      logger.info(`User ${socket.userId} joined campaign room: ${campaignId}`);
    });

    socket.on('leave_campaign', (campaignId) => {
      socket.leave(`campaign:${campaignId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  logger.info('🔌 Socket.io initialized');
  return io;
};

exports.getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
