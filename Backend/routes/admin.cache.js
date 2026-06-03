const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authAdmin = require('../middleware/authAdmin');
const QueryCache = require('../models/QueryCache');
const CacheVote = require('../models/CacheVote');

// ─── GET /api/admin/cache/all — Paginated list of all cache entries ─────────
// Query params: ?page=1&limit=20&search=&filter=all|hidden|visible
router.get('/all', authAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', filter = 'all' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const conditions = {};

    if (filter === 'hidden')  conditions.isHidden = true;
    if (filter === 'visible') conditions.isHidden = false;

    if (search.trim()) {
      conditions.title = { $regex: search.trim(), $options: 'i' };
    }

    const [entries, total] = await Promise.all([
      QueryCache.find(conditions)
        .sort({ upvotes: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate({
          path: 'queryId',
          select: 'title category tags status answer submittedBy',
          populate: { path: 'category', select: 'name' },
        })
        .lean(),
      QueryCache.countDocuments(conditions),
    ]);

    res.json({
      entries,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error('Admin cache list error:', err);
    res.status(500).json({ error: 'Failed to fetch cache entries.' });
  }
});

// ─── PATCH /api/admin/cache/:cacheId/hide — Manually hide a cache entry ─────
router.patch('/:cacheId/hide', authAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.cacheId)) {
      return res.status(400).json({ error: 'Invalid cache entry ID.' });
    }

    const entry = await QueryCache.findById(req.params.cacheId);
    if (!entry) return res.status(404).json({ error: 'Cache entry not found.' });
    if (entry.isHidden) return res.status(400).json({ error: 'Already hidden.' });

    entry.isHidden = true;
    await entry.save();

    res.json({ message: 'Cache entry hidden.', entry });
  } catch (err) {
    console.error('Admin cache hide error:', err);
    res.status(500).json({ error: 'Failed to hide cache entry.' });
  }
});

// ─── PATCH /api/admin/cache/:cacheId/unhide — Restore a hidden cache entry ──
router.patch('/:cacheId/unhide', authAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.cacheId)) {
      return res.status(400).json({ error: 'Invalid cache entry ID.' });
    }

    const entry = await QueryCache.findById(req.params.cacheId);
    if (!entry) return res.status(404).json({ error: 'Cache entry not found.' });
    if (!entry.isHidden) return res.status(400).json({ error: 'Not hidden.' });

    entry.isHidden = false;
    await entry.save();

    res.json({ message: 'Cache entry restored.', entry });
  } catch (err) {
    console.error('Admin cache unhide error:', err);
    res.status(500).json({ error: 'Failed to restore cache entry.' });
  }
});

// ─── DELETE /api/admin/cache/:cacheId — Hard-delete a cache entry + cascade ─
router.delete('/:cacheId', authAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.cacheId)) {
      return res.status(400).json({ error: 'Invalid cache entry ID.' });
    }

    const entry = await QueryCache.findById(req.params.cacheId);
    if (!entry) return res.status(404).json({ error: 'Cache entry not found.' });

    // Cascade delete related CacheVote records to avoid orphans
    await CacheVote.deleteMany({ cacheEntryId: entry._id });

    await QueryCache.findByIdAndDelete(entry._id);

    res.json({ message: 'Cache entry deleted.' });
  } catch (err) {
    console.error('Admin cache delete error:', err);
    res.status(500).json({ error: 'Failed to delete cache entry.' });
  }
});

module.exports = router;