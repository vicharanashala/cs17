const express = require('express');
const router = express.Router();
const Draft = require('../models/Draft');
const authStudent = require('../middleware/authStudent');

// GET /api/drafts/mine — retrieve current user's draft (if any)
router.get('/mine', authStudent, async (req, res) => {
  try {
    const draft = await Draft.findOne({ userId: req.user._id })
      .populate('category', 'name slug')
      .lean();
    res.json(draft || null);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch draft.' });
  }
});

// PUT /api/drafts/mine — upsert draft (called every 30s by frontend)
router.put('/mine', authStudent, async (req, res) => {
  try {
    const { title, category, tags, notifyEmail } = req.body;

    const draft = await Draft.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        title: (title || '').slice(0, 500),
        category: category || null,
        tags: (tags || []).slice(0, 5),
        notifyEmail: notifyEmail !== undefined ? notifyEmail : true,
        savedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ message: 'Draft saved.', savedAt: draft.savedAt });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save draft.' });
  }
});

// DELETE /api/drafts/mine — clear draft (called after successful submission)
router.delete('/mine', authStudent, async (req, res) => {
  try {
    await Draft.findOneAndDelete({ userId: req.user._id });
    res.json({ message: 'Draft cleared.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear draft.' });
  }
});

module.exports = router;
