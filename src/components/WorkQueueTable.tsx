import React, { useState, useMemo } from 'react';
import { SearchBar } from './SearchBar';
import { TabNavigation } from './TabNavigation';
import { DataTable, WorkItem } from './DataTable';
import { TablePagination } from './TablePagination';

const mockData: WorkItem[] = [
  { id: '1234567890', workType: 'Onboarding', clientName: 'Global insurance Co', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Marsh New York (HQ)', priority: 'Medium', status: 'Pending' },
  { id: '1234567890', workType: 'Onboarding', clientName: 'Acme Inc', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Marsh London', priority: 'Medium', status: 'Pending' },
  { id: '1234567890', workType: 'New Joiner', clientName: 'Michael Chen', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Colin Masterson', priority: 'High', status: 'Completed' },
  { id: '1234567890', workType: 'Offboarding', clientName: 'Tech Start Inc', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Marsh Dubai', priority: 'Medium', status: 'Pending' },
  { id: '1234567890', workType: 'Onboarding', clientName: 'Regional Healthcare', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Marsh Cleveland', priority: 'High', status: 'Completed' },
  { id: '1234567890', workType: 'New Joiner', clientName: 'Sarah Anderson', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Colin Masterson', priority: 'Low', status: 'Pending' },
  { id: '1234567890', workType: 'Onboarding', clientName: 'Guy Carpenter', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Marsh Luxembourg', priority: 'Medium', status: 'Pending' },
  { id: '1234567890', workType: 'Leaver', clientName: 'Nikki Mullins', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Colin Masterson', priority: 'High', status: 'Pending' },
  { id: '1234567890', workType: 'Offboarding', clientName: 'Bora', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Marsh Amsterdam', priority: 'Medium', status: 'Pending' },
  { id: '1234567890', workType: 'Onboarding', clientName: 'Moss Inc', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Marsh Chennai', priority: 'High', status: 'Completed' },
  { id: '1234567890', workType: 'New Joiner', clientName: 'Barry Kilburn', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Colin Masterson', priority: 'Low', status: 'Pending' },
  { id: '1234567890', workType: 'New Joiner', clientName: 'Farah Sunid', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Colin Masterson', priority: 'Low', status: 'Pending' },
  { id: '1234567890', workType: 'Leaver', clientName: 'Macken Norbury', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Colin Masterson', priority: 'Medium', status: 'Pending' },
  { id: '1234567890', workType: 'Offboarding', clientName: 'Run Smart LLC', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Marsh California', priority: 'High', status: 'Completed' },
  { id: '1234567890', workType: 'Onboarding', clientName: 'Sundale Roofing Inc', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Marsh Dallas', priority: 'High', status: 'Completed' }
];

export const WorkQueueTable: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 15;

  const tabs = [
    { id: 'all', label: 'All', count: 4 },
    { id: 'pending', label: 'Pending', count: 23 },
    { id: 'completed', label: 'Completed', count: 18 }
  ];

  const filteredData = useMemo(() => {
    let filtered = mockData;
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.workType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeTab === 'pending') filtered = filtered.filter(item => item.status === 'Pending');
    else if (activeTab === 'completed') filtered = filtered.filter(item => item.status === 'Completed');
    return filtered;
  }, [searchQuery, activeTab]);

  const totalPages = Math.ceil(filteredData.length / resultsPerPage) || 1;

  return (
    <div className={className}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-[7px]">
          <svg width="20" height="32" viewBox="0 0 20 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-8">
            <path d="M15.333 8H4.66634V9.33333H15.333V8ZM4.66634 24H15.333V22.6667H4.66634V24ZM15.333 10.6667H4.66634C3.93301 10.6667 3.33301 11.2667 3.33301 12V20C3.33301 20.7333 3.93301 21.3333 4.66634 21.3333H15.333C16.0663 21.3333 16.6663 20.7333 16.6663 20V12C16.6663 11.2667 16.0663 10.6667 15.333 10.6667ZM9.99967 12.5C10.8263 12.5 11.4997 13.1733 11.4997 14C11.4997 14.8267 10.8263 15.5 9.99967 15.5C9.17301 15.5 8.49967 14.8267 8.49967 14C8.49967 13.1733 9.17301 12.5 9.99967 12.5ZM13.333 19.3333H6.66634V18.3333C6.66634 17.22 8.88634 16.6667 9.99967 16.6667C11.113 16.6667 13.333 17.22 13.333 18.3333V19.3333Z" fill="#009DE0"/>
          </svg>
          <h1 className="text-[#002C77] text-base font-bold leading-5">Work Queue</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex w-[148px] h-7 justify-center items-center gap-[9px] bg-[#E7E7E7] px-2 rounded-lg">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3">
              <path d="M0.844 8.70641C1.40803 9.84676 2.3228 10.7762 3.454 11.3584C4.57709 11.9351 5.85759 12.1298 7.10133 11.9131C8.34894 11.6937 9.49196 11.0763 10.3593 10.1531C11.2348 9.22118 11.7921 8.03571 11.9513 6.76707C12.1131 5.49556 11.8695 4.20543 11.2553 3.08041C10.6469 1.96395 9.69597 1.07241 8.54267 0.537073C7.39713 0.00651669 6.10976 -0.135796 4.876 0.13174C3.64267 0.399073 2.632 1.00707 1.796 1.96841C1.69533 2.07507 1.306 2.50574 0.982667 3.15574M3 3.33307L0.594 3.81307L0 1.33307M6 3.99974V6.66641L8 7.99974" stroke="#404040" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-neutral-700 text-[10px] font-normal">26 Feb 2024 13:42 EST</span>
          </div>
          
          <button className="flex w-[148px] h-8 justify-center items-center gap-2 bg-[#002C77] px-4 py-2 rounded-lg hover:bg-[#001a4d]">
            <span className="text-white text-center text-xs font-medium">Create Work Item</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5">
              <path d="M9.28571 5.71429H5.71429V9.28571C5.71429 9.47515 5.63903 9.65684 5.50508 9.79079C5.37112 9.92475 5.18944 10 5 10C4.81056 10 4.62888 9.92475 4.49492 9.79079C4.36097 9.65684 4.28571 9.47515 4.28571 9.28571V5.71429H0.714286C0.524845 5.71429 0.343164 5.63903 0.20921 5.50508C0.075255 5.37112 0 5.18944 0 5C0 4.81056 0.075255 4.62888 0.20921 4.49492C0.343164 4.36097 0.524845 4.28571 0.714286 4.28571H4.28571V0.714286C4.28571 0.524845 4.36097 0.343164 4.49492 0.209209C4.62888 0.0752547 4.81056 0 5 0C5.18944 0 5.37112 0.0752547 5.50508 0.209209C5.63903 0.343164 5.71429 0.524845 5.71429 0.714286V4.28571H9.28571C9.47515 4.28571 9.65684 4.36097 9.79079 4.49492C9.92475 4.62888 10 4.81056 10 5C10 5.18944 9.92475 5.37112 9.79079 5.50508C9.65684 5.63903 9.47515 5.71429 9.28571 5.71429Z" fill="white"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="w-full h-px bg-[#002C77] opacity-50 mb-4" />
      
      <div className="flex justify-between items-center mb-4">
        <SearchBar onSearch={setSearchQuery} />
        <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      
      <DataTable data={filteredData} />
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        resultsPerPage={resultsPerPage}
        onPageChange={setCurrentPage}
        onResultsPerPageChange={() => {}}
      />
    </div>
  );
};
