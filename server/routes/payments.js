import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';
import { requireAuth } from '../middleware/auth.js';
import { generateTicketPDF, sendTicketEmail } from '../utils/ticketGenerator.js';

const router = express.Router();

// Initiate PayTech payment
router.post('/initiate', requireAuth, async (req, res) => {
  try {
    const { eventId } = req.body;

    console.log('🎫 Initiating payment for event:', eventId);

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
    
    console.log('💳 Payment reference generated:', paymentRef);

    // Créer un ticket temporaire
    const ticket = new Ticket({
      event: eventId,
      user: req.user._id,
      price: event.price,
      paymentId: paymentRef,
      paymentMethod: 'PAYTECH',
      status: 'pending',
      paymentStatus: 'pending'
    });

    await ticket.save();
    console.log('🎫 Ticket created:', ticket.ticketId);

    // Préparer la requête PayTech
    const paytechPayload = {
      item_name: `Billet - ${event.title}`,
      item_price: event.price,
      command_name: `Réservation ${event.title}`,
      ref_command: paymentRef,
      env: process.env.PAYTECH_ENV || 'test',
      currency: 'XOF',
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

    console.log('📤 PayTech payload:', paytechPayload);

    // Headers pour PayTech
    const headers = {
      'API_KEY': process.env.PAYTECH_API_KEY,
      'API_SECRET': process.env.PAYTECH_API_SECRET,
      'Content-Type': 'application/json'
    };

    console.log('🔑 PayTech headers prepared');

    const response = await axios.post(process.env.PAYTECH_API_URL, paytechPayload, {
      headers
    });

    console.log('✅ PayTech response:', response.data);

    if (response.data && response.data.redirect_url) {
      res.json({
        message: 'Paiement initié avec succès',
        ticketId: ticket._id,
        paymentRef,
        redirect_url: response.data.redirect_url,
        paytechResponse: response.data
      });
    } else {
      console.error('❌ No redirect URL in PayTech response:', response.data);
      res.status(500).json({
        message: 'Erreur PayTech: URL de redirection manquante',
        error: response.data
      });
    }

  } catch (error) {
    console.error('❌ PayTech initiation error:', error.response?.data || error.message);
    
    // Supprimer le ticket en cas d'erreur
    if (error.ticketId) {
      try {
        await Ticket.findByIdAndDelete(error.ticketId);
      } catch (deleteError) {
        console.error('Error deleting failed ticket:', deleteError);
      }
    }

    return res.status(500).json({
      message: 'Erreur lors de l\'initiation du paiement',
      error: error.response?.data || error.message
    });
  }
});

// PayTech IPN Callback
router.post('/paytech/callback', async (req, res) => {
  try {
    console.log('🔔 PayTech IPN received:', req.body);

    const { 
      type_event, 
      ref_command, 
      item_name, 
      item_price, 
      payment_method, 
      phone_number, 
      currency,
      custom_field 
    } = req.body;

    // Trouver le ticket par référence de paiement
    const ticket = await Ticket.findOne({ paymentId: ref_command })
      .populate('event')
      .populate('user');

    if (!ticket) {
      console.error('❌ Ticket not found for payment reference:', ref_command);
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    console.log('🎫 Ticket found:', ticket.ticketId);

    if (type_event === 'sale_complete') {
      // Paiement réussi
      ticket.status = 'confirmed';
      ticket.paymentStatus = 'completed';
      await ticket.save();

      // Décrémenter les billets disponibles
      await Event.findByIdAndUpdate(ticket.event._id, {
        $inc: { availableTickets: -1 }
      });

      console.log('✅ Payment completed for ticket:', ticket.ticketId);

      // Générer le PDF du billet
      try {
        const pdfPath = await generateTicketPDF(ticket);
        ticket.pdfPath = pdfPath;
        await ticket.save();
        console.log('📄 PDF generated:', pdfPath);

        // Envoyer l'email avec le billet
        await sendTicketEmail(ticket);
        console.log('📧 Email sent to:', ticket.user.email);
      } catch (pdfError) {
        console.error('❌ PDF/Email error:', pdfError);
      }

    } else if (type_event === 'sale_cancelled') {
      // Paiement annulé
      ticket.status = 'cancelled';
      ticket.paymentStatus = 'cancelled';
      await ticket.save();
      console.log('❌ Payment cancelled for ticket:', ticket.ticketId);

    } else if (type_event === 'sale_failed') {
      // Paiement échoué
      ticket.status = 'cancelled';
      ticket.paymentStatus = 'failed';
      await ticket.save();
      console.log('❌ Payment failed for ticket:', ticket.ticketId);
    }

    res.status(200).json({ message: 'IPN processed successfully' });

  } catch (error) {
    console.error('❌ PayTech IPN error:', error);
    res.status(500).json({ message: 'Erreur lors du traitement de l\'IPN' });
  }
});

// Get payment status
router.get('/status/:ticketId', requireAuth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId)
      .populate('event')
      .populate('user');

    if (!ticket) {
      return res.status(404).json({ message: 'Billet non trouvé' });
    }

    // Vérifier que l'utilisateur est propriétaire du billet
    if (ticket.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du statut' });
  }
});

export default router;