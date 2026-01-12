import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import ClientSearchInput from "@/components/ClientSearchInput";

interface OffboardingFieldsProps {
  clientName: string;
  setClientName: (value: string) => void;
  reason: string;
  setReason: (value: string) => void;
  finalAssignmentDate: Date | undefined;
  setFinalAssignmentDate: (date: Date | undefined) => void;
}

const offboardingReasons = [
  "Contract Ended",
  "Client Request",
  "Business Decision",
  "Merger/Acquisition",
  "Service Termination",
  "Other",
];

const OffboardingFields = ({
  clientName,
  setClientName,
  reason,
  setReason,
  finalAssignmentDate,
  setFinalAssignmentDate,
}: OffboardingFieldsProps) => {
  return (
    <div className="bg-white rounded-lg border border-border-primary p-6 space-y-6">
      <h3 className="text-lg font-semibold text-primary">Offboarding Details</h3>

      {/* Client Name */}
      <div className="grid grid-cols-[180px_1fr] items-center gap-4">
        <Label className="text-right text-sm font-medium text-text-secondary">
          Client Name or CN Number<span className="text-[hsl(0,100%,50%)]">*</span>
        </Label>
        <ClientSearchInput
          value={clientName}
          onChange={setClientName}
          placeholder="Search by client name or CN number"
        />
      </div>

      {/* Reason for Offboarding */}
      <div className="grid grid-cols-[180px_1fr] items-center gap-4">
        <Label className="text-right text-sm font-medium text-text-secondary">
          Reason for Offboarding<span className="text-[hsl(0,100%,50%)]">*</span>
        </Label>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger className="max-w-md border-border-primary">
            <SelectValue placeholder="Select reason" />
          </SelectTrigger>
          <SelectContent className="bg-white z-50">
            {offboardingReasons.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Final Assignment Date */}
      <div className="grid grid-cols-[180px_1fr] items-center gap-4">
        <Label className="text-right text-sm font-medium text-text-secondary">
          Final Assignment Date<span className="text-[hsl(0,100%,50%)]">*</span>
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "max-w-md justify-start text-left font-normal border-border-primary",
                !finalAssignmentDate && "text-muted-foreground"
              )}
            >
              {finalAssignmentDate ? format(finalAssignmentDate, "MM/dd/yyyy") : "Select date"}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
            <Calendar
              mode="single"
              selected={finalAssignmentDate}
              onSelect={setFinalAssignmentDate}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default OffboardingFields;
