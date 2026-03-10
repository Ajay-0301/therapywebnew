const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  id: String,
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
  },
  clientName: String,
  type: String,
  dateTime: Date,
  location: String,
  notes: String,
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
