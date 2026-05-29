const mongoose = require('mongoose');

const querySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 500, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    screenshotUrl: { type: String, default: null },
    tags: { type: [String], default: [] },

    // ── Student-facing status (drives the 3-stage tracker) ─────────────────
    // posted     → just submitted, waiting for anyone to act
    // in_progress → admin has picked it up
    // answered   → officially answered (admin or trusted user, confirmed)
    // rejected   → admin rejected
    // faq_promoted → moved to official FAQ
    // deleted    → soft-deleted by student
    status: {
      type: String,
      enum: ['posted', 'in_progress', 'answered', 'rejected', 'faq_promoted', 'deleted'],
      default: 'posted',
    },

    // ── Admin-side working status ──────────────────────────────────────────
    // pending     → not yet actioned
    // in_progress → admin clicked "Mark as In Progress"
    // answered    → admin answered
    // rejected    → admin rejected
    adminStatus: {
      type: String,
      enum: ['pending', 'in_progress', 'answered', 'rejected'],
      default: 'pending',
    },

    adminDeleted: { type: Boolean, default: false }, // soft-delete from admin answered folder

    voteCount: { type: Number, default: 1 }, // submitter counts as first vote

    answer: { type: String, default: null },
    answeredBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'answeredByModel', default: null },
    answeredByModel: { type: String, enum: ['User', 'Admin'], default: null },
    isTrustedAnswer: { type: Boolean, default: false },

    // Satisfaction tracking for trusted-user answers
    // null = not yet resolved, true = satisfied, false = escalated to admin
    askerSatisfied: { type: Boolean, default: null },

    rejectionReason: { type: String, default: null },

    // 384-dim MiniLM vector — populated by similarity service
    // Stored as array of numbers; Atlas Vector Search index defined on this field
    embedding: { type: [Number], default: [] },

    notifyEmail: { type: Boolean, default: true }, // submitter email pref at time of submission
  },
  { timestamps: true }
);

// Indexes
querySchema.index({ submittedBy: 1 });
querySchema.index({ status: 1 });
querySchema.index({ adminStatus: 1 });
querySchema.index({ voteCount: -1 });
querySchema.index({ createdAt: 1 });
querySchema.index({ category: 1 });
querySchema.index({ tags: 1 });

// NOTE: Atlas Vector Search index must be created manually in Atlas UI:
//   Field: embedding | Dimensions: 384 | Similarity: cosine

module.exports = mongoose.model('Query', querySchema);
