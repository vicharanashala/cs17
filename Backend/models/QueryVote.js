const mongoose = require('mongoose');

// Tracks both "I upvoted this question" and "notify me when answered"
// Upvoting from Genie does both: increments QueryCache.upvotes + inserts this record
const queryVoteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    queryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Query', required: true },
    notifyEmail: { type: Boolean, default: false }, // user's email pref at time of vote
    registeredInterest: { type: Boolean, default: false }, // clicked "Notify me when answered"
  },
  { timestamps: true }
);

// Unique compound index — prevents double voting
queryVoteSchema.index({ userId: 1, queryId: 1 }, { unique: true });

module.exports = mongoose.model('QueryVote', queryVoteSchema);
