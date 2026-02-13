import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getClients,
  saveClients,
  type Client,
  type SessionRecord,
} from '../utils/store';
import '../styles/client-profile.css';

export default function ClientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [client, setClient] = useState<Client | null>(null);
  const [editing, setEditing] = useState(false);

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
    return () => window.removeEventListener('storage', onStorage);
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
    const record: SessionRecord = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      notes: sessionNotes,
      followUpDate,
      followUpNotes,
    };
    const history = [...(client.sessionHistory || []), record];
    persist({ sessionHistory: history });
    setSessionNotes('');
    setFollowUpDate('');
    setFollowUpNotes('');
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

        {/* Sessions Counter */}
        <div className="sessions-box">
          <h4>Sessions</h4>
          <div className="session-counter">
            <span className="counter-label">Count: {sessionCount}</span>
            <button
              className="counter-btn decrement"
              onMouseDown={() => startSessionChange(-1)}
              onMouseUp={stopSessionChange}
              onMouseLeave={stopSessionChange}
              onTouchStart={() => startSessionChange(-1)}
              onTouchEnd={stopSessionChange}
            >−</button>
            <button
              className="counter-btn increment"
              onMouseDown={() => startSessionChange(1)}
              onMouseUp={stopSessionChange}
              onMouseLeave={stopSessionChange}
              onTouchStart={() => startSessionChange(1)}
              onTouchEnd={stopSessionChange}
            >+</button>
          </div>
          <p className="sessions-hint">
            Use + to record a session attended. Click the Next Session date to view only the follow-up date in history.
          </p>
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
                <div className="history-number">#{client.sessionHistory.length - i}</div>
                <div className="history-details">
                  <p className="history-date">
                    {new Date(s.date).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  {s.notes && <p className="history-notes">{s.notes}</p>}
                  {s.followUpDate && (
                    <p className="history-followup">
                      <span>Next session:</span> {new Date(s.followUpDate).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  )}
                  {s.followUpNotes && <p className="history-followup-notes">{s.followUpNotes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
