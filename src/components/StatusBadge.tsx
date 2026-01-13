import React from 'react';

interface StatusBadgeProps {
  status: 'Pending' | 'Completed' | 'Draft';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const statusConfig = {
    Pending: {
      bg: 'bg-[hsl(33,100%,93%)]',
      text: 'text-[hsl(30,100%,50%)]',
      border: 'border-[hsl(30,100%,50%,0.2)]'
    },
    Completed: {
      bg: 'bg-[hsl(136,70%,90%)]',
      text: 'text-[hsl(120,100%,27%)]',
      border: 'border-[hsl(120,100%,27%,0.2)]'
    },
    Draft: {
      bg: 'bg-[hsl(210,20%,93%)]',
      text: 'text-[hsl(210,15%,45%)]',
      border: 'border-[hsl(210,15%,45%,0.2)]'
    }
  };

  const config = statusConfig[status];

  return (
    <span 
      className={`
        inline-flex items-center justify-center
        px-3 py-1
        rounded
        text-xs font-medium
        ${config.bg} ${config.text}
        min-w-[80px]
        ${className}
      `}
      role="status"
      aria-label={`Status: ${status}`}
    >
      {status}
    </span>
  );
};
