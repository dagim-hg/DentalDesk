-- ==============================================================
-- Seed Data for DentalDesk
-- ==============================================================

-- Users
INSERT INTO users (id, username, full_name, role, title, email, phone, avatar) VALUES
(1, 'dr.chen', 'Dr. Sarah Chen, DDS', 'ROLE_DENTIST', 'Lead Dental Surgeon', 'sarah.chen@dentaldesk.local', '+1 (555) 234-5678', 'SC'),
(2, 'elena.r', 'Elena Rostova', 'ROLE_RECEPTIONIST', 'Front Desk Coordinator', 'elena.r@dentaldesk.local', '+1 (555) 234-5679', 'ER'),
(3, 'chloe.k', 'Chloe Kim, CDA', 'ROLE_ASSISTANT', 'Certified Dental Assistant', 'chloe.k@dentaldesk.local', '+1 (555) 234-5680', 'CK'),
(4, 'marcus.v', 'Dr. Marcus Vance', 'ROLE_OWNER', 'Clinic Managing Partner', 'marcus.vance@dentaldesk.local', '+1 (555) 234-5670', 'MV')
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Service Catalog
INSERT INTO service_catalog (id, code, name, category, standard_fee, description, active) VALUES
(1, 'D0120', 'Periodic Oral Evaluation', 'Diagnostic', 65.00, 'Routine 6-month checkup', true),
(2, 'D0140', 'Limited Problem-Focused Exam', 'Diagnostic', 85.00, 'Emergency triage evaluation', true),
(3, 'D0210', 'Complete Intraoral Radiograph Series', 'Diagnostic', 145.00, 'Full mouth series', true),
(4, 'D0220', 'Single Periapical Radiograph', 'Diagnostic', 35.00, 'Single tooth root X-ray', true),
(5, 'D1110', 'Dental Prophylaxis (Adult Cleaning)', 'Preventive', 95.00, 'Standard scaling & polishing', true),
(6, 'D1206', 'Topical Fluoride Varnish Application', 'Preventive', 45.00, 'Fluoride treatment', true),
(7, 'D2391', 'Resin-Based Composite - 1 Surface', 'Restorative', 185.00, 'Tooth-colored filling (1 surface)', true),
(8, 'D2392', 'Resin-Based Composite - 2 Surfaces', 'Restorative', 240.00, 'Tooth-colored filling (2 surfaces)', true),
(9, 'D2740', 'Crown - Porcelain/Ceramic Substrate', 'Restorative', 1150.00, 'Full ceramic tooth crown', true),
(10, 'D3330', 'Endodontic Therapy - Molar Tooth (Root Canal)', 'Endodontic', 980.00, 'Molar root canal treatment', true),
(11, 'D7140', 'Extraction, Erupted Tooth or Exposed Root', 'Oral Surgery', 195.00, 'Simple tooth extraction', true),
(12, 'D7210', 'Surgical Extraction (Bone Removal)', 'Oral Surgery', 345.00, 'Surgical tooth extraction', true)
ON CONFLICT (id) DO NOTHING;

SELECT setval('service_catalog_id_seq', (SELECT MAX(id) FROM service_catalog));

-- Patients
INSERT INTO patients (id, patient_code, first_name, last_name, dob, gender, phone, email, address, emergency_contact_name, emergency_contact_phone, national_id, insurance_carrier, insurance_policy_number, medical_alerts, is_urgent, notes) VALUES
(1, 'PAT-2026-001', 'Jonathan', 'Miller', '1988-04-12', 'MALE', '+1 (555) 412-8890', 'jmiller@example.com', '452 Pine Hill Rd, Suite 4B', 'Laura Miller (Spouse)', '+1 (555) 412-8891', 'ID-9938210', 'Delta Dental Premier', 'POL-882910-A', '["Penicillin Allergy (Severe Anaphylaxis)", "Hypertension (Controlled)"]'::jsonb, true, 'Severe sharp pain on lower left quadrant triggered by cold & percussion.'),
(2, 'PAT-2026-002', 'Amara', 'Girma', '1995-11-28', 'FEMALE', '+1 (555) 678-2234', 'amara.g@example.com', '78 Horizon Blvd, Apt 12C', 'Abebe Girma (Brother)', '+1 (555) 678-2235', 'ID-8827194', 'MetLife Dental Preferred', 'POL-447192-B', '["Latex Sensitivity"]'::jsonb, false, 'Routine bi-annual hygiene checkup and mild sensitivity on upper right molar.'),
(3, 'PAT-2026-003', 'Carlos', 'Mendoza', '1974-08-05', 'MALE', '+1 (555) 890-3341', 'cmendoza@example.com', '12 Oak Ridge Ave', 'Sofia Mendoza (Daughter)', '+1 (555) 890-3342', 'ID-6671829', 'Cigna Dental Network', 'POL-992104-C', '["Type 2 Diabetes (HbA1c 6.8)", "Aspirin Therapy"]'::jsonb, false, 'Permanent porcelain crown seating scheduled for tooth 16.'),
(4, 'PAT-2026-004', 'David', 'Kim', '2001-02-14', 'MALE', '+1 (555) 321-9988', 'dkim@example.com', '912 College Way, Unit 3', 'Susan Kim (Mother)', '+1 (555) 321-9989', 'ID-1123490', NULL, NULL, '[]'::jsonb, true, 'Emergency walk-in: chipped front incisor #21 from sports accident.'),
(5, 'PAT-2026-005', 'Fatima', 'Zahra', '2016-06-20', 'FEMALE', '+1 (555) 776-5544', 'fzahra.parent@example.com', '33 Elm Terrace', 'Tariq Zahra (Father)', '+1 (555) 776-5545', 'ID-5561234', 'Aetna Dental Care', 'POL-332918-D', '["Asthma (Carries Albuterol Inhaler)"]'::jsonb, false, 'Pediatric examination: primary dentition caries assessment and fluoride varnish.')
ON CONFLICT (id) DO NOTHING;

SELECT setval('patients_id_seq', (SELECT MAX(id) FROM patients));

-- Appointments
INSERT INTO appointments (id, patient_id, dentist_id, scheduled_start, duration_minutes, status, is_walkin, is_urgent, chief_complaint, operatory_chair) VALUES
(1, 1, 1, '2026-10-23T09:00:00Z', 45, 'IN_OPERATORY', false, true, 'Throbbing pain #36, nocturnal discomfort, sensitive to hot soup.', 'Chair 1 (Operatory A)'),
(2, 2, 1, '2026-10-23T10:00:00Z', 45, 'ARRIVED', false, false, '6-month comprehensive cleaning & prophylaxis checkup.', 'Chair 2 (Hygiene Suite)'),
(3, 4, 1, '2026-10-23T10:30:00Z', 30, 'ARRIVED', true, true, 'Fractured tooth 21 incisal edge from morning bike slip.', 'Chair 1 (Operatory A)'),
(4, 3, 4, '2026-10-23T11:15:00Z', 45, 'CONFIRMED', false, false, 'Crown try-in and permanent cementation on tooth 16.', 'Chair 3 (Surgical/Prosthetic)'),
(5, 5, 1, '2026-10-23T14:00:00Z', 30, 'SCHEDULED', false, false, 'Pediatric checkup and sealant assessment.', 'Chair 2 (Hygiene Suite)')
ON CONFLICT (id) DO NOTHING;

SELECT setval('appointments_id_seq', (SELECT MAX(id) FROM appointments));

-- Inventory Items
INSERT INTO inventory_items (id, item_code, name, category, current_stock, unit, reorder_threshold, unit_cost, location) VALUES
(1, 'ANE-LID-20', 'Lidocaine HCl 2% with Epinephrine 1:100k', 'Anesthetics', 4, 'Boxes (50 Cartridges)', 6, 48.50, 'Cabinet A - Drawer 1'),
(2, 'ANE-ART-40', 'Articaine HCl 4% with Epinephrine 1:100k', 'Anesthetics', 12, 'Boxes (50 Cartridges)', 5, 56.00, 'Cabinet A - Drawer 2'),
(3, 'RES-FLT-A2', 'Filtek Supreme Ultra Flowable Restorative (A2)', 'Restorative', 3, 'Pack of 2 Syringes', 5, 68.00, 'Operatory 1 Bay'),
(4, 'DIS-GLV-MD', 'Nitrile Exam Gloves Powder-Free (Medium)', 'PPE & Sterilization', 18, 'Box of 100', 10, 14.50, 'Central Supply Shelf'),
(5, 'DIS-BIB-3P', 'Dental Patient Bibs 3-Ply Waterproof (Teal)', 'Disposables', 2, 'Case of 500', 3, 32.00, 'Storage Closet'),
(6, 'STE-PCH-35', 'Autoclave Self-Sealing Pouches (3.5" x 9")', 'PPE & Sterilization', 8, 'Box of 200', 4, 19.50, 'Sterilization Room')
ON CONFLICT (id) DO NOTHING;

SELECT setval('inventory_items_id_seq', (SELECT MAX(id) FROM inventory_items));

-- Audit Logs
INSERT INTO audit_logs (id, user_id, user_name, action_type, entity_name, entity_id, details) VALUES
(1, 2, 'Elena Rostova', 'CREATE', 'Patient', 'PAT-2026-004', 'Registered walk-in emergency patient David Kim'),
(2, 1, 'Dr. Sarah Chen, DDS', 'UPDATE', 'ClinicalVisit', '1', 'Updated tooth #36 records to ROOT_CANAL; SOAP notes committed'),
(3, 2, 'Elena Rostova', 'PAYMENT', 'Invoice', 'INV-2026-0104', 'Processed $375 payment for Jonathan Miller'),
(4, 4, 'Dr. Marcus Vance', 'BACKUP_EXPORT', 'Database', 'SNAPSHOT-2026-10-23', 'Automated morning LAN snapshot export verified')
ON CONFLICT (id) DO NOTHING;

SELECT setval('audit_logs_id_seq', (SELECT MAX(id) FROM audit_logs));
