const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'grab_n_go_super_secret_jwt_key_2026';

function generateToken(user) {
  const userId = user.id ? user.id.toString() : user._id.toString();
  return jwt.sign(
    {
      id: userId,
      name: user.name,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Allowed roles: ${allowedRoles.join(', ')}` });
    }
    next();
  };
}

module.exports = {
  generateToken,
  authenticateToken,
  requireAuth,
  requireRole,
  JWT_SECRET
};
