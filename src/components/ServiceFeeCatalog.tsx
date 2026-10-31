import React, { useState } from 'react';
import { useDental } from '../context/DentalContext';
import { ServiceItem } from '../types/dental';
import { 
  FileText, Search, Plus, Edit2, Check, X, 
  DollarSign, Clock, Tag, Filter, CheckCircle2, AlertCircle 
} from 'lucide-react';

export const ServiceFeeCatalog: React.FC = () => {
  const { serviceCatalog, updateServiceFee, hasPermission } = useDental();
  const canEdit = hasPermission('EDIT_SERVICE_FEES');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  // Extract unique categories
  const categories = ['ALL', ...Array.from(new Set(serviceCatalog.map(s => s.category)))];

  const filteredServices = serviceCatalog.filter(service => {
    const matchesSearch = 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.serviceCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || service.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleStartEdit = (service: ServiceItem) => {
    if (!canEdit) return;
    setEditingId(service.id);
    setEditPrice(String(service.defaultPrice));
  };

  const handleSavePrice = async (serviceId: number) => {
    const numPrice = parseFloat(editPrice);
    if (isNaN(numPrice) || numPrice < 0) {
      alert('Please enter a valid price amount');
      return;
    }
    await updateServiceFee(serviceId, numPrice);
    setEditingId(null);
    setSavedFeedback(`Fee for ${serviceCatalog.find(s => s.id === serviceId)?.serviceCode} updated to $${numPrice.toFixed(2)}`);
    setTimeout(() => setSavedFeedback(null), 3000);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditPrice('');
  };

  const avgPrice = serviceCatalog.length > 0
    ? (serviceCatalog.reduce((sum, s) => sum + s.defaultPrice, 0) / serviceCatalog.length).toFixed(2)
    : '0.00';

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.75rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--dd-lime-light)',
            color: '#3f6212',
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: '0.75rem',
            fontWeight: 700,
            marginBottom: 8
          }}>
            <Tag size={13} />
            <span>OWNER CLINICAL FEE SCHEDULE</span>
          </div>
          <h1 style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            color: 'var(--dd-text-dark)',
            margin: 0,
            letterSpacing: '-0.025em'
          }}>
            Service & Fee Catalog
          </h1>
          <p style={{ color: 'var(--dd-text-muted)', fontSize: '0.88rem', margin: '4px 0 0' }}>
            Authorized fee pricing and standard clinical procedure durations according to clinic policy.
          </p>
        </div>

        {/* Quick Stat Pill Cards */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--dd-border)',
            borderRadius: 14,
            padding: '10px 16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--dd-text-muted)', fontWeight: 600 }}>Total Procedures</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dd-primary-teal)' }}>{serviceCatalog.length}</div>
          </div>
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--dd-border)',
            borderRadius: 14,
            padding: '10px 16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--dd-text-muted)', fontWeight: 600 }}>Avg Procedure Fee</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f766e' }}>${avgPrice}</div>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {savedFeedback && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--dd-success-bg)',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '10px 16px',
          borderRadius: 12,
          marginBottom: '1.25rem',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={16} />
          <span>{savedFeedback}</span>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--dd-border)',
        borderRadius: 18,
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#f8fafc',
          border: '1px solid var(--dd-border-strong)',
          borderRadius: 9999,
          padding: '8px 14px',
          width: 320
        }}>
          <Search size={16} color="var(--dd-text-subtle)" />
          <input
            type="text"
            placeholder="Search procedure name or CDT code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '0.85rem',
              width: '100%',
              color: 'var(--dd-text-dark)'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--dd-text-subtle)', padding: 0 }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--dd-text-muted)', marginRight: 4 }}>
            CATEGORY:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                border: 'none',
                borderRadius: 9999,
                padding: '6px 14px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: selectedCategory === cat ? 'var(--dd-primary-teal)' : '#f1f5f9',
                color: selectedCategory === cat ? '#ffffff' : 'var(--dd-text-muted)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Service Fee Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: 20,
        border: '1px solid var(--dd-border)',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        <table className="modern-table">
          <thead>
            <tr>
              <th style={{ width: '120px' }}>CDT Code</th>
              <th>Service / Procedure Name</th>
              <th>Clinical Category</th>
              <th style={{ width: '110px' }}>Est. Duration</th>
              <th style={{ width: '160px' }}>Standard Fee ($)</th>
              <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--dd-text-muted)' }}>
                  No dental services found matching your search.
                </td>
              </tr>
            ) : (
              filteredServices.map((service) => {
                const isEditing = editingId === service.id;
                return (
                  <tr key={service.id}>
                    <td>
                      <span style={{
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        background: '#f1f5f9',
                        padding: '3px 8px',
                        borderRadius: 6,
                        color: 'var(--dd-primary-teal)'
                      }}>
                        {service.serviceCode}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--dd-text-dark)' }}>
                        {service.name}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: 12,
                        background: 'var(--dd-lime-light)',
                        color: '#3f6212'
                      }}>
                        {service.category}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: 'var(--dd-text-muted)' }}>
                        <Clock size={13} />
                        <span>{service.defaultDurationMinutes} min</span>
                      </div>
                    </td>
                    <td>
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontWeight: 700, color: 'var(--dd-text-dark)' }}>$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            autoFocus
                            style={{
                              width: '90px',
                              padding: '5px 8px',
                              borderRadius: 6,
                              border: '1.5px solid var(--dd-primary-teal)',
                              outline: 'none',
                              fontSize: '0.88rem',
                              fontWeight: 700
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSavePrice(service.id);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                          />
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--dd-text-dark)' }}>
                          ${service.defaultPrice.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          <button
                            onClick={() => handleSavePrice(service.id)}
                            title="Save Fee"
                            style={{
                              background: 'var(--dd-primary-teal)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              padding: '5px 8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            title="Cancel"
                            style={{
                              background: '#f1f5f9',
                              color: 'var(--dd-text-muted)',
                              border: 'none',
                              borderRadius: 6,
                              padding: '5px 8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        canEdit && (
                          <button
                            onClick={() => handleStartEdit(service)}
                            title="Edit Standard Fee"
                            style={{
                              background: '#f8fafc',
                              border: '1px solid var(--dd-border-strong)',
                              borderRadius: 6,
                              padding: '5px 9px',
                              cursor: 'pointer',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              color: 'var(--dd-primary-teal)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <Edit2 size={12} />
                            <span>Edit Fee</span>
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={{
        marginTop: '1.25rem',
        padding: '12px 18px',
        background: '#f8fafc',
        borderRadius: 14,
        border: '1px solid var(--dd-border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: '0.8rem',
        color: 'var(--dd-text-muted)'
      }}>
        <AlertCircle size={15} color="var(--dd-primary-teal)" />
        <span>
          <strong>SRS Compliance Note:</strong> Fee modifications are recorded in the security audit log with timestamps and the authenticated Owner ID.
        </span>
      </div>
    </div>
  );
};

