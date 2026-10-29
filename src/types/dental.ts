export type UserRole = 
  | 'ROLE_OWNER' 
  | 'ROLE_DENTIST' 
  | 'ROLE_ASSISTANT' 
  | 'ROLE_RECEPTIONIST' 
  | 'ROLE_ADMIN';

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: UserRole;
  title: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface Patient {
  id: number;
  patientCode: string; // e.g. "PAT-2026-0042"
  firstName: string;
  lastName: string;
  dob: string; // YYYY-MM-DD
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  email: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  nationalId?: string;
  insuranceCarrier?: string;
  insurancePolicyNumber?: string;
  medicalAlerts: string[]; // e.g. ["Penicillin Allergy", "Hypertension", "Latex Sensitivity"]
  isUrgent: boolean;
  notes?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus = 
  | 'SCHEDULED' 
  | 'CONFIRMED' 
  | 'ARRIVED' 
  | 'IN_OPERATORY' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'NO_SHOW';

export interface Appointment {
  id: number;
  patientId: number;
  dentistId: number;
  scheduledStart: string; // ISO string e.g. 2026-10-23T09:30:00
  durationMinutes: number;
  status: AppointmentStatus;
  isWalkin: boolean;
  isUrgent: boolean;
  chiefComplaint: string;
  operatoryChair: string; // "Chair 1 (Operatory A)", "Chair 2 (Surgical Suite)"
  cancellationReason?: string;
  version: number;
  createdAt: string;
}

export type ToothSurface = 'M' | 'O' | 'D' | 'B' | 'L'; // Mesial, Occlusal, Distal, Buccal, Lingual

export type ToothCondition = 
  | 'HEALTHY' 
  | 'CARIES' 
  | 'FILLED' 
  | 'CROWN' 
  | 'MISSING' 
  | 'ROOT_CANAL' 
  | 'EXTRACTION_NEEDED' 
  | 'IMPLANT'
  | 'BRIDGE';

export interface ToothRecord {
  toothNumber: number; // FDI notation: Adult 11-48, Pediatric 51-85
  condition: ToothCondition;
  surfaces: ToothSurface[];
  notes?: string;
  diagnosedDate?: string;
  procedureCode?: string;
}

export interface ClinicalVisit {
  id: number;
  appointmentId?: number;
  patientId: number;
  dentistId: number;
  visitDatetime: string;
  chiefComplaint: string;
  clinicalNotes: string; // SOAP formatting
  diagnosis: string;
  treatmentPlan: string;
  prescriptions: string;
  toothRecords: ToothRecord[];
  vitalSigns?: {
    bloodPressure?: string;
    pulseRate?: number;
  };
  createdBy: number;
  createdAt: string;
}

export interface ServiceItem {
  id: number;
  serviceCode: string;
  name: string;
  category: 'Diagnostic' | 'Preventive' | 'Restorative' | 'Endodontic' | 'Periodontic' | 'Oral Surgery' | 'Prosthodontic';
  defaultPrice: number;
  defaultDurationMinutes: number;
  isActive: boolean;
}

export interface InvoiceItem {
  id: number;
  serviceCode: string;
  description: string;
  toothNumber?: number;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  lineTotal: number;
}

export type InvoiceStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED' | 'VOID';

export interface Invoice {
  id: number;
  invoiceNumber: string; // e.g. "INV-2026-108"
  patientId: number;
  visitId?: number;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  discountAmount: number;
  taxRate: number; // e.g. 0.05 for 5%
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  items: InvoiceItem[];
  notes?: string;
  version: number;
  createdAt: string;
}

export type PaymentMethod = 
  | 'CASH' 
  | 'CREDIT_CARD' 
  | 'DEBIT_CARD' 
  | 'BANK_TRANSFER' 
  | 'CHEQUE' 
  | 'INSURANCE_COPAY';

export interface Payment {
  id: number;
  receiptNumber: string; // e.g. "RCPT-2026-089"
  invoiceId: number;
  patientId: number;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  notes?: string;
  receivedBy: string;
}

export interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  category: 'Anesthetics' | 'Disposables' | 'Restorative' | 'PPE & Sterilization' | 'Endodontics' | 'Surgical';
  unitOfMeasure: string;
  currentStock: number;
  reorderThreshold: number;
  unitCost: number;
  expirationDate?: string;
  supplierName: string;
}

export interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  userRole: UserRole;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'PAYMENT' | 'BACKUP_EXPORT' | 'RESTORE';
  entityName: string;
  entityId: string | number;
  timestamp: string;
  details: string;
  ipAddress: string;
}


export interface ProductionKpis {
  totalAppointments: number;
  totalAppointmentsTrend: string;
  treatmentsDone: number;
  treatmentsDoneTrend: string;
  averageChairTime: number;
  averageChairTimeTrend: string;
  reappointmentRate: number;
  reappointmentRateTrend: string;
}

export interface ClinicalKpis {
  onTimeRate: number;
  retreatmentRate: number;
  complicationRate: number;
  complicationAlert: string;
  successRate: number;
}

export interface MonthlyFinancial {
  month: string;
  revenue: number;
  expenses: number;
}

export interface FinancialSnapshot {
  totalInvoiced: number;
  totalCollected: number;
  expenses: number;
  profitMargin: number;
  monthlyBreakdown: MonthlyFinancial[];
}

export interface PatientsOverview {
  newPatients: number;
  returningPatients: number;
  satisfactionScore: number;
  ratioNew: number;
  ratioReturning: number;
  ratioOther: number;
}

export interface FinancialReportData {
  productionKpis: ProductionKpis;
  financialSnapshot: FinancialSnapshot;
  clinicalKpis: ClinicalKpis;
  patientsOverview: PatientsOverview;
}
