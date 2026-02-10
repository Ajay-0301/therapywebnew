/* ========================================
   DASHBOARD FUNCTIONALITY
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    if (!userData) {
        // Redirect to login if not logged in
        window.location.href = 'index.html';
        return;
    }

    // Display user name
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userData.name || 'User';
    }

    // Handle navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const pageId = this.getAttribute('data-page');

            // Remove active class from all links and pages
            navLinks.forEach(l => l.classList.remove('active'));
            pages.forEach(p => p.style.display = 'none');

            // Add active class to clicked link
            this.classList.add('active');

            // Show corresponding page
            const pageElement = document.getElementById(pageId + '-page');
            if (pageElement) {
                pageElement.style.display = 'block';
            }

            // Close sidebar on mobile if open
            const sidebar = document.querySelector('.sidebar');
            if (sidebar && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        });
    });

    // Handle logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }

    // Initialize dashboard statistics
    initializeDashboardStats();

    // Clients page functionality
    initializeClientsPage();
});

function initializeDashboardStats() {
    // These values can be replaced with actual API calls
    const statsData = {
        totalClients: 24,
        activeClients: 18,
        appointments: 7,
        totalSessions: 156
    };

    // Update stat cards with data
    document.getElementById('totalClients').textContent = statsData.totalClients;
    document.getElementById('activeClients').textContent = statsData.activeClients;
    document.getElementById('appointments').textContent = statsData.appointments;
    document.getElementById('totalSessions').textContent = statsData.totalSessions;
}

function initializeClientsPage() {
    // Load clients from localStorage
    let clients = JSON.parse(localStorage.getItem('therapyClients')) || [];
    
    // Modal elements
    const addClientBtn = document.getElementById('addClientBtn');
    const addClientModal = document.getElementById('addClientModal');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelModalBtn = document.getElementById('cancelModal');
    const addClientForm = document.getElementById('addClientForm');
    const clientsList = document.getElementById('clientsList');
    const clientSearch = document.getElementById('clientSearch');
    const filterTabs = document.querySelectorAll('.filter-tab');
    
    // View switching
    const clientsListView = document.getElementById('clientsListView');
    const clientProfileView = document.getElementById('clientProfileView');
    const backToListBtn = document.getElementById('backToList');
    
    let currentFilter = 'all';
    let currentClientId = null;
    
    // Add Client button
    if (addClientBtn) {
        addClientBtn.addEventListener('click', openAddClientModal);
    }
    
    // Close modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeAddClientModal);
    }
    
    if (cancelModalBtn) {
        cancelModalBtn.addEventListener('click', closeAddClientModal);
    }
    
    // Close modal when clicking outside
    if (addClientModal) {
        addClientModal.addEventListener('click', function(e) {
            if (e.target === addClientModal) {
                closeAddClientModal();
            }
        });
    }
    
    // Add Client form submission
    if (addClientForm) {
        addClientForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('clientName').value;
            const age = document.getElementById('clientAge').value;
            const email = document.getElementById('clientEmail').value;
            const phone = document.getElementById('clientPhone').value;
            
            if (!email && !phone) {
                alert('Please provide either email or phone number');
                return;
            }
            
            const newClient = {
                id: Date.now(),
                name,
                age: parseInt(age),
                email,
                phone,
                status: 'active',
                sessions: 0,
                occupation: '',
                chiefComplaints: '',
                hopi: '',
                sessionNotes: '',
                nextSessionDate: '',
                followUpNotes: '',
                createdAt: new Date().toISOString()
            };
            
            clients.push(newClient);
            localStorage.setItem('therapyClients', JSON.stringify(clients));
            
            addClientForm.reset();
            closeAddClientModal();
            renderClients(clients);
        });
    }
    
    // Filter tabs
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            renderClients(filterClients(clients, currentFilter));
        });
    });
    
    // Search functionality
    if (clientSearch) {
        clientSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const filtered = clients.filter(client => 
                client.name.toLowerCase().includes(searchTerm)
            );
            renderClients(filterClients(filtered, currentFilter));
        });
    }
    
    // Back to list
    if (backToListBtn) {
        backToListBtn.addEventListener('click', function() {
            clientsListView.style.display = 'block';
            clientProfileView.style.display = 'none';
        });
    }
    
    // Render clients
    renderClients(clients);
    
    function openAddClientModal() {
        addClientModal.classList.add('active');
    }
    
    function closeAddClientModal() {
        addClientModal.classList.remove('active');
    }
    
    function filterClients(clients, filter) {
        if (filter === 'active') {
            return clients.filter(c => c.status === 'active');
        } else if (filter === 'completed') {
            return clients.filter(c => c.status === 'completed');
        }
        return clients;
    }
    
    function renderClients(clientsToRender) {
        if (clientsToRender.length === 0) {
            clientsList.innerHTML = '<div class="empty-state"><p>📋 No clients yet. Click "Add Client" to get started.</p></div>';
            return;
        }
        
        clientsList.innerHTML = clientsToRender.map(client => `
            <div class="client-card" data-id="${client.id}">
                <div class="client-card-header">
                    <div>
                        <div class="client-name">${client.name}</div>
                        <div class="client-age">Age: ${client.age}</div>
                    </div>
                    <div class="client-status ${client.status === 'active' ? 'status-active' : 'status-completed'}">
                        ${client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                    </div>
                </div>
                ${client.email ? `<div class="client-contact">📧 ${client.email}</div>` : ''}
                ${client.phone ? `<div class="client-contact">📱 ${client.phone}</div>` : ''}
                <div class="client-sessions">Sessions: ${client.sessions}</div>
            </div>
        `).join('');
        
        // Add click handlers
        document.querySelectorAll('.client-card').forEach(card => {
            card.addEventListener('click', function() {
                const clientId = parseInt(this.getAttribute('data-id'));
                showClientProfile(clientId);
            });
        });
    }
    
    function showClientProfile(clientId) {
        const client = clients.find(c => c.id === clientId);
        if (!client) return;
        
        currentClientId = clientId;
        
        // Populate profile fields
        document.getElementById('profileName').value = client.name;
        document.getElementById('profileAge').value = client.age;
        document.getElementById('profileOccupation').value = client.occupation || '';
        document.getElementById('sessionCount').textContent = client.sessions;
        document.getElementById('chiefComplaints').value = client.chiefComplaints || '';
        document.getElementById('hopi').value = client.hopi || '';
        document.getElementById('sessionNotes').value = client.sessionNotes || '';
        document.getElementById('nextSessionDate').value = client.nextSessionDate || '';
        document.getElementById('followUpNotes').value = client.followUpNotes || '';
        
        // Set status
        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-status') === client.status) {
                btn.classList.add('active');
            }
        });
        
        // Switch views
        clientsListView.style.display = 'none';
        clientProfileView.style.display = 'block';
        
        // Add event listeners for profile actions
        addProfileEventListeners();
    }
    
    function addProfileEventListeners() {
        // Status buttons
        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const status = this.getAttribute('data-status');
                const client = clients.find(c => c.id === currentClientId);
                if (client) {
                    client.status = status;
                    localStorage.setItem('therapyClients', JSON.stringify(clients));
                    document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                }
            });
        });
        
        // Session buttons
        document.querySelectorAll('.session-btn').forEach((btn, idx) => {
            btn.removeEventListener('click', null);
            btn.addEventListener('click', function() {
                const client = clients.find(c => c.id === currentClientId);
                if (client) {
                    if (btn.textContent === '−') {
                        if (client.sessions > 0) client.sessions--;
                    } else {
                        client.sessions++;
                    }
                    localStorage.setItem('therapyClients', JSON.stringify(clients));
                    document.getElementById('sessionCount').textContent = client.sessions;
                }
            });
        });
        
        // Save button
        const saveBtn = document.getElementById('saveSessionBtn');
        if (saveBtn) {
            saveBtn.removeEventListener('click', null);
            saveBtn.addEventListener('click', function() {
                const client = clients.find(c => c.id === currentClientId);
                if (client) {
                    client.occupation = document.getElementById('profileOccupation').value;
                    client.chiefComplaints = document.getElementById('chiefComplaints').value;
                    client.hopi = document.getElementById('hopi').value;
                    client.sessionNotes = document.getElementById('sessionNotes').value;
                    client.nextSessionDate = document.getElementById('nextSessionDate').value;
                    client.followUpNotes = document.getElementById('followUpNotes').value;
                    localStorage.setItem('therapyClients', JSON.stringify(clients));
                    alert('✓ Session details saved successfully!');
                }
            });
        }
    }
}

function logout() {
    // Clear user data
    localStorage.removeItem('userData');
    
    // Redirect to login page
    window.location.href = 'index.html';
}

// Mobile menu toggle (if needed in future)
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}
