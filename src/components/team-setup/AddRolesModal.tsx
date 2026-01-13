import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { availableRoles } from '@/data/teams';

interface AddRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (roles: string[]) => void;
  existingRoles?: string[];
}

export const AddRolesModal: React.FC<AddRolesModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  existingRoles = [],
}) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const availableToAdd = availableRoles.filter(
    role => !existingRoles.includes(role) && !selectedRoles.includes(role)
  );

  const handleAddRole = (role: string) => {
    setSelectedRoles(prev => [...prev, role]);
    setIsDropdownOpen(false);
  };

  const handleRemoveRole = (role: string) => {
    setSelectedRoles(prev => prev.filter(r => r !== role));
  };

  const handleSubmit = () => {
    onAdd(selectedRoles);
    setSelectedRoles([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[hsl(var(--wq-primary))]">
            Add Role(s)
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <label className="block text-sm font-medium text-[hsl(var(--wq-text-secondary))] mb-3">
            Role(s)
          </label>
          
          {/* Selected Roles */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedRoles.map(role => (
              <span
                key={role}
                className="
                  inline-flex items-center gap-1.5
                  px-3 py-1
                  rounded-full
                  text-sm font-medium
                  border border-[hsl(var(--wq-accent))]
                  text-[hsl(var(--wq-accent))]
                  bg-white
                "
              >
                {role}
                <button
                  type="button"
                  onClick={() => handleRemoveRole(role)}
                  className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-[hsl(var(--wq-accent))]/10"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="
                w-full px-4 py-3
                flex items-center justify-between
                border border-[hsl(var(--wq-border))] rounded-lg
                text-left text-sm
                text-[hsl(var(--wq-text-muted))]
                hover:border-[hsl(var(--wq-accent))]
                transition-colors
              "
            >
              Please select role(s)
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {isDropdownOpen && availableToAdd.length > 0 && (
              <div className="
                absolute top-full left-0 right-0 mt-1
                bg-white border border-[hsl(var(--wq-border))] rounded-lg
                shadow-lg z-50
                max-h-48 overflow-y-auto
              ">
                {availableToAdd.map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleAddRole(role)}
                    className="
                      w-full px-4 py-2.5
                      text-left text-sm
                      text-[hsl(var(--wq-text-secondary))]
                      hover:bg-[hsl(var(--wq-bg-hover))]
                      transition-colors
                    "
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Button
            onClick={handleSubmit}
            disabled={selectedRoles.length === 0}
            className="
              px-8 py-2.5
              bg-[hsl(var(--wq-primary))] text-white
              hover:bg-[hsl(var(--wq-primary-dark))]
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Add Role(s)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
