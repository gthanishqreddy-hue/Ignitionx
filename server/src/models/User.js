const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    bio: { type: String, maxlength: [500, 'Bio cannot exceed 500 characters'] },
    website: { type: String, default: '' },
    socialLinks: {
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      instagram: { type: String, default: '' },
    },
    role: {
      type: String,
      enum: ['backer', 'creator', 'admin'],
      default: 'backer',
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },

    // Gamification
    badges: [
      {
        name: { type: String },
        description: { type: String },
        icon: { type: String },
        awardedAt: { type: Date, default: Date.now },
      },
    ],
    streaks: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastBackedAt: { type: Date },
    },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },

    // Stripe
    stripeCustomerId: { type: String, default: '' },

    // Email verification
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },

    // Password reset
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    // Refresh token
    refreshToken: { type: String, select: false },

    // Stats
    totalBacked: { type: Number, default: 0 },
    totalRaised: { type: Number, default: 0 },
    campaignsCreated: { type: Number, default: 0 },
    campaignsBacked: { type: Number, default: 0 },

    lastLoginAt: { type: Date },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      updates: { type: Boolean, default: true },
      funding: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 min
  return resetToken;
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h
  return token;
};

// XP & level up
userSchema.methods.addXP = async function (points) {
  this.xp += points;
  this.level = Math.floor(1 + Math.sqrt(this.xp / 100));
  await this.save();
};

module.exports = mongoose.model('User', userSchema);
