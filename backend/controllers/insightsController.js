const Client = require('../models/Client');
const DeletedClient = require('../models/DeletedClient');
const Appointment = require('../models/Appointment');
const Earning = require('../models/Earning');

exports.getInsightsData = async (req, res) => {
  try {
    const { month, year } = req.query;
    const selectedMonth = month ? parseInt(month) : new Date().getMonth();
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    const clients = await Client.find();
    const deletedClients = await DeletedClient.find();
    const appointments = await Appointment.find();
    const earnings = await Earning.find();

    // Filter clients added this month
    const clientsAddedThisMonth = clients.filter(c => {
      const createdDate = new Date(c.createdAt);
      return createdDate.getMonth() === selectedMonth && createdDate.getFullYear() === selectedYear;
    });

    // Clients deleted this month
    const clientsDeletedThisMonth = deletedClients.filter(dc => {
      const deletedDate = new Date(dc.deletedAt);
      return deletedDate.getMonth() === selectedMonth && deletedDate.getFullYear() === selectedYear;
    });

    const activeClients = clientsAddedThisMonth.filter(c => c.status === 'active').length;
    const completedCases = clientsAddedThisMonth.filter(c => c.status === 'completed').length;

    // Month-wise appointments
    const monthAppointments = appointments.filter(a => {
      const apptDate = new Date(a.dateTime);
      return apptDate.getMonth() === selectedMonth && apptDate.getFullYear() === selectedYear;
    });

    // Age distribution
    const ages = clientsAddedThisMonth.map(c => c.age).filter(a => a);
    const ageDistribution = {
      min: ages.length > 0 ? Math.min(...ages) : 0,
      max: ages.length > 0 ? Math.max(...ages) : 0,
      avg: ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0,
    };

    // Month earnings
    const monthEarnings = earnings.filter(e => e.month === selectedMonth && e.year === selectedYear);
    const totalMonthEarnings = monthEarnings.reduce((sum, e) => sum + e.amount, 0);

    res.json({
      totalClients: clientsAddedThisMonth.length,
      activeClients,
      completedCases,
      monthlyAppointments: monthAppointments.length,
      ageDistribution,
      totalMonthEarnings,
      monthEarnings,
      deletedClients: clientsDeletedThisMonth.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClientsStats = async (req, res) => {
  try {
    const clients = await Client.find();
    const deletedClients = await DeletedClient.find();

    const stats = {
      total: clients.length,
      active: clients.filter(c => c.status === 'active').length,
      completed: clients.filter(c => c.status === 'completed').length,
      deleted: deletedClients.length,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAgeDistribution = async (req, res) => {
  try {
    const clients = await Client.find();
    const ages = clients.map(c => c.age).filter(a => a);

    const ageRanges = {
      '18-25': ages.filter(a => a >= 18 && a <= 25).length,
      '26-35': ages.filter(a => a >= 26 && a <= 35).length,
      '36-45': ages.filter(a => a >= 36 && a <= 45).length,
      '46-55': ages.filter(a => a >= 46 && a <= 55).length,
      '55+': ages.filter(a => a > 55).length,
    };

    res.json({
      min: ages.length > 0 ? Math.min(...ages) : 0,
      max: ages.length > 0 ? Math.max(...ages) : 0,
      avg: ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0,
      ranges: ageRanges,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEarningsStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    const selectedMonth = month ? parseInt(month) : new Date().getMonth();
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    const earnings = await Earning.find({ month: selectedMonth, year: selectedYear });
    const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
    const avgDaily = earnings.length > 0 ? totalEarnings / earnings.length : 0;

    res.json({
      total: totalEarnings,
      avgDaily,
      earnings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
