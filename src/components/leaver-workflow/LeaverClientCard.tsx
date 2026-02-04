import React from "react";
import { LeaverClient } from "@/data/leaverClients";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface LeaverClientCardProps {
  client: LeaverClient;
  showCheckbox: boolean;
  isChecked: boolean;
  onCheckChange: (checked: boolean) => void;
  isAssigned?: boolean;
  capacityRequirement?: number;
}

export const LeaverClientCard: React.FC<LeaverClientCardProps> = ({
  client,
  showCheckbox,
  isChecked,
  onCheckChange,
  isAssigned = false,
  capacityRequirement,
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 border border-[hsl(var(--wq-border))] rounded-lg transition-colors",
        !isAssigned && "hover:bg-[hsl(var(--wq-bg-hover))] cursor-pointer",
        isChecked && "bg-accent/5 border-accent",
        isAssigned && "opacity-50"
      )}
      onClick={() => {
        if (showCheckbox && !isAssigned) {
          onCheckChange(!isChecked);
        }
      }}
    >
      {showCheckbox && (
        <Checkbox
          checked={isChecked}
          onCheckedChange={onCheckChange}
          disabled={isAssigned}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      )}
      <div className="flex-1">
        <p className="text-primary font-semibold text-sm">{client.name}</p>
        <p className="text-[hsl(var(--wq-text-secondary))] text-xs">
          {client.industry} | {client.role}
        </p>
      </div>
      {capacityRequirement !== undefined && (
        <span className="text-xs text-[hsl(var(--wq-text-muted))] bg-[hsl(var(--wq-bg-muted))] px-2 py-1 rounded">
          {capacityRequirement.toFixed(1)} chair
        </span>
      )}
    </div>
  );
};