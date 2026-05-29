/**
 * Run once: node scripts/seedCategories.js
 * Seeds initial categories. Admin can add/edit/delete more from the dashboard.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const Category = require('../models/Category');

const INITIAL_CATEGORIES = [
  { name: 'Academic', slug: 'academic' },
  { name: 'NOC Process', slug: 'noc-process' },
  { name: 'ViBe Platform', slug: 'vibe-platform' },
  { name: 'Rosetta', slug: 'Rosetta' },
  { name: 'Certificate', slug: 'Certificate' },
  { name: 'Project', slug: 'project' },
  { name: 'Team formation', slug: 'team formation' },
  { name: 'Mentors', slug: 'mentors' },
  { name: 'General', slug: 'general' },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  for (const cat of INITIAL_CATEGORIES) {
    await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true });
    console.log(`  ✓ ${cat.name}`);
  }

  console.log('✅ Categories seeded.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
