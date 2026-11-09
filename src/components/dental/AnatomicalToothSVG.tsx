import React from 'react';
import { ToothCondition, ToothSurface } from '../../types/dental';

interface AnatomicalToothSVGProps {
  toothNumber: number; // FDI 11-48
  condition?: ToothCondition;
  surfaces?: ToothSurface[];
  isSelected?: boolean;
  isFocused?: boolean;
  onClick?: () => void;
  width?: number;
  height?: number;
}

export const AnatomicalToothSVG: React.FC<AnatomicalToothSVGProps> = ({
  toothNumber,
  condition = 'HEALTHY',
  surfaces = [],
  isSelected = false,
  isFocused = false,
  onClick,
  width = 30,
  height = 48
}) => {
  // Determine if upper or lower arch
  const isUpper = toothNumber < 30; // 11-28 is Maxillary, 31-48 is Mandibular
  const isMolar = [18, 17, 16, 26, 27, 28, 48, 47, 46, 36, 37, 38].includes(toothNumber);
  const isPremolar = [15, 14, 24, 25, 45, 44, 34, 35].includes(toothNumber);
  const isCanine = [13, 23, 43, 33].includes(toothNumber);
  const isIncisor = [12, 11, 21, 22, 42, 41, 31, 32].includes(toothNumber);

  // Condition color mapping
  const getConditionStyle = () => {
    switch (condition) {
      case 'CARIES':
        return { fill: '#fee2e2', stroke: '#ef4444', accent: '#ef4444' };
      case 'FILLED':
        return { fill: '#e0f2fe', stroke: '#0284c7', accent: '#0284c7' };
      case 'CROWN':
        return { fill: '#fef3c7', stroke: '#d97706', accent: '#d97706' };
      case 'ROOT_CANAL':
        return { fill: '#f3e8ff', stroke: '#7e22ce', accent: '#7e22ce' };
      case 'IMPLANT':
        return { fill: '#ecfdf5', stroke: '#059669', accent: '#059669' };
      case 'EXTRACTION_NEEDED':
        return { fill: '#fff1f2', stroke: '#e11d48', accent: '#e11d48' };
      case 'MISSING':
        return { fill: '#f1f5f9', stroke: '#94a3b8', accent: '#64748b' };
      default:
        // Healthy: Clean medical bone-white
        return { fill: '#ffffff', stroke: '#334155', accent: '#334155' };
    }
  };

  const style = getConditionStyle();

  // If selected, apply teal highlight fill
  const effectiveFill = isSelected ? '#d5f0f2' : style.fill;
  const effectiveStroke = isSelected ? '#005963' : style.stroke;
  const effectiveStrokeWidth = isSelected ? 2.2 : (isFocused ? 1.8 : 1.4);

  // Render SVG paths based on tooth anatomy
  const renderToothPath = () => {
    if (isUpper) {
      // UPPER (MAXILLARY) - Roots point UPWARDS (Y: 2 to 24), Crown points DOWNWARDS (Y: 24 to 44)
      if (isMolar) {
        // Multi-rooted upper molar
        return (
          <g>
            {/* 3 roots pointing upward */}
            <path
              d="M 6 22 C 5 12, 6 4, 9 3 C 11 3, 11 12, 13 20 C 14 10, 16 3, 18 3 C 20 3, 21 11, 23 20 C 24 12, 26 5, 28 5 C 29 7, 28 15, 27 22 Z"
              fill={effectiveFill}
              stroke={effectiveStroke}
              strokeWidth={effectiveStrokeWidth}
              strokeDasharray={isFocused ? '3,2' : 'none'}
            />
            {/* Crown with occlusal cusps pointing downward */}
            <path
              d="M 5 22 C 3 24, 3 36, 6 40 C 9 44, 13 44, 17 44 C 21 44, 25 44, 28 40 C 31 36, 31 24, 29 22 Z"
              fill={effectiveFill}
              stroke={effectiveStroke}
              strokeWidth={effectiveStrokeWidth}
              strokeDasharray={isFocused ? '3,2' : 'none'}
            />
            {/* Occlusal fissure line */}
            <path d="M 10 32 Q 17 35 24 32" stroke={effectiveStroke} strokeWidth="1" fill="none" opacity="0.6" />
          </g>
        );
      } else if (isPremolar) {
        // 2 roots upper premolar
        return (
          <g>
            <path
              d="M 8 22 C 7 12, 9 4, 12 3 C 14 3, 15 12, 16 20 C 17 12, 19 4, 21 3 C 23 4, 24 13, 23 22 Z"
              fill={effectiveFill}
              stroke={effectiveStroke}
              strokeWidth={effectiveStrokeWidth}
              strokeDasharray={isFocused ? '3,2' : 'none'}
            />
            <path
              d="M 7 22 C 5 25, 5 36, 8 41 C 11 44, 15 44, 17 44 C 20 44, 23 44, 26 41 C 29 36, 29 25, 27 22 Z"
              fill={effectiveFill}
              stroke={effectiveStroke}
              strokeWidth={effectiveStrokeWidth}
              strokeDasharray={isFocused ? '3,2' : 'none'}
            />
            <path d="M 12 32 Q 17 34 22 32" stroke={effectiveStroke} strokeWidth="1" fill="none" opacity="0.6" />
          </g>
        );
      } else if (isCanine) {
        // Upper canine - long root, pointed cusp
        return (
          <g>
            <path
              d="M 10 22 C 9 13, 11 3, 17 2 C 22 3, 24 13, 23 22 Z"
              fill={effectiveFill}
              stroke={effectiveStroke}
              strokeWidth={effectiveStrokeWidth}
              strokeDasharray={isFocused ? '3,2' : 'none'}
            />
            <path
              d="M 8 22 C 6 26, 8 38, 12 42 C 15 45, 17 46, 17 46 C 17 46, 19 45, 22 42 C 26 38, 28 26, 26 22 Z"
              fill={effectiveFill}
              stroke={effectiveStroke}
              strokeWidth={effectiveStrokeWidth}
              strokeDasharray={isFocused ? '3,2' : 'none'}
            />
          </g>
        );
      } else {
        // Upper Incisor - flat chisel edge
        return (
          <g>
            <path
              d="M 11 22 C 10 13, 12 3, 17 2 C 21 3, 23 13, 22 22 Z"
              fill={effectiveFill}
              stroke={effectiveStroke}
              strokeWidth={effectiveStrokeWidth}
              strokeDasharray={isFocused ? '3,2' : 'none'}
            />
            <path
              d="M 9 22 C 7 26, 8 38, 9 42 C 10 44, 23 44, 24 42 C 25 38, 26 26, 24 22 Z"
              fill={effectiveFill}
              stroke={effectiveStroke}
              strokeWidth={effectiveStrokeWidth}
              strokeDasharray={isFocused ? '3,2' : 'none'}
            />
          </g>
        );
      }
    } else {
      // LOWER (MANDIBULAR) - Crown is at TOP (Y: 4 to 24), Roots point DOWNWARDS (Y: 24 to 45)
      if (isMolar) {
        // Lower molar - 2 distinct roots pointing downward
        return (
          <g>
            {/* Crown at top */}
            <path
              d="M 5 24 C 3 22, 3 10, 6 6 C 9 2, 13 2, 17 2 C 21 2, 25 2, 28 6 C 31 10, 31 22, 29 24 Z"
              fill={effectiveFill}
              stroke={effectiveStroke}
              strokeWidth={effectiveStrokeWidth}
              strokeDasharray={isFocused ? '3,2' : 'none'}
            />
            {/* Occlusal fissure */}
            <path d="M 10 14 Q 17 11 24 14" stroke={effectiveStroke} strokeWidth="1" fill="none" opacity="0.6" />
            {/* 2 roots pointing down */}
            <path
              d="M 7 24 C 6 34, 7 42, 10 45 C 13 45, 14 36, 17 28 C 19 36, 20 45, 23 45 C 26 42, 27 34, 26 24 Z"
              fill={effectiveFill}
              stroke={effectiveStroke}
              strokeWidth={effectiveStrokeWidth}
              strokeDasharray={isFocused ? '3,2' : 'none'}
            />
          </g>
        );
      } else if (isPremolar) {
        // Lower premolar
        return (
          <g>
            <path
              d="M 7 24 C 5 21, 5 10, 8 5 C 11 2, 15 2, 17 2 C 20 2, 23 2, 26 5 C 29 10, 29 21, 27 24 Z"
              fill={effectiveFill}
              stroke={effectiveStroke}
              strokeWidth={effectiveStrokeWidth}
              strokeDasharray={isFocused ? '3,2' : 'none'}
            />
            <path d="M 11 14 Q 17 12 22 14" stroke={effectiveStroke} strokeWidth="1" fill="none" opacity="0.6" />
            <path
              d="M 10 24 C 9 33, 11 44, 16 45 C 20 44, 22 33, 22 24 Z"
              fill={effectiveFill}
              stroke={effectiveStroke}
              strokeWidth={effectiveStrokeWidth}
              strokeDasharray={isFocused ? '3,2' : 'none'}
            />
          </g>
        );
      } else if (isCanine) {
        // Lower canine
        return (
          <g>
            <path
              d="M 8 24 C 6 20, 8 8, 12 4 C 15 1, 17 0, 17 0 C 17 0, 19 1, 22 4 C 26 8, 28 20, 26 24 Z"
              fill={effectiveFill}
              stroke={effectiveStroke}
              strokeWidth={effectiveStrokeWidth}
              strokeDasharray={isFocused ? '3,2' : 'none'}
            />
            <path
              d="M 10 24 C 9 33, 11 44, 17 46 C 22 44, 24 33, 23 24 Z"
              fill={effectiveFill}
              stroke={effectiveStroke}
              strokeWidth={effectiveStrokeWidth}
              strokeDasharray={isFocused ? '3,2' : 'none'}
            />
          </g>
        );
      } else {
        // Lower incisor - slender
        return (
          <g>
            <path
              d="M 9 24 C 7 20, 8 8, 10 4 C 11 2, 22 2, 23 4 C 25 8, 26 20, 24 24 Z"
              fill={effectiveFill}
              stroke={effectiveStroke}
              strokeWidth={effectiveStrokeWidth}
              strokeDasharray={isFocused ? '3,2' : 'none'}
            />
            <path
              d="M 11 24 C 11 33, 13 44, 17 46 C 20 44, 21 33, 21 24 Z"
              fill={effectiveFill}
              stroke={effectiveStroke}
              strokeWidth={effectiveStrokeWidth}
              strokeDasharray={isFocused ? '3,2' : 'none'}
            />
          </g>
        );
      }
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '3px 2px',
        borderRadius: '8px',
        cursor: 'pointer',
        background: isSelected ? '#e6f3f4' : 'transparent',
        transition: 'all 0.15s ease',
        userSelect: 'none'
      }}
      title={`Tooth #${toothNumber} (${condition})`}
    >
      <span
        style={{
          fontSize: '0.68rem',
          fontWeight: 700,
          color: isSelected ? '#005963' : '#475569',
          marginBottom: '2px'
        }}
      >
        {toothNumber}
      </span>

      <svg
        width={width}
        height={height}
        viewBox="0 0 34 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: isSelected ? 'drop-shadow(0 2px 4px rgba(0,89,99,0.25))' : 'none'
        }}
      >
        {renderToothPath()}

        {/* Condition Overlays */}
        {condition === 'ROOT_CANAL' && (
          <path
            d={isUpper ? "M 17 6 L 17 38" : "M 17 10 L 17 42"}
            stroke="#7e22ce"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}

        {condition === 'IMPLANT' && (
          <g>
            <rect x="13" y="10" width="8" height="26" rx="2" fill="#059669" />
            <line x1="11" y1="14" x2="23" y2="14" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="11" y1="20" x2="23" y2="20" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="11" y1="26" x2="23" y2="26" stroke="#ffffff" strokeWidth="1.5" />
          </g>
        )}

        {condition === 'EXTRACTION_NEEDED' && (
          <g stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round">
            <line x1="7" y1="12" x2="27" y2="36" />
            <line x1="27" y1="12" x2="7" y2="36" />
          </g>
        )}

        {condition === 'MISSING' && (
          <line
            x1="5"
            y1="40"
            x2="29"
            y2="8"
            stroke="#64748b"
            strokeWidth="2"
            strokeDasharray="4,2"
          />
        )}

        {/* Surface markers if present */}
        {surfaces.length > 0 && condition !== 'MISSING' && (
          <g>
            <rect
              x="10"
              y={isUpper ? 28 : 8}
              width="14"
              height="10"
              rx="2"
              fill="rgba(0, 89, 99, 0.85)"
            />
            <text
              x="17"
              y={isUpper ? 36 : 16}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="7"
              fontWeight="800"
              fontFamily="sans-serif"
            >
              {surfaces.slice(0, 2).join('')}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
