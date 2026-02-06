import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Clock, ChevronDown, Lock, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PriorityBadge } from "@/components/PriorityBadge";
import { useWorkItems } from "@/context/WorkItemsContext";
import {
  leaverClients,
  Reassignment,
} from "@/data/leaverClients";
import { teamMembers } from "@/data/teamMembers";
import {
  CompleteReassignmentModal,
  UnsavedChangesModal,
  CancelWorkItemModal,
} from "@/components/leaver-workflow";
import { LeaverAssignmentPanelV2 } from "@/components/leaver-workflow/LeaverAssignmentPanelV2";
import { EnhancedReassignmentsTable } from "@/components/leaver-workflow/EnhancedReassignmentsTable";

// Mock client data with capacity
const clientsWithCapacity = leaverClients.map((client, index) => ({
  ...client,
  capacityRequirement: index % 2 === 0 ? 1.0 : 0.5,
}));

const LeaverWorkflow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const { workItems, completeWorkItem, cancelWorkItem, updateWorkItem } = useWorkItems();

  // Find the work item from context
  const workItem = workItems.find((item) => item.id === id);

  // Section visibility
  const [workDetailsOpen, setWorkDetailsOpen] = useState(true);
  const [assignmentDetailsOpen, setAssignmentDetailsOpen] = useState(true);

  // Assignment state (V2: panel handles member/client selection internally)
  const [reassignments, setReassignments] = useState<Reassignment[]>(
    () => workItem?.leaverReassignments ?? []
  );
  const [assignedClientIds, setAssignedClientIds] = useState<string[]>(
    () => workItem?.leaverReassignments?.map(r => r.clientId) ?? []
  );

  // Modal state
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Calculate totals
  const totalCapacity = useMemo(() => {
    return clientsWithCapacity.reduce((sum, c) => sum + (c.capacityRequirement || 1), 0);
  }, []);

  // Redirect if work item not found or not a Leaver type
  useEffect(() => {
    if (!workItem) {
      navigate("/", { replace: true });
    } else if (workItem.workType !== "Leaver") {
      navigate(`/work-item/${id}`, { replace: true });
    }
  }, [workItem, id, navigate]);

  const isReadOnly = workItem?.status === "Completed" || workItem?.status === "Cancelled";
  const isCancelled = workItem?.status === "Cancelled";

  // Derive leaver's teamId from teamMembers data
  const leaverTeamId = useMemo(() => {
    const leaverMember = teamMembers.find(
      (m) => m.name === workItem?.clientName
    );
    return leaverMember?.teamId || "team_001";
  }, [workItem?.clientName]);

  // V2: Handle assignment from the new panel
  const handleV2Assign = useCallback(
    (
      member: { id: string; name: string; role: string; location: string },
      clientIds: string[]
    ) => {
      const clientsToAssign = clientsWithCapacity.filter((c) =>
        clientIds.includes(c.id)
      );

      const newReassignments: Reassignment[] = clientsToAssign.map((client) => ({
        id: `r_${Date.now()}_${client.id}`,
        clientId: client.id,
        clientName: client.name,
        industry: client.industry,
        reassignedToId: member.id,
        reassignedToName: member.name,
        role: member.role,
        location: member.location,
      }));

      setReassignments((prev) => [...prev, ...newReassignments]);
      setAssignedClientIds((prev) => [...prev, ...clientIds]);

      toast({
        title: "Clients Assigned",
        description: `${clientsToAssign.length} client(s) locked to ${member.name}.`,
      });
    },
    [toast]
  );

  // Handle remove reassignment from table (trash icon on locked pairs)
  const handleRemoveReassignment = useCallback(
    (reassignmentId: string) => {
      const reassignment = reassignments.find((r) => r.id === reassignmentId);
      if (!reassignment) return;

      setReassignments((prev) => prev.filter((r) => r.id !== reassignmentId));
      setAssignedClientIds((prev) =>
        prev.filter((id) => id !== reassignment.clientId)
      );

      toast({
        title: "Reassignment Removed",
        description: `${reassignment.clientName} has been removed from reassignments.`,
      });
    },
    [reassignments, toast]
  );

  // Validate all clients are assigned
  const allClientsAssigned = assignedClientIds.length === clientsWithCapacity.length;
  const remainingClients = clientsWithCapacity.length - assignedClientIds.length;

  // Handle complete
  const handleComplete = () => {
    if (reassignments.length === 0) {
      toast({
        title: "No Reassignments",
        description: "Please make at least one reassignment before completing.",
        variant: "destructive",
      });
      return;
    }

    if (!allClientsAssigned) {
      toast({
        title: "Incomplete Reassignments",
        description: `All roles must be reassigned before completing. ${remainingClients} clients still need assignment.`,
        variant: "destructive",
      });
      return;
    }

    setShowCompleteModal(true);
  };

  const confirmComplete = () => {
    setShowCompleteModal(false);

    // Save reassignments and mark work item as completed
    if (id) {
      updateWorkItem(id, {
        leaverReassignments: reassignments.map(r => {
          const client = clientsWithCapacity.find(c => c.id === r.clientId);
          return {
            ...r,
            capacityRequirement: client?.capacityRequirement || 1.0,
          };
        }),
      });
      completeWorkItem(id);
    }

    toast({
      title: "Reassignments Completed",
      description: "All client reassignments have been finalized.",
    });
    navigate("/");
  };

  // Handle exit
  const handleExit = () => {
    if (reassignments.length > 0 && !isReadOnly) {
      setShowUnsavedModal(true);
    } else {
      navigate("/");
    }
  };

  const handleSaveAndExit = () => {
    setShowUnsavedModal(false);
    toast({
      title: "Reassignments Saved",
      description: "Your reassignments have been saved as draft.",
    });
    navigate("/");
  };

  const handleExitWithoutSaving = () => {
    setShowUnsavedModal(false);
    navigate("/");
  };

  // Handle cancel work item
  const handleCancelWorkItem = (notes: string) => {
    if (id) {
      cancelWorkItem(id, notes);
    }
    setShowCancelModal(false);
    toast({
      title: "Work Item Cancelled",
      description: "The work item has been cancelled.",
    });
    navigate("/");
  };

  // Handle breadcrumb click
  const handleBreadcrumbClick = (e: React.MouseEvent) => {
    if (reassignments.length > 0 && !isReadOnly) {
      e.preventDefault();
      setShowUnsavedModal(true);
    }
  };

  // Don't render until we have a valid work item
  if (!workItem || workItem.workType !== "Leaver") {
    return null;
  }

  // Derive leaver-specific display values from WorkItem
  const leaverName = workItem.clientName;
  const email = `${leaverName.toLowerCase().replace(/\s+/g, "")}@marsh.com`;
  const leaverLocation = workItem.location || "Not specified";

  // Count unique team members affected
  const teamMembersAffected = new Set(reassignments.map((r) => r.reassignedToId)).size;

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
            <nav
              className="flex items-center gap-1.5 text-sm mb-2"
              aria-label="Breadcrumb"
            >
              <Link
                to="/"
                onClick={handleBreadcrumbClick}
                className="text-[hsl(var(--wq-text-secondary))] hover:text-primary transition-colors"
              >
                Work Queue
              </Link>
              <span className="text-[hsl(var(--wq-text-secondary))]">&gt;</span>
              <span className="text-primary font-semibold">Work Details</span>
            </nav>

            {/* Header Row */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-primary text-lg font-bold">
                  Work ID - {workItem.id} | {leaverName}
                </h1>
                <div className="flex items-center gap-2 text-[hsl(var(--wq-text-secondary))] text-sm">
                  <span>Work Type:</span>
                  <span className="bg-[hsl(var(--wq-bg-muted))] px-2 py-0.5 rounded text-primary font-medium text-xs">
                    {workItem.workType}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[hsl(var(--wq-text-secondary))] text-sm">
                  <span>Priority:</span>
                  <PriorityBadge priority={workItem.priority} />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-[hsl(var(--wq-bg-muted))] rounded-lg">
                  <Clock className="w-4 h-4 text-[hsl(var(--wq-text-secondary))]" />
                  <span className="text-[hsl(var(--wq-text-secondary))] text-xs">
                    {workItem.dateCreated}
                  </span>
                </div>
                <span
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5",
                    workItem.status === "Pending"
                      ? "bg-[hsl(var(--wq-status-pending-bg))] text-[hsl(var(--wq-status-pending-text))] border-[hsl(var(--wq-status-pending-text))]"
                      : workItem.status === "Cancelled"
                      ? "bg-red-50 text-destructive border-red-200"
                      : "bg-[hsl(var(--wq-status-completed-bg))] text-[hsl(var(--wq-status-completed-text))] border-[hsl(var(--wq-status-completed-text))]"
                  )}
                >
                  {isReadOnly && <Lock className="w-3 h-3" />}
                  {workItem.status === "Pending" ? "In Progress" : workItem.status}
                </span>
              </div>
            </div>

            {/* Read-only banner */}
            {isReadOnly && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-[hsl(var(--wq-bg-muted))] border border-[hsl(var(--wq-border))] rounded-lg">
                  <Lock className="w-4 h-4 text-[hsl(var(--wq-text-muted))]" />
                  <span className="text-sm text-[hsl(var(--wq-text-secondary))]">
                    {isCancelled
                      ? "This work item has been cancelled."
                      : "This work item is completed and read-only."}
                  </span>
              </div>
            )}

            {/* Work Details Section */}
            <Collapsible
              open={workDetailsOpen}
              onOpenChange={setWorkDetailsOpen}
              className="mb-4"
            >
              <div className="bg-white rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between px-6 py-4 bg-[hsl(var(--wq-bg-header))] cursor-pointer hover:bg-[#E5EEFF] transition-colors">
                    <h2 className="text-primary font-bold text-base">Work Details</h2>
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 text-primary transition-transform duration-200",
                        workDetailsOpen && "rotate-180"
                      )}
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-6 grid grid-cols-3 gap-x-12 gap-y-5">
                    <div>
                      <p className="text-[hsl(var(--wq-text-muted))] text-xs mb-1">Name</p>
                      <p className="text-primary font-semibold text-sm">{leaverName}</p>
                    </div>
                    <div>
                      <p className="text-[hsl(var(--wq-text-muted))] text-xs mb-1">Email</p>
                      <p className="text-primary font-semibold text-sm">{email}</p>
                    </div>
                    <div>
                      <p className="text-[hsl(var(--wq-text-muted))] text-xs mb-1">Location</p>
                      <p className="text-primary font-semibold text-sm">{leaverLocation}</p>
                    </div>
                    <div>
                      <p className="text-[hsl(var(--wq-text-muted))] text-xs mb-1">Leaver ID</p>
                      <p className="text-primary font-semibold text-sm">{workItem.id}</p>
                    </div>
                    <div>
                      <p className="text-[hsl(var(--wq-text-muted))] text-xs mb-1">Leaving Date</p>
                      <p className="text-primary font-semibold text-sm">{workItem.dueDate}</p>
                    </div>
                    <div>
                      <p className="text-[hsl(var(--wq-text-muted))] text-xs mb-1">Team Name</p>
                      <p className="text-primary font-semibold text-sm">
                        {workItem.teams?.[0]?.teamName || "Property Risk Assessment"}
                      </p>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Read-only: Summary Cards */}

            {/* Assignment Details Section - Only show if not read-only */}
            {!isReadOnly && (
              <Collapsible
                open={assignmentDetailsOpen}
                onOpenChange={setAssignmentDetailsOpen}
                className="mb-4"
              >
                <div className="bg-white rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between px-6 py-4 bg-[hsl(var(--wq-bg-header))] cursor-pointer hover:bg-[#E5EEFF] transition-colors">
                      <h2 className="text-primary font-bold text-base">Assignment Details</h2>
                      <ChevronDown
                        className={cn(
                          "w-5 h-5 text-primary transition-transform duration-200",
                          assignmentDetailsOpen && "rotate-180"
                        )}
                      />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-6">
                      <LeaverAssignmentPanelV2
                        leaverName={leaverName}
                        leaverTeam={workItem?.teams?.[0]?.teamName || "Property Risk Assessment"}
                        totalCapacity={totalCapacity}
                        clients={clientsWithCapacity}
                        assignedClientIds={assignedClientIds}
                        onAssign={handleV2Assign}
                        teamId={leaverTeamId}
                        excludeMemberIds={[...new Set(reassignments.map(r => r.reassignedToId))]}
                      />
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            {/* Reassignments Table */}
            <div className="mb-6">
              <EnhancedReassignmentsTable
                reassignments={reassignments}
                onRemoveReassignment={isReadOnly ? undefined : handleRemoveReassignment}
                isReadOnly={isReadOnly}
                clients={clientsWithCapacity}
              />
            </div>

            {/* Footer Actions */}
            {!isReadOnly ? (
              <div className="flex items-center justify-between">
                {/* Left side: Cancel + Validation */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelModal(true)}
                    disabled={reassignments.length > 0}
                  >
                    Cancel Work Item
                  </Button>
                  {reassignments.length > 0 && !allClientsAssigned && (
                    <div className="text-sm text-destructive">
                      ⚠ {remainingClients} client{remainingClients > 1 ? "s" : ""} remaining
                      - all must be reassigned
                    </div>
                  )}
                  {reassignments.length > 0 && allClientsAssigned && (
                    <div className="text-sm text-[hsl(var(--wq-status-completed-text))]">
                      ✓ All clients reassigned
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleExit} className="text-primary">
                    Exit Work Item
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={!allClientsAssigned || reassignments.length === 0}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Complete Work Item
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-start">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/")} 
                  className="text-primary border-primary hover:bg-[hsl(var(--wq-bg-hover))]"
                >
                  Back to Work Queue
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      <CompleteReassignmentModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onConfirm={confirmComplete}
        totalClients={reassignments.length}
        teamMembersAffected={teamMembersAffected}
        leaverName={leaverName}
      />
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onClose={() => setShowUnsavedModal(false)}
        onSaveAndExit={handleSaveAndExit}
        onExitWithoutSaving={handleExitWithoutSaving}
        pendingCount={reassignments.length}
      />
      <CancelWorkItemModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelWorkItem}
      />
    </>
  );
};

export default LeaverWorkflow;
