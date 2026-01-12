import React from 'react';

interface StatusBadgeProps {
  status: 'Pending' | 'Completed';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const baseClasses = "flex w-[104px] h-6 justify-center items-center gap-2.5 p-2.5 rounded-lg";
  
  const statusClasses = {
    Pending: "bg-[#FFEDDD] text-[#FF7A00]",
    Completed: "bg-[rgba(175,244,198,0.70)] text-[#008B06]"
  };

  return (
    <div className={`${baseClasses} ${statusClasses[status]} ${className}`}>
      <div className="text-xs font-medium">
        {status}
      </div>
    </div>
  );
};
