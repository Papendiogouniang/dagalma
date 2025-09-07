import mongoose from 'mongoose';
import crypto from 'crypto';

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true
  },
  qrCode: {
    type: String,
    unique: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'XOF'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'used', 'cancelled'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['ORANGE_MONEY', 'WAVE', 'FREE_MONEY', 'TOUCH_POINT', 'PAYTECH', 'CARD']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  pdfPath: {
    type: String,
    default: ''
  },
  usedAt: {
    type: Date,
    default: null
  },
  scannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// === Génération automatique de ticketId et QR code avant validation ===
ticketSchema.pre('validate', function(next) {
  if (!this.ticketId) {
    // Exemple: TICKET-20250907-ABCDE
    this.ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  }

  if (!this.qrCode) {
    this.qrCode = crypto.randomBytes(16).toString('hex');
  }

  next();
});

export default mongoose.model('Ticket', ticketSchema);
