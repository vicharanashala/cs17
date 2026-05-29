const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * Verifies the admin JWT from httpOnly cookie.
 * Attaches req.admin = { _id, email, name }
 */
module.exports = async function authAdmin(req, res, next) {
  try {
    const token = req.cookies?.adminToken;
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated as admin.' });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Admin session expired.', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ error: 'Invalid admin token.' });
    }

    const admin = await Admin.findById(payload.adminId).select('-passwordHash').lean();
    if (!admin) return res.status(401).json({ error: 'Admin not found.' });

    req.admin = admin;
    next();
  } catch (err) {
    console.error('authAdmin error:', err);
    res.status(500).json({ error: 'Auth error' });
  }
};
