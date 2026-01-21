import React, { useState, useMemo, useCallback } from 'react';
import { ChevronDown, ChevronRight, Check, Users, Search, UserPlus, Info } from 'lucide-react';
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
  'Senior Account Manager': 'Manages key client accounts with strategic oversight',
  'Compliance Officer': 'Ensures regulatory compliance and risk management',
  'Service Delivery Manager': 'Manages service delivery and client satisfaction',
  'Client Success Manager': 'Drives client retention and relationship growth',
};

// Status Badge Component
const StatusBadge: React.FC<{ status: CompletionStatus }> = ({ status }) => {
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

// Step Indicator Component
const StepIndicator: React.FC<{ 
  step: number; 
  label: string;
  isActive: boolean; 
  isComplete: boolean;
}> = ({ step, label, isActive, isComplete }) => (
  <div className="flex items-center gap-2">
    <div className={cn(
      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
      isComplete
        ? 'bg-[hsl(var(--wq-status-completed-text))] text-white'
        : isActive
          ? 'border-2 border-primary bg-primary/10 text-primary'
          : 'border-2 border-[hsl(var(--wq-border))] text-[hsl(var(--wq-text-secondary))]'
    )}>
      {isComplete ? <Check className="w-3.5 h-3.5" /> : step}
    </div>
    <span className={cn(
      'text-sm font-medium',
      isActive ? 'text-primary' : 'text-[hsl(var(--wq-text-secondary))]'
    )}>
      {label}
    </span>
  </div>
);

// Role Selection Card Component
const RoleCard: React.FC<{
  role: RoleDefinition;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: () => void;
}> = ({ role, isSelected, isDisabled, onToggle }) => {
  const description = role.description || roleDescriptions[role.roleName] || `Responsible for ${role.roleName.toLowerCase()} duties and responsibilities`;
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <label
          className={cn(
            'flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-all group',
            isSelected
              ? 'bg-primary/5 border-primary shadow-sm'
              : 'bg-card border-[hsl(var(--wq-border))] hover:border-primary/50 hover:bg-[hsl(var(--wq-bg-hover))]',
            isDisabled && 'cursor-not-allowed opacity-60'
          )}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggle}
            disabled={isDisabled}
          />
          <span className={cn(
            'text-sm font-medium flex-1',
            isSelected ? 'text-primary' : 'text-foreground'
          )}>
            {role.roleName}
          </span>
          <Info className={cn(
            'w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity',
            'text-[hsl(var(--wq-text-muted))]'
          )} />
        </label>
      </TooltipTrigger>
      <TooltipContent 
        side="top" 
        className="max-w-[280px] bg-popover text-popover-foreground border shadow-lg z-50"
      >
        <p className="text-sm">{description}</p>
      </TooltipContent>
    </Tooltip>
  );
};

// Team Member Card Component
const MemberCard: React.FC<{
  member: TeamMember;
  onSelect: () => void;
}> = ({ member, onSelect }) => (
  <button
    onClick={onSelect}
    className="w-full flex items-center justify-between p-3.5 rounded-lg border border-[hsl(var(--wq-border))] hover:border-primary hover:bg-primary/5 transition-all text-left group"
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-primary font-semibold text-sm">
          {member.name.split(' ').map(n => n[0]).join('')}
        </span>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{member.name}</p>
        <p className="text-xs text-[hsl(var(--wq-text-secondary))]">{member.role}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {member.matchScore >= 90 && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--wq-status-completed-bg))] text-[hsl(var(--wq-status-completed-text))] font-medium">
          Best Match
        </span>
      )}
      {member.matchScore >= 70 && member.matchScore < 90 && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--wq-status-in-progress-bg))] text-[hsl(var(--wq-status-in-progress-text))] font-medium">
          Good Match
        </span>
      )}
      <span className="text-xs text-[hsl(var(--wq-text-secondary))]">
        {member.capacity}% capacity
      </span>
      <ChevronRight className="w-4 h-4 text-[hsl(var(--wq-text-muted))] group-hover:text-primary transition-colors" />
    </div>
  </button>
);

// Chair Selection Button Component
const ChairButton: React.FC<{
  type: 'Primary' | 'Secondary';
  onSelect: () => void;
}> = ({ type, onSelect }) => {
  const isPrimary = type === 'Primary';
  
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all text-left group',
        isPrimary
          ? 'border-primary bg-primary/5 hover:bg-primary/10'
          : 'border-[hsl(var(--wq-border))] hover:border-primary/50 hover:bg-primary/5'
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-11 h-11 rounded-full flex items-center justify-center',
          isPrimary ? 'bg-primary' : 'bg-[hsl(var(--wq-bg-muted))]'
        )}>
          {isPrimary ? (
            <UserPlus className="w-5 h-5 text-primary-foreground" />
          ) : (
            <Users className="w-5 h-5 text-[hsl(var(--wq-text-secondary))]" />
          )}
        </div>
        <div>
          <p className={cn(
            'font-semibold',
            isPrimary ? 'text-primary' : 'text-foreground'
          )}>
            {type} Chair
          </p>
          <p className="text-sm text-[hsl(var(--wq-text-secondary))]">
            {isPrimary 
              ? 'Lead responsibility for this role'
              : 'Supporting role with shared responsibility'
            }
          </p>
        </div>
      </div>
      <ChevronRight className={cn(
        'w-5 h-5 transition-colors',
        isPrimary ? 'text-primary' : 'text-[hsl(var(--wq-text-muted))] group-hover:text-primary'
      )} />
    </button>
  );
};

// Main Component
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

    const updatedAssignments = assignments.map(a =>
      a.roleId === currentRole.roleId
        ? { ...a, chairType }
        : a
    );
    
    setAssignments(updatedAssignments);

    // Move to next role or complete
    if (currentRoleIndex < selectedRoles.length - 1) {
      setCurrentRoleIndex(prev => prev + 1);
      setCurrentStep('select-person');
      setSearchQuery('');
    } else {
      // All roles assigned
      setCurrentStep('collapsed');
      onComplete(updatedAssignments);
    }
  }, [currentRole, currentRoleIndex, selectedRoles.length, assignments, onComplete]);

  const handleExpandClick = () => {
    if (currentStep === 'collapsed') {
      if (completionStatus === 'complete') {
        setCurrentStep('select-roles');
      } else if (selectedRoleIds.size > 0) {
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

  // Progress calculation
  const progressPercentage = useMemo(() => {
    if (selectedRoleIds.size === 0) return 0;
    return Math.round((completedAssignments.length / selectedRoleIds.size) * 100);
  }, [selectedRoleIds.size, completedAssignments.length]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden shadow-sm">
        {/* Header */}
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
                [{selectedRoleIds.size} roles selected, {completedAssignments.length} chairs assigned]
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
            {/* Step Progress */}
            <div className="px-6 py-4 bg-[hsl(var(--wq-bg-muted))] border-b border-[hsl(var(--wq-border))]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <StepIndicator 
                    step={1} 
                    label="Select Roles"
                    isActive={currentStep === 'select-roles'} 
                    isComplete={selectedRoleIds.size > 0 && currentStep !== 'select-roles'} 
                  />
                  <div className="w-12 h-0.5 bg-[hsl(var(--wq-border))]" />
                  <StepIndicator 
                    step={2} 
                    label="Select Person"
                    isActive={currentStep === 'select-person'} 
                    isComplete={currentStep === 'declare-chair'} 
                  />
                  <div className="w-12 h-0.5 bg-[hsl(var(--wq-border))]" />
                  <StepIndicator 
                    step={3} 
                    label="Declare Chair"
                    isActive={currentStep === 'declare-chair'} 
                    isComplete={false} 
                  />
                </div>
                {progressPercentage > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[hsl(var(--wq-text-secondary))]">{progressPercentage}%</span>
                    <div className="w-20 h-1.5 bg-[hsl(var(--wq-border))] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[hsl(var(--wq-status-completed-text))] rounded-full transition-all"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 1: Role Selection */}
            {currentStep === 'select-roles' && (
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-base font-semibold text-foreground">Select Roles Required</h4>
                  <span className="text-sm text-[hsl(var(--wq-text-secondary))]">
                    {selectedRoleIds.size} of {availableRoles.length} selected
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  {availableRoles.map(role => (
                    <RoleCard
                      key={role.roleId}
                      role={role}
                      isSelected={selectedRoleIds.has(role.roleId)}
                      isDisabled={isReadOnly}
                      onToggle={() => handleToggleRole(role.roleId)}
                    />
                  ))}
                </div>

                {/* Completed assignments summary */}
                {completedAssignments.length > 0 && (
                  <div className="mb-5 p-4 bg-[hsl(var(--wq-status-completed-bg))] rounded-lg border border-[hsl(var(--wq-status-completed-text))]/20">
                    <p className="text-sm font-semibold text-[hsl(var(--wq-status-completed-text))] mb-3">
                      Completed Assignments ({completedAssignments.length})
                    </p>
                    <div className="space-y-2">
                      {completedAssignments.map(a => (
                        <div key={a.roleId} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[hsl(var(--wq-status-completed-text))]" />
                          <span className="text-foreground font-medium">{a.roleName}</span>
                          <span className="text-[hsl(var(--wq-text-muted))]">→</span>
                          <span className="text-foreground">{a.selectedPerson?.name}</span>
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded-full font-medium',
                            a.chairType === 'Primary' 
                              ? 'bg-primary/10 text-primary'
                              : 'bg-[hsl(var(--wq-bg-muted))] text-[hsl(var(--wq-text-secondary))]'
                          )}>
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
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleBackToRoles}
                      className="text-sm text-[hsl(var(--wq-text-secondary))] hover:text-primary transition-colors"
                    >
                      ← Back to Roles
                    </button>
                    <div className="w-px h-4 bg-[hsl(var(--wq-border))]" />
                    <h4 className="text-base font-semibold text-foreground">
                      Select Person for <span className="text-primary">{currentRole.roleName}</span>
                    </h4>
                  </div>
                  <span className="text-sm text-[hsl(var(--wq-text-secondary))]">
                    Role {currentRoleIndex + 1} of {selectedRoles.length}
                  </span>
                </div>

                {/* Search Input */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--wq-text-muted))]" />
                  <input
                    type="text"
                    placeholder="Search team members by name, role, or expertise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-[hsl(var(--wq-border))] rounded-lg text-sm placeholder:text-[hsl(var(--wq-text-muted))] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background"
                  />
                </div>

                {/* Members List */}
                <div className="space-y-2 max-h-[320px] overflow-y-auto">
                  {filteredMembers.length === 0 ? (
                    <div className="text-center py-10 text-[hsl(var(--wq-text-secondary))]">
                      <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>No team members found</p>
                    </div>
                  ) : (
                    filteredMembers.slice(0, 6).map(member => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        onSelect={() => handleSelectPerson(member)}
                      />
                    ))
                  )}
                  {filteredMembers.length > 6 && (
                    <p className="text-center text-sm text-[hsl(var(--wq-text-muted))] pt-2">
                      + {filteredMembers.length - 6} more members. Refine your search to find them.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Chair Declaration */}
            {currentStep === 'declare-chair' && currentRole && (
              <div className="px-6 py-5">
                <div className="flex items-center gap-3 mb-5">
                  <button
                    onClick={handleBackToPerson}
                    className="text-sm text-[hsl(var(--wq-text-secondary))] hover:text-primary transition-colors"
                  >
                    ← Back
                  </button>
                  <div className="w-px h-4 bg-[hsl(var(--wq-border))]" />
                  <h4 className="text-base font-semibold text-foreground">Declare Chair Type</h4>
                </div>

                {/* Selected Person Summary */}
                {(() => {
                  const assignment = assignments.find(a => a.roleId === currentRole.roleId);
                  const selectedPerson = assignment?.selectedPerson;
                  
                  return selectedPerson ? (
                    <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-xs uppercase tracking-wide text-[hsl(var(--wq-text-muted))] mb-2">
                        Assigning to {currentRole.roleName}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary text-base font-semibold">
                            {selectedPerson.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{selectedPerson.name}</p>
                          <p className="text-sm text-[hsl(var(--wq-text-secondary))]">{selectedPerson.role}</p>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Chair Type Selection */}
                <div className="space-y-3 mb-6">
                  <p className="text-sm text-[hsl(var(--wq-text-secondary))]">
                    Select chair responsibility level:
                  </p>
                  <ChairButton type="Primary" onSelect={() => handleDeclareChair('Primary')} />
                  <ChairButton type="Secondary" onSelect={() => handleDeclareChair('Secondary')} />
                </div>

                {/* Progress */}
                <div className="pt-4 border-t border-[hsl(var(--wq-border))]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[hsl(var(--wq-text-secondary))]">
                      Assigning role {currentRoleIndex + 1} of {selectedRoles.length}
                    </span>
                    <div className="flex items-center gap-1">
                      {selectedRoles.map((_, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'w-2 h-2 rounded-full',
                            idx < currentRoleIndex 
                              ? 'bg-[hsl(var(--wq-status-completed-text))]'
                              : idx === currentRoleIndex
                                ? 'bg-primary'
                                : 'bg-[hsl(var(--wq-border))]'
                          )}
                        />
                      ))}
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
