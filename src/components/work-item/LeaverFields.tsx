import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import SearchablePersonInput, { SearchablePerson } from "@/components/form/SearchablePersonInput";
import { teamMembers } from "@/data/teamMembers";

interface LeaverFieldsProps {
  leaverName: string;
  setLeaverName: (value: string) => void;
  leavingDate: Date | undefined;
  setLeavingDate: (date: Date | undefined) => void;
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
}: LeaverFieldsProps) => {
  const handlePersonChange = (id: string, person: SearchablePerson | null) => {
    setLeaverName(person ? person.name : "");
  };

  // Find the selected person ID from name
  const selectedPersonId = leaverPersons.find((p) => p.name === leaverName)?.id || "";

  return (
    <div className="bg-white rounded-lg border border-border-primary p-6 space-y-6">
      <h3 className="text-lg font-semibold text-primary">Leaver Details</h3>

      {/* Leaver Name */}
      <div className="grid grid-cols-[180px_1fr] items-center gap-4">
        <Label className="text-right text-sm font-medium text-text-secondary">
          Leaver Name<span className="text-[hsl(0,100%,50%)]">*</span>
        </Label>
        <SearchablePersonInput
          value={selectedPersonId}
          onChange={handlePersonChange}
          placeholder="Search colleague name"
          persons={leaverPersons}
        />
      </div>

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
              onSelect={setLeavingDate}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default LeaverFields;
