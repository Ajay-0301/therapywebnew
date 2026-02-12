import { useState, useEffect } from 'react';
import { getClients, getSessions, getAppointments } from '../utils/store';
import '../styles/insights.css';

export default function Insights() {
  const [totalClients, setTotalClients] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalAppointments, setTotalAppointments] = useState(0);

  useEffect(() => {
    setTotalClients(getClients().length);
    setTotalSessions(getSessions().length);
    setTotalAppointments(getAppointments().length);
  }, []);

  return (
    <section className="page active">
      <div className="page-header">
        <div>
          <h2>Insights</h2>
          <p className="page-subtitle">Analytics and progress tracking</p>
        </div>
      </div>

      <div className="insights-grid">
        <div className="insight-card">
          <h3>Session Statistics</h3>
          <div className="insight-placeholder">
            <p>📊 {totalSessions} total sessions</p>
            <p style={{ fontSize: 14, color: '#666' }}>Backend integration coming soon</p>
          </div>
        </div>

        <div className="insight-card">
          <h3>Client Progress</h3>
          <div className="insight-placeholder">
            <p>📈 {totalClients} clients tracked</p>
            <p style={{ fontSize: 14, color: '#666' }}>Data visualization coming soon</p>
          </div>
        </div>

        <div className="insight-card">
          <h3>Monthly Report</h3>
          <div className="insight-placeholder">
            <p>📋 {totalAppointments} appointments</p>
            <p style={{ fontSize: 14, color: '#666' }}>Detailed reports coming soon</p>
          </div>
        </div>
      </div>
    </section>
  );
}
