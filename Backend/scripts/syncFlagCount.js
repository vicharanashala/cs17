require('dotenv').config({ path: 'D:/summership IIT Ropar/FAQ_SOFTWARE/Backend/.env' });
const mongoose = require('mongoose');
const Query = require('../models/Query');
const QueryCache = require('../models/QueryCache');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Sync flagCount from QueryCache where entries exist
  const caches = await QueryCache.find({});
  let synced = 0;
  for (const cache of caches) {
    const result = await Query.findByIdAndUpdate(
      cache.queryId,
      { flagCount: cache.flags || 0 },
      { returnDocument: 'after' }
    );
    if (result) {
      synced++;
      console.log('Synced ' + cache.queryId + ' -> flagCount=' + cache.flags);
    }
  }

  // Fix queries with no QueryCache entry (flagCount not set yet)
  const missing = await Query.updateMany(
    { flagCount: { $exists: false } },
    { $set: { flagCount: 0 } }
  );
  console.log('Fixed ' + missing.modifiedCount + ' queries with missing flagCount -> 0');

  console.log('\nDone. ' + synced + ' synced from cache, ' + missing.modifiedCount + ' back-populated.');
  await mongoose.disconnect();
}

main().catch(function(e) { console.error(e.message); process.exit(1); });