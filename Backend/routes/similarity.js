const express = require('express');
const router = express.Router();
const Query = require('../models/Query');
const FAQ = require('../models/FAQ');
const authStudent = require('../middleware/authStudent');
const { isSimilar } = require('../services/similarity');

/**
 * POST /api/similarity/scan
 * Body: { title: string }
 * Auth: student token required
 *
 * Returns:
 *   - faqMatches: [] (placeholder — real FAQ search added during P1 integration)
 *   - communityMatches: similar pending/answered queries from the cache window
 *   - selfDuplicate: the user's own existing query if similar (hard block)
 */
router.post('/scan', authStudent, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || title.trim().length < 5) {
      return res.json({ faqMatches: [], communityMatches: [], selfDuplicate: null });
    }

    const trimmedTitle = title.trim();

    // Fetch all FAQs for comparison (collection is small — admin-managed)
    const faqs = await FAQ.find({}).lean();

    const faqMatches = [];
    for (const faq of faqs) {
      const result = isSimilar(trimmedTitle, faq.question, null, null);
      if (!result.similar) continue;
      if (faqMatches.length < 3) {
        faqMatches.push({
          _id: faq._id,
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          sectionId: faq.sectionId,
          displayNumber: faq.displayNumber,
          similarity: result,
        });
      }
    }
    // Sort by score descending
    faqMatches.sort((a, b) => b.similarity.score - a.similarity.score);

    // Fetch recent non-deleted, non-rejected queries for comparison.
    // Uses covering projection + index hint so MongoDB satisfies the query
    // entirely from the index without touching the main collection data.
    const recentQueries = await Query.find({
      status: { $nin: ['deleted', 'rejected'] },
    })
      .project({ _id: 1, title: 1, embedding: 1, submittedBy: 1, status: 1, tags: 1, voteCount: 1, answer: 1, category: 1 })
      .hint({ status: 1, createdAt: -1 })
      .sort({ createdAt: -1 })
      .limit(500)
      .populate('category', 'name')
      .lean();

    const communityMatches = [];
    let selfDuplicate = null;

    for (const q of recentQueries) {
      const result = isSimilar(trimmedTitle, q.title, null, q.embedding);

      if (!result.similar) continue;

      const isOwn = q.submittedBy.toString() === req.user._id.toString();

      if (isOwn) {
        // Hard block — show the user their own existing query
        selfDuplicate = {
          _id: q._id,
          title: q.title,
          status: q.status,
          answer: q.answer,
          category: q.category,
          tags: q.tags,
          voteCount: q.voteCount,
          createdAt: q.createdAt,
          similarity: result,
        };
        // Once we find a self-duplicate we can break early
        break;
      }

      // Community match — inform but don't block
      if (communityMatches.length < 5) {
        communityMatches.push({
          _id: q._id,
          title: q.title,
          status: q.status,
          answer: q.answer,
          category: q.category,
          tags: q.tags,
          voteCount: q.voteCount,
          similarity: result,
        });
      }
    }

    res.json({
      faqMatches,
      communityMatches,
      selfDuplicate,
    });
  } catch (err) {
    console.error('Similarity scan error:', err);
    res.status(500).json({ error: 'Similarity scan failed.' });
  }
});

module.exports = router;
