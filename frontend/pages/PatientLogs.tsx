import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../utils/api';
import { type Client, type PatientLogRecord } from '../utils/store';

export default function PatientLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<Array<{ clientId: string; clientName: string; log: PatientLogRecord }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const clients = (await api.getClients()) as Client[];
        const rows: Array<{ clientId: string; clientName: string; log: PatientLogRecord }> = [];

        (clients || []).forEach((client) => {
          const patientLogs = Array.isArray(client.patientLogs) ? client.patientLogs : [];
          patientLogs.forEach((log) => {
            rows.push({ clientId: client._id, clientName: client.name, log });
          });
        });

        setLogs(rows.sort((a, b) => {
          const dateA = a.log.dateOfVisit ? new Date(a.log.dateOfVisit).getTime() : 0;
          const dateB = b.log.dateOfVisit ? new Date(b.log.dateOfVisit).getTime() : 0;
          return dateB - dateA;
        }));
      } catch (error) {
        console.error('Failed to load patient logs', error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

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
          <p className="page-subtitle">Review all saved patient visit records across your clients.</p>
        </div>
      </div>

      <div className="clients-list">
        {loading ? (
          <div className="empty-state">
            <p>Loading patient logs…</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <p>No patient logs found.</p>
          </div>
        ) : (
          logs.map(({ clientId, clientName, log }, index) => (
            <div key={`${clientId}-${log.id || index}`} className="client-card" onClick={() => navigate(`/clients/${clientId}`)}>
              <div className="client-card-top">
                <div className="client-avatar">{(clientName || 'P').charAt(0).toUpperCase()}</div>
                <span className="client-id-badge">{log.dateOfVisit ? new Date(log.dateOfVisit).toLocaleDateString() : 'Visit date pending'}</span>
              </div>
              <p className="client-name">{clientName}</p>
              <div className="client-details">
                <p className="client-info"><strong>IP/OP:</strong> {log.ipOp || '—'}</p>
                <p className="client-info"><strong>Ward:</strong> {log.ipWard || '—'}</p>
                <p className="client-info"><strong>Diagnosis:</strong> {log.diagnosis || '—'}</p>
                <p className="client-info"><strong>Treatment:</strong> {log.treatmentDone || '—'}</p>
                <p className="client-info"><strong>Cost:</strong> {log.cost || '—'}</p>
              </div>
              <div className="client-meta">
                {log.opNumber && <span className="client-tag gender-tag">OP: {log.opNumber}</span>}
                {log.ageGender && <span className="client-tag relationship-tag">{log.ageGender}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
