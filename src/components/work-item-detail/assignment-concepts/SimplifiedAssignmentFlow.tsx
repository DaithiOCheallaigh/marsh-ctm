import { useState, useMemo } from "react";
import { Check, ChevronRight, User, Briefcase, Settings, CheckCircle2, AlertCircle, Search, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { RoleDefinition, AssignmentData, getMatchBadge } from "./types";
import { teamMembers, TeamMember } from "@/data/teamMembers";
import { useDebounce } from "@/hooks/useDebounce";
import {
  CAPACITY_CONFIG,
  calculateAvailableCapacity,
  getCapacityStatus,
  validateAssignmentWorkload,
  formatAvailableCapacity,
  getOverCapacityConfirmationMessage,
  CapacityStatusInfo,
} from "@/utils/capacityManagement";

interface SimplifiedAssignmentFlowProps {
  availableRoles: RoleDefinition[];
  existingAssignments?: AssignmentData[];
  onComplete: (assignment: AssignmentData) => void;
  onCancel?: () => void;
  isReadOnly?: boolean;
}

// Chair options - in real app would come from team data
const CHAIR_OPTIONS = [
  { id: "primary", name: "Primary Chair", value: "Primary" as const },
  { id: "secondary", name: "Secondary Chair", value: "Secondary" as const },
];

type Step = 1 | 2 | 3 | 4;

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

const CapacityIndicator = ({
  availableCapacity,
  statusInfo,
}: {
  availableCapacity: number;
  statusInfo: CapacityStatusInfo;
}) => {
  return (
    <div className={cn("flex items-center gap-1.5", statusInfo.colorClass)}>
      {statusInfo.showWarningIcon && <AlertTriangle className="w-3.5 h-3.5" />}
      <span className="font-semibold text-xs">
        {formatAvailableCapacity(availableCapacity)} available
      </span>
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
  
  // Calculate available capacity (CRITICAL: Show available, not workload)
  const availableCapacity = calculateAvailableCapacity(member, workItemAssignmentWorkload);
  const statusInfo = getCapacityStatus(availableCapacity);
  
  // Determine if disabled due to capacity
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
      {/* Header Row */}
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

      {/* Match Indicators Row */}
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
        {/* Capacity indicator with status-based styling */}
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

      {/* Details Row */}
      <div className="flex items-center gap-6 text-sm text-[hsl(var(--wq-text-secondary))]">
        <span>
          <span className="font-medium">Location:</span> {member.location}
        </span>
        <span>
          <span className="font-medium">Expertise:</span> {member.expertise.slice(0, 3).join(", ")}
        </span>
        {/* CRITICAL: Display "Available Capacity", NOT "Workload" */}
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

export const SimplifiedAssignmentFlow = ({
  availableRoles,
  existingAssignments = [],
  onComplete,
  onCancel,
  isReadOnly = false,
}: SimplifiedAssignmentFlowProps) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [workloadPercentage, setWorkloadPercentage] = useState<number>(CAPACITY_CONFIG.DEFAULT_ASSIGNMENT_WORKLOAD);
  const [selectedChair, setSelectedChair] = useState<string>("");
  const [chairError, setChairError] = useState<string>("");
  const [workloadError, setWorkloadError] = useState<string>("");
  const [workloadWarning, setWorkloadWarning] = useState<string>("");
  const [showOverCapacityConfirm, setShowOverCapacityConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Calculate workload from existing assignments for this work item
  const getMemberWorkItemWorkload = (memberId: string): number => {
    return existingAssignments
      .filter(a => a.selectedPerson?.id === memberId)
      .reduce((sum, a) => sum + (a.workloadPercentage || 0), 0);
  };

  // Get IDs of members already assigned in this work item
  const assignedMemberIds = useMemo(() => {
    return new Set(
      existingAssignments
        .filter(a => a.selectedPerson)
        .map(a => a.selectedPerson!.id)
    );
  }, [existingAssignments]);

  // Filter members based on search and exclude already assigned members
  const eligibleMembers = useMemo(() => {
    // First, filter out managers and already-assigned members
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
    
    // Sort by match score
    members = members.sort((a, b) => b.matchScore - a.matchScore);
    
    // Limit to 4 unless showAll is true
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
    // Reset workload validation when selecting new member
    setWorkloadError("");
    setWorkloadWarning("");
    setWorkloadPercentage(CAPACITY_CONFIG.DEFAULT_ASSIGNMENT_WORKLOAD);
    setCurrentStep(3);
  };

  const handleWorkloadChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      setWorkloadPercentage(num);
    }
  };

  const handleChairChange = (value: string) => {
    setSelectedChair(value);
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

    const chairOption = CHAIR_OPTIONS.find(c => c.id === selectedChair);
    const assignment: AssignmentData = {
      roleId: selectedRole.roleId,
      roleName: selectedRole.roleName,
      teamName: selectedRole.teamName,
      selectedPerson: selectedMember,
      chairType: chairOption?.value || "Primary",
      workloadPercentage,
    };

    onComplete(assignment);

    // Reset for next assignment
    setCurrentStep(1);
    setSelectedRole(null);
    setSelectedMember(null);
    setWorkloadPercentage(CAPACITY_CONFIG.DEFAULT_ASSIGNMENT_WORKLOAD);
    setSelectedChair("");
    setChairError("");
    setWorkloadError("");
    setWorkloadWarning("");
    setSearchQuery("");
    setShowAll(false);
  };

  const goToStep = (step: Step) => {
    if (step < currentStep) {
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

      {/* Step Indicators */}
      <div className="grid grid-cols-4 gap-2">
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

          {/* Step 2: Select Team Member */}
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

              {/* Team Member Cards - Single Column */}
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

              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => goToStep(1)} disabled={isReadOnly}>
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Configure Assignment */}
          {currentStep === 3 && selectedMember && (
            <div className="space-y-5">
              {(() => {
                const workItemWorkload = getMemberWorkItemWorkload(selectedMember.id);
                const currentAvailable = calculateAvailableCapacity(selectedMember, workItemWorkload);
                const projectedAvailable = currentAvailable - workloadPercentage;
                const currentStatusInfo = getCapacityStatus(currentAvailable);
                const projectedStatusInfo = getCapacityStatus(projectedAvailable);
                
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
                    </div>

                    {/* Member Summary - Compact (shows projected capacity after assignment) */}
                    <div className="flex items-center justify-between rounded-lg px-4 py-3 border border-border bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{selectedMember.name}</p>
                          <p className="text-xs text-muted-foreground">{selectedMember.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">
                          {formatAvailableCapacity(projectedAvailable)}
                        </p>
                        <p className="text-xs text-muted-foreground">Available Capacity</p>
                      </div>
                    </div>

                    {/* Form Fields - 2 Column Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Workload Percentage */}
                      <div className="space-y-1.5">
                        <Label htmlFor="workload" className="text-sm font-medium">
                          Workload <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="workload"
                            type="number"
                            min={CAPACITY_CONFIG.MIN_WORKLOAD_PERCENTAGE}
                            max={CAPACITY_CONFIG.MAX_WORKLOAD_PERCENTAGE}
                            step="any"
                            value={workloadPercentage}
                            onChange={(e) => handleWorkloadChange(e.target.value)}
                            onFocus={(e) => e.target.select()}
                            className="pr-8"
                            disabled={isReadOnly}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                        </div>
                      </div>

                      {/* Chair Selection */}
                      <div className="space-y-1.5">
                        <Label htmlFor="chair" className="text-sm font-medium">
                          Chair <span className="text-destructive">*</span>
                        </Label>
                        <Select value={selectedChair} onValueChange={handleChairChange} disabled={isReadOnly}>
                          <SelectTrigger 
                            id="chair" 
                            className={cn(
                              chairError && "border-destructive focus:ring-destructive"
                            )}
                          >
                            <SelectValue placeholder="Select chair..." />
                          </SelectTrigger>
                          <SelectContent>
                            {CHAIR_OPTIONS.map((chair) => (
                              <SelectItem key={chair.id} value={chair.id}>
                                {chair.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {chairError && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {chairError}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between pt-3 border-t">
                      <Button variant="outline" size="sm" onClick={() => goToStep(2)} disabled={isReadOnly}>
                        Back
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleProceedToComplete} 
                        disabled={isReadOnly || !!workloadError}
                      >
                        Continue
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Step 4: Complete Assignment */}
          {currentStep === 4 && selectedMember && (
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
                          {CHAIR_OPTIONS.find(c => c.id === selectedChair)?.name}
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

                    {/* Over-capacity warning if applicable */}
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

export default SimplifiedAssignmentFlow;
