import React, { useState, useMemo } from 'react';
import { X, Search, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchWorkdayEmployees, WorkdayEmployee } from '@/data/teamAssignments';
import { useTeamAssignments } from '@/context/TeamAssignmentsContext';

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  onSuccess: () => void;
}

export const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({
  isOpen,
  onClose,
  teamId,
  onSuccess,
}) => {
  const { addMemberToTeam, isMemberInAnyTeam } = useTeamAssignments();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<WorkdayEmployee | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchResults = useMemo(() => {
    if (searchQuery.length < 3) return [];
    return searchWorkdayEmployees(searchQuery);
  }, [searchQuery]);

  const handleSelectEmployee = (employee: WorkdayEmployee) => {
    // Check if already in a team
    const existingCheck = isMemberInAnyTeam(employee.firstName, employee.lastName);
    if (existingCheck.inTeam) {
      setError('This Team Member is already assigned under a different manager.');
      setSelectedEmployee(employee);
    } else {
      setError(null);
      setSelectedEmployee(employee);
    }
    setShowDropdown(false);
    setSearchQuery('');
  };

  const handleAddMember = () => {
    if (!selectedEmployee || error) return;

    const result = addMemberToTeam(teamId, selectedEmployee, []);
    if (result.success) {
      onSuccess();
      handleClose();
    } else {
      setError(result.error || 'Failed to add team member');
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedEmployee(null);
    setError(null);
    setShowDropdown(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[hsl(220,100%,24%)]">
            Add New Team Member
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium text-[hsl(220,100%,24%)] mb-2">
              Select name
            </label>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(197,100%,44%)]" />
              <Input
                type="text"
                placeholder="Search Team Member Last Name"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                  setSelectedEmployee(null);
                  setError(null);
                }}
                onFocus={() => setShowDropdown(true)}
                className="pl-10 border-[hsl(197,100%,44%)] focus:ring-[hsl(197,100%,44%)] placeholder:text-[hsl(197,100%,44%)]"
              />

              {/* Dropdown Results */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {searchResults.map((employee) => (
                    <button
                      key={employee.id}
                      onClick={() => handleSelectEmployee(employee)}
                      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-left"
                    >
                      <Search className="w-4 h-4 text-[hsl(197,100%,44%)]" />
                      <span className="text-[hsl(220,100%,24%)]">
                        [{employee.lastName}, {employee.firstName}]
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Employee */}
            {selectedEmployee && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-[hsl(220,100%,24%)]">
                  [{selectedEmployee.lastName}, {selectedEmployee.firstName}]
                </span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-600">
                  Alert: {error}
                </span>
              </div>
            )}
          </div>

          {/* Add Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleAddMember}
              disabled={!selectedEmployee || !!error}
              className={`
                px-8 py-2
                ${!selectedEmployee || error 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-[hsl(220,100%,24%)] hover:bg-[hsl(220,100%,20%)] text-white'
                }
              `}
            >
              Add Team Member
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
