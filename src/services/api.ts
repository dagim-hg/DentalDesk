const API_BASE = 'http://localhost:5000/api';

const TOKEN_KEY = 'dentaldesk_auth_token';

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const getHeaders = (extraHeaders: Record<string, string> = {}) => {
  const token = tokenStorage.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Health
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },

  // Auth
  login: async (username: string, password?: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    if (data.token) {
      tokenStorage.set(data.token);
    }
    return data;
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Session invalid');
    return res.json();
  },

  logout: async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(),
      });
    } finally {
      tokenStorage.clear();
    }
  },

  // Users & Staff Management (Owner/Admin)
  getUsers: async () => {
    const res = await fetch(`${API_BASE}/users`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch staff users');
    return res.json();
  },

  createUser: async (userData: any) => {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create user');
    }
    return res.json();
  },

  updateUser: async (id: number, userData: any) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
  },

  getPractitioners: async () => {
    const res = await fetch(`${API_BASE}/users/practitioners`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch practitioners');
    return res.json();
  },

  // Reports (Owner)
  getFinancialReports: async () => {
    const res = await fetch(`${API_BASE}/reports/financial`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      if (res.status === 403) throw new Error('FORBIDDEN');
      throw new Error('Failed to fetch financial reports');
    }
    return res.json();
  },

  getDailyReconciliation: async () => {
    const res = await fetch(`${API_BASE}/reports/daily-reconciliation`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch daily reconciliation');
    return res.json();
  },

  // Patients
  getPatients: async (query?: string) => {
    const url = query ? `${API_BASE}/patients?query=${encodeURIComponent(query)}` : `${API_BASE}/patients`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch patients');
    return res.json();
  },

  createPatient: async (data: any) => {
    const res = await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create patient');
    return res.json();
  },

  updatePatient: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE}/patients/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update patient');
    return res.json();
  },

  // Appointments
  getAppointments: async () => {
    const res = await fetch(`${API_BASE}/appointments`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
  },

  bookAppointment: async (data: any) => {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to book appointment');
    return res.json();
  },

  updateAppointmentStatus: async (id: number, status: string) => {
    const res = await fetch(`${API_BASE}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update appointment status');
    return res.json();
  },

  // Clinical Visits & Odontogram
  getVisits: async (patientId?: number) => {
    const url = patientId ? `${API_BASE}/visits?patientId=${patientId}` : `${API_BASE}/visits`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) {
      if (res.status === 403) throw new Error('FORBIDDEN');
      throw new Error('Failed to fetch visits');
    }
    return res.json();
  },

  saveVisit: async (data: any) => {
    const res = await fetch(`${API_BASE}/visits`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      if (res.status === 403) throw new Error('Access denied: Only dentists can record clinical visits');
      throw new Error('Failed to save visit');
    }
    return res.json();
  },

  getOdontogram: async (patientId: number) => {
    const res = await fetch(`${API_BASE}/visits/odontogram/${patientId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch odontogram');
    return res.json();
  },

  // Billing
  getServices: async () => {
    const res = await fetch(`${API_BASE}/billing/services`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch services');
    return res.json();
  },

  updateServiceFee: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE}/billing/services/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update service fee');
    return res.json();
  },

  getInvoices: async () => {
    const res = await fetch(`${API_BASE}/billing/invoices`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch invoices');
    return res.json();
  },

  createInvoice: async (data: any) => {
    const res = await fetch(`${API_BASE}/billing/invoices`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      if (res.status === 403) throw new Error('Access denied: Only receptionists and owners can generate invoices');
      throw new Error('Failed to create invoice');
    }
    return res.json();
  },

  getPayments: async () => {
    const res = await fetch(`${API_BASE}/billing/payments`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch payments');
    return res.json();
  },

  recordPayment: async (data: any) => {
    const res = await fetch(`${API_BASE}/billing/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      if (res.status === 403) throw new Error('Access denied: Only receptionists and owners can record payments');
      throw new Error('Failed to record payment');
    }
    return res.json();
  },

  // Inventory
  getInventory: async () => {
    const res = await fetch(`${API_BASE}/inventory`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
  },

  updateInventoryStock: async (id: number, newStock: number) => {
    const res = await fetch(`${API_BASE}/inventory/${id}/stock`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ newStock }),
    });
    if (!res.ok) throw new Error('Failed to update inventory stock');
    return res.json();
  },

  // Audits & Backup
  getAuditLogs: async () => {
    const res = await fetch(`${API_BASE}/audit`, { headers: getHeaders() });
    if (!res.ok) {
      if (res.status === 403) throw new Error('FORBIDDEN');
      throw new Error('Failed to fetch audit logs');
    }
    return res.json();
  },

  exportBackup: async () => {
    const res = await fetch(`${API_BASE}/audit/export-backup`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to export database backup');
    return res.json();
  },
};
