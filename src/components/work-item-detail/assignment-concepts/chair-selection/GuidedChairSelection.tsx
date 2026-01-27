import { useState, useMemo } from "react";
import { Check, ChevronRight, AlertCircle, User } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Chair,
  ChairType,
  ChairSelectionProps,
  CHAIR_TYPE_CONFIGS,
  getChairsByType,
  getChairTypeConfig,
} from "./types";

interface GuidedChairSelectionProps extends ChairSelectionProps {}

export const GuidedChairSelection = ({
  chairs,
  selectedChair,
  onSelectChair,
  workloadPercentage,
  onWorkloadChange,
  currentCapacity,
  memberName,
  roleName,
  isReadOnly = false,
}: GuidedChairSelectionProps) => {
  // Default to 'primary' type
  const [selectedType, setSelectedType] = useState<ChairType>(
    selectedChair ? selectedChair.type : 'primary'
  );
  const [internalStep, setInternalStep] = useState<1 | 2 | 3>(
    selectedChair ? 3 : 2 // Start at step 2 since type is pre-selected
  );

  // Filter chairs based on selected type
  const filteredChairs = useMemo(() => {
    return getChairsByType(chairs, selectedType);
  }, [chairs, selectedType]);

  // Calculate projected capacity
  const projectedCapacity = currentCapacity - workloadPercentage;

  const handleTypeSelect = (type: ChairType) => {
    if (isReadOnly) return;
    setSelectedType(type);
    setInternalStep(2);
    // If chair was previously selected from a different type, clear it
    if (selectedChair && selectedChair.type !== type) {
      onSelectChair(null as any);
    }
  };

  const handleChairSelect = (chair: Chair) => {
    if (isReadOnly || chair.assignedTo) return;
    onSelectChair(chair);
    setInternalStep(3);
  };

  const handleWorkloadInputChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      onWorkloadChange(num);
    }
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

      {/* Step 1: Select Chair Type - Dropdown */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-primary text-primary-foreground">
            <Check className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-medium">Select Chair Type</span>
        </div>
        
        <div className="pl-8">
          <Label htmlFor="chair-type" className="text-xs text-muted-foreground mb-1.5 block">
            Chair Type
          </Label>
          <Select 
            value={selectedType} 
            onValueChange={(value) => handleTypeSelect(value as ChairType)}
            disabled={isReadOnly}
          >
            <SelectTrigger id="chair-type" className="w-full max-w-xs bg-background">
              <SelectValue placeholder="Select chair type..." />
            </SelectTrigger>
          <SelectContent className="bg-background z-50">
              {CHAIR_TYPE_CONFIGS.map((typeConfig) => (
                <SelectItem key={typeConfig.id} value={typeConfig.id}>
                  {typeConfig.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Step 2: Select Specific Chair - Always visible since type is pre-selected */}
      <div className="space-y-3 animate-fade-in">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold",
            internalStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            {internalStep > 2 ? <Check className="h-3.5 w-3.5" /> : "2"}
          </div>
          <span className="text-sm font-medium">Select Specific Chair</span>
        </div>
        
        <div className="pl-8 space-y-2">
          <p className="text-xs text-muted-foreground mb-2">
            Available {getChairTypeConfig(selectedType).name} Chairs:
          </p>
          
          {filteredChairs.map((chair) => {
            const isSelected = selectedChair?.id === chair.id;
            const isAssigned = !!chair.assignedTo;
            
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
                    : "border-border bg-background hover:border-primary/50",
                  isAssigned && "opacity-60 cursor-not-allowed"
                )}
              >
                {/* Radio indicator */}
                <div className={cn(
                  "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                  isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
                )}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{chair.name}</p>
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

      {/* Step 3: Set Workload - Only visible when chair is selected */}
      {selectedChair && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-primary text-primary-foreground">
              3
            </div>
            <span className="text-sm font-medium">Set Workload</span>
          </div>
          
          <div className="pl-8 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="workload-guided" className="text-sm font-medium">
                Workload
              </Label>
              <div className="flex items-center gap-4">
                <div className="relative w-32">
                  <Input
                    id="workload-guided"
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
            </div>
            
            {/* Capacity Impact */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Capacity Impact:</span>
              <span className="font-medium">{currentCapacity}%</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              <span className={cn(
                "font-medium",
                projectedCapacity < 0 ? "text-destructive" : 
                projectedCapacity < 20 ? "text-amber-600" : "text-[hsl(var(--wq-status-completed-text))]"
              )}>
                {projectedCapacity}% available
              </span>
            </div>
            
            {projectedCapacity < 0 && (
              <div className="flex items-center gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-xs text-destructive">
                  This will put the team member over capacity
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuidedChairSelection;
