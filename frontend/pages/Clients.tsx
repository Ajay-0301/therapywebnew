import { useState, useEffect, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  type Client,
} from '../utils/store';
import * as api from '../utils/api';
import '../styles/clients.css';

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say'];
const RELATIONSHIP_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed', 'In a Relationship', 'Separated', 'Other'];

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form state
  const [clientId, setClientId] = useState('');
  const [clientIdError, setClientIdError] = useState('');
  const [name, setName] = useState('');
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [relationshipStatus, setRelationshipStatus] = useState('');
  const [age, setAge] = useState(0);
  const [clientIdValid, setClientIdValid] = useState<boolean | null>(null);
  const [suggestedId, setSuggestedId] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Timer for age spinner hold-to-increment
  const ageTimer = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; clientId: string; clientName: string }>({
    open: false,
    clientId: '',
    clientName: '',
  });

  // Load clients from API on mount
  useEffect(() => {
    const loadClients = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getClients();
        setClients(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load clients:', err);
        setError('Failed to load clients. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    loadClients();
  }, []);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const safeText = (value?: string | null) => (value ?? '').toString().toLowerCase();
    const statusValue = (c as Client).status || 'active';
    const statusMatches = statusFilter === 'all' || statusValue === statusFilter;
    return (
      statusMatches &&
      (
        safeText(c.name).includes(q) ||
        safeText(c.clientId).includes(q) ||
        safeText(c.email).includes(q) ||
        safeText(c.phone).includes(q) ||
        safeText(c.gender).includes(q)
      )
    );
  });

  // Helper function to generate a random client ID
  function generateClientId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'CL-';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async function openAdd() {
    try {
      setEditingClient(null);
      const id = await api.generateClientId();
      setClientId(id);
      setClientIdError('');
      setName('');
      setContactType('email');
      setEmail('');
      setPhone('');
      setGender('');
      setRelationshipStatus('');
      setAge(0);
      setClientIdValid(true);
      setSuggestedId('');
      setModalOpen(true);
      setFieldErrors({});
    } catch (error) {
      console.error('Error generating client ID:', error);
      setFieldErrors((f) => ({ ...f, submit: 'Failed to generate client ID' }));
    }
  }

  function openEdit(c: Client) {
    setEditingClient(c);
    setClientId(c.clientId);
    setClientIdError('');
    setName(c.name);
    setEmail(c.email);
    setPhone(c.phone);
    setContactType(c.email ? 'email' : 'phone');
    setGender(c.gender);
    setRelationshipStatus(c.relationshipStatus);
    setAge(c.age);
    setClientIdValid(true);
    setSuggestedId('');
    setModalOpen(true);
    setFieldErrors({});
  }

  function startAgeChange(delta: number) {
    // apply immediately
    setAge((a) => Math.max(0, Math.min(120, a + delta)));
    // then start repeating
    stopAgeChange();
    ageTimer.current = window.setInterval(() => {
      setAge((a) => Math.max(0, Math.min(120, a + delta)));
    }, 150);
  }

  function stopAgeChange() {
    if (ageTimer.current) {
      clearInterval(ageTimer.current);
      ageTimer.current = null;
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // clear previous errors
    setFieldErrors({});

    // client-side required validation (replace native browser tooltips)
    const errors: string[] = [];
    const errs: Record<string, string> = {};
    if (!clientId.trim()) {
      errs.clientId = 'Please fill out Client ID';
      errors.push('Please fill out Client ID');
    }
    if (!name.trim()) {
      errs.name = 'Please fill out Client Name';
      errors.push('Please fill out Client Name');
    }
    if (contactType === 'email') {
      if (!email.trim()) {
        errs.contact = 'Please fill out Email';
        errors.push('Please fill out Email');
      }
    } else {
      if (!phone.trim()) {
        errs.contact = 'Please fill out Phone number';
        errors.push('Please fill out Phone number');
      }
    }
    if (!gender) {
      errs.gender = 'Please select Gender';
      errors.push('Please select Gender');
    }
    if (!relationshipStatus) {
      errs.relationshipStatus = 'Please select Relationship Status';
      errors.push('Please select Relationship Status');
    }
    if (errors.length) {
      setFieldErrors(errs);
      return;
    }

    // normalize id on save
    const normalizedId = clientId.trim().toUpperCase();
    setClientId(normalizedId);
    // validate clientId uniqueness
    const dup = clients.find((c) => c.clientId.toUpperCase() === normalizedId && c._id !== editingClient?._id);
    if (dup) {
      setClientIdError('This Client ID is already used. Choose another.');
      setClientIdValid(false);
      setSuggestedId(generateClientId());
      setFieldErrors((f) => ({ ...f, clientId: 'Client ID already used' }));
      return;
    }
    
    // Submit to API
    const submitData = async () => {
      try {
        if (editingClient) {
          const updated = {
            name,
            email: contactType === 'email' ? email : '',
            phone: contactType === 'phone' ? phone : '',
            gender,
            relationshipStatus,
            age,
          };
          await api.updateClient(editingClient._id, updated);
          // Reload clients
          const data = await api.getClients();
          setClients(Array.isArray(data) ? data : []);
          setModalOpen(false);
          // Broadcast change to other components
          window.dispatchEvent(new CustomEvent('clientDataUpdated'));
          navigate(`/clients/${editingClient._id}`);
        } else {
          const newClientData = {
            clientId: normalizedId,
            name,
            email: contactType === 'email' ? email : '',
            phone: contactType === 'phone' ? phone : '',
            gender,
            relationshipStatus,
            age,
            occupation: '',
            status: 'active',
          };
          
          // Validate all required fields
          const hasEmail = contactType === 'email' && email.trim().length > 0;
          const hasPhone = contactType === 'phone' && phone.trim().length > 0;
          
          if (!newClientData.clientId || !newClientData.name || (!hasEmail && !hasPhone)) {
            console.error('Validation failed:', newClientData);
            const requiredField = contactType === 'email' ? 'email' : 'phone';
            setFieldErrors((f) => ({ ...f, submit: `Missing required fields: clientId, name, or ${requiredField}` }));
            return;
          }
          
          console.log('Sending client data:', newClientData);
          const response = await api.createClient(newClientData);
          console.log('Client created successfully:', response);
          
          // Close modal immediately
          setModalOpen(false);
          
          // Reload clients and navigate
          const data = await api.getClients();
          setClients(Array.isArray(data) ? data : []);
          
          // Broadcast change to other components
          window.dispatchEvent(new CustomEvent('clientDataUpdated'));
          
          // Navigate using the correct ID
          const newClient = Array.isArray(data) ? data[data.length - 1] : null;
          const newClientId = (newClient as any)?._id || newClient?.id;
          if (newClientId) {
            navigate(`/clients/${newClientId}`);
          } else {
            navigate('/clients');
          }
        }
      } catch (err) {
        console.error('Full error details:', err);
        const errorMsg = err instanceof Error ? err.message : 'Failed to save client. Please try again.';
        console.error('Error message:', errorMsg);
        setFieldErrors((f) => ({ ...f, submit: errorMsg }));
      }
    };
    
    submitData();
  }

  function handleDelete(id: string) {
    const client = clients.find((c) => c._id === id);
    if (!client) {
      console.error('Client not found for deletion');
      return;
    }
    
    console.log('Clients: Opening delete confirmation for client:', client.name);
    // Show custom confirmation modal instead of window.confirm
    setDeleteConfirm({
      open: true,
      clientId: id,
      clientName: client.name,
    });
  }

  async function confirmDelete() {
    const { clientId, open } = deleteConfirm;
    if (!open || !clientId) return;

    try {
      console.log('Clients: Deleting client with ID:', clientId);
      await api.deleteClient(clientId);
      console.log('Clients: Delete API call successful');
      
      // Reload clients
      const data = await api.getClients();
      const clientsArray = Array.isArray(data) ? data : [];
      console.log('Clients: Reloaded clients after delete:', clientsArray.length);
      setClients(clientsArray);
      setDeleteConfirm({ open: false, clientId: '', clientName: '' });
      
      // Broadcast change to other components (Dashboard, Calendar, etc)
      console.log('Clients: Broadcasting clientDataUpdated event');
      window.dispatchEvent(new CustomEvent('clientDataUpdated'));
    } catch (err) {
      console.error('Failed to delete client:', err);
      setError('Failed to delete client. Please try again.');
      setDeleteConfirm({ open: false, clientId: '', clientName: '' });
    }
  }

  function cancelDelete() {
    setDeleteConfirm({ open: false, clientId: '', clientName: '' });
  }

  return (
    <section className="page active">
      <div className="page-header">
        <div className="page-header-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div className="page-header-content">
          <h2>Clients</h2>
          <p className="page-subtitle">View, organize, and manage all your client profiles in one secure place.
                                       Access session history, therapy notes, and progress updates efficiently.</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          + Add Client
        </button>
      </div>

      <div className="clients-filters">
        <div className="search-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, ID, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="20" y1="20" x2="16.5" y2="16.5" />
            </svg>
          </span>
        </div>

        <div className="status-tabs" role="tablist" aria-label="Client status">
          <button
            className={`status-tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
            role="tab"
            aria-selected={statusFilter === 'all'}
          >
            All
          </button>
          <button
            className={`status-tab ${statusFilter === 'active' ? 'active' : ''}`}
            onClick={() => setStatusFilter('active')}
            role="tab"
            aria-selected={statusFilter === 'active'}
          >
            Active
          </button>
          <button
            className={`status-tab ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('completed')}
            role="tab"
            aria-selected={statusFilter === 'completed'}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="clients-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>No clients found. Click "+ Add Client" to get started.</p>
          </div>
        ) : (
          filtered.map((c) => (
            <div key={c._id} className="client-card" onClick={() => navigate(`/clients/${c._id}`)}>
              <div className="client-card-top">
                <div className="client-avatar">
                  {(c.name || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="client-id-badge">{c.clientId}</span>
              </div>
              <p className="client-name">{c.name}</p>
              <div className="client-details">
                {c.email && (
                  <p className="client-info">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    {c.email}
                  </p>
                )}
                {c.phone && (
                  <p className="client-info">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                    </svg>
                    {c.phone}
                  </p>
                )}
                <div className="client-meta">
                  {c.gender && <span className="client-tag gender-tag">{c.gender}</span>}
                  {c.relationshipStatus && <span className="client-tag relationship-tag">{c.relationshipStatus}</span>}
                  {c.age > 0 && <span className="client-tag age-tag">{c.age} yrs</span>}
                </div>
              </div>
              <button
                className="btn-delete-client"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(c._id);
                }}
                title="Delete client"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal active" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingClient ? 'Edit Client' : 'Add New Client'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                &times;
              </button>
            </div>
            {/* Top-level form summary removed — using inline field errors only */}
            <form className="modal-form" onSubmit={handleSubmit}>
              {/* Client ID - auto generated, read only */}
              <div className="form-group id-field">
                <label>Client ID</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setClientId(raw);
                      setClientIdError('');
                      setFieldErrors((f) => ({ ...f, clientId: '' }));
                      const norm = raw.trim().toUpperCase();
                      if (!norm) {
                        setClientIdValid(null);
                        setSuggestedId('');
                        return;
                      }
                      const dupLive = clients.find((c) => c.clientId.toUpperCase() === norm && c._id !== editingClient?._id);
                      if (dupLive) {
                        setClientIdValid(false);
                        setSuggestedId(generateClientId());
                      } else {
                        setClientIdValid(true);
                        setSuggestedId('');
                      }
                    }}
                    aria-invalid={clientIdValid === false}
                  />
                  {clientIdValid === true && (
                    <span className="id-check valid" aria-hidden>
                      ✓
                    </span>
                  )}
                  {clientIdValid === false && (
                    <span className="id-check invalid" aria-hidden>
                      ✕
                    </span>
                  )}
                </div>
                {clientIdError && <div className="field-error">{clientIdError}</div>}
                {fieldErrors.clientId && <div className="field-error">{fieldErrors.clientId}</div>}
                {suggestedId && (
                  <div className="id-suggestion">
                    <span>Suggested: <strong>{suggestedId}</strong></span>
                    <button type="button" className="link-btn" onClick={() => { setClientId(suggestedId); setClientIdValid(true); setSuggestedId(''); setClientIdError(''); }}>
                      Use suggestion
                    </button>
                  </div>
                )}
              </div>

              {/* Client Name */}
              <div className="form-group">
                <label>Client Name</label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                    onChange={(e) => {
                    setName(e.target.value);
                    setFieldErrors((f) => ({ ...f, name: '' }));
                  }}
                />
                {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
              </div>

              {/* Email or Phone toggle */}
              <div className="form-group">
                <label>Contact</label>
                <div className="contact-toggle">
                  <button
                    type="button"
                    className={`toggle-btn ${contactType === 'email' ? 'active' : ''}`}
                    onClick={() => setContactType('email')}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${contactType === 'phone' ? 'active' : ''}`}
                    onClick={() => setContactType('phone')}
                  >
                    Phone
                  </button>
                </div>
                {contactType === 'email' ? (
                  <>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setFieldErrors((f) => ({ ...f, contact: '' }));
                      }}
                    />
                    {fieldErrors.contact && <div className="field-error">{fieldErrors.contact}</div>}
                  </>
                ) : (
                  <>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setFieldErrors((f) => ({ ...f, contact: '' }));
                      }}
                    />
                    {fieldErrors.contact && <div className="field-error">{fieldErrors.contact}</div>}
                  </>
                )}
              </div>

              {/* Gender */}
              <div className="form-group">
                <label>Gender</label>
                <select
                  value={gender}
                  onChange={(e) => {
                    setGender(e.target.value);
                    setFieldErrors((f) => ({ ...f, gender: '' }));
                  }}
                >
                  <option value="" disabled>Select gender</option>
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Relationship Status */}
              <div className="form-group">
                <label>Relationship Status</label>
                <select
                  value={relationshipStatus}
                  onChange={(e) => {
                    setRelationshipStatus(e.target.value);
                    setFieldErrors((f) => ({ ...f, relationshipStatus: '' }));
                  }}
                >
                  <option value="" disabled>Select status</option>
                  {RELATIONSHIP_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Age with increment/decrement */}
              <div className="form-group">
                <label>Age</label>
                <div className="age-spinner">
                  <button
                    type="button"
                    className="spinner-btn"
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
                    max="120"
                    value={age}
                    onChange={(e) => setAge(Math.max(0, Math.min(120, parseInt(e.target.value) || 0)))}
                    className="age-input"
                  />
                  <button
                    type="button"
                    className="spinner-btn"
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

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingClient ? 'Save Changes' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.open && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Client</h3>
              <button className="modal-close" onClick={cancelDelete}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{deleteConfirm.clientName}</strong>?</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={cancelDelete}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                Delete Client
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
