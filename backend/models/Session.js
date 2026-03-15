const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  clientName: String,
  sessionDate: {
    type: Date,
    required: true,
  },
  sessionNotes: String,
  followUpDate: Date,
  followUpNotes: String,
  duration: Number, // in minutes
  mood: String, // client mood
  diagnosis: String,
  treatment: String,
  keyTakeaways: String,
  status: {
    type: String,
    enum: ['completed', 'scheduled', 'cancelled'],
    default: 'completed',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Session', SessionSchema);
