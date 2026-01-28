import { useState, useMemo } from "react";
import { Check, ChevronRight, User, Briefcase, CheckCircle2, AlertCircle, Search, AlertTriangle, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { RoleDefinition, AssignmentData, getMatchBadge } from "./types";
import { teamMembers, TeamMember } from "@/data/teamMembers";
import { teamsData } from "@/data/teams";
import { useDebounce } from "@/hooks/useDebounce";
import {
  CAPACITY_CONFIG,
  calculateAvailableCapacity,
  getCapacityStatus,
  formatAvailableCapacity,
} from "@/utils/capacityManagement";
import { getChairLabel } from "@/utils/chairLabels";

interface ConsolidatedAssignmentFlowV2Props {
  availableRoles: RoleDefinition[];
  existingAssignments?: AssignmentData[];
  onComplete: (assignments: AssignmentData[]) => void;
  onCancel?: () => void;
  isReadOnly?: boolean;
}

// Chair slot for the role (up to 10 chairs)
interface ChairSlot {
  id: string;
  index: number;
  label: string;
  type: 'Primary' | 'Secondary';
  isRequired: boolean;
  assignedTo?: {
    memberId: string;
    memberName: string;
    workloadPercentage: number;
    notes?: string;
  };
}

// Generate chair slots for a role (up to 10)
const generateChairSlots = (existingAssignments: AssignmentData[], roleId: string): ChairSlot[] => {
  const slots: ChairSlot[] = [];
  
  for (let i = 0; i < 10; i++) {
    const label = getChairLabel(i);
    const type = i === 0 ? 'Primary' : 'Secondary';
    
    // Check if this chair slot is already assigned
    const existingAssignment = existingAssignments.find(
      a => a.roleId === roleId && a.chairType === type && 
           // Match by chair index/label pattern
           (a.notes?.includes(`Chair ${i + 1}`) || (i === 0 && a.chairType === 'Primary') || (i > 0 && a.chairType === 'Secondary'))
    );
    
    slots.push({
      id: `chair-${i}`,
      index: i,
      label,
      type,
      isRequired: i === 0, // Only Primary Chair is required
      assignedTo: existingAssignment && existingAssignment.selectedPerson ? {
        memberId: existingAssignment.selectedPerson.id,
        memberName: existingAssignment.selectedPerson.name,
        workloadPercentage: existingAssignment.workloadPercentage,
        notes: existingAssignment.notes,
      } : undefined,
    });
  }
  
  return slots;
};

type Step = 1 | 2;

// Team Member Selection Card
const TeamMemberCard = ({
  member,
  isSelected,
  onSelect,
  isDisabled,
  disableReason,
  availableCapacity,
}: {
  member: TeamMember;
  isSelected: boolean;
  onSelect: () => void;
  isDisabled?: boolean;
  disableReason?: string;
  availableCapacity: number;
}) => {
  const matchBadge = getMatchBadge(member.matchScore);
  const statusInfo = getCapacityStatus(availableCapacity);
  const isCapacityZero = availableCapacity <= 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isDisabled || isCapacityZero}
      title={isCapacityZero ? "No available capacity" : disableReason}
      className={cn(
        "w-full p-4 rounded-lg border text-left transition-all",
        isSelected
          ? "border-primary ring-2 ring-primary/20 bg-primary/5"
          : "border-[hsl(var(--wq-border))] hover:border-primary/50 bg-background",
        (isDisabled || isCapacityZero) && "opacity-50 cursor-not-allowed bg-muted"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0",
              isSelected ? "bg-primary border-primary" : "border-[hsl(var(--wq-border))] bg-background"
            )}
          >
            {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
          </div>
          <div>
            <div className="font-semibold text-primary">{member.name}</div>
            <div className="text-sm text-muted-foreground">{member.role}</div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-sm text-muted-foreground">
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
          Location
        </span>
        <span className={cn(
          "flex items-center gap-1",
          member.expertiseMatch ? "text-[hsl(var(--wq-status-completed-text))]" : "text-muted-foreground"
        )}>
          <CheckCircle2 className={cn(
            "w-4 h-4",
            member.expertiseMatch ? "text-[hsl(var(--wq-status-completed-text))]" : "text-muted-foreground"
          )} />
          Expertise
        </span>
        <span className={cn("flex items-center gap-1", statusInfo.colorClass)}>
          {isCapacityZero ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          Capacity
        </span>
      </div>

      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <span>
          <span className="font-medium">Location:</span> {member.location}
        </span>
        <span>
          <span className="font-medium">Expertise:</span> {member.expertise.slice(0, 3).join(", ")}
        </span>
        <span className="flex items-center gap-1">
          <span className="font-medium">Available:</span>
          <Badge 
            variant="outline" 
            className={cn("text-xs font-semibold", statusInfo.colorClass, statusInfo.bgClass, statusInfo.borderClass)}
          >
            {formatAvailableCapacity(availableCapacity)}
          </Badge>
        </span>
      </div>
      {disableReason && isDisabled && !isCapacityZero && (
        <p className="text-xs text-destructive mt-2">{disableReason}</p>
      )}
      {isCapacityZero && (
        <p className="text-xs text-destructive mt-2">No available capacity</p>
      )}
    </button>
  );
};

// Chair Selection Card
const ChairCard = ({
  chair,
  isSelected,
  onSelect,
  isDisabled,
  disableReason,
}: {
  chair: ChairSlot;
  isSelected: boolean;
  onSelect: () => void;
  isDisabled?: boolean;
  disableReason?: string;
}) => {
  const isAssigned = !!chair.assignedTo;
  
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isDisabled || isAssigned}
      title={isAssigned ? `Assigned to ${chair.assignedTo?.memberName}` : disableReason}
      className={cn(
        "w-full px-4 py-3 rounded-lg border text-left transition-all flex items-center justify-between",
        isSelected
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background border-[hsl(var(--wq-border))] hover:border-primary/50 hover:bg-muted/30",
        (isDisabled || isAssigned) && "opacity-50 cursor-not-allowed bg-muted"
      )}
    >
      <div className="flex items-center gap-3">
        <div>
          <span className="font-medium">{chair.label}</span>
          {chair.isRequired && !isAssigned && (
            <span className={cn(
              "text-xs ml-2",
              isSelected ? "text-primary-foreground/80" : "text-destructive"
            )}>
              (Required)
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge 
          variant="outline" 
          className={cn(
            "text-xs",
            chair.type === 'Primary' 
              ? isSelected ? "border-primary-foreground/50 text-primary-foreground" : "bg-blue-50 text-blue-700 border-blue-200"
              : isSelected ? "border-primary-foreground/50 text-primary-foreground" : "bg-muted text-muted-foreground border-border"
          )}
        >
          {chair.type}
        </Badge>
        {isAssigned && (
          <Badge variant="secondary" className="text-xs">
            {chair.assignedTo?.memberName}
          </Badge>
        )}
        {isSelected && <Check className="w-4 h-4" />}
      </div>
    </button>
  );
};

// Role List Item with status
const RoleListItem = ({
  role,
  isCompleted,
  assignmentCount,
  requiredCount,
  onClick,
  isDisabled,
}: {
  role: RoleDefinition;
  isCompleted: boolean;
  assignmentCount: number;
  requiredCount: number;
  onClick: () => void;
  isDisabled?: boolean;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "flex items-center justify-between p-4 rounded-lg border-2 transition-all text-left group w-full",
        isCompleted 
          ? "border-[hsl(var(--wq-status-completed-text))] bg-[hsl(var(--wq-status-completed-bg))]"
          : "border-border hover:border-primary hover:bg-primary/5",
        isDisabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          isCompleted 
            ? "bg-[hsl(var(--wq-status-completed-text))]"
            : "bg-primary/10"
        )}>
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
          ) : (
            <Briefcase className="h-5 w-5 text-primary" />
          )}
        </div>
        <div>
          <p className={cn(
            "font-medium transition-colors",
            isCompleted 
              ? "text-[hsl(var(--wq-status-completed-text))]"
              : "group-hover:text-primary"
          )}>
            {role.roleName}
          </p>
          {role.teamName && (
            <p className="text-sm text-muted-foreground">{role.teamName}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge 
          variant="outline" 
          className={cn(
            "text-xs",
            isCompleted 
              ? "bg-[hsl(var(--wq-status-completed-bg))] text-[hsl(var(--wq-status-completed-text))] border-[hsl(var(--wq-status-completed-text))]"
              : assignmentCount > 0 
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-muted text-muted-foreground border-border"
          )}
        >
          {assignmentCount}/{assignmentCount > 1 ? 10 : requiredCount} Assigned
        </Badge>
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-[hsl(var(--wq-status-completed-text))]" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        )}
      </div>
    </button>
  );
};

export const ConsolidatedAssignmentFlowV2 = ({
  availableRoles,
  existingAssignments = [],
  onComplete,
  onCancel,
  isReadOnly = false,
}: ConsolidatedAssignmentFlowV2Props) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);
  
  // Current in-progress assignment (not yet saved)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [selectedChair, setSelectedChair] = useState<ChairSlot | null>(null);
  const [workloadPercentage, setWorkloadPercentage] = useState<number>(CAPACITY_CONFIG.DEFAULT_ASSIGNMENT_WORKLOAD);
  const [notes, setNotes] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Get role's associated team
  const getTeamForRole = (role: RoleDefinition): string | undefined => {
    return role.teamName;
  };

  // Calculate available capacity for a member considering existing assignments
  const getMemberAvailableCapacity = (member: TeamMember): number => {
    const existingWorkload = existingAssignments
      .filter(a => a.selectedPerson?.id === member.id)
      .reduce((sum, a) => sum + (a.workloadPercentage || 0), 0);
    
    return calculateAvailableCapacity(member, existingWorkload);
  };

  // Get members already assigned to this role for this client
  const getMembersAssignedToRole = (): Set<string> => {
    const ids = new Set<string>();
    existingAssignments
      .filter(a => a.roleId === selectedRole?.roleId && a.selectedPerson)
      .forEach(a => ids.add(a.selectedPerson!.id));
    return ids;
  };

  // Chair slots for the selected role
  const chairSlots = useMemo(() => {
    if (!selectedRole) return [];
    return generateChairSlots(existingAssignments, selectedRole.roleId);
  }, [selectedRole, existingAssignments]);

  // Filter and sort team members based on role's team
  const eligibleMembers = useMemo(() => {
    if (!selectedRole) return [];
    
    const roleTeamName = getTeamForRole(selectedRole);
    const assignedMemberIds = getMembersAssignedToRole();
    
    // Get team members - filter by team if specified
    let members = teamMembers.filter(m => !m.isManager);
    
    // Filter by role's associated team (match by expertise/qualifiers if team name matches)
    if (roleTeamName) {
      const team = teamsData.find(t => t.name === roleTeamName);
      if (team) {
        members = members.filter(m => 
          m.expertise.some(exp => 
            team.qualifiers.some(q => 
              exp.toLowerCase().includes(q.toLowerCase()) || 
              q.toLowerCase().includes(exp.toLowerCase())
            )
          )
        );
      }
    }
    
    // Apply search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      members = members.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.role.toLowerCase().includes(query) ||
        m.location.toLowerCase().includes(query) ||
        m.expertise.some(e => e.toLowerCase().includes(query))
      );
    }
    
    // Sort by available capacity (highest to lowest)
    members = members.sort((a, b) => {
      const capA = getMemberAvailableCapacity(a);
      const capB = getMemberAvailableCapacity(b);
      return capB - capA;
    });
    
    // Map with disabled status
    const membersWithStatus = members.map(m => {
      const availableCapacity = getMemberAvailableCapacity(m);
      const isAlreadyAssigned = assignedMemberIds.has(m.id);
      
      return {
        member: m,
        availableCapacity,
        isDisabled: isAlreadyAssigned,
        disableReason: isAlreadyAssigned 
          ? "Already assigned to a chair in this role for this client" 
          : availableCapacity <= 0
            ? "No available capacity"
            : undefined
      };
    });
    
    if (!showAll && !debouncedSearch) {
      return membersWithStatus.slice(0, 6);
    }
    
    return membersWithStatus;
  }, [debouncedSearch, showAll, existingAssignments, selectedRole]);

  // Role status tracking
  const getRoleStatus = (role: RoleDefinition) => {
    const roleAssignments = existingAssignments.filter(a => a.roleId === role.roleId);
    const hasPrimaryChair = roleAssignments.some(a => a.chairType === 'Primary');
    return {
      assignmentCount: roleAssignments.length,
      isCompleted: hasPrimaryChair,
      requiredCount: 1, // Only Primary Chair is required
    };
  };

  const handleRoleSelect = (role: RoleDefinition) => {
    if (isReadOnly) return;
    setSelectedRole(role);
    resetAssignmentState();
    setCurrentStep(2);
  };

  const resetAssignmentState = () => {
    setSelectedMember(null);
    setSelectedChair(null);
    setWorkloadPercentage(CAPACITY_CONFIG.DEFAULT_ASSIGNMENT_WORKLOAD);
    setNotes("");
    setValidationError(null);
    setSearchQuery("");
    setShowAll(false);
  };

  const handleMemberSelect = (member: TeamMember) => {
    if (isReadOnly) return;
    setSelectedMember(member);
    setValidationError(null);
  };

  const handleChairSelect = (chair: ChairSlot) => {
    if (isReadOnly || chair.assignedTo) return;
    setSelectedChair(chair);
    setValidationError(null);
  };

  const handleCompleteAssignment = () => {
    if (!selectedRole || !selectedMember || !selectedChair) return;
    
    // Validation: workload must be > 0
    if (workloadPercentage <= 0) {
      setValidationError("Workload must be greater than 0%");
      return;
    }
    
    // Validation: workload cannot exceed available capacity
    const availableCapacity = getMemberAvailableCapacity(selectedMember);
    if (workloadPercentage > availableCapacity) {
      setValidationError(`Workload cannot exceed available capacity (${formatAvailableCapacity(availableCapacity)})`);
      return;
    }

    // Create the assignment
    const newAssignment: AssignmentData = {
      roleId: selectedRole.roleId,
      roleName: selectedRole.roleName,
      teamName: selectedRole.teamName,
      selectedPerson: selectedMember,
      chairType: selectedChair.type,
      workloadPercentage,
      notes: notes ? `${selectedChair.label}: ${notes}` : `Chair ${selectedChair.index + 1}`,
    };

    // Persist assignment immediately
    onComplete([newAssignment]);

    // Return to role list
    setCurrentStep(1);
    setSelectedRole(null);
    resetAssignmentState();
  };

  const handleBackToRoleList = () => {
    if (selectedMember || selectedChair) {
      setShowExitConfirm(true);
    } else {
      setCurrentStep(1);
      setSelectedRole(null);
      resetAssignmentState();
    }
  };

  const handleCancel = () => {
    if (selectedMember || selectedChair) {
      setShowExitConfirm(true);
    } else {
      onCancel?.();
    }
  };

  // Check if current configuration is valid for completing
  const canCompleteAssignment = selectedMember && selectedChair && workloadPercentage > 0 && !validationError;

  // Check if all required roles are completed
  const allRolesCompleted = availableRoles.every(role => getRoleStatus(role).isCompleted);

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary">Role Assignment</h3>
          <p className="text-sm text-muted-foreground">
            {currentStep === 1 
              ? "Select a role to assign team members" 
              : `Assigning: ${selectedRole?.roleName}`}
          </p>
        </div>
        {onCancel && !isReadOnly && (
          <Button variant="outline" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
        )}
      </div>

      {/* Step Content */}
      <Card className="border-2">
        <CardContent className="p-6">
          {/* Step 1: Role List */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium mb-1">Select a Role</h4>
                  <p className="text-sm text-muted-foreground">
                    Choose a role to assign team members. Repeat for each role.
                  </p>
                </div>
                {allRolesCompleted && (
                  <Badge className="bg-[hsl(var(--wq-status-completed-bg))] text-[hsl(var(--wq-status-completed-text))] border-[hsl(var(--wq-status-completed-text))]">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    All Roles Assigned
                  </Badge>
                )}
              </div>

              <div className="grid gap-2">
                {availableRoles.map((role) => {
                  const status = getRoleStatus(role);
                  return (
                    <RoleListItem
                      key={role.roleId}
                      role={role}
                      isCompleted={status.isCompleted}
                      assignmentCount={status.assignmentCount}
                      requiredCount={status.requiredCount}
                      onClick={() => handleRoleSelect(role)}
                      isDisabled={isReadOnly}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Select Team Member, Chair, and Configure */}
          {currentStep === 2 && selectedRole && (
            <div className="space-y-6">
              {/* Header with breadcrumb */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <button 
                      onClick={handleBackToRoleList}
                      className="hover:text-primary transition-colors"
                    >
                      Roles
                    </button>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-primary font-medium">{selectedRole.roleName}</span>
                  </div>
                  <h4 className="font-medium">Assign Team Member to Chair</h4>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleBackToRoleList}
                >
                  Back to Roles
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Left: Team Member Selection */}
                <div className="space-y-4">
                  <h5 className="text-sm font-medium text-foreground">1. Select Team Member</h5>
                  
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, role, location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Team info */}
                  {selectedRole.teamName && (
                    <p className="text-xs text-muted-foreground">
                      Showing members from: <span className="font-medium">{selectedRole.teamName}</span>
                    </p>
                  )}

                  {/* Team Member Cards */}
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {eligibleMembers.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No team members found
                      </p>
                    ) : (
                      eligibleMembers.map(({ member, availableCapacity, isDisabled, disableReason }) => (
                        <TeamMemberCard
                          key={member.id}
                          member={member}
                          isSelected={selectedMember?.id === member.id}
                          onSelect={() => handleMemberSelect(member)}
                          isDisabled={isDisabled || isReadOnly}
                          disableReason={disableReason}
                          availableCapacity={availableCapacity}
                        />
                      ))
                    )}
                  </div>

                  {/* Show More Button */}
                  {!showAll && !debouncedSearch && eligibleMembers.length >= 6 && (
                    <Button
                      variant="link"
                      onClick={() => setShowAll(true)}
                      className="text-primary font-semibold w-full"
                    >
                      Show All Members
                    </Button>
                  )}
                </div>

                {/* Right: Chair Selection & Configuration */}
                <div className="space-y-4">
                  {selectedMember ? (
                    <>
                      {/* Selected Member Summary */}
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium text-foreground">2. Configure Assignment</h5>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMember(null)}
                          className="h-8 px-2 text-muted-foreground"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="p-3 bg-muted/30 rounded-lg flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-primary">{selectedMember.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Available: {formatAvailableCapacity(getMemberAvailableCapacity(selectedMember))}
                          </p>
                        </div>
                      </div>

                      {/* Chair Selection - All chairs in one list */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Select Chair</label>
                        <div className="space-y-2">
                          {chairSlots.map((chair) => (
                            <ChairCard
                              key={chair.id}
                              chair={chair}
                              isSelected={selectedChair?.id === chair.id}
                              onSelect={() => handleChairSelect(chair)}
                              isDisabled={isReadOnly}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Workload Input */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Workload %</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            step={0.5}
                            value={workloadPercentage}
                            onChange={(e) => {
                              setWorkloadPercentage(parseFloat(e.target.value) || 0);
                              setValidationError(null);
                            }}
                            onFocus={(e) => e.target.select()}
                            disabled={isReadOnly}
                            className="w-28 bg-background"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      </div>

                      {/* Notes (Optional) */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Notes (optional)</label>
                        <Textarea
                          placeholder="Add any notes for this assignment..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          disabled={isReadOnly}
                          className="bg-background min-h-[60px]"
                        />
                      </div>

                      {/* Validation Error */}
                      {validationError && (
                        <div className="flex items-center gap-2 text-destructive text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {validationError}
                        </div>
                      )}

                      {/* Complete Assignment Button */}
                      <Button
                        onClick={handleCompleteAssignment}
                        disabled={!canCompleteAssignment || isReadOnly}
                        className="w-full bg-[hsl(var(--wq-status-completed-text))] hover:bg-[hsl(var(--wq-status-completed-text))]/90"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Complete Assignment
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm py-12">
                      <User className="w-12 h-12 mb-4 opacity-30" />
                      <p>Select a team member to configure assignment</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Unsaved Changes
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have an in-progress assignment that will be lost if you exit. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowExitConfirm(false);
                setCurrentStep(1);
                setSelectedRole(null);
                resetAssignmentState();
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Discard & Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ConsolidatedAssignmentFlowV2;
