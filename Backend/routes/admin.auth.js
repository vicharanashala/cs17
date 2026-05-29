const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const authAdmin = require('../middleware/authAdmin');

const ADMIN_SESSION_HOURS = 4;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: ADMIN_SESSION_HOURS * 60 * 60 * 1000,
};

// POST /api/admin/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials.' });

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = jwt.sign(
      { adminId: admin._id },
      process.env.JWT_ADMIN_SECRET,
      { expiresIn: `${ADMIN_SESSION_HOURS}h` }
    );

    res.cookie('adminToken', token, COOKIE_OPTIONS);

    res.json({
      admin: { _id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/admin/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('adminToken', { httpOnly: true, sameSite: 'strict' });
  res.json({ message: 'Admin logged out.' });
});

// GET /api/admin/auth/me
router.get('/me', authAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

module.exports = router;
