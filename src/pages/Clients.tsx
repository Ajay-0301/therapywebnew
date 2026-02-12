import { useState, useEffect, FormEvent } from 'react';
import {
  getClients,
  saveClients,
  getDeletedClients,
  saveDeletedClients,
  type Client,
} from '../utils/store';
import '../styles/clients.css';

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [condition, setCondition] = useState('');

  useEffect(() => {
    setClients(getClients());
  }, []);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.condition || '').toLowerCase().includes(q)
    );
  });

  function openAdd() {
    setEditingClient(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setCondition('');
    setModalOpen(true);
  }

  function openEdit(c: Client) {
    setEditingClient(c);
    setFirstName(c.firstName);
    setLastName(c.lastName);
    setEmail(c.email);
    setPhone(c.phone || '');
    setCondition(c.condition || '');
    setModalOpen(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (editingClient) {
      const updated = clients.map((c) =>
        c.id === editingClient.id
          ? { ...c, firstName, lastName, email, phone, condition }
          : c
      );
      setClients(updated);
      saveClients(updated);
    } else {
      const newClient: Client = {
        id: crypto.randomUUID(),
        firstName,
        lastName,
        email,
        phone,
        condition,
        createdAt: Date.now(),
      };
      const updated = [newClient, ...clients];
      setClients(updated);
      saveClients(updated);
    }
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    const client = clients.find((c) => c.id === id);
    if (!client) return;
    if (!confirm(`Delete ${client.firstName} ${client.lastName}?`)) return;

    // Move to deleted
    const deleted = getDeletedClients();
    deleted.unshift({
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      deletedAt: Date.now(),
    });
    saveDeletedClients(deleted);

    const updated = clients.filter((c) => c.id !== id);
    setClients(updated);
    saveClients(updated);
  }

  return (
    <section className="page active">
      <div className="page-header">
        <div>
          <h2>Clients</h2>
          <p className="page-subtitle">Manage your therapy clients</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          + Add Client
        </button>
      </div>

      <div className="clients-filters">
        <input
          type="text"
          className="search-input"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="clients-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>No clients found. Click "+ Add Client" to get started.</p>
          </div>
        ) : (
          filtered.map((c) => (
            <div key={c.id} className="client-card" onClick={() => openEdit(c)}>
              <div className="client-avatar">
                {c.firstName.charAt(0)}
                {c.lastName.charAt(0)}
              </div>
              <p className="client-name">
                {c.firstName} {c.lastName}
              </p>
              <p className="client-info">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {c.email}
              </p>
              {c.condition && <span className="client-status">{c.condition}</span>}
              <button
                className="btn-delete-client"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(c.id);
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
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>First Name</label>
                <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Condition</label>
                <input
                  type="text"
                  placeholder="e.g., Anxiety, Depression"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                />
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
    </section>
  );
}
