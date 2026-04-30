const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    backer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Minimum contribution is $1'],
    },
    currency: { type: String, default: 'USD' },
    rewardTier: {
      type: mongoose.Schema.Types.ObjectId,
      // references embedded subdoc — stored as plain id
    },
    anonymous: { type: Boolean, default: false },
    message: { type: String, maxlength: 500 },

    // Stripe
    stripePaymentIntentId: { type: String, unique: true, sparse: true },
    stripeChargeId: { type: String },

    // Status
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded', 'disputed'],
      default: 'pending',
    },

    // Refund
    refundedAt: { type: Date },
    refundReason: { type: String },
    refundAmount: { type: Number, default: 0 },

    // Shipping (if reward requires it)
    shippingAddress: {
      name: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },

    // Metadata
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

contributionSchema.index({ campaign: 1, backer: 1 });
contributionSchema.index({ status: 1 });

module.exports = mongoose.model('Contribution', contributionSchema);
