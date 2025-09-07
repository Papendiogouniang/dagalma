import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    required: true,
    maxlength: 200
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'XOF'
  },
  maxTickets: {
    type: Number,
    required: true,
    min: 1
  },
  availableTickets: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Concert', 'Conference', 'Sport', 'Theatre', 'Festival', 'Autre']
  },
  image: {
    type: String,
    default: ''
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  organizerName: {
    type: String,
    required: true,
    trim: true
  },
  organizerContact: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for search
eventSchema.index({ title: 'text', description: 'text', category: 'text' });

// Check if event is sold out
eventSchema.virtual('isSoldOut').get(function() {
  return this.availableTickets === 0;
});

// Check if event is upcoming
eventSchema.virtual('isUpcoming').get(function() {
  return this.date > new Date();
});

export default mongoose.model('Event', eventSchema);