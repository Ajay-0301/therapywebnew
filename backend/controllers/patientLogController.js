const PatientLog = require('../models/PatientLog');

exports.getAllPatientLogs = async (req, res) => {
  try {
    const logs = await PatientLog.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPatientLog = async (req, res) => {
  try {
    const payload = req.body || {};
    const log = new PatientLog({
      userId: req.user.id,
      username: req.user.username,
      dateOfVisit: payload.dateOfVisit || '',
      ipOp: payload.ipOp || '',
      ipWard: payload.ipWard || '',
      name: payload.name || '',
      age: payload.age || '',
      gender: payload.gender || '',
      ageGender: payload.ageGender || `${payload.age || ''}${payload.age && payload.gender ? ' / ' : ''}${payload.gender || ''}`.trim(),
      opNumber: payload.opNumber || '',
      diagnosis: payload.diagnosis || '',
      treatmentDone: payload.treatmentDone || '',
      cost: payload.cost || '',
    });

    await log.save();
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePatientLog = async (req, res) => {
  try {
    const existing = await PatientLog.findOne({ _id: req.params.id, userId: req.user.id });
    if (!existing) {
      return res.status(404).json({ message: 'Patient log not found' });
    }

    const allowedFields = [
      'dateOfVisit',
      'ipOp',
      'ipWard',
      'name',
      'age',
      'gender',
      'ageGender',
      'opNumber',
      'diagnosis',
      'treatmentDone',
      'cost',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.age !== undefined || updates.gender !== undefined) {
      updates.ageGender = `${updates.age || existing.age || ''}${(updates.age || existing.age) && (updates.gender || existing.gender) ? ' / ' : ''}${updates.gender || existing.gender || ''}`.trim();
    }

    updates.updatedAt = new Date();

    const updated = await PatientLog.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePatientLog = async (req, res) => {
  try {
    const deleted = await PatientLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) {
      return res.status(404).json({ message: 'Patient log not found' });
    }
    res.json({ message: 'Patient log deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
