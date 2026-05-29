const mongoose = require('mongoose');

const draftSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  title: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  tags: { type: [String], default: [] },
  notifyEmail: { type: Boolean, default: true },
  savedAt: { type: Date, default: Date.now },
});

// Unique index — each user has at most one draft (upsert on save)

module.exports = mongoose.model('Draft', draftSchema);
