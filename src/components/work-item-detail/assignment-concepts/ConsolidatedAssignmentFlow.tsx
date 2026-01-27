import { useState, useMemo } from "react";
import { Check, ChevronRight, ChevronDown, User, Briefcase, CheckCircle2, AlertCircle, Search, AlertTriangle } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleDefinition, AssignmentData, getMatchBadge } from "./types";
import { teamMembers, TeamMember } from "@/data/teamMembers";
import { useDebounce } from "@/hooks/useDebounce";
import {
  CAPACITY_CONFIG,
  calculateAvailableCapacity,
  getCapacityStatus,
  formatAvailableCapacity,
  getOverCapacityConfirmationMessage,
  CapacityStatusInfo,
} from "@/utils/capacityManagement";
import { SAMPLE_CHAIRS, Chair, ChairType, CHAIR_TYPE_CONFIGS } from "./chair-selection";

interface ConsolidatedAssignmentFlowProps {
  availableRoles: RoleDefinition[];
  existingAssignments?: AssignmentData[];
  onComplete: (assignment: AssignmentData) => void;
  onCancel?: () => void;
  isReadOnly?: boolean;
}

type Step = 1 | 2 | 3;

const StepIndicator = ({
  stepNumber,
  label,
  icon: Icon,
  isActive,
  isCompleted,
  onClick,
}: {
  stepNumber: number;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  isCompleted: boolean;
  onClick?: () => void;
}) => {
  const canClick = isCompleted && onClick;
  
  return (
    <button
      type="button"
      onClick={canClick ? onClick : undefined}
      disabled={!canClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-left",
        isActive && "bg-primary/10 border-2 border-primary",
        isCompleted && !isActive && "bg-[hsl(var(--wq-status-completed-bg))] border border-[hsl(var(--wq-status-completed-text))] cursor-pointer hover:opacity-90",
        !isActive && !isCompleted && "bg-muted/50 border border-transparent opacity-60"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
          isActive && "bg-primary text-primary-foreground",
          isCompleted && "bg-[hsl(var(--wq-status-completed-text))] text-white",
          !isActive && !isCompleted && "bg-muted-foreground/30 text-muted-foreground"
        )}
      >
        {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium truncate",
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
    </button>
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
              "w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0",
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
          <CheckCircle2 className={cn(
            "w-4 h-4",
            member.locationMatch ? "text-[hsl(var(--wq-status-completed-text))]" : "text-muted-foreground"
          )} />
          Location match
        </span>
        <span className={cn(
          "flex items-center gap-1",
          member.expertiseMatch ? "text-[hsl(var(--wq-status-completed-text))]" : "text-muted-foreground"
        )}>
          <CheckCircle2 className={cn(
            "w-4 h-4",
            member.expertiseMatch ? "text-[hsl(var(--wq-status-completed-text))]" : "text-muted-foreground"
          )} />
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

// Inline Configuration Panel - Progressive disclosure after member selection
const InlineConfigurationPanel = ({
  member,
  roleName,
  workloadPercentage,
  onWorkloadChange,
  selectedChairType,
  onChairTypeChange,
  selectedChair,
  onChairChange,
  currentCapacity,
  isReadOnly,
  onAssign,
}: {
  member: TeamMember;
  roleName: string;
  workloadPercentage: number;
  onWorkloadChange: (value: number) => void;
  selectedChairType: ChairType | null;
  onChairTypeChange: (type: ChairType) => void;
  selectedChair: Chair | null;
  onChairChange: (chair: Chair) => void;
  currentCapacity: number;
  isReadOnly?: boolean;
  onAssign: () => void;
}) => {
  const projectedCapacity = currentCapacity - workloadPercentage;
  const projectedStatusInfo = getCapacityStatus(projectedCapacity);
  
  // Filter chairs by selected type
  const availableChairs = useMemo(() => {
    if (!selectedChairType) return [];
    return SAMPLE_CHAIRS.filter(chair => chair.type === selectedChairType && !chair.assignedTo);
  }, [selectedChairType]);

  // Check if all required fields are complete
  const isComplete = selectedChairType && selectedChair && workloadPercentage > 0;

  return (
    <div className="mt-4 p-5 bg-muted/30 rounded-lg border-2 border-primary/20 animate-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[hsl(var(--wq-border))]">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-primary">{member.name}</p>
          <p className="text-sm text-muted-foreground">{roleName}</p>
        </div>
      </div>

      {/* Stacked Configuration Layout */}
      <div className="space-y-5">
        {/* Chair Type Dropdown */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Chair Type</label>
          <Select
            value={selectedChairType || undefined}
            onValueChange={(value) => onChairTypeChange(value as ChairType)}
            disabled={isReadOnly}
          >
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Select chair type..." />
            </SelectTrigger>
            <SelectContent className="bg-background">
              {CHAIR_TYPE_CONFIGS.map((config) => (
                <SelectItem key={config.id} value={config.id}>
                  {config.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Select Chair - Row-based for up to 10 chairs */}
        {selectedChairType && (
          <div className="space-y-2 animate-in slide-in-from-top-1 duration-150">
            <label className="text-sm font-medium text-foreground">Select Chair</label>
            <div className="space-y-2">
              {availableChairs.length > 0 ? (
                availableChairs.map((chair) => (
                  <button
                    key={chair.id}
                    type="button"
                    onClick={() => onChairChange(chair)}
                    disabled={isReadOnly}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg border text-left transition-all flex items-center justify-between",
                      selectedChair?.id === chair.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-[hsl(var(--wq-border))] hover:border-primary/50 hover:bg-[hsl(var(--wq-bg-muted))]"
                    )}
                  >
                    <span className="font-medium">{chair.name}</span>
                    {selectedChair?.id === chair.id && (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-3 px-4 bg-muted/50 rounded-lg">
                  No available chairs for this type
                </p>
              )}
            </div>
          </div>
        )}

        {/* Workload Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Workload %</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={workloadPercentage}
              onChange={(e) => onWorkloadChange(parseFloat(e.target.value) || 0)}
              onFocus={(e) => e.target.select()}
              disabled={isReadOnly}
              className="w-28 bg-background"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>

        {/* Capacity Impact & Assign Button */}
        <div className="pt-4 border-t border-[hsl(var(--wq-border))] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Capacity Impact:</span>
            <Badge 
              variant="outline" 
              className={cn("font-semibold", projectedStatusInfo.colorClass, projectedStatusInfo.borderClass)}
            >
              {formatAvailableCapacity(currentCapacity)} → {formatAvailableCapacity(projectedCapacity)}
              {projectedStatusInfo.showWarningIcon && (
                <AlertTriangle className="inline w-3 h-3 ml-1" />
              )}
            </Badge>
            {projectedCapacity < 0 && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Over-assigned
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={onAssign}
            disabled={!isComplete || isReadOnly}
            className="bg-primary hover:bg-primary/90"
          >
            Assign
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ConsolidatedAssignmentFlow = ({
  availableRoles,
  existingAssignments = [],
  onComplete,
  onCancel,
  isReadOnly = false,
}: ConsolidatedAssignmentFlowProps) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [workloadPercentage, setWorkloadPercentage] = useState<number>(CAPACITY_CONFIG.DEFAULT_ASSIGNMENT_WORKLOAD);
  const [selectedChairType, setSelectedChairType] = useState<ChairType | null>('primary');
  const [selectedChair, setSelectedChair] = useState<Chair | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [showOverCapacityConfirm, setShowOverCapacityConfirm] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Calculate workload from existing assignments
  const getMemberWorkItemWorkload = (memberId: string): number => {
    return existingAssignments
      .filter(a => a.selectedPerson?.id === memberId)
      .reduce((sum, a) => sum + (a.workloadPercentage || 0), 0);
  };

  // Get IDs of members already assigned
  const assignedMemberIds = useMemo(() => {
    return new Set(
      existingAssignments
        .filter(a => a.selectedPerson)
        .map(a => a.selectedPerson!.id)
    );
  }, [existingAssignments]);

  // Filter members
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

  // Get unassigned roles
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
    setSelectedChairType('primary');
    setSelectedChair(null);
  };

  const handleProceedToReview = () => {
    if (!selectedMember || !selectedChair) return;
    setCurrentStep(3);
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
    setSelectedChairType('primary');
    setSelectedChair(null);
    setSearchQuery("");
    setShowAll(false);
  };

  const goToStep = (step: Step) => {
    if (step < currentStep) {
      setCurrentStep(step);
      if (step === 1) {
        setSearchQuery("");
        setShowAll(false);
        setSelectedMember(null);
      }
      if (step === 2) {
        // Keep member selection when going back to step 2
      }
    }
  };

  const steps = [
    { number: 1, label: "Select Role", icon: Briefcase },
    { number: 2, label: "Select Member & Chair", icon: User },
    { number: 3, label: "Review & Complete", icon: CheckCircle2 },
  ];

  // Get current capacity for selected member
  const getCurrentCapacity = () => {
    if (!selectedMember) return 100;
    const workItemWorkload = getMemberWorkItemWorkload(selectedMember.id);
    return calculateAvailableCapacity(selectedMember, workItemWorkload);
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary">Role Assignment</h3>
          <p className="text-sm text-muted-foreground">
            Step {currentStep} of 3 — {steps[currentStep - 1].label}
          </p>
        </div>
        {onCancel && !isReadOnly && (
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>

      {/* Step Indicators - 3 Steps */}
      <div className="grid grid-cols-3 gap-2">
        {steps.map((step) => (
          <StepIndicator
            key={step.number}
            stepNumber={step.number}
            label={step.label}
            icon={step.icon}
            isActive={currentStep === step.number}
            isCompleted={currentStep > step.number}
            onClick={currentStep > step.number ? () => goToStep(step.number as Step) : undefined}
          />
        ))}
      </div>

      {/* Step Content */}
      <Card className="border-2">
        <CardContent className="p-6">
          {/* Step 1: Select Role */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Select a Role</h4>
                <p className="text-sm text-muted-foreground">
                  Choose a role to assign a team member to.
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
                <div className="grid gap-2">
                  {unassignedRoles.map((role) => (
                    <button
                      key={role.roleId}
                      type="button"
                      onClick={() => handleRoleSelect(role)}
                      disabled={isReadOnly}
                      className="flex items-center justify-between p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium group-hover:text-primary transition-colors">
                            {role.roleName}
                          </p>
                          {role.description && (
                            <p className="text-sm text-muted-foreground">{role.description}</p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Team Member & Configure (Consolidated) */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {selectedRole?.roleName}
                    </Badge>
                  </div>
                  <h4 className="font-medium">Select a Team Member</h4>
                  <p className="text-sm text-muted-foreground">
                    Choose who will be assigned, then configure the assignment details.
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
                  const isSelected = selectedMember?.id === member.id;
                  
                  return (
                    <div key={member.id}>
                      <TeamMemberCard
                        member={member}
                        isSelected={isSelected}
                        onSelect={() => handleMemberSelect(member)}
                        isDisabled={isAtCapacity || isReadOnly}
                      />
                      
                      {/* Progressive disclosure: Inline configuration panel */}
                      {isSelected && selectedRole && (
                        <InlineConfigurationPanel
                          member={member}
                          roleName={selectedRole.roleName}
                          workloadPercentage={workloadPercentage}
                          onWorkloadChange={setWorkloadPercentage}
                          selectedChairType={selectedChairType}
                          onChairTypeChange={setSelectedChairType}
                          selectedChair={selectedChair}
                          onChairChange={setSelectedChair}
                          currentCapacity={getCurrentCapacity()}
                          isReadOnly={isReadOnly}
                          onAssign={handleProceedToReview}
                        />
                      )}
                    </div>
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

              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => goToStep(1)} disabled={isReadOnly}>
                  Back
                </Button>
                <Button 
                  onClick={handleProceedToReview}
                  disabled={isReadOnly || !selectedMember || !selectedChair}
                >
                  Next: Review
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Complete (previously Step 4) */}
          {currentStep === 3 && selectedMember && (
            <div className="space-y-6">
              {(() => {
                const workItemWorkload = getMemberWorkItemWorkload(selectedMember.id);
                const currentAvailable = calculateAvailableCapacity(selectedMember, workItemWorkload);
                const projectedAvailable = currentAvailable - workloadPercentage;
                const projectedStatusInfo = getCapacityStatus(projectedAvailable);
                
                return (
                  <>
                    <div>
                      <h4 className="font-medium">Review & Complete</h4>
                      <p className="text-sm text-muted-foreground">
                        Review the assignment details before completing.
                      </p>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Role</span>
                        <span className="font-medium">{selectedRole?.roleName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Team Member</span>
                        <span className="font-medium">{selectedMember?.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Workload</span>
                        <span className="font-medium">{workloadPercentage}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Chair</span>
                        <Badge variant="secondary">
                          {selectedChair?.name || 'Not selected'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Available Capacity (After)</span>
                        <Badge 
                          variant="outline" 
                          className={cn("font-semibold", projectedStatusInfo.colorClass, projectedStatusInfo.borderClass)}
                        >
                          {formatAvailableCapacity(projectedAvailable)}
                          {projectedStatusInfo.showWarningIcon && (
                            <AlertTriangle className="inline w-3 h-3 ml-1" />
                          )}
                        </Badge>
                      </div>
                    </div>

                    {/* Over-capacity warning */}
                    {projectedAvailable < 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                          <div className="text-sm text-red-700">
                            <p className="font-medium">Over-assigned Warning</p>
                            <p className="text-xs mt-1">
                              This team member will be over-assigned after this assignment. 
                              They will be marked with an "Over Assigned" status.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between pt-4 border-t">
                      <Button variant="outline" onClick={() => goToStep(2)} disabled={isReadOnly}>
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
                  </>
                );
              })()}
            </div>
          )}
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
              onClick={() => setShowOverCapacityConfirm(false)}
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

export default ConsolidatedAssignmentFlow;
