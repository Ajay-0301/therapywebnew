// Shared types
export interface SessionRecord {
    id: string;
    date: string;
    notes: string;
    followUpDate: string;
    followUpNotes: string;
}

export interface Client {
    id: string;
    clientId: string;
    name: string;
    email: string;
    phone: string;
    gender: string;
    relationshipStatus: string;
    age: number;
    occupation: string;
    status: 'active' | 'completed';
    sessionCount: number;
    chiefComplaints: string;
    hopi: string;
    sessionHistory: SessionRecord[];
    createdAt: number;
}

export interface DeletedClient {
    id: string;
    clientId: string;
    name: string;
    email: string;
    deletedAt: number;
}

// Generate a readable client ID like CL-001, CL-002, etc.
export function generateClientId(): string {
    const clients = getClients();
    const deleted = getDeletedClients();
    const allIds = [...clients, ...deleted]
        .map((c) => {
            const match = ('clientId' in c ? (c as Client).clientId : '').match(/CL-(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
        });
    const maxNum = allIds.length > 0 ? Math.max(...allIds) : 0;
    return `CL-${String(maxNum + 1).padStart(3, '0')}`;
}

export interface Appointment {
    id: string;
    clientName: string;
    dateTime: number;
    notes?: string;
}

export interface Session {
    id: string;
    clientName: string;
    scheduledDate: number;
    type: string;
}

export interface UserData {
    email: string;
    name: string;
    id?: string;
    registeredAt?: string;
    avatar?: string; // optional base64 data URL or image URL
}

// LocalStorage helpers
export function getClients(): Client[] {
    const stored = localStorage.getItem('therapyClients');
    return stored ? JSON.parse(stored) : [];
}

export function saveClients(clients: Client[]): void {
    localStorage.setItem('therapyClients', JSON.stringify(clients));
}

export function getDeletedClients(): DeletedClient[] {
    const stored = localStorage.getItem('therapyDeletedClients');
    return stored ? JSON.parse(stored) : [];
}

export function saveDeletedClients(clients: DeletedClient[]): void {
    localStorage.setItem('therapyDeletedClients', JSON.stringify(clients));
}

export function getAppointments(): Appointment[] {
    const stored = localStorage.getItem('therapyAppointments');
    return stored ? JSON.parse(stored) : [];
}

export function saveAppointments(appointments: Appointment[]): void {
    localStorage.setItem('therapyAppointments', JSON.stringify(appointments));
}

export function getSessions(): Session[] {
    const stored = localStorage.getItem('therapySessions');
    return stored ? JSON.parse(stored) : [];
}

export function saveSessions(sessions: Session[]): void {
    localStorage.setItem('therapySessions', JSON.stringify(sessions));
}

export function getUserData(): UserData | null {
    const stored = localStorage.getItem('userData');
    return stored ? JSON.parse(stored) : null;
}

export function saveUserData(data: UserData): void {
    localStorage.setItem('userData', JSON.stringify(data));
}

// Formatting helpers
export function timeAgo(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(timestamp).toLocaleDateString();
}

export function formatDateTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (date.toDateString() === now.toDateString()) return `Today at ${timeStr}`;
    if (date.toDateString() === tomorrow.toDateString()) return `Tomorrow at ${timeStr}`;
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
}
