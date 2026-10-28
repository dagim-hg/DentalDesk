# DentalDesk 🦷

**DentalDesk** is an offline-first, high-performance Dental Practice Management System (PMS) designed for dental clinics and health centers. It provides seamless chairside charting, multi-operatory queue management, billing, inventory tracking, and disaster-proof local database backups.

---

## 🌟 Key Features

* **Interactive Odontogram & Clinical Charting**
  * Full 32-tooth adult FDI chart (teeth 11–48) with pediatric notation support.
  * Tooth-surface mapping (Mesial, Occlusal, Distal, Buccal, Lingual).
  * 9 clinical conditions (Caries, Crown, Root Canal, Missing, Extraction, Implant, Bridge, etc.).
  * SOAP progress notes, clinical diagnoses, treatment plans, and prescription records.

* **Live Queue & Smart Triage**
  * Real-time tracking across Waiting Room, In-Operatory chair, and Completed queues.
  * Walk-in check-in with pain level rating (1–10) and urgent triage flags.
  * One-click handoff between reception, doctor's operatory, and cashier.

* **Patient Registry & Health Alerts**
  * Complete demographic registry with unique patient codes (`PAT-2026-xxxx`).
  * Medical alert banners (Penicillin/latex allergies, hypertension, cardiac risk, bleeding disorders).
  * Emergency contact tracking and insurance policy management.

* **Operatory Chair Scheduling**
  * Multi-chair operatory timeline (Chair 1 / Operatory A, Chair 2 / Surgical Suite).
  * Appointment booking modal with doctor assignment, expected duration, and complaint.

* **Billing, Invoicing & Receipts**
  * Configurable dental service catalog with predefined pricing.
  * Multi-item invoice generation with tax, discounts, and outstanding balance tracking.
  * Payment recording (Cash, Card, Mobile Transfer / Telebirr / CBE Birr).
  * Print-ready 80mm thermal receipt and standard invoice formatting.

* **Dental Supplies & Inventory Management**
  * Real-time stock counts for consumables (anesthetics, composite resins, burs, gloves).
  * Visual low-stock badges triggered by reorder thresholds.
  * Direct stock adjustments for receiving shipments and chairside usage.

* **LAN Appliance, Auditing & Local Backups**
  * Full immutable audit trail recording every clinical and administrative action.
  * One-click JSON database snapshot export for easy offsite/USB flash backup.
  * Instant JSON database restore for disaster recovery.
  * Role-based access control (Owner, Dentist, Receptionist, Assistant, Admin).

---

## 🛠️ Technology Stack

* **Frontend Framework**: React 19 + TypeScript
* **Build Tool**: Vite
* **Icons**: Lucide React
* **Styling**: Vanilla CSS Design Tokens (Custom Dental Theme)
* **Architecture**: Offline-First Local Area Network (LAN) Ready

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or newer)
* [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dagim-hg/DentalDesk.git
   cd DentalDesk
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

### Building for Production

To create an optimized production build:
```bash
npm run build
```
The output will be generated in the `dist/` directory.

---

## 📄 License
This project is licensed under the MIT License.
