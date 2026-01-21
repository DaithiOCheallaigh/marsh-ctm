import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, RotateCcw } from 'lucide-react';
import { TeamMemberCard } from './TeamMemberCard';
import { TeamMember, searchTeamMembers } from '@/data/teamMembers';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RoleAssignment {
  chairLabel: string;
  assignedMember?: TeamMember;
  assignmentNotes?: string;
}

interface RoleAssignmentAccordionProps {
  roleTitle: string;
  rolesCount: { current: number; total: number };
  chairs: RoleAssignment[];
  onAssign: (chairIndex: number, member: TeamMember, notes: string) => void;
  onUnassign: (chairIndex: number) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  roleIndex: number;
  checkDuplicateAssignment: (member: TeamMember) => { isAssigned: boolean; roleName?: string };
}

export const RoleAssignmentAccordion: React.FC<RoleAssignmentAccordionProps> = ({
  roleTitle,
  rolesCount,
  chairs,
  onAssign,
  onUnassign,
  isExpanded,
  onToggleExpand,
  roleIndex,
  checkDuplicateAssignment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [displayCount, setDisplayCount] = useState(3);
  const [showTable, setShowTable] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [warningType, setWarningType] = useState<'capacity' | 'location' | 'overCapacity' | null>(null);
  const [pendingAssignment, setPendingAssignment] = useState<{ chairIndex: number; member: TeamMember; notes: string } | null>(null);
  const [showUnassignDialog, setShowUnassignDialog] = useState(false);
  const [projectedCapacity, setProjectedCapacity] = useState<number>(0);
  const CAPACITY_INCREASE = 20;
  const [unassignChairIndex, setUnassignChairIndex] = useState<number | null>(null);

  // Memoized filtered members using debounced search query
  // Filter out members that are already assigned to other roles
  const filteredMembers = useMemo(() => {
    const searchResults = searchTeamMembers(debouncedSearchQuery);
    return searchResults.filter(member => !checkDuplicateAssignment(member).isAssigned);
  }, [debouncedSearchQuery, checkDuplicateAssignment]);
  
  const displayedMembers = showTable ? filteredMembers : filteredMembers.slice(0, displayCount);

  // Reset search and selection when collapsing
  useEffect(() => {
    if (!isExpanded) {
      setSearchQuery('');
      setSelectedMember(null);
      setAssignmentNotes('');
      setDisplayCount(3);
      setShowTable(false);
      setProjectedCapacity(0);
    }
  }, [isExpanded]);

  // Pre-select assigned member when expanding
  useEffect(() => {
    if (isExpanded) {
      // Find first unassigned chair's previously assigned member if any
      const firstUnassignedChair = chairs.find(c => !c.assignedMember);
      if (!firstUnassignedChair) {
        // All chairs assigned, no need to pre-select
        setSelectedMember(null);
      }
    }
  }, [isExpanded, chairs]);

  const handleShowMore = () => {
    setShowTable(true);
  };

  const handleMemberSelect = (member: TeamMember) => {
    // Single-select behavior - clicking same member deselects
    if (selectedMember?.id === member.id) {
      setSelectedMember(null);
      setProjectedCapacity(0);
    } else {
      setSelectedMember(member);
      setProjectedCapacity(member.capacity + CAPACITY_INCREASE);
    }
  };

  const handleAssignClick = (chairIndex: number) => {
    if (!selectedMember) return;

    // Check for duplicate assignment
    const duplicateCheck = checkDuplicateAssignment(selectedMember);
    if (duplicateCheck.isAssigned) {
      return; // Parent will show toast
    }

    // Check for over capacity warning (>100%)
    if (projectedCapacity > 100) {
      setWarningType('overCapacity');
      setPendingAssignment({ chairIndex, member: selectedMember, notes: assignmentNotes });
      setShowWarningDialog(true);
      return;
    }

    // Check for capacity warning (no capacity)
    if (!selectedMember.hasCapacity) {
      setWarningType('capacity');
      setPendingAssignment({ chairIndex, member: selectedMember, notes: assignmentNotes });
      setShowWarningDialog(true);
      return;
    }

    // Check for location mismatch warning
    if (!selectedMember.locationMatch) {
      setWarningType('location');
      setPendingAssignment({ chairIndex, member: selectedMember, notes: assignmentNotes });
      setShowWarningDialog(true);
      return;
    }

    // No warnings, proceed with assignment
    onAssign(chairIndex, selectedMember, assignmentNotes);
    resetSelection();
  };

  const handleConfirmWarning = () => {
    if (pendingAssignment) {
      onAssign(pendingAssignment.chairIndex, pendingAssignment.member, pendingAssignment.notes);
      resetSelection();
    }
    setShowWarningDialog(false);
    setPendingAssignment(null);
    setWarningType(null);
  };

  const handleUnassignClick = (chairIndex: number) => {
    setUnassignChairIndex(chairIndex);
    setShowUnassignDialog(true);
  };

  const handleConfirmUnassign = () => {
    if (unassignChairIndex !== null) {
      onUnassign(unassignChairIndex);
    }
    setShowUnassignDialog(false);
    setUnassignChairIndex(null);
  };

  const resetSelection = () => {
    setSelectedMember(null);
    setAssignmentNotes('');
    setShowTable(false);
    setDisplayCount(3);
    setProjectedCapacity(0);
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedMember(null);
    setDisplayCount(3);
    setShowTable(false);
  };

  const getWarningMessage = () => {
    if (warningType === 'overCapacity') {
      return `Assigning this work item will increase ${selectedMember?.name}'s workload to ${projectedCapacity}%, which exceeds 100% capacity. Are you sure you want to proceed?`;
    }
    if (warningType === 'capacity') {
      return `${selectedMember?.name} has limited capacity (${selectedMember?.capacity}%). Are you sure you want to assign them to this role?`;
    }
    if (warningType === 'location') {
      return `${selectedMember?.name} is located in ${selectedMember?.location}, which may not match the required location. Are you sure you want to proceed?`;
    }
    return '';
  };

  const getWarningTitle = () => {
    if (warningType === 'overCapacity') return 'Over Capacity Warning';
    if (warningType === 'capacity') return 'Capacity Warning';
    if (warningType === 'location') return 'Location Mismatch Warning';
    return '';
  };

  const handleCapacityChange = (newCapacity: number) => {
    setProjectedCapacity(newCapacity);
  };

  return (
    <>
      <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
        <button
          onClick={onToggleExpand}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-[hsl(var(--wq-bg-hover))] transition-colors"
        >
          <h4 className="text-primary font-bold text-sm">{roleTitle}</h4>
          <div className="flex items-center gap-2">
            <span className="text-[hsl(var(--wq-text-secondary))] text-xs">Roles Assigned</span>
            <span className={`text-sm font-medium ${rolesCount.current === rolesCount.total ? 'text-primary' : 'text-accent'}`}>
              {rolesCount.current}/{rolesCount.total}
            </span>
            <div className="w-16 h-1.5 bg-[hsl(var(--wq-bg-muted))] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[hsl(var(--wq-status-completed-text))] rounded-full transition-all duration-300"
                style={{ width: `${rolesCount.total > 0 ? (rolesCount.current / rolesCount.total) * 100 : 0}%` }}
              />
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-[hsl(var(--wq-text-secondary))]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[hsl(var(--wq-text-secondary))]" />
            )}
          </div>
        </button>

        <div 
          className={`border-t border-[hsl(var(--wq-border))] overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 border-t-0'
          }`}
        >
          {chairs.map((chair, chairIndex) => (
            <div key={chairIndex} className="p-5">
              {chair.assignedMember ? (
                // Show assigned member
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                  <div className="mb-3">
                    <p className="text-[hsl(var(--wq-text-secondary))] text-xs font-medium">[{chair.chairLabel}]</p>
                  </div>
                  <div className="bg-card rounded-lg p-4 border border-[hsl(var(--wq-border))]">
                    <p className="text-accent font-semibold text-sm">{chair.assignedMember.name}</p>
                    <p className="text-[hsl(var(--wq-text-secondary))] text-xs">{chair.assignedMember.role}</p>
                  </div>
                  {chair.assignmentNotes && (
                    <div className="mt-3 bg-card rounded-lg p-3 border border-[hsl(var(--wq-border))]">
                      <p className="text-accent text-xs font-medium mb-1">Assignment Notes</p>
                      <p className="text-[hsl(var(--wq-text-secondary))] text-sm">{chair.assignmentNotes}</p>
                    </div>
                  )}
                </div>
              ) : (
                // Show selection UI
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-5">
                  {/* Header row with chair label, search, and reset */}
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-[hsl(var(--wq-text-secondary))] text-sm font-medium whitespace-nowrap">
                      [{chair.chairLabel}] | Select Team Member
                    </span>
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                      <input
                        type="text"
                        placeholder="Search Team Member"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-accent/40 rounded-lg text-sm placeholder:text-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-card"
                      />
                    </div>
                    <button 
                      onClick={handleReset}
                      className="p-2.5 bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                      title="Reset"
                    >
                      <RotateCcw className="w-4 h-4 text-primary-foreground" />
                    </button>
                  </div>

                  {/* No results state */}
                  {filteredMembers.length === 0 && (
                    <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] p-8 text-center">
                      <p className="text-[hsl(var(--wq-text-secondary))] text-sm">No team members found matching "{searchQuery}"</p>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-primary text-sm font-medium hover:underline mt-2"
                      >
                        Clear search
                      </button>
                    </div>
                  )}

                  {/* Team members list - always show as cards */}
                  {filteredMembers.length > 0 && (
                    <>
                      {/* Selected member card */}
                      {selectedMember && (
                        <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden mb-3">
                          <TeamMemberCard
                            member={selectedMember}
                            isSelected={true}
                            onSelect={handleMemberSelect}
                            showBestMatch={selectedMember.matchScore === 100}
                            capacityIncrease={CAPACITY_INCREASE}
                            onCapacityChange={handleCapacityChange}
                          />
                        </div>
                      )}
                      
                      {/* Other members when no selection */}
                      {!selectedMember && (
                        <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
                          {displayedMembers.map((member, index) => (
                            <TeamMemberCard
                              key={member.id}
                              member={member}
                              isSelected={selectedMember?.id === member.id}
                              onSelect={handleMemberSelect}
                              showBestMatch={index === 0 && member.matchScore === 100}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* Show more / Show less */}
                  {!selectedMember && filteredMembers.length > 0 && (
                    <div className="flex flex-col items-center mt-3 gap-2">
                      {!showTable && filteredMembers.length > displayCount && (
                        <button
                          onClick={handleShowMore}
                          className="text-primary text-sm font-medium hover:underline"
                        >
                          Show More
                        </button>
                      )}
                      {showTable && (
                        <button
                          onClick={() => setShowTable(false)}
                          className="text-primary text-sm font-medium hover:underline"
                        >
                          Show Less
                        </button>
                      )}
                      <span className="text-[hsl(var(--wq-text-secondary))] text-xs">
                        Displaying: {displayedMembers.length} of {filteredMembers.length.toString().padStart(4, '0')} Members
                      </span>
                    </div>
                  )}

                  {/* Assignment Notes */}
                  <div className="mt-4 bg-card rounded-lg border border-[hsl(var(--wq-border))] p-4">
                    <p className="text-[hsl(var(--wq-text-secondary))] text-sm font-medium mb-2">
                      Assignment Notes <span className="text-[hsl(var(--wq-text-muted))]">(Optional)</span>
                    </p>
                    <textarea
                      placeholder="Add text"
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      className="w-full p-2 text-sm border-none resize-none focus:outline-none placeholder:text-[hsl(var(--wq-text-muted))] bg-transparent"
                      rows={2}
                    />
                  </div>

                  {/* Assign button */}
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outline"
                      onClick={() => handleAssignClick(chairIndex)}
                      disabled={!selectedMember}
                      className="px-8 border-accent text-accent hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Assign
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Warning Dialog for Capacity/Location */}
      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {getWarningTitle()}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {getWarningMessage()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingAssignment(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmWarning}>
              Assign Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unassign Confirmation Dialog */}
      <AlertDialog open={showUnassignDialog} onOpenChange={setShowUnassignDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {unassignChairIndex !== null && chairs[unassignChairIndex]?.assignedMember?.name} from this role?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUnassign} className="bg-destructive hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
