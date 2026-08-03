const mongoose = require('mongoose');

const PatientLogSchema = new mongoose.Schema({
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
  dateOfVisit: {
    type: String,
    default: '',
  },
  ipOp: {
    type: String,
    default: '',
  },
  ipWard: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  age: {
    type: String,
    default: '',
  },
  gender: {
    type: String,
    default: '',
  },
  ageGender: {
    type: String,
    default: '',
  },
  opNumber: {
    type: String,
    default: '',
  },
  diagnosis: {
    type: String,
    default: '',
  },
  treatmentDone: {
    type: String,
    default: '',
  },
  cost: {
    type: String,
    default: '',
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

module.exports = mongoose.model('PatientLog', PatientLogSchema);
