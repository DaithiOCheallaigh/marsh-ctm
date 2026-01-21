import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Clock, Lock } from "lucide-react";
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
import { TeamAccordion } from "@/components/work-item-detail/TeamAccordion";
import { TeamMember } from "@/data/teamMembers";
import { CHAIR_LABELS, MAX_CHAIRS } from "@/utils/chairLabels";
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

interface RoleAssignment {
  chairLabel: string;
  assignedMember?: TeamMember;
  assignmentNotes?: string;
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

const WorkItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { workItems, completeWorkItem } = useWorkItems();

  const [workItem, setWorkItem] = useState<WorkItem | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

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
      setWorkItem(found);
      if (teams.length === 0) {
        setTeams(buildTeamsFromWorkItem(found));
      }
    } else {
      navigate("/");
    }
  }, [id, workItems, navigate, buildTeamsFromWorkItem, teams.length]);

  // Calculate status based on due date
  const calculatedStatus = useMemo(() => {
    if (!workItem) return 'On Track';
    return getStatusFromDueDate(workItem.dueDate, workItem.status);
  }, [workItem]);

  // Check if work item is read-only (completed)
  const isReadOnly = workItem?.status === 'Completed' || workItem?.isReadOnly;

  // Get all currently assigned members across all teams/roles
  const getAllAssignedMembers = useCallback((): TeamMember[] => {
    return teams.flatMap((team) =>
      team.roles.flatMap((role) =>
        role.chairs
          .filter((chair) => chair.assignedMember)
          .map((chair) => chair.assignedMember!)
      )
    );
  }, [teams]);

  // Check if a member is already assigned to ANY role (including current role's other chairs)
  const isMemberAssignedElsewhere = useCallback(
    (member: TeamMember, currentRoleId: string): { isAssigned: boolean; roleName?: string } => {
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
    member: TeamMember,
    notes: string
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
                    ? { ...chair, assignedMember: member, assignmentNotes: notes }
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
      description: `${member.name} has been assigned to ${roleName}.`,
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

  const handleSaveForLater = () => {
    if (isReadOnly) return;
    setLastSavedAt(new Date());
    toast({
      title: "Draft Saved",
      description: "Your assignments have been saved as a draft.",
    });
  };

  const handleCompleteWorkItem = () => {
    const primaryAssigned = getPrimaryChairsAssigned();
    const totalRequired = getTotalRequired();
    
    if (primaryAssigned < totalRequired) {
      toast({
        title: "Cannot Complete",
        description: `Please assign all primary chairs before completing. Currently ${primaryAssigned} of ${totalRequired} primary roles assigned.`,
        variant: "destructive",
      });
      return;
    }
    
    setShowCompleteDialog(true);
  };

  const confirmComplete = () => {
    if (workItem) {
      completeWorkItem(workItem.id);
      toast({
        title: "Work Item Completed",
        description: "This work item is now complete and read-only.",
      });
      setShowCompleteDialog(false);
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

            {/* Assignment Requirements Section */}
            <div className="mt-6">
              <h3 className="text-primary font-bold text-base mb-4">
                Assignment Requirements
              </h3>
              <div className="space-y-4">
                {teams.map((team) => (
                  <TeamAccordion
                    key={team.teamId}
                    teamId={team.teamId}
                    teamName={team.teamName}
                    isPrimary={team.isPrimary}
                    roles={team.roles}
                    onAssign={(roleId, chairIndex, member, notes) =>
                      handleAssign(roleId, chairIndex, member, notes)
                    }
                    onUnassign={(roleId, chairIndex) => handleUnassign(roleId, chairIndex)}
                    expandedRoleId={expandedRoleId}
                    onToggleRole={handleToggleRole}
                    checkDuplicateAssignment={(member, roleId) =>
                      isMemberAssignedElsewhere(member, roleId)
                    }
                    isReadOnly={isReadOnly}
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-8 mb-8">
              {!isReadOnly && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveForLater}
                    className="px-6 py-2 border-primary text-primary hover:bg-primary/5 font-medium"
                  >
                    Save For Later
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCompleteWorkItem}
                    className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                    disabled={getPrimaryChairsAssigned() < getTotalRequired()}
                  >
                    Complete Work Item
                  </Button>
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
    </>
  );
};

export default WorkItemDetail;
