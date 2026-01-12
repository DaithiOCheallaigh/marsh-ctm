import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { WorkItem } from '@/context/WorkItemsContext';

interface WorkDetailsCardProps {
  workItem: WorkItem;
  description?: string;
  cnNumber?: string;
  teamName?: string;
  rolesAssigned?: { current: number; total: number };
}

export const WorkDetailsCard: React.FC<WorkDetailsCardProps> = ({
  workItem,
  description = "New client requires team assignment for upcoming project",
  cnNumber = "CN12345678",
  teamName = "Marsh North America",
  rolesAssigned = { current: 0, total: 5 },
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-[hsl(var(--wq-bg-hover))] transition-colors"
      >
        <h3 className="text-primary font-bold text-sm">Work Details</h3>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-[hsl(var(--wq-text-secondary))]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[hsl(var(--wq-text-secondary))]" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-6 py-5 border-t border-[hsl(var(--wq-border))]">
          <div className="grid grid-cols-3 gap-x-12 gap-y-5">
            {/* Row 1 */}
            <div>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs mb-1">Description</p>
              <p className="text-primary text-sm font-medium">{description}</p>
            </div>
            <div>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs mb-1">CN Number</p>
              <p className="text-accent text-sm font-medium">{cnNumber}</p>
            </div>
            <div>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs mb-1">Team Name</p>
              <p className="text-accent text-sm font-medium">{teamName}</p>
            </div>
            
            {/* Row 2 */}
            <div>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs mb-1">Date Created</p>
              <p className="text-accent text-sm font-medium">{workItem.dateCreated}</p>
            </div>
            <div>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs mb-1">Roles Assigned</p>
              <p className="text-accent text-sm font-medium">
                {rolesAssigned.current}/{rolesAssigned.total}
              </p>
            </div>
            <div>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs mb-1">Due Date</p>
              <p className="text-accent text-sm font-medium">{workItem.dueDate}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
