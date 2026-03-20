const Appointment = require('../models/Appointment');

exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.id }).populate('clientId');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, userId: req.user.id }).populate('clientId');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const { clientId, clientName, clientAge, duration, type, dateTime, location, notes, status } = req.body;

    if (!dateTime) {
      return res.status(400).json({ message: 'dateTime is required' });
    }

    if (!clientName) {
      return res.status(400).json({ message: 'Client name is required' });
    }

    const appointment = new Appointment({
      userId: req.user.id,
      username: req.user.username,
      clientId: clientId || null,
      clientName,
      clientAge: clientAge || null,
      duration: duration || 60,
      type,
      dateTime: new Date(dateTime),
      location,
      notes,
      status: status || 'scheduled',
    });

    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { clientName, clientAge, duration, type, dateTime, location, notes, status } = req.body;

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        username: req.user.username,
        clientName,
        clientAge,
        duration: duration || 60,
        type,
        dateTime: new Date(dateTime),
        location,
        notes,
        status,
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
