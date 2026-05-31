const jwt = require('jsonwebtoken');

/**
 * Socket.io middleware — validates JWT cookie on handshake.
 * Attaches { user, role } to socket.handshake.auth.
 * Skips unauthenticated connections silently (socket will still connect
 * but without auth payload — routes that need auth check socket.user).
 */
function authSocket(socket, next) {
  try {
    const rawCookies = socket.handshake.headers.cookie || '';
    const cookies = Object.fromEntries(
      rawCookies.split(';').map((c) => {
        const [k, ...v] = c.trim().split('=');
        return [k, v.join('=')];
      })
    );

    const token = cookies.student_token || cookies.admin_token;
    if (!token) return next();

    const secret =
      cookies.admin_token
        ? process.env.JWT_ADMIN_SECRET
        : process.env.JWT_STUDENT_SECRET;

    const decoded = jwt.verify(token, secret);
    socket.user = { _id: decoded._id, email: decoded.email, role: decoded.role };
    if (decoded.role) socket.user.role = decoded.role;
    if (decoded.confidenceScore !== undefined) {
      socket.user.confidenceScore = decoded.confidenceScore;
    }
    next();
  } catch {
    // Invalid token — connect anyway but without user
    next();
  }
}

module.exports = authSocket;