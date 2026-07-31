const { verifyToken } = require('../utils/jwt.util');

/**
 * Authentication Middleware
 * Validates incoming Bearer JWT token in Authorization header
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Access Denied: Authentication token missing. Please log in to proceed.'
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Attach user payload to request object
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Session Expired: Your security token has expired. Please log in again.'
      });
    }

    return res.status(403).json({
      status: 'fail',
      message: 'Forbidden: Invalid or corrupted authentication token.'
    });
  }
};

module.exports = authenticateToken;
