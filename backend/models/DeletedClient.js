const mongoose = require('mongoose');

const DeletedClientSchema = new mongoose.Schema({
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
  originalClientMongoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    index: true,
  },
  originalClientData: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
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
