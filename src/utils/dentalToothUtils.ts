// Standard FDI (ISO 3950) to Universal Numbering System & Anatomical Names

export const TOOTH_NAMES: Record<number, string> = {
  // Maxillary Right (Upper Right Quadrant 1)
  18: 'Maxillary right third molar',
  17: 'Maxillary right second molar',
  16: 'Maxillary right first molar',
  15: 'Maxillary right second premolar',
  14: 'Maxillary right first premolar',
  13: 'Maxillary right canine',
  12: 'Maxillary right lateral incisor',
  11: 'Maxillary right central incisor',

  // Maxillary Left (Upper Left Quadrant 2)
  21: 'Maxillary left central incisor',
  22: 'Maxillary left lateral incisor',
  23: 'Maxillary left canine',
  24: 'Maxillary left first premolar',
  25: 'Maxillary left second premolar',
  26: 'Maxillary left first molar',
  27: 'Maxillary left second molar',
  28: 'Maxillary left third molar',

  // Mandibular Left (Lower Left Quadrant 3)
  31: 'Mandibular left central incisor',
  32: 'Mandibular left lateral incisor',
  33: 'Mandibular left canine',
  34: 'Mandibular left first premolar',
  35: 'Mandibular left second premolar',
  36: 'Mandibular left first molar',
  37: 'Mandibular left second molar',
  38: 'Mandibular left third molar',

  // Mandibular Right (Lower Right Quadrant 4)
  41: 'Mandibular right central incisor',
  42: 'Mandibular right lateral incisor',
  43: 'Mandibular right canine',
  44: 'Mandibular right first premolar',
  45: 'Mandibular right second premolar',
  46: 'Mandibular right first molar',
  47: 'Mandibular right second molar',
  48: 'Mandibular right third molar'
};

export const FDI_TO_UNIVERSAL: Record<number, number> = {
  18: 1, 17: 2, 16: 3, 15: 4, 14: 5, 13: 6, 12: 7, 11: 8,
  21: 9, 22: 10, 23: 11, 24: 12, 25: 13, 26: 14, 27: 15, 28: 16,
  38: 17, 37: 18, 36: 19, 35: 20, 34: 21, 33: 22, 32: 23, 31: 24,
  41: 25, 42: 26, 43: 27, 44: 28, 45: 29, 46: 30, 47: 31, 48: 32
};

export function getToothName(fdiNumber: number): string {
  return TOOTH_NAMES[fdiNumber] || `Tooth #${fdiNumber}`;
}

export function formatToothDisplay(fdiNumber: number, system: 'FDI' | 'Universal'): string | number {
  if (system === 'Universal') {
    return FDI_TO_UNIVERSAL[fdiNumber] || fdiNumber;
  }
  return fdiNumber;
}
