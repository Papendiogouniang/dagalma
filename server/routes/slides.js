import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Slide from '../models/Slide.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for slide images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/slides';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'slide-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  }
});

// Get active slides (public)
router.get('/', async (req, res) => {
  try {
    const slides = await Slide.find({ isActive: true })
      .populate('event', 'title date venue')
      .populate('createdBy', 'firstName lastName')
      .sort({ order: 1, createdAt: -1 });

    res.json(slides);
  } catch (error) {
    console.error('Get slides error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des slides' });
  }
});

// Get all slides (admin)
router.get('/admin/all', requireAdminAuth, async (req, res) => {
  try {
    const slides = await Slide.find()
      .populate('event', 'title date venue')
      .populate('createdBy', 'firstName lastName')
      .sort({ order: 1, createdAt: -1 });

    res.json(slides);
  } catch (error) {
    console.error('Get all slides error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des slides' });
  }
});

// Create slide (admin only)
router.post('/', requireAdminAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image requise' });
    }

    const {
      title,
      subtitle,
      description,
      linkUrl,
      linkText,
      isActive,
      order,
      event
    } = req.body;

    const slide = new Slide({
      title,
      subtitle,
      description,
      image: `/uploads/slides/${req.file.filename}`,
      linkUrl,
      linkText,
      isActive: isActive === 'true',
      order: parseInt(order) || 0,
      event: event || null,
      createdBy: req.user._id
    });

    await slide.save();
    await slide.populate('event', 'title date venue');
    await slide.populate('createdBy', 'firstName lastName');

    res.status(201).json({
      message: 'Slide créé avec succès',
      slide
    });
  } catch (error) {
    console.error('Create slide error:', error);
    res.status(500).json({ message: 'Erreur lors de la création du slide' });
  }
});

// Update slide (admin only)
router.put('/:id', requireAdminAuth, upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (updateData.isActive) {
      updateData.isActive = updateData.isActive === 'true';
    }
    
    if (updateData.order) {
      updateData.order = parseInt(updateData.order);
    }

    if (req.file) {
      updateData.image = `/uploads/slides/${req.file.filename}`;
    }

    const slide = await Slide.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('event', 'title date venue')
     .populate('createdBy', 'firstName lastName');

    if (!slide) {
      return res.status(404).json({ message: 'Slide non trouvé' });
    }

    res.json({
      message: 'Slide mis à jour avec succès',
      slide
    });
  } catch (error) {
    console.error('Update slide error:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du slide' });
  }
});

// Delete slide (admin only)
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const slide = await Slide.findByIdAndDelete(req.params.id);

    if (!slide) {
      return res.status(404).json({ message: 'Slide non trouvé' });
    }

    // Delete image file if exists
    if (slide.image) {
      const imagePath = path.join(process.cwd(), slide.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ message: 'Slide supprimé avec succès' });
  } catch (error) {
    console.error('Delete slide error:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du slide' });
  }
});

export default router;