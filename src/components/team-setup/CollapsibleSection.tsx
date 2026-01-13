import React, { useState } from 'react';
import { ChevronDown, Pencil } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onEdit?: () => void;
  showEditButton?: boolean;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = true,
  onEdit,
  showEditButton = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl border border-[hsl(var(--wq-border))] overflow-hidden">
      <div 
        className="flex items-center justify-between px-6 py-4 bg-[hsl(216,100%,97%)] cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold text-[hsl(var(--wq-primary))]">
          {title}
        </h3>
        <div className="flex items-center gap-3">
          {showEditButton && onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 rounded-lg hover:bg-[hsl(var(--wq-accent))]/10 transition-colors"
              aria-label={`Edit ${title}`}
            >
              <Pencil className="w-4 h-4 text-[hsl(var(--wq-accent))]" />
            </button>
          )}
          <ChevronDown 
            className={`
              w-5 h-5 text-[hsl(var(--wq-text-muted))] 
              transition-transform duration-200
              ${isOpen ? 'rotate-0' : '-rotate-90'}
            `}
          />
        </div>
      </div>
      {isOpen && (
        <div className="px-6 py-4">
          {children}
        </div>
      )}
    </div>
  );
};
