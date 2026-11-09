import React, { useState } from 'react';
import { useDental } from '../context/DentalContext';
import { User, UserRole } from '../types/dental';
import { 
  UserCheck, UserPlus, Users, Stethoscope, 
  Shield, Clock, CheckCircle2, Search, X, 
  KeyRound, AlertCircle, Sparkles, Eye, Edit2, 
  MapPin, Phone, Mail, Award, Calendar
} from 'lucide-react';

export const StaffManagement: React.FC = () => {
  const { staffUsers, updateStaffUser, createStaffUser, currentUser } = useDental();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [newStaff, setNewStaff] = useState({
    username: '',
    fullName: '',
    role: 'ROLE_DENTIST' as UserRole,
    title: 'Associate Dentist',
    email: '',
    phone: '',
    password: 'DentalDesk@2026',
    licenseNumber: '',
    specialization: 'General & Cosmetic Dentistry',
    assignedChair: 'Chair 1 (Main Operatory)',
    employmentType: 'Full-Time',
    workSchedule: 'Mon-Fri 08:30 - 17:00',
    emergencyContact: '',
    notes: ''
  });

  const dentistCount = staffUsers.filter(u => u.role === 'ROLE_DENTIST').length;
  const receptionistCount = staffUsers.filter(u => u.role === 'ROLE_RECEPTIONIST').length;
  const assistantCount = staffUsers.filter(u => u.role === 'ROLE_ASSISTANT').length;
  const ownerCount = staffUsers.filter(u => u.role === 'ROLE_OWNER' || u.role === 'ROLE_ADMIN').length;

  const filteredStaff = staffUsers.filter(u => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      u.fullName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.title && u.title.toLowerCase().includes(q)) ||
      (u.specialization && u.specialization.toLowerCase().includes(q)) ||
      (u.licenseNumber && u.licenseNumber.toLowerCase().includes(q));
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
        password: 'DentalDesk@2026',
        licenseNumber: '',
        specialization: 'General & Cosmetic Dentistry',
        assignedChair: 'Chair 1 (Main Operatory)',
        employmentType: 'Full-Time',
        workSchedule: 'Mon-Fri 08:30 - 17:00',
        emergencyContact: '',
        notes: ''
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
        return 'Full clinic governance: revenues, fees, staff provisioning, audit logs, system backups.';
      case 'ROLE_DENTIST':
        return 'Clinical provider: odontogram charting, SOAP notes, prescriptions, chair triage queue.';
      case 'ROLE_RECEPTIONIST':
        return 'Front-desk operations: appointment calendar, patient intake, check-in queue, billing & receipts.';
      case 'ROLE_ASSISTANT':
        return 'Clinical support: queue triage, operatory readiness, dental supply tracking.';
      default:
        return '';
    }
  };

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto' }}>
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
            <span>ROLE-BASED ACCESS CONTROL (RBAC) & CLINICAL ROSTER</span>
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
            Manage staff clinical credentials, professional licenses, operatory assignments, and workstation logins.
          </p>
        </div>

        <button
          className="btn-primary-teal"
          onClick={() => setShowAddModal(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12 }}
        >
          <UserPlus size={16} />
          <span>+ Add Staff Account</span>
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
            <div style={{ fontSize: '0.75rem', color: 'var(--dd-text-muted)', fontWeight: 600 }}>Owners / Partners</div>
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
            <div style={{ fontSize: '0.75rem', color: 'var(--dd-text-muted)', fontWeight: 600 }}>Front Desk Staff</div>
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
          width: 340
        }}>
          <Search size={16} color="var(--dd-text-subtle)" />
          <input
            type="text"
            placeholder="Search by name, license #, specialization..."
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

      {/* Comprehensive Staff Roster Table */}
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
              <th>Specialization & Chair</th>
              <th>License / Reg #</th>
              <th>Shift & Type</th>
              <th>Assigned Role</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--dd-text-muted)' }}>
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
                          <div style={{ fontSize: '0.78rem', color: 'var(--dd-text-muted)' }}>
                            @{u.username} · {u.title || 'Staff'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--dd-text-dark)' }}>
                        {u.specialization || (u.role === 'ROLE_DENTIST' ? 'General Dentistry' : 'Administration')}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--dd-primary-teal)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <MapPin size={12} />
                        <span>{u.assignedChair || 'Chair 1 (Main Operatory)'}</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.82rem', color: 'var(--dd-text-dark)', background: '#f8fafc', padding: '3px 8px', borderRadius: 6, display: 'inline-block', border: '1px solid var(--dd-border)' }}>
                        {u.licenseNumber || 'N/A (Staff)'}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--dd-text-dark)' }}>
                        {u.workSchedule || 'Mon-Fri 08:30 - 17:00'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--dd-text-muted)' }}>
                        {u.employmentType || 'Full-Time'}
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

                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedStaff(u)}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid var(--dd-border-strong)',
                          borderRadius: 8,
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: 'var(--dd-primary-teal)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5
                        }}
                      >
                        <Eye size={13} />
                        <span>View File</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Staff Member Full Profile Modal */}
      {selectedStaff && (
        <div className="modal-overlay" onClick={() => setSelectedStaff(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600, padding: '1.75rem' }}>
            <div className="modal-header" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="user-avatar-circle" style={{ width: 48, height: 48, fontSize: '1.1rem' }}>
                  {selectedStaff.avatar || selectedStaff.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>{selectedStaff.fullName}</h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--dd-text-muted)' }}>
                    @{selectedStaff.username} · {selectedStaff.title || 'Staff Member'}
                  </div>
                </div>
              </div>
              <button className="btn-outline" onClick={() => setSelectedStaff(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Credentials Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', background: '#f8fafc', padding: '1rem', borderRadius: 14, border: '1px solid var(--dd-border)' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--dd-text-muted)', fontWeight: 600 }}>DENTAL LICENSE #</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'monospace', marginTop: 2 }}>
                    {selectedStaff.licenseNumber || 'Not Required / Registered'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--dd-text-muted)', fontWeight: 600 }}>SPECIALIZATION</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--dd-primary-teal)', marginTop: 2 }}>
                    {selectedStaff.specialization || 'General Practice'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--dd-text-muted)', fontWeight: 600 }}>ASSIGNED OPERATORY</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: 2 }}>
                    {selectedStaff.assignedChair || 'Chair 1 (Main Operatory)'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--dd-text-muted)', fontWeight: 600 }}>EMPLOYMENT TYPE</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: 2 }}>
                    {selectedStaff.employmentType || 'Full-Time'}
                  </div>
                </div>
              </div>

              {/* Schedule & Contact */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 14, border: '1px solid var(--dd-border)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--dd-primary-teal)', marginBottom: '0.65rem', textTransform: 'uppercase' }}>
                  Contact & Shift Details
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--dd-text-muted)', display: 'block', fontSize: '0.72rem' }}>EMAIL</span>
                    <strong>{selectedStaff.email || `${selectedStaff.username}@dentaldesk.local`}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--dd-text-muted)', display: 'block', fontSize: '0.72rem' }}>DIRECT PHONE</span>
                    <strong>{selectedStaff.phone || '+1 (555) 234-5670'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--dd-text-muted)', display: 'block', fontSize: '0.72rem' }}>WORK SHIFT</span>
                    <strong>{selectedStaff.workSchedule || 'Mon-Fri 08:30 - 17:00'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--dd-text-muted)', display: 'block', fontSize: '0.72rem' }}>EMERGENCY CONTACT</span>
                    <strong>{selectedStaff.emergencyContact || 'Clinic Front Desk'}</strong>
                  </div>
                </div>
                {selectedStaff.notes && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--dd-border)', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--dd-text-muted)', display: 'block', fontSize: '0.72rem' }}>QUALIFICATIONS & REMARKS</span>
                    <p style={{ margin: '4px 0 0', color: 'var(--dd-text-dark)' }}>{selectedStaff.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button className="btn-primary-teal" onClick={() => setSelectedStaff(null)} style={{ padding: '8px 20px', borderRadius: 10 }}>
                Close Staff File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Add Staff Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680, maxHeight: '92vh', overflowY: 'auto', padding: '1.75rem' }}>
            <div className="modal-header" style={{ marginBottom: '0.75rem' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--dd-lime-light)', color: '#3f6212', padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, marginBottom: 4 }}>
                  <UserPlus size={12} />
                  <span>PERSONNEL PROVISIONING</span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>Provision Staff Account</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--dd-text-muted)', margin: '4px 0 0' }}>
                  Register clinical staff credentials, practice assignment, shift schedule, and secure workstation access.
                </p>
              </div>
              <button className="btn-outline" onClick={() => setShowAddModal(false)} style={{ borderRadius: 9999, width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
              
              {/* Section 1: Identity & Credentials */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 14, border: '1px solid var(--dd-border)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--dd-primary-teal)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Shield size={14} />
                  <span>1. Identity & System Credentials</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem', color: 'var(--dd-text-dark)' }}>
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Arthur Conan, DDS"
                      value={newStaff.fullName}
                      onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem', color: 'var(--dd-text-dark)' }}>
                      Username (Workstation Login) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. arthur.c"
                      value={newStaff.username}
                      onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)', fontSize: '0.85rem', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem', marginTop: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem', color: 'var(--dd-text-dark)' }}>
                      Role Assignment *
                    </label>
                    <select
                      value={newStaff.role}
                      onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as UserRole })}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)', fontSize: '0.85rem', fontWeight: 600, background: '#fff' }}
                    >
                      <option value="ROLE_DENTIST">ROLE_DENTIST — Clinical Provider</option>
                      <option value="ROLE_RECEPTIONIST">ROLE_RECEPTIONIST — Front Desk Operations</option>
                      <option value="ROLE_ASSISTANT">ROLE_ASSISTANT — Dental Assistant Station</option>
                      <option value="ROLE_OWNER">ROLE_OWNER — Managing Partner / Executive</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem', color: 'var(--dd-text-dark)' }}>
                      Initial Password *
                    </label>
                    <input
                      type="text"
                      required
                      value={newStaff.password}
                      onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)', fontSize: '0.85rem', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Clinical & Practice Assignment */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 14, border: '1px solid var(--dd-border)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--dd-primary-teal)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Stethoscope size={14} />
                  <span>2. Clinical & Practice Assignment</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem', color: 'var(--dd-text-dark)' }}>
                      Job Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Associate Orthodontist / Lead RDA"
                      value={newStaff.title}
                      onChange={(e) => setNewStaff({ ...newStaff, title: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem', color: 'var(--dd-text-dark)' }}>
                      Dental Board License / Reg #
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. DDS-784920 / RDA-55412"
                      value={newStaff.licenseNumber}
                      onChange={(e) => setNewStaff({ ...newStaff, licenseNumber: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginTop: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem', color: 'var(--dd-text-dark)' }}>
                      Specialization / Clinical Department
                    </label>
                    <select
                      value={newStaff.specialization}
                      onChange={(e) => setNewStaff({ ...newStaff, specialization: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)', fontSize: '0.85rem', background: '#fff' }}
                    >
                      <option value="General & Cosmetic Dentistry">General & Cosmetic Dentistry</option>
                      <option value="Orthodontics & Dentofacial">Orthodontics & Dentofacial</option>
                      <option value="Periodontics & Implantology">Periodontics & Implantology</option>
                      <option value="Endodontics (Root Canal)">Endodontics (Root Canal)</option>
                      <option value="Oral & Maxillofacial Surgery">Oral & Maxillofacial Surgery</option>
                      <option value="Pediatric Dentistry">Pediatric Dentistry</option>
                      <option value="Dental Hygiene & Prophylaxis">Dental Hygiene & Prophylaxis</option>
                      <option value="Chairside Assisting & Sterilization">Chairside Assisting & Sterilization</option>
                      <option value="Front Desk & Insurance Coordination">Front Desk & Insurance Coordination</option>
                      <option value="Practice Management & Administration">Practice Management & Administration</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem', color: 'var(--dd-text-dark)' }}>
                      Assigned Primary Operatory / Chair
                    </label>
                    <select
                      value={newStaff.assignedChair}
                      onChange={(e) => setNewStaff({ ...newStaff, assignedChair: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)', fontSize: '0.85rem', background: '#fff' }}
                    >
                      <option value="Chair 1 (Main Operatory)">Chair 1 (Main Operatory)</option>
                      <option value="Chair 2 (Pediatric/Hygiene)">Chair 2 (Pediatric/Hygiene)</option>
                      <option value="Chair 3 (Surgery/Endo)">Chair 3 (Surgery/Endo)</option>
                      <option value="Reception Station 1">Reception Station 1</option>
                      <option value="Reception Station 2">Reception Station 2</option>
                      <option value="Operatory Floater">Operatory Floater (All Chairs)</option>
                      <option value="Executive Management Office">Executive Management Office</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Contact & Shift Schedule */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 14, border: '1px solid var(--dd-border)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--dd-primary-teal)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={14} />
                  <span>3. Employment, Contact & Shift Schedule</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem', color: 'var(--dd-text-dark)' }}>
                      Clinic Work Email
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. arthur.c@dentaldesk.local"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem', color: 'var(--dd-text-dark)' }}>
                      Direct Mobile / Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +1 (555) 345-6789"
                      value={newStaff.phone}
                      onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginTop: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem', color: 'var(--dd-text-dark)' }}>
                      Employment Type
                    </label>
                    <select
                      value={newStaff.employmentType}
                      onChange={(e) => setNewStaff({ ...newStaff, employmentType: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)', fontSize: '0.85rem', background: '#fff' }}
                    >
                      <option value="Full-Time">Full-Time (Permanent)</option>
                      <option value="Part-Time">Part-Time</option>
                      <option value="Locum / Contract">Locum / Contract Provider</option>
                      <option value="Intern / Resident">Intern / Resident</option>
                      <option value="Managing Partner">Managing Partner</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem', color: 'var(--dd-text-dark)' }}>
                      Work Schedule / Clinic Shift
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mon-Fri 08:30 - 17:00"
                      value={newStaff.workSchedule}
                      onChange={(e) => setNewStaff({ ...newStaff, workSchedule: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '0.75rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem', color: 'var(--dd-text-dark)' }}>
                    Emergency Contact (Name & Phone)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Conan (+1 555-0199)"
                    value={newStaff.emergencyContact}
                    onChange={(e) => setNewStaff({ ...newStaff, emergencyContact: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ marginTop: '0.75rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem', color: 'var(--dd-text-dark)' }}>
                    Qualifications, Certifications & Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. BLS / CPR Certified, DEA Registered, Invisalign Accredited Provider"
                    value={newStaff.notes}
                    onChange={(e) => setNewStaff({ ...newStaff, notes: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)', fontSize: '0.85rem', resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.25rem' }}>
                <button type="button" className="btn-outline" onClick={() => setShowAddModal(false)} style={{ padding: '8px 18px', borderRadius: 10 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-teal" style={{ padding: '8px 22px', borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                  <UserPlus size={16} />
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
