import React from 'react';
import { X } from 'lucide-react';

interface ExpertiseTagProps {
  label: string;
  onRemove?: () => void;
  className?: string;
}

export const ExpertiseTag: React.FC<ExpertiseTagProps> = ({ label, onRemove, className = '' }) => {
  return (
    <span 
      className={`
        inline-flex items-center gap-1 
        px-3 py-1 
        bg-[hsl(200,80%,95%)] 
        text-[hsl(220,100%,40%)] 
        text-sm 
        rounded-md 
        border border-[hsl(200,80%,85%)]
        ${className}
      `}
    >
      {label}
      {onRemove && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:text-[hsl(220,100%,30%)] focus:outline-none"
          aria-label={`Remove ${label}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </span>
  );
};

interface ExpertiseTagListProps {
  expertise: string[];
  maxVisible?: number;
  onRemove?: (index: number) => void;
  className?: string;
}

export const ExpertiseTagList: React.FC<ExpertiseTagListProps> = ({ 
  expertise, 
  maxVisible = 2,
  onRemove,
  className = '' 
}) => {
  const visibleTags = expertise.slice(0, maxVisible);
  const hiddenCount = expertise.length - maxVisible;
  const hiddenTags = expertise.slice(maxVisible);

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {visibleTags.map((tag, index) => (
        <ExpertiseTag 
          key={index} 
          label={tag} 
          onRemove={onRemove ? () => onRemove(index) : undefined}
        />
      ))}
      {hiddenCount > 0 && (
        <div className="relative group">
          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-md cursor-pointer">
            +{hiddenCount}
          </span>
          {/* Tooltip showing hidden tags */}
          <div className="absolute left-0 top-full mt-1 z-50 hidden group-hover:block">
            <div className="bg-white border border-[hsl(197,100%,44%)] rounded-md shadow-lg p-2 text-sm text-[hsl(220,100%,40%)] whitespace-nowrap">
              {hiddenTags.join(', ')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
