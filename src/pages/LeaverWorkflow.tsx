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
  LeaverClient,
  Reassignment,
} from "@/data/leaverClients";
import { teamMembers } from "@/data/teamMembers";
import {
  EnhancedAssignmentPanel,
  LeaverTeamMember,
  CompleteReassignmentModal,
  UnsavedChangesModal,
  CapacityWarningModal,
  CancelWorkItemModal,
} from "@/components/leaver-workflow";
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

  // Assignment state
  const [selectedMember, setSelectedMember] = useState<LeaverTeamMember | null>(null);
  const handleSelectMember = useCallback((member: LeaverTeamMember | null) => {
    // Clear pending staging when changing member to prevent cross-member assignment
    if (member?.id !== selectedMember?.id) {
      setPendingClients([]);
      setPendingSelectedClientIds([]);
      setSelectedClientIds([]);
    }
    setSelectedMember(member);
  }, [selectedMember?.id]);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [pendingClients, setPendingClients] = useState<(LeaverClient & { capacityRequirement?: number })[]>([]);
  const [pendingSelectedClientIds, setPendingSelectedClientIds] = useState<string[]>([]);
  const [reassignments, setReassignments] = useState<Reassignment[]>([]);
  const [assignedClientIds, setAssignedClientIds] = useState<string[]>([]);

  // Modal state
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [showCapacityWarning, setShowCapacityWarning] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [pendingAssignmentData, setPendingAssignmentData] = useState<{
    clients: (LeaverClient & { capacityRequirement?: number })[];
    member: LeaverTeamMember;
    projectedCapacity: number;
  } | null>(null);

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

  // Toggle client selection in From panel
  const handleToggleClient = useCallback((clientId: string) => {
    setSelectedClientIds((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    );
  }, []);

  // Toggle pending client selection in To panel
  const handleTogglePendingClient = useCallback((clientId: string) => {
    setPendingSelectedClientIds((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    );
  }, []);

  // Derive leaver's teamId from teamMembers data
  const leaverTeamId = useMemo(() => {
    const leaverMember = teamMembers.find(
      (m) => m.name === workItem?.clientName
    );
    return leaverMember?.teamId || "team_001";
  }, [workItem?.clientName]);

  // Handle move to pending (right arrow) - AC3
  const handleMoveToPending = useCallback(() => {
    if (!selectedMember || selectedClientIds.length === 0) return;

    const clientsToMove = clientsWithCapacity.filter((client) =>
      selectedClientIds.includes(client.id)
    );

    setPendingClients((prev) => [...prev, ...clientsToMove]);
    setSelectedClientIds([]);

    toast({
      title: "Clients Staged",
      description: `${clientsToMove.length} client(s) moved to pending reassignment.`,
    });
  }, [selectedMember, selectedClientIds, toast]);

  // Handle remove from pending (left arrow) - AC4
  const handleRemoveFromPending = useCallback(() => {
    if (pendingSelectedClientIds.length === 0) return;

    setPendingClients((prev) =>
      prev.filter((client) => !pendingSelectedClientIds.includes(client.id))
    );
    setPendingSelectedClientIds([]);

    toast({
      title: "Clients Returned",
      description: "Selected clients returned to the available list.",
    });
  }, [pendingSelectedClientIds, toast]);

  // Handle confirm assign (Assign button) - AC5: locks the client-user pairs
  const handleConfirmAssign = useCallback(() => {
    if (!selectedMember || pendingClients.length === 0) return;

    // Calculate capacity impact
    const additionalCapacity = pendingClients.reduce(
      (sum, c) => sum + (c.capacityRequirement || 1) * 20,
      0
    );
    const projectedCapacity = selectedMember.currentCapacity + additionalCapacity;

    // Check if over capacity
    if (projectedCapacity > 100) {
      setPendingAssignmentData({
        clients: pendingClients,
        member: selectedMember,
        projectedCapacity,
      });
      setShowCapacityWarning(true);
      return;
    }

    executeAssignment(pendingClients, selectedMember);
  }, [selectedMember, pendingClients]);

  const executeAssignment = useCallback(
    (
      clientsToAssign: (LeaverClient & { capacityRequirement?: number })[],
      member: LeaverTeamMember
    ) => {
      // Create locked reassignment records - AC5
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

      // Lock: add to reassignments and assignedClientIds
      setReassignments((prev) => [...prev, ...newReassignments]);
      setAssignedClientIds((prev) => [...prev, ...clientsToAssign.map((c) => c.id)]);

      // Clear pending staging area
      setPendingClients([]);
      setPendingSelectedClientIds([]);

      toast({
        title: "Clients Assigned",
        description: `${clientsToAssign.length} client(s) locked to ${member.name}.`,
      });
    },
    [toast]
  );

  const handleCapacityWarningProceed = useCallback(() => {
    if (pendingAssignmentData) {
      executeAssignment(pendingAssignmentData.clients, pendingAssignmentData.member);
      setPendingAssignmentData(null);
    }
    setShowCapacityWarning(false);
  }, [pendingAssignmentData, executeAssignment]);

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

    // Mark the work item as completed in the context
    if (id) {
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
    if ((reassignments.length > 0 || pendingClients.length > 0) && !isReadOnly) {
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
    if ((reassignments.length > 0 || pendingClients.length > 0) && !isReadOnly) {
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
              <div className="flex items-center justify-between p-3 mb-4 bg-[hsl(var(--wq-bg-muted))] border border-[hsl(var(--wq-border))] rounded-lg">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[hsl(var(--wq-text-muted))]" />
                  <span className="text-sm text-[hsl(var(--wq-text-secondary))]">
                    {isCancelled
                      ? "This work item has been cancelled."
                      : "This work item is completed and read-only."}
                  </span>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <FileDown className="w-4 h-4" />
                  Export
                </Button>
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
                  <div className="p-6 grid grid-cols-5 gap-6">
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
                      <p className="text-[hsl(var(--wq-text-muted))] text-xs mb-1">
                        Leaver ID
                      </p>
                      <p className="text-primary font-semibold text-sm">{workItem.id}</p>
                    </div>
                    <div>
                      <p className="text-[hsl(var(--wq-text-muted))] text-xs mb-1">
                        Leaving Date
                      </p>
                      <p className="text-primary font-semibold text-sm">{workItem.dueDate}</p>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Read-only: Summary Cards */}
            {isReadOnly && (
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-lg border border-[hsl(var(--wq-border))] p-4 text-center">
                  <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">
                    Total Clients Reassigned
                  </p>
                  <p className="text-3xl font-bold text-primary">{reassignments.length}</p>
                </div>
                <div className="bg-white rounded-lg border border-[hsl(var(--wq-border))] p-4 text-center">
                  <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">
                    Team Members Affected
                  </p>
                  <p className="text-3xl font-bold text-primary">{teamMembersAffected}</p>
                </div>
                <div className="bg-white rounded-lg border border-[hsl(var(--wq-border))] p-4 text-center">
                  <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">
                    Total Capacity Moved
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {totalCapacity.toFixed(1)} chairs
                  </p>
                </div>
              </div>
            )}

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
                      <EnhancedAssignmentPanel
                        leaverName={leaverName}
                        leaverTeam={workItem?.teams?.[0]?.teamName || "Property Risk Assessment"}
                        totalCapacity={totalCapacity}
                        clients={clientsWithCapacity}
                        assignedClientIds={assignedClientIds}
                        selectedMember={selectedMember}
                        onSelectMember={handleSelectMember}
                        selectedClientIds={selectedClientIds}
                        onToggleClient={handleToggleClient}
                        pendingClients={pendingClients}
                        onMoveToPending={handleMoveToPending}
                        onRemoveFromPending={handleRemoveFromPending}
                        onConfirmAssign={handleConfirmAssign}
                        pendingSelectedClientIds={pendingSelectedClientIds}
                        onTogglePendingClient={handleTogglePendingClient}
                        teamId={leaverTeamId}
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
              <div className="flex justify-end">
                <Button onClick={() => navigate("/")} className="bg-primary hover:bg-primary/90">
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
      {pendingAssignmentData && (
        <CapacityWarningModal
          isOpen={showCapacityWarning}
          onClose={() => {
            setShowCapacityWarning(false);
            setPendingAssignmentData(null);
          }}
          onProceed={handleCapacityWarningProceed}
          teamMemberName={pendingAssignmentData.member.name}
          projectedCapacity={pendingAssignmentData.projectedCapacity}
        />
      )}
      <CancelWorkItemModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelWorkItem}
      />
    </>
  );
};

export default LeaverWorkflow;
