const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const FAQ = require('../models/FAQ');

// Middleware to prevent caching for all routes in this router
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// GET /api/faqs
// Fetch all FAQs, sorted by moduleNumber and questionNumber for correct sequencing
router.get('/', async (req, res) => {
  try {
    const faqs = await FAQ.find({})
      .sort({ moduleNumber: 1, questionNumber: 1 })
      .lean() // Optimize query performance with lean()
      .exec();
    
    res.json(faqs);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching FAQs:', error);
    }
    res.status(500).json({ error: 'Server error fetching FAQs' });
  }
});

// POST /api/faqs/:id/helpful
// Increment helpful count
// Security: Validate ObjectId, rate-limited
router.post('/:id/helpful', async (req, res) => {
  try {
    // Validate ObjectId format
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
