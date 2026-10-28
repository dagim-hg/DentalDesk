import React, { useState } from 'react';
import { useDental } from '../context/DentalContext';
import { 
  Package, AlertTriangle, Plus, Minus, Search, 
  CheckCircle, ArrowUpDown 
} from 'lucide-react';

export const InventoryTracker: React.FC = () => {
  const { inventory, updateInventoryStock, currentUser, hasPermission } = useDental();
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Inventory Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(14, 165, 233, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={22} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{inventory.length}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Tracked Dental SKU Items</div>
          </div>
        </div>

        <div className="card-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={22} color="var(--danger)" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{lowStockCount}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Low Stock Reorder Alerts</div>
          </div>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="card-panel">
        <div className="panel-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div className="panel-title">
            <Package size={18} color="var(--primary)" />
            <span>Dental Supplies & Operatory Stock</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: 10 }} />
              <input 
                type="text" 
                className="form-input" 
                style={{ paddingLeft: '2rem', padding: '0.4rem 0.6rem 0.4rem 2rem', fontSize: '0.82rem' }}
                placeholder="Search SKU or item..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <select 
              className="form-select"
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
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
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>SKU</th>
                <th style={{ padding: '0.75rem 1rem' }}>Item Description</th>
                <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem' }}>Unit Cost</th>
                <th style={{ padding: '0.75rem 1rem' }}>In Stock</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Quick Adjust</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => {
                const isLow = item.currentStock <= item.reorderThreshold;
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: 600 }}>
                      {item.sku}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <strong style={{ color: '#fff' }}>{item.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Supplier: {item.supplierName} • {item.unitOfMeasure}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {item.category}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#fff' }}>
                      ${item.unitCost.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: isLow ? 'var(--danger)' : '#fff' }}>
                        {item.currentStock}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {' '}/ min {item.reorderThreshold}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {isLow ? (
                        <span style={{ background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                          REORDER NEEDED
                        </span>
                      ) : (
                        <span style={{ background: 'var(--success-bg)', color: 'var(--success)', fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                          ADEQUATE
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.5rem' }}
                          onClick={() => updateInventoryStock(item.id, Math.max(0, item.currentStock - 1))}
                          title="Reduce 1 unit (used in operatory)"
                        >
                          <Minus size={13} />
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.5rem' }}
                          onClick={() => updateInventoryStock(item.id, item.currentStock + 1)}
                          title="Add 1 received unit"
                        >
                          <Plus size={13} />
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
