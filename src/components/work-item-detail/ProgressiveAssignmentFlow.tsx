import React, { useState, useMemo, useCallback } from 'react';
import { ChevronDown, ChevronRight, Check, Circle, Users, Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { TeamMember, searchTeamMembers } from '@/data/teamMembers';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Types
export interface RoleDefinition {
  roleId: string;
  roleName: string;
  description?: string;
}

export interface RoleAssignmentData {
  roleId: string;
  roleName: string;
  selectedPerson?: TeamMember;
  chairType?: 'Primary' | 'Secondary';
}

export interface ProgressiveAssignmentFlowProps {
  availableRoles: RoleDefinition[];
  onComplete: (assignments: RoleAssignmentData[]) => void;
  isReadOnly?: boolean;
}

type FlowStep = 'collapsed' | 'select-roles' | 'select-person' | 'declare-chair';
type CompletionStatus = 'not-started' | 'incomplete' | 'complete';

// Role descriptions for tooltips
const roleDescriptions: Record<string, string> = {
  'Account Executive': 'Leads client relationships and manages overall account strategy',
  'Project Manager': 'Oversees project timelines, resources, and deliverables',
  'Risk Consultant': 'Provides expert risk assessment and mitigation strategies',
  'Claims Specialist': 'Handles claims processing and client advocacy',
  'Underwriter': 'Evaluates risk and determines coverage terms',
  'Business Analyst': 'Analyzes business requirements and recommends solutions',
  'Operations Lead': 'Coordinates day-to-day operational activities',
  'Technical Lead': 'Oversees technical implementation and integrations',
};

export const ProgressiveAssignmentFlow: React.FC<ProgressiveAssignmentFlowProps> = ({
  availableRoles,
  onComplete,
  isReadOnly = false,
}) => {
  // State
  const [currentStep, setCurrentStep] = useState<FlowStep>('collapsed');
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());
  const [assignments, setAssignments] = useState<RoleAssignmentData[]>([]);
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Computed values
  const selectedRoles = useMemo(() =>
    availableRoles.filter(role => selectedRoleIds.has(role.roleId)),
    [availableRoles, selectedRoleIds]
  );

  const currentRole = selectedRoles[currentRoleIndex];
  
  const completedAssignments = useMemo(() =>
    assignments.filter(a => a.selectedPerson && a.chairType),
    [assignments]
  );

  const completionStatus: CompletionStatus = useMemo(() => {
    if (selectedRoleIds.size === 0 && completedAssignments.length === 0) return 'not-started';
    if (completedAssignments.length === selectedRoleIds.size && selectedRoleIds.size > 0) return 'complete';
    return 'incomplete';
  }, [selectedRoleIds.size, completedAssignments.length]);

  // Get assigned member IDs to exclude from search
  const assignedMemberIds = useMemo(() =>
    new Set(assignments.filter(a => a.selectedPerson).map(a => a.selectedPerson!.id)),
    [assignments]
  );

  // Filtered members for search
  const filteredMembers = useMemo(() => {
    const results = searchTeamMembers(debouncedSearch);
    return results.filter(m => !assignedMemberIds.has(m.id));
  }, [debouncedSearch, assignedMemberIds]);

  // Handlers
  const handleToggleRole = useCallback((roleId: string) => {
    if (isReadOnly) return;
    setSelectedRoleIds(prev => {
      const next = new Set(prev);
      if (next.has(roleId)) {
        next.delete(roleId);
      } else {
        next.add(roleId);
      }
      return next;
    });
  }, [isReadOnly]);

  const handleProceedToPersonSelection = useCallback(() => {
    // Initialize assignments for selected roles
    const newAssignments = selectedRoles.map(role => ({
      roleId: role.roleId,
      roleName: role.roleName,
    }));
    setAssignments(newAssignments);
    setCurrentRoleIndex(0);
    setCurrentStep('select-person');
    setSearchQuery('');
  }, [selectedRoles]);

  const handleSelectPerson = useCallback((member: TeamMember) => {
    if (!currentRole) return;
    
    setAssignments(prev => prev.map(a =>
      a.roleId === currentRole.roleId
        ? { ...a, selectedPerson: member }
        : a
    ));
    setCurrentStep('declare-chair');
  }, [currentRole]);

  const handleDeclareChair = useCallback((chairType: 'Primary' | 'Secondary') => {
    if (!currentRole) return;

    setAssignments(prev => prev.map(a =>
      a.roleId === currentRole.roleId
        ? { ...a, chairType }
        : a
    ));

    // Move to next role or complete
    if (currentRoleIndex < selectedRoles.length - 1) {
      setCurrentRoleIndex(prev => prev + 1);
      setCurrentStep('select-person');
      setSearchQuery('');
    } else {
      // All roles assigned
      setCurrentStep('collapsed');
      onComplete(assignments.map(a =>
        a.roleId === currentRole.roleId ? { ...a, chairType } : a
      ));
    }
  }, [currentRole, currentRoleIndex, selectedRoles.length, assignments, onComplete]);

  const handleExpandClick = () => {
    if (currentStep === 'collapsed') {
      if (completionStatus === 'complete') {
        // Allow reviewing completed assignments
        setCurrentStep('select-roles');
      } else if (selectedRoleIds.size > 0) {
        // Resume where left off
        const incompleteIndex = assignments.findIndex(a => !a.selectedPerson || !a.chairType);
        if (incompleteIndex >= 0) {
          setCurrentRoleIndex(incompleteIndex);
          const assignment = assignments[incompleteIndex];
          setCurrentStep(assignment.selectedPerson ? 'declare-chair' : 'select-person');
        } else {
          setCurrentStep('select-roles');
        }
      } else {
        setCurrentStep('select-roles');
      }
    } else {
      setCurrentStep('collapsed');
    }
  };

  const handleBackToRoles = () => {
    setCurrentStep('select-roles');
    setCurrentRoleIndex(0);
    setSearchQuery('');
  };

  const handleBackToPerson = () => {
    setCurrentStep('select-person');
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: CompletionStatus }) => {
    const config = {
      'complete': {
        bg: 'bg-[hsl(var(--wq-status-completed-bg))]',
        text: 'text-[hsl(var(--wq-status-completed-text))]',
        label: 'Complete'
      },
      'incomplete': {
        bg: 'bg-[hsl(var(--wq-status-in-progress-bg))]',
        text: 'text-[hsl(var(--wq-status-in-progress-text))]',
        label: 'Incomplete'
      },
      'not-started': {
        bg: 'bg-[hsl(var(--wq-bg-muted))]',
        text: 'text-[hsl(var(--wq-text-secondary))]',
        label: 'Not started'
      },
    };
    const c = config[status];

    return (
      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', c.bg, c.text)}>
        {c.label}
      </span>
    );
  };

  // Step indicator
  const StepIndicator = ({ step, isActive, isComplete }: { step: number; isActive: boolean; isComplete: boolean }) => (
    <div className={cn(
      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all',
      isComplete
        ? 'bg-[hsl(var(--wq-status-completed-text))] text-white'
        : isActive
          ? 'border-2 border-primary bg-primary/10 text-primary'
          : 'border-2 border-[hsl(var(--wq-border))] text-[hsl(var(--wq-text-secondary))]'
    )}>
      {isComplete ? <Check className="w-3 h-3" /> : step}
    </div>
  );

  // Progress bar
  const progressPercentage = useMemo(() => {
    if (selectedRoleIds.size === 0) return 0;
    return Math.round((completedAssignments.length / selectedRoleIds.size) * 100);
  }, [selectedRoleIds.size, completedAssignments.length]);

  return (
    <TooltipProvider>
      <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
        {/* Collapsed Header */}
        <button
          onClick={handleExpandClick}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-[hsl(var(--wq-bg-hover))] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Users className={cn(
              'w-5 h-5',
              currentStep !== 'collapsed' ? 'text-primary' : 'text-[hsl(var(--wq-text-secondary))]'
            )} />
            <div className="flex items-center gap-2">
              <h3 className="text-primary font-bold text-base">Assignment Requirements</h3>
              <span className="text-[hsl(var(--wq-text-secondary))] text-sm">
                [{selectedRoleIds.size} roles, {completedAssignments.length} assigned]
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={completionStatus} />
            {currentStep === 'collapsed' ? (
              <ChevronRight className="w-5 h-5 text-[hsl(var(--wq-text-secondary))]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[hsl(var(--wq-text-secondary))]" />
            )}
          </div>
        </button>

        {/* Expanded Content */}
        {currentStep !== 'collapsed' && (
          <div className="border-t border-[hsl(var(--wq-border))]">
            {/* Step Progress Bar */}
            <div className="px-6 py-3 bg-[hsl(var(--wq-bg-muted))] border-b border-[hsl(var(--wq-border))]">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <StepIndicator step={1} isActive={currentStep === 'select-roles'} isComplete={selectedRoleIds.size > 0 && currentStep !== 'select-roles'} />
                  <span className={cn('text-sm', currentStep === 'select-roles' ? 'text-primary font-medium' : 'text-[hsl(var(--wq-text-secondary))]')}>
                    Roles
                  </span>
                </div>
                <div className="flex-1 h-0.5 bg-[hsl(var(--wq-border))]" />
                <div className="flex items-center gap-2">
                  <StepIndicator step={2} isActive={currentStep === 'select-person'} isComplete={currentStep === 'declare-chair'} />
                  <span className={cn('text-sm', currentStep === 'select-person' ? 'text-primary font-medium' : 'text-[hsl(var(--wq-text-secondary))]')}>
                    Person
                  </span>
                </div>
                <div className="flex-1 h-0.5 bg-[hsl(var(--wq-border))]" />
                <div className="flex items-center gap-2">
                  <StepIndicator step={3} isActive={currentStep === 'declare-chair'} isComplete={false} />
                  <span className={cn('text-sm', currentStep === 'declare-chair' ? 'text-primary font-medium' : 'text-[hsl(var(--wq-text-secondary))]')}>
                    Chair
                  </span>
                </div>
              </div>
            </div>

            {/* Step 1: Role Selection */}
            {currentStep === 'select-roles' && (
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-primary font-semibold">Select Roles Required</h4>
                  <span className="text-[hsl(var(--wq-text-secondary))] text-sm">
                    {selectedRoleIds.size} of {availableRoles.length} selected
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {availableRoles.map(role => (
                    <Tooltip key={role.roleId}>
                      <TooltipTrigger asChild>
                        <label
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                            selectedRoleIds.has(role.roleId)
                              ? 'bg-primary/5 border-primary'
                              : 'bg-card border-[hsl(var(--wq-border))] hover:border-primary/50',
                            isReadOnly && 'cursor-not-allowed opacity-60'
                          )}
                        >
                          <Checkbox
                            checked={selectedRoleIds.has(role.roleId)}
                            onCheckedChange={() => handleToggleRole(role.roleId)}
                            disabled={isReadOnly}
                          />
                          <span className="text-sm font-medium text-primary">
                            {role.roleName}
                          </span>
                        </label>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[250px]">
                        <p className="text-sm">
                          {role.description || roleDescriptions[role.roleName] || 'No description available'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>

                {/* Assigned roles summary */}
                {completedAssignments.length > 0 && (
                  <div className="mb-4 p-3 bg-[hsl(var(--wq-status-completed-bg))] rounded-lg border border-[hsl(var(--wq-status-completed-text))]/20">
                    <p className="text-sm font-medium text-[hsl(var(--wq-status-completed-text))] mb-2">
                      Completed Assignments
                    </p>
                    <div className="space-y-1">
                      {completedAssignments.map(a => (
                        <div key={a.roleId} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[hsl(var(--wq-status-completed-text))]" />
                          <span className="text-primary">{a.roleName}</span>
                          <span className="text-[hsl(var(--wq-text-secondary))]">→</span>
                          <span className="font-medium">{a.selectedPerson?.name}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            {a.chairType}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isReadOnly && (
                  <div className="flex justify-end">
                    <Button
                      onClick={handleProceedToPersonSelection}
                      disabled={selectedRoleIds.size === 0}
                      className="gap-2"
                    >
                      Next: Select Person
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Person Selection */}
            {currentStep === 'select-person' && currentRole && (
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBackToRoles}
                      className="text-[hsl(var(--wq-text-secondary))] hover:text-primary text-sm"
                    >
                      ← Back
                    </button>
                    <span className="text-[hsl(var(--wq-border))]">|</span>
                    <h4 className="text-primary font-semibold">
                      Select Person for: <span className="text-primary">{currentRole.roleName}</span>
                    </h4>
                  </div>
                  <span className="text-[hsl(var(--wq-text-secondary))] text-sm">
                    Role {currentRoleIndex + 1} of {selectedRoles.length}
                  </span>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--wq-text-secondary))]" />
                  <input
                    type="text"
                    placeholder="Search team members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-[hsl(var(--wq-border))] rounded-lg text-sm placeholder:text-[hsl(var(--wq-text-muted))] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-card"
                  />
                </div>

                {/* Members list */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {filteredMembers.length === 0 ? (
                    <div className="text-center py-8 text-[hsl(var(--wq-text-secondary))]">
                      No team members found
                    </div>
                  ) : (
                    filteredMembers.slice(0, 6).map(member => (
                      <button
                        key={member.id}
                        onClick={() => handleSelectPerson(member)}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-[hsl(var(--wq-border))] hover:border-primary hover:bg-primary/5 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-semibold">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-primary">{member.name}</p>
                            <p className="text-xs text-[hsl(var(--wq-text-secondary))]">{member.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {member.matchScore >= 90 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--wq-status-completed-bg))] text-[hsl(var(--wq-status-completed-text))]">
                              Best Match
                            </span>
                          )}
                          <span className="text-xs text-[hsl(var(--wq-text-secondary))]">
                            {member.capacity}% available
                          </span>
                          <ChevronRight className="w-4 h-4 text-[hsl(var(--wq-text-secondary))]" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Chair Declaration */}
            {currentStep === 'declare-chair' && currentRole && (
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBackToPerson}
                      className="text-[hsl(var(--wq-text-secondary))] hover:text-primary text-sm"
                    >
                      ← Back
                    </button>
                    <span className="text-[hsl(var(--wq-border))]">|</span>
                    <h4 className="text-primary font-semibold">Declare Chair Type</h4>
                  </div>
                </div>

                {/* Selected person summary */}
                {(() => {
                  const assignment = assignments.find(a => a.roleId === currentRole.roleId);
                  const selectedPerson = assignment?.selectedPerson;
                  
                  return selectedPerson ? (
                    <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-sm text-[hsl(var(--wq-text-secondary))] mb-2">Assigning to {currentRole.roleName}:</p>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary text-lg font-semibold">
                            {selectedPerson.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-primary">{selectedPerson.name}</p>
                          <p className="text-sm text-[hsl(var(--wq-text-secondary))]">{selectedPerson.role}</p>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Chair type selection */}
                <div className="space-y-3">
                  <p className="text-sm text-[hsl(var(--wq-text-secondary))]">
                    Select chair responsibility level:
                  </p>
                  
                  <button
                    onClick={() => handleDeclareChair('Primary')}
                    className="w-full flex items-center justify-between p-4 rounded-lg border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-primary">Primary Chair</p>
                        <p className="text-sm text-[hsl(var(--wq-text-secondary))]">
                          Lead responsibility for this role
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-primary" />
                  </button>

                  <button
                    onClick={() => handleDeclareChair('Secondary')}
                    className="w-full flex items-center justify-between p-4 rounded-lg border border-[hsl(var(--wq-border))] hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[hsl(var(--wq-bg-muted))] flex items-center justify-center">
                        <Users className="w-5 h-5 text-[hsl(var(--wq-text-secondary))]" />
                      </div>
                      <div>
                        <p className="font-semibold text-primary">Secondary Chair</p>
                        <p className="text-sm text-[hsl(var(--wq-text-secondary))]">
                          Supporting role with shared responsibility
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[hsl(var(--wq-text-secondary))]" />
                  </button>
                </div>

                {/* Progress indicator */}
                <div className="mt-6 pt-4 border-t border-[hsl(var(--wq-border))]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[hsl(var(--wq-text-secondary))]">
                      Progress: {currentRoleIndex + 1} of {selectedRoles.length} roles
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-[hsl(var(--wq-bg-muted))] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[hsl(var(--wq-status-completed-text))] rounded-full transition-all"
                          style={{ width: `${((currentRoleIndex) / selectedRoles.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ProgressiveAssignmentFlow;
