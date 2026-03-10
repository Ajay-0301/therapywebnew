const Client = require('../models/Client');
const DeletedClient = require('../models/DeletedClient');

exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createClient = async (req, res) => {
  try {
    const { name, email, phone, age, status, diagnosis, location, avatar } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email required' });
    }

    const client = new Client({
      id: new Date().getTime().toString(),
      name,
      email,
      phone,
      age,
      status: status || 'active',
      diagnosis,
      location,
      avatar,
      sessions: [],
      sessionHistory: [],
    });

    await client.save();
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { name, email, phone, age, status, diagnosis, location, avatar } = req.body;

    const client = await Client.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        age,
        status,
        diagnosis,
        location,
        avatar,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Store in deleted clients
    const deletedClient = new DeletedClient({
      clientId: client._id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      status: client.status,
    });

    await deletedClient.save();
    await Client.findByIdAndDelete(req.params.id);

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addSession = async (req, res) => {
  try {
    const { date, diagnosis, treatment, notes, followUpDate } = req.body;
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const session = {
      date,
      diagnosis,
      treatment,
      notes,
      followUpDate,
    };

    client.sessionHistory.push(session);
    await client.save();

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDeletedClients = async (req, res) => {
  try {
    const deletedClients = await DeletedClient.find();
    res.json(deletedClients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
