import { useState, useEffect } from 'react';
import {
  getClients,
  getDeletedClients,
  getAppointments,
  getSessions,
  timeAgo,
  formatDateTime,
  type Client,
  type DeletedClient,
  type Appointment,
  type Session,
} from '../utils/store';
import '../styles/dashboard.css';

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [deletedClients, setDeletedClients] = useState<DeletedClient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    setClients(getClients());
    setDeletedClients(getDeletedClients());
    setAppointments(getAppointments());
    setSessions(getSessions());
  }, []);

  const upcomingAppointments = appointments
    .filter((a) => a.dateTime > Date.now())
    .sort((a, b) => a.dateTime - b.dateTime);

  const upcomingSessions = sessions
    .filter((s) => s.scheduledDate > Date.now())
    .sort((a, b) => a.scheduledDate - b.scheduledDate);

  const completedCases = deletedClients.length;
  const completedClients = clients
    .filter((c) => c.status === 'completed')
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return (
    <section className="page active">
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p className="page-subtitle">Welcome back! Here's your overview</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total Clients</h3>
            <p className="stat-number">{clients.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Active Sessions</h3>
            <p className="stat-number">{sessions.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Progress</h3>
            <p className="stat-number">85%</p>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Completed Cases</h3>
            <p className="stat-number">{completedCases}</p>
          </div>
        </div>
      </div>

      {/* Dashboard Boxes Grid */}
      <div className="dashboard-boxes-grid">
        {/* Recently Deleted Clients */}
        <div className="dashboard-box deleted-box">
          <div className="box-header">
            <div
              className="box-icon"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>
            <div className="box-header-text">
              <h3>Recently Deleted Clients</h3>
              <p className="box-count">{deletedClients.length} client{deletedClients.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="box-content">
            {deletedClients.length === 0 ? (
              <div className="box-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={0.3}>
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                </svg>
                <p>No recently deleted clients</p>
              </div>
            ) : (
              deletedClients.slice(0, 5).map((dc) => (
                <div key={dc.id} className="box-item">
                  <div className="box-item-icon deleted-accent">
                    {(dc.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="box-item-info">
                    <p className="box-item-name">{dc.name || 'Unknown'}</p>
                    <p className="box-item-detail">{timeAgo(dc.deletedAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recently Completed Clients */}
        <div className="dashboard-box completed-box">
          <div className="box-header">
            <div
              className="box-icon"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="box-header-text">
              <h3>Recently Completed Clients</h3>
              <p className="box-count">{completedClients.length} client{completedClients.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="box-content">
            {completedClients.length === 0 ? (
              <div className="box-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={0.3}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <p>No completed clients yet</p>
              </div>
            ) : (
              completedClients.slice(0, 5).map((cc) => (
                <div key={cc.id} className="box-item">
                  <div className="box-item-icon completed-accent">
                    {(cc.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="box-item-info">
                    <p className="box-item-name">{cc.name || 'Unknown'}</p>
                    <p className="box-item-detail">{timeAgo(cc.createdAt || Date.now())}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="dashboard-box appointments-box">
          <div className="box-header">
            <div
              className="box-icon"
              style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="box-header-text">
              <h3>Upcoming Appointments</h3>
              <p className="box-count">{upcomingAppointments.length} appointment{upcomingAppointments.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="box-content">
            {upcomingAppointments.length === 0 ? (
              <div className="box-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={0.3}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <p>No upcoming appointments</p>
              </div>
            ) : (
              upcomingAppointments.slice(0, 5).map((appt) => (
                <div key={appt.id} className="box-item">
                  <div className="box-item-icon appointment-accent">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div className="box-item-info">
                    <p className="box-item-name">{appt.clientName}</p>
                    <p className="box-item-detail">{formatDateTime(appt.dateTime)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Follow-up Sessions */}
        <div className="dashboard-box sessions-box">
          <div className="box-header">
            <div
              className="box-icon"
              style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 8v4l3 3" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <div className="box-header-text">
              <h3>Upcoming Follow-up Sessions</h3>
              <p className="box-count">{upcomingSessions.length} session{upcomingSessions.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="box-content">
            {upcomingSessions.length === 0 ? (
              <div className="box-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={0.3}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
                <p>No upcoming follow-up sessions</p>
              </div>
            ) : (
              upcomingSessions.slice(0, 5).map((sess) => (
                <div key={sess.id} className="box-item">
                  <div className="box-item-icon session-accent">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 8v4l3 3" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                  <div className="box-item-info">
                    <p className="box-item-name">{sess.clientName}</p>
                    <p className="box-item-detail">{formatDateTime(sess.scheduledDate)} · {sess.type}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
