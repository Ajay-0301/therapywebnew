const mongoose = require('mongoose');

const EarningSchema = new mongoose.Schema({
  day: Number,
  month: Number,
  year: Number,
  amount: {
    type: Number,
    default: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Earning', EarningSchema);
