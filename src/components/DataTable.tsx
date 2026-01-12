import React, { useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { ChevronUp, ChevronDown } from 'lucide-react';

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

interface SortConfig {
  column: string | null;
  direction: 'asc' | 'desc';
}

interface DataTableProps {
  data: WorkItem[];
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  className?: string;
}

export const DataTable: React.FC<DataTableProps> = ({ data, onSort, className = "" }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: null, direction: 'asc' });

  const handleSort = (column: string) => {
    const newDirection = sortConfig.column === column && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ column, direction: newDirection });
    if (onSort) {
      onSort(column, newDirection);
    }
  };

  const SortableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => {
    const isActive = sortConfig.column === column;
    return (
      <button 
        onClick={() => handleSort(column)}
        className="
          flex items-center gap-1.5 
          hover:text-[hsl(197,100%,44%)] 
          transition-colors cursor-pointer
          group
        "
        aria-label={`Sort by ${column}`}
      >
        <span>{children}</span>
        <span className="flex flex-col gap-0.5 opacity-50 group-hover:opacity-100">
          <ChevronUp className={`w-3 h-3 -mb-1 ${isActive && sortConfig.direction === 'asc' ? 'text-[hsl(197,100%,44%)]' : ''}`} />
          <ChevronDown className={`w-3 h-3 -mt-1 ${isActive && sortConfig.direction === 'desc' ? 'text-[hsl(197,100%,44%)]' : ''}`} />
        </span>
      </button>
    );
  };

  return (
    <div className={`relative w-full overflow-x-auto ${className}`}>
      <div className="bg-white border border-[hsl(0,0%,89%)] rounded-lg shadow-sm min-w-[1000px]">
        <table className="w-full" role="table" aria-label="Work queue items">
          <thead>
            <tr className="bg-[hsl(216,100%,97%)] border-b border-[hsl(0,0%,89%)]">
              <th className="text-[hsl(0,0%,45%)] text-xs font-bold uppercase tracking-[0.5px] text-left px-4 py-4 w-[140px]" scope="col">
                Work ID
              </th>
              <th className="text-[hsl(0,0%,45%)] text-xs font-bold uppercase tracking-[0.5px] text-left px-3 py-4 w-[130px]" scope="col">
                <SortableHeader column="workType">Work Type</SortableHeader>
              </th>
              <th className="text-[hsl(0,0%,45%)] text-xs font-bold uppercase tracking-[0.5px] text-left px-3 py-4 w-[180px]" scope="col">
                Client/Colleague
              </th>
              <th className="text-[hsl(0,0%,45%)] text-xs font-bold uppercase tracking-[0.5px] text-left px-3 py-4 w-[120px]" scope="col">
                <SortableHeader column="dateCreated">Date Created</SortableHeader>
              </th>
              <th className="text-[hsl(0,0%,45%)] text-xs font-bold uppercase tracking-[0.5px] text-left px-3 py-4 w-[110px]" scope="col">
                <SortableHeader column="dueDate">Due Date</SortableHeader>
              </th>
              <th className="text-[hsl(0,0%,45%)] text-xs font-bold uppercase tracking-[0.5px] text-left px-3 py-4 w-[160px]" scope="col">
                Assignee
              </th>
              <th className="text-[hsl(0,0%,45%)] text-xs font-bold uppercase tracking-[0.5px] text-left px-3 py-4 w-[100px]" scope="col">
                Priority
              </th>
              <th className="text-[hsl(0,0%,45%)] text-xs font-bold uppercase tracking-[0.5px] text-left px-3 py-4 w-[110px]" scope="col">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr 
                key={`${item.id}-${index}`}
                className={`
                  border-b border-[hsl(0,0%,89%)] last:border-b-0
                  hover:bg-[hsl(210,20%,98%)]
                  transition-colors duration-150
                  cursor-pointer
                `}
                tabIndex={0}
                role="row"
              >
                <td className="text-[hsl(220,100%,24%)] text-sm font-medium px-4 py-4">
                  [{item.id}]
                </td>
                <td className="text-[hsl(220,100%,24%)] text-sm font-medium px-3 py-4">
                  {item.workType}
                </td>
                <td className="text-[hsl(0,0%,25%)] text-sm font-normal px-3 py-4 truncate max-w-[180px]">
                  {item.clientName}
                </td>
                <td className="text-[hsl(220,100%,24%)] text-sm font-medium px-3 py-4">
                  {item.dateCreated}
                </td>
                <td className="text-[hsl(220,100%,24%)] text-sm font-medium px-3 py-4">
                  {item.dueDate}
                </td>
                <td className="text-[hsl(220,100%,24%)] text-sm font-medium px-3 py-4 truncate max-w-[160px]">
                  {item.assignee}
                </td>
                <td className="px-3 py-4">
                  <PriorityBadge priority={item.priority} />
                </td>
                <td className="px-3 py-4">
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
