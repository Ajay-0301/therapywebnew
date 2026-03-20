const mongoose = require('mongoose');

const FollowUpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  username: {
    type: String,
    required: true,
    index: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  externalRecordId: {
    type: String,
    index: true,
  },
  clientName: String,
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
  },
  followUpDate: {
    type: Date,
    required: true,
  },
  followUpNotes: String,
  reminderSent: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
  },
  completionDate: Date,
  completionNotes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('FollowUp', FollowUpSchema);
