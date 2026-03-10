const Client = require('../models/Client');
const Appointment = require('../models/Appointment');
const Earning = require('../models/Earning');

exports.getDashboardData = async (req, res) => {
  try {
    const clients = await Client.find();
    const appointments = await Appointment.find();

    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === 'active').length;
    const completedCases = clients.filter(c => c.status === 'completed').length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyAppointments = appointments.filter(a => {
      const apptDate = new Date(a.dateTime);
      return apptDate.getMonth() === currentMonth && apptDate.getFullYear() === currentYear;
    });

    const upcomingAppointments = appointments.filter(a => a.dateTime > new Date());

    res.json({
      totalClients,
      activeClients,
      completedCases,
      monthlyAppointments: monthlyAppointments.length,
      upcomingAppointments: upcomingAppointments.length,
      recentClients: clients.slice(-5).reverse(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 }).limit(10);
    const appointments = await Appointment.find().sort({ createdAt: -1 }).limit(10);

    res.json({
      recentClients: clients,
      recentAppointments: appointments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
