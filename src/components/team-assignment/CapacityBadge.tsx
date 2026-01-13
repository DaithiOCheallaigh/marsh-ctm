import React from 'react';
import { getCapacityColor, ClientAssignment } from '@/data/teamAssignments';

interface CapacityBadgeProps {
  capacity: number;
  className?: string;
}

export const CapacityBadge: React.FC<CapacityBadgeProps> = ({ capacity, className = '' }) => {
  const color = getCapacityColor(capacity);
  
  const colorClasses = {
    green: 'text-green-600',
    amber: 'text-amber-500',
    red: 'text-red-500',
  };

  return (
    <span className={`font-semibold ${colorClasses[color]} ${className}`}>
      {capacity}%
    </span>
  );
};

interface CapacityFromAssignmentsProps {
  assignments: ClientAssignment[];
  className?: string;
}

export const CapacityFromAssignments: React.FC<CapacityFromAssignmentsProps> = ({ 
  assignments, 
  className = '' 
}) => {
  const totalWorkload = assignments.reduce((sum, a) => sum + a.workload, 0);
  const capacity = Math.max(0, 100 - totalWorkload);
  return <CapacityBadge capacity={capacity} className={className} />;
};
