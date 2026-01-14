// Team Assignment Data Structures and Mock Data

export interface ClientAssignment {
  id: string;
  clientName: string;
  cnNumber: string;
  servicingCountry: string;
  assignmentDate: string;
  assignmentRole: string;
  chairName: 'Primary' | 'Secondary';
  scopes: string[];
  workload: number; // percentage
}

export interface AssignmentTeamMember {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  title: string;
  location: string;
  startDate: string;
  expertise: string[];
  workdayManager?: string;
  isManualAdd: boolean;
  clientAssignments: ClientAssignment[];
}

export interface AssignmentTeam {
  id: string;
  teamName: string;
  members: AssignmentTeamMember[];
}

// Master expertise list for typeahead
export const masterExpertiseList: string[] = [
  'Aviation',
  'Risk Consulting',
  'Claims',
  'Cyber Security',
  'Property Risk',
  'Marine',
  'Cargo',
  'Transportation',
  'Energy',
  'Healthcare',
  'Financial Institutions',
  'Construction',
  'Surety Bonds',
  'Technology',
  'D&O',
  'E&O',
  'Professional Liability',
  'Large Accounts',
  'Manufacturing',
  'Retail',
  'Hospitality',
  'Life Sciences',
  'Data Privacy',
  'Infrastructure',
  'CAT Response',
  'Large Loss',
  'Subrogation',
];

// Sample scopes for assignments
const sampleScopes = [
  'Property Insurance',
  'Liability Coverage',
  'Workers Compensation',
  'Business Interruption',
  'Cyber Liability',
  'Directors & Officers',
  'Professional Liability',
  'Environmental Liability',
  'Product Liability',
  'Commercial Auto',
  'Umbrella/Excess',
  'Crime Insurance',
  'Fiduciary Liability',
  'Employment Practices',
  'Network Security',
  'Media Liability',
  'Technology E&O',
  'Privacy Liability',
  'Regulatory Defense',
  'Crisis Management',
  'Kidnap & Ransom',
  'Trade Credit',
  'Political Risk',
];

// Generate random assignments for team members
const generateAssignments = (count: number): ClientAssignment[] => {
  const assignments: ClientAssignment[] = [];
  const clientNames = [
    'Acme Corporation International',
    'Global Tech Solutions Inc.',
    'Pacific Manufacturing Co.',
    'Atlantic Financial Services',
    'Metro Healthcare Group',
    'United Energy Partners',
    'Premier Retail Holdings',
    'Continental Logistics Ltd.',
    'Apex Construction Services',
    'Summit Insurance Brokers',
  ];
  
  const roles = ['Cyber Security Lead', 'Claims Specialist', 'Risk Analyst', 'Account Manager', 'Senior Underwriter'];
  const countries = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'];
  
  for (let i = 0; i < count; i++) {
    const scopeCount = Math.floor(Math.random() * 15) + 3;
    const scopes = sampleScopes.slice(0, scopeCount);
    
    assignments.push({
      id: `assignment-${Date.now()}-${i}`,
      clientName: clientNames[Math.floor(Math.random() * clientNames.length)],
      cnNumber: `${Math.floor(Math.random() * 9000000000000) + 1000000000000}`,
      servicingCountry: countries[Math.floor(Math.random() * countries.length)],
      assignmentDate: '07 Sep 2025',
      assignmentRole: roles[Math.floor(Math.random() * roles.length)],
      chairName: Math.random() > 0.5 ? 'Primary' : 'Secondary',
      scopes,
      workload: Math.floor(Math.random() * 30) + 5,
    });
  }
  
  return assignments;
};

// Calculate available capacity from assignments
export const calculateAvailableCapacity = (assignments: ClientAssignment[]): number => {
  const totalWorkload = assignments.reduce((sum, a) => sum + a.workload, 0);
  return Math.max(0, 100 - totalWorkload);
};

// Get capacity color based on percentage
export const getCapacityColor = (capacity: number): 'green' | 'amber' | 'red' => {
  if (capacity >= 55) return 'green';
  if (capacity >= 25) return 'amber';
  return 'red';
};

// Sample team assignment data
export const teamAssignmentsData: AssignmentTeam[] = [
  {
    id: 'assign-team-1',
    teamName: 'Accounts',
    members: [
      {
        id: 'member-1',
        firstName: 'David',
        lastName: 'Chen',
        title: 'Senior Account Manager',
        location: 'New York, USA',
        startDate: '08 Sep 2025',
        expertise: ['Aviation', 'Risk Consulting', 'Property Risk', 'Large Accounts', 'Manufacturing'],
        isManualAdd: false,
        clientAssignments: generateAssignments(5),
      },
      {
        id: 'member-2',
        firstName: 'Jennifer',
        lastName: 'Walsh',
        title: 'Claims Specialist',
        location: 'Miami, USA',
        startDate: '08 Sep 2025',
        expertise: ['Claims', 'Cyber Security'],
        isManualAdd: false,
        clientAssignments: generateAssignments(8),
      },
      {
        id: 'member-3',
        firstName: 'Marcus',
        lastName: 'Thompson',
        title: 'Risk Analyst',
        location: 'Chicago, USA',
        startDate: '08 Sep 2025',
        expertise: ['Claims', 'Risk Consulting', 'Aviation', 'Property Risk', 'Healthcare'],
        workdayManager: 'Sarah Anderson',
        isManualAdd: true,
        clientAssignments: generateAssignments(3),
      },
      {
        id: 'member-4',
        firstName: 'Emily',
        lastName: 'Richardson',
        title: 'Senior Underwriter',
        location: 'Boston, USA',
        startDate: '08 Sep 2025',
        expertise: ['Claims', 'Cyber Security'],
        isManualAdd: false,
        clientAssignments: generateAssignments(7),
      },
      {
        id: 'member-5',
        firstName: 'Robert',
        lastName: 'Wilson',
        title: 'Account Executive',
        location: 'Houston, USA',
        startDate: '08 Sep 2025',
        expertise: ['Energy', 'Large Accounts', 'Risk Consulting'],
        isManualAdd: false,
        clientAssignments: generateAssignments(4),
      },
      {
        id: 'member-6',
        firstName: 'Lisa',
        lastName: 'Park',
        title: 'Claims Manager',
        location: 'Seattle, USA',
        startDate: '08 Sep 2025',
        expertise: ['Healthcare', 'Professional Liability'],
        isManualAdd: false,
        clientAssignments: generateAssignments(6),
      },
      {
        id: 'member-7',
        firstName: 'Thomas',
        lastName: 'Reynolds',
        title: 'Cyber Risk Specialist',
        location: 'San Francisco, USA',
        startDate: '08 Sep 2025',
        expertise: ['Cyber Security', 'Technology', 'Data Privacy'],
        isManualAdd: false,
        clientAssignments: generateAssignments(5),
      },
      {
        id: 'member-8',
        firstName: 'Alexandra',
        lastName: 'Chen',
        title: 'Senior Analyst',
        location: 'Los Angeles, USA',
        startDate: '08 Sep 2025',
        expertise: ['Aviation', 'Risk Consulting'],
        workdayManager: 'Michael Santos',
        isManualAdd: true,
        clientAssignments: generateAssignments(4),
      },
      {
        id: 'member-9',
        firstName: 'Daniel',
        lastName: 'Martinez',
        title: 'Account Manager',
        location: 'Phoenix, USA',
        startDate: '08 Sep 2025',
        expertise: ['Property Risk', 'Construction'],
        isManualAdd: false,
        clientAssignments: generateAssignments(6),
      },
      {
        id: 'member-10',
        firstName: 'Sarah',
        lastName: 'Anderson',
        title: 'Director',
        location: 'Denver, USA',
        startDate: '08 Sep 2025',
        expertise: ['Large Accounts', 'Manufacturing', 'Risk Consulting'],
        isManualAdd: false,
        clientAssignments: generateAssignments(3),
      },
      {
        id: 'member-11',
        firstName: 'Michael',
        lastName: 'Santos',
        title: 'VP Operations',
        location: 'Atlanta, USA',
        startDate: '08 Sep 2025',
        expertise: ['Retail', 'Hospitality'],
        isManualAdd: false,
        clientAssignments: generateAssignments(5),
      },
      {
        id: 'member-12',
        firstName: 'Patricia',
        lastName: 'Morrison',
        title: 'Senior Claims Specialist',
        location: 'Charlotte, USA',
        startDate: '08 Sep 2025',
        expertise: ['Construction', 'Surety Bonds'],
        isManualAdd: false,
        clientAssignments: generateAssignments(4),
      },
    ],
  },
  {
    id: 'assign-team-2',
    teamName: 'Claims',
    members: [
      {
        id: 'member-20',
        firstName: 'Amanda',
        lastName: 'Foster',
        title: 'Claims Director',
        location: 'Chicago, USA',
        startDate: '08 Sep 2025',
        expertise: ['Claims', 'CAT Response', 'Large Loss'],
        isManualAdd: false,
        clientAssignments: generateAssignments(6),
      },
      {
        id: 'member-21',
        firstName: 'Colin',
        lastName: 'Masterson',
        title: 'Senior Claims Adjuster',
        location: 'Detroit, USA',
        startDate: '08 Sep 2025',
        expertise: ['Property Claims', 'Subrogation'],
        isManualAdd: false,
        clientAssignments: generateAssignments(8),
      },
    ],
  },
  {
    id: 'assign-team-3',
    teamName: 'Cyber Security',
    members: [
      {
        id: 'member-30',
        firstName: 'Kevin',
        lastName: 'Zhang',
        title: 'Cyber Security Lead',
        location: 'New York, USA',
        startDate: '08 Sep 2025',
        expertise: ['Cyber Security', 'Technology', 'Data Privacy'],
        isManualAdd: false,
        clientAssignments: generateAssignments(7),
      },
    ],
  },
  {
    id: 'assign-team-4',
    teamName: 'Management',
    members: [
      {
        id: 'member-40',
        firstName: 'Victoria',
        lastName: 'Hughes',
        title: 'Managing Director',
        location: 'New York, USA',
        startDate: '08 Sep 2025',
        expertise: ['Large Accounts', 'D&O', 'E&O'],
        isManualAdd: false,
        clientAssignments: generateAssignments(4),
      },
    ],
  },
  {
    id: 'assign-team-5',
    teamName: 'Risk',
    members: [
      {
        id: 'member-50',
        firstName: 'James',
        lastName: 'Cooper',
        title: 'Risk Consultant',
        location: 'Boston, USA',
        startDate: '08 Sep 2025',
        expertise: ['Risk Consulting', 'Aviation', 'Infrastructure'],
        isManualAdd: false,
        clientAssignments: generateAssignments(5),
      },
    ],
  },
];

// Generate team overview data from assignments
export interface TeamOverviewRow {
  id: string;
  teamName: string;
  memberCount: number;
  assignmentCount: number;
  clientCount: number;
}

export const getTeamOverviewData = (): TeamOverviewRow[] => {
  const overviewData: TeamOverviewRow[] = [];
  
  // Generate multiple rows per team to match the screenshot (showing repeated teams)
  const teamConfigs = [
    { teamName: 'Accounts', members: 14, assignments: 31, clients: 5 },
    { teamName: 'Claims', members: 25, assignments: 43, clients: 9 },
    { teamName: 'Cyber Security', members: 42, assignments: 57, clients: 23 },
    { teamName: 'Management', members: 8, assignments: 19, clients: 11 },
    { teamName: 'Risk', members: 18, assignments: 38, clients: 4 },
    { teamName: 'Accounts', members: 9, assignments: 26, clients: 5 },
    { teamName: 'Claims', members: 26, assignments: 14, clients: 9 },
    { teamName: 'Cyber Security', members: 21, assignments: 46, clients: 23 },
    { teamName: 'Management', members: 20, assignments: 20, clients: 11 },
    { teamName: 'Risk', members: 18, assignments: 24, clients: 4 },
    { teamName: 'Accounts', members: 5, assignments: 21, clients: 5 },
    { teamName: 'Claims', members: 12, assignments: 35, clients: 9 },
    { teamName: 'Cyber Security', members: 11, assignments: 27, clients: 23 },
    { teamName: 'Management', members: 14, assignments: 20, clients: 5 },
    { teamName: 'Risk', members: 20, assignments: 11, clients: 8 },
    { teamName: 'Aviation', members: 16, assignments: 28, clients: 12 },
    { teamName: 'Marine', members: 22, assignments: 41, clients: 18 },
    { teamName: 'Property', members: 31, assignments: 52, clients: 21 },
    { teamName: 'Casualty', members: 19, assignments: 33, clients: 14 },
    { teamName: 'Healthcare', members: 27, assignments: 48, clients: 16 },
    { teamName: 'Financial Lines', members: 15, assignments: 29, clients: 10 },
    { teamName: 'Energy', members: 23, assignments: 39, clients: 17 },
    { teamName: 'Construction', members: 18, assignments: 34, clients: 13 },
    { teamName: 'Technology', members: 29, assignments: 55, clients: 22 },
    { teamName: 'Retail', members: 11, assignments: 22, clients: 8 },
    { teamName: 'Manufacturing', members: 24, assignments: 44, clients: 19 },
    { teamName: 'Transportation', members: 17, assignments: 31, clients: 11 },
    { teamName: 'Life Sciences', members: 13, assignments: 25, clients: 9 },
    { teamName: 'Professional Services', members: 21, assignments: 37, clients: 15 },
    { teamName: 'Public Sector', members: 10, assignments: 18, clients: 7 },
    { teamName: 'Hospitality', members: 14, assignments: 26, clients: 10 },
    { teamName: 'Real Estate', members: 19, assignments: 32, clients: 13 },
    { teamName: 'Media', members: 12, assignments: 23, clients: 8 },
    { teamName: 'Sports', members: 8, assignments: 15, clients: 6 },
    { teamName: 'Entertainment', members: 16, assignments: 29, clients: 11 },
    { teamName: 'Agriculture', members: 9, assignments: 17, clients: 5 },
    { teamName: 'Mining', members: 7, assignments: 13, clients: 4 },
    { teamName: 'Utilities', members: 15, assignments: 27, clients: 10 },
    { teamName: 'Telecom', members: 20, assignments: 36, clients: 14 },
    { teamName: 'Aerospace', members: 25, assignments: 45, clients: 18 },
    { teamName: 'Defense', members: 18, assignments: 33, clients: 12 },
    { teamName: 'Environmental', members: 11, assignments: 21, clients: 7 },
    { teamName: 'Education', members: 13, assignments: 24, clients: 9 },
    { teamName: 'Non-Profit', members: 6, assignments: 12, clients: 4 },
    { teamName: 'Government', members: 22, assignments: 40, clients: 16 },
  ];
  
  teamConfigs.forEach((config, index) => {
    overviewData.push({
      id: `overview-${index}`,
      teamName: config.teamName,
      memberCount: config.members,
      assignmentCount: config.assignments,
      clientCount: config.clients,
    });
  });
  
  return overviewData;
};

// Workday mock lookup for adding team members
export interface WorkdayEmployee {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  location: string;
  startDate: string;
  workdayManager: string;
}

export const workdayEmployees: WorkdayEmployee[] = [
  { id: 'wd-1', firstName: 'John', lastName: 'Smith', title: 'Claims Analyst', location: 'New York, USA', startDate: '15 Jan 2024', workdayManager: 'David Chen' },
  { id: 'wd-2', firstName: 'Maria', lastName: 'Garcia', title: 'Risk Consultant', location: 'Miami, USA', startDate: '20 Feb 2024', workdayManager: 'Jennifer Walsh' },
  { id: 'wd-3', firstName: 'James', lastName: 'Johnson', title: 'Account Executive', location: 'Chicago, USA', startDate: '10 Mar 2024', workdayManager: 'Marcus Thompson' },
  { id: 'wd-4', firstName: 'Emily', lastName: 'Brown', title: 'Senior Underwriter', location: 'Boston, USA', startDate: '05 Apr 2024', workdayManager: 'Sarah Anderson' },
  { id: 'wd-5', firstName: 'Michael', lastName: 'Williams', title: 'Claims Manager', location: 'Houston, USA', startDate: '12 May 2024', workdayManager: 'Robert Wilson' },
  { id: 'wd-6', firstName: 'Sarah', lastName: 'Jones', title: 'Cyber Specialist', location: 'Seattle, USA', startDate: '18 Jun 2024', workdayManager: 'Lisa Park' },
  { id: 'wd-7', firstName: 'David', lastName: 'Miller', title: 'Risk Analyst', location: 'Denver, USA', startDate: '25 Jul 2024', workdayManager: 'Thomas Reynolds' },
  { id: 'wd-8', firstName: 'Jessica', lastName: 'Davis', title: 'Account Manager', location: 'Phoenix, USA', startDate: '01 Aug 2024', workdayManager: 'Alexandra Chen' },
  { id: 'wd-9', firstName: 'Christopher', lastName: 'Martinez', title: 'Claims Adjuster', location: 'Atlanta, USA', startDate: '08 Sep 2024', workdayManager: 'Daniel Martinez' },
  { id: 'wd-10', firstName: 'Ashley', lastName: 'Anderson', title: 'Underwriting Specialist', location: 'Charlotte, USA', startDate: '15 Oct 2024', workdayManager: 'Patricia Morrison' },
];

export const searchWorkdayEmployees = (query: string): WorkdayEmployee[] => {
  if (query.length < 3) return [];
  const lowerQuery = query.toLowerCase();
  return workdayEmployees.filter(emp => 
    emp.lastName.toLowerCase().includes(lowerQuery) ||
    emp.firstName.toLowerCase().includes(lowerQuery)
  );
};
