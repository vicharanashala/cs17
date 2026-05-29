const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },               // The FAQ question text (e.g., "What is VINS?")
  answer: { type: String, required: true },                 // Official admin-written answer
  category: { type: String, required: true },               // e.g. "ABOUT THE INTERNSHIP", "VIBE PLATFORM"
  moduleNumber: { type: Number, required: true },           // Module number 1-13 for proper ordering
  questionNumber: { type: Number, required: true },         // Question number within module (e.g., 1, 2, 3... 10)
  sectionId: { type: String, required: true },              // e.g. "q-1-1" for anchor links
  displayNumber: { type: String, required: true },          // e.g. "1.1" for display in UI
  helpfulCount: { type: Number, default: 0 },               // Sourced from "This answered my question" yes clicks
  resolvedViaEscalation: { type: Boolean, default: false }, // true if this entered FAQ via Page 3
  peerFootnote: {                                           // Optional 200-char community note
    text: String,
    authorName: String,
    approvedByAdmin: { type: Boolean, default: false }
  },
  gapScore: { type: Number, default: 0 },                   // Computed nightly by gapTracker.js
  phase: { type: [String], default: [] },                   // e.g. ["may", "june"] for deadline surfacing
  popularBadge: { type: Boolean, default: false },          // Admin-toggled, shows 🔥 badge
}, { timestamps: true });

module.exports = mongoose.model('FAQ', faqSchema);
