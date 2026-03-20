const Setting = require('../models/Setting');

exports.getUserSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne({ userId: req.user.id });

    if (!settings) {
      settings = new Setting({ userId: req.user.id, username: req.user.username });
      await settings.save();
    } else if (!settings.username) {
      settings.username = req.user.username;
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { themeMode, theme, density, sidebarBehavior, language, timeFormat, accentColor, practiceName, notifications, emailNotifications, timezone, soundEnabled, autoSave } = req.body;

    let settings = await Setting.findOne({ userId: req.user.id });

    if (!settings) {
      settings = new Setting({ userId: req.user.id, username: req.user.username });
    }

    settings.username = req.user.username;
    if (themeMode) settings.themeMode = themeMode;
    if (theme) settings.theme = theme;
    if (!theme && themeMode) settings.theme = themeMode;
    if (!themeMode && theme) settings.themeMode = theme;
    if (density) settings.density = density;
    if (sidebarBehavior) settings.sidebarBehavior = sidebarBehavior;
    if (language) settings.language = language;
    if (timeFormat) settings.timeFormat = timeFormat;
    if (accentColor) settings.accentColor = accentColor;
    if (practiceName !== undefined) settings.practiceName = practiceName;
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
      settings = new Setting({ userId: req.user.id, username: req.user.username });
    }

    Object.assign(settings, preferences);
    settings.username = req.user.username;
    if (!settings.themeMode && settings.theme) settings.themeMode = settings.theme;
    if (!settings.theme && settings.themeMode) settings.theme = settings.themeMode;
    settings.updatedAt = new Date();
    await settings.save();

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
