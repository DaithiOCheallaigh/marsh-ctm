import { useState, useMemo } from "react";
import { Check, ChevronRight, User, Briefcase, Settings, CheckCircle2, AlertCircle, MapPin, Gauge } from "lucide-react";
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
import { RoleDefinition, AssignmentData, getMatchScoreColor, getMatchBadge, getCapacityBarColor } from "./types";
import { teamMembers, TeamMember } from "@/data/teamMembers";

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

const TeamMemberCard = ({
  member,
  isSelected,
  onSelect,
  isDisabled,
}: {
  member: TeamMember;
  isSelected: boolean;
  onSelect: () => void;
  isDisabled?: boolean;
}) => {
  // Current workload (capacity field represents available capacity in the data)
  const currentWorkload = 100 - member.capacity;
  const matchBadge = getMatchBadge(member.matchScore);

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isDisabled}
      className={cn(
        "w-full p-3 rounded-lg border-2 text-left transition-all",
        isSelected
          ? "border-primary bg-white shadow-md"
          : "border-transparent bg-white hover:border-[hsl(var(--wq-border))]",
        isDisabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center",
              isSelected ? "bg-primary border-primary" : "border-[hsl(var(--wq-border))]"
            )}
          >
            {isSelected && <Check className="w-3 h-3 text-white" />}
          </div>
          <div>
            <div className="font-medium text-primary text-sm">{member.name}</div>
            <div className="text-xs text-[hsl(var(--wq-text-secondary))]">{member.role}</div>
          </div>
        </div>
        <div className="text-right">
          <div className={cn("font-semibold text-sm", getMatchScoreColor(member.matchScore))}>
            {member.matchScore}
          </div>
          {matchBadge.label && (
            <Badge className={cn("text-[10px]", matchBadge.className)}>
              {matchBadge.label}
            </Badge>
          )}
        </div>
      </div>

      {/* Match Indicators */}
      <div className="flex items-center gap-3 text-xs mb-2">
        <span className={member.locationMatch ? "text-[hsl(var(--wq-status-completed-text))]" : "text-muted-foreground"}>
          <MapPin className="w-3 h-3 inline mr-1" />
          {member.locationMatch ? "✓" : "○"}
        </span>
        <span className={member.expertiseMatch ? "text-[hsl(var(--wq-status-completed-text))]" : "text-muted-foreground"}>
          <Briefcase className="w-3 h-3 inline mr-1" />
          {member.expertiseMatch ? "✓" : "○"}
        </span>
        <span className={member.hasCapacity ? "text-[hsl(var(--wq-status-completed-text))]" : "text-[hsl(var(--wq-priority-medium))]"}>
          <Gauge className="w-3 h-3 inline mr-1" />
          {member.capacity}%
        </span>
      </div>

      {/* Capacity Bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all", getCapacityBarColor(currentWorkload))}
          style={{ width: `${currentWorkload}%` }}
        />
      </div>
      
      {/* Capacity Warning */}
      {member.capacity <= 10 && (
        <div className="text-xs text-destructive mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Near or at capacity
        </div>
      )}
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
  const [workloadPercentage, setWorkloadPercentage] = useState<number>(20);
  const [selectedChair, setSelectedChair] = useState<string>("");
  const [chairError, setChairError] = useState<string>("");

  // Filter members based on selected role (simplified - show all for now)
  const eligibleMembers = useMemo(() => {
    return teamMembers.filter(m => !m.isManager);
  }, []);

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
    setCurrentStep(3);
  };

  const handleWorkloadChange = (value: string) => {
    const num = parseInt(value, 10);
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
    if (workloadPercentage <= 0) {
      return;
    }
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
    setWorkloadPercentage(20);
    setSelectedChair("");
    setChairError("");
  };

  const goToStep = (step: Step) => {
    if (step < currentStep) {
      setCurrentStep(step);
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

              <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
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

              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => goToStep(1)} disabled={isReadOnly}>
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Configure Assignment */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs">
                    {selectedRole?.roleName}
                  </Badge>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  <Badge variant="outline" className="text-xs">
                    {selectedMember?.name}
                  </Badge>
                </div>
                <h4 className="font-medium">Configure Assignment Details</h4>
                <p className="text-sm text-muted-foreground">
                  Set the workload and chair for this assignment.
                </p>
              </div>

              <div className="grid gap-6">
                {/* Workload Percentage */}
                <div className="space-y-2">
                  <Label htmlFor="workload" className="text-sm font-medium">
                    Workload Percentage <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="workload"
                      type="number"
                      min={1}
                      max={100}
                      value={workloadPercentage}
                      onChange={(e) => handleWorkloadChange(e.target.value)}
                      className="w-24"
                      disabled={isReadOnly}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This represents how much of the team member's capacity this assignment will consume.
                  </p>
                  {workloadPercentage <= 0 && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Workload must be greater than 0%
                    </p>
                  )}
                </div>

                {/* Chair Selection */}
                <div className="space-y-2">
                  <Label htmlFor="chair" className="text-sm font-medium">
                    Chair <span className="text-destructive">*</span>
                  </Label>
                  <Select value={selectedChair} onValueChange={handleChairChange} disabled={isReadOnly}>
                    <SelectTrigger 
                      id="chair" 
                      className={cn(
                        "w-full max-w-xs",
                        chairError && "border-destructive focus:ring-destructive"
                      )}
                    >
                      <SelectValue placeholder="Select a chair..." />
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

              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => goToStep(2)} disabled={isReadOnly}>
                  Back
                </Button>
                <Button onClick={handleProceedToComplete} disabled={isReadOnly}>
                  Continue
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Complete Assignment */}
          {currentStep === 4 && (
            <div className="space-y-6">
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
    </div>
  );
};

export default SimplifiedAssignmentFlow;
