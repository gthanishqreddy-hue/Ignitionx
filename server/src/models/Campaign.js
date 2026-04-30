const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  targetAmount: { type: Number, required: true },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  update: { type: String },
});

const rewardTierSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true },
  amount: { type: Number, required: true, min: 1 },
  estimatedDelivery: { type: Date },
  maxBackers: { type: Number }, // null = unlimited
  currentBackers: { type: Number, default: 0 },
  items: [{ type: String }],
  isShippingRequired: { type: Boolean, default: false },
});

const campaignSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Campaign title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    slug: { type: String, unique: true, lowercase: true },
    tagline: {
      type: String,
      required: [true, 'Tagline is required'],
      maxlength: [200, 'Tagline cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [100, 'Description must be at least 100 characters'],
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Technology', 'Art', 'Film', 'Music', 'Games', 'Design',
        'Food', 'Fashion', 'Education', 'Environment', 'Health',
        'Social', 'Sports', 'Travel', 'Other',
      ],
    },
    tags: [{ type: String, lowercase: true, trim: true }],

    // Media
    coverImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    images: [{ url: String, publicId: String }],
    videoPitch: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
      thumbnail: { type: String, default: '' },
    },

    // Funding
    goalAmount: { type: Number, required: [true, 'Goal amount is required'], min: 100 },
    currentAmount: { type: Number, default: 0 },
    currency: { type: String, default: 'USD', enum: ['USD', 'EUR', 'GBP', 'INR'] },
    backersCount: { type: Number, default: 0 },

    // Dates
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    // Status
    status: {
      type: String,
      enum: ['draft', 'pending', 'active', 'funded', 'failed', 'cancelled'],
      default: 'draft',
    },
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isEditorsPick: { type: Boolean, default: false },

    // Milestones & Rewards
    milestones: [milestoneSchema],
    rewardTiers: [rewardTierSchema],

    // Analytics
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    trendingScore: { type: Number, default: 0 },

    // Social
    facebookShareUrl: { type: String },
    twitterShareUrl: { type: String },

    // Stripe
    stripeProductId: { type: String },

    // Location
    location: {
      country: { type: String, default: '' },
      city: { type: String, default: '' },
    },

    // Risk & challenges
    risks: { type: String, default: '' },

    // Refund policy
    refundPolicy: {
      type: String,
      enum: ['no-refund', 'partial', 'full'],
      default: 'no-refund',
    },

    // AI Booster
    aiBoostScore: { type: Number, default: 0 },
    aiSuggestions: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: funding percentage
campaignSchema.virtual('fundingPercentage').get(function () {
  return Math.min(((this.currentAmount / this.goalAmount) * 100).toFixed(1), 100);
});

// Virtual: days remaining
campaignSchema.virtual('daysRemaining').get(function () {
  const now = new Date();
  const diff = this.endDate - now;
  return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
});

// Virtual: is expired
campaignSchema.virtual('isExpired').get(function () {
  return new Date() > this.endDate;
});

// Auto-generate slug
campaignSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-') + '-' + Date.now().toString(36);
  }
  next();
});

// Update trending score
campaignSchema.methods.updateTrendingScore = function () {
  const ageHours = (Date.now() - this.createdAt) / 3600000;
  const score =
    this.backersCount * 3 +
    this.views * 0.5 +
    this.shares * 2 +
    (this.currentAmount / this.goalAmount) * 50 -
    ageHours * 0.1;
  this.trendingScore = Math.max(score, 0);
};

// Indexes for performance
campaignSchema.index({ status: 1, category: 1, trendingScore: -1 });
campaignSchema.index({ creator: 1 });
campaignSchema.index({ endDate: 1, status: 1 });
campaignSchema.index({ title: 'text', tagline: 'text', description: 'text' });

module.exports = mongoose.model('Campaign', campaignSchema);
