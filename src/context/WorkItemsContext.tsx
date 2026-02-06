import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WorkItemTeamConfig, RoleConfig } from '@/types/teamAssignment';
import { TeamMember } from '@/data/teamMembers';

// Re-export for backward compatibility
export type TeamConfig = WorkItemTeamConfig;

// Helper to create RoleConfig from role name (simplified - no chair management in V1)
const createRole = (roleName: string): RoleConfig => ({
  roleId: `role-${roleName.toLowerCase().replace(/\s+/g, '-')}`,
  roleName,
});

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string; // Base64 data URL for download/preview
}

// Simplified person type for saved assignments
export interface SavedAssignedPerson {
  id: string;
  name: string;
  role?: string;
  location?: string;
  expertise?: string[];
  capacity?: number;
  matchScore?: number;
}

export interface SavedAssignment {
  roleId: string;
  roleName: string;
  teamName?: string;
  selectedPerson?: SavedAssignedPerson;
  chairType: 'Primary' | 'Secondary';
  workloadPercentage: number;
  notes?: string;
}

export interface WorkItem {
  id: string;
  workType: string;
  clientName: string;
  cnNumber?: string;
  accountOwner?: string;
  location?: string;
  dateCreated: string;
  dueDate: string;
  assignee: string;
  delegateManager?: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Completed' | 'Cancelled';
  backendStatus?: 'Pending' | 'Completed' | 'Partially Completed' | 'Cancelled'; // Backend tracking
  partialCompletionJustification?: string; // Required justification for partial completion
  cancellationNotes?: string; // Required notes for cancellation
  description?: string;
  teams?: TeamConfig[];
  attachments?: Attachment[];
  isReadOnly?: boolean;
  lastModified?: string;
  savedAssignments?: SavedAssignment[];
}

interface WorkItemsContextType {
  workItems: WorkItem[];
  addWorkItem: (item: Omit<WorkItem, 'id' | 'dateCreated' | 'status'>) => string;
  updateWorkItem: (id: string, updates: Partial<WorkItem>) => void;
  completeWorkItem: (id: string) => void;
  cancelWorkItem: (id: string, notes: string) => void;
  deleteWorkItem: (id: string) => void;
}

const WorkItemsContext = createContext<WorkItemsContextType | undefined>(undefined);

// B2B Insurance Industry Mock Data
const initialWorkItems: WorkItem[] = [
  { 
    id: '1001234567', 
    workType: 'Onboarding', 
    clientName: 'Westfield Manufacturing Corp', 
    cnNumber: 'CN-2024-10847',
    accountOwner: 'Sarah Mitchell',
    location: 'New York',
    dateCreated: '08 Jan 2026', 
    dueDate: '30 Jan 2026', 
    assignee: 'David Chen', 
    priority: 'High', 
    status: 'Pending',
    description: 'Manufacturing client requiring comprehensive property and liability coverage for 12 facilities',
    teams: [
      { teamId: 'team-prop', teamName: 'Property Risk', isPrimary: true, roles: [createRole('Senior Account Manager'), createRole('Risk Engineer')] },
      { teamId: 'team-gl', teamName: 'General Liability', isPrimary: false, roles: [createRole('Claims Specialist')] }
    ],
    attachments: [
      {
        id: 'att-001',
        name: 'Westfield_Risk_Assessment.pdf',
        size: 2458624,
        type: 'application/pdf',
        dataUrl: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSAgNSAwIFIKPj4KPj4KL0NvbnRlbnRzIDQgMCBSCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSA0OCBUZgo1MCA2MDAgVGQKKFdlc3RmaWVsZCBSaXNrIEFzc2Vzc21lbnQpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKNSAwIG9iago8PAovVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKPj4KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxNDcgMDAwMDAgbiAKMDAwMDAwMDI3OSAwMDAwMCBuIAowMDAwMDAwMzc0IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDUxCiUlRU9G'
      },
      {
        id: 'att-002',
        name: 'Facility_Locations_Map.png',
        size: 1245678,
        type: 'image/png',
        dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      },
      {
        id: 'att-003',
        name: 'Insurance_Requirements.docx',
        size: 856432,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        dataUrl: 'data:application/octet-stream;base64,UEsDBBQAAAAIAA=='
      }
    ]
  },
  { 
    id: '1001234568', 
    workType: 'Onboarding', 
    clientName: 'Atlantic Logistics Partners', 
    cnNumber: 'CN-2024-10923',
    accountOwner: 'Michael Rodriguez',
    location: 'Miami',
    dateCreated: '09 Jan 2026', 
    dueDate: '28 Jan 2026', 
    assignee: 'Jennifer Walsh', 
    priority: 'Medium', 
    status: 'Pending',
    description: 'Freight and logistics company needing cargo insurance and fleet coverage',
    teams: [
      { teamId: 'team-mc', teamName: 'Marine Cargo', isPrimary: true, roles: [createRole('Account Executive'), createRole('Underwriting Specialist')] },
      { teamId: 'team-fleet', teamName: 'Fleet', isPrimary: false, roles: [createRole('Fleet Manager')] }
    ]
  },
  { 
    id: '1001234569', 
    workType: 'New Joiner', 
    clientName: 'Marcus Thompson', 
    accountOwner: 'HR Team',
    location: 'Chicago',
    dateCreated: '07 Jan 2026', 
    dueDate: '20 Jan 2026', 
    assignee: 'Colin Masterson', 
    priority: 'High', 
    status: 'Completed',
    description: 'Senior Claims Analyst joining the Property Claims team'
  },
  { 
    id: '1001234570', 
    workType: 'Offboarding', 
    clientName: 'Precision Aerospace Inc', 
    cnNumber: 'CN-2023-08451',
    accountOwner: 'Robert Chen',
    location: 'Seattle',
    dateCreated: '05 Jan 2026', 
    dueDate: '15 Feb 2026', 
    assignee: 'Amanda Foster', 
    priority: 'Medium', 
    status: 'Pending',
    description: 'Client transitioning to in-house risk management'
  },
  { 
    id: '1001234571', 
    workType: 'Onboarding', 
    clientName: 'Summit Healthcare Systems', 
    cnNumber: 'CN-2024-11052',
    accountOwner: 'Lisa Park',
    location: 'Boston',
    dateCreated: '10 Jan 2026', 
    dueDate: '05 Feb 2026', 
    assignee: 'David Chen', 
    priority: 'High', 
    status: 'Pending',
    description: 'Regional hospital network requiring malpractice, D&O, and property coverage',
    teams: [
      { teamId: 'team-hpl', teamName: 'Healthcare Professional Liability', isPrimary: true, roles: [createRole('Account Director'), createRole('Senior Broker')] },
      { teamId: 'team-do', teamName: 'D&O', isPrimary: false, roles: [createRole('D&O Specialist')] },
      { teamId: 'team-prop2', teamName: 'Property', isPrimary: false, roles: [createRole('Risk Consultant')] }
    ]
  },
  { 
    id: '1001234572', 
    workType: 'New Joiner', 
    clientName: 'Emily Richardson', 
    accountOwner: 'HR Team',
    location: 'Dallas',
    dateCreated: '08 Jan 2026', 
    dueDate: '25 Jan 2026', 
    assignee: 'Colin Masterson', 
    priority: 'Low', 
    status: 'Pending',
    description: 'Junior Risk Analyst joining the Energy sector team'
  },
  { 
    id: '1001234573', 
    workType: 'Onboarding', 
    clientName: 'Meridian Construction Group', 
    cnNumber: 'CN-2024-10998',
    accountOwner: 'James Wilson',
    location: 'Phoenix',
    dateCreated: '06 Jan 2026', 
    dueDate: '01 Feb 2026', 
    assignee: 'Patricia Morrison', 
    priority: 'Medium', 
    status: 'Pending',
    description: 'Commercial construction company requiring builders risk and surety bonds',
    teams: [
      { teamId: 'team-const', teamName: 'Construction', isPrimary: true, roles: [createRole('Construction Specialist'), createRole('Surety Bond Manager')] }
    ]
  },
  { 
    id: '1001234574', 
    workType: 'Leaver', 
    clientName: 'Thomas Reynolds', 
    accountOwner: 'HR Team',
    location: 'San Francisco',
    dateCreated: '04 Jan 2026', 
    dueDate: '31 Jan 2026', 
    assignee: 'Colin Masterson', 
    priority: 'High', 
    status: 'Pending',
    description: 'Senior Account Manager departing - client reassignment required for 8 accounts'
  },
  { 
    id: '1001234575', 
    workType: 'Offboarding', 
    clientName: 'Pacific Retail Holdings', 
    cnNumber: 'CN-2022-05672',
    accountOwner: 'Karen Thompson',
    location: 'Los Angeles',
    dateCreated: '03 Jan 2026', 
    dueDate: '28 Feb 2026', 
    assignee: 'Michael Santos', 
    priority: 'Medium', 
    status: 'Pending',
    description: 'Client not renewing after merger with competitor'
  },
  { 
    id: '1001234576', 
    workType: 'Onboarding', 
    clientName: 'Northern Energy Resources', 
    cnNumber: 'CN-2024-11103',
    accountOwner: 'William Harper',
    location: 'Houston',
    dateCreated: '11 Jan 2026', 
    dueDate: '10 Feb 2026', 
    assignee: 'Jennifer Walsh', 
    priority: 'High', 
    status: 'Completed',
    description: 'Oil & gas exploration company requiring energy package and environmental liability',
    teams: [
      { teamId: 'team-energy', teamName: 'Energy', isPrimary: true, roles: [createRole('Energy Specialist'), createRole('Senior Broker'), createRole('Risk Engineer')] },
      { teamId: 'team-env', teamName: 'Environmental', isPrimary: false, roles: [createRole('Environmental Risk Manager')] }
    ]
  },
  { 
    id: '1001234577', 
    workType: 'New Joiner', 
    clientName: 'Alexandra Chen', 
    accountOwner: 'HR Team',
    location: 'New York',
    dateCreated: '09 Jan 2026', 
    dueDate: '22 Jan 2026', 
    assignee: 'Colin Masterson', 
    priority: 'Low', 
    status: 'Pending',
    description: 'Cyber Risk Specialist joining the Technology team'
  },
  { 
    id: '1001234578', 
    workType: 'New Joiner', 
    clientName: 'Daniel Martinez', 
    accountOwner: 'HR Team',
    location: 'Atlanta',
    dateCreated: '10 Jan 2026', 
    dueDate: '24 Jan 2026', 
    assignee: 'Colin Masterson', 
    priority: 'Low', 
    status: 'Pending',
    description: 'Claims Adjuster joining the Property Claims division'
  },
  { 
    id: '1001234579', 
    workType: 'Leaver', 
    clientName: 'Jennifer Blake', 
    accountOwner: 'HR Team',
    location: 'Charlotte',
    dateCreated: '07 Jan 2026', 
    dueDate: '14 Feb 2026', 
    assignee: 'Colin Masterson', 
    priority: 'Medium', 
    status: 'Pending',
    description: 'Risk Analyst relocating - knowledge transfer required for specialty accounts'
  },
  { 
    id: '1001234580', 
    workType: 'Offboarding', 
    clientName: 'Velocity Transport LLC', 
    cnNumber: 'CN-2021-03891',
    accountOwner: 'Brian Adams',
    location: 'Indianapolis',
    dateCreated: '02 Jan 2026', 
    dueDate: '15 Jan 2026', 
    assignee: 'Amanda Foster', 
    priority: 'High', 
    status: 'Completed',
    description: 'Client acquired by larger carrier with existing coverage'
  },
  { 
    id: '1001234581', 
    workType: 'Onboarding', 
    clientName: 'Coastal Financial Services', 
    cnNumber: 'CN-2024-11089',
    accountOwner: 'Nicole Stevens',
    location: 'Charlotte',
    dateCreated: '12 Jan 2026', 
    dueDate: '08 Feb 2026', 
    assignee: 'David Chen', 
    priority: 'High', 
    status: 'Pending',
    description: 'Regional bank requiring D&O, E&O, and cyber liability coverage',
    teams: [
      { teamId: 'team-fi', teamName: 'Financial Institutions', isPrimary: true, roles: [createRole('FI Specialist'), createRole('Account Director')] },
      { teamId: 'team-cyber', teamName: 'Cyber', isPrimary: false, roles: [createRole('Cyber Risk Analyst')] }
    ]
  },
  // Unassigned work items - awaiting team assignment
  { 
    id: '1001234582', 
    workType: 'Onboarding', 
    clientName: 'TechVenture Solutions', 
    cnNumber: 'CN-2024-11156',
    accountOwner: 'David Park',
    location: 'San Francisco',
    dateCreated: '13 Jan 2026', 
    dueDate: '12 Feb 2026', 
    assignee: '', 
    priority: 'High', 
    status: 'Pending',
    description: 'Tech startup requiring cyber liability, E&O, and D&O coverage for Series C funding requirements'
  },
  { 
    id: '1001234583', 
    workType: 'Onboarding', 
    clientName: 'Heritage Hotels Group', 
    cnNumber: 'CN-2024-11178',
    accountOwner: 'Jennifer Adams',
    location: 'Las Vegas',
    dateCreated: '14 Jan 2026', 
    dueDate: '15 Feb 2026', 
    assignee: '', 
    priority: 'Medium', 
    status: 'Pending',
    description: 'Boutique hotel chain expanding to 15 properties - requires hospitality package and liquor liability'
  },
  { 
    id: '1001234584', 
    workType: 'Onboarding', 
    clientName: 'Greenfield Agriculture Co', 
    cnNumber: 'CN-2024-11201',
    accountOwner: 'Thomas Green',
    location: 'Des Moines',
    dateCreated: '14 Jan 2026', 
    dueDate: '18 Feb 2026', 
    assignee: '', 
    priority: 'Low', 
    status: 'Pending',
    description: 'Agricultural operation requiring crop insurance, equipment coverage, and environmental liability'
  },
  { 
    id: '1001234585', 
    workType: 'Onboarding', 
    clientName: 'Metro Transit Authority', 
    cnNumber: 'CN-2024-11223',
    accountOwner: 'Angela Martinez',
    location: 'Chicago',
    dateCreated: '15 Jan 2026', 
    dueDate: '20 Feb 2026', 
    assignee: '', 
    priority: 'High', 
    status: 'Pending',
    description: 'Public transit agency requiring fleet coverage, workers comp, and general liability for 500+ vehicles'
  },
  { 
    id: '1001234586', 
    workType: 'Onboarding', 
    clientName: 'Sterling Pharmaceuticals', 
    cnNumber: 'CN-2024-11245',
    accountOwner: 'Dr. Richard Lane',
    location: 'New Jersey',
    dateCreated: '15 Jan 2026', 
    dueDate: '25 Feb 2026', 
    assignee: '', 
    priority: 'High', 
    status: 'Pending',
    description: 'Pharmaceutical manufacturer requiring product liability, clinical trials coverage, and recalls insurance'
  },
  { 
    id: '1001234587', 
    workType: 'Onboarding', 
    clientName: 'Pioneer Mining Corp', 
    cnNumber: 'CN-2024-11267',
    accountOwner: 'Mark Sullivan',
    location: 'Denver',
    dateCreated: '16 Jan 2026', 
    dueDate: '28 Feb 2026', 
    assignee: '', 
    priority: 'Medium', 
    status: 'Pending',
    description: 'Mining operation requiring environmental liability, equipment breakdown, and workers compensation'
  },
  { 
    id: '1001234588', 
    workType: 'Onboarding', 
    clientName: 'Riverside Power & Utilities', 
    cnNumber: 'CN-2024-11289',
    accountOwner: 'Susan Wright',
    location: 'Portland',
    dateCreated: '16 Jan 2026', 
    dueDate: '01 Mar 2026', 
    assignee: '', 
    priority: 'Medium', 
    status: 'Pending',
    description: 'Regional utility company requiring property, liability, and cyber coverage for critical infrastructure'
  },
  { 
    id: '1001234589', 
    workType: 'Onboarding', 
    clientName: 'Global Shipping Lines', 
    cnNumber: 'CN-2024-11311',
    accountOwner: 'Captain James Moore',
    location: 'Long Beach',
    dateCreated: '16 Jan 2026', 
    dueDate: '05 Mar 2026', 
    assignee: '', 
    priority: 'High', 
    status: 'Pending',
    description: 'International shipping company requiring marine hull, cargo, and P&I coverage for 12 vessels'
  },
  { 
    id: '1001234590', 
    workType: 'Onboarding', 
    clientName: 'Apex Media Holdings', 
    cnNumber: 'CN-2024-11333',
    accountOwner: 'Victoria Hayes',
    location: 'Los Angeles',
    dateCreated: '16 Jan 2026', 
    dueDate: '08 Mar 2026', 
    assignee: '', 
    priority: 'Low', 
    status: 'Pending',
    description: 'Media conglomerate requiring E&O, cyber liability, and content liability coverage'
  },
  { 
    id: '1001234591', 
    workType: 'Onboarding', 
    clientName: 'Quantum Data Centers', 
    cnNumber: 'CN-2024-11355',
    accountOwner: 'Emily Watson',
    location: 'Northern Virginia',
    dateCreated: '16 Jan 2026', 
    dueDate: '10 Mar 2026', 
    assignee: '', 
    priority: 'High', 
    status: 'Pending',
    description: 'Data center operator requiring property, business interruption, and comprehensive cyber coverage'
  },
  { 
    id: '1001234592', 
    workType: 'Onboarding', 
    clientName: 'National Real Estate Partners', 
    cnNumber: 'CN-2024-11377',
    accountOwner: 'Michelle Torres',
    location: 'Atlanta',
    dateCreated: '16 Jan 2026', 
    dueDate: '12 Mar 2026', 
    assignee: '', 
    priority: 'Medium', 
    status: 'Pending',
    description: 'Commercial real estate firm with 45 properties requiring property, liability, and umbrella coverage'
  },
  { 
    id: '1001234593', 
    workType: 'Onboarding', 
    clientName: 'Elite Aviation Services', 
    cnNumber: 'CN-2024-11399',
    accountOwner: 'Captain Sarah Collins',
    location: 'Dallas',
    dateCreated: '16 Jan 2026', 
    dueDate: '15 Mar 2026', 
    assignee: '', 
    priority: 'High', 
    status: 'Pending',
    description: 'Private aviation company requiring aircraft hull, liability, and hangarkeepers coverage for 8 jets'
  }
];

export const WorkItemsProvider = ({ children }: { children: ReactNode }) => {
  const [workItems, setWorkItems] = useState<WorkItem[]>(initialWorkItems);

  const addWorkItem = (item: Omit<WorkItem, 'id' | 'dateCreated' | 'status'>): string => {
    const newId = Date.now().toString().slice(-10);
    const newItem: WorkItem = {
      ...item,
      id: newId,
      dateCreated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Pending',
      lastModified: new Date().toISOString(),
    };
    setWorkItems((prev) => [newItem, ...prev]);
    return newId;
  };

  const updateWorkItem = (id: string, updates: Partial<WorkItem>) => {
    setWorkItems((prev) => 
      prev.map((item) => 
        item.id === id 
          ? { ...item, ...updates, lastModified: new Date().toISOString() } 
          : item
      )
    );
  };

  const completeWorkItem = (id: string) => {
    setWorkItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'Completed' as const, isReadOnly: true, lastModified: new Date().toISOString() }
          : item
      )
    );
  };

  const cancelWorkItem = (id: string, notes: string) => {
    setWorkItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'Cancelled' as const, backendStatus: 'Cancelled' as const, cancellationNotes: notes, isReadOnly: true, lastModified: new Date().toISOString() }
          : item
      )
    );
  };

  const deleteWorkItem = (id: string) => {
    setWorkItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <WorkItemsContext.Provider value={{ workItems, addWorkItem, updateWorkItem, completeWorkItem, cancelWorkItem, deleteWorkItem }}>
      {children}
    </WorkItemsContext.Provider>
  );
};

export const useWorkItems = () => {
  const context = useContext(WorkItemsContext);
  if (!context) {
    throw new Error('useWorkItems must be used within a WorkItemsProvider');
  }
  return context;
};
