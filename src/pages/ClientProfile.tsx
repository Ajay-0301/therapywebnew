import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getClients,
  saveClients,
  getSiteSettings,
  formatTimeDisplay,
  format24to12,
  type Client,
  type SessionRecord,
  type SiteSettings,
} from '../utils/store';
import '../styles/client-profile.css';

export default function ClientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [client, setClient] = useState<Client | null>(null);
  const [editing, setEditing] = useState(false);
  const [timeFormat, setTimeFormat] = useState<SiteSettings['timeFormat']>('12h');

  // Editable profile fields
  const [name, setName] = useState('');
  const [age, setAge] = useState(0);
  const [occupation, setOccupation] = useState('');
  const [status, setStatus] = useState<'active' | 'completed'>('active');
  const [sessionCount, setSessionCount] = useState(0);

  // Clinical fields
  const [chiefComplaints, setChiefComplaints] = useState('');
  const [hopi, setHopi] = useState('');

  // Current session
  const [sessionNotes, setSessionNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');
  // timers for auto-increment when holding buttons
  const ageTimer = useRef<number | null>(null);
  const sessionTimer = useRef<number | null>(null);

  useEffect(() => {
    const clients = getClients();
    const found = clients.find((c) => c.id === id);
    if (!found) {
      navigate('/clients');
      return;
    }
    setClient(found);
    setName(found.name);
    setAge(found.age);
    setOccupation(found.occupation || '');
    setStatus(found.status || 'active');
    setSessionCount(found.sessionCount || 0);
    setChiefComplaints(found.chiefComplaints || '');
    setHopi(found.hopi || '');
    
    const settings = getSiteSettings();
    setTimeFormat(settings.timeFormat);
    
    const handleSettingsChange = () => {
      const updated = getSiteSettings();
      setTimeFormat(updated.timeFormat);
    };
    
    window.addEventListener('site-settings-updated', handleSettingsChange);
    
    // ensure UI shows persisted values
    // listen for storage changes in other tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'therapyClients') {
        const clients = getClients();
        const f = clients.find((c) => c.id === id);
        if (f) {
          setClient(f);
          setName(f.name);
          setAge(f.age);
          setOccupation(f.occupation || '');
          setStatus(f.status || 'active');
          setSessionCount(f.sessionCount || 0);
          setChiefComplaints(f.chiefComplaints || '');
          setHopi(f.hopi || '');
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('site-settings-updated', handleSettingsChange);
    };
  }, [id, navigate]);

  function persist(updated: Partial<Client>) {
    if (!client) return;
    const clients = getClients();
    const idx = clients.findIndex((c) => c.id === client.id);
    if (idx === -1) return;
    const merged = { ...clients[idx], ...updated };
    clients[idx] = merged;
    saveClients(clients);
    setClient(merged);
  }

  function handleSaveProfile() {
    persist({ name, age, occupation, status, sessionCount });
    setEditing(false);
  }

  function handleSaveAll() {
    persist({ name, age, occupation, status, sessionCount, chiefComplaints, hopi });
    setEditing(false);
  }

  function handleSaveComplaints() {
    persist({ chiefComplaints });
  }

  function handleSaveHopi() {
    persist({ hopi });
  }

  function handleSaveSession() {
    if (!client) return;
    // Combine date and time if time is provided
    let fullFollowUpDate = followUpDate;
    if (followUpDate && followUpTime) {
      const [hours, minutes] = followUpTime.split(':');
      const dateObj = new Date(followUpDate);
      dateObj.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      fullFollowUpDate = dateObj.toISOString();
    }
    const record: SessionRecord = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      notes: sessionNotes,
      followUpDate: fullFollowUpDate,
      followUpNotes,
    };
    const history = [...(client.sessionHistory || []), record];
    persist({ sessionHistory: history, chiefComplaints, hopi });
    setSessionNotes('');
    setFollowUpDate('');
    setFollowUpTime('');
    setFollowUpNotes('');
  }

  function deleteSessionRecord(recordId: string) {
    if (!client) return;
    const history = (client.sessionHistory || []).filter((s) => s.id !== recordId);
    persist({ sessionHistory: history });
  }

  function incrementSession() {
    const next = sessionCount + 1;
    setSessionCount(next);
    persist({ sessionCount: next });
  }

  function decrementSession() {
    const next = Math.max(0, sessionCount - 1);
    setSessionCount(next);
    persist({ sessionCount: next });
  }

  // start/stop helpers for holding buttons
  function startAgeChange(delta: number) {
    // apply immediately
    setAge((a) => Math.max(0, a + delta));
    // then start repeating
    stopAgeChange();
    ageTimer.current = window.setInterval(() => {
      setAge((a) => Math.max(0, a + delta));
    }, 150);
  }

  function stopAgeChange() {
    if (ageTimer.current) {
      clearInterval(ageTimer.current);
      ageTimer.current = null;
    }
    // persist age to storage
    persist({ age });
  }

  function startSessionChange(delta: number) {
    // apply immediately
    setSessionCount((s) => {
      const next = Math.max(0, s + delta);
      persist({ sessionCount: next });
      return next;
    });
    stopSessionChange();
    sessionTimer.current = window.setInterval(() => {
      setSessionCount((s) => {
        const next = Math.max(0, s + delta);
        // also append a minimal history record so history reflects count
        if (client) {
          const record: SessionRecord = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            notes: 'Recorded',
            followUpDate: '',
            followUpNotes: '',
          };
          const history = [...(client.sessionHistory || []), record];
          persist({ sessionHistory: history, sessionCount: next });
        } else {
          persist({ sessionCount: next });
        }
        return next;
      });
    }, 400);
  }

  function stopSessionChange() {
    if (sessionTimer.current) {
      clearInterval(sessionTimer.current);
      sessionTimer.current = null;
    }
  }

  if (!client) return null;

  return (
    <section className="page active profile-page">
      <div className="page-header profile-header">
        <div className="profile-header-content">
          <button className="btn-back" onClick={() => navigate('/clients')} title="Back to Clients">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="profile-header-text">
            <h2>Client Profile</h2>
            <div className="profile-id-row">
              <span className="profile-id-label">Client ID</span>
              <span className="profile-id-badge">{client.clientId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* === Client Profile Card === */}
      <div className="profile-card">
        <div className="profile-card-header">
          <h3>Client Profile</h3>
          <div className="profile-actions">
            <button className="btn-save-info" onClick={handleSaveAll}>
              Save Updated Info
            </button>
            <button className="btn-edit" onClick={() => { if (editing) handleSaveProfile(); else setEditing(true); }}>
              {editing ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Grid layout of field boxes */}
        <div className="field-box-grid">
          {/* Client ID */}
          <div className="field-box">
            <label className="field-label">Client ID</label>
            <div className="field-value">{client.clientId}</div>
          </div>

          {/* Name */}
          <div className="field-box">
            <label className="field-label">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={!editing}
              className={`field-input ${!editing ? 'readonly' : ''}`}
            />
          </div>

          {/* Email */}
          <div className="field-box">
            <label className="field-label">Email</label>
            <div className="field-value">{client.email || '—'}</div>
          </div>

          {/* Phone */}
          <div className="field-box">
            <label className="field-label">Phone</label>
            <div className="field-value">{client.phone || '—'}</div>
          </div>

          {/* Gender */}
          <div className="field-box">
            <label className="field-label">Gender</label>
            <div className="field-value">{client.gender || '—'}</div>
          </div>

          {/* Relationship Status */}
          <div className="field-box">
            <label className="field-label">Relationship Status</label>
            <div className="field-value">{client.relationshipStatus || '—'}</div>
          </div>

          {/* Age */}
          <div className="field-box">
            <label className="field-label">Age</label>
            <div className="age-spinner-box">
              <button
                className="counter-btn decrement"
                onMouseDown={() => startAgeChange(-1)}
                onMouseUp={stopAgeChange}
                onMouseLeave={stopAgeChange}
                onTouchStart={() => startAgeChange(-1)}
                onTouchEnd={stopAgeChange}
              >
                −
              </button>
              <input
                type="number"
                min="0"
                value={age}
                onChange={(e) => setAge(Math.max(0, parseInt(e.target.value) || 0))}
                readOnly={!editing}
                className={`field-input age-input ${!editing ? 'readonly' : ''}`}
              />
              <button
                className="counter-btn increment"
                onMouseDown={() => startAgeChange(1)}
                onMouseUp={stopAgeChange}
                onMouseLeave={stopAgeChange}
                onTouchStart={() => startAgeChange(1)}
                onTouchEnd={stopAgeChange}
              >
                +
              </button>
            </div>
          </div>

          {/* Occupation */}
          <div className="field-box">
            <label className="field-label">Occupation</label>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              readOnly={!editing}
              className={`field-input ${!editing ? 'readonly' : ''}`}
            />
          </div>
        </div>

        {/* Status Toggle */}
        <div className="status-row">
          <span className="status-label">Status:</span>
          <button
            className={`status-btn ${status === 'active' ? 'active' : ''}`}
            onClick={() => { if (editing) { setStatus('active'); } }}
            disabled={!editing}
          >
            Active
          </button>
          <button
            className={`status-btn ${status === 'completed' ? 'active completed' : ''}`}
            onClick={() => { if (editing) { setStatus('completed'); } }}
            disabled={!editing}
          >
            Completed
          </button>
        </div>
      </div>

      {/* === Chief Complaints === */}
      <div className="profile-card">
        <h3 className="section-title">Chief Complaints</h3>
        <textarea
          className="profile-textarea"
          placeholder="Enter chief complaints..."
          value={chiefComplaints}
          onChange={(e) => setChiefComplaints(e.target.value)}
          onBlur={() => persist({ chiefComplaints })}
          rows={5}
        />
      </div>

      {/* === History of Presenting Illness (HOPI) === */}
      <div className="profile-card">
        <h3 className="section-title">History of Presenting Illness (HOPI)</h3>
        <textarea
          className="profile-textarea"
          placeholder="Enter history of presenting illness..."
          value={hopi}
          onChange={(e) => setHopi(e.target.value)}
          onBlur={() => persist({ hopi })}
          rows={6}
        />
      </div>

      {/* === Session Notes === */}
      <div className="profile-card">
        <h3 className="section-title">Session Notes</h3>
        <textarea
          className="profile-textarea"
          placeholder="Enter today's session notes..."
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          rows={6}
        />
      </div>

      {/* === Follow-up Session Details === */}
      <div className="profile-card">
        <h3 className="section-title">Follow-up Session Details</h3>
        <div className="field-group">
          <input
            type="date"
            placeholder="Next Session Date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="date-input"
          />
        </div>
        <div className="time-input-group">
          <label>Session Time (Optional)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="time"
              value={followUpTime}
              onChange={(e) => setFollowUpTime(e.target.value)}
              className="time-input"
              placeholder="HH:MM"
            />
            {followUpTime && (
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                ({formatTimeDisplay(followUpTime, timeFormat)})
              </span>
            )}
          </div>
        </div>
        <textarea
          className="profile-textarea"
          placeholder="Follow-up Notes"
          value={followUpNotes}
          onChange={(e) => setFollowUpNotes(e.target.value)}
          rows={4}
        />
        <div className="save-session-row">
          <button className="btn btn-save-session" onClick={handleSaveSession}>
            Save Session &amp; Follow-up Details
          </button>
        </div>
      </div>

      {/* === Session History === */}
      <div className="profile-card">
        <h3 className="section-title">Session History</h3>
        {(!client.sessionHistory || client.sessionHistory.length === 0) ? (
          <p className="empty-history">No sessions recorded yet.</p>
        ) : (
          <div className="history-list">
            {[...client.sessionHistory].reverse().map((s, i) => (
              <div key={s.id} className="history-item">
                {/* Header row */}
                <div className="history-header">
                  <div className="history-header-left">
                    <div className="history-number">#{client.sessionHistory.length - i}</div>
                    <div className="history-date-group">
                      <p className="history-date">
                        {new Date(s.date).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <p className="history-date-sub">
                        {new Date(s.date).toLocaleDateString([], { weekday: 'long' })}
                      </p>
                    </div>
                  </div>
                  <button className="history-delete-btn" onClick={() => deleteSessionRecord(s.id)} title="Delete session record">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>

                {/* Session Notes */}
                {s.notes && s.notes !== 'Recorded' && (
                  <div className="history-section history-section--notes">
                    <div className="history-section-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                    </div>
                    <div className="history-section-content">
                      <span className="history-section-label">Session Notes</span>
                      <p className="history-section-text">{s.notes}</p>
                    </div>
                  </div>
                )}

                {/* Follow-up Section */}
                {(s.followUpDate || s.followUpNotes) && (
                  <div className="history-section history-section--followup">
                    <div className="history-section-icon history-section-icon--followup">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <div className="history-section-content">
                      <span className="history-section-label history-section-label--followup">Follow-up</span>
                      {s.followUpDate && (
                        <p className="history-followup-date">
                          {new Date(s.followUpDate).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}
                          {new Date(s.followUpDate).getHours() > 0 || new Date(s.followUpDate).getMinutes() > 0 ? (
                            <span> at {new Date(s.followUpDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: timeFormat === '12h' })}</span>
                          ) : null}
                        </p>
                      )}
                      {s.followUpNotes && (
                        <p className="history-followup-notes">{s.followUpNotes}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
