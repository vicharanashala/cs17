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

    res.json({ message: 'Trusted answer approved. +1 confidence point awarded.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve answer.' });
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
    // NOTE: This creates an entry in the faqEntries collection (Page 1 DB integration point).
    // For now it just updates the query status and removes from cache.
    // When Page 1 DB is shared, add: await FAQEntry.create({ ... }) here.

    const { question, answer, category, tags } = req.body;
    if (!question || !answer) return res.status(400).json({ error: 'Question and answer are required.' });

    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ error: 'Query not found.' });

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

// PATCH /api/admin/users/:id — Activate or deactivate account
router.patch('/users/:id', authAdmin, async (req, res) => {
  try {
    const { active } = req.body;
    if (typeof active !== 'boolean') {
      return res.status(400).json({ error: '"active" (boolean) is required.' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { active },
      { new: true, select: '-passwordHash' }
    );
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ message: `Account ${active ? 'activated' : 'deactivated'}.`, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

// ─── Category Management (admin) ─────────────────────────────────────────────
// Full CRUD is in /api/categories — admin routes just re-export for dashboard convenience
// (handled by the categories router — no duplication needed)

module.exports = router;
