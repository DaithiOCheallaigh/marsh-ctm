import React from 'react';
import { X } from 'lucide-react';

interface QualifierBadgeProps {
  label: string;
  onRemove?: () => void;
  variant?: 'default' | 'removable';
}

export const QualifierBadge: React.FC<QualifierBadgeProps> = ({ 
  label, 
  onRemove, 
  variant = 'default' 
}) => {
  return (
    <span 
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1
        rounded-full
        text-sm font-medium
        border border-[hsl(var(--wq-accent))]
        text-[hsl(var(--wq-accent))]
        bg-white
        ${variant === 'removable' ? 'pr-2' : ''}
      `}
    >
      {label}
      {variant === 'removable' && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="
            w-4 h-4 
            flex items-center justify-center 
            rounded-full 
            hover:bg-[hsl(var(--wq-accent))]/10
            transition-colors
          "
          aria-label={`Remove ${label}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};
