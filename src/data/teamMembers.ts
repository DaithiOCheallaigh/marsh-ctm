// Team Member data for B2B Insurance Industry
// Dataset v2.0 - 97 team members with assignments

export interface MemberAssignment {
  clientId: string;
  clientName: string;
  workItemId: string;
  roleId: string;
  roleName: string;
  chairId: string;
  chairName: string;
  workload: number;
  notes?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  title: string;
  location: string;
  team: string;
  teamId: string;
  expertise: string[];
  yearsExperience: number;
  capacity: number; // Available capacity (100 - workload)
  totalCapacity: number;
  matchScore: number;
  locationMatch: boolean;
  expertiseMatch: boolean;
  hasCapacity: boolean;
  isManager?: boolean;
  currentAssignments?: MemberAssignment[];
}

// Helper to calculate available capacity from assignments
const calculateAvailableCapacity = (assignments: MemberAssignment[] = []): number => {
  const totalWorkload = assignments.reduce((sum, a) => sum + a.workload, 0);
  return Math.max(0, 100 - totalWorkload);
};

// B2B Insurance Industry Team Members - 97 total
export const teamMembers: TeamMember[] = [
  // Property Risk Team (12 members)
  {
    id: "member_001",
    name: "David Chen",
    role: "Managing Director - Property & Casualty",
    title: "Managing Director",
    location: "New York, NY",
    team: "Property Risk Team",
    teamId: "team_001",
    expertise: ["Property Risk", "Manufacturing", "Large Accounts", "Real Estate"],
    yearsExperience: 22,
    totalCapacity: 100,
    capacity: 35,
    matchScore: 100,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_001",
        clientName: "Acme Energy Corp",
        workItemId: "workitem_001",
        roleId: "role_001",
        roleName: "Senior Account Manager",
        chairId: "chair_001",
        chairName: "Account Lead",
        workload: 35,
        notes: "Strategic oversight for energy sector client"
      },
      {
        clientId: "client_003",
        clientName: "Summit Healthcare Systems",
        workItemId: "workitem_003",
        roleId: "role_001",
        roleName: "Senior Account Manager",
        chairId: "chair_002",
        chairName: "Strategic Advisor",
        workload: 30,
        notes: "Healthcare account expansion"
      }
    ]
  },
  {
    id: "member_002",
    name: "Jennifer Walsh",
    role: "Senior Vice President - Marine & Cargo",
    title: "Senior Vice President",
    location: "Miami, FL",
    team: "Property Risk Team",
    teamId: "team_001",
    expertise: ["Marine", "Cargo", "Transportation", "Logistics"],
    yearsExperience: 18,
    totalCapacity: 100,
    capacity: 10,
    matchScore: 95,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_008",
        clientName: "Global Shipping Lines",
        workItemId: "workitem_008",
        roleId: "role_005",
        roleName: "Account Executive",
        chairId: "chair_017",
        chairName: "Account Director",
        workload: 45,
        notes: "Fleet expansion project"
      },
      {
        clientId: "client_002",
        clientName: "Atlantic Logistics Partners",
        workItemId: "workitem_002",
        roleId: "role_005",
        roleName: "Account Executive",
        chairId: "chair_018",
        chairName: "Cargo Specialist",
        workload: 45,
        notes: "New cargo routes coverage"
      }
    ]
  },
  {
    id: "member_003",
    name: "Colin Masterson",
    role: "VP - Human Capital Management",
    title: "Vice President",
    location: "New York, NY",
    team: "Property Risk Team",
    teamId: "team_001",
    expertise: ["HR Operations", "Onboarding", "Team Development", "Talent Management"],
    yearsExperience: 15,
    totalCapacity: 100,
    capacity: 5,
    matchScore: 90,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: false,
    isManager: true,
    currentAssignments: [
      {
        clientId: "internal",
        clientName: "Internal - New Joiner Program",
        workItemId: "workitem_nj_001",
        roleId: "internal",
        roleName: "HR Lead",
        chairId: "internal",
        chairName: "Program Lead",
        workload: 95,
        notes: "Q1 hiring initiative"
      }
    ]
  },
  {
    id: "member_004",
    name: "Amanda Foster",
    role: "Director - Client Transitions",
    title: "Director",
    location: "Seattle, WA",
    team: "Property Risk Team",
    teamId: "team_001",
    expertise: ["Offboarding", "Account Transition", "Client Relations", "Change Management"],
    yearsExperience: 12,
    totalCapacity: 100,
    capacity: 40,
    matchScore: 88,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_004",
        clientName: "Precision Aerospace Inc",
        workItemId: "workitem_004",
        roleId: "role_001",
        roleName: "Senior Account Manager",
        chairId: "chair_003",
        chairName: "Renewal Coordinator",
        workload: 30,
        notes: "Transition planning"
      },
      {
        clientId: "client_009",
        clientName: "Pacific Retail Holdings",
        workItemId: "workitem_009",
        roleId: "role_001",
        roleName: "Senior Account Manager",
        chairId: "chair_004",
        chairName: "Client Service Lead",
        workload: 30,
        notes: "Offboarding coordination"
      }
    ]
  },
  {
    id: "member_005",
    name: "Patricia Morrison",
    role: "SVP - Construction & Surety",
    title: "Senior Vice President",
    location: "Phoenix, AZ",
    team: "Property Risk Team",
    teamId: "team_001",
    expertise: ["Construction", "Surety Bonds", "Infrastructure", "Builders Risk"],
    yearsExperience: 20,
    totalCapacity: 100,
    capacity: 50,
    matchScore: 85,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_005",
        clientName: "Meridian Construction Group",
        workItemId: "workitem_005",
        roleId: "role_008",
        roleName: "Construction Specialist",
        chairId: "chair_028",
        chairName: "Project Lead",
        workload: 50,
        notes: "Major infrastructure project"
      }
    ]
  },
  {
    id: "member_006",
    name: "Michael Santos",
    role: "Director - Retail & Hospitality",
    title: "Director",
    location: "Los Angeles, CA",
    team: "Property Risk Team",
    teamId: "team_001",
    expertise: ["Retail", "Hospitality", "Property Risk", "Business Interruption"],
    yearsExperience: 14,
    totalCapacity: 100,
    capacity: 55,
    matchScore: 82,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_010",
        clientName: "Heritage Hotels Group",
        workItemId: "workitem_010",
        roleId: "role_001",
        roleName: "Senior Account Manager",
        chairId: "chair_001",
        chairName: "Account Lead",
        workload: 45,
        notes: "Hotel expansion coverage"
      }
    ]
  },
  {
    id: "member_007",
    name: "Sarah Anderson",
    role: "Senior Account Manager",
    title: "Senior Account Manager",
    location: "New York, NY",
    team: "Property Risk Team",
    teamId: "team_001",
    expertise: ["Manufacturing", "Risk Consulting", "Large Accounts", "Property"],
    yearsExperience: 11,
    totalCapacity: 100,
    capacity: 65,
    matchScore: 78,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_017",
        clientName: "Delta Manufacturing",
        workItemId: "workitem_017",
        roleId: "role_001",
        roleName: "Senior Account Manager",
        chairId: "chair_001",
        chairName: "Account Lead",
        workload: 35,
        notes: "Annual review"
      }
    ]
  },
  {
    id: "member_008",
    name: "Robert Wilson",
    role: "Senior Risk Engineer",
    title: "Senior Risk Engineer",
    location: "Houston, TX",
    team: "Property Risk Team",
    teamId: "team_001",
    expertise: ["Energy", "Petrochemical", "Oil & Gas", "Risk Assessment", "NFPA Standards"],
    yearsExperience: 15,
    totalCapacity: 100,
    capacity: 40,
    matchScore: 75,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_001",
        clientName: "Acme Energy Corp",
        workItemId: "workitem_001",
        roleId: "role_002",
        roleName: "Risk Engineer",
        chairId: "chair_006",
        chairName: "Lead Engineer",
        workload: 30,
        notes: "Primary engineer for refinery inspections"
      },
      {
        clientId: "client_017",
        clientName: "Delta Manufacturing",
        workItemId: "workitem_020",
        roleId: "role_002",
        roleName: "Risk Engineer",
        chairId: "chair_007",
        chairName: "Field Engineer",
        workload: 30,
        notes: ""
      }
    ]
  },
  {
    id: "member_009",
    name: "Emily Richardson",
    role: "Claims Specialist",
    title: "Claims Specialist",
    location: "Boston, MA",
    team: "Property Risk Team",
    teamId: "team_001",
    expertise: ["Healthcare", "Professional Liability", "Medical Malpractice", "Claims"],
    yearsExperience: 9,
    totalCapacity: 100,
    capacity: 70,
    matchScore: 72,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_003",
        clientName: "Summit Healthcare Systems",
        workItemId: "workitem_003",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_010",
        chairName: "Lead Adjuster",
        workload: 30,
        notes: "Malpractice claims handling"
      }
    ]
  },
  {
    id: "member_010",
    name: "Marcus Johnson",
    role: "Senior Claims Analyst",
    title: "Senior Claims Analyst",
    location: "Chicago, IL",
    team: "Property Risk Team",
    teamId: "team_001",
    expertise: ["Property Claims", "CAT Response", "Large Loss", "Subrogation"],
    yearsExperience: 13,
    totalCapacity: 100,
    capacity: 30,
    matchScore: 70,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_001",
        clientName: "Acme Energy Corp",
        workItemId: "workitem_001",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_010",
        chairName: "Lead Adjuster",
        workload: 40,
        notes: "Property damage claims"
      },
      {
        clientId: "client_012",
        clientName: "Metro Transit Authority",
        workItemId: "workitem_012",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_011",
        chairName: "Investigation Lead",
        workload: 30,
        notes: "Fleet claims coordination"
      }
    ]
  },
  {
    id: "member_011",
    name: "Lisa Park",
    role: "Account Executive - Healthcare",
    title: "Account Executive",
    location: "Boston, MA",
    team: "Property Risk Team",
    teamId: "team_001",
    expertise: ["Healthcare", "Life Sciences", "D&O", "Professional Liability"],
    yearsExperience: 10,
    totalCapacity: 100,
    capacity: 55,
    matchScore: 68,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_013",
        clientName: "Sterling Pharmaceuticals",
        workItemId: "workitem_013",
        roleId: "role_007",
        roleName: "Healthcare Specialist",
        chairId: "chair_024",
        chairName: "Lead Specialist",
        workload: 45,
        notes: "Pharma liability program"
      }
    ]
  },
  {
    id: "member_012",
    name: "Thomas Reynolds",
    role: "Senior Account Manager",
    title: "Senior Account Manager",
    location: "San Francisco, CA",
    team: "Property Risk Team",
    teamId: "team_001",
    expertise: ["Technology", "Cyber Risk", "E&O", "Startups"],
    yearsExperience: 8,
    totalCapacity: 100,
    capacity: 20,
    matchScore: 65,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: false,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_011",
        clientName: "TechVenture Solutions",
        workItemId: "workitem_011",
        roleId: "role_001",
        roleName: "Senior Account Manager",
        chairId: "chair_001",
        chairName: "Account Lead",
        workload: 40,
        notes: "Series C coverage requirements"
      },
      {
        clientId: "client_016",
        clientName: "Quantum Data Centers",
        workItemId: "workitem_016",
        roleId: "role_001",
        roleName: "Senior Account Manager",
        chairId: "chair_002",
        chairName: "Strategic Advisor",
        workload: 40,
        notes: "Data center expansion"
      }
    ]
  },
  // Casualty Claims Team (10 members)
  {
    id: "member_013",
    name: "Alexandra Chen",
    role: "Cyber Risk Specialist",
    title: "Cyber Risk Specialist",
    location: "New York, NY",
    team: "Casualty Claims Team",
    teamId: "team_002",
    expertise: ["Cyber Security", "Technology", "Data Privacy", "Incident Response"],
    yearsExperience: 7,
    totalCapacity: 100,
    capacity: 60,
    matchScore: 92,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_016",
        clientName: "Quantum Data Centers",
        workItemId: "workitem_016",
        roleId: "role_006",
        roleName: "Cyber Risk Analyst",
        chairId: "chair_021",
        chairName: "Lead Analyst",
        workload: 40,
        notes: "Cyber coverage design"
      }
    ]
  },
  {
    id: "member_014",
    name: "Daniel Martinez",
    role: "Claims Adjuster",
    title: "Claims Adjuster",
    location: "Atlanta, GA",
    team: "Casualty Claims Team",
    teamId: "team_002",
    expertise: ["Property Claims", "Liability", "Subrogation", "Investigations"],
    yearsExperience: 6,
    totalCapacity: 100,
    capacity: 75,
    matchScore: 58,
    locationMatch: false,
    expertiseMatch: false,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_015",
        clientName: "National Real Estate Partners",
        workItemId: "workitem_015",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_012",
        chairName: "Subrogation Specialist",
        workload: 25,
        notes: "Property damage recovery"
      }
    ]
  },
  {
    id: "member_015",
    name: "Jennifer Blake",
    role: "Risk Analyst",
    title: "Risk Analyst",
    location: "Charlotte, NC",
    team: "Casualty Claims Team",
    teamId: "team_002",
    expertise: ["Financial Institutions", "D&O", "E&O", "Banking"],
    yearsExperience: 5,
    totalCapacity: 100,
    capacity: 45,
    matchScore: 55,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_007",
        clientName: "Coastal Financial Services",
        workItemId: "workitem_007",
        roleId: "role_010",
        roleName: "Financial Institutions Specialist",
        chairId: "chair_036",
        chairName: "Lead Specialist",
        workload: 55,
        notes: "D&O and cyber program"
      }
    ]
  },
  {
    id: "member_016",
    name: "David Park",
    role: "Director - Cyber Security",
    title: "Director",
    location: "New York, NY",
    team: "Casualty Claims Team",
    teamId: "team_002",
    expertise: ["Cyber Security", "Risk", "Technology", "Compliance", "Data Breach"],
    yearsExperience: 16,
    totalCapacity: 100,
    capacity: 45,
    matchScore: 92,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_011",
        clientName: "TechVenture Solutions",
        workItemId: "workitem_011",
        roleId: "role_006",
        roleName: "Cyber Risk Analyst",
        chairId: "chair_021",
        chairName: "Lead Analyst",
        workload: 35,
        notes: "Tech startup cyber program"
      },
      {
        clientId: "client_014",
        clientName: "Apex Media Holdings",
        workItemId: "workitem_014",
        roleId: "role_006",
        roleName: "Cyber Risk Analyst",
        chairId: "chair_022",
        chairName: "Threat Specialist",
        workload: 20,
        notes: "Media company cyber exposure"
      }
    ]
  },
  {
    id: "member_017",
    name: "Michael Chen",
    role: "Director - Claims",
    title: "Director",
    location: "Chicago, IL",
    team: "Casualty Claims Team",
    teamId: "team_002",
    expertise: ["Claims", "Cyber Security", "Risk Management", "Large Loss"],
    yearsExperience: 17,
    totalCapacity: 100,
    capacity: 50,
    matchScore: 88,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_001",
        clientName: "Acme Energy Corp",
        workItemId: "workitem_001",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_011",
        chairName: "Investigation Lead",
        workload: 30,
        notes: "Major loss oversight"
      },
      {
        clientId: "client_006",
        clientName: "Northern Energy Resources",
        workItemId: "workitem_006",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_010",
        chairName: "Lead Adjuster",
        workload: 20,
        notes: "Energy claims management"
      }
    ]
  },
  {
    id: "member_018",
    name: "Robert Thompson",
    role: "VP - Management",
    title: "Vice President",
    location: "New York, NY",
    team: "Casualty Claims Team",
    teamId: "team_002",
    expertise: ["Management", "Executive", "Claims", "D&O"],
    yearsExperience: 19,
    totalCapacity: 100,
    capacity: 35,
    matchScore: 85,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_007",
        clientName: "Coastal Financial Services",
        workItemId: "workitem_007",
        roleId: "role_014",
        roleName: "D&O Specialist",
        chairId: "chair_048",
        chairName: "Lead Specialist",
        workload: 40,
        notes: "Bank D&O program"
      },
      {
        clientId: "client_013",
        clientName: "Sterling Pharmaceuticals",
        workItemId: "workitem_013",
        roleId: "role_014",
        roleName: "D&O Specialist",
        chairId: "chair_049",
        chairName: "EPL Analyst",
        workload: 25,
        notes: "Pharma executive liability"
      }
    ]
  },
  {
    id: "member_019",
    name: "Jennifer Martinez",
    role: "Director - Risk",
    title: "Director",
    location: "Miami, FL",
    team: "Casualty Claims Team",
    teamId: "team_002",
    expertise: ["Aviation", "Risk Consulting", "Marine", "Property", "Specialty Lines"],
    yearsExperience: 14,
    totalCapacity: 100,
    capacity: 40,
    matchScore: 90,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_017",
        clientName: "Elite Aviation Services",
        workItemId: "workitem_019",
        roleId: "role_011",
        roleName: "Aviation Specialist",
        chairId: "chair_039",
        chairName: "Lead Specialist",
        workload: 40,
        notes: "Private jet fleet coverage"
      },
      {
        clientId: "client_008",
        clientName: "Global Shipping Lines",
        workItemId: "workitem_008",
        roleId: "role_005",
        roleName: "Account Executive",
        chairId: "chair_019",
        chairName: "Claims Liaison",
        workload: 20,
        notes: "Cargo claims coordination"
      }
    ]
  },
  {
    id: "member_020",
    name: "Kumar Lee",
    role: "SVP - Oversight",
    title: "Senior Vice President",
    location: "New York, NY",
    team: "Casualty Claims Team",
    teamId: "team_002",
    expertise: ["Accounts", "Risk", "Management", "D&O", "Governance"],
    yearsExperience: 21,
    totalCapacity: 100,
    capacity: 30,
    matchScore: 80,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_001",
        clientName: "Acme Energy Corp",
        workItemId: "workitem_001",
        roleId: "role_014",
        roleName: "D&O Specialist",
        chairId: "chair_048",
        chairName: "Lead Specialist",
        workload: 35,
        notes: "Executive risk oversight"
      },
      {
        clientId: "client_003",
        clientName: "Summit Healthcare Systems",
        workItemId: "workitem_003",
        roleId: "role_014",
        roleName: "D&O Specialist",
        chairId: "chair_049",
        chairName: "EPL Analyst",
        workload: 35,
        notes: "Healthcare governance"
      }
    ]
  },
  {
    id: "member_021",
    name: "Jessica Williams",
    role: "VP - Claims Operations",
    title: "Vice President",
    location: "Boston, MA",
    team: "Casualty Claims Team",
    teamId: "team_002",
    expertise: ["Claims", "Operations", "Cyber Security", "Process Improvement"],
    yearsExperience: 13,
    totalCapacity: 100,
    capacity: 55,
    matchScore: 78,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_003",
        clientName: "Summit Healthcare Systems",
        workItemId: "workitem_003",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_011",
        chairName: "Investigation Lead",
        workload: 25,
        notes: "Claims process optimization"
      },
      {
        clientId: "client_012",
        clientName: "Metro Transit Authority",
        workItemId: "workitem_012",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_010",
        chairName: "Lead Adjuster",
        workload: 20,
        notes: "Transit claims management"
      }
    ]
  },
  {
    id: "member_022",
    name: "Emily Rodriguez",
    role: "Director - Cyber Operations",
    title: "Director",
    location: "San Francisco, CA",
    team: "Casualty Claims Team",
    teamId: "team_002",
    expertise: ["Cyber Security", "Technology", "Audit", "Incident Response", "Privacy"],
    yearsExperience: 11,
    totalCapacity: 100,
    capacity: 48,
    matchScore: 86,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_016",
        clientName: "Quantum Data Centers",
        workItemId: "workitem_016",
        roleId: "role_006",
        roleName: "Cyber Risk Analyst",
        chairId: "chair_022",
        chairName: "Threat Specialist",
        workload: 30,
        notes: "Critical infrastructure cyber"
      },
      {
        clientId: "client_014",
        clientName: "Apex Media Holdings",
        workItemId: "workitem_014",
        roleId: "role_006",
        roleName: "Cyber Risk Analyst",
        chairId: "chair_023",
        chairName: "Incident Response Lead",
        workload: 22,
        notes: "Media breach response planning"
      }
    ]
  },
  // Additional team members (75 more to reach 97 total)
  // Commercial Underwriting Team (8 members)
  {
    id: "member_023",
    name: "William Harper",
    role: "Lead Underwriter",
    title: "Lead Underwriter",
    location: "Houston, TX",
    team: "Commercial Underwriting Team",
    teamId: "team_003",
    expertise: ["Commercial Lines", "Energy", "Large Accounts", "Pricing"],
    yearsExperience: 16,
    totalCapacity: 100,
    capacity: 35,
    matchScore: 88,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_006",
        clientName: "Northern Energy Resources",
        workItemId: "workitem_006",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_014",
        chairName: "Lead Underwriter",
        workload: 40,
        notes: "Complex energy account"
      },
      {
        clientId: "client_001",
        clientName: "Acme Energy Corp",
        workItemId: "workitem_001",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_015",
        chairName: "Risk Analyst",
        workload: 25,
        notes: "Renewal underwriting"
      }
    ]
  },
  {
    id: "member_024",
    name: "Karen Thompson",
    role: "Underwriting Specialist",
    title: "Underwriting Specialist",
    location: "Los Angeles, CA",
    team: "Commercial Underwriting Team",
    teamId: "team_003",
    expertise: ["Retail", "Hospitality", "Property", "Casualty"],
    yearsExperience: 9,
    totalCapacity: 100,
    capacity: 50,
    matchScore: 75,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_010",
        clientName: "Heritage Hotels Group",
        workItemId: "workitem_010",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_014",
        chairName: "Lead Underwriter",
        workload: 35,
        notes: "Hospitality program"
      },
      {
        clientId: "client_009",
        clientName: "Pacific Retail Holdings",
        workItemId: "workitem_009",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_015",
        chairName: "Risk Analyst",
        workload: 15,
        notes: "Retail risk assessment"
      }
    ]
  },
  {
    id: "member_025",
    name: "James Wilson",
    role: "Senior Underwriter",
    title: "Senior Underwriter",
    location: "Phoenix, AZ",
    team: "Commercial Underwriting Team",
    teamId: "team_003",
    expertise: ["Construction", "Surety", "Contractors", "Infrastructure"],
    yearsExperience: 14,
    totalCapacity: 100,
    capacity: 45,
    matchScore: 82,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_005",
        clientName: "Meridian Construction Group",
        workItemId: "workitem_005",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_014",
        chairName: "Lead Underwriter",
        workload: 40,
        notes: "Construction program renewal"
      },
      {
        clientId: "client_018",
        clientName: "Pioneer Mining Corp",
        workItemId: "workitem_018",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_016",
        chairName: "Portfolio Reviewer",
        workload: 15,
        notes: "Mining operations review"
      }
    ]
  },
  {
    id: "member_026",
    name: "Nicole Stevens",
    role: "Underwriting Analyst",
    title: "Underwriting Analyst",
    location: "Charlotte, NC",
    team: "Commercial Underwriting Team",
    teamId: "team_003",
    expertise: ["Financial Services", "Professional Liability", "Pricing Models"],
    yearsExperience: 5,
    totalCapacity: 100,
    capacity: 60,
    matchScore: 70,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_007",
        clientName: "Coastal Financial Services",
        workItemId: "workitem_007",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_015",
        chairName: "Risk Analyst",
        workload: 40,
        notes: "FI underwriting support"
      }
    ]
  },
  {
    id: "member_027",
    name: "Brian Adams",
    role: "Portfolio Manager",
    title: "Portfolio Manager",
    location: "Indianapolis, IN",
    team: "Commercial Underwriting Team",
    teamId: "team_003",
    expertise: ["Trucking", "Transportation", "Fleet", "Commercial Auto"],
    yearsExperience: 12,
    totalCapacity: 100,
    capacity: 40,
    matchScore: 77,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_002",
        clientName: "Atlantic Logistics Partners",
        workItemId: "workitem_002",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_016",
        chairName: "Portfolio Reviewer",
        workload: 30,
        notes: "Logistics portfolio"
      },
      {
        clientId: "client_012",
        clientName: "Metro Transit Authority",
        workItemId: "workitem_012",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_014",
        chairName: "Lead Underwriter",
        workload: 30,
        notes: "Public transit fleet"
      }
    ]
  },
  {
    id: "member_028",
    name: "Michelle Torres",
    role: "Underwriting Specialist",
    title: "Underwriting Specialist",
    location: "Atlanta, GA",
    team: "Commercial Underwriting Team",
    teamId: "team_003",
    expertise: ["Real Estate", "Property", "Landlord Liability", "Commercial"],
    yearsExperience: 8,
    totalCapacity: 100,
    capacity: 55,
    matchScore: 73,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_015",
        clientName: "National Real Estate Partners",
        workItemId: "workitem_015",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_014",
        chairName: "Lead Underwriter",
        workload: 45,
        notes: "Real estate portfolio"
      }
    ]
  },
  {
    id: "member_029",
    name: "Christopher Lee",
    role: "Risk Analyst",
    title: "Risk Analyst",
    location: "Denver, CO",
    team: "Commercial Underwriting Team",
    teamId: "team_003",
    expertise: ["Mining", "Natural Resources", "Environmental", "Heavy Industry"],
    yearsExperience: 7,
    totalCapacity: 100,
    capacity: 65,
    matchScore: 68,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_018",
        clientName: "Pioneer Mining Corp",
        workItemId: "workitem_018",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_015",
        chairName: "Risk Analyst",
        workload: 35,
        notes: "Mining risk analysis"
      }
    ]
  },
  {
    id: "member_030",
    name: "Angela Martinez",
    role: "Underwriting Coordinator",
    title: "Underwriting Coordinator",
    location: "Chicago, IL",
    team: "Commercial Underwriting Team",
    teamId: "team_003",
    expertise: ["Public Entity", "Government", "Transit", "Municipal"],
    yearsExperience: 6,
    totalCapacity: 100,
    capacity: 50,
    matchScore: 72,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_012",
        clientName: "Metro Transit Authority",
        workItemId: "workitem_012",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_015",
        chairName: "Risk Analyst",
        workload: 30,
        notes: "Transit underwriting support"
      },
      {
        clientId: "client_019",
        clientName: "Riverside Power & Utilities",
        workItemId: "workitem_019",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_016",
        chairName: "Portfolio Reviewer",
        workload: 20,
        notes: "Utility risk review"
      }
    ]
  },
  // Marine Cargo Team (7 members)
  {
    id: "member_031",
    name: "Captain James Moore",
    role: "Marine Account Director",
    title: "Account Director",
    location: "Long Beach, CA",
    team: "Marine Cargo Team",
    teamId: "team_004",
    expertise: ["Marine Hull", "P&I", "Cargo", "Shipping", "Vessel Operations"],
    yearsExperience: 25,
    totalCapacity: 100,
    capacity: 30,
    matchScore: 95,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_008",
        clientName: "Global Shipping Lines",
        workItemId: "workitem_008",
        roleId: "role_005",
        roleName: "Account Executive",
        chairId: "chair_017",
        chairName: "Account Director",
        workload: 50,
        notes: "12-vessel fleet coverage"
      },
      {
        clientId: "client_002",
        clientName: "Atlantic Logistics Partners",
        workItemId: "workitem_002",
        roleId: "role_005",
        roleName: "Account Executive",
        chairId: "chair_019",
        chairName: "Claims Liaison",
        workload: 20,
        notes: "Cargo claims oversight"
      }
    ]
  },
  {
    id: "member_032",
    name: "Victoria Hayes",
    role: "Cargo Specialist",
    title: "Cargo Specialist",
    location: "Los Angeles, CA",
    team: "Marine Cargo Team",
    teamId: "team_004",
    expertise: ["Cargo Insurance", "Transit", "Warehousing", "Supply Chain"],
    yearsExperience: 10,
    totalCapacity: 100,
    capacity: 45,
    matchScore: 85,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_002",
        clientName: "Atlantic Logistics Partners",
        workItemId: "workitem_002",
        roleId: "role_005",
        roleName: "Account Executive",
        chairId: "chair_018",
        chairName: "Cargo Specialist",
        workload: 35,
        notes: "International cargo routes"
      },
      {
        clientId: "client_008",
        clientName: "Global Shipping Lines",
        workItemId: "workitem_008",
        roleId: "role_005",
        roleName: "Account Executive",
        chairId: "chair_020",
        chairName: "Documentation Officer",
        workload: 20,
        notes: "Shipping documentation"
      }
    ]
  },
  {
    id: "member_033",
    name: "Richard Lane",
    role: "Marine Claims Specialist",
    title: "Marine Claims Specialist",
    location: "Houston, TX",
    team: "Marine Cargo Team",
    teamId: "team_004",
    expertise: ["Marine Claims", "General Average", "Salvage", "Cargo Damage"],
    yearsExperience: 13,
    totalCapacity: 100,
    capacity: 40,
    matchScore: 80,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_008",
        clientName: "Global Shipping Lines",
        workItemId: "workitem_008",
        roleId: "role_005",
        roleName: "Account Executive",
        chairId: "chair_019",
        chairName: "Claims Liaison",
        workload: 40,
        notes: "Major cargo claims"
      },
      {
        clientId: "client_002",
        clientName: "Atlantic Logistics Partners",
        workItemId: "workitem_002",
        roleId: "role_005",
        roleName: "Account Executive",
        chairId: "chair_020",
        chairName: "Documentation Officer",
        workload: 20,
        notes: "Claims documentation"
      }
    ]
  },
  {
    id: "member_034",
    name: "Mark Sullivan",
    role: "Marine Underwriter",
    title: "Marine Underwriter",
    location: "New York, NY",
    team: "Marine Cargo Team",
    teamId: "team_004",
    expertise: ["Marine Hull", "War Risk", "Piracy", "Offshore"],
    yearsExperience: 15,
    totalCapacity: 100,
    capacity: 50,
    matchScore: 78,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_008",
        clientName: "Global Shipping Lines",
        workItemId: "workitem_008",
        roleId: "role_005",
        roleName: "Account Executive",
        chairId: "chair_018",
        chairName: "Cargo Specialist",
        workload: 30,
        notes: "Hull coverage review"
      },
      {
        clientId: "client_006",
        clientName: "Northern Energy Resources",
        workItemId: "workitem_006",
        roleId: "role_005",
        roleName: "Account Executive",
        chairId: "chair_017",
        chairName: "Account Director",
        workload: 20,
        notes: "Offshore marine"
      }
    ]
  },
  {
    id: "member_035",
    name: "Susan Wright",
    role: "Marine Account Manager",
    title: "Account Manager",
    location: "Portland, OR",
    team: "Marine Cargo Team",
    teamId: "team_004",
    expertise: ["Marine Cargo", "Logistics", "Port Operations", "Containerization"],
    yearsExperience: 8,
    totalCapacity: 100,
    capacity: 60,
    matchScore: 72,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_002",
        clientName: "Atlantic Logistics Partners",
        workItemId: "workitem_002",
        roleId: "role_005",
        roleName: "Account Executive",
        chairId: "chair_017",
        chairName: "Account Director",
        workload: 40,
        notes: "Container logistics"
      }
    ]
  },
  {
    id: "member_036",
    name: "Robert Kim",
    role: "Marine Risk Engineer",
    title: "Risk Engineer",
    location: "Seattle, WA",
    team: "Marine Cargo Team",
    teamId: "team_004",
    expertise: ["Vessel Inspection", "Risk Assessment", "Marine Safety", "ISO Standards"],
    yearsExperience: 11,
    totalCapacity: 100,
    capacity: 55,
    matchScore: 75,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_008",
        clientName: "Global Shipping Lines",
        workItemId: "workitem_008",
        roleId: "role_002",
        roleName: "Risk Engineer",
        chairId: "chair_006",
        chairName: "Lead Engineer",
        workload: 30,
        notes: "Fleet inspections"
      },
      {
        clientId: "client_017",
        clientName: "Elite Aviation Services",
        workItemId: "workitem_019",
        roleId: "role_002",
        roleName: "Risk Engineer",
        chairId: "chair_007",
        chairName: "Field Engineer",
        workload: 15,
        notes: "Aviation facility review"
      }
    ]
  },
  {
    id: "member_037",
    name: "Linda Chen",
    role: "Cargo Claims Analyst",
    title: "Claims Analyst",
    location: "Long Beach, CA",
    team: "Marine Cargo Team",
    teamId: "team_004",
    expertise: ["Cargo Claims", "Subrogation", "Documentation", "Investigations"],
    yearsExperience: 6,
    totalCapacity: 100,
    capacity: 65,
    matchScore: 68,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_002",
        clientName: "Atlantic Logistics Partners",
        workItemId: "workitem_002",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_012",
        chairName: "Subrogation Specialist",
        workload: 35,
        notes: "Cargo claims recovery"
      }
    ]
  },
  // Cyber Security Team (6 members)
  {
    id: "member_038",
    name: "Ryan Foster",
    role: "Cyber Risk Manager",
    title: "Cyber Risk Manager",
    location: "San Francisco, CA",
    team: "Cyber Security Team",
    teamId: "team_005",
    expertise: ["Cyber Risk", "Data Breach", "Ransomware", "Business Interruption"],
    yearsExperience: 9,
    totalCapacity: 100,
    capacity: 40,
    matchScore: 90,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_011",
        clientName: "TechVenture Solutions",
        workItemId: "workitem_011",
        roleId: "role_006",
        roleName: "Cyber Risk Analyst",
        chairId: "chair_022",
        chairName: "Threat Specialist",
        workload: 35,
        notes: "Startup cyber risk"
      },
      {
        clientId: "client_016",
        clientName: "Quantum Data Centers",
        workItemId: "workitem_016",
        roleId: "role_006",
        roleName: "Cyber Risk Analyst",
        chairId: "chair_023",
        chairName: "Incident Response Lead",
        workload: 25,
        notes: "Critical infrastructure"
      }
    ]
  },
  {
    id: "member_039",
    name: "Samantha Lee",
    role: "Privacy Specialist",
    title: "Privacy Specialist",
    location: "New York, NY",
    team: "Cyber Security Team",
    teamId: "team_005",
    expertise: ["Data Privacy", "GDPR", "CCPA", "Regulatory Compliance"],
    yearsExperience: 7,
    totalCapacity: 100,
    capacity: 50,
    matchScore: 85,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_007",
        clientName: "Coastal Financial Services",
        workItemId: "workitem_007",
        roleId: "role_006",
        roleName: "Cyber Risk Analyst",
        chairId: "chair_021",
        chairName: "Lead Analyst",
        workload: 30,
        notes: "Banking privacy"
      },
      {
        clientId: "client_013",
        clientName: "Sterling Pharmaceuticals",
        workItemId: "workitem_013",
        roleId: "role_006",
        roleName: "Cyber Risk Analyst",
        chairId: "chair_022",
        chairName: "Threat Specialist",
        workload: 20,
        notes: "HIPAA compliance"
      }
    ]
  },
  {
    id: "member_040",
    name: "Jason Park",
    role: "Incident Response Specialist",
    title: "Incident Response Specialist",
    location: "Boston, MA",
    team: "Cyber Security Team",
    teamId: "team_005",
    expertise: ["Breach Response", "Forensics", "Crisis Management", "Vendor Management"],
    yearsExperience: 8,
    totalCapacity: 100,
    capacity: 45,
    matchScore: 82,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_014",
        clientName: "Apex Media Holdings",
        workItemId: "workitem_014",
        roleId: "role_006",
        roleName: "Cyber Risk Analyst",
        chairId: "chair_021",
        chairName: "Lead Analyst",
        workload: 35,
        notes: "Media cyber program"
      },
      {
        clientId: "client_011",
        clientName: "TechVenture Solutions",
        workItemId: "workitem_011",
        roleId: "role_006",
        roleName: "Cyber Risk Analyst",
        chairId: "chair_023",
        chairName: "Incident Response Lead",
        workload: 20,
        notes: "Incident planning"
      }
    ]
  },
  {
    id: "member_041",
    name: "Kevin Chen",
    role: "Cyber Underwriter",
    title: "Cyber Underwriter",
    location: "Chicago, IL",
    team: "Cyber Security Team",
    teamId: "team_005",
    expertise: ["Cyber Underwriting", "Technology Risk", "Pricing", "Portfolio"],
    yearsExperience: 6,
    totalCapacity: 100,
    capacity: 55,
    matchScore: 78,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_016",
        clientName: "Quantum Data Centers",
        workItemId: "workitem_016",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_014",
        chairName: "Lead Underwriter",
        workload: 45,
        notes: "Data center underwriting"
      }
    ]
  },
  {
    id: "member_042",
    name: "Monica Davis",
    role: "Cyber Claims Analyst",
    title: "Claims Analyst",
    location: "Atlanta, GA",
    team: "Cyber Security Team",
    teamId: "team_005",
    expertise: ["Cyber Claims", "Business Interruption", "Extortion", "Privacy Breach"],
    yearsExperience: 5,
    totalCapacity: 100,
    capacity: 60,
    matchScore: 72,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_007",
        clientName: "Coastal Financial Services",
        workItemId: "workitem_007",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_013",
        chairName: "Documentation Analyst",
        workload: 25,
        notes: "FI cyber claims"
      },
      {
        clientId: "client_014",
        clientName: "Apex Media Holdings",
        workItemId: "workitem_014",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_012",
        chairName: "Subrogation Specialist",
        workload: 15,
        notes: "Media breach claims"
      }
    ]
  },
  {
    id: "member_043",
    name: "Tom Anderson",
    role: "Security Consultant",
    title: "Security Consultant",
    location: "Dallas, TX",
    team: "Cyber Security Team",
    teamId: "team_005",
    expertise: ["Security Assessment", "Penetration Testing", "Vulnerability Management"],
    yearsExperience: 10,
    totalCapacity: 100,
    capacity: 50,
    matchScore: 75,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_011",
        clientName: "TechVenture Solutions",
        workItemId: "workitem_011",
        roleId: "role_002",
        roleName: "Risk Engineer",
        chairId: "chair_008",
        chairName: "Technical Reviewer",
        workload: 30,
        notes: "Security assessment"
      },
      {
        clientId: "client_016",
        clientName: "Quantum Data Centers",
        workItemId: "workitem_016",
        roleId: "role_002",
        roleName: "Risk Engineer",
        chairId: "chair_009",
        chairName: "CAT Specialist",
        workload: 20,
        notes: "Infrastructure review"
      }
    ]
  },
  // Healthcare Team (9 members)
  {
    id: "member_044",
    name: "Dr. Patricia Brown",
    role: "Healthcare Practice Leader",
    title: "Practice Leader",
    location: "Cleveland, OH",
    team: "Healthcare Team",
    teamId: "team_006",
    expertise: ["Medical Malpractice", "Hospital Liability", "Physician Coverage"],
    yearsExperience: 20,
    totalCapacity: 100,
    capacity: 30,
    matchScore: 95,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_003",
        clientName: "Summit Healthcare Systems",
        workItemId: "workitem_003",
        roleId: "role_007",
        roleName: "Healthcare Specialist",
        chairId: "chair_024",
        chairName: "Lead Specialist",
        workload: 45,
        notes: "Hospital network coverage"
      },
      {
        clientId: "client_013",
        clientName: "Sterling Pharmaceuticals",
        workItemId: "workitem_013",
        roleId: "role_007",
        roleName: "Healthcare Specialist",
        chairId: "chair_025",
        chairName: "Facility Risk Manager",
        workload: 25,
        notes: "Clinical trials liability"
      }
    ]
  },
  {
    id: "member_045",
    name: "Dr. Alan Foster",
    role: "Clinical Risk Specialist",
    title: "Clinical Risk Specialist",
    location: "Houston, TX",
    team: "Healthcare Team",
    teamId: "team_006",
    expertise: ["Clinical Trials", "Life Sciences", "Pharmaceutical", "Biotech"],
    yearsExperience: 18,
    totalCapacity: 100,
    capacity: 35,
    matchScore: 90,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_013",
        clientName: "Sterling Pharmaceuticals",
        workItemId: "workitem_013",
        roleId: "role_007",
        roleName: "Healthcare Specialist",
        chairId: "chair_024",
        chairName: "Lead Specialist",
        workload: 50,
        notes: "Pharma liability program"
      },
      {
        clientId: "client_003",
        clientName: "Summit Healthcare Systems",
        workItemId: "workitem_003",
        roleId: "role_007",
        roleName: "Healthcare Specialist",
        chairId: "chair_026",
        chairName: "Claims Coordinator",
        workload: 15,
        notes: "Medical device claims"
      }
    ]
  },
  {
    id: "member_046",
    name: "Nancy Williams",
    role: "Hospital Risk Manager",
    title: "Hospital Risk Manager",
    location: "Boston, MA",
    team: "Healthcare Team",
    teamId: "team_006",
    expertise: ["Hospital Administration", "Patient Safety", "Quality Improvement"],
    yearsExperience: 14,
    totalCapacity: 100,
    capacity: 40,
    matchScore: 85,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_003",
        clientName: "Summit Healthcare Systems",
        workItemId: "workitem_003",
        roleId: "role_007",
        roleName: "Healthcare Specialist",
        chairId: "chair_025",
        chairName: "Facility Risk Manager",
        workload: 40,
        notes: "Hospital facilities"
      },
      {
        clientId: "client_013",
        clientName: "Sterling Pharmaceuticals",
        workItemId: "workitem_013",
        roleId: "role_007",
        roleName: "Healthcare Specialist",
        chairId: "chair_027",
        chairName: "Compliance Advisor",
        workload: 20,
        notes: "FDA compliance"
      }
    ]
  },
  {
    id: "member_047",
    name: "Jennifer Adams",
    role: "Healthcare Claims Specialist",
    title: "Claims Specialist",
    location: "Las Vegas, NV",
    team: "Healthcare Team",
    teamId: "team_006",
    expertise: ["Medical Malpractice Claims", "Litigation", "Settlement"],
    yearsExperience: 11,
    totalCapacity: 100,
    capacity: 45,
    matchScore: 80,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_003",
        clientName: "Summit Healthcare Systems",
        workItemId: "workitem_003",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_010",
        chairName: "Lead Adjuster",
        workload: 35,
        notes: "Malpractice claims"
      },
      {
        clientId: "client_013",
        clientName: "Sterling Pharmaceuticals",
        workItemId: "workitem_013",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_011",
        chairName: "Investigation Lead",
        workload: 20,
        notes: "Product liability claims"
      }
    ]
  },
  {
    id: "member_048",
    name: "Thomas Green",
    role: "Physician Liaison",
    title: "Physician Liaison",
    location: "Des Moines, IA",
    team: "Healthcare Team",
    teamId: "team_006",
    expertise: ["Physician Groups", "Medical Societies", "Practice Management"],
    yearsExperience: 9,
    totalCapacity: 100,
    capacity: 55,
    matchScore: 75,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_003",
        clientName: "Summit Healthcare Systems",
        workItemId: "workitem_003",
        roleId: "role_007",
        roleName: "Healthcare Specialist",
        chairId: "chair_027",
        chairName: "Compliance Advisor",
        workload: 30,
        notes: "Physician credentialing"
      },
      {
        clientId: "internal",
        clientName: "Greenfield Agriculture Co",
        workItemId: "workitem_ag01",
        roleId: "role_007",
        roleName: "Healthcare Specialist",
        chairId: "chair_026",
        chairName: "Claims Coordinator",
        workload: 15,
        notes: "Agricultural workers comp"
      }
    ]
  },
  {
    id: "member_049",
    name: "Rachel Martinez",
    role: "Healthcare Underwriter",
    title: "Underwriter",
    location: "New Jersey",
    team: "Healthcare Team",
    teamId: "team_006",
    expertise: ["Healthcare Underwriting", "Risk Selection", "Pricing", "Portfolio"],
    yearsExperience: 8,
    totalCapacity: 100,
    capacity: 50,
    matchScore: 72,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_003",
        clientName: "Summit Healthcare Systems",
        workItemId: "workitem_003",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_014",
        chairName: "Lead Underwriter",
        workload: 35,
        notes: "Healthcare underwriting"
      },
      {
        clientId: "client_013",
        clientName: "Sterling Pharmaceuticals",
        workItemId: "workitem_013",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_015",
        chairName: "Risk Analyst",
        workload: 15,
        notes: "Life sciences pricing"
      }
    ]
  },
  {
    id: "member_050",
    name: "David Roberts",
    role: "Clinical Risk Consultant",
    title: "Risk Consultant",
    location: "Philadelphia, PA",
    team: "Healthcare Team",
    teamId: "team_006",
    expertise: ["Patient Safety", "Clinical Governance", "Accreditation"],
    yearsExperience: 12,
    totalCapacity: 100,
    capacity: 45,
    matchScore: 78,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_003",
        clientName: "Summit Healthcare Systems",
        workItemId: "workitem_003",
        roleId: "role_002",
        roleName: "Risk Engineer",
        chairId: "chair_006",
        chairName: "Lead Engineer",
        workload: 35,
        notes: "Hospital risk survey"
      },
      {
        clientId: "client_013",
        clientName: "Sterling Pharmaceuticals",
        workItemId: "workitem_013",
        roleId: "role_002",
        roleName: "Risk Engineer",
        chairId: "chair_007",
        chairName: "Field Engineer",
        workload: 20,
        notes: "Manufacturing facility"
      }
    ]
  },
  {
    id: "member_051",
    name: "Caroline Kim",
    role: "Healthcare Account Manager",
    title: "Account Manager",
    location: "Minneapolis, MN",
    team: "Healthcare Team",
    teamId: "team_006",
    expertise: ["Healthcare Administration", "Client Relations", "Renewals"],
    yearsExperience: 7,
    totalCapacity: 100,
    capacity: 60,
    matchScore: 70,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_003",
        clientName: "Summit Healthcare Systems",
        workItemId: "workitem_003",
        roleId: "role_001",
        roleName: "Senior Account Manager",
        chairId: "chair_003",
        chairName: "Renewal Coordinator",
        workload: 30,
        notes: "Renewal management"
      },
      {
        clientId: "client_013",
        clientName: "Sterling Pharmaceuticals",
        workItemId: "workitem_013",
        roleId: "role_001",
        roleName: "Senior Account Manager",
        chairId: "chair_004",
        chairName: "Client Service Lead",
        workload: 10,
        notes: "Service delivery"
      }
    ]
  },
  {
    id: "member_052",
    name: "Steve Johnson",
    role: "Long-term Care Specialist",
    title: "Specialist",
    location: "Tampa, FL",
    team: "Healthcare Team",
    teamId: "team_006",
    expertise: ["Long-term Care", "Nursing Homes", "Assisted Living", "Eldercare"],
    yearsExperience: 10,
    totalCapacity: 100,
    capacity: 55,
    matchScore: 68,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_003",
        clientName: "Summit Healthcare Systems",
        workItemId: "workitem_003",
        roleId: "role_007",
        roleName: "Healthcare Specialist",
        chairId: "chair_026",
        chairName: "Claims Coordinator",
        workload: 25,
        notes: "LTC facilities"
      },
      {
        clientId: "internal",
        clientName: "Regional Healthcare Network",
        workItemId: "workitem_hc_02",
        roleId: "role_007",
        roleName: "Healthcare Specialist",
        chairId: "chair_027",
        chairName: "Compliance Advisor",
        workload: 20,
        notes: "Nursing home compliance"
      }
    ]
  },
  // Construction Team (8 members)
  {
    id: "member_053",
    name: "Mike Patterson",
    role: "Construction Practice Leader",
    title: "Practice Leader",
    location: "Phoenix, AZ",
    team: "Construction Team",
    teamId: "team_007",
    expertise: ["Large Construction", "Wrap-ups", "OCIP", "CCIP"],
    yearsExperience: 22,
    totalCapacity: 100,
    capacity: 30,
    matchScore: 95,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_005",
        clientName: "Meridian Construction Group",
        workItemId: "workitem_005",
        roleId: "role_008",
        roleName: "Construction Specialist",
        chairId: "chair_028",
        chairName: "Project Lead",
        workload: 50,
        notes: "Major infrastructure"
      },
      {
        clientId: "client_018",
        clientName: "Pioneer Mining Corp",
        workItemId: "workitem_018",
        roleId: "role_008",
        roleName: "Construction Specialist",
        chairId: "chair_030",
        chairName: "Subcontractor Coordinator",
        workload: 20,
        notes: "Mining construction"
      }
    ]
  },
  {
    id: "member_054",
    name: "John Sullivan",
    role: "Surety Bond Manager",
    title: "Surety Bond Manager",
    location: "Denver, CO",
    team: "Construction Team",
    teamId: "team_007",
    expertise: ["Surety Bonds", "Performance Bonds", "Payment Bonds", "Bid Bonds"],
    yearsExperience: 15,
    totalCapacity: 100,
    capacity: 40,
    matchScore: 88,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_005",
        clientName: "Meridian Construction Group",
        workItemId: "workitem_005",
        roleId: "role_008",
        roleName: "Construction Specialist",
        chairId: "chair_029",
        chairName: "Surety Bond Manager",
        workload: 40,
        notes: "Bond program"
      },
      {
        clientId: "client_012",
        clientName: "Metro Transit Authority",
        workItemId: "workitem_012",
        roleId: "role_008",
        roleName: "Construction Specialist",
        chairId: "chair_029",
        chairName: "Surety Bond Manager",
        workload: 20,
        notes: "Infrastructure bonds"
      }
    ]
  },
  {
    id: "member_055",
    name: "Sarah Collins",
    role: "Construction Underwriter",
    title: "Construction Underwriter",
    location: "Dallas, TX",
    team: "Construction Team",
    teamId: "team_007",
    expertise: ["Builders Risk", "Construction Liability", "Wrap-ups"],
    yearsExperience: 11,
    totalCapacity: 100,
    capacity: 45,
    matchScore: 82,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_005",
        clientName: "Meridian Construction Group",
        workItemId: "workitem_005",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_014",
        chairName: "Lead Underwriter",
        workload: 40,
        notes: "Construction underwriting"
      },
      {
        clientId: "client_015",
        clientName: "National Real Estate Partners",
        workItemId: "workitem_015",
        roleId: "role_008",
        roleName: "Construction Specialist",
        chairId: "chair_028",
        chairName: "Project Lead",
        workload: 15,
        notes: "Development projects"
      }
    ]
  },
  {
    id: "member_056",
    name: "Dave Thompson",
    role: "Construction Risk Engineer",
    title: "Risk Engineer",
    location: "Phoenix, AZ",
    team: "Construction Team",
    teamId: "team_007",
    expertise: ["Site Safety", "OSHA", "Loss Control", "Construction Safety"],
    yearsExperience: 13,
    totalCapacity: 100,
    capacity: 50,
    matchScore: 80,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_005",
        clientName: "Meridian Construction Group",
        workItemId: "workitem_005",
        roleId: "role_002",
        roleName: "Risk Engineer",
        chairId: "chair_006",
        chairName: "Lead Engineer",
        workload: 35,
        notes: "Site inspections"
      },
      {
        clientId: "client_018",
        clientName: "Pioneer Mining Corp",
        workItemId: "workitem_018",
        roleId: "role_002",
        roleName: "Risk Engineer",
        chairId: "chair_007",
        chairName: "Field Engineer",
        workload: 15,
        notes: "Mining safety"
      }
    ]
  },
  {
    id: "member_057",
    name: "Amy Rodriguez",
    role: "Subcontractor Coordinator",
    title: "Subcontractor Coordinator",
    location: "Los Angeles, CA",
    team: "Construction Team",
    teamId: "team_007",
    expertise: ["Subcontractor Management", "COIs", "Compliance Tracking"],
    yearsExperience: 8,
    totalCapacity: 100,
    capacity: 55,
    matchScore: 75,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_005",
        clientName: "Meridian Construction Group",
        workItemId: "workitem_005",
        roleId: "role_008",
        roleName: "Construction Specialist",
        chairId: "chair_030",
        chairName: "Subcontractor Coordinator",
        workload: 30,
        notes: "Sub tracking"
      },
      {
        clientId: "client_015",
        clientName: "National Real Estate Partners",
        workItemId: "workitem_015",
        roleId: "role_008",
        roleName: "Construction Specialist",
        chairId: "chair_030",
        chairName: "Subcontractor Coordinator",
        workload: 15,
        notes: "Contractor compliance"
      }
    ]
  },
  {
    id: "member_058",
    name: "Chris Martin",
    role: "Construction Claims Specialist",
    title: "Claims Specialist",
    location: "Seattle, WA",
    team: "Construction Team",
    teamId: "team_007",
    expertise: ["Construction Defect", "Delay Claims", "Coverage Disputes"],
    yearsExperience: 10,
    totalCapacity: 100,
    capacity: 50,
    matchScore: 78,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_005",
        clientName: "Meridian Construction Group",
        workItemId: "workitem_005",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_010",
        chairName: "Lead Adjuster",
        workload: 35,
        notes: "Construction defect"
      },
      {
        clientId: "client_018",
        clientName: "Pioneer Mining Corp",
        workItemId: "workitem_018",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_011",
        chairName: "Investigation Lead",
        workload: 15,
        notes: "Equipment claims"
      }
    ]
  },
  {
    id: "member_059",
    name: "Jennifer White",
    role: "Wrap-up Specialist",
    title: "Wrap-up Specialist",
    location: "Chicago, IL",
    team: "Construction Team",
    teamId: "team_007",
    expertise: ["OCIP", "CCIP", "Rolling Wrap-ups", "Program Design"],
    yearsExperience: 12,
    totalCapacity: 100,
    capacity: 45,
    matchScore: 85,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_012",
        clientName: "Metro Transit Authority",
        workItemId: "workitem_012",
        roleId: "role_008",
        roleName: "Construction Specialist",
        chairId: "chair_028",
        chairName: "Project Lead",
        workload: 40,
        notes: "Transit OCIP"
      },
      {
        clientId: "client_005",
        clientName: "Meridian Construction Group",
        workItemId: "workitem_005",
        roleId: "role_008",
        roleName: "Construction Specialist",
        chairId: "chair_031",
        chairName: "Safety Consultant",
        workload: 15,
        notes: "Wrap-up oversight"
      }
    ]
  },
  {
    id: "member_060",
    name: "Paul Davis",
    role: "Infrastructure Specialist",
    title: "Infrastructure Specialist",
    location: "Atlanta, GA",
    team: "Construction Team",
    teamId: "team_007",
    expertise: ["Infrastructure", "PPP", "Public Works", "Transportation"],
    yearsExperience: 14,
    totalCapacity: 100,
    capacity: 40,
    matchScore: 80,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_012",
        clientName: "Metro Transit Authority",
        workItemId: "workitem_012",
        roleId: "role_008",
        roleName: "Construction Specialist",
        chairId: "chair_030",
        chairName: "Subcontractor Coordinator",
        workload: 35,
        notes: "Transit infrastructure"
      },
      {
        clientId: "client_019",
        clientName: "Riverside Power & Utilities",
        workItemId: "workitem_019",
        roleId: "role_008",
        roleName: "Construction Specialist",
        chairId: "chair_028",
        chairName: "Project Lead",
        workload: 25,
        notes: "Utility construction"
      }
    ]
  },
  // Energy Team (7 members)
  {
    id: "member_061",
    name: "William Harper Jr.",
    role: "Energy Practice Leader",
    title: "Practice Leader",
    location: "Houston, TX",
    team: "Energy Team",
    teamId: "team_008",
    expertise: ["Oil & Gas", "Petrochemical", "Offshore", "Midstream"],
    yearsExperience: 25,
    totalCapacity: 100,
    capacity: 25,
    matchScore: 98,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_001",
        clientName: "Acme Energy Corp",
        workItemId: "workitem_001",
        roleId: "role_009",
        roleName: "Energy Specialist",
        chairId: "chair_032",
        chairName: "Lead Specialist",
        workload: 45,
        notes: "Energy program oversight"
      },
      {
        clientId: "client_006",
        clientName: "Northern Energy Resources",
        workItemId: "workitem_006",
        roleId: "role_009",
        roleName: "Energy Specialist",
        chairId: "chair_033",
        chairName: "Upstream Engineer",
        workload: 30,
        notes: "Exploration coverage"
      }
    ]
  },
  {
    id: "member_062",
    name: "Catherine Moore",
    role: "Upstream Specialist",
    title: "Upstream Specialist",
    location: "Houston, TX",
    team: "Energy Team",
    teamId: "team_008",
    expertise: ["Drilling", "Exploration", "Well Control", "Blowout Prevention"],
    yearsExperience: 16,
    totalCapacity: 100,
    capacity: 35,
    matchScore: 90,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_001",
        clientName: "Acme Energy Corp",
        workItemId: "workitem_001",
        roleId: "role_009",
        roleName: "Energy Specialist",
        chairId: "chair_033",
        chairName: "Upstream Engineer",
        workload: 40,
        notes: "Drilling operations"
      },
      {
        clientId: "client_006",
        clientName: "Northern Energy Resources",
        workItemId: "workitem_006",
        roleId: "role_009",
        roleName: "Energy Specialist",
        chairId: "chair_034",
        chairName: "Downstream Analyst",
        workload: 25,
        notes: "Processing facilities"
      }
    ]
  },
  {
    id: "member_063",
    name: "Richard Gonzalez",
    role: "Downstream Analyst",
    title: "Downstream Analyst",
    location: "Baton Rouge, LA",
    team: "Energy Team",
    teamId: "team_008",
    expertise: ["Refining", "Petrochemical", "Pipelines", "Tank Farms"],
    yearsExperience: 13,
    totalCapacity: 100,
    capacity: 40,
    matchScore: 85,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_001",
        clientName: "Acme Energy Corp",
        workItemId: "workitem_001",
        roleId: "role_009",
        roleName: "Energy Specialist",
        chairId: "chair_034",
        chairName: "Downstream Analyst",
        workload: 35,
        notes: "Refinery coverage"
      },
      {
        clientId: "client_019",
        clientName: "Riverside Power & Utilities",
        workItemId: "workitem_019",
        roleId: "role_009",
        roleName: "Energy Specialist",
        chairId: "chair_032",
        chairName: "Lead Specialist",
        workload: 25,
        notes: "Power generation"
      }
    ]
  },
  {
    id: "member_064",
    name: "Emily Watson",
    role: "Energy Underwriter",
    title: "Energy Underwriter",
    location: "Houston, TX",
    team: "Energy Team",
    teamId: "team_008",
    expertise: ["Energy Underwriting", "Complex Risks", "Control of Well"],
    yearsExperience: 11,
    totalCapacity: 100,
    capacity: 45,
    matchScore: 82,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_006",
        clientName: "Northern Energy Resources",
        workItemId: "workitem_006",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_014",
        chairName: "Lead Underwriter",
        workload: 40,
        notes: "Energy underwriting"
      },
      {
        clientId: "client_001",
        clientName: "Acme Energy Corp",
        workItemId: "workitem_001",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_016",
        chairName: "Portfolio Reviewer",
        workload: 15,
        notes: "Renewal review"
      }
    ]
  },
  {
    id: "member_065",
    name: "Michael Perry",
    role: "Energy Claims Manager",
    title: "Claims Manager",
    location: "Houston, TX",
    team: "Energy Team",
    teamId: "team_008",
    expertise: ["Energy Claims", "Property Damage", "Business Interruption", "CAT"],
    yearsExperience: 14,
    totalCapacity: 100,
    capacity: 40,
    matchScore: 80,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_001",
        clientName: "Acme Energy Corp",
        workItemId: "workitem_001",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_012",
        chairName: "Subrogation Specialist",
        workload: 35,
        notes: "Energy claims recovery"
      },
      {
        clientId: "client_006",
        clientName: "Northern Energy Resources",
        workItemId: "workitem_006",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_011",
        chairName: "Investigation Lead",
        workload: 25,
        notes: "Loss investigation"
      }
    ]
  },
  {
    id: "member_066",
    name: "Laura Chen",
    role: "Renewable Energy Specialist",
    title: "Renewable Energy Specialist",
    location: "San Francisco, CA",
    team: "Energy Team",
    teamId: "team_008",
    expertise: ["Solar", "Wind", "Battery Storage", "Green Energy"],
    yearsExperience: 8,
    totalCapacity: 100,
    capacity: 55,
    matchScore: 75,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_019",
        clientName: "Riverside Power & Utilities",
        workItemId: "workitem_019",
        roleId: "role_009",
        roleName: "Energy Specialist",
        chairId: "chair_034",
        chairName: "Downstream Analyst",
        workload: 30,
        notes: "Renewable projects"
      },
      {
        clientId: "client_006",
        clientName: "Northern Energy Resources",
        workItemId: "workitem_006",
        roleId: "role_009",
        roleName: "Energy Specialist",
        chairId: "chair_035",
        chairName: "Environmental Liaison",
        workload: 15,
        notes: "Clean energy transition"
      }
    ]
  },
  {
    id: "member_067",
    name: "James Rodriguez",
    role: "Environmental Specialist",
    title: "Environmental Specialist",
    location: "Houston, TX",
    team: "Energy Team",
    teamId: "team_008",
    expertise: ["Pollution Liability", "Remediation", "EPA Compliance"],
    yearsExperience: 10,
    totalCapacity: 100,
    capacity: 50,
    matchScore: 78,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_001",
        clientName: "Acme Energy Corp",
        workItemId: "workitem_001",
        roleId: "role_009",
        roleName: "Energy Specialist",
        chairId: "chair_035",
        chairName: "Environmental Liaison",
        workload: 30,
        notes: "Environmental coverage"
      },
      {
        clientId: "client_018",
        clientName: "Pioneer Mining Corp",
        workItemId: "workitem_018",
        roleId: "role_012",
        roleName: "Environmental Specialist",
        chairId: "chair_042",
        chairName: "Lead Specialist",
        workload: 20,
        notes: "Mining remediation"
      }
    ]
  },
  // Additional members to reach 97 total (30 more members across remaining teams)
  // Financial Institutions Team (6 members)
  {
    id: "member_068",
    name: "Elizabeth Turner",
    role: "FI Practice Leader",
    title: "Practice Leader",
    location: "New York, NY",
    team: "Financial Institutions Team",
    teamId: "team_009",
    expertise: ["Banking", "Investment", "D&O", "E&O", "Fiduciary"],
    yearsExperience: 20,
    totalCapacity: 100,
    capacity: 30,
    matchScore: 95,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_007",
        clientName: "Coastal Financial Services",
        workItemId: "workitem_007",
        roleId: "role_010",
        roleName: "Financial Institutions Specialist",
        chairId: "chair_036",
        chairName: "Lead Specialist",
        workload: 45,
        notes: "Bank D&O program"
      },
      {
        clientId: "client_011",
        clientName: "TechVenture Solutions",
        workItemId: "workitem_011",
        roleId: "role_010",
        roleName: "Financial Institutions Specialist",
        chairId: "chair_037",
        chairName: "E&O Analyst",
        workload: 25,
        notes: "VC-backed D&O"
      }
    ]
  },
  {
    id: "member_069",
    name: "Andrew Kim",
    role: "Banking Specialist",
    title: "Banking Specialist",
    location: "Charlotte, NC",
    team: "Financial Institutions Team",
    teamId: "team_009",
    expertise: ["Commercial Banking", "Credit Risk", "Regulatory"],
    yearsExperience: 12,
    totalCapacity: 100,
    capacity: 45,
    matchScore: 85,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_007",
        clientName: "Coastal Financial Services",
        workItemId: "workitem_007",
        roleId: "role_010",
        roleName: "Financial Institutions Specialist",
        chairId: "chair_037",
        chairName: "E&O Analyst",
        workload: 35,
        notes: "E&O coverage"
      },
      {
        clientId: "client_007",
        clientName: "Coastal Financial Services",
        workItemId: "workitem_007",
        roleId: "role_010",
        roleName: "Financial Institutions Specialist",
        chairId: "chair_038",
        chairName: "Regulatory Specialist",
        workload: 20,
        notes: "Compliance"
      }
    ]
  },
  {
    id: "member_070",
    name: "Catherine Adams",
    role: "Investment Manager Specialist",
    title: "Specialist",
    location: "Boston, MA",
    team: "Financial Institutions Team",
    teamId: "team_009",
    expertise: ["Asset Management", "Hedge Funds", "Private Equity"],
    yearsExperience: 9,
    totalCapacity: 100,
    capacity: 55,
    matchScore: 78,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_011",
        clientName: "TechVenture Solutions",
        workItemId: "workitem_011",
        roleId: "role_010",
        roleName: "Financial Institutions Specialist",
        chairId: "chair_038",
        chairName: "Regulatory Specialist",
        workload: 25,
        notes: "VC compliance"
      },
      {
        clientId: "client_007",
        clientName: "Coastal Financial Services",
        workItemId: "workitem_007",
        roleId: "role_001",
        roleName: "Senior Account Manager",
        chairId: "chair_002",
        chairName: "Strategic Advisor",
        workload: 20,
        notes: "Investment products"
      }
    ]
  },
  {
    id: "member_071",
    name: "Daniel Wright",
    role: "FI Claims Manager",
    title: "Claims Manager",
    location: "New York, NY",
    team: "Financial Institutions Team",
    teamId: "team_009",
    expertise: ["Securities Claims", "D&O Defense", "Regulatory"],
    yearsExperience: 14,
    totalCapacity: 100,
    capacity: 40,
    matchScore: 82,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_007",
        clientName: "Coastal Financial Services",
        workItemId: "workitem_007",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_010",
        chairName: "Lead Adjuster",
        workload: 40,
        notes: "Securities claims"
      },
      {
        clientId: "client_011",
        clientName: "TechVenture Solutions",
        workItemId: "workitem_011",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_011",
        chairName: "Investigation Lead",
        workload: 20,
        notes: "D&O claims"
      }
    ]
  },
  {
    id: "member_072",
    name: "Nancy Peterson",
    role: "FI Underwriter",
    title: "FI Underwriter",
    location: "Chicago, IL",
    team: "Financial Institutions Team",
    teamId: "team_009",
    expertise: ["FI Underwriting", "Risk Selection", "Pricing"],
    yearsExperience: 8,
    totalCapacity: 100,
    capacity: 50,
    matchScore: 75,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_007",
        clientName: "Coastal Financial Services",
        workItemId: "workitem_007",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_014",
        chairName: "Lead Underwriter",
        workload: 35,
        notes: "FI underwriting"
      },
      {
        clientId: "client_011",
        clientName: "TechVenture Solutions",
        workItemId: "workitem_011",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_015",
        chairName: "Risk Analyst",
        workload: 15,
        notes: "Tech startup risk"
      }
    ]
  },
  {
    id: "member_073",
    name: "George Mitchell",
    role: "Regulatory Specialist",
    title: "Regulatory Specialist",
    location: "Washington, DC",
    team: "Financial Institutions Team",
    teamId: "team_009",
    expertise: ["SEC", "FINRA", "Regulatory Defense", "Investigations"],
    yearsExperience: 16,
    totalCapacity: 100,
    capacity: 45,
    matchScore: 80,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_007",
        clientName: "Coastal Financial Services",
        workItemId: "workitem_007",
        roleId: "role_010",
        roleName: "Financial Institutions Specialist",
        chairId: "chair_038",
        chairName: "Regulatory Specialist",
        workload: 40,
        notes: "Bank regulatory"
      },
      {
        clientId: "client_013",
        clientName: "Sterling Pharmaceuticals",
        workItemId: "workitem_013",
        roleId: "role_010",
        roleName: "Financial Institutions Specialist",
        chairId: "chair_037",
        chairName: "E&O Analyst",
        workload: 15,
        notes: "SEC compliance"
      }
    ]
  },
  // Aviation Team (5 members)
  {
    id: "member_074",
    name: "Captain David Miller",
    role: "Aviation Practice Leader",
    title: "Practice Leader",
    location: "Dallas, TX",
    team: "Aviation Team",
    teamId: "team_010",
    expertise: ["Aircraft", "Airlines", "Aviation Liability", "Hull Coverage"],
    yearsExperience: 28,
    totalCapacity: 100,
    capacity: 30,
    matchScore: 98,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_017",
        clientName: "Elite Aviation Services",
        workItemId: "workitem_019",
        roleId: "role_011",
        roleName: "Aviation Specialist",
        chairId: "chair_039",
        chairName: "Lead Specialist",
        workload: 50,
        notes: "Private jet fleet"
      },
      {
        clientId: "client_004",
        clientName: "Precision Aerospace Inc",
        workItemId: "workitem_004",
        roleId: "role_011",
        roleName: "Aviation Specialist",
        chairId: "chair_040",
        chairName: "Hull Specialist",
        workload: 20,
        notes: "Aerospace transition"
      }
    ]
  },
  {
    id: "member_075",
    name: "Sandra Lopez",
    role: "Aircraft Hull Specialist",
    title: "Hull Specialist",
    location: "Seattle, WA",
    team: "Aviation Team",
    teamId: "team_010",
    expertise: ["Hull Coverage", "War Risk", "Aircraft Valuation"],
    yearsExperience: 14,
    totalCapacity: 100,
    capacity: 45,
    matchScore: 88,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_017",
        clientName: "Elite Aviation Services",
        workItemId: "workitem_019",
        roleId: "role_011",
        roleName: "Aviation Specialist",
        chairId: "chair_040",
        chairName: "Hull Specialist",
        workload: 35,
        notes: "Fleet hull coverage"
      },
      {
        clientId: "client_004",
        clientName: "Precision Aerospace Inc",
        workItemId: "workitem_004",
        roleId: "role_011",
        roleName: "Aviation Specialist",
        chairId: "chair_041",
        chairName: "Operations Analyst",
        workload: 20,
        notes: "Test flight coverage"
      }
    ]
  },
  {
    id: "member_076",
    name: "Tom Harris",
    role: "Aviation Underwriter",
    title: "Aviation Underwriter",
    location: "Miami, FL",
    team: "Aviation Team",
    teamId: "team_010",
    expertise: ["Aviation Underwriting", "General Aviation", "Corporate Fleets"],
    yearsExperience: 11,
    totalCapacity: 100,
    capacity: 50,
    matchScore: 82,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_017",
        clientName: "Elite Aviation Services",
        workItemId: "workitem_019",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_014",
        chairName: "Lead Underwriter",
        workload: 35,
        notes: "Aviation underwriting"
      },
      {
        clientId: "client_004",
        clientName: "Precision Aerospace Inc",
        workItemId: "workitem_004",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_015",
        chairName: "Risk Analyst",
        workload: 15,
        notes: "Aerospace risk"
      }
    ]
  },
  {
    id: "member_077",
    name: "Rachel Green",
    role: "Aviation Claims Specialist",
    title: "Claims Specialist",
    location: "Denver, CO",
    team: "Aviation Team",
    teamId: "team_010",
    expertise: ["Aviation Claims", "NTSB", "Accident Investigation"],
    yearsExperience: 9,
    totalCapacity: 100,
    capacity: 55,
    matchScore: 78,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_017",
        clientName: "Elite Aviation Services",
        workItemId: "workitem_019",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_010",
        chairName: "Lead Adjuster",
        workload: 30,
        notes: "Aviation claims"
      },
      {
        clientId: "client_004",
        clientName: "Precision Aerospace Inc",
        workItemId: "workitem_004",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_011",
        chairName: "Investigation Lead",
        workload: 15,
        notes: "Product claims"
      }
    ]
  },
  {
    id: "member_078",
    name: "Chris Anderson",
    role: "Airport Operations Specialist",
    title: "Operations Specialist",
    location: "Chicago, IL",
    team: "Aviation Team",
    teamId: "team_010",
    expertise: ["FBOs", "Airports", "Ground Operations", "Hangar"],
    yearsExperience: 8,
    totalCapacity: 100,
    capacity: 60,
    matchScore: 75,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_017",
        clientName: "Elite Aviation Services",
        workItemId: "workitem_019",
        roleId: "role_011",
        roleName: "Aviation Specialist",
        chairId: "chair_041",
        chairName: "Operations Analyst",
        workload: 25,
        notes: "Ground operations"
      },
      {
        clientId: "client_004",
        clientName: "Precision Aerospace Inc",
        workItemId: "workitem_004",
        roleId: "role_011",
        roleName: "Aviation Specialist",
        chairId: "chair_039",
        chairName: "Lead Specialist",
        workload: 15,
        notes: "Facility coverage"
      }
    ]
  },
  // Environmental Team (5 members)
  {
    id: "member_079",
    name: "Dr. Sarah Mitchell",
    role: "Environmental Practice Leader",
    title: "Practice Leader",
    location: "Philadelphia, PA",
    team: "Environmental Team",
    teamId: "team_011",
    expertise: ["Pollution Liability", "Remediation", "Brownfield", "EPA"],
    yearsExperience: 22,
    totalCapacity: 100,
    capacity: 35,
    matchScore: 95,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_018",
        clientName: "Pioneer Mining Corp",
        workItemId: "workitem_018",
        roleId: "role_012",
        roleName: "Environmental Specialist",
        chairId: "chair_042",
        chairName: "Lead Specialist",
        workload: 40,
        notes: "Mining environmental"
      },
      {
        clientId: "client_001",
        clientName: "Acme Energy Corp",
        workItemId: "workitem_001",
        roleId: "role_012",
        roleName: "Environmental Specialist",
        chairId: "chair_043",
        chairName: "Remediation Analyst",
        workload: 25,
        notes: "Energy pollution"
      }
    ]
  },
  {
    id: "member_080",
    name: "Mark Johnson",
    role: "Remediation Specialist",
    title: "Remediation Specialist",
    location: "New Jersey",
    team: "Environmental Team",
    teamId: "team_011",
    expertise: ["Site Remediation", "Cleanup Costs", "Contractor Management"],
    yearsExperience: 15,
    totalCapacity: 100,
    capacity: 45,
    matchScore: 85,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_018",
        clientName: "Pioneer Mining Corp",
        workItemId: "workitem_018",
        roleId: "role_012",
        roleName: "Environmental Specialist",
        chairId: "chair_043",
        chairName: "Remediation Analyst",
        workload: 35,
        notes: "Mine remediation"
      },
      {
        clientId: "client_006",
        clientName: "Northern Energy Resources",
        workItemId: "workitem_006",
        roleId: "role_012",
        roleName: "Environmental Specialist",
        chairId: "chair_042",
        chairName: "Lead Specialist",
        workload: 20,
        notes: "Spill response"
      }
    ]
  },
  {
    id: "member_081",
    name: "Lisa Martinez",
    role: "Environmental Underwriter",
    title: "Environmental Underwriter",
    location: "Boston, MA",
    team: "Environmental Team",
    teamId: "team_011",
    expertise: ["Environmental Underwriting", "Risk Selection", "Pricing"],
    yearsExperience: 10,
    totalCapacity: 100,
    capacity: 50,
    matchScore: 80,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_018",
        clientName: "Pioneer Mining Corp",
        workItemId: "workitem_018",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_014",
        chairName: "Lead Underwriter",
        workload: 35,
        notes: "Environmental UW"
      },
      {
        clientId: "client_019",
        clientName: "Riverside Power & Utilities",
        workItemId: "workitem_019",
        roleId: "role_012",
        roleName: "Environmental Specialist",
        chairId: "chair_044",
        chairName: "Compliance Advisor",
        workload: 15,
        notes: "Utility environmental"
      }
    ]
  },
  {
    id: "member_082",
    name: "James Brown",
    role: "Environmental Claims Manager",
    title: "Claims Manager",
    location: "Houston, TX",
    team: "Environmental Team",
    teamId: "team_011",
    expertise: ["Environmental Claims", "Third Party", "Natural Resource Damage"],
    yearsExperience: 12,
    totalCapacity: 100,
    capacity: 45,
    matchScore: 78,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_001",
        clientName: "Acme Energy Corp",
        workItemId: "workitem_001",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_013",
        chairName: "Documentation Analyst",
        workload: 30,
        notes: "Environmental claims"
      },
      {
        clientId: "client_018",
        clientName: "Pioneer Mining Corp",
        workItemId: "workitem_018",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_012",
        chairName: "Subrogation Specialist",
        workload: 25,
        notes: "Mining claims"
      }
    ]
  },
  {
    id: "member_083",
    name: "Patricia Evans",
    role: "Compliance Advisor",
    title: "Compliance Advisor",
    location: "Washington, DC",
    team: "Environmental Team",
    teamId: "team_011",
    expertise: ["EPA Regulations", "State Environmental", "CERCLA", "RCRA"],
    yearsExperience: 18,
    totalCapacity: 100,
    capacity: 40,
    matchScore: 82,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_018",
        clientName: "Pioneer Mining Corp",
        workItemId: "workitem_018",
        roleId: "role_012",
        roleName: "Environmental Specialist",
        chairId: "chair_044",
        chairName: "Compliance Advisor",
        workload: 35,
        notes: "Mining compliance"
      },
      {
        clientId: "client_001",
        clientName: "Acme Energy Corp",
        workItemId: "workitem_001",
        roleId: "role_012",
        roleName: "Environmental Specialist",
        chairId: "chair_044",
        chairName: "Compliance Advisor",
        workload: 25,
        notes: "Energy regulations"
      }
    ]
  },
  // Fleet Team (6 members)
  {
    id: "member_084",
    name: "Brian Adams Sr.",
    role: "Fleet Practice Leader",
    title: "Practice Leader",
    location: "Indianapolis, IN",
    team: "Fleet Team",
    teamId: "team_012",
    expertise: ["Fleet Management", "Trucking", "Commercial Auto", "Telematics"],
    yearsExperience: 20,
    totalCapacity: 100,
    capacity: 35,
    matchScore: 95,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_012",
        clientName: "Metro Transit Authority",
        workItemId: "workitem_012",
        roleId: "role_013",
        roleName: "Fleet Manager",
        chairId: "chair_045",
        chairName: "Lead Manager",
        workload: 40,
        notes: "Transit fleet program"
      },
      {
        clientId: "client_002",
        clientName: "Atlantic Logistics Partners",
        workItemId: "workitem_002",
        roleId: "role_013",
        roleName: "Fleet Manager",
        chairId: "chair_046",
        chairName: "Safety Coordinator",
        workload: 25,
        notes: "Trucking safety"
      }
    ]
  },
  {
    id: "member_085",
    name: "Timothy Walker",
    role: "Fleet Safety Manager",
    title: "Safety Manager",
    location: "Chicago, IL",
    team: "Fleet Team",
    teamId: "team_012",
    expertise: ["Driver Safety", "DOT Compliance", "Training Programs"],
    yearsExperience: 14,
    totalCapacity: 100,
    capacity: 45,
    matchScore: 88,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_012",
        clientName: "Metro Transit Authority",
        workItemId: "workitem_012",
        roleId: "role_013",
        roleName: "Fleet Manager",
        chairId: "chair_046",
        chairName: "Safety Coordinator",
        workload: 35,
        notes: "Transit driver safety"
      },
      {
        clientId: "client_002",
        clientName: "Atlantic Logistics Partners",
        workItemId: "workitem_002",
        roleId: "role_013",
        roleName: "Fleet Manager",
        chairId: "chair_047",
        chairName: "Claims Liaison",
        workload: 20,
        notes: "Fleet claims coordination"
      }
    ]
  },
  {
    id: "member_086",
    name: "Amanda Lewis",
    role: "Fleet Underwriter",
    title: "Fleet Underwriter",
    location: "Dallas, TX",
    team: "Fleet Team",
    teamId: "team_012",
    expertise: ["Commercial Auto Underwriting", "Risk Selection", "Pricing"],
    yearsExperience: 9,
    totalCapacity: 100,
    capacity: 50,
    matchScore: 82,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_012",
        clientName: "Metro Transit Authority",
        workItemId: "workitem_012",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_015",
        chairName: "Risk Analyst",
        workload: 30,
        notes: "Transit fleet UW"
      },
      {
        clientId: "client_002",
        clientName: "Atlantic Logistics Partners",
        workItemId: "workitem_002",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_014",
        chairName: "Lead Underwriter",
        workload: 20,
        notes: "Trucking underwriting"
      }
    ]
  },
  {
    id: "member_087",
    name: "Robert Garcia",
    role: "Fleet Claims Specialist",
    title: "Claims Specialist",
    location: "Los Angeles, CA",
    team: "Fleet Team",
    teamId: "team_012",
    expertise: ["Auto Claims", "Physical Damage", "Liability", "Repair Networks"],
    yearsExperience: 11,
    totalCapacity: 100,
    capacity: 45,
    matchScore: 80,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_012",
        clientName: "Metro Transit Authority",
        workItemId: "workitem_012",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_012",
        chairName: "Subrogation Specialist",
        workload: 35,
        notes: "Transit claims recovery"
      },
      {
        clientId: "client_002",
        clientName: "Atlantic Logistics Partners",
        workItemId: "workitem_002",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_010",
        chairName: "Lead Adjuster",
        workload: 20,
        notes: "Cargo/auto claims"
      }
    ]
  },
  {
    id: "member_088",
    name: "Stephanie Moore",
    role: "Telematics Specialist",
    title: "Telematics Specialist",
    location: "Atlanta, GA",
    team: "Fleet Team",
    teamId: "team_012",
    expertise: ["Telematics", "Driver Behavior", "Loss Prevention", "IoT"],
    yearsExperience: 7,
    totalCapacity: 100,
    capacity: 55,
    matchScore: 75,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_012",
        clientName: "Metro Transit Authority",
        workItemId: "workitem_012",
        roleId: "role_002",
        roleName: "Risk Engineer",
        chairId: "chair_008",
        chairName: "Technical Reviewer",
        workload: 30,
        notes: "Telematics review"
      },
      {
        clientId: "client_002",
        clientName: "Atlantic Logistics Partners",
        workItemId: "workitem_002",
        roleId: "role_002",
        roleName: "Risk Engineer",
        chairId: "chair_009",
        chairName: "CAT Specialist",
        workload: 15,
        notes: "Driver monitoring"
      }
    ]
  },
  {
    id: "member_089",
    name: "Kevin Williams",
    role: "Fleet Account Manager",
    title: "Account Manager",
    location: "Denver, CO",
    team: "Fleet Team",
    teamId: "team_012",
    expertise: ["Fleet Accounts", "Client Relations", "Renewals", "Service"],
    yearsExperience: 8,
    totalCapacity: 100,
    capacity: 50,
    matchScore: 72,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_012",
        clientName: "Metro Transit Authority",
        workItemId: "workitem_012",
        roleId: "role_001",
        roleName: "Senior Account Manager",
        chairId: "chair_003",
        chairName: "Renewal Coordinator",
        workload: 35,
        notes: "Transit account service"
      },
      {
        clientId: "client_002",
        clientName: "Atlantic Logistics Partners",
        workItemId: "workitem_002",
        roleId: "role_001",
        roleName: "Senior Account Manager",
        chairId: "chair_004",
        chairName: "Client Service Lead",
        workload: 15,
        notes: "Logistics client service"
      }
    ]
  },
  // Management Liability Team (5 members)
  {
    id: "member_090",
    name: "Victoria Adams",
    role: "D&O Practice Leader",
    title: "Practice Leader",
    location: "New York, NY",
    team: "Management Liability Team",
    teamId: "team_013",
    expertise: ["D&O", "Securities", "Executive Liability", "Board Advisory"],
    yearsExperience: 23,
    totalCapacity: 100,
    capacity: 30,
    matchScore: 98,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_001",
        clientName: "Acme Energy Corp",
        workItemId: "workitem_001",
        roleId: "role_014",
        roleName: "D&O Specialist",
        chairId: "chair_048",
        chairName: "Lead Specialist",
        workload: 40,
        notes: "Energy D&O program"
      },
      {
        clientId: "client_013",
        clientName: "Sterling Pharmaceuticals",
        workItemId: "workitem_013",
        roleId: "role_014",
        roleName: "D&O Specialist",
        chairId: "chair_048",
        chairName: "Lead Specialist",
        workload: 30,
        notes: "Pharma D&O"
      }
    ]
  },
  {
    id: "member_091",
    name: "Charles Wilson",
    role: "EPL Specialist",
    title: "EPL Specialist",
    location: "Los Angeles, CA",
    team: "Management Liability Team",
    teamId: "team_013",
    expertise: ["Employment Practices", "Workplace Issues", "Discrimination"],
    yearsExperience: 15,
    totalCapacity: 100,
    capacity: 40,
    matchScore: 88,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_003",
        clientName: "Summit Healthcare Systems",
        workItemId: "workitem_003",
        roleId: "role_014",
        roleName: "D&O Specialist",
        chairId: "chair_049",
        chairName: "EPL Analyst",
        workload: 35,
        notes: "Healthcare EPL"
      },
      {
        clientId: "client_010",
        clientName: "Heritage Hotels Group",
        workItemId: "workitem_010",
        roleId: "role_014",
        roleName: "D&O Specialist",
        chairId: "chair_049",
        chairName: "EPL Analyst",
        workload: 25,
        notes: "Hospitality EPL"
      }
    ]
  },
  {
    id: "member_092",
    name: "Diana Thompson",
    role: "Fiduciary Specialist",
    title: "Fiduciary Specialist",
    location: "Boston, MA",
    team: "Management Liability Team",
    teamId: "team_013",
    expertise: ["Fiduciary Liability", "ERISA", "Retirement Plans", "Benefits"],
    yearsExperience: 12,
    totalCapacity: 100,
    capacity: 50,
    matchScore: 82,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_001",
        clientName: "Acme Energy Corp",
        workItemId: "workitem_001",
        roleId: "role_014",
        roleName: "D&O Specialist",
        chairId: "chair_050",
        chairName: "Fiduciary Specialist",
        workload: 30,
        notes: "Energy fiduciary"
      },
      {
        clientId: "client_003",
        clientName: "Summit Healthcare Systems",
        workItemId: "workitem_003",
        roleId: "role_014",
        roleName: "D&O Specialist",
        chairId: "chair_050",
        chairName: "Fiduciary Specialist",
        workload: 20,
        notes: "Healthcare benefits"
      }
    ]
  },
  {
    id: "member_093",
    name: "Peter Jackson",
    role: "D&O Claims Manager",
    title: "Claims Manager",
    location: "Chicago, IL",
    team: "Management Liability Team",
    teamId: "team_013",
    expertise: ["D&O Claims", "Securities Litigation", "Shareholder Actions"],
    yearsExperience: 16,
    totalCapacity: 100,
    capacity: 45,
    matchScore: 85,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_001",
        clientName: "Acme Energy Corp",
        workItemId: "workitem_001",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_010",
        chairName: "Lead Adjuster",
        workload: 35,
        notes: "D&O claims"
      },
      {
        clientId: "client_007",
        clientName: "Coastal Financial Services",
        workItemId: "workitem_007",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_011",
        chairName: "Investigation Lead",
        workload: 20,
        notes: "Securities claims"
      }
    ]
  },
  {
    id: "member_094",
    name: "Nancy Chen",
    role: "D&O Underwriter",
    title: "D&O Underwriter",
    location: "San Francisco, CA",
    team: "Management Liability Team",
    teamId: "team_013",
    expertise: ["D&O Underwriting", "Public Company", "Private Company", "IPO"],
    yearsExperience: 10,
    totalCapacity: 100,
    capacity: 50,
    matchScore: 80,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_011",
        clientName: "TechVenture Solutions",
        workItemId: "workitem_011",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_014",
        chairName: "Lead Underwriter",
        workload: 35,
        notes: "Pre-IPO D&O"
      },
      {
        clientId: "client_013",
        clientName: "Sterling Pharmaceuticals",
        workItemId: "workitem_013",
        roleId: "role_004",
        roleName: "Underwriting Specialist",
        chairId: "chair_016",
        chairName: "Portfolio Reviewer",
        workload: 15,
        notes: "Pharma D&O UW"
      }
    ]
  },
  // Product Liability Team (5 members)
  {
    id: "member_095",
    name: "John Morrison",
    role: "Product Liability Practice Leader",
    title: "Practice Leader",
    location: "Detroit, MI",
    team: "Product Liability Team",
    teamId: "team_014",
    expertise: ["Product Liability", "Manufacturing", "Automotive", "Recalls"],
    yearsExperience: 24,
    totalCapacity: 100,
    capacity: 30,
    matchScore: 95,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: true,
    currentAssignments: [
      {
        clientId: "client_013",
        clientName: "Sterling Pharmaceuticals",
        workItemId: "workitem_013",
        roleId: "role_015",
        roleName: "Product Liability Specialist",
        chairId: "chair_051",
        chairName: "Lead Specialist",
        workload: 45,
        notes: "Pharma product liability"
      },
      {
        clientId: "client_001",
        clientName: "Acme Energy Corp",
        workItemId: "workitem_001",
        roleId: "role_015",
        roleName: "Product Liability Specialist",
        chairId: "chair_052",
        chairName: "Recall Coordinator",
        workload: 25,
        notes: "Equipment liability"
      }
    ]
  },
  {
    id: "member_096",
    name: "Sandra Williams",
    role: "Recall Specialist",
    title: "Recall Specialist",
    location: "Chicago, IL",
    team: "Product Liability Team",
    teamId: "team_014",
    expertise: ["Product Recalls", "Crisis Management", "Supply Chain", "FDA"],
    yearsExperience: 13,
    totalCapacity: 100,
    capacity: 45,
    matchScore: 88,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_013",
        clientName: "Sterling Pharmaceuticals",
        workItemId: "workitem_013",
        roleId: "role_015",
        roleName: "Product Liability Specialist",
        chairId: "chair_052",
        chairName: "Recall Coordinator",
        workload: 40,
        notes: "Pharma recalls"
      },
      {
        clientId: "client_016",
        clientName: "Continental Food Services",
        workItemId: "workitem_food",
        roleId: "role_015",
        roleName: "Product Liability Specialist",
        chairId: "chair_051",
        chairName: "Lead Specialist",
        workload: 15,
        notes: "Food recall planning"
      }
    ]
  },
  {
    id: "member_097",
    name: "Michael Brown",
    role: "Product Claims Manager",
    title: "Claims Manager",
    location: "Philadelphia, PA",
    team: "Product Liability Team",
    teamId: "team_014",
    expertise: ["Product Claims", "Mass Torts", "Class Actions", "Litigation"],
    yearsExperience: 17,
    totalCapacity: 100,
    capacity: 40,
    matchScore: 85,
    locationMatch: false,
    expertiseMatch: true,
    hasCapacity: true,
    isManager: false,
    currentAssignments: [
      {
        clientId: "client_013",
        clientName: "Sterling Pharmaceuticals",
        workItemId: "workitem_013",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_010",
        chairName: "Lead Adjuster",
        workload: 45,
        notes: "Pharma product claims"
      },
      {
        clientId: "client_001",
        clientName: "Acme Energy Corp",
        workItemId: "workitem_001",
        roleId: "role_003",
        roleName: "Claims Specialist",
        chairId: "chair_013",
        chairName: "Documentation Analyst",
        workload: 15,
        notes: "Equipment claims docs"
      }
    ]
  },
];

// Managers only for assignment dropdown in Create Work Item
export const managers: TeamMember[] = teamMembers.filter(m => m.isManager);

export const searchTeamMembers = (query: string): TeamMember[] => {
  if (!query) return teamMembers;
  const lowerQuery = query.toLowerCase();
  return teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(lowerQuery) ||
      member.role.toLowerCase().includes(lowerQuery) ||
      member.location.toLowerCase().includes(lowerQuery) ||
      member.expertise.some((exp) => exp.toLowerCase().includes(lowerQuery))
  );
};

// Helper to get team members by team ID
export const getTeamMembersByTeamId = (teamId: string): TeamMember[] => {
  return teamMembers.filter(m => m.teamId === teamId);
};

// Helper to get member by ID
export const getMemberById = (memberId: string): TeamMember | undefined => {
  return teamMembers.find(m => m.id === memberId);
};

// Helper to calculate total workload for a member
export const getMemberTotalWorkload = (memberId: string): number => {
  const member = getMemberById(memberId);
  if (!member?.currentAssignments) return 0;
  return member.currentAssignments.reduce((sum, a) => sum + a.workload, 0);
};
