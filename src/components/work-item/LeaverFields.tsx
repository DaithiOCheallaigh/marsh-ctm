import { useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import SearchablePersonInput, { SearchablePerson } from "@/components/form/SearchablePersonInput";
import { teamMembers, getMemberById } from "@/data/teamMembers";
import { teamsData } from "@/data/teams";

interface LeaverFieldsProps {
  leaverName: string;
  setLeaverName: (value: string) => void;
  leavingDate: Date | undefined;
  setLeavingDate: (date: Date | undefined) => void;
  dueDate: Date | undefined;
  setDueDate: (date: Date | undefined) => void;
  selectedLeaverId: string;
  setSelectedLeaverId: (id: string) => void;
  onManagerAutoPopulated: (managerId: string, managerName: string) => void;
  onTeamResolved: (teamName: string) => void;
  onNoTeamError: (employeeName: string) => void;
}

// Get all team members as searchable persons for leavers
const leaverPersons: SearchablePerson[] = teamMembers.map((member) => ({
  id: member.id,
  name: member.name,
  role: member.role,
  location: member.location,
}));

const LeaverFields = ({
  leaverName,
  setLeaverName,
  leavingDate,
  setLeavingDate,
  dueDate,
  setDueDate,
  selectedLeaverId,
  setSelectedLeaverId,
  onManagerAutoPopulated,
  onTeamResolved,
  onNoTeamError,
}: LeaverFieldsProps) => {
  // Resolve team and manager when leaver is selected
  const resolvedTeam = useMemo(() => {
    if (!selectedLeaverId) return null;
    const member = getMemberById(selectedLeaverId);
    if (!member?.teamId) return null;
    const team = teamsData.find(t => t.id === member.teamId);
    return team || null;
  }, [selectedLeaverId]);

  const resolvedEmployee = useMemo(() => {
    if (!selectedLeaverId) return null;
    const member = getMemberById(selectedLeaverId);
    if (!member) return null;
    return {
      name: member.name,
      email: `${member.name.toLowerCase().replace(/\s+/g, '.')}@marsh.com`,
      location: member.location,
      team: member.team,
      teamId: member.teamId,
    };
  }, [selectedLeaverId]);

  // Auto-populate manager and team when leaver changes
  useEffect(() => {
    if (resolvedTeam) {
      onManagerAutoPopulated(resolvedTeam.primaryManagerId, resolvedTeam.primaryManager);
      onTeamResolved(resolvedTeam.name);
    }
  }, [resolvedTeam]);

  // Default due date to leaving date when leaving date changes
  useEffect(() => {
    if (leavingDate && !dueDate) {
      setDueDate(leavingDate);
    }
  }, [leavingDate]);

  const handlePersonChange = (id: string, person: SearchablePerson | null) => {
    setSelectedLeaverId(id);
    setLeaverName(person ? person.name : "");

    if (person) {
      const member = getMemberById(id);
      if (!member?.teamId) {
        onNoTeamError(person.name);
        setSelectedLeaverId("");
        setLeaverName("");
        return;
      }
    }
  };

  return (
    <div className="bg-white rounded-lg border border-border-primary p-6 space-y-6">
      <h3 className="text-lg font-semibold text-primary">Leaver Details</h3>

      {/* Leaver Name */}
      <div className="grid grid-cols-[180px_1fr] items-center gap-4">
        <Label className="text-right text-sm font-medium text-text-secondary">
          Leaver Name<span className="text-[hsl(0,100%,50%)]">*</span>
        </Label>
        <SearchablePersonInput
          value={selectedLeaverId}
          onChange={handlePersonChange}
          placeholder="Search colleague name"
          persons={leaverPersons}
        />
      </div>

      {/* Show employee info when selected */}
      {resolvedEmployee && resolvedTeam && (
        <div className="bg-[hsl(var(--wq-bg-header))] rounded-lg p-4 border border-[hsl(var(--wq-border))]">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">Email</p>
              <p className="text-sm font-semibold text-primary">{resolvedEmployee.email}</p>
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">Location</p>
              <p className="text-sm font-semibold text-primary">{resolvedEmployee.location}</p>
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">Team</p>
              <p className="text-sm font-semibold text-primary">{resolvedTeam.name}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[hsl(var(--wq-border))]">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-[hsl(var(--wq-text-muted))] mb-1">Manager (Auto-assigned)</p>
                <p className="text-sm font-semibold text-primary">{resolvedTeam.primaryManager}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaving Date */}
      <div className="grid grid-cols-[180px_1fr] items-center gap-4">
        <Label className="text-right text-sm font-medium text-text-secondary">
          Leaving Date<span className="text-[hsl(0,100%,50%)]">*</span>
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "max-w-md justify-start text-left font-normal border-border-primary",
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
                // Default due date to leaving date
                if (date) {
                  setDueDate(date);
                }
              }}
              disabled={(date) => date < new Date()}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Due Date */}
      <div className="grid grid-cols-[180px_1fr] items-center gap-4">
        <Label className="text-right text-sm font-medium text-text-secondary">
          Due Date<span className="text-[hsl(0,100%,50%)]">*</span>
        </Label>
        <div className="space-y-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "max-w-md justify-start text-left font-normal border-border-primary",
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
                onSelect={setDueDate}
                disabled={(date) => date < new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground ml-1">
            Defaults to Leaving Date. Can be changed if needed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeaverFields;
