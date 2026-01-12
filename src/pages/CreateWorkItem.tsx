import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { Clock, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import PrioritySelector from "@/components/work-item/PrioritySelector";
import OnboardingFields from "@/components/work-item/OnboardingFields";
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

type WorkType = "" | "onboarding" | "new-joiner" | "leaver" | "offboarding";
type Priority = "high" | "medium" | "low";

interface TeamRole {
  id: string;
  teamType: string;
  numberOfRoles: number;
  roles: string[];
}

const assignees = [
  { id: "myself", name: "Myself", role: "Current User" },
  { id: "1", name: "Marsh North America", role: "Team" },
  { id: "2", name: "John Smith", role: "Account Manager" },
  { id: "3", name: "Sarah Johnson", role: "Claims Specialist" },
  { id: "4", name: "Mike Wilson", role: "Risk Analyst" },
];

const CreateWorkItem = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addWorkItem } = useWorkItems();
  const currentDateTime = format(new Date(), "dd MMM yyyy HH:mm") + " EST";

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

  // Onboarding fields
  const [onboardingClientName, setOnboardingClientName] = useState("");
  const [onboardingDescription, setOnboardingDescription] = useState("");
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
        return onboardingClientName || "New Client";
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
    const assignee = assignees.find(a => a.id === assignTo);
    return assignee?.name || "Unassigned";
  };

  const handleSubmit = () => {
    if (!workType || !assignTo || !dueDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
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

    addWorkItem({
      workType: workTypeLabels[workType] || workType,
      clientName: getClientName(),
      dueDate: format(dueDate, "dd MMM yyyy"),
      assignee: getAssigneeName(),
      priority: priority.charAt(0).toUpperCase() + priority.slice(1) as "High" | "Medium" | "Low",
    });

    toast({
      title: "Work Item Created",
      description: "Your work item has been successfully created.",
    });
    navigate("/");
  };

  const handleSaveForLater = () => {
    toast({
      title: "Draft Saved",
      description: "Your work item has been saved as a draft.",
    });
  };

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
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white px-3 py-1.5 rounded-full border border-border-primary">
                <Clock className="h-4 w-4" />
                {currentDateTime}
              </div>
            </div>

            {/* Main Form Card */}
            <div className="bg-white rounded-lg border border-border-primary p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-primary">Create Work Item</h2>
                {dirtyFields.size > 0 && (
                  <span className="text-xs px-2 py-1 bg-field-dirty-border/10 text-field-dirty-border rounded-full font-medium">
                    Unsaved changes
                  </span>
                )}
              </div>

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
                      <FormSelectItem value="onboarding">Onboarding</FormSelectItem>
                      <FormSelectItem value="new-joiner">New Joiner</FormSelectItem>
                      <FormSelectItem value="leaver">Leaver</FormSelectItem>
                      <FormSelectItem value="offboarding">Offboarding</FormSelectItem>
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

                {/* Assign To */}
                <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                  <Label className="text-right text-sm font-medium text-text-secondary">
                    Assign To<span className="text-[hsl(0,100%,50%)]">*</span>
                  </Label>
                  <FormSelect value={assignTo} onValueChange={handleAssignToChange}>
                    <FormSelectTrigger className="max-w-md" fieldName="assignTo">
                      <FormSelectValue placeholder="Select Person or Team" />
                    </FormSelectTrigger>
                    <FormSelectContent>
                      {assignees.map((assignee) => (
                        <FormSelectItem key={assignee.id} value={assignee.id}>
                          {assignee.name}
                        </FormSelectItem>
                      ))}
                    </FormSelectContent>
                  </FormSelect>
                </div>

                {/* Due Date */}
                <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                  <Label className="text-right text-sm font-medium text-text-secondary">
                    Due Date<span className="text-[hsl(0,100%,50%)]">*</span>
                  </Label>
                  <Popover>
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
                        selected={dueDate}
                        onSelect={handleDueDateChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Conditional Fields Based on Work Type */}
            {workType === "onboarding" && (
              <OnboardingFields
                clientName={onboardingClientName}
                setClientName={(val) => { setOnboardingClientName(val); markDirty("onboardingClientName"); }}
                description={onboardingDescription}
                setDescription={(val) => { setOnboardingDescription(val); markDirty("onboardingDescription"); }}
                teamConfigurations={teamConfigurations}
                setTeamConfigurations={(val) => { setTeamConfigurations(val); markDirty("teamConfigurations"); }}
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

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-8 mb-8">
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
                onClick={handleSubmit}
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
