import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewJoinerFieldsProps {
  colleagueName: string;
  setColleagueName: (value: string) => void;
  teamAssignment: string;
  setTeamAssignment: (value: string) => void;
  clientLoadCapacity: string;
  setClientLoadCapacity: (value: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
}

const teams = [
  "Accounts",
  "Claims",
  "Cyber Security",
  "Management",
  "Risk",
  "Operations",
  "Finance",
];

const NewJoinerFields = ({
  colleagueName,
  setColleagueName,
  teamAssignment,
  setTeamAssignment,
  clientLoadCapacity,
  setClientLoadCapacity,
  startDate,
  setStartDate,
}: NewJoinerFieldsProps) => {
  return (
    <div className="bg-white rounded-lg border border-border-primary p-6 space-y-6">
      <h3 className="text-lg font-semibold text-primary">New Joiner Details</h3>

      {/* Colleague Name */}
      <div className="grid grid-cols-[180px_1fr] items-center gap-4">
        <Label className="text-right text-sm font-medium text-text-secondary">
          Colleague Name<span className="text-[hsl(0,100%,50%)]">*</span>
        </Label>
        <div className="relative max-w-md">
          <Input
            value={colleagueName}
            onChange={(e) => setColleagueName(e.target.value)}
            placeholder="Search from Workday or enter manually"
            className="pr-10 border-border-primary focus:border-accent focus:ring-accent"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Team Assignment */}
      <div className="grid grid-cols-[180px_1fr] items-center gap-4">
        <Label className="text-right text-sm font-medium text-text-secondary">
          Team Assignment<span className="text-[hsl(0,100%,50%)]">*</span>
        </Label>
        <Select value={teamAssignment} onValueChange={setTeamAssignment}>
          <SelectTrigger className="max-w-md border-border-primary">
            <SelectValue placeholder="Select Team" />
          </SelectTrigger>
          <SelectContent className="bg-white z-50">
            {teams.map((team) => (
              <SelectItem key={team} value={team}>
                {team}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Client Load Capacity */}
      <div className="grid grid-cols-[180px_1fr] items-center gap-4">
        <Label className="text-right text-sm font-medium text-text-secondary">
          Client Load Capacity<span className="text-[hsl(0,100%,50%)]">*</span>
        </Label>
        <Input
          value={clientLoadCapacity}
          onChange={(e) => setClientLoadCapacity(e.target.value)}
          placeholder="10 Clients"
          className="max-w-md border-border-primary"
        />
      </div>

      {/* Start Date */}
      <div className="grid grid-cols-[180px_1fr] items-center gap-4">
        <Label className="text-right text-sm font-medium text-text-secondary">
          Start Date<span className="text-[hsl(0,100%,50%)]">*</span>
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "max-w-md justify-start text-left font-normal border-border-primary",
                !startDate && "text-muted-foreground"
              )}
            >
              {startDate ? format(startDate, "MM/dd/yyyy") : "Select date"}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              disabled={(date) => {
                const ninetyDaysAgo = new Date();
                ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                return date < ninetyDaysAgo;
              }}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default NewJoinerFields;
