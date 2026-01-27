// Types for chair selection UI concepts

export type ChairType = 'primary' | 'secondary' | 'specialty';

export interface Chair {
  id: string;
  name: string;
  description: string;
  type: ChairType;
  isRequired: boolean;
  assignedTo?: string; // Name of person currently assigned, if any
}

export interface ChairTypeConfig {
  id: ChairType;
  name: string;
  label: string;
  description: string;
  isRequired: boolean;
  badgeClassName: string;
}

export const CHAIR_TYPE_CONFIGS: ChairTypeConfig[] = [
  {
    id: 'primary',
    name: 'Primary',
    label: 'PRIMARY',
    description: 'Lead role',
    isRequired: true,
    badgeClassName: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    id: 'secondary',
    name: 'Secondary',
    label: 'SECONDARY',
    description: 'Support role',
    isRequired: false,
    badgeClassName: 'bg-gray-100 text-gray-600 border-gray-200',
  },
  {
    id: 'specialty',
    name: 'Specialty',
    label: 'SPECIALTY',
    description: 'Special func',
    isRequired: false,
    badgeClassName: 'bg-purple-100 text-purple-700 border-purple-200',
  },
];

// Sample chair data for the role
export const SAMPLE_CHAIRS: Chair[] = [
  // Primary Chairs
  {
    id: 'account-lead',
    name: 'Account Lead',
    description: 'Direct client relationship, strategic decisions',
    type: 'primary',
    isRequired: true,
    assignedTo: undefined,
  },
  {
    id: 'portfolio-manager',
    name: 'Portfolio Manager',
    description: 'Oversee account portfolio, P&L responsibility',
    type: 'primary',
    isRequired: true,
    assignedTo: 'David Chen',
  },
  {
    id: 'strategic-advisor',
    name: 'Strategic Advisor',
    description: 'Long-term planning and client guidance',
    type: 'primary',
    isRequired: true,
    assignedTo: undefined,
  },
  // Secondary Chairs
  {
    id: 'backup-account-manager',
    name: 'Backup Account Manager',
    description: 'Cover during absences, support primary',
    type: 'secondary',
    isRequired: false,
    assignedTo: undefined,
  },
  {
    id: 'quality-reviewer',
    name: 'Quality Reviewer',
    description: 'Audit work quality, provide feedback',
    type: 'secondary',
    isRequired: false,
    assignedTo: 'Emily Watson',
  },
  // Specialty Chairs
  {
    id: 'training-lead',
    name: 'Training Lead',
    description: 'Onboard new team members, knowledge transfer',
    type: 'specialty',
    isRequired: false,
    assignedTo: undefined,
  },
];

export interface ChairSelectionProps {
  chairs: Chair[];
  selectedChair: Chair | null;
  onSelectChair: (chair: Chair) => void;
  workloadPercentage: number;
  onWorkloadChange: (value: number) => void;
  currentCapacity: number;
  memberName: string;
  roleName: string;
  isReadOnly?: boolean;
}

export type ChairSelectionViewMode = 'guided' | 'list';

export const getChairTypeConfig = (type: ChairType): ChairTypeConfig => {
  return CHAIR_TYPE_CONFIGS.find(c => c.id === type) || CHAIR_TYPE_CONFIGS[0];
};

export const getChairsByType = (chairs: Chair[], type: ChairType): Chair[] => {
  return chairs.filter(c => c.type === type);
};
