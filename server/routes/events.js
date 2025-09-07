import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Event from '../models/Event.js';
import { requireAuth, requireAdminAuth } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/events';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
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
      cb(new Error('Seules les images sont autorisées (JPEG, JPG, PNG, GIF, WEBP)'));
    }
  }
});

// Get all events (public)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      search = '', 
      category = '', 
      featured = '',
      sortBy = 'date'
    } = req.query;

    const query = { isActive: true };

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    const sortOptions = {};
    switch (sortBy) {
      case 'date':
        sortOptions.date = 1;
        break;
      case 'price':
        sortOptions.price = 1;
        break;
      case 'title':
        sortOptions.title = 1;
        break;
      default:
        sortOptions.date = 1;
    }

    const events = await Event.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Event.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalEvents: total
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des événements' });
  }
});

// Get single event (public)
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, isActive: true })
      .populate('createdBy', 'firstName lastName');

    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'événement' });
  }
});

// Create event (admin only)
router.post('/', requireAdminAuth, upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      description,
      shortDescription,
      date,
      time,
      venue,
      address,
      city,
      price,
      maxTickets,
      category,
      isFeatured,
      organizerName,
      organizerContact,
      tags
    } = req.body;

    const event = new Event({
      title,
      description,
      shortDescription,
      date: new Date(date),
      time,
      venue,
      address,
      city,
      price: parseFloat(price),
      maxTickets: parseInt(maxTickets),
      availableTickets: parseInt(maxTickets),
      category,
      isFeatured: isFeatured === 'true',
      organizerName,
      organizerContact,
      tags: tags ? JSON.parse(tags) : [],
      image: req.file ? `/uploads/events/${req.file.filename}` : '',
      createdBy: req.user._id
    });

    await event.save();
    await event.populate('createdBy', 'firstName lastName');

    res.status(201).json({
      message: 'Événement créé avec succès',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'événement' });
  }
});

// Update event (admin only)
router.put('/:id', requireAdminAuth, upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }
    
    if (updateData.price) {
      updateData.price = parseFloat(updateData.price);
    }
    
    if (updateData.maxTickets) {
      updateData.maxTickets = parseInt(updateData.maxTickets);
    }
    
    if (updateData.isFeatured) {
      updateData.isFeatured = updateData.isFeatured === 'true';
    }
    
    if (updateData.tags) {
      updateData.tags = JSON.parse(updateData.tags);
    }

    if (req.file) {
      updateData.image = `/uploads/events/${req.file.filename}`;
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('createdBy', 'firstName lastName');

    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    res.json({
      message: 'Événement mis à jour avec succès',
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'événement' });
  }
});

// Delete event (admin only)
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    // Delete image file if exists
    if (event.image) {
      const imagePath = path.join(process.cwd(), event.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ message: 'Événement supprimé avec succès' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'événement' });
  }
});

// Get event categories
router.get('/utils/categories', (req, res) => {
  const categories = ['Concert', 'Conference', 'Sport', 'Theatre', 'Festival', 'Autre'];
  res.json(categories);
});

export default router;