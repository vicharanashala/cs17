const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authStudent = require('../middleware/authStudent');

const COOKIE_OPTIONS = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: (parseInt(process.env.JWT_INACTIVITY_MINUTES) || 10) * 60 * 1000,
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
    if (!user.active) return res.status(403).json({ error: 'Your account has been deactivated.' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid email or password.' });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_STUDENT_SECRET,
      { expiresIn: `${process.env.JWT_INACTIVITY_MINUTES || 10}m` }
    );

    res.cookie('studentToken', token, COOKIE_OPTIONS());

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        confidenceScore: user.confidenceScore,
        confidenceTier: user.confidenceScore >= 10 ? 'expert' : user.confidenceScore >= 3 ? 'trusted' : 'new',
        requirePasswordReset: user.requirePasswordReset,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('studentToken', { httpOnly: true, sameSite: 'strict' });
  res.json({ message: 'Logged out.' });
});

// GET /api/auth/me — check current session (used on page load)
router.get('/me', authStudent, (req, res) => {
  const u = req.user;
  res.json({
    _id: u._id,
    name: u.name,
    email: u.email,
    confidenceScore: u.confidenceScore,
    confidenceTier: u.confidenceScore >= 10 ? 'expert' : u.confidenceScore >= 3 ? 'trusted' : 'new',
    requirePasswordReset: u.requirePasswordReset,
  });
});

// POST /api/auth/change-password — for first-login password reset
router.post('/change-password', authStudent, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new password are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    }

    const user = await User.findById(req.user._id);
    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Current password is incorrect.' });

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.requirePasswordReset = false;
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
