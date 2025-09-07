import express from 'express';
import User from '../models/User.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', requireAdminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalUsers: total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// Get user by ID (admin only)
router.get('/:id', requireAdminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
  }
});

// Update user (admin only)
router.put('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, role, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email, phone, role, isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({
      message: 'Utilisateur mis à jour avec succès',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
    } else {
      res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur' });
    }
  }
});

// Delete user (admin only)
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});

// Get dashboard stats (admin only)
router.get('/admin/stats', requireAdminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    res.json({
      totalUsers,
      activeUsers,
      adminUsers,
      inactiveUsers: totalUsers - activeUsers
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
});

export default router;