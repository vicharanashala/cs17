const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Query = require('../models/Query');
const QueryCache = require('../models/QueryCache');
const QueryVote = require('../models/QueryVote');
const Draft = require('../models/Draft');
const authStudent = require('../middleware/authStudent');
const { isSimilar } = require('../services/similarity');

const CACHE_TTL_DAYS = 15;

// ─── POST /api/queries — Submit a new query ─────────────────────────────────
router.post('/', authStudent, async (req, res) => {
  try {
    const { title, category, tags = [], notifyEmail = true } = req.body;

    if (!title || title.trim().length < 5) {
      return res.status(400).json({ error: 'Question must be at least 5 characters.' });
    }
    if (title.length > 500) {
      return res.status(400).json({ error: 'Question must be 500 characters or fewer.' });
    }
    if (!category) {
      return res.status(400).json({ error: 'Category is required.' });
    }

    const trimmedTitle = title.trim();

    // ── Server-side duplicate check ──────────────────────────────────────
    const recentQueries = await Query.find({
      status: { $nin: ['deleted', 'rejected'] },
    })
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    for (const q of recentQueries) {
      const result = isSimilar(trimmedTitle, q.title, null, q.embedding);
      if (!result.similar) continue;

      const isOwn = q.submittedBy.toString() === req.user._id.toString();

      if (isOwn) {
        // Hard block — 409 Conflict
        return res.status(409).json({
          code: 'SELF_DUPLICATE',
          message: "You've already asked this question.",
          existingQuery: {
            _id: q._id,
            title: q.title,
            status: q.status,
            answer: q.answer,
            createdAt: q.createdAt,
          },
        });
      }

      // Community duplicate — increment vote instead of creating new query
      await Query.findByIdAndUpdate(q._id, { $inc: { voteCount: 1 } });
      await QueryCache.findOneAndUpdate(
        { queryId: q._id },
        { $inc: { upvotes: 1 } }
      );
      // Register interest for notification
      await QueryVote.findOneAndUpdate(
        { userId: req.user._id, queryId: q._id },
        { notifyEmail, registeredInterest: true },
        { upsert: true }
      );

      return res.status(200).json({
        code: 'DUPLICATE_VOTED',
        message: 'A similar question already exists. Your vote has been added.',
        existingQuery: {
          _id: q._id,
          title: q.title,
          status: q.status,
          answer: q.answer,
          voteCount: q.voteCount + 1,
        },
      });
    }

    // ── Create new query ─────────────────────────────────────────────────
    const newQuery = await Query.create({
      title: trimmedTitle,
      category,
      submittedBy: req.user._id,
      tags: tags.slice(0, 5).map((t) => t.toLowerCase().replace(/\s+/g, '-').replace(/^#/, '')),
      notifyEmail,
      status: 'posted',
      adminStatus: 'pending',
      voteCount: 1,
    });

    // Add to 15-day cache
    const expiresAt = new Date(Date.now() + CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);
    await QueryCache.create({
      queryId: newQuery._id,
      title: newQuery.title,
      answerStatus: 'pending',
      expiresAt,
    });

    // Register submitter as first voter
    await QueryVote.create({
      userId: req.user._id,
      queryId: newQuery._id,
      notifyEmail,
      registeredInterest: true,
    });

    // Clear draft
    await Draft.findOneAndDelete({ userId: req.user._id });

    res.status(201).json({
      code: 'CREATED',
      query: {
        _id: newQuery._id,
        title: newQuery.title,
        status: newQuery.status,
        adminStatus: newQuery.adminStatus,
        createdAt: newQuery.createdAt,
      },
    });
  } catch (err) {
    console.error('Submit query error:', err);
    res.status(500).json({ error: 'Failed to submit query.' });
  }
});

// ─── GET /api/queries/mine — Student's own query history ────────────────────
router.get('/mine', authStudent, async (req, res) => {
  try {
    const queries = await Query.find({
      submittedBy: req.user._id,
      status: { $ne: 'deleted' },
    })
      .sort({ createdAt: -1 })
      .populate('category', 'name slug')
      .lean();

    res.json(queries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your queries.' });
  }
});

// ─── GET /api/queries/:id — Get single query ────────────────────────────────
router.get('/:id', authStudent, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid query ID.' });
    }
    const query = await Query.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('submittedBy', 'name email')
      .lean();

    if (!query || query.status === 'deleted') {
      return res.status(404).json({ error: 'Query not found.' });
    }
    res.json(query);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch query.' });
  }
});

// ─── PATCH /api/queries/:id — Edit query (10-min window) ────────────────────
router.patch('/:id', authStudent, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid query ID.' });
    }

    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ error: 'Query not found.' });
    if (query.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not your query.' });
    }
    if (query.status === 'deleted') {
      return res.status(400).json({ error: 'Query has been deleted.' });
    }

    // Enforce 10-minute edit window
    const ageMs = Date.now() - new Date(query.createdAt).getTime();
    if (ageMs > 10 * 60 * 1000) {
      return res.status(403).json({ error: 'Edit window has closed (10 minutes after submission).' });
    }

    const { title, category, tags } = req.body;

    if (title) {
      if (title.trim().length < 5) return res.status(400).json({ error: 'Title too short.' });
      if (title.length > 500) return res.status(400).json({ error: 'Title too long.' });
      query.title = title.trim();
      // Update cache title too
      await QueryCache.findOneAndUpdate({ queryId: query._id }, { title: query.title });
    }
    if (category) query.category = category;
    if (tags) query.tags = tags.slice(0, 5).map((t) => t.toLowerCase().replace(/\s+/g, '-').replace(/^#/, ''));

    await query.save();
    res.json({ message: 'Query updated.', query });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update query.' });
  }
});

// ─── DELETE /api/queries/:id — Soft-delete own query ────────────────────────
router.delete('/:id', authStudent, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid query ID.' });
    }

    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ error: 'Query not found.' });
    if (query.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not your query.' });
    }

    query.status = 'deleted';
    await query.save();
    // Remove from cache so it no longer shows in Genie
    await QueryCache.findOneAndDelete({ queryId: query._id });

    res.json({ message: 'Query deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete query.' });
  }
});

// ─── POST /api/queries/:id/not-satisfied — Escalate to admin ────────────────
router.post('/:id/not-satisfied', authStudent, async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ error: 'Query not found.' });
    if (query.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not your query.' });
    }
    if (!query.isTrustedAnswer) {
      return res.status(400).json({ error: 'Only community answers can be escalated.' });
    }

    query.askerSatisfied = false;
    query.adminStatus = 'pending'; // re-queue at original timestamp position
    query.status = 'in_progress';
    await query.save();

    res.json({ message: 'Query escalated to admin team.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to escalate query.' });
  }
});

module.exports = router;
