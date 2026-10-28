import { User, Patient, Appointment, ClinicalVisit, ServiceItem, Invoice, Payment, InventoryItem, AuditLog } from '../types/dental';

export const INITIAL_USERS: User[] = [
  {
    id: 1,
    username: 'dr.chen',
    fullName: 'Dr. Sarah Chen, DDS',
    role: 'ROLE_DENTIST',
    title: 'Lead Dental Surgeon',
    email: 'sarah.chen@dentaldesk.local',
    phone: '+1 (555) 234-5678',
    avatar: 'SC'
  },
  {
    id: 2,
    username: 'elena.r',
    fullName: 'Elena Rostova',
    role: 'ROLE_RECEPTIONIST',
    title: 'Front Desk Coordinator',
    email: 'elena.r@dentaldesk.local',
    phone: '+1 (555) 234-5679',
    avatar: 'ER'
  },
  {
    id: 3,
    username: 'chloe.k',
    fullName: 'Chloe Kim, CDA',
    role: 'ROLE_ASSISTANT',
    title: 'Certified Dental Assistant',
    email: 'chloe.k@dentaldesk.local',
    phone: '+1 (555) 234-5680',
    avatar: 'CK'
  },
  {
    id: 4,
    username: 'marcus.v',
    fullName: 'Dr. Marcus Vance',
    role: 'ROLE_OWNER',
    title: 'Clinic Managing Partner',
    email: 'marcus.vance@dentaldesk.local',
    phone: '+1 (555) 234-5670',
    avatar: 'MV'
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 1,
    patientCode: 'PAT-2026-001',
    firstName: 'Jonathan',
    lastName: 'Miller',
    dob: '1988-04-12',
    gender: 'MALE',
    phone: '+1 (555) 412-8890',
    email: 'jmiller@example.com',
    address: '452 Pine Hill Rd, Suite 4B',
    emergencyContactName: 'Laura Miller (Spouse)',
    emergencyContactPhone: '+1 (555) 412-8891',
    nationalId: 'ID-9938210',
    insuranceCarrier: 'Delta Dental Premier',
    insurancePolicyNumber: 'POL-882910-A',
    medicalAlerts: ['Penicillin Allergy (Severe Anaphylaxis)', 'Hypertension (Controlled)'],
    isUrgent: true,
    notes: 'Severe sharp pain on lower left quadrant triggered by cold & percussion.',
    version: 1,
    createdAt: '2026-10-15T09:00:00Z',
    updatedAt: '2026-10-23T08:30:00Z'
  },
  {
    id: 2,
    patientCode: 'PAT-2026-002',
    firstName: 'Emily',
    lastName: 'Watson',
    dob: '1995-11-23',
    gender: 'FEMALE',
    phone: '+1 (555) 304-9182',
    email: 'emily.w@example.com',
    address: '108 Oakwood Ave',
    emergencyContactName: 'James Watson (Father)',
    emergencyContactPhone: '+1 (555) 304-9180',
    nationalId: 'ID-7729103',
    insuranceCarrier: 'MetLife Dental PPO',
    insurancePolicyNumber: 'MET-449102-X',
    medicalAlerts: [],
    isUrgent: false,
    notes: 'Routine 6-month preventive checkup and prophylaxis.',
    version: 1,
    createdAt: '2026-10-18T14:15:00Z',
    updatedAt: '2026-10-22T10:00:00Z'
  },
  {
    id: 3,
    patientCode: 'PAT-2026-003',
    firstName: 'Robert',
    lastName: 'Torres',
    dob: '1972-06-30',
    gender: 'MALE',
    phone: '+1 (555) 881-2094',
    email: 'rtorres@example.com',
    address: '77 Magnolia St, Apt 2',
    emergencyContactName: 'Maria Torres (Wife)',
    emergencyContactPhone: '+1 (555) 881-2095',
    nationalId: 'ID-1290384',
    insuranceCarrier: 'Cigna Dental Health',
    insurancePolicyNumber: 'CIG-901823',
    medicalAlerts: ['Type II Diabetes', 'Latex Sensitivity (Use Nitrile Only)'],
    isUrgent: false,
    notes: 'Scheduled for permanent crown seating on tooth 16.',
    version: 1,
    createdAt: '2026-09-10T11:20:00Z',
    updatedAt: '2026-10-21T16:00:00Z'
  },
  {
    id: 4,
    patientCode: 'PAT-2026-004',
    firstName: 'David',
    lastName: 'Kim',
    dob: '2001-08-15',
    gender: 'MALE',
    phone: '+1 (555) 902-3341',
    email: 'david.kim@example.com',
    address: '12 University Blvd',
    emergencyContactName: 'Hannah Kim (Mother)',
    emergencyContactPhone: '+1 (555) 902-3349',
    insuranceCarrier: 'Guardian Dental',
    insurancePolicyNumber: 'GRD-551203',
    medicalAlerts: ['Asthma (Patient carries Inhaler)'],
    isUrgent: true,
    notes: 'Walk-in emergency: Chipped incisal edge on tooth 21 after bicycle impact.',
    version: 1,
    createdAt: '2026-10-23T10:15:00Z',
    updatedAt: '2026-10-23T10:15:00Z'
  },
  {
    id: 5,
    patientCode: 'PAT-2026-005',
    firstName: 'Sofia',
    lastName: 'Alvarez',
    dob: '2018-05-19',
    gender: 'FEMALE',
    phone: '+1 (555) 774-1288',
    email: 'm.alvarez@example.com',
    address: '890 Maple Crest Way',
    emergencyContactName: 'Manuel Alvarez (Father)',
    emergencyContactPhone: '+1 (555) 774-1288',
    insuranceCarrier: 'Aetna Dental Direct',
    insurancePolicyNumber: 'AET-771239-P',
    medicalAlerts: [],
    isUrgent: false,
    notes: 'Pediatric examination: primary dentition caries assessment and fluoride varnish.',
    version: 1,
    createdAt: '2026-10-20T16:00:00Z',
    updatedAt: '2026-10-22T09:40:00Z'
  }
];

export const INITIAL_SERVICE_CATALOG: ServiceItem[] = [
  { id: 1, serviceCode: 'D0120', name: 'Periodic Oral Evaluation', category: 'Diagnostic', defaultPrice: 65, defaultDurationMinutes: 20, isActive: true },
  { id: 2, serviceCode: 'D0140', name: 'Limited Problem-Focused Exam', category: 'Diagnostic', defaultPrice: 85, defaultDurationMinutes: 30, isActive: true },
  { id: 3, serviceCode: 'D0210', name: 'Complete Intraoral Radiograph Series (Full Mouth)', category: 'Diagnostic', defaultPrice: 145, defaultDurationMinutes: 25, isActive: true },
  { id: 4, serviceCode: 'D0220', name: 'Single Periapical Radiograph', category: 'Diagnostic', defaultPrice: 35, defaultDurationMinutes: 10, isActive: true },
  { id: 5, serviceCode: 'D1110', name: 'Dental Prophylaxis (Adult Cleaning)', category: 'Preventive', defaultPrice: 95, defaultDurationMinutes: 45, isActive: true },
  { id: 6, serviceCode: 'D1206', name: 'Topical Fluoride Varnish Application', category: 'Preventive', defaultPrice: 45, defaultDurationMinutes: 15, isActive: true },
  { id: 7, serviceCode: 'D2391', name: 'Resin-Based Composite - 1 Surface (Posterior)', category: 'Restorative', defaultPrice: 185, defaultDurationMinutes: 40, isActive: true },
  { id: 8, serviceCode: 'D2392', name: 'Resin-Based Composite - 2 Surfaces (Posterior)', category: 'Restorative', defaultPrice: 240, defaultDurationMinutes: 50, isActive: true },
  { id: 9, serviceCode: 'D2740', name: 'Crown - Porcelain/Ceramic Substrate', category: 'Restorative', defaultPrice: 1150, defaultDurationMinutes: 60, isActive: true },
  { id: 10, serviceCode: 'D3330', name: 'Endodontic Therapy - Molar Tooth (Root Canal)', category: 'Endodontic', defaultPrice: 980, defaultDurationMinutes: 90, isActive: true },
  { id: 11, serviceCode: 'D7140', name: 'Extraction, Erupted Tooth or Exposed Root', category: 'Oral Surgery', defaultPrice: 195, defaultDurationMinutes: 30, isActive: true },
  { id: 12, serviceCode: 'D7210', name: 'Surgical Extraction (Bone Removal / Sectioning)', category: 'Oral Surgery', defaultPrice: 345, defaultDurationMinutes: 45, isActive: true }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    dentistId: 1,
    scheduledStart: '2026-10-23T09:00:00',
    durationMinutes: 45,
    status: 'IN_OPERATORY',
    isWalkin: false,
    isUrgent: true,
    chiefComplaint: 'Throbbing pain #36, nocturnal discomfort, sensitive to hot soup.',
    operatoryChair: 'Chair 1 (Operatory A)',
    version: 1,
    createdAt: '2026-10-22T14:00:00Z'
  },
  {
    id: 2,
    patientId: 2,
    dentistId: 1,
    scheduledStart: '2026-10-23T10:00:00',
    durationMinutes: 45,
    status: 'ARRIVED',
    isWalkin: false,
    isUrgent: false,
    chiefComplaint: '6-month comprehensive cleaning & prophylaxis checkup.',
    operatoryChair: 'Chair 2 (Hygiene Suite)',
    version: 1,
    createdAt: '2026-10-18T10:30:00Z'
  },
  {
    id: 3,
    patientId: 4,
    dentistId: 1,
    scheduledStart: '2026-10-23T10:30:00',
    durationMinutes: 30,
    status: 'ARRIVED',
    isWalkin: true,
    isUrgent: true,
    chiefComplaint: 'Fractured tooth 21 incisal edge from morning bike slip.',
    operatoryChair: 'Chair 1 (Operatory A)',
    version: 1,
    createdAt: '2026-10-23T10:15:00Z'
  },
  {
    id: 4,
    patientId: 3,
    dentistId: 4,
    scheduledStart: '2026-10-23T11:15:00',
    durationMinutes: 45,
    status: 'CONFIRMED',
    isWalkin: false,
    isUrgent: false,
    chiefComplaint: 'Crown try-in and permanent cementation on tooth 16.',
    operatoryChair: 'Chair 3 (Surgical/Prosthetic)',
    version: 1,
    createdAt: '2026-10-20T11:00:00Z'
  },
  {
    id: 5,
    patientId: 5,
    dentistId: 1,
    scheduledStart: '2026-10-23T14:00:00',
    durationMinutes: 30,
    status: 'SCHEDULED',
    isWalkin: false,
    isUrgent: false,
    chiefComplaint: 'Pediatric checkup and sealant assessment.',
    operatoryChair: 'Chair 2 (Hygiene Suite)',
    version: 1,
    createdAt: '2026-10-21T15:20:00Z'
  }
];

export const INITIAL_VISITS: ClinicalVisit[] = [
  {
    id: 1,
    appointmentId: 1,
    patientId: 1,
    dentistId: 1,
    visitDatetime: '2026-10-23T09:05:00',
    chiefComplaint: 'Severe sharp pain on lower left molar (#36) radiating to jaw.',
    clinicalNotes: `SUBJECTIVE (S): Patient reports spontaneous throbbing pain beginning 3 days ago, keeps awake at night. Ingestion of warm fluids causes severe lingering pain (10-15s).
OBJECTIVE (O): Deep mesio-occlusal caries on tooth #36. Percussion positive (+). Cold test lingering intense pain (>20s). Periapical radiograph indicates widening of periodontal ligament space at mesial root apex.
ASSESSMENT (A): Symptomatic Irreversible Pulpitis with Symptomatic Apical Periodontitis tooth #36.
PLAN (P): 1. Emergency pulpectomy under 4% Articaine 1:100k local block. 2. Prescribed non-penicillin analgesic/anti-inflammatory (Ibuprofen 600mg). 3. Schedule for complete obturation & crown buildup.`,
    diagnosis: 'Symptomatic Irreversible Pulpitis (#36 FDI)',
    treatmentPlan: 'Pulpectomy followed by 3-canal root canal therapy and zirconia crown.',
    prescriptions: 'Ibuprofen 600mg PO TID PRN pain x 5 days (Avoid Penicillin - Allergy Alert).',
    toothRecords: [
      { toothNumber: 36, condition: 'ROOT_CANAL', surfaces: ['M', 'O'], notes: 'Pulpectomy initiated, canals instrumented to apex.', diagnosedDate: '2026-10-23' },
      { toothNumber: 16, condition: 'CROWN', surfaces: ['M', 'O', 'D'], notes: 'Porcelain crown placed previously in 2024.', diagnosedDate: '2024-05-12' },
      { toothNumber: 26, condition: 'FILLED', surfaces: ['O'], notes: 'Occlusal composite in good condition.', diagnosedDate: '2025-01-14' },
      { toothNumber: 38, condition: 'MISSING', surfaces: [], notes: 'Extracted 2021.' }
    ],
    vitalSigns: {
      bloodPressure: '128/82 mmHg',
      pulseRate: 76
    },
    createdBy: 1,
    createdAt: '2026-10-23T09:15:00Z'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 1,
    invoiceNumber: 'INV-2026-0104',
    patientId: 1,
    visitId: 1,
    issueDate: '2026-10-23',
    dueDate: '2026-10-23',
    subtotal: 395,
    discountAmount: 20,
    taxRate: 0.00,
    taxAmount: 0.00,
    totalAmount: 375,
    paidAmount: 375,
    status: 'PAID',
    items: [
      { id: 1, serviceCode: 'D0140', description: 'Limited Problem-Focused Oral Evaluation', quantity: 1, unitPrice: 85, discountAmount: 0, lineTotal: 85 },
      { id: 2, serviceCode: 'D0220', description: 'Single Periapical Radiograph (#36)', quantity: 2, unitPrice: 35, discountAmount: 0, lineTotal: 70 },
      { id: 3, serviceCode: 'D3330', description: 'Emergency Pulpectomy & Chemo-mechanical canal debridement', quantity: 1, unitPrice: 240, discountAmount: 20, lineTotal: 220 }
    ],
    notes: 'Emergency fee discount applied for patient loyalty.',
    version: 1,
    createdAt: '2026-10-23T09:45:00Z'
  },
  {
    id: 2,
    invoiceNumber: 'INV-2026-0103',
    patientId: 3,
    issueDate: '2026-10-21',
    dueDate: '2026-10-28',
    subtotal: 1150,
    discountAmount: 50,
    taxRate: 0.00,
    taxAmount: 0.00,
    totalAmount: 1100,
    paidAmount: 600,
    status: 'PARTIALLY_PAID',
    items: [
      { id: 4, serviceCode: 'D2740', description: 'Crown - Porcelain/Ceramic Substrate Tooth #16', toothNumber: 16, quantity: 1, unitPrice: 1150, discountAmount: 50, lineTotal: 1100 }
    ],
    notes: 'First deposit paid. Balance due upon final seating.',
    version: 1,
    createdAt: '2026-10-21T16:10:00Z'
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 1,
    receiptNumber: 'RCPT-2026-0082',
    invoiceId: 1,
    patientId: 1,
    paymentDate: '2026-10-23T09:50:00Z',
    amount: 375,
    paymentMethod: 'CREDIT_CARD',
    transactionReference: 'AUTH-CC-849102',
    notes: 'Paid at front desk via contactless terminal.',
    receivedBy: 'Elena Rostova'
  },
  {
    id: 2,
    receiptNumber: 'RCPT-2026-0081',
    invoiceId: 2,
    patientId: 3,
    paymentDate: '2026-10-21T16:15:00Z',
    amount: 600,
    paymentMethod: 'CASH',
    transactionReference: 'DRAWER-B-01',
    notes: 'Cash deposit received.',
    receivedBy: 'Elena Rostova'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 1, sku: 'ANE-LID-20', name: 'Lidocaine HCl 2% with Epinephrine 1:100k', category: 'Anesthetics', unitOfMeasure: 'Boxes (50 Cartridges)', currentStock: 4, reorderThreshold: 6, unitCost: 48.50, expirationDate: '2027-04-30', supplierName: 'Dentsply Sirona Supplies' },
  { id: 2, sku: 'ANE-ART-40', name: 'Articaine HCl 4% with Epinephrine 1:100k', category: 'Anesthetics', unitOfMeasure: 'Boxes (50 Cartridges)', currentStock: 12, reorderThreshold: 5, unitCost: 56.00, expirationDate: '2027-08-15', supplierName: 'Septodont Direct' },
  { id: 3, sku: 'RES-FLT-A2', name: 'Filtek Supreme Ultra Flowable Restorative (A2)', category: 'Restorative', unitOfMeasure: 'Pack of 2 Syringes', currentStock: 3, reorderThreshold: 5, unitCost: 68.00, expirationDate: '2026-12-31', supplierName: '3M Oral Care' },
  { id: 4, sku: 'DIS-GLV-MD', name: 'Nitrile Exam Gloves Powder-Free (Medium)', category: 'PPE & Sterilization', unitOfMeasure: 'Box of 100', currentStock: 18, reorderThreshold: 10, unitCost: 14.50, expirationDate: '2028-01-01', supplierName: 'Henry Schein Dental' },
  { id: 5, sku: 'DIS-BIB-3P', name: 'Dental Patient Bibs 3-Ply Waterproof (Teal)', category: 'Disposables', unitOfMeasure: 'Case of 500', currentStock: 2, reorderThreshold: 3, unitCost: 32.00, expirationDate: '2029-01-01', supplierName: 'Henry Schein Dental' },
  { id: 6, sku: 'STE-PCH-35', name: 'Autoclave Self-Sealing Pouches (3.5" x 9")', category: 'PPE & Sterilization', unitOfMeasure: 'Box of 200', currentStock: 8, reorderThreshold: 4, unitCost: 19.50, expirationDate: '2028-06-30', supplierName: 'Crosstex Healthcare' }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 1, userId: 2, userName: 'Elena Rostova', userRole: 'ROLE_RECEPTIONIST', actionType: 'CREATE', entityName: 'Patient', entityId: 'PAT-2026-004', timestamp: '2026-10-23T10:15:10Z', details: 'Registered walk-in emergency patient David Kim', ipAddress: '192.168.1.102' },
  { id: 2, userId: 1, userName: 'Dr. Sarah Chen, DDS', userRole: 'ROLE_DENTIST', actionType: 'UPDATE', entityName: 'ClinicalVisit', entityId: '1', timestamp: '2026-10-23T09:35:22Z', details: 'Updated tooth #36 records to ROOT_CANAL; SOAP notes committed', ipAddress: '192.168.1.105' },
  { id: 3, userId: 2, userName: 'Elena Rostova', userRole: 'ROLE_RECEPTIONIST', actionType: 'PAYMENT', entityName: 'Invoice', entityId: 'INV-2026-0104', timestamp: '2026-10-23T09:50:00Z', details: 'Processed $375 credit card payment for Jonathan Miller', ipAddress: '192.168.1.102' },
  { id: 4, userId: 4, userName: 'Dr. Marcus Vance', userRole: 'ROLE_OWNER', actionType: 'BACKUP_EXPORT', entityName: 'Database', entityId: 'SNAPSHOT-2026-10-23', timestamp: '2026-10-23T08:00:00Z', details: 'Automated morning LAN snapshot export verified (100% integrity)', ipAddress: '192.168.1.100' }
];
