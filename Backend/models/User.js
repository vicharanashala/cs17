const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    confidenceScore: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true },
    requirePasswordReset: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Confidence tier helper (used in routes/services)
userSchema.virtual('confidenceTier').get(function () {
  if (this.confidenceScore >= 10) return 'expert';
  if (this.confidenceScore >= 3)  return 'trusted';
  return 'new';
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
