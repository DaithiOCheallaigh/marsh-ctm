// Team data types and mock data
// Dataset v2.0 - 14 teams with comprehensive structure

export interface TeamRole {
  id: string;
  roleName: string;
  chairName: string;
  chairType: 'Primary' | 'Secondary';
  order: number;
}

export interface Team {
  id: string;
  name: string;
  department: string;
  teamBase: 'Workday' | 'Manual Select';
  qualifiers: string[];
  roles: TeamRole[];
  primaryManager: string;
  primaryManagerId: string;
  oversiteManager: string;
  oversiteManagerId: string;
  memberCount: number;
}

export const teamsData: Team[] = [
  {
    id: 'team_001',
    name: 'Property Risk Team',
    department: 'Property Risk',
    teamBase: 'Workday',
    qualifiers: ['Property', 'Manufacturing', 'Real Estate', 'Energy'],
    roles: [
      { id: 'r1', roleName: 'Senior Account Manager', chairName: 'Primary', chairType: 'Primary', order: 1 },
      { id: 'r2', roleName: 'Senior Account Manager', chairName: 'Primary', chairType: 'Primary', order: 2 },
      { id: 'r3', roleName: 'Senior Account Manager', chairName: 'Secondary', chairType: 'Secondary', order: 1 },
      { id: 'r4', roleName: 'Risk Engineer', chairName: 'Primary', chairType: 'Primary', order: 1 },
      { id: 'r5', roleName: 'Risk Engineer', chairName: 'Primary', chairType: 'Primary', order: 2 },
    ],
    primaryManager: 'Jennifer Walsh',
    primaryManagerId: 'member_002',
    oversiteManager: 'David Chen',
    oversiteManagerId: 'member_001',
    memberCount: 12,
  },
  {
    id: 'team_002',
    name: 'Casualty Claims Team',
    department: 'General Liability',
    teamBase: 'Workday',
    qualifiers: ['Claims', 'Liability', 'Casualty', 'Litigation'],
    roles: [
      { id: 'r6', roleName: 'Claims Specialist', chairName: 'Primary', chairType: 'Primary', order: 1 },
      { id: 'r7', roleName: 'Claims Specialist', chairName: 'Primary', chairType: 'Primary', order: 2 },
      { id: 'r8', roleName: 'Claims Specialist', chairName: 'Secondary', chairType: 'Secondary', order: 1 },
      { id: 'r9', roleName: 'Claims Specialist', chairName: 'Secondary', chairType: 'Secondary', order: 2 },
    ],
    primaryManager: 'Marcus Johnson',
    primaryManagerId: 'member_010',
    oversiteManager: 'Patricia Morrison',
    oversiteManagerId: 'member_005',
    memberCount: 10,
  },
  {
    id: 'team_003',
    name: 'Commercial Underwriting Team',
    department: 'Commercial Lines',
    teamBase: 'Workday',
    qualifiers: ['Underwriting', 'Commercial', 'Pricing', 'Risk Selection'],
    roles: [
      { id: 'r10', roleName: 'Underwriting Specialist', chairName: 'Primary', chairType: 'Primary', order: 1 },
      { id: 'r11', roleName: 'Underwriting Specialist', chairName: 'Secondary', chairType: 'Secondary', order: 1 },
      { id: 'r12', roleName: 'Underwriting Specialist', chairName: 'Secondary', chairType: 'Secondary', order: 2 },
    ],
    primaryManager: 'Sarah Anderson',
    primaryManagerId: 'member_007',
    oversiteManager: 'Robert Thompson',
    oversiteManagerId: 'member_018',
    memberCount: 8,
  },
  {
    id: 'team_004',
    name: 'Marine Cargo Team',
    department: 'Marine Cargo',
    teamBase: 'Manual Select',
    qualifiers: ['Marine', 'Cargo', 'Shipping', 'Transportation', 'Logistics'],
    roles: [
      { id: 'r13', roleName: 'Account Executive', chairName: 'Primary', chairType: 'Primary', order: 1 },
      { id: 'r14', roleName: 'Account Executive', chairName: 'Primary', chairType: 'Primary', order: 2 },
      { id: 'r15', roleName: 'Account Executive', chairName: 'Secondary', chairType: 'Secondary', order: 1 },
      { id: 'r16', roleName: 'Account Executive', chairName: 'Secondary', chairType: 'Secondary', order: 2 },
    ],
    primaryManager: 'Jennifer Walsh',
    primaryManagerId: 'member_002',
    oversiteManager: 'Michael Santos',
    oversiteManagerId: 'member_006',
    memberCount: 7,
  },
  {
    id: 'team_005',
    name: 'Cyber Security Team',
    department: 'Technology',
    teamBase: 'Manual Select',
    qualifiers: ['Cyber', 'Technology', 'Data Privacy', 'Information Security'],
    roles: [
      { id: 'r17', roleName: 'Cyber Risk Analyst', chairName: 'Primary', chairType: 'Primary', order: 1 },
      { id: 'r18', roleName: 'Cyber Risk Analyst', chairName: 'Secondary', chairType: 'Secondary', order: 1 },
      { id: 'r19', roleName: 'Cyber Risk Analyst', chairName: 'Secondary', chairType: 'Secondary', order: 2 },
    ],
    primaryManager: 'Alexandra Chen',
    primaryManagerId: 'member_013',
    oversiteManager: 'Emily Rodriguez',
    oversiteManagerId: 'member_022',
    memberCount: 6,
  },
  {
    id: 'team_006',
    name: 'Healthcare Team',
    department: 'Professional Liability',
    teamBase: 'Workday',
    qualifiers: ['Healthcare', 'Medical Malpractice', 'Life Sciences', 'Pharmaceuticals'],
    roles: [
      { id: 'r20', roleName: 'Healthcare Specialist', chairName: 'Primary', chairType: 'Primary', order: 1 },
      { id: 'r21', roleName: 'Healthcare Specialist', chairName: 'Primary', chairType: 'Primary', order: 2 },
      { id: 'r22', roleName: 'Healthcare Specialist', chairName: 'Secondary', chairType: 'Secondary', order: 1 },
      { id: 'r23', roleName: 'Healthcare Specialist', chairName: 'Secondary', chairType: 'Secondary', order: 2 },
    ],
    primaryManager: 'Lisa Park',
    primaryManagerId: 'member_011',
    oversiteManager: 'Emily Richardson',
    oversiteManagerId: 'member_009',
    memberCount: 9,
  },
  {
    id: 'team_007',
    name: 'Construction Team',
    department: 'Construction',
    teamBase: 'Workday',
    qualifiers: ['Construction', 'Surety', 'Builders Risk', 'Infrastructure'],
    roles: [
      { id: 'r24', roleName: 'Construction Specialist', chairName: 'Primary', chairType: 'Primary', order: 1 },
      { id: 'r25', roleName: 'Construction Specialist', chairName: 'Primary', chairType: 'Primary', order: 2 },
      { id: 'r26', roleName: 'Construction Specialist', chairName: 'Secondary', chairType: 'Secondary', order: 1 },
      { id: 'r27', roleName: 'Construction Specialist', chairName: 'Secondary', chairType: 'Secondary', order: 2 },
    ],
    primaryManager: 'Patricia Morrison',
    primaryManagerId: 'member_005',
    oversiteManager: 'David Chen',
    oversiteManagerId: 'member_001',
    memberCount: 8,
  },
  {
    id: 'team_008',
    name: 'Energy Team',
    department: 'Energy',
    teamBase: 'Manual Select',
    qualifiers: ['Energy', 'Oil & Gas', 'Petrochemical', 'Utilities', 'Renewable'],
    roles: [
      { id: 'r28', roleName: 'Energy Specialist', chairName: 'Primary', chairType: 'Primary', order: 1 },
      { id: 'r29', roleName: 'Energy Specialist', chairName: 'Primary', chairType: 'Primary', order: 2 },
      { id: 'r30', roleName: 'Energy Specialist', chairName: 'Secondary', chairType: 'Secondary', order: 1 },
      { id: 'r31', roleName: 'Energy Specialist', chairName: 'Secondary', chairType: 'Secondary', order: 2 },
    ],
    primaryManager: 'Robert Wilson',
    primaryManagerId: 'member_008',
    oversiteManager: 'Jennifer Walsh',
    oversiteManagerId: 'member_002',
    memberCount: 7,
  },
  {
    id: 'team_009',
    name: 'Financial Institutions Team',
    department: 'Financial Lines',
    teamBase: 'Workday',
    qualifiers: ['Financial', 'Banking', 'Investment', 'D&O', 'E&O'],
    roles: [
      { id: 'r32', roleName: 'Financial Institutions Specialist', chairName: 'Primary', chairType: 'Primary', order: 1 },
      { id: 'r33', roleName: 'Financial Institutions Specialist', chairName: 'Secondary', chairType: 'Secondary', order: 1 },
      { id: 'r34', roleName: 'Financial Institutions Specialist', chairName: 'Secondary', chairType: 'Secondary', order: 2 },
    ],
    primaryManager: 'Jennifer Blake',
    primaryManagerId: 'member_015',
    oversiteManager: 'Kumar Lee',
    oversiteManagerId: 'member_020',
    memberCount: 6,
  },
  {
    id: 'team_010',
    name: 'Aviation Team',
    department: 'Aviation',
    teamBase: 'Manual Select',
    qualifiers: ['Aviation', 'Aircraft', 'Airport', 'Aerospace'],
    roles: [
      { id: 'r35', roleName: 'Aviation Specialist', chairName: 'Primary', chairType: 'Primary', order: 1 },
      { id: 'r36', roleName: 'Aviation Specialist', chairName: 'Secondary', chairType: 'Secondary', order: 1 },
      { id: 'r37', roleName: 'Aviation Specialist', chairName: 'Secondary', chairType: 'Secondary', order: 2 },
    ],
    primaryManager: 'Amanda Foster',
    primaryManagerId: 'member_004',
    oversiteManager: 'Michael Santos',
    oversiteManagerId: 'member_006',
    memberCount: 5,
  },
  {
    id: 'team_011',
    name: 'Environmental Team',
    department: 'Environmental',
    teamBase: 'Manual Select',
    qualifiers: ['Environmental', 'Pollution', 'Remediation', 'EPA'],
    roles: [
      { id: 'r38', roleName: 'Environmental Specialist', chairName: 'Primary', chairType: 'Primary', order: 1 },
      { id: 'r39', roleName: 'Environmental Specialist', chairName: 'Secondary', chairType: 'Secondary', order: 1 },
      { id: 'r40', roleName: 'Environmental Specialist', chairName: 'Secondary', chairType: 'Secondary', order: 2 },
    ],
    primaryManager: 'Robert Wilson',
    primaryManagerId: 'member_008',
    oversiteManager: 'Patricia Morrison',
    oversiteManagerId: 'member_005',
    memberCount: 5,
  },
  {
    id: 'team_012',
    name: 'Fleet Team',
    department: 'Transportation',
    teamBase: 'Workday',
    qualifiers: ['Fleet', 'Auto', 'Trucking', 'Transportation'],
    roles: [
      { id: 'r41', roleName: 'Fleet Manager', chairName: 'Primary', chairType: 'Primary', order: 1 },
      { id: 'r42', roleName: 'Fleet Manager', chairName: 'Secondary', chairType: 'Secondary', order: 1 },
      { id: 'r43', roleName: 'Fleet Manager', chairName: 'Secondary', chairType: 'Secondary', order: 2 },
    ],
    primaryManager: 'Marcus Johnson',
    primaryManagerId: 'member_010',
    oversiteManager: 'Jennifer Walsh',
    oversiteManagerId: 'member_002',
    memberCount: 6,
  },
  {
    id: 'team_013',
    name: 'Management Liability Team',
    department: 'Management Liability',
    teamBase: 'Workday',
    qualifiers: ['D&O', 'EPL', 'Fiduciary', 'Executive Risk'],
    roles: [
      { id: 'r44', roleName: 'D&O Specialist', chairName: 'Primary', chairType: 'Primary', order: 1 },
      { id: 'r45', roleName: 'D&O Specialist', chairName: 'Secondary', chairType: 'Secondary', order: 1 },
      { id: 'r46', roleName: 'D&O Specialist', chairName: 'Secondary', chairType: 'Secondary', order: 2 },
    ],
    primaryManager: 'Kumar Lee',
    primaryManagerId: 'member_020',
    oversiteManager: 'Robert Thompson',
    oversiteManagerId: 'member_018',
    memberCount: 5,
  },
  {
    id: 'team_014',
    name: 'Product Liability Team',
    department: 'Product Liability',
    teamBase: 'Workday',
    qualifiers: ['Product', 'Recall', 'Manufacturing', 'Consumer Products'],
    roles: [
      { id: 'r47', roleName: 'Product Liability Specialist', chairName: 'Primary', chairType: 'Primary', order: 1 },
      { id: 'r48', roleName: 'Product Liability Specialist', chairName: 'Secondary', chairType: 'Secondary', order: 1 },
      { id: 'r49', roleName: 'Product Liability Specialist', chairName: 'Secondary', chairType: 'Secondary', order: 2 },
    ],
    primaryManager: 'Sarah Anderson',
    primaryManagerId: 'member_007',
    oversiteManager: 'Marcus Johnson',
    oversiteManagerId: 'member_010',
    memberCount: 5,
  },
];

export const availableQualifiers = [
  'Accounts',
  'Aerospace',
  'Aircraft',
  'Airport',
  'Auto',
  'Aviation',
  'Banking',
  'Builders Risk',
  'Cargo',
  'Casualty',
  'Claims',
  'Commercial',
  'Compliance',
  'Construction',
  'Consumer Products',
  'Cyber',
  'D&O',
  'Data Privacy',
  'E&O',
  'Energy',
  'Environmental',
  'EPA',
  'EPL',
  'Executive Risk',
  'Fiduciary',
  'Financial',
  'Fleet',
  'Healthcare',
  'Information Security',
  'Infrastructure',
  'Investment',
  'Liability',
  'Life Sciences',
  'Litigation',
  'Logistics',
  'Manufacturing',
  'Marine',
  'Medical Malpractice',
  'Oil & Gas',
  'Petrochemical',
  'Pharmaceuticals',
  'Pollution',
  'Pricing',
  'Product',
  'Property',
  'Real Estate',
  'Recall',
  'Remediation',
  'Renewable',
  'Risk Selection',
  'Shipping',
  'Surety',
  'Technology',
  'Transportation',
  'Trucking',
  'Underwriting',
  'Utilities',
];

export const availableRoles = [
  'Account Executive',
  'Aviation Specialist',
  'Claims Specialist',
  'Construction Specialist',
  'Cyber Risk Analyst',
  'D&O Specialist',
  'Energy Specialist',
  'Environmental Specialist',
  'Financial Institutions Specialist',
  'Fleet Manager',
  'Healthcare Specialist',
  'Product Liability Specialist',
  'Risk Engineer',
  'Senior Account Manager',
  'Underwriting Specialist',
];

// Helper to get team by ID
export const getTeamById = (teamId: string): Team | undefined => {
  return teamsData.find(t => t.id === teamId);
};

// Helper to get teams by manager ID
export const getTeamsByManagerId = (managerId: string): Team[] => {
  return teamsData.filter(t => 
    t.primaryManagerId === managerId || t.oversiteManagerId === managerId
  );
};
