import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'On Track' | 'Overdue' | 'At Risk' | 'Completed';
  className?: string;
}

const parseDate = (dateStr: string): Date => {
  // Parse dates like "30 Jan 2026"
  const months: Record<string, number> = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  const parts = dateStr.split(' ');
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = months[parts[1]];
    const year = parseInt(parts[2]);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
};

export const getStatusFromDueDate = (dueDate: string, workItemStatus: string): 'On Track' | 'Overdue' | 'At Risk' | 'Completed' => {
  if (workItemStatus === 'Completed') return 'Completed';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = parseDate(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Overdue';
  if (diffDays <= 3) return 'At Risk';
  return 'On Track';
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, className = '' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'Completed':
        return {
          bgColor: 'bg-[hsl(var(--wq-status-completed-bg))]',
          textColor: 'text-[hsl(var(--wq-status-completed-text))]',
          borderColor: 'border-[hsl(var(--wq-status-completed-text))]',
          icon: CheckCircle,
          label: 'Completed',
        };
      case 'On Track':
        return {
          bgColor: 'bg-[hsl(var(--wq-status-completed-bg))]',
          textColor: 'text-[hsl(var(--wq-status-completed-text))]',
          borderColor: 'border-[hsl(var(--wq-status-completed-text))]',
          icon: CheckCircle,
          label: 'On Track',
        };
      case 'At Risk':
        return {
          bgColor: 'bg-[hsl(var(--wq-status-pending-bg))]',
          textColor: 'text-[hsl(var(--wq-status-pending-text))]',
          borderColor: 'border-[hsl(var(--wq-status-pending-text))]',
          icon: Clock,
          label: 'At Risk',
        };
      case 'Overdue':
        return {
          bgColor: 'bg-[hsl(var(--wq-priority-high-bg))]',
          textColor: 'text-[hsl(var(--wq-priority-high-text))]',
          borderColor: 'border-[hsl(var(--wq-priority-high-text))]',
          icon: AlertTriangle,
          label: 'Overdue',
        };
      default:
        return {
          bgColor: 'bg-[hsl(var(--wq-bg-muted))]',
          textColor: 'text-[hsl(var(--wq-text-secondary))]',
          borderColor: 'border-[hsl(var(--wq-text-secondary))]',
          icon: Clock,
          label: status,
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border",
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      <IconComponent className="w-4 h-4" />
      <span className="text-xs font-semibold">{config.label}</span>
    </div>
  );
};
