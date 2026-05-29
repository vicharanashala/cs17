const mongoose = require('mongoose');

const queryCacheSchema = new mongoose.Schema(
  {
    queryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Query', required: true, unique: true },
    title: { type: String, required: true }, // denormalised for fast reads
    answer: { type: String, default: null },
    answerStatus: { type: String, enum: ['pending', 'answered'], default: 'pending' },
    upvotes: { type: Number, default: 0 },
    flags: { type: Number, default: 0 },
    isHidden: { type: Boolean, default: false }, // auto-hidden when flags > 3
    // TTL: MongoDB auto-deletes this document when expiresAt is reached
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL index — MongoDB removes documents automatically when expiresAt passes
queryCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
queryCacheSchema.index({ upvotes: -1 });

module.exports = mongoose.model('QueryCache', queryCacheSchema);
