import React from 'react';
import { Clock } from 'lucide-react';

interface TeamTimestampProps {
  timestamp?: string;
}

export const TeamTimestamp: React.FC<TeamTimestampProps> = ({ 
  timestamp = '26 Feb 2024 13:42 EST' 
}) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-[hsl(var(--wq-bg-muted))] text-sm text-[hsl(var(--wq-text-secondary))]">
      <Clock className="w-4 h-4" />
      <span>{timestamp}</span>
    </div>
  );
};
