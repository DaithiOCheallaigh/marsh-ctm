import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Clock, ChevronDown } from "lucide-react";
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
  ReassignableTeamMember,
  Reassignment,
} from "@/data/leaverClients";
import {
  AssignmentPanel,
  ReassignmentsTable,
  CompleteReassignmentModal,
  UnsavedChangesModal,
} from "@/components/leaver-workflow";

const LeaverWorkflow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const { workItems, completeWorkItem } = useWorkItems();

  // Find the work item from context
  const workItem = workItems.find((item) => item.id === id);

  // Section visibility
  const [workDetailsOpen, setWorkDetailsOpen] = useState(true);
  const [assignmentDetailsOpen, setAssignmentDetailsOpen] = useState(true);

  // Assignment state
  const [selectedMember, setSelectedMember] = useState<ReassignableTeamMember | null>(null);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [pendingClients, setPendingClients] = useState<LeaverClient[]>([]);
  const [pendingSelectedClientIds, setPendingSelectedClientIds] = useState<string[]>([]);
  const [reassignments, setReassignments] = useState<Reassignment[]>([]);
  const [assignedClientIds, setAssignedClientIds] = useState<string[]>([]);

  // Modal state
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  // Redirect if work item not found or not a Leaver type
  useEffect(() => {
    if (!workItem) {
      navigate("/", { replace: true });
    } else if (workItem.workType !== "Leaver") {
      navigate(`/work-item/${id}`, { replace: true });
    }
  }, [workItem, id, navigate]);

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

  // Handle assign action
  const handleAssign = useCallback(() => {
    if (!selectedMember || selectedClientIds.length === 0) return;

    // Get selected clients
    const clientsToAssign = leaverClients.filter((client) =>
      selectedClientIds.includes(client.id)
    );

    // Create new reassignments
    const newReassignments: Reassignment[] = clientsToAssign.map((client) => ({
      id: `r_${Date.now()}_${client.id}`,
      clientId: client.id,
      clientName: client.name,
      industry: client.industry,
      reassignedToId: selectedMember.id,
      reassignedToName: selectedMember.name,
      role: selectedMember.role,
      location: selectedMember.location,
    }));

    // Update state
    setReassignments((prev) => [...prev, ...newReassignments]);
    setAssignedClientIds((prev) => [...prev, ...selectedClientIds]);
    
    // Add clients to pending list for the team member
    setPendingClients((prev) => [...prev, ...clientsToAssign]);
    
    // Clear selections
    setSelectedClientIds([]);

    toast({
      title: "Clients Assigned",
      description: `${clientsToAssign.length} client(s) assigned to ${selectedMember.name}.`,
    });
  }, [selectedMember, selectedClientIds, toast]);

  // Handle unassign action
  const handleUnassign = useCallback(() => {
    if (pendingSelectedClientIds.length === 0) return;

    // Remove from reassignments
    setReassignments((prev) =>
      prev.filter((r) => !pendingSelectedClientIds.includes(r.clientId))
    );

    // Remove from assigned clients
    setAssignedClientIds((prev) =>
      prev.filter((id) => !pendingSelectedClientIds.includes(id))
    );

    // Remove from pending clients
    setPendingClients((prev) =>
      prev.filter((client) => !pendingSelectedClientIds.includes(client.id))
    );

    // Clear selection
    setPendingSelectedClientIds([]);

    toast({
      title: "Clients Unassigned",
      description: "Selected clients have been returned to the available list.",
    });
  }, [pendingSelectedClientIds, toast]);

  // Handle remove reassignment from table
  const handleRemoveReassignment = useCallback(
    (reassignmentId: string) => {
      const reassignment = reassignments.find((r) => r.id === reassignmentId);
      if (!reassignment) return;

      // Remove from reassignments
      setReassignments((prev) => prev.filter((r) => r.id !== reassignmentId));

      // Remove from assigned clients
      setAssignedClientIds((prev) =>
        prev.filter((id) => id !== reassignment.clientId)
      );

      // Remove from pending clients if it was assigned to current selected member
      if (selectedMember && reassignment.reassignedToId === selectedMember.id) {
        setPendingClients((prev) =>
          prev.filter((client) => client.id !== reassignment.clientId)
        );
      }

      toast({
        title: "Reassignment Removed",
        description: `${reassignment.clientName} has been removed from reassignments.`,
      });
    },
    [reassignments, selectedMember, toast]
  );

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
    if (reassignments.length > 0) {
      setShowUnsavedModal(true);
    } else {
      navigate("/");
    }
  };

  const handleSaveAndExit = () => {
    setShowUnsavedModal(false);
    toast({
      title: "Reassignments Saved",
      description: "Your reassignments have been saved.",
    });
    navigate("/");
  };

  const handleExitWithoutSaving = () => {
    setShowUnsavedModal(false);
    navigate("/");
  };

  // Handle breadcrumb click
  const handleBreadcrumbClick = (e: React.MouseEvent) => {
    if (reassignments.length > 0) {
      e.preventDefault();
      setShowUnsavedModal(true);
    }
  };

  // Don't render until we have a valid work item
  if (!workItem || workItem.workType !== "Leaver") {
    return null;
  }

  // Derive leaver-specific display values from WorkItem
  const leaverName = workItem.clientName; // For Leaver type, clientName holds the leaver's name
  const email = `${leaverName.toLowerCase().replace(/\s+/g, '')}@marsh.com`;
  const leaverLocation = workItem.location || 'Not specified';

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
                    "px-3 py-1.5 rounded-full text-xs font-medium border",
                    workItem.status === "Pending"
                      ? "bg-[hsl(var(--wq-status-pending-bg))] text-[hsl(var(--wq-status-pending-text))] border-[hsl(var(--wq-status-pending-text))]"
                      : "bg-[hsl(var(--wq-status-completed-bg))] text-[hsl(var(--wq-status-completed-text))] border-[hsl(var(--wq-status-completed-text))]"
                  )}
                >
                  {workItem.status === "Pending" ? "On Track" : workItem.status}
                </span>
              </div>
            </div>

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
                      <p className="text-primary font-semibold text-sm">
                        {leaverName}
                      </p>
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
                        Assigned To
                      </p>
                      <p className="text-primary font-semibold text-sm">
                        {workItem.assignee || 'Unassigned'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[hsl(var(--wq-text-muted))] text-xs mb-1">
                        Due Date
                      </p>
                      <p className="text-primary font-semibold text-sm">
                        {workItem.dueDate}
                      </p>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Assignment Details Section */}
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
                    <AssignmentPanel
                      leaverName={leaverName}
                      clients={leaverClients}
                      assignedClientIds={assignedClientIds}
                      selectedMember={selectedMember}
                      onSelectMember={setSelectedMember}
                      selectedClientIds={selectedClientIds}
                      onToggleClient={handleToggleClient}
                      pendingClients={pendingClients}
                      onAssign={handleAssign}
                      onUnassign={handleUnassign}
                      pendingSelectedClientIds={pendingSelectedClientIds}
                      onTogglePendingClient={handleTogglePendingClient}
                    />
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Reassignments Table */}
            <div className="mb-6">
              <ReassignmentsTable
                reassignments={reassignments}
                onRemoveReassignment={handleRemoveReassignment}
              />
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end">
              <Button
                onClick={handleComplete}
                disabled={reassignments.length === 0}
                className="bg-primary hover:bg-primary/90"
              >
                Complete
              </Button>
            </div>
          </main>
        </div>
      </div>

      {/* Modals */}
      <CompleteReassignmentModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onConfirm={confirmComplete}
      />
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onClose={() => setShowUnsavedModal(false)}
        onSaveAndExit={handleSaveAndExit}
        onExitWithoutSaving={handleExitWithoutSaving}
      />
    </>
  );
};

export default LeaverWorkflow;
