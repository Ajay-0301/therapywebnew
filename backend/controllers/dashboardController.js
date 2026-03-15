const Client = require('../models/Client');
const Appointment = require('../models/Appointment');
const Earning = require('../models/Earning');
const Session = require('../models/Session');
const FollowUp = require('../models/FollowUp');

exports.getDashboardData = async (req, res) => {
  try {
    const clients = await Client.find({ userId: req.user.id });
    const appointments = await Appointment.find({ userId: req.user.id });
    const sessions = await Session.find({ userId: req.user.id });
    const followUps = await FollowUp.find({ userId: req.user.id });
    const earnings = await Earning.find({ userId: req.user.id });

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
    
    const totalSessions = sessions.length;
    const monthlySessionsCount = sessions.filter(s => {
      const sessionDate = new Date(s.sessionDate);
      return sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear;
    }).length;
    
    const pendingFollowUps = followUps.filter(f => f.status === 'pending').length;
    
    const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
    const monthlyEarnings = earnings
      .filter(e => e.month === currentMonth && e.year === currentYear)
      .reduce((sum, e) => sum + e.amount, 0);

    res.json({
      totalClients,
      activeClients,
      completedCases,
      monthlyAppointments: monthlyAppointments.length,
      upcomingAppointments: upcomingAppointments.length,
      totalSessions,
      monthlySessionsCount,
      pendingFollowUps,
      totalEarnings,
      monthlyEarnings,
      recentClients: clients.slice(-5).reverse(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const clients = await Client.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(10);
    const appointments = await Appointment.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(10);
    const sessions = await Session.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(10);
    const followUps = await FollowUp.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(5);

    res.json({
      recentClients: clients,
      recentAppointments: appointments,
      recentSessions: sessions,
      recentFollowUps: followUps,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
