import React from "react";
import { cn } from "@/lib/utils";
import {
  CapacityCalculation,
  getCapacityStatusColor,
  getCapacityStatusBgColor,
} from "@/types/leaver";

interface CapacityIndicatorProps {
  current: number;
  max: number;
  additional?: number;
  showProjected?: boolean;
  compact?: boolean;
}

export const CapacityIndicator: React.FC<CapacityIndicatorProps> = ({
  current,
  max,
  additional = 0,
  showProjected = false,
  compact = false,
}) => {
  const projected = current + additional;
  const currentPercent = (current / max) * 100;
  const projectedPercent = (projected / max) * 100;

  const getStatus = (percent: number): CapacityCalculation["status"] => {
    if (percent < 85) return "ok";
    if (percent <= 100) return "warning";
    return "over";
  };

  const currentStatus = getStatus(currentPercent);
  const projectedStatus = getStatus(projectedPercent);

  const getBarColor = (status: CapacityCalculation["status"]) => {
    switch (status) {
      case "ok":
        return "bg-[hsl(var(--wq-status-completed-text))]";
      case "warning":
        return "bg-amber-500";
      case "over":
        return "bg-destructive";
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-[hsl(var(--wq-bg-muted))] rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-300", getBarColor(showProjected ? projectedStatus : currentStatus))}
            style={{ width: `${Math.min(showProjected ? projectedPercent : currentPercent, 100)}%` }}
          />
        </div>
        <span
          className={cn(
            "text-xs font-medium min-w-[3rem] text-right",
            getCapacityStatusColor(showProjected ? projectedStatus : currentStatus)
          )}
        >
          {(showProjected ? projectedPercent : currentPercent).toFixed(0)}%
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[hsl(var(--wq-text-secondary))]">
          Current Workload
        </span>
        <span className={cn("font-medium", getCapacityStatusColor(currentStatus))}>
          {current.toFixed(0)}% used
        </span>
      </div>

      {/* Capacity Bar */}
      <div className="relative h-3 bg-[hsl(var(--wq-bg-muted))] rounded-full overflow-hidden">
        {/* Current capacity */}
        <div
          className={cn(
            "absolute left-0 top-0 h-full transition-all duration-300",
            getBarColor(currentStatus)
          )}
          style={{ width: `${Math.min(currentPercent, 100)}%` }}
        />
        {/* Projected additional (shown as striped) */}
        {showProjected && additional > 0 && (
          <div
            className={cn(
              "absolute top-0 h-full transition-all duration-300 opacity-60",
              getBarColor(projectedStatus),
              "bg-stripes"
            )}
            style={{
              left: `${Math.min(currentPercent, 100)}%`,
              width: `${Math.min(additional, 100 - Math.min(currentPercent, 100))}%`,
            }}
          />
        )}
      </div>

      {showProjected && additional > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-[hsl(var(--wq-text-secondary))]">
            After Assignment
          </span>
          <span className={cn("font-medium", getCapacityStatusColor(projectedStatus))}>
            {projected.toFixed(0)}% ({additional > 0 ? `+${additional.toFixed(0)}%` : ""})
          </span>
        </div>
      )}

      {/* Status indicator */}
      <div
        className={cn(
          "flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md w-fit",
          getCapacityStatusBgColor(showProjected ? projectedStatus : currentStatus),
          getCapacityStatusColor(showProjected ? projectedStatus : currentStatus)
        )}
      >
        {(showProjected ? projectedStatus : currentStatus) === "ok" && "✓ Within Capacity"}
        {(showProjected ? projectedStatus : currentStatus) === "warning" && "⚠ At Capacity"}
        {(showProjected ? projectedStatus : currentStatus) === "over" && "❌ Over Capacity"}
      </div>
    </div>
  );
};
