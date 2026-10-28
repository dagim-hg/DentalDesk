import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, Patient, Appointment, AppointmentStatus, ClinicalVisit, ToothRecord, 
  ServiceItem, Invoice, Payment, InventoryItem, AuditLog, UserRole 
} from '../types/dental';
import { 
  INITIAL_USERS, INITIAL_PATIENTS, INITIAL_APPOINTMENTS, 
  INITIAL_VISITS, INITIAL_SERVICE_CATALOG, INITIAL_INVOICES, 
  INITIAL_PAYMENTS, INITIAL_INVENTORY, INITIAL_AUDIT_LOGS 
} from '../data/mockData';
import { api } from '../services/api';

interface DentalContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  
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
  invoices: Invoice[];
  createInvoice: (data: Omit<Invoice, 'id' | 'invoiceNumber' | 'version' | 'createdAt'>) => Invoice;
  payments: Payment[];
  recordPayment: (paymentData: Omit<Payment, 'id' | 'receiptNumber'>) => Payment;
  
  // Inventory
  inventory: InventoryItem[];
  updateInventoryStock: (id: number, newStock: number) => void;

  // Audits & Backup/Restore (FR-OPS & FR-AUDIT)
  auditLogs: AuditLog[];
  logAudit: (actionType: AuditLog['actionType'], entityName: string, entityId: string | number, details: string) => void;
  exportDatabaseBackup: () => void;
  restoreDatabaseBackup: (jsonContent: string) => boolean;
  resetToFactoryDefaults: () => void;

  // Server Connection Status
  isServerConnected: boolean;
  refreshFromBackend: () => Promise<void>;

  // Permissions helper
  hasPermission: (action: 'CLINICAL_WRITE' | 'BILLING_MANAGE' | 'INVENTORY_MANAGE' | 'ADMIN_OPERATIONS') => boolean;
}

const STORAGE_KEY = 'dentaldesk_db_v1';

const DentalContext = createContext<DentalContextType | undefined>(undefined);

export const DentalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or initial seeds
  const [currentUser, setCurrentUser] = useState<User>(() => {
    return INITIAL_USERS[0]; // Default: Dr. Sarah Chen
  });

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

  const [serviceCatalog] = useState<ServiceItem[]>(INITIAL_SERVICE_CATALOG);

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

  // Initial and periodic sync with PostgreSQL backend
  const refreshFromBackend = async () => {
    try {
      const isUp = await api.checkHealth();
      setIsServerConnected(isUp);
      if (isUp) {
        const [pts, appts, vsts, invs, pmts, invItems, logs] = await Promise.all([
          api.getPatients(),
          api.getAppointments(),
          api.getVisits(),
          api.getInvoices(),
          api.getPayments(),
          api.getInventory(),
          api.getAuditLogs()
        ]);
        if (pts && pts.length > 0) {
          setPatients(pts);
          setSelectedPatient(prev => prev || pts[0]);
        }
        if (appts) setAppointments(appts);
        if (vsts) setVisits(vsts);
        if (invs) setInvoices(invs);
        if (pmts) setPayments(pmts);
        if (invItems) setInventory(invItems);
        if (logs) setAuditLogs(logs);
      }
    } catch (e) {
      console.warn('Backend unavailable, operating on local cache:', e);
      setIsServerConnected(false);
    }
  };

  useEffect(() => {
    refreshFromBackend();
    // Periodically poll backend every 5 seconds for multi-device sync
    const interval = setInterval(refreshFromBackend, 5000);
    return () => clearInterval(interval);
  }, []);

  // Sync to local storage
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
      ipAddress: '192.168.1.100 (LAN Local)'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // RBAC Permission Evaluator
  const hasPermission = (action: 'CLINICAL_WRITE' | 'BILLING_MANAGE' | 'INVENTORY_MANAGE' | 'ADMIN_OPERATIONS'): boolean => {
    const role: UserRole = currentUser.role;
    switch (action) {
      case 'CLINICAL_WRITE':
        return role === 'ROLE_DENTIST' || role === 'ROLE_OWNER';
      case 'BILLING_MANAGE':
        return role === 'ROLE_RECEPTIONIST' || role === 'ROLE_OWNER' || role === 'ROLE_ADMIN';
      case 'INVENTORY_MANAGE':
        return role === 'ROLE_ASSISTANT' || role === 'ROLE_OWNER' || role === 'ROLE_ADMIN';
      case 'ADMIN_OPERATIONS':
        return role === 'ROLE_OWNER' || role === 'ROLE_ADMIN';
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
    logAudit('CREATE', 'Patient', patientCode, `Created record for ${newPatient.firstName} ${newPatient.lastName}`);

    if (isServerConnected) {
      api.createPatient(patientData).then(serverPatient => {
        setPatients(prev => prev.map(p => p.id === nextId ? serverPatient : p));
        setSelectedPatient(serverPatient);
      }).catch(err => console.error('Failed to sync patient to server:', err));
    }

    return newPatient;
  };

  const updatePatient = (id: number, data: Partial<Patient>) => {
    setPatients(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          ...data,
          version: p.version + 1,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    }));
    logAudit('UPDATE', 'Patient', id, `Updated patient profile ID ${id}`);

    if (isServerConnected) {
      api.updatePatient(id, data).catch(err => console.error('Failed to sync patient update:', err));
    }
    return true;
  };

  // Appointment & Schedule Management
  const bookAppointment = (data: Omit<Appointment, 'id' | 'version' | 'createdAt'>) => {
    // Check for scheduling collision on same operatory chair or dentist at same time
    const newStart = new Date(data.scheduledStart).getTime();
    const newEnd = newStart + data.durationMinutes * 60 * 1000;

    const conflict = appointments.find(app => {
      if (app.status === 'CANCELLED' || app.status === 'COMPLETED') return false;
      if (app.dentistId !== data.dentistId && app.operatoryChair !== data.operatoryChair) return false;
      
      const appStart = new Date(app.scheduledStart).getTime();
      const appEnd = appStart + app.durationMinutes * 60 * 1000;

      return (newStart < appEnd && newEnd > appStart);
    });

    if (conflict) {
      return { 
        success: false, 
        error: `Scheduling Collision: ${conflict.operatoryChair} is already reserved at this time.` 
      };
    }

    const nextId = appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1;
    const newApp: Appointment = {
      ...data,
      id: nextId,
      version: 1,
      createdAt: new Date().toISOString()
    };

    setAppointments(prev => [...prev, newApp]);
    logAudit('CREATE', 'Appointment', nextId, `Booked ${newApp.operatoryChair} for patient #${data.patientId}`);

    if (isServerConnected) {
      api.bookAppointment(data).then(serverApp => {
        setAppointments(prev => prev.map(a => a.id === nextId ? serverApp : a));
      }).catch(err => console.error('Failed to sync appointment to server:', err));
    }

    return { success: true };
  };

  const updateAppointmentStatus = (id: number, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status, version: a.version + 1 } : a));
    logAudit('UPDATE', 'Appointment', id, `Changed appointment status to ${status}`);

    if (isServerConnected) {
      api.updateAppointmentStatus(id, status).catch(err => console.error('Failed to sync status:', err));
    }
  };

  // Clinical Visits & Odontogram
  const saveVisit = (visitData: Omit<ClinicalVisit, 'id' | 'createdAt'>) => {
    const nextId = visits.length > 0 ? Math.max(...visits.map(v => v.id)) + 1 : 1;
    const newVisit: ClinicalVisit = {
      ...visitData,
      id: nextId,
      createdAt: new Date().toISOString()
    };

    setVisits(prev => [newVisit, ...prev]);
    logAudit('CREATE', 'ClinicalVisit', nextId, `Logged clinical examination & odontogram for patient #${visitData.patientId}`);

    if (isServerConnected) {
      api.saveVisit(visitData).then(serverVisit => {
        setVisits(prev => prev.map(v => v.id === nextId ? serverVisit : v));
      }).catch(err => console.error('Failed to sync visit to server:', err));
    }

    return newVisit;
  };

  const getPatientVisits = (patientId: number) => {
    return visits.filter(v => v.patientId === patientId);
  };

  const getPatientToothRecords = (patientId: number): ToothRecord[] => {
    const patientVisits = getPatientVisits(patientId);
    if (patientVisits.length === 0) return [];
    // Aggregate tooth records with latest diagnosis
    const recordsMap = new Map<number, ToothRecord>();
    patientVisits.forEach(v => {
      v.toothRecords.forEach(tr => {
        recordsMap.set(tr.toothNumber, tr);
      });
    });
    return Array.from(recordsMap.values());
  };

  // Invoicing & Payments
  const createInvoice = (data: Omit<Invoice, 'id' | 'invoiceNumber' | 'version' | 'createdAt'>) => {
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
    logAudit('CREATE', 'Invoice', invoiceNumber, `Generated invoice for total $${newInvoice.totalAmount}`);

    if (isServerConnected) {
      api.createInvoice(data).then(serverInv => {
        setInvoices(prev => prev.map(i => i.id === nextId ? serverInv : i));
      }).catch(err => console.error('Failed to sync invoice to server:', err));
    }

    return newInvoice;
  };

  const recordPayment = (paymentData: Omit<Payment, 'id' | 'receiptNumber'>) => {
    const nextId = payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1;
    const receiptNumber = `RCPT-2026-${String(nextId).padStart(4, '0')}`;

    const newPayment: Payment = {
      ...paymentData,
      id: nextId,
      receiptNumber
    };

    setPayments(prev => [newPayment, ...prev]);

    // Update corresponding invoice paid amount and status
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
      users: INITIAL_USERS,
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
      invoices,
      createInvoice,
      payments,
      recordPayment,
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
