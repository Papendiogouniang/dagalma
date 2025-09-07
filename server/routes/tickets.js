import express from 'express';
import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';
import { requireAuth, requireAdminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get user tickets
router.get('/my-tickets', requireAuth, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id })
      .populate('event')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des billets' });
  }
});

// Get single ticket
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('event')
      .populate('user', 'firstName lastName email phone');

    if (!ticket) {
      return res.status(404).json({ message: 'Billet non trouvé' });
    }

    // Check if user owns the ticket or is admin
    if (ticket.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du billet' });
  }
});

// Verify ticket (admin only)
router.post('/verify', requireAdminAuth, async (req, res) => {
  try {
    const { qrCode } = req.body;

    const ticket = await Ticket.findOne({ qrCode })
      .populate('event')
      .populate('user', 'firstName lastName email phone');

    if (!ticket) {
      return res.status(404).json({ message: 'Billet non trouvé' });
    }

    if (ticket.status !== 'confirmed') {
      return res.status(400).json({ 
        message: 'Billet invalide',
        status: ticket.status
      });
    }

    if (ticket.status === 'used') {
      return res.status(400).json({ 
        message: 'Billet déjà utilisé',
        usedAt: ticket.usedAt,
        scannedBy: ticket.scannedBy
      });
    }

    // Check if event date has passed significantly
    const eventDate = new Date(ticket.event.date);
    const now = new Date();
    const oneDayAfter = new Date(eventDate.getTime() + (24 * 60 * 60 * 1000));

    if (now > oneDayAfter) {
      return res.status(400).json({ message: 'Billet expiré (événement passé)' });
    }

    res.json({
      message: 'Billet valide',
      ticket,
      event: ticket.event,
      user: ticket.user
    });

  } catch (error) {
    console.error('Verify ticket error:', error);
    res.status(500).json({ message: 'Erreur lors de la vérification du billet' });
  }
});

// Scan and use ticket (admin only)
router.post('/scan', requireAdminAuth, async (req, res) => {
  try {
    const { qrCode } = req.body;

    const ticket = await Ticket.findOne({ qrCode })
      .populate('event')
      .populate('user', 'firstName lastName email phone');

    if (!ticket) {
      return res.status(404).json({ message: 'Billet non trouvé' });
    }

    if (ticket.status !== 'confirmed') {
      return res.status(400).json({ 
        message: 'Billet invalide',
        status: ticket.status
      });
    }

    if (ticket.status === 'used') {
      return res.status(400).json({ 
        message: 'Billet déjà utilisé',
        usedAt: ticket.usedAt
      });
    }

    // Mark ticket as used
    ticket.status = 'used';
    ticket.usedAt = new Date();
    ticket.scannedBy = req.user._id;
    await ticket.save();

    res.json({
      message: 'Billet scanné et validé avec succès',
      ticket,
      event: ticket.event,
      user: ticket.user
    });

  } catch (error) {
    console.error('Scan ticket error:', error);
    res.status(500).json({ message: 'Erreur lors du scan du billet' });
  }
});

// Get all tickets (admin only)
router.get('/admin/all', requireAdminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '', eventId = '' } = req.query;

    const query = {};
    if (status) query.status = status;
    if (eventId) query.event = eventId;

    const tickets = await Ticket.find(query)
      .populate('event', 'title date venue')
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Ticket.countDocuments(query);

    res.json({
      tickets,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalTickets: total
    });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des billets' });
  }
});

// Download ticket PDF
router.get('/:id/download', requireAuth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('event')
      .populate('user');

    if (!ticket) {
      return res.status(404).json({ message: 'Billet non trouvé' });
    }

    // Check if user owns the ticket
    if (ticket.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    if (!ticket.pdfPath) {
      return res.status(404).json({ message: 'Fichier PDF non disponible' });
    }

    const path = require('path');
    const fs = require('fs');
    const pdfPath = path.join(process.cwd(), ticket.pdfPath);

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ message: 'Fichier PDF non trouvé' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="billet-${ticket.ticketId}.pdf"`);
    
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Download ticket error:', error);
    res.status(500).json({ message: 'Erreur lors du téléchargement du billet' });
  }
});

export default router;