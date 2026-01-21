import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Check, Circle, AlertCircle, Users, Eye, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { TeamMember, teamMembers, searchTeamMembers } from '@/data/teamMembers';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Types
export interface RoleConfig {
  roleId: string;
  roleName: string;
  description?: string;
}

export interface ChairAssignment {
  roleId: string;
  roleName: string;
  primaryChair?: TeamMember;
  coChair?: TeamMember;
}

export interface AssignmentRequirementsDisclosureProps {
  availableRoles: RoleConfig[];
  onComplete: (assignments: ChairAssignment[]) => void;
  initialSelectedRoles?: string[];
  initialAssignments?: ChairAssignment[];
  isReadOnly?: boolean;
}

type DisclosureStep = 'collapsed' | 'role-selection' | 'chair-assignment';
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

export const AssignmentRequirementsDisclosure: React.FC<AssignmentRequirementsDisclosureProps> = ({
  availableRoles,
  onComplete,
  initialSelectedRoles = [],
  initialAssignments = [],
  isReadOnly = false,
}) => {
  // State
  const [currentStep, setCurrentStep] = useState<DisclosureStep>(
    initialAssignments.length > 0 ? 'collapsed' : 'collapsed'
  );
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(
    new Set(initialSelectedRoles)
  );
  const [assignments, setAssignments] = useState<ChairAssignment[]>(initialAssignments);
  const [showCoChairFields, setShowCoChairFields] = useState<Set<string>>(new Set());
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const [showAllSections, setShowAllSections] = useState(false);
  
  // Refs for auto-scroll
  const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Computed values
  const selectedRolesList = useMemo(() => 
    availableRoles.filter(role => selectedRoles.has(role.roleId)),
    [availableRoles, selectedRoles]
  );

  const assignedCount = useMemo(() => 
    assignments.filter(a => a.primaryChair).length,
    [assignments]
  );

  const completionStatus: CompletionStatus = useMemo(() => {
    if (selectedRoles.size === 0 && assignedCount === 0) return 'not-started';
    if (selectedRoles.size > 0 && assignedCount === selectedRoles.size) return 'complete';
    return 'incomplete';
  }, [selectedRoles.size, assignedCount]);

  // Initialize assignments when roles are selected
  useEffect(() => {
    const newAssignments = selectedRolesList.map(role => {
      const existing = assignments.find(a => a.roleId === role.roleId);
      return existing || {
        roleId: role.roleId,
        roleName: role.roleName,
      };
    });
    setAssignments(newAssignments);
  }, [selectedRolesList]);

  // Auto-scroll to next incomplete section
  const scrollToNextIncomplete = useCallback(() => {
    const incompleteRole = assignments.find(a => !a.primaryChair);
    if (incompleteRole && stepRefs.current[incompleteRole.roleId]) {
      setTimeout(() => {
        stepRefs.current[incompleteRole.roleId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
  }, [assignments]);

  // Handlers
  const handleToggleRole = (roleId: string) => {
    if (isReadOnly) return;
    setSelectedRoles(prev => {
      const next = new Set(prev);
      if (next.has(roleId)) {
        next.delete(roleId);
      } else {
        next.add(roleId);
      }
      return next;
    });
  };

  const handleProceedToChairs = () => {
    setCurrentStep('chair-assignment');
  };

  const handleAssignChair = (roleId: string, member: TeamMember, isCoChair = false) => {
    if (isReadOnly) return;
    setAssignments(prev => prev.map(a => 
      a.roleId === roleId
        ? { ...a, [isCoChair ? 'coChair' : 'primaryChair']: member }
        : a
    ));
    setSearchQueries(prev => ({ ...prev, [roleId]: '' }));
    
    // Auto-scroll to next incomplete after assignment
    setTimeout(scrollToNextIncomplete, 300);
  };

  const handleRemoveChair = (roleId: string, isCoChair = false) => {
    if (isReadOnly) return;
    setAssignments(prev => prev.map(a => 
      a.roleId === roleId
        ? { ...a, [isCoChair ? 'coChair' : 'primaryChair']: undefined }
        : a
    ));
  };

  const handleToggleCoChair = (roleId: string) => {
    setShowCoChairFields(prev => {
      const next = new Set(prev);
      if (next.has(roleId)) {
        next.delete(roleId);
      } else {
        next.add(roleId);
      }
      return next;
    });
  };

  const handleExpandClick = () => {
    if (currentStep === 'collapsed') {
      setCurrentStep('role-selection');
    } else {
      setCurrentStep('collapsed');
    }
  };

  const handleReviewAll = () => {
    setShowAllSections(true);
    setCurrentStep('role-selection');
  };

  const handleComplete = () => {
    onComplete(assignments);
    setCurrentStep('collapsed');
  };

  // Search filtered members
  const getFilteredMembers = (roleId: string) => {
    const query = searchQueries[roleId] || '';
    const assigned = assignments.flatMap(a => [a.primaryChair, a.coChair].filter(Boolean)) as TeamMember[];
    const assignedIds = new Set(assigned.map(m => m.id));
    
    return searchTeamMembers(query).filter(m => !assignedIds.has(m.id));
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
                [{selectedRoles.size} roles selected, {assignedCount} chairs assigned]
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
            {/* Step 1: Role Selection */}
            <div
              ref={el => stepRefs.current['role-selection'] = el}
              className={cn(
                'border-b border-[hsl(var(--wq-border))]',
                currentStep === 'chair-assignment' && !showAllSections && 'bg-[hsl(var(--wq-bg-hover))]'
              )}
            >
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {currentStep === 'chair-assignment' && !showAllSections ? (
                      <div className="w-5 h-5 rounded-full bg-[hsl(var(--wq-status-completed-text))] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">1</span>
                      </div>
                    )}
                    <h4 className="text-primary font-semibold">Select Roles Required</h4>
                  </div>
                  <span className="text-[hsl(var(--wq-text-secondary))] text-sm">
                    {selectedRoles.size} of {availableRoles.length} roles selected
                  </span>
                </div>

                {(currentStep === 'role-selection' || showAllSections) && (
                  <>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {availableRoles.map(role => (
                        <Tooltip key={role.roleId}>
                          <TooltipTrigger asChild>
                            <label
                              className={cn(
                                'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                                selectedRoles.has(role.roleId)
                                  ? 'bg-primary/5 border-primary'
                                  : 'bg-card border-[hsl(var(--wq-border))] hover:border-primary/50',
                                isReadOnly && 'cursor-not-allowed opacity-60'
                              )}
                            >
                              <Checkbox
                                checked={selectedRoles.has(role.roleId)}
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

                    {!isReadOnly && (
                      <div className="flex justify-end">
                        <Button
                          onClick={handleProceedToChairs}
                          disabled={selectedRoles.size === 0}
                          className="gap-2"
                        >
                          Next: Assign Chairs
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {currentStep === 'chair-assignment' && !showAllSections && (
                  <div className="flex items-center gap-2 text-sm text-[hsl(var(--wq-text-secondary))]">
                    <Check className="w-4 h-4 text-[hsl(var(--wq-status-completed-text))]" />
                    <span>{selectedRoles.size} roles selected</span>
                    <button
                      onClick={() => setCurrentStep('role-selection')}
                      className="text-primary hover:underline ml-2"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Chair Assignment */}
            {(currentStep === 'chair-assignment' || showAllSections) && selectedRoles.size > 0 && (
              <div
                ref={el => stepRefs.current['chair-assignment'] = el}
                className="px-6 py-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">2</span>
                    </div>
                    <h4 className="text-primary font-semibold">Assign Chairs to Selected Roles</h4>
                  </div>
                  <span className="text-[hsl(var(--wq-text-secondary))] text-sm">
                    {assignedCount} of {selectedRoles.size} roles assigned
                  </span>
                </div>

                <div className="space-y-4">
                  {selectedRolesList.map(role => {
                    const assignment = assignments.find(a => a.roleId === role.roleId);
                    const hasPrimary = !!assignment?.primaryChair;
                    const hasCoChair = !!assignment?.coChair;
                    const showCoChair = showCoChairFields.has(role.roleId);
                    const filteredMembers = getFilteredMembers(role.roleId);

                    return (
                      <div
                        key={role.roleId}
                        ref={el => stepRefs.current[role.roleId] = el}
                        className={cn(
                          'border rounded-lg p-4 transition-all',
                          hasPrimary
                            ? 'border-[hsl(var(--wq-status-completed-text))]/30 bg-[hsl(var(--wq-status-completed-bg))]'
                            : 'border-[hsl(var(--wq-border))] bg-card'
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {hasPrimary ? (
                              <div className="w-5 h-5 rounded-full bg-[hsl(var(--wq-status-completed-text))] flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            ) : (
                              <Circle className="w-5 h-5 text-[hsl(var(--wq-text-secondary))]" />
                            )}
                            <h5 className="font-semibold text-primary">{role.roleName}</h5>
                          </div>
                        </div>

                        {/* Primary Chair Field */}
                        <div className="mb-3">
                          <label className="text-sm text-[hsl(var(--wq-text-secondary))] mb-1 block">
                            Primary Chair *
                          </label>
                          {hasPrimary ? (
                            <div className="flex items-center justify-between p-3 bg-card border border-[hsl(var(--wq-border))] rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-primary text-xs font-semibold">
                                    {assignment.primaryChair?.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-primary">{assignment.primaryChair?.name}</p>
                                  <p className="text-xs text-[hsl(var(--wq-text-secondary))]">{assignment.primaryChair?.role}</p>
                                </div>
                              </div>
                              {!isReadOnly && (
                                <button
                                  onClick={() => handleRemoveChair(role.roleId)}
                                  className="text-sm text-destructive hover:underline"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Search for a team member..."
                                value={searchQueries[role.roleId] || ''}
                                onChange={(e) => setSearchQueries(prev => ({
                                  ...prev,
                                  [role.roleId]: e.target.value,
                                }))}
                                className="w-full p-3 border border-[hsl(var(--wq-border))] rounded-lg text-sm placeholder:text-[hsl(var(--wq-text-muted))] focus:outline-none focus:ring-2 focus:ring-primary/30"
                                disabled={isReadOnly}
                              />
                              {(searchQueries[role.roleId] || '').length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-[hsl(var(--wq-border))] rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                                  {filteredMembers.length === 0 ? (
                                    <p className="p-3 text-sm text-[hsl(var(--wq-text-secondary))]">No members found</p>
                                  ) : (
                                    filteredMembers.slice(0, 5).map(member => (
                                      <button
                                        key={member.id}
                                        onClick={() => handleAssignChair(role.roleId, member)}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-[hsl(var(--wq-bg-hover))] transition-colors text-left"
                                      >
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                          <span className="text-primary text-xs font-semibold">
                                            {member.name.charAt(0)}
                                          </span>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-primary">{member.name}</p>
                                          <p className="text-xs text-[hsl(var(--wq-text-secondary))]">{member.role}</p>
                                        </div>
                                        {member.matchScore >= 90 && (
                                          <span className="ml-auto px-2 py-0.5 bg-[hsl(var(--wq-status-completed-bg))] text-[hsl(var(--wq-status-completed-text))] text-xs rounded-full">
                                            Best Match
                                          </span>
                                        )}
                                      </button>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Co-Chair Field (Optional) */}
                        {hasPrimary && !showCoChair && !hasCoChair && !isReadOnly && (
                          <button
                            onClick={() => handleToggleCoChair(role.roleId)}
                            className="flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <UserPlus className="w-4 h-4" />
                            Add co-chair
                          </button>
                        )}

                        {(showCoChair || hasCoChair) && hasPrimary && (
                          <div className="mt-3 pt-3 border-t border-[hsl(var(--wq-border))]">
                            <label className="text-sm text-[hsl(var(--wq-text-secondary))] mb-1 block">
                              Co-Chair (Optional)
                            </label>
                            {hasCoChair ? (
                              <div className="flex items-center justify-between p-3 bg-card border border-[hsl(var(--wq-border))] rounded-lg">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-primary text-xs font-semibold">
                                      {assignment.coChair?.name.charAt(0)}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-primary">{assignment.coChair?.name}</p>
                                    <p className="text-xs text-[hsl(var(--wq-text-secondary))]">{assignment.coChair?.role}</p>
                                  </div>
                                </div>
                                {!isReadOnly && (
                                  <button
                                    onClick={() => handleRemoveChair(role.roleId, true)}
                                    className="text-sm text-destructive hover:underline"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Search for a co-chair..."
                                  value={searchQueries[`${role.roleId}-cochair`] || ''}
                                  onChange={(e) => setSearchQueries(prev => ({
                                    ...prev,
                                    [`${role.roleId}-cochair`]: e.target.value,
                                  }))}
                                  className="w-full p-3 border border-[hsl(var(--wq-border))] rounded-lg text-sm placeholder:text-[hsl(var(--wq-text-muted))] focus:outline-none focus:ring-2 focus:ring-primary/30"
                                  disabled={isReadOnly}
                                />
                                {(searchQueries[`${role.roleId}-cochair`] || '').length > 0 && (
                                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-[hsl(var(--wq-border))] rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                                    {filteredMembers.length === 0 ? (
                                      <p className="p-3 text-sm text-[hsl(var(--wq-text-secondary))]">No members found</p>
                                    ) : (
                                      filteredMembers.slice(0, 5).map(member => (
                                        <button
                                          key={member.id}
                                          onClick={() => handleAssignChair(role.roleId, member, true)}
                                          className="w-full flex items-center gap-3 p-3 hover:bg-[hsl(var(--wq-bg-hover))] transition-colors text-left"
                                        >
                                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-primary text-xs font-semibold">
                                              {member.name.charAt(0)}
                                            </span>
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium text-primary">{member.name}</p>
                                            <p className="text-xs text-[hsl(var(--wq-text-secondary))]">{member.role}</p>
                                          </div>
                                        </button>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                {!isReadOnly && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-[hsl(var(--wq-border))]">
                    <button
                      onClick={handleReviewAll}
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Eye className="w-4 h-4" />
                      Review All
                    </button>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep('collapsed')}
                      >
                        Save Draft
                      </Button>
                      <Button
                        onClick={handleComplete}
                        disabled={assignedCount < selectedRoles.size}
                      >
                        Complete Assignment
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default AssignmentRequirementsDisclosure;
