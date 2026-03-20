const Session = require('../models/Session');

exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.id })
      .populate('clientId')
      .sort({ sessionDate: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.user.id })
      .populate('clientId');
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSession = async (req, res) => {
  try {
    const { clientId, clientName, sessionDate, sessionNotes, followUpDate, followUpNotes, duration, mood, diagnosis, treatment, keyTakeaways, status } = req.body;

    if (!clientId || !sessionDate) {
      return res.status(400).json({ message: 'Client ID and session date required' });
    }

    const session = new Session({
      userId: req.user.id,
      username: req.user.username,
      clientId,
      clientName,
      sessionDate,
      sessionNotes,
      followUpDate,
      followUpNotes,
      duration,
      mood,
      diagnosis,
      treatment,
      keyTakeaways,
      status: status || 'completed',
    });

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const { clientId, clientName, sessionDate, sessionNotes, followUpDate, followUpNotes, duration, mood, diagnosis, treatment, keyTakeaways, status } = req.body;

    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        username: req.user.username,
        clientId,
        clientName,
        sessionDate,
        sessionNotes,
        followUpDate,
        followUpNotes,
        duration,
        mood,
        diagnosis,
        treatment,
        keyTakeaways,
        status,
        updatedAt: new Date(),
      },
      { new: true }
    ).populate('clientId');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClientSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.id, clientId: req.params.clientId })
      .sort({ sessionDate: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
