/**
 * Run once: node scripts/seedAdmin.js
 * Creates the first admin account.
 * Change the values below before running, then delete or gitignore this file.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const Admin = require('../models/Admin');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const existing = await Admin.findOne({ email: 'admin@platform.ac.in' });
  if (existing) {
    console.log('ℹ️  Admin already exists. Exiting.');
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash('Admin@7462', 12); // Change this!
  await Admin.create({
    name: 'Platform Admin',
    email: 'admin@platform.ac.in', // Change this!
    passwordHash,
  });

  // console.log('✅ Admin account created: admin@platform.ac.in / Admin@7462');
  // console.log('⚠️  Change the password immediately after first login.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
