import React from 'react';
import { StatusBadge } from './StatusBadge';

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

interface DataTableProps {
  data: WorkItem[];
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  className?: string;
}

export const DataTable: React.FC<DataTableProps> = ({ data, onSort, className = "" }) => {
  const handleSort = (column: string) => {
    if (onSort) {
      onSort(column, 'asc');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-[#B30000]';
      case 'Medium': return 'text-[#FF7A00]';
      case 'Low': return 'text-black';
      default: return 'text-[#002C77]';
    }
  };

  const SortIcon = () => (
    <svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-3">
      <path d="M4.99347 0L0 4.66667H9.98694L4.99347 0ZM4.99347 12L9.98694 7.33333H0L4.99347 12Z" fill="#949494"/>
    </svg>
  );

  return (
    <div className={`relative w-full overflow-x-auto ${className}`}>
      <div className="bg-white border border-[#C4C4C4] rounded-lg min-w-[1000px]">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F4F8FF] rounded-t-lg">
              <th className="text-neutral-700 text-sm font-bold text-left px-5 py-3 w-[147px]">Work ID</th>
              <th className="text-neutral-700 text-sm font-bold text-left px-2 py-3 w-[160px]">
                <button onClick={() => handleSort('workType')} className="flex items-center gap-1 hover:text-[#009DE0]">
                  Work Type <SortIcon />
                </button>
              </th>
              <th className="text-neutral-700 text-sm font-bold text-left px-2 py-3 w-[168px]">Client/Colleague Name</th>
              <th className="text-neutral-700 text-sm font-bold text-left px-2 py-3 w-[101px]">
                <button onClick={() => handleSort('dateCreated')} className="flex items-center gap-1 hover:text-[#009DE0]">
                  Date Created <SortIcon />
                </button>
              </th>
              <th className="text-neutral-700 text-sm font-bold text-left px-2 py-3 w-[79px]">
                <button onClick={() => handleSort('dueDate')} className="flex items-center gap-1 hover:text-[#009DE0]">
                  Due Date <SortIcon />
                </button>
              </th>
              <th className="text-neutral-700 text-sm font-bold text-left px-2 py-3 w-[121px]">Assignee</th>
              <th className="text-neutral-700 text-sm font-bold text-left px-2 py-3 w-[128px]">Priority</th>
              <th className="text-neutral-700 text-sm font-bold text-left px-2 py-3 w-[128px]">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <React.Fragment key={`${item.id}-${index}`}>
                <tr className="h-10">
                  <td className="text-[#002C77] text-xs font-medium tracking-[-0.24px] px-5 py-2">[{item.id}]</td>
                  <td className="text-[#002C77] text-xs font-medium tracking-[-0.24px] px-2 py-2">{item.workType}</td>
                  <td className="text-[#002C77] text-xs font-normal tracking-[-0.24px] px-2 py-2">{item.clientName}</td>
                  <td className="text-[#002C77] text-xs font-medium tracking-[-0.24px] px-2 py-2">[{item.dateCreated}]</td>
                  <td className="text-[#002C77] text-xs font-medium tracking-[-0.24px] px-2 py-2">[{item.dueDate}]</td>
                  <td className="text-[#002C77] text-xs font-medium tracking-[-0.24px] px-2 py-2">{item.assignee}</td>
                  <td className={`text-xs font-medium tracking-[-0.24px] px-2 py-2 ${getPriorityColor(item.priority)}`}>{item.priority}</td>
                  <td className="px-2 py-2"><StatusBadge status={item.status} /></td>
                </tr>
                {index < data.length - 1 && (
                  <tr><td colSpan={8} className="h-px bg-[#CDCDCD] opacity-25" /></tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
