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
import { RoleAssignmentAccordion } from "@/components/work-item-detail/RoleAssignmentAccordion";
import { TeamMember } from "@/data/teamMembers";
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

interface RoleConfig {
  title: string;
  chairs: RoleAssignment[];
  totalRoles: number;
}

const WorkItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { workItems, completeWorkItem } = useWorkItems();

  const [workItem, setWorkItem] = useState<WorkItem | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [expandedRoleIndex, setExpandedRoleIndex] = useState<number | null>(0);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  // Build roles from work item teams
  const buildRolesFromWorkItem = useCallback((item: WorkItem): RoleConfig[] => {
    if (!item.teams || item.teams.length === 0) {
      // Default roles for work items without teams
      return [
        {
          title: "Account Executive",
          chairs: [{ chairLabel: "Primary Chair 1" }],
          totalRoles: 1,
        },
        {
          title: "Project Manager",
          chairs: [{ chairLabel: "Primary Chair 1" }],
          totalRoles: 1,
        },
        {
          title: "Risk Consultant",
          chairs: [
            { chairLabel: "Primary Chair 1" },
            { chairLabel: "Primary Chair 2" },
          ],
          totalRoles: 2,
        },
      ];
    }

    // Build roles from teams configuration (simplified - no chair management in V1)
    const roles: RoleConfig[] = [];
    item.teams.forEach((team) => {
      team.roles.forEach((roleConfig) => {
        roles.push({
          title: `${team.teamName} (${roleConfig.roleName})`,
          chairs: [{ chairLabel: "Primary" }],
          totalRoles: 1,
        });
      });
    });
    return roles;
  }, []);

  // Role assignments state
  const [roles, setRoles] = useState<RoleConfig[]>([]);

  useEffect(() => {
    const found = workItems.find((item) => item.id === id);
    if (found) {
      setWorkItem(found);
      if (roles.length === 0) {
        setRoles(buildRolesFromWorkItem(found));
      }
    } else {
      navigate("/");
    }
  }, [id, workItems, navigate, buildRolesFromWorkItem, roles.length]);

  // Calculate status based on due date
  const calculatedStatus = useMemo(() => {
    if (!workItem) return 'On Track';
    return getStatusFromDueDate(workItem.dueDate, workItem.status);
  }, [workItem]);

  // Check if work item is read-only (completed)
  const isReadOnly = workItem?.status === 'Completed' || workItem?.isReadOnly;

  // Get all currently assigned members across all roles
  const getAllAssignedMembers = useCallback((): TeamMember[] => {
    return roles.flatMap((role) =>
      role.chairs
        .filter((chair) => chair.assignedMember)
        .map((chair) => chair.assignedMember!)
    );
  }, [roles]);

  // Check if a member is already assigned to another role
  const isMemberAssignedElsewhere = useCallback(
    (member: TeamMember, currentRoleIndex: number): { isAssigned: boolean; roleName?: string } => {
      for (let i = 0; i < roles.length; i++) {
        if (i === currentRoleIndex) continue;
        const foundChair = roles[i].chairs.find(
          (chair) => chair.assignedMember?.id === member.id
        );
        if (foundChair) {
          return { isAssigned: true, roleName: roles[i].title };
        }
      }
      return { isAssigned: false };
    },
    [roles]
  );

  const handleExpandRole = (roleIndex: number) => {
    if (isReadOnly) return;
    setExpandedRoleIndex((prev) => (prev === roleIndex ? null : roleIndex));
  };

  const handleAssign = (
    roleIndex: number,
    chairIndex: number,
    member: TeamMember,
    notes: string
  ) => {
    if (isReadOnly) return;

    // Check for duplicate assignment
    const duplicateCheck = isMemberAssignedElsewhere(member, roleIndex);
    if (duplicateCheck.isAssigned) {
      toast({
        title: "Warning: Duplicate Assignment",
        description: `${member.name} is already assigned to ${duplicateCheck.roleName}. Please remove them from that role first.`,
        variant: "destructive",
      });
      return;
    }

    setRoles((prev) => {
      const updated = [...prev];
      updated[roleIndex] = {
        ...updated[roleIndex],
        chairs: updated[roleIndex].chairs.map((chair, idx) =>
          idx === chairIndex
            ? { ...chair, assignedMember: member, assignmentNotes: notes }
            : chair
        ),
      };
      return updated;
    });

    // Collapse the current accordion after assignment
    setExpandedRoleIndex(null);

    toast({
      title: "Member Assigned",
      description: `${member.name} has been assigned to ${roles[roleIndex].title}.`,
    });
  };

  const handleUnassign = (roleIndex: number, chairIndex: number) => {
    if (isReadOnly) return;
    
    const memberName = roles[roleIndex].chairs[chairIndex].assignedMember?.name;
    
    setRoles((prev) => {
      const updated = [...prev];
      updated[roleIndex] = {
        ...updated[roleIndex],
        chairs: updated[roleIndex].chairs.map((chair, idx) =>
          idx === chairIndex
            ? { ...chair, assignedMember: undefined, assignmentNotes: undefined }
            : chair
        ),
      };
      return updated;
    });

    toast({
      title: "Member Unassigned",
      description: `${memberName} has been removed from ${roles[roleIndex].title}.`,
    });
  };

  const getTotalAssigned = () => {
    return roles.reduce(
      (total, role) =>
        total + role.chairs.filter((c) => c.assignedMember).length,
      0
    );
  };

  const getTotalRoles = () => {
    return roles.reduce((total, role) => total + role.totalRoles, 0);
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
    const totalAssigned = getTotalAssigned();
    const totalRoles = getTotalRoles();
    
    if (totalAssigned < totalRoles) {
      toast({
        title: "Cannot Complete",
        description: `Please assign all ${totalRoles} roles before completing. Currently ${totalAssigned} of ${totalRoles} assigned.`,
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
              rolesAssigned={{ current: getTotalAssigned(), total: getTotalRoles() }}
            />

            {/* My Assignments Section */}
            <div className="mt-6">
              <h3 className="text-primary font-bold text-base mb-4">
                My Assignments
              </h3>
              <div className="space-y-4">
                {roles.map((role, roleIndex) => (
                  <RoleAssignmentAccordion
                    key={role.title}
                    roleTitle={role.title}
                    rolesCount={{
                      current: role.chairs.filter((c) => c.assignedMember).length,
                      total: role.totalRoles,
                    }}
                    chairs={role.chairs}
                    onAssign={(chairIndex, member, notes) =>
                      handleAssign(roleIndex, chairIndex, member, notes)
                    }
                    onUnassign={(chairIndex) => handleUnassign(roleIndex, chairIndex)}
                    isExpanded={expandedRoleIndex === roleIndex && !isReadOnly}
                    onToggleExpand={() => handleExpandRole(roleIndex)}
                    roleIndex={roleIndex}
                    checkDuplicateAssignment={(member) => isMemberAssignedElsewhere(member, roleIndex)}
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
                    disabled={getTotalAssigned() < getTotalRoles()}
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
