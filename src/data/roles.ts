// Role definitions with chairs for B2B Insurance Industry
// Dataset v2.0 - 15 roles with detailed chair configurations

export interface RoleChair {
  id: string;
  name: string;
  description: string;
  typicalWorkload: string;
  type: 'primary' | 'secondary';
  isRequired: boolean;
}

export interface Role {
  id: string;
  name: string;
  department: string;
  team: string;
  teamId: string;
  description: string;
  chairCount: number;
  chairs: RoleChair[];
}

export const rolesData: Role[] = [
  {
    id: "role_001",
    name: "Senior Account Manager",
    department: "Property Risk",
    team: "Property Risk Team",
    teamId: "team_001",
    description: "Manages complex property insurance accounts, client relationships, and strategic risk advisory",
    chairCount: 5,
    chairs: [
      {
        id: "chair_001",
        name: "Account Lead",
        description: "Primary client relationship owner, strategic decisions, contract negotiations",
        typicalWorkload: "40-50%",
        type: "primary",
        isRequired: true
      },
      {
        id: "chair_002",
        name: "Strategic Advisor",
        description: "Long-term risk strategy, portfolio optimization, executive stakeholder management",
        typicalWorkload: "30-40%",
        type: "primary",
        isRequired: true
      },
      {
        id: "chair_003",
        name: "Renewal Coordinator",
        description: "Policy renewal management, terms negotiation, documentation oversight",
        typicalWorkload: "20-30%",
        type: "secondary",
        isRequired: false
      },
      {
        id: "chair_004",
        name: "Client Service Lead",
        description: "Day-to-day client communication, issue resolution, service delivery",
        typicalWorkload: "20-30%",
        type: "secondary",
        isRequired: false
      },
      {
        id: "chair_005",
        name: "Technical Specialist",
        description: "Complex risk analysis, specialized property coverage design",
        typicalWorkload: "30-40%",
        type: "secondary",
        isRequired: false
      }
    ]
  },
  {
    id: "role_002",
    name: "Risk Engineer",
    department: "Property Risk",
    team: "Property Risk Team",
    teamId: "team_001",
    description: "Conducts risk assessments, site inspections, and loss prevention recommendations",
    chairCount: 4,
    chairs: [
      {
        id: "chair_006",
        name: "Lead Engineer",
        description: "Primary risk assessment lead, inspection scheduling, report authoring",
        typicalWorkload: "35-45%",
        type: "primary",
        isRequired: true
      },
      {
        id: "chair_007",
        name: "Field Engineer",
        description: "On-site inspections, data collection, preliminary assessments",
        typicalWorkload: "25-35%",
        type: "primary",
        isRequired: true
      },
      {
        id: "chair_008",
        name: "Technical Reviewer",
        description: "Report quality assurance, technical accuracy validation",
        typicalWorkload: "15-25%",
        type: "secondary",
        isRequired: false
      },
      {
        id: "chair_009",
        name: "CAT Specialist",
        description: "Catastrophe modeling, natural disaster risk analysis",
        typicalWorkload: "20-30%",
        type: "secondary",
        isRequired: false
      }
    ]
  },
  {
    id: "role_003",
    name: "Claims Specialist",
    department: "General Liability",
    team: "Casualty Claims Team",
    teamId: "team_002",
    description: "Handles complex liability claims, negotiations, and settlements",
    chairCount: 4,
    chairs: [
      {
        id: "chair_010",
        name: "Lead Adjuster",
        description: "Primary claims handler, settlement authority, litigation management",
        typicalWorkload: "40-50%",
        type: "primary",
        isRequired: true
      },
      {
        id: "chair_011",
        name: "Investigation Lead",
        description: "Claims investigation, evidence gathering, witness interviews",
        typicalWorkload: "30-40%",
        type: "primary",
        isRequired: true
      },
      {
        id: "chair_012",
        name: "Subrogation Specialist",
        description: "Recovery actions, third-party liability pursuit",
        typicalWorkload: "20-30%",
        type: "secondary",
        isRequired: false
      },
      {
        id: "chair_013",
        name: "Documentation Analyst",
        description: "Claims file management, regulatory compliance documentation",
        typicalWorkload: "15-25%",
        type: "secondary",
        isRequired: false
      }
    ]
  },
  {
    id: "role_004",
    name: "Underwriting Specialist",
    department: "Commercial Lines",
    team: "Commercial Underwriting Team",
    teamId: "team_003",
    description: "Evaluates risks, determines pricing, and approves coverage terms",
    chairCount: 3,
    chairs: [
      {
        id: "chair_014",
        name: "Lead Underwriter",
        description: "Final approval authority, complex risk evaluation, pricing decisions",
        typicalWorkload: "45-55%",
        type: "primary",
        isRequired: true
      },
      {
        id: "chair_015",
        name: "Risk Analyst",
        description: "Data analysis, risk scoring, preliminary assessment",
        typicalWorkload: "25-35%",
        type: "secondary",
        isRequired: false
      },
      {
        id: "chair_016",
        name: "Portfolio Reviewer",
        description: "Book management, renewal analysis, profitability tracking",
        typicalWorkload: "20-30%",
        type: "secondary",
        isRequired: false
      }
    ]
  },
  {
    id: "role_005",
    name: "Account Executive",
    department: "Marine Cargo",
    team: "Marine Cargo Team",
    teamId: "team_004",
    description: "Manages marine cargo accounts, coordinates coverage, and handles client relationships",
    chairCount: 4,
    chairs: [
      {
        id: "chair_017",
        name: "Account Director",
        description: "Senior client relationship, strategic account planning",
        typicalWorkload: "40-50%",
        type: "primary",
        isRequired: true
      },
      {
        id: "chair_018",
        name: "Cargo Specialist",
        description: "Specialized cargo coverage design, transit risk analysis",
        typicalWorkload: "30-40%",
        type: "primary",
        isRequired: true
      },
      {
        id: "chair_019",
        name: "Claims Liaison",
        description: "Cargo claims coordination, salvage management",
        typicalWorkload: "20-30%",
        type: "secondary",
        isRequired: false
      },
      {
        id: "chair_020",
        name: "Documentation Officer",
        description: "Bills of lading, certificates, compliance documentation",
        typicalWorkload: "15-25%",
        type: "secondary",
        isRequired: false
      }
    ]
  },
  {
    id: "role_006",
    name: "Cyber Risk Analyst",
    department: "Technology",
    team: "Cyber Security Team",
    teamId: "team_005",
    description: "Assesses cyber risks, designs coverage, and provides technical expertise",
    chairCount: 3,
    chairs: [
      {
        id: "chair_021",
        name: "Lead Analyst",
        description: "Primary cyber risk assessment, coverage design, client advisory",
        typicalWorkload: "40-50%",
        type: "primary",
        isRequired: true
      },
      {
        id: "chair_022",
        name: "Threat Specialist",
        description: "Threat landscape analysis, vulnerability assessment",
        typicalWorkload: "25-35%",
        type: "secondary",
        isRequired: false
      },
      {
        id: "chair_023",
        name: "Incident Response Lead",
        description: "Breach response coordination, vendor management",
        typicalWorkload: "20-30%",
        type: "secondary",
        isRequired: false
      }
    ]
  },
  {
    id: "role_007",
    name: "Healthcare Specialist",
    department: "Professional Liability",
    team: "Healthcare Team",
    teamId: "team_006",
    description: "Manages medical malpractice and healthcare facility coverage",
    chairCount: 4,
    chairs: [
      {
        id: "chair_024",
        name: "Lead Specialist",
        description: "Primary healthcare account management, physician coverage",
        typicalWorkload: "40-50%",
        type: "primary",
        isRequired: true
      },
      {
        id: "chair_025",
        name: "Facility Risk Manager",
        description: "Hospital and clinic coverage, facility risk assessment",
        typicalWorkload: "30-40%",
        type: "primary",
        isRequired: true
      },
      {
        id: "chair_026",
        name: "Claims Coordinator",
        description: "Medical malpractice claims handling, legal liaison",
        typicalWorkload: "25-35%",
        type: "secondary",
        isRequired: false
      },
      {
        id: "chair_027",
        name: "Compliance Advisor",
        description: "HIPAA compliance, regulatory requirements guidance",
        typicalWorkload: "15-25%",
        type: "secondary",
        isRequired: false
      }
    ]
  },
  {
    id: "role_008",
    name: "Construction Specialist",
    department: "Construction",
    team: "Construction Team",
    teamId: "team_007",
    description: "Handles builders risk, surety bonds, and construction liability",
    chairCount: 4,
    chairs: [
      {
        id: "chair_028",
        name: "Project Lead",
        description: "Large construction project coverage, wrap-up programs",
        typicalWorkload: "40-50%",
        type: "primary",
        isRequired: true
      },
      {
        id: "chair_029",
        name: "Surety Bond Manager",
        description: "Bid, performance, and payment bond management",
        typicalWorkload: "30-40%",
        type: "primary",
        isRequired: true
      },
      {
        id: "chair_030",
        name: "Subcontractor Coordinator",
        description: "Subcontractor insurance tracking, certificates of insurance",
        typicalWorkload: "20-30%",
        type: "secondary",
        isRequired: false
      },
      {
        id: "chair_031",
        name: "Safety Consultant",
        description: "Site safety reviews, loss control recommendations",
        typicalWorkload: "15-25%",
        type: "secondary",
        isRequired: false
      }
    ]
  },
  {
    id: "role_009",
    name: "Energy Specialist",
    department: "Energy",
    team: "Energy Team",
    teamId: "team_008",
    description: "Manages oil & gas, renewable energy, and utilities coverage",
    chairCount: 4,
    chairs: [
      {
        id: "chair_032",
        name: "Lead Specialist",
        description: "Primary energy account management, complex program design",
        typicalWorkload: "40-50%",
        type: "primary",
        isRequired: true
      },
      {
        id: "chair_033",
        name: "Upstream Engineer",
        description: "Drilling, exploration, and production risk assessment",
        typicalWorkload: "30-40%",
        type: "primary",
        isRequired: true
      },
      {
        id: "chair_034",
        name: "Downstream Analyst",
        description: "Refinery, pipeline, and distribution coverage",
        typicalWorkload: "25-35%",
        type: "secondary",
        isRequired: false
      },
      {
        id: "chair_035",
        name: "Environmental Liaison",
        description: "Environmental liability coordination, pollution coverage",
        typicalWorkload: "20-30%",
        type: "secondary",
        isRequired: false
      }
    ]
  },
  {
    id: "role_010",
    name: "Financial Institutions Specialist",
    department: "Financial Lines",
    team: "Financial Institutions Team",
    teamId: "team_009",
    description: "Handles D&O, E&O, and specialty coverage for banks and financial services",
    chairCount: 3,
    chairs: [
      {
        id: "chair_036",
        name: "Lead Specialist",
        description: "Primary FI account management, D&O program design",
        typicalWorkload: "45-55%",
        type: "primary",
        isRequired: true
      },
      {
        id: "chair_037",
        name: "E&O Analyst",
        description: "Professional liability coverage, fiduciary liability",
        typicalWorkload: "30-40%",
        type: "secondary",
        isRequired: false
      },
      {
        id: "chair_038",
        name: "Regulatory Specialist",
        description: "Regulatory compliance coverage, investigation defense",
        typicalWorkload: "20-30%",
        type: "secondary",
        isRequired: false
      }
    ]
  },
  {
    id: "role_011",
    name: "Aviation Specialist",
    department: "Aviation",
    team: "Aviation Team",
    teamId: "team_010",
    description: "Manages aircraft hull, liability, and aviation operations coverage",
    chairCount: 3,
    chairs: [
      {
        id: "chair_039",
        name: "Lead Specialist",
        description: "Primary aviation account management, fleet coverage",
        typicalWorkload: "45-55%",
        type: "primary",
        isRequired: true
      },
      {
        id: "chair_040",
        name: "Hull Specialist",
        description: "Aircraft hull coverage, maintenance requirements",
        typicalWorkload: "25-35%",
        type: "secondary",
        isRequired: false
      },
      {
        id: "chair_041",
        name: "Operations Analyst",
        description: "Pilot requirements, hangar coverage, ground operations",
        typicalWorkload: "20-30%",
        type: "secondary",
        isRequired: false
      }
    ]
  },
  {
    id: "role_012",
    name: "Environmental Specialist",
    department: "Environmental",
    team: "Environmental Team",
    teamId: "team_011",
    description: "Handles pollution liability, remediation, and environmental compliance",
    chairCount: 3,
    chairs: [
      {
        id: "chair_042",
        name: "Lead Specialist",
        description: "Primary environmental account management, site assessments",
        typicalWorkload: "45-55%",
        type: "primary",
        isRequired: true
      },
      {
        id: "chair_043",
        name: "Remediation Analyst",
        description: "Cleanup cost estimation, contractor management",
        typicalWorkload: "25-35%",
        type: "secondary",
        isRequired: false
      },
      {
        id: "chair_044",
        name: "Compliance Advisor",
        description: "EPA regulations, state environmental requirements",
        typicalWorkload: "20-30%",
        type: "secondary",
        isRequired: false
      }
    ]
  },
  {
    id: "role_013",
    name: "Fleet Manager",
    department: "Transportation",
    team: "Fleet Team",
    teamId: "team_012",
    description: "Manages commercial auto, trucking, and fleet coverage programs",
    chairCount: 3,
    chairs: [
      {
        id: "chair_045",
        name: "Lead Manager",
        description: "Primary fleet account management, program design",
        typicalWorkload: "45-55%",
        type: "primary",
        isRequired: true
      },
      {
        id: "chair_046",
        name: "Safety Coordinator",
        description: "Driver safety programs, telematics management",
        typicalWorkload: "25-35%",
        type: "secondary",
        isRequired: false
      },
      {
        id: "chair_047",
        name: "Claims Liaison",
        description: "Auto claims coordination, repair network management",
        typicalWorkload: "20-30%",
        type: "secondary",
        isRequired: false
      }
    ]
  },
  {
    id: "role_014",
    name: "D&O Specialist",
    department: "Management Liability",
    team: "Management Liability Team",
    teamId: "team_013",
    description: "Handles directors & officers liability, employment practices, and fiduciary coverage",
    chairCount: 3,
    chairs: [
      {
        id: "chair_048",
        name: "Lead Specialist",
        description: "Primary D&O account management, coverage negotiation",
        typicalWorkload: "45-55%",
        type: "primary",
        isRequired: true
      },
      {
        id: "chair_049",
        name: "EPL Analyst",
        description: "Employment practices liability, workplace claims",
        typicalWorkload: "25-35%",
        type: "secondary",
        isRequired: false
      },
      {
        id: "chair_050",
        name: "Fiduciary Specialist",
        description: "Fiduciary liability, benefit plan coverage",
        typicalWorkload: "20-30%",
        type: "secondary",
        isRequired: false
      }
    ]
  },
  {
    id: "role_015",
    name: "Product Liability Specialist",
    department: "Product Liability",
    team: "Product Liability Team",
    teamId: "team_014",
    description: "Manages product liability, recalls, and manufacturing coverage",
    chairCount: 3,
    chairs: [
      {
        id: "chair_051",
        name: "Lead Specialist",
        description: "Primary product liability account management",
        typicalWorkload: "45-55%",
        type: "primary",
        isRequired: true
      },
      {
        id: "chair_052",
        name: "Recall Coordinator",
        description: "Product recall coverage, crisis management",
        typicalWorkload: "25-35%",
        type: "secondary",
        isRequired: false
      },
      {
        id: "chair_053",
        name: "Manufacturing Analyst",
        description: "Manufacturing risk assessment, supply chain coverage",
        typicalWorkload: "20-30%",
        type: "secondary",
        isRequired: false
      }
    ]
  }
];

// Helper functions
export const getRoleById = (roleId: string): Role | undefined => {
  return rolesData.find(r => r.id === roleId);
};

export const getRolesByTeam = (teamId: string): Role[] => {
  return rolesData.filter(r => r.teamId === teamId);
};

export const getChairsByRoleId = (roleId: string): RoleChair[] => {
  const role = getRoleById(roleId);
  return role?.chairs || [];
};

export const getAvailableRoleNames = (): string[] => {
  return [...new Set(rolesData.map(r => r.name))];
};
