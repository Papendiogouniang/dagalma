import express from 'express';
import axios from 'axios';
import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';
import { requireAuth } from '../middleware/auth.js';
import { generateTicketPDF, sendTicketEmail } from '../utils/ticketGenerator.js';

const router = express.Router();

// Initiate PayTech payment
router.post('/initiate', requireAuth, async (req, res) => {
  try {
    const { eventId } = req.body;

    console.log('🎫 === DÉBUT INITIATION PAIEMENT PAYTECH ===');
    console.log('🎫 Event ID:', eventId);
    console.log('🎫 User:', req.user.firstName, req.user.lastName);

    // Vérifier l'événement
    const event = await Event.findById(eventId);
    if (!event || !event.isActive) {
      console.log('❌ Événement non trouvé ou inactif');
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    if (event.availableTickets <= 0) {
      console.log('❌ Plus de billets disponibles');
      return res.status(400).json({ message: 'Plus de billets disponibles' });
    }

    console.log('✅ Événement trouvé:', event.title);
    console.log('✅ Prix:', event.price, 'FCFA');
    console.log('✅ Places disponibles:', event.availableTickets);

    // Génération de la référence de paiement unique
    const paymentRef = `KANZ-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    console.log('💳 Référence de paiement générée:', paymentRef);

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
    console.log('🎫 Ticket temporaire créé:', ticket.ticketId);
    console.log('🔗 QR Code généré:', ticket.qrCode);

    // Préparer la requête PayTech selon la documentation
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

    console.log('📤 === PAYLOAD PAYTECH ===');
    console.log(JSON.stringify(paytechPayload, null, 2));

    // Headers pour PayTech
    const headers = {
      'API_KEY': process.env.PAYTECH_API_KEY,
      'API_SECRET': process.env.PAYTECH_API_SECRET,
      'Content-Type': 'application/json'
    };

    console.log('🔑 Headers PayTech configurés');
    console.log('🔑 API_KEY:', process.env.PAYTECH_API_KEY ? 'Définie' : 'MANQUANTE');
    console.log('🔑 API_SECRET:', process.env.PAYTECH_API_SECRET ? 'Définie' : 'MANQUANTE');

    // Appel à l'API PayTech
    console.log('📡 Appel API PayTech:', process.env.PAYTECH_API_URL);
    
    const response = await axios.post(process.env.PAYTECH_API_URL, paytechPayload, {
      headers,
      timeout: 30000 // 30 secondes de timeout
    });

    console.log('✅ === RÉPONSE PAYTECH ===');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));

    if (response.data && (response.data.redirect_url || response.data.redirectUrl)) {
      const redirectUrl = response.data.redirect_url || response.data.redirectUrl;
      
      console.log('🔗 URL de redirection PayTech:', redirectUrl);
      
      res.json({
        success: true,
        message: 'Paiement initié avec succès',
        ticketId: ticket._id,
        paymentRef,
        redirect_url: redirectUrl,
        paytechResponse: response.data
      });
    } else {
      console.error('❌ Pas d\'URL de redirection dans la réponse PayTech');
      console.error('Réponse complète:', response.data);
      
      // Supprimer le ticket en cas d'erreur
      await Ticket.findByIdAndDelete(ticket._id);
      
      res.status(500).json({
        success: false,
        message: 'Erreur PayTech: URL de redirection manquante',
        error: response.data
      });
    }

  } catch (error) {
    console.error('❌ === ERREUR PAYTECH ===');
    console.error('Type:', error.constructor.name);
    console.error('Message:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    }
    
    if (error.request) {
      console.error('Request:', error.request);
    }
    
    console.error('Stack:', error.stack);

    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'initiation du paiement',
      error: error.response?.data || error.message,
      details: {
        type: error.constructor.name,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      }
    });
  }
});

// PayTech IPN Callback
router.post('/paytech/callback', async (req, res) => {
  try {
    console.log('🔔 === CALLBACK PAYTECH REÇU ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

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

    console.log('📋 Type événement:', type_event);
    console.log('📋 Référence commande:', ref_command);

    // Trouver le ticket par référence de paiement
    const ticket = await Ticket.findOne({ paymentId: ref_command })
      .populate('event')
      .populate('user');

    if (!ticket) {
      console.error('❌ Ticket non trouvé pour la référence:', ref_command);
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    console.log('🎫 Ticket trouvé:', ticket.ticketId);

    if (type_event === 'sale_complete') {
      console.log('✅ Paiement réussi - Confirmation du billet');
      
      // Paiement réussi
      ticket.status = 'confirmed';
      ticket.paymentStatus = 'completed';
      await ticket.save();

      // Décrémenter les billets disponibles
      await Event.findByIdAndUpdate(ticket.event._id, {
        $inc: { availableTickets: -1 }
      });

      console.log('✅ Billet confirmé et places mises à jour');

      // Générer le PDF du billet
      try {
        console.log('📄 Génération du PDF...');
        const pdfPath = await generateTicketPDF(ticket);
        ticket.pdfPath = pdfPath;
        await ticket.save();
        console.log('📄 PDF généré:', pdfPath);

        // Envoyer l'email avec le billet
        console.log('📧 Envoi de l\'email...');
        await sendTicketEmail(ticket);
        console.log('📧 Email envoyé à:', ticket.user.email);
      } catch (pdfError) {
        console.error('❌ Erreur PDF/Email:', pdfError);
      }

    } else if (type_event === 'sale_cancelled') {
      console.log('❌ Paiement annulé');
      ticket.status = 'cancelled';
      ticket.paymentStatus = 'cancelled';
      await ticket.save();

    } else if (type_event === 'sale_failed') {
      console.log('❌ Paiement échoué');
      ticket.status = 'cancelled';
      ticket.paymentStatus = 'failed';
      await ticket.save();
    }

    res.status(200).json({ 
      success: true,
      message: 'IPN traité avec succès' 
    });

  } catch (error) {
    console.error('❌ Erreur callback PayTech:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors du traitement de l\'IPN' 
    });
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