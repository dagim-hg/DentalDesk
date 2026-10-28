import React, { useState } from 'react';
import { useDental } from '../context/DentalContext';
import { 
  ToothRecord, ToothCondition, ToothSurface, Patient 
} from '../types/dental';
import { 
  Activity, Check, AlertCircle, FileText, Pill, Stethoscope, 
  Plus, Save, RefreshCw, Layers 
} from 'lucide-react';

// FDI Notation Quadrants
const ADULT_UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const ADULT_UPPER_LEFT  = [21, 22, 23, 24, 25, 26, 27, 28];
const ADULT_LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
const ADULT_LOWER_LEFT  = [31, 32, 33, 34, 35, 36, 37, 38];

const PEDIATRIC_UPPER = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
const PEDIATRIC_LOWER = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];

const CONDITION_COLORS: Record<ToothCondition, { bg: string; border: string; label: string }> = {
  HEALTHY: { bg: '#1e293b', border: '#475569', label: 'Healthy / Sound' },
  CARIES: { bg: 'rgba(239, 68, 68, 0.35)', border: '#ef4444', label: 'Active Caries (Decay)' },
  FILLED: { bg: 'rgba(14, 165, 233, 0.35)', border: '#0ea5e9', label: 'Restored / Filling' },
  CROWN: { bg: 'rgba(245, 158, 11, 0.35)', border: '#f59e0b', label: 'Crown / Prosthetic' },
  ROOT_CANAL: { bg: 'rgba(139, 92, 246, 0.35)', border: '#8b5cf6', label: 'Root Canal Treated' },
  MISSING: { bg: '#0b1120', border: '#334155', label: 'Missing / Unerupted' },
  EXTRACTION_NEEDED: { bg: 'rgba(225, 29, 72, 0.35)', border: '#e11d48', label: 'Extraction Indicated' },
  IMPLANT: { bg: 'rgba(16, 185, 129, 0.35)', border: '#10b981', label: 'Dental Implant' },
  BRIDGE: { bg: 'rgba(168, 85, 247, 0.35)', border: '#a855f7', label: 'Bridge Abutment' }
};

export const ToothChart: React.FC = () => {
  const { selectedPatient, saveVisit, getPatientToothRecords, currentUser, hasPermission } = useDental();

  const [dentitionType, setDentitionType] = useState<'ADULT' | 'PEDIATRIC'>('ADULT');
  const [activeTool, setActiveTool] = useState<ToothCondition>('CARIES');
  const [selectedTooth, setSelectedTooth] = useState<number | null>(36);
  
  // Local active visit state
  const [records, setRecords] = useState<Record<number, ToothRecord>>(() => {
    const existing = selectedPatient ? getPatientToothRecords(selectedPatient.id) : [];
    const map: Record<number, ToothRecord> = {};
    existing.forEach(r => { map[r.toothNumber] = r; });
    return map;
  });

  const [soapNotes, setSoapNotes] = useState<string>(
    `SUBJECTIVE: Patient reports localized sensitivity to temperature on quadrant.\nOBJECTIVE: Clinical exploration shows deep cavitation with softened dentin.\nASSESSMENT: Dental caries requiring restorative intervention.\nPLAN: Excavate decay under local anesthesia, apply bonding agent, restore with composite resin.`
  );
  const [treatmentPlan, setTreatmentPlan] = useState<string>('Restorative composite filling & fluoride remineralization');
  const [prescriptions, setPrescriptions] = useState<string>('Amoxicillin 500mg (or Clindamycin if penicillin allergy)');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!selectedPatient) {
    return (
      <div className="card-panel" style={{ textAlign: 'center', padding: '3rem' }}>
        <Stethoscope size={48} color="var(--primary)" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
        <h3>No Patient Selected</h3>
        <p style={{ marginTop: '0.5rem' }}>Select a patient from the Waiting Queue or Patient Registry to open clinical charting.</p>
      </div>
    );
  }

  // Toggle or stamp condition on tooth
  const handleToothClick = (toothNum: number) => {
    if (!hasPermission('CLINICAL_WRITE')) {
      alert('Access Restricted: Only Dentists and Clinical Directors can commit modifications to permanent health records.');
      return;
    }

    setSelectedTooth(toothNum);
    setRecords(prev => {
      const existing = prev[toothNum];
      if (existing && existing.condition === activeTool) {
        // Toggle back to healthy
        const updated = { ...prev };
        delete updated[toothNum];
        return updated;
      }
      return {
        ...prev,
        [toothNum]: {
          toothNumber: toothNum,
          condition: activeTool,
          surfaces: existing?.surfaces || ['O'],
          diagnosedDate: new Date().toISOString().slice(0, 10)
        }
      };
    });
  };

  // Toggle surface (M, O, D, B, L) for selected tooth
  const toggleSurface = (surface: ToothSurface) => {
    if (!selectedTooth) return;
    setRecords(prev => {
      const current = prev[selectedTooth] || {
        toothNumber: selectedTooth,
        condition: activeTool,
        surfaces: []
      };
      const hasSurface = current.surfaces.includes(surface);
      const newSurfaces = hasSurface 
        ? current.surfaces.filter(s => s !== surface)
        : [...current.surfaces, surface];

      return {
        ...prev,
        [selectedTooth]: {
          ...current,
          surfaces: newSurfaces
        }
      };
    });
  };

  const handleSaveVisit = () => {
    const toothRecordsArray = Object.values(records);
    saveVisit({
      patientId: selectedPatient.id,
      dentistId: currentUser.id,
      visitDatetime: new Date().toISOString(),
      chiefComplaint: selectedPatient.notes || 'Dental evaluation',
      clinicalNotes: soapNotes,
      diagnosis: `${toothRecordsArray.length} recorded dental conditions/procedures`,
      treatmentPlan,
      prescriptions,
      toothRecords: toothRecordsArray,
      createdBy: currentUser.id
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const currentToothRecord = selectedTooth ? records[selectedTooth] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Patient Header & Contraindications Warning */}
      <div className="card-panel" style={{ borderLeft: selectedPatient.isUrgent ? '4px solid var(--danger)' : '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '1.4rem' }}>{selectedPatient.firstName} {selectedPatient.lastName}</h2>
              <span className="badge-counter" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--primary)' }}>
                {selectedPatient.patientCode}
              </span>
              {selectedPatient.isUrgent && <span className="badge-urgent">URGENT TRIAGE</span>}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              DOB: {selectedPatient.dob} • Gender: {selectedPatient.gender} • Insurance: {selectedPatient.insuranceCarrier || 'Self-Pay (Uninsured)'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className={`btn btn-sm ${dentitionType === 'ADULT' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setDentitionType('ADULT')}
            >
              Adult Dentition (32 Teeth)
            </button>
            <button 
              className={`btn btn-sm ${dentitionType === 'PEDIATRIC' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setDentitionType('PEDIATRIC')}
            >
              Pediatric (Primary)
            </button>
          </div>
        </div>

        {/* High-Contrast Red Warning Banner for Allergies/Contraindications */}
        {selectedPatient.medicalAlerts && selectedPatient.medicalAlerts.length > 0 && (
          <div className="medical-alert-box" style={{ marginTop: '1rem' }}>
            <AlertCircle size={20} color="#f43f5e" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#fff' }}>CLINICAL CONTRAINDICATION / ALLERGY ALERT:</strong>{' '}
              {selectedPatient.medicalAlerts.join(' • ')}
            </div>
          </div>
        )}
      </div>

      {/* Main Odontogram & Treatment Suite Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '1.5rem' }}>
        {/* Left: Interactive Tooth Chart */}
        <div className="card-panel">
          <div className="panel-header">
            <div className="panel-title">
              <Activity size={18} color="var(--primary)" />
              <span>Interactive FDI Odontogram</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ISO 3950 Two-Digit Notation • Click tooth to apply condition
            </span>
          </div>

          {/* Condition Palette */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.5rem', background: 'var(--bg-input)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            {(Object.keys(CONDITION_COLORS) as ToothCondition[]).map((cond) => {
              const meta = CONDITION_COLORS[cond];
              const isActive = activeTool === cond;
              return (
                <button
                  key={cond}
                  onClick={() => setActiveTool(cond)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: isActive ? meta.bg : 'var(--bg-card)',
                    border: `1.5px solid ${isActive ? meta.border : 'var(--border-subtle)'}`,
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    boxShadow: isActive ? `0 0 10px ${meta.border}40` : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.border }}></span>
                  {meta.label}
                </button>
              );
            })}
          </div>

          {/* Tooth Grid Rendering */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {dentitionType === 'ADULT' ? (
              <>
                {/* Maxilla (Upper Arch) */}
                <div>
                  <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Maxillary Arch (Upper Teeth)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(16, 1fr)', gap: '4px' }}>
                    {[...ADULT_UPPER_RIGHT, ...ADULT_UPPER_LEFT].map((num) => (
                      <ToothItem
                        key={num}
                        number={num}
                        record={records[num]}
                        isSelected={selectedTooth === num}
                        onClick={() => handleToothClick(num)}
                      />
                    ))}
                  </div>
                </div>

                {/* Mandible (Lower Arch) */}
                <div>
                  <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Mandibular Arch (Lower Teeth)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(16, 1fr)', gap: '4px' }}>
                    {[...ADULT_LOWER_RIGHT.reverse(), ...ADULT_LOWER_LEFT].map((num) => (
                      <ToothItem
                        key={num}
                        number={num}
                        record={records[num]}
                        isSelected={selectedTooth === num}
                        onClick={() => handleToothClick(num)}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Pediatric Deciduous Arch */
              <>
                <div>
                  <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    Primary Maxillary Arch
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '6px' }}>
                    {PEDIATRIC_UPPER.map((num) => (
                      <ToothItem
                        key={num}
                        number={num}
                        record={records[num]}
                        isSelected={selectedTooth === num}
                        onClick={() => handleToothClick(num)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    Primary Mandibular Arch
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '6px' }}>
                    {PEDIATRIC_LOWER.map((num) => (
                      <ToothItem
                        key={num}
                        number={num}
                        record={records[num]}
                        isSelected={selectedTooth === num}
                        onClick={() => handleToothClick(num)}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Selected Tooth Surface Inspector */}
          {selectedTooth && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={16} color="var(--primary)" />
                  <strong style={{ color: '#fff' }}>Tooth #{selectedTooth} Details & Surfaces</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ({currentToothRecord?.condition ? CONDITION_COLORS[currentToothRecord.condition].label : 'Healthy'})
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Affected Surfaces:</span>
                {(['M', 'O', 'D', 'B', 'L'] as ToothSurface[]).map((surface) => {
                  const isSelected = currentToothRecord?.surfaces.includes(surface);
                  const labels: Record<ToothSurface, string> = { M: 'Mesial', O: 'Occlusal', D: 'Distal', B: 'Buccal', L: 'Lingual' };
                  return (
                    <button
                      key={surface}
                      onClick={() => toggleSurface(surface)}
                      style={{
                        padding: '0.25rem 0.6rem',
                        fontSize: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: isSelected ? 'var(--primary)' : 'var(--bg-input)',
                        color: isSelected ? '#fff' : 'var(--text-secondary)',
                        border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`
                      }}
                      title={labels[surface]}
                    >
                      {surface} ({labels[surface]})
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: SOAP Notes, Treatment Plan & Prescriptions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card-panel">
            <div className="panel-header">
              <div className="panel-title">
                <FileText size={18} color="var(--primary)" />
                <span>Clinical Examination (SOAP)</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Subjective, Objective, Assessment, Plan (SOAP)</label>
              <textarea
                className="form-textarea"
                rows={7}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', lineHeight: '1.4' }}
                value={soapNotes}
                onChange={(e) => setSoapNotes(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Treatment Plan / Procedures</label>
              <input
                type="text"
                className="form-input"
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Pill size={14} color="var(--warning)" />
                Prescriptions & Instructions
              </label>
              <input
                type="text"
                className="form-input"
                value={prescriptions}
                onChange={(e) => setPrescriptions(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              {saveSuccess && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--success)', fontSize: '0.82rem' }}>
                  <Check size={16} /> Saved to Patient Record
                </span>
              )}
              <button className="btn btn-primary" onClick={handleSaveVisit}>
                <Save size={16} />
                <span>Save Clinical Encounter</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component: Individual Tooth Item
const ToothItem: React.FC<{
  number: number;
  record?: ToothRecord;
  isSelected: boolean;
  onClick: () => void;
}> = ({ number, record, isSelected, onClick }) => {
  const condition = record?.condition || 'HEALTHY';
  const colorMeta = CONDITION_COLORS[condition];

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '6px 2px',
        borderRadius: 'var(--radius-sm)',
        background: isSelected ? 'rgba(14, 165, 233, 0.2)' : 'var(--bg-input)',
        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        userSelect: 'none'
      }}
    >
      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }}>
        {number}
      </span>

      {/* Anatomical Mini Tooth Box */}
      <div
        style={{
          width: '28px',
          height: '34px',
          marginTop: '4px',
          borderRadius: '4px',
          background: colorMeta.bg,
          border: `1.5px solid ${colorMeta.border}`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: condition !== 'HEALTHY' ? `0 0 8px ${colorMeta.border}50` : 'none'
        }}
      >
        {condition === 'MISSING' && (
          <div style={{ position: 'absolute', width: '100%', height: '1.5px', background: '#e11d48', transform: 'rotate(45deg)' }} />
        )}
        {condition === 'EXTRACTION_NEEDED' && (
          <span style={{ color: '#e11d48', fontWeight: 900, fontSize: '0.85rem' }}>✕</span>
        )}
        {condition === 'ROOT_CANAL' && (
          <div style={{ width: '4px', height: '18px', background: '#8b5cf6', borderRadius: '2px' }} />
        )}
        {condition === 'IMPLANT' && (
          <div style={{ width: '8px', height: '14px', border: '1.5px solid #10b981', borderRadius: '2px' }} />
        )}
        {record?.surfaces && record.surfaces.length > 0 && condition !== 'MISSING' && (
          <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#fff' }}>
            {record.surfaces.join('')}
          </span>
        )}
      </div>
    </div>
  );
};
