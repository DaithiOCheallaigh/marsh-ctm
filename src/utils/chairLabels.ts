// Chair label utilities for role assignments

export const CHAIR_LABELS = [
  'Primary Chair',
  'Secondary Chair', 
  'Tertiary Chair',
  'Chair 4',
  'Chair 5',
  'Chair 6',
  'Chair 7',
  'Chair 8',
  'Chair 9',
  'Chair 10',
] as const;

export const MAX_CHAIRS = 10;

export interface ChairConfig {
  id: number;
  label: string;
  required: boolean;
}

/**
 * Generate all chair configurations (up to 10 chairs)
 * Only the Primary Chair is required, all others are optional
 */
export const generateChairConfigs = (): ChairConfig[] => {
  return CHAIR_LABELS.map((label, index) => ({
    id: index + 1,
    label,
    required: index === 0, // Only Primary Chair is required
  }));
};

/**
 * Check if a chair is required (only Primary Chair)
 */
export const isChairRequired = (chairIndex: number): boolean => {
  return chairIndex === 0;
};

/**
 * Get the label for a chair by index
 */
export const getChairLabel = (chairIndex: number): string => {
  return CHAIR_LABELS[chairIndex] || `Chair ${chairIndex + 1}`;
};
