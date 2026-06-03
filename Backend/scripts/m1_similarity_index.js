/**
 * M1: Add compound index for similarity.scan query performance
 * Run: node scripts/m1_similarity_index.js
 *
 * Index: { status: 1, createdAt: -1 }
 * - status  = equality filter (status: { $nin: ['deleted', 'rejected'] })
 * - createdAt = sort descending (newest first)
 *
 * NOTE: $nin on status is not equality, so this index helps with sort + limits
 * the scan to recent queries rather than scanning the whole collection.
 * Also used as a hint so the query planner doesn't fall back to collection scan.
 *
 * The Query model's existing index { status: 1 } and { createdAt: 1 } remain
 * as fallbacks for other queries.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function up() {
  // Ensure we're connected
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

  const db = mongoose.connection.db;

  const indexes = await db.collection('queries').indexes();
  const existingNames = indexes.map(i => i.name);

  if (existingNames.includes('status_1_createdAt_-1')) {
    console.log('Index status_1_createdAt_-1 already exists — skipping.');
    return;
  }

  console.log('Creating index: status_1_createdAt_-1 ...');
  await db.collection('queries').createIndex(
    { status: 1, createdAt: -1 },
    { background: true, name: 'status_1_createdAt_-1' }
  );
  console.log('Done.');
  process.exit(0);
}

up().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});