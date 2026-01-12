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
        className="w-full flex items-center justify-between px-6 py-4 bg-[hsl(var(--wq-bg-header))] hover:bg-[hsl(216,100%,95%)] transition-colors"
      >
        <h3 className="text-primary font-bold text-base">Work Details</h3>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-6 py-5">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-muted-foreground text-xs font-medium mb-1">Description</p>
              <p className="text-accent text-sm font-medium">{description}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium mb-1">CN Number</p>
              <p className="text-accent text-sm font-medium">{cnNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium mb-1">Team Name</p>
              <p className="text-accent text-sm font-medium">{teamName}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6 mt-5">
            <div>
              <p className="text-muted-foreground text-xs font-medium mb-1">Date Created</p>
              <p className="text-accent text-sm font-medium">{workItem.dateCreated}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium mb-1">Roles Assigned</p>
              <p className="text-accent text-sm font-medium">
                {rolesAssigned.current}/{rolesAssigned.total}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium mb-1">Due Date</p>
              <p className="text-accent text-sm font-medium">{workItem.dueDate}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
