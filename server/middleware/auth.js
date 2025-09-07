import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token d\'accès requis' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Utilisateur non trouvé ou inactif' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token invalide' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès administrateur requis' });
  }
  next();
};

export const requireAuth = [authenticateToken];
export const requireAdminAuth = [authenticateToken, requireAdmin];