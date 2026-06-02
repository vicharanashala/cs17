const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Query = require('../models/Query');
const QueryCache = require('../models/QueryCache');
const QueryVote = require('../models/QueryVote');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Category = require('../models/Category');
const FAQ = require('../models/FAQ');
const authAdmin = require('../middleware/authAdmin');
const { sendAnswerNotification, sendFAQPromotionNotification, sendRejectionNotification } = require('../services/email');

// ─── GET /api/admin/queries — List all queries with filters ─────────────────
router.get('/queries', authAdmin, async (req, res) => {
  try {
    const {
      status,        // pending | in_progress | answered | rejected | deleted | all
      category,
      tag,
      search,
      sort = 'oldest', // oldest | newest | most-voted | least-voted | updated | alpha
      page = 1,
      limit = 30,
      showTrustResolved = 'false',
    } = req.query;

    const filter = {};

    if (status && status !== 'all') {
      // Map UI status names to DB values
      const statusMap = {
        pending:     { adminStatus: 'pending' },
        in_progress: { adminStatus: 'in_progress' },
        answered:    { adminStatus: 'answered', adminDeleted: false },
        rejected:    { status: 'rejected' },
        deleted:     { status: 'deleted' },
      };
      Object.assign(filter, statusMap[status] || {});
    }

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    }
    if (tag) {
      filter.tags = tag.toLowerCase();
    }
    if (search) {
      filter.title = new RegExp(search.trim(), 'i');
    }
    // Hide trust-resolved by default unless toggled
    if (showTrustResolved === 'false') {
      // Don't show queries that were answered by trusted users and never escalated
      filter.$nor = [{ isTrustedAnswer: true, askerSatisfied: null, adminStatus: 'answered' }];
    }

    const sortMap = {
      oldest:     { createdAt: 1 },
      newest:     { createdAt: -1 },
      'most-voted':  { voteCount: -1 },
      'least-voted': { voteCount: 1 },
      updated:    { updatedAt: -1 },
      alpha:      { title: 1 },
    };
    const sortObj = sortMap[sort] || { createdAt: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Query.countDocuments(filter);
    const queries = await Query.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('category', 'name slug')
      .populate('submittedBy', 'name email')
      .populate('answeredBy', 'name email')
      .lean();

    // Populate pendingAnswers and comments author names for admin drawer display
    for (const q of queries) {
      if (q.pendingAnswers) {
        for (const pa of q.pendingAnswers) {
          const user = await User.findById(pa.author).select('name').lean();
          if (user) pa.authorName = user.name;
        }
      }
      if (q.comments) {
        for (const c of q.comments) {
          const user = await User.findById(c.author).select('name').lean();
          if (user) c.authorName = user.name;
        }
      }
    }

    res.json({ queries, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('Admin query list error:', err);
    res.status(500).json({ error: 'Failed to fetch queries.' });
  }
});

// ─── PATCH /api/admin/queries/:id/mark-progress — Mark as In Progress ───────
router.patch('/queries/:id/mark-progress', authAdmin, async (req, res) => {
  try {
    const query = await Query.findByIdAndUpdate(
      req.params.id,
      { adminStatus: 'in_progress', status: 'in_progress' },
      { new: true }
    );
    if (!query) return res.status(404).json({ error: 'Query not found.' });
    res.json({ message: 'Marked as In Progress.', query });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status.' });
  }
});

// ─── PATCH /api/admin/queries/:id/answer — Admin answers a query ─────────────
router.patch('/queries/:id/answer', authAdmin, async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer || answer.trim().length < 3) {
      return res.status(400).json({ error: 'Answer is required.' });
    }

    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ error: 'Query not found.' });

    query.answer = answer.trim();
    query.answeredBy = req.admin._id;
    query.answeredByModel = 'Admin';
    query.isTrustedAnswer = false;
    query.status = 'answered';
    query.adminStatus = 'answered';

    // Move all pending student answers to comments before saving
    if (query.pendingAnswers?.length > 0) {
      query.comments.push(...query.pendingAnswers);
      query.pendingAnswers = [];
    }

    await query.save();

    // Update cache
    await QueryCache.findOneAndUpdate(
      { queryId: query._id },
      { answer: answer.trim(), answerStatus: 'answered' }
    );

    
    // Notify asker: query answered by admin
    await Notification.create({
      notifiedUser: query.submittedBy,
      type: 'query_answered',
      queryId: query._id,
      message: 'Your query has been answered by the admin team.',
    });

    // Notify all interested voters
    const voters = await QueryVote.find({ queryId: query._id, registeredInterest: true })
      .populate('userId', 'email name')
      .lean();

    for (const v of voters) {
      if (v.notifyEmail && v.userId?.email) {
        await sendAnswerNotification(v.userId.email, v.userId.name, query.title, answer.trim(), true);
      }
    }

    res.json({ message: 'Query answered and voters notified.', query });
  } catch (err) {
    console.error('Admin answer error:', err);
    res.status(500).json({ error: 'Failed to answer query.' });
  }
});

// ─── PATCH /api/admin/queries/:id/reject — Admin rejects a query ─────────────
router.patch('/queries/:id/reject', authAdmin, async (req, res) => {
  try {
    const { reason } = req.body;

    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ error: 'Query not found.' });

    query.status = 'rejected';
    query.adminStatus = 'rejected';
    query.rejectionReason = reason || null;
    await query.save();

    // Remove from cache
    await QueryCache.findOneAndDelete({ queryId: query._id });

    // Notify all voters
    const voters = await QueryVote.find({ queryId: query._id })
      .populate('userId', 'email name')
      .lean();

    for (const v of voters) {
      if (v.notifyEmail && v.userId?.email) {
        await sendRejectionNotification(v.userId.email, v.userId.name, query.title, reason);
      }
    }

    res.json({ message: 'Query rejected.', query });

    // Notify asker: query rejected
    await Notification.create({
      notifiedUser: query.submittedBy,
      type: 'query_rejected',
      queryId: query._id,
      message: reason ? `Your query was rejected: ${reason}` : 'Your query was rejected.',
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject query.' });
  }
});

// ─── PATCH /api/admin/queries/:id/approve-trusted — Approve trusted answer ──
router.patch('/queries/:id/approve-trusted', authAdmin, async (req, res) => {
  try {
    const query = await Query.findById(req.params.id).populate('answeredBy', 'name email');
    if (!query) return res.status(404).json({ error: 'Query not found.' });
    if (!query.isTrustedAnswer) return res.status(400).json({ error: 'Not a trusted user answer.' });

    query.askerSatisfied = true;
    query.adminStatus = 'answered';
    await query.save();

    
    // Notify asker: trusted answer confirmed by admin
    await Notification.create({
      notifiedUser: query.submittedBy,
      type: 'trusted_confirmed',
      queryId: query._id,
      message: 'Your community answer was confirmed by an admin.',
    });

    // Award +1 confidence point to answerer
    if (query.answeredByModel === 'User' && query.answeredBy) {
      await User.findByIdAndUpdate(query.answeredBy._id, { $inc: { confidenceScore: 1 } });
    }

    // Back-populate answeredBy on cache so flag penalty works if answer is later removed
    if (query.answeredByModel === 'User' && query.answeredBy) {
      await QueryCache.findOneAndUpdate(
        { queryId: query._id },
        { answer: query.answer, answerStatus: 'answered', answeredBy: query.answeredBy._id }
      );
    }

    res.json({ message: 'Trusted answer approved. +1 confidence point awarded.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve answer.' });
  }
});

// ─── PATCH /api/admin/queries/:id/approve-pending-answer — Approve a pending student answer ─
router.patch('/queries/:id/approve-pending-answer', authAdmin, async (req, res) => {
  try {
    const { pendingIndex } = req.body;
    if (pendingIndex === undefined || pendingIndex === null) {
      return res.status(400).json({ error: 'pendingIndex is required.' });
    }

    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ error: 'Query not found.' });
    if (!query.pendingAnswers || query.pendingAnswers.length === 0) {
      return res.status(400).json({ error: 'No pending answers to approve.' });
    }
    if (pendingIndex < 0 || pendingIndex >= query.pendingAnswers.length) {
      return res.status(400).json({ error: 'Invalid pendingIndex.' });
    }

    const selected = query.pendingAnswers[pendingIndex];

    // Set as official answer
    query.answer = selected.body;
    query.answeredBy = selected.author;
    query.answeredByModel = selected.authorModel;
    query.isTrustedAnswer = false;
    query.status = 'answered';
    query.adminStatus = 'answered';

    // Move the approved answer to comments
    query.comments.push({
      body: selected.body,
      author: selected.author,
      authorModel: selected.authorModel,
      isTrustedAuthor: selected.isTrustedAuthor,
    });

    // Move ALL other pending answers to comments (they become community comments)
    query.pendingAnswers.forEach((pa, i) => {
      if (i !== pendingIndex) {
        query.comments.push({
          body: pa.body,
          author: pa.author,
          authorModel: pa.authorModel,
          isTrustedAuthor: pa.isTrustedAuthor,
        });
      }
    });
    query.pendingAnswers = [];

    await query.save();

    // Update cache so query disappears from SolveQuery list
    await QueryCache.findOneAndUpdate(
      { queryId: query._id },
      { answer: selected.body, answerStatus: 'answered', answeredBy: selected.author }
    );

    // Notify asker
    await Notification.create({
      notifiedUser: query.submittedBy,
      type: 'query_answered',
      queryId: query._id,
      message: 'Your query was answered by the admin team.',
    });

    // Notify voters
    const voters = await QueryVote.find({ queryId: query._id, registeredInterest: true })
      .populate('userId', 'email name')
      .lean();
    for (const v of voters) {
      if (v.notifyEmail && v.userId?.email) {
        await sendAnswerNotification(v.userId.email, v.userId.name, query.title, selected.body, true);
      }
    }

    // Socket.IO: remove from SolveQuery live list for all clients
    const io = req.app.get('io');
    if (io) io.emit('query:answered', { _id: query._id, title: query.title, answer: selected.body });

    res.json({ message: 'Pending answer approved. All pending answers moved to comments.', query });
  } catch (err) {
    console.error('Approve pending answer error:', err);
    res.status(500).json({ error: 'Failed to approve pending answer.' });
  }
});


// ─── PATCH /api/admin/queries/:id/mark-seen — Mark query as seen ────────────
router.patch('/queries/:id/mark-seen', authAdmin, async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ error: 'Query not found.' });
    if (query.adminStatus !== 'pending') {
      return res.status(400).json({ error: 'Only pending queries can be marked as seen.' });
    }

    query.adminStatus = 'seen';
    await query.save();

    // Notify asker if this query was escalated (asker clicked "Not Satisfied")
    if (query.askerSatisfied === false) {
      await Notification.create({
        notifiedUser: query.submittedBy,
        type: 'escalation_acked',
        queryId: query._id,
        message: 'Your escalated query has been acknowledged and is being reviewed by the admin.',
      });
    }

    res.json({ message: 'Query marked as seen.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as seen.' });
  }
});

// ─── PATCH /api/admin/queries/:id/unhide — Restore auto-hidden cache entry ────
router.patch('/queries/:id/unhide', authAdmin, async (req, res) => {
  try {
    const query = await Query.findById(req.params.id).populate('cacheEntry');
    if (!query) return res.status(404).json({ error: 'Query not found.' });

    if (query.cacheEntry && query.cacheEntry.isHidden) {
      query.cacheEntry.isHidden = false;
      await query.cacheEntry.save();
    }

    res.json({ message: 'Query restored to forum.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to restore query.' });
  }
});

// ─── PATCH /api/admin/queries/:id/soft-delete — Remove from Answered folder ─
router.patch('/queries/:id/soft-delete', authAdmin, async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ error: 'Query not found.' });
    if (query.adminStatus !== 'answered') {
      return res.status(400).json({ error: 'Only answered queries can be removed from Answered.' });
    }
    query.adminDeleted = true;
    await query.save();
    res.json({ message: 'Query removed from Answered folder.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed.' });
  }
});

// ─── PATCH /api/admin/queries/:id/restore — Restore to Answered folder ───────
router.patch('/queries/:id/restore', authAdmin, async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ error: 'Query not found.' });
    query.adminDeleted = false;
    await query.save();
    res.json({ message: 'Query restored to Answered folder.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed.' });
  }
});

// ─── PATCH /api/admin/queries/:id/override-answer — Override trusted answer ─
router.patch('/queries/:id/override-answer', authAdmin, async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer || answer.trim().length < 3) {
      return res.status(400).json({ error: 'Answer is required.' });
    }

    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ error: 'Query not found.' });

    query.answer = answer.trim();
    query.answeredBy = req.admin._id;
    query.answeredByModel = 'Admin';
    query.isTrustedAnswer = false;
    query.status = 'answered';
    query.adminStatus = 'answered';
    await query.save();

    await QueryCache.findOneAndUpdate(
      { queryId: query._id },
      { answer: answer.trim(), answerStatus: 'answered' }
    );

    // Only notify the original asker (spec: community answerer NOT notified)
    const askerVote = await QueryVote.findOne({ queryId: query._id, userId: query.submittedBy })
      .populate('userId', 'email name')
      .lean();

    if (askerVote?.notifyEmail && askerVote.userId?.email) {
      await sendAnswerNotification(askerVote.userId.email, askerVote.userId.name, query.title, answer.trim(), true);
    }

    res.json({ message: 'Answer overridden. Only the asker notified.', query });
  } catch (err) {
    res.status(500).json({ error: 'Failed to override answer.' });
  }
});

// ─── PATCH /api/admin/queries/:id/promote-faq — Add to FAQ ───────────────────
router.patch('/queries/:id/promote-faq', authAdmin, async (req, res) => {
  try {
    const { question, answer, category, tags } = req.body;
    if (!question || !answer) return res.status(400).json({ error: 'Question and answer are required.' });

    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ error: 'Query not found.' });

    const categoryName = category || (query.category?.name || 'General');
    const faqCount = await FAQ.countDocuments({ category: categoryName });
    await FAQ.create({
      question,
      answer,
      category: categoryName,
      moduleNumber: 1,
      questionNumber: faqCount + 1,
      sectionId: `q-1-${faqCount + 1}`,
      displayNumber: `1.${faqCount + 1}`,
      resolvedViaEscalation: false,
    });

    query.status = 'faq_promoted';
    query.adminStatus = 'answered';
    await query.save();

    // Notify asker: added to FAQ
    await Notification.create({
      notifiedUser: query.submittedBy,
      type: 'added_to_faq',
      queryId: query._id,
      message: 'Your query was promoted to the official FAQ!',
    });

    // Remove from 15-day cache
    await QueryCache.findOneAndDelete({ queryId: query._id });

    // Notify all voters
    const voters = await QueryVote.find({ queryId: query._id })
      .populate('userId', 'email name')
      .lean();

    for (const v of voters) {
      if (v.notifyEmail && v.userId?.email) {
        await sendFAQPromotionNotification(v.userId.email, v.userId.name, query.title);
      }
    }

    res.json({ message: 'Query promoted to FAQ. Voters notified.', faqEntry: { question, answer, category, tags } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to promote to FAQ.' });
  }
});

// ─── DELETE /api/admin/queries/:id — Soft-delete from answered folder ────────
router.delete('/queries/:id', authAdmin, async (req, res) => {
  try {
    const query = await Query.findByIdAndUpdate(
      req.params.id,
      { adminDeleted: true },
      { new: true }
    );
    if (!query) return res.status(404).json({ error: 'Query not found.' });
    res.json({ message: 'Query removed from admin view.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete query.' });
  }
});

// ─── User Management ─────────────────────────────────────────────────────────

// GET /api/admin/users
router.get('/users', authAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-passwordHash').sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// POST /api/admin/users — Provision a new student account
router.post('/users', authAdmin, async (req, res) => {
  try {
    const { name, email, password, requirePasswordReset = true } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      requirePasswordReset,
    });

    res.status(201).json({
      message: 'Student account created.',
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Email already registered.' });
    res.status(500).json({ error: 'Failed to create user.' });
  }
});

// PATCH /api/admin/users/:id — Update account status and/or confidence score
router.patch('/users/:id', authAdmin, async (req, res) => {
  try {
    const { active, confidenceScore } = req.body;
    const updates = {};
    if (active !== undefined) updates.active = active;
    if (confidenceScore !== undefined) {
      const parsed = parseInt(confidenceScore);
      if (isNaN(parsed) || parsed < 0) {
        return res.status(400).json({ error: 'confidenceScore must be a non-negative integer.' });
      }
      updates.confidenceScore = parsed;
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Provide at least one of: active (boolean) or confidenceScore (integer).' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, select: '-passwordHash' }
    );
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ message: 'User updated.', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

// ─── Category Management (admin) ─────────────────────────────────────────────
// Full CRUD is in /api/categories — admin routes just re-export for dashboard convenience
// (handled by the categories router — no duplication needed)

module.exports = router;
