// Team data types and mock data

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
  teamBase: 'Workday' | 'Manual Select';
  qualifiers: string[];
  roles: TeamRole[];
  primaryManager: string;
  oversiteManager: string;
}

export const teamsData: Team[] = [
  {
    id: '1',
    name: 'Accounts',
    teamBase: 'Workday',
    qualifiers: ['Accounts', 'Management', 'Finance', 'Operations'],
    roles: [
      { id: 'r1', roleName: 'Claims Specialist', chairName: 'Primary', chairType: 'Primary', order: 1 },
      { id: 'r2', roleName: 'Claims Specialist', chairName: 'Primary', chairType: 'Primary', order: 2 },
      { id: 'r3', roleName: 'Claims Specialist', chairName: 'Other', chairType: 'Secondary', order: 1 },
      { id: 'r4', roleName: 'Claims Specialist', chairName: 'Other', chairType: 'Secondary', order: 2 },
      { id: 'r5', roleName: 'Claims Manager', chairName: 'Primary', chairType: 'Primary', order: 1 },
    ],
    primaryManager: 'Sarah Anderson',
    oversiteManager: 'Kumar Lee',
  },
  {
    id: '2',
    name: 'Claims',
    teamBase: 'Workday',
    qualifiers: ['Claims', 'Cyber Security'],
    roles: [
      { id: 'r6', roleName: 'Claims Analyst', chairName: 'Primary', chairType: 'Primary', order: 1 },
      { id: 'r7', roleName: 'Claims Analyst', chairName: 'Primary', chairType: 'Primary', order: 2 },
      { id: 'r8', roleName: 'Claims Analyst', chairName: 'Other', chairType: 'Secondary', order: 1 },
      { id: 'r9', roleName: 'Claims Specialist', chairName: 'Primary', chairType: 'Primary', order: 1 },
      { id: 'r10', roleName: 'Claims Specialist', chairName: 'Primary', chairType: 'Primary', order: 2 },
      { id: 'r11', roleName: 'Claims Specialist', chairName: 'Other', chairType: 'Secondary', order: 1 },
      { id: 'r12', roleName: 'Claims Manager', chairName: 'Primary', chairType: 'Primary', order: 1 },
      { id: 'r13', roleName: 'Claims Director', chairName: 'Primary', chairType: 'Primary', order: 1 },
      { id: 'r14', roleName: 'Claims Director', chairName: 'Other', chairType: 'Secondary', order: 1 },
    ],
    primaryManager: 'Michael Chen',
    oversiteManager: 'Jessica Williams',
  },
  {
    id: '3',
    name: 'Cyber Security',
    teamBase: 'Manual Select',
    qualifiers: ['Claims', 'Cyber Security', 'Risk', 'Technology', 'Compliance', 'Audit'],
    roles: Array.from({ length: 23 }, (_, i) => ({
      id: `cs-r${i + 1}`,
      roleName: ['Cyber Analyst', 'Security Engineer', 'Risk Specialist', 'Compliance Officer'][i % 4],
      chairName: i % 3 === 0 ? 'Primary' : 'Other',
      chairType: i % 3 === 0 ? 'Primary' as const : 'Secondary' as const,
      order: Math.floor(i / 4) + 1,
    })),
    primaryManager: 'David Park',
    oversiteManager: 'Emily Rodriguez',
  },
  {
    id: '4',
    name: 'Management',
    teamBase: 'Workday',
    qualifiers: ['Claims', 'Management', 'Executive'],
    roles: Array.from({ length: 11 }, (_, i) => ({
      id: `mgmt-r${i + 1}`,
      roleName: ['Director', 'VP', 'Manager', 'Team Lead'][i % 4],
      chairName: i % 2 === 0 ? 'Primary' : 'Other',
      chairType: i % 2 === 0 ? 'Primary' as const : 'Secondary' as const,
      order: Math.floor(i / 2) + 1,
    })),
    primaryManager: 'Robert Thompson',
    oversiteManager: 'Sarah Anderson',
  },
  {
    id: '5',
    name: 'Risk',
    teamBase: 'Manual Select',
    qualifiers: ['Aviation', 'Risk Consulting', 'Marine', 'Property', 'Casualty'],
    roles: [
      { id: 'risk-r1', roleName: 'Risk Analyst', chairName: 'Primary', chairType: 'Primary', order: 1 },
      { id: 'risk-r2', roleName: 'Risk Consultant', chairName: 'Primary', chairType: 'Primary', order: 1 },
      { id: 'risk-r3', roleName: 'Risk Manager', chairName: 'Primary', chairType: 'Primary', order: 1 },
      { id: 'risk-r4', roleName: 'Risk Manager', chairName: 'Other', chairType: 'Secondary', order: 1 },
    ],
    primaryManager: 'Jennifer Martinez',
    oversiteManager: 'Kumar Lee',
  },
];

export const availableQualifiers = [
  'Accounts',
  'Aviation',
  'Claims',
  'Compliance',
  'Cyber Security',
  'Executive',
  'Finance',
  'Management',
  'Marine',
  'Operations',
  'Property',
  'Casualty',
  'Risk',
  'Risk Consulting',
  'Technology',
  'Audit',
];

export const availableRoles = [
  'Account Executive',
  'Broker',
  'Claims Specialist',
  'Claims Analyst',
  'Claims Manager',
  'Claims Director',
  'Cyber Analyst',
  'Cyber Risk Specialist',
  'Risk Analyst',
  'Risk Consultant',
  'Risk Manager',
  'Security Engineer',
  'Compliance Officer',
  'Director',
  'VP',
  'Manager',
  'Team Lead',
];
