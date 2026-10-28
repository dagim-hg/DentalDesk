-- ==============================================================
-- DentalDesk Relational Schema for PostgreSQL 18
-- ==============================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users / Staff Members
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL, -- ROLE_OWNER, ROLE_DENTIST, ROLE_ASSISTANT, ROLE_RECEPTIONIST, ROLE_ADMIN
    title VARCHAR(100),
    email VARCHAR(150),
    phone VARCHAR(50),
    avatar VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Patients Registry
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    patient_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. PAT-2026-0042
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(20) NOT NULL, -- MALE, FEMALE, OTHER
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    address TEXT,
    emergency_contact_name VARCHAR(150),
    emergency_contact_phone VARCHAR(50),
    national_id VARCHAR(100),
    insurance_carrier VARCHAR(150),
    insurance_policy_number VARCHAR(100),
    medical_alerts JSONB DEFAULT '[]'::jsonb, -- e.g. ["Penicillin Allergy", "Hypertension"]
    is_urgent BOOLEAN DEFAULT FALSE,
    notes TEXT,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Appointments & Queue
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    dentist_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    scheduled_start TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED, CONFIRMED, ARRIVED, IN_OPERATORY, COMPLETED, CANCELLED, NO_SHOW
    is_walkin BOOLEAN DEFAULT FALSE,
    is_urgent BOOLEAN DEFAULT FALSE,
    chief_complaint TEXT,
    operatory_chair VARCHAR(100) DEFAULT 'Chair 1',
    cancellation_reason TEXT,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Clinical Visits (SOAP Notes)
CREATE TABLE IF NOT EXISTS clinical_visits (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    dentist_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    visit_datetime TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    chief_complaint TEXT,
    clinical_notes TEXT, -- SOAP formatting
    diagnosis TEXT,
    treatment_plan TEXT,
    prescriptions TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tooth Chart Records (FDI Odontogram)
CREATE TABLE IF NOT EXISTS tooth_records (
    id SERIAL PRIMARY KEY,
    visit_id INTEGER REFERENCES clinical_visits(id) ON DELETE CASCADE,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    tooth_number INTEGER NOT NULL, -- FDI 11-48, 51-85
    condition VARCHAR(50) NOT NULL, -- HEALTHY, CARIES, FILLED, CROWN, MISSING, ROOT_CANAL, EXTRACTION_NEEDED, IMPLANT, BRIDGE
    surfaces JSONB DEFAULT '[]'::jsonb, -- ["M", "O", "D", "B", "L"]
    notes TEXT,
    diagnosed_date DATE DEFAULT CURRENT_DATE,
    procedure_code VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Service Catalog
CREATE TABLE IF NOT EXISTS service_catalog (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    standard_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    balance_due NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'UNPAID', -- UNPAID, PARTIAL, PAID, VOID
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Payments & Cash Drawer
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    amount_paid NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- CASH, CARD, TELEBIRR, CBE_BIRR, BANK_TRANSFER, INSURANCE
    transaction_reference VARCHAR(100),
    notes TEXT,
    recorded_by VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Dental Supplies & Inventory
CREATE TABLE IF NOT EXISTS inventory_items (
    id SERIAL PRIMARY KEY,
    item_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    reorder_threshold INTEGER NOT NULL DEFAULT 5,
    unit_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    location VARCHAR(100),
    last_restocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. Immutable Audit Trail (FR-AUDIT)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    user_name VARCHAR(150) NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, STATUS_CHANGE, BACKUP_EXPORT, BACKUP_RESTORE
    entity_name VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patients_code ON patients(patient_code);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_tooth_records_patient ON tooth_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_patient ON invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
