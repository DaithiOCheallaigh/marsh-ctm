import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaverFieldsProps {
  leaverName: string;
  setLeaverName: (value: string) => void;
  leavingDate: Date | undefined;
  setLeavingDate: (date: Date | undefined) => void;
}

const LeaverFields = ({
  leaverName,
  setLeaverName,
  leavingDate,
  setLeavingDate,
}: LeaverFieldsProps) => {
  return (
    <div className="bg-white rounded-lg border border-border-primary p-6 space-y-6">
      <h3 className="text-lg font-semibold text-primary">Leaver Details</h3>

      {/* Leaver Name */}
      <div className="grid grid-cols-[180px_1fr] items-center gap-4">
        <Label className="text-right text-sm font-medium text-text-secondary">
          Leaver Name<span className="text-[hsl(0,100%,50%)]">*</span>
        </Label>
        <div className="relative max-w-md">
          <Input
            value={leaverName}
            onChange={(e) => setLeaverName(e.target.value)}
            placeholder="Search colleague name"
            className="pr-10 border-border-primary focus:border-accent focus:ring-accent"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
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
