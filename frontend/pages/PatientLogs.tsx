import { useEffect, useMemo, useState } from 'react';
import * as api from '../utils/api';
import '../styles/client-profile.css';

const initialFormState = {
  dateOfVisit: '',
  ipOp: '',
  ipWard: '',
  name: '',
  age: '',
  gender: '',
  opNumber: '',
  diagnosis: '',
  treatmentDone: '',
  cost: '',
};

interface PatientLogRow {
  _id?: string;
  id?: string;
  dateOfVisit: string;
  ipOp: string;
  ipWard: string;
  name: string;
  age?: string;
  gender?: string;
  ageGender?: string;
  opNumber: string;
  diagnosis: string;
  treatmentDone: string;
  cost: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function PatientLogs() {
  const [logs, setLogs] = useState<PatientLogRow[]>([]);
  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const ipOpOptions = useMemo(() => {
    return ['IP', 'OP', ...new Set(logs.map((log) => log.ipOp).filter(Boolean))];
  }, [logs]);

  const wardOptions = useMemo(() => {
    return ['Ward', 'Room', ...new Set(logs.map((log) => log.ipWard).filter(Boolean))];
  }, [logs]);

  const genderOptions = ['Male', 'Female', 'Unspecified'];

  async function loadLogs() {
    try {
      const data = await api.getPatientLogs();
      const sorted = [...data].sort((a, b) => {
        const dateA = a.dateOfVisit ? new Date(a.dateOfVisit).getTime() : 0;
        const dateB = b.dateOfVisit ? new Date(b.dateOfVisit).getTime() : 0;
        return dateB - dateA;
      });
      setLogs(sorted as PatientLogRow[]);
    } catch (error) {
      console.error('Failed to load patient logs', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  function updateField(key: keyof typeof initialFormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm(initialFormState);
    setEditingId(null);
  }

  function startEdit(log: PatientLogRow) {
    setEditingId(log._id || log.id || null);
    setForm({
      dateOfVisit: log.dateOfVisit || '',
      ipOp: log.ipOp || '',
      ipWard: log.ipWard || '',
      name: log.name || '',
      age: log.age || log.ageGender?.split('/')[0]?.trim() || '',
      gender: log.gender || log.ageGender?.split('/')[1]?.trim() || '',
      opNumber: log.opNumber || '',
      diagnosis: log.diagnosis || '',
      treatmentDone: log.treatmentDone || '',
      cost: log.cost || '',
    });
  }

  async function handleSaveLog() {
    const payload = {
      dateOfVisit: form.dateOfVisit,
      ipOp: form.ipOp,
      ipWard: form.ipWard,
      name: form.name,
      age: form.age,
      gender: form.gender,
      ageGender: `${form.age || ''}${form.age && form.gender ? ' / ' : ''}${form.gender || ''}`.trim(),
      opNumber: form.opNumber,
      diagnosis: form.diagnosis,
      treatmentDone: form.treatmentDone,
      cost: form.cost,
    };

    try {
      if (editingId) {
        await api.updatePatientLog(editingId, payload);
      } else {
        await api.createPatientLog(payload);
      }
      resetForm();
      await loadLogs();
    } catch (error) {
      console.error('Failed to save patient log', error);
    }
  }

  async function handleDeleteLog(id: string) {
    try {
      await api.deletePatientLog(id);
      await loadLogs();
    } catch (error) {
      console.error('Failed to delete patient log', error);
    }
  }

  return (
    <section className="page active">
      <div className="page-header">
        <div className="page-header-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <div className="page-header-content">
          <h2>Patient Logs</h2>
          <p className="page-subtitle">Save and review patient visit records in one secure, dedicated space.</p>
        </div>
      </div>

      <div className="profile-card patient-log-form-card">
        <div className="patient-log-grid">
          <label className="field-box patient-log-field">
            <span className="field-label">Date of visit</span>
            <input type="date" className="field-input" value={form.dateOfVisit} onChange={(e) => updateField('dateOfVisit', e.target.value)} />
          </label>
          <label className="field-box patient-log-field">
            <span className="field-label">IP/OP</span>
            <input
              type="text"
              className="field-input input-with-suggestions"
              list="ipop-suggestions"
              value={form.ipOp}
              onChange={(e) => updateField('ipOp', e.target.value)}
              placeholder="IP / OP"
            />
            <datalist id="ipop-suggestions">
              {ipOpOptions.map((option) => <option key={option} value={option} />)}
            </datalist>
          </label>
          <label className="field-box patient-log-field">
            <span className="field-label">IP Ward</span>
            <input
              type="text"
              className="field-input input-with-suggestions"
              list="ward-suggestions"
              value={form.ipWard}
              onChange={(e) => updateField('ipWard', e.target.value)}
              placeholder="Ward / Room"
            />
            <datalist id="ward-suggestions">
              {wardOptions.map((option) => <option key={option} value={option} />)}
            </datalist>
          </label>
          <label className="field-box patient-log-field">
            <span className="field-label">Name</span>
            <input type="text" className="field-input" value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Patient name" />
          </label>
          <label className="field-box patient-log-field">
            <span className="field-label">Age</span>
            <input type="text" className="field-input" value={form.age} onChange={(e) => updateField('age', e.target.value)} placeholder="Age" />
          </label>
          <label className="field-box patient-log-field">
            <span className="field-label">Gender</span>
            <input
              type="text"
              className="field-input"
              list="gender-suggestions"
              value={form.gender}
              onChange={(e) => updateField('gender', e.target.value)}
              placeholder="Gender"
            />
            <datalist id="gender-suggestions">
              {genderOptions.map((option) => <option key={option} value={option} />)}
            </datalist>
          </label>
          <label className="field-box patient-log-field">
            <span className="field-label">OP Number</span>
            <input type="text" className="field-input" value={form.opNumber} onChange={(e) => updateField('opNumber', e.target.value)} placeholder="OP Number" />
          </label>
          <label className="field-box patient-log-field">
            <span className="field-label">Diagnosis</span>
            <input type="text" className="field-input" value={form.diagnosis} onChange={(e) => updateField('diagnosis', e.target.value)} placeholder="Diagnosis" />
          </label>
          <label className="field-box patient-log-field">
            <span className="field-label">Treatment done</span>
            <input type="text" className="field-input" value={form.treatmentDone} onChange={(e) => updateField('treatmentDone', e.target.value)} placeholder="Therapy / Assessment / Relaxation exercise" />
          </label>
          <label className="field-box patient-log-field">
            <span className="field-label">Cost</span>
            <input type="text" className="field-input" value={form.cost} onChange={(e) => updateField('cost', e.target.value)} placeholder="Cost" />
          </label>
        </div>
        <div className="save-session-row">
          <button className="btn btn-save-session" onClick={handleSaveLog}>{editingId ? 'Update Patient Log' : 'Save Patient Log'}</button>
          {editingId && (
            <button className="btn btn-edit" style={{ marginLeft: 12 }} onClick={resetForm}>Cancel</button>
          )}
        </div>
      </div>

      <div className="profile-card">
        {loading ? (
          <p className="empty-history">Loading patient logs…</p>
        ) : logs.length === 0 ? (
          <p className="empty-history">No patient logs found.</p>
        ) : (
          <div className="history-list">
            {[...logs].map((log, index) => (
              <div key={log._id || log.id} className="history-item patient-log-item">
                <div className="history-header">
                  <div className="history-header-left">
                    <div className="history-number">#{logs.length - index}</div>
                    <div className="history-date-group">
                      <p className="history-date">{log.dateOfVisit ? new Date(log.dateOfVisit).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' }) : 'Visit date not set'}</p>
                    </div>
                  </div>
                  <div className="profile-actions" style={{ gap: 8 }}>
                    <button className="btn-edit" onClick={() => startEdit(log)} title="Edit patient log">
                      Edit
                    </button>
                    <button className="history-delete-btn" onClick={() => handleDeleteLog(log._id || log.id || '')} title="Delete patient log">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="patient-log-details">
                  <div className="patient-log-meta"><strong>IP/OP</strong><span>{log.ipOp || '—'}</span></div>
                  <div className="patient-log-meta"><strong>IP Ward</strong><span>{log.ipWard || '—'}</span></div>
                  <div className="patient-log-meta"><strong>Name</strong><span>{log.name || '—'}</span></div>
                  <div className="patient-log-meta"><strong>Age</strong><span>{log.age || log.ageGender?.split('/')[0]?.trim() || '—'}</span></div>
                  <div className="patient-log-meta"><strong>Gender</strong><span>{log.gender || log.ageGender?.split('/')[1]?.trim() || '—'}</span></div>
                  <div className="patient-log-meta"><strong>OP Number</strong><span>{log.opNumber || '—'}</span></div>
                  <div className="patient-log-meta"><strong>Diagnosis</strong><span>{log.diagnosis || '—'}</span></div>
                  <div className="patient-log-meta"><strong>Treatment</strong><span>{log.treatmentDone || '—'}</span></div>
                  <div className="patient-log-meta"><strong>Cost</strong><span>{log.cost || '—'}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
