const mongoose = require('mongoose');

const queryCacheSchema = new mongoose.Schema(
  {
    queryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Query', required: true, unique: true },
    title: { type: String, required: true }, // denormalised for fast reads
    answer: { type: String, default: null },
    answerStatus: { type: String, enum: ['pending', 'answered'], default: 'pending' },
    upvotes: { type: Number, default: 0 },
    answerUpvotes: { type: Number, default: 0 }, // separate counter for answer upvotes
    flags: { type: Number, default: 0 },
    screenshotUrls: { type: [String], default: [] }, // denormalised from Query at cache creation time
    isHidden: { type: Boolean, default: false }, // auto-hidden when flags > 3
    answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // ── Pending student answers awaiting admin approval ────────────────────
    pendingAnswers: [{
      body:            { type: String, required: true },
      author:          { type: mongoose.Schema.Types.ObjectId, refPath: 'pendingAnswers.authorModel', required: true },
      authorModel:     { type: String, enum: ['User', 'Admin'], required: true },
      isTrustedAuthor: { type: Boolean, default: false },
      createdAt:       { type: Date, default: Date.now },
    }],

    // ── Approved student answers shown as comments under the official answer ──
    comments: [{
      body:            { type: String, required: true },
      author:          { type: mongoose.Schema.Types.ObjectId, refPath: 'comments.authorModel', required: true },
      authorModel:     { type: String, enum: ['User', 'Admin'], required: true },
      isTrustedAuthor: { type: Boolean, default: false },
      createdAt:       { type: Date, default: Date.now },
    }],
    // TTL: MongoDB auto-deletes this document when expiresAt is reached
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL index — MongoDB removes documents automatically when expiresAt passes
queryCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
queryCacheSchema.index({ upvotes: -1 });

module.exports = mongoose.model('QueryCache', queryCacheSchema);
