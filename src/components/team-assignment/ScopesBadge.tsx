import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ScopesBadgeProps {
  scopes: string[];
  className?: string;
}

export const ScopesBadge: React.FC<ScopesBadgeProps> = ({ scopes, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Tooltip open={isOpen} onOpenChange={setIsOpen}>
      <TooltipTrigger asChild>
        <button 
          className={`
            inline-flex items-center gap-1.5 
            px-2.5 py-1 
            bg-[hsl(210,40%,96%)] 
            text-[hsl(220,100%,40%)] 
            text-sm 
            rounded-md
            hover:bg-[hsl(210,40%,92%)]
            transition-colors
            ${className}
          `}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{scopes.length}</span>
          <Eye className="w-4 h-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent 
        side="bottom" 
        className="max-w-md bg-white border border-gray-200 shadow-lg p-4 z-[100]"
        sideOffset={5}
      >
        <div className="space-y-2">
          <h4 className="font-semibold text-[hsl(220,100%,24%)]">
            Scopes [{scopes.length}]
          </h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {scopes.join(', ')}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
