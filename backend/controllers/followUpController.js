const FollowUp = require('../models/FollowUp');

exports.getAllFollowUps = async (req, res) => {
  try {
    const followUps = await FollowUp.find({ userId: req.user.id })
      .populate('clientId')
      .populate('sessionId')
      .sort({ followUpDate: 1 });
    res.json(followUps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPendingFollowUps = async (req, res) => {
  try {
    const followUps = await FollowUp.find({ userId: req.user.id, status: 'pending' })
      .populate('clientId')
      .sort({ followUpDate: 1 });
    res.json(followUps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFollowUpById = async (req, res) => {
  try {
    const followUp = await FollowUp.findOne({ _id: req.params.id, userId: req.user.id })
      .populate('clientId')
      .populate('sessionId');
    if (!followUp) {
      return res.status(404).json({ message: 'Follow-up not found' });
    }
    res.json(followUp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createFollowUp = async (req, res) => {
  try {
    const { clientId, clientName, sessionId, followUpDate, followUpNotes } = req.body;

    if (!clientId || !followUpDate) {
      return res.status(400).json({ message: 'Client ID and follow-up date required' });
    }

    const followUp = new FollowUp({
      userId: req.user.id,
      clientId,
      clientName,
      sessionId,
      followUpDate,
      followUpNotes,
      status: 'pending',
    });

    await followUp.save();
    res.status(201).json(followUp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateFollowUp = async (req, res) => {
  try {
    const { clientId, clientName, followUpDate, followUpNotes, status, completionDate, completionNotes, reminderSent } = req.body;

    const followUp = await FollowUp.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        clientId,
        clientName,
        followUpDate,
        followUpNotes,
        status,
        completionDate,
        completionNotes,
        reminderSent,
        updatedAt: new Date(),
      },
      { new: true }
    ).populate('clientId').populate('sessionId');

    if (!followUp) {
      return res.status(404).json({ message: 'Follow-up not found' });
    }

    res.json(followUp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!followUp) {
      return res.status(404).json({ message: 'Follow-up not found' });
    }
    res.json({ message: 'Follow-up deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markFollowUpComplete = async (req, res) => {
  try {
    const { completionNotes } = req.body;

    const followUp = await FollowUp.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        status: 'completed',
        completionDate: new Date(),
        completionNotes,
        updatedAt: new Date(),
      },
      { new: true }
    ).populate('clientId').populate('sessionId');

    if (!followUp) {
      return res.status(404).json({ message: 'Follow-up not found' });
    }

    res.json(followUp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
