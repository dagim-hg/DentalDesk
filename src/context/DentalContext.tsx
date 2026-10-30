import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  User, Patient, Appointment, AppointmentStatus, ClinicalVisit, ToothRecord, 
  ServiceItem, Invoice, Payment, InventoryItem, AuditLog, UserRole,
  FinancialReportData
} from '../types/dental';
import { 
  INITIAL_USERS, INITIAL_PATIENTS, INITIAL_APPOINTMENTS, 
  INITIAL_VISITS, INITIAL_SERVICE_CATALOG, INITIAL_INVOICES, 
  INITIAL_PAYMENTS, INITIAL_INVENTORY, INITIAL_AUDIT_LOGS 
} from '../data/mockData';
import { api, tokenStorage } from '../services/api';

export type PermissionAction = 
  | 'MANAGE_STAFF'
  | 'VIEW_FINANCIALS'
  | 'EDIT_SERVICE_FEES'
  | 'CLINICAL_WRITE'
  | 'VIEW_CLINICAL_NOTES'
  | 'BILLING_MANAGE'
  | 'RECORD_PAYMENT'
  | 'SCHEDULE_MANAGE'
  | 'INVENTORY_MANAGE'
  | 'ADMIN_OPERATIONS';

interface DentalContextType {
  // Authentication & Session
  currentUser: User;
  setCurrentUser: (user: User) => void;
  isAuthenticated: boolean;
  login: (username: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUserDemo: (user: User) => Promise<void>;
  
  // Users & Staff
  users: User[];
  staffUsers: User[];
  refreshStaffUsers: () => Promise<void>;
  createStaffUser: (userData: any) => Promise<User>;
  updateStaffUser: (id: number, data: any) => Promise<User>;

  // Patients
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id' | 'patientCode' | 'version' | 'createdAt' | 'updatedAt'>) => Patient;
  updatePatient: (id: number, data: Partial<Patient>) => boolean;
  selectedPatient: Patient | null;
  setSelectedPatient: (patient: Patient | null) => void;

  // Appointments & Queue
  appointments: Appointment[];
  bookAppointment: (data: Omit<Appointment, 'id' | 'version' | 'createdAt'>) => { success: boolean; error?: string };
  updateAppointmentStatus: (id: number, status: AppointmentStatus) => void;

  // Clinical Visits & Odontogram
  visits: ClinicalVisit[];
  saveVisit: (visitData: Omit<ClinicalVisit, 'id' | 'createdAt'>) => ClinicalVisit;
  getPatientVisits: (patientId: number) => ClinicalVisit[];
  getPatientToothRecords: (patientId: number) => ToothRecord[];

  // Catalog, Billing & Cash Drawer
  serviceCatalog: ServiceItem[];
  updateServiceFee: (id: number, price: number) => Promise<void>;
  invoices: Invoice[];
  createInvoice: (data: Omit<Invoice, 'id' | 'invoiceNumber' | 'version' | 'createdAt'>) => Invoice;
  payments: Payment[];
  recordPayment: (paymentData: Omit<Payment, 'id' | 'receiptNumber'>) => Payment;

  // Executive Reports (Owner)
  financialReports: FinancialReportData | null;
  refreshFinancialReports: () => Promise<void>;
  
  // Inventory
  inventory: InventoryItem[];
  updateInventoryStock: (id: number, newStock: number) => void;

  // Audits & Backup/Restore
  auditLogs: AuditLog[];
  logAudit: (actionType: AuditLog['actionType'], entityName: string, entityId: string | number, details: string) => void;
  exportDatabaseBackup: () => void;
  restoreDatabaseBackup: (jsonContent: string) => boolean;
  resetToFactoryDefaults: () => void;

  // Server Connection Status
  isServerConnected: boolean;
  refreshFromBackend: () => Promise<void>;

  // Permissions helper
  hasPermission: (action: PermissionAction) => boolean;
}

const STORAGE_KEY = 'dentaldesk_db_v1';

const DentalContext = createContext<DentalContextType | undefined>(undefined);

export const DentalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user initialization
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUser = localStorage.getItem(`${STORAGE_KEY}_currentUser`);
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return INITIAL_USERS[3]; // Default: Dr. Marcus Vance (Owner)
      }
    }
    return INITIAL_USERS[3]; // Default: Dr. Marcus Vance (Owner)
  });

  const [staffUsers, setStaffUsers] = useState<User[]>(INITIAL_USERS);
  const [financialReports, setFinancialReports] = useState<FinancialReportData | null>(null);

  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_patients`);
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(() => {
    return INITIAL_PATIENTS[0];
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_appointments`);
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [visits, setVisits] = useState<ClinicalVisit[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_visits`);
    return saved ? JSON.parse(saved) : INITIAL_VISITS;
  });

  const [serviceCatalog, setServiceCatalog] = useState<ServiceItem[]>(INITIAL_SERVICE_CATALOG);

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_invoices`);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_payments`);
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_inventory`);
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [isServerConnected, setIsServerConnected] = useState<boolean>(false);

  // Synchronize current user to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(currentUser));
  }, [currentUser]);

  // Synchronize collections to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_patients`, JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_appointments`, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_visits`, JSON.stringify(visits));
  }, [visits]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_inventory`, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Check login and fetch initial state
  const refreshFromBackend = useCallback(async () => {
    try {
      const isUp = await api.checkHealth();
      setIsServerConnected(isUp);
      if (!isUp) return;

      // Always fetch public/clinical baseline: Patients, Appointments, Catalog, Inventory
      const [pts, appts, catalog, invItems] = await Promise.allSettled([
        api.getPatients(),
        api.getAppointments(),
        api.getServices(),
        api.getInventory()
      ]);

      if (pts.status === 'fulfilled' && pts.value?.length > 0) {
        setPatients(pts.value);
        setSelectedPatient(prev => prev || pts.value[0]);
      }
      if (appts.status === 'fulfilled' && appts.value) {
        setAppointments(appts.value);
      }
      if (catalog.status === 'fulfilled' && catalog.value?.length > 0) {
        setServiceCatalog(catalog.value);
      }
      if (invItems.status === 'fulfilled' && invItems.value) {
        setInventory(invItems.value);
      }

      // Role-specific data fetching
      const role = currentUser.role;

      // 1. Clinical Visits: Dentist & Owner
      if (role === 'ROLE_DENTIST' || role === 'ROLE_OWNER' || role === 'ROLE_ASSISTANT') {
        try {
          const vsts = await api.getVisits();
          if (vsts) setVisits(vsts);
        } catch (e) {
          console.warn('Visits fetch bypassed:', e);
        }
      }

      // 2. Billing & Invoices: Owner & Receptionist
      if (role === 'ROLE_OWNER' || role === 'ROLE_RECEPTIONIST') {
        try {
          const [invs, pmts] = await Promise.all([api.getInvoices(), api.getPayments()]);
          if (invs) setInvoices(invs);
          if (pmts) setPayments(pmts);
        } catch (e) {
          console.warn('Billing fetch bypassed:', e);
        }
      }

      // 3. Management & Audits: Owner only
      if (role === 'ROLE_OWNER' || role === 'ROLE_ADMIN') {
        try {
          const [logs, uList, finReports] = await Promise.all([
            api.getAuditLogs(),
            api.getUsers(),
            api.getFinancialReports()
          ]);
          if (logs) setAuditLogs(logs);
          if (uList) setStaffUsers(uList);
          if (finReports) setFinancialReports(finReports);
        } catch (e) {
          console.warn('Admin fetch bypassed:', e);
        }
      }
    } catch (e) {
      console.warn('Backend unavailable, operating on local cache:', e);
      setIsServerConnected(false);
    }
  }, [currentUser.role]);

  useEffect(() => {
    refreshFromBackend();
    const interval = setInterval(refreshFromBackend, 5000);
    return () => clearInterval(interval);
  }, [refreshFromBackend]);

  // Auth: Login
  const login = async (username: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.login(username, password);
      setCurrentUser(res.user);
      await refreshFromBackend();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  // Auth: Logout
  const logout = () => {
    api.logout();
    tokenStorage.clear();
    // Clear stored user so ProtectedRoute sees unauthenticated state
    localStorage.removeItem('dentaldesk_db_v1_currentUser');
    setCurrentUser(INITIAL_USERS[3]);
  };

  // 1-Click Role Switcher Demo
  const switchUserDemo = async (targetUser: User) => {
    const passwords: Record<string, string> = {
      'marcus.v': 'Owner@123',
      'dr.chen': 'Dentist@123',
      'elena.r': 'Reception@123',
      'chloe.k': 'Assistant@123'
    };
    try {
      const pass = passwords[targetUser.username] || 'DentalDesk@2026';
      await login(targetUser.username, pass);
    } catch {
      setCurrentUser(targetUser);
    }
  };

  // Staff Management (Owner)
  const refreshStaffUsers = async () => {
    try {
      const usersList = await api.getUsers();
      setStaffUsers(usersList);
    } catch (e) {
      console.error('Failed to fetch staff:', e);
    }
  };

  const createStaffUser = async (userData: any): Promise<User> => {
    const newUser = await api.createUser(userData);
    setStaffUsers(prev => [...prev, newUser]);
    logAudit('CREATE', 'User', newUser.id, `Created staff member ${newUser.fullName} (${newUser.role})`);
    return newUser;
  };

  const updateStaffUser = async (id: number, data: any): Promise<User> => {
    const updated = await api.updateUser(id, data);
    setStaffUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
    logAudit('UPDATE', 'User', id, `Updated staff role/info for ${updated.fullName}`);
    return updated;
  };

  // Financial Reports (Owner)
  const refreshFinancialReports = async () => {
    try {
      const data = await api.getFinancialReports();
      setFinancialReports(data);
    } catch (e) {
      console.error('Failed to fetch financial reports:', e);
    }
  };

  // Service Fee Update (Owner)
  const updateServiceFee = async (id: number, price: number) => {
    setServiceCatalog(prev => prev.map(s => s.id === id ? { ...s, defaultPrice: price } : s));
    if (isServerConnected) {
      try {
        await api.updateServiceFee(id, { defaultPrice: price });
      } catch (e) {
        console.error('Failed to sync service fee update:', e);
      }
    }
    logAudit('UPDATE', 'ServiceItem', id, `Updated service fee to $${price}`);
  };

  // Audit logging helper
  const logAudit = (
    actionType: AuditLog['actionType'],
    entityName: string,
    entityId: string | number,
    details: string
  ) => {
    const newLog: AuditLog = {
      id: Date.now(),
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      actionType,
      entityName,
      entityId,
      timestamp: new Date().toISOString(),
      details,
      ipAddress: '192.168.1.100 (LAN)'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // RBAC Permission Evaluator
  const hasPermission = (action: PermissionAction): boolean => {
    const role: UserRole = currentUser.role;
    switch (action) {
      case 'MANAGE_STAFF':
      case 'VIEW_FINANCIALS':
      case 'EDIT_SERVICE_FEES':
      case 'ADMIN_OPERATIONS':
        return role === 'ROLE_OWNER' || role === 'ROLE_ADMIN';
      case 'CLINICAL_WRITE':
        return role === 'ROLE_DENTIST' || role === 'ROLE_OWNER';
      case 'VIEW_CLINICAL_NOTES':
        return role === 'ROLE_DENTIST' || role === 'ROLE_OWNER' || role === 'ROLE_ASSISTANT';
      case 'BILLING_MANAGE':
      case 'RECORD_PAYMENT':
        return role === 'ROLE_RECEPTIONIST' || role === 'ROLE_OWNER';
      case 'SCHEDULE_MANAGE':
        return role === 'ROLE_RECEPTIONIST' || role === 'ROLE_DENTIST' || role === 'ROLE_OWNER';
      case 'INVENTORY_MANAGE':
        return role === 'ROLE_ASSISTANT' || role === 'ROLE_DENTIST' || role === 'ROLE_OWNER';
      default:
        return false;
    }
  };

  // Patient Management
  const addPatient = (patientData: Omit<Patient, 'id' | 'patientCode' | 'version' | 'createdAt' | 'updatedAt'>) => {
    const nextId = patients.length > 0 ? Math.max(...patients.map(p => p.id)) + 1 : 1;
    const patientCode = `PAT-2026-${String(nextId).padStart(3, '0')}`;
    const now = new Date().toISOString();
    
    const newPatient: Patient = {
      ...patientData,
      id: nextId,
      patientCode,
      version: 1,
      createdAt: now,
      updatedAt: now
    };

    setPatients(prev => [newPatient, ...prev]);
    setSelectedPatient(newPatient);
    logAudit('CREATE', 'Patient', patientCode, `Registered patient ${newPatient.firstName} ${newPatient.lastName}`);

    if (isServerConnected) {
      api.createPatient(newPatient).catch(err => console.error('Failed to sync patient creation:', err));
    }

    return newPatient;
  };

  const updatePatient = (id: number, data: Partial<Patient>): boolean => {
    let success = false;
    setPatients(prev => prev.map(p => {
      if (p.id === id) {
        success = true;
        const updated = {
          ...p,
          ...data,
          version: p.version + 1,
          updatedAt: new Date().toISOString()
        };
        if (selectedPatient?.id === id) {
          setSelectedPatient(updated);
        }
        return updated;
      }
      return p;
    }));

    if (success) {
      logAudit('UPDATE', 'Patient', id, `Updated demographics/medical alerts for patient ID ${id}`);
      if (isServerConnected) {
        api.updatePatient(id, data).catch(err => console.error('Failed to sync patient update:', err));
      }
    }
    return success;
  };

  // Appointments & Queue
  const bookAppointment = (data: Omit<Appointment, 'id' | 'version' | 'createdAt'>) => {
    const nextId = appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1;
    const newAppointment: Appointment = {
      ...data,
      id: nextId,
      version: 1,
      createdAt: new Date().toISOString()
    };

    setAppointments(prev => [newAppointment, ...prev]);
    logAudit('CREATE', 'Appointment', nextId, `Scheduled appointment for patient #${data.patientId} at ${data.scheduledStart}`);

    if (isServerConnected) {
      api.bookAppointment(newAppointment).catch(err => console.error('Failed to sync appointment booking:', err));
    }

    return { success: true };
  };

  const updateAppointmentStatus = (id: number, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, status, version: a.version + 1 };
      }
      return a;
    }));

    logAudit('UPDATE', 'Appointment', id, `Updated status to ${status}`);

    if (isServerConnected) {
      api.updateAppointmentStatus(id, status).catch(err => console.error('Failed to sync appointment status:', err));
    }
  };

  // Clinical Visits
  const saveVisit = (visitData: Omit<ClinicalVisit, 'id' | 'createdAt'>): ClinicalVisit => {
    const nextId = visits.length > 0 ? Math.max(...visits.map(v => v.id)) + 1 : 1;
    const newVisit: ClinicalVisit = {
      ...visitData,
      id: nextId,
      createdAt: new Date().toISOString()
    };

    setVisits(prev => [newVisit, ...prev]);
    logAudit('CREATE', 'ClinicalVisit', nextId, `Saved SOAP encounter notes for patient #${visitData.patientId}`);

    if (isServerConnected) {
      api.saveVisit(newVisit).catch(err => console.error('Failed to sync visit to server:', err));
    }

    return newVisit;
  };

  const getPatientVisits = (patientId: number): ClinicalVisit[] => {
    return visits.filter(v => v.patientId === patientId);
  };

  const getPatientToothRecords = (patientId: number): ToothRecord[] => {
    const patientVisits = visits.filter(v => v.patientId === patientId);
    const map: Record<number, ToothRecord> = {};
    patientVisits.forEach(v => {
      v.toothRecords?.forEach(tr => {
        map[tr.toothNumber] = tr;
      });
    });
    return Object.values(map);
  };

  // Billing & Invoices
  const createInvoice = (data: Omit<Invoice, 'id' | 'invoiceNumber' | 'version' | 'createdAt'>): Invoice => {
    const nextId = invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1;
    const invoiceNumber = `INV-2026-${String(nextId).padStart(4, '0')}`;
    
    const newInvoice: Invoice = {
      ...data,
      id: nextId,
      invoiceNumber,
      version: 1,
      createdAt: new Date().toISOString()
    };

    setInvoices(prev => [newInvoice, ...prev]);
    logAudit('CREATE', 'Invoice', invoiceNumber, `Created invoice #${invoiceNumber} total $${data.totalAmount}`);

    if (isServerConnected) {
      api.createInvoice(newInvoice).catch(err => console.error('Failed to sync invoice to server:', err));
    }

    return newInvoice;
  };

  const recordPayment = (paymentData: Omit<Payment, 'id' | 'receiptNumber'>): Payment => {
    const nextId = payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1;
    const receiptNumber = `RCPT-2026-${String(nextId).padStart(4, '0')}`;

    const newPayment: Payment = {
      ...paymentData,
      id: nextId,
      receiptNumber
    };

    setPayments(prev => [newPayment, ...prev]);

    setInvoices(prev => prev.map(inv => {
      if (inv.id === paymentData.invoiceId) {
        const newPaid = inv.paidAmount + paymentData.amount;
        const newStatus = newPaid >= inv.totalAmount ? 'PAID' : 'PARTIALLY_PAID';
        return {
          ...inv,
          paidAmount: newPaid,
          status: newStatus,
          version: inv.version + 1
        };
      }
      return inv;
    }));

    logAudit('PAYMENT', 'Payment', receiptNumber, `Received payment $${newPayment.amount} via ${newPayment.paymentMethod}`);

    if (isServerConnected) {
      api.recordPayment(paymentData).catch(err => console.error('Failed to sync payment to server:', err));
    }

    return newPayment;
  };

  // Inventory Management
  const updateInventoryStock = (id: number, newStock: number) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, currentStock: newStock } : item));
    logAudit('UPDATE', 'InventoryItem', id, `Updated stock level to ${newStock}`);

    if (isServerConnected) {
      api.updateInventoryStock(id, newStock).catch(err => console.error('Failed to sync inventory to server:', err));
    }
  };

  // Disaster Recovery: Export & Restore Local LAN Snapshots
  const exportDatabaseBackup = () => {
    const dump = {
      exportVersion: '1.0.0',
      systemName: 'DentalDesk LAN Appliance',
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser.fullName,
      data: {
        patients,
        appointments,
        visits,
        invoices,
        payments,
        inventory,
        auditLogs
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dump, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `DentalDesk_LAN_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    logAudit('BACKUP_EXPORT', 'Database', 'FULL_SNAPSHOT', `Exported verified backup snapshot archive`);
  };

  const restoreDatabaseBackup = (jsonContent: string): boolean => {
    try {
      const parsed = JSON.parse(jsonContent);
      if (!parsed.data || !parsed.data.patients) {
        throw new Error('Invalid backup schema');
      }

      setPatients(parsed.data.patients || []);
      setAppointments(parsed.data.appointments || []);
      setVisits(parsed.data.visits || []);
      setInvoices(parsed.data.invoices || []);
      setPayments(parsed.data.payments || []);
      setInventory(parsed.data.inventory || []);
      setAuditLogs(parsed.data.auditLogs || []);

      logAudit('RESTORE', 'Database', 'RESTORE_OPERATION', `Restored database from snapshot dated ${parsed.exportedAt}`);
      return true;
    } catch {
      return false;
    }
  };

  const resetToFactoryDefaults = () => {
    setPatients(INITIAL_PATIENTS);
    setAppointments(INITIAL_APPOINTMENTS);
    setVisits(INITIAL_VISITS);
    setInvoices(INITIAL_INVOICES);
    setPayments(INITIAL_PAYMENTS);
    setInventory(INITIAL_INVENTORY);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSelectedPatient(INITIAL_PATIENTS[0]);
    localStorage.clear();
  };

  return (
    <DentalContext.Provider value={{
      currentUser,
      setCurrentUser,
      isAuthenticated: !!tokenStorage.get(),
      login,
      logout,
      switchUserDemo,
      users: INITIAL_USERS,
      staffUsers,
      refreshStaffUsers,
      createStaffUser,
      updateStaffUser,
      patients,
      addPatient,
      updatePatient,
      selectedPatient,
      setSelectedPatient,
      appointments,
      bookAppointment,
      updateAppointmentStatus,
      visits,
      saveVisit,
      getPatientVisits,
      getPatientToothRecords,
      serviceCatalog,
      updateServiceFee,
      invoices,
      createInvoice,
      payments,
      recordPayment,
      financialReports,
      refreshFinancialReports,
      inventory,
      updateInventoryStock,
      auditLogs,
      logAudit,
      exportDatabaseBackup,
      restoreDatabaseBackup,
      resetToFactoryDefaults,
      isServerConnected,
      refreshFromBackend,
      hasPermission
    }}>
      {children}
    </DentalContext.Provider>
  );
};

export const useDental = () => {
  const context = useContext(DentalContext);
  if (!context) {
    throw new Error('useDental must be used within a DentalProvider');
  }
  return context;
};
