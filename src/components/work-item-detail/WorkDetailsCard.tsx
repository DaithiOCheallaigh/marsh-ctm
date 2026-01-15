import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Paperclip, FileText, Image, File, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkItem } from '@/context/WorkItemsContext';

interface WorkDetailsCardProps {
  workItem: WorkItem;
  rolesAssigned?: { current: number; total: number };
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.includes('pdf') || type.includes('document')) return FileText;
  return File;
};

export const WorkDetailsCard: React.FC<WorkDetailsCardProps> = ({
  workItem,
  rolesAssigned = { current: 0, total: 5 },
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Get team names from work item with truncation
  const teamNames = workItem.teams?.map(t => t.teamName).join(', ') || 'Not Assigned';
  const isReadOnly = workItem.status === 'Completed' || workItem.isReadOnly;

  return (
    <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-[hsl(var(--wq-bg-hover))] transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-primary font-bold text-sm">Work Details</h3>
          {isReadOnly && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-[hsl(var(--wq-bg-muted))] rounded-full">
              <Lock className="w-3 h-3 text-[hsl(var(--wq-text-secondary))]" />
              <span className="text-xs text-[hsl(var(--wq-text-secondary))] font-medium">Read Only</span>
            </div>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-[hsl(var(--wq-text-secondary))]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[hsl(var(--wq-text-secondary))]" />
        )}
      </button>
      
      <div 
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-6 py-5 border-t border-[hsl(var(--wq-border))]">
          {/* Description - Full Width Row */}
          <div className="mb-5 pb-5 border-b border-[hsl(var(--wq-border))]">
            <p className="text-[hsl(var(--wq-text-secondary))] text-xs mb-2">Description</p>
            <p className="text-primary text-sm">
              {workItem.description || "New client requires team assignment for upcoming project"}
            </p>
          </div>

          {/* Main Details Grid */}
          <div className="grid grid-cols-3 gap-x-12 gap-y-5">
            {/* Row 1 */}
            <div>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs mb-1">CN Number</p>
              <p className="text-primary text-sm font-medium">{workItem.cnNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs mb-1">Account Owner</p>
              <p className="text-primary text-sm font-medium">{workItem.accountOwner || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs mb-1">Location</p>
              <p className="text-primary text-sm font-medium">{workItem.location || 'Not Specified'}</p>
            </div>
            
            {/* Row 2 */}
            <div>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs mb-1">Team Names</p>
              <p 
                className="text-primary text-sm font-medium truncate max-w-[200px]"
                title={teamNames}
              >
                {teamNames}
              </p>
            </div>
            <div>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs mb-1">Date Created</p>
              <p className="text-primary text-sm font-medium">{workItem.dateCreated}</p>
            </div>
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

            {/* Row 3 */}
            <div>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs mb-1">Due Date</p>
              <p className="text-primary text-sm font-medium">{workItem.dueDate}</p>
            </div>
            <div>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs mb-1">Assigned To</p>
              <p className="text-primary text-sm font-medium">{workItem.assignee}</p>
            </div>
            <div>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs mb-1">Delegate Manager</p>
              <p className="text-primary text-sm font-medium">{workItem.delegateManager || 'Not Assigned'}</p>
            </div>
          </div>

          {/* Attachments Section */}
          {workItem.attachments && workItem.attachments.length > 0 && (
            <div className="mt-5 pt-5 border-t border-[hsl(var(--wq-border))]">
              <div className="flex items-center gap-2 mb-3">
                <Paperclip className="w-4 h-4 text-[hsl(var(--wq-text-secondary))]" />
                <p className="text-[hsl(var(--wq-text-secondary))] text-xs">
                  Attachments ({workItem.attachments.length})
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {workItem.attachments.map((attachment) => {
                  const IconComponent = getFileIcon(attachment.type);
                  const canPreview = attachment.type.startsWith('image/') || attachment.type === 'application/pdf';
                  
                  const handleClick = () => {
                    if (attachment.dataUrl) {
                      if (canPreview) {
                        // Open in new tab for preview
                        window.open(attachment.dataUrl, '_blank');
                      } else {
                        // Trigger download
                        const link = document.createElement('a');
                        link.href = attachment.dataUrl;
                        link.download = attachment.name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    }
                  };
                  
                  return (
                    <button
                      key={attachment.id}
                      onClick={handleClick}
                      disabled={!attachment.dataUrl}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 bg-[hsl(var(--wq-bg-muted))] rounded-md border border-[hsl(var(--wq-border))] transition-all",
                        attachment.dataUrl 
                          ? "hover:bg-[hsl(var(--wq-bg-hover))] hover:border-[hsl(var(--wq-accent))] cursor-pointer" 
                          : "cursor-not-allowed opacity-60"
                      )}
                      title={attachment.dataUrl ? (canPreview ? "Click to preview" : "Click to download") : "File not available"}
                    >
                      <IconComponent className="w-4 h-4 text-[hsl(var(--wq-accent))]" />
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-medium text-primary truncate max-w-[150px]">
                          {attachment.name}
                        </span>
                        <span className="text-xs text-[hsl(var(--wq-text-secondary))]">
                          {formatFileSize(attachment.size)} {canPreview ? "• Preview" : "• Download"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
