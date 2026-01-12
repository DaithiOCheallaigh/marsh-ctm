import React from 'react';

interface WorkTypeBadgeProps {
  workType: string;
  className?: string;
}

export const WorkTypeBadge: React.FC<WorkTypeBadgeProps> = ({ workType, className = '' }) => {
  return (
    <span 
      className={`
        inline-flex items-center justify-center
        px-3 py-1
        rounded
        text-xs font-medium
        bg-[hsl(197,100%,44%,0.15)]
        text-[hsl(197,100%,44%)]
        ${className}
      `}
    >
      {workType}
    </span>
  );
};
