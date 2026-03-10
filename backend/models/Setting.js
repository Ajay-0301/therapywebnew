const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light',
  },
  density: {
    type: String,
    enum: ['comfortable', 'compact'],
    default: 'comfortable',
  },
  language: {
    type: String,
    default: 'en',
  },
  notifications: {
    type: Boolean,
    default: true,
  },
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  timezone: String,
  soundEnabled: {
    type: Boolean,
    default: true,
  },
  autoSave: {
    type: Boolean,
    default: true,
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

module.exports = mongoose.model('Setting', SettingSchema);
