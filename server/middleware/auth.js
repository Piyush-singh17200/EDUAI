import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Authentication token is required' });
    }

    req.user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export default auth;
