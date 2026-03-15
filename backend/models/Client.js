const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  id: String,
  date: String,
  diagnosis: String,
  treatment: String,
  notes: String,
  followUpDate: String,
  followUpNotes: String,
});

const ClientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  id: String,
  clientId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: '',
  },
  phone: String,
  age: Number,
  gender: String,
  relationshipStatus: String,
  occupation: String,
  chiefComplaints: String,
  hopi: String,
  status: {
    type: String,
    enum: ['active', 'completed', 'on-hold'],
    default: 'active',
  },
  diagnosis: String,
  location: String,
  avatar: String,
  sessionCount: {
    type: Number,
    default: 0,
  },
  sessions: [SessionSchema],
  sessionHistory: [SessionSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Client', ClientSchema);
