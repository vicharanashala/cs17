const express = require('express');
const router = express.Router();
const Query = require('../models/Query');

// Throughput assumption: admin resolves ~10 queries per working hour
const QUERIES_PER_HOUR = 10;

router.get('/', async (req, res) => {
  try {
    const pendingCount = await Query.countDocuments({
      adminStatus: { $in: ['pending', 'seen'] },
    });

    const estimatedHours = Math.ceil(pendingCount / QUERIES_PER_HOUR);

    res.json({
      pendingCount,
      estimatedHours,
      label: estimatedHours === 0
        ? 'No queue — typically answered within the day'
        : `Usually answered within ~${estimatedHours} hour${estimatedHours === 1 ? '' : 's'}`,
    });
  } catch (err) {
    console.error('[stats]', err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

module.exports = router;