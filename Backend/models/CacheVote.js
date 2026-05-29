const mongoose = require('mongoose');

// Handles upvote/flag on both the QUESTION and the ANSWER of a cache entry
// A user can upvote the question AND separately upvote the answer (different target values)
const cacheVoteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cacheEntryId: { type: mongoose.Schema.Types.ObjectId, ref: 'QueryCache', required: true },
    target: { type: String, enum: ['question', 'answer'], required: true },
    voteType: { type: String, enum: ['upvote', 'flag'], required: true },
  },
  { timestamps: true }
);

// One vote per user per cache entry per target
cacheVoteSchema.index({ userId: 1, cacheEntryId: 1, target: 1 }, { unique: true });

module.exports = mongoose.model('CacheVote', cacheVoteSchema);
