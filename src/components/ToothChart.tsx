import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDental } from '../context/DentalContext';
import { ToothRecord, ToothCondition, ToothSurface, Patient } from '../types/dental';
import { AnatomicalToothSVG } from './dental/AnatomicalToothSVG';
import { getToothName, formatToothDisplay } from '../utils/dentalToothUtils';
import { 
  ArrowLeft, Activity, Printer, FileText, Pill, Plus, 
  Check, Save, Stethoscope, AlertTriangle, User, 
  Trash2, ExternalLink, Calendar, ChevronRight, X
} from 'lucide-react';

interface ToothChartProps {
  onBack?: () => void;
  patient?: Patient;
}

interface ProcedureItem {
  id: string;
  toothNumber: number | string;
  surfaces: string;
  procedureName: string;
  code: string;
  state: 'Recorded' | 'Draft';
  price?: number;
}

interface TreatmentPlanItem {
  id: string;
  priority: number;
  procedureName: string;
  toothNumber: number | string;
  sessions: string;
  cost: number;
}

// FDI Quadrants
const ADULT_UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const ADULT_UPPER_LEFT  = [21, 22, 23, 24, 25, 26, 27, 28];
const ADULT_LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
const ADULT_LOWER_LEFT  = [31, 32, 33, 34, 35, 36, 37, 38];

export const ToothChart: React.FC<ToothChartProps> = ({ onBack, patient: propPatient }) => {
  const { 
    selectedPatient: contextPatient, 
    saveVisit, 
    getPatientToothRecords, 
    currentUser, 
    hasPermission,
    getPatientVisits
  } = useDental();
  
  const navigate = useNavigate();
  const currentPatient = propPatient || contextPatient;

  const [numberingSystem, setNumberingSystem] = useState<'FDI' | 'Universal'>('FDI');
  const [selectedTooth, setSelectedTooth] = useState<number>(46);
  const [activeTool, setActiveTool] = useState<ToothCondition>('ROOT_CANAL');
  const [showPatientDetailsModal, setShowPatientDetailsModal] = useState(false);
  const [showAddProcedureModal, setShowAddProcedureModal] = useState(false);
  const [showRxPrintModal, setShowRxPrintModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Local active visit tooth records mapped by toothNumber
  const [records, setRecords] = useState<Record<number, ToothRecord>>(() => {
    if (!currentPatient) return {};
    const existing = getPatientToothRecords(currentPatient.id);
    const map: Record<number, ToothRecord> = {};
    existing.forEach(r => { map[r.toothNumber] = r; });
    // Default initial clinical findings for Dmitri Sokolov (#46)
    if (currentPatient.id === 1 && !map[46]) {
      map[46] = { toothNumber: 46, condition: 'ROOT_CANAL', surfaces: ['O', 'M', 'D'], diagnosedDate: '2026-11-09' };
      map[36] = { toothNumber: 36, condition: 'FILLED', surfaces: ['O', 'M'], diagnosedDate: '2024-03-12' };
    }
    return map;
  });

  // Re-sync when patient changes
  useEffect(() => {
    if (currentPatient) {
      const existing = getPatientToothRecords(currentPatient.id);
      const map: Record<number, ToothRecord> = {};
      existing.forEach(r => { map[r.toothNumber] = r; });
      if (currentPatient.id === 1 && !map[46]) {
        map[46] = { toothNumber: 46, condition: 'ROOT_CANAL', surfaces: ['O', 'M', 'D'], diagnosedDate: '2026-11-09' };
        map[36] = { toothNumber: 36, condition: 'FILLED', surfaces: ['O', 'M'], diagnosedDate: '2024-03-12' };
      }
      setRecords(map);
    }
  }, [currentPatient?.id]);

  // Procedures Table State
  const [procedures, setProcedures] = useState<ProcedureItem[]>([
    { id: 'p1', toothNumber: 46, surfaces: 'O, M, D', procedureName: 'Access opening and pulp extirpation', code: 'ENDO-ACC', state: 'Recorded' },
    { id: 'p2', toothNumber: 46, surfaces: '—', procedureName: 'Working length determination', code: 'ENDO-WL', state: 'Recorded' },
    { id: 'p3', toothNumber: 46, surfaces: '—', procedureName: 'Rubber dam isolation', code: 'ENDO-ISO', state: 'Recorded' },
    { id: 'p4', toothNumber: 46, surfaces: 'M, D', procedureName: 'Canal shaping to F2', code: 'ENDO-SHP', state: 'Draft' },
    { id: 'p5', toothNumber: 46, surfaces: '—', procedureName: 'Irrigation, 3% NaOCl', code: 'ENDO-IRR', state: 'Recorded' },
    { id: 'p6', toothNumber: 46, surfaces: 'O', procedureName: 'Provisional restoration', code: 'REST-PRV', state: 'Draft' }
  ]);

  // SOAP Encounter State
  const [encounterTitle, setEncounterTitle] = useState('Root canal, tooth 46');
  const [chiefComplaint, setChiefComplaint] = useState(
    currentPatient?.notes || 'Sharp pain lower right, cold sensitivity since 3 November.'
  );
  const [examinationFindings, setExaminationFindings] = useState(
    'Deep distal caries on tooth 46 extending to the pulp. Percussion positive, no swelling, no mobility. Marginal gingiva within normal limits.'
  );
  const [diagnosis, setDiagnosis] = useState(
    'Irreversible pulpitis, permanent mandibular right first molar'
  );
  const [diagnosisCode, setDiagnosisCode] = useState('K04.02');
  const [treatmentNotes, setTreatmentNotes] = useState(
    'Access opened, mesial and distal canals located. Working lengths 19 mm mesial, 20 mm distal. Shaped to F2, irrigated with 3% NaOCl. Provisional restoration placed.'
  );
  const [prescriptionText, setPrescriptionText] = useState('Clindamycin 300 mg, 21 capsules');

  // Treatment Plan State
  const [treatmentPlanItems, setTreatmentPlanItems] = useState<TreatmentPlanItem[]>([
    { id: 'tp1', priority: 1, procedureName: 'Root canal treatment', toothNumber: 46, sessions: '1 session', cost: 480 },
    { id: 'tp2', priority: 1, procedureName: 'Core build-up', toothNumber: 46, sessions: '1 session', cost: 180 },
    { id: 'tp3', priority: 2, procedureName: 'Porcelain crown', toothNumber: 46, sessions: '1 session', cost: 1150 },
    { id: 'tp4', priority: 3, procedureName: 'Scaling and polish', toothNumber: '—', sessions: '1 session', cost: 95 }
  ]);

  // New Procedure Form State
  const [newProcForm, setNewProcForm] = useState({
    toothNumber: selectedTooth,
    surfaces: 'O',
    procedureName: 'Composite restoration (1 surface)',
    code: 'D2391',
    state: 'Draft' as const
  });

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/dentist');
    }
  };

  if (!currentPatient) {
    return (
      <div className="operatory-card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
        <Stethoscope size={48} color="#005963" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>No Patient Selected</h3>
        <p style={{ color: '#64748b', marginTop: '0.4rem', fontSize: '0.88rem' }}>
          Select a patient from the Operatory schedule or queue to open clinical charting.
        </p>
        <button className="btn-teal-primary" onClick={handleBack} style={{ marginTop: '1.25rem' }}>
          <ArrowLeft size={16} /> Return to Operatory
        </button>
      </div>
    );
  }

  // Tooth selection & surface toggle
  const handleToothClick = (toothNum: number) => {
    setSelectedTooth(toothNum);
    setNewProcForm(prev => ({ ...prev, toothNumber: toothNum }));
  };

  const toggleSurface = (surface: ToothSurface) => {
    if (!selectedTooth) return;
    setHasUnsavedChanges(true);
    setRecords(prev => {
      const existing = prev[selectedTooth] || {
        toothNumber: selectedTooth,
        condition: activeTool,
        surfaces: [],
        diagnosedDate: new Date().toISOString().slice(0, 10)
      };
      const hasSurface = existing.surfaces.includes(surface);
      const updatedSurfaces = hasSurface
        ? existing.surfaces.filter(s => s !== surface)
        : [...existing.surfaces, surface];

      return {
        ...prev,
        [selectedTooth]: {
          ...existing,
          surfaces: updatedSurfaces
        }
      };
    });
  };

  const handleApplyConditionToSelected = (condition: ToothCondition) => {
    setHasUnsavedChanges(true);
    setActiveTool(condition);
    setRecords(prev => {
      const existing = prev[selectedTooth];
      return {
        ...prev,
        [selectedTooth]: {
          toothNumber: selectedTooth,
          condition,
          surfaces: existing?.surfaces || ['O'],
          diagnosedDate: new Date().toISOString().slice(0, 10)
        }
      };
    });
  };

  const handleAddProcedure = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `p${Date.now()}`;
    const newProc: ProcedureItem = {
      id: newId,
      toothNumber: newProcForm.toothNumber,
      surfaces: newProcForm.surfaces,
      procedureName: newProcForm.procedureName,
      code: newProcForm.code,
      state: newProcForm.state
    };
    setProcedures(prev => [...prev, newProc]);
    setShowAddProcedureModal(false);
    setHasUnsavedChanges(true);
  };

  const handleDeleteProcedure = (id: string) => {
    setProcedures(prev => prev.filter(p => p.id !== id));
    setHasUnsavedChanges(true);
  };

  const handleSaveEncounter = () => {
    const toothRecordsArray = Object.values(records);
    saveVisit({
      patientId: currentPatient.id,
      dentistId: currentUser.id,
      visitDatetime: new Date().toISOString(),
      chiefComplaint,
      clinicalNotes: `EXAMINATION FINDINGS: ${examinationFindings}\nDIAGNOSIS: ${diagnosis} (${diagnosisCode})\nTREATMENT NOTES: ${treatmentNotes}`,
      diagnosis: `${diagnosis} (${diagnosisCode})`,
      treatmentPlan: treatmentPlanItems.map(i => `${i.procedureName} (#${i.toothNumber}) - $${i.cost}`).join('\n'),
      prescriptions: prescriptionText,
      toothRecords: toothRecordsArray,
      createdBy: currentUser.id
    });

    setSaveSuccess(true);
    setHasUnsavedChanges(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const currentToothRecord = records[selectedTooth];
  const totalEstimatedCost = treatmentPlanItems.reduce((acc, item) => acc + item.cost, 0);

  const calculateAge = (dobString: string) => {
    try {
      const birth = new Date(dobString);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
      return age > 0 ? age : 0;
    } catch {
      return 35;
    }
  };

  const age = calculateAge(currentPatient.dob);

  return (
    <div style={{ maxWidth: 1380, margin: '0 auto' }}>
      {/* Top Header Row with Back Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid #e2e8f0',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handleBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 34,
              height: 34,
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              cursor: 'pointer',
              color: '#334155',
              transition: 'all 0.15s ease'
            }}
            title="Return to Operatory"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Patient record
            </h1>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Monday, 9 November 2026 • Operatory Bay 1
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            className="btn-outline-pill"
            onClick={() => setShowPatientDetailsModal(true)}
          >
            <User size={15} color="#005963" />
            <span>Patient details</span>
          </button>
        </div>
      </div>

      {/* Patient Header Card (Demographics & Medical Alerts) */}
      <div className="operatory-card" style={{ marginBottom: '1.25rem', padding: '1.15rem 1.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
                {currentPatient.firstName} {currentPatient.lastName}
              </h2>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
              {currentPatient.patientCode} • DOB {currentPatient.dob} ({age} y) • {currentPatient.gender} • Phone: {currentPatient.phone}
            </div>
          </div>

          {/* Prominent Allergy & Medical Alert Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {currentPatient.medicalAlerts && currentPatient.medicalAlerts.length > 0 ? (
              currentPatient.medicalAlerts.map((alertText, idx) => {
                const isAllergy = alertText.toLowerCase().includes('allergy') || alertText.toLowerCase().includes('penicillin');
                return (
                  <span
                    key={idx}
                    className={`alert-tag-pill ${isAllergy ? 'allergy' : 'neutral'}`}
                  >
                    {alertText.toUpperCase()}
                  </span>
                );
              })
            ) : (
              <span className="alert-tag-pill neutral">NO KNOWN DRUG ALLERGIES</span>
            )}
          </div>
        </div>

        {/* Live Encounter State Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '1rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #f1f3ee',
          fontSize: '0.78rem',
          color: '#475569'
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 8px',
            borderRadius: 6,
            background: '#e6f3f4',
            color: '#005963',
            fontWeight: 800,
            fontSize: '0.72rem'
          }}>
            ■ IN OPERATORY
          </span>
          <span>Visit 9 Nov 2026, started 11:22</span>
          <span>•</span>
          <span>Practitioner: <strong>{currentUser.fullName}</strong></span>
          <span>•</span>
          <span>Chair: <strong>{currentUser.assignedChair || 'Chair 1 (Main Operatory)'}</strong></span>
        </div>
      </div>

      {/* 2-Column Main Clinical Grid */}
      <div className="chart-view-grid">
        
        {/* ================= LEFT COLUMN: DENTAL CHART & PROCEDURES ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Dental Chart Container */}
          <div className="operatory-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} color="#005963" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Dental chart
                </h3>
              </div>

              {/* FDI / Universal System Toggle */}
              <div style={{
                display: 'inline-flex',
                background: '#f1f5f9',
                borderRadius: 8,
                padding: '2px',
                border: '1px solid #e2e8f0'
              }}>
                <button
                  onClick={() => setNumberingSystem('FDI')}
                  style={{
                    padding: '3px 10px',
                    borderRadius: 6,
                    border: 'none',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: numberingSystem === 'FDI' ? '#0f172a' : 'transparent',
                    color: numberingSystem === 'FDI' ? '#ffffff' : '#64748b'
                  }}
                >
                  FDI
                </button>
                <button
                  onClick={() => setNumberingSystem('Universal')}
                  style={{
                    padding: '3px 10px',
                    borderRadius: 6,
                    border: 'none',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: numberingSystem === 'Universal' ? '#0f172a' : 'transparent',
                    color: numberingSystem === 'Universal' ? '#ffffff' : '#64748b'
                  }}
                >
                  Universal
                </button>
              </div>
            </div>

            {/* Anatomical Odontogram Arch */}
            <div className="odontogram-arch-container">
              {/* Maxillary Upper Arch (18-11 | 21-28) */}
              <div className="arch-teeth-row">
                <div className="arch-quadrant-group">
                  {ADULT_UPPER_RIGHT.map(num => (
                    <AnatomicalToothSVG
                      key={num}
                      toothNumber={num}
                      condition={records[num]?.condition || 'HEALTHY'}
                      surfaces={records[num]?.surfaces || []}
                      isSelected={selectedTooth === num}
                      isFocused={num === 47}
                      onClick={() => handleToothClick(num)}
                    />
                  ))}
                </div>
                <div className="arch-divider" />
                <div className="arch-quadrant-group">
                  {ADULT_UPPER_LEFT.map(num => (
                    <AnatomicalToothSVG
                      key={num}
                      toothNumber={num}
                      condition={records[num]?.condition || 'HEALTHY'}
                      surfaces={records[num]?.surfaces || []}
                      isSelected={selectedTooth === num}
                      onClick={() => handleToothClick(num)}
                    />
                  ))}
                </div>
              </div>

              {/* Mandibular Lower Arch (48-41 | 31-38) */}
              <div className="arch-teeth-row">
                <div className="arch-quadrant-group">
                  {ADULT_LOWER_RIGHT.map(num => (
                    <AnatomicalToothSVG
                      key={num}
                      toothNumber={num}
                      condition={records[num]?.condition || 'HEALTHY'}
                      surfaces={records[num]?.surfaces || []}
                      isSelected={selectedTooth === num}
                      isFocused={num === 47}
                      onClick={() => handleToothClick(num)}
                    />
                  ))}
                </div>
                <div className="arch-divider" />
                <div className="arch-quadrant-group">
                  {ADULT_LOWER_LEFT.map(num => (
                    <AnatomicalToothSVG
                      key={num}
                      toothNumber={num}
                      condition={records[num]?.condition || 'HEALTHY'}
                      surfaces={records[num]?.surfaces || []}
                      isSelected={selectedTooth === num}
                      onClick={() => handleToothClick(num)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Tooth Detail Bar */}
            <div className="selected-tooth-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="tooth-badge-large">
                  {formatToothDisplay(selectedTooth, numberingSystem)}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                    {getToothName(selectedTooth)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {currentToothRecord?.diagnosedDate || '12 Mar 2024'} • {currentToothRecord?.condition ? currentToothRecord.condition.replace('_', ' ') : 'Composite, MOD'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Surface Buttons (M, D, O, B, L) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Surfaces</span>
                  {(['M', 'D', 'O', 'B', 'L'] as ToothSurface[]).map(s => {
                    const isActive = currentToothRecord?.surfaces?.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => toggleSurface(s)}
                        className={`surface-toggle-btn ${isActive ? 'active' : ''}`}
                        title={`Surface ${s}`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>

                <button
                  className="btn-teal-primary"
                  onClick={() => setShowAddProcedureModal(true)}
                  style={{ padding: '0.5rem 0.95rem', fontSize: '0.8rem' }}
                >
                  <Plus size={14} />
                  <span>Record procedure</span>
                </button>
              </div>
            </div>

            {/* Quick Condition Stamper Palette */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              flexWrap: 'wrap',
              padding: '0.65rem 0.75rem',
              background: '#f8fafc',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              fontSize: '0.72rem'
            }}>
              <span style={{ fontWeight: 700, color: '#475569', marginRight: '4px' }}>Stamp:</span>
              <button
                onClick={() => handleApplyConditionToSelected('CARIES')}
                style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid #f87171', background: '#fee2e2', color: '#b91c1c', fontWeight: 600, cursor: 'pointer' }}
              >
                Caries (Decay)
              </button>
              <button
                onClick={() => handleApplyConditionToSelected('ROOT_CANAL')}
                style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid #c084fc', background: '#f3e8ff', color: '#7e22ce', fontWeight: 600, cursor: 'pointer' }}
              >
                Root Canal
              </button>
              <button
                onClick={() => handleApplyConditionToSelected('FILLED')}
                style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid #7dd3fc', background: '#e0f2fe', color: '#0369a1', fontWeight: 600, cursor: 'pointer' }}
              >
                Composite
              </button>
              <button
                onClick={() => handleApplyConditionToSelected('CROWN')}
                style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid #fcd34d', background: '#fef3c7', color: '#b45309', fontWeight: 600, cursor: 'pointer' }}
              >
                Crown
              </button>
              <button
                onClick={() => handleApplyConditionToSelected('EXTRACTION_NEEDED')}
                style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid #fda4af', background: '#fff1f2', color: '#be123c', fontWeight: 600, cursor: 'pointer' }}
              >
                Extract
              </button>
              <button
                onClick={() => handleApplyConditionToSelected('IMPLANT')}
                style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid #6ee7b7', background: '#ecfdf5', color: '#047857', fontWeight: 600, cursor: 'pointer' }}
              >
                Implant
              </button>
              <button
                onClick={() => handleApplyConditionToSelected('HEALTHY')}
                style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
              >
                Sound
              </button>
            </div>
          </div>

          {/* Procedures This Visit Table */}
          <div className="operatory-card">
            <div className="procedures-header-row">
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Procedures, visit 9 Nov
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                {procedures.length} recorded
              </span>
            </div>

            <table className="procedures-table">
              <thead>
                <tr>
                  <th style={{ width: 44 }}>Tooth</th>
                  <th style={{ width: 68 }}>Surfaces</th>
                  <th>Procedure</th>
                  <th style={{ width: 85 }}>Code</th>
                  <th style={{ width: 80 }}>State</th>
                  <th style={{ width: 32 }}></th>
                </tr>
              </thead>
              <tbody>
                {procedures.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{p.toothNumber}</td>
                    <td style={{ color: '#64748b' }}>{p.surfaces}</td>
                    <td style={{ fontWeight: 600 }}>{p.procedureName}</td>
                    <td style={{ fontFamily: 'monospace', color: '#64748b', fontSize: '0.75rem' }}>{p.code}</td>
                    <td>
                      <span className={`state-badge ${p.state.toLowerCase()}`}>
                        {p.state}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteProcedure(p.id)}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
                        title="Remove procedure"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: ENCOUNTER SOAP & TREATMENT PLAN ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Encounter (SOAP) Card */}
          <div className="operatory-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} color="#005963" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Encounter
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {encounterTitle}
              </span>
            </div>

            <div className="soap-box">
              {/* Chief Complaint */}
              <div>
                <label className="soap-field-title">Chief complaint</label>
                <textarea
                  className="soap-text-input"
                  rows={2}
                  value={chiefComplaint}
                  onChange={(e) => { setChiefComplaint(e.target.value); setHasUnsavedChanges(true); }}
                />
              </div>

              {/* Examination Findings (Objective) */}
              <div>
                <label className="soap-field-title">Examination findings</label>
                <textarea
                  className="soap-text-input"
                  rows={3}
                  value={examinationFindings}
                  onChange={(e) => { setExaminationFindings(e.target.value); setHasUnsavedChanges(true); }}
                />
              </div>

              {/* Diagnosis (Assessment) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label className="soap-field-title" style={{ margin: 0 }}>Diagnosis</label>
                  <span style={{ fontSize: '0.7rem', background: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace' }}>
                    {diagnosisCode}
                  </span>
                </div>
                <input
                  type="text"
                  className="soap-text-input"
                  value={diagnosis}
                  onChange={(e) => { setDiagnosis(e.target.value); setHasUnsavedChanges(true); }}
                />
              </div>

              {/* Treatment Notes (Plan) */}
              <div>
                <label className="soap-field-title">Treatment notes</label>
                <textarea
                  className="soap-text-input"
                  rows={4}
                  value={treatmentNotes}
                  onChange={(e) => { setTreatmentNotes(e.target.value); setHasUnsavedChanges(true); }}
                />
              </div>

              {/* Prescription preview */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                background: '#fafbfa',
                border: '1px solid #e2e8f0',
                borderRadius: 8
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <Pill size={15} color="#005963" />
                  <span style={{ fontWeight: 600 }}>Rx Prescription:</span>
                  <span style={{ color: '#475569' }}>{prescriptionText}</span>
                </div>
                <button
                  onClick={() => setShowRxPrintModal(true)}
                  style={{
                    padding: '3px 9px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Review
                </button>
              </div>

              {/* Save Draft / Review Visit Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '0.5rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid #f1f3ee'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem' }}>
                  {hasUnsavedChanges ? (
                    <span style={{ color: '#d97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                      Unsaved changes
                    </span>
                  ) : saveSuccess ? (
                    <span style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Check size={14} /> Encounter saved to DB
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>All changes saved</span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn-outline-pill"
                    onClick={() => { setHasUnsavedChanges(false); setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 2000); }}
                    style={{ padding: '0.45rem 0.95rem', fontSize: '0.78rem' }}
                  >
                    Save draft
                  </button>
                  <button
                    className="btn-teal-primary"
                    onClick={handleSaveEncounter}
                    style={{ padding: '0.45rem 1.15rem', fontSize: '0.78rem' }}
                  >
                    <Save size={14} /> Review visit
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Treatment Plan Card */}
          <div className="operatory-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Treatment plan
              </h3>
              <button
                onClick={() => window.print()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Printer size={13} /> Print plan
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {treatmentPlanItems.map(item => (
                <div key={item.id} className="plan-item-row">
                  <span style={{ color: '#94a3b8', fontWeight: 700 }}>{item.priority}</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{item.procedureName}</span>
                  <span style={{ color: '#64748b', textAlign: 'center' }}>{item.toothNumber}</span>
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{item.sessions}</span>
                  <span style={{ fontWeight: 700, color: '#0f172a', textAlign: 'right' }}>
                    ${item.cost.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Treatment Plan Footer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '0.85rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid #f1f3ee',
              fontSize: '0.82rem'
            }}>
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                Phase 1 of treatment plan • <span style={{ color: '#005963', cursor: 'pointer', fontWeight: 600 }}>+ Add note</span>
              </span>
              <span style={{ fontWeight: 800, color: '#0f172a' }}>
                Estimated total: ${totalEstimatedCost.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. Patient Details Modal */}
      {showPatientDetailsModal && (
        <div className="modal-overlay" onClick={() => setShowPatientDetailsModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Patient Demographic File
              </h3>
              <button
                onClick={() => setShowPatientDetailsModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Full Name</span>
                <strong>{currentPatient.firstName} {currentPatient.lastName}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Patient ID</span>
                <strong>{currentPatient.patientCode}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Date of Birth</span>
                <span>{currentPatient.dob} ({age} years)</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Gender</span>
                <span>{currentPatient.gender}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Phone</span>
                <span>{currentPatient.phone}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Email</span>
                <span>{currentPatient.email || 'None on file'}</span>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Address</span>
                <span>{currentPatient.address || 'Local Resident'}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Emergency Contact</span>
                <span>{currentPatient.emergencyContactName || 'None'}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Emergency Phone</span>
                <span>{currentPatient.emergencyContactPhone || 'None'}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Insurance Carrier</span>
                <span>{currentPatient.insuranceCarrier || 'Self-Pay (Uninsured)'}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Policy Number</span>
                <span>{currentPatient.insurancePolicyNumber || '—'}</span>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-teal-primary" onClick={() => setShowPatientDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Record Procedure Modal */}
      {showAddProcedureModal && (
        <div className="modal-overlay" onClick={() => setShowAddProcedureModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Record Clinical Procedure
              </h3>
              <button
                onClick={() => setShowAddProcedureModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProcedure} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Tooth Number
                  </label>
                  <input
                    type="number"
                    value={newProcForm.toothNumber}
                    onChange={e => setNewProcForm({ ...newProcForm, toothNumber: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Surfaces
                  </label>
                  <input
                    type="text"
                    value={newProcForm.surfaces}
                    onChange={e => setNewProcForm({ ...newProcForm, surfaces: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Procedure Description
                </label>
                <select
                  value={newProcForm.procedureName}
                  onChange={e => {
                    const val = e.target.value;
                    let code = 'D2391';
                    if (val.includes('Root canal') || val.includes('Access')) code = 'ENDO-ACC';
                    if (val.includes('Rubber dam')) code = 'ENDO-ISO';
                    if (val.includes('Canal shaping')) code = 'ENDO-SHP';
                    if (val.includes('Irrigation')) code = 'ENDO-IRR';
                    if (val.includes('Provisional')) code = 'REST-PRV';
                    if (val.includes('Crown')) code = 'D2740';
                    setNewProcForm({ ...newProcForm, procedureName: val, code });
                  }}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                >
                  <option value="Access opening and pulp extirpation">Access opening and pulp extirpation (ENDO-ACC)</option>
                  <option value="Canal shaping to F2">Canal shaping to F2 (ENDO-SHP)</option>
                  <option value="Rubber dam isolation">Rubber dam isolation (ENDO-ISO)</option>
                  <option value="Working length determination">Working length determination (ENDO-WL)</option>
                  <option value="Irrigation, 3% NaOCl">Irrigation, 3% NaOCl (ENDO-IRR)</option>
                  <option value="Provisional restoration">Provisional restoration (REST-PRV)</option>
                  <option value="Composite restoration (1 surface)">Composite restoration (1 surface) (D2391)</option>
                  <option value="Full ceramic crown prep">Full ceramic crown prep (D2740)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Procedure Code
                  </label>
                  <input
                    type="text"
                    value={newProcForm.code}
                    onChange={e => setNewProcForm({ ...newProcForm, code: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Encounter State
                  </label>
                  <select
                    value={newProcForm.state}
                    onChange={e => setNewProcForm({ ...newProcForm, state: e.target.value as any })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Recorded">Recorded</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn-outline-pill"
                  onClick={() => setShowAddProcedureModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-teal-primary">
                  Add Procedure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Official Printable Prescription Modal */}
      {showRxPrintModal && (
        <div className="modal-overlay" onClick={() => setShowRxPrintModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #005963', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#005963', margin: 0 }}>
                DentalDesk Practice Clinic
              </h2>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                Operatory Bay 1 • Air-Gapped Clinical Diagnostic Network
              </div>
              <div style={{ fontSize: '0.78rem', color: '#0f172a', fontWeight: 700, marginTop: 4 }}>
                Prescriber: {currentUser.fullName} • Board Reg: #{currentUser.licenseNumber || 'DDS-2019-8842'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
              <div>
                <strong>Patient:</strong> {currentPatient.firstName} {currentPatient.lastName} ({currentPatient.patientCode})
              </div>
              <div>
                <strong>Date:</strong> {new Date().toLocaleDateString()}
              </div>
            </div>

            {/* Red Alert warning if penicillin allergic */}
            {currentPatient.medicalAlerts.some(a => a.toLowerCase().includes('penicillin')) && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #f87171',
                padding: '6px 10px',
                borderRadius: 6,
                fontSize: '0.75rem',
                color: '#b91c1c',
                fontWeight: 700,
                marginBottom: '1rem'
              }}>
                ⚠ PATIENT HAS DOCUMENTED PENICILLIN ANAPHYLAXIS ALERT — PRESCRIBED LINCOSAMIDE (CLINDAMYCIN)
              </div>
            )}

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#005963', marginBottom: '0.4rem' }}>
                ℞ {prescriptionText}
              </div>
              <div style={{ fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                <strong>Sig:</strong> 1 capsule orally every 8 hours (TID) with full glass of water
              </div>
              <div style={{ fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                <strong>Duration:</strong> 7 days (complete full course)
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                <strong>Warnings:</strong> Do not skip doses. Report persistent diarrhea immediately.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.5rem' }}>
              <div style={{ borderTop: '1px solid #94a3b8', width: 170, textAlign: 'center', paddingTop: 4, fontSize: '0.75rem' }}>
                Doctor Signature
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn-outline-pill" onClick={() => setShowRxPrintModal(false)}>Close</button>
                <button className="btn-teal-primary" onClick={() => window.print()}>Print Prescription</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
