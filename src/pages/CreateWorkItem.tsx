import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { Clock, Calendar as CalendarIcon, Check, ChevronDown, ChevronRight, Users, Briefcase } from "lucide-react";
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
import PrioritySelector from "@/components/work-item/PrioritySelector";
import OnboardingFields, { OnboardingAttachment } from "@/components/work-item/OnboardingFields";
import LeaverFields from "@/components/work-item/LeaverFields";
import NewJoinerFields from "@/components/work-item/NewJoinerFields";
import OffboardingFields from "@/components/work-item/OffboardingFields";
import { useWorkItems } from "@/context/WorkItemsContext";
import { FormDirtyContext } from "@/components/form/FormDirtyContext";
import { 
  FormSelect, 
  FormSelectContent, 
  FormSelectItem, 
  FormSelectTrigger, 
  FormSelectValue 
} from "@/components/form/FormSelect";
import SearchablePersonInput, { SearchablePerson } from "@/components/form/SearchablePersonInput";
import { getFieldStateClasses } from "@/components/form/FormDirtyContext";
import { managers, teamMembers, getMemberById } from "@/data/teamMembers";
import { Client } from "@/data/clients";
import { WorkItemTeamConfig } from "@/types/teamAssignment";
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

// Convert managers to searchable persons
const managerPersons: SearchablePerson[] = managers.map((manager) => ({
  id: manager.id,
  name: manager.name,
  role: manager.role,
  location: manager.location,
}));

// Convert all team members to searchable persons for employee selection (leaver flow)
const employeePersons: SearchablePerson[] = teamMembers.map((member) => ({
  id: member.id,
  name: member.name,
  role: member.role,
  location: member.location,
}));

// Mock client data for leaver demonstration
const mockEmployeeClients = [
  { id: "cli_001", name: "Acme Energy Corp", industry: "Energy", role: "Account Lead", capacity: 1.0 },
  { id: "cli_002", name: "Summit Healthcare Systems", industry: "Healthcare", role: "Strategic Advisor", capacity: 0.5 },
  { id: "cli_003", name: "Westfield Manufacturing", industry: "Manufacturing", role: "Account Lead", capacity: 1.0 },
  { id: "cli_004", name: "Atlantic Logistics", industry: "Transportation", role: "Client Service", capacity: 0.5 },
  { id: "cli_005", name: "Coastal Financial", industry: "Financial Services", role: "Account Lead", capacity: 1.0 },
];

type WorkType = "" | "onboarding" | "new-joiner" | "leaver" | "offboarding";
type Priority = "high" | "medium" | "low";

const CreateWorkItem = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addWorkItem, workItems } = useWorkItems();
  
  // Timestamps
  const [createdAt] = useState(() => new Date());
  
  const formatTimestamp = (date: Date) => format(date, "dd MMM yyyy HH:mm") + " EST";

  // Dirty state tracking
  const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set());

  const markDirty = useCallback((field: string) => {
    setDirtyFields((prev) => new Set(prev).add(field));
  }, []);

  const isDirty = useCallback(
    (field: string) => dirtyFields.has(field),
    [dirtyFields]
  );

  // Base form state
  const [workType, setWorkType] = useState<WorkType>("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [assignTo, setAssignTo] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  });
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [tempDueDate, setTempDueDate] = useState<Date | undefined>(undefined);

  // Collapsible section state
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([1]));

  // Onboarding fields
  const [onboardingClientName, setOnboardingClientName] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [onboardingDescription, setOnboardingDescription] = useState("");
  const [onboardingAttachments, setOnboardingAttachments] = useState<OnboardingAttachment[]>([]);
  
  // New team assignment state
  const [primaryTeam, setPrimaryTeam] = useState<WorkItemTeamConfig | null>(null);
  const [additionalTeams, setAdditionalTeams] = useState<WorkItemTeamConfig[]>([]);

  // Leaver fields
  const [leaverName, setLeaverName] = useState("");
  const [leavingDate, setLeavingDate] = useState<Date | undefined>();

  // New Joiner fields
  const [colleagueName, setColleagueName] = useState("");
  const [teamAssignment, setTeamAssignment] = useState("");
  const [clientLoadCapacity, setClientLoadCapacity] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());

  // Offboarding fields
  const [offboardingClientName, setOffboardingClientName] = useState("");
  const [offboardingReason, setOffboardingReason] = useState("");
  const [finalAssignmentDate, setFinalAssignmentDate] = useState<Date | undefined>();

  // Leaver wizard state
  const [leaverStep, setLeaverStep] = useState(1);
  const [selectedLeaverEmployeeId, setSelectedLeaverEmployeeId] = useState("");
  const [selectedLeaverEmployee, setSelectedLeaverEmployee] = useState<SearchablePerson | null>(null);
  const [selectedManagerIds, setSelectedManagerIds] = useState<string[]>([]);
  const [showNoTeamModal, setShowNoTeamModal] = useState(false);

  // Get selected leaver employee details
  const leaverEmployeeDetails = useMemo(() => {
    if (!selectedLeaverEmployeeId) return null;
    const member = getMemberById(selectedLeaverEmployeeId);
    if (!member) return null;
    return {
      id: member.id,
      name: member.name,
      email: `${member.name.toLowerCase().replace(/\s+/g, '.')}@marsh.com`,
      location: member.location,
      team: member.team,
      teamId: member.teamId,
      role: member.role,
    };
  }, [selectedLeaverEmployeeId]);

  // Get team members count for the employee's team
  const leaverTeamMembersCount = useMemo(() => {
    if (!leaverEmployeeDetails?.teamId) return 0;
    return teamMembers.filter(m => m.teamId === leaverEmployeeDetails.teamId).length;
  }, [leaverEmployeeDetails?.teamId]);

  // Get managers for the employee's team
  const leaverTeamManagers = useMemo(() => {
    if (!leaverEmployeeDetails?.teamId) return [];
    const sameTeamManagers = managers.filter(m => m.teamId === leaverEmployeeDetails.teamId);
    return sameTeamManagers.length > 0 ? sameTeamManagers : managers.slice(0, 5);
  }, [leaverEmployeeDetails?.teamId]);

  // Calculate client portfolio for leaver
  const leaverClientPortfolio = useMemo(() => {
    return mockEmployeeClients;
  }, [selectedLeaverEmployeeId]);

  const leaverTotalCapacity = useMemo(() => {
    return leaverClientPortfolio.reduce((sum, c) => sum + c.capacity, 0);
  }, [leaverClientPortfolio]);

  // Handle leaver employee selection
  const handleLeaverEmployeeChange = (id: string, person: SearchablePerson | null) => {
    setSelectedLeaverEmployeeId(id);
    setSelectedLeaverEmployee(person);
    setLeaverName(person?.name || "");
    markDirty("leaverName");
    
    if (person) {
      const member = getMemberById(id);
      if (!member?.teamId) {
        setShowNoTeamModal(true);
        return;
      }
      setLeaverStep(2);
    }
  };

  // Handle manager toggle for leaver
  const handleLeaverManagerToggle = (managerId: string) => {
    setSelectedManagerIds(prev =>
      prev.includes(managerId)
        ? prev.filter(id => id !== managerId)
        : [...prev, managerId]
    );
  };

  // Reset leaver state when work type changes
  useEffect(() => {
    if (workType !== "leaver") {
      setLeaverStep(1);
      setSelectedLeaverEmployeeId("");
      setSelectedLeaverEmployee(null);
      setSelectedManagerIds([]);
    }
  }, [workType]);

  // Wrapper functions to track dirty state
  const handleWorkTypeChange = (value: WorkType) => {
    setWorkType(value);
    markDirty("workType");
  };

  const handlePriorityChange = (value: Priority) => {
    setPriority(value);
    markDirty("priority");
  };

  const handleAssignToChange = (id: string, person: SearchablePerson | null) => {
    setAssignTo(id);
    markDirty("assignTo");
  };

  const handleDueDateChange = (date: Date | undefined) => {
    setDueDate(date);
    markDirty("dueDate");
  };

  const getClientName = () => {
    switch (workType) {
      case "onboarding":
        return selectedClient?.name || onboardingClientName || "New Client";
      case "new-joiner":
        return colleagueName || "New Joiner";
      case "leaver":
        return leaverName || "Leaver";
      case "offboarding":
        return offboardingClientName || "Offboarding Client";
      default:
        return "New Work Item";
    }
  };

  const getAssigneeName = () => {
    const assignee = managers.find(a => a.id === assignTo);
    return assignee?.name || "Unassigned";
  };

  const checkForDuplicate = () => {
    const workTypeLabels: Record<string, string> = {
      "onboarding": "Onboarding",
      "new-joiner": "New Joiner",
      "leaver": "Leaver",
      "offboarding": "Offboarding",
    };
    
    const clientName = getClientName();
    const workTypeLabel = workTypeLabels[workType] || workType;
    
    return workItems.some(item => 
      item.workType.toLowerCase() === workTypeLabel.toLowerCase() &&
      item.clientName.toLowerCase() === clientName.toLowerCase() &&
      item.status === 'Pending'
    );
  };

  // Section completion checks
  const isSection1Complete = () => {
    if (workType === "leaver") {
      // For leaver, we just need work type and priority selected (due date comes from leaving date)
      return true; // workType is already "leaver" so it's not empty
    }
    return workType !== "" && assignTo !== "" && dueDate !== undefined;
  };

  const isSection2Complete = () => {
    let hasRequiredFields = false;
    switch (workType) {
      case "onboarding":
        hasRequiredFields = onboardingClientName !== "" || selectedClient !== null;
        break;
      case "new-joiner":
        hasRequiredFields = colleagueName !== "";
        break;
      case "leaver":
        // For leaver, check that employee is selected and at least one manager
        hasRequiredFields = selectedLeaverEmployeeId !== "" && selectedManagerIds.length > 0 && leavingDate !== undefined;
        break;
      case "offboarding":
        hasRequiredFields = offboardingClientName !== "";
        break;
      default:
        hasRequiredFields = false;
    }
    
    if (!hasRequiredFields) return false;
    if (checkForDuplicate()) return false;
    
    return true;
  };

  const isSection3Complete = () => {
    if (workType === "onboarding") {
      return primaryTeam !== null && primaryTeam.roles.length > 0;
    }
    return true;
  };

  const canSubmit = () => {
    return isSection1Complete() && isSection2Complete() && isSection3Complete();
  };

  // Auto-expand next section when current section is validated
  useEffect(() => {
    if (isSection1Complete() && !openSections.has(2)) {
      setOpenSections(prev => new Set([...prev, 2]));
    }
  }, [workType, assignTo, dueDate]);

  useEffect(() => {
    if (isSection1Complete() && isSection2Complete() && !openSections.has(3)) {
      setOpenSections(prev => new Set([...prev, 3]));
    }
  }, [onboardingClientName, selectedClient, colleagueName, leaverName, offboardingClientName, workType]);

  const handleSubmit = async () => {
    if (!canSubmit()) {
      // Provide specific error message for role selection
      if (workType === "onboarding" && (!primaryTeam || primaryTeam.roles.length === 0)) {
        toast({
          title: "Validation Error",
          description: "Please select at least one role for this work item.",
          variant: "destructive",
        });
        return;
      }
      // Provide specific error message for leaver validation
      if (workType === "leaver") {
        if (!selectedLeaverEmployeeId) {
          toast({
            title: "Validation Error",
            description: "Please select a departing employee.",
            variant: "destructive",
          });
          return;
        }
        if (!leavingDate) {
          toast({
            title: "Validation Error",
            description: "Please select a leaving date.",
            variant: "destructive",
          });
          return;
        }
        if (selectedManagerIds.length === 0) {
          toast({
            title: "Validation Error",
            description: "Please select at least one manager to handle the reassignment.",
            variant: "destructive",
          });
          return;
        }
      }
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate work items
    if (checkForDuplicate()) {
      toast({
        title: "Duplicate Work Item",
        description: "A pending work item with the same type and client/colleague already exists.",
        variant: "destructive",
      });
      return;
    }

    const workTypeLabels: Record<string, string> = {
      "onboarding": "Onboarding",
      "new-joiner": "New Joiner",
      "leaver": "Leaver",
      "offboarding": "Offboarding",
    };

    // Build teams config for onboarding using new structure
    const teams = workType === "onboarding" && primaryTeam ? [
      primaryTeam,
      ...additionalTeams
    ] : undefined;

    // Convert files to data URLs for persistence
    const convertToDataUrl = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    let attachmentsWithData;
    if (workType === "onboarding" && onboardingAttachments.length > 0) {
      attachmentsWithData = await Promise.all(
        onboardingAttachments.map(async (att) => ({
          id: att.id,
          name: att.name,
          size: att.size,
          type: att.type,
          dataUrl: await convertToDataUrl(att.file),
        }))
      );
    }

    // Build work item data based on work type
    let workItemData;
    if (workType === "leaver" && leaverEmployeeDetails) {
      workItemData = {
        workType: "Leaver",
        clientName: leaverEmployeeDetails.name,
        location: leaverEmployeeDetails.location,
        dueDate: format(leavingDate!, "dd MMM yyyy"),
        assignee: managers.find(m => m.id === selectedManagerIds[0])?.name || "Unassigned",
        priority: priority.charAt(0).toUpperCase() + priority.slice(1) as "High" | "Medium" | "Low",
        description: `Leaver work item for ${leaverEmployeeDetails.name}. ${leaverClientPortfolio.length} clients require reassignment.`,
      };
    } else {
      workItemData = {
        workType: workTypeLabels[workType] || workType,
        clientName: getClientName(),
        cnNumber: selectedClient?.cnNumber,
        accountOwner: selectedClient?.accountOwner,
        location: selectedClient?.location,
        dueDate: format(dueDate!, "dd MMM yyyy"),
        assignee: getAssigneeName(),
        priority: priority.charAt(0).toUpperCase() + priority.slice(1) as "High" | "Medium" | "Low",
        description: onboardingDescription,
        teams,
        attachments: attachmentsWithData,
      };
    }

    const workItemId = addWorkItem(workItemData);
    toast({
      title: "Work Item Created",
      description: "Your work item has been successfully created.",
    });
    
    // Navigate to Leaver Workflow for leaver work type
    if (workType === "leaver") {
      navigate(`/leaver-workflow/${workItemId}`);
    } else {
      navigate(`/work-item/${workItemId}`);
    }
  };


  // Toggle section open/close
  const toggleSection = (sectionNumber: number) => {
    setOpenSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionNumber)) {
        newSet.delete(sectionNumber);
      } else {
        newSet.add(sectionNumber);
      }
      return newSet;
    });
  };

  // Section Header component with completion indicator (now a collapsible trigger)
  const CollapsibleSectionHeader = ({ 
    title, 
    sectionNumber, 
    isComplete,
    isDisabled = false,
    isOpen = false
  }: { 
    title: string; 
    sectionNumber: number; 
    isComplete: boolean;
    isDisabled?: boolean;
    isOpen?: boolean;
  }) => (
    <div className={cn(
      "flex items-center justify-between px-6 py-4 rounded-lg cursor-pointer transition-colors",
      isDisabled 
        ? "bg-[hsl(0,0%,95%)] cursor-not-allowed" 
        : "bg-[hsl(220,60%,97%)] hover:bg-[#E5EEFF]",
      isOpen && !isDisabled && "rounded-b-none border-b border-[hsl(var(--wq-border))]"
    )}>
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
          {isComplete && !isDisabled ? <Check className="w-4 h-4" /> : sectionNumber}
        </div>
        <h2 className={cn(
          "text-lg font-bold",
          isDisabled ? "text-[hsl(0,0%,55%)]" : "text-primary"
        )}>{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        {isComplete && !isDisabled && (
          <span className="text-xs px-2 py-1 bg-[hsl(var(--wq-status-completed-bg))] text-[hsl(var(--wq-status-completed-text))] rounded-full font-medium">
            Complete
          </span>
        )}
        {isDisabled && (
          <span className="text-xs px-2 py-1 bg-[hsl(0,0%,85%)] text-[hsl(0,0%,55%)] rounded-full font-medium">
            Complete previous sections
          </span>
        )}
        {!isDisabled && (
          <ChevronDown className={cn(
            "w-5 h-5 text-primary transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        )}
      </div>
    </div>
  );

  // Disabled section placeholder component
  const DisabledSectionContent = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center py-8 text-[hsl(0,0%,55%)]">
      <p className="text-sm">{message}</p>
    </div>
  );

  return (
    <FormDirtyContext.Provider value={{ isDirty, markDirty }}>
      {/* No Team Modal for Leaver */}
      <Dialog open={showNoTeamModal} onOpenChange={setShowNoTeamModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Users className="w-5 h-5" />
              Cannot Create Work Item
            </DialogTitle>
            <DialogDescription className="pt-4">
              <strong>{selectedLeaverEmployee?.name}</strong> is not assigned to any team.
              A Leaver work item cannot be created for employees without team assignments.
              Please contact HR or assign the employee to a team first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowNoTeamModal(false);
                setSelectedLeaverEmployeeId("");
                setSelectedLeaverEmployee(null);
                setLeaverName("");
                setLeaverStep(1);
              }}
            >
              Select Different Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Work Queue
                </Link>
                <span className="text-muted-foreground">&gt;</span>
                <span className="text-primary font-medium">Create Work Item</span>
              </nav>
              <div className="flex items-center gap-2 px-3 py-2 bg-[hsl(0,0%,91%)] rounded-lg">
                <Clock className="w-4 h-4 text-[hsl(0,0%,25%)]" />
                <span className="text-[hsl(0,0%,25%)] text-xs font-medium">
                  Created: {formatTimestamp(createdAt)}
                </span>
              </div>
            </div>

            {/* Section 1: Work Type & Basic Details - Always visible */}
            <Collapsible 
              open={openSections.has(1)} 
              onOpenChange={() => toggleSection(1)}
              className="mb-4"
            >
              <div className="bg-white rounded-lg border border-border-primary overflow-hidden animate-fade-in">
                <CollapsibleTrigger className="w-full">
                  <CollapsibleSectionHeader 
                    title="Work Type & Basic Details" 
                    sectionNumber={1} 
                    isComplete={isSection1Complete()}
                    isOpen={openSections.has(1)}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-6 space-y-6">
                    {/* Work Type */}
                    <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                      <Label className="text-right text-sm font-medium text-text-secondary">
                        Work Type<span className="text-[hsl(0,100%,50%)]">*</span>
                      </Label>
                      <FormSelect value={workType} onValueChange={handleWorkTypeChange}>
                        <FormSelectTrigger className="max-w-md" fieldName="workType">
                          <FormSelectValue placeholder="Select Work Type" />
                        </FormSelectTrigger>
                        <FormSelectContent>
                          <FormSelectItem value="onboarding">Client Onboarding</FormSelectItem>
                          <FormSelectItem value="offboarding">Client Offboarding</FormSelectItem>
                          <FormSelectItem value="new-joiner">New Joiner</FormSelectItem>
                          <FormSelectItem value="leaver">Leaver</FormSelectItem>
                        </FormSelectContent>
                      </FormSelect>
                    </div>

                    {/* Priority */}
                    <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                      <Label className="text-right text-sm font-medium text-text-secondary">
                        Priority<span className="text-[hsl(0,100%,50%)]">*</span>
                      </Label>
                      <PrioritySelector 
                        value={priority} 
                        onChange={handlePriorityChange}
                        isDirty={isDirty("priority")}
                      />
                    </div>

                    {/* Assign To - Managers Only */}
                    <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                      <Label className="text-right text-sm font-medium text-text-secondary">
                        Assigned To<span className="text-[hsl(0,100%,50%)]">*</span>
                      </Label>
                      <div className="space-y-1">
                        <SearchablePersonInput
                          value={assignTo}
                          onChange={handleAssignToChange}
                          placeholder="Search Manager"
                          persons={managerPersons}
                          isDirty={isDirty("assignTo")}
                        />
                        <p className="text-xs text-muted-foreground ml-1">
                          Only managers can be assigned as the primary owner
                        </p>
                      </div>
                    </div>

                    {/* Due Date */}
                    {workType !== "leaver" && (
                    <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                      <Label className="text-right text-sm font-medium text-text-secondary">
                        Due Date<span className="text-[hsl(0,100%,50%)]">*</span>
                      </Label>
                      <Popover open={dueDateOpen} onOpenChange={(open) => {
                        setDueDateOpen(open);
                        if (open) {
                          setTempDueDate(dueDate);
                        }
                      }}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "max-w-md justify-start text-left font-normal transition-all duration-200",
                              getFieldStateClasses(isDirty("dueDate")),
                              !dueDate && "text-muted-foreground"
                            )}
                          >
                            {dueDate ? format(dueDate, "MM/dd/yyyy") : "Select date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
                          <Calendar
                            mode="single"
                            selected={tempDueDate}
                            onSelect={setTempDueDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                          {tempDueDate && (
                            <div className="p-3 pt-0 border-t">
                              <Button 
                                className="w-full" 
                                onClick={() => {
                                  handleDueDateChange(tempDueDate);
                                  setDueDateOpen(false);
                                }}
                              >
                                Select
                              </Button>
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>
                    )}
                    
                    {/* For Leaver - Due Date is in Step 2 */}
                    {workType === "leaver" && (
                      <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                        <Label className="text-right text-sm font-medium text-text-secondary">
                          Due Date
                        </Label>
                        <p className="text-sm text-muted-foreground italic">
                          Due date will be set based on the leaving date in the next step
                        </p>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Section 2: Client/Colleague Selection - Visible when work type is selected (non-leaver) */}
            {workType && workType !== "leaver" && (
              <Collapsible 
                open={isSection1Complete() && openSections.has(2)} 
                onOpenChange={() => isSection1Complete() && toggleSection(2)}
                className="mb-4"
              >
                <div className={cn(
                  "bg-white rounded-lg border overflow-hidden animate-fade-in transition-opacity",
                  !isSection1Complete() ? "border-[hsl(0,0%,85%)] opacity-70" : "border-border-primary"
                )}>
                  <CollapsibleTrigger className="w-full" disabled={!isSection1Complete()}>
                    <CollapsibleSectionHeader 
                      title="Client Selection"
                      sectionNumber={2}
                      isComplete={isSection2Complete()}
                      isDisabled={!isSection1Complete()}
                      isOpen={isSection1Complete() && openSections.has(2)}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-6">
                      {workType === "onboarding" && (
                        <OnboardingFields
                          clientName={onboardingClientName}
                          setClientName={(val) => { setOnboardingClientName(val); markDirty("onboardingClientName"); }}
                          description={onboardingDescription}
                          setDescription={(val) => { setOnboardingDescription(val); markDirty("onboardingDescription"); }}
                          selectedClient={selectedClient}
                          setSelectedClient={setSelectedClient}
                          showTeamConfig={false}
                          attachments={onboardingAttachments}
                          setAttachments={(val) => { setOnboardingAttachments(val); markDirty("attachments"); }}
                          existingWorkItems={workItems}
                          currentWorkType="Onboarding"
                        />
                      )}

                      {workType === "new-joiner" && (
                        <NewJoinerFields
                          colleagueName={colleagueName}
                          setColleagueName={(val) => { setColleagueName(val); markDirty("colleagueName"); }}
                          teamAssignment={teamAssignment}
                          setTeamAssignment={(val) => { setTeamAssignment(val); markDirty("teamAssignment"); }}
                          clientLoadCapacity={clientLoadCapacity}
                          setClientLoadCapacity={(val) => { setClientLoadCapacity(val); markDirty("clientLoadCapacity"); }}
                          startDate={startDate}
                          setStartDate={(val) => { setStartDate(val); markDirty("startDate"); }}
                        />
                      )}

                      {workType === "offboarding" && (
                        <OffboardingFields
                          clientName={offboardingClientName}
                          setClientName={(val) => { setOffboardingClientName(val); markDirty("offboardingClientName"); }}
                          reason={offboardingReason}
                          setReason={(val) => { setOffboardingReason(val); markDirty("offboardingReason"); }}
                          finalAssignmentDate={finalAssignmentDate}
                          setFinalAssignmentDate={(val) => { setFinalAssignmentDate(val); markDirty("finalAssignmentDate"); }}
                        />
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            {/* LEAVER WIZARD: Step 2 - Select Employee */}
            {workType === "leaver" && (
              <Collapsible 
                open={isSection1Complete() && leaverStep >= 1} 
                onOpenChange={() => isSection1Complete() && setLeaverStep(1)}
                className="mb-4"
              >
                <div className={cn(
                  "bg-white rounded-lg border overflow-hidden animate-fade-in transition-opacity",
                  !isSection1Complete() ? "border-[hsl(0,0%,85%)] opacity-70" : "border-border-primary"
                )}>
                  <CollapsibleTrigger className="w-full" disabled={!isSection1Complete()}>
                    <CollapsibleSectionHeader 
                      title="Select Departing Employee" 
                      sectionNumber={2}
                      isComplete={selectedLeaverEmployeeId !== ""}
                      isDisabled={!isSection1Complete()}
                      isOpen={isSection1Complete() && leaverStep >= 1}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                        <Label className="text-right text-sm font-medium text-text-secondary">
                          Select Employee<span className="text-destructive">*</span>
                        </Label>
                        <SearchablePersonInput
                          value={selectedLeaverEmployeeId}
                          onChange={handleLeaverEmployeeChange}
                          placeholder="Search by name, role, or location..."
                          persons={employeePersons}
                        />
                      </div>
                      
                      {!selectedLeaverEmployeeId && (
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
            )}

            {/* LEAVER WIZARD: Step 3 - Employee & Team Details */}
            {workType === "leaver" && selectedLeaverEmployeeId && (
              <Collapsible 
                open={leaverStep >= 2} 
                onOpenChange={() => setLeaverStep(2)}
                className="mb-4"
              >
                <div className="bg-white rounded-lg border border-border-primary overflow-hidden animate-fade-in">
                  <CollapsibleTrigger className="w-full">
                    <CollapsibleSectionHeader 
                      title="Employee & Team Details" 
                      sectionNumber={3}
                      isComplete={leavingDate !== undefined}
                      isDisabled={!selectedLeaverEmployeeId}
                      isOpen={leaverStep >= 2}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {leaverEmployeeDetails && (
                      <div className="p-6 space-y-6">
                        {/* Employee Details Section */}
                        <div className="bg-[hsl(var(--wq-bg-header))] rounded-lg p-4 border border-[hsl(var(--wq-border))]">
                          <h3 className="text-primary font-bold text-sm mb-4">Employee Details</h3>
                          <div className="grid grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">Name</p>
                              <p className="text-sm font-semibold text-primary">{leaverEmployeeDetails.name}</p>
                            </div>
                            <div>
                              <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">Email</p>
                              <p className="text-sm font-semibold text-primary">{leaverEmployeeDetails.email}</p>
                            </div>
                            <div>
                              <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">Location</p>
                              <p className="text-sm font-semibold text-primary">{leaverEmployeeDetails.location}</p>
                            </div>
                            <div>
                              <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">
                                Leaving Date<span className="text-destructive">*</span>
                              </p>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !leavingDate && "text-muted-foreground"
                                    )}
                                  >
                                    {leavingDate ? format(leavingDate, "MM/dd/yyyy") : "Select date"}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={leavingDate}
                                    onSelect={(date) => {
                                      setLeavingDate(date);
                                      setDueDate(date); // Sync due date with leaving date
                                      markDirty("leavingDate");
                                      if (date) setLeaverStep(3);
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
                          <h3 className="text-primary font-bold text-sm mb-4">Team Information</h3>
                          <div className="grid grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">Team Name</p>
                              <p className="text-sm font-semibold text-primary">{leaverEmployeeDetails.team}</p>
                            </div>
                            <div>
                              <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">Current Team Members</p>
                              <p className="text-sm font-semibold text-primary">{leaverTeamMembersCount}</p>
                            </div>
                            <div>
                              <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">Total Clients</p>
                              <p className="text-sm font-semibold text-primary">{leaverClientPortfolio.length}</p>
                            </div>
                            <div>
                              <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">Total Capacity</p>
                              <p className="text-sm font-semibold text-primary">{leaverTotalCapacity} chairs</p>
                            </div>
                          </div>
                        </div>

                        {/* Client Portfolio Breakdown */}
                        <div className="bg-[hsl(var(--wq-bg-header))] rounded-lg p-4 border border-[hsl(var(--wq-border))]">
                          <h3 className="text-primary font-bold text-sm mb-4 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Client Portfolio Breakdown
                          </h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Client Name</TableHead>
                                <TableHead>Industry</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Capacity</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {leaverClientPortfolio.map((client) => (
                                <TableRow key={client.id}>
                                  <TableCell className="font-medium">{client.name}</TableCell>
                                  <TableCell>{client.industry}</TableCell>
                                  <TableCell>{client.role}</TableCell>
                                  <TableCell className="text-right">{client.capacity} chair</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {!leavingDate && (
                          <div className="flex justify-end">
                            <Button disabled className="px-8">
                              Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            {/* LEAVER WIZARD: Step 4 - Select Manager(s) */}
            {workType === "leaver" && leavingDate && (
              <Collapsible 
                open={leaverStep >= 3} 
                onOpenChange={() => setLeaverStep(3)}
                className="mb-4"
              >
                <div className="bg-white rounded-lg border border-border-primary overflow-hidden animate-fade-in">
                  <CollapsibleTrigger className="w-full">
                    <CollapsibleSectionHeader 
                      title="Select Manager(s) to Handle Reassignment" 
                      sectionNumber={4}
                      isComplete={selectedManagerIds.length > 0}
                      isDisabled={!leavingDate}
                      isOpen={leaverStep >= 3}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-6 space-y-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        Select one or more managers to handle the client reassignment process.
                        Multiple managers can be selected if this employee works across teams.
                      </p>

                      <div className="space-y-3">
                        {leaverTeamManagers.map((manager) => (
                          <div
                            key={manager.id}
                            onClick={() => handleLeaverManagerToggle(manager.id)}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                              selectedManagerIds.includes(manager.id)
                                ? "border-primary bg-primary/5"
                                : "border-[hsl(var(--wq-border))] hover:border-primary/50"
                            )}
                          >
                            <Checkbox
                              checked={selectedManagerIds.includes(manager.id)}
                              onCheckedChange={() => handleLeaverManagerToggle(manager.id)}
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-primary">{manager.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {manager.role} • {manager.location}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">{manager.team}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {selectedManagerIds.length === 0 && (
                        <p className="text-sm text-destructive mt-2">
                          * At least one manager must be selected
                        </p>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            {/* Section 3: Team Configuration (onboarding) - Visible when work type is selected */}
            {workType === "onboarding" && (
              <Collapsible 
                open={isSection2Complete() && openSections.has(3)} 
                onOpenChange={() => isSection2Complete() && toggleSection(3)}
                className="mb-4"
              >
                <div className={cn(
                  "bg-white rounded-lg border overflow-hidden animate-fade-in transition-opacity",
                  !isSection2Complete() ? "border-[hsl(0,0%,85%)] opacity-70" : "border-border-primary"
                )}>
                  <CollapsibleTrigger className="w-full" disabled={!isSection2Complete()}>
                    <CollapsibleSectionHeader 
                      title="Assignment Requirement"
                      sectionNumber={3} 
                      isComplete={isSection3Complete()}
                      isDisabled={!isSection2Complete()}
                      isOpen={isSection2Complete() && openSections.has(3)}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-6">
                      <OnboardingFields
                        clientName={onboardingClientName}
                        setClientName={(val) => { setOnboardingClientName(val); markDirty("onboardingClientName"); }}
                        description={onboardingDescription}
                        setDescription={(val) => { setOnboardingDescription(val); markDirty("onboardingDescription"); }}
                        selectedClient={selectedClient}
                        setSelectedClient={setSelectedClient}
                        showTeamConfig={true}
                        showClientSearch={false}
                        attachments={onboardingAttachments}
                        setAttachments={(val) => { setOnboardingAttachments(val); markDirty("attachments"); }}
                        assignedToManagerId={assignTo}
                        primaryTeam={primaryTeam}
                        additionalTeams={additionalTeams}
                        onPrimaryTeamChange={(team) => { setPrimaryTeam(team); markDirty("teamAssignment"); }}
                        onAdditionalTeamsChange={(teams) => { setAdditionalTeams(teams); markDirty("teamAssignment"); }}
                      />
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            {/* Review Section for non-onboarding work types */}
            {workType && workType !== "onboarding" && workType !== "leaver" && (
              <Collapsible 
                open={isSection2Complete() && openSections.has(3)} 
                onOpenChange={() => isSection2Complete() && toggleSection(3)}
                className="mb-4"
              >
                <div className={cn(
                  "bg-white rounded-lg border overflow-hidden animate-fade-in transition-opacity",
                  !isSection2Complete() ? "border-[hsl(0,0%,85%)] opacity-70" : "border-border-primary"
                )}>
                  <CollapsibleTrigger className="w-full" disabled={!isSection2Complete()}>
                    <CollapsibleSectionHeader 
                      title="Review & Submit" 
                      sectionNumber={3} 
                      isComplete={isSection2Complete()}
                      isDisabled={!isSection2Complete()}
                      isOpen={isSection2Complete() && openSections.has(3)}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-6">
                      <p className="text-[hsl(var(--wq-text-secondary))] text-sm mb-6 text-center">
                        Review your selections and click "Create Work Item" to complete.
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-[hsl(var(--wq-bg-header))] rounded-lg border border-[hsl(var(--wq-border))]">
                          <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">Work Type</p>
                          <p className="text-sm font-semibold text-primary capitalize">{workType.replace('-', ' ') || '—'}</p>
                        </div>
                        <div className="p-4 bg-[hsl(var(--wq-bg-header))] rounded-lg border border-[hsl(var(--wq-border))]">
                          <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">Assigned To</p>
                          <p className="text-sm font-semibold text-primary">{getAssigneeName() || '—'}</p>
                        </div>
                        <div className="p-4 bg-[hsl(var(--wq-bg-header))] rounded-lg border border-[hsl(var(--wq-border))]">
                          <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">Client/Colleague</p>
                          <p className="text-sm font-semibold text-primary">{getClientName() || '—'}</p>
                        </div>
                        <div className="p-4 bg-[hsl(var(--wq-bg-header))] rounded-lg border border-[hsl(var(--wq-border))]">
                          <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">Due Date</p>
                          <p className="text-sm font-semibold text-primary">{dueDate ? format(dueDate, "dd MMM yyyy") : '—'}</p>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            {/* Review Section for Leaver */}
            {workType === "leaver" && selectedManagerIds.length > 0 && (
              <Collapsible 
                open={true}
                className="mb-4"
              >
                <div className="bg-white rounded-lg border border-border-primary overflow-hidden animate-fade-in">
                  <CollapsibleTrigger className="w-full">
                    <CollapsibleSectionHeader 
                      title="Review & Submit" 
                      sectionNumber={5}
                      isComplete={true}
                      isDisabled={false}
                      isOpen={true}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-6">
                      <p className="text-[hsl(var(--wq-text-secondary))] text-sm mb-6 text-center">
                        Review your selections and click "Create Work Item" to proceed to the reassignment workflow.
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-[hsl(var(--wq-bg-header))] rounded-lg border border-[hsl(var(--wq-border))]">
                          <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">Work Type</p>
                          <p className="text-sm font-semibold text-primary">Leaver</p>
                        </div>
                        <div className="p-4 bg-[hsl(var(--wq-bg-header))] rounded-lg border border-[hsl(var(--wq-border))]">
                          <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">Departing Employee</p>
                          <p className="text-sm font-semibold text-primary">{leaverEmployeeDetails?.name || '—'}</p>
                        </div>
                        <div className="p-4 bg-[hsl(var(--wq-bg-header))] rounded-lg border border-[hsl(var(--wq-border))]">
                          <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">Leaving Date</p>
                          <p className="text-sm font-semibold text-primary">{leavingDate ? format(leavingDate, "dd MMM yyyy") : '—'}</p>
                        </div>
                        <div className="p-4 bg-[hsl(var(--wq-bg-header))] rounded-lg border border-[hsl(var(--wq-border))]">
                          <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">Manager(s) Assigned</p>
                          <p className="text-sm font-semibold text-primary">
                            {selectedManagerIds.length} selected
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-[hsl(var(--wq-bg-header))] rounded-lg border border-[hsl(var(--wq-border))]">
                        <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">Clients to Reassign</p>
                        <p className="text-sm font-semibold text-primary">
                          {leaverClientPortfolio.length} clients ({leaverTotalCapacity} total capacity)
                        </p>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            {/* Action Buttons - Fixed at bottom */}
            <div className="flex justify-end gap-4 mt-8 mb-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                className="px-8 border-primary text-primary hover:bg-primary/5"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit()}
                className="px-8 bg-primary hover:bg-primary/90 text-white"
              >
                Create Work Item
              </Button>
            </div>
          </main>
        </div>
      </div>
    </FormDirtyContext.Provider>
  );
};

export default CreateWorkItem;
