// Validators for input validation

exports.validateClient = (client) => {
  const errors = [];

  if (!client.name || client.name.trim() === '') {
    errors.push('Name is required');
  }

  if (!client.email || !isValidEmail(client.email)) {
    errors.push('Valid email is required');
  }

  if (client.age && (client.age < 0 || client.age > 150)) {
    errors.push('Age must be between 0 and 150');
  }

  return errors;
};

exports.validateAppointment = (appointment) => {
  const errors = [];

  if (!appointment.clientId) {
    errors.push('Client ID is required');
  }

  if (!appointment.dateTime) {
    errors.push('Date and time is required');
  }

  if (new Date(appointment.dateTime) < new Date()) {
    errors.push('Appointment date cannot be in the past');
  }

  return errors;
};

exports.validateUser = (user) => {
  const errors = [];

  if (!user.username || user.username.length < 3) {
    errors.push('Username must be at least 3 characters');
  }

  if (!user.password || user.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (user.email && !isValidEmail(user.email)) {
    errors.push('Valid email is required');
  }

  return errors;
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
