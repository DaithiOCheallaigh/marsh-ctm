import { useMemo } from "react";
import { ChevronRight, AlertCircle, User, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Chair,
  ChairType,
  ChairSelectionProps,
  CHAIR_TYPE_CONFIGS,
  getChairTypeConfig,
} from "./types";

interface ListChairSelectionProps extends ChairSelectionProps {}

export const ListChairSelection = ({
  chairs,
  selectedChair,
  onSelectChair,
  workloadPercentage,
  onWorkloadChange,
  currentCapacity,
  memberName,
  roleName,
  isReadOnly = false,
}: ListChairSelectionProps) => {
  // Group chairs by type
  const chairsByType = useMemo(() => {
    const grouped: Record<ChairType, Chair[]> = {
      primary: [],
      secondary: [],
      specialty: [],
    };
    chairs.forEach((chair) => {
      grouped[chair.type].push(chair);
    });
    return grouped;
  }, [chairs]);

  // Calculate projected capacity
  const projectedCapacity = currentCapacity - workloadPercentage;

  const handleChairSelect = (chair: Chair) => {
    if (isReadOnly || chair.assignedTo) return;
    onSelectChair(chair);
  };

  const handleWorkloadInputChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      onWorkloadChange(num);
    }
  };

  const renderChairGroup = (type: ChairType) => {
    const typeConfig = getChairTypeConfig(type);
    const groupChairs = chairsByType[type];
    
    if (groupChairs.length === 0) return null;

    return (
      <div key={type} className="space-y-2">
        {/* Section Divider */}
        <div className="flex items-center gap-2 py-2">
          <div className="h-0.5 flex-1 bg-border" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {typeConfig.name} Chairs ({typeConfig.isRequired ? 'Required' : 'Optional'})
          </span>
          <div className="h-0.5 flex-1 bg-border" />
        </div>

        {/* Chair Cards */}
        <div className="space-y-2">
          {groupChairs.map((chair) => {
            const isSelected = selectedChair?.id === chair.id;
            const isAssigned = !!chair.assignedTo;
            const badgeConfig = getChairTypeConfig(chair.type);

            return (
              <button
                key={chair.id}
                type="button"
                onClick={() => handleChairSelect(chair)}
                disabled={isReadOnly || isAssigned}
                className={cn(
                  "w-full flex items-start gap-3 p-4 rounded-lg border text-left transition-all",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-white hover:border-primary/50",
                  isAssigned && "opacity-60 cursor-not-allowed"
                )}
              >
                {/* Radio indicator */}
                <div className={cn(
                  "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                  isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
                )}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm">{chair.name}</p>
                    <Badge 
                      variant="outline" 
                      className={cn("text-[10px] font-semibold px-1.5 py-0", badgeConfig.badgeClassName)}
                    >
                      {badgeConfig.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {chair.description}
                  </p>
                  <p className={cn(
                    "text-xs mt-1",
                    isAssigned ? "text-amber-600" : "text-muted-foreground"
                  )}>
                    Status: {isAssigned ? `Assigned to ${chair.assignedTo}` : 'Unassigned'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-lg px-4 py-3 border border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Assigning: {memberName}</p>
            <p className="text-xs text-muted-foreground">Role: {roleName}</p>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div>
        <h4 className="text-sm font-semibold mb-1">Select Chair Position</h4>
        <p className="text-xs text-muted-foreground">
          Choose a chair position from the list below
        </p>
      </div>

      {/* Chair Groups */}
      <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
        {CHAIR_TYPE_CONFIGS.map((config) => renderChairGroup(config.id))}
      </div>

      {/* Workload Section - Always visible at bottom */}
      <div className="pt-4 border-t border-border space-y-3">
        <h4 className="text-sm font-semibold">Workload Allocation</h4>
        
        <div className="flex items-center gap-4">
          <div className="relative w-32">
            <Input
              id="workload-list"
              type="number"
              min={1}
              max={100}
              step="0.5"
              value={workloadPercentage}
              onChange={(e) => handleWorkloadInputChange(e.target.value)}
              onFocus={(e) => e.target.select()}
              className="pr-8"
              disabled={isReadOnly}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              %
            </span>
          </div>
          <span className="text-xs text-muted-foreground">(1-100%)</span>
        </div>

        {/* Capacity Impact */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Capacity Impact:</span>
          <span className="font-medium">{currentCapacity}%</span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className={cn(
            "font-medium",
            projectedCapacity < 0 ? "text-destructive" : 
            projectedCapacity < 20 ? "text-amber-600" : "text-green-600"
          )}>
            {projectedCapacity}% available
          </span>
        </div>

        {projectedCapacity < 0 && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-red-50 border border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-xs text-red-700">
              This will put the team member over capacity
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListChairSelection;
