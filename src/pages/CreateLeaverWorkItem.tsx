import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import {
  Clock,
  Calendar as CalendarIcon,
  Check,
  ChevronDown,
  AlertCircle,
  Users,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useWorkItems } from "@/context/WorkItemsContext";
import SearchablePersonInput, { SearchablePerson } from "@/components/form/SearchablePersonInput";
import { teamMembers, managers, getMemberById } from "@/data/teamMembers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Convert all team members to searchable persons for employee selection
const employeePersons: SearchablePerson[] = teamMembers.map((member) => ({
  id: member.id,
  name: member.name,
  role: member.role,
  location: member.location,
}));

// Manager persons for manager selection
const managerPersons: SearchablePerson[] = managers.map((manager) => ({
  id: manager.id,
  name: manager.name,
  role: manager.role,
  location: manager.location,
}));

// Mock client data for demonstration - in real app this would come from API based on employee
const mockEmployeeClients = [
  { id: "cli_001", name: "Acme Energy Corp", industry: "Energy", role: "Account Lead", capacity: 1.0 },
  { id: "cli_002", name: "Summit Healthcare Systems", industry: "Healthcare", role: "Strategic Advisor", capacity: 0.5 },
  { id: "cli_003", name: "Westfield Manufacturing", industry: "Manufacturing", role: "Account Lead", capacity: 1.0 },
  { id: "cli_004", name: "Atlantic Logistics", industry: "Transportation", role: "Client Service", capacity: 0.5 },
  { id: "cli_005", name: "Coastal Financial", industry: "Financial Services", role: "Account Lead", capacity: 1.0 },
];

const CreateLeaverWorkItem = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addWorkItem } = useWorkItems();

  // Step tracking
  const [currentStep, setCurrentStep] = useState(1);
  const [createdAt] = useState(() => new Date());

  // Step 1: Employee selection
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<SearchablePerson | null>(null);

  // Step 2: Team info & leaving date
  const [leavingDate, setLeavingDate] = useState<Date | undefined>();
  const [leavingDateOpen, setLeavingDateOpen] = useState(false);

  // Step 3: Manager selection (multi-select)
  const [selectedManagerIds, setSelectedManagerIds] = useState<string[]>([]);

  // Error modal state
  const [showNoTeamModal, setShowNoTeamModal] = useState(false);

  const formatTimestamp = (date: Date) => format(date, "dd MMM yyyy HH:mm") + " EST";

  // Get selected employee details
  const employeeDetails = useMemo(() => {
    if (!selectedEmployeeId) return null;
    const member = getMemberById(selectedEmployeeId);
    if (!member) return null;
    return {
      id: member.id,
      name: member.name,
      email: `${member.name.toLowerCase().replace(/\s+/g, '.')}@marsh.com`,
      location: member.location,
      team: member.team,
      teamId: member.teamId,
      role: member.role,
      currentAssignments: member.currentAssignments || [],
    };
  }, [selectedEmployeeId]);

  // Get team members count for the employee's team
  const teamMembersCount = useMemo(() => {
    if (!employeeDetails?.teamId) return 0;
    return teamMembers.filter(m => m.teamId === employeeDetails.teamId).length;
  }, [employeeDetails?.teamId]);

  // Get managers for the employee's team
  const teamManagers = useMemo(() => {
    if (!employeeDetails?.teamId) return [];
    // Get managers from same team plus some related ones
    const sameTeamManagers = managers.filter(m => m.teamId === employeeDetails.teamId);
    // Also include some other managers if user works across teams
    return sameTeamManagers.length > 0 ? sameTeamManagers : managers.slice(0, 5);
  }, [employeeDetails?.teamId]);

  // Calculate client portfolio for display
  const clientPortfolio = useMemo(() => {
    // In real app, this would come from employee's assignments
    // For now, use mock data
    return mockEmployeeClients;
  }, [selectedEmployeeId]);

  const totalCapacity = useMemo(() => {
    return clientPortfolio.reduce((sum, c) => sum + c.capacity, 0);
  }, [clientPortfolio]);

  // Handle employee selection
  const handleEmployeeChange = (id: string, person: SearchablePerson | null) => {
    setSelectedEmployeeId(id);
    setSelectedEmployee(person);
    
    if (person) {
      // Check if employee has a team
      const member = getMemberById(id);
      if (!member?.teamId) {
        setShowNoTeamModal(true);
        return;
      }
      // Auto-advance to step 2
      setCurrentStep(2);
    }
  };

  // Handle manager toggle
  const handleManagerToggle = (managerId: string) => {
    setSelectedManagerIds(prev =>
      prev.includes(managerId)
        ? prev.filter(id => id !== managerId)
        : [...prev, managerId]
    );
  };

  // Step validation
  const isStep1Complete = selectedEmployeeId !== "";
  const isStep2Complete = isStep1Complete && leavingDate !== undefined;
  const isStep3Complete = isStep2Complete && selectedManagerIds.length > 0;

  const canSubmit = isStep3Complete;

  // Handle form submission
  const handleSubmit = () => {
    if (!canSubmit || !employeeDetails) return;

    const workItemData = {
      workType: "Leaver",
      clientName: employeeDetails.name,
      location: employeeDetails.location,
      dueDate: format(leavingDate!, "dd MMM yyyy"),
      assignee: managers.find(m => m.id === selectedManagerIds[0])?.name || "Unassigned",
      priority: "High" as const,
      description: `Leaver work item for ${employeeDetails.name}. ${clientPortfolio.length} clients require reassignment.`,
    };

    const workItemId = addWorkItem(workItemData);
    
    toast({
      title: "Leaver Work Item Created",
      description: `Work ID ${workItemId} created successfully.`,
    });

    navigate(`/leaver-workflow/${workItemId}`);
  };

  // Section Header component
  const StepHeader = ({
    step,
    title,
    isComplete,
    isActive,
    isDisabled,
  }: {
    step: number;
    title: string;
    isComplete: boolean;
    isActive: boolean;
    isDisabled: boolean;
  }) => (
    <div
      className={cn(
        "flex items-center justify-between px-6 py-4 rounded-lg transition-colors",
        isDisabled
          ? "bg-[hsl(0,0%,95%)] cursor-not-allowed"
          : isActive
          ? "bg-[hsl(220,60%,97%)] hover:bg-[#E5EEFF] cursor-pointer"
          : "bg-[hsl(220,60%,97%)] hover:bg-[#E5EEFF] cursor-pointer"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200",
            isDisabled
              ? "bg-[hsl(0,0%,85%)] border-[hsl(0,0%,75%)] text-[hsl(0,0%,55%)]"
              : isComplete
              ? "bg-[hsl(var(--wq-status-completed-bg))] border-[hsl(var(--wq-status-completed-text))] text-[hsl(var(--wq-status-completed-text))]"
              : "bg-primary border-primary text-primary-foreground"
          )}
        >
          {isComplete ? <Check className="w-4 h-4" /> : step}
        </div>
        <h2
          className={cn(
            "text-lg font-bold",
            isDisabled ? "text-[hsl(0,0%,55%)]" : "text-primary"
          )}
        >
          {title}
        </h2>
      </div>
      <div className="flex items-center gap-3">
        {isComplete && !isDisabled && (
          <span className="text-xs px-2 py-1 bg-[hsl(var(--wq-status-completed-bg))] text-[hsl(var(--wq-status-completed-text))] rounded-full font-medium">
            Complete
          </span>
        )}
        {isDisabled && (
          <span className="text-xs px-2 py-1 bg-[hsl(0,0%,85%)] text-[hsl(0,0%,55%)] rounded-full font-medium">
            Complete previous steps
          </span>
        )}
        {!isDisabled && (
          <ChevronDown
            className={cn(
              "w-5 h-5 text-primary transition-transform duration-200",
              isActive && "rotate-180"
            )}
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col">
        <div className="px-6 pt-6">
          <Header />
        </div>
        <div className="flex flex-1 px-6 pb-6 gap-6">
          <Sidebar />
          <main className="flex-1 ml-[280px] overflow-auto">
            {/* Breadcrumb and timestamp */}
            <div className="flex items-center justify-between mb-6">
              <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Work Queue
                </Link>
                <span className="text-muted-foreground">&gt;</span>
                <span className="text-primary font-medium">Create Leaver Work Item</span>
              </nav>
              <div className="flex items-center gap-2 px-3 py-2 bg-[hsl(0,0%,91%)] rounded-lg">
                <Clock className="w-4 h-4 text-[hsl(0,0%,25%)]" />
                <span className="text-[hsl(0,0%,25%)] text-xs font-medium">
                  Created: {formatTimestamp(createdAt)}
                </span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-primary mb-6">
              Create Leaver Work Item
            </h1>

            {/* Step 1: Select Departing Employee */}
            <Collapsible
              open={currentStep >= 1}
              onOpenChange={() => setCurrentStep(1)}
              className="mb-4"
            >
              <div className="bg-white rounded-lg border border-border-primary overflow-hidden">
                <CollapsibleTrigger className="w-full">
                  <StepHeader
                    step={1}
                    title="Select Departing Employee"
                    isComplete={isStep1Complete}
                    isActive={currentStep === 1}
                    isDisabled={false}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                      <Label className="text-right text-sm font-medium text-text-secondary">
                        Select Employee<span className="text-destructive">*</span>
                      </Label>
                      <SearchablePersonInput
                        value={selectedEmployeeId}
                        onChange={handleEmployeeChange}
                        placeholder="Search by name, role, or location..."
                        persons={employeePersons}
                      />
                    </div>
                    
                    {!isStep1Complete && (
                      <div className="flex justify-end">
                        <Button disabled className="px-8">
                          Next <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Step 2: Employee & Team Information */}
            <Collapsible
              open={currentStep >= 2 && isStep1Complete}
              onOpenChange={() => isStep1Complete && setCurrentStep(2)}
              className="mb-4"
            >
              <div
                className={cn(
                  "bg-white rounded-lg border overflow-hidden transition-opacity",
                  !isStep1Complete
                    ? "border-[hsl(0,0%,85%)] opacity-70"
                    : "border-border-primary"
                )}
              >
                <CollapsibleTrigger className="w-full" disabled={!isStep1Complete}>
                  <StepHeader
                    step={2}
                    title="Employee & Team Details"
                    isComplete={isStep2Complete}
                    isActive={currentStep === 2}
                    isDisabled={!isStep1Complete}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {employeeDetails && (
                    <div className="p-6 space-y-6">
                      {/* Employee Details Section */}
                      <div className="bg-[hsl(var(--wq-bg-header))] rounded-lg p-4 border border-[hsl(var(--wq-border))]">
                        <h3 className="text-primary font-bold text-sm mb-4">
                          Employee Details
                        </h3>
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">
                              Name
                            </p>
                            <p className="text-sm font-semibold text-primary">
                              {employeeDetails.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">
                              Email
                            </p>
                            <p className="text-sm font-semibold text-primary">
                              {employeeDetails.email}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">
                              Location
                            </p>
                            <p className="text-sm font-semibold text-primary">
                              {employeeDetails.location}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">
                              Leaving Date<span className="text-destructive">*</span>
                            </p>
                            <Popover open={leavingDateOpen} onOpenChange={setLeavingDateOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !leavingDate && "text-muted-foreground"
                                  )}
                                >
                                  {leavingDate
                                    ? format(leavingDate, "MM/dd/yyyy")
                                    : "Select date"}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0 bg-white z-50"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={leavingDate}
                                  onSelect={(date) => {
                                    setLeavingDate(date);
                                    setLeavingDateOpen(false);
                                  }}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </div>

                      {/* Team Information Section */}
                      <div className="bg-[hsl(var(--wq-bg-header))] rounded-lg p-4 border border-[hsl(var(--wq-border))]">
                        <h3 className="text-primary font-bold text-sm mb-4">
                          Team Information
                        </h3>
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">
                              Team Name
                            </p>
                            <p className="text-sm font-semibold text-primary">
                              {employeeDetails.team}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">
                              Current Team Members
                            </p>
                            <p className="text-sm font-semibold text-primary flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {teamMembersCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">
                              Total Clients
                            </p>
                            <p className="text-sm font-semibold text-primary flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              {clientPortfolio.length}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">
                              Total Capacity
                            </p>
                            <p className="text-sm font-semibold text-primary">
                              {totalCapacity.toFixed(1)} chairs
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Client Portfolio Breakdown */}
                      <div>
                        <h3 className="text-primary font-bold text-sm mb-3">
                          Client Portfolio Breakdown
                        </h3>
                        <div className="border border-[hsl(var(--wq-border))] rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-[hsl(var(--wq-bg-header))]">
                                <TableHead className="text-primary font-semibold">
                                  Client Name
                                </TableHead>
                                <TableHead className="text-primary font-semibold">
                                  Industry
                                </TableHead>
                                <TableHead className="text-primary font-semibold">
                                  Role/Position
                                </TableHead>
                                <TableHead className="text-primary font-semibold">
                                  Capacity
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {clientPortfolio.map((client) => (
                                <TableRow key={client.id}>
                                  <TableCell className="font-medium text-primary">
                                    {client.name}
                                  </TableCell>
                                  <TableCell className="text-primary">
                                    {client.industry}
                                  </TableCell>
                                  <TableCell className="text-primary">
                                    {client.role}
                                  </TableCell>
                                  <TableCell className="text-primary">
                                    {client.capacity.toFixed(1)} chair
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>

                      {isStep1Complete && leavingDate && (
                        <div className="flex justify-end">
                          <Button
                            onClick={() => setCurrentStep(3)}
                            className="px-8 bg-primary hover:bg-primary/90"
                          >
                            Next <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Step 3: Select Manager(s) */}
            <Collapsible
              open={currentStep >= 3 && isStep2Complete}
              onOpenChange={() => isStep2Complete && setCurrentStep(3)}
              className="mb-4"
            >
              <div
                className={cn(
                  "bg-white rounded-lg border overflow-hidden transition-opacity",
                  !isStep2Complete
                    ? "border-[hsl(0,0%,85%)] opacity-70"
                    : "border-border-primary"
                )}
              >
                <CollapsibleTrigger className="w-full" disabled={!isStep2Complete}>
                  <StepHeader
                    step={3}
                    title="Select Team Manager(s)"
                    isComplete={isStep3Complete}
                    isActive={currentStep === 3}
                    isDisabled={!isStep2Complete}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-6 space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-text-secondary mb-3 block">
                        Select Manager(s) to Handle Reassignment
                        <span className="text-destructive">*</span>
                      </Label>
                      <p className="text-xs text-muted-foreground mb-4">
                        Multiple managers can be selected if this employee works across
                        teams.
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        {teamManagers.map((manager) => (
                          <div
                            key={manager.id}
                            onClick={() => handleManagerToggle(manager.id)}
                            className={cn(
                              "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all",
                              selectedManagerIds.includes(manager.id)
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                : "border-[hsl(var(--wq-border))] hover:bg-[hsl(var(--wq-bg-hover))]"
                            )}
                          >
                            <Checkbox
                              checked={selectedManagerIds.includes(manager.id)}
                              onCheckedChange={() => handleManagerToggle(manager.id)}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-primary">
                                {manager.name}
                              </p>
                              <p className="text-xs text-[hsl(var(--wq-text-secondary))]">
                                {manager.role}
                              </p>
                              <p className="text-xs text-[hsl(var(--wq-text-muted))]">
                                {manager.location}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {selectedManagerIds.length === 0 && (
                        <p className="text-xs text-destructive mt-2">
                          At least one manager must be selected
                        </p>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-8 mb-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
                className="px-8 border-primary text-primary hover:bg-primary/5"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="px-8 bg-primary hover:bg-primary/90 text-white"
              >
                Create Leaver Work Item
              </Button>
            </div>
          </main>
        </div>
      </div>

      {/* No Team Assignment Modal */}
      <Dialog open={showNoTeamModal} onOpenChange={setShowNoTeamModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Cannot Create Work Item
            </DialogTitle>
            <DialogDescription className="pt-4">
              <strong>{selectedEmployee?.name}</strong> is not assigned to any team. A
              Leaver work item cannot be created for employees without team
              assignments.
              <br />
              <br />
              Please contact HR or assign the employee to a team first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowNoTeamModal(false);
                navigate("/");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowNoTeamModal(false);
                setSelectedEmployeeId("");
                setSelectedEmployee(null);
              }}
              className="bg-primary hover:bg-primary/90"
            >
              Select Different Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateLeaverWorkItem;
