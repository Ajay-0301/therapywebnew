const mongoose = require('mongoose');

const DashboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  totalClients: {
    type: Number,
    default: 0,
  },
  activeClients: {
    type: Number,
    default: 0,
  },
  completedClients: {
    type: Number,
    default: 0,
  },
  totalSessions: {
    type: Number,
    default: 0,
  },
  upcomingAppointments: {
    type: Number,
    default: 0,
  },
  pendingFollowUps: {
    type: Number,
    default: 0,
  },
  totalEarnings: {
    type: Number,
    default: 0,
  },
  thisMonthEarnings: {
    type: Number,
    default: 0,
  },
  recentActivities: [
    {
      type: String,
      activity: String,
      timestamp: Date,
    },
  ],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Dashboard', DashboardSchema);
