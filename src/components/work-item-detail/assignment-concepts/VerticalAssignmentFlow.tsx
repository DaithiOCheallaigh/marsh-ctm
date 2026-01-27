import { useState, useMemo } from "react";
import { Check, ChevronRight, ChevronDown, User, Briefcase, Settings, CheckCircle2, AlertCircle, Search, AlertTriangle, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RoleDefinition, AssignmentData, getMatchBadge } from "./types";
import { teamMembers, TeamMember } from "@/data/teamMembers";
import { useDebounce } from "@/hooks/useDebounce";
import {
  CAPACITY_CONFIG,
  calculateAvailableCapacity,
  getCapacityStatus,
  formatAvailableCapacity,
  getOverCapacityConfirmationMessage,
} from "@/utils/capacityManagement";
import { ChairSelectionToggle, Chair, SAMPLE_CHAIRS } from "./chair-selection";

interface VerticalAssignmentFlowProps {
  availableRoles: RoleDefinition[];
  existingAssignments?: AssignmentData[];
  onComplete: (assignment: AssignmentData) => void;
  onCancel?: () => void;
  isReadOnly?: boolean;
}

type Step = 1 | 2 | 3 | 4;

const VerticalStepIndicator = ({
  stepNumber,
  label,
  icon: Icon,
  isActive,
  isCompleted,
  isExpanded,
  onClick,
  children,
}: {
  stepNumber: number;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  isCompleted: boolean;
  isExpanded: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}) => {
  const canClick = (isCompleted || isActive) && onClick;
  
  return (
    <div className="relative">
      {/* Connection Line */}
      {stepNumber < 4 && (
        <div 
          className={cn(
            "absolute left-[19px] top-[48px] w-0.5 h-[calc(100%-32px)] min-h-4",
            isCompleted ? "bg-[hsl(var(--wq-status-completed-text))]" : "bg-muted-foreground/20"
          )}
        />
      )}
      
      <Collapsible open={isExpanded}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            onClick={canClick ? onClick : undefined}
            disabled={!canClick && !isActive}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-left",
              isActive && "bg-primary/10 border-2 border-primary",
              isCompleted && !isActive && "bg-[hsl(var(--wq-status-completed-bg))] border border-[hsl(var(--wq-status-completed-text))] cursor-pointer hover:opacity-90",
              !isActive && !isCompleted && "bg-muted/50 border border-transparent opacity-60"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors flex-shrink-0",
                isActive && "bg-primary text-primary-foreground",
                isCompleted && "bg-[hsl(var(--wq-status-completed-text))] text-white",
                !isActive && !isCompleted && "bg-muted-foreground/30 text-muted-foreground"
              )}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium",
                isActive && "text-primary",
                isCompleted && "text-[hsl(var(--wq-status-completed-text))]",
                !isActive && !isCompleted && "text-muted-foreground"
              )}>
                {label}
              </p>
            </div>
            <Icon className={cn(
              "h-4 w-4 flex-shrink-0",
              isActive && "text-primary",
              isCompleted && "text-[hsl(var(--wq-status-completed-text))]",
              !isActive && !isCompleted && "text-muted-foreground/50"
            )} />
            {isActive && (
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                isExpanded ? "" : "-rotate-90"
              )} />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {children && (
            <div className="ml-[44px] mt-2 mb-4">
              {children}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

const TeamMemberCard = ({
  member,
  isSelected,
  onSelect,
  isDisabled,
  workItemAssignmentWorkload = 0,
}: {
  member: TeamMember;
  isSelected: boolean;
  onSelect: () => void;
  isDisabled?: boolean;
  workItemAssignmentWorkload?: number;
}) => {
  const matchBadge = getMatchBadge(member.matchScore);
  const availableCapacity = calculateAvailableCapacity(member, workItemAssignmentWorkload);
  const statusInfo = getCapacityStatus(availableCapacity);
  const isCapacityDisabled = statusInfo.isDisabled;
  const effectivelyDisabled = isDisabled || isCapacityDisabled;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={effectivelyDisabled}
      className={cn(
        "w-full p-4 rounded-lg border text-left transition-all bg-white",
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : "border-[hsl(var(--wq-border))] hover:border-primary/50",
        effectivelyDisabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
              isSelected ? "bg-primary border-primary" : "border-[hsl(var(--wq-border))] bg-white"
            )}
          >
            {isSelected && <Check className="w-3 h-3 text-white" />}
          </div>
          <div>
            <div className="font-semibold text-primary">{member.name}</div>
            <div className="text-sm text-[hsl(var(--wq-text-secondary))]">{member.role}</div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-sm text-[hsl(var(--wq-text-secondary))]">
            Match Score: <span className="font-semibold text-primary">{member.matchScore}</span>
          </div>
          {matchBadge.label && (
            <Badge className={cn("text-xs mt-1", matchBadge.className)}>
              {matchBadge.label}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3 text-sm">
        <span className={cn(
          "flex items-center gap-1",
          member.locationMatch ? "text-[hsl(var(--wq-status-completed-text))]" : "text-muted-foreground"
        )}>
          <CheckCircle2 className="w-4 h-4" />
          Location match
        </span>
        <span className={cn(
          "flex items-center gap-1",
          member.expertiseMatch ? "text-[hsl(var(--wq-status-completed-text))]" : "text-muted-foreground"
        )}>
          <CheckCircle2 className="w-4 h-4" />
          Expertise match
        </span>
        <span className={cn(
          "flex items-center gap-1",
          statusInfo.status === 'available' || statusInfo.status === 'fully_available'
            ? "text-[hsl(var(--wq-status-completed-text))]"
            : statusInfo.status === 'limited' || statusInfo.status === 'low'
            ? "text-amber-600"
            : "text-destructive"
        )}>
          {statusInfo.status === 'available' || statusInfo.status === 'fully_available' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : statusInfo.status === 'at_capacity' || statusInfo.status === 'over_assigned' ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          {statusInfo.statusText}
        </span>
      </div>

      <div className="flex items-center gap-6 text-sm text-[hsl(var(--wq-text-secondary))]">
        <span>
          <span className="font-medium">Location:</span> {member.location}
        </span>
        <span>
          <span className="font-medium">Expertise:</span> {member.expertise.slice(0, 3).join(", ")}
        </span>
        <span className="flex items-center gap-1">
          <span className="font-medium">Available Capacity:</span>
          <Badge 
            variant="outline" 
            className={cn("text-xs font-semibold", statusInfo.colorClass, statusInfo.bgClass, statusInfo.borderClass)}
          >
            {formatAvailableCapacity(availableCapacity)}
          </Badge>
        </span>
      </div>
    </button>
  );
};

// Role card with chair count selector
const RoleCardWithChairs = ({
  role,
  onSelect,
  isReadOnly,
}: {
  role: RoleDefinition;
  onSelect: (role: RoleDefinition) => void;
  isReadOnly?: boolean;
}) => {
  const [chairCount, setChairCount] = useState(1);
  const maxChairs = 10;
  const minChairs = 1;

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (chairCount < maxChairs) {
      setChairCount(chairCount + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (chairCount > minChairs) {
      setChairCount(chairCount - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= minChairs && value <= maxChairs) {
      setChairCount(value);
    }
  };

  const handleSelect = () => {
    onSelect({ ...role, chairCount });
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-lg border-2 border-border hover:border-primary transition-all bg-white",
      isReadOnly && "opacity-50 cursor-not-allowed"
    )}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Briefcase className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground">
            {role.roleName}
          </p>
          {role.description && (
            <p className="text-sm text-muted-foreground">{role.description}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Chair Count Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Chairs:</span>
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={isReadOnly || chairCount <= minChairs}
              className="p-1.5 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <input
              type="number"
              value={chairCount}
              onChange={handleInputChange}
              onClick={(e) => e.stopPropagation()}
              min={minChairs}
              max={maxChairs}
              className="w-10 text-center text-sm font-medium border-x border-border py-1.5 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              disabled={isReadOnly}
            />
            <button
              type="button"
              onClick={handleIncrement}
              disabled={isReadOnly || chairCount >= maxChairs}
              className="p-1.5 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        
        {/* Select Button */}
        <Button
          type="button"
          size="sm"
          onClick={handleSelect}
          disabled={isReadOnly}
          className="px-4"
        >
          Select
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export const VerticalAssignmentFlow = ({
  availableRoles,
  existingAssignments = [],
  onComplete,
  onCancel,
  isReadOnly = false,
}: VerticalAssignmentFlowProps) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [workloadPercentage, setWorkloadPercentage] = useState<number>(CAPACITY_CONFIG.DEFAULT_ASSIGNMENT_WORKLOAD);
  const [selectedChair, setSelectedChair] = useState<Chair | null>(null);
  const [chairError, setChairError] = useState<string>("");
  const [showOverCapacityConfirm, setShowOverCapacityConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const getMemberWorkItemWorkload = (memberId: string): number => {
    return existingAssignments
      .filter(a => a.selectedPerson?.id === memberId)
      .reduce((sum, a) => sum + (a.workloadPercentage || 0), 0);
  };

  const assignedMemberIds = useMemo(() => {
    return new Set(
      existingAssignments
        .filter(a => a.selectedPerson)
        .map(a => a.selectedPerson!.id)
    );
  }, [existingAssignments]);

  const eligibleMembers = useMemo(() => {
    let members = teamMembers.filter(m => !m.isManager && !assignedMemberIds.has(m.id));
    
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      members = members.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.role.toLowerCase().includes(query) ||
        m.location.toLowerCase().includes(query) ||
        m.expertise.some(e => e.toLowerCase().includes(query))
      );
    }
    
    members = members.sort((a, b) => b.matchScore - a.matchScore);
    
    if (!showAll && !debouncedSearch) {
      return members.slice(0, 4);
    }
    
    return members;
  }, [debouncedSearch, showAll, assignedMemberIds]);

  const unassignedRoles = useMemo(() => {
    const assignedRoleIds = existingAssignments.map(a => a.roleId);
    return availableRoles.filter(r => !assignedRoleIds.includes(r.roleId));
  }, [availableRoles, existingAssignments]);

  const handleRoleSelect = (role: RoleDefinition) => {
    if (isReadOnly) return;
    setSelectedRole(role);
    setCurrentStep(2);
  };

  const handleMemberSelect = (member: TeamMember) => {
    if (isReadOnly) return;
    setSelectedMember(member);
    setWorkloadPercentage(CAPACITY_CONFIG.DEFAULT_ASSIGNMENT_WORKLOAD);
    setCurrentStep(3);
  };

  const handleWorkloadChange = (value: number) => {
    if (value >= 0 && value <= 100) {
      setWorkloadPercentage(value);
    }
  };

  const handleChairChange = (chair: Chair | null) => {
    setSelectedChair(chair);
    setChairError("");
  };

  const handleProceedToComplete = () => {
    if (!selectedChair) {
      setChairError("Chair selection is required");
      return;
    }
    if (!selectedMember) return;
    setCurrentStep(4);
  };

  const handleConfirmOverCapacity = () => {
    setShowOverCapacityConfirm(false);
    setCurrentStep(4);
  };

  const handleCompleteAssignment = () => {
    if (!selectedRole || !selectedMember || !selectedChair) return;

    const chairType = selectedChair.type === 'primary' ? 'Primary' : 'Secondary';
    const assignment: AssignmentData = {
      roleId: selectedRole.roleId,
      roleName: selectedRole.roleName,
      teamName: selectedRole.teamName,
      selectedPerson: selectedMember,
      chairType,
      workloadPercentage,
    };

    onComplete(assignment);

    // Reset for next assignment
    setCurrentStep(1);
    setSelectedRole(null);
    setSelectedMember(null);
    setWorkloadPercentage(CAPACITY_CONFIG.DEFAULT_ASSIGNMENT_WORKLOAD);
    setSelectedChair(null);
    setChairError("");
    setSearchQuery("");
    setShowAll(false);
  };

  const goToStep = (step: Step) => {
    if (step <= currentStep) {
      setCurrentStep(step);
      if (step === 1) {
        setSearchQuery("");
        setShowAll(false);
      }
    }
  };

  const steps = [
    { number: 1, label: "Select Role", icon: Briefcase },
    { number: 2, label: "Select Team Member", icon: User },
    { number: 3, label: "Configure Assignment", icon: Settings },
    { number: 4, label: "Complete Assignment", icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary">Role Assignment</h3>
          <p className="text-sm text-muted-foreground">
            Step {currentStep} of 4 — {steps[currentStep - 1].label}
          </p>
        </div>
        {onCancel && !isReadOnly && (
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>

      {/* Vertical Step Flow */}
      <Card className="border-2">
        <CardContent className="p-6 space-y-2">
          {/* Step 1: Select Role */}
          <VerticalStepIndicator
            stepNumber={1}
            label="Select Role"
            icon={Briefcase}
            isActive={currentStep === 1}
            isCompleted={currentStep > 1}
            isExpanded={currentStep === 1}
            onClick={() => goToStep(1)}
          >
            <div className="space-y-4 pt-2">
              <div>
                <h4 className="font-medium mb-1">Select a Role</h4>
                <p className="text-sm text-muted-foreground">
                  Choose a role and specify the number of chairs to create.
                </p>
              </div>

              {unassignedRoles.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-[hsl(var(--wq-status-completed-text))] mx-auto mb-3" />
                  <p className="text-lg font-medium text-[hsl(var(--wq-status-completed-text))]">All roles assigned!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Every role has been assigned to a team member.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {unassignedRoles.map((role) => (
                    <RoleCardWithChairs
                      key={role.roleId}
                      role={role}
                      onSelect={handleRoleSelect}
                      isReadOnly={isReadOnly}
                    />
                  ))}
                </div>
              )}
            </div>
          </VerticalStepIndicator>

          {/* Step 2: Select Team Member */}
          <VerticalStepIndicator
            stepNumber={2}
            label="Select Team Member"
            icon={User}
            isActive={currentStep === 2}
            isCompleted={currentStep > 2}
            isExpanded={currentStep === 2}
            onClick={() => currentStep > 2 ? goToStep(2) : undefined}
          >
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {selectedRole?.roleName}
                    </Badge>
                  </div>
                  <h4 className="font-medium">Select a Team Member</h4>
                  <p className="text-sm text-muted-foreground">
                    Choose who will be assigned to this role.
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, role, location, or expertise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Team Member Cards */}
              <div className="space-y-3">
                {eligibleMembers.map((member) => {
                  const isAtCapacity = member.capacity <= 0;
                  
                  return (
                    <TeamMemberCard
                      key={member.id}
                      member={member}
                      isSelected={selectedMember?.id === member.id}
                      onSelect={() => handleMemberSelect(member)}
                      isDisabled={isAtCapacity || isReadOnly}
                    />
                  );
                })}
              </div>

              {/* Show More Button */}
              {!showAll && !debouncedSearch && teamMembers.filter(m => !m.isManager).length > 4 && (
                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => setShowAll(true)}
                    className="text-primary font-semibold"
                  >
                    Show More
                  </Button>
                </div>
              )}

              <div className="flex justify-start pt-4 border-t">
                <Button variant="outline" onClick={() => goToStep(1)} disabled={isReadOnly}>
                  Back
                </Button>
              </div>
            </div>
          </VerticalStepIndicator>

          {/* Step 3: Configure Assignment */}
          <VerticalStepIndicator
            stepNumber={3}
            label="Configure Assignment"
            icon={Settings}
            isActive={currentStep === 3}
            isCompleted={currentStep > 3}
            isExpanded={currentStep === 3}
            onClick={() => currentStep > 3 ? goToStep(3) : undefined}
          >
            {selectedMember && selectedRole && (
              <div className="space-y-5 pt-2">
                {(() => {
                  const workItemWorkload = getMemberWorkItemWorkload(selectedMember.id);
                  const currentAvailable = calculateAvailableCapacity(selectedMember, workItemWorkload);
                  
                  return (
                    <>
                      {/* Header with breadcrumb */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span>{selectedRole?.roleName}</span>
                          <ChevronRight className="h-3 w-3" />
                          <span className="text-foreground font-medium">{selectedMember?.name}</span>
                        </div>
                        <h4 className="font-semibold text-base">Configure Assignment</h4>
                        <p className="text-xs text-muted-foreground">
                          Step 3 of 4 — Configure Assignment
                        </p>
                      </div>

                      {/* Chair Selection with Toggle (Guided vs List View) */}
                      <ChairSelectionToggle
                        chairs={SAMPLE_CHAIRS}
                        selectedChair={selectedChair}
                        onSelectChair={handleChairChange}
                        workloadPercentage={workloadPercentage}
                        onWorkloadChange={handleWorkloadChange}
                        currentCapacity={currentAvailable}
                        memberName={selectedMember.name}
                        roleName={selectedRole.roleName}
                        isReadOnly={isReadOnly}
                      />

                      {/* Chair error message */}
                      {chairError && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {chairError}
                        </p>
                      )}

                      <div className="flex justify-between pt-4 border-t">
                        <Button variant="outline" onClick={() => goToStep(2)} disabled={isReadOnly}>
                          Back
                        </Button>
                        <Button onClick={handleProceedToComplete} disabled={isReadOnly || !selectedChair}>
                          Next: Review
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </VerticalStepIndicator>

          {/* Step 4: Complete Assignment */}
          <VerticalStepIndicator
            stepNumber={4}
            label="Complete Assignment"
            icon={CheckCircle2}
            isActive={currentStep === 4}
            isCompleted={false}
            isExpanded={currentStep === 4}
            onClick={() => {}}
          >
            {selectedRole && selectedMember && selectedChair && (
              <div className="space-y-4 pt-2">
                <div>
                  <h4 className="font-medium mb-1">Review & Complete</h4>
                  <p className="text-sm text-muted-foreground">
                    Confirm your assignment details below.
                  </p>
                </div>

                <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Role:</span>
                    <span className="font-medium">{selectedRole.roleName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Team Member:</span>
                    <span className="font-medium">{selectedMember.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Chair:</span>
                    <span className="font-medium">
                      {selectedChair?.name || 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Workload:</span>
                    <span className="font-medium">{workloadPercentage}%</span>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={() => goToStep(3)} disabled={isReadOnly}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleCompleteAssignment}
                    className="bg-[hsl(var(--wq-status-completed-text))] hover:bg-[hsl(var(--wq-status-completed-text))]/90"
                    disabled={isReadOnly}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Complete Assignment
                  </Button>
                </div>
              </div>
            )}
          </VerticalStepIndicator>
        </CardContent>
      </Card>

      {/* Existing Assignments Summary */}
      {existingAssignments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Completed Assignments ({existingAssignments.length})
          </h4>
          <div className="grid gap-2">
            {existingAssignments.map((assignment) => (
              <div
                key={assignment.roleId}
                className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--wq-status-completed-bg))] border border-[hsl(var(--wq-status-completed-text))]/20"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[hsl(var(--wq-status-completed-text))]" />
                  <div>
                    <p className="font-medium text-[hsl(var(--wq-status-completed-text))]">{assignment.roleName}</p>
                    <p className="text-sm text-[hsl(var(--wq-status-completed-text))]/80">
                      {assignment.selectedPerson?.name} • {assignment.workloadPercentage}%
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="border-[hsl(var(--wq-status-completed-text))]/30 text-[hsl(var(--wq-status-completed-text))]">
                  {assignment.chairType}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Over-Capacity Confirmation Dialog */}
      <AlertDialog open={showOverCapacityConfirm} onOpenChange={setShowOverCapacityConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Over-Capacity Assignment
            </AlertDialogTitle>
            <AlertDialogDescription>
              {getOverCapacityConfirmationMessage()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmOverCapacity}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Proceed Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VerticalAssignmentFlow;
