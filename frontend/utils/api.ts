// API Base URL
const API_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
function getAuthToken(): string | null {
  try {
    const token = localStorage.getItem('authToken');
    return token;
  } catch (err) {
    console.error('Failed to get auth token:', err);
    return null;
  }
}

// Set auth token to localStorage
function setAuthToken(token: string): void {
  try {
    localStorage.setItem('authToken', token);
  } catch (err) {
    console.error('Failed to set auth token:', err);
  }
}

// Clear auth token
function clearAuthToken(): void {
  try {
    localStorage.removeItem('authToken');
  } catch (err) {
    console.error('Failed to clear auth token:', err);
  }
}

// Generic API request handler
export async function apiRequest<T>(
  endpoint: string,
  method: string = 'GET',
  body?: unknown
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      if (response.status === 401) {
        // Unauthorized - clear token and redirect to login
        clearAuthToken();
        window.location.href = '/login';
      }
      
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json() as { message?: string };
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Could not parse JSON error response
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Network error - please check your connection';
    console.error(`API Error [${method} ${endpoint}]:`, errorMessage, error);
    throw error;
  }
}

// ========================================
// AUTH API
// ========================================

interface AuthResponse {
  token: string;
  user?: { id: string; email: string; name: string; avatar?: string };
}

interface CurrentUserResponse {
  _id?: string;
  id?: string;
  email: string;
  fullName?: string;
  name?: string;
  avatar?: string;
}

export async function register(email: string, password: string, name: string) {
  const response = await apiRequest<AuthResponse>('/auth/register', 'POST', { email, password, name });
  if (response.token) {
    setAuthToken(response.token);
  }
  return response;
}

export async function login(email: string, password: string) {
  const response = await apiRequest<AuthResponse>('/auth/login', 'POST', { email, password });
  if (response.token) {
    setAuthToken(response.token);
  }
  return response;
}

export async function getCurrentUser() {
  return apiRequest<CurrentUserResponse>('/auth/me', 'GET');
}

export async function updateCurrentUser(profile: { name?: string; avatar?: string }) {
  return apiRequest<{ message: string; user: { id: string; email: string; name: string; avatar?: string } }>('/auth/me', 'PUT', profile);
}

export function logout(): void {
  clearAuthToken();
  localStorage.removeItem('userData');
}

// ========================================
// CLIENT API
// ========================================

export async function getClients() {
  return apiRequest('/clients', 'GET');
}

export async function createClient(clientData: unknown) {
  return apiRequest('/clients', 'POST', clientData);
}

export async function updateClient(id: string, clientData: unknown) {
  return apiRequest(`/clients/${id}`, 'PUT', clientData);
}

export async function deleteClient(id: string) {
  return apiRequest(`/clients/${id}`, 'DELETE');
}

export async function getDeletedClients() {
  return apiRequest('/clients/deleted', 'GET');
}

export async function restoreDeletedClient(id: string) {
  return apiRequest(`/clients/deleted/${id}/restore`, 'POST');
}

// ========================================
// APPOINTMENT API
// ========================================

export async function getAppointments() {
  return apiRequest('/appointments', 'GET');
}

export async function createAppointment(appointmentData: unknown) {
  return apiRequest('/appointments', 'POST', appointmentData);
}

export async function updateAppointment(id: string, appointmentData: unknown) {
  return apiRequest(`/appointments/${id}`, 'PUT', appointmentData);
}

export async function deleteAppointment(id: string) {
  return apiRequest(`/appointments/${id}`, 'DELETE');
}

// ========================================
// EARNING API
// ========================================

export async function getEarnings() {
  return apiRequest('/earnings', 'GET');
}

export async function saveEarnings(earningsData: unknown) {
  // Call the save-all endpoint which handles arrays
  return apiRequest('/earnings/save-all', 'POST', { earnings: earningsData });
}

// ========================================
// DASHBOARD API
// ========================================

export async function getDashboardData() {
  return apiRequest('/dashboard', 'GET');
}

// ========================================
// INSIGHTS API
// ========================================

export async function getInsights() {
  return apiRequest('/insights', 'GET');
}

// ========================================
// SETTINGS API
// ========================================

export async function getSettings() {
  return apiRequest('/settings', 'GET');
}

export async function updateSettings(settingsData: unknown) {
  return apiRequest('/settings', 'PUT', settingsData);
}

// ========================================
// SESSIONS API
// ========================================

export async function getSessions() {
  return apiRequest('/sessions', 'GET');
}

export async function createSession(sessionData: unknown) {
  return apiRequest('/sessions', 'POST', sessionData);
}

export async function updateSession(id: string, sessionData: unknown) {
  return apiRequest(`/sessions/${id}`, 'PUT', sessionData);
}

export async function deleteSession(id: string) {
  return apiRequest(`/sessions/${id}`, 'DELETE');
}

export async function getClientSessions(clientId: string) {
  return apiRequest(`/sessions/client/${clientId}`, 'GET');
}

// ========================================
// FOLLOWUPS API
// ========================================

export async function getFollowUps() {
  return apiRequest('/followups', 'GET');
}

export async function getPendingFollowUps() {
  return apiRequest('/followups/pending', 'GET');
}

export async function createFollowUp(followUpData: unknown) {
  return apiRequest('/followups', 'POST', followUpData);
}

export async function updateFollowUp(id: string, followUpData: unknown) {
  return apiRequest(`/followups/${id}`, 'PUT', followUpData);
}

export async function deleteFollowUp(id: string) {
  return apiRequest(`/followups/${id}`, 'DELETE');
}

export async function markFollowUpComplete(id: string, notes?: string) {
  return apiRequest(`/followups/${id}/complete`, 'PUT', { completionNotes: notes });
}

// ========================================
// UTILITY API
// ========================================

export async function generateClientId(): Promise<string> {
  try {
    const clients = await getClients();
    const allClients = Array.isArray(clients) ? clients : [];
    
    if (allClients.length === 0) {
      return 'CL-001';
    }
    
    const allIds = allClients
      .map((c: any) => {
        const match = (c.clientId || '').match(/CL-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((num: number) => num > 0);
    
    const maxNum = allIds.length > 0 ? Math.max(...allIds) : 0;
    return `CL-${String(maxNum + 1).padStart(3, '0')}`;
  } catch (err) {
    console.error('Failed to generate client ID:', err);
    return `CL-${String(Date.now() % 1000).padStart(3, '0')}`;
  }
}
