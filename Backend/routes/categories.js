const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const authAdmin = require('../middleware/authAdmin');

// GET /api/categories — public (students need this to populate the form)
router.get('/', async (req, res) => {
  try {
    const cats = await Category.find({}).sort({ name: 1 }).lean();
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// POST /api/categories — admin only
router.post('/', authAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required.' });

    const slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const cat = await Category.create({ name: name.trim(), slug });
    res.status(201).json(cat);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Category already exists.' });
    res.status(500).json({ error: 'Failed to create category.' });
  }
});

// PATCH /api/categories/:id — admin only
router.patch('/:id', authAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required.' });

    const slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const cat = await Category.findByIdAndUpdate(
      req.params.id,
      { name: name.trim(), slug },
      { new: true }
    );
    if (!cat) return res.status(404).json({ error: 'Category not found.' });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category.' });
  }
});

// DELETE /api/categories/:id — admin only
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category.' });
  }
});

module.exports = router;
