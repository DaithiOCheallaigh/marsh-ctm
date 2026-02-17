import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Clock, Lock, AlertTriangle, MessageSquareText } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

import { useWorkItems, WorkItem } from "@/context/WorkItemsContext";
import { useToast } from "@/hooks/use-toast";
import { WorkTypeBadge } from "@/components/work-item-detail/WorkTypeBadge";
import { StatusIndicator, getStatusFromDueDate } from "@/components/work-item-detail/StatusIndicator";
import { PriorityBadge } from "@/components/PriorityBadge";
import { WorkDetailsCard } from "@/components/work-item-detail/WorkDetailsCard";
import { TeamMember, teamMembers } from "@/data/teamMembers";
import { CHAIR_LABELS, MAX_CHAIRS } from "@/utils/chairLabels";
import {
  SimplifiedAssignmentFlow,
  VerticalAssignmentFlow,
  ConsolidatedAssignmentFlow,
  ConsolidatedAssignmentFlowV2,
  AssignmentData,
  ConceptToggle,
  BulkAssignConcept,
  RoleFirstConcept,
  CommandCentreConcept,
} from "@/components/work-item-detail/assignment-concepts";
import type { ConceptView } from "@/components/work-item-detail/assignment-concepts";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Simplified person type for assignments
interface AssignedPerson {
  id: string;
  name: string;
  role?: string;
  location?: string;
}

interface RoleAssignment {
  chairLabel: string;
  assignedMember?: AssignedPerson;
  assignmentNotes?: string;
  workloadPercentage?: number;
}

interface TeamRoleState {
  roleId: string;
  roleName: string;
  chairs: RoleAssignment[];
  totalRoles: number;
}

interface TeamState {
  teamId: string;
  teamName: string;
  isPrimary: boolean;
  roles: TeamRoleState[];
}

interface MemberWorkloadMap {
  [memberId: string]: number;
}

const WorkItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { workItems, completeWorkItem, updateWorkItem, deleteWorkItem } = useWorkItems();

  const [workItem, setWorkItem] = useState<WorkItem | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showPartialCompleteDialog, setShowPartialCompleteDialog] = useState(false);
  const [partialJustification, setPartialJustification] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [conceptAssignments, setConceptAssignments] = useState<AssignmentData[]>([]);
  const [hasInitializedAssignments, setHasInitializedAssignments] = useState(false);
  const [assignmentView, setAssignmentView] = useState<"horizontal" | "vertical">("horizontal");
  const [assignmentOption, setAssignmentOption] = useState<"option1" | "option2">("option2");
  const [conceptView, setConceptView] = useState<ConceptView>("classic");

  // Team-based assignment state
  const [teams, setTeams] = useState<TeamState[]>([]);

  // Generate all 10 chairs for a role
  const generateAllChairs = useCallback((): RoleAssignment[] => {
    return CHAIR_LABELS.map((label) => ({
      chairLabel: label,
      assignedMember: undefined,
      assignmentNotes: undefined,
    }));
  }, []);

  // Build teams from work item
  const buildTeamsFromWorkItem = useCallback((item: WorkItem): TeamState[] => {
    const allChairs = generateAllChairs();
    
    if (!item.teams || item.teams.length === 0) {
      // Default teams for work items without teams
      return [
        {
          teamId: 'default-team',
          teamName: 'General Assignment',
          isPrimary: true,
          roles: [
            {
              roleId: 'role-account-exec',
              roleName: 'Account Executive',
              chairs: [...allChairs],
              totalRoles: MAX_CHAIRS,
            },
            {
              roleId: 'role-project-manager',
              roleName: 'Project Manager',
              chairs: [...allChairs],
              totalRoles: MAX_CHAIRS,
            },
            {
              roleId: 'role-risk-consultant',
              roleName: 'Risk Consultant',
              chairs: [...allChairs],
              totalRoles: MAX_CHAIRS,
            },
          ],
        },
      ];
    }

    // Build teams from work item teams configuration
    return item.teams.map((team) => ({
      teamId: team.teamId,
      teamName: team.teamName,
      isPrimary: team.isPrimary,
      roles: team.roles.map((role) => ({
        roleId: role.roleId,
        roleName: role.roleName,
        chairs: [...allChairs],
        totalRoles: MAX_CHAIRS,
      })),
    }));
  }, [generateAllChairs]);

  useEffect(() => {
    const found = workItems.find((item) => item.id === id);
    if (found) {
      // Redirect Leaver work items to the Leaver Workflow page
      if (found.workType === 'Leaver') {
        navigate(`/leaver-workflow/${found.id}`, { replace: true });
        return;
      }
      
      setWorkItem(found);
      if (teams.length === 0) {
        setTeams(buildTeamsFromWorkItem(found));
      }
      // Initialize assignments from saved data (only once)
      if (!hasInitializedAssignments && found.savedAssignments && found.savedAssignments.length > 0) {
        setConceptAssignments(found.savedAssignments as AssignmentData[]);
        setHasInitializedAssignments(true);
      }
    } else {
      navigate("/");
    }
  }, [id, workItems, navigate, buildTeamsFromWorkItem, teams.length, hasInitializedAssignments]);

  // Calculate status based on due date
  const calculatedStatus = useMemo(() => {
    if (!workItem) return 'On Track';
    return getStatusFromDueDate(workItem.dueDate, workItem.status);
  }, [workItem]);

  // Check if work item is read-only (completed)
  const isReadOnly = workItem?.status === 'Completed' || workItem?.isReadOnly;

  // Get all currently assigned members across all teams/roles
  const getAllAssignedMembers = useCallback((): AssignedPerson[] => {
    return teams.flatMap((team) =>
      team.roles.flatMap((role) =>
        role.chairs
          .filter((chair) => chair.assignedMember)
          .map((chair) => chair.assignedMember!)
      )
    );
  }, [teams]);

  // Calculate total workload for a team member (base workload from capacity + assignments in this work item)
  const getMemberTotalWorkload = useCallback((memberId: string): number => {
    // Get base workload from team member data (capacity = available, so workload = 100 - capacity)
    const member = teamMembers.find((m) => m.id === memberId);
    const baseWorkload = member ? (100 - member.capacity) : 0;
    
    // Add workload from assignments in this work item
    let assignmentWorkload = 0;
    for (const team of teams) {
      for (const role of team.roles) {
        for (const chair of role.chairs) {
          if (chair.assignedMember?.id === memberId && chair.workloadPercentage) {
            assignmentWorkload += chair.workloadPercentage;
          }
        }
      }
    }
    return baseWorkload + assignmentWorkload;
  }, [teams]);

  // Check if a member is already assigned to ANY role (including current role's other chairs)
  const isMemberAssignedElsewhere = useCallback(
    (member: AssignedPerson, currentRoleId: string): { isAssigned: boolean; roleName?: string } => {
      for (const team of teams) {
        for (const role of team.roles) {
          const foundChair = role.chairs.find(
            (chair) => chair.assignedMember?.id === member.id
          );
          if (foundChair) {
            return { isAssigned: true, roleName: `${team.teamName} - ${role.roleName}` };
          }
        }
      }
      return { isAssigned: false };
    },
    [teams]
  );

  const handleToggleRole = (roleId: string) => {
    if (isReadOnly) return;
    setExpandedRoleId((prev) => (prev === roleId ? null : roleId));
  };

  const handleAssign = (
    roleId: string,
    chairIndex: number,
    member: AssignedPerson,
    notes: string,
    workloadPercentage: number
  ) => {
    if (isReadOnly) return;

    // Check for duplicate assignment
    const duplicateCheck = isMemberAssignedElsewhere(member, roleId);
    if (duplicateCheck.isAssigned) {
      toast({
        title: "Warning: Duplicate Assignment",
        description: `${member.name} is already assigned to ${duplicateCheck.roleName}. Please remove them from that role first.`,
        variant: "destructive",
      });
      return;
    }

    setTeams((prev) => {
      return prev.map((team) => ({
        ...team,
        roles: team.roles.map((role) =>
          role.roleId === roleId
            ? {
                ...role,
                chairs: role.chairs.map((chair, idx) =>
                  idx === chairIndex
                    ? { ...chair, assignedMember: member, assignmentNotes: notes, workloadPercentage }
                    : chair
                ),
              }
            : role
        ),
      }));
    });

    // Collapse the current accordion after assignment
    setExpandedRoleId(null);

    // Find the role name for the toast
    const roleName = teams
      .flatMap((t) => t.roles)
      .find((r) => r.roleId === roleId)?.roleName || 'role';

    toast({
      title: "Member Assigned",
      description: `${member.name} has been assigned to ${roleName} with ${workloadPercentage}% workload.`,
    });
  };

  const handleUnassign = (roleId: string, chairIndex: number) => {
    if (isReadOnly) return;
    
    // Find the member name for the toast
    let memberName = '';
    let roleName = '';
    for (const team of teams) {
      for (const role of team.roles) {
        if (role.roleId === roleId) {
          memberName = role.chairs[chairIndex]?.assignedMember?.name || '';
          roleName = role.roleName;
          break;
        }
      }
    }
    
    setTeams((prev) => {
      return prev.map((team) => ({
        ...team,
        roles: team.roles.map((role) =>
          role.roleId === roleId
            ? {
                ...role,
                chairs: role.chairs.map((chair, idx) =>
                  idx === chairIndex
                    ? { ...chair, assignedMember: undefined, assignmentNotes: undefined }
                    : chair
                ),
              }
            : role
        ),
      }));
    });

    toast({
      title: "Member Unassigned",
      description: `${memberName} has been removed from ${roleName}.`,
    });
  };

  // Count total assigned chairs
  const getTotalAssigned = () => {
    return teams.reduce(
      (total, team) =>
        total +
        team.roles.reduce(
          (roleTotal, role) =>
            roleTotal + role.chairs.filter((c) => c.assignedMember).length,
          0
        ),
      0
    );
  };

  // Count primary chairs assigned (minimum requirement)
  const getPrimaryChairsAssigned = () => {
    return teams.reduce(
      (total, team) =>
        total + team.roles.filter((role) => role.chairs[0]?.assignedMember).length,
      0
    );
  };

  // Count total required (1 primary chair per role)
  const getTotalRequired = () => {
    return teams.reduce(
      (total, team) => total + team.roles.length,
      0
    );
  };

  // For display purposes
  const getTotalRoles = () => {
    return teams.reduce(
      (total, team) =>
        total + team.roles.reduce((roleTotal, role) => roleTotal + role.totalRoles, 0),
      0
    );
  };

  const handleCancel = () => {
    navigate("/");
  };

  // Check if any assignments have been made
  const hasAnyAssignments = () => {
    return conceptAssignments.length > 0 || getTotalAssigned() > 0;
  };

  // Check if all required roles are fully assigned
  const isFullyCompleted = () => {
    // Check chairs-based assignments
    const primaryAssigned = getPrimaryChairsAssigned();
    const totalRequired = getTotalRequired();
    if (primaryAssigned >= totalRequired) return true;

    // Also check concept assignments (used by the assignment flow)
    if (conceptAssignments.length > 0) {
      const allRoleIds = teams.flatMap(team => team.roles.map(role => role.roleId));
      const assignedRoleIds = conceptAssignments
        .filter(a => a.selectedPerson)
        .map(a => a.roleId);
      return allRoleIds.every(roleId => assignedRoleIds.includes(roleId));
    }

    return false;
  };

  // Delete is only enabled for new work items with zero assignments
  const canDelete = !hasAnyAssignments();

  // Complete is enabled after at least one assignment
  const canComplete = hasAnyAssignments();

  const handleCompleteWorkItem = () => {
    if (!canComplete) {
      toast({
        title: "Cannot Complete",
        description: "Please make at least one assignment before completing.",
        variant: "destructive",
      });
      return;
    }

    // Check if it's a partial completion
    if (!isFullyCompleted()) {
      setShowPartialCompleteDialog(true);
    } else {
      setShowCompleteDialog(true);
    }
  };

  const handlePartialComplete = () => {
    if (partialJustification.length < 10) {
      toast({
        title: "Justification Required",
        description: "Please provide a justification (minimum 10 characters) for partial completion.",
        variant: "destructive",
      });
      return;
    }

    if (partialJustification.length > 500) {
      toast({
        title: "Justification Too Long",
        description: "Please keep the justification under 500 characters.",
        variant: "destructive",
      });
      return;
    }

    if (workItem) {
      // Update with partial completion status
      updateWorkItem(workItem.id, {
        status: 'Completed', // UI shows as Completed
        backendStatus: 'Partially Completed', // Backend tracks partial
        partialCompletionJustification: partialJustification,
        isReadOnly: true,
      });
      
      toast({
        title: "Work Item Completed",
        description: "This work item has been marked as completed (partial).",
      });
      setShowPartialCompleteDialog(false);
      setPartialJustification("");
      navigate("/");
    }
  };

  const confirmComplete = () => {
    if (workItem) {
      updateWorkItem(workItem.id, {
        status: 'Completed',
        backendStatus: 'Completed',
        isReadOnly: true,
      });
      toast({
        title: "Work Item Completed",
        description: "This work item is now complete and read-only.",
      });
      setShowCompleteDialog(false);
      navigate("/");
    }
  };

  const handleDeleteWorkItem = () => {
    if (workItem && canDelete) {
      deleteWorkItem(workItem.id);
      toast({
        title: "Work Item Deleted",
        description: "The work item has been permanently removed from the work queue.",
      });
      setShowDeleteDialog(false);
      navigate("/");
    }
  };

  if (!workItem) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[hsl(var(--wq-bg-page))] flex flex-col">
        <div className="px-6 pt-6">
          <Header />
        </div>
        <div className="flex flex-1 px-6 pb-6 gap-6">
          <Sidebar />
          <main className="flex-1 ml-[280px] overflow-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm mb-2" aria-label="Breadcrumb">
              <Link
                to="/"
                className="text-[hsl(var(--wq-text-secondary))] hover:text-primary transition-colors"
              >
                Work Queue
              </Link>
              <span className="text-[hsl(var(--wq-text-secondary))]">&gt;</span>
              <span className="text-primary font-semibold">Work Details</span>
            </nav>

            {/* Read-only banner */}
            {isReadOnly && (
              <div className="mb-4 p-3 bg-[hsl(var(--wq-bg-muted))] border border-[hsl(var(--wq-border))] rounded-lg flex items-center gap-2">
                <Lock className="w-4 h-4 text-[hsl(var(--wq-text-secondary))]" />
                <span className="text-sm text-[hsl(var(--wq-text-secondary))]">
                  This work item is completed and read-only. No further edits are allowed.
                </span>
              </div>
            )}

            {/* Title bar with inline metadata */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-lg font-bold text-primary">
                  Work ID - {workItem.id} | {workItem.clientName}
                </h1>
                <div className="flex items-center gap-1.5">
                  <span className="text-[hsl(var(--wq-text-secondary))] text-sm">Work Type:</span>
                  <WorkTypeBadge workType={workItem.workType} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[hsl(var(--wq-text-secondary))] text-sm">Priority:</span>
                  <PriorityBadge priority={workItem.priority} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[hsl(var(--wq-bg-muted))] rounded-full">
                  <Clock className="w-4 h-4 text-[hsl(var(--wq-text-secondary))]" />
                  <span className="text-[hsl(var(--wq-text-secondary))] text-xs">
                    {lastSavedAt
                      ? `${format(lastSavedAt, "dd MMM yyyy HH:mm")} EST`
                      : `${format(new Date(), "dd MMM yyyy HH:mm")} EST`}
                  </span>
                </div>
                <StatusIndicator status={calculatedStatus} />
              </div>
            </div>

            {/* Work Details Card */}
            <WorkDetailsCard
              workItem={workItem}
              rolesAssigned={{ current: getPrimaryChairsAssigned(), total: getTotalRequired() }}
            />

            {/* Assignment Requirements Section - With View Toggle */}
            <div className="mt-6">
              {/* Partial Completion Justification Banner */}
              {workItem.backendStatus === 'Partially Completed' && workItem.partialCompletionJustification && (
                <div className="mb-4 p-4 bg-[hsl(var(--wq-status-warning-bg))] border border-[hsl(var(--wq-status-warning-border))] rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[hsl(var(--wq-status-warning-border)/0.2)] flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-[hsl(var(--wq-status-warning-text))]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-[hsl(var(--wq-status-warning-text))]">Partial Completion</h4>
                        <span className="text-xs text-[hsl(var(--wq-status-warning-text))] bg-[hsl(var(--wq-status-warning-border)/0.2)] px-2 py-0.5 rounded-full">
                          Not all roles assigned
                        </span>
                      </div>
                      <div className="flex items-start gap-2 mt-2">
                        <MessageSquareText className="w-4 h-4 text-[hsl(var(--wq-status-warning-text))] mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-[hsl(var(--wq-status-warning-text))]">{workItem.partialCompletionJustification}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Assignment Requirements Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary">Assignment Requirements</h3>
                {!isReadOnly && (
                  <ConceptToggle activeView={conceptView} onViewChange={setConceptView} />
                )}
              </div>

              {/* Assignment Flow based on concept view */}
              {conceptView === "classic" ? (
                // Classic View — existing Option 2 V2 flow
                assignmentOption === "option1" ? (
                  assignmentView === "horizontal" ? (
                    <SimplifiedAssignmentFlow
                      availableRoles={teams.flatMap(team =>
                        team.roles.map(role => ({
                          roleId: role.roleId,
                          roleName: role.roleName,
                          teamName: team.teamName,
                          description: `${team.teamName} - ${role.roleName}`,
                        }))
                      )}
                      existingAssignments={conceptAssignments}
                      onComplete={(assignment) => {
                        const updatedAssignments = [
                          ...conceptAssignments.filter(a => a.roleId !== assignment.roleId),
                          assignment
                        ];
                        setConceptAssignments(updatedAssignments);
                        if (assignment.selectedPerson) {
                          handleAssign(assignment.roleId, 0, assignment.selectedPerson, `${assignment.chairType} Chair`, assignment.workloadPercentage);
                        }
                        if (workItem) updateWorkItem(workItem.id, { savedAssignments: updatedAssignments });
                        setLastSavedAt(new Date());
                        toast({ title: "Progress Saved", description: `${assignment.roleName} assignment has been saved.` });
                      }}
                      isReadOnly={isReadOnly}
                    />
                  ) : (
                    <VerticalAssignmentFlow
                      availableRoles={teams.flatMap(team =>
                        team.roles.map(role => ({
                          roleId: role.roleId,
                          roleName: role.roleName,
                          teamName: team.teamName,
                          description: `${team.teamName} - ${role.roleName}`,
                        }))
                      )}
                      existingAssignments={conceptAssignments}
                      onComplete={(assignment) => {
                        const updatedAssignments = [
                          ...conceptAssignments.filter(a => a.roleId !== assignment.roleId),
                          assignment
                        ];
                        setConceptAssignments(updatedAssignments);
                        if (assignment.selectedPerson) {
                          handleAssign(assignment.roleId, 0, assignment.selectedPerson, `${assignment.chairType} Chair`, assignment.workloadPercentage);
                        }
                        if (workItem) updateWorkItem(workItem.id, { savedAssignments: updatedAssignments });
                        setLastSavedAt(new Date());
                        toast({ title: "Progress Saved", description: `${assignment.roleName} assignment has been saved.` });
                      }}
                      isReadOnly={isReadOnly}
                    />
                  )
                ) : (
                  <ConsolidatedAssignmentFlowV2
                    availableRoles={teams.flatMap(team =>
                      team.roles.map(role => ({
                        roleId: role.roleId,
                        roleName: role.roleName,
                        teamName: team.teamName,
                        description: `${team.teamName} - ${role.roleName}`,
                      }))
                    )}
                    existingAssignments={conceptAssignments}
                    onComplete={(assignments) => {
                      const updatedAssignments = [
                        ...conceptAssignments.filter(a => !assignments.some(newA => newA.roleId === a.roleId)),
                        ...assignments
                      ];
                      setConceptAssignments(updatedAssignments);
                      assignments.forEach((assignment, index) => {
                        if (assignment.selectedPerson) {
                          handleAssign(assignment.roleId, index, assignment.selectedPerson, assignment.notes || `${assignment.chairType} Chair`, assignment.workloadPercentage);
                        }
                      });
                      if (workItem) updateWorkItem(workItem.id, { savedAssignments: updatedAssignments });
                      setLastSavedAt(new Date());
                      toast({ title: "Assignments Saved", description: `${assignments.length} assignment${assignments.length > 1 ? 's' : ''} saved successfully.` });
                    }}
                    isReadOnly={isReadOnly}
                  />
                )
              ) : conceptView === "bulk-assign" ? (
                // Concept 1 — Bulk Assign (Member-First)
                <BulkAssignConcept
                  availableRoles={teams.flatMap(team =>
                    team.roles.map(role => ({
                      roleId: role.roleId,
                      roleName: role.roleName,
                      teamName: team.teamName,
                      description: `${team.teamName} - ${role.roleName}`,
                    }))
                  )}
                  existingAssignments={conceptAssignments}
                  onComplete={(assignments) => {
                    const updatedAssignments = [...conceptAssignments, ...assignments];
                    setConceptAssignments(updatedAssignments);
                    assignments.forEach((assignment, index) => {
                      if (assignment.selectedPerson) {
                        handleAssign(assignment.roleId, index, assignment.selectedPerson, assignment.notes || '', assignment.workloadPercentage);
                      }
                    });
                    if (workItem) updateWorkItem(workItem.id, { savedAssignments: updatedAssignments });
                    setLastSavedAt(new Date());
                    toast({ title: "Bulk Assignments Saved", description: `${assignments.length} assignment${assignments.length > 1 ? 's' : ''} saved.` });
                  }}
                  isReadOnly={isReadOnly}
                />
              ) : conceptView === "role-first" ? (
                // Concept 2 — Role-First Three-Column
                <RoleFirstConcept
                  availableRoles={teams.flatMap(team =>
                    team.roles.map(role => ({
                      roleId: role.roleId,
                      roleName: role.roleName,
                      teamName: team.teamName,
                      description: `${team.teamName} - ${role.roleName}`,
                    }))
                  )}
                  existingAssignments={conceptAssignments}
                  onComplete={(assignments) => {
                    const updatedAssignments = [...conceptAssignments, ...assignments];
                    setConceptAssignments(updatedAssignments);
                    assignments.forEach((assignment, index) => {
                      if (assignment.selectedPerson) {
                        handleAssign(assignment.roleId, index, assignment.selectedPerson, assignment.notes || '', assignment.workloadPercentage);
                      }
                    });
                    if (workItem) updateWorkItem(workItem.id, { savedAssignments: updatedAssignments });
                    setLastSavedAt(new Date());
                    toast({ title: "Role Assignments Saved", description: `${assignments.length} assignment${assignments.length > 1 ? 's' : ''} saved.` });
                  }}
                  isReadOnly={isReadOnly}
                />
              ) : (
                // Command Centre
                <CommandCentreConcept
                  availableRoles={teams.flatMap(team =>
                    team.roles.map(role => ({
                      roleId: role.roleId,
                      roleName: role.roleName,
                      teamName: team.teamName,
                      description: `${team.teamName} - ${role.roleName}`,
                    }))
                  )}
                  existingAssignments={conceptAssignments}
                  onComplete={(assignments) => {
                    const updatedAssignments = [...conceptAssignments, ...assignments];
                    setConceptAssignments(updatedAssignments);
                    assignments.forEach((assignment, index) => {
                      if (assignment.selectedPerson) {
                        handleAssign(assignment.roleId, index, assignment.selectedPerson, assignment.notes || '', assignment.workloadPercentage);
                      }
                    });
                    if (workItem) updateWorkItem(workItem.id, { savedAssignments: updatedAssignments });
                    setLastSavedAt(new Date());
                    toast({ title: "Command Centre Saved", description: `${assignments.length} assignment${assignments.length > 1 ? 's' : ''} saved.` });
                  }}
                  isReadOnly={isReadOnly}
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-8 mb-8">
              {!isReadOnly && (
                <>
                  {/* Left side - Delete button */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={!canDelete ? 'cursor-not-allowed' : ''}>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowDeleteDialog(true)}
                            disabled={!canDelete}
                            className="px-6 py-2 border-destructive text-destructive hover:bg-destructive/5 font-medium disabled:opacity-50 disabled:pointer-events-none"
                          >
                            Delete Work Item
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {!canDelete && (
                        <TooltipContent>
                          <p>Cannot delete work item with existing assignments</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>

                  {/* Right side - Cancel and Complete buttons */}
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className="px-6 py-2 border-primary text-primary hover:bg-primary/5 font-medium"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCompleteWorkItem}
                      className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                      disabled={!canComplete}
                    >
                      Complete Work Item
                    </Button>
                  </div>
                </>
              )}
              {isReadOnly && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="px-6 py-2 border-primary text-primary hover:bg-primary/5 font-medium"
                >
                  Back to Work Queue
                </Button>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Complete Confirmation Dialog */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Work Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to complete this work item? This action cannot be undone. 
              The work item will become read-only and no further edits will be allowed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmComplete}>
              Complete Work Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Partial Completion Dialog */}
      <AlertDialog open={showPartialCompleteDialog} onOpenChange={setShowPartialCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Partial Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Your assignment is partial. Not all roles have been filled. Do you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-foreground">Justification (required)</label>
            <textarea
              value={partialJustification}
              onChange={(e) => setPartialJustification(e.target.value)}
              placeholder="Please provide a reason for partial completion (10-500 characters)..."
              className="w-full mt-2 p-3 border border-input rounded-md text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {partialJustification.length}/500 characters
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPartialJustification("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePartialComplete}
              disabled={partialJustification.length < 10}
            >
              Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Work Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this work item? This action cannot be undone and will permanently remove the work item from the work queue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWorkItem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Work Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WorkItemDetail;
