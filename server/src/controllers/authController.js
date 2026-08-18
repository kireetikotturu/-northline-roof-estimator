// server/src/controllers/authController.js
import jwt from 'jsonwebtoken';

// Credentials live in env vars, not the database — there's only ever one
// shared Owner Panel login (Dale and Marcus both use it). See DECISIONS.md
// for why per-user accounts were intentionally out of scope.
export async function login(req, res) {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const validUser = username === process.env.ADMIN_USERNAME;
  const validPass = password === process.env.ADMIN_PASSWORD;

  if (!validUser || !validPass) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = jwt.sign({ sub: username, role: 'owner' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '12h',
  });

  return res.json({ token, expiresIn: process.env.JWT_EXPIRES_IN || '12h' });
}

// Lets the frontend silently confirm a stored token is still valid on load,
// instead of guessing from expiry math on the client.
export async function verify(req, res) {
  return res.json({ valid: true, owner: req.owner.sub });
}
