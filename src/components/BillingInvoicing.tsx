import React, { useState } from 'react';
import { useDental } from '../context/DentalContext';
import { Invoice, InvoiceItem, Payment, PaymentMethod } from '../types/dental';
import { 
  Receipt, Plus, DollarSign, Printer, CreditCard, 
  CheckCircle, AlertCircle, X, ShoppingCart, UserCheck 
} from 'lucide-react';

interface BillingInvoicingProps {
  initialPatientId?: number;
}

export const BillingInvoicing: React.FC<BillingInvoicingProps> = ({ initialPatientId }) => {
  const { 
    invoices, patients, serviceCatalog, createInvoice, 
    recordPayment, payments, currentUser 
  } = useDental();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState<Invoice | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<Payment | null>(null);

  // New Invoice Form
  const [selectedPatientId, setSelectedPatientId] = useState<number>(initialPatientId || patients[0]?.id || 1);
  const [invoiceItems, setInvoiceItems] = useState<Omit<InvoiceItem, 'id'>[]>([
    { serviceCode: 'D0120', description: 'Periodic Oral Evaluation', quantity: 1, unitPrice: 65, discountAmount: 0, lineTotal: 65 }
  ]);
  const [invoiceDiscount, setInvoiceDiscount] = useState<number>(0);
  const [invoiceNotes, setInvoiceNotes] = useState<string>('Standard dental services rendered.');

  // Payment Form
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CREDIT_CARD');
  const [payRef, setPayRef] = useState<string>('');

  const getPatient = (id: number) => patients.find(p => p.id === id);

  // Line item calculations
  const calculateSubtotal = () => invoiceItems.reduce((acc, item) => acc + item.lineTotal, 0);
  const calculateTotal = () => Math.max(0, calculateSubtotal() - invoiceDiscount);

  const handleAddLineItem = () => {
    const defaultService = serviceCatalog[0];
    setInvoiceItems(prev => [
      ...prev,
      {
        serviceCode: defaultService.serviceCode,
        description: defaultService.name,
        quantity: 1,
        unitPrice: defaultService.defaultPrice,
        discountAmount: 0,
        lineTotal: defaultService.defaultPrice
      }
    ]);
  };

  const handleServiceSelect = (index: number, code: string) => {
    const service = serviceCatalog.find(s => s.serviceCode === code);
    if (!service) return;

    setInvoiceItems(prev => prev.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          serviceCode: service.serviceCode,
          description: service.name,
          unitPrice: service.defaultPrice,
          lineTotal: service.defaultPrice * item.quantity - item.discountAmount
        };
      }
      return item;
    }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    setInvoiceItems(prev => prev.map((item, i) => {
      if (i === index) {
        const updated = { ...item, [field]: value };
        const qty = Number(updated.quantity) || 1;
        const price = Number(updated.unitPrice) || 0;
        const disc = Number(updated.discountAmount) || 0;
        updated.lineTotal = Math.max(0, qty * price - disc);
        return updated;
      }
      return item;
    }));
  };

  const handleRemoveItem = (index: number) => {
    if (invoiceItems.length <= 1) return;
    setInvoiceItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = calculateSubtotal();
    const total = calculateTotal();

    const newInv = createInvoice({
      patientId: selectedPatientId,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date().toISOString().slice(0, 10),
      subtotal,
      discountAmount: invoiceDiscount,
      taxRate: 0.00,
      taxAmount: 0.00,
      totalAmount: total,
      paidAmount: 0,
      status: 'UNPAID',
      items: invoiceItems.map((item, idx) => ({ ...item, id: idx + 1 })),
      notes: invoiceNotes
    });

    setShowCreateModal(false);
    // Optionally open payment dialog immediately
    setShowPayModal(newInv);
    setPayAmount(newInv.totalAmount);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPayModal || payAmount <= 0) return;

    const payment = recordPayment({
      invoiceId: showPayModal.id,
      patientId: showPayModal.patientId,
      paymentDate: new Date().toISOString(),
      amount: payAmount,
      paymentMethod: payMethod,
      transactionReference: payRef || `TX-${Date.now().toString().slice(-6)}`,
      notes: `Received at clinic front desk by ${currentUser.fullName}`,
      receivedBy: currentUser.fullName
    });

    setShowPayModal(null);
    setShowReceiptModal(payment);
  };

  // Metrics
  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
  const pendingReceivables = invoices.filter(i => i.status !== 'PAID').reduce((acc, i) => acc + (i.totalAmount - i.paidAmount), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Financial Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={22} color="var(--success)" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>${totalRevenue.toLocaleString()}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Total Cash & Card Collections</div>
          </div>
        </div>

        <div className="card-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Receipt size={22} color="var(--warning)" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>${pendingReceivables.toLocaleString()}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Outstanding Receivables</div>
          </div>
        </div>

        <div className="card-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Front Desk Cashier</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Generate procedure invoice</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
            <Plus size={15} />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      {/* Invoices Ledger Table */}
      <div className="card-panel">
        <div className="panel-header">
          <div className="panel-title">
            <Receipt size={18} color="var(--primary)" />
            <span>Clinical Billing & Invoices Ledger</span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Invoice #</th>
                <th style={{ padding: '0.75rem 1rem' }}>Patient</th>
                <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                <th style={{ padding: '0.75rem 1rem' }}>Items</th>
                <th style={{ padding: '0.75rem 1rem' }}>Total</th>
                <th style={{ padding: '0.75rem 1rem' }}>Paid</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const patient = getPatient(inv.patientId);
                const remaining = inv.totalAmount - inv.paidAmount;
                return (
                  <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: 600 }}>
                      {inv.invoiceNumber}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <strong style={{ color: '#fff' }}>{patient ? `${patient.firstName} ${patient.lastName}` : `Patient #${inv.patientId}`}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{patient?.phone}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {inv.issueDate}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {inv.items.length} item{inv.items.length > 1 ? 's' : ''}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#fff' }}>
                      ${inv.totalAmount.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--success)' }}>
                      ${inv.paidAmount.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-full)',
                          background: 
                            inv.status === 'PAID' ? 'var(--success-bg)' : 
                            inv.status === 'PARTIALLY_PAID' ? 'var(--warning-bg)' : 'var(--danger-bg)',
                          color: 
                            inv.status === 'PAID' ? 'var(--success)' : 
                            inv.status === 'PARTIALLY_PAID' ? 'var(--warning)' : 'var(--danger)'
                        }}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      {remaining > 0 ? (
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setShowPayModal(inv);
                            setPayAmount(remaining);
                          }}
                        >
                          <CreditCard size={13} />
                          <span>Collect (${remaining.toFixed(2)})</span>
                        </button>
                      ) : (
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            const lastPay = payments.find(p => p.invoiceId === inv.id);
                            if (lastPay) setShowReceiptModal(lastPay);
                          }}
                        >
                          <Printer size={13} color="var(--primary)" />
                          <span>Receipt</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Dialog */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '780px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={18} color="var(--primary)" />
                Generate Dental Invoice
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Patient</label>
                  <select 
                    className="form-select"
                    value={selectedPatientId}
                    onChange={e => setSelectedPatientId(Number(e.target.value))}
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} ({p.patientCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Line Items */}
                <div style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong style={{ color: '#fff', fontSize: '0.9rem' }}>Procedures & Fee Items</strong>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddLineItem}>
                      <Plus size={13} /> Add Procedure
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {invoiceItems.map((item, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'center', background: 'var(--bg-input)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                        <select 
                          className="form-select"
                          style={{ fontSize: '0.8rem' }}
                          value={item.serviceCode}
                          onChange={e => handleServiceSelect(idx, e.target.value)}
                        >
                          {serviceCatalog.map(s => (
                            <option key={s.id} value={s.serviceCode}>
                              {s.serviceCode} - {s.name} (${s.defaultPrice})
                            </option>
                          ))}
                        </select>

                        <input 
                          type="number" 
                          className="form-input" 
                          placeholder="Tooth #"
                          style={{ fontSize: '0.8rem' }}
                          value={item.toothNumber || ''}
                          onChange={e => handleItemChange(idx, 'toothNumber', e.target.value ? Number(e.target.value) : undefined)}
                        />

                        <input 
                          type="number" 
                          className="form-input" 
                          placeholder="Price"
                          style={{ fontSize: '0.8rem' }}
                          value={item.unitPrice}
                          onChange={e => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                        />

                        <div style={{ fontWeight: 700, color: 'var(--primary)', textAlign: 'right', fontSize: '0.85rem' }}>
                          ${item.lineTotal.toFixed(2)}
                        </div>

                        <button 
                          type="button" 
                          className="btn btn-danger btn-sm" 
                          style={{ padding: '0.3rem 0.5rem' }}
                          onClick={() => handleRemoveItem(idx)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subtotals & Discounts */}
                <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span>Gross Subtotal:</span>
                    <strong style={{ color: '#fff' }}>${calculateSubtotal().toFixed(2)}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem' }}>Clinic Discount ($):</span>
                    <input 
                      type="number" 
                      className="form-input"
                      style={{ width: '110px', padding: '0.35rem 0.6rem', textAlign: 'right' }}
                      value={invoiceDiscount}
                      onChange={e => setInvoiceDiscount(Number(e.target.value))}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', fontSize: '1.1rem' }}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>Net Total Due:</span>
                    <strong style={{ color: 'var(--primary)' }}>${calculateTotal().toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle size={16} />
                  <span>Issue Invoice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Dialog */}
      {showPayModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={18} color="var(--primary)" />
                Receive Payment — {showPayModal.invoiceNumber}
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowPayModal(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment}>
              <div className="modal-body">
                <div style={{ padding: '0.85rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>Total Invoice:</span>
                    <strong>${showPayModal.totalAmount.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    <span>Already Paid:</span>
                    <span style={{ color: 'var(--success)' }}>${showPayModal.paidAmount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', marginTop: '0.4rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.4rem' }}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>Balance Due:</span>
                    <strong style={{ color: 'var(--danger)' }}>${(showPayModal.totalAmount - showPayModal.paidAmount).toFixed(2)}</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Amount ($) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-input" 
                    required
                    value={payAmount}
                    onChange={e => setPayAmount(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select 
                    className="form-select"
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value as PaymentMethod)}
                  >
                    <option value="CREDIT_CARD">Credit Card (POS Terminal)</option>
                    <option value="CASH">Cash (Front Desk Drawer)</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                    <option value="INSURANCE_COPAY">Insurance Copay</option>
                    <option value="BANK_TRANSFER">Direct Local Bank Transfer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Transaction / Drawer Reference</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. AUTH-889102 or CASH-DRAWER-1"
                    value={payRef}
                    onChange={e => setPayRef(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPayModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle size={16} />
                  <span>Confirm Receipt & Balance</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 80mm ESC/POS Thermal Receipt Modal & Print View */}
      {showReceiptModal && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Printer size={18} color="var(--primary)" />
                Clinic Thermal Receipt
              </h3>
              <button className="btn btn-secondary btn-sm btn-close-print" onClick={() => setShowReceiptModal(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              {/* Thermal Receipt Body */}
              <div className="printable-receipt" style={{ background: '#fff', color: '#000', padding: '1.25rem', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '11px', lineHeight: '1.3' }}>
                <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '0.05em' }}>DENTALDESK CLINIC</div>
                  <div>100 Health Sciences Way, Suite 4</div>
                  <div>LAN Direct: 192.168.1.100</div>
                  <div>Tel: +1 (555) 234-5678</div>
                  <div style={{ marginTop: '0.4rem', borderTop: '1px dashed #000', paddingTop: '0.4rem' }}>
                    RECEIPT #{showReceiptModal.receiptNumber}
                  </div>
                </div>

                <div style={{ marginBottom: '0.5rem', borderBottom: '1px dashed #000', paddingBottom: '0.4rem' }}>
                  <div>Date: {new Date(showReceiptModal.paymentDate).toLocaleString()}</div>
                  <div>Patient: {getPatient(showReceiptModal.patientId)?.firstName} {getPatient(showReceiptModal.patientId)?.lastName}</div>
                  <div>Cashier: {showReceiptModal.receivedBy}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, margin: '0.5rem 0' }}>
                  <span>METHOD:</span>
                  <span>{showReceiptModal.paymentMethod}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '14px', borderTop: '1px solid #000', paddingTop: '0.4rem', marginBottom: '0.75rem' }}>
                  <span>AMOUNT PAID:</span>
                  <span>${showReceiptModal.amount.toFixed(2)}</span>
                </div>

                <div style={{ textAlign: 'center', fontSize: '9px', marginTop: '1rem', borderTop: '1px dashed #000', paddingTop: '0.5rem' }}>
                  Thank you for visiting DentalDesk!<br/>
                  Air-Gapped Autonomous Record System
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowReceiptModal(null)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={16} />
                <span>Print Thermal Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
