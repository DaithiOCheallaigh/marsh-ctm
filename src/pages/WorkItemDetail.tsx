import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useWorkItems, WorkItem } from "@/context/WorkItemsContext";
import { useToast } from "@/hooks/use-toast";
import { WorkTypeBadge } from "@/components/work-item-detail/WorkTypeBadge";
import { StatusIndicator } from "@/components/work-item-detail/StatusIndicator";
import { PriorityBadge } from "@/components/PriorityBadge";
import { WorkDetailsCard } from "@/components/work-item-detail/WorkDetailsCard";
import { RoleAssignmentAccordion } from "@/components/work-item-detail/RoleAssignmentAccordion";
import { TeamMember } from "@/data/teamMembers";

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
  const { workItems } = useWorkItems();

  const [workItem, setWorkItem] = useState<WorkItem | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Role assignments state
  const [roles, setRoles] = useState<RoleConfig[]>([
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
      title: "Technical Lead",
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
  ]);

  useEffect(() => {
    const found = workItems.find((item) => item.id === id);
    if (found) {
      setWorkItem(found);
    } else {
      navigate("/");
    }
  }, [id, workItems, navigate]);

  const formatTimestamp = (date: Date) =>
    format(date, "dd MMM yyyy HH:mm") + " EST";

  const handleAssign = (
    roleIndex: number,
    chairIndex: number,
    member: TeamMember,
    notes: string
  ) => {
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

    toast({
      title: "Member Assigned",
      description: `${member.name} has been assigned to ${roles[roleIndex].title}.`,
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
    setLastSavedAt(new Date());
    toast({
      title: "Draft Saved",
      description: "Your assignments have been saved as a draft.",
    });
  };

  const handleConfirmAssignments = () => {
    toast({
      title: "Assignments Confirmed",
      description: "All role assignments have been confirmed.",
    });
    navigate("/");
  };

  if (!workItem) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-6 pt-6">
        <Header />
      </div>
      <div className="flex flex-1 px-6 pb-6 gap-6">
        <Sidebar />
        <main className="flex-1 ml-[280px] overflow-auto">
          {/* Breadcrumb and Header */}
          <div className="flex items-center justify-between mb-4">
            <nav
              className="flex items-center gap-2 text-sm"
              aria-label="Breadcrumb"
            >
              <Link
                to="/"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Work Queue
              </Link>
              <span className="text-muted-foreground">&gt;</span>
              <span className="text-primary font-medium">Work Details</span>
            </nav>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-[hsl(0,0%,91%)] rounded-lg">
                <Clock className="w-4 h-4 text-[hsl(0,0%,25%)]" />
                <span className="text-[hsl(0,0%,25%)] text-xs font-medium">
                  {lastSavedAt
                    ? `Last saved: ${formatTimestamp(lastSavedAt)}`
                    : formatTimestamp(new Date())}
                </span>
              </div>
              <StatusIndicator status="On Track" />
            </div>
          </div>

          {/* Title bar */}
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-xl font-bold text-[hsl(220,100%,24%)]">
              Work ID - {workItem.id} | {workItem.clientName}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[hsl(0,0%,45%)] text-sm">Work Type:</span>
              <WorkTypeBadge workType={workItem.workType} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[hsl(0,0%,45%)] text-sm">Priority:</span>
              <PriorityBadge priority={workItem.priority} />
            </div>
          </div>

          {/* Work Details Card */}
          <WorkDetailsCard
            workItem={workItem}
            rolesAssigned={{ current: getTotalAssigned(), total: getTotalRoles() }}
          />

          {/* My Assignments Section */}
          <div className="mt-6">
            <h3 className="text-[hsl(220,100%,24%)] font-bold text-base mb-4">
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
                  defaultExpanded={roleIndex === 0}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 mb-8">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveForLater}
              className="px-8 border-primary text-primary hover:bg-primary/5"
            >
              Save For Later
            </Button>
            <Button
              type="button"
              onClick={handleConfirmAssignments}
              className="px-8 bg-primary hover:bg-primary/90 text-white"
            >
              Confirm Assignments
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WorkItemDetail;
