const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      minlength: [2, 'Comment too short'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0 },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

commentSchema.index({ campaign: 1, createdAt: -1 });
commentSchema.index({ parent: 1 });

module.exports = mongoose.model('Comment', commentSchema);
