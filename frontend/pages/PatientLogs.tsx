import { useEffect, useState } from 'react';
import {
  getPatientLogs,
  savePatientLogs,
  type PatientLogRecord,
} from '../utils/store';

const initialFormState = {
  dateOfVisit: '',
  ipOp: '',
  ipWard: '',
  name: '',
  ageGender: '',
  opNumber: '',
  diagnosis: '',
  treatmentDone: '',
  cost: '',
};

export default function PatientLogs() {
  const [logs, setLogs] = useState<PatientLogRecord[]>([]);
  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    setLogs(getPatientLogs().sort((a, b) => {
      const dateA = a.dateOfVisit ? new Date(a.dateOfVisit).getTime() : 0;
      const dateB = b.dateOfVisit ? new Date(b.dateOfVisit).getTime() : 0;
      return dateB - dateA;
    }));
  }, []);

  function updateField(key: keyof typeof initialFormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm(initialFormState);
  }

  function handleSaveLog() {
    const nextLog: PatientLogRecord = {
      id: crypto.randomUUID(),
      dateOfVisit: form.dateOfVisit,
      ipOp: form.ipOp,
      ipWard: form.ipWard,
      name: form.name,
      ageGender: form.ageGender,
      opNumber: form.opNumber,
      diagnosis: form.diagnosis,
      treatmentDone: form.treatmentDone,
      cost: form.cost,
    };

    const persisted = [nextLog, ...getPatientLogs()];
    savePatientLogs(persisted);
    setLogs(persisted.sort((a, b) => {
      const dateA = a.dateOfVisit ? new Date(a.dateOfVisit).getTime() : 0;
      const dateB = b.dateOfVisit ? new Date(b.dateOfVisit).getTime() : 0;
      return dateB - dateA;
    }));
    resetForm();
  }

  function handleDeleteLog(id: string) {
    const persisted = getPatientLogs().filter((log) => log.id !== id);
    savePatientLogs(persisted);
    setLogs(persisted); 
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
          <p className="page-subtitle">Save and review patient visit records in one dedicated space.</p>
        </div>
      </div>

      <div className="profile-card">
        <div className="patient-log-grid">
          <label className="field-box patient-log-field">
            <span className="field-label">Date of visit</span>
            <input type="date" className="field-input" value={form.dateOfVisit} onChange={(e) => updateField('dateOfVisit', e.target.value)} />
          </label>
          <label className="field-box patient-log-field">
            <span className="field-label">IP/OP</span>
            <input type="text" className="field-input" value={form.ipOp} onChange={(e) => updateField('ipOp', e.target.value)} placeholder="IP / OP" />
          </label>
          <label className="field-box patient-log-field">
            <span className="field-label">IP Ward</span>
            <input type="text" className="field-input" value={form.ipWard} onChange={(e) => updateField('ipWard', e.target.value)} placeholder="Ward / Room" />
          </label>
          <label className="field-box patient-log-field">
            <span className="field-label">Name</span>
            <input type="text" className="field-input" value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Patient name" />
          </label>
          <label className="field-box patient-log-field">
            <span className="field-label">Age and gender</span>
            <input type="text" className="field-input" value={form.ageGender} onChange={(e) => updateField('ageGender', e.target.value)} placeholder="Age / Gender" />
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
          <button className="btn btn-save-session" onClick={handleSaveLog}>Save Patient Log</button>
        </div>
      </div>

      <div className="profile-card">
        {logs.length === 0 ? (
          <p className="empty-history">No patient logs found.</p>
        ) : (
          <div className="history-list">
            {[...logs].reverse().map((log, index) => (
              <div key={log.id} className="history-item patient-log-item">
                <div className="history-header">
                  <div className="history-header-left">
                    <div className="history-number">#{logs.length - index}</div>
                    <div className="history-date-group">
                      <p className="history-date">{log.dateOfVisit ? new Date(log.dateOfVisit).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' }) : 'Visit date not set'}</p>
                    </div>
                  </div>
                  <button className="history-delete-btn" onClick={() => handleDeleteLog(log.id)} title="Delete patient log">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
                <div className="patient-log-details">
                  <div><strong>IP/OP:</strong> {log.ipOp || '—'}</div>
                  <div><strong>IP Ward:</strong> {log.ipWard || '—'}</div>
                  <div><strong>Name:</strong> {log.name || '—'}</div>
                  <div><strong>Age/Gender:</strong> {log.ageGender || '—'}</div>
                  <div><strong>OP Number:</strong> {log.opNumber || '—'}</div>
                  <div><strong>Diagnosis:</strong> {log.diagnosis || '—'}</div>
                  <div><strong>Treatment:</strong> {log.treatmentDone || '—'}</div>
                  <div><strong>Cost:</strong> {log.cost || '—'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
