import { useState, useCallback, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { Clock, Calendar as CalendarIcon, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { getFieldStateClasses } from "@/components/form/FormDirtyContext";
import { managers } from "@/data/teamMembers";
import { Client } from "@/data/clients";

type WorkType = "" | "onboarding" | "new-joiner" | "leaver" | "offboarding";
type Priority = "high" | "medium" | "low";

interface TeamRole {
  id: string;
  teamType: string;
  numberOfRoles: number;
  roles: string[];
}

// Steps for the multi-step form
const steps = [
  { id: 1, name: "Work Type & Details", shortName: "Details" },
  { id: 2, name: "Client/Colleague Selection", shortName: "Selection" },
  { id: 3, name: "Configuration", shortName: "Config" },
];

const CreateWorkItem = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draft');
  const { toast } = useToast();
  const { addWorkItem, workItems, updateWorkItem } = useWorkItems();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  
  // Timestamps
  const [createdAt] = useState(() => new Date());
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  
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

  // Onboarding fields
  const [onboardingClientName, setOnboardingClientName] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [onboardingDescription, setOnboardingDescription] = useState("");
  const [onboardingAttachments, setOnboardingAttachments] = useState<OnboardingAttachment[]>([]);
  const [teamConfigurations, setTeamConfigurations] = useState<TeamRole[]>([
    { id: "1", teamType: "", numberOfRoles: 2, roles: ["Chair 1", "Chair 2"] },
  ]);

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

  // Load draft data if editing a draft
  useEffect(() => {
    if (draftId) {
      const draft = workItems.find(item => item.id === draftId && item.status === 'Draft');
      if (draft) {
        // Map work type
        const workTypeMap: Record<string, WorkType> = {
          'Onboarding': 'onboarding',
          'New Joiner': 'new-joiner',
          'Leaver': 'leaver',
          'Offboarding': 'offboarding',
        };
        setWorkType(workTypeMap[draft.workType] || '');
        setPriority(draft.priority.toLowerCase() as Priority);
        
        // Find assignee id
        const assignee = managers.find(m => m.name === draft.assignee);
        if (assignee) setAssignTo(assignee.id);
        
        // Parse due date
        if (draft.dueDate) {
          const parsed = new Date(draft.dueDate);
          if (!isNaN(parsed.getTime())) setDueDate(parsed);
        }
        
        // Set type-specific fields
        if (draft.workType === 'Onboarding') {
          setOnboardingClientName(draft.clientName);
          setOnboardingDescription(draft.description || '');
          if (draft.teams) {
            setTeamConfigurations(draft.teams.map((t, idx) => ({
              id: String(idx + 1),
              teamType: t.teamName,
              numberOfRoles: t.roles.length,
              roles: t.roles,
            })));
          }
        } else if (draft.workType === 'New Joiner') {
          setColleagueName(draft.clientName);
        } else if (draft.workType === 'Leaver') {
          setLeaverName(draft.clientName);
        } else if (draft.workType === 'Offboarding') {
          setOffboardingClientName(draft.clientName);
        }
      }
    }
  }, [draftId, workItems]);

  // Wrapper functions to track dirty state
  const handleWorkTypeChange = (value: WorkType) => {
    setWorkType(value);
    markDirty("workType");
  };

  const handlePriorityChange = (value: Priority) => {
    setPriority(value);
    markDirty("priority");
  };

  const handleAssignToChange = (value: string) => {
    setAssignTo(value);
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

  // Validation for Step 1
  const isStep1Valid = () => {
    return workType !== "" && assignTo !== "" && dueDate !== undefined;
  };

  // Validation for Step 2
  const isStep2Valid = () => {
    // First check basic validation
    let hasRequiredFields = false;
    switch (workType) {
      case "onboarding":
        hasRequiredFields = onboardingClientName !== "" || selectedClient !== null;
        break;
      case "new-joiner":
        hasRequiredFields = colleagueName !== "";
        break;
      case "leaver":
        hasRequiredFields = leaverName !== "";
        break;
      case "offboarding":
        hasRequiredFields = offboardingClientName !== "";
        break;
      default:
        hasRequiredFields = false;
    }
    
    if (!hasRequiredFields) return false;
    
    // Check for duplicates
    if (checkForDuplicate()) return false;
    
    return true;
  };

  // Validation for Step 3
  const isStep3Valid = () => {
    if (workType === "onboarding") {
      return teamConfigurations.length > 0 && 
        teamConfigurations.every(tc => tc.teamType !== "" && tc.roles.length > 0);
    }
    return true;
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return isStep1Valid();
      case 2:
        return isStep2Valid();
      case 3:
        return isStep3Valid();
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields before proceeding.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!isStep1Valid() || !isStep2Valid() || !isStep3Valid()) {
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

    // Build teams config for onboarding
    const teams = workType === "onboarding" ? teamConfigurations.map(tc => ({
      teamName: tc.teamType,
      roles: tc.roles,
    })) : undefined;

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

    const workItemData = {
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

    if (draftId) {
      // Update existing draft to Pending status
      updateWorkItem(draftId, { ...workItemData, status: 'Pending' });
      toast({
        title: "Work Item Submitted",
        description: "Your draft has been submitted as a work item.",
      });
    } else {
      addWorkItem(workItemData);
      toast({
        title: "Work Item Created",
        description: "Your work item has been successfully created.",
      });
    }
    navigate("/");
  };

  const handleSaveForLater = async () => {
    // Need at least work type selected to save as draft
    if (!workType) {
      toast({
        title: "Cannot Save Draft",
        description: "Please select a work type before saving.",
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

    // Build teams config for onboarding
    const teams = workType === "onboarding" ? teamConfigurations.map(tc => ({
      teamName: tc.teamType,
      roles: tc.roles,
    })) : undefined;

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

    addWorkItem({
      workType: workTypeLabels[workType] || workType,
      clientName: getClientName(),
      cnNumber: selectedClient?.cnNumber,
      accountOwner: selectedClient?.accountOwner,
      location: selectedClient?.location,
      dueDate: dueDate ? format(dueDate, "dd MMM yyyy") : "",
      assignee: getAssigneeName(),
      priority: priority.charAt(0).toUpperCase() + priority.slice(1) as "High" | "Medium" | "Low",
      description: onboardingDescription,
      teams,
      attachments: attachmentsWithData,
    }, true); // Pass true to save as draft

    setLastSavedAt(new Date());
    toast({
      title: "Draft Saved",
      description: "Your work item has been saved as a draft.",
    });
    navigate("/");
  };

  // Step Progress Indicator
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div 
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all",
              currentStep === step.id
                ? "bg-primary border-primary text-primary-foreground"
                : currentStep > step.id
                ? "bg-[hsl(var(--wq-status-completed-bg))] border-[hsl(var(--wq-status-completed-text))] text-[hsl(var(--wq-status-completed-text))]"
                : "bg-card border-[hsl(var(--wq-border))] text-[hsl(var(--wq-text-secondary))]"
            )}
          >
            {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
          </div>
          <span 
            className={cn(
              "ml-2 text-sm font-medium hidden sm:inline",
              currentStep === step.id ? "text-primary" : "text-[hsl(var(--wq-text-secondary))]"
            )}
          >
            {step.shortName}
          </span>
          {index < steps.length - 1 && (
            <ChevronRight className="w-5 h-5 mx-3 text-[hsl(var(--wq-border))]" />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <FormDirtyContext.Provider value={{ isDirty, markDirty }}>
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
                  {lastSavedAt ? `Last saved: ${formatTimestamp(lastSavedAt)}` : `Created: ${formatTimestamp(createdAt)}`}
                </span>
              </div>
            </div>

            {/* Step Indicator */}
            <StepIndicator />

            {/* Main Form Card */}
            <div className="bg-white rounded-lg border border-border-primary p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-primary">
                  {currentStep === 1 && "Work Type & Basic Details"}
                  {currentStep === 2 && "Client/Colleague Selection"}
                  {currentStep === 3 && "Work Item Configuration"}
                </h2>
                {dirtyFields.size > 0 && (
                  <span className="text-xs px-2 py-1 bg-field-dirty-border/10 text-field-dirty-border rounded-full font-medium">
                    Unsaved changes
                  </span>
                )}
              </div>

              {/* Step 1: Work Type & Basic Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
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
                      Assign To<span className="text-[hsl(0,100%,50%)]">*</span>
                    </Label>
                    <div className="space-y-1">
                      <FormSelect value={assignTo} onValueChange={handleAssignToChange}>
                        <FormSelectTrigger className="max-w-md" fieldName="assignTo">
                          <FormSelectValue placeholder="Select Manager" />
                        </FormSelectTrigger>
                        <FormSelectContent>
                          {managers.map((manager) => (
                            <FormSelectItem key={manager.id} value={manager.id}>
                              {manager.name} - {manager.role}
                            </FormSelectItem>
                          ))}
                        </FormSelectContent>
                      </FormSelect>
                      <p className="text-xs text-muted-foreground ml-1">
                        Only managers can be assigned as the primary owner
                      </p>
                    </div>
                  </div>

                  {/* Due Date */}
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

                  {/* Validation message */}
                  {!isStep1Valid() && (
                    <div className="text-sm text-[hsl(var(--wq-status-pending-text))] bg-[hsl(var(--wq-status-pending-bg))] p-3 rounded-lg">
                      Please complete all required fields marked with * to proceed.
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Client/Colleague Selection */}
              {currentStep === 2 && (
                <div>
                  {workType === "onboarding" && (
                    <OnboardingFields
                      clientName={onboardingClientName}
                      setClientName={(val) => { setOnboardingClientName(val); markDirty("onboardingClientName"); }}
                      description={onboardingDescription}
                      setDescription={(val) => { setOnboardingDescription(val); markDirty("onboardingDescription"); }}
                      teamConfigurations={teamConfigurations}
                      setTeamConfigurations={(val) => { setTeamConfigurations(val); markDirty("teamConfigurations"); }}
                      selectedClient={selectedClient}
                      setSelectedClient={setSelectedClient}
                      showTeamConfig={false}
                      attachments={onboardingAttachments}
                      setAttachments={(val) => { setOnboardingAttachments(val); markDirty("attachments"); }}
                      existingWorkItems={workItems}
                      currentWorkType="Onboarding"
                    />
                  )}

                  {workType === "leaver" && (
                    <LeaverFields
                      leaverName={leaverName}
                      setLeaverName={(val) => { setLeaverName(val); markDirty("leaverName"); }}
                      leavingDate={leavingDate}
                      setLeavingDate={(val) => { setLeavingDate(val); markDirty("leavingDate"); }}
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
              )}

              {/* Step 3: Configuration (Onboarding only has team config) */}
              {currentStep === 3 && (
                <div>
                  {workType === "onboarding" && (
                    <OnboardingFields
                      clientName={onboardingClientName}
                      setClientName={(val) => { setOnboardingClientName(val); markDirty("onboardingClientName"); }}
                      description={onboardingDescription}
                      setDescription={(val) => { setOnboardingDescription(val); markDirty("onboardingDescription"); }}
                      teamConfigurations={teamConfigurations}
                      setTeamConfigurations={(val) => { setTeamConfigurations(val); markDirty("teamConfigurations"); }}
                      selectedClient={selectedClient}
                      setSelectedClient={setSelectedClient}
                      showTeamConfig={true}
                      showClientSearch={false}
                      attachments={onboardingAttachments}
                      setAttachments={(val) => { setOnboardingAttachments(val); markDirty("attachments"); }}
                    />
                  )}

                  {workType !== "onboarding" && (
                    <div className="text-center py-8">
                      <p className="text-[hsl(var(--wq-text-secondary))]">
                        Review your selections and click "Create Work Item" to complete.
                      </p>
                      <div className="mt-4 p-4 bg-[hsl(var(--wq-bg-header))] rounded-lg inline-block">
                        <p className="text-sm"><strong>Work Type:</strong> {workType}</p>
                        <p className="text-sm"><strong>Assignee:</strong> {getAssigneeName()}</p>
                        <p className="text-sm"><strong>Client/Colleague:</strong> {getClientName()}</p>
                        <p className="text-sm"><strong>Due Date:</strong> {dueDate ? format(dueDate, "dd MMM yyyy") : "Not set"}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4 mt-8 mb-8">
              <div>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="px-8 border-primary text-primary hover:bg-primary/5"
                  >
                    Back
                  </Button>
                )}
              </div>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveForLater}
                  className="px-8 border-primary text-primary hover:bg-primary/5"
                >
                  Save For Later
                </Button>
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="px-8 bg-primary hover:bg-primary/90 text-white"
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canProceed()}
                    className="px-8 bg-primary hover:bg-primary/90 text-white"
                  >
                    Create Work Item
                  </Button>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </FormDirtyContext.Provider>
  );
};

export default CreateWorkItem;
