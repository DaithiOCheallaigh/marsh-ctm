import React from 'react';

interface PriorityBadgeProps {
  priority: 'High' | 'Medium' | 'Low';
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const priorityConfig = {
    High: {
      bg: 'bg-[hsl(2,100%,95%)]',
      text: 'text-[hsl(0,100%,35%)]'
    },
    Medium: {
      bg: 'bg-[hsl(33,100%,95%)]',
      text: 'text-[hsl(27,100%,48%)]'
    },
    Low: {
      bg: 'bg-[hsl(0,0%,94%)]',
      text: 'text-[hsl(0,0%,36%)]'
    }
  };

  const config = priorityConfig[priority];

  return (
    <span 
      className={`
        inline-flex items-center justify-center
        px-3 py-1
        rounded
        text-xs font-medium
        ${config.bg} ${config.text}
        min-w-[60px]
        ${className}
      `}
      role="status"
      aria-label={`Priority: ${priority}`}
    >
      {priority}
    </span>
  );
};
