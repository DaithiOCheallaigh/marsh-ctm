import { useState, useMemo } from "react";
import { Check, ChevronRight, User, Briefcase, CheckCircle2, AlertCircle, Search, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { RoleDefinition, AssignmentData, getMatchBadge } from "./types";
import { TeamMember } from "@/data/teamMembers";
import { useDebounce } from "@/hooks/useDebounce";
import { CAPACITY_CONFIG, calculateAvailableCapacity, getCapacityStatus, formatAvailableCapacity } from "@/utils/capacityManagement";
import { useTeamAssignments } from "@/context/TeamAssignmentsContext";
import { rolesData, RoleChair } from "@/data/roles";
interface ConsolidatedAssignmentFlowV2Props {
  availableRoles: RoleDefinition[];
  existingAssignments?: AssignmentData[];
  onComplete: (assignments: AssignmentData[]) => void;
  onCancel?: () => void;
  isReadOnly?: boolean;
}

// Pending assignment in the "shopping cart"
interface PendingAssignment {
  id: string;
  member: EligibleMember;
  chair: RoleChair;
  workloadPercentage: number;
  notes?: string;
}

// Local interface for eligible members in this component
interface EligibleMember {
  id: string;
  name: string;
  role: string;
  location: string;
  expertise: string[];
  capacity: number;
  matchScore: number;
  locationMatch: boolean;
  expertiseMatch: boolean;
}
type Step = 1 | 2 | 3;
const StepIndicator = ({
  stepNumber,
  label,
  icon: Icon,
  isActive,
  isCompleted,
  onClick
}: {
  stepNumber: number;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  isCompleted: boolean;
  onClick?: () => void;
}) => {
  const canClick = isCompleted && onClick;
  return <button type="button" onClick={canClick ? onClick : undefined} disabled={!canClick} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-left", isActive && "bg-primary/10 border-2 border-primary", isCompleted && !isActive && "bg-[hsl(var(--wq-status-completed-bg))] border border-[hsl(var(--wq-status-completed-text))] cursor-pointer hover:opacity-90", !isActive && !isCompleted && "bg-muted/50 border border-transparent opacity-60")}>
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors", isActive && "bg-primary text-primary-foreground", isCompleted && "bg-[hsl(var(--wq-status-completed-text))] text-white", !isActive && !isCompleted && "bg-muted-foreground/30 text-muted-foreground")}>
        {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate", isActive && "text-primary", isCompleted && "text-[hsl(var(--wq-status-completed-text))]", !isActive && !isCompleted && "text-muted-foreground")}>
          {label}
        </p>
      </div>
      <Icon className={cn("h-4 w-4 flex-shrink-0", isActive && "text-primary", isCompleted && "text-[hsl(var(--wq-status-completed-text))]", !isActive && !isCompleted && "text-muted-foreground/50")} />
    </button>;
};

// Team Member Selection Card - uses TeamAssignments data
const TeamMemberCard = ({
  member,
  isSelected,
  onSelect,
  isDisabled,
  disableReason,
  availableCapacity
}: {
  member: EligibleMember;
  isSelected: boolean;
  onSelect: () => void;
  isDisabled?: boolean;
  disableReason?: string;
  availableCapacity: number;
}) => {
  const matchBadge = getMatchBadge(member.matchScore || 0);
  const statusInfo = getCapacityStatus(availableCapacity);
  const isCapacityZero = availableCapacity <= 0;
  return <button type="button" onClick={onSelect} disabled={isDisabled} title={disableReason} className={cn("w-full p-4 rounded-lg border text-left transition-all bg-white", isSelected ? "border-primary ring-2 ring-primary/20" : "border-[hsl(var(--wq-border))] hover:border-primary/50", isDisabled && "opacity-50 cursor-not-allowed", isCapacityZero && !isDisabled && "bg-gray-50")}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-semibold text-primary">{member.name}</div>
          <div className="text-sm text-[hsl(var(--wq-text-secondary))]">{member.role}</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-sm text-[hsl(var(--wq-text-secondary))]">
            Match Score: <span className="font-semibold text-primary">{member.matchScore || 0}</span>
          </div>
          {matchBadge.label && <Badge className={cn("text-xs mt-1", matchBadge.className)}>
              {matchBadge.label}
            </Badge>}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3 text-sm">
        <span className={cn("flex items-center gap-1", member.locationMatch ? "text-[hsl(var(--wq-status-completed-text))]" : "text-muted-foreground")}>
          <CheckCircle2 className={cn("w-4 h-4", member.locationMatch ? "text-[hsl(var(--wq-status-completed-text))]" : "text-muted-foreground")} />
          Location
        </span>
        <span className={cn("flex items-center gap-1", member.expertiseMatch ? "text-[hsl(var(--wq-status-completed-text))]" : "text-muted-foreground")}>
          <CheckCircle2 className={cn("w-4 h-4", member.expertiseMatch ? "text-[hsl(var(--wq-status-completed-text))]" : "text-muted-foreground")} />
          Expertise
        </span>
        <span className={cn("flex items-center gap-1", statusInfo.colorClass)}>
          {isCapacityZero ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          Capacity
        </span>
      </div>

      <div className="flex items-center gap-6 text-sm text-[hsl(var(--wq-text-secondary))]">
        <span>
          <span className="font-medium">Location:</span> {member.location}
        </span>
        <span>
          <span className="font-medium">Expertise:</span> {member.expertise?.slice(0, 3).join(", ") || 'N/A'}
        </span>
        <span className="flex items-center gap-1">
          <span className="font-medium">Available:</span>
          <Badge variant="outline" className={cn("text-xs font-semibold", statusInfo.colorClass, statusInfo.bgClass, statusInfo.borderClass)}>
            {formatAvailableCapacity(availableCapacity)}
          </Badge>
        </span>
      </div>
      {disableReason && isDisabled && <p className="text-xs text-destructive mt-2">{disableReason}</p>}
    </button>;
};

// Chair Selection Card
const ChairCard = ({
  chair,
  isSelected,
  onSelect,
  isDisabled,
  disableReason
}: {
  chair: RoleChair;
  isSelected: boolean;
  onSelect: () => void;
  isDisabled?: boolean;
  disableReason?: string;
}) => {
  return <button type="button" onClick={onSelect} disabled={isDisabled} title={disableReason} className={cn("w-full px-4 py-3 rounded-lg border text-left transition-all flex items-center justify-between", isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-background border-[hsl(var(--wq-border))] hover:border-primary/50 hover:bg-[hsl(var(--wq-bg-muted))]", isDisabled && "opacity-50 cursor-not-allowed bg-gray-100")}>
      <div className="flex items-center gap-3">
        <div>
          <span className="font-medium">{chair.name}</span>
          <p className={cn("text-xs", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")}>
            {chair.description}
          </p>
        </div>
      </div>
      {isSelected && <Check className="w-4 h-4" />}
    </button>;
};

// Pending Assignment Card (shopping cart item)
const PendingAssignmentCard = ({
  assignment,
  onRemove,
  isReadOnly
}: {
  assignment: PendingAssignment;
  onRemove: () => void;
  isReadOnly?: boolean;
}) => {
  return <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="font-medium text-primary">{assignment.member.name}</p>
          <p className="text-xs text-muted-foreground">
            {assignment.chair.name} • {assignment.workloadPercentage}%
          </p>
          {assignment.notes && <p className="text-xs text-muted-foreground italic mt-1 truncate max-w-[200px]">
              Note: {assignment.notes}
            </p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!isReadOnly && <Button variant="ghost" size="sm" onClick={onRemove} className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </Button>}
      </div>
    </div>;
};
export const ConsolidatedAssignmentFlowV2 = ({
  availableRoles,
  existingAssignments = [],
  onComplete,
  onCancel,
  isReadOnly = false
}: ConsolidatedAssignmentFlowV2Props) => {
  const {
    teams: assignmentTeams
  } = useTeamAssignments();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);

  // Shopping cart: accumulate assignments before saving
  const [pendingAssignments, setPendingAssignments] = useState<PendingAssignment[]>([]);

  // Current assignment being configured
  const [selectedMember, setSelectedMember] = useState<EligibleMember | null>(null);
  const [selectedChair, setSelectedChair] = useState<RoleChair | null>(null);
  const [workloadPercentage, setWorkloadPercentage] = useState<number>(CAPACITY_CONFIG.DEFAULT_ASSIGNMENT_WORKLOAD);
  const [notes, setNotes] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Get team members from TeamAssignments context (My Team Assignment)
  const teamAssignmentMembers = useMemo((): EligibleMember[] => {
    const allMembers: EligibleMember[] = [];
    assignmentTeams.forEach(team => {
      team.members.forEach(member => {
        // Calculate available capacity from client assignments
        const totalWorkload = member.clientAssignments?.reduce((sum, a) => sum + (a.workload || 0), 0) || 0;
        const availableCapacity = Math.max(0, 100 - totalWorkload);
        allMembers.push({
          id: member.id,
          name: `${member.firstName} ${member.lastName}`,
          role: member.title,
          location: member.location,
          expertise: member.expertise || [],
          capacity: availableCapacity,
          matchScore: Math.floor(Math.random() * 30) + 70,
          // Simulated match score
          locationMatch: true,
          expertiseMatch: member.expertise?.length > 0
        });
      });
    });
    return allMembers;
  }, [assignmentTeams]);

  // Get chairs for the selected role from roles data
  const roleChairs = useMemo((): RoleChair[] => {
    if (!selectedRole) return [];

    // Find the role in our roles data
    const roleData = rolesData.find(r => r.name.toLowerCase().includes(selectedRole.roleName.toLowerCase()) || selectedRole.roleName.toLowerCase().includes(r.name.toLowerCase()) || r.id === selectedRole.roleId);
    if (roleData && roleData.chairs) {
      return roleData.chairs;
    }

    // Fallback: return generic chairs if role not found
    return [{
      id: 'chair-1',
      name: 'Primary Lead',
      description: 'Main responsibility holder',
      typicalWorkload: '30-40%',
      type: 'primary' as const,
      isRequired: true
    }, {
      id: 'chair-2',
      name: 'Secondary Support',
      description: 'Supporting role',
      typicalWorkload: '20-30%',
      type: 'secondary' as const,
      isRequired: false
    }];
  }, [selectedRole]);

  // Get chairs that are already assigned (from existing assignments for this role)
  const getAssignedChairIds = (): Set<string> => {
    const ids = new Set<string>();

    // From existing completed assignments
    existingAssignments.filter(a => a.roleId === selectedRole?.roleId).forEach(a => {
      if (a.notes) {
        // Try to extract chair id from notes or match by name
        const matchingChair = roleChairs.find(c => a.notes?.includes(c.name));
        if (matchingChair) ids.add(matchingChair.id);
      }
    });

    // From pending assignments
    pendingAssignments.forEach(p => ids.add(p.chair.id));
    return ids;
  };

  // Get members already assigned to this role (for duplicate prevention)
  const getAssignedMemberIds = (): Set<string> => {
    const ids = new Set<string>();

    // From existing completed assignments for this role
    existingAssignments.filter(a => a.roleId === selectedRole?.roleId && a.selectedPerson).forEach(a => ids.add(a.selectedPerson!.id));

    // From pending assignments
    pendingAssignments.forEach(p => ids.add(p.member.id));
    return ids;
  };

  // Calculate available capacity for a member considering pending assignments
  const getMemberAvailableCapacity = (member: EligibleMember): number => {
    // Base workload from existing assignments across all work items
    const existingWorkload = existingAssignments.filter(a => a.selectedPerson?.id === member.id).reduce((sum, a) => sum + (a.workloadPercentage || 0), 0);

    // Pending workload for this member in shopping cart
    const pendingWorkload = pendingAssignments.filter(p => p.member.id === member.id).reduce((sum, p) => sum + p.workloadPercentage, 0);

    // Calculate based on member's capacity field
    const baseCapacity = member.capacity || 100;
    return Math.max(0, baseCapacity - existingWorkload - pendingWorkload);
  };

  // Filter and sort team members from My Team Assignment
  const eligibleMembers = useMemo(() => {
    const assignedMemberIds = getAssignedMemberIds();

    // Use team members from TeamAssignments context and filter out already assigned ones
    let members = teamAssignmentMembers.filter(m => !assignedMemberIds.has(m.id));

    // Apply search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      members = members.filter(m => m.name.toLowerCase().includes(query) || m.role.toLowerCase().includes(query) || m.location.toLowerCase().includes(query) || m.expertise?.some(e => e.toLowerCase().includes(query)));
    }

    // Sort by available capacity (highest to lowest)
    members = members.sort((a, b) => {
      const capA = getMemberAvailableCapacity(a);
      const capB = getMemberAvailableCapacity(b);
      return capB - capA;
    });

    // Map with capacity info
    const membersWithStatus = members.map(m => ({
      member: m,
      availableCapacity: getMemberAvailableCapacity(m),
      isDisabled: getMemberAvailableCapacity(m) <= 0,
      disableReason: getMemberAvailableCapacity(m) <= 0 ? "No available capacity" : undefined
    }));
    if (!showAll && !debouncedSearch) {
      return membersWithStatus.slice(0, 6);
    }
    return membersWithStatus;
  }, [debouncedSearch, showAll, pendingAssignments, existingAssignments, selectedRole, teamAssignmentMembers]);

  // Get all available chairs for the role (filter out assigned ones)
  const availableChairs = useMemo(() => {
    const assignedChairIds = getAssignedChairIds();
    return roleChairs.filter(chair => !assignedChairIds.has(chair.id));
  }, [roleChairs, pendingAssignments, existingAssignments, selectedRole]);

  // Filter to show only roles from work item configuration (availableRoles prop)
  const workItemRoles = useMemo(() => {
    return availableRoles;
  }, [availableRoles]);
  const handleRoleSelect = (role: RoleDefinition) => {
    if (isReadOnly) return;
    setSelectedRole(role);
    setPendingAssignments([]);
    setCurrentStep(2);
  };
  const handleMemberSelect = (member: EligibleMember) => {
    if (isReadOnly) return;
    setSelectedMember(member);
    setSelectedChair(null);
    setWorkloadPercentage(CAPACITY_CONFIG.DEFAULT_ASSIGNMENT_WORKLOAD);
    setNotes("");
    setValidationError(null);
  };
  const handleChairSelect = (chair: RoleChair) => {
    if (isReadOnly) return;
    setSelectedChair(chair);
    setValidationError(null);
  };
  const handleAddToCart = () => {
    if (!selectedMember || !selectedChair) return;

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
    const newAssignment: PendingAssignment = {
      id: `pending-${Date.now()}`,
      member: selectedMember,
      chair: selectedChair,
      workloadPercentage,
      notes: notes || undefined
    };
    setPendingAssignments(prev => [...prev, newAssignment]);

    // Reset for next assignment
    setSelectedMember(null);
    setSelectedChair(null);
    setWorkloadPercentage(CAPACITY_CONFIG.DEFAULT_ASSIGNMENT_WORKLOAD);
    setNotes("");
    setValidationError(null);
  };
  const handleRemoveFromCart = (assignmentId: string) => {
    setPendingAssignments(prev => prev.filter(p => p.id !== assignmentId));
  };
  const handleProceedToReview = () => {
    if (pendingAssignments.length === 0) return;
    setCurrentStep(3);
  };
  const handleCompleteAssignment = () => {
    if (!selectedRole || pendingAssignments.length === 0) return;

    // Convert pending assignments to AssignmentData format
    const completedAssignments: AssignmentData[] = pendingAssignments.map(p => ({
      roleId: selectedRole.roleId,
      roleName: selectedRole.roleName,
      teamName: selectedRole.teamName,
      selectedPerson: p.member,
      chairType: 'Primary',
      // Unified - no type segregation
      workloadPercentage: p.workloadPercentage,
      notes: `${p.chair.name}${p.notes ? ` - ${p.notes}` : ''}`
    }));
    onComplete(completedAssignments);

    // Reset everything
    setCurrentStep(1);
    setSelectedRole(null);
    setPendingAssignments([]);
    setSelectedMember(null);
    setSelectedChair(null);
    setWorkloadPercentage(CAPACITY_CONFIG.DEFAULT_ASSIGNMENT_WORKLOAD);
    setNotes("");
    setSearchQuery("");
    setShowAll(false);
  };
  const handleCancel = () => {
    if (pendingAssignments.length > 0) {
      setShowExitConfirm(true);
    } else {
      onCancel?.();
    }
  };
  const goToStep = (step: Step) => {
    if (step < currentStep) {
      setCurrentStep(step);
      if (step === 1) {
        setSearchQuery("");
        setShowAll(false);
        setSelectedMember(null);
        setSelectedChair(null);
      }
    }
  };
  const steps = [{
    number: 1,
    label: "Select Role",
    icon: Briefcase
  }, {
    number: 2,
    label: "Select Member & Chair",
    icon: User
  }, {
    number: 3,
    label: "Review & Complete",
    icon: CheckCircle2
  }];

  // Check if current configuration is valid for adding
  const canAddToCart = selectedMember && selectedChair && workloadPercentage > 0 && !validationError;
  return <div className="space-y-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary">Role Assignment</h3>
          <p className="text-sm text-muted-foreground">
            Step {currentStep} of 3 — {steps[currentStep - 1].label}
          </p>
        </div>
        {onCancel && !isReadOnly && <Button variant="outline" size="sm" onClick={handleCancel}>
            Cancel
          </Button>}
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-3 gap-2">
        {steps.map(step => <StepIndicator key={step.number} stepNumber={step.number} label={step.label} icon={step.icon} isActive={currentStep === step.number} isCompleted={currentStep > step.number} onClick={currentStep > step.number ? () => goToStep(step.number as Step) : undefined} />)}
      </div>

      {/* Step Content */}
      <Card className="border-2">
        <CardContent className="p-6">
          {/* Step 1: Select Role */}
          {currentStep === 1 && <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Select a Role</h4>
                <p className="text-sm text-muted-foreground">
                  Choose a role to assign team members to.
                </p>
              </div>

              {workItemRoles.length === 0 ? <div className="py-8 text-center">
                  <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                  <p className="text-lg font-medium text-foreground">No roles configured</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    No roles were selected during work item creation. Please edit the work item to add roles.
                  </p>
                </div> : <div className="grid gap-2">
                  {workItemRoles.map(role => {
              // Get configured chair count for this role
              const roleData = rolesData.find(r => r.name.toLowerCase().includes(role.roleName.toLowerCase()) || role.roleName.toLowerCase().includes(r.name.toLowerCase()) || r.id === role.roleId);
              const configuredChairCount = role.chairCount || roleData?.chairs?.length || 1;

              // Count existing assignments for this role
              const assignedCount = existingAssignments.filter(a => a.roleId === role.roleId).length;

              // Determine completion state
              const isFullyCompleted = assignedCount >= configuredChairCount;
              const isPartiallyCompleted = assignedCount > 0 && assignedCount < configuredChairCount;
              return <button key={role.roleId} type="button" onClick={() => handleRoleSelect(role)} disabled={isReadOnly} className={cn("flex items-center justify-between p-4 rounded-lg border-2 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed", isFullyCompleted ? "border-[hsl(var(--wq-status-completed-text))] bg-[hsl(var(--wq-status-completed-bg))]" : isPartiallyCompleted ? "border-gray-300 bg-gray-50" : "border-border hover:border-primary hover:bg-primary/5")}>
                        <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", isFullyCompleted ? "bg-[hsl(var(--wq-status-completed-text))]" : isPartiallyCompleted ? "bg-gray-400" : "bg-primary/10")}>
                            {isFullyCompleted ? <Check className="h-5 w-5 text-white" /> : isPartiallyCompleted ? <AlertCircle className="h-5 w-5 text-white" /> : <Briefcase className="h-5 w-5 text-primary" />}
                          </div>
                          <div>
                            <p className={cn("font-medium transition-colors", isFullyCompleted ? "text-[hsl(var(--wq-status-completed-text))]" : isPartiallyCompleted ? "text-gray-700" : "group-hover:text-primary")}>
                              {role.roleName}
                            </p>
                            {role.description && <p className="text-sm text-muted-foreground">{role.description}</p>}
                            <div className="flex items-center gap-2 mt-1">
                              {role.teamName && <Badge variant="secondary" className="text-xs">
                                  {role.teamName}
                                </Badge>}
                              {isFullyCompleted ? <Badge className="text-xs bg-[hsl(var(--wq-status-completed-text))] text-white">
                                  <Check className="w-3 h-3 mr-1" />
                                  Fully Assigned ({assignedCount}/{configuredChairCount})
                                </Badge> : isPartiallyCompleted ? <Badge className="text-xs bg-gray-100 text-gray-700 border-gray-300">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Partial ({assignedCount}/{configuredChairCount})
                                </Badge> : <Badge variant="outline" className="text-xs">
                                  {configuredChairCount} chair{configuredChairCount !== 1 ? 's' : ''}
                                </Badge>}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className={cn("h-5 w-5 transition-colors", isFullyCompleted ? "text-[hsl(var(--wq-status-completed-text))]" : isPartiallyCompleted ? "text-gray-600" : "text-muted-foreground group-hover:text-primary")} />
                      </button>;
            })}
                </div>}
            </div>}

          {/* Step 2: Select Team Member & Chair (Shopping Cart behavior) */}
          {currentStep === 2 && selectedRole && (() => {
          // Calculate remaining chairs to assign
          const configuredChairCount = selectedRole.chairCount || roleChairs.length || 1;
          const existingRoleAssignments = existingAssignments.filter(a => a.roleId === selectedRole.roleId).length;
          const totalAssigned = existingRoleAssignments + pendingAssignments.length;
          const remainingChairs = Math.max(0, configuredChairCount - totalAssigned);
          return <div className="space-y-6">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {selectedRole.roleName}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                      {remainingChairs} of {configuredChairCount} chair{configuredChairCount !== 1 ? 's' : ''} remaining
                    </Badge>
                    {pendingAssignments.length > 0 && <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                        {pendingAssignments.length} pending
                      </Badge>}
                  </div>
                  <h4 className="font-medium">Assign Team Members to Chairs</h4>
                  <p className="text-sm text-muted-foreground">
                    Add multiple assignments as required.
                  </p>
                </div>

                {/* Pending Assignments (Shopping Cart) */}
                {pendingAssignments.length > 0 && <div className="space-y-2">
                    <h5 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      
                      Pending Assignments ({pendingAssignments.length})
                    </h5>
                    <div className="space-y-2">
                      {pendingAssignments.map(assignment => <PendingAssignmentCard key={assignment.id} assignment={assignment} onRemove={() => handleRemoveFromCart(assignment.id)} isReadOnly={isReadOnly} />)}
                    </div>
                  </div>}

                {/* Add New Assignment Section */}
                <div className="border-t pt-6">
                  <div className="grid grid-cols-2 gap-6 items-start">
                    {/* Left: Team Member Selection - Single Container */}
                    <div className="border border-border rounded-lg bg-muted/30 p-4 space-y-3">
                      <h6 className="text-sm font-medium text-foreground">Select Team Member</h6>
                      
                      {/* Empty State for Team Members */}
                      {teamAssignmentMembers.length === 0 ? <div className="py-8 text-center">
                          <User className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                          <p className="text-sm font-medium text-foreground">No team members configured</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Configure team members in "My Team Assignment" settings.
                          </p>
                        </div> : <>
                          {/* Search Bar */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Search by name, role, location..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 bg-background" />
                          </div>

                          {/* Team Member Cards */}
                          <div className={cn("space-y-2 pr-1", !showAll && "max-h-[520px] overflow-y-auto")}>
                            {eligibleMembers.length === 0 ? <div className="py-6 text-center">
                                <p className="text-sm text-muted-foreground">
                                  {debouncedSearch ? "No members match your search" : "All team members have been assigned"}
                                </p>
                              </div> : eligibleMembers.map(({
                        member,
                        availableCapacity,
                        isDisabled,
                        disableReason
                      }) => <TeamMemberCard key={member.id} member={member} isSelected={selectedMember?.id === member.id} onSelect={() => handleMemberSelect(member)} isDisabled={isDisabled || isReadOnly} disableReason={disableReason} availableCapacity={availableCapacity} />)}
                          </div>

                          {/* Show More Button */}
                          {!showAll && !debouncedSearch && teamAssignmentMembers.length > 6 && <Button variant="link" onClick={() => setShowAll(true)} className="text-primary font-semibold w-full">
                              Show All Members
                            </Button>}
                        </>}
                    </div>

                    {/* Right: Chair & Configuration - Single Container */}
                    <div className="border border-border rounded-lg bg-muted/30 p-4 space-y-4">
                      {selectedMember ? <>
                          <div className="flex items-center justify-between">
                            <h6 className="text-sm font-medium text-foreground">Configure Assignment</h6>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedMember(null)} className="h-8 px-2 text-muted-foreground">
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Selected Member Summary with Workload */}
                          <div className="p-3 bg-background rounded-lg border border-border">
                            <div className="flex items-center justify-between gap-4">
                              {/* Left: Member Info */}
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <User className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium text-primary">{selectedMember.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    After assignment: {formatAvailableCapacity(Math.max(0, getMemberAvailableCapacity(selectedMember) - workloadPercentage))}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Right: Workload Input */}
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <label className="text-sm font-medium text-foreground">Workload</label>
                                <Input type="number" min={1} max={100} step={0.5} value={workloadPercentage} onChange={e => {
                            setWorkloadPercentage(parseFloat(e.target.value) || 0);
                            setValidationError(null);
                          }} onFocus={e => e.target.select()} disabled={isReadOnly} className="w-20 bg-background" />
                                <span className="text-sm text-muted-foreground">%</span>
                              </div>
                            </div>
                          </div>

                          {/* Chair Selection - All chairs in one list (no type segregation) */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Select Chair</label>
                            {availableChairs.length === 0 ? <div className="py-6 text-center border border-dashed border-border rounded-lg">
                                <p className="text-sm text-muted-foreground">All chairs have been assigned for this role</p>
                              </div> : <div className="space-y-2">
                                {availableChairs.map(chair => <ChairCard key={chair.id} chair={chair} isSelected={selectedChair?.id === chair.id} onSelect={() => handleChairSelect(chair)} isDisabled={isReadOnly} />)}
                              </div>}
                          </div>

                          {/* Notes (Optional) - Assignment Level */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Assignment Notes (optional)</label>
                            <Textarea placeholder="Add context, reasoning, or special instructions for this assignment..." value={notes} onChange={e => setNotes(e.target.value)} disabled={isReadOnly} className="bg-background min-h-[60px]" />
                          </div>

                          {/* Validation Error */}
                          {validationError && <div className="flex items-center gap-2 text-destructive text-sm">
                              <AlertCircle className="w-4 h-4" />
                              {validationError}
                            </div>}

                          {/* Add to Cart Button */}
                          <Button onClick={handleAddToCart} disabled={!canAddToCart || isReadOnly} className="w-full">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Assignment
                          </Button>
                        </> : <div className="flex flex-col items-center justify-center h-[520px] text-muted-foreground text-sm">
                          <User className="w-8 h-8 mb-2 opacity-50" />
                          <p>Select a team member to configure assignment</p>
                        </div>}
                    </div>
                  </div>
                </div>

                {/* Footer Actions - Remove Back button as per requirements */}
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleProceedToReview} disabled={isReadOnly || pendingAssignments.length === 0}>
                    Next: Review ({pendingAssignments.length})
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>;
        })()}

          {/* Step 3: Review & Complete */}
          {currentStep === 3 && selectedRole && <div className="space-y-6">
              <div>
                <h4 className="font-medium">Review & Complete</h4>
                <p className="text-sm text-muted-foreground">
                  Review all assignments before saving. Nothing is saved until you click "Complete Assignment".
                </p>
              </div>

              {/* Role Summary */}
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-primary">{selectedRole.roleName}</p>
                    <p className="text-sm text-muted-foreground">
                      {pendingAssignments.length} assignment{pendingAssignments.length > 1 ? 's' : ''} to be saved
                    </p>
                  </div>
                </div>

                {/* Assignment List */}
                <div className="space-y-3">
                  {pendingAssignments.map((assignment, index) => <div key={assignment.id} className="bg-white rounded-lg p-4 border border-[hsl(var(--wq-border))]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Assignment {index + 1}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Team Member:</span>
                          <p className="font-medium">{assignment.member.name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Chair:</span>
                          <p className="font-medium">{assignment.chair.name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Workload:</span>
                          <p className="font-medium">{assignment.workloadPercentage}%</p>
                        </div>
                        {assignment.notes && <div className="col-span-2">
                            <span className="text-muted-foreground">Notes:</span>
                            <p className="font-medium">{assignment.notes}</p>
                          </div>}
                      </div>
                    </div>)}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => goToStep(2)} disabled={isReadOnly}>
                  Back to Edit
                </Button>
                <Button onClick={handleCompleteAssignment} className="bg-[hsl(var(--wq-status-completed-text))] hover:bg-[hsl(var(--wq-status-completed-text))]/90" disabled={isReadOnly}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete Assignment
                </Button>
              </div>
            </div>}
        </CardContent>
      </Card>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Assignments</AlertDialogTitle>
            <AlertDialogDescription>
              You have {pendingAssignments.length} unsaved assignment{pendingAssignments.length > 1 ? 's' : ''} in your cart. 
              If you leave now, these assignments will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
            setShowExitConfirm(false);
            setPendingAssignments([]);
            setCurrentStep(1);
            setSelectedRole(null);
            onCancel?.();
          }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Discard & Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};