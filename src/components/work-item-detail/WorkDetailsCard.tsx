import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkItem } from '@/context/WorkItemsContext';

interface WorkDetailsCardProps {
  workItem: WorkItem;
  rolesAssigned?: { current: number; total: number };
}

export const WorkDetailsCard: React.FC<WorkDetailsCardProps> = ({
  workItem,
  rolesAssigned = { current: 0, total: 5 },
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Get team names from work item
  const teamNames = workItem.teams?.map(t => t.teamName).join(', ') || 'Not Assigned';

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
      
      <div 
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-6 py-5 border-t border-[hsl(var(--wq-border))]">
          <div className="grid grid-cols-3 gap-x-12 gap-y-5">
            {/* Row 1 */}
            <div>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs mb-1">Description</p>
              <p className="text-primary text-sm font-medium">
                {workItem.description || "New client requires team assignment for upcoming project"}
              </p>
            </div>
            <div>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs mb-1">CN Number</p>
              <p className="text-primary text-sm font-medium">{workItem.cnNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs mb-1">Account Owner</p>
              <p className="text-primary text-sm font-medium">{workItem.accountOwner || 'Unassigned'}</p>
            </div>
            
            {/* Row 2 */}
            <div>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs mb-1">Location</p>
              <p className="text-primary text-sm font-medium">{workItem.location || 'Not Specified'}</p>
            </div>
            <div>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs mb-1">Team Names</p>
              <p className="text-primary text-sm font-medium">{teamNames}</p>
            </div>
            <div>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs mb-1">Date Created</p>
              <p className="text-primary text-sm font-medium">{workItem.dateCreated}</p>
            </div>

            {/* Row 3 */}
            <div>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs mb-1">Roles Assigned</p>
              <div className="flex items-center gap-2">
                <p className="text-primary text-sm font-medium">
                  {rolesAssigned.current}/{rolesAssigned.total}
                </p>
                <div className="flex-1 max-w-[100px] h-2 bg-[hsl(var(--wq-bg-muted))] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[hsl(var(--wq-status-completed-text))] rounded-full transition-all duration-300"
                    style={{ width: `${(rolesAssigned.current / rolesAssigned.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs mb-1">Due Date</p>
              <p className="text-primary text-sm font-medium">{workItem.dueDate}</p>
            </div>
            <div>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs mb-1">Assigned To</p>
              <p className="text-primary text-sm font-medium">{workItem.assignee}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
