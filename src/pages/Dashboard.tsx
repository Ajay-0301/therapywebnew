import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getClients,
  getDeletedClients,
  getAppointments,
  saveClients,
  saveDeletedClients,
  getSiteSettings,
  timeAgo,
  formatDateTime,
  deleteDeletedClient,
  deleteAppointment,
  type Client,
  type DeletedClient,
  type Appointment,
  type SiteSettings,
} from '../utils/store';
import '../styles/dashboard.css';

interface FollowUpItem {
  id: string;
  clientName: string;
  clientId: string;
  followUpDate: number;
  followUpNotes: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [deletedClients, setDeletedClients] = useState<DeletedClient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [timeFormat, setTimeFormat] = useState<SiteSettings['timeFormat']>('12h');

  useEffect(() => {
    setClients(getClients());
    setDeletedClients(getDeletedClients());
    setAppointments(getAppointments());
    
    const settings = getSiteSettings();
    setTimeFormat(settings.timeFormat);
    
    const handleSettingsChange = () => {
      const updated = getSiteSettings();
      setTimeFormat(updated.timeFormat);
    };
    
    window.addEventListener('site-settings-updated', handleSettingsChange);
    return () => window.removeEventListener('site-settings-updated', handleSettingsChange);
  }, [refreshKey]);

  const upcomingAppointments = appointments
    .filter((a) => a.dateTime > Date.now())
    .sort((a, b) => a.dateTime - b.dateTime);

  // Build upcoming follow-up sessions from client session histories
  const upcomingFollowUps = useMemo<FollowUpItem[]>(() => {
    const items: FollowUpItem[] = [];
    const now = Date.now();
    clients.forEach((client) => {
      (client.sessionHistory || []).forEach((s) => {
        if (s.followUpDate) {
          const fuDate = new Date(s.followUpDate).getTime();
          if (fuDate > now) {
            items.push({
              id: s.id,
              clientName: client.name,
              clientId: client.id,
              followUpDate: fuDate,
              followUpNotes: s.followUpNotes || '',
            });
          }
        }
      });
    });
    return items.sort((a, b) => a.followUpDate - b.followUpDate);
  }, [clients]);

  const completedCases = deletedClients.length;
  const activeCases = clients.filter((c) => c.status === 'active').length;
  const completedClients = clients
    .filter((c) => c.status === 'completed')
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  // Find client ID for an appointment by name match
  function findClientId(name: string): string | undefined {
    const c = clients.find((cl) => cl.name === name);
    return c?.id;
  }

  // Delete a completed client
  function handleDeleteCompletedClient(clientId: string) {
    const clientToDelete = clients.find(c => c.id === clientId);
    if (clientToDelete) {
      const newClients = clients.filter(c => c.id !== clientId);
      const newDeleted = [
        {
          id: clientToDelete.id,
          clientId: clientToDelete.clientId,
          name: clientToDelete.name,
          email: clientToDelete.email,
          deletedAt: Date.now(),
        },
        ...deletedClients,
      ];
      saveClients(newClients);
      saveDeletedClients(newDeleted);
      setRefreshKey(prev => prev + 1);
    }
  }

  // Delete a follow-up session record
  function handleDeleteFollowUp(clientId: string, recordId: string) {
    const updatedClients = clients.map((c) => {
      if (c.id === clientId) {
        return {
          ...c,
          sessionHistory: c.sessionHistory?.filter((s) => s.id !== recordId) || [],
        };
      }
      return c;
    });
    saveClients(updatedClients);
    setRefreshKey(prev => prev + 1);
  }

  return (
    <section className="page active">
      <div className="page-header">
        <div className="page-header-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        </div>
        <div className="page-header-content">
          <h2>Dashboard</h2>
          <p className="page-subtitle">Welcome back! Here's your overview</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: '#667eea' }}
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
            <p className="stat-number">{clients.length + deletedClients.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: '#f5576c' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Upcoming Sessions</h3>
            <p className="stat-number">{upcomingAppointments.length + upcomingFollowUps.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: '#4facfe' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Active Cases</h3>
            <p className="stat-number">{activeCases}</p>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: '#10b981' }}
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
              style={{ background: '#667eea' }}
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
                  <button
                    className="box-item-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDeletedClient(dc.id);
                      setRefreshKey(prev => prev + 1);
                    }}
                    title="Delete permanently"
                  >
                    ×
                  </button>
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
              style={{ background: '#f5576c' }}
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
                <div
                  key={cc.id}
                  className="box-item"
                  onClick={() => navigate(`/clients/${cc.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="box-item-icon completed-accent">
                    {(cc.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="box-item-info">
                    <p className="box-item-name">
                      {cc.name || 'Unknown'} {cc.age ? `(${cc.age})` : ''}
                    </p>
                    <p className="box-item-detail">
                      {cc.chiefComplaints || cc.hopi ? `${cc.chiefComplaints || cc.hopi}` : 'No primary issue'}
                    </p>
                    <p className="box-item-detail-secondary">{cc.phone || 'No phone'}</p>
                  </div>
                  <button
                    className="box-item-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCompletedClient(cc.id);
                    }}
                    title="Delete"
                  >
                    ×
                  </button>
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
              style={{ background: '#4facfe' }}
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
              upcomingAppointments.slice(0, 5).map((appt) => {
                const cId = findClientId(appt.clientName);
                const client = clients.find(c => c.id === cId);
                return (
                  <div
                    key={appt.id}
                    className="box-item"
                    style={cId ? { cursor: 'pointer' } : undefined}
                    onClick={cId ? () => navigate(`/clients/${cId}`) : undefined}
                  >
                    <div className="box-item-icon appointment-accent">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div className="box-item-info">
                      <p className="box-item-name">
                        {appt.clientName} {client?.age ? `(${client.age})` : ''}
                      </p>
                      <p className="box-item-detail">{formatDateTime(appt.dateTime, timeFormat)}</p>
                      <p className="box-item-detail-secondary">
                        {client?.phone || 'No phone'}
                      </p>
                    </div>
                    <button
                      className="box-item-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAppointment(appt.id);
                        setRefreshKey(prev => prev + 1);
                      }}
                      title="Delete appointment"
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming Follow-up Sessions */}
        <div className="dashboard-box sessions-box">
          <div className="box-header">
            <div
              className="box-icon"
              style={{ background: '#10b981' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 8v4l3 3" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <div className="box-header-text">
              <h3>Upcoming Follow-up Sessions</h3>
              <p className="box-count">{upcomingFollowUps.length} session{upcomingFollowUps.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="box-content">
            {upcomingFollowUps.length === 0 ? (
              <div className="box-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={0.3}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
                <p>No upcoming follow-up sessions</p>
              </div>
            ) : (
              upcomingFollowUps.slice(0, 5).map((fu) => {
                const client = clients.find(c => c.id === fu.clientId);
                return (
                  <div
                    key={fu.id}
                    className="box-item"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/clients/${fu.clientId}`)}
                  >
                    <div className="box-item-icon session-accent">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 8v4l3 3" />
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    </div>
                    <div className="box-item-info">
                      <p className="box-item-name">
                        {fu.clientName} {client?.age ? `(${client.age})` : ''}
                      </p>
                      <p className="box-item-detail">
                        {formatDateTime(fu.followUpDate, timeFormat)}
                        {fu.followUpNotes ? ` · ${fu.followUpNotes}` : ''}
                      </p>
                      <p className="box-item-detail-secondary">
                        {client?.phone || 'No phone'}
                      </p>
                    </div>
                    <button
                      className="box-item-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFollowUp(fu.clientId, fu.id);
                      }}
                      title="Delete follow-up"
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
