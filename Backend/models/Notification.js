const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notifiedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      'query_answered',
      'query_rejected',
      'added_to_faq',
      'answer_flagged',
      'trusted_confirmed',
      'escalation_acked',
    ],
  },
  queryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Query',
    required: true,
  },
  message: { type: String, default: '' },
  read: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ notifiedUser: 1, createdAt: -1 });
notificationSchema.index({ notifiedUser: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);