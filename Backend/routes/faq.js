const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const FAQ = require('../models/FAQ');
const authAdmin = require('../middleware/authAdmin');

// Middleware to prevent caching for all routes in this router
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// GET /api/faqs
router.get('/', async (req, res) => {
  try {
    const faqs = await FAQ.find({})
      .sort({ moduleNumber: 1, questionNumber: 1 })
      .lean()
      .exec();

    res.json(faqs);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching FAQs:', error);
    }
    res.status(500).json({ error: 'Server error fetching FAQs' });
  }
});

// GET /api/faqs/all — paginated list for admin UI
router.get('/all', authAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const filter = search ? { question: new RegExp(search.trim(), 'i') } : {};
    const total = await FAQ.countDocuments(filter);
    const faqs = await FAQ.find(filter)
      .sort({ moduleNumber: 1, questionNumber: 1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();
    res.json({ faqs, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') console.error('Error fetching FAQ list:', err);
    res.status(500).json({ error: 'Server error fetching FAQ list.' });
  }
});

// POST /api/faqs — create a new FAQ entry (admin only)
router.post('/', authAdmin, async (req, res) => {
  try {
    const { question, answer, category, moduleNumber, questionNumber, sectionId, displayNumber } = req.body;
    if (!question || !answer || !category || moduleNumber == null || questionNumber == null) {
      return res.status(400).json({ error: 'question, answer, category, moduleNumber and questionNumber are required.' });
    }
    const faq = await FAQ.create({
      question,
      answer,
      category,
      moduleNumber: parseInt(moduleNumber),
      questionNumber: parseInt(questionNumber),
      sectionId: sectionId || `q-${moduleNumber}-${questionNumber}`,
      displayNumber: displayNumber || `${moduleNumber}.${questionNumber}`,
    });
    res.status(201).json(faq);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'FAQ with this sectionId already exists.' });
    if (process.env.NODE_ENV === 'development') console.error('Error creating FAQ:', err);
    res.status(500).json({ error: 'Server error creating FAQ.' });
  }
});

// PUT /api/faqs/:id — update an existing FAQ entry (admin only)
router.put('/:id', authAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid FAQ ID.' });
    }
    const allowed = ['question', 'answer', 'category', 'moduleNumber', 'questionNumber', 'sectionId', 'displayNumber', 'popularBadge', 'phase'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] != null) updates[key] = req.body[key];
    }
    const faq = await FAQ.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!faq) return res.status(404).json({ error: 'FAQ not found.' });
    res.json(faq);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'FAQ with this sectionId already exists.' });
    if (process.env.NODE_ENV === 'development') console.error('Error updating FAQ:', err);
    res.status(500).json({ error: 'Server error updating FAQ.' });
  }
});

// DELETE /api/faqs/:id — delete an FAQ entry (admin only)
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid FAQ ID.' });
    }
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ error: 'FAQ not found.' });
    res.json({ message: 'FAQ deleted.' });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') console.error('Error deleting FAQ:', err);
    res.status(500).json({ error: 'Server error deleting FAQ.' });
  }
});

// POST /api/faqs/:id/helpful — increment helpful count
router.post('/:id/helpful', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid FAQ ID format' });
    }

    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );

    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    res.json(faq);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error incrementing helpful count:', error);
    }
    res.status(500).json({ error: 'Server error updating helpful count' });
  }
});

module.exports = router;