const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verifies the student JWT from httpOnly cookie.
 * Attaches req.user = { _id, email, name, confidenceScore, confidenceTier }
 */
module.exports = async function authStudent(req, res, next) {
  try {
    const token = req.cookies?.studentToken;
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated. Please log in.' });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_STUDENT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Session expired due to inactivity. Please log in again.', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ error: 'Invalid token.' });
    }

    const user = await User.findById(payload.userId).select('-passwordHash').lean();
    if (!user) return res.status(401).json({ error: 'User not found.' });
    if (!user.active) return res.status(403).json({ error: 'Your account has been deactivated. Contact your admin.' });

    req.user = user;

    // Sliding window: refresh token on every active request (resets 10-min inactivity clock)
    const inactivityMs = (parseInt(process.env.JWT_INACTIVITY_MINUTES) || 10) * 60 * 1000;
    const refreshed = jwt.sign(
      { userId: user._id },
      process.env.JWT_STUDENT_SECRET,
      { expiresIn: `${process.env.JWT_INACTIVITY_MINUTES || 10}m` }
    );
    res.cookie('studentToken', refreshed, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: inactivityMs,
    });

    next();
  } catch (err) {
    console.error('authStudent error:', err);
    res.status(500).json({ error: 'Auth error' });
  }
};
