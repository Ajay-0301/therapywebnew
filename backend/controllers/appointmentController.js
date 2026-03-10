const Appointment = require('../models/Appointment');

exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate('clientId');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('clientId');
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
    const { clientId, clientName, type, dateTime, location, notes, status } = req.body;

    if (!clientId || !dateTime) {
      return res.status(400).json({ message: 'Client ID and dateTime required' });
    }

    const appointment = new Appointment({
      id: new Date().getTime().toString(),
      clientId,
      clientName,
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
    const { clientName, type, dateTime, location, notes, status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        clientName,
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
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
