import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Initiate PayTech payment
router.post('/initiate', requireAuth, async (req, res) => {
  try {
    const { eventId } = req.body;

    // Vérifier l'événement
    const event = await Event.findById(eventId);
    if (!event || !event.isActive) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    if (event.availableTickets <= 0) {
      return res.status(400).json({ message: 'Plus de billets disponibles' });
    }

    // Génération de la référence de paiement unique
    const paymentRef = `KZ-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const ticketId = `TICKET-${uuidv4()}`;
    const qrCodeData = crypto.randomBytes(16).toString('hex');

    // Créer un ticket
    const ticket = new Ticket({
      ticketId,
      qrCode: qrCodeData,
      event: eventId,
      user: req.user._id,
      price: event.price,
      paymentId: paymentRef,
      paymentMethod: 'PAYTECH',
      status: 'pending',
      paymentStatus: 'pending'
    });

    await ticket.save();

    // Préparer la requête PayTech
    const paytechPayload = {
      api_key: process.env.PAYTECH_API_KEY,
      api_secret: process.env.PAYTECH_API_SECRET,
      amount: event.price,
      currency: 'XOF',
      ref_command: paymentRef,
      item_name: `Billet - ${event.title}`,
      command_name: `Réservation ${event.title}`,
      env: process.env.PAYTECH_ENV || 'test',
      ipn_url: process.env.IPN_URL,
      success_url: `${process.env.FRONTEND_URL}/payment-success?ticketId=${ticket._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/events`,
      custom_field: JSON.stringify({
        ticket_id: ticket._id.toString(),
        event_id: eventId,
        user_id: req.user._id.toString(),
        client_name: `${req.user.firstName} ${req.user.lastName}`,
        client_phone: req.user.phone,
        client_email: req.user.email
      })
    };

    const response = await axios.post(process.env.PAYTECH_API_URL, paytechPayload, {
      headers: { 'Content-Type': 'application/json' }
    });

    res.json({
      message: 'Paiement initié avec succès',
      ticketId: ticket._id,
      paymentRef,
      redirect_url: response.data.redirect_url,
      paytechResponse: response.data
    });

  } catch (error) {
    console.error('❌ PayTech initiation error:', error.response?.data || error.message);
    return res.status(500).json({
      message: 'Erreur lors de l\'initiation du paiement',
      error: error.response?.data || error.message
    });
  }
});

export default router;
