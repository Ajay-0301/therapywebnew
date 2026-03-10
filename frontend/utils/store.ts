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
    clientAge?: number;
    dateTime: number;
    duration?: number; // in minutes
    notes?: string;
}

export interface Session {
    id: string;
    clientName: string;
    scheduledDate: number;
    type: string;
}

export interface Earning {
    id: string;
    day: number; // 1-31
    month: number; // 0-11
    year: number;
    amount: number;
    timestamp: number;
}

export interface UserData {
    email: string;
    name: string;
    id?: string;
    registeredAt?: string;
    avatar?: string; // optional base64 data URL or image URL
    theme?: 'light' | 'dark'; // theme preference
    notificationsEnabled?: boolean; // email notifications
}

export interface SiteSettings {
    themeMode: 'light' | 'dark' | 'system';
    density: 'compact' | 'comfortable';
    sidebarBehavior: 'expanded' | 'collapsed';
    language: 'en' | 'hi' | 'ta' | 'es' | 'fr';
    timeFormat: '12h' | '24h';
    accentColor: string;
    practiceName: string;
}

export const defaultSiteSettings: SiteSettings = {
    themeMode: 'system',
    density: 'comfortable',
    sidebarBehavior: 'expanded',
    language: 'en',
    timeFormat: '12h',
    accentColor: '#667eea',
    practiceName: 'Therapy'
};

// LocalStorage helpers
function safeGetItem(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(`localStorage getItem failed for ${key}`, err);
        return null;
    }
}

function safeSetItem(key: string, value: string): void {
    try {
        localStorage.setItem(key, value);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(`localStorage setItem failed for ${key}`, err);
    }
}

function safeRemoveItem(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(`localStorage removeItem failed for ${key}`, err);
    }
}

function safeParse<T>(raw: string | null, fallback: T, storageKey: string): T {
    if (!raw) return fallback;
    try {
        return JSON.parse(raw) as T;
    } catch (err) {
        // Corrupt storage should not crash the app; clear the bad value.
        // eslint-disable-next-line no-console
        console.warn(`Invalid JSON in localStorage for ${storageKey}`, err);
        safeRemoveItem(storageKey);
        return fallback;
    }
}

export function getClients(): Client[] {
    return safeParse<Client[]>(safeGetItem('therapyClients'), [], 'therapyClients');
}

export function saveClients(clients: Client[]): void {
    safeSetItem('therapyClients', JSON.stringify(clients));
}

export function getDeletedClients(): DeletedClient[] {
    return safeParse<DeletedClient[]>(safeGetItem('therapyDeletedClients'), [], 'therapyDeletedClients');
}

export function saveDeletedClients(clients: DeletedClient[]): void {
    safeSetItem('therapyDeletedClients', JSON.stringify(clients));
}

export function getAppointments(): Appointment[] {
    return safeParse<Appointment[]>(safeGetItem('therapyAppointments'), [], 'therapyAppointments');
}

export function saveAppointments(appointments: Appointment[]): void {
    safeSetItem('therapyAppointments', JSON.stringify(appointments));
}

export function getSessions(): Session[] {
    return safeParse<Session[]>(safeGetItem('therapySessions'), [], 'therapySessions');
}

export function saveSessions(sessions: Session[]): void {
    safeSetItem('therapySessions', JSON.stringify(sessions));
}

export function getEarnings(): Earning[] {
    return safeParse<Earning[]>(safeGetItem('therapyEarnings'), [], 'therapyEarnings');
}

export function saveEarnings(earnings: Earning[]): void {
    safeSetItem('therapyEarnings', JSON.stringify(earnings));
}

export function getUserData(): UserData | null {
    return safeParse<UserData | null>(safeGetItem('userData'), null, 'userData');
}

export function saveUserData(data: UserData): void {
    safeSetItem('userData', JSON.stringify(data));
}

export function getSiteSettings(): SiteSettings {
    return safeParse<SiteSettings>(safeGetItem('siteSettings'), defaultSiteSettings, 'siteSettings');
}

export function saveSiteSettings(data: SiteSettings): void {
    safeSetItem('siteSettings', JSON.stringify(data));
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

export function formatDateTime(timestamp: number, timeFormat: SiteSettings['timeFormat'] = '12h'): string {
    const date = new Date(timestamp);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const timeStr = timeFormat === '24h' 
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    if (date.toDateString() === now.toDateString()) return `Today at ${timeStr}`;
    if (date.toDateString() === tomorrow.toDateString()) return `Tomorrow at ${timeStr}`;
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
}

// Time format conversion utilities
export function format24to12(time24: string): string {
    if (!time24 || !time24.includes(':')) return time24;
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${String(displayHour).padStart(2, '0')}:${minutes} ${ampm}`;
}

export function format12to24(time12: string): string {
    if (!time12) return time12;
    const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return time12;
    
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = match[3]?.toUpperCase();
    
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    
    return `${String(hours).padStart(2, '0')}:${minutes}`;
}

export function formatTimeDisplay(time24: string, timeFormat: SiteSettings['timeFormat']): string {
    if (!time24) return time24;
    if (timeFormat === '24h') return time24;
    return format24to12(time24);
}

// Delete functions
export function deleteDeletedClient(clientId: string): void {
    const deleted = getDeletedClients();
    saveDeletedClients(deleted.filter(c => c.id !== clientId));
}

export function deleteAppointment(appointmentId: string): void {
    const appointments = getAppointments();
    saveAppointments(appointments.filter(a => a.id !== appointmentId));
}
