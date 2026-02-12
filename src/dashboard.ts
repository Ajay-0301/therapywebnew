// ========================================================================
// THERAPY NOTES DASHBOARD - MODERN TYPESCRIPT IMPLEMENTATION
// ========================================================================

interface Client {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    condition?: string;
    createdAt: number;
}

interface DeletedClient {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    deletedAt: number;
}

interface Appointment {
    id: string;
    clientName: string;
    dateTime: number;
    notes?: string;
}

interface Session {
    id: string;
    clientName: string;
    scheduledDate: number;
    type: string;
}

interface UserData {
    email: string;
    name: string;
}

// ========================================================================
// INITIALIZATION
// ========================================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    setupMobileMenu();
});

function initializeDashboard(): void {
    loadUserData();
    setupNavigation();
    setupEventListeners();
    setupUserNameEdit();

    // Load page-specific data based on current page
    const currentFile = window.location.pathname.split('/').pop() || 'dashboard.html';
    if (currentFile === 'dashboard.html') {
        updateStats();
    } else if (currentFile === 'clients.html') {
        renderClientsList();
    }
}

// ========================================================================
// USER DATA MANAGEMENT
// ========================================================================

function loadUserData(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
        const user: UserData = JSON.parse(userData);
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = user.name || 'Demo User';
        }
    }
}

function setupUserNameEdit(): void {
    const userNameElement = document.getElementById('userName');
    const editIcon = document.querySelector('.edit-icon');

    if (userNameElement) {
        // Click edit icon to focus name field
        if (editIcon) {
            editIcon.addEventListener('click', () => {
                userNameElement.focus();
                // Select all text for easy editing
                const range = document.createRange();
                range.selectNodeContents(userNameElement);
                const sel = window.getSelection();
                if (sel) {
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            });
        }

        // Save name on blur (when user clicks away)
        userNameElement.addEventListener('blur', () => {
            const newName = userNameElement.textContent?.trim() || 'Demo User';
            const userData = localStorage.getItem('userData');
            if (userData) {
                const user: UserData = JSON.parse(userData);
                user.name = newName;
                localStorage.setItem('userData', JSON.stringify(user));
            }
        });

        // Save name on Enter key
        userNameElement.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                userNameElement.blur();
            }
        });
    }
}

// ========================================================================
// NAVIGATION SYSTEM (Multi-page)
// ========================================================================

function setupNavigation(): void {
    const navButtons = document.querySelectorAll('.nav-item');

    // Map page names to HTML files
    const pageMap: { [key: string]: string } = {
        dashboard: 'dashboard.html',
        clients: 'clients.html',
        insights: 'insights.html',
        settings: 'settings.html',
    };

    navButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = (button as HTMLElement).getAttribute('data-page');
            if (pageName && pageMap[pageName]) {
                window.location.href = pageMap[pageName];
            }
        });
    });

    // Highlight the current page's nav item
    highlightCurrentPage();
}

function highlightCurrentPage(): void {
    const currentFile = window.location.pathname.split('/').pop() || 'dashboard.html';
    const fileToPage: { [key: string]: string } = {
        'dashboard.html': 'dashboard',
        'clients.html': 'clients',
        'insights.html': 'insights',
        'settings.html': 'settings',
    };

    const currentPageName = fileToPage[currentFile] || 'dashboard';

    const navButtons = document.querySelectorAll('.nav-item');
    navButtons.forEach((button) => {
        button.classList.remove('active');
        if ((button as HTMLElement).getAttribute('data-page') === currentPageName) {
            button.classList.add('active');
        }
    });
}

// ========================================================================
// STATS AND DASHBOARD
// ========================================================================

function updateStats(): void {
    const clients = getClients();

    const statClients = document.getElementById('statClients');
    const statSessions = document.getElementById('statSessions');
    const statCompleted = document.getElementById('statCompleted');

    if (statClients) statClients.textContent = clients.length.toString();
    if (statSessions) statSessions.textContent = (clients.length * 3).toString();
    if (statCompleted) statCompleted.textContent = '0';

    // Render dashboard boxes
    renderDeletedClients();
    renderUpcomingAppointments();
    renderNewSessions();
}

// ========================================================================
// DASHBOARD BOXES - DATA & RENDERING
// ========================================================================

function getDeletedClients(): DeletedClient[] {
    const stored = localStorage.getItem('therapyDeletedClients');
    return stored ? JSON.parse(stored) : [];
}

function saveDeletedClients(clients: DeletedClient[]): void {
    localStorage.setItem('therapyDeletedClients', JSON.stringify(clients));
}

function getAppointments(): Appointment[] {
    const stored = localStorage.getItem('therapyAppointments');
    return stored ? JSON.parse(stored) : [];
}

function saveAppointments(appointments: Appointment[]): void {
    localStorage.setItem('therapyAppointments', JSON.stringify(appointments));
}

function getSessions(): Session[] {
    const stored = localStorage.getItem('therapySessions');
    return stored ? JSON.parse(stored) : [];
}

function saveSessions(sessions: Session[]): void {
    localStorage.setItem('therapySessions', JSON.stringify(sessions));
}

function timeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(timestamp).toLocaleDateString();
}

function formatDateTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (date.toDateString() === now.toDateString()) {
        return `Today at ${timeStr}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow at ${timeStr}`;
    } else {
        return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
    }
}

function renderDeletedClients(): void {
    const container = document.getElementById('deletedClientsList');
    const countEl = document.getElementById('deletedCount');
    if (!container) return;

    const deletedClients = getDeletedClients();

    if (countEl) countEl.textContent = `${deletedClients.length} client${deletedClients.length !== 1 ? 's' : ''}`;

    if (deletedClients.length === 0) {
        container.innerHTML = `<div class="box-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
            </svg>
            <p>No recently deleted clients</p>
        </div>`;
        return;
    }

    // Show most recent first, limit to 5
    const sorted = [...deletedClients].sort((a, b) => b.deletedAt - a.deletedAt).slice(0, 5);
    container.innerHTML = sorted.map(client => `
        <div class="box-item">
            <p class="box-item-name">${client.firstName} ${client.lastName}</p>
            <p class="box-item-time">Deleted ${timeAgo(client.deletedAt)}</p>
        </div>
    `).join('');
}

function renderUpcomingAppointments(): void {
    const container = document.getElementById('upcomingAppointmentsList');
    const countEl = document.getElementById('appointmentsCount');
    if (!container) return;

    const appointments = getAppointments();
    const now = Date.now();

    // Only future appointments, sorted by nearest first
    const upcoming = appointments
        .filter(a => a.dateTime > now)
        .sort((a, b) => a.dateTime - b.dateTime)
        .slice(0, 5);

    if (countEl) countEl.textContent = `${upcoming.length} appointment${upcoming.length !== 1 ? 's' : ''}`;

    if (upcoming.length === 0) {
        container.innerHTML = `<div class="box-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <p>No upcoming appointments</p>
        </div>`;
        return;
    }

    container.innerHTML = upcoming.map(appt => `
        <div class="box-item">
            <p class="box-item-name">${appt.clientName}</p>
            <p class="box-item-time">${formatDateTime(appt.dateTime)}</p>
        </div>
    `).join('');
}

function renderNewSessions(): void {
    const container = document.getElementById('newSessionsList');
    const countEl = document.getElementById('sessionsCount');
    if (!container) return;

    const sessions = getSessions();

    if (countEl) countEl.textContent = `${sessions.length} session${sessions.length !== 1 ? 's' : ''}`;

    if (sessions.length === 0) {
        container.innerHTML = `<div class="box-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <p>No upcoming follow-up sessions</p>
        </div>`;
        return;
    }

    // Most recently created first, limit to 5
    const sorted = [...sessions].sort((a, b) => b.scheduledDate - a.scheduledDate).slice(0, 5);
    container.innerHTML = sorted.map(session => `
        <div class="box-item">
            <p class="box-item-name">${session.clientName}</p>
            <p class="box-item-time">${session.type} - ${formatDateTime(session.scheduledDate)}</p>
        </div>
    `).join('');
}

// ========================================================================
// CLIENT MANAGEMENT
// ========================================================================

function getClients(): Client[] {
    const stored = localStorage.getItem('therapyClients');
    return stored ? JSON.parse(stored) : [];
}

function saveClients(clients: Client[]): void {
    localStorage.setItem('therapyClients', JSON.stringify(clients));
}

function renderClientsList(): void {
    const clients = getClients();
    const container = document.getElementById('clientsList');

    if (!container) return;

    if (clients.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #94a3b8;">
                <p style="font-size: 16px; margin-bottom: 16px;">No clients yet. Click "Add Client" to get started.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = clients
        .map(
            (client) => `
        <div class="client-card">
            <div class="client-avatar" style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin-bottom: 12px;">
                ${client.firstName.charAt(0)}${client.lastName.charAt(0)}
            </div>
            <div class="client-name">${client.firstName} ${client.lastName}</div>
            <div class="client-info">${client.email}</div>
            ${client.phone ? `<div class="client-info">${client.phone}</div>` : ''}
            ${client.condition ? `<div class="client-status">${client.condition}</div>` : ''}
        </div>
    `
        )
        .join('');
}

// ========================================================================
// MODAL MANAGEMENT
// ========================================================================

function setupEventListeners(): void {
    // Add Client Button
    const addClientBtn = document.getElementById('addClientBtn');
    if (addClientBtn) {
        addClientBtn.addEventListener('click', openClientModal);
    }

    // Modal Close Button
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeClientModal);
    }

    // Cancel Button
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeClientModal);
    }

    // Form Submission
    const clientForm = document.getElementById('clientForm') as HTMLFormElement | null;
    if (clientForm) {
        clientForm.addEventListener('submit', handleAddClient);
    }

    // Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Settings Page Load
    const settingsName = document.getElementById('settingsName') as HTMLInputElement | null;
    const settingsEmail = document.getElementById('settingsEmail') as HTMLInputElement | null;

    if (settingsName && settingsEmail) {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const user: UserData = JSON.parse(userData);
            settingsName.value = user.name;
            settingsEmail.value = user.email;
        }
    }
}

function openClientModal(): void {
    const modal = document.getElementById('clientModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeClientModal(): void {
    const modal = document.getElementById('clientModal');
    if (modal) {
        modal.classList.remove('active');
    }

    // Reset form
    const form = document.getElementById('clientForm') as HTMLFormElement | null;
    if (form) {
        form.reset();
    }
}

function handleAddClient(e: Event): void {
    e.preventDefault();

    const firstName = (document.getElementById('clientFirstName') as HTMLInputElement).value;
    const lastName = (document.getElementById('clientLastName') as HTMLInputElement).value;
    const email = (document.getElementById('clientEmail') as HTMLInputElement).value;
    const phone = (document.getElementById('clientPhone') as HTMLInputElement).value;
    const condition = (document.getElementById('clientCondition') as HTMLInputElement).value;

    if (!firstName || !lastName || !email) {
        alert('Please fill in all required fields');
        return;
    }

    const newClient: Client = {
        id: Date.now().toString(),
        firstName,
        lastName,
        email,
        phone,
        condition,
        createdAt: Date.now(),
    };

    const clients = getClients();
    clients.push(newClient);
    saveClients(clients);

    updateStats();
    renderClientsList();
    closeClientModal();

    displaySuccessNotification(`${firstName} ${lastName} added successfully!`);
}

// ========================================================================
// SUCCESS MESSAGE
// ========================================================================

function displaySuccessNotification(message: string): void {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.cssText =
        'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 3000;';

    const content = document.createElement('div');
    content.style.cssText =
        'background: white; border-radius: 12px; padding: 40px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.15); animation: slideUp 0.3s ease-in-out;';

    content.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 16px;">✓</div>
        <h3 style="font-size: 24px; font-weight: 600; margin-bottom: 8px; color: #0f172a;">${message}</h3>
        <p style="color: #475569; margin-bottom: 24px">Great job!</p>
        <button style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; border: none; padding: 10px 24px; border-radius: 8px; cursor: pointer; font-weight: 500;">OK</button>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    const button = content.querySelector('button');
    if (button) {
        button.addEventListener('click', () => {
            modal.remove();
        });
    }

    setTimeout(() => {
        modal.remove();
    }, 3000);
}

// ========================================================================
// MOBILE MENU
// ========================================================================

function setupMobileMenu(): void {
    const hamburger = document.getElementById('hamburgerMenu');
    const sidebar = document.querySelector('.sidebar') as HTMLElement | null;

    if (hamburger && sidebar) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            sidebar.classList.toggle('active');
        });

        // Close sidebar when clicking outside (only on mobile)
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (window.innerWidth <= 1024 && 
                !sidebar.contains(target) && 
                !hamburger.contains(target) && 
                sidebar.classList.contains('active')) {
                hamburger.classList.remove('active');
                sidebar.classList.remove('active');
            }
        });
    }
}

// ========================================================================
// LOGOUT
// ========================================================================

function handleLogout(): void {
    localStorage.removeItem('userData');
    window.location.href = 'index.html';
}
