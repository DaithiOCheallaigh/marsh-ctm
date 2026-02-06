// Leaver Workflow Client Data
// Clients assigned to the leaving employee

export interface LeaverClient {
  id: string;
  name: string;
  industry: string;
  role: string;
  chairName?: string;
  workload?: number;
}

// Mock data for John Grimes (leaver)
export const leaverClients: LeaverClient[] = [
  {
    id: "lc_001",
    name: "The Palms South Properties",
    industry: "Corporate",
    role: "Senior Account Manager",
    chairName: "Primary",
    workload: 25,
  },
  {
    id: "lc_002",
    name: "Scout Healthcare",
    industry: "Healthcare",
    role: "Project Manager",
    chairName: "Primary",
    workload: 20,
  },
  {
    id: "lc_003",
    name: "Easy Post",
    industry: "Government",
    role: "Project Lead",
    chairName: "Secondary",
    workload: 15,
  },
  {
    id: "lc_004",
    name: "Home Depot",
    industry: "Corporate",
    role: "Senior Account Manager",
    chairName: "Primary",
    workload: 25,
  },
  {
    id: "lc_005",
    name: "Walmart Inc.",
    industry: "Corporate",
    role: "Product Owner",
    chairName: "Secondary",
    workload: 15,
  },
];

// Team members available for reassignment
export interface ReassignableTeamMember {
  id: string;
  name: string;
  role: string;
  location: string;
}

export const reassignableTeamMembers: ReassignableTeamMember[] = [
  {
    id: "rtm_001",
    name: "Sarah Anderson",
    role: "Senior Account Manager",
    location: "Chicago",
  },
  {
    id: "rtm_002",
    name: "Michael Chen",
    role: "Compliance Officer",
    location: "New York",
  },
  {
    id: "rtm_003",
    name: "Louis Jones",
    role: "Risk Consultant",
    location: "San Francisco",
  },
  {
    id: "rtm_004",
    name: "Keith Bilson",
    role: "Aviation, Marine & Cargo",
    location: "Chicago",
  },
  {
    id: "rtm_005",
    name: "Ivy Thomas",
    role: "Risk Management",
    location: "New York",
  },
  {
    id: "rtm_006",
    name: "Colin Masterson",
    role: "Aviation, Operations",
    location: "Florida",
  },
  {
    id: "rtm_007",
    name: "Emily Watson",
    role: "Account Executive",
    location: "Boston",
  },
  {
    id: "rtm_008",
    name: "James Rodriguez",
    role: "Project Manager",
    location: "Miami",
  },
  {
    id: "rtm_009",
    name: "Patricia Morrison",
    role: "Senior Vice President",
    location: "Phoenix",
  },
  {
    id: "rtm_010",
    name: "Robert Wilson",
    role: "Senior Risk Engineer",
    location: "Houston",
  },
];

// Leaver work item details
export interface LeaverWorkItem {
  id: string;
  workType: "Leaver";
  employeeName: string;
  team: string;
  email: string;
  location: string;
  peopleSoftId: string;
  leavingDate: string;
  priority: "High" | "Medium" | "Low";
  status: "On Track" | "At Risk" | "Overdue";
  createdAt: string;
}

export const mockLeaverWorkItem: LeaverWorkItem = {
  id: "3",
  workType: "Leaver",
  employeeName: "John Grimes",
  team: "Property Risk Assessment",
  email: "johngrimes@marsh.com",
  location: "New York",
  peopleSoftId: "1234567",
  leavingDate: "[mm/dd/yyyy]",
  priority: "High",
  status: "On Track",
  createdAt: "03 Jan 2026 13:42 EST",
};

// Reassignment record
export interface Reassignment {
  id: string;
  clientId: string;
  clientName: string;
  industry: string;
  reassignedToId: string;
  reassignedToName: string;
  role: string;
  location: string;
  capacityRequirement?: number;
}
