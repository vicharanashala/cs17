const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const QueryCache = require('../models/QueryCache');
const CacheVote = require('../models/CacheVote');
const QueryVote = require('../models/QueryVote');
const Notification = require('../models/Notification');
const User = require('../models/User');
const authStudent = require('../middleware/authStudent');
const { isSimilar, generateEmbedding } = require('../services/similarity');

// ─── GET /api/cache/top5 — Genie: top 5 most upvoted from 15-day cache ──────
// Public: students see this before they submit
router.get('/top5', authStudent, async (req, res) => {
  try {
    const top5 = await QueryCache.find({ isHidden: false })
      .sort({ upvotes: -1 })
      .limit(5)
      .populate({ path: 'queryId', select: 'title category tags status', populate: { path: 'category', select: 'name' } })
      .lean();

    res.json(top5);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch top questions.' });
  }
});

// ─── GET /api/cache/search?q= — Genie search with 3-layer semantic similarity ─────
router.get('/search', authStudent, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.json([]);

    const trimmed = q.trim();
    const queryEmbedding = await generateEmbedding(trimmed);

    const entries = await QueryCache.find({ isHidden: false })
      .populate({ path: 'queryId', select: 'title embedding category tags status answer', populate: { path: 'category', select: 'name' } })
      .lean();

    const scored = [];
    for (const entry of entries) {
      const title = entry.queryId?.title || entry.title;
      const result = isSimilar(trimmed, title, queryEmbedding, entry.queryId?.embedding || null);
      if (result.similar) {
        scored.push({ ...entry, _similarity: result });
      }
    }

    scored.sort((a, b) => b._similarity.score - a._similarity.score);
    res.json(scored.slice(0, 10));
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed.' });
  }
});

// ─── GET /api/cache/unanswered — Solve a Query panel ───────────────────────
router.get('/unanswered', authStudent, async (req, res) => {
  try {
    const items = await QueryCache.find({
      answerStatus: 'pending',
      isHidden: false,
    })
      .sort({ upvotes: -1 })
      .limit(20)
      .populate({ path: 'queryId', select: 'title category tags voteCount', populate: { path: 'category', select: 'name' } })
      .lean();

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch unanswered questions.' });
  }
});

// ─── POST /api/cache/:cacheId/vote — Upvote or flag a cache entry ───────────
router.post('/:cacheId/vote', authStudent, async (req, res) => {
  try {
    const { target, voteType } = req.body;
    // target: 'question' | 'answer'
    // voteType: 'upvote' | 'flag'

    if (!['question', 'answer'].includes(target)) {
      return res.status(400).json({ error: "target must be 'question' or 'answer'" });
    }
    if (!['upvote', 'flag', 'notify'].includes(voteType)) {
      return res.status(400).json({ error: "voteType must be 'upvote', 'flag', or 'notify'" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.cacheId)) {
      return res.status(400).json({ error: 'Invalid cache entry ID.' });
    }

    const entry = await QueryCache.findById(req.params.cacheId)
      .populate('queryId', 'submittedBy');
    if (!entry) return res.status(404).json({ error: 'Cache entry not found.' });
    if (entry.isHidden) return res.status(400).json({ error: 'This entry has been hidden.' });

    // Prevent voting on own content
    if (target === 'question' && entry.queryId?.submittedBy?.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "You can't vote on your own question." });
    }
    if (target === 'answer' && entry.answeredBy && entry.answeredBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "You can't vote on your own answer." });
    }

    // Check if already voted on this target
    const existing = await CacheVote.findOne({
      userId: req.user._id,
      cacheEntryId: entry._id,
      target,
    });

    if (existing) {
      if (existing.voteType === voteType) {
        // Toggle off (remove vote)
        await existing.deleteOne();
        if (voteType === 'upvote') await QueryCache.findByIdAndUpdate(entry._id, { $inc: { upvotes: -1 } });
        if (voteType === 'flag')   await QueryCache.findByIdAndUpdate(entry._id, { $inc: { flags: -1 } });
        return res.json({ message: 'Vote removed.' });
      }
      // Switching vote type — update
      existing.voteType = voteType;
      await existing.save();
      if (voteType === 'upvote') {
        await QueryCache.findByIdAndUpdate(entry._id, { $inc: { upvotes: 1, flags: -1 } });
      } else {
        await QueryCache.findByIdAndUpdate(entry._id, { $inc: { flags: 1, upvotes: -1 } });
      }
    } else {
      await CacheVote.create({
        userId: req.user._id,
        cacheEntryId: entry._id,
        target,
        voteType,
      });
      if (voteType === 'upvote') {
        await QueryCache.findByIdAndUpdate(entry._id, { $inc: { upvotes: 1 } });
        // Also register interest for notification on question upvote
        if (target === 'question') {
          await QueryVote.findOneAndUpdate(
            { userId: req.user._id, queryId: entry.queryId },
            { notifyEmail: req.user?.notifyEmail ?? true, registeredInterest: true },
            { upsert: true }
          );
        }
      }
      // 'notify' — register interest WITHOUT upvoting
      if (voteType === 'notify') {
        await QueryVote.findOneAndUpdate(
          { userId: req.user._id, queryId: entry.queryId },
          { notifyEmail: req.user?.notifyEmail ?? true, registeredInterest: true },
          { upsert: true }
        );
        return res.json({ message: 'Notification preference saved.' });
      }
      if (voteType === 'flag') {
        const updated = await QueryCache.findByIdAndUpdate(
          entry._id,
          { $inc: { flags: 1 } },
          { new: true }
        );
        // Auto-hide if flags exceed threshold
        if (updated.flags > 3) {
          await QueryCache.findByIdAndUpdate(entry._id, { isHidden: true });

          // Penalise answerer: -1 confidence, notify answerer
          if (entry.answeredBy) {
            const answererId = typeof entry.answeredBy === 'object' ? entry.answeredBy._id : entry.answeredBy;
            await User.findByIdAndUpdate(answererId, { $inc: { confidenceScore: -1 } });
            await Notification.create({
              notifiedUser: answererId,
              type: 'answer_flagged',
              queryId: entry.queryId,
              message: 'Your answer was flagged and removed.',
            });
          }
        }
      }
    }

    res.json({ message: 'Vote recorded.' });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Already voted.' });
    console.error('Vote error:', err);
    res.status(500).json({ error: 'Failed to record vote.' });
  }
});

module.exports = router;
