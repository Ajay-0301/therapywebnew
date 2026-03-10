const Setting = require('../models/Setting');

exports.getUserSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne({ userId: req.user.id });

    if (!settings) {
      settings = new Setting({ userId: req.user.id });
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { theme, density, language, notifications, emailNotifications, timezone, soundEnabled, autoSave } = req.body;

    let settings = await Setting.findOne({ userId: req.user.id });

    if (!settings) {
      settings = new Setting({ userId: req.user.id });
    }

    if (theme) settings.theme = theme;
    if (density) settings.density = density;
    if (language) settings.language = language;
    if (notifications !== undefined) settings.notifications = notifications;
    if (emailNotifications !== undefined) settings.emailNotifications = emailNotifications;
    if (timezone) settings.timezone = timezone;
    if (soundEnabled !== undefined) settings.soundEnabled = soundEnabled;
    if (autoSave !== undefined) settings.autoSave = autoSave;

    settings.updatedAt = new Date();
    await settings.save();

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.savePreferences = async (req, res) => {
  try {
    const preferences = req.body;

    let settings = await Setting.findOne({ userId: req.user.id });

    if (!settings) {
      settings = new Setting({ userId: req.user.id });
    }

    Object.assign(settings, preferences);
    settings.updatedAt = new Date();
    await settings.save();

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
