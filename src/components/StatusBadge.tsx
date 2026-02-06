import React from 'react';
import { AlertTriangle, Check, CircleCheck } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StatusBadgeProps {
  status: 'Pending' | 'Completed' | 'Draft' | 'Cancelled';
  isPartiallyCompleted?: boolean;
  assignedCount?: number;
  totalCount?: number;
  justification?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  isPartiallyCompleted = false, 
  assignedCount,
  totalCount,
  justification,
  className = '' 
}) => {
  const statusConfig = {
    Pending: {
      bg: 'bg-[hsl(33,100%,93%)]',
      text: 'text-[hsl(30,100%,50%)]',
      border: 'border-[hsl(30,100%,50%,0.2)]',
      icon: null
    },
    Completed: {
      bg: isPartiallyCompleted 
        ? 'bg-gray-100' // Grey for partial
        : 'bg-[hsl(136,70%,90%)]', // Green for full
      text: isPartiallyCompleted 
        ? 'text-gray-600' // Grey text
        : 'text-[hsl(120,100%,27%)]', // Green text
      border: isPartiallyCompleted 
        ? 'border-gray-300'
        : 'border-[hsl(120,100%,27%,0.2)]',
      icon: isPartiallyCompleted ? AlertTriangle : CircleCheck
    },
    Draft: {
      bg: 'bg-[hsl(210,20%,93%)]',
      text: 'text-[hsl(210,15%,45%)]',
      border: 'border-[hsl(210,15%,45%,0.2)]',
      icon: null
    },
    Cancelled: {
      bg: 'bg-red-50',
      text: 'text-destructive',
      border: 'border-red-200',
      icon: null
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  // Truncate justification for tooltip preview (max 100 chars)
  const truncatedJustification = justification && justification.length > 100 
    ? `${justification.substring(0, 100)}...` 
    : justification;

  const tooltipContent = isPartiallyCompleted 
    ? `Partially Completed${assignedCount !== undefined && totalCount !== undefined ? ` - ${assignedCount} of ${totalCount} roles assigned` : ' - Not all roles were assigned'}${truncatedJustification ? `\n\nReason: ${truncatedJustification}` : ''}`
    : status === 'Completed' 
      ? 'Fully Completed - All required roles assigned'
      : undefined;

  const badge = (
    <span 
      className={`
        inline-flex items-center justify-center gap-1
        px-3 py-1
        rounded
        text-xs font-medium
        ${config.bg} ${config.text}
        min-w-[80px]
        ${className}
      `}
      role="status"
      aria-label={`Status: ${status}${isPartiallyCompleted ? ' (Partial)' : ''}`}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {status}
    </span>
  );

  if (tooltipContent) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipContent}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
};
