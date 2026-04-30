const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('../services/email.service');
const notificationService = require('../services/notification.service');

// ─── Generate Tokens ─────────────────────────────────────────────────────────
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });
  return { accessToken, refreshToken };
};

const sendTokenResponse = (user, statusCode, res) => {
  const { accessToken, refreshToken } = generateTokens(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token: accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
      xp: user.xp,
      level: user.level,
      badges: user.badges,
    },
  });
};

// @route   POST /api/auth/register
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role === 'creator' ? 'creator' : 'backer',
  });

  // Send verification email
  const verifyToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verifyToken}`;
  await emailService.sendWelcomeEmail(user, verifyUrl);

  // Welcome notification
  await notificationService.create({
    recipient: user._id,
    type: 'welcome',
    title: '🔥 Welcome to IgnitionX!',
    message: `Hey ${user.name}! Your journey to ignite ideas starts now.`,
  });

  sendTokenResponse(user, 201, res);
};

// @route   POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (user.isBanned) {
    return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });
  }

  user.lastLoginAt = Date.now();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
};

// @route   POST /api/auth/logout
exports.logout = (req, res) => {
  res.cookie('refreshToken', 'none', { expires: new Date(Date.now() + 5000), httpOnly: true });
  res.json({ success: true, message: 'Logged out successfully' });
};

// @route   POST /api/auth/refresh-token
exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ success: false, message: 'No refresh token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    sendTokenResponse(user, 200, res);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
};

// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({ success: false, message: 'No user with that email' });
  }
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  await emailService.sendPasswordResetEmail(user, resetUrl);

  res.json({ success: true, message: 'Password reset email sent' });
};

// @route   PUT /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired token' });
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
};

// @route   GET /api/auth/verify-email/:token
exports.verifyEmail = async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired verification link' });
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Email verified successfully' });
};
