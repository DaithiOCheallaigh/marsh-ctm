import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface WorkItem {
  id: string;
  workType: string;
  clientName: string;
  dateCreated: string;
  dueDate: string;
  assignee: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Completed';
}

interface WorkItemsContextType {
  workItems: WorkItem[];
  addWorkItem: (item: Omit<WorkItem, 'id' | 'dateCreated' | 'status'>) => void;
}

const WorkItemsContext = createContext<WorkItemsContextType | undefined>(undefined);

const initialWorkItems: WorkItem[] = [
  { id: '1234567890', workType: 'Onboarding', clientName: 'Global Insurance Co', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Marsh New York (HQ)', priority: 'Medium', status: 'Pending' },
  { id: '1234567891', workType: 'Onboarding', clientName: 'Acme Inc', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Marsh London', priority: 'Medium', status: 'Pending' },
  { id: '1234567892', workType: 'New Joiner', clientName: 'Michael Chen', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Colin Masterson', priority: 'High', status: 'Completed' },
  { id: '1234567893', workType: 'Offboarding', clientName: 'Tech Start Inc', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Marsh Dubai', priority: 'Medium', status: 'Pending' },
  { id: '1234567894', workType: 'Onboarding', clientName: 'Regional Healthcare', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Marsh Cleveland', priority: 'High', status: 'Completed' },
  { id: '1234567895', workType: 'New Joiner', clientName: 'Sarah Anderson', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Colin Masterson', priority: 'Low', status: 'Pending' },
  { id: '1234567896', workType: 'Onboarding', clientName: 'Guy Carpenter', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Marsh Luxembourg', priority: 'Medium', status: 'Pending' },
  { id: '1234567897', workType: 'Leaver', clientName: 'Nikki Mullins', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Colin Masterson', priority: 'High', status: 'Pending' },
  { id: '1234567898', workType: 'Offboarding', clientName: 'Bora', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Marsh Amsterdam', priority: 'Medium', status: 'Pending' },
  { id: '1234567899', workType: 'Onboarding', clientName: 'Moss Inc', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Marsh Chennai', priority: 'High', status: 'Completed' },
  { id: '1234567900', workType: 'New Joiner', clientName: 'Barry Kilburn', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Colin Masterson', priority: 'Low', status: 'Pending' },
  { id: '1234567901', workType: 'New Joiner', clientName: 'Farah Sunid', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Colin Masterson', priority: 'Low', status: 'Pending' },
  { id: '1234567902', workType: 'Leaver', clientName: 'Macken Norbury', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Colin Masterson', priority: 'Medium', status: 'Pending' },
  { id: '1234567903', workType: 'Offboarding', clientName: 'Run Smart LLC', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Marsh California', priority: 'High', status: 'Completed' },
  { id: '1234567904', workType: 'Onboarding', clientName: 'Sundale Roofing Inc', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Marsh Dallas', priority: 'High', status: 'Completed' }
];

export const WorkItemsProvider = ({ children }: { children: ReactNode }) => {
  const [workItems, setWorkItems] = useState<WorkItem[]>(initialWorkItems);

  const addWorkItem = (item: Omit<WorkItem, 'id' | 'dateCreated' | 'status'>) => {
    const newItem: WorkItem = {
      ...item,
      id: Date.now().toString().slice(-10),
      dateCreated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Pending',
    };
    setWorkItems((prev) => [newItem, ...prev]);
  };

  return (
    <WorkItemsContext.Provider value={{ workItems, addWorkItem }}>
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
