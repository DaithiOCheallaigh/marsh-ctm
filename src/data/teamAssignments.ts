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
  // Derive overview data from actual team assignments data
  return teamAssignmentsData.map((team, index) => {
    // Count total assignments across all members
    const totalAssignments = team.members.reduce(
      (sum, member) => sum + member.clientAssignments.length, 
      0
    );
    
    // Count unique clients across all members
    const uniqueClients = new Set<string>();
    team.members.forEach(member => {
      member.clientAssignments.forEach(assignment => {
        uniqueClients.add(assignment.clientName);
      });
    });
    
    return {
      id: `overview-${index}`,
      teamName: team.teamName,
      memberCount: team.members.length,
      assignmentCount: totalAssignments,
      clientCount: uniqueClients.size,
    };
  });
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
