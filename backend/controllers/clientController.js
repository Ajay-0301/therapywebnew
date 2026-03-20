const Client = require('../models/Client');
const DeletedClient = require('../models/DeletedClient');
const Session = require('../models/Session');
const FollowUp = require('../models/FollowUp');

async function syncSessionCollections({ userId, username, clientId, clientName, previousHistory = [], nextHistory = [] }) {
  const previousById = new Map((previousHistory || []).filter((r) => r?.id).map((r) => [r.id, r]));
  const nextById = new Map((nextHistory || []).filter((r) => r?.id).map((r) => [r.id, r]));

  const removedIds = [];
  for (const id of previousById.keys()) {
    if (!nextById.has(id)) removedIds.push(id);
  }

  if (removedIds.length > 0) {
    await Session.deleteMany({ userId, clientId, externalRecordId: { $in: removedIds } });
    await FollowUp.deleteMany({ userId, clientId, externalRecordId: { $in: removedIds } });
  }

  for (const [recordId, record] of nextById.entries()) {
    const sessionDate = record?.date ? new Date(record.date) : new Date();
    await Session.findOneAndUpdate(
      { userId, clientId, externalRecordId: recordId },
      {
        userId,
        username,
        clientId,
        externalRecordId: recordId,
        clientName,
        sessionDate,
        sessionNotes: record.notes || '',
        followUpDate: record.followUpDate ? new Date(record.followUpDate) : undefined,
        followUpNotes: record.followUpNotes || '',
        status: 'completed',
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    if (record.followUpDate) {
      await FollowUp.findOneAndUpdate(
        { userId, clientId, externalRecordId: recordId },
        {
          userId,
          username,
          clientId,
          externalRecordId: recordId,
          clientName,
          followUpDate: new Date(record.followUpDate),
          followUpNotes: record.followUpNotes || '',
          status: 'pending',
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    } else {
      await FollowUp.deleteMany({ userId, clientId, externalRecordId: recordId });
    }
  }
}

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
      username: req.user.username,
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

    const existingClient = await Client.findOne({ _id: req.params.id, userId: req.user.id });
    if (!existingClient) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updateData,
      { new: true }
    );

    if (sessionHistory !== undefined) {
      await syncSessionCollections({
        userId: req.user.id,
        username: req.user.username,
        clientId: client._id,
        clientName: client.name,
        previousHistory: existingClient.sessionHistory || [],
        nextHistory: client.sessionHistory || [],
      });
    }

    if (name !== undefined && name !== existingClient.name) {
      await Session.updateMany({ userId: req.user.id, clientId: client._id }, { $set: { clientName: client.name, updatedAt: new Date() } });
      await FollowUp.updateMany({ userId: req.user.id, clientId: client._id }, { $set: { clientName: client.name, updatedAt: new Date() } });
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
    const snapshot = client.toObject();
    delete snapshot.__v;

    const deletedClient = new DeletedClient({
      userId: req.user.id,
      username: req.user.username,
      originalClientMongoId: client._id,
      originalClientData: snapshot,
      clientId: client.clientId,
      name: client.name,
      email: client.email,
      phone: client.phone,
      status: client.status,
    });

    await deletedClient.save();
    await Session.deleteMany({ userId: req.user.id, clientId: client._id });
    await FollowUp.deleteMany({ userId: req.user.id, clientId: client._id });
    await Client.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.restoreDeletedClient = async (req, res) => {
  try {
    const deletedClient = await DeletedClient.findOne({ _id: req.params.id, userId: req.user.id });
    if (!deletedClient) {
      return res.status(404).json({ message: 'Deleted client record not found' });
    }

    const snapshot = deletedClient.originalClientData || {};
    const restorePayload = { ...snapshot };

    delete restorePayload._id;
    delete restorePayload.__v;
    delete restorePayload.userId;
    delete restorePayload.username;

    const restoredClient = new Client({
      ...restorePayload,
      userId: req.user.id,
      username: req.user.username,
      clientId: restorePayload.clientId || deletedClient.clientId || `CL-${Date.now()}`,
      name: restorePayload.name || deletedClient.name || 'Restored Client',
      email: restorePayload.email || deletedClient.email || '',
      phone: restorePayload.phone || deletedClient.phone || '',
      status: restorePayload.status || 'active',
      sessionHistory: Array.isArray(restorePayload.sessionHistory) ? restorePayload.sessionHistory : [],
      sessions: Array.isArray(restorePayload.sessions) ? restorePayload.sessions : [],
    });

    if (deletedClient.originalClientMongoId) {
      const existingByOriginalId = await Client.findOne({ _id: deletedClient.originalClientMongoId, userId: req.user.id });
      if (!existingByOriginalId) {
        restoredClient._id = deletedClient.originalClientMongoId;
      }
    }

    await restoredClient.save();

    await syncSessionCollections({
      userId: req.user.id,
      username: req.user.username,
      clientId: restoredClient._id,
      clientName: restoredClient.name,
      previousHistory: [],
      nextHistory: restoredClient.sessionHistory || [],
    });

    await DeletedClient.findOneAndDelete({ _id: deletedClient._id, userId: req.user.id });

    res.json({ message: 'Client restored successfully', client: restoredClient });
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

    const recordId = session.id || `${Date.now()}`;
    await Session.findOneAndUpdate(
      { userId: req.user.id, clientId: client._id, externalRecordId: recordId },
      {
        userId: req.user.id,
        username: req.user.username,
        clientId: client._id,
        externalRecordId: recordId,
        clientName: client.name,
        sessionDate: date ? new Date(date) : new Date(),
        sessionNotes: notes || '',
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
        diagnosis: diagnosis || '',
        treatment: treatment || '',
        status: 'completed',
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    if (followUpDate) {
      await FollowUp.findOneAndUpdate(
        { userId: req.user.id, clientId: client._id, externalRecordId: recordId },
        {
          userId: req.user.id,
          username: req.user.username,
          clientId: client._id,
          externalRecordId: recordId,
          clientName: client.name,
          followUpDate: new Date(followUpDate),
          followUpNotes: notes || '',
          status: 'pending',
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDeletedClients = async (req, res) => {
  try {
    const deletedClients = await DeletedClient.find({ userId: req.user.id }).sort({ deletedAt: -1 });
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
