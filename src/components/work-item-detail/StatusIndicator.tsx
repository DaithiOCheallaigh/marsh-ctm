import React from 'react';

interface StatusIndicatorProps {
  status: 'On Track' | 'At Risk' | 'Delayed';
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, className = '' }) => {
  const statusConfig = {
    'On Track': {
      bg: 'bg-[hsl(136,70%,90%)]',
      text: 'text-[hsl(120,100%,27%)]',
      border: 'border-[hsl(120,100%,27%)]'
    },
    'At Risk': {
      bg: 'bg-[hsl(33,100%,93%)]',
      text: 'text-[hsl(30,100%,50%)]',
      border: 'border-[hsl(30,100%,50%)]'
    },
    'Delayed': {
      bg: 'bg-[hsl(2,100%,95%)]',
      text: 'text-[hsl(0,100%,35%)]',
      border: 'border-[hsl(0,100%,35%)]'
    }
  };

  const config = statusConfig[status];

  return (
    <span 
      className={`
        inline-flex items-center justify-center
        px-3 py-1.5
        rounded-full
        text-xs font-medium
        border
        ${config.bg} ${config.text} ${config.border}
        ${className}
      `}
    >
      {status}
    </span>
  );
};
