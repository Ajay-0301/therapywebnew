const Earning = require('../models/Earning');

exports.getAllEarnings = async (req, res) => {
  try {
    const earnings = await Earning.find({ userId: req.user.id });
    res.json(earnings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEarningsByMonth = async (req, res) => {
  try {
    const { month, year } = req.query;
    const earnings = await Earning.find({ 
      userId: req.user.id,
      month: parseInt(month), 
      year: parseInt(year) 
    });
    res.json(earnings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addEarning = async (req, res) => {
  try {
    const { day, month, year, amount } = req.body;

    if (day === undefined || month === undefined || year === undefined || amount === undefined) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const existingEarning = await Earning.findOne({ userId: req.user.id, day, month, year });
    if (existingEarning) {
      existingEarning.amount = amount;
      existingEarning.timestamp = new Date();
      await existingEarning.save();
      return res.json(existingEarning);
    }

    const earning = new Earning({
      userId: req.user.id,
      day,
      month,
      year,
      amount,
    });

    await earning.save();
    res.status(201).json(earning);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEarning = async (req, res) => {
  try {
    const { amount } = req.body;

    const earning = await Earning.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { amount, timestamp: new Date() },
      { new: true }
    );

    if (!earning) {
      return res.status(404).json({ message: 'Earning not found' });
    }

    res.json(earning);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEarning = async (req, res) => {
  try {
    const earning = await Earning.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!earning) {
      return res.status(404).json({ message: 'Earning not found' });
    }
    res.json({ message: 'Earning deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.saveEarnings = async (req, res) => {
  try {
    const { earnings } = req.body;

    // Delete all existing earnings for this user and save new ones
    await Earning.deleteMany({ userId: req.user.id });

    const earningsWithUserId = earnings.map(e => ({ ...e, userId: req.user.id }));
    const savedEarnings = await Earning.insertMany(earningsWithUserId);
    res.json(savedEarnings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
