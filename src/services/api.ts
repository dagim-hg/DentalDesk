const API_BASE = 'http://localhost:5000/api';

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

  // Patients
  getPatients: async () => {
    const res = await fetch(`${API_BASE}/patients`);
    if (!res.ok) throw new Error('Failed to fetch patients');
    return res.json();
  },

  createPatient: async (data: any) => {
    const res = await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create patient');
    return res.json();
  },

  updatePatient: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE}/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update patient');
    return res.json();
  },

  // Appointments
  getAppointments: async () => {
    const res = await fetch(`${API_BASE}/appointments`);
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
  },

  bookAppointment: async (data: any) => {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to book appointment');
    return res.json();
  },

  updateAppointmentStatus: async (id: number, status: string) => {
    const res = await fetch(`${API_BASE}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update appointment status');
    return res.json();
  },

  // Clinical Visits & Odontogram
  getVisits: async () => {
    const res = await fetch(`${API_BASE}/visits`);
    if (!res.ok) throw new Error('Failed to fetch visits');
    return res.json();
  },

  saveVisit: async (data: any) => {
    const res = await fetch(`${API_BASE}/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save visit');
    return res.json();
  },

  // Billing
  getServices: async () => {
    const res = await fetch(`${API_BASE}/billing/services`);
    if (!res.ok) throw new Error('Failed to fetch services');
    return res.json();
  },

  getInvoices: async () => {
    const res = await fetch(`${API_BASE}/billing/invoices`);
    if (!res.ok) throw new Error('Failed to fetch invoices');
    return res.json();
  },

  createInvoice: async (data: any) => {
    const res = await fetch(`${API_BASE}/billing/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create invoice');
    return res.json();
  },

  getPayments: async () => {
    const res = await fetch(`${API_BASE}/billing/payments`);
    if (!res.ok) throw new Error('Failed to fetch payments');
    return res.json();
  },

  recordPayment: async (data: any) => {
    const res = await fetch(`${API_BASE}/billing/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to record payment');
    return res.json();
  },

  // Inventory
  getInventory: async () => {
    const res = await fetch(`${API_BASE}/inventory`);
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
  },

  updateInventoryStock: async (id: number, newStock: number) => {
    const res = await fetch(`${API_BASE}/inventory/${id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newStock }),
    });
    if (!res.ok) throw new Error('Failed to update inventory stock');
    return res.json();
  },

  // Audits
  getAuditLogs: async () => {
    const res = await fetch(`${API_BASE}/audit`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },
};
