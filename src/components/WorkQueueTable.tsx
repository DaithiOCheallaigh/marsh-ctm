import React, { useState, useMemo } from 'react';
import { SearchBar } from './SearchBar';
import { TabNavigation } from './TabNavigation';
import { DataTable, WorkItem } from './DataTable';
import { TablePagination } from './TablePagination';
import { Clock, Plus, FileText } from 'lucide-react';

const mockData: WorkItem[] = [
  { id: '1234567890', workType: 'Onboarding', clientName: 'Global Insurance Co', dateCreated: '08 Sep 2025', dueDate: '30 Jan 2026', assignee: 'Marsh New York (HQ)', priority: 'Medium', status: 'Pending' },
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
  const [resultsPerPage, setResultsPerPage] = useState(15);

  const filteredData = useMemo(() => {
    let filtered = mockData;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.clientName.toLowerCase().includes(query) ||
        item.workType.toLowerCase().includes(query) ||
        item.assignee.toLowerCase().includes(query) ||
        item.id.includes(query)
      );
    }
    if (activeTab === 'pending') filtered = filtered.filter(item => item.status === 'Pending');
    else if (activeTab === 'completed') filtered = filtered.filter(item => item.status === 'Completed');
    return filtered;
  }, [searchQuery, activeTab]);

  const tabs = useMemo(() => [
    { id: 'all', label: 'All', count: mockData.length },
    { id: 'pending', label: 'Pending', count: mockData.filter(i => i.status === 'Pending').length },
    { id: 'completed', label: 'Completed', count: mockData.filter(i => i.status === 'Completed').length }
  ], []);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / resultsPerPage));
  const paginatedData = filteredData.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage);

  return (
    <div className={className}>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[hsl(197,100%,44%,0.1)] flex items-center justify-center">
            <FileText className="w-5 h-5 text-[hsl(197,100%,44%)]" />
          </div>
          <h2 className="text-[hsl(220,100%,24%)] text-lg font-bold">Work Queue</h2>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Last Updated */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[hsl(0,0%,91%)] rounded-lg">
            <Clock className="w-4 h-4 text-[hsl(0,0%,25%)]" />
            <span className="text-[hsl(0,0%,25%)] text-xs font-medium">26 Feb 2024 13:42 EST</span>
          </div>
          
          {/* Create Button */}
          <button 
            className="
              flex items-center gap-2
              bg-[hsl(220,100%,24%)] 
              text-white text-sm font-medium
              px-5 py-2.5
              rounded-lg
              shadow-sm
              hover:bg-[hsl(220,100%,18%)] hover:shadow-md
              active:scale-[0.98]
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-[hsl(220,100%,24%)] focus:ring-offset-2
            "
          >
            <span>Create Work Item</span>
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Divider */}
      <div className="w-full h-px bg-[hsl(220,100%,24%)] opacity-20 mb-6" />
      
      {/* Search and Filters */}
      <div className="flex justify-between items-center mb-6">
        <SearchBar onSearch={setSearchQuery} />
        <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={(id) => { setActiveTab(id); setCurrentPage(1); }} />
      </div>
      
      {/* Table */}
      <DataTable data={paginatedData} />
      
      {/* Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        resultsPerPage={resultsPerPage}
        onPageChange={setCurrentPage}
        onResultsPerPageChange={(count) => { setResultsPerPage(count); setCurrentPage(1); }}
      />
    </div>
  );
};
