const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Query = require('../models/Query');
const QueryCache = require('../models/QueryCache');
const QueryVote = require('../models/QueryVote');
const User = require('../models/User');
const Notification = require('../models/Notification');
const authStudent = require('../middleware/authStudent');
const { sendAnswerNotification } = require('../services/email');

// ─── POST /api/answers/:queryId — Submit an answer to a community query ─────
router.post('/:queryId', authStudent, async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer || answer.trim().length < 5) {
      return res.status(400).json({ error: 'Answer must be at least 5 characters.' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.queryId)) {
      return res.status(400).json({ error: 'Invalid query ID.' });
    }

    const query = await Query.findById(req.params.queryId);
    if (!query) return res.status(404).json({ error: 'Query not found.' });
    if (query.status === 'answered' || query.status === 'faq_promoted') {
      return res.status(400).json({ error: 'This query already has an answer.' });
    }
    if (query.submittedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "You can't answer your own question." });
    }

    const isTrusted = req.user.confidenceScore >= 3;

    if (isTrusted) {
      // Trusted / Expert: post directly, no admin approval needed
      // Push to comments so it shows under the answer section immediately
      query.comments.push({
        body: answer.trim(),
        author: req.user._id,
        authorModel: 'User',
        isTrustedAuthor: true,
      });

      query.answer = answer.trim();
      query.answeredBy = req.user._id;
      query.answeredByModel = 'User';
      query.isTrustedAnswer = true;
      query.status = 'answered';
      query.adminStatus = 'answered';

      await query.save();

      // Award +1 confidence to trusted answerer
      await User.findByIdAndUpdate(req.user._id, { $inc: { confidenceScore: 1 } });

      // Send trusted_confirmed notification to the answerer
      await Notification.create({
        notifiedUser: req.user._id,
        type: 'trusted_confirmed',
        queryId: query._id,
        message: 'Your answer was posted directly to the community — +1 confidence awarded!',
      });

      // Create in-app notification for the asker
      await Notification.create({
        notifiedUser: query.submittedBy,
        type: 'query_answered',
        queryId: query._id,
        message: 'Your query was answered by a trusted community member.',
      });

      // Update cache
      await QueryCache.findOneAndUpdate(
        { queryId: query._id },
        { answer: answer.trim(), answerStatus: 'answered', answeredBy: req.user._id }
      );

      // Notify all interested students
      const voters = await QueryVote.find({ queryId: query._id, registeredInterest: true })
        .populate('userId', 'email name')
        .lean();

      for (const v of voters) {
        if (v.notifyEmail && v.userId?.email) {
          await sendAnswerNotification(v.userId.email, v.userId.name, query.title, answer.trim(), false);
        }
      }

      const io = req.app.get('io');
      if (io) io.emit('query:answered', { _id: query._id, title: query.title, answer: answer.trim() });

      return res.status(201).json({
        message: 'Answer posted. (Community answer — trusted user)',
        posted: true,
        isTrustedAnswer: true,
      });
    }

    // New user: answer pending admin approval
    // Accumulate all pending answers — no overwrite, each user's answer is preserved
    query.pendingAnswers.push({
      body: answer.trim(),
      author: req.user._id,
      authorModel: 'User',
      isTrustedAuthor: false,
    });
    query.adminStatus = 'pending';

    await query.save();

    return res.status(201).json({
      message: 'Your answer has been submitted for admin review.',
      posted: false,
      isTrustedAnswer: false,
    });
  } catch (err) {
    console.error('Submit answer error:', err);
    res.status(500).json({ error: 'Failed to submit answer.' });
  }
});

module.exports = router;
