/**
 * DentalDesk RBAC & Role-Based Security Verification Suite
 * Tests authentication, authorization, resource protections, and role boundaries.
 */

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000/api';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

async function assert(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`  ✅ PASS: ${name}`);
  } catch (err: any) {
    results.push({ name, passed: false, error: err.message });
    console.error(`  ❌ FAIL: ${name} -> ${err.message}`);
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 DentalDesk RBAC & Security Test Suite');
  console.log(`🔗 Target: ${BASE_URL}`);
  console.log('====================================================\n');

  // 1. Health check
  await assert('API Server Health is UP and connected to PostgreSQL', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.status !== 'UP') throw new Error(`Status is not UP: ${JSON.stringify(data)}`);
  });

  // 2. Unauthenticated access enforcement (401)
  await assert('Unauthenticated request to /api/reports/financial returns 401', async () => {
    const res = await fetch(`${BASE_URL}/reports/financial`);
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  await assert('Unauthenticated request to /api/users returns 401', async () => {
    const res = await fetch(`${BASE_URL}/users`);
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  await assert('Unauthenticated request to /api/audit returns 401', async () => {
    const res = await fetch(`${BASE_URL}/audit`);
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 3. User Authentication for 3 roles
  let ownerToken = '';
  let dentistToken = '';
  let receptToken = '';

  await assert('Owner (marcus.v) can authenticate and obtain signed JWT', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'marcus.v', password: 'Owner@123' })
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.token || data.user.role !== 'ROLE_OWNER') {
      throw new Error(`Invalid payload: ${JSON.stringify(data)}`);
    }
    ownerToken = data.token;
  });

  await assert('Dentist (dr.chen) can authenticate and obtain signed JWT', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'dr.chen', password: 'Dentist@123' })
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.token || data.user.role !== 'ROLE_DENTIST') {
      throw new Error(`Invalid payload: ${JSON.stringify(data)}`);
    }
    dentistToken = data.token;
  });

  await assert('Receptionist (elena.r) can authenticate and obtain signed JWT', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'elena.r', password: 'Reception@123' })
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.token || data.user.role !== 'ROLE_RECEPTIONIST') {
      throw new Error(`Invalid payload: ${JSON.stringify(data)}`);
    }
    receptToken = data.token;
  });

  // 4. Role Authorization: Owner privileges
  await assert('Owner can access executive financial reports (/api/reports/financial)', async () => {
    const res = await fetch(`${BASE_URL}/reports/financial`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.productionKpis || !data.financialSnapshot) {
      throw new Error(`Missing KPI properties: ${JSON.stringify(data)}`);
    }
  });

  await assert('Owner can access staff user accounts list (/api/users)', async () => {
    const res = await fetch(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`Expected non-empty users array`);
    }
  });

  await assert('Owner can access security audit logs (/api/audit)', async () => {
    const res = await fetch(`${BASE_URL}/audit`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // 5. Role Authorization: Dentist boundaries
  await assert('Dentist is REJECTED (403) from accessing financial reports', async () => {
    const res = await fetch(`${BASE_URL}/reports/financial`, {
      headers: { Authorization: `Bearer ${dentistToken}` }
    });
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  await assert('Dentist is REJECTED (403) from accessing staff user management', async () => {
    const res = await fetch(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${dentistToken}` }
    });
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  await assert('Dentist is REJECTED (403) from accessing security audit logs', async () => {
    const res = await fetch(`${BASE_URL}/audit`, {
      headers: { Authorization: `Bearer ${dentistToken}` }
    });
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  await assert('Dentist is REJECTED (403) from creating financial invoices', async () => {
    const res = await fetch(`${BASE_URL}/billing/invoices`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${dentistToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ patientId: 1, subtotal: 100 })
    });
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  await assert('Dentist CAN create clinical visit SOAP documentation', async () => {
    const res = await fetch(`${BASE_URL}/visits`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${dentistToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        patientId: 1,
        chiefComplaint: 'Post-op evaluation',
        clinicalNotes: 'SUBJECTIVE: No pain. OBJECTIVE: Tissue healing nicely. ASSESSMENT: Sound. PLAN: Recall in 6 months.',
        diagnosis: 'Healing mucosal tissue',
        toothRecords: []
      })
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    const data = await res.json();
    if (!data.id) throw new Error(`Failed to commit visit: ${JSON.stringify(data)}`);
  });

  // 6. Role Authorization: Receptionist boundaries
  await assert('Receptionist is REJECTED (403) from accessing financial reports', async () => {
    const res = await fetch(`${BASE_URL}/reports/financial`, {
      headers: { Authorization: `Bearer ${receptToken}` }
    });
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  await assert('Receptionist is REJECTED (403) from accessing staff user management', async () => {
    const res = await fetch(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${receptToken}` }
    });
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  await assert('Receptionist is REJECTED (403) from accessing audit logs', async () => {
    const res = await fetch(`${BASE_URL}/audit`, {
      headers: { Authorization: `Bearer ${receptToken}` }
    });
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  await assert('Receptionist is REJECTED (403) from creating clinical visits', async () => {
    const res = await fetch(`${BASE_URL}/visits`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${receptToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ patientId: 1, clinicalNotes: 'Illegal entry' })
    });
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  await assert('Receptionist CAN generate invoices and record payments', async () => {
    // 1. Generate invoice
    const invRes = await fetch(`${BASE_URL}/billing/invoices`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${receptToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        patientId: 1,
        subtotal: 95.00,
        taxAmount: 0.00,
        discountAmount: 0.00,
        items: [{ serviceCode: 'D1110', description: 'Dental Prophylaxis', quantity: 1, unitPrice: 95, discountAmount: 0, lineTotal: 95 }]
      })
    });
    if (invRes.status !== 201) throw new Error(`Invoice generation failed with ${invRes.status}`);
    const invData = await invRes.json();

    // 2. Record payment
    const pmtRes = await fetch(`${BASE_URL}/billing/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${receptToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        invoiceId: invData.id,
        patientId: 1,
        amount: 95.00,
        paymentMethod: 'CASH',
        transactionReference: 'CASH-TEST'
      })
    });
    if (pmtRes.status !== 201) throw new Error(`Payment recording failed with ${pmtRes.status}`);
    const pmtData = await pmtRes.json();
    if (!pmtData.receiptNumber) throw new Error(`Missing receipt number`);
  });

  // 7. Patient Access Control & Lookup
  await assert('Authenticated users can search patient master records', async () => {
    const res = await fetch(`${BASE_URL}/patients?query=Miller`, {
      headers: { Authorization: `Bearer ${receptToken}` }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Expected patient result');
  });

  await assert('Querying non-existent patient ID returns 404', async () => {
    const res = await fetch(`${BASE_URL}/patients/999999`, {
      headers: { Authorization: `Bearer ${receptToken}` }
    });
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
  });

  console.log('\n====================================================');
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  console.log(`📊 Test Summary: ${passedCount} Passed, ${failedCount} Failed out of ${results.length} total tests.`);
  console.log('====================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests();

