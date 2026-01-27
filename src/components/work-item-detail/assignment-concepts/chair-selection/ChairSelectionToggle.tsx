import { useState } from "react";
import { Layers, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GuidedChairSelection } from "./GuidedChairSelection";
import { ListChairSelection } from "./ListChairSelection";
import {
  Chair,
  ChairSelectionViewMode,
  SAMPLE_CHAIRS,
} from "./types";

interface ChairSelectionToggleProps {
  chairs?: Chair[];
  selectedChair: Chair | null;
  onSelectChair: (chair: Chair | null) => void;
  workloadPercentage: number;
  onWorkloadChange: (value: number) => void;
  currentCapacity: number;
  memberName: string;
  roleName: string;
  isReadOnly?: boolean;
  defaultView?: ChairSelectionViewMode;
}

export const ChairSelectionToggle = ({
  chairs = SAMPLE_CHAIRS,
  selectedChair,
  onSelectChair,
  workloadPercentage,
  onWorkloadChange,
  currentCapacity,
  memberName,
  roleName,
  isReadOnly = false,
  defaultView = 'guided',
}: ChairSelectionToggleProps) => {
  const [viewMode, setViewMode] = useState<ChairSelectionViewMode>(defaultView);

  const handleViewChange = (mode: ChairSelectionViewMode) => {
    setViewMode(mode);
    // Selection is preserved when switching views
  };

  const sharedProps = {
    chairs,
    selectedChair,
    onSelectChair: onSelectChair as (chair: Chair) => void,
    workloadPercentage,
    onWorkloadChange,
    currentCapacity,
    memberName,
    roleName,
    isReadOnly,
  };

  return (
    <div className="space-y-4">
      {/* Toggle Buttons */}
      <div className="flex items-center justify-end gap-1">
        <Button
          variant={viewMode === 'guided' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleViewChange('guided')}
          className={cn(
            "h-8 px-3 gap-1.5",
            viewMode === 'guided' 
              ? "bg-primary text-primary-foreground" 
              : "border-primary text-primary hover:bg-primary/5"
          )}
        >
          <Layers className="h-3.5 w-3.5" />
          Guided
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleViewChange('list')}
          className={cn(
            "h-8 px-3 gap-1.5",
            viewMode === 'list' 
              ? "bg-primary text-primary-foreground" 
              : "border-primary text-primary hover:bg-primary/5"
          )}
        >
          <List className="h-3.5 w-3.5" />
          List View
        </Button>
      </div>

      {/* View Content */}
      <div className="transition-all duration-300">
        {viewMode === 'guided' ? (
          <GuidedChairSelection {...sharedProps} />
        ) : (
          <ListChairSelection {...sharedProps} />
        )}
      </div>
    </div>
  );
};

export default ChairSelectionToggle;
