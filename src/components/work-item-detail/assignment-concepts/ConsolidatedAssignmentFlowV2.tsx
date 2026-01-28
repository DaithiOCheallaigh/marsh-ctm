import { useState, useMemo } from "react";
import { Check, ChevronRight, ChevronDown, User, Briefcase, CheckCircle2, AlertCircle, Search, AlertTriangle, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { RoleDefinition, AssignmentData, getMatchBadge } from "./types";
import { teamMembers, TeamMember } from "@/data/teamMembers";
import { useDebounce } from "@/hooks/useDebounce";
import { CAPACITY_CONFIG, calculateAvailableCapacity, getCapacityStatus, formatAvailableCapacity } from "@/utils/capacityManagement";
import { SAMPLE_CHAIRS, Chair } from "./chair-selection";
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
  member: TeamMember;
  chair: Chair;
  workloadPercentage: number;
  notes?: string;
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

// Team Member Selection Card
const TeamMemberCard = ({
  member,
  isSelected,
  onSelect,
  isDisabled,
  disableReason,
  availableCapacity
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
  return <button type="button" onClick={onSelect} disabled={isDisabled} title={disableReason} className={cn("w-full p-4 rounded-lg border text-left transition-all bg-white", isSelected ? "border-primary ring-2 ring-primary/20" : "border-[hsl(var(--wq-border))] hover:border-primary/50", isDisabled && "opacity-50 cursor-not-allowed", isCapacityZero && !isDisabled && "bg-gray-50")}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className={cn("w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0", isSelected ? "bg-primary border-primary" : "border-[hsl(var(--wq-border))] bg-white")}>
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
          <span className="font-medium">Expertise:</span> {member.expertise.slice(0, 3).join(", ")}
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
  chair: Chair;
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
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={cn("text-xs", chair.type === 'primary' ? isSelected ? "border-primary-foreground/50 text-primary-foreground" : "bg-blue-50 text-blue-700 border-blue-200" : isSelected ? "border-primary-foreground/50 text-primary-foreground" : "bg-gray-50 text-gray-600 border-gray-200")}>
          {chair.type === 'primary' ? 'Primary' : 'Secondary'}
        </Badge>
        {chair.assignedTo && <Badge variant="secondary" className="text-xs">
            Assigned: {chair.assignedTo}
          </Badge>}
        {isSelected && <Check className="w-4 h-4" />}
      </div>
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
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={cn("text-xs", assignment.chair.type === 'primary' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-600 border-gray-200")}>
          {assignment.chair.type === 'primary' ? 'Primary' : 'Secondary'}
        </Badge>
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
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);

  // Shopping cart: accumulate assignments before saving
  const [pendingAssignments, setPendingAssignments] = useState<PendingAssignment[]>([]);

  // Current assignment being configured
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [selectedChair, setSelectedChair] = useState<Chair | null>(null);
  const [workloadPercentage, setWorkloadPercentage] = useState<number>(CAPACITY_CONFIG.DEFAULT_ASSIGNMENT_WORKLOAD);
  const [notes, setNotes] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Get chairs that are already assigned (from existing assignments for this role)
  const getAssignedChairIds = (): Set<string> => {
    const ids = new Set<string>();

    // From existing completed assignments
    existingAssignments.filter(a => a.roleId === selectedRole?.roleId).forEach(a => {
      // Map chair name to chair id
      const chair = SAMPLE_CHAIRS.find(c => c.name === a.chairType || c.type === a.chairType.toLowerCase());
      if (chair) ids.add(chair.id);
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
  const getMemberAvailableCapacity = (member: TeamMember): number => {
    // Base workload from existing assignments across all work items
    const existingWorkload = existingAssignments.filter(a => a.selectedPerson?.id === member.id).reduce((sum, a) => sum + (a.workloadPercentage || 0), 0);

    // Pending workload for this member in shopping cart
    const pendingWorkload = pendingAssignments.filter(p => p.member.id === member.id).reduce((sum, p) => sum + p.workloadPercentage, 0);
    return calculateAvailableCapacity(member, existingWorkload + pendingWorkload);
  };

  // Filter and sort team members
  const eligibleMembers = useMemo(() => {
    const assignedMemberIds = getAssignedMemberIds();

    // Get all non-manager members
    let members = teamMembers.filter(m => !m.isManager);

    // Apply search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      members = members.filter(m => m.name.toLowerCase().includes(query) || m.role.toLowerCase().includes(query) || m.location.toLowerCase().includes(query) || m.expertise.some(e => e.toLowerCase().includes(query)));
    }

    // Sort by available capacity (highest to lowest) per Rule 2
    members = members.sort((a, b) => {
      const capA = getMemberAvailableCapacity(a);
      const capB = getMemberAvailableCapacity(b);
      return capB - capA;
    });

    // Map with disabled status
    const membersWithStatus = members.map(m => ({
      member: m,
      availableCapacity: getMemberAvailableCapacity(m),
      isDisabled: assignedMemberIds.has(m.id),
      disableReason: assignedMemberIds.has(m.id) ? "Already assigned to a chair in this role" : undefined
    }));
    if (!showAll && !debouncedSearch) {
      return membersWithStatus.slice(0, 6);
    }
    return membersWithStatus;
  }, [debouncedSearch, showAll, pendingAssignments, existingAssignments, selectedRole]);

  // Get all chairs for the role (not filtered by type) per Rule 3
  const allChairs = useMemo(() => {
    const assignedChairIds = getAssignedChairIds();
    return SAMPLE_CHAIRS.map(chair => ({
      chair,
      isDisabled: assignedChairIds.has(chair.id) || !!chair.assignedTo,
      disableReason: assignedChairIds.has(chair.id) ? "Already assigned in this role" : chair.assignedTo ? `Assigned to ${chair.assignedTo}` : undefined
    }));
  }, [pendingAssignments, existingAssignments, selectedRole]);

  // Get unassigned roles
  const unassignedRoles = useMemo(() => {
    // A role is unassigned if it has no existing assignments with a Primary chair
    // For simplicity, we'll show all roles that don't have existing assignments
    const assignedRoleIds = existingAssignments.map(a => a.roleId);
    return availableRoles.filter(r => !assignedRoleIds.includes(r.roleId));
  }, [availableRoles, existingAssignments]);
  const handleRoleSelect = (role: RoleDefinition) => {
    if (isReadOnly) return;
    setSelectedRole(role);
    setPendingAssignments([]);
    setCurrentStep(2);
  };
  const handleMemberSelect = (member: TeamMember) => {
    if (isReadOnly) return;
    setSelectedMember(member);
    setSelectedChair(null);
    setWorkloadPercentage(CAPACITY_CONFIG.DEFAULT_ASSIGNMENT_WORKLOAD);
    setNotes("");
    setValidationError(null);
  };
  const handleChairSelect = (chair: Chair) => {
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
      chairType: p.chair.type === 'primary' ? 'Primary' : 'Secondary',
      workloadPercentage: p.workloadPercentage,
      notes: p.notes
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

              {unassignedRoles.length === 0 ? <div className="py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-[hsl(var(--wq-status-completed-text))] mx-auto mb-3" />
                  <p className="text-lg font-medium text-[hsl(var(--wq-status-completed-text))]">All roles assigned!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Every role has been assigned to a team member.
                  </p>
                </div> : <div className="grid gap-2">
                  {unassignedRoles.map(role => <button key={role.roleId} type="button" onClick={() => handleRoleSelect(role)} disabled={isReadOnly} className="flex items-center justify-between p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium group-hover:text-primary transition-colors">
                            {role.roleName}
                          </p>
                          {role.description && <p className="text-sm text-muted-foreground">{role.description}</p>}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>)}
                </div>}
            </div>}

          {/* Step 2: Select Team Member & Chair (Shopping Cart behavior) */}
          {currentStep === 2 && selectedRole && <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs">
                    {selectedRole.roleName}
                  </Badge>
                  {pendingAssignments.length > 0 && <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                      {pendingAssignments.length} assignment{pendingAssignments.length > 1 ? 's' : ''} pending
                    </Badge>}
                </div>
                <h4 className="font-medium">Assign Team Members to Chairs</h4>
                <p className="text-sm text-muted-foreground">
                  Add multiple assignments. Click "Complete Assignment" when done.
                </p>
              </div>

              {/* Pending Assignments (Shopping Cart) */}
              {pendingAssignments.length > 0 && <div className="space-y-2">
                  <h5 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Plus className="w-4 h-4" />
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
                    
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Search by name, role, location..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 bg-background" />
                    </div>

                    {/* Team Member Cards */}
                    <div className={cn(
                      "space-y-2 pr-1",
                      !showAll && "max-h-[520px] overflow-y-auto"
                    )}>
                      {eligibleMembers.map(({
                        member,
                        availableCapacity,
                        isDisabled,
                        disableReason
                      }) => (
                        <TeamMemberCard 
                          key={member.id} 
                          member={member} 
                          isSelected={selectedMember?.id === member.id} 
                          onSelect={() => handleMemberSelect(member)} 
                          isDisabled={isDisabled || isReadOnly} 
                          disableReason={disableReason} 
                          availableCapacity={availableCapacity} 
                        />
                      ))}
                    </div>

                    {/* Show More Button */}
                    {!showAll && !debouncedSearch && teamMembers.filter(m => !m.isManager).length > 6 && (
                      <Button variant="link" onClick={() => setShowAll(true)} className="text-primary font-semibold w-full">
                        Show All Members
                      </Button>
                    )}
                  </div>

                  {/* Right: Chair & Configuration - Single Container */}
                  <div className="border border-border rounded-lg bg-muted/30 p-4 space-y-4">
                    {selectedMember ? (
                      <>
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
                                  Available: {formatAvailableCapacity(getMemberAvailableCapacity(selectedMember))}
                                </p>
                              </div>
                            </div>
                            
                            {/* Right: Workload Input */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <label className="text-sm font-medium text-foreground">Workload</label>
                              <Input 
                                type="number" 
                                min={1} 
                                max={100} 
                                step={0.5} 
                                value={workloadPercentage} 
                                onChange={e => {
                                  setWorkloadPercentage(parseFloat(e.target.value) || 0);
                                  setValidationError(null);
                                }} 
                                onFocus={e => e.target.select()} 
                                disabled={isReadOnly} 
                                className="w-20 bg-background" 
                              />
                              <span className="text-sm text-muted-foreground">%</span>
                            </div>
                          </div>
                        </div>

                        {/* Chair Selection - All chairs in one list */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Select Chair</label>
                          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                            {allChairs.map(({
                              chair,
                              isDisabled,
                              disableReason
                            }) => (
                              <ChairCard 
                                key={chair.id} 
                                chair={chair} 
                                isSelected={selectedChair?.id === chair.id} 
                                onSelect={() => handleChairSelect(chair)} 
                                isDisabled={isDisabled || isReadOnly} 
                                disableReason={disableReason} 
                              />
                            ))}
                          </div>
                        </div>

                        {/* Notes (Optional) - At Bottom */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Notes (optional)</label>
                          <Textarea 
                            placeholder="Add any notes for this assignment..." 
                            value={notes} 
                            onChange={e => setNotes(e.target.value)} 
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

                        {/* Add to Cart Button */}
                        <Button onClick={handleAddToCart} disabled={!canAddToCart || isReadOnly} className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Assignment
                        </Button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[520px] text-muted-foreground text-sm">
                        <User className="w-8 h-8 mb-2 opacity-50" />
                        <p>Select a team member to configure assignment</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => goToStep(1)} disabled={isReadOnly}>
                  Back
                </Button>
                <Button onClick={handleProceedToReview} disabled={isReadOnly || pendingAssignments.length === 0}>
                  Next: Review ({pendingAssignments.length})
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>}

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
                        <Badge variant="outline" className={cn("text-xs", assignment.chair.type === 'primary' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-600 border-gray-200")}>
                          {assignment.chair.type === 'primary' ? 'Primary' : 'Secondary'}
                        </Badge>
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
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Unsaved Assignments
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have {pendingAssignments.length} pending assignment{pendingAssignments.length > 1 ? 's' : ''} that will be lost if you exit. Are you sure you want to cancel?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
            setShowExitConfirm(false);
            onCancel?.();
          }} className="bg-destructive hover:bg-destructive/90">
              Discard & Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};
export default ConsolidatedAssignmentFlowV2;