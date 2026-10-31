import React, { useState } from 'react';
import { useDental } from '../context/DentalContext';
import { UserRole } from '../types/dental';
import { 
  UserCheck, UserPlus, Users, Stethoscope, 
  Shield, Clock, CheckCircle2, Search, X, 
  KeyRound, AlertCircle, Sparkles 
} from 'lucide-react';

export const StaffManagement: React.FC = () => {
  const { staffUsers, updateStaffUser, createStaffUser, currentUser } = useDental();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [newStaff, setNewStaff] = useState({
    username: '',
    fullName: '',
    role: 'ROLE_DENTIST' as UserRole,
    title: 'Associate Dentist',
    email: '',
    phone: '',
    password: 'DentalDesk@2026'
  });

  const dentistCount = staffUsers.filter(u => u.role === 'ROLE_DENTIST').length;
  const receptionistCount = staffUsers.filter(u => u.role === 'ROLE_RECEPTIONIST').length;
  const assistantCount = staffUsers.filter(u => u.role === 'ROLE_ASSISTANT').length;
  const ownerCount = staffUsers.filter(u => u.role === 'ROLE_OWNER' || u.role === 'ROLE_ADMIN').length;

  const filteredStaff = staffUsers.filter(u => {
    const matchesSearch = 
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.title && u.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    try {
      await updateStaffUser(userId, { role: newRole });
      setFeedback(`Role updated to ${newRole.replace('ROLE_', '')}`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert('Failed to update role: ' + (err.message || err));
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.username || !newStaff.fullName) {
      alert('Username and full name are required');
      return;
    }

    try {
      await createStaffUser(newStaff);
      setShowAddModal(false);
      setFeedback(`Staff account created for ${newStaff.fullName}`);
      setTimeout(() => setFeedback(null), 3500);
      setNewStaff({
        username: '',
        fullName: '',
        role: 'ROLE_DENTIST',
        title: 'Associate Dentist',
        email: '',
        phone: '',
        password: 'DentalDesk@2026'
      });
    } catch (err: any) {
      alert('Error creating staff member: ' + (err.message || err));
    }
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'ROLE_OWNER':
      case 'ROLE_ADMIN':
        return { bg: 'var(--dd-lime-light)', color: '#3f6212', label: 'Owner / Executive' };
      case 'ROLE_DENTIST':
        return { bg: '#e0f2fe', color: '#0369a1', label: 'Clinical Dentist' };
      case 'ROLE_RECEPTIONIST':
        return { bg: '#fef3c7', color: '#92400e', label: 'Front Desk' };
      case 'ROLE_ASSISTANT':
        return { bg: '#ede9fe', color: '#5b21b6', label: 'Dental Assistant' };
      default:
        return { bg: '#f1f5f9', color: '#475569', label: role };
    }
  };

  const getRolePermissionsSummary = (role: UserRole) => {
    switch (role) {
      case 'ROLE_OWNER':
        return 'Full clinic oversight: financials, staff provisioning, pricing fees, security audit logs, backups.';
      case 'ROLE_DENTIST':
        return 'Clinical workstation: patient records, odontogram, SOAP notes, prescriptions, queue triage.';
      case 'ROLE_RECEPTIONIST':
        return 'Front-desk operations: appointment scheduling, patient intake, check-in queue, billing & receipts.';
      case 'ROLE_ASSISTANT':
        return 'Clinical support: queue triage, room readiness, supply tracking.';
      default:
        return '';
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header section */}
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
            background: 'var(--dd-teal-light)',
            color: 'var(--dd-primary-teal)',
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: '0.75rem',
            fontWeight: 700,
            marginBottom: 8
          }}>
            <Shield size={13} />
            <span>ROLE-BASED ACCESS CONTROL (RBAC)</span>
          </div>
          <h1 style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            color: 'var(--dd-text-dark)',
            margin: 0,
            letterSpacing: '-0.025em'
          }}>
            Team & Role Provisioning
          </h1>
          <p style={{ color: 'var(--dd-text-muted)', fontSize: '0.88rem', margin: '4px 0 0' }}>
            Manage clinic personnel, role authorizations, credentials, and access policies.
          </p>
        </div>

        <button
          className="btn-primary-teal"
          onClick={() => setShowAddModal(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12 }}
        >
          <UserPlus size={16} />
          <span>Add Staff Account</span>
        </button>
      </div>

      {/* Role Counts Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: 18,
          border: '1px solid var(--dd-border)',
          padding: '1.15rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'var(--dd-lime-light)',
            color: '#3f6212',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--dd-text-muted)', fontWeight: 600 }}>Owners / Admins</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dd-text-dark)' }}>{ownerCount}</div>
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: 18,
          border: '1px solid var(--dd-border)',
          padding: '1.15rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: '#e0f2fe',
            color: '#0369a1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Stethoscope size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--dd-text-muted)', fontWeight: 600 }}>Dentists (Clinical)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dd-text-dark)' }}>{dentistCount}</div>
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: 18,
          border: '1px solid var(--dd-border)',
          padding: '1.15rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: '#fef3c7',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--dd-text-muted)', fontWeight: 600 }}>Receptionists</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dd-text-dark)' }}>{receptionistCount}</div>
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: 18,
          border: '1px solid var(--dd-border)',
          padding: '1.15rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: '#ede9fe',
            color: '#5b21b6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--dd-text-muted)', fontWeight: 600 }}>Assistants</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dd-text-dark)' }}>{assistantCount}</div>
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
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
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
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
            placeholder="Search by name, username, title..."
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
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--dd-text-subtle)' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Role Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {['ALL', 'ROLE_OWNER', 'ROLE_DENTIST', 'ROLE_RECEPTIONIST', 'ROLE_ASSISTANT'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                border: 'none',
                borderRadius: 9999,
                padding: '6px 14px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: roleFilter === r ? 'var(--dd-primary-teal)' : '#f1f5f9',
                color: roleFilter === r ? '#ffffff' : 'var(--dd-text-muted)'
              }}
            >
              {r === 'ALL' ? 'All Roles' : r.replace('ROLE_', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Table */}
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
              <th>Staff Member</th>
              <th>Contact & Title</th>
              <th>Assigned Role</th>
              <th>Permissions Scope</th>
              <th>Account Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--dd-text-muted)' }}>
                  No staff members found matching criteria.
                </td>
              </tr>
            ) : (
              filteredStaff.map((u) => {
                const badge = getRoleBadgeStyle(u.role);
                const isSelf = u.id === currentUser.id;

                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="user-avatar-circle" style={{ width: 38, height: 38, fontSize: '0.82rem' }}>
                          {u.avatar || u.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--dd-text-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>{u.fullName}</span>
                            {isSelf && (
                              <span style={{
                                fontSize: '0.65rem',
                                background: '#f1f5f9',
                                color: 'var(--dd-text-muted)',
                                padding: '2px 6px',
                                borderRadius: 4,
                                fontWeight: 700
                              }}>
                                YOU
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--dd-text-muted)', fontFamily: 'monospace' }}>
                            @{u.username}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dd-text-dark)' }}>
                        {u.title || 'Staff'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--dd-text-muted)' }}>
                        {u.email || 'Internal LAN Account'}
                      </div>
                    </td>

                    <td>
                      <select
                        value={u.role}
                        disabled={isSelf}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 9999,
                          border: '1.5px solid var(--dd-border-strong)',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          backgroundColor: isSelf ? '#f8fafc' : '#ffffff',
                          color: 'var(--dd-text-dark)',
                          cursor: isSelf ? 'not-allowed' : 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="ROLE_OWNER">Owner / Manager</option>
                        <option value="ROLE_DENTIST">Dentist (Clinical)</option>
                        <option value="ROLE_RECEPTIONIST">Receptionist</option>
                        <option value="ROLE_ASSISTANT">Dental Assistant</option>
                      </select>
                    </td>

                    <td style={{ maxWidth: 300 }}>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--dd-text-muted)',
                        lineHeight: 1.35
                      }}>
                        {getRolePermissionsSummary(u.role)}
                      </div>
                    </td>

                    <td>
                      <span className="pill-badge active" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={13} />
                        <span>Active</span>
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Provision Staff Account</h3>
              <button className="btn-outline" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Arthur Conan"
                  value={newStaff.fullName}
                  onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid var(--dd-border-strong)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. arthur.c"
                    value={newStaff.username}
                    onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid var(--dd-border-strong)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    Job Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Associate Orthodontist"
                    value={newStaff.title}
                    onChange={(e) => setNewStaff({ ...newStaff, title: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid var(--dd-border-strong)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Role Assignment *
                </label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as UserRole })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid var(--dd-border-strong)', fontWeight: 600 }}
                >
                  <option value="ROLE_DENTIST">ROLE_DENTIST — Clinical Provider</option>
                  <option value="ROLE_RECEPTIONIST">ROLE_RECEPTIONIST — Front Desk Operations</option>
                  <option value="ROLE_ASSISTANT">ROLE_ASSISTANT — Dental Assistant Station</option>
                  <option value="ROLE_OWNER">ROLE_OWNER — Managing Partner / Executive</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="staff@dentaldesk.local"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid var(--dd-border-strong)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    Initial Password *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid var(--dd-border-strong)', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div style={{
                fontSize: '0.75rem',
                color: 'var(--dd-text-muted)',
                background: '#f8fafc',
                padding: '8px 12px',
                borderRadius: 8
              }}>
                Passwords are automatically hashed with scrypt before storing in PostgreSQL. The employee will use this password to sign in on their assigned workstation.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-teal">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

