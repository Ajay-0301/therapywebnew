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
    updateStats();
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
// NAVIGATION SYSTEM
// ========================================================================

function setupNavigation(): void {
    const navButtons = document.querySelectorAll('.nav-item');

    navButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = (button as HTMLElement).getAttribute('data-page');
            if (pageName) {
                navigateToPage(pageName);
            }
        });
    });
}

function navigateToPage(pageName: string): void {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach((page) => {
        page.classList.remove('active');
    });

    // Show selected page
    const selectedPage = document.getElementById(`${pageName}-page`);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }

    // Update nav button active state
    const navButtons = document.querySelectorAll('.nav-item');
    navButtons.forEach((button) => {
        button.classList.remove('active');
        if ((button as HTMLElement).getAttribute('data-page') === pageName) {
            button.classList.add('active');
        }
    });

    // Load page-specific data
    if (pageName === 'clients') {
        renderClientsList();
    } else if (pageName === 'dashboard') {
        updateStats();
    }
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
