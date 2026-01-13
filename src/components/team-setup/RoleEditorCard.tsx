import React, { useState } from 'react';
import { Trash2, ChevronDown, Plus } from 'lucide-react';
import { TeamRole } from '@/data/teams';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RoleEditorCardProps {
  roleName: string;
  chairs: {
    id: string;
    chairName: string;
    chairType: 'Primary' | 'Secondary';
    order: number;
  }[];
  onDeleteRole: () => void;
  onUpdateChair: (chairId: string, updates: Partial<TeamRole>) => void;
  onDeleteChair: (chairId: string) => void;
  onAddChair: () => void;
}

export const RoleEditorCard: React.FC<RoleEditorCardProps> = ({
  roleName,
  chairs,
  onDeleteRole,
  onUpdateChair,
  onDeleteChair,
  onAddChair,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-xl border border-[hsl(var(--wq-border))] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[hsl(216,100%,97%)]">
        <h4 className="text-base font-semibold text-[hsl(var(--wq-primary))]">
          {roleName}
        </h4>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDeleteRole}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
            aria-label={`Delete ${roleName}`}
          >
            <Trash2 className="w-4 h-4 text-[hsl(var(--wq-text-muted))]" />
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronDown 
              className={`w-5 h-5 text-[hsl(var(--wq-text-muted))] transition-transform ${
                isExpanded ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 space-y-4">
          {chairs.map((chair) => (
            <div key={chair.id} className="grid grid-cols-[1fr_140px_100px_40px] gap-4 items-end">
              <div>
                <label className="block text-sm text-[hsl(var(--wq-text-secondary))] mb-1.5">
                  Chair Name
                </label>
                <Input
                  value={chair.chairName}
                  onChange={(e) => onUpdateChair(chair.id, { chairName: e.target.value })}
                  placeholder="Chair Name"
                  className="
                    border-[hsl(var(--wq-border))]
                    focus:border-[hsl(var(--wq-accent))]
                    focus:ring-[hsl(var(--wq-accent))]
                  "
                />
              </div>
              <div>
                <label className="block text-sm text-[hsl(var(--wq-text-secondary))] mb-1.5">
                  Type
                </label>
                <Select
                  value={chair.chairType}
                  onValueChange={(value: 'Primary' | 'Secondary') => 
                    onUpdateChair(chair.id, { chairType: value })
                  }
                >
                  <SelectTrigger className="border-[hsl(var(--wq-border))] bg-[hsl(197,100%,95%)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="Primary">Primary</SelectItem>
                    <SelectItem value="Secondary">Secondary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm text-[hsl(var(--wq-text-secondary))] mb-1.5">
                  Order
                </label>
                <Select
                  value={String(chair.order)}
                  onValueChange={(value) => onUpdateChair(chair.id, { order: parseInt(value) })}
                >
                  <SelectTrigger className="border-[hsl(var(--wq-border))] bg-[hsl(197,100%,95%)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <button
                type="button"
                onClick={() => onDeleteChair(chair.id)}
                className="p-2 rounded-lg hover:bg-red-50 transition-colors self-end mb-1"
                aria-label="Delete chair"
              >
                <Trash2 className="w-4 h-4 text-[hsl(var(--wq-text-muted))]" />
              </button>
            </div>
          ))}

          {/* Add Chair Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onAddChair}
              className="
                w-9 h-9 
                flex items-center justify-center 
                rounded-lg
                border-2 border-[hsl(var(--wq-accent))]
                text-[hsl(var(--wq-accent))]
                hover:bg-[hsl(var(--wq-accent))]/10
                transition-colors
              "
              aria-label="Add chair"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
