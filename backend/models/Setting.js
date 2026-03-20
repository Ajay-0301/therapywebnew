const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  username: {
    type: String,
    index: true,
  },
  themeMode: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system',
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system',
  },
  density: {
    type: String,
    enum: ['comfortable', 'compact'],
    default: 'comfortable',
  },
  sidebarBehavior: {
    type: String,
    enum: ['expanded', 'collapsed'],
    default: 'expanded',
  },
  language: {
    type: String,
    default: 'en',
  },
  timeFormat: {
    type: String,
    enum: ['12h', '24h'],
    default: '12h',
  },
  accentColor: {
    type: String,
    default: '#667eea',
  },
  practiceName: {
    type: String,
    default: 'Therapy',
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
