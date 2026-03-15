const mongoose = require('mongoose');

const DeletedClientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  clientId: String,
  name: String,
  email: String,
  phone: String,
  status: String,
  deletedAt: {
    type: Date,
    default: Date.now,
  },
  deletedReason: String,
});

module.exports = mongoose.model('DeletedClient', DeletedClientSchema);
