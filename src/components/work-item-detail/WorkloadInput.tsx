import React, { useState, useEffect } from 'react';
import { Minus, Plus, AlertTriangle, AlertCircle } from 'lucide-react';

interface WorkloadInputProps {
  currentWorkload: number;
  availableCapacity: number;
  onWorkloadChange: (workload: number) => void;
  memberName: string;
  disabled?: boolean;
}

// Workload validation constants
export const MIN_WORKLOAD = 1;
export const MAX_WORKLOAD = 20;

// Capacity threshold colors
export const getCapacityColor = (availableCapacity: number): 'healthy' | 'moderate' | 'high' | 'critical' => {
  if (availableCapacity >= 30) return 'healthy';  // 0-70% utilized
  if (availableCapacity >= 15) return 'moderate'; // 71-85% utilized
  if (availableCapacity >= 5) return 'high';      // 86-95% utilized
  return 'critical';                               // 96-100% utilized
};

export const getCapacityColorClasses = (color: 'healthy' | 'moderate' | 'high' | 'critical') => {
  switch (color) {
    case 'healthy':
      return {
        bg: 'bg-[hsl(var(--wq-status-completed-bg))]',
        text: 'text-[hsl(var(--wq-status-completed-text))]',
        border: 'border-[hsl(var(--wq-status-completed-text))]',
        bar: 'bg-[hsl(var(--wq-status-completed-text))]'
      };
    case 'moderate':
      return {
        bg: 'bg-[hsl(var(--wq-status-pending-bg))]',
        text: 'text-[hsl(var(--wq-status-pending-text))]',
        border: 'border-[hsl(var(--wq-status-pending-text))]',
        bar: 'bg-[hsl(var(--wq-status-pending-text))]'
      };
    case 'high':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        border: 'border-orange-600',
        bar: 'bg-orange-500'
      };
    case 'critical':
      return {
        bg: 'bg-red-50',
        text: 'text-red-600',
        border: 'border-red-600',
        bar: 'bg-red-500'
      };
  }
};

export const WorkloadInput: React.FC<WorkloadInputProps> = ({
  currentWorkload,
  availableCapacity,
  onWorkloadChange,
  memberName,
  disabled = false,
}) => {
  const [workload, setWorkload] = useState(Math.min(10, availableCapacity)); // Default 10% or max available

  useEffect(() => {
    // Initialize with sensible default
    const defaultWorkload = Math.min(10, Math.max(MIN_WORKLOAD, availableCapacity));
    setWorkload(defaultWorkload);
    onWorkloadChange(defaultWorkload);
  }, []);

  const projectedWorkload = currentWorkload + workload;
  const projectedAvailable = 100 - projectedWorkload;
  const capacityColor = getCapacityColor(projectedAvailable);
  const colorClasses = getCapacityColorClasses(capacityColor);

  const isOverCapacity = projectedWorkload > 100;
  const isHighUtilization = projectedWorkload >= 86 && projectedWorkload <= 100;

  const handleIncrement = () => {
    if (workload < MAX_WORKLOAD && workload < availableCapacity) {
      const newWorkload = Math.min(workload + 1, MAX_WORKLOAD, availableCapacity);
      setWorkload(newWorkload);
      onWorkloadChange(newWorkload);
    }
  };

  const handleDecrement = () => {
    if (workload > MIN_WORKLOAD) {
      const newWorkload = workload - 1;
      setWorkload(newWorkload);
      onWorkloadChange(newWorkload);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      const clampedValue = Math.max(MIN_WORKLOAD, Math.min(value, MAX_WORKLOAD));
      setWorkload(clampedValue);
      onWorkloadChange(clampedValue);
    }
  };

  // Capacity dots (10 dots = 100%)
  const renderCapacityDots = () => {
    const dots = [];
    const totalDots = 10;
    const filledDots = Math.ceil(projectedWorkload / 10);
    
    for (let i = 0; i < totalDots; i++) {
      const isFilled = i < filledDots;
      const isNew = i >= Math.ceil(currentWorkload / 10) && i < filledDots;
      
      dots.push(
        <div
          key={i}
          className={`w-3 h-3 rounded-full transition-all ${
            isFilled
              ? isNew
                ? `${colorClasses.bar} ring-2 ring-offset-1 ring-${capacityColor === 'healthy' ? '[hsl(var(--wq-status-completed-text))]' : capacityColor === 'moderate' ? '[hsl(var(--wq-status-pending-text))]' : capacityColor === 'high' ? 'orange-500' : 'red-500'}`
                : colorClasses.bar
              : 'bg-[hsl(var(--wq-bg-muted))]'
          }`}
        />
      );
    }
    return dots;
  };

  return (
    <div className="space-y-4 p-4 bg-[hsl(var(--wq-bg-muted))]/50 rounded-lg border border-[hsl(var(--wq-border))]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-primary">Workload Assignment</h4>
        <span className="text-xs text-[hsl(var(--wq-text-secondary))]">
          Range: {MIN_WORKLOAD}% - {MAX_WORKLOAD}%
        </span>
      </div>

      {/* Current vs Projected */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-xs text-[hsl(var(--wq-text-muted))]">Current Workload</span>
          <p className="text-lg font-bold text-primary">{currentWorkload}%</p>
        </div>
        <div className="space-y-1">
          <span className="text-xs text-[hsl(var(--wq-text-muted))]">Available Capacity</span>
          <p className={`text-lg font-bold ${colorClasses.text}`}>{availableCapacity}%</p>
        </div>
      </div>

      {/* Workload Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-primary">
          Workload for this assignment <span className="text-destructive">*</span>
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={disabled || workload <= MIN_WORKLOAD}
            className="w-10 h-10 rounded-lg border border-[hsl(var(--wq-border))] bg-card flex items-center justify-center hover:bg-[hsl(var(--wq-bg-hover))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-4 h-4 text-[hsl(var(--wq-text-secondary))]" />
          </button>
          
          <div className="relative flex-1 max-w-[120px]">
            <input
              type="number"
              value={workload}
              onChange={handleInputChange}
              min={MIN_WORKLOAD}
              max={MAX_WORKLOAD}
              disabled={disabled}
              className={`w-full h-10 text-center text-lg font-bold rounded-lg border focus:outline-none focus:ring-2 ${
                isOverCapacity
                  ? 'border-red-500 bg-red-50 text-red-600 focus:ring-red-500/30'
                  : 'border-[hsl(var(--wq-border))] bg-card text-primary focus:ring-accent/30 focus:border-accent'
              }`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--wq-text-secondary))] font-medium">
              %
            </span>
          </div>
          
          <button
            type="button"
            onClick={handleIncrement}
            disabled={disabled || workload >= MAX_WORKLOAD || workload >= availableCapacity}
            className="w-10 h-10 rounded-lg border border-[hsl(var(--wq-border))] bg-card flex items-center justify-center hover:bg-[hsl(var(--wq-bg-hover))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4 text-[hsl(var(--wq-text-secondary))]" />
          </button>
        </div>
      </div>

      {/* Capacity Bar Visualization */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[hsl(var(--wq-text-muted))]">Projected Capacity</span>
          <span className={`text-xs font-medium ${colorClasses.text}`}>
            {projectedWorkload}% utilized → {projectedAvailable}% available
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {renderCapacityDots()}
        </div>
      </div>

      {/* Comparison */}
      <div className={`flex items-center justify-between p-3 rounded-lg ${colorClasses.bg} border ${colorClasses.border}/20`}>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[hsl(var(--wq-text-secondary))]">Before:</span>
          <span className="text-sm font-medium text-primary">{currentWorkload}%</span>
        </div>
        <span className="text-[hsl(var(--wq-text-secondary))]">→</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[hsl(var(--wq-text-secondary))]">After:</span>
          <span className={`text-sm font-bold ${colorClasses.text}`}>{projectedWorkload}%</span>
        </div>
      </div>

      {/* Warnings */}
      {isHighUtilization && !isOverCapacity && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200">
          <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-orange-700">High Utilization Warning</p>
            <p className="text-xs text-orange-600 mt-0.5">
              This assignment will bring {memberName}'s capacity to {projectedWorkload}%. Consider redistributing workload.
            </p>
          </div>
        </div>
      )}

      {isOverCapacity && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700">Over Capacity</p>
            <p className="text-xs text-red-600 mt-0.5">
              This assignment will exceed {memberName}'s 100% capacity. You may proceed but this is not recommended.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkloadInput;
