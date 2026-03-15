const Client = require('../models/Client');
const DeletedClient = require('../models/DeletedClient');

exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.find({ userId: req.user.id });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, userId: req.user.id });
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
    const { name, email, phone, age, status, diagnosis, location, avatar, clientId, gender, relationshipStatus, occupation, chiefComplaints, hopi } = req.body;

    if (!name || !clientId || (!email && !phone)) {
      return res.status(400).json({ message: 'Name, client ID, and either email or phone required' });
    }

    const client = new Client({
      userId: req.user.id,
      id: new Date().getTime().toString(),
      clientId,
      name,
      email,
      phone,
      age,
      gender,
      relationshipStatus,
      occupation,
      chiefComplaints,
      hopi,
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
    const { name, email, phone, age, status, diagnosis, location, avatar, clientId, gender, relationshipStatus, occupation, chiefComplaints, hopi, sessionHistory, sessionCount, sessions } = req.body;

    console.log('updateClient called with:', { 
      id: req.params.id, 
      hasSessionHistory: sessionHistory !== undefined,
      sessionHistoryLength: sessionHistory?.length,
      chiefComplaints,
      hopi
    });

    const updateData = {};
    
    // Only update fields that are provided
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (age !== undefined) updateData.age = age;
    if (clientId !== undefined) updateData.clientId = clientId;
    if (gender !== undefined) updateData.gender = gender;
    if (relationshipStatus !== undefined) updateData.relationshipStatus = relationshipStatus;
    if (occupation !== undefined) updateData.occupation = occupation;
    if (chiefComplaints !== undefined) updateData.chiefComplaints = chiefComplaints;
    if (hopi !== undefined) updateData.hopi = hopi;
    if (status !== undefined) updateData.status = status;
    if (diagnosis !== undefined) updateData.diagnosis = diagnosis;
    if (location !== undefined) updateData.location = location;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (sessionHistory !== undefined) updateData.sessionHistory = sessionHistory;
    if (sessionCount !== undefined) updateData.sessionCount = sessionCount;
    if (sessions !== undefined) updateData.sessions = sessions;
    
    updateData.updatedAt = new Date();

    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updateData,
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    console.log('Client updated successfully:', { 
      name: client.name, 
      sessionHistoryLength: client.sessionHistory?.length,
      chiefComplaints: client.chiefComplaints,
      hopi: client.hopi
    });
    
    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, userId: req.user.id });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Store in deleted clients
    const deletedClient = new DeletedClient({
      userId: req.user.id,
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
    const client = await Client.findOne({ _id: req.params.id, userId: req.user.id });

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
    const deletedClients = await DeletedClient.find({ userId: req.user.id });
    res.json(deletedClients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDeletedClient = async (req, res) => {
  try {
    const deletedClient = await DeletedClient.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deletedClient) {
      return res.status(404).json({ message: 'Deleted client record not found' });
    }
    res.json({ message: 'Deleted client permanently removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
