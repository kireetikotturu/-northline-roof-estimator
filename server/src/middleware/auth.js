// server/src/middleware/auth.js
//
// Protects every /api/admin/* route. The Owner Panel logs in once via
// POST /api/auth/login, receives a JWT, and sends it back as
// `Authorization: Bearer <token>` on every subsequent admin request.

import jwt from 'jsonwebtoken';

export function requireOwnerAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.owner = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}
