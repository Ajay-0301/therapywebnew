import { useState, useEffect } from 'react';
import { getUserData, saveUserData } from '../utils/store';
import '../styles/settings.css';

export default function Settings() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const user = getUserData();
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, []);

  function handleSave() {
    const user = getUserData();
    saveUserData({ ...user, name, email } as any);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <section className="page active">
      <div className="page-header">
        <div>
          <h2>Settings</h2>
          <p className="page-subtitle">Manage your account and preferences</p>
        </div>
      </div>

      <div className="settings-container">
        <div className="settings-section">
          <h3>Account Information</h3>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: 16 }}>
            {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>

        <div className="settings-section">
          <h3>Preferences</h3>
          <div className="preference-item">
            <div>
              <p className="preference-title">Email Notifications</p>
              <p className="preference-desc">Receive notifications about new clients</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="preference-item">
            <div>
              <p className="preference-title">Dark Mode</p>
              <p className="preference-desc">Coming soon</p>
            </div>
            <label className="toggle">
              <input type="checkbox" disabled />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
