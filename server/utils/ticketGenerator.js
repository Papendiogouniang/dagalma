import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

export const generateTicketPDF = async (ticket) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Ensure upload directory exists
      const pdfDir = path.join(process.cwd(), 'uploads', 'tickets');
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      const pdfPath = path.join(pdfDir, `ticket-${ticket._id}.pdf`);
      
      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      // Pipe to file
      doc.pipe(fs.createWriteStream(pdfPath));

      // Generate QR Code
      const qrCodeDataURL = await QRCode.toDataURL(
        `${process.env.QR_CODE_BASE_URL || 'http://localhost:5173/verify-ticket'}/${ticket.qrCode}`
      );
      const qrCodeBuffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');

      // Header with Kanzey branding
      doc.fillColor('#1a1a1a')
         .fontSize(32)
         .font('Helvetica-Bold')
         .text('KANZEY', 50, 50);

      doc.fillColor('#ffd700')
         .fontSize(16)
         .font('Helvetica')
         .text('Votre billet électronique', 50, 90);

      // Event title
      doc.fillColor('#1a1a1a')
         .fontSize(26)
         .font('Helvetica-Bold')
         .text(ticket.event.title, 50, 140, {
           width: 400,
           align: 'left'
         });

      // Event details
      const eventDate = new Date(ticket.event.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      doc.fillColor('#333333')
         .fontSize(14)
         .font('Helvetica')
         .text(`📅 Date: ${eventDate}`, 50, 190)
         .text(`🕐 Heure: ${ticket.event.time}`, 50, 210)
         .text(`📍 Lieu: ${ticket.event.venue}`, 50, 230)
         .text(`🏙️ Ville: ${ticket.event.city}`, 50, 250);

      // Ticket info section
      doc.fillColor('#ffd700')
         .fontSize(18)
         .font('Helvetica-Bold')
         .text('Informations du billet', 50, 290);

      doc.fillColor('#333333')
         .fontSize(12)
         .font('Helvetica')
         .text(`N° de billet: ${ticket.ticketId}`, 50, 320)
         .text(`Prix: ${ticket.price.toLocaleString()} ${ticket.currency}`, 50, 340)
         .text(`Statut: Confirmé`, 50, 360)
         .text(`Méthode: PayTech`, 50, 380);

      // User info section
      doc.fillColor('#ffd700')
         .fontSize(18)
         .font('Helvetica-Bold')
         .text('Titulaire du billet', 50, 420);

      doc.fillColor('#333333')
         .fontSize(12)
         .font('Helvetica')
         .text(`${ticket.user.firstName} ${ticket.user.lastName}`, 50, 450)
         .text(`${ticket.user.email}`, 50, 470)
         .text(`${ticket.user.phone}`, 50, 490);

      // QR Code
      doc.image(qrCodeBuffer, 350, 320, {
        width: 180,
        height: 180
      });

      doc.fillColor('#333333')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('Présentez ce QR code à l\'entrée', 350, 510, {
           width: 180,
           align: 'center'
         });

      // Important instructions box
      doc.rect(50, 550, 500, 100)
         .stroke('#ffd700')
         .lineWidth(2);

      doc.fillColor('#ffd700')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('⚠️ INSTRUCTIONS IMPORTANTES', 60, 570);

      doc.fillColor('#333333')
         .fontSize(10)
         .font('Helvetica')
         .text('• Présentez-vous à l\'entrée 30 minutes avant l\'événement', 60, 590)
         .text('• Ce billet est valide une seule fois et personnel', 60, 605)
         .text('• Ayez une pièce d\'identité avec vous', 60, 620)
         .text('• Aucun remboursement sauf annulation de l\'événement', 60, 635);

      // Footer
      doc.fillColor('#999999')
         .fontSize(9)
         .font('Helvetica')
         .text(`Billet généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 50, 720)
         .text('Kanzey - Plateforme de billetterie événementielle', 50, 735)
         .text('Email: contact@kanzey.co | Tél: +221 77 123 45 67', 50, 750);

      doc.end();

      doc.on('end', () => {
        resolve(`/uploads/tickets/ticket-${ticket._id}.pdf`);
      });

      doc.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
};

export const sendTicketEmail = async (ticket) => {
  try {
    const eventDate = new Date(ticket.event.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Generate QR code for email
    const qrCodeDataURL = await QRCode.toDataURL(
      `${process.env.QR_CODE_BASE_URL || 'http://localhost:5173/verify-ticket'}/${ticket.qrCode}`
    );

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: ticket.user.email,
      subject: `🎫 Votre billet pour ${ticket.event.title} - Kanzey`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1a1a1a, #333333); color: white; padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; color: #ffd700; font-size: 36px;">KANZEY</h1>
            <p style="margin: 10px 0 0 0; color: #cccccc; font-size: 16px;">Votre plateforme de billetterie</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px; background: white;">
            <h2 style="color: #1a1a1a; margin-top: 0; font-size: 24px;">🎉 Félicitations ${ticket.user.firstName}!</h2>
            <p style="color: #333333; font-size: 16px; line-height: 1.6;">
              Votre paiement a été confirmé avec succès via <strong>PayTech</strong>. 
              Vous trouverez ci-joint votre billet électronique.
            </p>
            
            <!-- Event Details -->
            <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #ffd700;">
              <h3 style="color: #1a1a1a; margin-top: 0; font-size: 20px;">📋 Détails de l'événement</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold; width: 30%;">Événement:</td>
                  <td style="padding: 8px 0; color: #333;">${ticket.event.title}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Date:</td>
                  <td style="padding: 8px 0; color: #333;">${eventDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Heure:</td>
                  <td style="padding: 8px 0; color: #333;">${ticket.event.time}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Lieu:</td>
                  <td style="padding: 8px 0; color: #333;">${ticket.event.venue}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Ville:</td>
                  <td style="padding: 8px 0; color: #333;">${ticket.event.city}</td>
                </tr>
              </table>
            </div>
            
            <!-- Ticket Info -->
            <div style="background: #fff3cd; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #ffd700;">
              <h3 style="color: #856404; margin-top: 0; font-size: 18px;">🎫 Votre billet</h3>
              <p style="color: #856404; margin: 5px 0;"><strong>N° de billet:</strong> ${ticket.ticketId}</p>
              <p style="color: #856404; margin: 5px 0;"><strong>Prix:</strong> ${ticket.price.toLocaleString()} ${ticket.currency}</p>
              <p style="color: #856404; margin: 5px 0;"><strong>Paiement:</strong> PayTech</p>
            </div>

            <!-- QR Code -->
            <div style="text-align: center; margin: 30px 0;">
              <h3 style="color: #1a1a1a; margin-bottom: 15px;">📱 QR Code d'entrée</h3>
              <img src="${qrCodeDataURL}" alt="QR Code" style="width: 200px; height: 200px; border: 2px solid #ffd700; border-radius: 8px;">
              <p style="color: #666; font-size: 12px; margin-top: 10px;">Présentez ce QR code à l'entrée</p>
            </div>
            
            <!-- Instructions -->
            <div style="background: #d1ecf1; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #bee5eb;">
              <h3 style="color: #0c5460; margin-top: 0; font-size: 18px;">📱 Instructions importantes</h3>
              <ul style="color: #0c5460; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>Présentez-vous à l'entrée 30 minutes avant l'événement</li>
                <li>Ayez votre billet PDF ou votre smartphone prêt pour le scan</li>
                <li>Une pièce d'identité pourra vous être demandée</li>
                <li>Ce billet est personnel et incessible</li>
                <li>Conservez ce email jusqu'à l'événement</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <p style="color: #333333; font-size: 16px; margin-bottom: 10px;">
                Nous vous souhaitons un excellent événement!
              </p>
              <p style="color: #ffd700; font-weight: bold; font-size: 18px;">
                L'équipe Kanzey
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #1a1a1a; color: #cccccc; padding: 30px; text-align: center; font-size: 12px;">
            <p style="margin: 0 0 10px 0;">© 2025 Kanzey - Tous droits réservés</p>
            <p style="margin: 0;">Pour toute question, contactez-nous à contact@kanzey.co</p>
            <p style="margin: 10px 0 0 0;">📞 +221 77 123 45 67 | 🌐 www.kanzey.co</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `billet-${ticket.ticketId}.pdf`,
          path: path.join(process.cwd(), ticket.pdfPath)
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Ticket email sent successfully to:', ticket.user.email);
  } catch (error) {
    console.error('❌ Send ticket email error:', error);
    throw error;
  }
};

export const sendWhatsAppTicket = async (ticket) => {
  try {
    // Generate WhatsApp message
    const eventDate = new Date(ticket.event.date).toLocaleDateString('fr-FR');
    const message = `🎫 *KANZEY - Votre billet confirmé*

🎉 Bonjour ${ticket.user.firstName}!

Votre billet pour *${ticket.event.title}* a été confirmé avec succès.

📋 *Détails:*
📅 Date: ${eventDate}
🕐 Heure: ${ticket.event.time}
📍 Lieu: ${ticket.event.venue}, ${ticket.event.city}
💰 Prix: ${ticket.price.toLocaleString()} FCFA
🎫 N° Billet: ${ticket.ticketId}

⚠️ *Important:*
• Présentez-vous 30min avant l'événement
• Ayez votre QR code prêt
• Pièce d'identité requise

🔗 Vérifiez votre billet: ${process.env.QR_CODE_BASE_URL}/${ticket.qrCode}

Merci de votre confiance! 🙏
L'équipe Kanzey`;

    // Format phone number for WhatsApp
    let phone = ticket.user.phone.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '221' + phone.substring(1);
    } else if (!phone.startsWith('221')) {
      phone = '221' + phone;
    }

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
    
    console.log(`📱 WhatsApp notification prepared for: +${phone}`);
    console.log(`🔗 WhatsApp URL: ${whatsappUrl}`);
    
    // Note: In a real implementation, you would use WhatsApp Business API
    // For now, we just log the URL that could be used
    
    return { success: true, whatsappUrl, phone: `+${phone}` };
  } catch (error) {
    console.error('❌ WhatsApp notification error:', error);
    throw error;
  }
};