import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface TeamConfig {
  teamName: string;
  roles: string[];
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string; // Base64 data URL for download/preview
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
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Completed';
  description?: string;
  teams?: TeamConfig[];
  attachments?: Attachment[];
  isReadOnly?: boolean;
  lastModified?: string;
}

interface WorkItemsContextType {
  workItems: WorkItem[];
  addWorkItem: (item: Omit<WorkItem, 'id' | 'dateCreated' | 'status'>) => void;
  updateWorkItem: (id: string, updates: Partial<WorkItem>) => void;
  completeWorkItem: (id: string) => void;
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
      { teamName: 'Property Risk', roles: ['Senior Account Manager', 'Risk Engineer'] },
      { teamName: 'General Liability', roles: ['Claims Specialist'] }
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
      { teamName: 'Marine Cargo', roles: ['Account Executive', 'Underwriting Specialist'] },
      { teamName: 'Fleet', roles: ['Fleet Manager'] }
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
      { teamName: 'Healthcare Professional Liability', roles: ['Account Director', 'Senior Broker'] },
      { teamName: 'D&O', roles: ['D&O Specialist'] },
      { teamName: 'Property', roles: ['Risk Consultant'] }
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
      { teamName: 'Construction', roles: ['Construction Specialist', 'Surety Bond Manager'] }
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
      { teamName: 'Energy', roles: ['Energy Specialist', 'Senior Broker', 'Risk Engineer'] },
      { teamName: 'Environmental', roles: ['Environmental Risk Manager'] }
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
      { teamName: 'Financial Institutions', roles: ['FI Specialist', 'Account Director'] },
      { teamName: 'Cyber', roles: ['Cyber Risk Analyst'] }
    ]
  }
];

export const WorkItemsProvider = ({ children }: { children: ReactNode }) => {
  const [workItems, setWorkItems] = useState<WorkItem[]>(initialWorkItems);

  const addWorkItem = (item: Omit<WorkItem, 'id' | 'dateCreated' | 'status'>) => {
    const newItem: WorkItem = {
      ...item,
      id: Date.now().toString().slice(-10),
      dateCreated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Pending',
      lastModified: new Date().toISOString(),
    };
    setWorkItems((prev) => [newItem, ...prev]);
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

  return (
    <WorkItemsContext.Provider value={{ workItems, addWorkItem, updateWorkItem, completeWorkItem }}>
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
