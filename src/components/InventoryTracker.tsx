import React, { useState } from 'react';
import { useDental } from '../context/DentalContext';
import { 
  Package, AlertTriangle, Plus, Minus, Search, 
  CheckCircle2, ArrowUpDown 
} from 'lucide-react';

export const InventoryTracker: React.FC = () => {
  const { inventory, updateInventoryStock } = useDental();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', 'Anesthetics', 'Restorative', 'PPE & Sterilization', 'Disposables'];

  const filteredItems = inventory.filter(item => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    const q = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q);
  });

  const lowStockCount = inventory.filter(i => i.currentStock <= i.reorderThreshold).length;

  return (
    <div style={{ maxWidth: 1380, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            Clinical Supplies & Inventory
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0' }}>
            Chairside consumable tracking, reorder alerts, and dental materials management.
          </p>
        </div>
      </div>

      {/* Top Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="operatory-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#e6f3f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#005963' }}>
            <Package size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>{inventory.length}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Tracked Dental SKU Items</div>
          </div>
        </div>

        <div className="operatory-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b91c1c' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#b91c1c' }}>{lowStockCount}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Low Stock Reorder Alerts</div>
          </div>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="operatory-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Package size={18} color="#005963" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Dental Consumables & Stock Levels
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '0.45rem 0.75rem',
              background: '#fafbfa',
              border: '1px solid #cbd5e1',
              borderRadius: 8
            }}>
              <Search size={14} color="#64748b" />
              <input 
                type="text" 
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8rem', width: 180, color: '#0f172a' }}
                placeholder="Search SKU or item..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <select 
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem', borderRadius: 8, border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a' }}
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eef0e9', color: '#64748b' }}>
                <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.75rem', fontWeight: 600 }}>SKU</th>
                <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.75rem', fontWeight: 600 }}>Item Description</th>
                <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.75rem', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.75rem', fontWeight: 600 }}>Unit Cost</th>
                <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.75rem', fontWeight: 600 }}>In Stock</th>
                <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.75rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.75rem', fontWeight: 600, textAlign: 'right' }}>Quick Adjust</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => {
                const isLow = item.currentStock <= item.reorderThreshold;
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f3ee' }}>
                    <td style={{ padding: '0.75rem 0.85rem', fontFamily: 'monospace', color: '#005963', fontWeight: 700 }}>
                      {item.sku}
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem' }}>
                      <strong style={{ color: '#0f172a' }}>{item.name}</strong>
                      <div style={{ fontSize: '0.73rem', color: '#64748b' }}>
                        Supplier: {item.supplierName} • {item.unitOfMeasure}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem', color: '#475569' }}>
                      {item.category}
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem', fontWeight: 600, color: '#0f172a' }}>
                      ${item.unitCost.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: isLow ? '#b91c1c' : '#0f172a' }}>
                        {item.currentStock}
                      </span>
                      <span style={{ fontSize: '0.73rem', color: '#64748b' }}>
                        {' '}/ min {item.reorderThreshold}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem' }}>
                      {isLow ? (
                        <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '0.7rem', padding: '2px 8px', borderRadius: 9999, fontWeight: 700 }}>
                          REORDER NEEDED
                        </span>
                      ) : (
                        <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '0.7rem', padding: '2px 8px', borderRadius: 9999, fontWeight: 700 }}>
                          ADEQUATE
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button 
                          className="btn-outline-pill"
                          style={{ padding: '0.25rem 0.5rem', borderRadius: 6 }}
                          onClick={() => updateInventoryStock(item.id, Math.max(0, item.currentStock - 1))}
                          title="Reduce 1 unit (used in operatory)"
                        >
                          <Minus size={12} />
                        </button>
                        <button 
                          className="btn-outline-pill"
                          style={{ padding: '0.25rem 0.5rem', borderRadius: 6 }}
                          onClick={() => updateInventoryStock(item.id, item.currentStock + 1)}
                          title="Add 1 received unit"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
