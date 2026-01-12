import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, RotateCcw, X } from 'lucide-react';
import { TeamMemberCard } from './TeamMemberCard';
import { TeamMember, teamMembers, searchTeamMembers } from '@/data/teamMembers';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
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
  capacityRequired?: number;
}

interface RoleAssignmentAccordionProps {
  roleTitle: string;
  rolesCount: { current: number; total: number };
  chairs: RoleAssignment[];
  onAssign: (chairIndex: number, member: TeamMember, notes: string, capacityRequired: number) => void;
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
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [capacityRequired, setCapacityRequired] = useState(20); // Default 20%
  const [displayCount, setDisplayCount] = useState(3);
  const [showTable, setShowTable] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [warningType, setWarningType] = useState<'capacity' | 'location' | null>(null);
  const [pendingAssignment, setPendingAssignment] = useState<{ chairIndex: number; member: TeamMember; notes: string; capacity: number } | null>(null);
  const [showUnassignDialog, setShowUnassignDialog] = useState(false);
  const [unassignChairIndex, setUnassignChairIndex] = useState<number | null>(null);

  const filteredMembers = searchTeamMembers(searchQuery);
  const displayedMembers = filteredMembers.slice(0, displayCount);

  // Reset search and selection when collapsing
  useEffect(() => {
    if (!isExpanded) {
      setSearchQuery('');
      setSelectedMember(null);
      setAssignmentNotes('');
      setCapacityRequired(20);
      setDisplayCount(3);
      setShowTable(false);
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
    } else {
      setSelectedMember(member);
    }
  };

  const handleAssignClick = (chairIndex: number) => {
    if (!selectedMember) return;

    // Check for duplicate assignment
    const duplicateCheck = checkDuplicateAssignment(selectedMember);
    if (duplicateCheck.isAssigned) {
      return; // Parent will show toast
    }

    // Check for capacity warning
    if (!selectedMember.hasCapacity) {
      setWarningType('capacity');
      setPendingAssignment({ chairIndex, member: selectedMember, notes: assignmentNotes, capacity: capacityRequired });
      setShowWarningDialog(true);
      return;
    }

    // Check for location mismatch warning
    if (!selectedMember.locationMatch) {
      setWarningType('location');
      setPendingAssignment({ chairIndex, member: selectedMember, notes: assignmentNotes, capacity: capacityRequired });
      setShowWarningDialog(true);
      return;
    }

    // No warnings, proceed with assignment
    onAssign(chairIndex, selectedMember, assignmentNotes, capacityRequired);
    resetSelection();
  };

  const handleConfirmWarning = () => {
    if (pendingAssignment) {
      onAssign(pendingAssignment.chairIndex, pendingAssignment.member, pendingAssignment.notes, pendingAssignment.capacity);
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
    setCapacityRequired(20);
    setShowTable(false);
    setDisplayCount(3);
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedMember(null);
    setDisplayCount(3);
    setShowTable(false);
  };

  const getWarningMessage = () => {
    if (warningType === 'capacity') {
      return `${selectedMember?.name} has limited capacity (${selectedMember?.capacity}%). Are you sure you want to assign them to this role?`;
    }
    if (warningType === 'location') {
      return `${selectedMember?.name} is located in ${selectedMember?.location}, which may not match the required location. Are you sure you want to proceed?`;
    }
    return '';
  };

  return (
    <>
      <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
        <button
          onClick={onToggleExpand}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-[hsl(var(--wq-bg-hover))] transition-colors"
        >
          <h4 className="text-primary font-bold text-sm">{roleTitle}</h4>
          <div className="flex items-center gap-3">
            <span className="text-accent text-sm">
              {rolesCount.current}/{rolesCount.total} Roles Assigned
            </span>
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
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[hsl(var(--wq-text-secondary))] text-xs font-medium">[{chair.chairLabel}]</p>
                    <button
                      onClick={() => handleUnassignClick(chairIndex)}
                      className="p-1 hover:bg-destructive/10 rounded transition-colors"
                      title="Remove assignment"
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                  <div className="bg-card rounded-lg p-4 border border-[hsl(var(--wq-border))]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-accent font-semibold text-sm">{chair.assignedMember.name}</p>
                        <p className="text-[hsl(var(--wq-text-secondary))] text-xs">{chair.assignedMember.role}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[hsl(var(--wq-text-secondary))] text-xs">Capacity:</span>
                        <span className="px-2 py-1 bg-[hsl(var(--wq-bg-muted))] rounded text-primary text-sm font-medium">
                          {chair.capacityRequired || 20}%
                        </span>
                      </div>
                    </div>
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

                  {/* Team members list or table */}
                  {filteredMembers.length > 0 && (
                    <>
                      {showTable ? (
                        <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-[hsl(var(--wq-bg-header))] hover:bg-[hsl(var(--wq-bg-header))]">
                                <TableHead className="w-12 py-3 px-4 text-xs font-bold uppercase text-primary">Select</TableHead>
                                <TableHead className="py-3 px-4 text-xs font-bold uppercase text-primary">Name</TableHead>
                                <TableHead className="py-3 px-4 text-xs font-bold uppercase text-primary">Role</TableHead>
                                <TableHead className="py-3 px-4 text-xs font-bold uppercase text-primary">Location</TableHead>
                                <TableHead className="py-3 px-4 text-xs font-bold uppercase text-primary">Expertise</TableHead>
                                <TableHead className="py-3 px-4 text-xs font-bold uppercase text-primary">Capacity</TableHead>
                                <TableHead className="py-3 px-4 text-xs font-bold uppercase text-primary">Match Score</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredMembers.map((member, index) => {
                                const duplicateCheck = checkDuplicateAssignment(member);
                                const isDisabled = duplicateCheck.isAssigned;
                                
                                return (
                                  <TableRow 
                                    key={member.id}
                                    className={`
                                      hover:bg-[hsl(var(--wq-bg-hover))] cursor-pointer 
                                      ${selectedMember?.id === member.id ? 'bg-accent/5' : ''} 
                                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                    onClick={() => !isDisabled && handleMemberSelect(member)}
                                  >
                                    <TableCell className="py-3 px-4">
                                      <Checkbox 
                                        checked={selectedMember?.id === member.id}
                                        onCheckedChange={() => !isDisabled && handleMemberSelect(member)}
                                        disabled={isDisabled}
                                        className="border-[hsl(var(--wq-border))]"
                                      />
                                    </TableCell>
                                    <TableCell className="py-3 px-4">
                                      <div>
                                        <p className="text-primary font-medium text-sm">{member.name}</p>
                                        {index === 0 && member.matchScore === 100 && (
                                          <span className="inline-block mt-1 px-2 py-0.5 bg-[hsl(var(--wq-status-completed-bg))] text-[hsl(var(--wq-status-completed-text))] text-xs font-medium rounded-full border border-[hsl(var(--wq-status-completed-text))]">
                                            Best Match
                                          </span>
                                        )}
                                        {isDisabled && (
                                          <span className="inline-block mt-1 px-2 py-0.5 bg-destructive/10 text-destructive text-xs font-medium rounded-full">
                                            Assigned to {duplicateCheck.roleName}
                                          </span>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-3 px-4 text-[hsl(var(--wq-text-secondary))] text-sm">{member.role}</TableCell>
                                    <TableCell className="py-3 px-4 text-[hsl(var(--wq-text-secondary))] text-sm">{member.location}</TableCell>
                                    <TableCell className="py-3 px-4 text-[hsl(var(--wq-text-secondary))] text-sm">{member.expertise.join(', ')}</TableCell>
                                    <TableCell className="py-3 px-4">
                                      <span className={`px-2 py-1 rounded text-sm ${
                                        member.hasCapacity 
                                          ? 'bg-[hsl(var(--wq-bg-muted))] text-[hsl(var(--wq-text-secondary))]'
                                          : 'bg-destructive/10 text-destructive'
                                      }`}>
                                        {member.capacity}%
                                      </span>
                                    </TableCell>
                                    <TableCell className="py-3 px-4">
                                      <span className={`font-medium ${
                                        member.matchScore >= 80 ? 'text-[hsl(var(--wq-status-completed-text))]' :
                                        member.matchScore >= 60 ? 'text-[hsl(var(--wq-status-pending-text))]' :
                                        'text-[hsl(var(--wq-text-secondary))]'
                                      }`}>
                                        {member.matchScore}
                                      </span>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <>
                          {/* Selected member card */}
                          {selectedMember && (
                            <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden mb-3">
                              <TeamMemberCard
                                member={selectedMember}
                                isSelected={true}
                                onSelect={handleMemberSelect}
                                showBestMatch={selectedMember.matchScore === 100}
                              />
                            </div>
                          )}
                          
                          {/* Other members when no selection */}
                          {!selectedMember && (
                            <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
                              {displayedMembers.map((member, index) => {
                                const duplicateCheck = checkDuplicateAssignment(member);
                                return (
                                  <TeamMemberCard
                                    key={member.id}
                                    member={member}
                                    isSelected={selectedMember?.id === member.id}
                                    onSelect={handleMemberSelect}
                                    showBestMatch={index === 0 && member.matchScore === 100}
                                    isDisabled={duplicateCheck.isAssigned}
                                    disabledReason={duplicateCheck.roleName ? `Assigned to ${duplicateCheck.roleName}` : undefined}
                                  />
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {/* Show more / Show less */}
                  {!selectedMember && filteredMembers.length > 0 && (
                    <div className="flex flex-col items-center mt-3 gap-2">
                      {!showTable && displayCount < filteredMembers.length && (
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
                        Displaying: {showTable ? filteredMembers.length : displayedMembers.length} of {filteredMembers.length.toString().padStart(4, '0')} Members
                      </span>
                    </div>
                  )}

                  {/* Capacity Required */}
                  <div className="mt-4 flex items-center gap-4">
                    <p className="text-[hsl(var(--wq-text-secondary))] text-sm font-medium">
                      Capacity Required
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={capacityRequired}
                        onChange={(e) => setCapacityRequired(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-16 px-2 py-1.5 bg-[hsl(var(--wq-bg-muted))] border-none rounded text-primary text-sm font-medium text-center focus:outline-none focus:ring-2 focus:ring-accent/30"
                      />
                      <span className="text-[hsl(var(--wq-text-secondary))] text-sm">%</span>
                    </div>
                  </div>

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
              {warningType === 'capacity' ? 'Capacity Warning' : 'Location Mismatch Warning'}
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
