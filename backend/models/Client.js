const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  date: String,
  diagnosis: String,
  treatment: String,
  notes: String,
  followUpDate: String,
});

const ClientSchema = new mongoose.Schema({
  id: String,
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: String,
  age: Number,
  status: {
    type: String,
    enum: ['active', 'completed', 'on-hold'],
    default: 'active',
  },
  diagnosis: String,
  location: String,
  avatar: String,
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
